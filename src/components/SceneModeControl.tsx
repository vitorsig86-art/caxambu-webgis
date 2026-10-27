import { SceneMode } from "cesium";
import "./SceneModeControl.css";

export function SceneModeControl({ mode, disabled, onChange }: {
  mode: SceneMode;
  disabled: boolean;
  onChange: (mode: SceneMode.SCENE2D | SceneMode.SCENE3D) => void;
}) {
  return <div className="scene-mode-control" role="group" aria-label="Visualização do mapa">
    <button type="button" disabled={disabled} aria-pressed={mode === SceneMode.SCENE3D} onClick={() => onChange(SceneMode.SCENE3D)}>3D</button>
    <button type="button" disabled={disabled} aria-pressed={mode === SceneMode.SCENE2D} onClick={() => onChange(SceneMode.SCENE2D)}>2D</button>
    {mode === SceneMode.SCENE2D && <small>Vista 2D · modelos e cotas disponíveis em 3D</small>}
  </div>;
}
