/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import {transform} from '../../../coralui-utils';

// try to stay in same color space as long as possible (because of conversions being not 100% accurate ...)
/** @ignore */
const colorSpace = {
  RGB: 'rgb',
  HEX: 'hex',
  CMYK: 'cmyk',
  HSB: 'hsb',
  HSL: 'hsl'
};

/**
 Transforms part of a color (r,g,b) into a hex value.
 
 @static
 @param {Number} x
 value between 0-255
 
 @return {String} Hex representation
 @ignore
 */
function _hex(x) {
  return `0${x.toString(16)}`.slice(-2);
}

/** @ignore */
function _slice(str, startStr) {
  let sliced = [];
  
  str = transform.string(str).toLowerCase();
  startStr = transform.string(startStr).toLowerCase();
  
  if (str.indexOf(startStr) !== -1) {
    sliced = str.substring(str.indexOf(startStr) + startStr.length, str.lastIndexOf(')')).split(/,\s*/);
  }
  
  return sliced;
}

/**
 Parse an rgb value into an object.
 e.g.: 'rgb(0,0,0)' => {r:0, g:0, b:0}
 
 @static
 @param {String} rgbStr
 The string representing the rgb value
 
 @return {Object} {r, g, b} Returns null if string could not be parsed
 @ignore
 */
function _parseRGB(rgbStr) {
  const sliced = _slice(rgbStr, 'rgb(');
  
  if (sliced.length !== 3) {
    return null;
  }
  
  const r = parseInt(sliced[0], 10);
  const g = parseInt(sliced[1], 10);
  const b = parseInt(sliced[2], 10);
  
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return null;
  }
  
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
    return null;
  }
  
  return {r, g, b};
}

/**
 Serialize an rgb object into a string.
 e.g.: {r:0, g:0, b:0} => 'rgb(0,0,0)'
 
 @static
 @param {Object} rgb
 @return {String} rgbStr The string representing the rgb value
 @ignore
 */
function _serializeRGB(rgb) {
  if (rgb) {
    return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
  }
  
  return '';
}

/**
 Parse an rgba value into an object.
 e.g.: 'rgba(0,0,0,0.5)' => {r:0, g:0, b:0, a:0.5}
 
 @static
 @param {String} rgbaStr
 The string representing the rgba value.
 
 @return {Object} {r, g, b, a} Returns null if string could not be parsed
 @ignore
 */
function _parseRGBA(rgbaStr) {
  const sliced = _slice(rgbaStr, 'rgba(');
  
  if (sliced.length !== 4) {
    return null;
  }
  
  const r = parseInt(sliced[0], 10);
  const g = parseInt(sliced[1], 10);
  const b = parseInt(sliced[2], 10);
  const a = parseFloat(sliced[3]);
  
  if (isNaN(r) || isNaN(g) || isNaN(b) || isNaN(a)) {
    return null;
  }
  
  if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255 || a < 0 || a > 1) {
    return null;
  }
  
  return {r, g, b, a};
}

/**
 Serialize an rgba object into a string.
 e.g.: {r:0, g:0, b:0, a:0.5} => 'rgb(0,0,0,0.5)'
 
 @static
 @param {Object} rgba
 @return {String} rgbaStr The string representing the rgba value
 @ignore
 */
function _serializeRGBA(rgba) {
  if (rgba) {
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
  }
  return '';
}

/**
 Parse an cmyk value into an object.
 e.g.: 'cmyk(0, 100, 50, 0)' => {c:0, m:100, y:50, k:0}
 
 @static
 @param {String} cmykStr
 The string representing the cmyk value.
 
 @return {Object} {c, m, y, k} Returns null if string could not be parsed
 @ignore
 */
function _parseCMYK(cmykStr) {
  const sliced = _slice(cmykStr, 'cmyk(');
  
  if (sliced.length !== 4) {
    return null;
  }
  
  const c = parseFloat(sliced[0]);
  const m = parseFloat(sliced[1]);
  const y = parseFloat(sliced[2]);
  const k = parseFloat(sliced[3]);
  
  if (isNaN(c) || isNaN(m) || isNaN(y) || isNaN(k)) {
    return null;
  }
  
  if (c < 0 || c > 100 || m < 0 || m > 100 || y < 0 || y > 100 || k < 0 || k > 100) {
    return null;
  }
  
  return {c, m, y, k};
}

/**
 Serialize an cmyk object into a string.
 e.g.: {c:0, m:100, y:50, k:0} => 'cmyk(0, 100, 50, 0)'
 
 @static
 @param {Object} cmyk
 @return {String} cmykStr The string representing the cmyk value
 @ignore
 */
function _serializeCMYK(cmyk) {
  if (cmyk) {
    // make sure there are not more than 2 digits after dot
    const c = parseFloat(cmyk.c.toFixed(2));
    const m = parseFloat(cmyk.m.toFixed(2));
    const y = parseFloat(cmyk.y.toFixed(2));
    const k = parseFloat(cmyk.k.toFixed(2));
    
    return `cmyk(${c},${m},${y},${k})`;
  }
  return '';
}

/**
 Parse an hex value into a number. Corrects a hex value, if it is represented by 3 or 6 characters with or without
 '#'.
 
 @static
 @param {String} hexStr The string representing the hex value
 @return {Number} Returns a number representing the parsed hex value
 @ignore
 */
function _parseHex(hexStr) {
  hexStr = transform.string(hexStr).replace('#', '');
  
  if (hexStr.length === 3) {
    hexStr = hexStr.charAt(0) + hexStr.charAt(0) +
      hexStr.charAt(1) + hexStr.charAt(1) +
      hexStr.charAt(2) + hexStr.charAt(2);
  }
  
  // test if this could be a hex value
  const isOk = (/^[0-9A-F]{6}$/i).test(hexStr);
  if (!isOk) {
    return null;
  }
  
  return parseInt(hexStr, 16);
}

/**
 Transforms a hex color into RGB representation.
 
 @static
 @param {Number} hex
 The color hex representation.
 
 @return {Object} {r, g, b}
 @ignore
 */
function _hexToRgb(hex) {
  // explicitly test null (0 is valid)
  if (hex !== null) {
    return {
      r: hex >> 16,
      // eslint-disable-next-line no-extra-parens
      g: (hex & 0x00FF00) >> 8,
      // eslint-disable-next-line no-extra-parens
      b: (hex & 0x0000FF)
    };
  }
  return null;
}

/**
 Serialize a hex number into a string.
 
 @static
 @param {Number} hex
 @return {String}
 @ignore
 */
function _serializeHex(hex) {
  // explicitly test null (0 is valid)
  if (hex !== null) {
    const rgb = _hexToRgb(hex);
    return `#${_hex(rgb.r) + _hex(rgb.g) + _hex(rgb.b)}`;
  }
  
  return '';
}

/**
 Transforms a RGB color into HEX representation.
 
 @static
 @param {Object} rgb
 @return {Number} hex The color hex representation
 @ignore
 */
function _rgbToHex(rgb) {
  if (rgb) {
    return _parseHex(_hex(rgb.r) + _hex(rgb.g) + _hex(rgb.b));
  }
  return null;
}

/**
 Transforms a cmyk color into RGB representation. Converting CMYK to RGB will incur slight loss because both color
 spaces are not absolute and there will be some round-off error in the conversion process.
 
 @static
 @param {Object} cmyk
 @return {Object} {r, g, b}
 @ignore
 */
function _cmykToRgb(cmyk) {
  if (!cmyk) {
    return null;
  }
  
  const result = {
    r: 0,
    g: 0,
    b: 0
  };
  
  const c = parseFloat(cmyk.c) / 100;
  const m = parseFloat(cmyk.m) / 100;
  const y = parseFloat(cmyk.y) / 100;
  const k = parseFloat(cmyk.k) / 100;
  
  result.r = 1 - Math.min(1, c * (1 - k) + k);
  result.g = 1 - Math.min(1, m * (1 - k) + k);
  result.b = 1 - Math.min(1, y * (1 - k) + k);
  
  result.r = Math.round(result.r * 255);
  result.g = Math.round(result.g * 255);
  result.b = Math.round(result.b * 255);
  
  return result;
}

/**
 Transforms a rgb color into cmyk representation. Converting CMYK to RGB will incur slight loss because both color
 spaces are not absolute and there will be some round-off error in the conversion process.
 
 @static
 @param {Object} rgb
 @return {Object} {c, m, y, k}
 @ignore
 */
function _rgbToCmyk(rgb) {
  if (!rgb) {
    return null;
  }
  
  const result = {
    c: 0,
    m: 0,
    y: 0,
    k: 0
  };
  
  if (rgb.r === 0 && rgb.g === 0 && rgb.b === 0) {
    result.k = 100;
    return result;
  }
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  result.k = Math.min(1 - r, 1 - g, 1 - b);
  result.c = (1 - r - result.k) / (1 - result.k);
  result.m = (1 - g - result.k) / (1 - result.k);
  result.y = (1 - b - result.k) / (1 - result.k);
  
  result.c = Math.round(result.c * 100);
  result.m = Math.round(result.m * 100);
  result.y = Math.round(result.y * 100);
  result.k = Math.round(result.k * 100);
  
  return result;
}

/**
 Parse an hsb value into an object.
 e.g.: 'hsb(360,100,0)' => {h:360, s:100, b:0}
 
 @static
 @param {String} hsbStr
 The string representing the hsb value.
 
 @return {Object} {h, s, b} Returns null if string could not be parsed
 @ignore
 */
function _parseHSB(hsbStr) {
  const sliced = _slice(hsbStr, 'hsb(');
  
  if (sliced.length !== 3) {
    return null;
  }
  
  // make sure there are not more than 2 digits after dot
  const h = parseFloat(sliced[0]);
  const s = parseFloat(sliced[1]);
  const b = parseFloat(sliced[2]);
  
  if (isNaN(h) || isNaN(s) || isNaN(b)) {
    return null;
  }
  
  if (h < 0 || h > 360 || s < 0 || s > 100 || b < 0 || b > 100) {
    return null;
  }
  
  return {h, s, b};
}

/**
 Serialize an hsb object into a string.
 e.g.: {h:0, s:0, b:0} => 'hsb(0,0,0)'
 
 @static
 @param {Object} hsb
 @return {String} hsb The string representing the hsb value
 @ignore
 */
function _serializeHSB(hsb) {
  if (hsb) {
    // make sure there are not more than 2 digits after dot
    const h = parseFloat(hsb.h.toFixed(2));
    const s = parseFloat(hsb.s.toFixed(2));
    const b = parseFloat(hsb.b.toFixed(2));
    
    return `hsb(${h},${s},${b})`;
  }
  
  return '';
}

/**
 Transforms a HSB (same as HSV) color into RGB representation.
 h (hue has value between 0-360 degree)
 s (saturation has a value between 0-100 percent)
 b (brightness has a value between 0-100 percent)
 
 @static
 @param {Object} hsb
 @return {Object} {r, g, b}
 @ignore
 */
function _hsbToRgb(hsb) {
  if (!hsb) {
    return null;
  }
  
  const h = hsb.h / 360;
  const s = hsb.s / 100;
  const v = hsb.b / 100;
  
  let r, g, b;
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 Transforms a RGB color into HSB (same as HSV) representation.
 
 @static
 @param {Object} rgb
 @return {Object} {h, s, b}
 @ignore
 */
function _rgbToHsb(rgb) {
  if (!rgb) {
    return null;
  }
  
  const r = rgb.r;
  const g = rgb.g;
  const b = rgb.b;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h;
  const s = max === 0 ? 0 : d / max;
  const v = max / 255;
  
  switch (max) {
    case min:
      h = 0;
      break;
    case r:
      h = g - b + d * (g < b ? 6 : 0);
      h /= 6 * d;
      break;
    case g:
      h = b - r + d * 2;
      h /= 6 * d;
      break;
    case b:
      h = r - g + d * 4;
      h /= 6 * d;
      break;
  }
  
  return {
    h: h * 360,
    s: s * 100,
    b: v * 100
  };
}

/**
 Parse an hsl value into an object.
 e.g.: 'hsl(360,100,0)' => {h:360, s:100, b:0}
 
 @static
 @param {String} hslStr
 The string representing the hsl value.
 
 @return {Object} {h, s, l} Returns null if string could not be parsed
 @ignore
 */
function _parseHSL(hslStr) {
  const sliced = _slice(hslStr, 'hsl(');
  
  if (sliced.length !== 3) {
    return null;
  }
  
  // make sure there are not more than 2 digits after dot
  const h = parseFloat(sliced[0]);
  const s = parseFloat(sliced[1]);
  const l = parseFloat(sliced[2]);
  
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    return null;
  }
  
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
    return null;
  }
  
  return {h, s, l};
}

/**
 Serialize an hsl object into a string.
 e.g.: {h:0, s:0, l:0} => 'hsl(0,0%,0%)'
 
 @static
 @param {Object} hsl
 @return {String} hsb The string representing the hsb value
 @ignore
 */
function _serializeHSL(hsl) {
  if (hsl) {
    // make sure there are not more than 2 digits after dot
    const h = parseFloat(hsl.h.toFixed(2));
    const s = parseFloat(hsl.s.toFixed(2));
    const l = parseFloat(hsl.l.toFixed(2));
    
    return `hsl(${h},${s}%,${l}%)`;
  }
  
  return '';
}

/**
 Transforms a HSL color into RGB representation.
 h (hue has value between 0-360 degree)
 s (saturation has a value between 0-100 percent)
 l (lightness has a value between 0-100 percent)
 
 @static
 @param {Object} hsl
 @return {Object} {r, g, b}
 @ignore
 */
function _hslToRgb(hsl) {
  if (!hsl) {
    return null;
  }
  
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;
  
  let r;
  let g;
  let b;
  
  if (s === 0) {
    // achromatic
    r = g = b = l;
  }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) {
        t += 1;
      }
      if (t > 1) {
        t -= 1;
      }
      if (t < 1 / 6) {
        return p + (q - p) * 6 * t;
      }
      if (t < 1 / 2) {
        return q;
      }
      if (t < 2 / 3) {
        return p + (q - p) * (2 / 3 - t) * 6;
      }
      return p;
    };
    
    const qValue = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const pValue = 2 * l - qValue;
    r = hue2rgb(pValue, qValue, h + 1 / 3);
    g = hue2rgb(pValue, qValue, h);
    b = hue2rgb(pValue, qValue, h - 1 / 3);
  }
  
  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 Transforms an RGB color into HSL representation.
 
 @static
 @param {Object} rgb
 @return {Object} {h, s, l}
 @ignore
 */
function _rgbToHsl(rgb) {
  if (!rgb) {
    return null;
  }
  
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h;
  let s;
  const l = (max + min) / 2;
  
  if (max === min) {
    // achromatic
    h = s = 0;
  }
  else {
    const d = max - min;
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
  
  return {
    h: h * 360,
    s: s * 100,
    l: l * 100
  };
}

/**
 Parse an hsla value into an object.
 e.g.: 'hsla(360,100%,0%,0.5)' => {h:360, s:100, l:0, 0.5}
 
 @static
 @param {String} hslaStr
 The string representing the hsl value.
 
 @return {Object} {h, s, l, a} Returns null if string could not be parsed
 @ignore
 */
function _parseHSLA(hslaStr) {
  const sliced = _slice(hslaStr, 'hsla(');
  
  if (sliced.length !== 4) {
    return null;
  }
  
  // make sure there are not more than 2 digits after dot
  const h = parseFloat(sliced[0]);
  const s = parseFloat(sliced[1]);
  const l = parseFloat(sliced[2]);
  const a = parseFloat(sliced[3]);
  
  if (isNaN(h) || isNaN(s) || isNaN(l)) {
    return null;
  }
  
  if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100 || a < 0 || a > 1) {
    return null;
  }
  
  return {h, s, l, a};
}

/**
 Serialize an hsla object into a string.
 e.g.: {h:0, s:0, l:0, a:0.5} => 'hsl(0,0%,0%,0.5)'
 
 @static
 @param {Object} hsla
 @return {String} hsb The string representing the hsb value
 @ignore
 */
function _serializeHSLA(hsla) {
  if (hsla) {
    // make sure there are not more than 2 digits after dot
    const h = parseFloat(hsla.h.toFixed(2));
    const s = parseFloat(hsla.s.toFixed(2));
    const l = parseFloat(hsla.l.toFixed(2));
    const a = parseFloat(hsla.a.toFixed(2));
    
    return `hsla(${h},${s}%,${l}%,${a})`;
  }
  
  return '';
}

/**
 Color is used to get a color in different color spaces, calculate tints and shades etc.
 */
class Color {
  /** @ignore */
  constructor() {
    // Set defaults
    this._colorSpace = colorSpace.HEX;
    this._value = '';
    this._alpha = 1;
  }
  
  /**
   The value of the color. This value can be set in different formats (HEX, RGB, RGBA, HSB, HSL, HSLA and CMYK).
   Corrects a hex value, if it is represented by 3 or 6 characters with or without '#'.
   
   e.g:
   HEX:  #FFFFFF
   RGB:  rgb(16,16,16)
   RGBA: rgba(215,40,40,0.9)
   HSB:  hsb(360,100,100)
   HSL:  hsl(360,100%,100%)
   HSLA: hsla(360,100%,100%,0.9)
   CMYK: cmyk(0,100,50,0)
   
   @type {String}
   @default ""
   */
  get value() {
    return this._value;
  }
  set value(value) {
    // Two color formats with alpha values
    const rgba = _parseRGBA(value);
    const hsla = _parseHSLA(value);
    
    const rgb = _parseRGB(value);
    const cmyk = _parseCMYK(value);
    const hsb = _parseHSB(value);
    const hsl = _parseHSL(value);
    const hex = _parseHex(value);
    
    if (rgba !== null) {
      this._colorSpace = colorSpace.RGB;
      this.alpha = rgba.a;
      value = _serializeRGB({
        r: rgba.r,
        g: rgba.g,
        b: rgba.b
      });
    }
    else if (hsla !== null) {
      this._colorSpace = colorSpace.HSL;
      this.alpha = hsla.a;
      value = _serializeHSL({
        h: hsla.h,
        s: hsla.s,
        l: hsla.l
      });
    }
    else if (rgb !== null) {
      this._colorSpace = colorSpace.RGB;
    }
    else if (cmyk !== null) {
      this._colorSpace = colorSpace.CMYK;
    }
    else if (hsb !== null) {
      this._colorSpace = colorSpace.HSB;
    }
    else if (hsl !== null) {
      this._colorSpace = colorSpace.HSL;
    }
    else if (hex !== null) {
      this._colorSpace = colorSpace.HEX;
    }
    else {
      // restore defaults
      this._colorSpace = colorSpace.HEX;
      value = '';
    }
    
    this._value = value;
  }
  
  /**
   The alpha value of the color (value between 0-1).
   
   @type {Number}
   @default 1
   */
  get alpha() {
    return this._alpha;
  }
  set alpha(value) {
    if (isNaN(value) || value < 0 || value > 1) {
      return;
    }
    this._alpha = transform.number(value);
  }
  
  /**
   The rgb values of the color (value between 0-255).
   e.g.: {r:0, g:0, b:0}
   
   @type {Object}
   @default null
   */
  get rgb() {
    let rgb = null;
    if (this._colorSpace === colorSpace.RGB) {
      rgb = _parseRGB(this.value);
    }
    else if (this._colorSpace === colorSpace.HEX) {
      const hex = _parseHex(this.value);
      rgb = _hexToRgb(hex);
    }
    else if (this._colorSpace === colorSpace.CMYK) {
      const cmyk = _parseCMYK(this.value);
      rgb = _cmykToRgb(cmyk);
    }
    else if (this._colorSpace === colorSpace.HSB) {
      const hsb = _parseHSB(this.value);
      rgb = _hsbToRgb(hsb);
    }
    else if (this._colorSpace === colorSpace.HSL) {
      const hsl = _parseHSL(this.value);
      rgb = _hslToRgb(hsl);
    }
    return rgb;
  }
  set rgb(value) {
    this.value = _serializeRGB(value);
  }
  
  /**
   The serialized rgb values of the color (r,g,b values between 0-255).
   e.g: 'rgb(0,0,0)'
   
   @type {String}
   @default ""
   */
  get rgbValue() {
    return _serializeRGB(this.rgb);
  }
  set rgbValue(value) {
    this.value = value;
  }
  
  /**
   The rgba values of the color (r,g,b values between 0-255 and a between 0-1).
   e.g: {r:0, g:0, b:0, a:1}
   
   @type {Object}
   @default null
   */
  get rgba() {
    const rgb = this.rgb;
    if (rgb) {
      return {
        r: rgb.r,
        g: rgb.g,
        b: rgb.b,
        a: this.alpha
      };
    }
    
    return null;
  }
  set rgba(value) {
    this.value = _serializeRGBA(value);
  }
  
  /**
   The serialized rgba values of the color (r,g,b values between 0-255 and alpha between 0-1).
   e.g: 'rgba(0,0,0,1)'
   
   @type {String}
   @default ""
   */
  get rgbaValue() {
    return _serializeRGBA(this.rgba);
  }
  set rgbaValue(value) {
    this.value = value;
  }
  
  /**
   The hex value of the color.
   
   @type {Number}
   @default null
   */
  get hex() {
    // as hex color space is essentially just the same as rgb and there is no loss in conversion, we can do it this way
    return _rgbToHex(this.rgb);
  }
  set hex(value) {
    this.value = _serializeHex(value);
  }
  
  /**
   The serialized hex value of the color.
   e.g: '#94CD4B'
   
   @type {String}
   @default ""
   */
  get hexValue() {
    return _serializeHex(this.hex);
  }
  set hexValue(value) {
    this.value = value;
  }
  
  /**
   The cmyk values of the color (all values between 0-100).
   e.g: {c:0, m:100, y:0, k:100}
   
   @type {Object}
   @default null
   */
  get cmyk() {
    let cmyk = null;
    let rgb = null;
    if (this._colorSpace === colorSpace.RGB) {
      rgb = _parseRGB(this.value);
      cmyk = _rgbToCmyk(rgb);
    }
    else if (this._colorSpace === colorSpace.HEX) {
      const hex = _parseHex(this.value);
      rgb = _hexToRgb(hex);
      cmyk = _rgbToCmyk(rgb);
    }
    else if (this._colorSpace === colorSpace.CMYK) {
      cmyk = _parseCMYK(this.value);
    }
    else if (this._colorSpace === colorSpace.HSB) {
      const hsb = _parseHSB(this.value);
      rgb = _hsbToRgb(hsb);
      cmyk = _rgbToCmyk(rgb);
    }
    else if (this._colorSpace === colorSpace.HSL) {
      const hsl = _parseHSL(this.value);
      rgb = _hslToRgb(hsl);
      cmyk = _rgbToCmyk(rgb);
    }
    return cmyk;
  }
  set cmyk(value) {
    this.value = _serializeCMYK(value);
  }
  
  /**
   The serialized cmyk values of the color (all values between 0-100).
   e.g: 'cmyk(100,100,100,100)'
   
   @type {String}
   @default ""
   */
  get cmykValue() {
    return _serializeCMYK(this.cmyk);
  }
  set cmykValue(value) {
    this.value = value;
  }
  
  /**
   The hsb values of the color.
   h (hue has value between 0-360 degree)
   s (saturation has a value between 0-100 percent)
   b (brightness has a value between 0-100 percent)
   
   @type {Object}
   @default null
   */
  get hsb() {
    let hsb = null;
    let rgb = null;
    if (this._colorSpace === colorSpace.RGB) {
      rgb = _parseRGB(this.value);
      hsb = _rgbToHsb(rgb);
    }
    else if (this._colorSpace === colorSpace.HEX) {
      const hex = _parseHex(this.value);
      rgb = _hexToRgb(hex);
      hsb = _rgbToHsb(rgb);
    }
    else if (this._colorSpace === colorSpace.CMYK) {
      const cmyk = _parseCMYK(this.value);
      rgb = _cmykToRgb(cmyk);
      hsb = _rgbToHsb(rgb);
    }
    else if (this._colorSpace === colorSpace.HSB) {
      hsb = _parseHSB(this.value);
    }
    else if (this._colorSpace === colorSpace.HSL) {
      const hsl = _parseHSL(this.value);
      rgb = _hslToRgb(hsl);
      hsb = _rgbToHsb(rgb);
    }
    return hsb;
  }
  set hsb(value) {
    this.value = _serializeHSB(value);
  }
  
  /**
   The serialized hsb values of the color (s and b values between 0-100, h between 0-360).
   e.g: 'hsb(360,100,100)'
   
   @type {String}
   @default ""
   */
  get hsbValue() {
    return _serializeHSB(this.hsb);
  }
  set hsbValue(value) {
    this.value = value;
  }
  
  /*
   The hsl values of the color.
   h (hue has value between 0-360 degree)
   s (saturation has a value between 0-100 percent)
   l (lightness has a value between 0-100 percent)
   
   @type {Object}
   @default null
   */
  get hsl() {
    let hsl = null;
    let rgb = null;
    if (this._colorSpace === colorSpace.RGB) {
      rgb = _parseRGB(this.value);
      hsl = _rgbToHsl(rgb);
    }
    else if (this._colorSpace === colorSpace.HEX) {
      const hex = _parseHex(this.value);
      rgb = _hexToRgb(hex);
      hsl = _rgbToHsl(rgb);
    }
    else if (this._colorSpace === colorSpace.CMYK) {
      const cmyk = _parseCMYK(this.value);
      rgb = _cmykToRgb(cmyk);
      hsl = _rgbToHsl(rgb);
    }
    else if (this._colorSpace === colorSpace.HSB) {
      const hsb = _parseHSB(this.value);
      rgb = _hsbToRgb(hsb);
      hsl = _rgbToHsl(rgb);
    }
    else if (this._colorSpace === colorSpace.HSL) {
      hsl = _parseHSL(this.value);
    }
    return hsl;
  }
  set hsl(value) {
    this.value = _serializeHSL(value);
  }
  
  /**
   The serialized hsl values of the color (s and l values between 0-100 in percent, h between 0-360).
   e.g: 'hsl(360,100%,100%)'
   
   @type {String}
   @default ""
   */
  get hslValue() {
    return _serializeHSL(this.hsl);
  }
  set hslValue(value) {
    this.value = value;
  }
  
  /**
   The hsla values of the color.
   h (hue has value between 0-360 degree)
   s (saturation has a value between 0-100 percent)
   l (lightness has a value between 0-100 percent)
   a (alpha has a value between 0-1)
   
   @type {Object}
   @default null
   */
  get hsla() {
    const hsl = this.hsl;
    if (hsl) {
      return {
        h: hsl.h,
        s: hsl.s,
        l: hsl.l,
        a: this.alpha
      };
    }
    
    return null;
  }
  set hsla(value) {
    this.value = _serializeHSLA(value);
  }
  
  /**
   The serialized hsla values of the color.
   h (hue has value between 0-360 degree)
   s (saturation has a value between 0-100 percent)
   l (lightness has a value between 0-100 percent)
   a (alpha has a value between 0-1)
   e.g: 'hsla(360,50%,50%,0.9)'
   
   @type {String}
   @default ""
   */
  get hslaValue() {
    return _serializeHSLA(this.hsla);
  }
  set hslaValue(value) {
    this.value = value;
  }
  
  /**
   Clone this color.
   
   @type {Color}
   */
  clone() {
    const clone = new this.constructor();
    clone.value = this.value;
    clone.alpha = this.alpha;
    return clone;
  }
  
  /**
   Test if this Color is similar to another color.
   
   @type {Boolean}
   @param {Color} compareColor
   The color to compare this color too.
   
   @param {Boolean} [allowSlightColorDifference=true]
   While converting between color spaces slight loses might happen => we should normally consider colors equal,
   even if they are minimally different.
 
   */
  isSimilarTo(compareColor, allowSlightColorDifference) {
    if (this.rgb === null && (!compareColor || compareColor.rgb === null)) {
      // Consider an rgb of null equal to a null object (or another value of null)
      return true;
    }
    
    if (!compareColor || compareColor.rgb === null || this.rgb === null) {
      return false;
    }
    
    let allowedRgbDifference = 1;
    let allowedAlphaDifference = 0.01;
    
    if (allowSlightColorDifference === false) {
      allowedRgbDifference = 0;
      allowedAlphaDifference = 0;
    }
    
    const rgb = this.rgb;
    const rgb2 = compareColor.rgb;
    
    const rDiff = Math.abs(rgb2.r - rgb.r);
    const gDiff = Math.abs(rgb2.g - rgb.g);
    const bDiff = Math.abs(rgb2.b - rgb.b);
    const aDiff = Math.abs(this.alpha - compareColor.alpha);
    
    if (rDiff <= allowedRgbDifference && gDiff <= allowedRgbDifference && bDiff <= allowedRgbDifference && aDiff <= allowedAlphaDifference) {
      return true;
    }
    
    return false;
  }
  
  /**
   Calculates an array of lighter colors.
   
   @type {Array<Coral.Color>}
   @param {Number} amount
   Amount of tint colors to generate.
 
   */
  calculateTintColors(amount) {
    const tintColors = [];
    let tintColor = null;
    
    const rgb = this.rgb;
    if (rgb) {
      const r = rgb.r;
      const g = rgb.g;
      const b = rgb.b;
      
      let tintFactor = 1;
      
      for (let i = 1; i <= amount; i++) {
        tintFactor = i / (amount + 1);
        tintColor = this.clone();
        // alpha value kept from original
        tintColor.rgb = {
          r: r + (255 - r) * tintFactor,
          g: g + (255 - g) * tintFactor,
          b: b + (255 - b) * tintFactor
        };
        
        tintColors.push(tintColor);
      }
    }
    
    return tintColors;
  }
  
  /**
   Calculates an array of darker colors.
   
   @type {Array<Coral.Color>}
   @param {Number} amount
   Amount of shade colors to generate.
 
   */
  calculateShadeColors(amount) {
    const shadeColors = [];
    let shadeColor = null;
    
    const rgb = this.rgb;
    if (rgb) {
      const r = rgb.r;
      const g = rgb.g;
      const b = rgb.b;
      
      let shadeFactor = 1;
      
      for (let i = 1; i <= amount; i++) {
        shadeFactor = i / (amount + 1);
        shadeColor = this.clone();
        // alpha value kept from original
        shadeColor.rgb = {
          r: r * (1 - shadeFactor),
          g: g * (1 - shadeFactor),
          b: b * (1 - shadeFactor)
        };
        
        shadeColors.push(shadeColor);
      }
    }
    
    return shadeColors;
  }
}

export default Color;
