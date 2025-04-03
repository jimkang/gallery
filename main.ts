import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import renderMovingMondrian from './renderers/render-moving-mondrian';
import renderPieceControls from './renderers/render-piece-controls';
import RandomId from '@jimkang/randomid';
import { URLStore } from '@jimkang/url-store';

var normalCanvasSize = [320, 320];

var randomId = RandomId();
var urlStore;

var renderersForPieceNames = {
  'moving-mondrian': renderMovingMondrian,
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
  if (focusPiece) {
    showPiece({ piece: focusPiece, seed, maximize: true });
  } else {
    for (let piece in renderersForPieceNames) {
      showPiece({ piece, seed });
    }
  }
}

function showPiece({ piece, seed, maximize = false }) {
  let canvas = document.getElementById(piece + '-canvas');
  if (!canvas) {
    return;
  }

  if (maximize) {
    const squareSideLength =
      '' + Math.min(window.innerWidth, window.innerHeight);
    canvas.setAttribute('width', squareSideLength);
    canvas.setAttribute('height', squareSideLength);
  } else {
    canvas.setAttribute('width', '' + normalCanvasSize[0]);
    canvas.setAttribute('height', '' + normalCanvasSize[1]);
  }

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
