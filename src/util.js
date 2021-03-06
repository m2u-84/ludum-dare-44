
var inherit = function (child, parent) {
  child.prototype = Object.create(parent.prototype);
};

function clamp(v, vmin = -Infinity, vmax = Infinity) {
  return v < vmin ? vmin : v > vmax ? vmax : v;
}

function clump(v, vmin, vmax, vborder = (vmin + vmax)/2) {
  if (v > vmin && v < vmax) {
    return (v < vborder) ? vmin : vmax;
  }
  return v;
}

function noclamp(v) {
  return v;
}

function getRandomItem(array) {
  if (!array || array.length < 1) { return null; }
  var index = Math.floor(Math.random() * array.length);
  return array[index];
}

function removeItem(array, item) {
  var index = array.indexOf(item);
  if (index >= 0) {
      array.splice(index, 1);
  }
  return index;
}

function shuffle(array) {
  for (let i = 1; i < array.length; i++) {
    const other = Math.floor(i * Math.random());
    if (other !== i) {
      const temp = array[other];
      array[other] = array[i];
      array[i] = temp;
    }
  }
}

function moveToTop(list, item) {
  const index = list.findIndex(el => el == item);
  if (index > 0) {
    list.splice(index, 1);
    list.unshift(item);
  }
  return list;
}

function getAngleDiff(a1, a2) {
  var dif = (a2 - a1) % (2 * Math.PI);
  if (dif < -Math.PI) {
      dif += 2*Math.PI;
  } else if (dif > Math.PI) {
      dif -= 2*Math.PI;
  }
  return dif;
}

function mapRange(number, min1, max1, min2, max2) {
  return (number - min1) * (max2 - min2) / (max1 - min1) + min2;
}

function getRelativeMouseCoordinates(event, relativeTo = event.target) {
  const rect = relativeTo.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return [x, y];
}

function rnd(vMinOrMax, vMax) {
  if (vMinOrMax == null) {
    return Math.random();
  } else if (vMax == null) {
    return Math.random() * vMinOrMax;
  } else {
    return vMinOrMax + Math.random() * (vMax - vMinOrMax);
  }
}

function rndInt(vMinOrMax, vMax) {
  if (vMax == null) {
    return Math.floor(Math.random() * vMinOrMax);
  } else {
    return vMinOrMax + Math.floor(Math.random() * (vMax - vMinOrMax));
  }
}

function rndSgn() {
  return rnd() < 0.5 ? 1 : -1;
}

function wobble(t, speedFactor = 1, offset = 0, power = 1) {
  t = t * speedFactor * 0.001 + offset;
  let v = (Math.sin(t) + Math.sin(t * 0.7934) + Math.sin(t * 0.31532) + Math.sin(t*0.23543)) * 0.25;
  if (power != 1) {
    v = sgnPow(v, power);
  }
  return v;
}

function sgn(value) {
  return value > 0 ? 1 : value < 0 ? -1 : 0;
}

function sgnPow(value, exponent) {
  if (value < 0) {
    return -Math.pow(-value, exponent);
  } else {
    return Math.pow(value, exponent);
  }
}

function absMod(v, modulus) {
  v = v % modulus;
  return (v < 0) ? v + modulus : v;
}

function vectorLength(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function interpolate(a, b, t) {
    return a + t * (b - a);
}

function getHealthColor(p) {
  p = clamp(p, 0, 1);
  const r = 255 * clamp(2 - 2 * p, 0, 1);
  const g = 180 * clamp(2 * p, 0, 1);
  return `rgb(${r},${g},0)`;
}

Array.prototype.remove = function() {
  let what, a = arguments, L = a.length, ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

function getCycleFrame(absoluteNumber, min, max, alternate, firstRepeat = 1, lastRepeat = 1) {
  const individualCount = max - min + 1;
  const cycleCount = 2 * individualCount - 1 + (firstRepeat - 1) + (lastRepeat - 1);
  let frame = absoluteNumber % cycleCount;
  if (frame < firstRepeat) {
    return min;
  } else if (frame < individualCount + firstRepeat - 2) {
    return min + frame - firstRepeat + 1;
  } else if (frame < individualCount + firstRepeat - 2 + lastRepeat) {
    return max;
  } else {
    const dif = frame - individualCount + firstRepeat - 2 + lastRepeat;
    return max - dif;
  }
}

function getArrayFrame(absoluteNumber, frames) {
  absoluteNumber = Math.floor(absoluteNumber)
  const id = absMod(absoluteNumber, frames.length);
  return frames[id];
}