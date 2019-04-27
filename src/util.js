
var inherit = function (child, parent) {
  child.prototype = Object.create(parent.prototype);
};

function clamp(v, vmin = -Infinity, vmax = Infinity) {
  return v < vmin ? vmin : v > vmax ? vmax : v;
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

function wobble(t, speedFactor = 1, offset = 0, power = 1) {
  t *= speedFactor * 0.001;
  let v = (Math.sin(t) + Math.sin(t * 0.7934) + Math.sin(t * 0.31532) + Math.sin(t*0.23543)) * 0.25;
  if (power != 1) {
    v = sgnPow(v, power);
  }
  return v;
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
