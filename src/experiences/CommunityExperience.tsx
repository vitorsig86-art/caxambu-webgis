import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from "react";
import { Cartesian2, Cartographic, Math as CesiumMath } from "cesium";
import { projects } from "../projects";
import { configuredVisibility } from "../projects/layerVisibility";
import { communityAreas, communityLayerCopy, communityPlace } from "../projects/communityAreas";
import { communityCameraPreset } from "../projects/communityCamera";
import { useCesiumViewer } from "../hooks/useCesiumViewer";
import { useProjectLayers } from "../hooks/useProjectLayers";
import { usePwa } from "../hooks/usePwa";
import { NavigationControls } from "../components/NavigationControls";
import { LayerPanel } from "../components/LayerPanel";
import { VectorPopup } from "../components/VectorPopup";
import { Legend } from "../components/Legend";
import { CommunityIcon as Icon } from "../components/CommunityIcon";
import { pickMeasurementPosition } from "../cesium/measurementUtils";
import { createCameraView } from "../cesium/projectCamera";
import { communityHomeCamera, communityInitialView } from "./communityCamera";
import { draftCategories, readDrafts, writeDrafts, type LocalDraft } from "./localDrafts";
import { categoryStyle, type DraftCategory } from "./communityCategories";
import { addAreaOutlines, brandMark, distanceMeters, flyToPoint, formatCoordinate, formatDistance, metersPerPixel, screenCenter, tileThumbnail } from "./communityMap";
import { CommunityMarkers } from "./CommunityMarkers";
import "./CommunityExperience.css";

type Screen = "map" | "detail" | "register" | "pick" | "form" | "success" | "community" | "explore";
type LonLat = [number, number];

const enteredKey = "caxambu-bairro-vivo:entered";
const home: LonLat = [communityCameraPreset.longitude, communityCameraPreset.latitude];
const mark = brandMark(communityAreas, home);
const mapScreens: Screen[] = ["map", "detail", "success"];
const navScreens: Screen[] = ["map", "detail", "success", "community", "explore"];
const tabs = [
  { id: "map", label: "Mapa", icon: "map" },
  { id: "explore", label: "Explorar", icon: "explore" },
  { id: "community", label: "Comunidade", icon: "people" },
] as const;

function readEntered() {
  try { return sessionStorage.getItem(enteredKey) === "1"; } catch { return false; }
}

function BrandMark({ size, dot = false }: { size: number; dot?: boolean }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ width: size, height: size }}>
    <polygon points={mark.polygons[1]} fill="#dfe6cc" opacity=".5" />
    <polygon points={mark.polygons[0]} fill="#dfe6cc" />
    {dot && <circle cx={mark.dot[0]} cy={mark.dot[1]} r="2.6" fill="var(--bv-terra)" />}
  </svg>;
}

function Shape({ category, size = "md" }: { category: DraftCategory; size?: "sm" | "md" | "lg" }) {
  const style = categoryStyle[category];
  return <span className={`bv-shape is-${style.shape} is-${style.key} is-${size}`} aria-hidden="true"><span /></span>;
}

function Steps({ step }: { step: number }) {
  return <span className="bv-steps" aria-hidden="true">{[1, 2, 3].map(item => <span key={item} className={item <= step ? "is-done" : ""} />)}</span>;
}

export default function CommunityExperience() {
  const project = projects[0];
  const panelProject = useMemo(() => ({
    ...project,
    layers: project.layers.filter(layer => layer.source.format !== "3d-tiles").map(layer => ({ ...layer, ...communityLayerCopy[layer.id] })),
  }), [project]);
  const thumbnailSource = project.layers.find(layer => layer.id === communityPlace.thumbnailLayerId)?.source;
  const thumbnailTemplate = thumbnailSource && (thumbnailSource.format === "tms" || thumbnailSource.format === "xyz") ? thumbnailSource.url : undefined;
  const [visible, setVisible] = useState(() => configuredVisibility(project.layers, project.layers.filter(layer => layer.defaultVisible && layer.source.format !== "3d-tiles").map(layer => layer.id)));
  const { containerRef, viewer, error } = useCesiumViewer(false, true, communityInitialView);
  const { statuses, mapWarning, rasterOpacities, setRasterOpacity } = useProjectLayers(viewer, project, visible, null, false);
  const pwa = usePwa();

  const [entered, setEntered] = useState(readEntered);
  const [mapReady, setMapReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [screen, setScreen] = useState<Screen>("map");
  const [sheetOverride, setSheetOverride] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() => window.innerHeight);
  const [center, setCenter] = useState<LonLat>(home);
  const [selectedId, setSelectedId] = useState<string>();
  const [lastSavedId, setLastSavedId] = useState<string>();
  const [location, setLocation] = useState<LonLat | undefined>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DraftCategory>(draftCategories[0]);
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [notice, setNotice] = useState("");
  const coordinateRefs = useRef(new Set<HTMLElement>());
  const coordinateText = useRef("");
  const scaleRef = useRef<HTMLDivElement>(null);
  const scaleLabelRef = useRef<HTMLSpanElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const previous = document.title;
    document.title = "Caxambu Bairro Vivo | Cardeal Map";
    return () => { document.title = previous; };
  }, []);
  useEffect(() => {
    try { setDrafts(readDrafts()); setStorageReady(true); }
    catch { setNotice("Os rascunhos locais não estão disponíveis. Nenhum dado foi alterado. Verifique o armazenamento do navegador."); }
  }, []);
  useEffect(() => {
    const resize = () => setViewportHeight(window.innerHeight);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Loading: follow the globe tile queue until the first view has loaded.
  useEffect(() => {
    if (error) { setMapReady(true); return; }
    if (!viewer || viewer.isDestroyed()) return;
    let largest = 0;
    let done = false;
    const finish = () => { if (!done) { done = true; setProgress(100); setMapReady(true); } };
    const removeProgress = viewer.scene.globe.tileLoadProgressEvent.addEventListener((queued: number) => {
      largest = Math.max(largest, queued);
      if (largest > 0) setProgress(Math.round((1 - queued / largest) * 100));
      if (queued === 0 && viewer.scene.globe.tilesLoaded) finish();
    });
    // Tiles may already be loaded; never trap the resident if a tile source stalls.
    const started = Date.now();
    const poll = window.setInterval(() => {
      if (viewer.isDestroyed()) return;
      if ((Date.now() - started > 1500 && viewer.scene.globe.tilesLoaded) || Date.now() - started > 15000) finish();
    }, 500);
    viewer.scene.requestRender();
    return () => { removeProgress(); window.clearInterval(poll); };
  }, [viewer, error]);

  useEffect(() => viewer && !viewer.isDestroyed() ? addAreaOutlines(viewer, communityAreas) : undefined, [viewer]);

  // Live coordinate labels and scale bar update outside React on each render.
  useEffect(() => {
    if (!viewer || viewer.isDestroyed()) return;
    function sync() {
      if (!viewer || viewer.isDestroyed()) return;
      const point = screenCenter(viewer);
      const text = point ? formatCoordinate(point) : "";
      if (text !== coordinateText.current) { coordinateRefs.current.forEach(element => { element.textContent = text; }); coordinateText.current = text; }
      const perPixel = metersPerPixel(viewer);
      if (perPixel && scaleRef.current && scaleLabelRef.current) {
        const nice = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000].filter(value => value / perPixel <= 110).pop() ?? 10;
        scaleRef.current.style.width = `${Math.round(nice / perPixel)}px`;
        scaleLabelRef.current.textContent = nice >= 1000 ? `${nice / 1000} km` : `${nice} m`;
      }
    }
    sync();
    const removeRender = viewer.scene.postRender.addEventListener(sync);
    const removeMove = viewer.camera.moveEnd.addEventListener(() => { const point = screenCenter(viewer); if (point) setCenter(point); });
    return () => { removeRender(); removeMove(); };
  }, [viewer]);

  const fullHeight = Math.max(320, viewportHeight - 64);
  const snaps = [Math.min(236, fullHeight), Math.min(500, Math.round(viewportHeight * 0.6)), fullHeight];
  const defaultHeights: Partial<Record<Screen, number>> = { map: snaps[0], detail: snaps[1], register: Math.min(620, fullHeight), form: fullHeight, success: Math.min(300, fullHeight), community: fullHeight, explore: fullHeight };
  const sheetHeight = Math.min(fullHeight, sheetOverride ?? defaultHeights[screen] ?? 0);
  const showSheet = screen !== "pick";
  const mapish = mapScreens.includes(screen);
  const showMapChrome = mapish && sheetHeight < viewportHeight * 0.66;
  const showOverlay = !entered || !mapReady;

  useEffect(() => {
    if (screen === "map" || screen === "pick") return;
    headingRef.current?.focus({ preventScroll: true });
  }, [screen]);
  useEffect(() => {
    if (screen === "map" || showOverlay) return;
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); goTo("map"); } };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  });

  function goTo(next: Screen) {
    if (next !== "map" && screen === "map") triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setSheetOverride(null);
    if (next !== "detail") setSelectedId(undefined);
    if (next !== "success") setLastSavedId(undefined);
    setScreen(next);
    if (next === "map") triggerRef.current?.focus({ preventScroll: true });
  }
  function enter() {
    try { sessionStorage.setItem(enteredKey, "1"); } catch { /* Session storage is optional. */ }
    setEntered(true);
  }
  function openDetail(id: string) {
    const draft = drafts.find(item => item.id === id);
    if (!draft) return;
    goTo("detail"); setSelectedId(id);
    if (draft.location && viewer && !viewer.isDestroyed()) flyToPoint(viewer, draft.location, viewportHeight / 2 - (viewportHeight - snaps[1]) / 2);
  }
  function startRegister() {
    setTitle(""); setDescription(""); setLocation(undefined); setNotice("");
    goTo("register");
  }
  function chooseCategory(next: DraftCategory) { setCategory(next); goTo("pick"); }
  function usePoint() {
    if (!viewer || viewer.isDestroyed()) return;
    const point = pickMeasurementPosition(viewer, new Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2));
    if (!point) { setNotice("Não foi possível marcar este ponto. Mova o mapa e tente novamente."); return; }
    const geographic = Cartographic.fromCartesian(point);
    setLocation([CesiumMath.toDegrees(geographic.longitude), CesiumMath.toDegrees(geographic.latitude)]);
    setNotice(""); goTo("form");
  }
  function toggleLayer(id: string) {
    setVisible(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return configuredVisibility(panelProject.layers, next);
    });
  }
  function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !storageReady) return;
    const draft: LocalDraft = { id: crypto.randomUUID(), title: title.trim(), description: description.trim(), category, createdAt: new Date().toISOString(), ...(location ? { location } : {}) };
    const next = [draft, ...drafts];
    try {
      writeDrafts(next); setDrafts(next); setTitle(""); setDescription("");
      setNotice(""); goTo("success"); setLastSavedId(draft.id);
      if (draft.location && viewer && !viewer.isDestroyed()) flyToPoint(viewer, draft.location, Math.min(300, fullHeight) / 2);
    } catch { setNotice("Não foi possível salvar. Seu texto continua aqui; verifique o espaço disponível no aparelho."); }
  }
  function removeDraft(id: string) {
    try {
      const next = drafts.filter(draft => draft.id !== id); writeDrafts(next); setDrafts(next);
      if (selectedId === id) goTo("map");
      setNotice("Rascunho removido deste aparelho.");
    } catch { setNotice("Não foi possível remover o rascunho. Tente novamente."); }
  }

  function onHandleDown(event: ReactPointerEvent<HTMLButtonElement>) {
    const startY = event.clientY, startHeight = sheetHeight;
    let moved = false, current = startHeight;
    const move = (pointer: PointerEvent) => {
      const delta = pointer.clientY - startY;
      if (Math.abs(delta) > 4) { moved = true; setDragging(true); }
      if (moved) { current = Math.max(120, Math.min(fullHeight, startHeight - delta)); setSheetOverride(current); }
    };
    const up = () => {
      window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); window.removeEventListener("pointercancel", up);
      setDragging(false);
      if (!moved) { cycleSheet(); return; }
      if (current < snaps[0] - 40 && screen !== "map") { goTo("map"); return; }
      setSheetOverride(snaps.reduce((best, snap) => Math.abs(snap - current) < Math.abs(best - current) ? snap : best));
    };
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up); window.addEventListener("pointercancel", up);
  }
  function cycleSheet() {
    setSheetOverride(sheetHeight < snaps[1] - 20 ? snaps[1] : sheetHeight < snaps[2] - 20 ? snaps[2] : snaps[0]);
  }

  const coordinateRef = (element: HTMLElement | null) => {
    if (!element) return;
    element.textContent = coordinateText.current;
    coordinateRefs.current.add(element);
    return () => { coordinateRefs.current.delete(element); };
  };
  const homeCamera = communityHomeCamera(viewer?.canvas.clientWidth ?? window.innerWidth, viewer?.canvas.clientHeight ?? window.innerHeight);
  const placed = drafts.filter((draft): draft is LocalDraft & { location: LonLat } => Boolean(draft.location));
  const nearby = [...placed].sort((a, b) => distanceMeters(center, a.location) - distanceMeters(center, b.location));
  const selected = drafts.find(draft => draft.id === selectedId);
  const lastSaved = drafts.find(draft => draft.id === lastSavedId);
  const activeTab = mapish ? "map" : screen;
  const thumb = (point: LonLat | undefined, size: number): CSSProperties => (point && tileThumbnail(thumbnailTemplate, point, size)) || {};
  const formatDate = (value: string) => new Date(value).toLocaleDateString("pt-BR");

  const closeButton = (label = "Fechar") => <button type="button" className="bv-round" aria-label={label} onClick={() => goTo("map")}><Icon name="close" /></button>;

  return <main className="community-shell" style={{ "--bv-sheet": `${showSheet ? sheetHeight : 0}px` } as CSSProperties} data-screen={screen}>
    <div className="community-map" ref={containerRef} aria-label="Mapa interativo de Caxambu" />
    <div className="bv-map-shade" aria-hidden="true" />
    <CommunityMarkers viewer={viewer} drafts={drafts} selectedId={screen === "detail" ? selectedId : undefined} newId={screen === "success" ? lastSavedId : undefined} dimmed={screen === "pick"} onSelect={openDetail} />

    {showMapChrome && <button type="button" className="bv-chip" onClick={() => { if (viewer && !viewer.isDestroyed()) { viewer.camera.flyTo({ ...createCameraView(homeCamera), duration: 1.2 }); viewer.scene.requestRender(); } }} aria-label="Bairro Vivo — voltar à vista inicial">
      <span className="bv-mark"><BrandMark size={30} dot /></span>
      <span className="bv-chip-text"><strong>Bairro Vivo</strong><span ref={coordinateRef} className="bv-mono" aria-hidden="true" /></span>
    </button>}
    <div className={`bv-map-controls${showMapChrome ? "" : " is-hidden"}`} inert={!showMapChrome || showOverlay}>
      <NavigationControls viewer={viewer} homeCamera={homeCamera} disabled={Boolean(error)} />
    </div>
    {<div className={`bv-scale${showMapChrome && sheetHeight <= 320 ? "" : " is-hidden"}`} aria-hidden="true"><span ref={scaleLabelRef} /><div ref={scaleRef} /></div>}

    {!pwa.online && <p className="bv-connectivity" role="status">Sem conexão. Rascunhos disponíveis; o mapa precisa de internet.</p>}
    {(error || mapWarning) && <p className="bv-map-error" role="alert">{error || mapWarning}</p>}
    {mapish && <VectorPopup viewer={viewer} />}
    {project.layers.filter(layer => layer.legend && layer.legendMode !== "embedded" && visible.has(layer.id)).map(layer => <Legend key={layer.id} {...layer.legend!} visibility />)}

    {screen === "pick" && <>
      <div className="bv-crosshair" aria-hidden="true">
        <span className="bv-crosshair-ring" /><span className="bv-crosshair-v" /><span className="bv-crosshair-h" />
        <span className="bv-crosshair-pin"><Shape category={category} size="lg" /><span className="bv-marker-stem" /></span>
        <span className="bv-crosshair-coord bv-mono" ref={coordinateRef} />
      </div>
      <section className="bv-pick-card" aria-labelledby="bv-pick-title">
        <div className="bv-row"><span className="bv-eyebrow">2 DE 3 · ONDE FICA?</span><Steps step={2} /></div>
        <h2 id="bv-pick-title">Arraste o mapa até o lugar.</h2>
        <p>O marcador fica sempre no centro. Marque na rua ou no terreno, não na porta de uma casa.</p>
        {notice && <p className="bv-notice" role="status">{notice}</p>}
      </section>
      <div className="bv-pick-actions">
        <button type="button" className="bv-primary is-large" disabled={!viewer} onClick={usePoint}><Icon name="check" />Usar este ponto</button>
        <button type="button" className="bv-text-button" onClick={() => { setLocation(undefined); goTo("form"); }}>Seguir sem marcar no mapa</button>
      </div>
    </>}

    {showSheet && <section inert={showOverlay} className={`bv-sheet${dragging ? " is-dragging" : ""}`} style={{ height: sheetHeight }} aria-labelledby="bv-sheet-title">
      <button type="button" className="bv-handle" onPointerDown={onHandleDown} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); cycleSheet(); } }} aria-label="Ajustar altura do painel"><span /></button>
      <div className="bv-sheet-body">
        {notice && screen !== "register" && <p className="bv-notice" role="status">{notice}</p>}

        {screen === "map" && <div className="bv-panel">
          <div className="bv-row is-baseline"><h2 id="bv-sheet-title" className="bv-h3">Perto do centro do mapa</h2><span className="bv-mono">{placed.length} no mapa</span></div>
          {nearby.length > 0 ? <div className="bv-cards">{nearby.map(draft => <button type="button" key={draft.id} className="bv-near-card" onClick={() => openDetail(draft.id)}>
            <span className="bv-thumb" style={thumb(draft.location, 58)}><Shape category={draft.category} size="sm" /></span>
            <span className="bv-card-text"><span className={`bv-cat is-${categoryStyle[draft.category].key}`}>{categoryStyle[draft.category].short}</span><strong>{draft.title}</strong><span className="bv-mono">a {formatDistance(distanceMeters(center, draft.location))}</span></span>
          </button>)}</div>
            : <button type="button" className="bv-dashed" onClick={startRegister}>Nenhum registro no mapa ainda. Toque em <strong>+</strong> para marcar algo que você percebe no bairro.</button>}
        </div>}

        {screen === "detail" && selected && <div className="bv-panel" key={selected.id}>
          <div className="bv-row"><span className={`bv-pill is-${categoryStyle[selected.category].key}`}><Shape category={selected.category} size="sm" />{selected.category}</span>{closeButton()}</div>
          <h2 id="bv-sheet-title" className="bv-h1" tabIndex={-1} ref={headingRef}>{selected.title}</h2>
          <p className="bv-mono bv-meta">{selected.location ? formatCoordinate(selected.location) : "Sem ponto no mapa"}</p>
          <p className="bv-body-text">{selected.description}</p>
          <p className="bv-private"><Icon name="leaf" />Rascunho privado · só neste aparelho · criado em {formatDate(selected.createdAt)}</p>
          <div className="bv-actions">
            <button type="button" className="bv-soft" disabled={!selected.location} onClick={() => selected.location && viewer && flyToPoint(viewer, selected.location, viewportHeight / 2 - (viewportHeight - sheetHeight) / 2)}>Centralizar no mapa</button>
            <button type="button" className="bv-danger" onClick={() => removeDraft(selected.id)}>Excluir</button>
          </div>
        </div>}

        {screen === "register" && <div className="bv-panel">
          <div className="bv-row"><span className="bv-eyebrow">1 DE 3 · REGISTRAR</span>{closeButton("Cancelar")}</div>
          <Steps step={1} />
          <h2 id="bv-sheet-title" className="bv-h1" tabIndex={-1} ref={headingRef}>Seu olhar faz a diferença</h2>
          <p className="bv-lead">Uma árvore, um cuidado ou uma boa ideia. Comece por algo que você percebe no seu bairro.</p>
          {notice && <p className="bv-notice" role="status">{notice}</p>}
          <div className="bv-choice-list">{draftCategories.map(item => <button type="button" key={item} className="bv-choice" onClick={() => chooseCategory(item)}>
            <span className={`bv-choice-icon is-${categoryStyle[item].key}`}><Shape category={item} size="lg" /></span>
            <span className="bv-card-text"><strong>{item}</strong><span>{categoryStyle[item].hint}</span></span>
            <Icon name="chevron" />
          </button>)}</div>
          <p className="bv-private"><Icon name="leaf" /><span><strong>Por enquanto, só no seu aparelho.</strong> O envio à comunidade ainda não está disponível.</span></p>
        </div>}

        {screen === "form" && <form className="bv-panel bv-form" id="bv-form" onSubmit={saveDraft}>
          <div className="bv-row">
            <button type="button" className="bv-round" aria-label="Voltar para o mapa" onClick={() => goTo("pick")}><Icon name="back" /></button>
            <span className="bv-form-step"><span className="bv-eyebrow">3 DE 3 · CONTE MAIS</span><Steps step={3} /></span>
            {closeButton("Cancelar")}
          </div>
          <h2 id="bv-sheet-title" className="bv-visually-hidden" tabIndex={-1} ref={headingRef}>Conte mais sobre o registro</h2>
          <div className="bv-location-summary">
            <span className="bv-thumb is-large" style={thumb(location, 64)}><Shape category={category} size="sm" /></span>
            <span className="bv-card-text"><span className={`bv-cat is-${categoryStyle[category].key}`}>{category}</span><strong>{location ? "Ponto marcado" : "Sem ponto no mapa"}</strong><span className="bv-mono">{location ? formatCoordinate(location) : "Opcional — você pode marcar depois"}</span></span>
            <button type="button" className="bv-small-button" onClick={() => goTo("pick")}>Alterar</button>
          </div>
          <label><span className="bv-label">Um título para sua ideia <span className="bv-mono">{title.length}/100</span></span><input required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex.: Mais sombra na nossa praça" /></label>
          <label><span className="bv-label">Conte um pouco mais <span className="bv-mono">{description.length}/2000</span></span><textarea required maxLength={2000} rows={4} value={description} onChange={event => setDescription(event.target.value)} placeholder="O que você observou? Como podemos cuidar deste lugar?" /></label>
          <p className="bv-private is-boxed"><Icon name="leaf" /><span><strong>Por enquanto, só no seu aparelho.</strong> Este registro é um rascunho privado. Não informe dados pessoais de outras pessoas. Limpar os dados do navegador remove os rascunhos.</span></p>
        </form>}

        {screen === "success" && <div className="bv-panel">
          <div className="bv-success">
            <span className="bv-mark is-large"><Icon name="check" /></span>
            <div><h2 id="bv-sheet-title" className="bv-h2" tabIndex={-1} ref={headingRef}>Seu olhar está no mapa.</h2><span className="bv-mono">{lastSaved?.location ? formatCoordinate(lastSaved.location) : "Sem ponto no mapa"}</span></div>
          </div>
          <p className="bv-lead">Guardado neste aparelho. Nada foi enviado — você pode rever ou excluir no seu caderno.</p>
          <div className="bv-actions"><button type="button" className="bv-primary" onClick={() => goTo("community")}>Ver no meu caderno</button><button type="button" className="bv-soft is-narrow" onClick={() => goTo("map")}>Mapa</button></div>
        </div>}

        {screen === "community" && <div className="bv-panel">
          <div className="bv-row is-top"><div><span className="bv-eyebrow">COMUNIDADE</span><h2 id="bv-sheet-title" className="bv-h1" tabIndex={-1} ref={headingRef}>Nosso lugar, nossas ideias</h2></div>{closeButton()}</div>
          <div className="bv-banner">Um bairro melhor começa com quem vive nele.</div>
          <div className="bv-soon"><strong><span className="bv-breath" />Mural público · em breve</strong><p>A comunidade está começando. O mural será aberto quando o serviço de participação estiver disponível.</p></div>
          <div className="bv-row is-start"><h3 className="bv-h3">Seu caderno</h3><span className="bv-count">{drafts.length}</span></div>
          <p className="bv-muted">Privados, guardados somente neste navegador. Sem envio automático.</p>
          {drafts.length > 0 ? <div className="bv-entries">{drafts.map(draft => <article className="bv-entry" key={draft.id}>
            <button type="button" className="bv-thumb is-entry" style={thumb(draft.location, 76)} disabled={!draft.location} onClick={() => openDetail(draft.id)} aria-label={draft.location ? `Ver ${draft.title} no mapa` : `${draft.title} não tem ponto no mapa`}><Shape category={draft.category} size="sm" /></button>
            <div className="bv-card-text">
              <span className={`bv-cat is-${categoryStyle[draft.category].key}`}>{categoryStyle[draft.category].short}</span>
              <h4>{draft.title}</h4>
              <p>{draft.description}</p>
              <div className="bv-row"><span className="bv-mono">{formatDate(draft.createdAt)} · {draft.location ? "com ponto" : "sem ponto"}</span><button type="button" className="bv-delete" onClick={() => removeDraft(draft.id)} aria-label={`Excluir rascunho ${draft.title}`}>Excluir</button></div>
            </div>
          </article>)}</div>
            : <div className="bv-empty">
              <span className="bv-empty-shapes" aria-hidden="true">{draftCategories.map(item => <Shape key={item} category={item} />)}</span>
              <h3 className="bv-h3">O primeiro olhar pode ser o seu.</h3>
              <p>Guarde uma observação para ajudar a cuidar do lugar onde você vive.</p>
              <button type="button" className="bv-primary" onClick={startRegister}>Criar meu primeiro rascunho</button>
            </div>}
        </div>}

        {screen === "explore" && <div className="bv-panel">
          <div className="bv-row is-top"><div><span className="bv-eyebrow">EXPLORAR</span><h2 id="bv-sheet-title" className="bv-h1" tabIndex={-1} ref={headingRef}>Descubra o território</h2></div>{closeButton()}</div>
          <p className="bv-lead">Veja o bairro de perto. Escolha o que aparece no mapa e descubra novas formas de olhar para Caxambu.</p>
          <div className="bv-layer-panel"><LayerPanel project={panelProject} statuses={statuses} visible={visible} rasterOpacities={rasterOpacities} onOpacityChange={setRasterOpacity} onToggle={toggleLayer} onClose={() => goTo("map")} is2D /></div>
          <div className="bv-install"><Icon name="download" /><h3 className="bv-h3">Seu bairro, sempre por perto.</h3><p>Adicione o Bairro Vivo à tela inicial. As imagens do mapa continuam precisando de conexão.</p><button className="bv-primary" type="button" disabled={pwa.installed} onClick={() => void pwa.install()}>{pwa.installed ? "Aplicativo instalado" : pwa.installable ? "Instalar Bairro Vivo" : "Como instalar no celular"}</button>{pwa.message && <p role="status">{pwa.message}</p>}</div>
          <a className="bv-technical-card" href="/?experience=technical"><strong>Precisa das ferramentas completas?</strong><span>Abrir o WebGIS técnico ↗</span><small>Modelos 3D, medições e análises cartográficas.</small></a>
          <p className="bv-credit"><img src="/logo-cardeal.png" alt="" />Tecnologia e cartografia por <strong>Cardeal Map</strong></p>
        </div>}
      </div>
      {screen === "form" && <div className="bv-sheet-footer"><button type="submit" form="bv-form" className="bv-primary is-large" disabled={!storageReady || !title.trim() || !description.trim()}>Guardar rascunho no aparelho</button></div>}
    </section>}

    {navScreens.includes(screen) && <div className="bv-dock" inert={showOverlay}>
      <nav className="bv-bottom-nav" aria-label="Navegação principal">
        {tabs.map(item => <button type="button" key={item.id} aria-current={activeTab === item.id ? "page" : undefined} className={activeTab === item.id ? "is-active" : ""} onClick={() => goTo(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}
      </nav>
      <button type="button" className="bv-fab" aria-label="Registrar algo no bairro" onClick={startRegister}><Icon name="add" /></button>
    </div>}

    {showOverlay && <div className={`bv-overlay${entered ? " is-loading" : " is-splash"}`} role="dialog" aria-modal="true" aria-label={entered ? "Carregando o mapa" : "Boas-vindas ao Bairro Vivo"}>
      {!entered ? <div className="bv-splash">
        <p className="bv-mono bv-splash-place">{communityPlace.eyebrow}<br />{formatCoordinate(home)}</p>
        <div className="bv-splash-mark">
          <svg viewBox="0 0 40 40" aria-hidden="true"><polygon points={mark.polygons[1]} fill="none" stroke="#dfe6cc" strokeWidth=".35" strokeDasharray="1 .8" opacity=".8" /><polygon points={mark.polygons[0]} fill="#dfe6cc" /></svg>
          <span className="bv-splash-dot" style={{ left: `${mark.dot[0] / 40 * 100}%`, top: `${mark.dot[1] / 40 * 100}%` }} />
        </div>
        <h1>Bairro<br />Vivo</h1>
        <p className="bv-splash-tagline">Uma cidade. Muitas histórias.</p>
        <p className="bv-splash-lead">Explore, perceba e ajude a cuidar do lugar onde você vive.</p>
        <span className="bv-grow" />
        <button type="button" className="bv-enter" onClick={enter} autoFocus>Explorar meu bairro<Icon name="arrow" /></button>
        <p className="bv-splash-credit"><span><img src="/logo-cardeal.png" alt="" /></span>Tecnologia <strong>Cardeal Map</strong></p>
      </div> : <div className="bv-loading" role="status">
        <div className="bv-contours" aria-hidden="true"><span /><span /><span /><span /><span className="bv-mark is-loading"><BrandMark size={54} /></span></div>
        <strong>Lendo o relevo do bairro…</strong>
        <span className="bv-mono">imagens do drone · {progress}%</span>
        <span className="bv-progress"><span style={{ width: `${progress}%` }} /></span>
      </div>}
    </div>}
  </main>;
}
