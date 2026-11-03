// Popup actions (embedded pages): URL policy, action contract, managed flight and
// the Horta comunitária configuration. No browser, tokens or network.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const cesium = require("cesium");
const root = path.join(__dirname, "..");
// Values built inside vm contexts come from another realm: compare as JSON.
const same = (actual, expected, message) => assert.equal(JSON.stringify(actual), JSON.stringify(expected), message);

function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8").replaceAll("import.meta.env", "({})"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  vm.runInNewContext(code, { exports, URL, URLSearchParams, console, require: (name) => name.startsWith(".") ? load(path.join(path.dirname(file), name + ".ts")) : require(name) });
  return exports;
}

const popup = load("src/cesium/vectorPopup.ts");
const allowed = ["https://sim.example.invalid", "https://other.example.invalid:8443/ignored/path"];

// URL policy: https only, exact origin, no credentials, no other schemes.
assert.equal(popup.allowedPageUrl("https://sim.example.invalid/plot-a?view=top", allowed), "https://sim.example.invalid/plot-a?view=top");
assert.equal(popup.allowedPageUrl(" https://other.example.invalid:8443/x ", allowed), "https://other.example.invalid:8443/x");
assert.equal(popup.allowedPageUrl("https://other.example.invalid/x", allowed), null, "port is part of the origin");
assert.equal(popup.allowedPageUrl("http://sim.example.invalid/plot-a", allowed), null, "http is refused");
assert.equal(popup.allowedPageUrl("https://sim.example.invalid.evil.invalid/", allowed), null, "suffix lookalike is refused");
assert.equal(popup.allowedPageUrl("https://user:pass@sim.example.invalid/", allowed), null, "credentials are refused");
assert.equal(popup.allowedPageUrl("javascript:alert(1)", allowed), null);
assert.equal(popup.allowedPageUrl("data:text/html,x", allowed), null);
assert.equal(popup.allowedPageUrl("/relative", allowed), null);
assert.equal(popup.allowedPageUrl(42, allowed), null);
assert.equal(popup.allowedPageUrl("https://sim.example.invalid/", []), null, "no allowlist, no action");
assert.equal(popup.allowedPageUrl("https://sim.example.invalid/", ["not a url"]), null);

// Actions come from config or feature properties and respect the allowlist.
const config = { title: "Talhão", titleProperty: "label", fields: [], actions: [
  { label: "Entrar na simulação 3D", urlProperty: "simulation_url" },
  { label: "Nova aba", urlProperty: "simulation_url", target: "tab", flyTo: false },
  { label: "Ver feição", urlProperty: "simulation_url", flyTo: true },
  { label: "Sem URL", urlProperty: "absent" },
  { label: "Fixa", url: "https://sim.example.invalid/fixed", flyTo: "home", onClose: "home" },
  { label: "Fixa de fora", url: "https://elsewhere.invalid/x" },
] };
const plot = new cesium.Entity({ properties: { label: "A", simulation_url: "https://sim.example.invalid/a" } });
popup.registerVectorPopup(plot, config);
const read = popup.readVectorPopup(plot, cesium.JulianDate.now(), allowed);
same(read.actions.map(a => [a.label, a.url, a.target, a.flyTo, a.onClose]), [
  ["Entrar na simulação 3D", "https://sim.example.invalid/a", "overlay", false, "keep"],
  ["Nova aba", "https://sim.example.invalid/a", "tab", false, "keep"],
  ["Ver feição", "https://sim.example.invalid/a", "overlay", true, "keep"],
  ["Fixa", "https://sim.example.invalid/fixed", "overlay", "home", "home"],
]);
assert.equal(popup.readVectorPopup(plot, cesium.JulianDate.now()).actions.length, 0, "default: no allowed origins");
const legacy = new cesium.Entity({ properties: { label: "C" } });
popup.registerVectorPopup(legacy, { titleProperty: "label", fields: [] });
assert.equal(popup.readVectorPopup(legacy, cesium.JulianDate.now(), allowed).actions.length, 0, "popups without actions keep working");

// Managed flight: the promise settles on completion and on cancel.
const camera = load("src/cesium/projectCamera.ts");
const home = { longitude: -44.93, latitude: -22, height: 1300, heading: 3, pitch: -30, roll: 0 };
for (const outcome of ["complete", "cancel"]) {
  let flight;
  const viewer = { isDestroyed: () => false, scene: { requestRender() {} }, camera: { flyTo: (options) => { flight = options; } } };
  let settled = false;
  const promise = camera.flyToCameraSettled(viewer, home, 1.6).then(() => { settled = true; });
  assert.equal(flight.duration, 1.6);
  assert.ok(camera.isManagedFlightActive(viewer), "flight is managed while running");
  flight[outcome]();
  promise.then(() => {
    assert.ok(settled, `settles on ${outcome}`);
    assert.equal(camera.isManagedFlightActive(viewer), false);
  });
}

// Horta comunitária: layer, GeoJSON, simulation URL, allowed origin and default flyTo (camera stays).
const { templateProject: project } = load("src/projects/template.ts");
const horta = project.layers.find(layer => layer.id === "area-horta");
assert.ok(horta, "area-horta layer present");
assert.equal(horta.defaultVisible, true);
assert.equal(horta.opacityControl, true);
assert.equal(horta.source.format, "geojson");
assert.equal(horta.source.url, "https://pub-71273808da264f9aaf13a3c86a1f1a27.r2.dev/geojson/horta_area_estudo_wgs84.geojson");
same({ ...horta.source.style }, { stroke: "#7CC242", strokeWidth: 3, fill: "#7CC242", fillOpacity: 0.18, clampToGround: true, zIndex: 25 });
assert.equal(horta.source.popup.titleProperty, "nome");
same(horta.source.popup.fields.map(f => [f.property, f.label, f.decimals, f.suffix]), [["area_ha", "Área", 2, " ha"], ["perimetro_m", "Perímetro", 0, " m"]]);
const [action] = horta.source.popup.actions;
same({ ...action }, { label: "Entrar na simulação 3D", url: "https://horta-comunitaria-3d.vercel.app/" });
same([...project.embeddedPages.allowedOrigins], ["https://horta-comunitaria-3d.vercel.app"]);
assert.equal(popup.allowedPageUrl(action.url, project.embeddedPages.allowedOrigins), action.url, "simulation URL passes the allowlist");
const feature = new cesium.Entity({ properties: { nome: "Horta comunitária agroflorestal", area_ha: 0.93, perimetro_m: 386 } });
popup.registerVectorPopup(feature, horta.source.popup);
const hortaPopup = popup.readVectorPopup(feature, cesium.JulianDate.now(), project.embeddedPages.allowedOrigins);
assert.equal(hortaPopup.title, "Horta comunitária agroflorestal");
same(hortaPopup.fields.map(f => `${f.label}: ${f.value}`), ["Área: 0,93 ha", "Perímetro: 386 m"]);
same(hortaPopup.actions.map(a => [a.target, a.flyTo]), [["overlay", false]]);

// Both experiences pass the allowlist and open the overlay; the iframe stays sandboxed.
for (const file of ["src/App.tsx", "src/experiences/CommunityExperience.tsx"]) {
  const source = fs.readFileSync(path.join(root, file), "utf8");
  assert.match(source, /allowedOrigins=\{project\.embeddedPages\?\.allowedOrigins\} onOpenPage=\{openPage\}/, `${file} wires popup actions`);
  assert.match(source, /lazy\(\(\) => import\("[./]+components\/EmbeddedPageOverlay"\)\)/, `${file} loads the overlay on demand`);
}
const overlay = fs.readFileSync(path.join(root, "src/components/EmbeddedPageOverlay.tsx"), "utf8");
assert.match(overlay, /sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"/);
assert.match(overlay, /Voltar ao mapa/);
assert.match(overlay, /Abrir em nova aba/);
assert.match(overlay, /event\.key === "Escape"/);

setTimeout(() => console.log("Embedded pages passed: URL policy, actions, managed flight, Horta comunitária layer/origin/default flyTo, overlay wiring and sandbox."));
