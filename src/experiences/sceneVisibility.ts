import type { ProjectLayerConfig } from "../projects/types";

// Filter the rendered scene without changing the user's saved layer selection.
export function visibleForScene(layers: ProjectLayerConfig[], selected: Set<string>, is2D: boolean): Set<string> {
  if (!is2D) return selected;
  const models = new Set(layers.filter(layer => layer.source.format === "3d-tiles").map(layer => layer.id));
  return new Set([...selected].filter(id => !models.has(id)));
}
