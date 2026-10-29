import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  CustomDataSource,
  HorizontalOrigin,
  LabelStyle,
  Math as CesiumMath,
  OrthographicOffCenterFrustum,
  PolylineDashMaterialProperty,
  SceneMode,
  VerticalOrigin,
  type Viewer,
} from "cesium";

type LonLat = [longitude: number, latitude: number];

function dms(value: number, positive: string, negative: string) {
  const absolute = Math.abs(value);
  let degrees = Math.floor(absolute);
  let minutes = Math.floor((absolute - degrees) * 60);
  let seconds = Math.round(((absolute - degrees) * 60 - minutes) * 60);
  if (seconds === 60) { seconds = 0; minutes += 1; }
  if (minutes === 60) { minutes = 0; degrees += 1; }
  return `${degrees}°${String(minutes).padStart(2, "0")}′${String(seconds).padStart(2, "0")}″${value < 0 ? negative : positive}`;
}

export function formatCoordinate([longitude, latitude]: LonLat) {
  return `${dms(latitude, "N", "S")} ${dms(longitude, "L", "O")}`;
}

export function distanceMeters(a: LonLat, b: LonLat) {
  const radians = Math.PI / 180;
  const dLat = (b[1] - a[1]) * radians, dLon = (b[0] - a[0]) * radians;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * radians) * Math.cos(b[1] * radians) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

export function formatDistance(meters: number) {
  return meters < 1000 ? `${Math.round(meters / 10) * 10} m` : `${(meters / 1000).toFixed(1).replace(".", ",")} km`;
}

// Background layers for a centered thumbnail from a 256 px XYZ/TMS template.
export function tileThumbnail(template: string | undefined, [longitude, latitude]: LonLat, size: number, zoom = 17) {
  if (!template || !/\{x\}/.test(template) || !/\{(y|reverseY)\}/.test(template)) return undefined;
  const scale = 256 * 2 ** zoom;
  const sin = Math.sin(latitude * Math.PI / 180);
  const x = (longitude + 180) / 360 * scale;
  const y = (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale;
  const tileX = Math.floor(x / 256), tileY = Math.floor(y / 256);
  const px = x - tileX * 256, py = y - tileY * 256;
  const dx = px < 128 ? -1 : 1, dy = py < 128 ? -1 : 1;
  const tiles = [[0, 0], [dx, 0], [0, dy], [dx, dy]].map(([a, b]) => ({
    url: template.replace("{z}", String(zoom)).replace("{x}", String(tileX + a))
      .replace("{reverseY}", String(2 ** zoom - 1 - (tileY + b))).replace("{y}", String(tileY + b)),
    position: `${Math.round(size / 2 - px + a * 256)}px ${Math.round(size / 2 - py + b * 256)}px`,
  }));
  return {
    backgroundImage: tiles.map(tile => `url("${tile.url}")`).join(", "),
    backgroundPosition: tiles.map(tile => tile.position).join(", "),
    backgroundSize: "256px 256px",
    backgroundRepeat: "no-repeat",
  };
}

export function screenCenter(viewer: Viewer): LonLat | undefined {
  const center = new Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2);
  const point = viewer.camera.pickEllipsoid(center, viewer.scene.globe.ellipsoid);
  if (!point) return undefined;
  const geographic = Cartographic.fromCartesian(point);
  return [CesiumMath.toDegrees(geographic.longitude), CesiumMath.toDegrees(geographic.latitude)];
}

// Only defined for the orthographic 2D view used by the community experience.
export function metersPerPixel(viewer: Viewer) {
  const frustum = viewer.camera.frustum;
  if (viewer.scene.mode !== SceneMode.SCENE2D || !(frustum instanceof OrthographicOffCenterFrustum)) return undefined;
  const width = (frustum.right ?? 0) - (frustum.left ?? 0);
  return width > 0 && viewer.canvas.clientWidth > 0 ? width / viewer.canvas.clientWidth : undefined;
}

// Centers a point, shifted up by offsetPixels so a bottom panel does not cover it.
export function flyToPoint(viewer: Viewer, [longitude, latitude]: LonLat, offsetPixels = 0) {
  const perPixel = metersPerPixel(viewer);
  const frustum = viewer.camera.frustum;
  if (!perPixel || !(frustum instanceof OrthographicOffCenterFrustum)) return;
  const width = (frustum.right ?? 0) - (frustum.left ?? 0);
  const shift = offsetPixels * perPixel / 111320;
  viewer.camera.flyTo({
    destination: Cartesian3.fromDegrees(longitude, latitude - shift, width),
    orientation: { heading: 0, pitch: -CesiumMath.PI_OVER_TWO, roll: 0 },
    duration: 0.6,
  });
}

export function addAreaOutlines(viewer: Viewer, areas: { id: string; label: string; positions: LonLat[] }[]) {
  const source = new CustomDataSource("bairro-vivo-areas");
  const light = Color.fromCssColorString("#f4f2ea");
  for (const area of areas) {
    const ring = Cartesian3.fromDegreesArray([...area.positions, area.positions[0]].flat());
    source.entities.add({ id: `${area.id}-shadow`, polyline: { positions: ring, width: 4.5, material: Color.fromCssColorString("#0f2019").withAlpha(0.55) } });
    source.entities.add({ id: `${area.id}-line`, polyline: { positions: ring, width: 1.6, material: new PolylineDashMaterialProperty({ color: light, gapColor: Color.TRANSPARENT, dashLength: 14 }) } });
    const longitude = area.positions.reduce((sum, point) => sum + point[0], 0) / area.positions.length;
    const latitude = area.positions.reduce((sum, point) => sum + point[1], 0) / area.positions.length;
    source.entities.add({
      id: `${area.id}-label`,
      position: Cartesian3.fromDegrees(longitude, latitude),
      label: {
        text: area.label, font: "600 12px 'IBM Plex Mono', monospace", fillColor: light,
        outlineColor: Color.fromCssColorString("#0f2019"), outlineWidth: 3, style: LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: HorizontalOrigin.CENTER, verticalOrigin: VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      },
    });
  }
  void viewer.dataSources.add(source);
  viewer.scene.requestRender();
  return () => {
    if (!viewer.isDestroyed()) { viewer.dataSources.remove(source, true); viewer.scene.requestRender(); }
  };
}

// Brand mark: the real outlines, projected into a 40 × 40 viewBox.
export function brandMark(areas: { positions: LonLat[] }[], home: LonLat) {
  const all = areas.flatMap(area => area.positions);
  const k = Math.cos(22 * Math.PI / 180);
  const minX = Math.min(...all.map(p => p[0])), maxX = Math.max(...all.map(p => p[0]));
  const minY = Math.min(...all.map(p => p[1])), maxY = Math.max(...all.map(p => p[1]));
  const w = (maxX - minX) * k, h = maxY - minY, scale = 32 / Math.max(w, h);
  const ox = (40 - w * scale) / 2, oy = (40 - h * scale) / 2;
  const project = (p: LonLat) => [ox + (p[0] - minX) * k * scale, oy + (maxY - p[1]) * scale];
  return {
    polygons: areas.map(area => area.positions.map(p => project(p).map(v => v.toFixed(2)).join(",")).join(" ")),
    dot: project(home),
  };
}
