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
  const junctionsLayer = document.getElementById("junctions-layer");
  const centerlineLayer = document.getElementById("centerline-layer");
  const laneInfo = document.getElementById("lane-info");
  const laneSearch = document.getElementById("lane-search");
  const junctionInfo = document.getElementById("junction-info");
  const junctionSearch = document.getElementById("junction-search");
  const btnMainTabLane = document.getElementById("btn-main-tab-lane");
  const btnMainTabJunction = document.getElementById("btn-main-tab-junction");
  const lanePanel = document.getElementById("lane-panel");
  const junctionPanel = document.getElementById("junction-panel");
  const laneHeaderActions = document.getElementById("lane-header-actions");
  const btnJunctionDrawAll = document.getElementById("btn-junction-draw-all");
  const btnJunctionHighlight = document.getElementById("btn-junction-highlight");
  const emptyHint = document.getElementById("empty-hint");
  const btnLaneTabAttributes = document.getElementById("btn-lane-tab-attributes");
  const btnLaneTabCenterline = document.getElementById("btn-lane-tab-centerline");
  const btnLaneTabWidth = document.getElementById("btn-lane-tab-width");
  const btnLaneTabRoadWidth = document.getElementById("btn-lane-tab-road-width");
  const btnClearAll = document.getElementById("btn-clear-all");
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
  const annotationsLayer = document.getElementById("annotations-layer");
  const btnToolPoint = document.getElementById("btn-tool-point");
  const btnToolBox = document.getElementById("btn-tool-box");
  const btnToolPick = document.getElementById("btn-tool-pick");
  const toolPanelPoint = document.getElementById("tool-panel-point");
  const toolPanelBox = document.getElementById("tool-panel-box");
  const toolPanelPick = document.getElementById("tool-panel-pick");
  const toolPointX = document.getElementById("tool-point-x");
  const toolPointY = document.getElementById("tool-point-y");
  const toolBoxX = document.getElementById("tool-box-x");
  const toolBoxY = document.getElementById("tool-box-y");
  const toolBoxHeading = document.getElementById("tool-box-heading");
  const toolBoxWidth = document.getElementById("tool-box-width");
  const toolBoxFront = document.getElementById("tool-box-front");
  const toolBoxRear = document.getElementById("tool-box-rear");
  const btnVehicleSanfang = document.getElementById("btn-vehicle-sanfang");
  const btnVehicleLiufang = document.getElementById("btn-vehicle-liufang");
  const btnDrawPoint = document.getElementById("btn-draw-point");
  const btnDrawBox = document.getElementById("btn-draw-box");
  const btnClearAllPoints = document.getElementById("btn-clear-all-points");
  const btnClearAllBoxes = document.getElementById("btn-clear-all-boxes");
  const btnClearAllPicks = document.getElementById("btn-clear-all-picks");
  const btnCopyPickResult = document.getElementById("btn-copy-pick-result");
  const toolPointList = document.getElementById("tool-point-list");
  const toolBoxList = document.getElementById("tool-box-list");
  const toolPickList = document.getElementById("tool-pick-list");
  const toolPanel = document.getElementById("tool-panel");

  const SIDEBAR_WIDTH_DEFAULT = 440;
  const VEHICLE_PRESETS = {
    sanfang: { width: 1.3, front: 2.37, rear: 0.59 },
    liufang: { width: 1.4, front: 2.95, rear: 0.65 },
  };
  const DEFAULT_VEHICLE_PRESET = "liufang";
  const DEFAULT_VEHICLE_WIDTH = VEHICLE_PRESETS[DEFAULT_VEHICLE_PRESET].width;
  const DEFAULT_VEHICLE_FRONT = VEHICLE_PRESETS[DEFAULT_VEHICLE_PRESET].front;
  const DEFAULT_VEHICLE_REAR = VEHICLE_PRESETS[DEFAULT_VEHICLE_PRESET].rear;
  const ANNOTATION_POINT_RADIUS = 0.1;
  const ANNOTATION_BOX_CENTER_RADIUS = 0.1;
  const TOOL_MODES = {
    point: "point",
    box: "box",
    pick: "pick",
  };
  const SIDEBAR_WIDTH_MIN = 260;
  const SIDEBAR_WIDTH_MAX = 900;

  let mapData = null;
  let laneById = new Map();
  let laneElements = new Map();
  let hiddenLaneIds = new Set();
  let selectedLaneId = null;
  let junctionById = new Map();
  let junctionElements = new Map();
  let junctionLabelElements = new Map();
  let selectedJunctionId = null;
  let showAllJunctions = false;
  const DEFAULT_JUNCTION_INFO =
    "未选择路口\n\n导入地图后，输入路口 ID（如 junction_9816）并回车，查看路口 ID、类型及 Polygon 点集，并在视图中高亮绘制。";
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
  const SIDEBAR_PANELS = { lane: "lane", junction: "junction" };
  let activeSidebarPanel = SIDEBAR_PANELS.lane;
  const DEFAULT_LANE_INFO =
    "未选择车道\n\n点击地图上的车道后，可切换查看“车道属性”。\n同道路车道显示为淡蓝色，前驱车道为橙色，后继车道为绿色。";

  let isPanning = false;
  let panStart = null;
  let pointerDown = null;
  let isRotating = false;
  let rotateStart = null;
  let rightPointerDown = null;
  let suppressLaneContextMenu = false;
  let rightClickContextLaneId = null;

  let protoReady = false;
  let activeTool = null;
  let pointLabelCounter = 0;
  let boxLabelCounter = 0;
  let pickLabelCounter = 0;
  let annotationSeq = 0;
  const drawnPoints = [];
  const drawnBoxes = [];
  const drawnPicks = [];
  const selectedPickIds = [];
  let pickHeadingLinkLayer = null;

  btnImport.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", onFileSelected);
  btnResetView.addEventListener("click", resetView);
  laneSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter") searchAndSelectLane(laneSearch.value.trim());
  });
  if (junctionSearch) {
    junctionSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") searchAndSelectJunction(junctionSearch.value.trim());
    });
  }
  if (btnMainTabLane) {
    btnMainTabLane.addEventListener("click", () => setActiveSidebarPanel(SIDEBAR_PANELS.lane));
  }
  if (btnMainTabJunction) {
    btnMainTabJunction.addEventListener("click", () => setActiveSidebarPanel(SIDEBAR_PANELS.junction));
  }
  if (btnJunctionDrawAll) {
    btnJunctionDrawAll.addEventListener("click", toggleDrawAllJunctions);
  }
  if (btnJunctionHighlight) {
    btnJunctionHighlight.addEventListener("click", toggleHighlightJunction);
  }
  btnLaneTabAttributes.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.attributes));
  btnLaneTabCenterline.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.centerline));
  btnLaneTabWidth.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.width));
  btnLaneTabRoadWidth.addEventListener("click", () => setActiveLaneInfoTab(LANE_INFO_TABS.roadWidth));
  btnClearAll.addEventListener("click", clearAllAnnotations);
  btnHideAll.addEventListener("click", hideAllLanes);
  btnShowAll.addEventListener("click", showAllLanes);
  ctxHideLane.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const laneId = laneContextMenu.dataset.laneId || contextMenuLaneId;
    if (laneId) hideLane(laneId);
    hideLaneContextMenu();
  });

  btnToolPoint.addEventListener("click", () => toggleTool(TOOL_MODES.point));
  btnToolBox.addEventListener("click", () => toggleTool(TOOL_MODES.box));
  btnToolPick.addEventListener("click", () => toggleTool(TOOL_MODES.pick));
  btnDrawPoint.addEventListener("click", drawPointFromInputs);
  btnDrawBox.addEventListener("click", drawBoxFromInputs);
  if (btnVehicleSanfang) {
    btnVehicleSanfang.addEventListener("click", () => setVehiclePreset("sanfang"));
  }
  if (btnVehicleLiufang) {
    btnVehicleLiufang.addEventListener("click", () => setVehiclePreset("liufang"));
  }
  btnClearAllPoints.addEventListener("click", clearAllDrawnPoints);
  btnClearAllBoxes.addEventListener("click", clearAllDrawnBoxes);
  btnClearAllPicks.addEventListener("click", clearAllDrawnPicks);
  if (btnCopyPickResult) btnCopyPickResult.addEventListener("click", copyPickResultPanel);
  toolPointList.addEventListener("click", onPointListClick);
  toolBoxList.addEventListener("click", onBoxListClick);
  toolPickList.addEventListener("click", onPickListClick);

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

  function toggleTool(mode) {
    activeTool = activeTool === mode ? null : mode;
    syncToolUi();
  }

  function syncToolUi() {
    const isPoint = activeTool === TOOL_MODES.point;
    const isBox = activeTool === TOOL_MODES.box;
    const isPick = activeTool === TOOL_MODES.pick;
    btnToolPoint.classList.toggle("active", isPoint);
    btnToolBox.classList.toggle("active", isBox);
    btnToolPick.classList.toggle("active", isPick);
    if (toolPanel) toolPanel.classList.toggle("is-open", !!activeTool);
    if (toolPanelPoint) toolPanelPoint.classList.toggle("is-active", isPoint);
    if (toolPanelBox) toolPanelBox.classList.toggle("is-active", isBox);
    if (toolPanelPick) toolPanelPick.classList.toggle("is-active", isPick);
    mapContainer.classList.toggle("tool-pick-mode", isPick);
    if (activeTool) {
      requestAnimationFrame(() => syncMapSvgViewport());
    }
  }

  function parseToolNumber(inputEl, label) {
    const raw = inputEl && String(inputEl.value).trim();
    if (!raw) throw new Error(`请填写${label}`);
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error(`${label} 不是有效数字`);
    return n;
  }

  function requireMapForTool() {
    if (!mapData) {
      setStatus("请先导入地图");
      return false;
    }
    return true;
  }

  function resolveToolInputToUtm(rawX, rawY) {
    if (typeof CoordTransform === "undefined") {
      throw new Error("未加载 coord_transform.js");
    }
    if (CoordTransform.isUtmToolInput(rawX, rawY)) {
      return { x: rawX, y: rawY, coordKind: "utm" };
    }

    const lon = rawX;
    const lat = rawY;
    if (lat < -90 || lat > 90) throw new Error("纬度应在 -90～90 之间");
    if (lon < -180 || lon > 180) throw new Error("经度应在 -180～180 之间");

    const meta = mapData.meta || {};
    let zone = meta.utm_zone;
    if (zone == null) {
      zone = CoordTransform.parseUtmZoneFromProjection(meta.projection || "");
    }
    if (zone == null || !Number.isFinite(zone)) {
      throw new Error("地图 header.proj 中未找到 UTM 带号（zone），无法转换经纬度");
    }

    const northern = CoordTransform.parseUtmNorthernFromProjection(meta.projection || "", lat);
    const { easting, northing } = CoordTransform.wgs84ToUtm(lon, lat, zone, northern);
    return {
      x: easting,
      y: northing,
      coordKind: "wgs84",
      lon,
      lat,
      zone,
    };
  }

  function getMapUtmContext() {
    if (!mapData?.meta) return null;
    const meta = mapData.meta;
    let zone = meta.utm_zone;
    if (zone == null && typeof CoordTransform !== "undefined") {
      zone = CoordTransform.parseUtmZoneFromProjection(meta.projection || "");
    }
    if (zone == null || !Number.isFinite(zone)) return null;
    return { zone, projection: meta.projection || "" };
  }

  function utmToWgs84ForDisplay(utmX, utmY) {
    const ctx = getMapUtmContext();
    if (!ctx || typeof CoordTransform === "undefined" || !CoordTransform.utmToWgs84) {
      return null;
    }
    try {
      const northern = CoordTransform.inferUtmNorthernFromNorthing(utmY, ctx.projection);
      return CoordTransform.utmToWgs84(utmX, utmY, ctx.zone, northern);
    } catch (_) {
      return null;
    }
  }

  function formatAnnotationCoordX(utmX, utmY, decimals) {
    const dec = decimals != null ? decimals : 3;
    let text = `X: ${utmX.toFixed(dec)}`;
    const wgs = utmToWgs84ForDisplay(utmX, utmY);
    if (wgs) text += ` (${wgs.lon.toFixed(6)})`;
    return text;
  }

  function formatAnnotationCoordY(utmX, utmY, decimals) {
    const dec = decimals != null ? decimals : 3;
    let text = `Y: ${utmY.toFixed(dec)}`;
    const wgs = utmToWgs84ForDisplay(utmX, utmY);
    if (wgs) text += ` (${wgs.lat.toFixed(6)})`;
    return text;
  }

  function formatAnnotationCoordBlock(utmX, utmY, decimals) {
    return `${formatAnnotationCoordX(utmX, utmY, decimals)}<br>${formatAnnotationCoordY(utmX, utmY, decimals)}`;
  }

  function formatAnnotationCoordPlainBlock(utmX, utmY, decimals) {
    return `${formatAnnotationCoordX(utmX, utmY, decimals)}\n${formatAnnotationCoordY(utmX, utmY, decimals)}`;
  }

  function formatPickRecordClipboard(record) {
    return `${record.label}\n${formatAnnotationCoordPlainBlock(record.x, record.y, 3)}`;
  }

  function isUserSelectingText() {
    const sel = window.getSelection();
    return !!(sel && !sel.isCollapsed && sel.toString().trim());
  }

  async function copyTextToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (!ok) throw new Error("浏览器不支持剪贴板写入");
  }

  async function copyPickCoordRecord(record) {
    if (!record) return;
    try {
      await copyTextToClipboard(formatPickRecordClipboard(record));
      setStatus(`已复制 ${record.label} 坐标`);
    } catch (err) {
      setStatus(`复制失败: ${err.message}`);
    }
  }

  function copyPickResultPanel() {
    const resultEl = document.getElementById("tool-pick-result");
    if (!resultEl) return;
    const text = resultEl.textContent.trim();
    if (!text || text === "暂无记录") {
      setStatus("当前无可复制内容");
      return;
    }
    copyTextToClipboard(text)
      .then(() => setStatus("已复制结果区内容"))
      .catch((err) => setStatus(`复制失败: ${err.message}`));
  }

  function formatAnnotationCoordInline(utmX, utmY, decimals, wgs84) {
    const dec = decimals != null ? decimals : 2;
    if (wgs84 && wgs84.lon != null && wgs84.lat != null) {
      return `X: ${utmX.toFixed(dec)} (${wgs84.lon.toFixed(6)}), Y: ${utmY.toFixed(dec)} (${wgs84.lat.toFixed(6)})`;
    }
    return `${formatAnnotationCoordX(utmX, utmY, dec)}, ${formatAnnotationCoordY(utmX, utmY, dec)}`;
  }

  function formatToolUtmStatus(resolved) {
    if (resolved.coordKind === "wgs84") {
      return formatAnnotationCoordInline(resolved.x, resolved.y, 2, {
        lon: resolved.lon,
        lat: resolved.lat,
      });
    }
    return formatAnnotationCoordInline(resolved.x, resolved.y, 2);
  }

  function utmToLocalPoint(mx, my) {
    const { x, y } = utmToLocal(mx, my);
    return `${x},${y}`;
  }

  function nextAnnotationId(prefix) {
    annotationSeq += 1;
    return `${prefix}-${annotationSeq}`;
  }

  function createAnnotationGroup(id) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("data-annotation-id", id);
    annotationsLayer.appendChild(g);
    return g;
  }

  function ensurePickHeadingArrowMarker() {
    if (!mapSvg) return;
    if (mapSvg.querySelector("#pick-heading-arrowhead")) return;
    let defs = mapSvg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      mapSvg.insertBefore(defs, mapSvg.firstChild);
    }
    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "pick-heading-arrowhead");
    marker.setAttribute("viewBox", "0 0 10 10");
    marker.setAttribute("refX", "9");
    marker.setAttribute("refY", "5");
    marker.setAttribute("markerWidth", "7");
    marker.setAttribute("markerHeight", "7");
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 0 L 10 5 L 0 10 z");
    path.setAttribute("class", "annotation-pick-heading-arrow");
    marker.appendChild(path);
    defs.appendChild(marker);
  }

  function ensurePickHeadingLinkLayer() {
    if (pickHeadingLinkLayer && pickHeadingLinkLayer.parentNode) return pickHeadingLinkLayer;
    pickHeadingLinkLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    pickHeadingLinkLayer.setAttribute("class", "annotation-pick-heading-layer");
    annotationsLayer.appendChild(pickHeadingLinkLayer);
    return pickHeadingLinkLayer;
  }

  function clearPickHeadingLink() {
    if (pickHeadingLinkLayer) pickHeadingLinkLayer.innerHTML = "";
  }

  function renderPickHeadingLink(p0, p1) {
    if (!p0 || !p1) {
      clearPickHeadingLink();
      return;
    }
    ensurePickHeadingArrowMarker();
    const layer = ensurePickHeadingLinkLayer();
    layer.innerHTML = "";
    const from = utmToLocal(p0.x, p0.y);
    const to = utmToLocal(p1.x, p1.y);
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const len = Math.hypot(dx, dy);
    if (len < 1e-6) return;
    const ux = dx / len;
    const uy = dy / len;
    // 终点回退，避免箭头被终点圆点覆盖（缩放放大时更明显）。
    const endBackoff = ANNOTATION_POINT_RADIUS * 2.6;
    const endX = to.x - ux * endBackoff;
    const endY = to.y - uy * endBackoff;
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", String(from.x));
    line.setAttribute("y1", String(from.y));
    line.setAttribute("x2", String(endX));
    line.setAttribute("y2", String(endY));
    line.setAttribute("marker-end", "url(#pick-heading-arrowhead)");
    line.setAttribute("class", "annotation-pick-heading-line");
    layer.appendChild(line);
  }

  function mountAnnotationLabel(group, lx, ly, text) {
    const labelEl = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelEl.setAttribute("x", "0.35");
    labelEl.setAttribute("y", "0.35");
    labelEl.setAttribute("text-anchor", "start");
    labelEl.setAttribute("dominant-baseline", "central");
    labelEl.setAttribute("transform", `translate(${lx}, ${ly}) scale(1, -1)`);
    labelEl.classList.add("annotation-label");
    labelEl.textContent = text;
    group.appendChild(labelEl);
  }

  function mountPointShape(group, mx, my, label) {
    const { x, y } = utmToLocal(mx, my);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(x));
    circle.setAttribute("cy", String(y));
    circle.setAttribute("r", String(ANNOTATION_POINT_RADIUS));
    circle.classList.add("annotation-point");
    group.appendChild(circle);
    if (label) mountAnnotationLabel(group, x, y, label);
  }

  function mountPickShape(group, mx, my, label) {
    const { x, y } = utmToLocal(mx, my);
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", String(x));
    circle.setAttribute("cy", String(y));
    circle.setAttribute("r", String(ANNOTATION_POINT_RADIUS));
    circle.classList.add("annotation-pick-point");
    group.appendChild(circle);
    if (label) mountAnnotationLabel(group, x, y, label);
  }

  function mountBoxShapes(group, cx, cy, heading, dims, label) {
    const { width, front, rear } = dims;
    const corners = vehicleBoxCornersUtm(cx, cy, heading, front, rear, width);
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute(
      "points",
      corners.map((p) => utmToLocalPoint(p.x, p.y)).join(" ")
    );
    poly.classList.add("annotation-box");
    group.appendChild(poly);

    const { x: lx, y: ly } = utmToLocal(cx, cy);
    const center = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    center.setAttribute("cx", String(lx));
    center.setAttribute("cy", String(ly));
    center.setAttribute("r", String(ANNOTATION_BOX_CENTER_RADIUS));
    center.classList.add("annotation-box-center");
    group.appendChild(center);
    if (label) mountAnnotationLabel(group, lx, ly, label);
  }

  function addDrawnPoint(mx, my) {
    pointLabelCounter += 1;
    const id = nextAnnotationId("point");
    const record = {
      id,
      label: `P${pointLabelCounter}`,
      x: mx,
      y: my,
      group: createAnnotationGroup(id),
    };
    mountPointShape(record.group, mx, my, record.label);
    drawnPoints.push(record);
    renderPointList();
    return record;
  }

  function addDrawnBox(cx, cy, heading, dims) {
    boxLabelCounter += 1;
    const id = nextAnnotationId("box");
    const record = {
      id,
      label: `B${boxLabelCounter}`,
      x: cx,
      y: cy,
      heading,
      width: dims.width,
      front: dims.front,
      rear: dims.rear,
      group: createAnnotationGroup(id),
    };
    mountBoxShapes(record.group, cx, cy, heading, dims, record.label);
    drawnBoxes.push(record);
    renderBoxList();
    return record;
  }

  function addDrawnPick(mx, my) {
    pickLabelCounter += 1;
    const id = nextAnnotationId("pick");
    const record = {
      id,
      label: `C${pickLabelCounter}`,
      x: mx,
      y: my,
      group: createAnnotationGroup(id),
    };
    record.group.classList.add("annotation-pick-marker");
    mountPickShape(record.group, mx, my, record.label);
    drawnPicks.push(record);
    renderPickList();
    return record;
  }

  function removeDrawnPoint(id) {
    const idx = drawnPoints.findIndex((p) => p.id === id);
    if (idx < 0) return;
    drawnPoints[idx].group.remove();
    drawnPoints.splice(idx, 1);
    renderPointList();
  }

  function removeDrawnBox(id) {
    const idx = drawnBoxes.findIndex((b) => b.id === id);
    if (idx < 0) return;
    drawnBoxes[idx].group.remove();
    drawnBoxes.splice(idx, 1);
    renderBoxList();
  }

  function clearAllDrawnPoints(silent) {
    for (const record of drawnPoints) record.group.remove();
    drawnPoints.length = 0;
    pointLabelCounter = 0;
    renderPointList();
    if (!silent) setStatus("已清空全部绘制点");
  }

  function clearAllDrawnBoxes(silent) {
    for (const record of drawnBoxes) record.group.remove();
    drawnBoxes.length = 0;
    boxLabelCounter = 0;
    renderBoxList();
    if (!silent) setStatus("已清空全部绘制框");
  }

  function clearAllDrawnPicks(silent) {
    for (const record of drawnPicks) record.group.remove();
    drawnPicks.length = 0;
    selectedPickIds.length = 0;
    clearPickHeadingLink();
    pickLabelCounter = 0;
    renderPickList();
    setToolPickResultText("暂无记录");
    if (!silent) setStatus("已清空全部拾取坐标");
  }

  function getMapViewportSize() {
    syncMapSvgViewport();
    const vb = mapSvg.viewBox.baseVal;
    const rect = mapContainer.getBoundingClientRect();
    return {
      w: Math.max(1, vb.width > 0 ? vb.width : rect.width || 800),
      h: Math.max(1, vb.height > 0 ? vb.height : rect.height || 600),
    };
  }

  function locateOnUtm(mx, my, spanMeters) {
    const { w, h } = getMapViewportSize();
    const span = Math.max(20, spanMeters || 80);
    const scale = Math.min(w / span, h / span) * 0.85;
    view.scale = Math.max(0.02, Math.min(scale, 500));
    const center = getViewCenter();
    const local = utmToLocal(mx, my);
    const px = local.x * view.scale;
    const py = -local.y * view.scale;
    const cos = Math.cos(view.rotation);
    const sin = Math.sin(view.rotation);
    view.tx = center.x - (cos * px - sin * py);
    view.ty = center.y - (sin * px + cos * py);
    applyTransform();
  }

  function locateDrawnPoint(id) {
    const record = drawnPoints.find((p) => p.id === id);
    if (!record) return;
    locateOnUtm(record.x, record.y, 60);
    setStatus(`已定位到 ${record.label}`);
  }

  function locateDrawnBox(id) {
    const record = drawnBoxes.find((b) => b.id === id);
    if (!record) return;
    const span = Math.max(record.front + record.rear, record.width) * 4;
    locateOnUtm(record.x, record.y, span);
    setStatus(`已定位到 ${record.label}`);
  }

  function locateDrawnPick(id) {
    const record = drawnPicks.find((p) => p.id === id);
    if (!record) return;
    locateOnUtm(record.x, record.y, 60);
    setStatus(`已定位到 ${record.label}`);
  }

  function renderPointList() {
    if (!toolPointList) return;
    toolPointList.innerHTML = "";
    if (!drawnPoints.length) {
      const empty = document.createElement("li");
      empty.className = "tool-record-empty";
      empty.textContent = "暂无记录";
      toolPointList.appendChild(empty);
      return;
    }
    for (const record of drawnPoints) {
      const li = document.createElement("li");
      li.className = "tool-record-item";
      li.dataset.id = record.id;
      li.innerHTML = `
        <div class="tool-record-name">${record.label}</div>
        <div class="tool-record-coord">${formatAnnotationCoordBlock(record.x, record.y)}</div>
        <div class="tool-record-actions">
          <button type="button" class="btn-mini" data-action="locate">定位</button>
          <button type="button" class="btn-mini" data-action="delete">删除</button>
        </div>`;
      toolPointList.appendChild(li);
    }
  }

  function renderBoxList() {
    if (!toolBoxList) return;
    toolBoxList.innerHTML = "";
    if (!drawnBoxes.length) {
      const empty = document.createElement("li");
      empty.className = "tool-record-empty";
      empty.textContent = "暂无记录";
      toolBoxList.appendChild(empty);
      return;
    }
    for (const record of drawnBoxes) {
      const li = document.createElement("li");
      li.className = "tool-record-item";
      li.dataset.id = record.id;
      li.innerHTML = `
        <div class="tool-record-name">${record.label}</div>
        <div class="tool-record-coord">${formatAnnotationCoordBlock(record.x, record.y)}<br>航向: ${record.heading.toFixed(3)} rad<br>宽 ${record.width.toFixed(2)} · 前 ${record.front.toFixed(2)} · 后 ${record.rear.toFixed(2)}</div>
        <div class="tool-record-actions">
          <button type="button" class="btn-mini" data-action="locate">定位</button>
          <button type="button" class="btn-mini" data-action="delete">删除</button>
        </div>`;
      toolBoxList.appendChild(li);
    }
  }

  function renderPickList() {
    if (!toolPickList) return;
    toolPickList.innerHTML = "";
    if (!drawnPicks.length) {
      const empty = document.createElement("li");
      empty.className = "tool-record-empty";
      empty.textContent = "暂无记录";
      toolPickList.appendChild(empty);
      return;
    }
    for (const record of drawnPicks) {
      const li = document.createElement("li");
      li.className = "tool-record-item";
      if (selectedPickIds.includes(record.id)) li.classList.add("is-selected");
      li.dataset.id = record.id;
      li.innerHTML = `
        <div class="tool-record-name">${record.label}</div>
        <div class="tool-record-coord">${formatAnnotationCoordBlock(record.x, record.y)}</div>
        <div class="tool-record-actions">
          <button type="button" class="btn-mini" data-action="copy">复制</button>
          <button type="button" class="btn-mini" data-action="locate">定位</button>
          <button type="button" class="btn-mini" data-action="delete">删除</button>
        </div>`;
      toolPickList.appendChild(li);
    }
  }

  function removePickSelection(id) {
    const idx = selectedPickIds.indexOf(id);
    if (idx >= 0) selectedPickIds.splice(idx, 1);
  }

  function updatePickHeadingResult() {
    if (selectedPickIds.length < 2) {
      clearPickHeadingLink();
      if (selectedPickIds.length === 1) {
        const p = drawnPicks.find((item) => item.id === selectedPickIds[0]);
        if (p) {
          setToolPickResultText(
            `${p.label}\n${formatAnnotationCoordPlainBlock(p.x, p.y, 3)}\n\n已选 1/2 点，再选一个点可计算航向`
          );
          return;
        }
      }
      setToolPickResultText("暂无记录");
      return;
    }
    const p0 = drawnPicks.find((item) => item.id === selectedPickIds[0]);
    const p1 = drawnPicks.find((item) => item.id === selectedPickIds[1]);
    if (!p0 || !p1) {
      clearPickHeadingLink();
      setToolPickResultText("暂无记录");
      return;
    }
    renderPickHeadingLink(p0, p1);
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const heading = Math.atan2(dy, dx);
    const dist = Math.hypot(dx, dy);
    setToolPickResultText(
      `两点连线\n${p0.label} -> ${p1.label}\ndistance: ${dist.toFixed(3)}\nheading: ${heading.toFixed(6)} rad`
    );
    setStatus(`航向 ${p0.label} -> ${p1.label}: ${heading.toFixed(6)} rad`);
  }

  function togglePickSelection(id) {
    const exists = selectedPickIds.indexOf(id);
    if (exists >= 0) {
      selectedPickIds.splice(exists, 1);
      renderPickList();
      updatePickHeadingResult();
      return;
    }
    if (selectedPickIds.length >= 2) selectedPickIds.shift();
    selectedPickIds.push(id);
    renderPickList();
    updatePickHeadingResult();
  }

  function onPointListClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const item = btn.closest(".tool-record-item");
    if (!item || !item.dataset.id) return;
    if (btn.dataset.action === "locate") locateDrawnPoint(item.dataset.id);
    else if (btn.dataset.action === "delete") {
      const record = drawnPoints.find((p) => p.id === item.dataset.id);
      removeDrawnPoint(item.dataset.id);
      setStatus(record ? `已删除 ${record.label}` : "已删除");
    }
  }

  function onBoxListClick(e) {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const item = btn.closest(".tool-record-item");
    if (!item || !item.dataset.id) return;
    if (btn.dataset.action === "locate") locateDrawnBox(item.dataset.id);
    else if (btn.dataset.action === "delete") {
      const record = drawnBoxes.find((b) => b.id === item.dataset.id);
      removeDrawnBox(item.dataset.id);
      setStatus(record ? `已删除 ${record.label}` : "已删除");
    }
  }

  function onPickListClick(e) {
    const btn = e.target.closest("[data-action]");
    const item = btn ? btn.closest(".tool-record-item") : e.target.closest(".tool-record-item");
    if (!item || !item.dataset.id) return;
    if (!btn) {
      if (isUserSelectingText()) return;
      togglePickSelection(item.dataset.id);
      return;
    }
    if (btn.dataset.action === "copy") {
      const record = drawnPicks.find((p) => p.id === item.dataset.id);
      copyPickCoordRecord(record);
    } else if (btn.dataset.action === "locate") locateDrawnPick(item.dataset.id);
    else if (btn.dataset.action === "delete") {
      const idx = drawnPicks.findIndex((p) => p.id === item.dataset.id);
      if (idx < 0) return;
      const record = drawnPicks[idx];
      record.group.remove();
      drawnPicks.splice(idx, 1);
      removePickSelection(record.id);
      renderPickList();
      updatePickHeadingResult();
      setStatus(`已删除 ${record.label}`);
    }
  }

  /** 参考点为后轴中心，沿航向 +前轴 / -后轴，左右 ±车宽/2 */
  function vehicleBoxCornersUtm(cx, cy, heading, front, rear, width) {
    const hw = width / 2;
    const cos = Math.cos(heading);
    const sin = Math.sin(heading);
    const local = [
      [front, -hw],
      [front, hw],
      [-rear, hw],
      [-rear, -hw],
    ];
    return local.map(([fx, fy]) => ({
      x: cx + fx * cos - fy * sin,
      y: cy + fx * sin + fy * cos,
    }));
  }

  function parseToolNumberOrDefault(inputEl, label, defaultValue) {
    const raw = inputEl && String(inputEl.value).trim();
    if (!raw) return defaultValue;
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error(`${label} 不是有效数字`);
    if (n <= 0) throw new Error(`${label} 须大于 0`);
    return n;
  }

  function setVehiclePreset(presetKey) {
    const preset = VEHICLE_PRESETS[presetKey];
    if (!preset) return;
    if (toolBoxWidth) toolBoxWidth.value = String(preset.width);
    if (toolBoxFront) toolBoxFront.value = String(preset.front);
    if (toolBoxRear) toolBoxRear.value = String(preset.rear);
    if (btnVehicleSanfang) {
      btnVehicleSanfang.classList.toggle("active", presetKey === "sanfang");
    }
    if (btnVehicleLiufang) {
      btnVehicleLiufang.classList.toggle("active", presetKey === "liufang");
    }
  }

  function parseVehicleDimsFromInputs() {
    return {
      width: parseToolNumberOrDefault(toolBoxWidth, "车宽", DEFAULT_VEHICLE_WIDTH),
      front: parseToolNumberOrDefault(toolBoxFront, "前轴", DEFAULT_VEHICLE_FRONT),
      rear: parseToolNumberOrDefault(toolBoxRear, "后轴", DEFAULT_VEHICLE_REAR),
    };
  }

  function setToolPickResultText(text) {
    const resultEl = document.getElementById("tool-pick-result");
    if (resultEl) resultEl.textContent = text;
    if (btnCopyPickResult) {
      const t = (text || "").trim();
      btnCopyPickResult.disabled = !t || t === "暂无记录";
    }
  }

  function drawPointFromInputs() {
    if (!requireMapForTool()) return;
    try {
      const rawX = parseToolNumber(toolPointX, "X 坐标");
      const rawY = parseToolNumber(toolPointY, "Y 坐标");
      const resolved = resolveToolInputToUtm(rawX, rawY);
      const record = addDrawnPoint(resolved.x, resolved.y);
      if (toolPointX) toolPointX.value = "";
      if (toolPointY) toolPointY.value = "";
      setStatus(`已绘制 ${record.label} ${formatToolUtmStatus(resolved)}`);
    } catch (err) {
      setStatus(`错误: ${err.message}`);
    }
  }

  function drawBoxFromInputs() {
    if (!requireMapForTool()) return;
    try {
      const rawX = parseToolNumber(toolBoxX, "X 坐标");
      const rawY = parseToolNumber(toolBoxY, "Y 坐标");
      const resolved = resolveToolInputToUtm(rawX, rawY);
      const heading = parseToolNumber(toolBoxHeading, "航向角");
      const dims = parseVehicleDimsFromInputs();
      const record = addDrawnBox(resolved.x, resolved.y, heading, dims);
      if (toolBoxX) toolBoxX.value = "";
      if (toolBoxY) toolBoxY.value = "";
      if (toolBoxHeading) toolBoxHeading.value = "";
      setStatus(
        `已绘制 ${record.label} 后轴 ${formatToolUtmStatus(resolved)} 宽${dims.width} 前${dims.front} 后${dims.rear}`
      );
    } catch (err) {
      setStatus(`错误: ${err.message}`);
    }
  }

  function showPickedCoordinates(clientX, clientY) {
    const { x: sx, y: sy } = getContainerPoint(clientX, clientY);
    const { x, y } = screenToMap(sx, sy);
    const record = addDrawnPick(x, y);
    if (selectedPickIds.length >= 2) selectedPickIds.shift();
    selectedPickIds.push(record.id);
    renderPickList();
    updatePickHeadingResult();
    setStatus(`已拾取 ${record.label} ${formatAnnotationCoordInline(x, y, 2)}`);
  }

  function clearAnnotations() {
    clearAllDrawnPoints(true);
    clearAllDrawnBoxes(true);
    clearAllDrawnPicks(true);
    selectedPickIds.length = 0;
    annotationSeq = 0;
    setToolPickResultText("暂无记录");
  }

  function clearAllAnnotations() {
    const hadAny = drawnPoints.length > 0 || drawnBoxes.length > 0 || drawnPicks.length > 0;
    const hadJunction = !!selectedJunctionId;
    clearAnnotations();
    clearJunctionSelection();
    if (hadJunction) {
      setStatus("已清空全部标注并取消路口高亮");
    } else {
      setStatus(hadAny ? "已清空全部标注（点、框、坐标）" : "当前无标注可清空");
    }
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
    e.preventDefault();
    if (suppressLaneContextMenu) {
      rightClickContextLaneId = null;
      return;
    }
    const shape = e.target.closest(".lane-shape");
    const laneId = (shape && shape.dataset.laneId) || rightClickContextLaneId;
    rightClickContextLaneId = null;
    if (laneId && mapData && !hiddenLaneIds.has(laneId)) {
      showLaneContextMenu(e.clientX, e.clientY, laneId);
    }
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
      e.preventDefault();
      const shape = e.target.closest(".lane-shape");
      const laneId = shape && shape.dataset.laneId;
      rightPointerDown = {
        x: e.clientX,
        y: e.clientY,
        laneId: laneId && !hiddenLaneIds.has(laneId) ? laneId : null,
      };
      suppressLaneContextMenu = false;
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
      if (rightPointerDown) {
        const rdx = e.clientX - rightPointerDown.x;
        const rdy = e.clientY - rightPointerDown.y;
        if (rdx * rdx + rdy * rdy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
          suppressLaneContextMenu = true;
        }
      }
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
        const svgPt = getContainerPoint(pointerDown.x, pointerDown.y);
        isPanning = true;
        panStart = {
          svgX: svgPt.x,
          svgY: svgPt.y,
          tx: pointerDown.tx,
          ty: pointerDown.ty,
        };
        mapContainer.classList.add("panning");
      }
    }
    if (!isPanning || !panStart) return;
    const cur = getContainerPoint(e.clientX, e.clientY);
    view.tx = panStart.tx + (cur.x - panStart.svgX);
    view.ty = panStart.ty + (cur.y - panStart.svgY);
    applyTransform();
  }

  function onMouseUp(e) {
    if (e.button === 2) {
      if (isRotating) {
        isRotating = false;
        rotateStart = null;
        mapContainer.classList.remove("rotating");
      }
      if (!suppressLaneContextMenu && rightPointerDown && rightPointerDown.laneId) {
        rightClickContextLaneId = rightPointerDown.laneId;
      } else {
        rightClickContextLaneId = null;
      }
      rightPointerDown = null;
    }
    if (e.button === 0) {
      if (isPanning) {
        isPanning = false;
        panStart = null;
        mapContainer.classList.remove("panning");
      } else if (pointerDown && activeTool === TOOL_MODES.pick && mapData) {
        showPickedCoordinates(pointerDown.x, pointerDown.y);
      } else if (pointerDown && pointerDown.laneId) {
        selectLane(pointerDown.laneId);
      } else if (pointerDown && activeTool !== TOOL_MODES.pick) {
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

  function createJunctionElement(junction) {
    if (!junction.polygon || junction.polygon.length < 6) return null;
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", flatToSvgPoints(junction.polygon));
    poly.classList.add("junction-shape", "junction-hidden");
    poly.dataset.junctionId = junction.id;
    return poly;
  }

  function junctionCentroidLocal(junction) {
    const flat = junction.polygon;
    if (!flat || flat.length < 2) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const x = flat[i];
      const y = flat[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (!Number.isFinite(minX)) return null;
    return {
      x: (minX + maxX) / 2 - mapOrigin.x,
      y: (minY + maxY) / 2 - mapOrigin.y,
    };
  }

  function createJunctionLabel(junction) {
    const c = junctionCentroidLocal(junction);
    if (!c) return null;
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "central");
    label.setAttribute("transform", `translate(${c.x}, ${c.y}) scale(1, -1)`);
    label.classList.add("junction-label", "junction-hidden");
    label.dataset.junctionId = junction.id;
    label.textContent = junction.id;
    label.addEventListener("mousedown", (e) => e.stopPropagation());
    label.addEventListener("click", (e) => {
      e.stopPropagation();
      selectJunction(junction.id);
    });
    return label;
  }

  function applyJunctionVisibility() {
    for (const [jid, el] of junctionElements) {
      const visible = showAllJunctions || jid === selectedJunctionId;
      el.classList.toggle("junction-hidden", !visible);
    }
    for (const [jid, el] of junctionLabelElements) {
      const visible = showAllJunctions || jid === selectedJunctionId;
      el.classList.toggle("junction-hidden", !visible);
    }
  }

  function toggleDrawAllJunctions() {
    if (!junctionById.size) {
      setStatus("请先导入地图");
      return;
    }
    showAllJunctions = !showAllJunctions;
    if (btnJunctionDrawAll) btnJunctionDrawAll.classList.toggle("active", showAllJunctions);
    applyJunctionVisibility();
    setStatus(
      showAllJunctions
        ? `已绘制全部 ${junctionById.size} 个路口 Polygon`
        : "已隐藏全部路口 Polygon"
    );
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
    showAllJunctions = false;
    if (btnJunctionDrawAll) btnJunctionDrawAll.classList.remove("active");
    clearJunctionSelection();
    applyJunctionVisibility();
    setStatus(`已隐藏全部 ${hiddenLaneIds.size} 条车道及所有路口 Polygon`);
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
    if (junctionsLayer) junctionsLayer.innerHTML = "";
    clearSelectedCenterline();
    clearAnnotations();
    laneById.clear();
    laneElements.clear();
    hiddenLaneIds.clear();
    selectedLaneId = null;
    junctionById.clear();
    junctionElements.clear();
    junctionLabelElements.clear();
    selectedJunctionId = null;
    showAllJunctions = false;
    if (btnJunctionDrawAll) btnJunctionDrawAll.classList.remove("active");
    if (btnJunctionHighlight) btnJunctionHighlight.classList.remove("active");
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

    if (junctionsLayer) {
      const junctionFrag = document.createDocumentFragment();
      for (const junction of data.junctions || []) {
        junctionById.set(junction.id, junction);
        const el = createJunctionElement(junction);
        if (el) {
          junctionFrag.appendChild(el);
          junctionElements.set(junction.id, el);
        }
        const labelEl = createJunctionLabel(junction);
        if (labelEl) {
          junctionFrag.appendChild(labelEl);
          junctionLabelElements.set(junction.id, labelEl);
        }
      }
      junctionsLayer.appendChild(junctionFrag);
    }

    fitViewToBounds(data.meta.bounds);
    emptyHint.style.display = "none";
    btnResetView.disabled = false;
    laneSearch.disabled = false;
    if (junctionSearch) junctionSearch.disabled = false;
    btnClearAll.disabled = false;
    btnHideAll.disabled = false;
    btnShowAll.disabled = false;
    renderActiveLaneInfo();
    renderActiveJunctionInfo();
    syncLaneTabButtons();
  }

  function clearSelectedCenterline() {
    if (centerlineLayer) centerlineLayer.innerHTML = "";
  }

  function renderSelectedCenterline(lane) {
    clearSelectedCenterline();
    if (!centerlineLayer || !lane?.central_segments?.length) return;
    const frag = document.createDocumentFragment();
    for (const seg of lane.central_segments) {
      if (!seg || seg.length < 4) continue;
      const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      pl.setAttribute("points", flatToSvgPoints(seg));
      pl.classList.add("lane-selected-centerline");
      frag.appendChild(pl);
    }
    centerlineLayer.appendChild(frag);
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

  function setActiveSidebarPanel(panelKey) {
    if (!panelKey) return;
    activeSidebarPanel = panelKey;
    const isLane = panelKey === SIDEBAR_PANELS.lane;
    if (btnMainTabLane) btnMainTabLane.classList.toggle("active", isLane);
    if (btnMainTabJunction) btnMainTabJunction.classList.toggle("active", !isLane);
    if (lanePanel) lanePanel.classList.toggle("is-hidden", !isLane);
    if (junctionPanel) junctionPanel.classList.toggle("is-hidden", isLane);
  }

  function clearLaneSelection() {
    if (!selectedLaneId) return;
    selectedLaneId = null;
    clearHighlight();
    clearSelectedCenterline();
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
    // 前驱/后继车道的颜色优先级高于同道路车道，
    // 因此同道路车道上色时排除掉已经是前驱或后继的车道，避免颜色被覆盖。
    const priorityIds = new Set([
      ...(lane.predecessor_ids || []),
      ...(lane.successor_ids || []),
    ]);
    const sameRoadOnlyIds = (lane.same_road_lane_ids || []).filter(
      (id) => !priorityIds.has(id)
    );
    highlightLaneSet(sameRoadOnlyIds, "state-same-road");
    highlightLaneSet(lane.predecessor_ids, "state-predecessor");
    highlightLaneSet(lane.successor_ids, "state-successor");
    renderSelectedCenterline(lane);
    renderActiveLaneInfo();
    laneSearch.value = laneId;
    setStatus(`已选中: ${laneId}`);
  }

  function getLaneFocus(lane) {
    const points = [];
    if (lane?.polygon && lane.polygon.length >= 2) {
      for (let i = 0; i + 1 < lane.polygon.length; i += 2) {
        points.push({ x: lane.polygon[i], y: lane.polygon[i + 1] });
      }
    }
    if (!points.length && lane?.central_segments?.length) {
      for (const seg of lane.central_segments) {
        for (let i = 0; i + 1 < seg.length; i += 2) {
          points.push({ x: seg[i], y: seg[i + 1] });
        }
      }
    }
    if (!points.length) return null;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const pt of points) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const span = Math.max(30, maxX - minX, maxY - minY) * 1.6;
    return { x: centerX, y: centerY, span };
  }

  function locateLaneInView(laneId) {
    const lane = laneById.get(laneId);
    if (!lane) return false;
    const focus = getLaneFocus(lane);
    if (!focus) return false;
    locateOnUtm(focus.x, focus.y, focus.span);
    return true;
  }

  function searchAndSelectLane(id) {
    if (!id) return;
    if (laneById.has(id)) {
      selectLane(id);
      locateLaneInView(id);
      return;
    }
    setStatus(`未找到车道: ${id}`);
  }

  function formatJunctionInfo(junction) {
    const points = [];
    if (junction.polygon && junction.polygon.length >= 2) {
      for (let i = 0; i + 1 < junction.polygon.length; i += 2) {
        points.push({ x: junction.polygon[i], y: junction.polygon[i + 1] });
      }
    }
    const lines = [
      `路口信息`,
      `路口 ID: ${junction.id}`,
      `路口类型: ${junction.type} (${junction.type_code})`,
      `Polygon 点集 (${points.length}):`,
    ];
    if (!points.length) {
      lines.push("  —");
    } else {
      points.forEach((pt, idx) => {
        lines.push(`  ${idx + 1}. ${pt.x.toFixed(3)}, ${pt.y.toFixed(3)}`);
      });
    }
    return lines.join("\n");
  }

  function renderActiveJunctionInfo() {
    if (!junctionInfo) return;
    if (!selectedJunctionId || !junctionById.has(selectedJunctionId)) {
      junctionInfo.textContent = DEFAULT_JUNCTION_INFO;
      return;
    }
    junctionInfo.textContent = formatJunctionInfo(junctionById.get(selectedJunctionId));
  }

  function clearJunctionHighlight() {
    for (const el of junctionElements.values()) {
      el.classList.remove("state-selected");
    }
    for (const el of junctionLabelElements.values()) {
      el.classList.remove("state-selected");
    }
  }

  function clearJunctionSelection() {
    if (!selectedJunctionId) return;
    selectedJunctionId = null;
    clearJunctionHighlight();
    applyJunctionVisibility();
    if (btnJunctionHighlight) btnJunctionHighlight.classList.remove("active");
    renderActiveJunctionInfo();
  }

  function selectJunction(junctionId) {
    if (!junctionId || !junctionById.has(junctionId)) return;
    selectedJunctionId = junctionId;
    clearJunctionHighlight();
    applyJunctionVisibility();
    const el = junctionElements.get(junctionId);
    if (el) el.classList.add("state-selected");
    const labelEl = junctionLabelElements.get(junctionId);
    if (labelEl) labelEl.classList.add("state-selected");
    if (btnJunctionHighlight) btnJunctionHighlight.classList.add("active");
    renderActiveJunctionInfo();
    if (junctionSearch) junctionSearch.value = junctionId;
    setStatus(`已选中路口: ${junctionId}`);
  }

  function getJunctionFocus(junction) {
    if (!junction?.polygon || junction.polygon.length < 2) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < junction.polygon.length; i += 2) {
      const x = junction.polygon[i];
      const y = junction.polygon[i + 1];
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    if (!Number.isFinite(minX)) return null;
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const span = Math.max(30, maxX - minX, maxY - minY) * 1.6;
    return { x: centerX, y: centerY, span };
  }

  function locateJunctionInView(junctionId) {
    const junction = junctionById.get(junctionId);
    if (!junction) return false;
    const focus = getJunctionFocus(junction);
    if (!focus) return false;
    locateOnUtm(focus.x, focus.y, focus.span);
    return true;
  }

  function searchAndSelectJunction(id) {
    if (!id) return;
    if (junctionById.has(id)) {
      selectJunction(id);
      locateJunctionInView(id);
      return;
    }
    setStatus(`未找到路口: ${id}`);
  }

  function toggleHighlightJunction() {
    const id = junctionSearch ? junctionSearch.value.trim() : "";
    // 已有高亮，且未输入新的其它 ID：再次点击取消高亮
    if (selectedJunctionId && (!id || id === selectedJunctionId)) {
      clearJunctionSelection();
      setStatus("已取消路口高亮");
      return;
    }
    if (!id) {
      setStatus("请先输入路口 ID");
      return;
    }
    searchAndSelectJunction(id);
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
        setStatus(
          `${file.name} · ${body.meta.lane_count} 条车道 · ${body.meta.junction_count || 0} 个路口`
        );
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
  syncToolUi();
  renderPointList();
  renderBoxList();
  renderPickList();
  laneInfo.textContent = DEFAULT_LANE_INFO;
  initSidebarResize();
  initProtoLoader();
})();
