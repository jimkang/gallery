import { RenderShader } from './render-shader.js';
import fragmentShaderSrc from './shaders/flood-noise-fragment-shader';
import { select } from 'd3-selection';

var shaderRenderer;

var randomNoiseValues = [
  0.35695464733288973, 0.5003738302201628, 0.46257837725529893,
  0.4726045795524718, 0.2867497541001114, 0.6899848586002852, 0.728924663417315,
  0.6894122037433856, 0.9532755608348062, 0.3346167886008733,
  0.6198814208918533, 0.7993674314252812, 0.2857964165633111, 0.204530798755169,
  0.6447611863167872, 0.22193880822216983, 0.7589570728971944,
  0.4091895308140585, 0.5794916445490992, 0.9419244591713121,
  0.4080169261644142, 0.6341480291556589, 0.787809492805176, 0.5829887384405641,
  0.17514245969745046, 0.7131615949201942, 0.030418111736869813,
  0.3149486640333541, 0.1767310473789483, 0.9902122620859823,
  0.06948587369885506, 0.31813964144147366, 0.46205976183755726,
  0.9072192679295983, 0.04904837299575471, 0.04518555809203817,
  0.42644362626790855, 0.05490486729128885, 0.36691120210255623,
  0.26621986542351816, 0.11440170021247309, 0.8426439235195, 0.5218034160395799,
  0.32703292444634746, 0.18268656400396144, 0.9126024939406137,
  0.4625517954363132, 0.5177149899558167, 0.046837565075761756,
  0.6731408998162054, 0.12441071516934143, 0.7885600898095788,
  0.5938341980865698, 0.13826983549933125, 0.19464105865973247,
  0.06949412984987635, 0.0700522893880835, 0.5794546103344327,
  0.14623780587547897, 0.9045468972341149, 0.6955447722883454,
  0.43844022119252823, 0.373445345861644, 0.09844675221457666,
  0.14938757020027316, 0.6040065913399291, 0.1351843616089483,
  0.6837526667830647, 0.10232205299072095, 0.167058542370218,
  0.7151280082310294, 0.7771238513071257, 0.02663641758166735,
  0.4659652371941343, 0.33297147073151545, 0.7844668527361722,
  0.4722949140838222, 0.5278418320712919, 0.8118654713596243,
  0.14582317212307738, 0.6190832206021433, 0.37058101872149707,
  0.06736824736653624, 0.9799472937531486, 0.5727958051722051,
  0.7195687071853039, 0.3247237772267564, 0.858824752648123, 0.9846121617395496,
  0.7567875266117494, 0.16183007735337096, 0.2670639364793661,
  0.8260547808815382, 0.012847731093022619, 0.7366576700667236,
  0.1255638152229681, 0.48903666506638244, 0.9170395991937355,
  0.7570006056778009, 0.19218612938647262,
];

export default function RenderFloodNoiseShader({
  density = 0.5,
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
      uniformType: '1fv',
      name: 'u_random_values',
      value: randomNoiseValues,
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
