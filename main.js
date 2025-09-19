import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import moteGhostsFragmentShaderSrc from './renderers/shaders/mote-ghosts-fragment-shader';
import glowPlanetsFragmentShaderSrc from './renderers/shaders/glow-planets-fragment-shader';
import randomCellsFragmentShaderSrc from './renderers/shaders/random-cells-fragment-shader';
import waterNoiseFragmentShaderSrc from './renderers/shaders/water-noise-fragment-shader';
import electricalPartyFragmentShaderSrc from './renderers/shaders/electrical-party-fragment-shader';
import hueShiftFragmentShaderSrc from './renderers/shaders/hue-shift-fragment-shader';
import { RenderShader } from './renderers/render-shader';
import RenderMovingMondrianShader from './renderers/render-moving-mondrian';
import RenderFloodNoiseShader from './renderers/render-flood-noise';
import renderPieces from './renderers/render-pieces';
import RandomId from '@jimkang/randomid';
import { URLStore } from '@jimkang/url-store';

var randomId = RandomId();
var urlStore;

var movingMondrianPieceDef = {
  id: 'moving-mondrian',
  name: 'Moving Mondrian',
  wip: true,
  renderer: undefined,
  on: true,
};
var floodNoisePieceDef = {
  id: 'flood-noise',
  name: 'Flood noise',
  wip: true,
  renderer: undefined,
  on: true,
};

var pieceDefs = [
  {
    id: 'glow-planets',
    name: 'Glow Planets',
    renderer: RenderShader({
      fragmentShaderSrc: glowPlanetsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: true,
  },
  {
    id: 'random-cells',
    name: 'Random Cells',
    renderer: RenderShader({
      fragmentShaderSrc: randomCellsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: true,
  },
  {
    id: 'mote-ghosts',
    name: 'Mote Ghosts',
    renderer: RenderShader({
      fragmentShaderSrc: moteGhostsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: false,
  },
  movingMondrianPieceDef,
  {
    id: 'water-noise',
    name: 'Water Noise',
    renderer: RenderShader({
      fragmentShaderSrc: waterNoiseFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: true,
  },
  {
    id: 'electrical-party',
    name: 'Electrical Party',
    note: 'Warning: flashing lights',
    renderer: RenderShader({
      fragmentShaderSrc: electricalPartyFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: false,
    wip: false,
  },
  floodNoisePieceDef,
  {
    id: 'hue-shift',
    name: 'Hue shift',
    renderer: RenderShader({
      fragmentShaderSrc: hueShiftFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: true,
  },
];

(async function go() {
  window.addEventListener('error', reportTopLevelError);
  renderVersion();

  urlStore = URLStore({
    onUpdate,
    windowObject: window,
    defaults: {
      seed: randomId(8),
      showWIP: false,
      density: 0.5,
    },
    boolKeys: ['showWIP'],
    numberKeys: ['density'],
  });
  urlStore.update();
})();

function onUpdate({ seed, focusPiece, showWIP, density }) {
  if (!seed) {
    urlStore.update({ seed: randomId(8) });
    return;
  }

  if (movingMondrianPieceDef.renderer) {
    movingMondrianPieceDef.renderer.setSeed({ seed });
  } else {
    movingMondrianPieceDef.renderer = RenderMovingMondrianShader({
      seed,
    });
  }
  if (!floodNoisePieceDef.renderer) {
    floodNoisePieceDef.renderer = RenderFloodNoiseShader({
      density,
      onDensityChange,
    });
  } else {
    floodNoisePieceDef.renderer.setDensity({ density });
  }

  var showablePieceDefs = pieceDefs.filter((def) => showWIP || !def.wip);
  renderPieces({
    pieceDefs: focusPiece
      ? pieceDefs.filter((def) => def.id === focusPiece)
      : showablePieceDefs,
    seed,
    urlStore,
    focusPiece,
    hideExpandCollapse: showablePieceDefs.length === 1,
  });
}

function onDensityChange({ density }) {
  urlStore.update({ density });
}

function reportTopLevelError(event) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
