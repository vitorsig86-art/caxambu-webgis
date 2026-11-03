import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { CommunityIcon as Icon } from "./components/CommunityIcon";
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
import { useEmbeddedPage } from "./hooks/useEmbeddedPage";
import type { ProjectConfig, TemporalComparisonSelection } from "./projects/types";

const EmbeddedPageOverlay = lazy(() => import("./components/EmbeddedPageOverlay"));
const ModelDevelopmentTools = import.meta.env.DEV ? lazy(() => import("./components/ModelDevelopmentTools")) : null;
const CameraCapturePanel = import.meta.env.DEV ? lazy(() => import("./components/CameraCapturePanel")) : null;

function defaultVisibility(project: ProjectConfig) {
  return configuredVisibility(project.layers, project.layers.filter((layer) => layer.defaultVisible).map((layer) => layer.id));
}

export function App() {
  const project = projects[0];
  const [experience] = useState(() => resolveTechnicalExperience(window.location.search));
  const [visible, setVisible] = useState(() => defaultVisibility(projects[0]));
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [sheetHigh, setSheetHigh] = useState(false);
  const [mobileView, setMobileView] = useState<"measure" | "legend" | null>(null);
  const panelButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
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
  const { page, openPage, closePage } = useEmbeddedPage(viewer, () => project.initialCamera);

  function closePanel() {
    setPanelOpen(false);
    panelButtonRef.current?.focus();
  }

  useEffect(() => {
    if (!panelOpen) return;
    panelRef.current?.querySelector<HTMLButtonElement>(".icon-button")?.focus();
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPanelOpen(false);
        panelButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [panelOpen]);

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
    <main className="app-shell" data-panel={panelCollapsed ? "collapsed" : "expanded"} data-mobile-view={mobileView ?? undefined}>
      <div ref={containerRef} className="map-container" aria-label="Mapa 3D interativo do projeto" />
      {experience.allow2D && <SceneModeControl mode={sceneMode.mode} disabled={!viewer || Boolean(error) || sceneMode.mode === SceneMode.MORPHING} onChange={sceneMode.change} />}
      {comparison && viewer && <TemporalComparison viewer={viewer} layers={project.layers} selection={comparison}
        visible={displayVisible} statuses={statuses} rasterOpacities={rasterOpacities} drawerOpen={panelOpen}
        onChange={setComparison} onExit={() => setComparison(null)} />}
      <header className="app-header">
        <a className="brand" href="/?experience=technical" aria-label="Página inicial do Cardeal Map">
          <img src="/logo-cardeal.png" alt="" />
          <strong>Cardeal Map</strong>
        </a>
        <span className="brand-project">{project.name} · {project.location}</span>
        <button type="button" className="header-panel-toggle" aria-expanded={!panelCollapsed} aria-controls="layer-panel"
          onClick={() => setPanelCollapsed(current => !current)}>
          <Icon name="layers" />{panelCollapsed ? "Mostrar camadas" : "Recolher camadas"}
        </button>
        <a href="/?experience=community" className="community-entry-link"><Icon name="people" />Bairro Vivo</a>
      </header>
      {diagnosticSteps.length > 0 && <ModeSwitcher mode={mode} onChange={changeMode} />}
      {mode === "diagnostic" && diagnosticSteps.length > 0 && <DiagnosticJourney steps={diagnosticSteps}
        stepIndex={diagnosticStep} onStepChange={changeDiagnosticStep} onExplore={() => changeMode("explore")} />}
      {panelOpen && <button type="button" className="drawer-backdrop" aria-label="Fechar painel de camadas" onClick={closePanel} />}
      <aside ref={panelRef} id="layer-panel" aria-label="Área de trabalho e camadas" className={`layer-panel ${panelOpen ? "is-open" : ""} ${sheetHigh ? "is-high" : ""}`}>
        <LayerPanel project={project} statuses={statuses} visible={modelVisible} is2D={is2D} rasterOpacities={rasterOpacities} onOpacityChange={setRasterOpacity} onToggle={toggleLayer} onClose={closePanel}
          sheetHigh={sheetHigh} onToggleSheetHeight={() => setSheetHigh(current => !current)}
          scenes={project.scenes} onApplyScene={scene => { setMode("explore"); applyScene(scene.layerIds); }}
          comparing={Boolean(comparison)} onCompare={canCompare && viewer && !error ? () => {
            setMode("explore");
            setComparison(comparisonPreset ?? null);
            setPanelOpen(false);
          } : undefined} onExitComparison={() => setComparison(null)} />
      </aside>
      <NavigationControls viewer={viewer} homeCamera={project.initialCamera} disabled={Boolean(error)} />
      <MeasurementToolbar viewer={viewer} disabled={Boolean(error)} is2D={is2D} />
      <VectorPopup viewer={viewer} allowedOrigins={project.embeddedPages?.allowedOrigins} onOpenPage={openPage} />
      {page && <Suspense fallback={null}><EmbeddedPageOverlay url={page.url} title={page.title} onClose={closePage} /></Suspense>}
      {CameraCapturePanel && project.developmentTools?.cameraCapture && <Suspense fallback={null}>
        <CameraCapturePanel viewer={viewer} scenes={project.scenes ?? []} hasLimit={false} ignoreLimits={false} onIgnoreLimitsChange={() => {}} />
      </Suspense>}
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
      <nav className="mobile-bar" aria-label="Ferramentas do mapa">
        <button ref={panelButtonRef} type="button" aria-expanded={panelOpen} aria-controls="layer-panel" onClick={() => setPanelOpen(!panelOpen)}>
          <span><Icon name="layers" /></span>Camadas
        </button>
        <button type="button" aria-pressed={!panelOpen && mobileView === "measure"} onClick={() => { setPanelOpen(false); setMobileView(mobileView === "measure" ? null : "measure"); }}>
          <span><Icon name="measure" /></span>Medir
        </button>
        {legendLayers.length > 0 && <button type="button" aria-pressed={!panelOpen && mobileView === "legend"} onClick={() => { setPanelOpen(false); setMobileView(mobileView === "legend" ? null : "legend"); }}>
          <span><Icon name="legend" /></span>Legenda
        </button>}
      </nav>
    </main>
  );
}
