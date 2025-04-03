import OLPE from 'one-listener-per-element';

var { on } = OLPE();

export default function renderPieceControls({ piece, urlStore }) {
  on(`#${piece}-piece .expand-link`, 'click', onExpandClick);

  function onExpandClick() {
    urlStore.update({ focusPiece: piece });
  }
}
