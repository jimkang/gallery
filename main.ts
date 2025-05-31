import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import renderMovingMondrian from './renderers/render-moving-mondrian';
import renderGlowPlanets from './renderers/render-glow-planets';
import renderRandomCells from './renderers/render-random-cells';
import renderMoteGhosts from './renderers/render-mote-ghosts';
import renderPieceControls from './renderers/render-piece-controls';
import RandomId from '@jimkang/randomid';
import { URLStore } from '@jimkang/url-store';

var randomId = RandomId();
var urlStore;

var pieceDefs = [
  { id: 'glow-planets', renderer: renderGlowPlanets, wip: true },
  { id: 'moving-mondrian', renderer: renderMovingMondrian, wip: true },
  { id: 'random-cells', renderer: renderRandomCells, wip: true },
  { id: 'mote-ghosts', renderer: renderMoteGhosts, wip: false },
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

  var filteredPieceDefs = pieceDefs.filter((def) => showWIP || !def.wip);

  if (focusPiece) {
    let piece = filteredPieceDefs.find((def) => def.id === focusPiece);
    showPiece({
      piece,
      seed,
      maximize: true,
    });
  } else {
    for (let piece of filteredPieceDefs) {
      showPiece({ piece, seed });
    }
  }
}

function showPiece({ piece, seed, maximize = false }) {
  let container = document.getElementById(piece.id + '-piece');
  let canvas = document.getElementById(piece.id + '-canvas');

  sizeCanvasToContainer({ container, canvas, maximize });
  var resizeObserver = new ResizeObserver(onResizePieceContainer);
  resizeObserver.observe(container as HTMLElement);

  piece.renderer({ canvas, seed });
  renderPieceControls({ piece: piece.id, urlStore });
}

function onResizePieceContainer(resizedEntries) {
  for (let entry of resizedEntries) {
    let container = entry.target;
    let canvas = container.querySelector('canvas');
    sizeCanvasToContainer({
      container,
      canvas,
      maximize: container.classList.contains('maximized'),
    });
  }
}

function sizeCanvasToContainer({ container, canvas, maximize }) {
  if (!canvas || !container) {
    return;
  }

  container.classList[maximize ? 'add' : 'remove']('maximized');

  var rect = container.getBoundingClientRect();
  const squareSideLength = '' + Math.min(rect.width, rect.height);
  resizeCanvas({ canvas, width: squareSideLength, height: squareSideLength });
}

function resizeCanvas({ canvas, width, height }) {
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
}

function reportTopLevelError(event: ErrorEvent) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info') as HTMLElement;
  versionInfo.textContent = version;
}
