/*
 * From http://www.redblobgames.com/x/1736-resource-placement/
 * Copyright 2017 Red Blob Games <redblobgames@gmail.com>
 * License: Apache v2.0 <http://www.apache.org/licenses/LICENSE-2.0.html>
 */
"use strict";

console.info(
  "I'm happy to answer questions about the code; email me at redblobgames@gmail.com"
);

const SEED = 12345;
let noisegen = new SimplexNoise(makeRandFloat(SEED));

function rescale(value, fromLo, fromHi, toLo, toHi) {
  let t = (value - fromLo) / (fromHi - fromLo);
  if (t < 0) {
    t = 0;
  }
  if (t > 1) {
    t = 1;
  }
  return toLo + t * (toHi - toLo);
}

/**
 * Render a 2d bitmap to an offscreen canvas
 */
class Renderer {
  constructor(width, height) {
    this.buffer = document.createElement("canvas");
    this.buffer.width = width;
    this.buffer.height = height;
  }

  /**
   * Draw to the buffer, using a coloring function that
   * accepts a coloring function(rgb_out, nx, ny) where
   * rgb_out is an array where it writes r,g,b values
   * from 0.0-1.0 and nx,ny are positions 0.0 to 1.0.
   */
  draw(coloring) {
    let { width, height } = this.buffer;
    let rgb_out = [0, 0, 0];
    let ctx = this.buffer.getContext("2d", { willReadFrequently: true });
    let imageData = ctx.getImageData(0, 0, width, height);
    let pixels = imageData.data;
    for (let y = 0, p = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        coloring(rgb_out, x / width, y / height);
        pixels[p++] = 255 * rgb_out[0];
        pixels[p++] = 255 * rgb_out[1];
        pixels[p++] = 255 * rgb_out[2];
        pixels[p++] = 255;
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

function basenoise(nx, ny, nz = 0) {
  return noisegen.noise3D(nx, ny, nz);
}

function fbm_noise(noise, octaves, persistence) {
  return (nx, ny) => {
    let sum = 0,
      sumOfAmplitudes = 0,
      amplitude = 1;
    for (let octave = 0; octave < octaves; octave++, amplitude *= persistence) {
      let frequency = 1 << octave;
      sum += amplitude * basenoise(nx * frequency, ny * frequency, octave);
      sumOfAmplitudes += amplitude;
    }
    return sum / sumOfAmplitudes;
  };
}

document.getElementById("diagram-noise-params");

function Diagram(selector, coloring, xvalue, yvalue) {
  let canvas = document.querySelector(selector);
  let renderer = new Renderer(250, 250);

  function drawCrosshairs(ctx, xlabel, x, ylabel, y) {
    ctx.save();
    ctx.lineStyle = "black";
    ctx.beginPath();
    ctx.moveTo(25, y);
    ctx.lineTo(575, y);
    ctx.moveTo(x, 25);
    ctx.lineTo(x, 575);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(xlabel, x, 580);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(ylabel, -y, 20);
    ctx.restore();
  }

  let redrawId = null;

  function redraw() {
    if (redrawId === null) {
      redrawId = setTimeout(redrawEvent, 0);
    }
  }

  function redrawEvent() {
    redrawId = null;
    renderer.draw(coloring);

    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 600, 600);
    drawCrosshairs(
      ctx,
      `${xvalue.field} = ${String(xvalue.object[xvalue.field]).slice(0, 5)}`,
      rescale(xvalue.object[xvalue.field], xvalue.min, xvalue.max, 50, 550),
      `${yvalue.field} = ${String(yvalue.object[yvalue.field]).slice(0, 5)}`,
      rescale(yvalue.object[yvalue.field], yvalue.min, yvalue.max, 50, 550)
    );

    ctx.drawImage(renderer.buffer, 50, 50, 500, 500);
  }

  function setMousePosition(mx, my) {
    xvalue.object[xvalue.field] = rescale(mx, 50, 550, xvalue.min, xvalue.max);
    yvalue.object[yvalue.field] = rescale(my, 50, 550, yvalue.min, yvalue.max);
    redraw();
  }

  // for mouse
  canvas.addEventListener("mousemove", (e) => {
    let box = canvas.getBoundingClientRect();
    setMousePosition(
      ((e.clientX - box.left) / box.width) * canvas.width,
      ((e.clientY - box.top) / box.height) * canvas.height
    );
  });

  // for touch
  makeDraggable(canvas, canvas, (_, current) => {
    setMousePosition(
      (current.x / canvas.offsetWidth) * canvas.width,
      (current.y / canvas.offsetHeight) * canvas.height
    );
  });

  redrawEvent();

  return { canvas, redraw, renderer };
}

let noiseParams = {
  warp: 0,
  wavelength: 0.5,
  persistence: 1 / 2,
};

function noiseColoring(rgb_out, nx, ny) {
  let { wavelength, persistence } = noiseParams;
  // let dx = noiseParams.warp * basenoise((nx+ny)/0.1, ny/0.01, 2);
  // let dy = noiseParams.warp * basenoise((ny+ny)/0.1, ny/0.01, 3);
  // nx += dx; ny += dy;
  let n =
    0.5 *
    (1 +
      fbm_noise(
        basenoise,
        5,
        persistence
      )((nx - 0.5) / wavelength, (ny - 0.5) / wavelength));
  rgb_out[0] = 0.1 + 0.95 * n;
  rgb_out[1] = n;
  rgb_out[2] = 0.9 * n;
}

let noiseDiagram = Diagram(
  "#diagram-noise",
  noiseColoring,
  { object: noiseParams, field: "wavelength", min: 0.1, max: 1.0 },
  // {object: noiseParams, field: 'warp', min: 0.0, max: 1.0},
  { object: noiseParams, field: "persistence", min: 0.0, max: 1.0 }
);

let bandParams = {
  value: 0.6,
  width: 0.01,
};

function bandColoring(rgb_out, nx, ny) {
  let noise = fbm_noise(basenoise, 5, 1 / 2);
  let { value, width } = bandParams;
  let n = 0.5 * (1 + noise(nx / 0.5, ny / 0.5));
  let d = Math.abs(n - value);
  if (d < width) {
    rgb_out[0] = 0.8;
    rgb_out[1] = 0.9;
    rgb_out[2] = 1.0;
  } else {
    rgb_out[0] = 0.1 + 0.95 * n;
    rgb_out[1] = n;
    rgb_out[2] = 0.9 * n;
  }
}

let bandDiagram = Diagram(
  "#diagram-band",
  bandColoring,
  { object: bandParams, field: "value", min: 0.0, max: 1.0 },
  { object: bandParams, field: "width", min: 0.1, max: 0.0 }
);

let ironParams = {
  size: 0.2,
  persistence: 0.7,
};

function ironColoring(rgb_out, nx, ny) {
  let n1 =
    0.5 *
    (1 + fbm_noise(basenoise, 6, ironParams.persistence)(nx / 0.5, ny / 0.5));
  let e = 0.5 * (1 + basenoise(50 + nx / 0.3, ny / 0.3));
  let d1 = Math.abs(n1 - 0.1);
  let de = Math.abs(e - 0.6);
  if (d1 < ironParams.size && de < 0.2) {
    rgb_out[0] = 1;
    rgb_out[1] = 0.5;
    rgb_out[2] = 0;
  } else if (e < 0.2) {
    rgb_out[0] = 0.0;
    rgb_out[1] = 0.2;
    rgb_out[2] = 0.5;
  } else {
    rgb_out[0] = 0.1 + 0.95 * e * e;
    rgb_out[1] = e * e;
    rgb_out[2] = 0.9 * e * e;
  }
}

let ironDiagram = Diagram(
  "#diagram-iron",
  ironColoring,
  { object: ironParams, field: "size", min: 0.0, max: 0.3 },
  { object: ironParams, field: "persistence", min: 1, max: 0.1 }
);

let goldParams = {
  shape: 0.6,
  slice: 0.8,
};

function goldColoring(rgb_out, nx, ny) {
  let n1 = 0.5 * (1 + fbm_noise(basenoise, 5, 1 / 2)(nx / 0.5, ny / 0.5));
  let n2 = 0.5 * (1 + fbm_noise(basenoise, 5, 1 / 2)(20 + nx / 0.2, ny / 0.2));
  let n3 = 0.5 * (1 + basenoise(40 + nx / 0.5, ny / 0.5));
  let e = 0.5 * (1 + basenoise(50 + nx / 0.3, ny / 0.3));
  let d1 = Math.abs(n1 - goldParams.shape);
  let d2 = Math.abs(n2 - goldParams.shape);
  let d3 = Math.abs(n3 - goldParams.slice);
  let de = Math.abs(e - 0.6);
  if ((d1 < 0.01 || d2 < 0.01) && d3 < 0.2 && de < 0.1) {
    rgb_out[0] = 1;
    rgb_out[1] = 1;
    rgb_out[2] = 0;
  } else if (e < 0.2) {
    rgb_out[0] = 0.0;
    rgb_out[1] = 0.2;
    rgb_out[2] = 0.5;
  } else {
    rgb_out[0] = 0.1 + 0.95 * e * e;
    rgb_out[1] = e * e;
    rgb_out[2] = 0.9 * e * e;
  }
}

let goldDiagram = Diagram(
  "#diagram-gold",
  goldColoring,
  { object: goldParams, field: "shape", min: 0.2, max: 0.8 },
  { object: goldParams, field: "slice", min: 0.9, max: 0.1 }
);
