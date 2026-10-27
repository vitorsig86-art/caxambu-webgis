// Local panel rendering and interaction checks. No browser or network required.
// Run: node scripts/check-workspace.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { renderToStaticMarkup } = require("react-dom/server");
const root = path.join(__dirname, "..");
const slots = [];
let cursor = 0;
const react = {
  ...require("react"),
  useState(initial) {
    const index = cursor++;
    if (!(index in slots)) slots[index] = typeof initial === "function" ? initial() : initial;
    return [slots[index], next => { slots[index] = typeof next === "function" ? next(slots[index]) : next; }];
  },
  useEffect() {},
};

function load(file) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  vm.runInNewContext(code, { exports, require: (name) => name.endsWith(".css") ? {} : name === "react" && file.endsWith("LayerPanel.tsx") ? react : name.startsWith(".")
    ? load(path.join(path.dirname(file), name + (fs.existsSync(path.join(root, path.dirname(file), name + ".ts")) ? ".ts" : ".tsx"))) : require(name) });
  return exports;
}

function elements(node, parents = []) {
  if (Array.isArray(node)) return node.flatMap((child) => elements(child, parents));
  if (!node || typeof node !== "object" || !node.props) return [];
  return [{ node, parents }, ...elements(node.props.children, [...parents, node])];
}

const { templateProject, exampleLayers } = load("src/projects/template.ts");
const project = { ...templateProject, layers: [...templateProject.layers.filter(layer => layer.kind === "basemap"), ...exampleLayers] };
const { LayerPanel, getWorkspaceSections } = load("src/components/LayerPanel.tsx");
const sections = getWorkspaceSections(project.layers);
assert.equal(JSON.stringify(sections.map((section) => [section.title, section.layers.length])), JSON.stringify([
  ["Mapa base", 1], ["Modelo 3D", 1], ["Rasters", 2], ["Vetores", 1], ["Análise Macro", 0],
]));
assert.equal(new Set(sections.flatMap((section) => section.layers.map((layer) => layer.id))).size, project.layers.length);
let visible = new Set(project.layers.filter((layer) => layer.defaultVisible).map((layer) => layer.id));
const opacities = {};
const toggles = [];
const opacityChanges = [];
const render = () => { cursor = 0; return LayerPanel({
  project, visible, rasterOpacities: opacities,
  statuses: {},
  onToggle: (id) => { toggles.push(id); if (visible.has(id)) visible.delete(id); else visible.add(id); },
  onOpacityChange: (id, value) => { opacityChanges.push([id, value]); opacities[id] = value; },
  onClose() {},
}); };
const initialTree = render();
const markup = renderToStaticMarkup(initialTree);
assert.doesNotMatch(markup, /<select|<option/);
assert.doesNotMatch(markup.replace(/<[^>]*>/g, " "), /PROJECT WORKSPACE|\bProject\b|\bLayers\b|\bactive\b|Choose what/);
assert.ok(markup.includes(project.name));
assert.ok(markup.includes(project.location));
assert.equal(elements(initialTree).filter(({ node }) => node.type === "input" && node.props.type === "range").length, 0);

for (const section of sections) {
  for (const layer of section.layers) {
    const row = elements(render()).find(({ node }) => node.key === layer.id).node;
    const checkbox = elements(row).find(({ node }) => node.type === "input" && node.props.type === "checkbox").node;
    const initial = visible.has(layer.id);
    assert.equal(checkbox.props.checked, initial);
    checkbox.props.onChange();
    assert.equal(visible.has(layer.id), !initial);
    checkbox.props.onChange();
    assert.equal(visible.has(layer.id), initial);
    assert.equal(toggles.at(-1), layer.id);
  }
}

visible = new Set(project.layers.map((layer) => layer.id));
assert.equal(elements(render()).filter(({ node }) => node.type === "input" && node.props.type === "range").length, 2);
for (const layer of sections.find((section) => section.id === "raster").layers) {
  const row = elements(render()).find(({ node }) => node.key === layer.id).node;
  const slider = elements(row).find(({ node }) => node.type === "input" && node.props.type === "range");
  assert.ok(!slider.parents.some((parent) => parent.type === "label"), "Moving opacity must not activate the checkbox label");
  assert.equal(slider.node.props.value, 100);
  assert.equal(slider.node.props.min, 0);
  assert.equal(slider.node.props.max, 100);
  slider.node.props.onChange({ currentTarget: { value: "65" } });
  assert.equal(JSON.stringify(opacityChanges.at(-1)), JSON.stringify([layer.id, 65]));
  assert.ok(visible.has(layer.id), "Opacity must not change visibility");
  const updatedRow = elements(render()).find(({ node }) => node.key === layer.id).node;
  assert.match(renderToStaticMarkup(updatedRow), /65%/);
}
for (const layer of sections.filter(section => section.id !== "raster").flatMap(section => section.layers)) {
  const row = elements(render()).find(({ node }) => node.key === layer.id).node;
  assert.ok(!elements(row).some(({ node }) => node.type === "input" && node.props.type === "range"));
}
assert.match(renderToStaticMarkup(render()), /model-layer-card/);
cursor = 0;
const flatTree = LayerPanel({ project, statuses: {}, visible, rasterOpacities: {}, is2D: true, onToggle() {}, onOpacityChange() {}, onClose() {} });
const modelRow = elements(flatTree).find(({ node }) => node.key === "model-example").node;
assert.equal(elements(modelRow).find(({ node }) => node.props.type === "checkbox").node.props.disabled, true);
assert.match(renderToStaticMarkup(modelRow), /Disponível no modo 3D/);
const { Legend } = load("src/components/Legend.tsx");
for (const layer of project.layers.filter(layer => layer.legend)) {
  assert.equal(Legend({ ...layer.legend, visibility: false }), null);
  const markup = renderToStaticMarkup(Legend({ ...layer.legend, visibility: true }));
  assert.ok(markup.includes(layer.legend.imageUrl));
  assert.ok(markup.includes(layer.legend.imageAlt));
  assert.doesNotMatch(markup, /raster-legend-gradient/);
  assert.match(renderToStaticMarkup(Legend({ ...layer.legend, imageUrl: "/future-legend.png", visibility: true })), /future-legend\.png/);
}
const gradientLegend = { title: "Gradient", min: 0, max: 10, tickValues: [0, 10], gradientStops: [{ position: 0, color: "blue" }, { position: 100, color: "red" }], visibility: true };
assert.match(renderToStaticMarkup(Legend(gradientLegend)), /raster-legend-gradient/);
assert.equal(Legend({ ...gradientLegend, max: 0 }), null);
console.log("Workspace passed: Portuguese sections, checkbox callbacks, independent sliders, 3D card, reusable image legends, hidden legends and gradient compatibility.");
