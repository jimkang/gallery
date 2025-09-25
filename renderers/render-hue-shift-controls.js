import { select } from 'd3-selection';
import throttle from 'lodash.throttle';

export default function renderHueShiftControls({
  rgbWaveStyle,
  rgbAmp,
  drawRGBWaves,
  onControlChange,
}) {
  var pieceCaptionSel = select('#hue-shift-piece .caption');
  var ampSliderSel = pieceCaptionSel.select('#hue-shift-amp-slider');
  var waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
  var drawWavesSel = select('#draw-rgb-waves');

  if (waveStylePulldownSel.empty()) {
    pieceCaptionSel.html(`<label for="hue-shift-toggle" class="name">Hue shift</label>
    <input type="checkbox" id="hue-shift-toggle" class="execute-toggle">

    <div class="piece-control">
      <label for="wave-style-pulldown">RGB wave style</label>
      <select id="wave-style-pulldown">
        <option value="0" selected="true">Triangle wave</option>
        <option value="1">Sine wave</option>
      </select>
    </div>

    <div class="piece-control">
      <label for="hue-shift-amp-slider">Sine wave amplitude</label>
      <input id="hue-shift-amp-slider" type="range" min="0.0" max="2.0" step="0.01" value="0">
      <span class="amp-text">0.33</span>
    </div>

    <div class="piece-control">
      <label for="red-shift-slider">Red wave phase shift</label>
      <input id="red-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
      <span class="amp-text"></span>
    </div>

    <div class="piece-control">
      <label for="green-shift-slider">Green wave phase shift</label>
      <input id="green-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
      <span class="amp-text"></span>
    </div>

    <div class="piece-control">
      <label for="blue-shift-slider">Blue wave phase shift</label>
      <input id="blue-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
      <span class="amp-text"></span>
    </div>

    <div class="piece-control">
      <label for="draw-rgb-waves">Draw RGB waves</label>
      <input type="checkbox" id="draw-rgb-waves" class="execute-toggle" checked>
    </div>
    `);

    waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
    waveStylePulldownSel.on('change', () =>
      onControlChange({ rgbWaveStyle: waveStylePulldownSel.node().value })
    );

    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#hue-shift-amp-slider',
      onControlChange,
      propName: 'rgbAmp',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#red-shift-slider',
      onControlChange,
      propName: 'rShift',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#green-shift-slider',
      onControlChange,
      propName: 'gShift',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#blue-shift-slider',
      onControlChange,
      propName: 'bShift',
    });
    drawWavesSel = select('#draw-rgb-waves');
    drawWavesSel.on('input', () =>
      onControlChange({ drawRGBWaves: drawWavesSel.node().checked })
    );
  }

  waveStylePulldownSel.node().value = rgbWaveStyle;
  pieceCaptionSel.select('.amp-text').text(rgbAmp);
  ampSliderSel.attr('value', rgbAmp);
  drawWavesSel.node().checked = drawRGBWaves;
}

function initSlider({ parentSel, selector, propName, onControlChange }) {
  var sliderSel = parentSel.select(selector);
  var throttledOnControlChange = throttle(onControlChange, 100);
  sliderSel.on('input', () =>
    throttledOnControlChange({ [propName]: sliderSel.node().value })
  );
}
