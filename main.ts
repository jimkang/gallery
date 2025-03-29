import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
// import seedrandom from 'seedrandom';
// import RandomId from '@jimkang/randomid';
// import { createProbable as Probable } from 'probable';
import renderBouncingMondrian from './renderers/render-bouncing-mondrian';

var renderersForPieceNames = {
  'bouncing-mondrian': renderBouncingMondrian,
};

(async function go() {
  window.addEventListener('error', reportTopLevelError);
  renderVersion();

  for (let piece in renderersForPieceNames) {
    let canvas = document.getElementById(piece + '-canvas');
    renderersForPieceNames[piece]({ canvas });
  }
})();

function reportTopLevelError(event: ErrorEvent) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info') as HTMLElement;
  versionInfo.textContent = version;
}
