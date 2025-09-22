import { select } from 'd3-selection';
import throttle from 'lodash.throttle';

export default function renderHueShiftControls({
  rgbWaveStyle,
  rgbAmp,
  onControlChange,
}) {
  var pieceCaptionSel = select('#hue-shift-piece .caption');
  var ampSlider = pieceCaptionSel.select('#hue-shift-amp-slider');
  if (ampSlider.empty()) {
    pieceCaptionSel
      .append('label')
      .attr('for', 'hue-shift-amp-slider')
      .text('Sine wave amplitude');

    var throttledOnControlChange = throttle(onControlChange, 100);
    ampSlider = pieceCaptionSel
      .append('input')
      .attr('id', 'hue-shift-amp-slider')
      .attr('type', 'range')
      .attr('min', '0.0')
      .attr('max', '2.0')
      .attr('step', '0.01')
      .attr('list', 'hue-amp-slider-markers')
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

  var waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
  if (waveStylePulldownSel.empty()) {
    pieceCaptionSel
      .append('label')
      .attr('for', 'wave-style-pulldown')
      .text('RGB wave style');

    waveStylePulldownSel = pieceCaptionSel
      .append('select')
      .attr('id', 'wave-style-pulldown');
    let triOptSel = waveStylePulldownSel
      .append('option')
      .attr('value', 0)
      .text('Triangle wave');
    if (rgbWaveStyle === 0) {
      triOptSel.attr('selected', true);
    }
    let sineOptSel = waveStylePulldownSel
      .append('option')
      .attr('value', 1)
      .text('Sine wave');
    if (rgbWaveStyle === 1) {
      sineOptSel.attr('selected', true);
    }
    waveStylePulldownSel.on('change', () =>
      onControlChange({ rgbWaveStyle: waveStylePulldownSel.node().value })
    );
  }
}
