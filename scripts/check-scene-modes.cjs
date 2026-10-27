// Installed Cesium + synthetic lifecycle tests. No network or credentials.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const cesium = require("cesium");
const root = path.join(__dirname, "..");
function modules(dependencies = {}, search = "", globals = {}) {
  const cache = new Map();
  function load(file) {
    file = path.normalize(file);
    if (cache.has(file)) return cache.get(file);
    const exports = {};
    cache.set(file, exports);
    const code = ts.transpileModule(fs.readFileSync(path.join(root, file), "utf8").replaceAll("import.meta.env", "({})"), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText;
    vm.runInNewContext(code, { exports, console, URLSearchParams, window: { location: { search } }, ...globals,
      require: name => dependencies[name] ?? (name.startsWith(".") ? load(path.join(path.dirname(file), name + ".ts")) : require(name)),
    });
    return exports;
  }
  return load;
}
const load = modules();
const { resolveTechnicalExperience } = load("src/experiences/technical.ts");
assert.equal(resolveTechnicalExperience("").allow2D, false);
assert.equal(resolveTechnicalExperience("?sceneModes=on").allow2D, true);
assert.equal(resolveTechnicalExperience("?sceneModes=off").allow2D, false);
let options;
const factory = modules({ cesium: { Ion: {}, Viewer: class { constructor(_container, value) { options = value; } } } })("src/cesium/createViewer.ts");
factory.createViewer({}); assert.equal(options.scene3DOnly, true);
factory.createViewer({}, true); assert.equal(options.scene3DOnly, false);
assert.equal(options.sceneModePicker, false); assert.equal(options.requestRenderMode, true);

const { createSceneModeController } = load("src/cesium/sceneMode.ts");
let destroyed = false, savedView, renders = 0, changes = 0;
const position = cesium.Cartesian3.fromDegrees(-44.93, -22, 1400);
const viewer = {
  isDestroyed: () => destroyed,
  camera: { cancelFlight() {}, positionWC: position, directionWC: new cesium.Cartesian3(0, 0, -1), upWC: new cesium.Cartesian3(0, 1, 0), transform: cesium.Matrix4.IDENTITY, setView(value) { savedView = value; } },
  scene: { mode: cesium.SceneMode.SCENE3D, scene3DOnly: false,
    morphTo2D(duration) { assert.equal(duration, 0); changes++; this.mode = cesium.SceneMode.SCENE2D; },
    morphTo3D(duration) { assert.equal(duration, 0); changes++; this.mode = cesium.SceneMode.SCENE3D; },
    requestRender() { renders++; },
  },
};
const control = createSceneModeController(viewer);
for (let i = 0; i < 4; i++) {
  assert.equal(control.change(cesium.SceneMode.SCENE2D), true);
  assert.equal(control.change(cesium.SceneMode.SCENE2D), false);
  assert.equal(control.change(cesium.SceneMode.SCENE3D), true);
  assert.ok(cesium.Cartesian3.equals(savedView.destination, position));
  assert.notEqual(savedView.destination, position, "Camera snapshot must be cloned");
}
assert.equal(changes, 8); assert.equal(renders, 8);
viewer.scene.scene3DOnly = true; assert.equal(control.change(cesium.SceneMode.SCENE2D), false);
viewer.scene.scene3DOnly = false;
destroyed = true; assert.equal(control.change(cesium.SceneMode.SCENE2D), false);
destroyed = false; control.dispose(); assert.equal(control.change(cesium.SceneMode.SCENE2D), false);

const project = load("src/projects/template.ts").templateProject;
assert.deepEqual(Array.from(project.layers.filter(l => l.defaultVisible), l => l.id), ["basemap", "orthomosaic"]);
const models = project.layers.filter(l => l.source.format === "3d-tiles");
assert.deepEqual(Array.from(models, l => l.source.assetId), [4131174, 4143059]);
const clipping = load("src/cesium/modelClipping.ts");
const collections = models.map(l => clipping.createModelClipping(l.source.clipping));
assert.notEqual(collections[0], collections[1]);
for (const c of collections) { assert.equal(c.inverse, true); assert.equal(c.length, 1); }
assert.equal(collections[0].get(0).length, 5); assert.equal(collections[1].get(0).length, 6);
assert.equal(modules({}, "?clipping3d-bairro02=off")("src/projects/template.ts").templateProject.layers.find(l => l.source.assetId === 4143059).source.clipping, undefined);
assert.ok(modules({}, "?clipping3d-bairro02=off")("src/projects/template.ts").templateProject.layers.find(l => l.source.assetId === 4131174).source.clipping);
assert.ok(modules({}, "?clipping3d=off")("src/projects/template.ts").templateProject.layers.find(l => l.source.assetId === 4143059).source.clipping);
// Cesium 1.146 collections own no GPU resources; destroy() is deprecated.

const utils = load("src/cesium/measurementUtils.ts");
let terrainPicks = 0;
const flat = { isDestroyed: () => false,
  camera: { pickEllipsoid: () => position },
  scene: { mode: cesium.SceneMode.SCENE2D, globe: { ellipsoid: cesium.Ellipsoid.WGS84, pick() { terrainPicks++; } }, pickPosition() { throw Error("2D must not use scene depth"); } },
};
assert.ok(cesium.Cartesian3.equals(utils.pickMeasurementPosition(flat, new cesium.Cartesian2()), position));
assert.equal(utils.pickHeightPosition(flat, new cesium.Cartesian2(), new cesium.EntityCollection()), undefined);
assert.equal(terrainPicks, 0);
flat.scene.mode = cesium.SceneMode.SCENE3D;
flat.scene.pickPositionSupported = true;
flat.scene.pickPosition = () => undefined;
flat.scene.globe.show = true;
flat.scene.drillPick = () => [{ primitive: {} }];
assert.equal(utils.pickHeightPosition(flat, new cesium.Cartesian2(), new cesium.EntityCollection()), undefined);
assert.equal(terrainPicks, 0, "Detected 3D object without depth must block terrain substitution");
console.log("Scene modes passed: opt-in policy, unchanged default Viewer, repeated 2D/3D transitions and camera restoration, disposal, two independent clipping collections/diagnostics, initial states, 2D picking and no silent height fallback.");

// Synthetic GPS fixes only: never request the user's real location during tests.
let effect, fix, cleared = 0, gpsState, flight;
const gpsReact = {
  useRef: value => ({ current: value }),
  useState: initial => { gpsState = initial; return [initial, next => { gpsState = typeof next === "function" ? next(gpsState) : next; }]; },
  useEffect: callback => { effect = callback; },
};
const gpsViewer = { isDestroyed: () => false, entities: new cesium.EntityCollection(),
  camera: { cancelFlight() {}, heading: 0 }, scene: { mode: cesium.SceneMode.SCENE2D, requestRender() {} },
  flyTo(marker, options) { flight = { marker, options, mode: this.scene.mode }; return Promise.resolve(true); },
};
const gps = modules({ react: gpsReact }, "", { navigator: { geolocation: {
  watchPosition(success) { fix = success; return 123; }, clearWatch(id) { assert.equal(id, 123); cleared++; },
} } })("src/hooks/useGeolocation.ts").useGeolocation(gpsViewer);
const cleanupGPS = effect();
gps.locate(); assert.equal(gpsState.status, "locating");
fix({ coords: { longitude: -44.93, latitude: -22, accuracy: 20 } });
assert.equal(gpsState.status, "active"); assert.equal(flight.mode, cesium.SceneMode.SCENE2D);
assert.equal(gpsViewer.entities.values.length, 2);
gpsViewer.scene.mode = cesium.SceneMode.SCENE3D;
gps.locate(); assert.equal(flight.mode, cesium.SceneMode.SCENE3D);
gps.stop(); assert.equal(cleared, 1); assert.equal(gpsState.status, "idle");
cleanupGPS(); assert.equal(gpsViewer.entities.values.length, 0);
console.log("GPS passed with synthetic fix: watch, marker/accuracy, recenter requests in 2D/3D, stop and cleanup; actual device permission/accuracy untested.");
