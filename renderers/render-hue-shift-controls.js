import { select } from 'd3-selection';
import throttle from 'lodash.throttle';

export default function renderHueShiftControls(params) {
  var {
    rgbWaveStyle,
    rgbAmp,
    rShift,
    gShift,
    bShift,
    rPeriod,
    gPeriod,
    bPeriod,
    drawRGBWaves,
    onControlChange,
  } = params;

  var pieceCaptionSel = select('#hue-shift-piece .caption');
  var ampSliderSel = pieceCaptionSel.select('#hue-shift-amp-slider');
  var waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
  var drawWavesSel = select('#draw-rgb-waves');

  if (waveStylePulldownSel.empty()) {
    pieceCaptionSel.html(`<h3>Hue shift</h3>
    <div class="piece-control">
      <label for="wave-style-pulldown">RGB wave style</label>
      <select id="wave-style-pulldown">
        <option value="0" selected="true">Triangle wave</option>
        <option value="1">Sine wave</option>
      </select>
    </div>

    <div class="piece-control">
      <label for="red-shift-slider">Red wave phase shift</label>
      <input id="red-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
      <span class="rshift-text"></span>
    </div>

    <div class="piece-control">
      <label for="green-shift-slider">Green wave phase shift</label>
      <input id="green-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
      <span class="gshift-text"></span>
    </div>

    <div class="piece-control">
      <label for="blue-shift-slider">Blue wave phase shift</label>
      <input id="blue-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
      <span class="bshift-text"></span>
    </div>

    <div class="piece-control sine-specific">
      <label for="hue-shift-amp-slider">Sine wave amplitude</label>
      <input id="hue-shift-amp-slider" type="range" min="0.0" max="2.0" step="0.01" value="0">
      <span class="amp-text">0.33</span>
    </div>

    <div class="piece-control sine-specific">
      <label for="red-period-slider">Red sine wave period</label>
      <input id="red-period-slider" type="range" min="0" max="2.0" step="0.01" value="2">
      <span class="rperiod-text"></span>
    </div>

    <div class="piece-control sine-specific">
      <label for="green-period-slider">Green sine wave period</label>
      <input id="green-period-slider" type="range" min="0" max="2.0" step="0.01" value="2">
      <span class="gperiod-text"></span>
    </div>

    <div class="piece-control sine-specific">
      <label for="blue-period-slider">Blue sine wave period</label>
      <input id="blue-period-slider" type="range" min="0" max="2.0" step="0.01" value="2">
      <span class="bperiod-text"></span>
    </div>

    <div class="piece-control">
      <label for="draw-rgb-waves">Draw RGB waves</label>
      <input type="checkbox" id="draw-rgb-waves" class="execute-toggle" checked>
    </div>
    <br>
    <div>This is a spectrum. The x axis is the hue value, from 0.0 to 1.0. Red, green, and blue component values are shown on the y axes at the various hue values in the line graphs. The color resulting from the combination of R, G, and B values is shown behind the line graphs. (<a href="https://jimkang.com/weblog/articles/hue-shifting/">More about the relationship between hue and the color components, if you're interested.</a>) You can mess with the controls here to alter the spectrum.</div>
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
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#red-period-slider',
      onControlChange,
      propName: 'rPeriod',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#green-period-slider',
      onControlChange,
      propName: 'gPeriod',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#blue-period-slider',
      onControlChange,
      propName: 'bPeriod',
    });
    drawWavesSel = select('#draw-rgb-waves');
    drawWavesSel.on('input', () =>
      onControlChange({ drawRGBWaves: drawWavesSel.node().checked })
    );
  }

  waveStylePulldownSel.node().value = rgbWaveStyle;
  pieceCaptionSel
    .selectAll('.sine-specific')
    .classed('hidden', +rgbWaveStyle === 0);
  pieceCaptionSel.select('.amp-text').text(rgbAmp);
  ampSliderSel.attr('value', rgbAmp);
  pieceCaptionSel.select('.rshift-text').text(rShift);
  pieceCaptionSel.select('.gshift-text').text(gShift);
  pieceCaptionSel.select('.bshift-text').text(bShift);
  pieceCaptionSel.select('.rperiod-text').text(rPeriod);
  pieceCaptionSel.select('.gperiod-text').text(gPeriod);
  pieceCaptionSel.select('.bperiod-text').text(bPeriod);
  drawWavesSel.node().checked = drawRGBWaves;

  function initSlider({ parentSel, selector, propName, onControlChange }) {
    var sliderSel = parentSel.select(selector);
    var throttledOnControlChange = throttle(onControlChange, 100);
    sliderSel.on('input', () =>
      throttledOnControlChange({ [propName]: sliderSel.node().value })
    );
    sliderSel.node().value = params[propName];
  }
}
