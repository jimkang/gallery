export default `<h3>Hue shift</h3>
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

      <div class="piece-control">
        <button id="randomize-hue-shift-button">Randomize</button>
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
    `;
