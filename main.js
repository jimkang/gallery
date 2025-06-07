import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import moteGhostsFragmentShaderSrc from './renderers/shaders/mote-ghosts-fragment-shader';
import glowPlanetsFragmentShaderSrc from './renderers/shaders/glow-planets-fragment-shader';
import randomCellsFragmentShaderSrc from './renderers/shaders/random-cells-fragment-shader';
import { RenderShader } from './renderers/render-shader';
import RenderMovingMondrianShader from './renderers/render-moving-mondrian';
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
};

var pieceDefs = [
  {
    id: 'glow-planets',
    name: 'Glow Planets',
    renderer: RenderShader({
      fragmentShaderSrc: glowPlanetsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    wip: true,
  },
  {
    id: 'random-cells',
    name: 'Random Cells',
    renderer: RenderShader({
      fragmentShaderSrc: randomCellsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    wip: true,
  },
  {
    id: 'mote-ghosts',
    name: 'Mote Ghosts',
    renderer: RenderShader({
      fragmentShaderSrc: moteGhostsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    wip: false,
  },
  movingMondrianPieceDef,
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
    },
    boolKeys: ['showWIP'],
  });
  urlStore.update();
})();

function onUpdate({ seed, focusPiece, showWIP }) {
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

  renderPieces({
    pieceDefs: focusPiece
      ? pieceDefs.filter((def) => def.id === focusPiece)
      : pieceDefs.filter((def) => showWIP || !def.wip),
    seed,
    urlStore,
    focusPiece,
  });
}

function reportTopLevelError(event) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
