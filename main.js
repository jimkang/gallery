import './app.css';
import handleError from 'handle-error-web';
import { version } from './package.json';
import moteGhostsFragmentShaderSrc from './renderers/shaders/mote-ghosts-fragment-shader';
import glowPlanetsFragmentShaderSrc from './renderers/shaders/glow-planets-fragment-shader';
import randomCellsFragmentShaderSrc from './renderers/shaders/random-cells-fragment-shader';
import waterNoiseFragmentShaderSrc from './renderers/shaders/water-noise-fragment-shader';
import electricalPartyFragmentShaderSrc from './renderers/shaders/electrical-party-fragment-shader';
import hueShiftFragmentShaderSrc from './renderers/shaders/hue-shift-fragment-shader';
import { RenderShader } from './renderers/render-shader';
import RenderMovingMondrianShader from './renderers/render-moving-mondrian';
import RenderFloodNoiseShader from './renderers/render-flood-noise';
import renderPieces from './renderers/render-pieces';
import RandomId from '@jimkang/randomid';
import { URLStore } from '@jimkang/url-store';
import renderHueShiftControls from './renderers/render-hue-shift-controls';

var randomId = RandomId();
var urlStore;

var movingMondrianPieceDef = {
  id: 'moving-mondrian',
  name: 'Moving Mondrian',
  wip: true,
  renderer: undefined,
  on: true,
};
var floodNoisePieceDef = {
  id: 'flood-noise',
  name: 'Flood noise',
  wip: true,
  renderer: undefined,
  on: true,
};

var pieceDefs = [
  {
    id: 'glow-planets',
    name: 'Glow Planets',
    renderer: RenderShader({
      fragmentShaderSrc: glowPlanetsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: true,
  },
  {
    id: 'random-cells',
    name: 'Random Cells',
    renderer: RenderShader({
      fragmentShaderSrc: randomCellsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: true,
  },
  {
    id: 'mote-ghosts',
    name: 'Mote Ghosts',
    renderer: RenderShader({
      fragmentShaderSrc: moteGhostsFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: false,
  },
  movingMondrianPieceDef,
  {
    id: 'water-noise',
    name: 'Water Noise',
    renderer: RenderShader({
      fragmentShaderSrc: waterNoiseFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: true,
    wip: true,
  },
  {
    id: 'electrical-party',
    name: 'Electrical Party',
    note: 'Warning: flashing lights',
    renderer: RenderShader({
      fragmentShaderSrc: electricalPartyFragmentShaderSrc,
      setCustomUniforms: undefined,
    }),
    on: false,
    wip: false,
  },
  floodNoisePieceDef,
  {
    id: 'hue-shift',
    name: 'Hue shift',
    renderer: RenderShader({
      fragmentShaderSrc: hueShiftFragmentShaderSrc,
      setCustomUniforms({ gl, program, setUniform, customParams }) {
        setUniform({
          gl,
          program,
          uniformType: '1i',
          name: 'u_rgbWaveStyle',
          value: customParams.rgbWaveStyle,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_rAmp',
          value: customParams.rAmp,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_gAmp',
          value: customParams.gAmp,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_bAmp',
          value: customParams.bAmp,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_rShift',
          value: customParams.rShift,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_gShift',
          value: customParams.gShift,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_bShift',
          value: customParams.bShift,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_rPeriod',
          value: customParams.rPeriod,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_gPeriod',
          value: customParams.gPeriod,
        });
        setUniform({
          gl,
          program,
          uniformType: '1f',
          name: 'u_bPeriod',
          value: customParams.bPeriod,
        });
        setUniform({
          gl,
          program,
          uniformType: '1i',
          name: 'u_drawRGBWaves',
          value: customParams.drawRGBWaves ? 1 : 0,
        });
      },
    }),
    on: true,
    wip: false,
    renderControls: renderHueShiftControls,
    // TODO: Add phase size controls
    onControlChange(params) {
      var updateOpts = {};
      var validUpdatedKeys = [
        'rgbWaveStyle',
        'rAmp',
        'gAmp',
        'bAmp',
        'rShift',
        'gShift',
        'bShift',
        'rPeriod',
        'gPeriod',
        'bPeriod',
        'drawRGBWaves',
      ].filter((key) => key in params);
      for (let key of validUpdatedKeys) {
        updateOpts[key] = params[key];
      }
      urlStore.update(updateOpts);
    },
  },
];

(async function go() {
  window.addEventListener('error', reportTopLevelError);
  renderVersion();

  urlStore = URLStore({
    onUpdate,
    windowObject: window,
    defaults: {
      seed: randomId(8),
      showWIP: false,
      density: 0.5,
      rgbWaveStyle: 0,
      rAmp: 1,
      gAmp: 1,
      bAmp: 1,
      rShift: 3 / 6,
      gShift: -1 / 6,
      bShift: -5 / 6,
      rPeriod: 1,
      gPeriod: 1,
      bPeriod: 1,
      drawRGBWaves: true,
    },
    boolKeys: ['showWIP', 'drawRGBWaves'],
    numberKeys: [
      'density',
      'rgbWaveStyle',
      'rAmp',
      'gAmp',
      'bAmp',
      'rShift',
      'gShift',
      'bShift',
      'rPeriod',
      'gPeriod',
      'bPeriod',
    ],
  });
  urlStore.update();
})();

function onUpdate(params) {
  var { seed, focusPiece, showWIP, density } = params;

  if (!seed) {
    urlStore.update({ seed: randomId(8) });
    return;
  }
  if (movingMondrianPieceDef.renderer) {
    movingMondrianPieceDef.renderer.setSeed({ seed });
  } else {
    movingMondrianPieceDef.renderer = RenderMovingMondrianShader({
      seed,
    });
  }
  if (!floodNoisePieceDef.renderer) {
    floodNoisePieceDef.renderer = RenderFloodNoiseShader({
      density,
      onDensityChange,
    });
  } else {
    floodNoisePieceDef.renderer.setDensity({ density });
  }

  var showablePieceDefs = pieceDefs.filter((def) => showWIP || !def.wip);
  renderPieces({
    pieceDefs: focusPiece
      ? pieceDefs.filter((def) => def.id === focusPiece)
      : showablePieceDefs,
    seed,
    urlStore,
    focusPiece,
    hideExpandCollapse: showablePieceDefs.length === 1,
    customParams: params,
  });
}

function onDensityChange({ density }) {
  urlStore.update({ density });
}

function reportTopLevelError(event) {
  handleError(event.error);
}

function renderVersion() {
  var versionInfo = document.getElementById('version-info');
  versionInfo.textContent = version;
}
