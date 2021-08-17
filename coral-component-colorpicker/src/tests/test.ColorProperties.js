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
 
import {helpers} from '../../../coral-utils/src/tests/helpers';
import {ColorPicker} from '../../../coral-component-colorpicker';
import { TinyColor } from '@ctrl/tinycolor';
import colorUtil from "../scripts/ColorUtil";

describe('ColorPicker.ColorProperties', function () {
  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['ColorProperties.html']
    );
  });

  describe('API', function () {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorProperties());
    });

    afterEach(function () {
      el = null;
    });
   
    describe('#disabled', function () {
      it('should be possible to disable the colorproperties', function() {
        // set disabled
        el.disabled = true;  
        validateDisabled(el);
      });
    });
        
    describe('#color', function () {
      it('should be possible to set color on the colorproperties', function() { 
        el.color = "#5151a4";
        validateColor(el, "#5151a4");
      });
    });
    
    describe('#formats', function () {
      it('should be possible to set color formats on the colorproperties', function() { 
        el.formats = "rgb,hsv";
        validateFormats(el, "rgb,hsv");
      });
    });    
  });
  
  describe('Markup', function () {
    describe('#disabled', function () {
      it('should be possible to disable the colorproperties from markup', function() {
        const el = helpers.build('<coral-colorpicker-colorproperties disabled></coral-colorpicker-colorproperties>');
        validateDisabled(el);
      });
    });
    
    describe('#color', function () {
      it('should be possible to set color on the colorproperties from markup', function() {
        const el = helpers.build('<coral-colorpicker-colorproperties color="#5151a4"></coral-colorpicker-colorproperties>');
        validateColor(el, "#5151a4");
      });
    });
    
    describe('#formats', function () {
      it('should be possible to set color formats on the colorproperties', function() { 
        const el = helpers.build('<coral-colorpicker-colorproperties formats="rgb,hsv"></coral-colorpicker-colorproperties>');
        validateFormats(el, "rgb,hsv");
      });
    });                 
  }); 

  describe("#Color Formats", function() {
    var el;
    
    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorProperties());
    });

    afterEach(function () {
      el = null;
    });
      
    it('should be able to set color in hex format', function() {
      el.color = "#3d3db8";
      validateColor(el, "#3d3db8");
    });

    it('should be able to set color in hex4 format', function() {
      el.color = "#3d3db8ff";
      validateColor(el, "#3d3db8ff");
    });    

    it('should be able to set color in rgb format', function() {
      el.color = "rgb(61, 61, 184)";
      validateColor(el, "rgb(61, 61, 184)");
    }); 

    it('should be able to set color in prgb format', function() {
      el.color = "rgb(24%, 24%, 72%)";
      validateColor(el, "rgb(24%, 24%, 72%)");
    });

    it('should be able to set color in hsv format', function() {
      el.color = "hsv(240, 67%, 72%)";
      validateColor(el, "hsv(240, 67%, 72%)");
    }); 
    
    it('should be able to set color in hsl format', function() {
      el.color = "hsl(240, 50%, 48%)";
      validateColor(el, "hsl(240, 50%, 48%)");
    });         

    it('should be able to set color in name format', function() {
      el.color = "navy";
      validateColor(el, 'navy');
    });  
  }); 

  describe("# Invalid Values", function() {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorProperties());
    });

    afterEach(function () {
      el = null;
    });
      
    it("invalid color", function() {
       el.color = "abcd(efg)";
       validateColor(el, "hsl(240, 100%, 50%)");
    });
    
    it("invalid formats", function() {
      el.formats = "abcd,rgb";
      validateFormats(el, "rgb");
    });
  }); 
      
  describe("#User Interaction", function() {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorProperties());
    });

    afterEach(function () {
      el = null;
    });

    function createMouseEvent(type, x, y) {
      return new MouseEvent(type, {
        bubbles: true,
        clientY: y,
        clientX: x
      });
    }
            
    it("should be able to change sl property", function() {
      var colorAreaEl = el._elements.propertySL;
      const boundingClientRect = colorAreaEl.getBoundingClientRect();
      const height = boundingClientRect.height;
      const width = boundingClientRect.width;
      const right = boundingClientRect.left + width;
      const top = boundingClientRect.top;
      
      colorAreaEl.dispatchEvent(createMouseEvent('mousedown', right, top));
      // drag down to half
      colorAreaEl.dispatchEvent(createMouseEvent('mousemove', right, (top + height/2.0)));
      colorAreaEl.dispatchEvent(createMouseEvent('mouseup', right, (top + height/2.0)));
      validateColor(el, "hsv(240, 100%, 50%)");
    });
    
    it("should be able to change hue property", function() {
      var hueEl = el._elements.propertyHue;
      const boundingClientRect = hueEl.getBoundingClientRect();
      const height = boundingClientRect.height;
      const width = boundingClientRect.width;
      const right = boundingClientRect.left + width;
      const top = boundingClientRect.top;
      
      hueEl.dispatchEvent(createMouseEvent('mousedown', right, top));
      // drag down to half
      hueEl.dispatchEvent(createMouseEvent('mousemove', right, (top + height/2.0)));
      hueEl.dispatchEvent(createMouseEvent('mouseup', right, (top + height/2.0)));
      validateColor(el, "hsv(180, 100%, 100%)");    
    });
    
    it("should be able to change format", function() {
      el.color = "hsv(240, 100%, 100%)";
      el._elements.formatSelector.value = "hex";
      el._elements.formatSelector.trigger('change');
      validateColor(el, "#0000ff");
    });
    
    it("should be able to change color from color input", function() {
      el.color = "hsv(240, 100%, 100%)";
      el._elements.colorInput.value = "#3b3b81";
      el._elements.colorInput.trigger('change');
      validateColor(el, "#3b3b81");
      
    });
  }); 
  
  function validateDisabled(el) {
    expect(el.disabled).to.equal(true, 'should now be disabled.');
    expect(el.hasAttribute('disabled')).to.equal(true, 'disabled  attribute should be set.');
    expect(el.getAttribute('aria-disabled')).to.equal("true", 'aria-disabled attribute should be set.');
    expect(el.classList.contains('is-disabled')).to.equal(true, "class is-disabled should be added.");
    
    expect(el._elements.propertySL.disabled).to.equal(true, 'color property SL should now be disabled.');
    expect(el._elements.propertyHue.disabled).to.equal(true, 'color property Hue should now be disabled.');
    expect(el._elements.formatSelector.disabled).to.equal(true, 'color format selector should now be disabled.');
    expect(el._elements.colorInput.disabled).to.equal(true, 'color input should now be disabled.');
    
  }
  
  function validateColor(el, colorStr) {
    var color = new TinyColor(colorStr);
    const format = color.format;
    const {h,s,v} = colorUtil.extractHsv(colorStr);
    color = new TinyColor({h:h, s:color.toHsl().s, l:color.toHsl().l, a:color.toHsl().a});
    
    colorStr = colorUtil.formatColorString(colorUtil.toHslString(h, color), format);
    expect(el.color).to.equal(colorStr, "should be able to set color.");
    expect(el._elements.colorInput.value).to.equal(colorStr,  "color should be set on input.");
    expect(el._elements.formatSelector.value).to.equal(format, "color format should be set from color.");
    expect(el._elements.propertyHue.value).to.equal(h, "hue should be set from color.");
    expect(el._elements.propertySL.x).to.equal(s, "saturation should be set from color.");
    expect(el._elements.propertySL.y).to.equal(v, "value should be set from color.");
  }
  
  function validateFormats(el, formats) {
    const listFormats = formats.split(',');
    expect(el.formats.toString()).to.equal(formats, "should be able to set formats.");
    expect(new TinyColor(el.color).format).to.equal(listFormats[0], "First format should be set as default.");
    expect(el._elements.formatSelector.value).to.equal(listFormats[0], "should be able to set formats.");
    const selList = el._elements.formatSelector.querySelectorAll('coral-select-item');
    expect(selList.length).to.equal(listFormats.length, "Format selector should show only provided formats.");
    var valid = true;
    selList.forEach(function(element) {
      valid = valid && (listFormats.indexOf(element.value) !== -1);
    });
    expect(valid).to.equal(true, "Format selector should show only provided formats.");  
  }
  
});  