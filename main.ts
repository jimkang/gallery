import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import renderMovingMondrian from './renderers/render-moving-mondrian';
import renderGlowPlanets from './renderers/render-glow-planets';
import renderRandomCells from './renderers/render-random-cells';
import renderPieceControls from './renderers/render-piece-controls';
import RandomId from '@jimkang/randomid';
import { URLStore } from '@jimkang/url-store';

var normalCanvasSize = [320, 320];

var randomId = RandomId();
var urlStore;

var renderersForPieceNames = {
  'glow-planets': renderGlowPlanets,
  'moving-mondrian': renderMovingMondrian,
  'random-cells': renderRandomCells,
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
  if (!canvas || !container) {
    return;
  }

  container.classList[maximize ? 'add' : 'remove']('maximized');

  var rect = container.getBoundingClientRect();
  const squareSideLength = Math.min(rect.width, rect.height);
  canvas.setAttribute('width', '' + squareSideLength);
  canvas.setAttribute('height', '' + squareSideLength);

  renderersForPieceNames[piece]({ canvas, seed });
  renderPieceControls({ piece, urlStore });
}

function reportTopLevelError(event: ErrorEvent) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info') as HTMLElement;
  versionInfo.textContent = version;
}
