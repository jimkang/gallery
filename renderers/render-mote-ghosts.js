import { RenderShader } from './render-shader.js';
import fragmentShaderSrc from './shaders/mote-ghosts-fragment-shader';

var renderShader;

export default function render({ canvas }) {
  if (!renderShader) {
    renderShader = RenderShader({ fragmentShaderSrc });
  }
  renderShader({ canvas });
}
