/**
 * 浏览器端解析 HD map .bin（依赖 map_proto_bundle.js + protobuf.min.js）
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

  const COORD_DECIMALS = 3;
  const SIMPLIFY_RING_MIN_POINTS = 120;
  const SIMPLIFY_RING_EPSILON_M = 0.25;

  function getMapType() {
    if (typeof protobuf === "undefined") {
      throw new Error("未加载 protobuf.min.js");
    }
    const root = protobuf.roots.default || protobuf.roots["default"];
    if (!root || !root.planning || !root.planning.hdmap || !root.planning.hdmap.Map) {
      throw new Error("未加载 map_proto_bundle.js");
    }
    return root.planning.hdmap.Map;
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

  function parseMapBytes(buffer) {
    const MapType = getMapType();
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    const hdMap = MapType.decode(bytes);

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
        predecessor_ids: idList(lane.predecessorId),
        successor_ids: idList(lane.successorId),
        left_neighbor_forward_ids: idList(lane.leftNeighborForwardLaneId),
        right_neighbor_forward_ids: idList(lane.rightNeighborForwardLaneId),
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
    if (hdMap.header && hdMap.header.projection && hdMap.header.projection.proj) {
      projection = hdMap.header.projection.proj;
    }

    return {
      meta: {
        lane_count: lanesOut.length,
        projection,
        bounds,
      },
      lanes: lanesOut,
    };
  }

  global.MapParser = { parseMapBytes };
})(typeof window !== "undefined" ? window : globalThis);
