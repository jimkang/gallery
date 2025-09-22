import { select } from 'd3-selection';
import throttle from 'lodash.throttle';

export default function renderHueShiftControls({
  // rgbWaveStyle,
  rgbAmp,
  onControlChange,
}) {
  var pieceCaptionSel = select('#hue-shift-piece .caption');
  var ampSlider = pieceCaptionSel.select('.amp-slider');
  if (ampSlider.empty()) {
    var throttledOnControlChange = throttle(onControlChange, 100);
    ampSlider = pieceCaptionSel
      .append('input')
      .attr('type', 'range')
      .attr('min', '0.0')
      .attr('max', '2.0')
      .attr('step', '0.01')
      .attr('list', 'hue-amp-slider-markers')
      .classed('amp-slider', true)
      .on('input', () =>
        throttledOnControlChange({ rgbAmp: ampSlider.node().value })
      );
  }
  var ampText = pieceCaptionSel.select('.amp-text');
  if (ampText.empty()) {
    ampText = pieceCaptionSel.append('span').classed('amp-text', true);
  }

  ampText.text(rgbAmp);
  ampSlider.attr('value', rgbAmp);
}
