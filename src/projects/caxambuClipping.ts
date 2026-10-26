import type { ModelClippingConfig } from "./types";

// Experimento reversível: recarregar com ?clipping3d=off para não criar coleção.
// Sem parâmetro ou com ?clipping3d=on, preservar apenas o interior do polígono.
const withoutClipping = typeof window !== "undefined"
  && new URLSearchParams(window.location.search).get("clipping3d") === "off";

export const caxambuExperimentalClipping: ModelClippingConfig | undefined = withoutClipping ? undefined : {
  inverse: true,
  positions: [
    [-44.94038526195777, -21.98779525031519],
    [-44.93660005364954, -21.99775947700435],
    [-44.927308385487095, -21.99884998007564],
    [-44.924792156366124, -21.99057608372908],
    [-44.93460867975806, -21.98461610586871],
  ],
};
