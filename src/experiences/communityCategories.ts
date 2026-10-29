import type { LocalDraft } from "./localDrafts";

export type DraftCategory = LocalDraft["category"];

// Shape + color keeps categories distinguishable without relying on color alone.
export const categoryStyle: Record<DraftCategory, { key: string; short: string; hint: string; shape: "circle" | "square" | "diamond" }> = {
  "Natureza e ambiente": { key: "natureza", short: "Natureza", hint: "Árvores, nascentes, jardins, bichos", shape: "circle" },
  "Cuidado com o bairro": { key: "cuidado", short: "Cuidado", hint: "Calçadas, lixo, bueiros, iluminação", shape: "square" },
  "Ideia para a comunidade": { key: "ideia", short: "Ideia", hint: "Algo que faria bem a todos", shape: "diamond" },
};
