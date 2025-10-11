import { select } from 'd3-selection';
import throttle from 'lodash.throttle';

export default function renderHueShiftControls(params) {
  var {
    rgbWaveStyle,
    rAmp,
    gAmp,
    bAmp,
    rVShift,
    gVShift,
    bVShift,
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
  var rAmpSliderSel = pieceCaptionSel.select('#hue-shift-r-amp-slider');
  var gAmpSliderSel = pieceCaptionSel.select('#hue-shift-g-amp-slider');
  var bAmpSliderSel = pieceCaptionSel.select('#hue-shift-b-amp-slider');
  var rVShiftSliderSel = pieceCaptionSel.select('#hue-shift-r-vshift-slider');
  var gVShiftSliderSel = pieceCaptionSel.select('#hue-shift-g-vshift-slider');
  var bVShiftSliderSel = pieceCaptionSel.select('#hue-shift-b-vshift-slider');
  var waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
  var drawWavesSel = select('#draw-rgb-waves');

  if (waveStylePulldownSel.empty()) {
    pieceCaptionSel.html(`<h3>Hue shift</h3>
    <div class="horizontal-control-group">
      <div class="piece-control">
        <label for="wave-style-pulldown">RGB wave style</label>
        <select id="wave-style-pulldown">
          <option value="0" selected="true">Triangle wave</option>
          <option value="1">Sine wave</option>
        </select>
      </div>

      <div class="piece-control">
        <label for="draw-rgb-waves">Draw RGB waves</label>
        <input type="checkbox" id="draw-rgb-waves" checked>
      </div>
    </div>

    <div class="rgb-sliders">
      <div class="rgb-panel">
        <h4>Phase shift</h4>
        <div class="rgb-group">
          <div class="piece-control">
            <label for="red-shift-slider">R</label>
            <input id="red-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
            <span class="rshift-text"></span>
          </div>

          <div class="piece-control">
            <label for="green-shift-slider">G</label>
            <input id="green-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
            <span class="gshift-text"></span>
          </div>

          <div class="piece-control">
            <label for="blue-shift-slider">B</label>
            <input id="blue-shift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
            <span class="bshift-text"></span>
          </div>
        </div>
      </div>

      <div class="rgb-panel">
        <h4>Vertical shift</h4>
        <div class="rgb-group">
          <div class="piece-control">
            <label for="red-vshift-slider">R</label>
            <input id="hue-shift-r-vshift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
            <span class="r-vshift-text"></span>
          </div>

          <div class="piece-control">
            <label for="green-vshift-slider">G</label>
            <input id="hue-shift-g-vshift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
            <span class="g-vshift-text"></span>
          </div>

          <div class="piece-control">
            <label for="blue-vshift-slider">B</label>
            <input id="hue-shift-b-vshift-slider" type="range" min="-2.0" max="2.0" step="0.01" value="0">
            <span class="b-vshift-text"></span>
          </div>
        </div>
      </div>

      <div class="rgb-panel sine-specific">
        <h4>Sine wave amp</h4>
        <div class="rgb-group">
          <div class="piece-control sine-specific red">
            <label for="hue-shift-r-amp-slider">R</label>
            <input id="hue-shift-r-amp-slider" type="range" min="0.0" max="2.0" step="0.01" value="0">
            <span class="amp-text">0.33</span>
          </div>

          <div class="piece-control sine-specific green">
            <label for="hue-shift-g-amp-slider">G</label>
            <input id="hue-shift-g-amp-slider" type="range" min="0.0" max="2.0" step="0.01" value="0">
            <span class="amp-text">0.33</span>
          </div>

          <div class="piece-control sine-specific blue">
            <label for="hue-shift-b-amp-slider">B</label>
            <input id="hue-shift-b-amp-slider" type="range" min="0.0" max="2.0" step="0.01" value="0">
            <span class="amp-text">0.33</span>
          </div>
        </div>
      </div>

      <div class="rgb-panel sine-specific">
        <h4>Sine wave period</h4>
        <div class="rgb-group">
          <div class="piece-control sine-specific">
            <label for="red-period-slider">R</label>
            <input id="red-period-slider" type="range" min="0" max="2.0" step="0.01" value="2">
            <span class="rperiod-text"></span>
          </div>

          <div class="piece-control sine-specific">
            <label for="green-period-slider">G</label>
            <input id="green-period-slider" type="range" min="0" max="2.0" step="0.01" value="2">
            <span class="gperiod-text"></span>
          </div>

          <div class="piece-control sine-specific">
            <label for="blue-period-slider">B</label>
            <input id="blue-period-slider" type="range" min="0" max="2.0" step="0.01" value="2">
            <span class="bperiod-text"></span>
          </div>
        </div>
      </div>
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
      selector: '#hue-shift-r-amp-slider',
      onControlChange,
      propName: 'rAmp',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#hue-shift-g-amp-slider',
      onControlChange,
      propName: 'gAmp',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#hue-shift-b-amp-slider',
      onControlChange,
      propName: 'bAmp',
    });

    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#hue-shift-r-vshift-slider',
      onControlChange,
      propName: 'rVShift',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#hue-shift-g-vshift-slider',
      onControlChange,
      propName: 'gVShift',
    });
    initSlider({
      parentSel: pieceCaptionSel,
      selector: '#hue-shift-b-vshift-slider',
      onControlChange,
      propName: 'bVShift',
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
    drawWavesSel.node().checked = drawRGBWaves;
    drawWavesSel.on('input', () =>
      onControlChange({ drawRGBWaves: drawWavesSel.node().checked })
    );
  }

  waveStylePulldownSel.node().value = rgbWaveStyle;
  pieceCaptionSel
    .selectAll('.sine-specific')
    .classed('hidden', +rgbWaveStyle === 0);
  setNumberText({ selector: '.red .amp-text', value: rAmp });
  setNumberText({ selector: '.green .amp-text', value: gAmp });
  setNumberText({ selector: '.blue .amp-text', value: bAmp });

  setNumberText({ selector: '.r-vshift-text', value: rVShift });
  setNumberText({ selector: '.g-vshift-text', value: gVShift });
  setNumberText({ selector: '.b-vshift-text', value: bVShift });

  rAmpSliderSel.attr('value', rAmp);
  gAmpSliderSel.attr('value', gAmp);
  bAmpSliderSel.attr('value', bAmp);
  rVShiftSliderSel.attr('value', rVShift);
  gVShiftSliderSel.attr('value', gVShift);
  bVShiftSliderSel.attr('value', bVShift);

  setNumberText({ selector: '.rshift-text', value: rShift });
  setNumberText({ selector: '.gshift-text', value: gShift });
  setNumberText({ selector: '.bshift-text', value: bShift });
  setNumberText({ selector: '.rperiod-text', value: rPeriod });
  setNumberText({ selector: '.gperiod-text', value: gPeriod });
  setNumberText({ selector: '.bperiod-text', value: bPeriod });

  function initSlider({ parentSel, selector, propName, onControlChange }) {
    var sliderSel = parentSel.select(selector);
    var throttledOnControlChange = throttle(onControlChange, 100);
    sliderSel.on('input', () =>
      throttledOnControlChange({ [propName]: sliderSel.node().value })
    );
    sliderSel.node().value = params[propName];
  }
  function setNumberText({ selector, value }) {
    pieceCaptionSel.select(selector).text((+value).toFixed(3));
  }
}
