import { select } from 'd3-selection';
import throttle from 'lodash.throttle';

export default function renderHueShiftControls({
  rgbWaveStyle,
  rgbAmp,
  onControlChange,
}) {
  var pieceCaptionSel = select('#hue-shift-piece .caption');
  var ampSliderSel = pieceCaptionSel.select('#hue-shift-amp-slider');
  var waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');

  if (waveStylePulldownSel.empty()) {
    pieceCaptionSel.html(`<label for="hue-shift-toggle" class="name">Hue shift</label>
      <input type="checkbox" id="hue-shift-toggle" class="execute-toggle">

    <div>
      <label for="wave-style-pulldown">RGB wave style</label>
      <select id="wave-style-pulldown">
        <option value="0" selected="true">Triangle wave</option>
        <option value="1">Sine wave</option>
      </select>
    </div>

    <div>
      <label for="hue-shift-amp-slider">Sine wave amplitude</label>
      <input id="hue-shift-amp-slider" type="range" min="0.0" max="2.0" step="0.01" value="0">
      <span class="amp-text">0.33</span>
    </div>`);

    waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
    waveStylePulldownSel.on('change', () =>
      onControlChange({ rgbWaveStyle: waveStylePulldownSel.node().value })
    );

    ampSliderSel = pieceCaptionSel.select('#hue-shift-amp-slider');
    var throttledOnControlChange = throttle(onControlChange, 100);
    ampSliderSel.on('input', () =>
      throttledOnControlChange({ rgbAmp: ampSliderSel.node().value })
    );
  }

  waveStylePulldownSel.node().value = rgbWaveStyle;
  pieceCaptionSel.select('.amp-text').text(rgbAmp);
  ampSliderSel.attr('value', rgbAmp);
}
