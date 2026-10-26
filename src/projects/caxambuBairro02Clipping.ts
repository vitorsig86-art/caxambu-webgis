import type { ModelClippingConfig } from "./types";

// Diagnóstico independente: recarregar com ?clipping3d-bairro02=off
// carrega o modelo completo, sem criar sua coleção de clipping.
const withoutClipping = typeof window !== "undefined"
  && new URLSearchParams(window.location.search).get("clipping3d-bairro02") === "off";

export const caxambuBairro02Clipping: ModelClippingConfig | undefined = withoutClipping ? undefined : {
  inverse: true,
  positions: [
    [-44.9309836474756, -21.98481509614557],
    [-44.925062762068464, -21.986926345050794],
    [-44.923726690678606, -21.986622764727027],
    [-44.92192477875869, -21.976312601927106],
    [-44.92232148423589, -21.975696654678227],
    [-44.92955050325069, -21.975348991953485],
  ],
};
