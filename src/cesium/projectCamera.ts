import { Cartesian3, Math as CesiumMath, Rectangle, type Viewer } from "cesium";
import type { ProjectConfig, ProjectCameraConfig } from "../projects/types";

export function createCameraView(camera: ProjectCameraConfig) {
  if ("bounds" in camera) {
    return { destination: Rectangle.fromDegrees(...camera.bounds) };
  }
  return {
    destination: Cartesian3.fromDegrees(camera.longitude, camera.latitude, camera.height),
    orientation: {
      heading: CesiumMath.toRadians(camera.heading),
      pitch: CesiumMath.toRadians(camera.pitch),
      roll: CesiumMath.toRadians(camera.roll),
    },
  };
}

// Omit duration for immediate opening; supply it for an animated Home action.
export function applyProjectCamera(viewer: Viewer, project: ProjectConfig, duration?: number): void {
  if (viewer.isDestroyed()) return;
  const camera = project.initialCamera;
  const view = camera ? createCameraView(camera) : { destination: Rectangle.fromDegrees(...project.bounds) };

  if (duration !== undefined || !camera) {
    // Preserve the existing bounds-based opening for projects without a preset.
    viewer.camera.flyTo({ ...view, duration: duration ?? 1.2 });
  } else {
    viewer.camera.cancelFlight();
    viewer.camera.setView(view);
  }
  viewer.scene.requestRender();
}

// Flights started by the app (popup actions). Same contract as the v3 template:
// a navigation limit, if one is added later, waits until they end or are cancelled.
const managedFlights = new WeakMap<Viewer, number>();

export function beginManagedFlight(viewer: Viewer): () => void {
  managedFlights.set(viewer, (managedFlights.get(viewer) ?? 0) + 1);
  let ended = false;
  return () => {
    if (ended) return;
    ended = true;
    managedFlights.set(viewer, Math.max(0, (managedFlights.get(viewer) ?? 1) - 1));
    if (!viewer.isDestroyed()) viewer.scene.requestRender();
  };
}

export function isManagedFlightActive(viewer: Viewer): boolean {
  return (managedFlights.get(viewer) ?? 0) > 0;
}

// Animated flight as a promise that settles when it ends or is cancelled.
export function flyToCameraSettled(viewer: Viewer, camera: ProjectCameraConfig, duration = 1.2): Promise<void> {
  if (viewer.isDestroyed()) return Promise.resolve();
  const end = beginManagedFlight(viewer);
  return new Promise(resolve => {
    const done = () => { end(); resolve(); };
    viewer.camera.flyTo({ ...createCameraView(camera), duration, complete: done, cancel: done });
    viewer.scene.requestRender();
  });
}

// Exact camera pose, to put the camera back after an overlay (embedded page).
export interface CameraSnapshot { position: Cartesian3; heading: number; pitch: number; roll: number }

export function captureCamera(viewer: Viewer): CameraSnapshot {
  const { camera } = viewer;
  return { position: Cartesian3.clone(camera.positionWC), heading: camera.heading, pitch: camera.pitch, roll: camera.roll };
}

// Restores the pose without animation, only when something moved it. Returns true when it restored.
export function restoreCamera(viewer: Viewer, snapshot: CameraSnapshot): boolean {
  if (viewer.isDestroyed()) return false;
  const { camera } = viewer;
  camera.cancelFlight();
  const same = Cartesian3.equalsEpsilon(camera.positionWC, snapshot.position, 0, 1e-3)
    && [[camera.heading, snapshot.heading], [camera.pitch, snapshot.pitch], [camera.roll, snapshot.roll]]
      .every(([a, b]) => CesiumMath.equalsEpsilon(CesiumMath.negativePiToPi(a - b), 0, 1e-6));
  if (same) return false;
  camera.setView({ destination: snapshot.position, orientation: { heading: snapshot.heading, pitch: snapshot.pitch, roll: snapshot.roll } });
  viewer.scene.requestRender();
  return true;
}
