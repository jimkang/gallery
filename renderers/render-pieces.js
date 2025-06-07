import { select } from 'd3-selection';
import accessor from 'accessor';

var pieceGridSel = select('#piece-grid');

var svgExpandIconMarkup =
  '<svg class="expand-icon" width="34" height="34" viewBox="0 0 100 100"><g><polygon points="10,90 90,10 90,90"></polygon></g></svg>';
var svgCollapseIconMarkup =
  '<svg class="collapse-icon" width="34" height="34" viewBox="0 0 100 100"><g><polygon points="10,90 10,10 90,10"></polygon></g></svg>';

export default function renderPieces({
  urlStore,
  pieceDefs,
  focusPiece,
  seed,
}) {
  var pieceSel = pieceGridSel.selectAll('li').data(pieceDefs, accessor('id'));

  pieceSel.exit().remove();

  var newPieceSel = pieceSel.enter().append('li');
  newPieceSel.append('canvas').attr('width', 320, 'height', 320);
  newPieceSel.each(showPiece);
  var newPieceInfoSel = newPieceSel.append('div').classed('piece-info', true);
  newPieceInfoSel.append('span').classed('caption', true);
  newPieceInfoSel.append('a').classed('expand-collapse-link', true);

  var extantPieceSel = newPieceSel.merge(pieceSel);
  extantPieceSel.attr('id', (def) => def.id + '-piece');
  extantPieceSel.each(updateViewport);
  extantPieceSel.select('canvas').attr('id', (def) => def.id + '-canvas');
  extantPieceSel.select('.caption').text(accessor('name'));
  extantPieceSel
    .select('.expand-collapse-link')
    .html((def) =>
      def.id === focusPiece ? svgCollapseIconMarkup : svgExpandIconMarkup
    )
    .on('click', onExpandCollapseClick);

  function showPiece(piece) {
    let container = this;
    let canvas = select(container).select('canvas').node();

    sizeCanvasToContainer({ container, canvas });
    var resizeObserver = new ResizeObserver(onResizePieceContainer);
    resizeObserver.observe(container);

    // Why is the observer not ready?
    // piece.renderer({ canvas, seed });
    setTimeout(() => piece.renderer.render({ canvas, seed }), 100);
  }

  function updateViewport(piece) {
    setTimeout(() => piece.renderer.updateViewport(), 100);
  }

  function onExpandCollapseClick(_e, def) {
    urlStore.update({ focusPiece: focusPiece ? null : def.id });
  }
}

function onResizePieceContainer(resizedEntries) {
  for (let entry of resizedEntries) {
    let container = entry.target;
    let canvas = container.querySelector('canvas');
    sizeCanvasToContainer({
      container,
      canvas,
    });
  }
}

function sizeCanvasToContainer({ container, canvas }) {
  if (!canvas || !container) {
    return;
  }

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
