import { select } from 'd3-selection';

export default function renderHueShiftControls({
  // rgbWaveStyle,
  rgbAmp,
  onControlChange,
}) {
  var pieceCaptionSel = select('#hue-shift-piece .caption');
  var ampSlider = pieceCaptionSel.select('.amp-slider');
  if (ampSlider.empty()) {
    ampSlider = pieceCaptionSel
      .append('input')
      .attr('type', 'range')
      .attr('min', '0.0')
      .attr('max', '2.0')
      .attr('step', '0.01')
      .classed('amp-slider', true)
      .on('change', () => onControlChange({ rgbAmp: ampSlider.node().value }));
  }
  var ampText = pieceCaptionSel.select('.amp-text');
  if (ampText.empty()) {
    ampText = pieceCaptionSel.append('span').classed('amp-text', true);
  }

  ampText.text(rgbAmp);
  ampSlider.attr('value', rgbAmp);
}
