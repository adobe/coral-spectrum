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

describe('ColorPicker.ColorArea', function () {
  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['ColorArea.html']
    );

    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new ColorPicker.ColorArea()
    );
  });
  
  describe('API', function () {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorArea());
    });

    afterEach(function () {
      el = null;
    });

    describe('#disabled', function () {
      it('should be possible to disable the colorarea', function(){
        // set disabled
        el.disabled = true;    
        validateDisabled(el);
      });
    });    

    describe('#label', function () {
      it('should be possible to set label on the colorarea', function(){
        var label = "Color Area Label";
        el.label = label;    
        validateLabel(el, label);
      });
    }); 
    
    describe('#x', function () {
      it('should be possible to set x on the colorarea', function(){ 
        el.x = 0.5;
        validateXSlider(el, 0.5);
      });
    }); 

    describe('#y', function () {
      it('should be possible to set y on the colorarea', function(){ 
        el.y = 0.5;
        validateYSlider(el, 0.5);
      });
    }); 

    describe('#color', function () {
      it('should be possible to set color on the colorarea', function(){ 
        el.color = "#5151a4";
        validateColor(el, "hsl(240, 34%, 48%)");
      });
    });
                
  });
  
  describe('Markup', function () {
  
    describe('#disabled', function () {
      it('should be possible to disable the colorarea from markup', function(){
        const el = helpers.build('<coral-colorpicker-colorarea disabled></coral-colorpicker-colorarea>');
        validateDisabled(el);
      });
    });
    
    describe('#label', function () {
      it('should be possible to set label on the colorarea from markup', function(){
        var label = "Color Area Label";
        const el = helpers.build('<coral-colorpicker-colorarea label="'  +  label + '"></coral-colorpicker-colorarea>');      
        el.label = label;    
        validateLabel(el, label);
      });
    });       

    describe('#x', function () {
      it('should be possible to set x on the colorarea from markup', function(){ 
        const el = helpers.build('<coral-colorpicker-colorarea x="0.5"></coral-colorpicker-colorarea>');
        validateXSlider(el, 0.5);
      });
    }); 

    describe('#y', function () {
      it('should be possible to set y on the colorarea from markup', function(){ 
        const el = helpers.build('<coral-colorpicker-colorarea y="0.5"></coral-colorpicker-colorarea>');
        validateYSlider(el, 0.5);
      });
    }); 

    describe('#color', function () {
      it('should be possible to set color on the colorarea from markup', function(){
        const el = helpers.build('<coral-colorpicker-colorarea color="#5151a4"></coral-colorpicker-colorarea>');
        validateColor(el, "hsl(240, 34%, 48%)");
      });
    });            
  }); 
  
  describe('#Invalid inputs', function() {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorArea());
    });

    afterEach(function () {
      el = null;
    });
      
    it('should handle invalid x values', function() {
      el.x = -1.15;
      validateXSlider(el, 0);
      el.x = 2.34;
      validateXSlider(el, 1);
      el.x = 'not-a-number';
      validateXSlider(el, 0);  
    });
    
    it('should handle invalid y values', function() {
      el.y = -1.15;
      validateYSlider(el, 0);
      el.y = 2.34;
      validateYSlider(el, 1);
      el.y = 'not-a-number';
      validateYSlider(el, 0);     
    });
    
    it('should handle invalid color values', function() {
      el.color = "abcd(efg)";
      validateColor(el, "hsl(120, 100%, 50%)");
    });
  });

  describe('#Color Formats', function() {
    var el;
    var color = "hsl(240, 50%, 48%)";

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorArea());
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
      validateColor(el, 'hsl(240, 100%, 25%)'   );
    });             
  });
  
  describe("#HSV values change", function() {
    var el;
    var hue = 120;

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorArea());
    });

    afterEach(function () {
      el = null;
    });
    
    it("Hue shouldn't change on boundaries", function() {
      // top-right
      el.color = "hsv(120, 100%, 100%)";
      var h = colorUtil.getHue(el.color);
      expect(h).to.equal(hue, "Hue shouldn't change.");
      // top-left
      el.color = "hsv(120, 0%, 100%)";
      h = colorUtil.getHue(el.color);
      expect(h).to.equal(hue, "Hue shouldn't change.");
      // bottom-left
      el.color = "hsv(120, 0%, 0%)";
      h = colorUtil.getHue(el.color);
      expect(h).to.equal(hue, "Hue shouldn't change.");
      // bottom-right
      el.color = "hsv(120, 100%, 0%)";
      h = colorUtil.getHue(el.color);
      expect(h).to.equal(hue, "Hue shouldn't change.");         
    });
    
    it("x and  y values should be independent", function() {
      // change y , fixed x
      for(var x = 0; x <= 100; x = x+5) {
        el.x = x/100.0;
        for(var y = 0; y <= 100; y = y+5) {
          el.y = y/100.0;
          expect(parseFloat(el.x).toFixed(2)).to.equal(parseFloat(x/100.0).toFixed(2), 'x should not change on changing y. x=' + x/100.0 + ',y=' + y/100.0);
        }
      }
      
      // change x , fixed y
      for(var y = 0; y <= 100; y = y+5) {
        el.y = y/100.0;
        for(var x = 0; x <= 100; x = x+5) {
          el.x = x/100.0;
          expect(parseFloat(el.y).toFixed(2)).to.equal(parseFloat(y/100.0).toFixed(2), 'y should not change on changing x. x=' + x/100.0 + ',y=' + y/100.0);
        }
      }      
    });
    
    it("Values  of x,y should be snapped to step size", function(){
      el.x = 0.126;
      expect(el.x).to.equal(0.13, 'x value should be snapped to step size of 0.01');
      el.y = 0.262;
      expect(el.y).to.equal(0.26, 'y value should be snapped to step size of 0.01');
    });
  });
  
  describe("#User Interaction", function() {
    var el;
    var handleX, handleY;
    var step  = 0.01;
    var spy;
    

    beforeEach(function () {
      el = helpers.build(new ColorPicker.ColorArea());
      spy = sinon.spy();
      el.on('change', spy);
    });

    afterEach(function () {
      el = handleX = handleY = spy = null;
    });

    function createMouseEvent(type, x, y) {
      return new MouseEvent(type, {
        bubbles: true,
        clientY: y,
        clientX: x
      });
    }
        
    it("Keyboard Interaction Up key", function() {
      var valY = 0.75;           
      el.y = valY;
      el.x = 1.0;
      helpers.keypress('up', el);
      validateYSlider(el, (valY + step));
      expect(spy.callCount).to.equal(1);
      expect(el._elements.colorHandle.classList.contains('is-focused')).to.equal(true, "ColorHandle should be focused.");
    });

    it("Keyboard Interaction Down key", function() {  
      var valY = 0.75;    
      el.y = valY;
      el.x = 1.0;
      helpers.keypress('down', el);
      validateYSlider(el, (valY - step));
      expect(spy.callCount).to.equal(1);
      expect(el._elements.colorHandle.classList.contains('is-focused')).to.equal(true, "ColorHandle should be focused.");
    });

    it("Keyboard Interaction Left key", function() {    
      var valX = 0.75;              
      el.x = valX;
      el.y = 1.0;
      helpers.keypress('left', el);
      validateXSlider(el,  (valX - step));
      expect(spy.callCount).to.equal(1);
      expect(el._elements.colorHandle.classList.contains('is-focused')).to.equal(true, "ColorHandle should be focused.");
    });

    it("Keyboard Interaction Right key", function() {
      var valX = 0.75;
      el.x = valX;
      el.y = 1.0;
      helpers.keypress('right', el);
      validateXSlider(el,  (valX + step));
      expect(spy.callCount).to.equal(1);
      expect(el._elements.colorHandle.classList.contains('is-focused')).to.equal(true, "ColorHandle should be focused.");
    });

    it("Keyboard Interaction Home key", function() {
      el.x = 1.0;
      el.y = 1.0;
      helpers.keypress('home', el);
      expect(el.x).to.equal(0, "Home key should set x to min");
      expect(el.y).to.equal(0, "Home key should set y to min");
      expect(spy.callCount).to.equal(1);
      expect(el._elements.colorHandle.classList.contains('is-focused')).to.equal(true, "ColorHandle should be focused.");
    });

    it("Keyboard Interaction End key", function() {
      el.x = 0.5;
      el.y = 0.5;
      helpers.keypress('end', el);
      expect(el.x).to.equal(1.0, "Home key should set x to max");
      expect(el.y).to.equal(1.0, "Home key should set y to max");
      expect(spy.callCount).to.equal(1);
      expect(el._elements.colorHandle.classList.contains('is-focused')).to.equal(true, "ColorHandle should be focused.");
    });
        
    it("Keyboard Interaction at boundaries Up Key at top-right", function() {            
      el.y = 1.0;
      el.x = 1.0;
      helpers.keydown('up', el);
      validateYSlider(el, 1.0);
      expect(spy.callCount).to.equal(0);
    });

    it("Keyboard Interaction at boundaries Right Key at top-right", function() {      
      el.x = 1.0;
      el.y = 1.0;
      helpers.keypress('right', el);
      validateXSlider(el, 1.0);
      expect(spy.callCount).to.equal(0);
     }); 

    it("Keyboard Interaction at boundaries Left Key at top-left", function() {                  
      el.x = 0.0;
      el.y = 1.0;
      helpers.keypress('left', el);
      validateXSlider(el,  0.0);
      expect(spy.callCount).to.equal(0);
    });

    it("Keyboard Interaction at boundaries Down Key at bottom-right", function() {                
      el.x = 1.0;
      el.y = 0.0;
      helpers.keypress('down', el);
      validateYSlider(el,  0.0);
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
      validateYSlider(el,  0.5);
    });
    
    it("Mouse drag horizontal", function() {
      const boundingClientRect = el.getBoundingClientRect();
      const height = boundingClientRect.height;
      const width = boundingClientRect.width;
      const right = boundingClientRect.left + width;
      const top = boundingClientRect.top;
      
      el.dispatchEvent(createMouseEvent('mousedown', right, top));
      // drag left to half
      el.dispatchEvent(createMouseEvent('mousemove', (right - width/2.0), top));
      el.dispatchEvent(createMouseEvent('mouseup', (right - width/2.0), top));
      validateXSlider(el,  0.5);
    });    
  });
      
  function validateDisabled(el) {
    expect(el.disabled).to.equal(true, 'should now be disabled.');
    expect(el.hasAttribute('disabled')).to.equal(true, 'disabled  attribute should be set.');
    expect(el.getAttribute('aria-disabled')).to.equal("true", 'aria-disabled attribute should be set.');
    expect(el._elements.colorHandle.disabled).to.equal(true, 'color handle should now be disabled.');
    expect(el._elements.sliderX.disabled).to.equal(true, 'input field x should now be disabled.');
    expect(el._elements.sliderY.disabled).to.equal(true, 'input field y should now be disabled.');
    expect(el.classList.contains('is-disabled')).to.equal(true, "class is-disabled should be added.");
  } 
  
  function validateLabel(el, label) {
    expect(el.label).to.equal(label, 'label property should be set.');
    expect(el.getAttribute('label')).to.equal(label, 'label attribute should be set.');
    expect(el._elements.sliderX.getAttribute('aria-label')).to.equal(label, 'aria-label attribute should be set on input field x.');
    expect(el._elements.sliderY.getAttribute('aria-label')).to.equal(label, 'aria-label attribute should be set n input field y.');
  }
  
  function validateXSlider(el, xValue) {
    var expectedColor = colorUtil.toHslString(120, new TinyColor({h:120, s:xValue, v:1}).toHslString());
    expect(el.x).to.equal(xValue, 'x value should be set.');
    expect(el.getAttribute('x')).to.equal(`${xValue}`, 'attribute x value  be set.');
    expect(el._elements.sliderX.getAttribute('value')).to.equal(`${xValue}`, 'input field x value should be set.');
    expect(el._elements.sliderX.getAttribute('aria-valuetext')).to.equal(`Saturation: ${Math.round(xValue * 100)}%`, 'input field x aria-valuetex should be set.');
    expect(el._elements.colorHandle.style.left).to.equal(`${xValue*100}%`, 'colorHandle position should be set on x value change.');
    expect(el._elements.colorHandle.getAttribute('color')).to.equal(expectedColor,'color-handle color should be set on x value change.');
    expect(el.color).to.equal(expectedColor, 'saturation should be set on x value change.');
  }

  function validateYSlider(el, yValue) {
    var expectedColor = colorUtil.toHslString(120, new TinyColor({h:120, s:1, v:yValue}).toHslString());
    expect(el.y).to.equal(yValue, 'y value should be set.');
    expect(el.getAttribute('y')).to.equal(`${yValue}`, 'attribute x value  be set.');
    expect(el._elements.sliderY.getAttribute('value')).to.equal(`${yValue}`, 'input field x value should be set.');
    expect(el._elements.sliderY.getAttribute('aria-valuetext')).to.equal(`Brightness: ${Math.round(yValue * 100)}%`, 'input field y aria-valuetex should be set.');    
    expect(el._elements.colorHandle.style.top).to.equal(`${100 - (yValue*100)}%`, 'colorHandle position should be set on y value change.');
    expect(el._elements.colorHandle.getAttribute('color')).to.equal(expectedColor,'color should be set on color-handle on y value change.');
    expect(el.color).to.equal(expectedColor, 'luminosity should be set on y value change.');
  }
 
  function validateColor(el, colorStr) {
    expect(el.color).to.equal(colorStr, 'color should be set.');
    expect(el.getAttribute('color')).to.equal(colorStr, "color attribute should be set.");
    const {h,s,v} = colorUtil.extractHsv(colorStr);
    expect(el.x).to.equal(s, "x value should be set on color change.");
    expect(el.y).to.equal(v, "y value should be set on color change.");
    expect(el._elements.colorHandle.getAttribute('color')).to.equal(colorStr,'color-handle color should be set on color change.');
    expect(el._elements.colorHandle.style.top).to.equal(`${100 - (v*100)}%`, 'colorHandle position should be set on color change.');
    expect(el._elements.colorHandle.style.left).to.equal(`${s*100}%`, 'colorHandle position should be set on color change.');
  }  
});  
  