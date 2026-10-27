import { Ion, SceneMode, Viewer } from "cesium";

export function createViewer(container: HTMLElement, allow2D = false, initialMode = SceneMode.SCENE3D): Viewer {
  Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_ION_TOKEN?.trim() ?? "";

  return new Viewer(container, {
    baseLayer: false,
    baseLayerPicker: false,
    geocoder: false,
    animation: false,
    timeline: false,
    homeButton: false,
    navigationHelpButton: false,
    fullscreenButton: false,
    sceneModePicker: false,
    infoBox: false,
    selectionIndicator: false,
    scene3DOnly: !allow2D,
    sceneMode: initialMode,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,
  });
}
