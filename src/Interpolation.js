

Interpolators = {
  stepStart: getInterpolator(v => 0),
  stepEnd: getInterpolator(v => 1),
  step: getInterpolator(v => v < 0.5 ? 0 : 1),
  linear: getInterpolator(v => v),
  square: getInterpolator(v => v*v),
  root: getInterpolator(v => Math.sqrt(v)),
  getPower: (exponent) => getInterpolator(v => Math.pow(v, exponent)),
  cubic: getInterpolator(v => 3 * v * v - 2 * v * v * v),
  cubic2: getInterpolator(v => { v = 3 * v * v - 2 * v * v * v; return 3 * v * v - 2 * v * v * v; }),
  cubic3: getInterpolator(v => { v = 3 * v * v - 2 * v * v * v; v = 3 * v * v - 2 * v * v * v; return 3 * v * v - 2 * v * v * v; }),
  cos: getInterpolator(v => 0.5 - 0.5 * Math.cos(Math.PI * v)),
  bounce: getInterpolator(getBounceFunction(-10)),
  getBounce: (factor) => getInterpolator(getBounceFunction(-10 * factor)),
  parabounce: getInterpolator(getParabounceFunction([1, 0.4, 0.13, 0.05]))
};

function getInterpolator(func) {
  return function interpolate(p, vFrom = 0, vTo = 1) {
    return vFrom + (vTo - vFrom) * func(p)
  }
}

function getBounceFunction(force = -10) {
  const a = 6 - 2 * force,
      b = 5 * force - 15,
      c = 10 - 4 * force,
      d = force;
  return (v) => a * v ** 5 + b * v ** 4 + c * v ** 3 + d * v * v;
}

function getParabounceFunction(heights) {
  const bounces = heights.length;
  let widths = heights.map(h => Math.sqrt(h));
  let startPoints = [-widths[0] / 2];
  for (let i = 0; i < widths.length; i++) {
    startPoints.push(startPoints[i] + widths[i]);
  }
  const scaleFactor = 1 / startPoints[startPoints.length - 1];
  startPoints = startPoints.map(v => v * scaleFactor);
  widths = widths.map(v => v * scaleFactor);
  return (x) => {
    if (x < 0) { return 1 - heights[0]; } else if (x > 1) { return 1; }
    x = clamp(x);
    const i = startPoints.findIndex(p => p >= x) - 1;
    const xrel = (x - (startPoints[i] + widths[i] / 2)) / (widths[0] / 2);
    return xrel * xrel + (1 - heights[i]);
  }
}