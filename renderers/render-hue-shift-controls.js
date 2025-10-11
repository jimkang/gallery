import { select } from 'd3-selection';
import throttle from 'lodash.throttle';
import hueShiftControlsBaseHTML from './hue-shift-controls-base-html';

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

  var waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
  if (waveStylePulldownSel.empty()) {
    pieceCaptionSel.html(hueShiftControlsBaseHTML);

    waveStylePulldownSel = pieceCaptionSel.select('#wave-style-pulldown');
    waveStylePulldownSel.on('change', () =>
      onControlChange({ rgbWaveStyle: waveStylePulldownSel.node().value })
    );
    let drawWavesSel = select('#draw-rgb-waves');
    drawWavesSel.node().checked = drawRGBWaves;
    drawWavesSel.on('input', () =>
      onControlChange({ drawRGBWaves: drawWavesSel.node().checked })
    );
    select('#randomize-hue-shift-button').on('click', randomize);
  }

  waveStylePulldownSel.node().value = rgbWaveStyle;
  pieceCaptionSel
    .selectAll('.sine-specific')
    .classed('hidden', +rgbWaveStyle === 0);

  [
    { sel: '#hue-shift-r-amp-slider', prop: 'rAmp' },
    { sel: '#hue-shift-g-amp-slider', prop: 'gAmp' },
    { sel: '#hue-shift-b-amp-slider', prop: 'bAmp' },
    { sel: '#hue-shift-r-vshift-slider', prop: 'rVShift' },
    { sel: '#hue-shift-g-vshift-slider', prop: 'gVShift' },
    { sel: '#hue-shift-b-vshift-slider', prop: 'bVShift' },
    { sel: '#red-shift-slider', prop: 'rShift' },
    { sel: '#green-shift-slider', prop: 'gShift' },
    { sel: '#blue-shift-slider', prop: 'bShift' },
    { sel: '#red-period-slider', prop: 'rPeriod' },
    { sel: '#green-period-slider', prop: 'gPeriod' },
    { sel: '#blue-period-slider', prop: 'bPeriod' },
  ].forEach(({ sel, prop }) =>
    initSlider({
      parentSel: pieceCaptionSel,
      selector: sel,
      propName: prop,
      onControlChange,
    })
  );

  [
    { selector: '.red .amp-text', value: rAmp },
    { selector: '.green .amp-text', value: gAmp },
    { selector: '.blue .amp-text', value: bAmp },

    { selector: '.r-vshift-text', value: rVShift },
    { selector: '.g-vshift-text', value: gVShift },
    { selector: '.b-vshift-text', value: bVShift },

    { selector: '.rshift-text', value: rShift },
    { selector: '.gshift-text', value: gShift },
    { selector: '.bshift-text', value: bShift },
    { selector: '.rperiod-text', value: rPeriod },
    { selector: '.gperiod-text', value: gPeriod },
    { selector: '.bperiod-text', value: bPeriod },
  ].forEach(setNumberText);

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

  function randomize() {
    onControlChange({
      rShift: Math.random() * 4 - 2,
    });
  }
}
