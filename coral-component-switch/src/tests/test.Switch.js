/**
 * Copyright 2019 Adobe. All rights reserved.
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
import {Switch} from '../../../coral-component-switch';
import {events} from '../../../coral-utils';

describe('Switch', function() {
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-switch></coral-switch>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone a switch with checked attribute using markup',
      '<coral-switch checked></coral-switch>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone a switch using js',
      new Switch()
    );
  });

  describe('Markup', function() {
    describe('#checked', function() {
      it('should not be checked by default', function() {
        const el = helpers.build('<coral-switch></coral-switch>');
        expect(el.checked).to.be.false;
        expect(el.hasAttribute('checked')).to.be.false;
      });

      it('should become checked', function() {
        const el = helpers.build('<coral-switch checked></coral-switch>');
      });
    });

    describe('#disabled', function() {
      it('should not be disabled by default', function() {
        const el = helpers.build('<coral-switch></coral-switch>');
      });

      it('should become disabled', function() {
        const el = helpers.build('<coral-switch disabled></coral-switch>');
      });
    });

    describe('#labelledby', function() {
      it('should set aria-labelledby', function() {
        const el = helpers.build('<coral-switch labelledby="someId"></coral-switch>');
      });

      it('should not add aria-labelledby if null', function() {
        const el = helpers.build('<coral-switch ></coral-switch>');
      });
    });
  });

  describe('API', function() {
    it('should have proper defaults', function() {
      var el = new Switch();

      expect(el.checked).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.name).to.equal('');
      expect(el.labelledBy).to.be.null;
      expect(el.value).to.equal('on');
    });

    it('should reflect value changes', function() {
      var el = new Switch();
      el.value = 'yes';
      
      expect(el._elements.input.value).to.equal('yes');
    });
  
    describe('#labelled', () => {
      it('should show/hide screen reader text when labelled is empty/set', () => {
        const el = new Switch();
        expect(el._elements.screenReaderOnly.hidden).to.be.false;
      
        el.labelled = 'Test';
        expect(el._elements.screenReaderOnly.hidden).to.be.true;
      
        el.labelled = null;
        expect(el._elements.screenReaderOnly.hidden).to.be.false;
      });
    });
  
    describe('#label', function() {
      it('should show the screen reader text by default', function() {
        var el = new Switch();
      
        expect(el.label.textContent.trim()).to.equal('');
        expect(el._elements.labelWrapper.textContent.trim()).to.equal('Select');
        expect(el._elements.screenReaderOnly.hidden).to.be.false;
      });
    
      it('should hide the screen reader text when content is not empty', function() {
        const el = helpers.build(window.__html__['Switch.withLabel.html']);
        expect(el._elements.screenReaderOnly.hidden).to.equal(true);
      });
    
      it('should show(hide the screen reader text when content set/empty', function(done) {
        var el = new Switch();
        helpers.target.appendChild(el);
      
        expect(el._elements.screenReaderOnly.hidden).to.equal(false);
      
        el.label.innerHTML = 'Test';
      
        // Wait for MO
        helpers.next(() => {
          expect(el._elements.screenReaderOnly.hidden).to.equal(true);
        
          el.label.innerHTML = '';
        
          // Wait for MO
          helpers.next(() => {
            expect(el._elements.screenReaderOnly.hidden).to.equal(false);
            done();
          });
        });
      });
    
      it('should show screen reader text when content set to empty when not in DOM', function(done) {
        var el = helpers.build(new Switch());
      
        expect(el._elements.screenReaderOnly.hidden).to.equal(false);
      
        el.label.innerHTML = 'Test';
      
        // Wait for MO
        helpers.next(() => {
          expect(el._elements.screenReaderOnly.hidden).to.equal(true);
        
          helpers.target.removeChild(el);
          el.label.innerHTML = '';
        
          // Wait for MO
          helpers.next(() => {
            helpers.target.appendChild(el);
          
            // Wait for MO
            helpers.next(() => {
              expect(el._elements.screenReaderOnly.hidden).to.equal(false);
              done();
            });
          });
        });
      });
    });

    describe('#checked', function() {
      it('should reflect checked value', function() {
        var el = new Switch();
        el.checked = true;
        
        expect(el._elements.input.checked).to.be.true;
      });


      it('should reflect unchecked value', function() {
        var el = new Switch();
        el.checked = false;
        
        expect(el._elements.input.checked).to.be.false;
        expect(el.checked).to.be.false;
      });

      it('should handle manipulating checked attribute', function() {
        var el = new Switch();
        el.setAttribute('checked', '');
        
        expect(el._elements.input.checked).to.be.true;
        expect(el.checked).to.be.true;

        el.removeAttribute('checked');
        
        expect(el._elements.input.checked).to.be.false;
        expect(el.checked).to.be.false;
      });
    });

    describe('#disabled', function() {

      it('should reflect disabled value', function() {
        var el = new Switch();
        el.disabled = true;
        
        expect(el._elements.input.disabled).to.be.true;
      });

      it('should reflect enabled value', function() {
        var el = new Switch();
        el.disabled = false;
        
        expect(el._elements.input.disabled).to.be.false;
      });

      it('should handle manipulating disabled attribute', function() {
        var el = new Switch();
        el.setAttribute('disabled', '');
  
        expect(el._elements.input.disabled).to.be.true;
        expect(el.disabled).to.be.true;
  
        el.removeAttribute('disabled');
  
        expect(el._elements.input.disabled).to.be.false;
        expect(el.disabled).to.be.false;
      });
    });
  });

  describe('Events', function() {
    // instantiated switch el
    var el;
    var changeSpy;
    var preventSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();

      el = new Switch();
      helpers.build(el);

      // changeSpy and preventSpy for event bubble
      events.on('change.TestSwitch', function(event) {

        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-SWITCH');

        changeSpy();

        if (event.defaultPrevented) {
          preventSpy();
        }
      });

      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      events.off('change.TestSwitch');
    });

    it('should change trigger on click', function() {
      el._elements.input.click();
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
    });

    it('should not trigger change event, when checked property programmatically', function() {
      el.checked = true;
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });

    it('should trigger change event, when clicked', function() {
      expect(el.checked).to.be.false;
      el._elements.input.click();
      
      expect(el.checked).to.be.true;
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
    });

    it('should not trigger change event if value changed', function() {
      el.value = 'value';
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });
  });

  describe('User Interaction', function() {
    var el;
    beforeEach(function() {
      el = new Switch();
      helpers.build(el);
    });

    afterEach(function() {
      el = null;
    });

    it('should check on click', function() {
      expect(el.checked).to.be.false;
      expect(el.hasAttribute('checked')).to.be.false;
  
      el._elements.input.click();
  
      expect(el.checked).to.be.true;
      expect(el.hasAttribute('checked')).to.be.true;
      expect(el._elements.input.checked).to.be.true;
  
      el._elements.input.click();
  
      expect(el.checked).to.be.false;
      expect(el.hasAttribute('checked')).to.be.false;
    });
  });

  // section used for compliance since the current one does not follow test conventions
  describe('Implementation Details (compliance)', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Switch.base.html'], {
        value: 'on',
        default: 'on'
      });
    });
  });
});
