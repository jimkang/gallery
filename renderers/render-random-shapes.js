import { RenderShader } from './render-shader.js';
import fragmentShaderSrc from './shaders/random-shapes-fragment-shader';

var renderShader;

export default function render({ canvas }) {
  if (!renderShader) {
    renderShader = RenderShader({ fragmentShaderSrc });
  }
  renderShader({ canvas });
}
