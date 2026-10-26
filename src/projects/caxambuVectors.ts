import type { ProjectLayerConfig } from "./types";

const vectorBaseUrl = "https://pub-71273808da264f9aaf13a3c86a1f1a27.r2.dev/geojson";

// Use the existing display-only altitude removal and ground polyline mechanism.
// Source attributes (including ELEVATION) remain intact; no vertical offset or
// survey datum transformation is applied. Ground lines classify terrain and
// compatible 3D Tiles through Cesium's default ClassificationType.BOTH.
export const caxambuVectors: ProjectLayerConfig[] = [
  {
    id: "contours-3m", name: "Curvas de nível — 3 m", description: "Curvas de nível do levantamento por drone, com equidistância de 3 m", kind: "contours", group: "vector",
    defaultVisible: false,
    source: {
      format: "geojson", url: `${vectorBaseUrl}/curvas_3m.geojson`, autoZoom: false, ignoreAltitude: true,
      style: { stroke: "#292929", strokeWidth: 1, fill: "#00000000", clampToGround: true, zIndex: 10 },
      popup: { title: "Curvas de nível — 3 m", fields: [
        { property: "ELEVATION", label: "Cota", suffix: " m" },
        { property: "CLOSED_CONTOUR", label: "Curva fechada" },
      ] },
    },
  },
  {
    id: "simulated-drainage", name: "Drenagem simulada", description: "Rede de drenagem simulada a partir do levantamento por drone; não confirmada em campo", kind: "drainage", group: "vector",
    defaultVisible: false,
    source: {
      format: "geojson", url: `${vectorBaseUrl}/drenagem.geojson`, autoZoom: false, ignoreAltitude: true,
      style: {
        stroke: "#2457B2", strokeWidth: 1.2, fill: "#00000000", clampToGround: true, zIndex: 20,
        classification: { property: "STRAHLER", classes: {
          "1": { stroke: "#15DEEF", strokeWidth: 1.2, zIndex: 20 },
          "2": { stroke: "#08B5ED", strokeWidth: 1.8, zIndex: 21 },
          "3": { stroke: "#0087EB", strokeWidth: 2.6, zIndex: 22 },
          "4": { stroke: "#0062E8", strokeWidth: 3.8, zIndex: 23 },
          "5": { stroke: "#003DE0", strokeWidth: 5.2, zIndex: 24 },
        } },
      },
      popup: { title: "Drenagem simulada — não confirmada em campo", fields: [
        { property: "STRAHLER", label: "Ordem de Strahler", format: "integer" },
        { property: "STREAM_ID", label: "Identificador do trecho" },
        { property: "DRAIN_AREA", label: "Área de contribuição" },
        { property: "IN_FLOW", label: "IN_FLOW (técnico)" },
        { property: "OUT_FLOW", label: "OUT_FLOW (técnico)" },
      ] },
    },
  },
];
