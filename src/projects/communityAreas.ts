import { bairro01Positions } from "./caxambuClipping";
import { bairro02Positions } from "./caxambuBairro02Clipping";

// Áreas de cobertura do Bairro Vivo (recorte dos modelos 3D), não limites oficiais.
export const communityAreas = [
  { id: "bairro-01", label: "BAIRRO 01", positions: bairro01Positions },
  { id: "bairro-02", label: "BAIRRO 02", positions: bairro02Positions },
];

export const communityPlace = {
  eyebrow: "CAXAMBU · MINAS GERAIS",
  // Miniaturas dos cards usam o ortomosaico configurado (TMS 256 px).
  thumbnailLayerId: "orthomosaic",
};

// Nomes em língua de morador para o painel Explorar. IDs sem entrada mantêm o texto técnico.
export const communityLayerCopy: Record<string, { name: string; description: string }> = {
  "basemap": { name: "Mapa de fundo", description: "Imagem de satélite com nomes de ruas" },
  "orthomosaic": { name: "Foto aérea — Bairro 01", description: "Ortomosaico por drone, com telhados e ruas" },
  "orthomosaic-bairro-02": { name: "Foto aérea — Bairro 02", description: "Ortomosaico por drone do bairro vizinho" },
  "mdt": { name: "Forma do terreno (MDT)", description: "O chão, sem casas nem árvores" },
  "mds": { name: "Superfície (MDS)", description: "O chão com tudo o que está sobre ele" },
  "slope": { name: "Declividade", description: "Onde a rua sobe mais forte" },
  "aspect": { name: "Orientação das vertentes", description: "Para onde cada encosta está virada" },
  "contours-3m": { name: "Curvas de nível — 3 m", description: "Linhas de mesma altura, a cada 3 metros" },
  "simulated-drainage": { name: "Drenagem simulada", description: "Por onde a chuva tende a correr. Não confirmada em campo." },
};
