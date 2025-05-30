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

var renderersForPieceNames = {
  'glow-planets': renderGlowPlanets,
  'moving-mondrian': renderMovingMondrian,
  'random-cells': renderRandomCells,
  'mote-ghosts': renderMoteGhosts,
};

(async function go() {
  window.addEventListener('error', reportTopLevelError);
  renderVersion();

  urlStore = URLStore({
    onUpdate,
    windowObject: window,
    defaults: {
      seed: randomId(8),
    },
  });
  urlStore.update();
})();

function onUpdate({ seed, focusPiece }) {
  if (!seed) {
    urlStore.update({ seed: randomId(8) });
    return;
  }

  if (focusPiece) {
    showPiece({ piece: focusPiece, seed, maximize: true });
  } else {
    for (let piece in renderersForPieceNames) {
      showPiece({ piece, seed });
    }
  }
}

function showPiece({ piece, seed, maximize = false }) {
  let container = document.getElementById(piece + '-piece');
  let canvas = document.getElementById(piece + '-canvas');

  sizeCanvasToContainer({ container, canvas, maximize });
  var resizeObserver = new ResizeObserver(onResizePieceContainer);
  resizeObserver.observe(container as HTMLElement);

  renderersForPieceNames[piece]({ canvas, seed });
  renderPieceControls({ piece, urlStore });
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
