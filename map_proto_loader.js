/**
 * 浏览器运行时加载 data/ 下的 .proto（依赖 protobuf.min.js）
 */
(function (global) {
  "use strict";

  const PROTO_DATA_ROOT = "data";
  const MAP_PROTO_URL = PROTO_DATA_ROOT + "/map.proto";

  let loadPromise = null;
  let mapRoot = null;
  let MapType = null;

  /**
   * proto 内 import 以 data/ 为根（common_msgs/...），而非相对当前 .proto 文件目录。
   */
  function resolveProtoPath(origin, target) {
    if (typeof target === "string" && target.indexOf("common_msgs/") === 0) {
      return PROTO_DATA_ROOT + "/" + target;
    }
    if (!origin) {
      return target;
    }
    const base = origin.replace(/[/\\][^/\\]+$/, "");
    return base + "/" + target;
  }

  function loadMapProtos() {
    if (loadPromise) return loadPromise;
    if (typeof protobuf === "undefined") {
      return Promise.reject(new Error("未加载 protobuf.min.js"));
    }
    const root = new protobuf.Root();
    root.resolvePath = resolveProtoPath;
    loadPromise = protobuf.load(MAP_PROTO_URL, root).then(function (loadedRoot) {
      mapRoot = loadedRoot;
      MapType = loadedRoot.lookupType("planning.hdmap.Map");
      if (!MapType) {
        throw new Error("未在 proto 中找到 planning.hdmap.Map");
      }
      protobuf.roots.default = loadedRoot;
      return MapType;
    }).catch(function (err) {
      loadPromise = null;
      throw err;
    });
    return loadPromise;
  }

  function getMapType() {
    if (!MapType) {
      throw new Error("Proto 尚未加载完成，请等待 MapProtoLoader.load()");
    }
    return MapType;
  }

  function isReady() {
    return MapType != null;
  }

  global.MapProtoLoader = {
    load: loadMapProtos,
    getMapType,
    isReady,
    getRoot: function () {
      return mapRoot;
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
