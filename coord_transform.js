/**
 * WGS84 经纬度 ↔ UTM 转换（画点/画框输入用）
 */
(function (global) {
  "use strict";

  const WGS84_A = 6378137.0;
  const WGS84_F = 1 / 298.257223563;
  const UTM_K0 = 0.9996;

  /** 从 PROJ 字符串解析 UTM 带号，如 "+proj=utm +zone=49" 或 "zone = 49" */
  function parseUtmZoneFromProjection(proj) {
    if (!proj || typeof proj !== "string") return null;
    let m = proj.match(/\+zone=(\d+)/i);
    if (!m) m = proj.match(/(?:^|[\s+])zone\s*=\s*(\d+)/i);
    return m ? Number(m[1]) : null;
  }

  /** 北半球为 true；proj 含 +south 时为南半球，否则按纬度判断 */
  function parseUtmNorthernFromProjection(proj, latDeg) {
    if (proj && /\+south\b/i.test(proj)) return false;
    if (proj && /\+north\b/i.test(proj)) return true;
    return latDeg >= 0;
  }

  function degToRad(d) {
    return (d * Math.PI) / 180;
  }

  function radToDeg(r) {
    return (r * 180) / Math.PI;
  }

  /** 反算时判断北半球：proj 含 +south，或 false northing 已加在 northing 上 */
  function inferUtmNorthernFromNorthing(northing, proj) {
    if (proj && /\+south\b/i.test(proj)) return false;
    if (proj && /\+north\b/i.test(proj)) return true;
    return northing < 10000000;
  }

  /** WGS84 经纬度 → UTM 东向/北向（米） */
  function wgs84ToUtm(lonDeg, latDeg, zone, northern) {
    if (!Number.isFinite(zone) || zone < 1 || zone > 60) {
      throw new Error(`无效的 UTM 带号: ${zone}`);
    }
    const lat = degToRad(latDeg);
    const lon = degToRad(lonDeg);
    const lonOrigin = degToRad((zone - 1) * 6 - 180 + 3);

    const e2 = 2 * WGS84_F - WGS84_F * WGS84_F;
    const ePrime2 = e2 / (1 - e2);
    const sinLat = Math.sin(lat);
    const cosLat = Math.cos(lat);
    const tanLat = Math.tan(lat);

    const n = WGS84_A / Math.sqrt(1 - e2 * sinLat * sinLat);
    const t = tanLat * tanLat;
    const c = ePrime2 * cosLat * cosLat;
    const aCoeff = cosLat * (lon - lonOrigin);

    const m =
      WGS84_A *
      ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * lat -
        ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * lat) +
        ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * lat) -
        ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * lat));

    const easting =
      UTM_K0 *
        n *
        (aCoeff +
          ((1 - t + c) * aCoeff * aCoeff * aCoeff) / 6 +
          ((5 - 18 * t + t * t + 72 * c - 58 * ePrime2) * aCoeff ** 5) / 120) +
      500000.0;

    let northing =
      UTM_K0 *
      (m +
        n *
          tanLat *
          ((aCoeff * aCoeff) / 2 +
            ((5 - t + 9 * c + 4 * c * c) * aCoeff ** 4) / 24 +
            ((61 - 58 * t + t * t + 600 * c - 330 * ePrime2) * aCoeff ** 6) / 720));

    if (northern === false) {
      northing += 10000000.0;
    }

    return { easting, northing };
  }

  /** UTM 东向/北向（米）→ WGS84 经纬度 */
  function utmToWgs84(easting, northing, zone, northern) {
    if (!Number.isFinite(zone) || zone < 1 || zone > 60) {
      throw new Error(`无效的 UTM 带号: ${zone}`);
    }
    let n = northing;
    if (northern === false) {
      n -= 10000000.0;
    }
    n /= UTM_K0;

    const e2 = 2 * WGS84_F - WGS84_F * WGS84_F;
    const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
    const ePrime2 = e2 / (1 - e2);

    const x = easting - 500000.0;
    const m = n;

    const mu =
      m /
      (WGS84_A *
        (1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256));

    const phi1 =
      mu +
      ((3 * e1) / 2 - (27 * e1 ** 3) / 32) * Math.sin(2 * mu) +
      ((21 * e1 * e1) / 16 - (55 * e1 ** 4) / 32) * Math.sin(4 * mu) +
      ((151 * e1 ** 3) / 96) * Math.sin(6 * mu) +
      ((1097 * e1 ** 4) / 512) * Math.sin(8 * mu);

    const sinPhi1 = Math.sin(phi1);
    const cosPhi1 = Math.cos(phi1);
    const tanPhi1 = Math.tan(phi1);

    const n1 = WGS84_A / Math.sqrt(1 - e2 * sinPhi1 * sinPhi1);
    const t1 = tanPhi1 * tanPhi1;
    const c1 = ePrime2 * cosPhi1 * cosPhi1;
    const r1 = (WGS84_A * (1 - e2)) / Math.pow(1 - e2 * sinPhi1 * sinPhi1, 1.5);
    const d = x / (n1 * UTM_K0);

    const latRad =
      phi1 -
      ((n1 * tanPhi1) / r1) *
        ((d * d) / 2 -
          ((5 + 3 * t1 + 10 * c1 - 4 * c1 * c1 - 9 * ePrime2) * d ** 4) / 24 +
          ((61 + 90 * t1 + 298 * c1 + 45 * t1 * t1 - 252 * ePrime2 - 3 * c1 * c1) * d ** 6) /
            720);

    const lonOrigin = degToRad((zone - 1) * 6 - 180 + 3);
    const lonRad =
      lonOrigin +
      (d -
        ((1 + 2 * t1 + c1) * d ** 3) / 6 +
        ((5 - 2 * c1 + 28 * t1 - 3 * c1 * c1 + 8 * ePrime2 + 24 * t1 * t1) * d ** 5) / 120) /
        cosPhi1;

    return { lon: radToDeg(lonRad), lat: radToDeg(latRad) };
  }

  /** X、Y 均大于 100 时视为 UTM 米制坐标 */
  function isUtmToolInput(x, y) {
    return x > 100 && y > 100;
  }

  // ---- WGS84 → GCJ02（火星坐标，高德/腾讯等国内底图使用） ----
  const GCJ_A = 6378245.0;
  const GCJ_EE = 0.00669342162296594323;

  function outOfChina(lng, lat) {
    return !(lng > 73.66 && lng < 135.05 && lat > 3.86 && lat < 53.55);
  }

  function gcjTransformLat(x, y) {
    let ret =
      -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) * 2.0) / 3.0;
    ret +=
      ((160.0 * Math.sin((y / 12.0) * Math.PI) + 320 * Math.sin((y * Math.PI) / 30.0)) * 2.0) / 3.0;
    return ret;
  }

  function gcjTransformLng(x, y) {
    let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    ret += ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0) / 3.0;
    ret += ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) * 2.0) / 3.0;
    ret +=
      ((150.0 * Math.sin((x / 12.0) * Math.PI) + 300.0 * Math.sin((x / 30.0) * Math.PI)) * 2.0) /
      3.0;
    return ret;
  }

  /** WGS84 经纬度 → GCJ02 经纬度 */
  function wgs84ToGcj02(lng, lat) {
    if (outOfChina(lng, lat)) return { lng, lat };
    let dLat = gcjTransformLat(lng - 105.0, lat - 35.0);
    let dLng = gcjTransformLng(lng - 105.0, lat - 35.0);
    const radLat = (lat / 180.0) * Math.PI;
    let magic = Math.sin(radLat);
    magic = 1 - GCJ_EE * magic * magic;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180.0) / (((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic)) * Math.PI);
    dLng = (dLng * 180.0) / ((GCJ_A / sqrtMagic) * Math.cos(radLat) * Math.PI);
    return { lng: lng + dLng, lat: lat + dLat };
  }

  /** GCJ02 经纬度 → WGS84 经纬度（迭代反算） */
  function gcj02ToWgs84(lng, lat) {
    if (outOfChina(lng, lat)) return { lng, lat };
    let wgsLng = lng;
    let wgsLat = lat;
    for (let i = 0; i < 6; i++) {
      const gcj = wgs84ToGcj02(wgsLng, wgsLat);
      wgsLng += lng - gcj.lng;
      wgsLat += lat - gcj.lat;
    }
    return { lng: wgsLng, lat: wgsLat };
  }

  global.CoordTransform = {
    parseUtmZoneFromProjection,
    parseUtmNorthernFromProjection,
    inferUtmNorthernFromNorthing,
    wgs84ToUtm,
    utmToWgs84,
    isUtmToolInput,
    wgs84ToGcj02,
    gcj02ToWgs84,
  };
})(typeof window !== "undefined" ? window : globalThis);
