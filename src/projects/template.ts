import type { GeographicBounds, ProjectConfig, ProjectLayerConfig } from "./types";
import { caxambuExperimentalClipping } from "./caxambuClipping";

// EDIT: illustrative W/S/E/N extent in degrees, not a property boundary.
const bounds: GeographicBounds = [-1, -1, 1, 1];
const basemap: ProjectLayerConfig = {
  id: "basemap", name: "Bing Aerial com rótulos", description: "Bing Maps via Cesium ion", kind: "basemap",
  source: {
    format: "ion-world-imagery",
    fallback: {
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      credit: '<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">© OpenStreetMap contributors</a>',
      maximumLevel: 19,
    },
  },
  defaultVisible: true,
};

// EDIT URLs, bounds, zoom levels, labels and legends, then add the configured
// entries to templateProject.layers. example.invalid is reserved for examples.
// Confirmed edge tile 404/410 errors are recoverable automatically.
export const exampleLayers: ProjectLayerConfig[] = [{
  id: "raster-example-a", name: "Raster A", description: "Descrição do seu raster", kind: "raster",
  source: {
    format: "tms", url: "https://example.invalid/raster-a/{z}/{x}/{reverseY}.png",
    credit: "Seu projeto", bounds, minimumLevel: 0, maximumLevel: 8,
    tileWidth: 256, tileHeight: 256, allowMissingTiles: false,
  },
  defaultVisible: false,
  legend: { type: "image", title: "Raster A", imageUrl: "/legends/example.png", imageAlt: "Legenda ilustrativa; substitua pelos valores do seu raster" },
}, {
  id: "raster-example-b", name: "Raster B", description: "Segundo raster independente", kind: "raster",
  source: {
    format: "tms", url: "https://example.invalid/raster-b/{z}/{x}/{reverseY}.png",
    credit: "Seu projeto", bounds, minimumLevel: 0, maximumLevel: 8,
    tileWidth: 256, tileHeight: 256, allowMissingTiles: false,
  },
  defaultVisible: false,
  legend: { type: "image", title: "Raster B", imageUrl: "/legends/example.png", imageAlt: "Legenda ilustrativa do segundo raster" },
}, {
  id: "vector-example", name: "Vetor", description: "Descrição do seu vetor", kind: "vector",
  source: {
    format: "geojson", url: "https://example.invalid/vector.geojson", autoZoom: false,
    style: { stroke: "#ff0000", strokeWidth: 3, fill: "#00000000", clampToGround: true, zIndex: 1 },
  },
  defaultVisible: false,
}, {
  id: "model-example", name: "Modelo 3D", description: "Descrição do seu modelo", kind: "3d-tiles",
  source: { format: "3d-tiles", source: "url", url: "https://example.invalid/tileset.json" },
  defaultVisible: false,
}];

// Limites de cobertura dos XMLs fornecidos; não representam limites territoriais.
const orthomosaicBounds: GeographicBounds = [-45.00000000, -22.10599880, -44.82421875, -21.94304553];
const thematicBounds: GeographicBounds = [-45.00000000, -22.59372606, -44.29687500, -21.94304553];
const rasterBaseUrl = "https://pub-71273808da264f9aaf13a3c86a1f1a27.r2.dev";

// TMS global-mercator (EPSG:900913/3857), PNG 256 × 256, origem Y ao sul.
// Todos são imagens sobre o terreno; não fornecem altitude às medições.
const caxambuRasters: ProjectLayerConfig[] = [
  {
    id: "orthomosaic", name: "Ortomosaico RGB", description: "Ortomosaico RGB de Caxambu-MG", kind: "orthomosaic", group: "raster",
    source: {
      format: "tms", url: `${rasterBaseUrl}/orto/{z}/{x}/{reverseY}.png`, credit: "Caxambu-MG",
      bounds: orthomosaicBounds, minimumLevel: 11, maximumLevel: 20, tileWidth: 256, tileHeight: 256,
    },
    defaultVisible: true, opacityControl: true,
  },
  {
    id: "mdt", name: "Modelo Digital do Terreno (MDT)", description: "MDT como imagem temática; não fornece altitude às medições", kind: "dtm", group: "raster",
    source: {
      format: "tms", url: `${rasterBaseUrl}/mdt/{z}/{x}/{reverseY}.png`, credit: "Caxambu-MG",
      bounds: thematicBounds, minimumLevel: 9, maximumLevel: 18, tileWidth: 256, tileHeight: 256,
    },
    defaultVisible: false, opacityControl: true,
  },
  {
    id: "mds", name: "Modelo Digital de Superfície (MDS)", description: "MDS como imagem temática; não fornece altitude às medições", kind: "dsm", group: "raster",
    source: {
      format: "tms", url: `${rasterBaseUrl}/mds/{z}/{x}/{reverseY}.png`, credit: "Caxambu-MG",
      bounds: thematicBounds, minimumLevel: 9, maximumLevel: 18, tileWidth: 256, tileHeight: 256,
    },
    defaultVisible: false, opacityControl: true,
  },
  {
    id: "slope", name: "Declividade", description: "Imagem temática de declividade", kind: "slope", group: "raster",
    source: {
      format: "tms", url: `${rasterBaseUrl}/decli/{z}/{x}/{reverseY}.png`, credit: "Caxambu-MG",
      bounds: thematicBounds, minimumLevel: 9, maximumLevel: 18, tileWidth: 256, tileHeight: 256,
    },
    defaultVisible: false, opacityControl: true,
  },
  {
    id: "aspect", name: "Orientação das vertentes", description: "Imagem temática de orientação das vertentes", kind: "solar-orientation", group: "raster",
    source: {
      format: "tms", url: `${rasterBaseUrl}/aspect/{z}/{x}/{reverseY}.png`, credit: "Caxambu-MG",
      bounds: thematicBounds, minimumLevel: 9, maximumLevel: 18, tileWidth: 256, tileHeight: 256,
    },
    defaultVisible: false, opacityControl: true,
  },
];

export const templateProject: ProjectConfig = {
  id: "caxambu-mg", name: "Caxambu-MG", location: "Caxambu, Minas Gerais, Brasil", bounds: orthomosaicBounds,
  // Câmera definitiva capturada manualmente, compartilhada pela abertura e Home.
  // Longitude, latitude e orientação em graus; altura em metros, sem arredondamento.
  initialCamera: {
    longitude: -44.93237230001976,
    latitude: -22.00047743504755,
    height: 1331.7059496372597,
    heading: 3.72224507024631,
    pitch: -30.182835770694805,
    roll: 359.9980013110771,
  },
  // Exemplos continuam excluídos da lista ativa.
  layers: [basemap, ...caxambuRasters, {
    id: "photogrammetric-model", name: "Modelo fotogramétrico 3D", description: "Modelo fotogramétrico de Caxambu-MG", kind: "3d-tiles", group: "model",
    source: {
      format: "3d-tiles", source: "ion", assetId: 4131174, tokenEnv: "VITE_CESIUM_3D_TOKEN",
      ...(caxambuExperimentalClipping ? { clipping: caxambuExperimentalClipping } : {}),
    },
    defaultVisible: false,
  }],
  // Optional UI has no data or presets in a fresh template.
  scenes: [],
  diagnostic: { steps: [] },
  // temporalComparison: { left: "configured-period-a", right: "configured-period-b" },
  // Add temporalCampaign to configured XYZ/TMS overlays to show the selector.
  developmentTools: { modelAlignment: false, cropAuthoring: false, cameraCapture: false },
};

// Additional v2 examples are deliberately inactive. Replace all placeholders
// before adding them to templateProject.layers. These are synthetic categories.
export const thematicExamples: ProjectLayerConfig[] = [
  {
    id: "areas-example", name: "Áreas temáticas", description: "Classes ilustrativas", kind: "vector", defaultVisible: false, opacityControl: true,
    source: {
      format: "geojson", url: "https://example.invalid/areas.geojson", autoZoom: false, uniqueFeatureIds: true,
      style: {
        stroke: "#32404A", strokeWidth: 3, fill: "#B6C3CF", fillOpacity: 0.35, clampToGround: true, zIndex: 1,
        classification: { property: "class_code", classes: { A: { fill: "#285F9E" }, B: { fill: "#C68524" } } },
        outline: { property: "color_index", colors: ["#285F9E", "#C68524", "#6B4E99"], width: 3, fallbackColor: "#32404A" },
      },
      popup: { title: "Área temática", titleProperty: "label", fields: [
        { property: "size", label: "Área", decimals: 2, suffix: " ha" },
        { property: "value_count", label: "Quantidade", format: "integer" },
        { property: "class_code", label: "Classe", prefix: "Código " },
      ] },
    },
  },
  {
    id: "lines-example", name: "Linhas classificadas", description: "Hierarquia ilustrativa", kind: "vector", defaultVisible: false,
    source: {
      format: "geojson", url: "https://example.invalid/lines.geojson", autoZoom: false, ignoreAltitude: true, uniqueFeatureIds: true,
      style: {
        stroke: "#32404A", strokeWidth: 1, clampToGround: true, zIndex: 10,
        classification: { property: "level_code", classes: {
          minor: { stroke: "#34B3C8", strokeWidth: 1, zIndex: 10 },
          major: { stroke: "#2457B2", strokeWidth: 3.5, zIndex: 11 },
        } },
      },
      popup: { title: "Linha", titleProperty: "label", titlePrefix: "Trecho ", fields: [{ property: "level_code", label: "Classe" }] },
    },
  },
  {
    id: "ion-model-example", name: "Modelo ion", description: "Substitua o assetId ilustrativo", kind: "3d-tiles", defaultVisible: false,
    source: { format: "3d-tiles", source: "ion", assetId: 0, tokenEnv: "VITE_CESIUM_3D_TOKEN", heightOffsetMeters: 0 },
  },
];

// Synthetic polygon near 0°; never use this boundary for a real property.
// Attach to a configured model source only after replacing all coordinates.
export const exampleClipping = {
  enabled: true, inverse: true,
  positions: [[-0.01, -0.01], [0.01, -0.01], [0.01, 0.01], [-0.01, 0.01]] as [number, number][],
};
