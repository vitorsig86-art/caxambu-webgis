import { useCallback, useRef, useState } from "react";
import { HeadingPitchRange, Math as CesiumMath, type Entity, type Viewer } from "cesium";
import { beginManagedFlight, captureCamera, createCameraView, flyToCameraSettled, restoreCamera, type CameraSnapshot } from "../cesium/projectCamera";
import type { VectorPopupActionLink } from "../cesium/vectorPopup";
import type { ProjectCameraConfig } from "../projects/types";

export interface EmbeddedPage { url: string; title: string }

// Popup actions: fly (to the feature or to the Home view), then open the page over
// the map. getHome returns the Home view of the current experience. The page also
// opens when the flight is interrupted.
export function useEmbeddedPage(viewer: Viewer | null, getHome: () => ProjectCameraConfig) {
  const [page, setPage] = useState<EmbeddedPage | null>(null);
  const saved = useRef<{ snapshot: CameraSnapshot; onClose: VectorPopupActionLink["onClose"] } | null>(null);
  const homeRef = useRef(getHome);
  homeRef.current = getHome;

  const openPage = useCallback(async ({ action, title, entity }: { action: VectorPopupActionLink; title: string; entity: Entity }) => {
    if (action.target === "tab") { window.open(action.url, "_blank", "noopener"); return; }
    if (viewer && !viewer.isDestroyed()) {
      viewer.selectedEntity = undefined;
      if (action.flyTo === "home") {
        await flyToCameraSettled(viewer, homeRef.current(), 1.6);
      } else if (action.flyTo) {
        // Fly to the polygon when the click hit one of its outline helpers.
        const target = entity.parent?.polygon ? entity.parent : entity;
        const end = beginManagedFlight(viewer);
        try {
          await viewer.flyTo(target, { duration: 1.6, offset: new HeadingPitchRange(viewer.camera.heading, CesiumMath.toRadians(-45), 0) });
        } finally { end(); }
      }
    }
    saved.current = viewer && !viewer.isDestroyed() ? { snapshot: captureCamera(viewer), onClose: action.onClose } : null;
    setPage({ url: action.url, title });
  }, [viewer]);

  // Closing never animates: "keep" restores the pose saved at opening (only if
  // something moved it), "home" jumps to the Home view.
  const closePage = useCallback(() => {
    const current = saved.current;
    saved.current = null;
    setPage(null);
    if (!current || !viewer || viewer.isDestroyed()) return;
    if (current.onClose === "home") {
      viewer.camera.cancelFlight();
      viewer.camera.setView(createCameraView(homeRef.current()));
      viewer.scene.requestRender();
    } else restoreCamera(viewer, current.snapshot);
  }, [viewer]);

  return { page, openPage, closePage };
}
