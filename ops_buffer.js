/**
 * 运营外扩圈：对齐 mission_dispatcher._build_order_range
 * 用距离变换提取「离车道中心线 = distance」等距线；网格过大时退回凸包外扩。
 */
(function (global) {
  "use strict";

  const MAX_GRID_CELLS = 4_000_000;
  const DEFAULT_CELL = 25.0;
  const ARC_DEG = 6.0;

  function flatToPoints(flat) {
    const pts = [];
    if (!flat) return pts;
    for (let i = 0; i + 1 < flat.length; i += 2) {
      pts.push([flat[i], flat[i + 1]]);
    }
    return pts;
  }

  /** @param {Array<{central_segments?: number[][], polygon?: number[]}>} lanes */
  function collectCenterSegments(lanes) {
    const segs = [];
    if (!lanes) return segs;
    for (const lane of lanes) {
      const list = lane && lane.central_segments;
      if (!list) continue;
      for (const flat of list) {
        const pts = flatToPoints(flat);
        if (pts.length >= 2) segs.push(pts);
      }
    }
    if (segs.length) return segs;
    // 无中心线时退回车道 polygon 边界（对齐 mission_dispatcher 退回 boundary）
    for (const lane of lanes) {
      const pts = flatToPoints(lane && lane.polygon);
      if (pts.length >= 2) {
        if (
          pts.length >= 3 &&
          (pts[0][0] !== pts[pts.length - 1][0] || pts[0][1] !== pts[pts.length - 1][1])
        ) {
          pts.push(pts[0]);
        }
        segs.push(pts);
      }
    }
    return segs;
  }

  function edtSq(mask, ny, nx) {
    const INF = (nx + ny) * (nx + ny) + 1;
    const f = new Float64Array(ny * nx);
    for (let i = 0; i < f.length; i++) f[i] = mask[i] ? 0 : INF;

    function dt1d(src, n, out) {
      const v = new Int32Array(n);
      const z = new Float64Array(n + 1);
      let k = 0;
      v[0] = 0;
      z[0] = -INF;
      z[1] = INF;
      for (let q = 1; q < n; q++) {
        const fq = src[q] + q * q;
        let s = (fq - (src[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) {
          k -= 1;
          s = (fq - (src[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        }
        k += 1;
        v[k] = q;
        z[k] = s;
        z[k + 1] = INF;
      }
      k = 0;
      for (let q = 0; q < n; q++) {
        while (z[k + 1] < q) k += 1;
        out[q] = (q - v[k]) * (q - v[k]) + src[v[k]];
      }
    }

    const col = new Float64Array(ny);
    const colOut = new Float64Array(ny);
    for (let c = 0; c < nx; c++) {
      for (let r = 0; r < ny; r++) col[r] = f[r * nx + c];
      dt1d(col, ny, colOut);
      for (let r = 0; r < ny; r++) f[r * nx + c] = colOut[r];
    }

    const row = new Float64Array(nx);
    const rowOut = new Float64Array(nx);
    for (let r = 0; r < ny; r++) {
      const base = r * nx;
      for (let c = 0; c < nx; c++) row[c] = f[base + c];
      dt1d(row, nx, rowOut);
      for (let c = 0; c < nx; c++) f[base + c] = rowOut[c];
    }
    return f;
  }

  function marchingSquares(xs, ys, z, ny, nx, level) {
    if (ny < 2 || nx < 2) return [];

    const table = {
      1: [[3, 0]],
      2: [[0, 1]],
      3: [[3, 1]],
      4: [[1, 2]],
      5: [
        [0, 3],
        [1, 2],
      ],
      6: [[0, 2]],
      7: [[3, 2]],
      8: [[3, 2]],
      9: [[0, 2]],
      10: [
        [0, 1],
        [3, 2],
      ],
      11: [[1, 2]],
      12: [[3, 1]],
      13: [[0, 1]],
      14: [[3, 0]],
    };

    function interp(pa, va, pb, vb) {
      const t = Math.abs(vb - va) < 1e-12 ? 0.5 : (level - va) / (vb - va);
      return [pa[0] + (pb[0] - pa[0]) * t, pa[1] + (pb[1] - pa[1]) * t];
    }

    const segs = [];
    for (let i = 0; i < ny - 1; i++) {
      for (let j = 0; j < nx - 1; j++) {
        const tl = z[i * nx + j];
        const tr = z[i * nx + j + 1];
        const br = z[(i + 1) * nx + j + 1];
        const bl = z[(i + 1) * nx + j];
        const zmin = Math.min(tl, tr, br, bl);
        const zmax = Math.max(tl, tr, br, bl);
        if (zmin > level || zmax < level) continue;

        const code =
          (tl > level ? 1 : 0) |
          (tr > level ? 2 : 0) |
          (br > level ? 4 : 0) |
          (bl > level ? 8 : 0);
        const pairs = table[code];
        if (!pairs) continue;

        const pTl = [xs[j], ys[i]];
        const pTr = [xs[j + 1], ys[i]];
        const pBr = [xs[j + 1], ys[i + 1]];
        const pBl = [xs[j], ys[i + 1]];
        const edgePts = [
          interp(pTl, tl, pTr, tr),
          interp(pTr, tr, pBr, br),
          interp(pBr, br, pBl, bl),
          interp(pBl, bl, pTl, tl),
        ];
        for (const [e0, e1] of pairs) {
          segs.push([edgePts[e0], edgePts[e1]]);
        }
      }
    }
    return segs;
  }

  function convexHull(points) {
    const uniq = new Map();
    for (const p of points) {
      uniq.set(`${p[0]},${p[1]}`, p);
    }
    const pts = Array.from(uniq.values()).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (pts.length <= 2) return pts;

    function cross(o, a, b) {
      return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    }

    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
        lower.pop();
      }
      lower.push(p);
    }
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
        upper.pop();
      }
      upper.push(p);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }

  function offsetConvexPolygon(hull, r, arcDeg = ARC_DEG) {
    const n = hull.length;
    if (n < 3 || r <= 0) return null;

    function outwardNormal(a, b) {
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const length = Math.hypot(dx, dy);
      if (length < 1e-9) return null;
      return [dy / length, -dx / length];
    }

    const out = [];
    const arcStep = (arcDeg * Math.PI) / 180;
    for (let i = 0; i < n; i++) {
      const prevV = hull[(i - 1 + n) % n];
      const curV = hull[i];
      const nextV = hull[(i + 1) % n];
      const nIn = outwardNormal(prevV, curV);
      const nOut = outwardNormal(curV, nextV);
      if (!nIn || !nOut) continue;
      let a0 = Math.atan2(nIn[1], nIn[0]);
      let a1 = Math.atan2(nOut[1], nOut[0]);
      let delta = a1 - a0;
      while (delta < 0) delta += 2 * Math.PI;
      const steps = Math.max(1, Math.floor(delta / arcStep));
      for (let k = 0; k <= steps; k++) {
        const a = a0 + (delta * k) / steps;
        out.push([curV[0] + r * Math.cos(a), curV[1] + r * Math.sin(a)]);
      }
    }
    if (!out.length) return null;
    out.push(out[0]);
    return out;
  }

  function gatherPoints(segs, maxPts = 40000) {
    let total = 0;
    for (const s of segs) total += s.length;
    const step = total > maxPts ? Math.floor(total / maxPts) + 1 : 1;
    const pts = [];
    let idx = 0;
    for (const s of segs) {
      for (const p of s) {
        if (idx % step === 0) pts.push(p);
        idx += 1;
      }
    }
    return pts;
  }

  function convexFallback(segs, distance) {
    const pts = gatherPoints(segs);
    if (pts.length < 3) return [];
    const hull = convexHull(pts);
    if (hull.length < 3) return [];
    const ring = offsetConvexPolygon(hull, distance);
    return ring ? [ring] : [];
  }

  function chooseCell(distance, spanX, spanY) {
    // 默认与 mission_dispatcher 一致用 25m；小距离时加密网格以控制相对误差
    let cell = Math.min(DEFAULT_CELL, Math.max(2, distance / 40));
    for (let guard = 0; guard < 20; guard++) {
      const pad = distance + 3.0 * cell;
      const nx = Math.floor((spanX + 2 * pad) / cell) + 1;
      const ny = Math.floor((spanY + 2 * pad) / cell) + 1;
      if (nx > 2 && ny > 2 && nx * ny <= MAX_GRID_CELLS) return cell;
      cell *= 1.5;
    }
    return cell;
  }

  /**
   * @param {Array} lanes mapData.lanes
   * @param {number} distance 外扩距离(米), 必须 > 0
   * @param {number} [cell] 网格尺寸(米)；省略则按距离自适应
   * @returns {Array<Array<[number, number]>>} 世界坐标折线列表
   */
  function buildOpsBufferRings(lanes, distance, cell) {
    const dist = Number(distance);
    if (!(dist > 0) || !Number.isFinite(dist)) {
      throw new Error("距离必须大于 0");
    }
    const segs = collectCenterSegments(lanes);
    if (!segs.length) {
      throw new Error("地图无可用车道中心线，无法绘制外扩圈");
    }

    let minx = Infinity;
    let miny = Infinity;
    let maxx = -Infinity;
    let maxy = -Infinity;
    for (const s of segs) {
      for (const p of s) {
        if (p[0] < minx) minx = p[0];
        if (p[1] < miny) miny = p[1];
        if (p[0] > maxx) maxx = p[0];
        if (p[1] > maxy) maxy = p[1];
      }
    }

    const spanX = maxx - minx;
    const spanY = maxy - miny;
    if (!(cell > 0)) cell = chooseCell(dist, spanX, spanY);

    const pad = dist + 3.0 * cell;
    const x0 = minx - pad;
    const y0 = miny - pad;
    const nx = Math.floor((spanX + 2 * pad) / cell) + 1;
    const ny = Math.floor((spanY + 2 * pad) / cell) + 1;

    if (nx <= 2 || ny <= 2 || nx * ny > MAX_GRID_CELLS) {
      return convexFallback(segs, dist);
    }

    const mask = new Uint8Array(ny * nx);
    for (const s of segs) {
      for (let k = 0; k < s.length - 1; k++) {
        const ax = s[k][0];
        const ay = s[k][1];
        const bx = s[k + 1][0];
        const by = s[k + 1][1];
        const L = Math.hypot(bx - ax, by - ay);
        const m = Math.max(1, Math.floor(L / cell) + 1);
        for (let t = 0; t <= m; t++) {
          const tt = t / m;
          const ci = Math.floor((ax + (bx - ax) * tt - x0) / cell);
          const ri = Math.floor((ay + (by - ay) * tt - y0) / cell);
          if (ci >= 0 && ci < nx && ri >= 0 && ri < ny) {
            mask[ri * nx + ci] = 1;
          }
        }
      }
    }

    const edt = edtSq(mask, ny, nx);
    const xs = new Float64Array(nx);
    const ys = new Float64Array(ny);
    for (let j = 0; j < nx; j++) xs[j] = x0 + (j + 0.5) * cell;
    for (let i = 0; i < ny; i++) ys[i] = y0 + (i + 0.5) * cell;

    const distField = new Float64Array(ny * nx);
    for (let i = 0; i < distField.length; i++) {
      distField[i] = Math.sqrt(edt[i]) * cell;
    }

    const rings = marchingSquares(xs, ys, distField, ny, nx, dist);
    if (rings.length) return rings;
    return convexFallback(segs, dist);
  }

  global.OpsBuffer = {
    buildOpsBufferRings,
  };
})(typeof window !== "undefined" ? window : globalThis);
