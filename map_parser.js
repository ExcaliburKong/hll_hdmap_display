/**
 * 浏览器端解析 HD map .bin（依赖 map_proto_loader.js + protobuf.min.js）
 */
(function (global) {
  "use strict";

  const LANE_TYPE_NAMES = {
    1: "NONE",
    2: "CITY_DRIVING",
    3: "BIKING",
    4: "SIDEWALK",
    5: "PARKING",
    6: "SHOULDER",
    7: "DIVISIONZONE",
    8: "ENTRANCE_WAY",
  };

  const LANE_TURN_NAMES = {
    1: "NO_TURN",
    2: "LEFT_TURN",
    3: "RIGHT_TURN",
    4: "U_TURN",
    5: "LEFT_TURN_WAITING",
    6: "U_TURN_WAITING",
  };

  const LANE_DIRECTION_NAMES = {
    1: "FORWARD",
    2: "BACKWARD",
    3: "BIDIRECTION",
  };
  const LANE_BOUNDARY_TYPE_NAMES = {
    0: "UNKNOWN",
    1: "DOTTED_YELLOW",
    2: "DOTTED_WHITE",
    3: "SOLID_YELLOW",
    4: "SOLID_WHITE",
    5: "DOUBLE_YELLOW",
    6: "CURB",
  };
  const SUBSIGNAL_TYPE_NAMES = {
    1: "UNKNOWN",
    2: "CIRCLE",
    3: "ARROW_LEFT",
    4: "ARROW_FORWARD",
    5: "ARROW_RIGHT",
    6: "ARROW_LEFT_AND_FORWARD",
    7: "ARROW_RIGHT_AND_FORWARD",
    8: "ARROW_U_TURN",
  };

  const COORD_DECIMALS = 3;
  const SIMPLIFY_RING_MIN_POINTS = 120;
  const SIMPLIFY_RING_EPSILON_M = 0.25;

  function getMapType() {
    if (typeof MapProtoLoader === "undefined") {
      throw new Error("未加载 map_proto_loader.js");
    }
    return MapProtoLoader.getMapType();
  }

  function bytesToUtf8(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    try {
      return new TextDecoder("utf-8").decode(value);
    } catch (_) {
      return "";
    }
  }

  /** 从 PROJ 字符串（如 "+proj=utm +zone=49" 或 "zone = 49"）解析 UTM 带号 */
  function parseUtmZoneFromProjection(proj) {
    if (typeof CoordTransform !== "undefined" && CoordTransform.parseUtmZoneFromProjection) {
      return CoordTransform.parseUtmZoneFromProjection(proj);
    }
    if (!proj || typeof proj !== "string") return null;
    let m = proj.match(/\+zone=(\d+)/i);
    if (!m) m = proj.match(/(?:^|[\s+])zone\s*=\s*(\d+)/i);
    return m ? Number(m[1]) : null;
  }

  function roundCoord(v) {
    const f = Number(v);
    const p = Math.pow(10, COORD_DECIMALS);
    return Math.round(f * p) / p;
  }

  function perpendicularDistance(point, start, end) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    if (dx === 0 && dy === 0) {
      return Math.hypot(point[0] - start[0], point[1] - start[1]);
    }
    return (
      Math.abs(
        dy * point[0] -
          dx * point[1] +
          end[0] * start[1] -
          end[1] * start[0]
      ) / Math.hypot(dx, dy)
    );
  }

  function douglasPeucker(points, epsilon) {
    if (points.length <= 2) return points;
    const start = points[0];
    const end = points[points.length - 1];
    let maxDist = 0;
    let index = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const dist = perpendicularDistance(points[i], start, end);
      if (dist > maxDist) {
        maxDist = dist;
        index = i;
      }
    }
    if (maxDist > epsilon) {
      const left = douglasPeucker(points.slice(0, index + 1), epsilon);
      const right = douglasPeucker(points.slice(index), epsilon);
      return left.slice(0, -1).concat(right);
    }
    return [start, end];
  }

  function simplifyRing(ring) {
    if (ring.length <= SIMPLIFY_RING_MIN_POINTS) return ring;
    const closed = ring[0][0] === ring[ring.length - 1][0] && ring[0][1] === ring[ring.length - 1][1];
    const work = closed && ring.length > 1 ? ring.slice(0, -1) : ring.slice();
    if (work.length <= SIMPLIFY_RING_MIN_POINTS) return ring;
    const simplified = douglasPeucker(work, SIMPLIFY_RING_EPSILON_M);
    if (closed && simplified.length && (simplified[0][0] !== simplified[simplified.length - 1][0] || simplified[0][1] !== simplified[simplified.length - 1][1])) {
      simplified.push(simplified[0].slice());
    }
    return simplified;
  }

  function polygonToFlat(polygon) {
    const ring = simplifyRing(polygon);
    const flat = [];
    for (const [x, y] of ring) {
      flat.push(roundCoord(x), roundCoord(y));
    }
    return flat;
  }

  function segmentsToFlat(segments) {
    const out = [];
    for (const seg of segments) {
      if (seg.length < 2) continue;
      const flat = [];
      for (const [x, y] of seg) {
        flat.push(roundCoord(x), roundCoord(y));
      }
      if (flat.length >= 4) out.push(flat);
    }
    return out;
  }

  function curveSegmentsToPolylines(curve) {
    if (!curve || !curve.segment) return [];
    const segments = [];
    for (const seg of curve.segment) {
      const line = seg.lineSegment;
      if (!line || !line.point || line.point.length < 2) continue;
      const pts = line.point.map((pt) => [Number(pt.x), Number(pt.y)]);
      segments.push(pts);
    }
    return segments;
  }

  function idList(ids) {
    if (!ids || !ids.length) return [];
    return ids.map((i) => i.id).filter(Boolean);
  }

  function enumName(mapping, value) {
    return mapping[value] || "UNKNOWN";
  }

  function parseBoundaryTypes(boundary, fallbackLength) {
    if (!boundary || !boundary.boundaryType || !boundary.boundaryType.length) return [];
    const entries = boundary.boundaryType
      .map((item) => {
        const s = item && item.s != null ? Number(item.s) : 0;
        const typeCodes = (item && item.types ? item.types : []).map((v) => Number(v));
        return { s, type_codes: typeCodes };
      })
      .sort((a, b) => a.s - b.s);
    const totalLength = boundary.length != null ? Number(boundary.length) : Number(fallbackLength);
    return entries.map((item, idx) => {
      const next = entries[idx + 1];
      const rawEnd = next ? next.s : totalLength;
      const sEnd = Number.isFinite(rawEnd) ? Math.max(item.s, rawEnd) : null;
      return {
        s_start: item.s,
        s_end: sEnd,
        type_codes: item.type_codes,
        types: item.type_codes.map((code) => enumName(LANE_BOUNDARY_TYPE_NAMES, code)),
      };
    });
  }

  function parseSamples(samples) {
    if (!samples || !samples.length) return [];
    return samples.map((it) => ({
      s: it && it.s != null ? Number(it.s) : null,
      width: it && it.width != null ? Number(it.width) : null,
    }));
  }

  function detectOverlapObjectKind(obj) {
    if (!obj || typeof obj !== "object") return "";
    if (obj.signalOverlapInfo != null) return "signal";
    if (obj.laneOverlapInfo != null) return "lane";
    if (obj.stopSignOverlapInfo != null) return "stop_sign";
    if (obj.crosswalkOverlapInfo != null) return "crosswalk";
    if (obj.junctionOverlapInfo != null) return "junction";
    if (obj.yieldSignOverlapInfo != null) return "yield_sign";
    if (obj.clearAreaOverlapInfo != null) return "clear_area";
    if (obj.speedBumpOverlapInfo != null) return "speed_bump";
    if (obj.parkingSpaceOverlapInfo != null) return "parking_space";
    if (obj.pncJunctionOverlapInfo != null) return "pnc_junction";
    if (obj.rsuOverlapInfo != null) return "rsu";
    if (obj.fenceOverlapInfo != null) return "fence";
    return "";
  }

  function parseMapBytes(buffer) {
    const MapType = getMapType();
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const hdMap = MapType.decode(bytes);
    const signalInfoById = new Map();
    const overlapToSignalIds = new Map();

    for (const signal of hdMap.signal || []) {
      const sid = signal && signal.id && signal.id.id ? signal.id.id : "";
      if (!sid) continue;
      const subsignalTypes = (signal.subsignal || []).map((sub) => {
        const typeCode = sub && sub.type != null ? Number(sub.type) : 0;
        return {
          type_code: typeCode,
          type: enumName(SUBSIGNAL_TYPE_NAMES, typeCode),
        };
      });
      signalInfoById.set(sid, {
        id: sid,
        subsignal_types: subsignalTypes,
      });
      for (const oid of idList(signal.overlapId)) {
        if (!overlapToSignalIds.has(oid)) overlapToSignalIds.set(oid, new Set());
        overlapToSignalIds.get(oid).add(sid);
      }
    }

    for (const overlap of hdMap.overlap || []) {
      const oid = overlap && overlap.id && overlap.id.id ? overlap.id.id : "";
      if (!oid) continue;
      const signalIds = new Set(overlapToSignalIds.get(oid) || []);
      for (const obj of overlap.object || []) {
        if (detectOverlapObjectKind(obj) !== "signal") continue;
        const signalId = obj && obj.id && obj.id.id ? obj.id.id : "";
        if (signalId) signalIds.add(signalId);
      }
      if (signalIds.size > 0) {
        overlapToSignalIds.set(oid, signalIds);
      }
    }

    /** lane_id -> 同一条 road 下所有 section 的 lane_id（含自身） */
    const laneToRoadLaneIds = new Map();
    for (const road of hdMap.road || []) {
      const roadLaneIds = [];
      for (const section of road.section || []) {
        for (const laneIdRef of section.laneId || []) {
          const laneId = laneIdRef && laneIdRef.id ? laneIdRef.id : "";
          if (laneId) roadLaneIds.push(laneId);
        }
      }
      const uniqueLaneIds = [...new Set(roadLaneIds)];
      for (const laneId of uniqueLaneIds) {
        const existing = laneToRoadLaneIds.get(laneId) || [];
        laneToRoadLaneIds.set(laneId, [...new Set([...existing, ...uniqueLaneIds])]);
      }
    }

    const lanesOut = [];
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    function updateBounds(xs, ys) {
      for (let i = 0; i < xs.length; i++) {
        minX = Math.min(minX, xs[i]);
        minY = Math.min(minY, ys[i]);
        maxX = Math.max(maxX, xs[i]);
        maxY = Math.max(maxY, ys[i]);
      }
    }

    for (const lane of hdMap.lane || []) {
      const lid = lane.id && lane.id.id ? lane.id.id : "";
      if (!lid) continue;

      let leftPts = [];
      let rightPts = [];
      if (lane.leftBoundary && lane.leftBoundary.curve) {
        for (const seg of curveSegmentsToPolylines(lane.leftBoundary.curve)) {
          leftPts = leftPts.concat(seg);
        }
      }
      if (lane.rightBoundary && lane.rightBoundary.curve) {
        for (const seg of curveSegmentsToPolylines(lane.rightBoundary.curve)) {
          rightPts = rightPts.concat(seg);
        }
      }

      let polygonFlat = null;
      if (leftPts.length && rightPts.length) {
        polygonFlat = polygonToFlat(leftPts.concat(rightPts.slice().reverse()));
      }

      const centralSegments = curveSegmentsToPolylines(lane.centralCurve);
      const centralFlatSegments = segmentsToFlat(centralSegments);

      if (polygonFlat) {
        const xs = [];
        const ys = [];
        for (let i = 0; i < polygonFlat.length; i += 2) {
          xs.push(polygonFlat[i]);
          ys.push(polygonFlat[i + 1]);
        }
        updateBounds(xs, ys);
      } else {
        for (const seg of centralFlatSegments) {
          const xs = [];
          const ys = [];
          for (let i = 0; i < seg.length; i += 2) {
            xs.push(seg[i]);
            ys.push(seg[i + 1]);
          }
          updateBounds(xs, ys);
        }
      }

      const laneType = lane.type != null ? Number(lane.type) : 0;
      const laneTurn = lane.turn != null ? Number(lane.turn) : 0;
      const direction = lane.direction != null ? Number(lane.direction) : 0;

      lanesOut.push({
        id: lid,
        polygon: polygonFlat,
        central_segments: centralFlatSegments,
        overlap_ids: idList(lane.overlapId),
        predecessor_ids: idList(lane.predecessorId),
        successor_ids: idList(lane.successorId),
        left_neighbor_forward_ids: idList(lane.leftNeighborForwardLaneId),
        right_neighbor_forward_ids: idList(lane.rightNeighborForwardLaneId),
        left_neighbor_reverse_ids: idList(lane.leftNeighborReverseLaneId),
        right_neighbor_reverse_ids: idList(lane.rightNeighborReverseLaneId),
        speed_limit: lane.speedLimit != null ? Number(lane.speedLimit) : null,
        length: lane.length != null ? Number(lane.length) : null,
        type: enumName(LANE_TYPE_NAMES, laneType),
        type_code: laneType,
        turn: enumName(LANE_TURN_NAMES, laneTurn),
        turn_code: laneTurn,
        direction: enumName(LANE_DIRECTION_NAMES, direction),
        direction_code: direction,
        junction_id:
          lane.junctionId && lane.junctionId.id ? lane.junctionId.id : null,
        left_boundary_type_segments: parseBoundaryTypes(lane.leftBoundary, lane.length),
        right_boundary_type_segments: parseBoundaryTypes(lane.rightBoundary, lane.length),
        left_sample: parseSamples(lane.leftSample),
        right_sample: parseSamples(lane.rightSample),
        left_road_sample: parseSamples(lane.leftRoadSample),
        right_road_sample: parseSamples(lane.rightRoadSample),
        overlap_signal_details: idList(lane.overlapId).map((overlapId) => {
          const signalIds = Array.from(overlapToSignalIds.get(overlapId) || []);
          const signals = signalIds
            .map((sid) => signalInfoById.get(sid))
            .filter(Boolean)
            .map((sig) => ({
              id: sig.id,
              subsignal_types: sig.subsignal_types,
            }));
          return {
            overlap_id: overlapId,
            signals,
          };
        }),
        same_road_lane_ids: (laneToRoadLaneIds.get(lid) || []).filter((id) => id !== lid),
      });
    }

    let bounds;
    if (!Number.isFinite(minX)) {
      bounds = { min_x: 0, min_y: 0, max_x: 1, max_y: 1 };
    } else {
      const padX = Math.max((maxX - minX) * 0.02, 10);
      const padY = Math.max((maxY - minY) * 0.02, 10);
      bounds = {
        min_x: minX - padX,
        min_y: minY - padY,
        max_x: maxX + padX,
        max_y: maxY + padY,
      };
    }

    let projection = "";
    let mapDate = "";
    if (hdMap.header) {
      mapDate = bytesToUtf8(hdMap.header.date);
      if (hdMap.header.projection && hdMap.header.projection.proj) {
        projection = hdMap.header.projection.proj;
      }
    }
    const utmZone = parseUtmZoneFromProjection(projection);

    return {
      meta: {
        lane_count: lanesOut.length,
        date: mapDate,
        projection,
        utm_zone: utmZone,
        bounds,
      },
      lanes: lanesOut,
    };
  }

  global.MapParser = { parseMapBytes };
})(typeof window !== "undefined" ? window : globalThis);
