import { select } from 'd3-selection';
import accessor from 'accessor';

const captionSpace = 40;

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
  hideExpandCollapse = false,
}) {
  var pieceSel = pieceGridSel.selectAll('li').data(pieceDefs, accessor('id'));

  pieceSel.exit().remove();

  var newPieceSel = pieceSel.enter().append('li');
  newPieceSel.append('canvas').attr('width', 320, 'height', 320);
  newPieceSel.each(showPiece);
  var newPieceInfoSel = newPieceSel.append('div').classed('piece-info', true);

  var captionSel = newPieceInfoSel.append('div').classed('caption', true);
  captionSel
    .append('label')
    .attr('for', (def) => def.id + '-toggle')
    .classed('name', true);
  captionSel
    .append('input')
    .attr('type', 'checkbox')
    .attr('id', (def) => def.id + '-toggle')
    .classed('execute-toggle', true);

  captionSel.append('div').classed('note', true);

  newPieceInfoSel.append('a').classed('expand-collapse-link', true);

  var extantPieceSel = newPieceSel.merge(pieceSel);
  extantPieceSel.attr('id', (def) => def.id + '-piece');
  extantPieceSel.each(updateViewport);
  extantPieceSel.select('canvas').attr('id', (def) => def.id + '-canvas');
  extantPieceSel.select('.name').text(accessor('name'));
  extantPieceSel.select('.note').text(accessor('note'));
  extantPieceSel
    .select('.expand-collapse-link')
    .html(getExpandCollapseIcon)
    .on('click', onExpandCollapseClick);
  extantPieceSel
    .select('.execute-toggle')
    .each(setExecuteToggle)
    .on('change', updatePieceOn);

  function showPiece(piece) {
    let container = this;
    showPieceInContainer({ container, piece });
  }

  function showPieceInContainer({ container, piece }) {
    let canvas = select(container).select('canvas').node();
    if (!canvas) {
      throw new Error(
        'Could not find canvas onto which to render piece: ' + piece.name
      );
    }

    sizeCanvasToContainer({ container, canvas });
    var resizeObserver = new ResizeObserver(onResizePieceContainer);
    resizeObserver.observe(container);

    // Why is the observer not ready?
    // piece.renderer({ canvas, seed });
    setTimeout(
      () => piece.renderer.render({ canvas, seed, on: piece.on }),
      100
    );
  }

  function updateViewport(piece) {
    setTimeout(() => piece.renderer.updateViewport(), 100);
  }

  function onExpandCollapseClick(_e, def) {
    urlStore.update({ focusPiece: focusPiece ? null : def.id });
  }

  function getExpandCollapseIcon(def) {
    if (hideExpandCollapse) {
      return '';
    }
    if (def.id === focusPiece) {
      return svgCollapseIconMarkup;
    }
    return svgExpandIconMarkup;
  }

  function updatePieceOn(_e, def) {
    def.on = this.checked;
    showPieceInContainer({
      container: this?.parentElement?.parentElement?.parentElement,
      piece: def,
    });
    updateViewport(def);
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
  const squareSideLength =
    '' +
    Math.round(Math.min(rect.width - captionSpace, rect.height - captionSpace));
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

function setExecuteToggle(def) {
  this.checked = def.on;
}
