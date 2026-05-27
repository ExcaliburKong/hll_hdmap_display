(function () {
  "use strict";

  const COLORS = {
    default: "#9a9aa8",
    selected: "#2196f3",
    predecessor: "#ff9800",
    successor: "#43a047",
    sameRoad: "#90caf9",
  };

  const fileInput = document.getElementById("file-input");
  const btnImport = document.getElementById("btn-import");
  const btnResetView = document.getElementById("btn-reset-view");
  const statusEl = document.getElementById("status");
  const mapContainer = document.getElementById("map-container");
  const mapSvg = document.getElementById("map-svg");
  const viewport = document.getElementById("viewport");
  const lanesLayer = document.getElementById("lanes-layer");
  const laneInfo = document.getElementById("lane-info");
  const laneSearch = document.getElementById("lane-search");
  const emptyHint = document.getElementById("empty-hint");
  const btnLaneTabAttributes = document.getElementById("btn-lane-tab-attributes");
  const btnLaneTabCenterline = document.getElementById("btn-lane-tab-centerline");
  const btnLaneTabWidth = document.getElementById("btn-lane-tab-width");
  const btnLaneTabRoadWidth = document.getElementById("btn-lane-tab-road-width");
  const btnHideAll = document.getElementById("btn-hide-all");
  const btnShowAll = document.getElementById("btn-show-all");
  const laneContextMenu = document.getElementById("lane-context-menu");
  const ctxHideLane = document.getElementById("ctx-hide-lane");
  const sidebar = document.getElementById("sidebar");
  const sidebarResizer = document.getElementById("sidebar-resizer");
  const mapMetaPanel = document.getElementById("map-meta-panel");
  const mapMetaFilename = document.getElementById("map-meta-filename");
  const mapMetaDate = document.getElementById("map-meta-date");
  const mapMetaUtm = document.getElementById("map-meta-utm");

  const SIDEBAR_WIDTH_DEFAULT = 360;
  const SIDEBAR_WIDTH_MIN = 260;
  const SIDEBAR_WIDTH_MAX = 900;

  let mapData = null;
  let laneById = new Map();
  let laneElements = new Map();
  let hiddenLaneIds = new Set();
  let selectedLaneId = null;
  let contextMenuLaneId = null;
  /** 地图中心（UTM），SVG 使用局部坐标避免大数值缩放时精度丢失 */
  let mapOrigin = { x: 0, y: 0 };

  let view = { scale: 1, tx: 0, ty: 0, rotation: 0 };
  let baseView = null;
  const DRAG_THRESHOLD_PX = 5;
  const LANE_INFO_TABS = {
    attributes: "attributes",
    centerline: "centerline",
    width: "width",
    roadWidth: "roadWidth",
  };
  let activeLaneInfoTab = LANE_INFO_TABS.attributes;
  const DEFAULT_LANE_INFO =
    "未选择车道\n\n点击地图上的车道后，可切换查看“车道属性”。\n同道路车道显示为淡蓝色，前驱车道为橙色，后继车道为绿色。";

  let isPanning = false;
  let panStart = null;
  let pointerDown = null;
  let isRotating = false;
  let rotateStart = null;

  let protoReady = false;

  btnImport.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", onFileSelected);
  btnResetView.addEventListener("click", resetView);
  laneSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchAndSelectLane(laneSearch.value.trim());
  });
  btnLaneTabAttributes.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.attributes));
  btnLaneTabCenterline.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.centerline));
  btnLaneTabWidth.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.width));
  btnLaneTabRoadWidth.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.roadWidth));
  btnHideAll.addEventListener("click", hideAllLanes);
  btnShowAll.addEventListener("click", showAllLanes);
  ctxHideLane.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const laneId = laneContextMenu.dataset.laneId || contextMenuLaneId;
    if (laneId) hideLane(laneId);
    hideLaneContextMenu();
  });

  mapContainer.addEventListener("wheel", onWheel, { passive: false });
  mapContainer.addEventListener("mousedown", onMouseDown);
  mapContainer.addEventListener("contextmenu", onContextMenu);
  mapContainer.addEventListener("dblclick", onMapDoubleClick);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("click", (e) => {
    if (!laneContextMenu.hidden && !laneContextMenu.contains(e.target)) {
      hideLaneContextMenu();
    }
  });

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateMapMetaPanel(meta) {
    if (!mapMetaPanel) return;
    if (!meta) {
      mapMetaPanel.classList.add("is-hidden");
      return;
    }
    mapMetaPanel.classList.remove("is-hidden");
    if (mapMetaFilename) {
      mapMetaFilename.textContent = meta.filename || "—";
    }
    if (mapMetaDate) {
      mapMetaDate.textContent = meta.date || "—";
    }
    if (mapMetaUtm) {
      const zone = meta.utm_zone;
      mapMetaUtm.textContent =
        zone != null && Number.isFinite(zone) ? String(zone) : "—";
    }
  }

  /** 屏幕坐标 → SVG 用户坐标（与 view.tx/ty 同一坐标系） */
  function clientToSvgPoint(clientX, clientY) {
    const pt = mapSvg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = mapSvg.getScreenCTM();
    if (!ctm) {
      const rect = mapContainer.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    }
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { x: svgPt.x, y: svgPt.y };
  }

  function getContainerPoint(clientX, clientY) {
    return clientToSvgPoint(clientX, clientY);
  }

  function getViewCenter() {
    const rect = mapContainer.getBoundingClientRect();
    return getContainerPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  /** 地图容器尺寸变化时同步 viewBox，并保持视口中心下的地图点不动 */
  function syncMapSvgViewport() {
    if (!mapSvg) return;
    const rect = mapContainer.getBoundingClientRect();
    const w = Math.max(1, rect.width || 800);
    const h = Math.max(1, rect.height || 600);
    const vb = mapSvg.viewBox.baseVal;
    const oldW = vb.width > 0 ? vb.width : w;
    const oldH = vb.height > 0 ? vb.height : h;

    if (Math.abs(oldW - w) < 0.5 && Math.abs(oldH - h) < 0.5) return;

    if (mapData) {
      const pivot = getViewCenter();
      const anchor = screenToMap(pivot.x, pivot.y);
      mapSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
      const pivotAfter = getViewCenter();
      const after = mapToScreen(anchor.x, anchor.y);
      view.tx += pivotAfter.x - after.x;
      view.ty += pivotAfter.y - after.y;
      applyTransform();
    } else {
      mapSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }
  }

  function applyTransform() {
    if (!Number.isFinite(view.scale) || view.scale <= 0) return;
    const rotDeg = (view.rotation * 180) / Math.PI;
    viewport.setAttribute(
      "transform",
      `translate(${view.tx}, ${view.ty}) rotate(${rotDeg}) scale(${view.scale}, ${-view.scale})`
    );
  }

  function utmToLocal(mx, my) {
    return { x: mx - mapOrigin.x, y: my - mapOrigin.y };
  }

  /** 屏幕坐标（相对 map-container）→ 地图 UTM 坐标 */
  function screenToMap(sx, sy) {
    const u = sx - view.tx;
    const v = sy - view.ty;
    const cos = Math.cos(-view.rotation);
    const sin = Math.sin(-view.rotation);
    const px = u * cos - v * sin;
    const py = u * sin + v * cos;
    return {
      x: px / view.scale + mapOrigin.x,
      y: -py / view.scale + mapOrigin.y,
    };
  }

  /** 地图 UTM → 屏幕坐标 */
  function mapToScreen(mx, my) {
    const { x: lx, y: ly } = utmToLocal(mx, my);
    const px = lx * view.scale;
    const py = -ly * view.scale;
    const cos = Math.cos(view.rotation);
    const sin = Math.sin(view.rotation);
    return {
      x: cos * px - sin * py + view.tx,
      y: sin * px + cos * py + view.ty,
    };
  }

  /** 绕屏幕锚点旋转，保持锚点下的地图点不动 */
  function setRotationAround(rotation, pivotSx, pivotSy) {
    const anchor = screenToMap(pivotSx, pivotSy);
    view.rotation = rotation;
    const localAnchor = utmToLocal(anchor.x, anchor.y);
    const px = localAnchor.x * view.scale;
    const py = -localAnchor.y * view.scale;
    const cos = Math.cos(view.rotation);
    const sin = Math.sin(view.rotation);
    view.tx = pivotSx - (cos * px - sin * py);
    view.ty = pivotSy - (sin * px + cos * py);
    applyTransform();
  }

  function onWheel(e) {
    if (!mapData) return;
    e.preventDefault();
    const { x: sx, y: sy } = getContainerPoint(e.clientX, e.clientY);
    const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const newScale = Math.max(0.02, Math.min(view.scale * factor, 500));
    const anchor = screenToMap(sx, sy);
    view.scale = newScale;
    const after = mapToScreen(anchor.x, anchor.y);
    view.tx += sx - after.x;
    view.ty += sy - after.y;
    if (!Number.isFinite(view.tx) || !Number.isFinite(view.ty)) {
      resetView();
      return;
    }
    applyTransform();
  }

  function onContextMenu(e) {
    const shape = e.target.closest(".lane-shape");
    if (shape && shape.dataset.laneId && mapData) {
      e.preventDefault();
      showLaneContextMenu(e.clientX, e.clientY, shape.dataset.laneId);
      return;
    }
    e.preventDefault();
  }

  function onMapDoubleClick(e) {
    if (!mapData || isPanning) return;
    const shape = e.target.closest(".lane-shape");
    if (!shape || !shape.dataset.laneId || hiddenLaneIds.has(shape.dataset.laneId)) return;
    e.preventDefault();
    hideLane(shape.dataset.laneId);
  }

  function onMouseDown(e) {
    if (!mapData) return;
    if (laneContextMenu.contains(e.target)) return;
    hideLaneContextMenu();
    if (e.button === 2) {
      const shape = e.target.closest(".lane-shape");
      if (shape && shape.dataset.laneId) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const pivot = getViewCenter();
      const pt = getContainerPoint(e.clientX, e.clientY);
      isRotating = true;
      rotateStart = {
        pivotSx: pivot.x,
        pivotSy: pivot.y,
        rotation: view.rotation,
        startAngle: Math.atan2(pt.y - pivot.y, pt.x - pivot.x),
      };
      mapContainer.classList.add("rotating");
      return;
    }
    if (e.button !== 0) return;
    const shape = e.target.closest(".lane-shape");
    pointerDown = {
      x: e.clientX,
      y: e.clientY,
      tx: view.tx,
      ty: view.ty,
      laneId: shape ? shape.dataset.laneId : null,
    };
  }

  function onMouseMove(e) {
    if (isRotating && rotateStart) {
      const pt = getContainerPoint(e.clientX, e.clientY);
      const { pivotSx, pivotSy, rotation, startAngle } = rotateStart;
      const angle = Math.atan2(pt.y - pivotSy, pt.x - pivotSx);
      setRotationAround(rotation + (angle - startAngle), pivotSx, pivotSy);
      return;
    }
    if (pointerDown && !isPanning) {
      const dx = e.clientX - pointerDown.x;
      const dy = e.clientY - pointerDown.y;
      if (dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
        isPanning = true;
        panStart = {
          x: pointerDown.x,
          y: pointerDown.y,
          tx: pointerDown.tx,
          ty: pointerDown.ty,
        };
        mapContainer.classList.add("panning");
      }
    }
    if (!isPanning || !panStart) return;
    const dx = e.clientX - panStart.x;
    const dy = e.clientY - panStart.y;
    view.tx = panStart.tx + dx;
    view.ty = panStart.ty + dy;
    applyTransform();
  }

  function onMouseUp(e) {
    if (e.button === 2 && isRotating) {
      isRotating = false;
      rotateStart = null;
      mapContainer.classList.remove("rotating");
    }
    if (e.button === 0) {
      if (isPanning) {
        isPanning = false;
        panStart = null;
        mapContainer.classList.remove("panning");
      } else if (pointerDown && pointerDown.laneId) {
        selectLane(pointerDown.laneId);
      } else if (pointerDown) {
        clearLaneSelection();
      }
      pointerDown = null;
    }
  }

  function fitViewToBounds(bounds) {
    const rect = mapContainer.getBoundingClientRect();
    const w = rect.width || 800;
    const h = rect.height || 600;
    const mapW = bounds.max_x - bounds.min_x;
    const mapH = bounds.max_y - bounds.min_y;
    mapOrigin = {
      x: (bounds.min_x + bounds.max_x) / 2,
      y: (bounds.min_y + bounds.max_y) / 2,
    };
    const scale = Math.min(w / mapW, h / mapH) * 0.92;
    view = {
      scale,
      tx: w / 2,
      ty: h / 2,
      rotation: 0,
    };
    baseView = { ...view, origin: { ...mapOrigin } };
    mapSvg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    applyTransform();
  }

  function resetView() {
    resetSidebarWidth();
    if (baseView) {
      view = {
        scale: baseView.scale,
        tx: baseView.tx,
        ty: baseView.ty,
        rotation: baseView.rotation,
      };
      if (baseView.origin) {
        mapOrigin = { ...baseView.origin };
      }
      applyTransform();
    }
  }

  function flatToSvgPoints(flat) {
    const ox = mapOrigin.x;
    const oy = mapOrigin.y;
    const parts = [];
    for (let i = 0; i < flat.length; i += 2) {
      parts.push(`${flat[i] - ox},${flat[i + 1] - oy}`);
    }
    return parts.join(" ");
  }

  function createLaneElement(lane) {
    if (lane.polygon && lane.polygon.length >= 6) {
      const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      poly.setAttribute("points", flatToSvgPoints(lane.polygon));
      poly.classList.add("lane-shape");
      poly.dataset.laneId = lane.id;
      return poly;
    }
    if (lane.central_segments && lane.central_segments.length > 0) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("lane-shape", "central-only");
      g.dataset.laneId = lane.id;
      for (const seg of lane.central_segments) {
        if (seg.length < 4) continue;
        const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
        pl.setAttribute("points", flatToSvgPoints(seg));
        pl.setAttribute("fill", "none");
        g.appendChild(pl);
      }
      return g;
    }
    return null;
  }

  function setLaneVisibility(laneId, hidden) {
    const el = laneElements.get(laneId);
    if (el) el.classList.toggle("lane-hidden", hidden);
  }

  function applyAllLaneVisibility() {
    for (const [laneId, el] of laneElements) {
      el.classList.toggle("lane-hidden", hiddenLaneIds.has(laneId));
    }
  }

  function hideLane(laneId) {
    if (!laneId || !laneById.has(laneId)) return;
    hiddenLaneIds.add(laneId);
    setLaneVisibility(laneId, true);
    if (selectedLaneId === laneId) clearLaneSelection();
  }

  function hideAllLanes() {
    if (!mapData) return;
    for (const laneId of laneById.keys()) hiddenLaneIds.add(laneId);
    applyAllLaneVisibility();
    clearLaneSelection();
    setStatus(`已隐藏全部 ${hiddenLaneIds.size} 条车道`);
  }

  function showAllLanes() {
    if (!mapData) return;
    hiddenLaneIds.clear();
    applyAllLaneVisibility();
    if (mapData.meta) {
      const name = mapData.meta.filename ? `${mapData.meta.filename} · ` : "";
      setStatus(`${name}${mapData.meta.lane_count} 条车道`);
    }
  }

  function showLaneContextMenu(clientX, clientY, laneId) {
    contextMenuLaneId = laneId;
    laneContextMenu.dataset.laneId = laneId;
    const rect = mapContainer.getBoundingClientRect();
    laneContextMenu.style.left = `${clientX - rect.left}px`;
    laneContextMenu.style.top = `${clientY - rect.top}px`;
    laneContextMenu.hidden = false;
  }

  function hideLaneContextMenu() {
    laneContextMenu.hidden = true;
    laneContextMenu.dataset.laneId = "";
    contextMenuLaneId = null;
  }

  function renderMap(data) {
    updateMapMetaPanel(data.meta);

    lanesLayer.innerHTML = "";
    laneById.clear();
    laneElements.clear();
    hiddenLaneIds.clear();
    selectedLaneId = null;
    hideLaneContextMenu();

    const b = data.meta.bounds;
    mapOrigin = {
      x: (b.min_x + b.max_x) / 2,
      y: (b.min_y + b.max_y) / 2,
    };

    const frag = document.createDocumentFragment();
    for (const lane of data.lanes) {
      laneById.set(lane.id, lane);
      const el = createLaneElement(lane);
      if (el) {
        frag.appendChild(el);
        laneElements.set(lane.id, el);
      }
    }
    lanesLayer.appendChild(frag);

    fitViewToBounds(data.meta.bounds);
    emptyHint.style.display = "none";
    btnResetView.disabled = false;
    laneSearch.disabled = false;
    btnHideAll.disabled = false;
    btnShowAll.disabled = false;
    renderActiveLaneInfo();
    syncLaneTabButtons();
  }

  function clearHighlight() {
    for (const el of laneElements.values()) {
      el.classList.remove(
        "state-selected",
        "state-predecessor",
        "state-successor",
        "state-same-road"
      );
    }
  }

  function highlightLaneSet(ids, className) {
    for (const id of ids) {
      if (hiddenLaneIds.has(id)) continue;
      const el = laneElements.get(id);
      if (el && id !== selectedLaneId) {
        el.classList.add(className);
      }
    }
  }

  function formatBoundaryTypeLine(label, segments) {
    if (!segments || !segments.length) return `${label}:\n  —`;
    if (segments.length === 1) {
      const seg = segments[0];
      const rangeText =
        seg.s_end != null
          ? `${seg.s_start.toFixed(2)} ~ ${seg.s_end.toFixed(2)}`
          : `${seg.s_start.toFixed(2)} ~ ?`;
      return `${label}:\n  [${rangeText}] ${seg.types.join("|")} (${seg.type_codes.join("|")})`;
    }
    const parts = [`${label}:`];
    segments.forEach((seg, idx) => {
      const rangeText =
        seg.s_end != null
          ? `${seg.s_start.toFixed(2)} ~ ${seg.s_end.toFixed(2)}`
          : `${seg.s_start.toFixed(2)} ~ ?`;
      parts.push(`  ${idx + 1}. [${rangeText}] ${seg.types.join("|")} (${seg.type_codes.join("|")})`);
    });
    return parts.join("\n");
  }

  function formatIdListBlock(label, ids) {
    if (!ids || !ids.length) return `${label}:\n  —`;
    return `${label}:\n  ${ids.join("\n  ")}`;
  }

  function formatOverlapListBlock(label, overlapIds, overlapSignalDetails) {
    if (!overlapIds || !overlapIds.length) return `${label}:\n  —`;
    const detailsMap = new Map();
    for (const item of overlapSignalDetails || []) {
      detailsMap.set(item.overlap_id, item);
    }
    function simplifySignalLikeId(text) {
      if (!text) return text;
      const m = String(text).match(/(signal_[^_\s]+_[^_\s]+)$/);
      return m ? m[1] : text;
    }
    const rows = overlapIds.map((id) => {
      const detail = detailsMap.get(id);
      if (!detail || !detail.signals || detail.signals.length === 0) return id;
      const signal = detail.signals[0];
      const signalName = simplifySignalLikeId(signal.id || id);
      const oneType = signal.subsignal_types && signal.subsignal_types.length
        ? signal.subsignal_types[0].type
        : "UNKNOWN";
      return `${signalName}（${oneType}）`;
    });
    return `${label}:\n  ${rows.join("\n  ")}`;
  }

  function formatLaneInfo(lane) {
    const leftNeighborIds = Array.from(
      new Set([...(lane.left_neighbor_forward_ids || []), ...(lane.left_neighbor_reverse_ids || [])])
    );
    const rightNeighborIds = Array.from(
      new Set([...(lane.right_neighbor_forward_ids || []), ...(lane.right_neighbor_reverse_ids || [])])
    );
    const lines = [
      `车道属性`,
      `车道 ID: ${lane.id}`,
      `车道类型: ${lane.type} (${lane.type_code})`,
      `转向类型: ${lane.turn} (${lane.turn_code})`,
      lane.length != null ? `车道长度: ${lane.length.toFixed(2)} 米` : "车道长度: —",
      lane.speed_limit != null
        ? `限速: ${lane.speed_limit.toFixed(2)} m/s (${(lane.speed_limit * 3.6).toFixed(1)} km/h)`
        : "限速: —",
      formatBoundaryTypeLine("左侧车道线类型", lane.left_boundary_type_segments),
      formatBoundaryTypeLine("右侧车道线类型", lane.right_boundary_type_segments),
      lane.junction_id ? `路口 ID: ${lane.junction_id}` : "路口 ID: —",
      formatIdListBlock(`前驱车道 (${lane.predecessor_ids.length})`, lane.predecessor_ids),
      formatIdListBlock(`后继车道 (${lane.successor_ids.length})`, lane.successor_ids),
      formatIdListBlock(`左邻车道 (${leftNeighborIds.length})`, leftNeighborIds),
      formatIdListBlock(`右邻车道 (${rightNeighborIds.length})`, rightNeighborIds),
      formatOverlapListBlock(`overlap_id (${lane.overlap_ids.length})`, lane.overlap_ids, lane.overlap_signal_details),
    ];
    return lines.join("\n");
  }

  function formatCenterlineInfo(lane) {
    const points = [];
    for (const seg of lane.central_segments || []) {
      for (let i = 0; i < seg.length; i += 2) {
        points.push({ x: seg[i], y: seg[i + 1] });
      }
    }
    const lines = [`中心线`, `车道 ID: ${lane.id}`, `点数量: ${points.length}`, ""];
    if (!points.length) {
      lines.push("无 central_curve 点集");
      return lines.join("\n");
    }
    points.forEach((pt, idx) => {
      lines.push(`(${idx + 1}. ${pt.x.toFixed(2)}, ${pt.y.toFixed(2)})`);
    });
    return lines.join("\n");
  }

  function formatLaneWidthInfo(lane) {
    const left = lane.left_sample || [];
    const right = lane.right_sample || [];
    const n = Math.max(left.length, right.length);
    const lines = [
      `车道宽度`,
      `车道 ID: ${lane.id}`,
      `样本数量: left=${left.length}, right=${right.length}`,
      "",
    ];
    if (!n) {
      lines.push("无 left_sample / right_sample 数据");
      return lines.join("\n");
    }
    for (let i = 0; i < n; i++) {
      const leftSample = left[i];
      const rightSample = right[i];
      const s = leftSample?.s ?? rightSample?.s;
      const leftWidth = leftSample?.width;
      const rightWidth = rightSample?.width;
      const sText = s != null ? s.toFixed(2) : "—";
      const leftText = leftWidth != null ? leftWidth.toFixed(2) : "—";
      const rightText = rightWidth != null ? rightWidth.toFixed(2) : "—";
      lines.push(`${i + 1}. s=${sText}, ${leftText}, ${rightText}`);
    }
    return lines.join("\n");
  }

  function formatRoadWidthInfo(lane) {
    const left = lane.left_road_sample || [];
    const right = lane.right_road_sample || [];
    const n = Math.max(left.length, right.length);
    const lines = [
      `道路宽度`,
      `车道 ID: ${lane.id}`,
      `样本数量: left=${left.length}, right=${right.length}`,
      "",
    ];
    if (!n) {
      lines.push("无 left_road_sample / right_road_sample 数据");
      return lines.join("\n");
    }
    for (let i = 0; i < n; i++) {
      const leftSample = left[i];
      const rightSample = right[i];
      const s = leftSample?.s ?? rightSample?.s;
      const leftWidth = leftSample?.width;
      const rightWidth = rightSample?.width;
      const sText = s != null ? s.toFixed(2) : "—";
      const leftText = leftWidth != null ? leftWidth.toFixed(2) : "—";
      const rightText = rightWidth != null ? rightWidth.toFixed(2) : "—";
      lines.push(`${i + 1}. s=${sText}, ${leftText}, ${rightText}`);
    }
    return lines.join("\n");
  }

  function renderActiveLaneInfo() {
    if (!selectedLaneId || !laneById.has(selectedLaneId)) {
      laneInfo.textContent = DEFAULT_LANE_INFO;
      return;
    }
    const lane = laneById.get(selectedLaneId);
    if (activeLaneInfoTab === LANE_INFO_TABS.centerline) {
      laneInfo.textContent = formatCenterlineInfo(lane);
      return;
    }
    if (activeLaneInfoTab === LANE_INFO_TABS.width) {
      laneInfo.textContent = formatLaneWidthInfo(lane);
      return;
    }
    if (activeLaneInfoTab === LANE_INFO_TABS.roadWidth) {
      laneInfo.textContent = formatRoadWidthInfo(lane);
      return;
    }
    laneInfo.textContent = formatLaneInfo(lane);
  }

  function syncLaneTabButtons() {
    btnLaneTabAttributes.classList.toggle("active", activeLaneInfoTab === LANE_INFO_TABS.attributes);
    btnLaneTabCenterline.classList.toggle("active", activeLaneInfoTab === LANE_INFO_TABS.centerline);
    btnLaneTabWidth.classList.toggle("active", activeLaneInfoTab === LANE_INFO_TABS.width);
    btnLaneTabRoadWidth.classList.toggle("active", activeLaneInfoTab === LANE_INFO_TABS.roadWidth);
  }

  function setActiveLaneInfoTab(tabKey) {
    if (!tabKey || activeLaneInfoTab === tabKey) return;
    activeLaneInfoTab = tabKey;
    syncLaneTabButtons();
    renderActiveLaneInfo();
  }

  function clearLaneSelection() {
    if (!selectedLaneId) return;
    selectedLaneId = null;
    clearHighlight();
    laneSearch.value = "";
    renderActiveLaneInfo();
    if (mapData?.meta) {
      const name = mapData.meta.filename ? `${mapData.meta.filename} · ` : "";
      setStatus(`${name}${mapData.meta.lane_count} 条车道`);
    }
  }

  function selectLane(laneId) {
    if (!laneId || !laneById.has(laneId) || hiddenLaneIds.has(laneId)) return;
    selectedLaneId = laneId;
    const lane = laneById.get(laneId);
    clearHighlight();
    const el = laneElements.get(laneId);
    if (el) el.classList.add("state-selected");
    highlightLaneSet(lane.same_road_lane_ids, "state-same-road");
    highlightLaneSet(lane.predecessor_ids, "state-predecessor");
    highlightLaneSet(lane.successor_ids, "state-successor");
    renderActiveLaneInfo();
    laneSearch.value = laneId;
    setStatus(`已选中: ${laneId}`);
  }

  function searchAndSelectLane(id) {
    if (!id) return;
    if (laneById.has(id)) {
      selectLane(id);
      return;
    }
    setStatus(`未找到车道: ${id}`);
  }

  function onFileSelected() {
    const file = fileInput.files && fileInput.files[0];
    if (!file) return;
    if (!protoReady) {
      setStatus("错误: Proto 定义尚未加载完成，请稍候再试");
      return;
    }
    if (typeof MapParser === "undefined") {
      setStatus("错误: 未加载 map_parser.js，请通过 HTTP 打开页面或检查静态资源");
      return;
    }

    setStatus(`正在本地解析: ${file.name}…`);
    btnImport.disabled = true;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const body = MapParser.parseMapBytes(reader.result);
        body.meta.filename = file.name;
        mapData = body;
        renderMap(mapData);
        setStatus(`${file.name} · ${body.meta.lane_count} 条车道`);
      } catch (err) {
        setStatus(`错误: ${err.message}`);
        laneInfo.textContent = `加载失败:\n${err.message}`;
      } finally {
        btnImport.disabled = false;
        fileInput.value = "";
      }
    };
    reader.onerror = () => {
      setStatus("错误: 无法读取文件");
      btnImport.disabled = false;
      fileInput.value = "";
    };
    reader.readAsArrayBuffer(file);
  }

  window.addEventListener("resize", () => {
    if (mapData?.meta?.bounds) fitViewToBounds(mapData.meta.bounds);
  });

  function initProtoLoader() {
    if (typeof MapProtoLoader === "undefined") {
      setStatus("错误: 未加载 map_proto_loader.js");
      return;
    }
    btnImport.disabled = true;
    setStatus("正在加载 proto 定义…");
    MapProtoLoader.load()
      .then(() => {
        protoReady = true;
        btnImport.disabled = false;
        setStatus("Proto 已就绪，请导入本地地图 bin 文件");
      })
      .catch((err) => {
        protoReady = false;
        btnImport.disabled = true;
        const hint =
          location.protocol === "file:"
            ? "（请用 HTTP 服务打开本页，例如: python3 -m http.server 8080）"
            : "";
        setStatus(`Proto 加载失败: ${err.message}${hint}`);
        laneInfo.textContent = `Proto 加载失败:\n${err.message}${hint}`;
      });
  }

  function clampSidebarWidth(width) {
    const maxByViewport = Math.max(SIDEBAR_WIDTH_MIN, Math.floor(window.innerWidth * 0.75));
    return Math.min(SIDEBAR_WIDTH_MAX, maxByViewport, Math.max(SIDEBAR_WIDTH_MIN, width));
  }

  function setSidebarWidth(width) {
    if (!sidebar) return SIDEBAR_WIDTH_DEFAULT;
    const w = clampSidebarWidth(width);
    sidebar.style.setProperty("--sidebar-width", `${w}px`);
    syncMapSvgViewport();
    return w;
  }

  function resetSidebarWidth() {
    setSidebarWidth(SIDEBAR_WIDTH_DEFAULT);
  }

  function initSidebarResize() {
    if (!sidebar || !sidebarResizer) return;

    try {
      localStorage.removeItem("hdmap-sidebar-width");
    } catch (_) {
      /* ignore */
    }
    resetSidebarWidth();

    let resizing = false;
    let startX = 0;
    let startWidth = 0;

    const onPointerMove = (e) => {
      if (!resizing) return;
      setSidebarWidth(startWidth - (e.clientX - startX));
    };

    const endResize = (e) => {
      if (!resizing) return;
      resizing = false;
      document.body.classList.remove("sidebar-resizing");
      sidebarResizer.releasePointerCapture?.(e.pointerId);
      setSidebarWidth(startWidth - (e.clientX - startX));
      sidebarResizer.removeEventListener("pointermove", onPointerMove);
      sidebarResizer.removeEventListener("pointerup", endResize);
      sidebarResizer.removeEventListener("pointercancel", endResize);
    };

    sidebarResizer.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      resizing = true;
      startX = e.clientX;
      startWidth = sidebar.getBoundingClientRect().width;
      document.body.classList.add("sidebar-resizing");
      sidebarResizer.setPointerCapture?.(e.pointerId);
      sidebarResizer.addEventListener("pointermove", onPointerMove);
      sidebarResizer.addEventListener("pointerup", endResize);
      sidebarResizer.addEventListener("pointercancel", endResize);
    });
  }

  window.addEventListener("resize", () => {
    if (sidebar) {
      const current = sidebar.getBoundingClientRect().width;
      setSidebarWidth(sidebar.getBoundingClientRect().width);
    }
  });

  syncLaneTabButtons();
  laneInfo.textContent = DEFAULT_LANE_INFO;
  initSidebarResize();
  initProtoLoader();
})();
