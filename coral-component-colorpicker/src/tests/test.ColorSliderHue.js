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

describe('ColorPicker.ColorSliderHue', function () {
  const min = 0;
  const max = 360;
  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['ColorSliderHue.html']
    );

    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new ColorPicker.ColorSliderHue()
    );
  });
  
  describe('API', function () {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorSliderHue());
    });

    afterEach(function () {
      el = null;
    });

    describe('#label', function () {
      it('should be possible to set label on the colorsliderhue', function(){
        var label = "Color Slider Hue Label";
        el.label = label;    
        validateLabel(el, label);
      });
    });     
    describe('#disabled', function () {
      it('should be possible to disable the colorsliderhue', function(){
        // set disabled
        el.disabled = true;    
        validateDisabled(el);
      });
    });
    
    describe('#value', function () {
      it('should be possible to set value on the colorsliderhue', function(){ 
        el.value = 120;
        validateValue(el, 120);
      });
    });
    
    describe('#color', function () {
      it('should be possible to set color on the colorsliderhue', function(){ 
        el.color = "#5151a4";
        validateColor(el, "hsl(240, 100%, 50%)");
      });
    });
    
    it("Value should be snapped to step size", function(){
      el.value = 100.12;
      expect(el.value).to.equal(100, 'value should be snapped to step size of 1');
    });                 
  });
  
  describe('Markup', function () {
    describe('#label', function () {
      it('should be possible to set label on the colorsliderhue from markup', function() {
        var label = "Color Area Label";
        const el = helpers.build('<coral-colorpicker-colorsliderhue label="' + label + '"></coral-colorpicker-colorsliderhue>');      
        el.label = label;    
        validateLabel(el, label);
      });
    });

    describe('#disabled', function () {
      it('should be possible to disable the colorsliderhue from markup', function() {
        const el = helpers.build('<coral-colorpicker-colorsliderhue disabled></coral-colorpicker-colorsliderhue>');
        validateDisabled(el);
      });
    });    

    describe('#value', function () {
      it('should be possible to set value on the colorsliderhue from markup', function() { 
        const el = helpers.build('<coral-colorpicker-colorsliderhue value="120"></coral-colorpicker-colorsliderhue>');
        validateValue(el, 120);
      });
    });
    
    describe('#color', function () {
      it('should be possible to set color on the colorsliderhue from markup', function() {
        const el = helpers.build('<coral-colorpicker-colorsliderhue color="#5151a4"></coral-colorpicker-colorsliderhue>');
        validateColor(el, "hsl(240, 100%, 50%)");
      });
    });           
  });

  describe('#Color Formats', function() {
    var el;
    var color = "hsl(240, 100%, 50%)";

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorSliderHue());
    });

    afterEach(function () {
      el = null;
    });
      
    it('should be able to set color in hex format', function() {
      el.color = "#3d3db8";
      validateColor(el, color);
    });

    it('should be able to set color in hex4 format', function() {
      el.color = "#3d3db8ff";
      validateColor(el, color);
    });    

    it('should be able to set color in rgb format', function() {
      el.color = "rgb(61, 61, 184)";
      validateColor(el, color);
    }); 

    it('should be able to set color in prgb format', function() {
      el.color = "rgb(24%, 24%, 72%)";
      validateColor(el, color);
    });

    it('should be able to set color in hsv format', function() {
      el.color = "hsv(240, 67%, 72%)";
      validateColor(el, color);
    }); 
    
    it('should be able to set color in hsl format', function() {
      el.color = "hsl(240, 50%, 48%)";
      validateColor(el, color);
    });         

    it('should be able to set color in name format', function() {
      el.color = "navy";
      validateColor(el, 'hsl(240, 100%, 50%)'   );
    });             
  });

  describe('#Invalid inputs', function() {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorSliderHue());
    });

    afterEach(function () {
      el = null;
    });
      
    it('should handle invalid values', function() {
      el.value = -1.15;
      validateValue(el, 0);
      el.value = 365;
      validateValue(el, 360);
      el.value = 'not-a-number';
      validateValue(el, 0);
    });
    
  
    it('should handle invalid color values', function() {
      el.color = "abcd(efg)";
      validateColor(el, "hsl(180, 100%, 50%)");
    });
  });
  
  describe("#User Interaction", function() {
    var el;
    var step = 1;
    var spy;
    

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorSliderHue());
      spy = sinon.spy();
      el.on('change', spy);
    });

    afterEach(function () {
      el = spy = null;
    });

    function createMouseEvent(type, x, y) {
      return new MouseEvent(type, {
        bubbles: true,
        clientY: y,
        clientX: x
      });
    }
        
    it("Keyboard Interaction Up key", function() {
      var val = 100;           
      el.value = val;
      helpers.keypress('up', el);
      validateValue(el, (val + step));
      expect(spy.callCount).to.equal(1);
    });

    it("Keyboard Interaction Down key", function() {
      var val = 100;           
      el.value = val;
      helpers.keypress('down', el);
      validateValue(el, (val - step));
      expect(spy.callCount).to.equal(1);
    });

    it("Keyboard Interaction Left key", function() {    
      var val = 100;           
      el.value = val;
      helpers.keypress('left', el);
      validateValue(el, (val - step));
      expect(spy.callCount).to.equal(1);
    });

    it("Keyboard Interaction Right key", function() {
      var val = 100;           
      el.value = val;
      helpers.keypress('right', el);
      validateValue(el, (val + step));
      expect(spy.callCount).to.equal(1);
    });

    it("Keyboard Interaction at boundaries Up Key at top", function() {            
      el.value = 360;
      helpers.keypress('up', el);
      validateValue(el, 360);
      expect(spy.callCount).to.equal(0);
    });

    it("Keyboard Interaction at boundaries Down Key at bottom", function() {   
      el.value = 0;
      helpers.keypress('down', el);
      validateValue(el, 0);
      expect(spy.callCount).to.equal(0);
     }); 
        
    it("Mouse drag vertical", function() {
      const boundingClientRect = el.getBoundingClientRect();
      const height = boundingClientRect.height;
      const width = boundingClientRect.width;
      const right = boundingClientRect.left + width;
      const top = boundingClientRect.top;
      
      el.dispatchEvent(createMouseEvent('mousedown', right, top));
      // drag down to half
      el.dispatchEvent(createMouseEvent('mousemove', right, (top + height/2.0)));
      el.dispatchEvent(createMouseEvent('mouseup', right, (top + height/2.0)));
      validateValue(el, 180);
    });  
  });
      
  function validateLabel(el, label) {
    expect(el.label).to.equal(label, 'label property should be set.');
    expect(el.getAttribute('label')).to.equal(label, 'label attribute should be set.');
    expect(el._elements.slider.getAttribute('aria-label')).to.equal(label, 'aria-label attribute should be set on input field.');
  }
  
  function validateDisabled(el) {
    expect(el.disabled).to.equal(true, 'should now be disabled.');
    expect(el.hasAttribute('disabled')).to.equal(true, 'disabled  attribute should be set.');
    expect(el.getAttribute('aria-disabled')).to.equal("true", 'aria-disabled attribute should be set.');
    expect(el._elements.colorHandle.disabled).to.equal(true, 'color handle should now be disabled.');
    expect(el._elements.slider.disabled).to.equal(true, 'input field should now be disabled.');
    expect(el.classList.contains('is-disabled')).to.equal(true, "class is-disabled should be added."); 
  }
  
  function validateValue(el, value) {
    var expectedColor = colorUtil.toHslString(value, new TinyColor({h:value, s:1, l: .5, a:1}).toHslString());
    expect(el.value).to.equal(value, 'value should be set.');
    expect(el.getAttribute('value')).to.equal("" + value, 'attribute value  be set.');
    expect(el._elements.slider.getAttribute('value')).to.equal("" + value, 'input field value should be set.');
    expect(el._elements.slider.getAttribute('aria-valuetext')).to.equal(`${value}°`, 'input field aria-valuetext should be set.');
    var percent  = parseFloat(100 - ((value - min) / (max - min) * 100)).toFixed(3);
    expect(parseFloat(el._elements.colorHandle.style.top).toFixed(3)).to.equal(`${percent}`, 'colorHandle position should be set on value change.');
    expect(el._elements.colorHandle.getAttribute('color')).to.equal(expectedColor,'color-handle color should be set on value change.');
    expect(el.color).to.equal(expectedColor, 'saturation should be set on value change.');  
  }
  
  function validateColor(el, colorStr) {
    expect(el.color).to.equal(colorStr, 'color should be set.');
    expect(el.getAttribute('color')).to.equal(colorStr, "color attribute should be set.");
    const hue = colorUtil.getHue(colorStr);
    expect(el.value).to.equal(hue, "value should be set on color change.");
    expect(el._elements.slider.getAttribute('aria-valuetext')).to.equal(`${hue}°`, 'input field aria-valuetext should be set.');
    expect(el._elements.colorHandle.getAttribute('color')).to.equal(colorStr,'color-handle color should be set on color change.');
    var percent  = parseFloat(100 - ((hue - min) / (max - min) * 100)).toFixed(3);
    expect(parseFloat(el._elements.colorHandle.style.top).toFixed(3)).to.equal(`${percent}`, 'colorHandle position should be set on value change.');
  }
});  