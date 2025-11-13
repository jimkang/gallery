import { RenderShader } from './render-shader.js';
import fragmentShaderSrc from './shaders/flood-noise-fragment-shader';
import { select } from 'd3-selection';

var shaderRenderer;

export default function RenderFloodNoiseShader({
  density = 0.5,
  ampChangeMult = 0.4,
  ampChangeFreqMult = 1,
  onDensityChange,
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
  };

  function setDensity({ density }) {
    _density = density;
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
    var densitySlider = pieceCaptionSel.select('.density-slider');
    if (densitySlider.empty()) {
      densitySlider = pieceCaptionSel
        .append('input')
        .attr('type', 'range')
        .attr('min', '0.0')
        .attr('max', '1.0')
        .attr('step', '0.01')
        .classed('density-slider', true)
        .on('change', () =>
          onDensityChange({ density: densitySlider.node().value })
        );
    }
    var densityText = pieceCaptionSel.select('.density-text');
    if (densityText.empty()) {
      densityText = pieceCaptionSel
        .append('span')
        .classed('density-text', true);
    }

    densityText.text(_density);
    densitySlider.attr('value', _density);
  }
}
