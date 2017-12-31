panton = {
  disabled: [10, 7, 11],
  selected: [255, 255, 255],
  connected: [190, 0, 0],
  black: [0, 0, 0]
}

function interpol(x, x0, y0, x1, y1) {
  return y0 * (1 - x) + y1 * (x - 0);
}
panton.mixColors = function(cola, colb, lerp = 0.5) {
  var retCol = [];
  if (lerp <= 0) return cola;
  if (lerp >= 1) return colb;
  for (let c = 0; c < 3; c++) {
    // retCol[c]=interpol(lerp,0,cola[c],1,colb[c]);
    retCol[c] = Math.round(cola[c] + (colb[c] - cola[c]) * lerp);
  }
  return retCol;
}
panton.homogenize = function(color, targetValue) {
  // var ret = [];
  // var values = [0.26, 0.39, 0.45];
  // var currentValue = ((color[0] * values[0]) + (color[1] * values[1]) + (color[2] * values[2]));
  // var factor = targetValue / currentValue;
  // for (var a in color) {
  //   ret[a] = color[a] * factor;
  // }
  let hsl = rgbToHsl(color[0],color[1],color[2]);
  // console.log(hsl);
  hsl[2]=targetValue/255;
  let ret = hslToRgb(hsl[0],hsl[1],hsl[2]);

  return ret;
}


function hslToRgb(h, s, l) {
  var r, g, b;

  if (s == 0) {
    r = g = b = l; // achromatic
  } else {
    var hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }

    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h, s, l];
}

module.exports = panton;