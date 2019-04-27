

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
  getBounce: (factor) => getInterpolator(getBounceFunction(-10 * factor))
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
