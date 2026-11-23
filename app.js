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
  const stopFileInput = document.getElementById("stop-file-input");
  const btnImportStops = document.getElementById("btn-import-stops");
  const stopsLayer = document.getElementById("stops-layer");
  const restrictedAreaFileInput = document.getElementById("restricted-area-file-input");
  const btnImportRestrictedAreas = document.getElementById("btn-import-restricted-areas");
  const restrictedAreasLayer = document.getElementById("restricted-areas-layer");
  const restrictedDrawLayer = document.getElementById("restricted-draw-layer");
  const stopsPanel = document.getElementById("stops-panel");
  const stopsPanelTitle = document.getElementById("stops-panel-title");
  const stopsFilter = document.getElementById("stops-filter");
  const stopsDetail = document.getElementById("stops-detail");
  const stopsList = document.getElementById("stops-list");
  const btnStopsFit = document.getElementById("btn-stops-fit");
  const btnStopsClear = document.getElementById("btn-stops-clear");
  const btnResetView = document.getElementById("btn-reset-view");
  const statusEl = document.getElementById("status");
  const mapContainer = document.getElementById("map-container");
  const mapSvg = document.getElementById("map-svg");
  const viewport = document.getElementById("viewport");
  const lanesLayer = document.getElementById("lanes-layer");
  const junctionsLayer = document.getElementById("junctions-layer");
  const elementsLayer = document.getElementById("elements-layer");
  const centerlineLayer = document.getElementById("centerline-layer");
  const laneInfo = document.getElementById("lane-info");
  const laneSearch = document.getElementById("lane-search");
  const junctionInfo = document.getElementById("junction-info");
  const junctionSearch = document.getElementById("junction-search");
  const elementInfo = document.getElementById("element-info");
  const elementSearch = document.getElementById("element-search");
  const btnMainTabLane = document.getElementById("btn-main-tab-lane");
  const btnMainTabJunction = document.getElementById("btn-main-tab-junction");
  const btnMainTabElement = document.getElementById("btn-main-tab-element");
  const lanePanel = document.getElementById("lane-panel");
  const junctionPanel = document.getElementById("junction-panel");
  const elementPanel = document.getElementById("element-panel");
  const laneHeaderActions = document.getElementById("lane-header-actions");
  const btnJunctionDrawAll = document.getElementById("btn-junction-draw-all");
  const btnJunctionHighlight = document.getElementById("btn-junction-highlight");
  const btnElementDrawAll = document.getElementById("btn-element-draw-all");
  const btnElementHighlight = document.getElementById("btn-element-highlight");
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
  const opsBufferLayer = document.getElementById("ops-buffer-layer");
  const btnToolPoint = document.getElementById("btn-tool-point");
  const btnToolBox = document.getElementById("btn-tool-box");
  const btnToolRestrict = document.getElementById("btn-tool-restrict");
  const btnToolPick = document.getElementById("btn-tool-pick");
  const btnToolOps = document.getElementById("btn-tool-ops");
  const toolPanelPoint = document.getElementById("tool-panel-point");
  const toolPanelBox = document.getElementById("tool-panel-box");
  const toolPanelRestrict = document.getElementById("tool-panel-restrict");
  const toolPanelPick = document.getElementById("tool-panel-pick");
  const toolPanelOps = document.getElementById("tool-panel-ops");
  const restrictAreaName = document.getElementById("restrict-area-name");
  const restrictAreaId = document.getElementById("restrict-area-id");
  const restrictCityCode = document.getElementById("restrict-city-code");
  const restrictRegionPath = document.getElementById("restrict-region-path");
  const restrictTypeInput = document.getElementById("restrict-type");
  const restrictStatusInput = document.getElementById("restrict-status");
  const restrictTimeModeInput = document.getElementById("restrict-time-mode");
  const restrictUpdatedAt = document.getElementById("restrict-updated-at");
  const restrictRemark = document.getElementById("restrict-remark");
  const btnRestrictStart = document.getElementById("btn-restrict-start");
  const btnRestrictEnd = document.getElementById("btn-restrict-end");
  const btnRestrictUndo = document.getElementById("btn-restrict-undo");
  const btnRestrictClear = document.getElementById("btn-restrict-clear");
  const btnRestrictAddPoint = document.getElementById("btn-restrict-add-point");
  const btnRestrictCopy = document.getElementById("btn-restrict-copy");
  const btnRestrictDownload = document.getElementById("btn-restrict-download");
  const restrictPointList = document.getElementById("restrict-point-list");
  const restrictPointTitle = document.getElementById("restrict-point-title");
  const restrictAddLon = document.getElementById("restrict-add-lon");
  const restrictAddLat = document.getElementById("restrict-add-lat");
  const toolPointX = document.getElementById("tool-point-x");
  const toolPointY = document.getElementById("tool-point-y");
  const toolPointXLabel = document.getElementById("tool-point-x-label");
  const toolPointYLabel = document.getElementById("tool-point-y-label");
  const toolPointHint = document.getElementById("tool-point-hint");
  const btnPointCrsWgs84 = document.getElementById("btn-point-crs-wgs84");
  const btnPointCrsGcj02 = document.getElementById("btn-point-crs-gcj02");
  const toolBoxX = document.getElementById("tool-box-x");
  const toolBoxY = document.getElementById("tool-box-y");
  const toolBoxXLabel = document.getElementById("tool-box-x-label");
  const toolBoxYLabel = document.getElementById("tool-box-y-label");
  const toolBoxHint = document.getElementById("tool-box-hint");
  const btnBoxCrsWgs84 = document.getElementById("btn-box-crs-wgs84");
  const btnBoxCrsGcj02 = document.getElementById("btn-box-crs-gcj02");
  const toolBoxHeading = document.getElementById("tool-box-heading");
  const toolBoxWidth = document.getElementById("tool-box-width");
  const toolBoxFront = document.getElementById("tool-box-front");
  const toolBoxRear = document.getElementById("tool-box-rear");
  const btnVehicleSanfang = document.getElementById("btn-vehicle-sanfang");
  const btnVehicleLiufang = document.getElementById("btn-vehicle-liufang");
  const btnDrawPoint = document.getElementById("btn-draw-point");
  const btnDrawBox = document.getElementById("btn-draw-box");
  const toolOpsDistance = document.getElementById("tool-ops-distance");
  const btnDrawOps = document.getElementById("btn-draw-ops");
  const btnClearOps = document.getElementById("btn-clear-ops");
  const btnClearAllPoints = document.getElementById("btn-clear-all-points");
  const btnClearAllBoxes = document.getElementById("btn-clear-all-boxes");
  const btnClearAllPicks = document.getElementById("btn-clear-all-picks");
  const btnCopyPickResult = document.getElementById("btn-copy-pick-result");
  const toolPointList = document.getElementById("tool-point-list");
  const toolBoxList = document.getElementById("tool-box-list");
  const toolPickList = document.getElementById("tool-pick-list");
  const toolPanel = document.getElementById("tool-panel");
  const basemapContainer = document.getElementById("basemap-container");
  const basemapAttribution = document.getElementById("basemap-attribution");
  const btnBasemapVector = document.getElementById("btn-basemap-vector");
  const btnBasemapSatellite = document.getElementById("btn-basemap-satellite");
  const btnBasemapSrcAmap = document.getElementById("btn-basemap-src-amap");
  const btnBasemapSrcGoogle = document.getElementById("btn-basemap-src-google");
  const btnLaneFade = document.getElementById("btn-lane-fade");
  const btnLaneColor = document.getElementById("btn-lane-color");
  const laneColorLegend = document.getElementById("lane-color-legend");
  const mapBoundsOutline = document.getElementById("map-bounds-outline");

  const SIDEBAR_WIDTH_DEFAULT = 480;
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
    restrict: "restrict",
    pick: "pick",
    ops: "ops",
  };
  const POINT_CRS = {
    wgs84: "wgs84",
    gcj02: "gcj02",
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
  /** key = `${kind}:${id}` -> { id, kind, polygon, ... } */
  let elementByKey = new Map();
  let elementElements = new Map();
  let elementLabelElements = new Map();
  let selectedElementKey = null;
  let showAllElements = false;
  const DEFAULT_ELEMENT_INFO =
    "未选择元素\n\n元素包含人行横道(crosswalk)、地图对象(object)、交通岛(traffic_island)与信号灯(signal)。\n点击「绘制所有元素」以 Polygon 形式绘制全部元素，元素旁会标注其 ID。\n点击 ID 或在此输入元素 ID 并回车，即可查看该元素的详细内容并在视图中高亮。";
  const ELEMENT_KIND_NAMES = {
    crosswalk: "人行横道 (crosswalk)",
    object: "地图对象 (object)",
    traffic_island: "交通岛 (traffic_island)",
    signal: "信号灯 (signal)",
  };
  let contextMenuLaneId = null;
  /** 地图中心（UTM），SVG 使用局部坐标避免大数值缩放时精度丢失 */
  let mapOrigin = { x: 0, y: 0 };

  let view = { scale: 1, tx: 0, ty: 0, rotation: 0 };
  let baseView = null;

  // ---- 底图状态：自绘瓦片，无需 Key ----
  // 两个维度：底图类型（矢量 vector / 卫星 satellite）× 数据源（高德 amap / 谷歌 google）
  const BASEMAP_MODES = { none: "none", vector: "vector", satellite: "satellite" };
  const BASEMAP_PROVIDERS = { amap: "amap", google: "google" };
  const TILE_SIZE = 256;
  // BASEMAP_SOURCES[类型][数据源]
  // 注意：高德为 GCJ02 坐标（需 WGS84→GCJ02 转换）；谷歌为 WGS84 坐标（不做偏移）。
  // 谷歌服务在部分网络环境下需代理才能访问。
  const BASEMAP_SOURCES = {
    vector: {
      amap: {
        label: "高德矢量",
        gcj: true,
        maxZoom: 18,
        urls: [
          "https://wprd01.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
          "https://wprd02.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
          "https://wprd03.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
          "https://wprd04.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=7",
        ],
      },
      google: {
        // 谷歌中国区路网瓦片为 GCJ02 坐标（与高德一致，有偏移），需 WGS84→GCJ02 转换；
        // 注意其卫星影像（lyrs=s）反而是 WGS84 无偏移，故二者 gcj 设置不同
        label: "谷歌矢量",
        gcj: true,
        maxZoom: 20,
        urls: [
          "https://mt0.google.com/vt/lyrs=m&hl=zh-CN&x={x}&y={y}&z={z}",
          "https://mt1.google.com/vt/lyrs=m&hl=zh-CN&x={x}&y={y}&z={z}",
          "https://mt2.google.com/vt/lyrs=m&hl=zh-CN&x={x}&y={y}&z={z}",
          "https://mt3.google.com/vt/lyrs=m&hl=zh-CN&x={x}&y={y}&z={z}",
        ],
      },
    },
    satellite: {
      amap: {
        label: "高德卫星",
        gcj: true,
        maxZoom: 18,
        urls: [
          "https://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
          "https://webst02.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
          "https://webst03.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
          "https://webst04.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
        ],
      },
      google: {
        label: "谷歌卫星",
        gcj: false,
        maxZoom: 21,
        urls: [
          "https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
          "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
          "https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
          "https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
        ],
      },
    },
  };
  let basemapMode = BASEMAP_MODES.none;
  // 数据源默认高德（国内可直连；谷歌可能需代理）
  let basemapProvider = BASEMAP_PROVIDERS.amap;
  // 返回当前生效的底图源（类型 × 数据源），无底图时返回 null
  function getActiveBasemapSource() {
    if (basemapMode === BASEMAP_MODES.none) return null;
    const byMode = BASEMAP_SOURCES[basemapMode];
    return (byMode && byMode[basemapProvider]) || null;
  }
  // 底图瓦片加载统计（用于角标提示当前来源与加载状态）
  const basemapStat = { ok: 0, err: 0 };
  let basemapCanvas = null;
  let basemapCtx = null;
  let basemapOffCanvas = null;
  // 车道渲染样式：normal（默认灰）/ fade（透明）/ color（按类型着色）
  const LANE_RENDER_MODES = { normal: "normal", fade: "fade", color: "color" };
  let laneRenderMode = LANE_RENDER_MODES.normal;
  let basemapRedrawScheduled = false;
  const tileImageCache = new Map();
  const DRAG_THRESHOLD_PX = 5;
  const LANE_INFO_TABS = {
    attributes: "attributes",
    centerline: "centerline",
    width: "width",
    roadWidth: "roadWidth",
  };
  let activeLaneInfoTab = LANE_INFO_TABS.attributes;
  const SIDEBAR_PANELS = { lane: "lane", junction: "junction", element: "element" };
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
  let pointInputCrs = POINT_CRS.wgs84;
  let boxInputCrs = POINT_CRS.wgs84;
  let pointLabelCounter = 0;
  let boxLabelCounter = 0;
  let pickLabelCounter = 0;
  let annotationSeq = 0;
  const drawnPoints = [];
  const drawnBoxes = [];
  const drawnPicks = [];
  const selectedPickIds = [];
  let pickHeadingLinkLayer = null;
  /** 已导入的临停点（经纬度保留原值，UTM 按当前地图 zone 重算） */
  let stopRecords = [];
  let selectedStopId = null;
  /** 已导入的禁行区（原始点为 GCJ02，经 WGS84 转换后投影到当前地图 zone） */
  let restrictedAreaRecords = [];
  /** 当前正在绘制或刚闭合的禁行区。点位始终保存为 GCJ02。 */
  let restrictSession = null;
  let restrictIdSeed = 1;
  let lastRestrictPick = { t: 0, x: 0, y: 0 };

  btnImport.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", onFileSelected);
  if (btnImportStops && stopFileInput) {
    btnImportStops.addEventListener("click", () => {
      if (!requireMapForTool()) return;
      stopFileInput.click();
    });
    stopFileInput.addEventListener("change", onStopFileSelected);
  }
  if (btnStopsFit) btnStopsFit.addEventListener("click", locateAllStops);
  if (btnStopsClear) btnStopsClear.addEventListener("click", () => clearStops(false));
  if (btnImportRestrictedAreas && restrictedAreaFileInput) {
    btnImportRestrictedAreas.addEventListener("click", () => {
      if (!requireMapForTool()) return;
      restrictedAreaFileInput.click();
    });
    restrictedAreaFileInput.addEventListener("change", onRestrictedAreaFileSelected);
  }
  if (stopsFilter) {
    stopsFilter.addEventListener("input", () => renderStopsPanel());
  }
  if (stopsList) stopsList.addEventListener("click", onStopsListClick);
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
  if (btnMainTabElement) {
    btnMainTabElement.addEventListener("click", () => setActiveSidebarPanel(SIDEBAR_PANELS.element));
  }
  if (btnJunctionDrawAll) {
    btnJunctionDrawAll.addEventListener("click", toggleDrawAllJunctions);
  }
  if (btnJunctionHighlight) {
    btnJunctionHighlight.addEventListener("click", toggleHighlightJunction);
  }
  if (btnElementDrawAll) {
    btnElementDrawAll.addEventListener("click", toggleDrawAllElements);
  }
  if (btnElementHighlight) {
    btnElementHighlight.addEventListener("click", toggleHighlightElement);
  }
  if (elementSearch) {
    elementSearch.addEventListener("keydown", (e) => {
      if (e.key === "Enter") searchAndSelectElement(elementSearch.value.trim());
    });
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
  if (btnToolRestrict) btnToolRestrict.addEventListener("click", () => toggleTool(TOOL_MODES.restrict));
  btnToolPick.addEventListener("click", () => toggleTool(TOOL_MODES.pick));
  if (btnToolOps) btnToolOps.addEventListener("click", () => toggleTool(TOOL_MODES.ops));
  btnDrawPoint.addEventListener("click", drawPointFromInputs);
  btnDrawBox.addEventListener("click", drawBoxFromInputs);
  if (btnDrawOps) btnDrawOps.addEventListener("click", drawOpsBufferFromInputs);
  if (btnClearOps) btnClearOps.addEventListener("click", () => clearOpsBuffer(false));
  if (btnPointCrsWgs84) {
    btnPointCrsWgs84.addEventListener("click", () => setPointInputCrs(POINT_CRS.wgs84));
  }
  if (btnPointCrsGcj02) {
    btnPointCrsGcj02.addEventListener("click", () => setPointInputCrs(POINT_CRS.gcj02));
  }
  if (btnBoxCrsWgs84) {
    btnBoxCrsWgs84.addEventListener("click", () => setBoxInputCrs(POINT_CRS.wgs84));
  }
  if (btnBoxCrsGcj02) {
    btnBoxCrsGcj02.addEventListener("click", () => setBoxInputCrs(POINT_CRS.gcj02));
  }
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
  if (btnBasemapVector)
    btnBasemapVector.addEventListener("click", () => setBaseMapMode(BASEMAP_MODES.vector));
  if (btnBasemapSatellite)
    btnBasemapSatellite.addEventListener("click", () => setBaseMapMode(BASEMAP_MODES.satellite));
  if (btnBasemapSrcAmap)
    btnBasemapSrcAmap.addEventListener("click", () => setBaseMapProvider(BASEMAP_PROVIDERS.amap));
  if (btnBasemapSrcGoogle)
    btnBasemapSrcGoogle.addEventListener("click", () => setBaseMapProvider(BASEMAP_PROVIDERS.google));
  if (btnLaneFade)
    btnLaneFade.addEventListener("click", () => setLaneRenderMode(LANE_RENDER_MODES.fade));
  if (btnLaneColor)
    btnLaneColor.addEventListener("click", () => setLaneRenderMode(LANE_RENDER_MODES.color));
  if (btnRestrictStart) btnRestrictStart.addEventListener("click", startRestrictDraw);
  if (btnRestrictEnd) btnRestrictEnd.addEventListener("click", endRestrictDraw);
  if (btnRestrictUndo) btnRestrictUndo.addEventListener("click", undoRestrictPoint);
  if (btnRestrictClear) btnRestrictClear.addEventListener("click", clearCurrentRestrict);
  if (btnRestrictAddPoint) btnRestrictAddPoint.addEventListener("click", addRestrictPointFromInputs);
  if (btnRestrictCopy) btnRestrictCopy.addEventListener("click", copyCurrentRestrictJson);
  if (btnRestrictDownload) btnRestrictDownload.addEventListener("click", downloadCurrentRestrictJson);
  if (restrictPointList) {
    restrictPointList.addEventListener("change", onRestrictPointCommitDisplay);
    restrictPointList.addEventListener("click", onRestrictPointListClick);
  }
  [restrictAreaName, restrictAreaId, restrictCityCode, restrictRegionPath, restrictTypeInput, restrictStatusInput, restrictTimeModeInput, restrictUpdatedAt, restrictRemark].forEach((input) => {
    if (input) input.addEventListener("input", onRestrictMetaInput);
  });
  if (restrictAddLon) restrictAddLon.addEventListener("keydown", onRestrictAddKeydown);
  if (restrictAddLat) restrictAddLat.addEventListener("keydown", onRestrictAddKeydown);
  renderRestrictPointList();
  updateRestrictButtons();

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
    const isRestrict = activeTool === TOOL_MODES.restrict;
    const isPick = activeTool === TOOL_MODES.pick;
    const isOps = activeTool === TOOL_MODES.ops;
    btnToolPoint.classList.toggle("active", isPoint);
    btnToolBox.classList.toggle("active", isBox);
    if (btnToolRestrict) btnToolRestrict.classList.toggle("active", isRestrict);
    btnToolPick.classList.toggle("active", isPick);
    if (btnToolOps) btnToolOps.classList.toggle("active", isOps);
    if (toolPanel) {
      toolPanel.classList.toggle("is-open", !!activeTool);
      toolPanel.classList.toggle("is-wide", isRestrict);
    }
    if (toolPanelPoint) toolPanelPoint.classList.toggle("is-active", isPoint);
    if (toolPanelBox) toolPanelBox.classList.toggle("is-active", isBox);
    if (toolPanelRestrict) toolPanelRestrict.classList.toggle("is-active", isRestrict);
    if (toolPanelPick) toolPanelPick.classList.toggle("is-active", isPick);
    if (toolPanelOps) toolPanelOps.classList.toggle("is-active", isOps);
    mapContainer.classList.toggle("tool-pick-mode", isPick);
    mapContainer.classList.toggle("tool-restrict-draw", isRestrictDrawing());
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

  function resolveLonLatToUtm(lon, lat, coordKind) {
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
      coordKind,
      lon,
      lat,
      zone,
    };
  }

  function resolveToolInputToUtm(rawX, rawY, inputCrs) {
    if (typeof CoordTransform === "undefined") {
      throw new Error("未加载 coord_transform.js");
    }

    const crs = inputCrs || POINT_CRS.wgs84;
    if (crs === POINT_CRS.gcj02) {
      if (!CoordTransform.gcj02ToWgs84) {
        throw new Error("缺少 CoordTransform.gcj02ToWgs84，请强制刷新页面清除缓存");
      }
      const wgs = CoordTransform.gcj02ToWgs84(rawX, rawY);
      return resolveLonLatToUtm(wgs.lng, wgs.lat, POINT_CRS.gcj02);
    }

    if (CoordTransform.isUtmToolInput(rawX, rawY)) {
      return { x: rawX, y: rawY, coordKind: "utm" };
    }

    return resolveLonLatToUtm(rawX, rawY, POINT_CRS.wgs84);
  }

  function syncToolInputCrsUi(crs, ui) {
    if (crs !== POINT_CRS.wgs84 && crs !== POINT_CRS.gcj02) return false;
    const isGcj = crs === POINT_CRS.gcj02;
    if (ui.btnWgs84) ui.btnWgs84.classList.toggle("active", !isGcj);
    if (ui.btnGcj02) ui.btnGcj02.classList.toggle("active", isGcj);
    if (ui.xLabel) ui.xLabel.textContent = isGcj ? "X（GCJ02）" : "X（WGS84）";
    if (ui.yLabel) ui.yLabel.textContent = isGcj ? "Y（GCJ02）" : "Y（WGS84）";
    if (ui.xInput) ui.xInput.placeholder = isGcj ? ui.gcjXPlaceholder : ui.wgsXPlaceholder;
    if (ui.yInput) ui.yInput.placeholder = isGcj ? ui.gcjYPlaceholder : ui.wgsYPlaceholder;
    if (ui.hint) ui.hint.textContent = isGcj ? ui.gcjHint : ui.wgsHint;
    return true;
  }

  function setPointInputCrs(crs) {
    if (
      !syncToolInputCrsUi(crs, {
        btnWgs84: btnPointCrsWgs84,
        btnGcj02: btnPointCrsGcj02,
        xLabel: toolPointXLabel,
        yLabel: toolPointYLabel,
        xInput: toolPointX,
        yInput: toolPointY,
        hint: toolPointHint,
        wgsXPlaceholder: "UTM 东向 或 经度",
        wgsYPlaceholder: "UTM 北向 或 纬度",
        gcjXPlaceholder: "经度",
        gcjYPlaceholder: "纬度",
        wgsHint:
          "X、Y 均大于 100 视为 UTM；否则视为 WGS84（X=经度，Y=纬度），按地图 header.proj 的 zone 转换",
        gcjHint:
          "输入 GCJ02 经纬度（X=经度，Y=纬度），将先转为 WGS84 再按地图 header.proj 的 zone 转换到 UTM",
      })
    ) {
      return;
    }
    pointInputCrs = crs;
  }

  function setBoxInputCrs(crs) {
    if (
      !syncToolInputCrsUi(crs, {
        btnWgs84: btnBoxCrsWgs84,
        btnGcj02: btnBoxCrsGcj02,
        xLabel: toolBoxXLabel,
        yLabel: toolBoxYLabel,
        xInput: toolBoxX,
        yInput: toolBoxY,
        hint: toolBoxHint,
        wgsXPlaceholder: "后轴 UTM 东向 或 经度",
        wgsYPlaceholder: "后轴 UTM 北向 或 纬度",
        gcjXPlaceholder: "后轴经度",
        gcjYPlaceholder: "后轴纬度",
        wgsHint:
          "参考点为后轴中心，沿航向前/后轴距离画框；X、Y 均大于 100 视为 UTM；否则视为 WGS84（X=经度，Y=纬度）",
        gcjHint:
          "参考点为后轴中心；输入 GCJ02 经纬度（X=经度，Y=纬度），将先转为 WGS84 再按地图 zone 转换到 UTM",
      })
    ) {
      return;
    }
    boxInputCrs = crs;
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

  function utmToGcj02ForDisplay(utmX, utmY) {
    const wgs = utmToWgs84ForDisplay(utmX, utmY);
    if (!wgs || typeof CoordTransform === "undefined" || !CoordTransform.wgs84ToGcj02) {
      return null;
    }
    try {
      return CoordTransform.wgs84ToGcj02(wgs.lon, wgs.lat);
    } catch (_) {
      return null;
    }
  }

  function formatAnnotationListName(record) {
    const gcj = utmToGcj02ForDisplay(record.x, record.y);
    if (!gcj) return record.label;
    return `${record.label} <span class="tool-record-coord-inline">(${gcj.lng.toFixed(6)}, ${gcj.lat.toFixed(6)})</span>`;
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
    if (resolved.coordKind === POINT_CRS.wgs84 || resolved.coordKind === POINT_CRS.gcj02) {
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
        <div class="tool-record-name">${formatAnnotationListName(record)}</div>
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
        <div class="tool-record-name">${formatAnnotationListName(record)}</div>
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
        <div class="tool-record-name">${formatAnnotationListName(record)}</div>
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
      const resolved = resolveToolInputToUtm(rawX, rawY, pointInputCrs);
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
      const resolved = resolveToolInputToUtm(rawX, rawY, boxInputCrs);
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
    clearOpsBuffer(true);
    selectedPickIds.length = 0;
    annotationSeq = 0;
    setToolPickResultText("暂无记录");
  }

  function clearOpsBuffer(silent) {
    if (opsBufferLayer) opsBufferLayer.innerHTML = "";
    if (!silent) setStatus("已清除运营外扩圈");
  }

  function ringToSvgPoints(ring) {
    const ox = mapOrigin.x;
    const oy = mapOrigin.y;
    const parts = [];
    for (const p of ring) {
      parts.push(`${p[0] - ox},${p[1] - oy}`);
    }
    return parts.join(" ");
  }

  function drawOpsBufferFromInputs() {
    if (!requireMapForTool()) return;
    if (!window.OpsBuffer || typeof window.OpsBuffer.buildOpsBufferRings !== "function") {
      setStatus("运营外扩模块未加载");
      return;
    }
    let distance;
    try {
      distance = parseToolNumber(toolOpsDistance, "距离");
    } catch (err) {
      setStatus(err.message || "请填写有效距离");
      return;
    }
    if (!(distance > 0)) {
      setStatus("距离必须大于 0");
      return;
    }

    setStatus("正在计算运营外扩圈…");
    requestAnimationFrame(() => {
      try {
        const rings = window.OpsBuffer.buildOpsBufferRings(mapData.lanes || [], distance);
        if (!opsBufferLayer) {
          setStatus("运营图层不可用");
          return;
        }
        opsBufferLayer.innerHTML = "";
        if (!rings.length) {
          setStatus("未能生成外扩圈");
          return;
        }
        const frag = document.createDocumentFragment();
        for (const ring of rings) {
          if (!ring || ring.length < 2) continue;
          const pl = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
          pl.setAttribute("points", ringToSvgPoints(ring));
          pl.classList.add("ops-buffer-ring");
          frag.appendChild(pl);
        }
        opsBufferLayer.appendChild(frag);
        setStatus(`已绘制运营外扩圈（${distance} m）`);
      } catch (err) {
        setStatus(err.message || "绘制运营外扩圈失败");
      }
    });
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
    syncStopMarkerTransforms();
    syncRestrictVertexScale();
    scheduleBaseMapRedraw();
  }

  // ==================== 底图（高德瓦片 / Esri 卫星），自绘、无需 Key ====================

  /** 经纬度 → Web 墨卡托像素坐标（给定缩放级别 z，瓦片 256px） */
  function lngLatToMercatorPixel(lng, lat, z) {
    const n = Math.pow(2, z);
    const x = ((lng + 180) / 360) * n * TILE_SIZE;
    const clampedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
    const latRad = (clampedLat * Math.PI) / 180;
    const y =
      ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n * TILE_SIZE;
    return { x, y };
  }

  /** UTM → 底图所用经纬度（高德瓦片需 GCJ02，卫星用 WGS84） */
  let warnedMissingGcj = false;
  function utmToBasemapLngLat(utmX, utmY, useGcj) {
    const wgs = utmToWgs84ForDisplay(utmX, utmY);
    if (!wgs) return null;
    if (useGcj) {
      if (typeof CoordTransform !== "undefined" && CoordTransform.wgs84ToGcj02) {
        return CoordTransform.wgs84ToGcj02(wgs.lon, wgs.lat);
      }
      if (!warnedMissingGcj) {
        warnedMissingGcj = true;
        console.warn(
          "缺少 CoordTransform.wgs84ToGcj02，高德底图将按 WGS84 定位并产生偏移。请强制刷新页面清除 coord_transform.js 缓存。"
        );
        setStatus("高德底图偏移：coord_transform.js 为旧缓存，请强制刷新(Ctrl+F5)");
      }
    }
    return { lng: wgs.lon, lat: wgs.lat };
  }

  function ensureBasemapCanvas() {
    if (basemapCanvas) return;
    basemapCanvas = document.createElement("canvas");
    basemapCanvas.id = "basemap-canvas";
    basemapCanvas.style.width = "100%";
    basemapCanvas.style.height = "100%";
    basemapCanvas.style.display = "block";
    basemapContainer.appendChild(basemapCanvas);
    basemapCtx = basemapCanvas.getContext("2d");
  }

  function tileUrl(source, x, y, z) {
    const urls = source.urls;
    const tmpl = urls[(x + y) % urls.length];
    return tmpl.replace("{x}", x).replace("{y}", y).replace("{z}", z);
  }

  function getTileImage(source, x, y, z) {
    const url = tileUrl(source, x, y, z);
    let img = tileImageCache.get(url);
    if (img) return img;
    img = new Image();
    img._loaded = false;
    img.onload = () => {
      img._loaded = true;
      if (source === getActiveBasemapSource()) {
        basemapStat.ok += 1;
        updateBasemapAttribution();
      }
      scheduleBaseMapRedraw();
    };
    img.onerror = () => {
      img._error = true;
      if (source === getActiveBasemapSource()) {
        basemapStat.err += 1;
        updateBasemapAttribution();
      }
    };
    img.src = url;
    tileImageCache.set(url, img);
    return img;
  }

  /** 仅从缓存取已加载的瓦片，不发起新请求（用于父级回退填充） */
  function getCachedLoadedTile(source, x, y, z) {
    const img = tileImageCache.get(tileUrl(source, x, y, z));
    return img && img._loaded ? img : null;
  }

  function setBaseMapMode(mode) {
    if (basemapMode === mode) mode = BASEMAP_MODES.none;

    if (mode === BASEMAP_MODES.none) {
      basemapMode = BASEMAP_MODES.none;
      if (basemapContainer) basemapContainer.classList.remove("is-active");
      if (basemapCtx && basemapCanvas) {
        basemapCtx.setTransform(1, 0, 0, 1, 0, 0);
        basemapCtx.clearRect(0, 0, basemapCanvas.width, basemapCanvas.height);
      }
      syncBaseMapButtons();
      updateBasemapAttribution();
      return;
    }

    if (!mapData) {
      setStatus("请先导入地图，再叠加底图");
      return;
    }
    if (!getMapUtmContext()) {
      setStatus("地图缺少 UTM 带号，无法叠加底图");
      return;
    }

    ensureBasemapCanvas();
    basemapMode = mode;
    basemapStat.ok = 0;
    basemapStat.err = 0;
    basemapContainer.classList.add("is-active");
    syncBaseMapButtons();
    updateBasemapAttribution();
    redrawBaseMap();
  }

  /** 切换数据源（高德 / 谷歌）。若已叠加底图则立即重绘 */
  function setBaseMapProvider(provider) {
    if (!BASEMAP_PROVIDERS[provider] || basemapProvider === provider) return;
    basemapProvider = provider;
    basemapStat.ok = 0;
    basemapStat.err = 0;
    syncBaseMapButtons();
    if (basemapMode !== BASEMAP_MODES.none) {
      updateBasemapAttribution();
      redrawBaseMap();
    }
  }

  /** 更新底图来源角标：显示当前来源名，并反映加载状态（加载中/正常/失败） */
  function updateBasemapAttribution() {
    if (!basemapAttribution) return;
    if (basemapMode === BASEMAP_MODES.none) {
      basemapAttribution.classList.add("is-hidden");
      basemapAttribution.classList.remove("is-error");
      return;
    }
    const source = getActiveBasemapSource();
    const name = (source && source.label) || basemapMode;
    let statusText = "";
    let isError = false;
    if (basemapStat.ok > 0) {
      statusText = "";
    } else if (basemapStat.err > 0) {
      statusText = "（加载失败，可能被墙）";
      isError = true;
    } else {
      statusText = "（加载中…）";
    }
    basemapAttribution.textContent = "底图：" + name + statusText;
    basemapAttribution.classList.remove("is-hidden");
    basemapAttribution.classList.toggle("is-error", isError);
  }

  function syncBaseMapButtons() {
    if (btnBasemapVector) {
      btnBasemapVector.classList.toggle("active", basemapMode === BASEMAP_MODES.vector);
    }
    if (btnBasemapSatellite) {
      btnBasemapSatellite.classList.toggle("active", basemapMode === BASEMAP_MODES.satellite);
    }
    if (btnBasemapSrcAmap) {
      btnBasemapSrcAmap.classList.toggle("active", basemapProvider === BASEMAP_PROVIDERS.amap);
    }
    if (btnBasemapSrcGoogle) {
      btnBasemapSrcGoogle.classList.toggle("active", basemapProvider === BASEMAP_PROVIDERS.google);
    }
  }

  /** 用地图 bounds（UTM）更新范围框（转为 SVG 局部坐标，减去 mapOrigin） */
  function updateMapBoundsOutline(bounds) {
    if (!mapBoundsOutline || !bounds) return;
    const x = bounds.min_x - mapOrigin.x;
    const y = bounds.min_y - mapOrigin.y;
    const w = bounds.max_x - bounds.min_x;
    const h = bounds.max_y - bounds.min_y;
    mapBoundsOutline.setAttribute("x", String(x));
    mapBoundsOutline.setAttribute("y", String(y));
    mapBoundsOutline.setAttribute("width", String(Math.max(0, w)));
    mapBoundsOutline.setAttribute("height", String(Math.max(0, h)));
  }

  /** 切换车道渲染样式：虚化 / 着色，再次点击同一模式恢复默认 */
  function setLaneRenderMode(mode) {
    laneRenderMode = laneRenderMode === mode ? LANE_RENDER_MODES.normal : mode;
    if (mapSvg) {
      mapSvg.classList.toggle("lane-fade", laneRenderMode === LANE_RENDER_MODES.fade);
      mapSvg.classList.toggle("lane-color", laneRenderMode === LANE_RENDER_MODES.color);
    }
    if (btnLaneFade) {
      btnLaneFade.classList.toggle("active", laneRenderMode === LANE_RENDER_MODES.fade);
    }
    if (btnLaneColor) {
      btnLaneColor.classList.toggle("active", laneRenderMode === LANE_RENDER_MODES.color);
    }
    if (laneColorLegend) {
      laneColorLegend.classList.toggle("is-hidden", laneRenderMode !== LANE_RENDER_MODES.color);
    }
  }

  function scheduleBaseMapRedraw() {
    if (basemapMode === BASEMAP_MODES.none) return;
    if (basemapRedrawScheduled) return;
    basemapRedrawScheduled = true;
    requestAnimationFrame(() => {
      basemapRedrawScheduled = false;
      redrawBaseMap();
    });
  }

  /**
   * 将当前视图对应的底图瓦片绘制到 canvas。
   * 通过 3 个参考点（UTM→屏幕、UTM→墨卡托像素）拟合仿射变换，
   * 自动吻合平移/缩放/旋转，以及 GCJ02 与 UTM 的局部差异。
   */
  function redrawBaseMap() {
    if (basemapMode === BASEMAP_MODES.none || !basemapCtx) return;
    if (!Number.isFinite(view.scale) || view.scale <= 0) return;
    const source = getActiveBasemapSource();
    if (!source) return;

    const rect = mapContainer.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    const dpr = window.devicePixelRatio || 1;
    if (basemapCanvas.width !== w * dpr || basemapCanvas.height !== h * dpr) {
      basemapCanvas.width = w * dpr;
      basemapCanvas.height = h * dpr;
    }

    // 选取缩放级别：让 1 瓦片像素 ≈ 1 设备物理像素（考虑 devicePixelRatio），
    // 这样瓦片主要是等比或轻微降采样，最清晰
    const centerUtm = screenToMap(w / 2, h / 2);
    const centerLngLat = utmToBasemapLngLat(centerUtm.x, centerUtm.y, source.gcj);
    if (!centerLngLat) return;
    const latRad = (centerLngLat.lat * Math.PI) / 180;
    const rawZoom =
      Math.log2(156543.03392804097 * Math.cos(latRad) * view.scale) + Math.log2(dpr);
    // 略微上偏，优先降采样（比放大更清晰），保证文字锐利
    const z = Math.max(3, Math.min(source.maxZoom, Math.round(rawZoom + 0.35)));

    // 三个参考点取自屏幕视口（中心 + 右 + 下，跨度为视口的 1/4），
    // 使仿射在整个可见区域内吻合，避免大范围缩放时边缘漂移
    const cx = w / 2;
    const cy = h / 2;
    const spanX = Math.max(80, w / 4);
    const spanY = Math.max(80, h / 4);
    const screenPts = [
      { x: cx, y: cy },
      { x: cx + spanX, y: cy },
      { x: cx, y: cy + spanY },
    ];
    const mercPts = [];
    for (const s of screenPts) {
      const utm = screenToMap(s.x, s.y);
      const ll = utmToBasemapLngLat(utm.x, utm.y, source.gcj);
      if (!ll) return;
      mercPts.push(lngLatToMercatorPixel(ll.lng, ll.lat, z));
    }

    // 由三点求仿射：screen = M * merc + t（列向量法）
    const dm1x = mercPts[1].x - mercPts[0].x;
    const dm1y = mercPts[1].y - mercPts[0].y;
    const dm2x = mercPts[2].x - mercPts[0].x;
    const dm2y = mercPts[2].y - mercPts[0].y;
    const ds1x = screenPts[1].x - screenPts[0].x;
    const ds1y = screenPts[1].y - screenPts[0].y;
    const ds2x = screenPts[2].x - screenPts[0].x;
    const ds2y = screenPts[2].y - screenPts[0].y;
    const det = dm1x * dm2y - dm2x * dm1y;
    if (!det) return;

    // canvas setTransform(a,b,c,d,e,f): sx = a*mx + c*my + e, sy = b*mx + d*my + f
    const a = (ds1x * dm2y - ds2x * dm1y) / det;
    const c = (-ds1x * dm2x + ds2x * dm1x) / det;
    const b = (ds1y * dm2y - ds2y * dm1y) / det;
    const dd = (-ds1y * dm2x + ds2y * dm1x) / det;
    const e = screenPts[0].x - (a * mercPts[0].x + c * mercPts[0].y);
    const f = screenPts[0].y - (b * mercPts[0].x + dd * mercPts[0].y);

    // 反变换：屏幕四角 → 墨卡托像素，求可见瓦片范围
    const invDet = a * dd - b * c;
    if (!invDet) return;
    const screenToMerc = (sx, sy) => ({
      x: (dd * (sx - e) - c * (sy - f)) / invDet,
      y: (-b * (sx - e) + a * (sy - f)) / invDet,
    });
    const corners = [screenToMerc(0, 0), screenToMerc(w, 0), screenToMerc(0, h), screenToMerc(w, h)];
    let minMx = Infinity;
    let minMy = Infinity;
    let maxMx = -Infinity;
    let maxMy = -Infinity;
    for (const cpt of corners) {
      if (cpt.x < minMx) minMx = cpt.x;
      if (cpt.y < minMy) minMy = cpt.y;
      if (cpt.x > maxMx) maxMx = cpt.x;
      if (cpt.y > maxMy) maxMy = cpt.y;
    }
    const nTiles = Math.pow(2, z);
    const minTx = Math.floor(minMx / TILE_SIZE);
    const maxTx = Math.floor(maxMx / TILE_SIZE);
    const minTy = Math.floor(minMy / TILE_SIZE);
    const maxTy = Math.floor(maxMy / TILE_SIZE);

    // 设备像素级仿射系数：screen(设备) = A*mx + C*my + E, sy = B*mx + D*my + F
    const A = a * dpr;
    const B = b * dpr;
    const C = c * dpr;
    const D = dd * dpr;
    const E = e * dpr;
    const F = f * dpr;

    /** 找到可用于回退填充的父级瓦片（返回 {img, factor, px, py} 或 null） */
    const findParent = (wrappedX, ty) => {
      for (let k = 1; k <= 6; k++) {
        const pz = z - k;
        if (pz < 3) return null;
        const factor = Math.pow(2, k);
        const px = Math.floor(wrappedX / factor);
        const py = Math.floor(ty / factor);
        const parent = getCachedLoadedTile(source, px, py, pz);
        if (parent) return { img: parent, factor, px, py };
      }
      return null;
    };

    // 因子午线收敛，墨卡托→屏幕通常带有轻微旋转，逐块绘制的矩形边缘会抗锯齿露底形成缝。
    // 解决：先把所有瓦片按整数位置无缝拼到离屏画布（墨卡托像素空间），再整张仿射贴到主画布，
    // 内部接缝彻底消失（只有整块外边缘有一圈抗锯齿）。
    const nTx = maxTx - minTx + 1;
    const nTy = maxTy - minTy + 1;
    if (nTx <= 0 || nTy <= 0 || nTx * nTy > 900) return;
    const originX = minTx * TILE_SIZE;
    const originY = minTy * TILE_SIZE;
    const offW = nTx * TILE_SIZE;
    const offH = nTy * TILE_SIZE;

    if (!basemapOffCanvas) basemapOffCanvas = document.createElement("canvas");
    if (basemapOffCanvas.width !== offW) basemapOffCanvas.width = offW;
    if (basemapOffCanvas.height !== offH) basemapOffCanvas.height = offH;
    const offctx = basemapOffCanvas.getContext("2d");
    offctx.setTransform(1, 0, 0, 1, 0, 0);
    offctx.clearRect(0, 0, offW, offH);
    offctx.imageSmoothingEnabled = true;
    offctx.imageSmoothingQuality = "high";

    for (let tx = minTx; tx <= maxTx; tx++) {
      for (let ty = minTy; ty <= maxTy; ty++) {
        if (ty < 0 || ty >= nTiles) continue;
        const wrappedX = ((tx % nTiles) + nTiles) % nTiles;
        const dx = tx * TILE_SIZE - originX;
        const dy = ty * TILE_SIZE - originY;
        const img = getTileImage(source, wrappedX, ty, z);
        if (img && img._loaded) {
          offctx.drawImage(img, dx, dy, TILE_SIZE, TILE_SIZE);
        } else {
          const p = findParent(wrappedX, ty);
          if (p) {
            const sub = TILE_SIZE / p.factor;
            const sxp = (wrappedX - p.px * p.factor) * sub;
            const syp = (ty - p.py * p.factor) * sub;
            offctx.drawImage(p.img, sxp, syp, sub, sub, dx, dy, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // 将整张离屏拼图用仿射变换一次性贴到主画布（墨卡托像素 → 设备像素）
    basemapCtx.setTransform(1, 0, 0, 1, 0, 0);
    basemapCtx.clearRect(0, 0, basemapCanvas.width, basemapCanvas.height);
    basemapCtx.imageSmoothingEnabled = true;
    basemapCtx.imageSmoothingQuality = "high";
    basemapCtx.setTransform(A, B, C, D, E, F);
    basemapCtx.drawImage(basemapOffCanvas, 0, 0, offW, offH, originX, originY, offW, offH);
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
    if (!mapData || isPanning || isRestrictDrawing()) return;
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
      } else if (pointerDown && isRestrictDrawing() && mapData && !isMapChromeTarget(e.target)) {
        addRestrictPointFromClient(pointerDown.x, pointerDown.y);
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
      if (lane.type) poly.dataset.laneType = lane.type;
      return poly;
    }
    if (lane.central_segments && lane.central_segments.length > 0) {
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.classList.add("lane-shape", "central-only");
      g.dataset.laneId = lane.id;
      if (lane.type) g.dataset.laneType = lane.type;
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
    showAllElements = false;
    if (btnElementDrawAll) btnElementDrawAll.classList.remove("active");
    clearElementSelection();
    applyElementVisibility();
    setStatus(`已隐藏全部 ${hiddenLaneIds.size} 条车道及所有路口/元素 Polygon`);
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
    if (elementsLayer) elementsLayer.innerHTML = "";
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
    elementByKey.clear();
    elementElements.clear();
    elementLabelElements.clear();
    selectedElementKey = null;
    showAllElements = false;
    if (btnElementDrawAll) btnElementDrawAll.classList.remove("active");
    if (btnElementHighlight) btnElementHighlight.classList.remove("active");
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

    if (elementsLayer) {
      const elementFrag = document.createDocumentFragment();
      const elementSources = [
        { kind: "crosswalk", list: data.crosswalks || [] },
        { kind: "object", list: data.objects || [] },
        { kind: "traffic_island", list: data.traffic_islands || [] },
        { kind: "signal", list: data.signals || [] },
      ];
      for (const { kind, list } of elementSources) {
        for (const item of list) {
          const key = elementKeyOf(kind, item.id);
          elementByKey.set(key, { ...item, kind });
          const el = createElementShape(kind, item.id, item.polygon);
          if (el) {
            elementFrag.appendChild(el);
            elementElements.set(key, el);
          }
          const labelEl = createElementLabel(kind, item.id, item.polygon);
          if (labelEl) {
            elementFrag.appendChild(labelEl);
            elementLabelElements.set(key, labelEl);
          }
        }
      }
      elementsLayer.appendChild(elementFrag);
    }

    fitViewToBounds(data.meta.bounds);
    updateMapBoundsOutline(data.meta.bounds);
    emptyHint.style.display = "none";
    btnResetView.disabled = false;
    laneSearch.disabled = false;
    if (junctionSearch) junctionSearch.disabled = false;
    if (elementSearch) elementSearch.disabled = false;
    btnClearAll.disabled = false;
    btnHideAll.disabled = false;
    btnShowAll.disabled = false;
    if (btnBasemapVector) btnBasemapVector.disabled = false;
    if (btnBasemapSatellite) btnBasemapSatellite.disabled = false;
    if (btnBasemapSrcAmap) btnBasemapSrcAmap.disabled = false;
    if (btnBasemapSrcGoogle) btnBasemapSrcGoogle.disabled = false;
    syncBaseMapButtons();
    renderActiveLaneInfo();
    renderActiveJunctionInfo();
    renderActiveElementInfo();
    syncLaneTabButtons();
    if (btnImportStops) btnImportStops.disabled = false;
    if (btnImportRestrictedAreas) btnImportRestrictedAreas.disabled = false;
    redrawRestrictedAreas();
    redrawStops();
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

  function formatOverlapRange(detail) {
    if (!detail) return "";
    const start = detail.start_s;
    const end = detail.end_s;
    if (start == null && end == null) return "";
    const startText = start != null && Number.isFinite(start) ? start.toFixed(2) : "?";
    const endText = end != null && Number.isFinite(end) ? end.toFixed(2) : "?";
    return `${startText} ~ ${endText}`;
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
      let text = id;
      if (detail && detail.signals && detail.signals.length) {
        const signal = detail.signals[0];
        const signalName = simplifySignalLikeId(signal.id || id);
        const oneType = signal.subsignal_types && signal.subsignal_types.length
          ? signal.subsignal_types[0].type
          : "UNKNOWN";
        text = `${signalName}（${oneType}）`;
      }
      const rangeText = formatOverlapRange(detail);
      return rangeText ? `${text} [${rangeText}]` : text;
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
    const isJunction = panelKey === SIDEBAR_PANELS.junction;
    const isElement = panelKey === SIDEBAR_PANELS.element;
    if (btnMainTabLane) btnMainTabLane.classList.toggle("active", isLane);
    if (btnMainTabJunction) btnMainTabJunction.classList.toggle("active", isJunction);
    if (btnMainTabElement) btnMainTabElement.classList.toggle("active", isElement);
    if (lanePanel) lanePanel.classList.toggle("is-hidden", !isLane);
    if (junctionPanel) junctionPanel.classList.toggle("is-hidden", !isJunction);
    if (elementPanel) elementPanel.classList.toggle("is-hidden", !isElement);
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

  function elementKeyOf(kind, id) {
    return `${kind}:${id}`;
  }

  function createElementShape(kind, id, polygon) {
    if (!polygon || polygon.length < 6) return null;
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", flatToSvgPoints(polygon));
    poly.classList.add("element-shape", `element-${kind}`, "element-hidden");
    poly.dataset.elementKey = elementKeyOf(kind, id);
    return poly;
  }

  function elementCentroidLocal(polygon) {
    if (!polygon || polygon.length < 2) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < polygon.length; i += 2) {
      const x = polygon[i];
      const y = polygon[i + 1];
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

  function createElementLabel(kind, id, polygon) {
    const c = elementCentroidLocal(polygon);
    if (!c) return null;
    const key = elementKeyOf(kind, id);
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "central");
    label.setAttribute("transform", `translate(${c.x}, ${c.y}) scale(1, -1)`);
    label.classList.add("element-label", `element-label-${kind}`, "element-hidden");
    label.dataset.elementKey = key;
    label.textContent = id;
    label.addEventListener("mousedown", (e) => e.stopPropagation());
    label.addEventListener("click", (e) => {
      e.stopPropagation();
      selectElement(key);
    });
    return label;
  }

  function applyElementVisibility() {
    for (const [key, el] of elementElements) {
      const visible = showAllElements || key === selectedElementKey;
      el.classList.toggle("element-hidden", !visible);
    }
    for (const [key, el] of elementLabelElements) {
      const visible = showAllElements || key === selectedElementKey;
      el.classList.toggle("element-hidden", !visible);
    }
  }

  function toggleDrawAllElements() {
    if (!elementByKey.size) {
      setStatus("请先导入地图");
      return;
    }
    showAllElements = !showAllElements;
    if (btnElementDrawAll) btnElementDrawAll.classList.toggle("active", showAllElements);
    applyElementVisibility();
    setStatus(
      showAllElements
        ? `已绘制全部 ${elementElements.size} 个元素 Polygon`
        : "已隐藏全部元素 Polygon"
    );
  }

  function formatElementInfo(element) {
    const points = [];
    if (element.polygon && element.polygon.length >= 2) {
      for (let i = 0; i + 1 < element.polygon.length; i += 2) {
        points.push({ x: element.polygon[i], y: element.polygon[i + 1] });
      }
    }
    const lines = [
      `元素信息`,
      `元素类别: ${ELEMENT_KIND_NAMES[element.kind] || element.kind}`,
      `元素 ID: ${element.id}`,
    ];

    // 每个 repeated 列表逐项换行展示，避免拥挤在一行
    const pushList = (title, items, formatItem) => {
      const list = items || [];
      lines.push(`${title} (${list.length}):`);
      if (!list.length) {
        lines.push("  —");
      } else {
        list.forEach((item, idx) => {
          lines.push(`  ${idx + 1}. ${formatItem(item)}`);
        });
      }
    };

    if (element.kind === "object") {
      lines.push(`对象类型: ${element.type} (${element.type_code})`);
      if (element.subtype != null) {
        lines.push(`路面标志子类型: ${element.subtype} (${element.subtype_code})`);
      }
    }

    if (element.kind === "signal") {
      lines.push(`信号灯类型: ${element.type} (${element.type_code})`);
      pushList("子信号灯", element.subsignals, (s) =>
        `${s.id ? s.id + " · " : ""}${s.type} (${s.type_code})`
      );
      if (element.sign_infos && element.sign_infos.length) {
        pushList("标志信息", element.sign_infos, (si) => `${si.type} (${si.type_code})`);
      }
      if (element.relative_signal_ids && element.relative_signal_ids.length) {
        pushList("关联信号灯", element.relative_signal_ids, (id) => id);
      }
      lines.push(`停止线数量: ${element.stop_line_count || 0}`);
    }

    if (element.overlap_ids && element.overlap_ids.length) {
      pushList("Overlap IDs", element.overlap_ids, (id) => id);
    }

    pushList("Polygon 点集", points, (pt) => `${pt.x.toFixed(3)}, ${pt.y.toFixed(3)}`);
    return lines.join("\n");
  }

  function renderActiveElementInfo() {
    if (!elementInfo) return;
    if (!selectedElementKey || !elementByKey.has(selectedElementKey)) {
      elementInfo.textContent = DEFAULT_ELEMENT_INFO;
      return;
    }
    elementInfo.textContent = formatElementInfo(elementByKey.get(selectedElementKey));
  }

  function clearElementHighlight() {
    for (const el of elementElements.values()) {
      el.classList.remove("state-selected");
    }
    for (const el of elementLabelElements.values()) {
      el.classList.remove("state-selected");
    }
  }

  function clearElementSelection() {
    if (!selectedElementKey) return;
    selectedElementKey = null;
    clearElementHighlight();
    applyElementVisibility();
    if (btnElementHighlight) btnElementHighlight.classList.remove("active");
    renderActiveElementInfo();
  }

  function selectElement(key) {
    if (!key || !elementByKey.has(key)) return;
    selectedElementKey = key;
    clearElementHighlight();
    applyElementVisibility();
    const el = elementElements.get(key);
    if (el) el.classList.add("state-selected");
    const labelEl = elementLabelElements.get(key);
    if (labelEl) labelEl.classList.add("state-selected");
    if (btnElementHighlight) btnElementHighlight.classList.add("active");
    renderActiveElementInfo();
    const element = elementByKey.get(key);
    if (elementSearch) elementSearch.value = element ? element.id : "";
    setStatus(`已选中元素: ${element ? element.id : key}`);
  }

  function getElementFocus(element) {
    if (!element?.polygon || element.polygon.length < 2) return null;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (let i = 0; i + 1 < element.polygon.length; i += 2) {
      const x = element.polygon[i];
      const y = element.polygon[i + 1];
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

  function locateElementInView(key) {
    const element = elementByKey.get(key);
    if (!element) return false;
    const focus = getElementFocus(element);
    if (!focus) return false;
    locateOnUtm(focus.x, focus.y, focus.span);
    return true;
  }

  /** 支持通过完整 key（kind:id）或裸 id 查找元素 */
  function findElementKeyById(idOrKey) {
    if (!idOrKey) return null;
    if (elementByKey.has(idOrKey)) return idOrKey;
    for (const [key, element] of elementByKey) {
      if (element.id === idOrKey) return key;
    }
    return null;
  }

  function searchAndSelectElement(idOrKey) {
    if (!idOrKey) return;
    const key = findElementKeyById(idOrKey);
    if (key) {
      selectElement(key);
      locateElementInView(key);
      return;
    }
    setStatus(`未找到元素: ${idOrKey}`);
  }

  function toggleHighlightElement() {
    const raw = elementSearch ? elementSearch.value.trim() : "";
    const key = raw ? findElementKeyById(raw) : null;
    // 已有高亮，且未输入新的其它元素：再次点击取消高亮
    if (selectedElementKey && (!raw || key === selectedElementKey)) {
      clearElementSelection();
      setStatus("已取消元素高亮");
      return;
    }
    if (!raw) {
      setStatus("请先输入元素 ID");
      return;
    }
    searchAndSelectElement(raw);
  }

  // ==================== 临停点 CSV ====================

  /** Excel 列 P/Q/R（1-based 16/17/18）→ 0-based 下标 */
  const STOP_LON_COL = 15;
  const STOP_LAT_COL = 16;
  const STOP_CRS_COL = 17;

  function parseCsvRows(text) {
    const rows = [];
    let row = [];
    let cell = "";
    let inQuotes = false;
    const src = text && text.charCodeAt(0) === 0xfeff ? text.slice(1) : text || "";
    for (let i = 0; i < src.length; i++) {
      const ch = src[i];
      if (inQuotes) {
        if (ch === '"') {
          if (src[i + 1] === '"') {
            cell += '"';
            i += 1;
          } else {
            inQuotes = false;
          }
        } else {
          cell += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\n") {
        row.push(cell);
        rows.push(row);
        row = [];
        cell = "";
      } else if (ch !== "\r") {
        cell += ch;
      }
    }
    if (cell.length || row.length) {
      row.push(cell);
      rows.push(row);
    }
    return rows;
  }

  function cleanStopCell(value) {
    return String(value == null ? "" : value).replace(/\s+/g, " ").trim();
  }

  function normalizeStopCrs(value) {
    const token = cleanStopCell(value).toLowerCase().replace(/-/g, "");
    if (token === "wgs84" || token === "gcj02") return token;
    return null;
  }

  function parseStopNumber(value) {
    const n = Number(cleanStopCell(value));
    return Number.isFinite(n) ? n : null;
  }

  /**
   * 优先取 P/Q/R 列。若 POINT 字段里多了一个未加引号的逗号导致列错位，
   * 则在整行中查找坐标类型，并取其前两列作为经度、纬度。
   */
  function extractStopFromRow(cells) {
    if (!cells || !cells.length) return null;

    let lon = parseStopNumber(cells[STOP_LON_COL]);
    let lat = parseStopNumber(cells[STOP_LAT_COL]);
    let crs = normalizeStopCrs(cells[STOP_CRS_COL]);
    let crsIndex = STOP_CRS_COL;

    const directOk =
      crs &&
      lon != null &&
      lat != null &&
      lon >= -180 &&
      lon <= 180 &&
      lat >= -90 &&
      lat <= 90;
    if (!directOk) {
      lon = null;
      lat = null;
      crs = null;
      crsIndex = -1;
      for (let i = 2; i < cells.length; i++) {
        const kind = normalizeStopCrs(cells[i]);
        if (!kind) continue;
        const tryLon = parseStopNumber(cells[i - 2]);
        const tryLat = parseStopNumber(cells[i - 1]);
        if (
          tryLon == null ||
          tryLat == null ||
          tryLon < -180 ||
          tryLon > 180 ||
          tryLat < -90 ||
          tryLat > 90
        ) {
          continue;
        }
        lon = tryLon;
        lat = tryLat;
        crs = kind;
        crsIndex = i;
        break;
      }
    }
    if (!crs || lon == null || lat == null) return null;

    const offset = crsIndex - STOP_CRS_COL;
    const at = (index) => cleanStopCell(cells[index + offset]);
    const name = cleanStopCell(cells[crsIndex + 1]);
    return {
      city: cleanStopCell(cells[0]),
      district: cleanStopCell(cells[1]),
      poi: at(3),
      address: at(4),
      grid: at(8),
      planned: at(10),
      capacity: at(11),
      lon,
      lat,
      crs,
      name,
    };
  }

  function decodeCsvBuffer(buffer) {
    const bytes = new Uint8Array(buffer);
    if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
      return new TextDecoder("utf-8").decode(bytes);
    }
    try {
      return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch (_) {
      return new TextDecoder("gb18030").decode(bytes);
    }
  }

  function roundCoord(n) {
    return Math.round(n * 1e6) / 1e6;
  }

  function isValidLonLat(lon, lat) {
    return (
      Number.isFinite(lon) &&
      Number.isFinite(lat) &&
      lon >= -180 &&
      lon <= 180 &&
      lat >= -90 &&
      lat <= 90
    );
  }

  function formatTimestamp(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  function readTrim(input) {
    return input ? String(input.value).trim() : "";
  }

  function readIntField(input, fallback) {
    const raw = readTrim(input);
    if (!raw) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? Math.trunc(n) : fallback;
  }

  function isRestrictDrawing() {
    return !!(restrictSession && restrictSession.drawing && activeTool === TOOL_MODES.restrict);
  }

  function isMapChromeTarget(target) {
    if (!target || !target.closest) return false;
    return !!target.closest(
      "#stops-panel, #map-meta-panel, #lane-color-legend, #lane-context-menu, #basemap-attribution, button, input, textarea, a, label"
    );
  }

  function applyFormToSession(session) {
    if (!session) return;
    session.areaName = readTrim(restrictAreaName);
    session.cityCode = readTrim(restrictCityCode);
    session.regionPath = readTrim(restrictRegionPath);
    session.remark = readTrim(restrictRemark);
    session.restrictType = readIntField(restrictTypeInput, 1);
    session.status = readIntField(restrictStatusInput, 1);
    session.timeMode = readIntField(restrictTimeModeInput, 1);
    session.updatedAt = readTrim(restrictUpdatedAt);
    const idRaw = readTrim(restrictAreaId);
    if (idRaw) {
      const idNum = Number(idRaw);
      if (Number.isFinite(idNum)) session.id = idNum;
    }
  }

  function allocateRestrictId() {
    const used = new Set(
      restrictedAreaRecords
        .map((record) => Number(record.id))
        .filter((id) => Number.isFinite(id))
    );
    const typed = Number(readTrim(restrictAreaId));
    if (Number.isFinite(typed) && !used.has(typed)) return typed;
    let id = Math.max(1, restrictIdSeed);
    while (used.has(id)) id += 1;
    return id;
  }

  function createRestrictSession() {
    const id = allocateRestrictId();
    restrictIdSeed = Math.max(restrictIdSeed, id + 1);
    const session = {
      key: `draw-${Date.now()}`,
      drawing: true,
      closed: false,
      id,
      areaName: "",
      cityCode: "",
      regionPath: "",
      remark: "",
      restrictType: 1,
      status: 1,
      timeMode: 1,
      updatedAt: "",
      points: [],
    };
    applyFormToSession(session);
    session.id = id;
    session.points = [];
    session.closed = false;
    session.drawing = true;
    return session;
  }

  function updateRestrictButtons() {
    const drawing = !!(restrictSession && restrictSession.drawing);
    const count = restrictSession ? restrictSession.points.length : 0;
    if (btnRestrictStart) btnRestrictStart.disabled = drawing;
    if (btnRestrictEnd) btnRestrictEnd.disabled = !drawing || count < 3;
    if (btnRestrictUndo) btnRestrictUndo.disabled = !drawing || count < 1;
  }

  function renderRestrictPointList() {
    if (!restrictPointList) return;
    const points = restrictSession ? restrictSession.points : [];
    if (restrictPointTitle) {
      restrictPointTitle.textContent = `顶点（GCJ02）${points.length ? " · " + points.length : ""}`;
    }
    restrictPointList.innerHTML = "";
    if (!points.length) {
      const empty = document.createElement("li");
      empty.className = "tool-record-empty";
      empty.textContent = "暂无顶点";
      restrictPointList.appendChild(empty);
      return;
    }
    points.forEach((point, index) => {
      const li = document.createElement("li");
      li.className = "restrict-point-row";
      li.dataset.index = String(index);
      const indexEl = document.createElement("span");
      indexEl.className = "restrict-point-index";
      indexEl.textContent = String(index + 1);
      const lonInput = document.createElement("input");
      lonInput.type = "text";
      lonInput.inputMode = "decimal";
      lonInput.dataset.k = "lon";
      lonInput.value = Number(point.lon).toFixed(6);
      lonInput.title = "经度 lon";
      const latInput = document.createElement("input");
      latInput.type = "text";
      latInput.inputMode = "decimal";
      latInput.dataset.k = "lat";
      latInput.value = Number(point.lat).toFixed(6);
      latInput.title = "纬度 lat";
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "restrict-point-remove";
      removeBtn.dataset.action = "remove";
      removeBtn.title = "删除该点";
      removeBtn.textContent = "×";
      li.append(indexEl, lonInput, latInput, removeBtn);
      restrictPointList.appendChild(li);
    });
  }

  function restrictPointToUtm(point) {
    if (typeof CoordTransform === "undefined" || !CoordTransform.gcj02ToWgs84) {
      throw new Error("缺少 GCJ02 转换，请强制刷新页面");
    }
    const wgs = CoordTransform.gcj02ToWgs84(point.lon, point.lat);
    return resolveLonLatToUtm(wgs.lng, wgs.lat, POINT_CRS.gcj02);
  }

  function findRestrictShape(sessionKey) {
    if (!restrictedAreasLayer || !sessionKey) return null;
    const nodes = restrictedAreasLayer.querySelectorAll("[data-session-key]");
    for (const node of nodes) {
      if (node.dataset.sessionKey === sessionKey) return node;
    }
    return null;
  }

  function sessionToRecord(session) {
    return {
      sessionKey: session.key,
      drawn: true,
      id: session.id,
      name: session.areaName || "未命名禁行区",
      areaName: session.areaName,
      cityCode: session.cityCode,
      regionPath: session.regionPath,
      remark: session.remark,
      restrictType: session.restrictType,
      status: session.status,
      timeMode: session.timeMode,
      updatedAt: session.updatedAt,
      points: session.points.map((point) => ({ lon: point.lon, lat: point.lat })),
      utmPoints: [],
    };
  }

  function renderRestrictDrawOverlay() {
    if (!restrictedDrawLayer) return;
    restrictedDrawLayer.innerHTML = "";
    if (!restrictSession || !mapData || !restrictSession.points.length) return;
    let utmPoints;
    try {
      utmPoints = restrictSession.points.map((point) => restrictPointToUtm(point));
    } catch (_) {
      return;
    }
    if (!restrictSession.closed) {
      const line = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
      line.setAttribute("class", "restricted-draw-line");
      line.setAttribute(
        "points",
        utmPoints
          .map((point) => {
            const local = utmToLocal(point.x, point.y);
            return `${local.x},${local.y}`;
          })
          .join(" ")
      );
      restrictedDrawLayer.appendChild(line);
      if (utmPoints.length >= 3) {
        const close = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const last = utmToLocal(utmPoints[utmPoints.length - 1].x, utmPoints[utmPoints.length - 1].y);
        const first = utmToLocal(utmPoints[0].x, utmPoints[0].y);
        close.setAttribute("class", "restricted-draw-close");
        close.setAttribute("x1", String(last.x));
        close.setAttribute("y1", String(last.y));
        close.setAttribute("x2", String(first.x));
        close.setAttribute("y2", String(first.y));
        restrictedDrawLayer.appendChild(close);
      }
    }
    const inv = Number.isFinite(view.scale) && view.scale > 0 ? 1 / view.scale : 1;
    utmPoints.forEach((point, index) => {
      const local = utmToLocal(point.x, point.y);
      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "restricted-draw-vertex");
      group.dataset.lx = String(local.x);
      group.dataset.ly = String(local.y);
      group.setAttribute("transform", `translate(${local.x},${local.y}) scale(${inv},${-inv})`);
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("r", "8");
      const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
      text.setAttribute("class", "restricted-draw-index");
      text.setAttribute("text-anchor", "middle");
      text.setAttribute("dominant-baseline", "central");
      text.textContent = String(index + 1);
      group.append(circle, text);
      restrictedDrawLayer.appendChild(group);
    });
  }

  function syncRestrictVertexScale() {
    if (!restrictedDrawLayer) return;
    if (!Number.isFinite(view.scale) || view.scale <= 0) return;
    const inv = 1 / view.scale;
    restrictedDrawLayer.querySelectorAll(".restricted-draw-vertex").forEach((node) => {
      const x = node.dataset.lx;
      const y = node.dataset.ly;
      if (x == null || y == null) return;
      node.setAttribute("transform", `translate(${x},${y}) scale(${inv},${-inv})`);
    });
  }

  function refreshCurrentRestrictShape() {
    renderRestrictDrawOverlay();
    if (!restrictSession || !restrictedAreasLayer) return;
    const key = restrictSession.key;
    restrictedAreaRecords = restrictedAreaRecords.filter((record) => record.sessionKey !== key);
    const existing = findRestrictShape(key);
    if (existing) existing.remove();
    if (!(restrictSession.closed && restrictSession.points.length >= 3)) return;
    const record = sessionToRecord(restrictSession);
    try {
      projectRestrictedArea(record);
    } catch (err) {
      setStatus(err.message || "禁行区投影失败");
      return;
    }
    restrictedAreaRecords.push(record);
    mountRestrictedArea(record);
  }

  function pushRestrictPoint(lon, lat) {
    if (!restrictSession) return;
    const point = { lon: roundCoord(lon), lat: roundCoord(lat) };
    restrictSession.points.push(point);
    renderRestrictPointList();
    if (restrictSession.closed) refreshCurrentRestrictShape();
    else renderRestrictDrawOverlay();
    updateRestrictButtons();
    setStatus(
      `已记录第 ${restrictSession.points.length} 个点：${point.lon.toFixed(6)}, ${point.lat.toFixed(6)}（GCJ02）`
    );
  }

  function addRestrictPointFromClient(clientX, clientY) {
    if (!restrictSession || !restrictSession.drawing) return;
    const now = Date.now();
    if (
      now - lastRestrictPick.t < 280 &&
      Math.hypot(clientX - lastRestrictPick.x, clientY - lastRestrictPick.y) < 8
    ) {
      return;
    }
    lastRestrictPick = { t: now, x: clientX, y: clientY };
    const { x: sx, y: sy } = getContainerPoint(clientX, clientY);
    const mapPoint = screenToMap(sx, sy);
    const gcj = utmToGcj02ForDisplay(mapPoint.x, mapPoint.y);
    if (!gcj) {
      setStatus("无法转换为 GCJ02，请确认地图 header 含 UTM 带号");
      return;
    }
    pushRestrictPoint(gcj.lng, gcj.lat);
  }

  function addRestrictPointFromInputs() {
    if (!requireMapForTool()) return;
    if (!restrictSession) {
      setStatus("请先点击开始，再添加顶点");
      return;
    }
    const lon = Number(readTrim(restrictAddLon));
    const lat = Number(readTrim(restrictAddLat));
    if (!isValidLonLat(lon, lat)) {
      setStatus("请输入有效的 GCJ02 经纬度");
      return;
    }
    pushRestrictPoint(lon, lat);
    if (restrictAddLon) restrictAddLon.value = "";
    if (restrictAddLat) restrictAddLat.value = "";
  }

  function onRestrictAddKeydown(e) {
    if (e.key !== "Enter") return;
    e.preventDefault();
    addRestrictPointFromInputs();
  }

  function onRestrictPointEdit(e) {
    if (!restrictSession || !e.target || !e.target.dataset) return;
    const key = e.target.dataset.k;
    if (key !== "lon" && key !== "lat") return;
    const row = e.target.closest("[data-index]");
    if (!row) return;
    const index = Number(row.dataset.index);
    const point = restrictSession.points[index];
    if (!point) return;
    const lon = Number(row.querySelector('[data-k="lon"]').value);
    const lat = Number(row.querySelector('[data-k="lat"]').value);
    if (!isValidLonLat(lon, lat)) return;
    point.lon = roundCoord(lon);
    point.lat = roundCoord(lat);
    if (restrictSession.closed) refreshCurrentRestrictShape();
    else renderRestrictDrawOverlay();
  }

  function onRestrictPointCommitDisplay(e) {
    if (!e.target || !e.target.dataset || !e.target.dataset.k) return;
    const n = Number(e.target.value);
    if (Number.isFinite(n)) e.target.value = roundCoord(n).toFixed(6);
    onRestrictPointEdit(e);
  }

  function onRestrictPointListClick(e) {
    const button = e.target.closest("[data-action='remove']");
    if (!button || !restrictSession) return;
    const row = button.closest("[data-index]");
    if (!row) return;
    const index = Number(row.dataset.index);
    if (!Number.isInteger(index) || index < 0 || index >= restrictSession.points.length) return;
    restrictSession.points.splice(index, 1);
    if (restrictSession.closed && restrictSession.points.length < 3) {
      restrictSession.closed = false;
      restrictSession.drawing = false;
    }
    renderRestrictPointList();
    refreshCurrentRestrictShape();
    updateRestrictButtons();
    syncToolUi();
    setStatus(`已删除第 ${index + 1} 个点`);
  }

  function onRestrictMetaInput() {
    if (!restrictSession) return;
    applyFormToSession(restrictSession);
    if (restrictSession.closed && restrictSession.points.length >= 3) {
      refreshCurrentRestrictShape();
    }
  }

  function startRestrictDraw() {
    if (!requireMapForTool()) return;
    if (restrictSession && !restrictSession.closed) {
      restrictSession.drawing = true;
      applyFormToSession(restrictSession);
      updateRestrictButtons();
      syncToolUi();
      setStatus("继续绘制禁行区：左键按顺序点击顶点");
      return;
    }
    if (restrictSession && restrictSession.closed) {
      applyFormToSession(restrictSession);
      refreshCurrentRestrictShape();
      if (restrictUpdatedAt) restrictUpdatedAt.value = "";
    }
    restrictSession = createRestrictSession();
    if (restrictAreaId) restrictAreaId.value = String(restrictSession.id);
    renderRestrictPointList();
    renderRestrictDrawOverlay();
    updateRestrictButtons();
    syncToolUi();
    setStatus("已开始绘制：在地图上按顺序左键点击顶点，结束时闭合");
  }

  function endRestrictDraw() {
    if (!requireMapForTool()) return;
    if (!restrictSession || !restrictSession.drawing) {
      setStatus("请先点击开始");
      return;
    }
    applyFormToSession(restrictSession);
    if (restrictSession.points.length < 3) {
      setStatus("至少需要 3 个点才能闭合禁行区");
      return;
    }
    restrictSession.drawing = false;
    restrictSession.closed = true;
    if (!restrictSession.updatedAt) {
      restrictSession.updatedAt = formatTimestamp(new Date());
      if (restrictUpdatedAt) restrictUpdatedAt.value = restrictSession.updatedAt;
    }
    refreshCurrentRestrictShape();
    updateRestrictButtons();
    syncToolUi();
    const name = restrictSession.areaName || "未命名禁行区";
    setStatus(`已闭合禁行区「${name}」，共 ${restrictSession.points.length} 个 GCJ02 顶点`);
  }

  function undoRestrictPoint() {
    if (!restrictSession || !restrictSession.drawing || !restrictSession.points.length) return;
    restrictSession.points.pop();
    renderRestrictPointList();
    renderRestrictDrawOverlay();
    updateRestrictButtons();
    setStatus(
      restrictSession.points.length ? `已撤销，剩余 ${restrictSession.points.length} 个点` : "已撤销全部顶点"
    );
  }

  function clearCurrentRestrict() {
    if (restrictSession) {
      const key = restrictSession.key;
      restrictSession = null;
      restrictedAreaRecords = restrictedAreaRecords.filter((record) => record.sessionKey !== key);
      const existing = findRestrictShape(key);
      if (existing) existing.remove();
    }
    renderRestrictPointList();
    renderRestrictDrawOverlay();
    updateRestrictButtons();
    syncToolUi();
    setStatus("已清除本次禁行区");
  }

  function currentRestrictPayload() {
    if (!restrictSession || restrictSession.points.length < 3) return null;
    applyFormToSession(restrictSession);
    return {
      areaName: restrictSession.areaName,
      cityCode: restrictSession.cityCode,
      id: restrictSession.id,
      points: restrictSession.points.map((point) => ({
        lat: roundCoord(point.lat),
        lon: roundCoord(point.lon),
      })),
      regionPath: restrictSession.regionPath,
      remark: restrictSession.remark ? restrictSession.remark : null,
      restrictType: restrictSession.restrictType,
      status: restrictSession.status,
      timeMode: restrictSession.timeMode,
      timeRules: [],
      updatedAt: restrictSession.updatedAt || formatTimestamp(new Date()),
    };
  }

  function copyCurrentRestrictJson() {
    const area = currentRestrictPayload();
    if (!area) {
      setStatus("至少需要 3 个点才能复制禁行区 JSON");
      return;
    }
    copyTextToClipboard(JSON.stringify(area, null, 2))
      .then(() => setStatus("已复制本次禁行区 JSON（GCJ02）"))
      .catch((err) => setStatus(`复制失败: ${err.message}`));
  }

  function downloadCurrentRestrictJson() {
    const area = currentRestrictPayload();
    if (!area) {
      setStatus("至少需要 3 个点才能下载禁行区 JSON");
      return;
    }
    const doc = {
      areas: [area],
      cityCode: area.cityCode,
      cityName: "",
      total: 1,
      vehicleUpdatedAt: area.updatedAt,
      vin: "",
    };
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = (area.areaName || "restricted-area").replace(/[\\/:*?"<>|]+/g, "_");
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("已下载本次禁行区 JSON（GCJ02）");
  }

  function projectRestrictedArea(record) {
    record.utmPoints = record.points.map((point) => {
      if (typeof CoordTransform === "undefined" || !CoordTransform.gcj02ToWgs84) {
        throw new Error("缺少 GCJ02 转换，请强制刷新页面");
      }
      const wgs = CoordTransform.gcj02ToWgs84(point.lon, point.lat);
      const utm = resolveLonLatToUtm(wgs.lng, wgs.lat, POINT_CRS.gcj02);
      return { x: utm.x, y: utm.y };
    });
  }

  function mountRestrictedArea(record) {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute(
      "points",
      record.utmPoints
        .map((point) => {
          const local = utmToLocal(point.x, point.y);
          return `${local.x},${local.y}`;
        })
        .join(" ")
    );
    polygon.setAttribute("class", "restricted-area-shape");
    polygon.dataset.areaId = String(record.id);
    if (record.sessionKey) {
      polygon.dataset.sessionKey = record.sessionKey;
      if (restrictSession && record.sessionKey === restrictSession.key) {
        polygon.classList.add("is-active");
      }
    }
    restrictedAreasLayer.appendChild(polygon);
  }

  function redrawRestrictedAreas() {
    if (!restrictedAreasLayer) return;
    restrictedAreasLayer.innerHTML = "";
    if (mapData && restrictedAreaRecords.length) {
      for (const record of restrictedAreaRecords) {
        projectRestrictedArea(record);
        mountRestrictedArea(record);
      }
    }
    renderRestrictDrawOverlay();
  }

  function locateAllRestrictedAreas() {
    const points = restrictedAreaRecords.flatMap((record) => record.utmPoints || []);
    if (!points.length) return;
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const point of points) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
    const span = Math.max(40, maxX - minX, maxY - minY) * 1.15;
    locateOnUtm((minX + maxX) / 2, (minY + maxY) / 2, span);
  }

  function importRestrictedAreasFromText(text) {
    let body;
    try {
      body = JSON.parse(text);
    } catch (_) {
      throw new Error("JSON 格式不正确");
    }
    if (!body || !Array.isArray(body.areas)) {
      throw new Error('JSON 缺少 "areas" 数组');
    }

    const next = [];
    let skipped = 0;
    body.areas.forEach((area, index) => {
      if (!area || !Array.isArray(area.points) || area.points.length < 3) {
        skipped += 1;
        return;
      }
      const points = area.points.map((point) => ({
        lon: Number(point && point.lon),
        lat: Number(point && point.lat),
      }));
      const valid = points.every(
        (point) =>
          Number.isFinite(point.lon) &&
          Number.isFinite(point.lat) &&
          point.lon >= -180 &&
          point.lon <= 180 &&
          point.lat >= -90 &&
          point.lat <= 90
      );
      if (!valid) {
        skipped += 1;
        return;
      }
      next.push({
        id: area.id != null ? area.id : index + 1,
        name: String(area.areaName || `未命名禁行区 ${index + 1}`),
        points,
        utmPoints: [],
      });
    });
    if (!next.length) {
      throw new Error("没有可绘制的禁行区（每个区域至少需要 3 个有效经纬度点）");
    }

    const drawnKept = restrictedAreaRecords.filter((record) => record.drawn);
    restrictedAreaRecords = next.concat(drawnKept);
    redrawRestrictedAreas();
    locateAllRestrictedAreas();
    let message = `已导入并绘制 ${next.length} 个禁行区`;
    if (skipped) message += ` · 跳过 ${skipped} 个无效区域`;
    setStatus(message);
  }

  function onRestrictedAreaFileSelected() {
    const file =
      restrictedAreaFileInput.files && restrictedAreaFileInput.files[0];
    if (!file) return;
    if (!requireMapForTool()) {
      restrictedAreaFileInput.value = "";
      return;
    }
    setStatus(`正在读取禁行区: ${file.name}…`);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importRestrictedAreasFromText(String(reader.result || ""));
      } catch (err) {
        setStatus(`禁行区导入失败: ${err.message}`);
      } finally {
        restrictedAreaFileInput.value = "";
      }
    };
    reader.onerror = () => {
      setStatus("无法读取禁行区 JSON");
      restrictedAreaFileInput.value = "";
    };
    reader.readAsText(file, "utf-8");
  }

  function projectStopRecord(record) {
    let lon = record.lon;
    let lat = record.lat;
    if (record.crs === POINT_CRS.gcj02) {
      if (typeof CoordTransform === "undefined" || !CoordTransform.gcj02ToWgs84) {
        throw new Error("缺少 GCJ02 转换，请强制刷新页面");
      }
      const wgs = CoordTransform.gcj02ToWgs84(lon, lat);
      lon = wgs.lng;
      lat = wgs.lat;
    }
    const utm = resolveLonLatToUtm(lon, lat, record.crs);
    record.x = utm.x;
    record.y = utm.y;
    record.wgsLon = lon;
    record.wgsLat = lat;
    record.zone = utm.zone;
  }

  function stopMapLabel(record) {
    const name = record.name || record.poi || record.grid || "临停点";
    const shortName = name.length > 18 ? `${name.slice(0, 18)}…` : name;
    return `${record.index} ${shortName}`;
  }

  function mountStopMarker(record) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "stop-marker");
    g.dataset.id = record.id;

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hit.setAttribute("r", "12");
    hit.setAttribute("class", "stop-marker-hit");
    g.appendChild(hit);

    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("r", "6");
    dot.setAttribute("class", "stop-marker-dot");
    g.appendChild(dot);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", "10");
    label.setAttribute("y", "0");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("class", "stop-marker-label");
    label.textContent = stopMapLabel(record);
    g.appendChild(label);

    g.addEventListener("mousedown", (e) => {
      if (e.button !== 0) return;
      e.stopPropagation();
      e.preventDefault();
      selectStop(record.id, true);
    });
    stopsLayer.appendChild(g);
    record.group = g;
  }

  function syncStopMarkerTransforms() {
    if (!stopsLayer || !stopRecords.length) return;
    const scale = view.scale;
    if (!Number.isFinite(scale) || scale <= 0) return;
    stopsLayer.classList.toggle("stops-show-labels", scale >= 1.2);
    const inv = 1 / scale;
    for (const record of stopRecords) {
      if (!record.group || record.x == null || record.y == null) continue;
      const local = utmToLocal(record.x, record.y);
      record.group.setAttribute(
        "transform",
        `translate(${local.x},${local.y}) scale(${inv},${-inv})`
      );
      record.group.classList.toggle("is-selected", record.id === selectedStopId);
    }
  }

  function redrawStops() {
    if (!stopsLayer) return;
    stopsLayer.innerHTML = "";
    if (!stopRecords.length || !mapData) {
      renderStopsPanel();
      return;
    }
    const failed = [];
    for (const record of stopRecords) {
      record.group = null;
      try {
        projectStopRecord(record);
        mountStopMarker(record);
      } catch (err) {
        record.x = null;
        record.y = null;
        failed.push(`${record.index}: ${err.message}`);
      }
    }
    renderStopsPanel();
    syncStopMarkerTransforms();
  }

  function formatStopDetail(record) {
    if (!record) return "点击列表或地图上的点查看详情";
    const lines = [
      record.name || "（未填写站点地址）",
      `${record.city || "—"} · ${record.district || "—"}`,
      `经度 ${record.lon}，纬度 ${record.lat}（${record.crs}）`,
    ];
    if (record.x != null && record.y != null) {
      lines.push(
        `UTM ${record.x.toFixed(2)}, ${record.y.toFixed(2)}（zone ${record.zone}）`
      );
    }
    if (record.planned || record.capacity) {
      lines.push(`计划投放 ${record.planned || "—"} · 最大可停靠 ${record.capacity || "—"}`);
    }
    if (record.grid) lines.push(`网格 ${record.grid}`);
    if (record.poi) lines.push(`参考点 ${record.poi}`);
    if (record.address) lines.push(record.address);
    return lines.join("\n");
  }

  function stopMatchesFilter(record, query) {
    if (!query) return true;
    const blob = [record.name, record.city, record.district, record.grid, record.poi, record.address, record.crs]
      .join(" ")
      .toLowerCase();
    return blob.includes(query);
  }

  function renderStopsPanel() {
    if (!stopsPanel) return;
    if (!stopRecords.length) {
      stopsPanel.classList.add("is-hidden");
      if (stopsList) stopsList.innerHTML = "";
      if (stopsDetail) stopsDetail.textContent = "点击列表或地图上的点查看详情";
      return;
    }
    stopsPanel.classList.remove("is-hidden");
    const wgsCount = stopRecords.filter((r) => r.crs === "wgs84").length;
    const gcjCount = stopRecords.filter((r) => r.crs === "gcj02").length;
    if (stopsPanelTitle) {
      stopsPanelTitle.textContent = `临停点 ${stopRecords.length}（WGS84 ${wgsCount} / GCJ02 ${gcjCount}）`;
    }
    const selected = stopRecords.find((r) => r.id === selectedStopId) || null;
    if (stopsDetail) stopsDetail.textContent = formatStopDetail(selected);

    if (!stopsList) return;
    const query = stopsFilter ? stopsFilter.value.trim().toLowerCase() : "";
    stopsList.innerHTML = "";
    const matched = stopRecords.filter((r) => stopMatchesFilter(r, query));
    if (!matched.length) {
      const empty = document.createElement("li");
      empty.className = "stops-empty";
      empty.textContent = "没有匹配的临停点";
      stopsList.appendChild(empty);
      return;
    }
    for (const record of matched) {
      const li = document.createElement("li");
      li.className = "stops-item";
      if (record.id === selectedStopId) li.classList.add("is-selected");
      li.dataset.id = record.id;
      const name = document.createElement("div");
      name.className = "stops-item-name";
      name.textContent = `${record.index}. ${record.name || record.poi || "未命名点位"}`;
      const meta = document.createElement("div");
      meta.className = "stops-item-meta";
      const place = [record.city, record.district].filter(Boolean).join(" ");
      meta.textContent = `${place ? place + " · " : ""}${record.lon}, ${record.lat} ${record.crs}`;
      li.appendChild(name);
      li.appendChild(meta);
      stopsList.appendChild(li);
    }
  }

  function selectStop(id, locate) {
    const record = stopRecords.find((r) => r.id === id);
    if (!record) return;
    selectedStopId = id;
    renderStopsPanel();
    syncStopMarkerTransforms();
    if (locate && record.x != null && record.y != null) {
      locateOnUtm(record.x, record.y, 120);
    }
    const item = stopsList && stopsList.querySelector(`[data-id="${id}"]`);
    if (item && locate) item.scrollIntoView({ block: "nearest" });
  }

  function onStopsListClick(e) {
    const item = e.target.closest(".stops-item");
    if (!item || !item.dataset.id) return;
    if (isUserSelectingText()) return;
    selectStop(item.dataset.id, true);
  }

  function locateAllStops() {
    const placed = stopRecords.filter((r) => r.x != null && r.y != null);
    if (!placed.length) {
      setStatus("没有可定位的临停点");
      return;
    }
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const record of placed) {
      if (record.x < minX) minX = record.x;
      if (record.x > maxX) maxX = record.x;
      if (record.y < minY) minY = record.y;
      if (record.y > maxY) maxY = record.y;
    }
    const span = Math.max(120, maxX - minX, maxY - minY) * 1.25;
    locateOnUtm((minX + maxX) / 2, (minY + maxY) / 2, span);
  }

  function clearStops(silent) {
    stopRecords = [];
    selectedStopId = null;
    if (stopsFilter) stopsFilter.value = "";
    if (stopsLayer) {
      stopsLayer.innerHTML = "";
      stopsLayer.classList.remove("stops-show-labels");
    }
    renderStopsPanel();
    if (!silent) setStatus("已清除临停点");
  }

  function importStopsFromText(text) {
    const rows = parseCsvRows(text);
    const next = [];
    let skipped = 0;
    rows.forEach((cells) => {
      const parsed = extractStopFromRow(cells);
      if (!parsed) {
        const city = cleanStopCell(cells[0]);
        if (city && city !== "城市" && city !== "示例") skipped += 1;
        return;
      }
      next.push(parsed);
    });
    if (!next.length) {
      throw new Error("CSV 中没有有效临停点（需要 P/Q/R 列的经度、纬度、wgs84 或 gcj02）");
    }

    const failed = [];
    next.forEach((record, idx) => {
      record.index = idx + 1;
      record.id = `stop-${idx + 1}`;
      try {
        projectStopRecord(record);
      } catch (err) {
        failed.push(`${record.index} ${record.name || ""}: ${err.message}`);
      }
    });
    if (failed.length === next.length) {
      throw new Error(failed[0]);
    }

    stopRecords = next;
    selectedStopId = null;
    if (stopsFilter) stopsFilter.value = "";
    redrawStops();
    locateAllStops();

    const wgsCount = next.filter((r) => r.crs === "wgs84" && r.x != null).length;
    const gcjCount = next.filter((r) => r.crs === "gcj02" && r.x != null).length;
    const zone = next.find((r) => r.zone != null);
    let msg = `已导入 ${wgsCount + gcjCount} 个临停点（WGS84 ${wgsCount}，GCJ02 ${gcjCount}）`;
    if (zone) msg += ` · UTM zone ${zone.zone}`;
    if (skipped) msg += ` · 跳过 ${skipped} 行`;
    if (failed.length) msg += ` · ${failed.length} 个转换失败`;
    setStatus(msg);
  }

  function onStopFileSelected() {
    const file = stopFileInput.files && stopFileInput.files[0];
    if (!file) return;
    if (!requireMapForTool()) {
      stopFileInput.value = "";
      return;
    }
    setStatus(`正在读取临停点: ${file.name}…`);
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = decodeCsvBuffer(reader.result);
        importStopsFromText(text);
      } catch (err) {
        setStatus(`临停点导入失败: ${err.message}`);
      } finally {
        stopFileInput.value = "";
      }
    };
    reader.onerror = () => {
      setStatus("无法读取临停点 CSV");
      stopFileInput.value = "";
    };
    reader.readAsArrayBuffer(file);
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
