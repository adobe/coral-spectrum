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

describe('ColorPicker', function () {
  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['ColorPicker.html']
    );
  });
  
  describe('API', function () {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker());
    });

    afterEach(function () {
      el = null;
    });
    
    describe('#label', function () {
      it('should be possible to set label on the colorpicker', function() {
        var label = "Color Picker";
        el.label = label;    
        validateLabel(el, label);
      });
    });

    describe('#labelledBy', function () {
      it('should default to null', function() {
         expect(el.labelledBy).to.be.null;
      });
    });
         
    describe('#disabled', function () {
      it('should be possible to disable the colorpicker', function() {
        // set disabled
        el.disabled = true;    
        validateDisabled(el);
      });
    });    

    describe('#value', function () {
      it('should be possible to set value on the colorpicker', function() {
        el.value = "hsv(240, 40%, 35%)"
        validateValue(el, "hsv(240, 40%, 35%)");
      });
    });

    describe('#formats', function () {
      it('should be possible to set formats on the colorpicker', function() {
        el.formats = "rgb,hsv";
        validateFormats(el, "rgb,hsv");
      });
    });
            
  });

  describe('Markup', function () {
    describe('#label', function () {
      it('should be possible to set label on the colorpicker', function() {
        var label = "Color Picker";
        const el = helpers.build('<coral-colorpicker label="' + label + '"></coral-colorpicker>');    
        validateLabel(el, label);
      });
    });

    describe('#labelledBy', function () {
      it('should be possible to set labelledBy on the colorpicker', function() {
        const div = helpers.build(window.__html__['ColorPicker.labelledBy.html']);
        var el = div.querySelector('coral-colorpicker');
        expect(el.labelledBy).to.equal('label1', 'should be labeled by "label1"');
        expect(el.getAttribute('aria-labelledby')).to.equal('label1', 'should also be labeled by "label1"');
      });
    });
         
    describe('#disabled', function () {
      it('should be possible to disable the colorpicker', function() {
        const el = helpers.build('<coral-colorpicker disabled></coral-colorpicker>');        
        validateDisabled(el);
      });
    });    

    describe('#value', function () {
      it('should be possible to set value on the colorpicker', function() {
        const el = helpers.build('<coral-colorpicker value="hsv(240, 40%, 35%)"></coral-colorpicker>');
        validateValue(el, "hsv(240, 40%, 35%)");
      });
    });

    describe('#formats', function () {
      it('should be possible to set formats on the colorpicker', function() {
        const el = helpers.build('<coral-colorpicker formats="rgb,hsv"></coral-colorpicker>');
        validateFormats(el, "rgb,hsv");
      });
    });  
  });
  
  describe("Values and formats", function() {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker());
    });

    afterEach(function () {
      el = null;
    });
      
    it("invalid value should be highlighted", function() {
      el.value =  "abcd(efg)";
      expect(el.classList.contains('is-invalid')).to.equal(true, "Invalid value should show invalid UI");
      expect(el.getAttribute('invalid')).to.equal("true", "Invalid value should show invalid UI");
      expect(el._elements.input.classList.contains('is-invalid')).to.equal(true, "Invalid value should show invalid UI");
      expect(el._elements.input.getAttribute('invalid')).to.equal("true", "Invalid value should show invalid UI");      
    });
    
    it("invalid formats should be ignored", function() {
      el.formats = "abcd,rgb";
      validateFormats(el, "rgb");
    });

    it("should be able to set Empty value", function() {
      el.value = "hsl(240, 100%, 50%)";
      validateValue(el, "hsl(240, 100%, 50%)");
      el.value = "";
      expect(el.value).to.equal("", 'should set empty value.');
      expect(el._elements.input.value).to.equal("", 'should set empty value.');
      expect(el.classList.contains('_coral-ColorPicker--novalue')).to.equal(true, 'should show empty value ui.');
      expect(el._elements.colorPreview.classList.contains('_coral-ColorPicker-preview--novalue')).to.equal(true, 'should show empty value ui.');
      el.value = "hsl(240, 100%, 50%)";
      validateValue(el, "hsl(240, 100%, 50%)");
      expect(el.classList.contains('_coral-ColorPicker--novalue')).to.equal(false, 'should reset empty value ui.');
      expect(el._elements.colorPreview.classList.contains('_coral-ColorPicker-preview--novalue')).to.equal(false, 'should reset empty value ui.');          
    });
    
    it("should be able to set value in  given format", function() {
      el.formats = "rgb";
      el.value = "hsl(240, 100%, 50%)";
      validateValue(el, "rgb(0, 0, 255)");
    });       
  });

  describe("#User Interaction", function() {
    var el;

    beforeEach(function () {
      el = helpers.build(new ColorPicker());
    });

    afterEach(function () {
      el = null;
    });
    
    it("should open color properties overlay on down key on input", function() {
      expect(el._elements.overlay.open).to.equal(false, 'overlay should be closed by default');
      
      helpers.keypress('down', el._elements.input);
      expect(el._elements.overlay.open).to.equal(true, 'overlay should open.');
    }); 

    it("should open color properties overlay on down key on preview button", function() {
      expect(el._elements.overlay.open).to.equal(false, 'overlay should be closed by default');
      
      helpers.keypress('down', el._elements.colorPreview);
      expect(el._elements.overlay.open).to.equal(true, 'overlay should open.');
    });
 
    it("should open color properties overlay on click on preview button", function() {
    
    });
            
    it("should close color properties overlay on esc key", function() {
      expect(el._elements.overlay.open).to.equal(false, 'overlay should be closed by default');

      // click on button should open overlay
      el._elements.colorPreview.click();
      expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');      
    });
     
    it("should close color properties overlay on enter key", function() {      
      helpers.keypress('down', el._elements.input);
      expect(el._elements.overlay.open).to.equal(true, 'overlay should open.');
      helpers.keypress('enter', el._elements.input); 
      expect(el._elements.overlay.open).to.equal(false, 'overlay should close.');
    });
    
    it("should close color properties overlay on esc key", function() {
      helpers.keypress('down', el._elements.input);
      expect(el._elements.overlay.open).to.equal(true, 'overlay should open.');
      helpers.keypress('esc', el._elements.input); 
      expect(el._elements.overlay.open).to.equal(false, 'overlay should close.');    
    });
    
    it("should reflect value on change from input", function() {
      el._elements.input.value = "rgb(93, 93, 137)";
      el._elements.input.trigger('change');
      validateValue(el, "rgb(93, 93, 137)");
    });
  });
  
  describe("#Color Formats", function() {
    var el;
    
    beforeEach(function () {
      el = helpers.build(new ColorPicker());
    });

    afterEach(function () {
      el = null;
    });
      
    it('should be able to set color in hex format', function() {
      el.value = "#3d3db8";
      validateValue(el, "#3d3db8");
    });

    it('should be able to set color in hex4 format', function() {
      el.value = "#3d3db8ff";
      validateValue(el, "#3d3db8ff");
    });    

    it('should be able to set color in rgb format', function() {
      el.value = "rgb(61, 61, 184)";
      validateValue(el, "rgb(61, 61, 184)");
    }); 

    it('should be able to set color in prgb format', function() {
      el.value = "rgb(24%, 24%, 72%)";
      validateValue(el, "rgb(24%, 24%, 72%)");
    });

    it('should be able to set color in hsv format', function() {
      el.value = "hsv(240, 67%, 72%)";
      validateValue(el, "hsv(240, 67%, 72%)");
    }); 
    
    it('should be able to set color in hsl format', function() {
      el.value = "hsl(240, 50%, 48%)";
      validateValue(el, "hsl(240, 50%, 48%)");
    });         

    it('should be able to set color in name format', function() {
      el.value = "navy";
      validateValue(el, 'navy');
    });  
  }); 
    
  function validateDisabled(el) {
    expect(el.disabled).to.equal(true, 'should now be disabled.');
    expect(el.hasAttribute('disabled')).to.equal(true, 'disabled  attribute should be set.');
    expect(el.getAttribute('aria-disabled')).to.equal("true", 'aria-disabled attribute should be set.');
    expect(el._elements.input.disabled).to.equal(true, 'input field should now be disabled.');
    expect(el._elements.colorPreview.disabled).to.equal(true, 'color preview should now be disabled.');
  }
  
  function validateLabel(el, label) {
    expect(el.label).to.equal(label, 'label property should be set.');
    expect(el.getAttribute('label')).to.equal(label, 'label attribute should be set.');
    expect(el._elements.input.getAttribute('aria-label')).to.equal(label, 'aria-label attribute should be set on input field.');
  }
  
  function validateValue(el, value) {
    var color = new TinyColor(value);
    const format = color.format;    
    const colorStr = colorUtil.formatColorString(value, format);
    expect(el.value).to.equal(colorStr, "should be able to set value.");
    expect(el._elements.input.value).to.equal(colorStr, "should set value on input field.");
    expect(el._elements.colorPreview.style["background-color"]).to.equal(new TinyColor(value).toRgbString(), 'should set preview color.');
    const {h,s,v} = colorUtil.extractHsv(colorStr);
    color = new TinyColor({h:h, s:color.toHsl().s, l:color.toHsl().l, a:color.toHsl().a});
    expect(el._elements.propertiesView.color).to.equal(colorUtil.formatColorString(colorUtil.toHslString(h, color), format), "should set color properties.");
  }
  
  function validateFormats(el, formats) {
    const listFormats = formats.split(',');
    expect(el.formats.toString()).to.equal(formats, "should be able to set formats.");
    expect(new TinyColor(el.value).format).to.equal(listFormats[0], "First format should be set as default.");
  }     
});
