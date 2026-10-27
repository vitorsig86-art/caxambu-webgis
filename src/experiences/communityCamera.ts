import { OrthographicOffCenterFrustum, SceneMode, type Viewer } from "cesium";
import { createCameraView } from "../cesium/projectCamera";
import { communityCameraPreset } from "../projects/communityCamera";

export function communityHomeCamera(width: number, height: number) {
  const preset = communityCameraPreset;
  const aspect = Math.max(1, width) / Math.max(1, height);
  const referenceHeight = preset.referenceWidth * preset.referenceViewport.height / preset.referenceViewport.width;
  // Preserve the reference short-axis extent so portrait screens keep a useful neighborhood scale.
  const horizontalWidth = referenceHeight * Math.max(1, aspect);
  return { longitude: preset.longitude, latitude: preset.latitude, height: horizontalWidth, heading: 0, pitch: -90, roll: 0 };
}

export const communityInitialView = {
  mode: SceneMode.SCENE2D,
  initialize(viewer: Viewer) {
    const width = Math.max(1, viewer.canvas.clientWidth);
    const height = Math.max(1, viewer.canvas.clientHeight);
    const home = communityHomeCamera(width, height);
    viewer.camera.setView(createCameraView(home));
    const frustum = viewer.camera.frustum;
    if (frustum instanceof OrthographicOffCenterFrustum) {
      frustum.left = -home.height / 2;
      frustum.right = home.height / 2;
      frustum.top = home.height * height / width / 2;
      frustum.bottom = -frustum.top;
    }
    viewer.scene.requestRender();
  },
};
