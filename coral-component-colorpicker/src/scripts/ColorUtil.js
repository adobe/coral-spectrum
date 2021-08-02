/**
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { TinyColor } from '@ctrl/tinycolor';
import ColorFormats from './ColorFormats';

class ColorUtil {

  constructor() {}
  /**
   Utility function to convert a color to Hsl string.

   @param {String} hue
   The hue value  which is preserved in color conversion.
   @param {String} colorString
   The color string
   */
  toHslString(hue, colorString) {
    const color =  new TinyColor(colorString);
    const hueExp = /(^hs[v|l]a?\()\d{1,3}/; 
    return color.toHslString().replace(hueExp, `$1${hue}`);
  }

  /**
   Utility function to convert a color to Hsv string.

   @param {String} hue
   The hue value  which is preserved in color conversion.
   @param {String} colorString
   The color string
   */
  toHsvString(hue, colorString) {
    const color =  new TinyColor(colorString);
    const hueExp = /(^hs[v|l]a?\()\d{1,3}/; 
    return color.toHsvString().replace(hueExp, `$1${hue}`);
  }

  /**
   Utility function to extract  h,s and v from a color string.
   @param {String} colorString
   The color string
   */
  extractHsv(colorString) {
    const exp = /^hsva?\((\d{1,3}),\s*(\d{1,3}%),\s*(\d{1,3}%)/;
    if(!colorString.startsWith("hsv")) {
      colorString = new TinyColor(colorString).toHsvString();
    } 
    let groups = exp.exec(colorString);
    const h = groups[1];
    const s = parseInt(groups[2])/100;
    const v = parseInt(groups[3])/100;
    return {h:h, s:s, v:v};
  }
    
  /**
  Utility function to extract hue.
  @param {String} colorString
  */
  getHue(colorString) {
    if(colorString.startsWith('hs')) {
      const hueExp = /^hs[v|l]a?\((\d{1,3})/;
      const values = hueExp.exec(colorString);
      const [, h] = values;
      return Number(h);
    }  
    else {
      return new TinyColor(colorString).toHsv().h;
    }  
  }

  /**
  Utility function to validate given formats in supported formats and return a list of formats.
  Any invalid/unsupported format is ignored.
  @param {Array} formats
  */  
  getValidFormats(formats) {
    const supportedFormats = Object.values(ColorFormats);
    let validFormats = [];
    formats.forEach(function(value){
      if(supportedFormats.indexOf(value) !== -1) {
        validFormats.push(value);
      }
    });
    return validFormats;
  }

  /**
  Utility function to convert a color into a desired format.
  @param {String} color
  @param {String} format
  */  
  formatColorString(color, format) {
    const hue = this.getHue(color);
    if(format === ColorFormats.HSV) {
      return this.toHsvString(hue, color);
    }
    else if(format === ColorFormats.HSL) {
      return this.toHslString(hue, color);
    } 
    else {
      return new TinyColor(color).toString(format);
    }
  }
    
}

const colorUtil = new ColorUtil();
export default colorUtil;
 