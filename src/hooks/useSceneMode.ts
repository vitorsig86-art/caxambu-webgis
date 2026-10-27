import { useEffect, useRef, useState } from "react";
import { SceneMode, type Viewer } from "cesium";
import { createSceneModeController } from "../cesium/sceneMode";

export function useSceneMode(viewer: Viewer | null, enabled: boolean) {
  const [mode, setMode] = useState<SceneMode>(SceneMode.SCENE3D);
  const controller = useRef<ReturnType<typeof createSceneModeController> | null>(null);
  useEffect(() => {
    if (!enabled || !viewer || viewer.isDestroyed()) return;
    const instance = createSceneModeController(viewer);
    controller.current = instance;
    const sync = () => setMode(viewer.scene.mode);
    const removeStart = viewer.scene.morphStart.addEventListener(() => setMode(SceneMode.MORPHING));
    const removeComplete = viewer.scene.morphComplete.addEventListener(sync);
    sync();
    return () => {
      removeStart(); removeComplete(); instance.dispose();
      if (controller.current === instance) controller.current = null;
    };
  }, [viewer, enabled]);
  return { mode, change: (next: SceneMode.SCENE2D | SceneMode.SCENE3D) => controller.current?.change(next) };
}
