import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import renderMovingMondrian from './renderers/render-moving-mondrian';
import renderGlowPlanets from './renderers/render-glow-planets';
import renderRandomCells from './renderers/render-random-cells';
import renderMoteGhosts from './renderers/render-mote-ghosts';
import renderPieces from './renderers/render-pieces';
import RandomId from '@jimkang/randomid';
import { URLStore } from '@jimkang/url-store';

var randomId = RandomId();
var urlStore;

var pieceDefs = [
  {
    id: 'glow-planets',
    name: 'Glow Planets',
    renderer: renderGlowPlanets,
    wip: true,
  },
  {
    id: 'moving-mondrian',
    name: 'Moving Mondrian',
    renderer: renderMovingMondrian,
    wip: true,
  },
  {
    id: 'random-cells',
    name: 'Random Cells',
    renderer: renderRandomCells,
    wip: true,
  },
  {
    id: 'mote-ghosts',
    name: 'Mote Ghosts',
    renderer: renderMoteGhosts,
    wip: false,
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

  renderPieces({
    pieceDefs: focusPiece
      ? pieceDefs.filter((def) => def.id === focusPiece)
      : pieceDefs.filter((def) => showWIP || !def.wip),
    seed,
    urlStore,
    focusPiece,
  });
}

function reportTopLevelError(event: ErrorEvent) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info') as HTMLElement;
  versionInfo.textContent = version;
}
