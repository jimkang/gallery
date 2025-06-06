import { select } from 'd3-selection';
import accessor from 'accessor';

var pieceGridSel = select('#piece-grid');

var svgExpandIconMarkup =
  '<svg class="expand-icon" width="34" height="34" viewBox="0 0 100 100"><g><polygon points="0,100 100,0 100,100"></polygon></g></svg>';

export default function renderPieces({ urlStore, pieceDefs, seed }) {
  var pieceSel = pieceGridSel.selectAll('li').data(pieceDefs, accessor('id'));

  pieceSel.exit().remove();

  var newPieceSel = pieceSel.enter().append('li');
  newPieceSel.append('canvas').attr('width', 320, 'height', 320);
  var newPieceInfoSel = newPieceSel.append('div').classed('piece-info', true);
  newPieceInfoSel.append('span').classed('caption', true);
  newPieceInfoSel
    .append('a')
    .classed('expand-link', true)
    .html(svgExpandIconMarkup);

  var extantPieceSel = newPieceSel.merge(pieceSel);
  extantPieceSel.attr('id', (def) => def.id + '-piece');
  extantPieceSel.select('canvas').attr('id', (def) => def.id + '-canvas');
  extantPieceSel.select('.caption').text(accessor('name'));
  extantPieceSel
    .select('.expand-link')
    .on('click', (_e, def) => urlStore.update({ focusPiece: def.id }));

  for (let piece of pieceDefs) {
    showPiece({ piece, seed });
  }

  function showPiece({ piece, seed, maximize = false }) {
    let container = document.getElementById(piece.id + '-piece');
    let canvas = document.getElementById(piece.id + '-canvas');

    sizeCanvasToContainer({ container, canvas, maximize });
    var resizeObserver = new ResizeObserver(onResizePieceContainer);
    resizeObserver.observe(container);

    // Why is the observer not ready?
    // piece.renderer({ canvas, seed });
    setTimeout(() => piece.renderer({ canvas, seed }), 100);
  }
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
  const squareSideLength = '' + Math.round(Math.min(rect.width, rect.height));
  resizeCanvas({
    canvas,
    width: squareSideLength,
    height: squareSideLength,
  });
}

function resizeCanvas({ canvas, width, height }) {
  canvas.setAttribute('width', width);
  canvas.setAttribute('height', height);
}
