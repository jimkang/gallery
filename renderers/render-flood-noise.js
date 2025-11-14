import { RenderShader } from './render-shader.js';
import fragmentShaderSrc from './shaders/flood-noise-fragment-shader';
import { select } from 'd3-selection';

var shaderRenderer;

export default function RenderFloodNoiseShader({
  density = 0.5,
  ampChangeMult = 0.4,
  ampChangeFreqMult = 1,
  onDensityChange,
  onAmpChangeMult,
  onAmpChangeFreqMult,
}) {
  var _density = density;

  if (!shaderRenderer) {
    shaderRenderer = RenderShader({
      fragmentShaderSrc,
      setCustomUniforms,
    });
  }

  return {
    render,
    updateViewport: shaderRenderer.updateViewport,
    setDensity,
    setAmpChangeFreqMult,
    setAmpChangeMult,
  };

  function setDensity(density) {
    _density = density;
    renderControls();
  }

  function setAmpChangeMult(mult) {
    ampChangeMult = mult;
    renderControls();
  }

  function setAmpChangeFreqMult(mult) {
    ampChangeFreqMult = mult;
    renderControls();
  }

  function render({ canvas, on }) {
    shaderRenderer.render({ canvas, on });
    renderControls();
  }

  function setCustomUniforms({ gl, program, setUniform }) {
    setUniform({
      gl,
      program,
      uniformType: '1f',
      name: 'u_density',
      value: _density,
    });
    setUniform({
      gl,
      program,
      uniformType: '1f',
      name: 'u_ampChangeMult',
      value: ampChangeMult,
    });
    setUniform({
      gl,
      program,
      uniformType: '1f',
      name: 'u_ampChangeFreqMult',
      value: ampChangeFreqMult,
    });
  }

  function renderControls() {
    var pieceCaptionSel = select('#flood-noise-piece .caption');
    renderSlider({
      parentSel: pieceCaptionSel,
      sliderClass: 'density-slider',
      textValueClass: 'density-text',
      onChangeFn: onDensityChange,
      value: _density,
      min: 0,
      max: 1,
    });
    renderSlider({
      parentSel: pieceCaptionSel,
      sliderClass: 'amp-change-freq-mult-slider',
      textValueClass: 'amp-change-freq-mult-text',
      onChangeFn: onAmpChangeFreqMult,
      value: ampChangeFreqMult,
      min: 0,
      max: 4,
    });
    renderSlider({
      parentSel: pieceCaptionSel,
      sliderClass: 'amp-change-mult-slider',
      textValueClass: 'amp-change-mult-text',
      onChangeFn: onAmpChangeMult,
      value: ampChangeMult,
      min: 0,
      max: 1,
    });
  }

  function renderSlider({
    parentSel,
    sliderClass,
    textValueClass,
    onChangeFn,
    min,
    max,
    value,
  }) {
    var sliderSel = parentSel.select('.' + sliderClass);
    if (sliderSel.empty()) {
      sliderSel = parentSel
        .append('input')
        .attr('type', 'range')
        .attr('min', min)
        .attr('max', max)
        .attr('step', '0.01')
        .classed(sliderClass, true)
        .on('change', () => onChangeFn(sliderSel.node().value));
    }
    var textSel = parentSel.select('.' + textValueClass);
    if (textSel.empty()) {
      textSel = parentSel.append('span').classed(textValueClass, true);
    }

    textSel.text(value);
    sliderSel.attr('value', value);
  }
}
