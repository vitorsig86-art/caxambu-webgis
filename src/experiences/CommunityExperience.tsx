import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { Cartesian2, Cartographic, Math as CesiumMath } from "cesium";
import { projects } from "../projects";
import { configuredVisibility } from "../projects/layerVisibility";
import { useCesiumViewer } from "../hooks/useCesiumViewer";
import { useProjectLayers } from "../hooks/useProjectLayers";
import { usePwa } from "../hooks/usePwa";
import { NavigationControls } from "../components/NavigationControls";
import { LayerPanel } from "../components/LayerPanel";
import { VectorPopup } from "../components/VectorPopup";
import { Legend } from "../components/Legend";
import { CommunityIcon as Icon } from "../components/CommunityIcon";
import { pickMeasurementPosition } from "../cesium/measurementUtils";
import { communityHomeCamera, communityInitialView } from "./communityCamera";
import { draftCategories, readDrafts, writeDrafts, type LocalDraft } from "./localDrafts";
import "./CommunityExperience.css";

type Tab = "map" | "register" | "community" | "explore";
const tabs = [
  { id: "map", label: "Mapa", icon: "map" },
  { id: "register", label: "Registrar", icon: "add" },
  { id: "community", label: "Comunidade", icon: "people" },
  { id: "explore", label: "Explorar", icon: "explore" },
] as const;

export default function CommunityExperience() {
  const project = projects[0];
  const panelProject = useMemo(() => ({ ...project, layers: project.layers.filter(layer => layer.source.format !== "3d-tiles") }), [project]);
  const [visible, setVisible] = useState(() => configuredVisibility(project.layers, project.layers.filter(layer => layer.defaultVisible && layer.source.format !== "3d-tiles").map(layer => layer.id)));
  const { containerRef, viewer, error } = useCesiumViewer(false, true, communityInitialView);
  const { statuses, mapWarning, rasterOpacities, setRasterOpacity } = useProjectLayers(viewer, project, visible, null, false);
  const [tab, setTab] = useState<Tab>("map");
  const [picking, setPicking] = useState(false);
  const [location, setLocation] = useState<[number, number] | undefined>();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<typeof draftCategories[number]>(draftCategories[0]);
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [notice, setNotice] = useState("");
  const sheetRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const pwa = usePwa();

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
    if (tab === "map") return;
    const sheet = sheetRef.current;
    sheet?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); closeSheet(); }
      if (event.key === "Tab" && sheet) {
        const controls = [...sheet.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], input:not(:disabled), select, textarea, [tabindex='0']")].filter(element => element.getClientRects().length);
        const first = controls[0], last = controls.at(-1);
        if (event.shiftKey && (document.activeElement === first || document.activeElement === sheet)) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", keydown);
    return () => document.removeEventListener("keydown", keydown);
  }, [tab]);

  function openTab(next: Tab) {
    triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setPicking(false); setTab(next);
  }
  function closeSheet() { setTab("map"); triggerRef.current?.focus(); }
  function toggleLayer(id: string) {
    setVisible(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id); else next.add(id);
      return configuredVisibility(panelProject.layers, next);
    });
  }
  function selectLocation() {
    if (!viewer || viewer.isDestroyed()) return;
    const point = pickMeasurementPosition(viewer, new Cartesian2(viewer.canvas.clientWidth / 2, viewer.canvas.clientHeight / 2));
    if (!point) { setNotice("Não foi possível marcar este ponto. Mova o mapa e tente novamente."); return; }
    const geographic = Cartographic.fromCartesian(point);
    setLocation([CesiumMath.toDegrees(geographic.longitude), CesiumMath.toDegrees(geographic.latitude)]);
    setPicking(false); setTab("register"); setNotice("");
  }
  function saveDraft(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !storageReady) return;
    const next = [{ id: crypto.randomUUID(), title: title.trim(), description: description.trim(), category, createdAt: new Date().toISOString(), ...(location ? { location } : {}) }, ...drafts];
    try {
      writeDrafts(next); setDrafts(next); setTitle(""); setDescription(""); setLocation(undefined);
      setNotice("Rascunho salvo neste aparelho. Nada foi enviado."); setTab("community");
    } catch { setNotice("Não foi possível salvar. Seu texto continua aqui; verifique o espaço disponível no aparelho."); }
  }
  function removeDraft(id: string) {
    try { const next = drafts.filter(draft => draft.id !== id); writeDrafts(next); setDrafts(next); setNotice("Rascunho removido deste aparelho."); }
    catch { setNotice("Não foi possível remover o rascunho. Tente novamente."); }
  }
  const homeCamera = communityHomeCamera(viewer?.canvas.clientWidth ?? window.innerWidth, viewer?.canvas.clientHeight ?? window.innerHeight);

  return <main className="community-shell">
    <div className="community-map" ref={containerRef} aria-label="Mapa interativo de Caxambu" inert={tab !== "map"} />
    <header className="bv-header" inert={tab !== "map"}>
      <div className="bv-mark"><Icon name="leaf" /></div>
      <div><span className="bv-eyebrow">CARDEAL MAP · CAXAMBU, MG</span><h1>Bairro Vivo<span>Uma cidade. Muitas histórias.</span></h1></div>
      <a href="/?experience=technical" className="bv-technical" aria-label="Abrir WebGIS técnico">Técnico ↗</a>
    </header>
    <div className="bv-map-controls" inert={tab !== "map"}>
      <NavigationControls viewer={viewer} homeCamera={homeCamera} disabled={Boolean(error)} />
    </div>
    <div className="bv-map-intro" inert={tab !== "map"}><span className="bv-live-dot" /> Um olhar mais perto do seu bairro</div>
    {!pwa.online && <p className="bv-connectivity" role="status">Sem conexão. Rascunhos disponíveis; o mapa precisa de internet.</p>}
    {(error || mapWarning) && <p className="bv-map-error" role="alert">{error || mapWarning}</p>}
    {!viewer && !error && <p className="bv-map-error" role="status">Abrindo o mapa do bairro…</p>}
    {tab === "map" && !picking && <div className="bv-map-actions">
      <button className="bv-layer-button" type="button" onClick={() => openTab("explore")}><Icon name="layers" /> Camadas</button>
      <button className="bv-register-button" type="button" onClick={() => openTab("register")}><Icon name="add" /> Cuidar do meu bairro</button>
    </div>}
    {picking && <><div className="bv-crosshair" aria-hidden="true"><Icon name="pin" /></div><div className="bv-pick-actions"><p>Mova o mapa para posicionar o marcador.</p><button type="button" onClick={selectLocation}>Usar este ponto</button><button type="button" onClick={() => { setPicking(false); setTab("register"); }}>Cancelar</button></div></>}
    {tab === "map" && !picking && <VectorPopup viewer={viewer} />}
    {project.layers.filter(layer => layer.legend && layer.legendMode !== "embedded" && visible.has(layer.id)).map(layer => <Legend key={layer.id} {...layer.legend!} visibility />)}
    {tab !== "map" && <>
      <button className="bv-backdrop" type="button" aria-label="Fechar painel" onClick={closeSheet} tabIndex={-1} />
      <section className="bv-sheet" role="dialog" aria-modal="true" aria-labelledby="bv-sheet-title" tabIndex={-1} ref={sheetRef}>
        <div className="bv-sheet-handle" aria-hidden="true" />
        <div className="bv-sheet-heading"><div><span className="bv-eyebrow">CAXAMBU BAIRRO VIVO</span><h2 id="bv-sheet-title">{tab === "register" ? "Seu olhar faz a diferença" : tab === "community" ? "Nosso lugar, nossas ideias" : "Descubra o território"}</h2></div><button type="button" className="bv-close" aria-label="Fechar painel" onClick={closeSheet}><Icon name="close" /></button></div>
        <div className="bv-sheet-content">
          {notice && <p className="bv-notice" role="status">{notice}</p>}
          {tab === "register" && <>
            <p className="bv-lead">Uma árvore, um cuidado ou uma boa ideia. Comece por algo que você percebe no seu bairro.</p>
            <div className="bv-local-note"><Icon name="leaf" /><span><strong>Por enquanto, só no seu aparelho.</strong> Este registro é um rascunho privado. O envio à comunidade ainda não está disponível.</span></div>
            <form className="bv-form" onSubmit={saveDraft}>
              <label>Sobre o que você quer falar?<select value={category} onChange={event => setCategory(event.target.value as typeof category)}>{draftCategories.map(item => <option key={item}>{item}</option>)}</select></label>
              <label>Um título para sua ideia<input required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex.: Mais sombra na nossa praça" /></label>
              <label>Conte um pouco mais<textarea required maxLength={2000} rows={4} value={description} onChange={event => setDescription(event.target.value)} placeholder="O que você observou? Como podemos cuidar deste lugar?" /></label>
              <button className="bv-location-button" type="button" disabled={!viewer} onClick={() => { setTab("map"); setPicking(true); }}><Icon name="pin" />{location ? "Ponto marcado · alterar no mapa" : "Marcar um lugar no mapa (opcional)"}</button>
              {location && <small>{location[1].toFixed(6)}, {location[0].toFixed(6)} <button type="button" onClick={() => setLocation(undefined)}>Remover ponto</button></small>}
              <button className="bv-primary" type="submit" disabled={!storageReady || !title.trim() || !description.trim()}>Salvar rascunho no aparelho</button>
              <small>Não informe dados pessoais de outras pessoas. Limpar os dados do navegador remove os rascunhos.</small>
            </form>
          </>}
          {tab === "community" && <>
            <div className="bv-community-banner"><Icon name="people" /><span>Um bairro melhor começa com quem vive nele.</span></div>
            <p className="bv-lead">A comunidade está começando. O mural público será aberto quando o serviço de participação estiver disponível.</p>
            <h3>Seus rascunhos <span className="bv-count">{drafts.length}</span></h3>
            <p className="bv-muted">Privados, guardados somente neste navegador. Sem envio automático.</p>
            {drafts.length === 0 ? <div className="bv-empty"><Icon name="leaf" /><h3>O primeiro olhar pode ser o seu.</h3><p>Guarde uma observação para ajudar a cuidar do lugar onde você vive.</p><button className="bv-primary" type="button" onClick={() => setTab("register")}>Criar meu primeiro rascunho</button></div> : drafts.map(draft => <article className="bv-draft" key={draft.id}><span className="bv-category">{draft.category}</span><h3>{draft.title}</h3><p>{draft.description}</p><small>{new Date(draft.createdAt).toLocaleDateString("pt-BR")} · {draft.location ? "Com ponto no mapa" : "Sem localização"} · Só neste aparelho</small><button type="button" onClick={() => removeDraft(draft.id)}>Excluir rascunho</button></article>)}
          </>}
          {tab === "explore" && <>
            <p className="bv-lead">Veja o bairro de perto. Escolha o que aparece no mapa e descubra novas formas de olhar para Caxambu.</p>
            <LayerPanel project={panelProject} statuses={statuses} visible={visible} rasterOpacities={rasterOpacities} onOpacityChange={setRasterOpacity} onToggle={toggleLayer} onClose={closeSheet} is2D />
            <div className="bv-install"><Icon name="download" /><h3>Seu bairro, sempre por perto.</h3><p>Adicione o Bairro Vivo à tela inicial. As imagens do mapa continuam precisando de conexão.</p><button className="bv-primary" type="button" disabled={pwa.installed} onClick={() => void pwa.install()}>{pwa.installed ? "Aplicativo instalado" : pwa.installable ? "Instalar Bairro Vivo" : "Como instalar no celular"}</button>{pwa.message && <p role="status">{pwa.message}</p>}</div>
            <a className="bv-technical-card" href="/?experience=technical"><strong>Precisa das ferramentas completas?</strong><span>Abrir o WebGIS técnico ↗</span><small>Modelos 3D, medições e análises cartográficas.</small></a>
          </>}
        </div>
      </section>
    </>}
    {notice && tab === "map" && <p className="bv-toast" role="status">{notice}</p>}
    <nav className="bv-bottom-nav" aria-label="Navegação principal" inert={tab !== "map"}>
      {tabs.map(item => <button type="button" key={item.id} aria-current={tab === item.id ? "page" : undefined} className={tab === item.id ? "is-active" : ""} onClick={() => openTab(item.id)}><Icon name={item.icon} /><span>{item.label}</span></button>)}
    </nav>
  </main>;
}
