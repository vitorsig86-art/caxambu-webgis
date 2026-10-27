import { Cartesian3, Matrix4, SceneMode, type Viewer } from "cesium";

// Synchronous public morph APIs keep transitions atomic. Reuse the same Viewer.
export function createSceneModeController(viewer: Viewer) {
  let disposed = false;
  let saved3D: Parameters<Viewer["camera"]["setView"]>[0] | undefined;
  return {
    change(mode: SceneMode.SCENE2D | SceneMode.SCENE3D): boolean {
      if (disposed || viewer.isDestroyed() || viewer.scene.scene3DOnly
        || viewer.scene.mode === SceneMode.MORPHING || viewer.scene.mode === mode) return false;
      const { camera, scene } = viewer;
      camera.cancelFlight();
      if (mode === SceneMode.SCENE2D) {
        saved3D = {
          destination: Cartesian3.clone(camera.positionWC),
          orientation: { direction: Cartesian3.clone(camera.directionWC), up: Cartesian3.clone(camera.upWC) },
          endTransform: Matrix4.clone(camera.transform),
        };
        scene.morphTo2D(0);
      } else {
        scene.morphTo3D(0);
        if (saved3D) camera.setView(saved3D);
      }
      scene.requestRender();
      return true;
    },
    dispose() { disposed = true; saved3D = undefined; },
  };
}
