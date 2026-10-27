import { lazy, Suspense, useMemo, useState } from "react";
import { projects } from "./projects";
import { LayerPanel } from "./components/LayerPanel";
import { Legend } from "./components/Legend";
import { NavigationControls } from "./components/NavigationControls";
import { MeasurementToolbar } from "./components/MeasurementToolbar";
import { VectorPopup } from "./components/VectorPopup";
import { ModeSwitcher, type MapMode } from "./components/ModeSwitcher";
import { DiagnosticJourney } from "./components/DiagnosticJourney";
import { TemporalComparison } from "./components/TemporalComparison";
import { SceneMode } from "cesium";
import { SceneModeControl } from "./components/SceneModeControl";
import { resolveTechnicalExperience } from "./experiences/technical";
import { visibleForScene } from "./experiences/sceneVisibility";
import { useSceneMode } from "./hooks/useSceneMode";
import { configuredVisibility, isTemporalLayer } from "./projects/layerVisibility";

import { useCesiumViewer } from "./hooks/useCesiumViewer";
import { useProjectLayers } from "./hooks/useProjectLayers";
import type { ProjectConfig, TemporalComparisonSelection } from "./projects/types";

const ModelDevelopmentTools = import.meta.env.DEV ? lazy(() => import("./components/ModelDevelopmentTools")) : null;

function defaultVisibility(project: ProjectConfig) {
  return configuredVisibility(project.layers, project.layers.filter((layer) => layer.defaultVisible).map((layer) => layer.id));
}

export function App() {
  const project = projects[0];
  const [experience] = useState(() => resolveTechnicalExperience(window.location.search));
  const [visible, setVisible] = useState(() => defaultVisibility(projects[0]));
  const [panelOpen, setPanelOpen] = useState(false);
  const [mode, setMode] = useState<MapMode>("explore");
  const [diagnosticStep, setDiagnosticStep] = useState(0);
  const [comparison, setComparison] = useState<TemporalComparisonSelection | null>(null);
  const campaigns = project.layers.filter(isTemporalLayer);
  const comparisonPreset = project.temporalComparison;
  const canCompare = campaigns.length >= 2 && comparisonPreset
    && campaigns.some(layer => layer.id === comparisonPreset.left)
    && campaigns.some(layer => layer.id === comparisonPreset.right);
  const diagnosticSteps = project.diagnostic?.steps ?? [];
  // Comparison is temporary: exiting restores the simple temporal selection.
  const displayVisible = useMemo(() => {
    if (!comparison) return visible;
    const next = new Set(visible);
    for (const layer of project.layers) if (isTemporalLayer(layer)) next.delete(layer.id);
    next.add(comparison.left);
    next.add(comparison.right);
    return next;
  }, [visible, comparison, project]);
  const { containerRef, viewer, error } = useCesiumViewer(Boolean(project.developmentTools?.cameraCapture), experience.allow2D);
  const sceneMode = useSceneMode(viewer, experience.allow2D);
  const is2D = sceneMode.mode === SceneMode.SCENE2D;
  const modelVisible = useMemo(() => visibleForScene(project.layers, displayVisible, is2D), [displayVisible, is2D, project]);
  const { statuses, mapWarning, rasterOpacities, setRasterOpacity, getModel } = useProjectLayers(viewer, project, modelVisible, comparison);
  const legendLayers = project.layers.filter((layer) => layer.legend && layer.legendMode !== "embedded" && displayVisible.has(layer.id));

  function toggleLayer(id: string) {
    if (is2D && project.layers.find(layer => layer.id === id)?.source.format === "3d-tiles") return;
    if (comparison && campaigns.some(layer => layer.id === id)) return;
    setVisible((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return configuredVisibility(project.layers, next);
    });
  }

  function applyScene(layerIds: string[]) {
    setComparison(null);
    setVisible(configuredVisibility(project.layers, layerIds));
  }

  function changeDiagnosticStep(index: number) {
    const step = diagnosticSteps[index];
    if (!step) return;
    setDiagnosticStep(index);
    if (step.layerIds) applyScene(step.layerIds);
  }

  function changeMode(next: MapMode) {
    setComparison(null);
    setMode(next);
    if (next === "diagnostic") changeDiagnosticStep(0);
  }

  return (
    <main className="app-shell">
      <div ref={containerRef} className="map-container" aria-label="Mapa 3D interativo do projeto" />
      {experience.allow2D && <SceneModeControl mode={sceneMode.mode} disabled={!viewer || Boolean(error) || sceneMode.mode === SceneMode.MORPHING} onChange={sceneMode.change} />}
      {comparison && viewer && <TemporalComparison viewer={viewer} layers={project.layers} selection={comparison}
        visible={displayVisible} statuses={statuses} rasterOpacities={rasterOpacities} drawerOpen={panelOpen}
        onChange={setComparison} onExit={() => setComparison(null)} />}
      <header className="app-header">
        <a className="brand" href="/?experience=technical" aria-label="Página inicial do Cardeal Map Viewer">
          <img src="/logo-cardeal.png" alt="" />
          <span><strong>CARDEAL</strong><span>Map Viewer</span></span>
        </a>
        <span className="header-divider" />
        <span className="header-context">Área de trabalho geoespacial</span>
        <a href="/?experience=community" className="community-entry-link">Bairro Vivo</a>
        <button className="panel-toggle mobile-only" aria-expanded={panelOpen} aria-controls="layer-panel" onClick={() => setPanelOpen(!panelOpen)}>☰ <span>Camadas</span></button>
      </header>
      {diagnosticSteps.length > 0 && <ModeSwitcher mode={mode} onChange={changeMode} />}
      {mode === "diagnostic" && diagnosticSteps.length > 0 && <DiagnosticJourney steps={diagnosticSteps}
        stepIndex={diagnosticStep} onStepChange={changeDiagnosticStep} onExplore={() => changeMode("explore")} />}
      {panelOpen && <button type="button" className="drawer-backdrop" aria-label="Fechar painel de camadas" onClick={() => setPanelOpen(false)} />}
      <aside id="layer-panel" aria-label="Área de trabalho e camadas" className={`layer-panel ${panelOpen ? "is-open" : ""}`}>
        <LayerPanel project={project} statuses={statuses} visible={modelVisible} is2D={is2D} rasterOpacities={rasterOpacities} onOpacityChange={setRasterOpacity} onToggle={toggleLayer} onClose={() => setPanelOpen(false)}
          scenes={project.scenes} onApplyScene={scene => { setMode("explore"); applyScene(scene.layerIds); }}
          comparing={Boolean(comparison)} onCompare={canCompare && viewer && !error ? () => {
            setMode("explore");
            setComparison(comparisonPreset ?? null);
            setPanelOpen(false);
          } : undefined} onExitComparison={() => setComparison(null)} />
      </aside>
      <NavigationControls viewer={viewer} homeCamera={project.initialCamera} disabled={Boolean(error)} />
      <MeasurementToolbar viewer={viewer} disabled={Boolean(error)} is2D={is2D} />
      <VectorPopup viewer={viewer} />
      {ModelDevelopmentTools && (project.developmentTools?.modelAlignment || project.developmentTools?.cropAuthoring) &&
        <Suspense fallback={null}>
          {project.layers.filter(layer => layer.source.format === "3d-tiles" && visible.has(layer.id)).map(layer =>
            <ModelDevelopmentTools key={layer.id} viewer={viewer} tileset={getModel(layer.id)} alignment={Boolean(project.developmentTools?.modelAlignment)} crop={Boolean(project.developmentTools?.cropAuthoring)} />)}
        </Suspense>}
      {(error || mapWarning) && <div role="alert" className="map-alert">{error || mapWarning}</div>}
      {!viewer && !error && <div role="status" className="map-alert">Iniciando o visualizador 3D…</div>}
      {legendLayers.length > 0 && <div className="raster-legend-stack" role="group" aria-label="Legendas das camadas visíveis" tabIndex={0}>
        {legendLayers.map((layer) => layer.legend && <Legend key={layer.id} {...layer.legend} visibility={displayVisible.has(layer.id)} />)}
      </div>}
    </main>
  );
}
