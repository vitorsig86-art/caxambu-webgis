import { useEffect, useRef } from "react";
import { Cartesian2, Cartesian3, SceneTransforms, type Viewer } from "cesium";
import { categoryStyle } from "./communityCategories";
import type { LocalDraft } from "./localDrafts";

interface Props {
  viewer: Viewer | null;
  drafts: LocalDraft[];
  selectedId?: string;
  newId?: string;
  dimmed?: boolean;
  onSelect: (id: string) => void;
}

export function CommunityMarkers({ viewer, drafts, selectedId, newId, dimmed = false, onSelect }: Props) {
  const elements = useRef(new Map<string, HTMLButtonElement>());
  const placed = drafts.filter((draft): draft is LocalDraft & { location: [number, number] } => Boolean(draft.location));

  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    const positions = placed.map(draft => ({ id: draft.id, world: Cartesian3.fromDegrees(draft.location[0], draft.location[1]) }));
    const scratch = new Cartesian2();
    function place() {
      if (!viewer || viewer.isDestroyed()) return;
      for (const { id, world } of positions) {
        const element = elements.current.get(id);
        if (!element) continue;
        const screen = SceneTransforms.worldToWindowCoordinates(viewer.scene, world, scratch);
        element.style.visibility = screen ? "visible" : "hidden";
        if (screen) element.style.transform = `translate(${screen.x}px, ${screen.y}px)`;
      }
    }
    place();
    viewer.scene.requestRender();
    // Markers follow the camera only when Cesium actually renders (requestRenderMode).
    return viewer.scene.postRender.addEventListener(place);
  }, [viewer, placed.map(draft => `${draft.id}:${draft.location.join(",")}`).join("|")]);

  return <div className={`bv-markers${dimmed ? " is-dimmed" : ""}`}>
    {placed.map(draft => {
      const style = categoryStyle[draft.category];
      return <button
        key={draft.id}
        type="button"
        ref={element => { if (element) elements.current.set(draft.id, element); else elements.current.delete(draft.id); }}
        className={`bv-marker is-${style.key}${draft.id === selectedId ? " is-selected" : ""}${draft.id === newId ? " is-new" : ""}`}
        aria-label={`${style.short}: ${draft.title}`}
        aria-pressed={draft.id === selectedId}
        onClick={() => onSelect(draft.id)}
      >
        {draft.id === newId && <><span className="bv-marker-ring" /><span className="bv-marker-ring is-late" /></>}
        <span className="bv-marker-pin"><span className={`bv-shape is-${style.shape}`}><span /></span><span className="bv-marker-stem" /></span>
        <span className="bv-marker-shadow" />
        {draft.id === selectedId && <span className="bv-marker-label">{draft.title}</span>}
      </button>;
    })}
  </div>;
}
