(function () {
  "use strict";

  const COLORS = {
    default: "#9a9aa8",
    selected: "#2196f3",
    predecessor: "#43a047",
    successor: "#fdd835",
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

  let mapData = null;
  let laneById = new Map();
  let laneElements = new Map();
  let selectedLaneId = null;
  /** 地图中心（UTM），SVG 使用局部坐标避免大数值缩放时精度丢失 */
  let mapOrigin = { x: 0, y: 0 };

  let view = { scale: 1, tx: 0, ty: 0, rotation: 0 };
  let baseView = null;
  const DRAG_THRESHOLD_PX = 5;
  const DEFAULT_LANE_INFO =
    "未选择车道\n\n点击地图上的车道查看 ID、前后继、限速、类型等信息。\n前驱车道显示为绿色，后继车道显示为黄色。";

  let isPanning = false;
  let panStart = null;
  let pointerDown = null;
  let isRotating = false;
  let rotateStart = null;

  btnImport.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", onFileSelected);
  btnResetView.addEventListener("click", resetView);
  laneSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchAndSelectLane(laneSearch.value.trim());
  });

  mapContainer.addEventListener("wheel", onWheel, { passive: false });
  mapContainer.addEventListener("mousedown", onMouseDown);
  mapContainer.addEventListener("contextmenu", (e) => e.preventDefault());
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function getContainerPoint(clientX, clientY) {
    const rect = mapContainer.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }

  function getViewCenter() {
    const rect = mapContainer.getBoundingClientRect();
    return { x: rect.width / 2, y: rect.height / 2 };
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
    const px = anchor.x * view.scale;
    const py = -anchor.y * view.scale;
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

  function onMouseDown(e) {
    if (!mapData) return;
    if (e.button === 2) {
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

  function renderMap(data) {
    lanesLayer.innerHTML = "";
    laneById.clear();
    laneElements.clear();
    selectedLaneId = null;

    const b = data.meta.bounds;
    mapOrigin = {
      x: (b.min_x + b.max_x) / 2,
      y: (b.min_y + b.max_y) / 2,
    };

    const frag = document.createDocumentFragment();
    let drawn = 0;
    for (const lane of data.lanes) {
      laneById.set(lane.id, lane);
      const el = createLaneElement(lane);
      if (el) {
        frag.appendChild(el);
        laneElements.set(lane.id, el);
        drawn += 1;
      }
    }
    lanesLayer.appendChild(frag);

    fitViewToBounds(data.meta.bounds);
    emptyHint.style.display = "none";
    btnResetView.disabled = false;
    laneSearch.disabled = false;
    laneInfo.textContent =
      `已加载 ${data.meta.lane_count} 条车道（绘制 ${drawn} 个可点击区域）\n\n` +
      `点击地图上的车道查看详情。超大地图首次渲染可能需要数秒。`;
  }

  function clearHighlight() {
    for (const el of laneElements.values()) {
      el.classList.remove("state-selected", "state-predecessor", "state-successor");
    }
  }

  function highlightLaneSet(ids, className) {
    for (const id of ids) {
      const el = laneElements.get(id);
      if (el && id !== selectedLaneId) {
        el.classList.add(className);
      }
    }
  }

  function formatLaneInfo(lane) {
    const lines = [
      `车道 ID: ${lane.id}`,
      `类型: ${lane.type} (${lane.type_code})`,
      `转向: ${lane.turn} (${lane.turn_code})`,
      `行驶方向: ${lane.direction} (${lane.direction_code})`,
      lane.speed_limit != null
        ? `限速: ${lane.speed_limit.toFixed(2)} m/s (${(lane.speed_limit * 3.6).toFixed(1)} km/h)`
        : "限速: —",
      lane.length != null ? `长度: ${lane.length.toFixed(2)} m` : "长度: —",
      lane.junction_id ? `路口 ID: ${lane.junction_id}` : "路口 ID: —",
      "",
      `前驱车道 (${lane.predecessor_ids.length}):`,
      lane.predecessor_ids.length ? lane.predecessor_ids.join("\n") : "  (无)",
      "",
      `后继车道 (${lane.successor_ids.length}):`,
      lane.successor_ids.length ? lane.successor_ids.join("\n") : "  (无)",
    ];
    if (lane.left_neighbor_forward_ids?.length) {
      lines.push("", `左邻正向 (${lane.left_neighbor_forward_ids.length}):`);
      lines.push(lane.left_neighbor_forward_ids.join("\n"));
    }
    if (lane.right_neighbor_forward_ids?.length) {
      lines.push("", `右邻正向 (${lane.right_neighbor_forward_ids.length}):`);
      lines.push(lane.right_neighbor_forward_ids.join("\n"));
    }
    return lines.join("\n");
  }

  function clearLaneSelection() {
    if (!selectedLaneId) return;
    selectedLaneId = null;
    clearHighlight();
    laneSearch.value = "";
    laneInfo.textContent = DEFAULT_LANE_INFO;
    if (mapData?.meta) {
      const name = mapData.meta.filename ? `${mapData.meta.filename} · ` : "";
      setStatus(`${name}${mapData.meta.lane_count} 条车道`);
    }
  }

  function selectLane(laneId) {
    if (!laneId || !laneById.has(laneId)) return;
    selectedLaneId = laneId;
    const lane = laneById.get(laneId);
    clearHighlight();
    const el = laneElements.get(laneId);
    if (el) el.classList.add("state-selected");
    highlightLaneSet(lane.predecessor_ids, "state-predecessor");
    highlightLaneSet(lane.successor_ids, "state-successor");
    laneInfo.textContent = formatLaneInfo(lane);
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
})();
