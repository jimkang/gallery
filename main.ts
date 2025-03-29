import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import renderBouncingMondrian from './renderers/render-bouncing-mondrian';
import RandomId from '@jimkang/randomid';
import { URLStore } from '@jimkang/url-store';

var randomId = RandomId();
var urlStore;

var renderersForPieceNames = {
  'bouncing-mondrian': renderBouncingMondrian,
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

function onUpdate({ seed }) {
  for (let piece in renderersForPieceNames) {
    let canvas = document.getElementById(piece + '-canvas');
    renderersForPieceNames[piece]({ canvas, seed });
  }
}

function reportTopLevelError(event: ErrorEvent) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info') as HTMLElement;
  versionInfo.textContent = version;
}
