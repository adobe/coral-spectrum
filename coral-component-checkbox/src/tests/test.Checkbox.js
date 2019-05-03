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

import {tracking} from '../../../coral-utils';
import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Checkbox} from '../../../coral-component-checkbox';
import {events} from '../../../coral-utils';

describe('Checkbox', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Checkbox).to.have.property('Label');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var checkbox = helpers.build(new Checkbox());
      
      ['disabled', 'readonly', 'invalid', 'required', 'checked'].forEach(function(attr) {
        expect(checkbox.hasAttribute(attr)).to.be.false;
      });
      expect(checkbox.classList.contains('_coral-Checkbox')).to.be.true;
    });
    
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['Checkbox.fromElement.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone the element without label element using markup',
      window.__html__['Checkbox.withContent.html']
    );
    
    helpers.cloneComponent(
      'should be possible to clone the element with label using markup',
      window.__html__['Checkbox.withLabel.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Checkbox().set({
        label: {
          innerHTML: 'Test'
        }
      }));
  });

  describe('Markup', function() {
    it('should be possible using markup', function() {
      const el = helpers.build('<coral-checkbox></coral-checkbox>');
      expect(el.classList.contains('_coral-Checkbox')).to.be.true;
    });

    it('should be possible using markup with text', function() {
      const el = helpers.build('<coral-checkbox>Checkbox</coral-checkbox>');
      expect(el.classList.contains('_coral-Checkbox')).to.be.true;
      expect(el.label.textContent).to.equal('Checkbox');
    });

    it('should be possible using markup with content zone', function() {
      const el = helpers.build('<coral-checkbox><coral-checkbox-label>Checkbox</coral-checkbox-label></coral-checkbox>');
      expect(el.classList.contains('_coral-Checkbox')).to.be.true;
      expect(el.label.textContent).to.equal('Checkbox');
    });
  });

  describe('API', function() {
    it('should have defaults', function() {
      var el = new Checkbox();

      expect(el.checked).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.name).to.equal('');
      expect(el.value).to.equal('on');
    });

    describe('#value', function() {
      it('should reflect value changes', function() {
        var checkbox = new Checkbox();
        checkbox.value = 'yes';
        expect(checkbox._elements.input.value).to.equal('yes');
      });
    });

    describe('#checked', function() {
      it('should reflect checked value', function() {
        var checkbox = new Checkbox();
        checkbox.checked = true;
        
        expect(checkbox.checked).to.be.true;
        expect(checkbox._elements.input.checked).to.be.true;
        expect(checkbox.hasAttribute('checked')).to.be.true;
      });

      it('should reflect unchecked value', function() {
        var checkbox = new Checkbox();
        checkbox.checked = false;
        
        expect(checkbox.checked).to.be.false;
        expect(checkbox._elements.input.checked).to.be.false;
        expect(checkbox.hasAttribute('checked')).to.be.false;
      });

      it('should handle manipulating checked attribute', function() {
        var el = new Checkbox();
        el.setAttribute('checked', '');
        
        expect(el._elements.input.checked).to.be.true;
        expect(el.checked).to.be.true;

        el.removeAttribute('checked');
        
        expect(el._elements.input.checked).to.be.false;
        expect(el.checked).to.be.false;
      });
    });

    describe('#indeterminate', function() {
      it('should reflect indeterminate value', function() {
        var checkbox = new Checkbox();
        expect(checkbox._elements.input.indeterminate).to.be.false;

        checkbox.indeterminate = true;
        
        expect(checkbox._elements.input.indeterminate).to.be.true;
        expect(checkbox._elements.input.hasAttribute('aria-checked', 'mixed')).to.be.true;
      });

      it('should not affect checked state when indeterminate state is changed', function() {
        var checkbox = new Checkbox();
        checkbox.checked = true;
        checkbox.indeterminate = true;
        
        expect(checkbox._elements.input.checked, 'when indeterminate is set').to.be.true;
        expect(checkbox.checked).to.be.true;
  
        checkbox.indeterminate = false;
        
        expect(checkbox._elements.input.checked, 'after indeterminate is changed to false').to.be.true;
        expect(checkbox.checked).to.be.true;
      });

      it('should not affect indeterminate state when checked state is changed', function() {
        var checkbox = new Checkbox();
        checkbox.indeterminate = true;
        checkbox.checked = true;
        
        expect(checkbox.indeterminate).to.be.true;
        expect(checkbox._elements.input.indeterminate, 'when checked is set').to.be.true;
  
        checkbox.checked = false;
  
        expect(checkbox.indeterminate).to.be.true;
        expect(checkbox._elements.input.indeterminate, 'after checked is changed to false').to.be.true;
      });

      it('should be removed on user interaction', function() {
        var checkbox = helpers.build(new Checkbox());
        checkbox.indeterminate = true;
        checkbox._elements.input.click();
  
        expect(checkbox.indeterminate).to.be.false;
        expect(checkbox._elements.input.indeterminate).to.be.false;
        expect(checkbox.checked).to.be.true;
        expect(checkbox.hasAttribute('checked')).to.be.true;
      });
    });

    describe('#disabled', function() {
      it('should reflect disabled value', function() {
        var el = new Checkbox();
        el.disabled = true;
        
        expect(el._elements.input.disabled).to.be.true;
      });

      it('should reflect enabled value', function() {
        var el = new Checkbox();
        el.disabled = false;
        
        expect(el._elements.input.disabled).to.be.false;
      });

      it('should handle manipulating disabled attribute', function() {
        var el = new Checkbox();
        el.setAttribute('disabled', '');
        
        expect(el._elements.input.disabled).to.be.true;
        expect(el.disabled).to.be.true;
  
        el.removeAttribute('disabled');
        
        expect(el._elements.input.disabled).to.be.false;
        expect(el.disabled).to.be.false;
      });
    });

    describe('#label', function() {
      it('should hide label by default', function() {
        var el = new Checkbox();
    
        expect(el._elements.labelWrapper.hidden).to.equal(true, 'The wrapper must be hidden since there are no contents');
      });
      
      it('should show label when content is not empty', function() {
        const el = helpers.build(window.__html__['Checkbox.withLabel.html']);
        expect(el._elements.labelWrapper.hidden).to.equal(false);
      });

      it('should hide label when content set to empty', function(done) {
        var checkbox = new Checkbox();
        helpers.target.appendChild(checkbox);
        
        expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
        
        checkbox.label.innerHTML = 'Test';
        
        // Wait for MO
        helpers.next(() => {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);
  
          checkbox.label.innerHTML = '';
          
          // Wait for MO
          helpers.next(() => {
            expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
            done();
          });
        });
      });

      it('should hide label when content set to empty when not in DOM', function(done) {
        var checkbox = new Checkbox();
        helpers.target.appendChild(checkbox);
        checkbox.label.innerHTML = 'Test';

        // Wait for MO
        helpers.next(function() {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);

          helpers.target.removeChild(checkbox);
          checkbox.label.innerHTML = '';

          // Wait for MO
          helpers.next(function() {
            helpers.target.appendChild(checkbox);

            // Wait for MO
            helpers.next(function() {
              expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
              done();
            });
          });
        });
      });
    });

    describe('#rendering', function() {
      it('should render chechbox with only one input, checkbox, span and label element', function() {
        var checkbox = helpers.build(new Checkbox());
        
        expectCheckboxChildren();
      });

      it('should render clone of a checkbox with only one input, checkbox, span and label element', function() {
        var checkbox = new Checkbox();
        helpers.target.appendChild(checkbox);

        helpers.target.appendChild(checkbox.cloneNode());

        helpers.target.removeChild(checkbox);
        
        expectCheckboxChildren();
      });

      function expectCheckboxChildren() {
        expect(helpers.target.querySelectorAll('coral-checkbox-label').length).to.equal(1);
        expect(helpers.target.querySelectorAll('input[handle="input"]').length).to.equal(1);
        expect(helpers.target.querySelectorAll('span[handle="checkbox"]').length).to.equal(1);
        expect(helpers.target.querySelectorAll('label[handle="labelWrapper"]').length).to.equal(1);
      }
    });
  
    describe('#trackingElement', function() {
      it('should default to empty string', function() {
        var el = new Checkbox();
        expect(el.trackingElement).to.equal('');
        expect(el.label.textContent).to.equal('');
      });
    
      it('should default to the name when available', function() {
        var el = new Checkbox();
      
        el.name = 'item1';
        el.label.textContent = 'My checkbox';
        expect(el.trackingElement).to.equal('item1=on');
      
        el.label.textContent = '  My content   with spaces';
        expect(el.trackingElement).to.equal('item1=on');
      
        el.name = '';
        expect(el.trackingElement).to.equal('My content with spaces');
      
        el.trackingElement = 'Check me';
        expect(el.trackingElement).to.equal('Check me', 'Respects the user set value when available');
      });
    
      it('should default to the content when name is not provided', function() {
        var el = new Checkbox();
      
        el.label.textContent = 'My checkbox';
        expect(el.trackingElement).to.equal('My checkbox');
      
        el.label.textContent = '  My content   with spaces';
        expect(el.trackingElement).to.equal('My content with spaces');
      
        el.trackingElement = 'Check me';
        expect(el.trackingElement).to.equal('Check me', 'Respects the user set value when available');
      });
    
      it('should strip the html out of the content', function() {
        var el = new Checkbox();
      
        el.label.innerHTML = 'My <b>c</b>heckbox';
        expect(el.trackingElement).to.equal('My checkbox');
      });
    });
  });

  describe('Events', function() {
    var checkbox;
    var changeSpy;
    var preventSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();

      checkbox = helpers.build(new Checkbox());

      // changeSpy and preventSpy for event bubble
      events.on('change.TestCheckBox', function(event) {

        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-CHECKBOX');

        changeSpy();

        if (event.defaultPrevented) {
          preventSpy();
        }
      });

      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      events.off('change.TestCheckBox');
    });

    it('should trigger change on click', function() {
      checkbox._elements.input.click();
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
      expect(checkbox.checked).to.be.true;
      expect(checkbox.hasAttribute('checked')).to.be.true;
    });

    it('should trigger change on indeterminate set', function() {
      checkbox.indeterminate = true;

      expect(checkbox.indeterminate).to.be.true;
      expect(checkbox.checked).to.be.false;

      checkbox._elements.input.click();
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
      expect(checkbox.checked).to.be.true;
      expect(checkbox.indeterminate).to.be.false;
      expect(checkbox.hasAttribute('checked')).to.be.true;
    });

    it('should not trigger change event, when checked property', function() {
      checkbox.checked = true;
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });

    it('should trigger change event, when clicked', function() {
      expect(checkbox.checked).to.be.false;
      checkbox._elements.input.click();
      
      expect(checkbox.checked).to.be.true;
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
    });

    it('should not trigger change event if value changed', function() {
      checkbox.value = 'value';
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });
  });
  
  describe('Tracking', function() {
    var trackerFnSpy;
    
    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });
    
    it('should call the tracker callback fn once when a click is triggered', function() {
      var button = new Checkbox();
      helpers.target.appendChild(button);
      button.click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called only once.');
    });
    
    it('should call the tracker callback fn twice when checking and unchecking the checkbox', function() {
      const el = helpers.build(window.__html__['Checkbox.tracking.all.html']);
      
      el.click();
      el.click();
      
      expect(trackerFnSpy.callCount).to.equal(2, 'Track event should have been called twice.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetType', 'coral-checkbox');
      expect(trackData).to.have.property('eventType', 'checked');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-checkbox');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Checkbox);
      
      spyCall = trackerFnSpy.getCall(1);
      expect(spyCall.args.length).to.equal(4);
      trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetType', 'coral-checkbox');
      expect(trackData).to.have.property('eventType', 'unchecked');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-checkbox');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Checkbox);
    });
    
    it('should call the tracker callback fn with custom trackData properties: trackingfeature and trackingelement', function() {
      var el = helpers.build(new Checkbox());
      el.setAttribute('trackingfeature', 'sites');
      el.setAttribute('trackingelement', 'rail toggle');
      
      el.click();
      
      expect(el.trackingElement).to.equal('rail toggle');
      expect(el.trackingFeature).to.equal('sites');
      
      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('rootFeature', 'sites');
      expect(trackData).to.have.property('rootElement', 'rail toggle');
    });
    
    it('should not call the tracker callback fn when component has tracking=off attribute', function() {
      var el = helpers.build(new Checkbox());
      el.setAttribute('tracking', Checkbox.tracking.OFF);
      el.click();
      
      expect(trackerFnSpy.callCount).to.equal(0, 'Tracking was performed while being disabled.');
    });
    
    it('should fallback to the default trackingElement when not specified', function() {
      const el = helpers.build(window.__html__['Checkbox.tracking.feature.html']);
      el.click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetType', 'coral-checkbox');
      expect(trackData).to.have.property('targetElement', 'Coral Rocks');
      expect(trackData).to.have.property('eventType', 'checked');
      expect(trackData).to.have.property('rootElement', 'Coral Rocks');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-checkbox');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Checkbox);
    });
    
    it('should pick the "name" atttribute as targetElement and rootElement', function() {
      const el = helpers.build(window.__html__['Checkbox.tracking.name.html']);
      el.click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetType', 'coral-checkbox');
      expect(trackData).to.have.property('targetElement', 'checkboxName=kittens');
      expect(trackData).to.have.property('eventType', 'checked');
      expect(trackData).to.have.property('rootElement', 'checkboxName=kittens');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-checkbox');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Checkbox);
    });
  });

  describe('Implementation Details', function() {
  
    describe('in a form', function() {
    
      var checkbox;
    
      beforeEach(function() {
        var form = document.createElement('form');
        form.id = 'testForm';
        helpers.target.appendChild(form);
      
        checkbox = new Checkbox();
        checkbox.name = 'formCheckbox';
        form.appendChild(checkbox);
      });
    
      it('should include the internal input value when checked', function() {
        checkbox.checked = true;
        expectFormSubmitContentToEqual([{name:'formCheckbox', value: 'on'}]);
      });
    
      it('should not include the internal input value when not checked', function() {
        // default is not checked
        expectFormSubmitContentToEqual([]);
      });
    
      it('should not include the internal input value when not named', function() {
        checkbox.name = '';
        expectFormSubmitContentToEqual([]);
      });
    
      it('should include the new value if the value was changed', function() {
        checkbox.value = 'kittens';
        checkbox.checked = true;
        expectFormSubmitContentToEqual([{name:'formCheckbox', value: 'kittens'}]);
      });
    
      function expectFormSubmitContentToEqual(expectedValue) {
        var form = document.getElementById('testForm');
        expect(helpers.serializeArray(form)).to.deep.equal(expectedValue);
      }
    });

    describe('#formField', function() {
      helpers.testFormField(window.__html__['Checkbox.fromElement.html'], {
        value: 'on',
        default: 'on'
      });
    });

    it('should allow replacing the content zone', function(done) {
      var el = helpers.build(new Checkbox());

      var label = new Checkbox.Label();
      label.textContent = 'Content';

      // Wait for MO
      helpers.next(function() {
        expect(el._elements.labelWrapper.hidden).to.be.true;
        el.label = label;
  
        // Wait for MO
        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.be.false;

          done();
        });
      });
    });

    it('should support click()', function() {
      var el = new Checkbox();
      var changeSpy = sinon.spy();
      el.on('change', changeSpy);
      el.click();
      expect(el.checked).to.be.true;
      expect(changeSpy.callCount).to.equal(1);
      el.click();
      expect(el.checked).to.be.false;
      expect(changeSpy.callCount).to.equal(2);
      el.indeterminate = true;
      el.click();
      expect(el.checked).to.be.true;
      expect(el.indeterminate).to.be.false;
      expect(changeSpy.callCount).to.equal(3);
      el.indeterminate = true;
      el.click();
      expect(el.checked).to.be.false;
      expect(el.indeterminate).to.be.false;
      expect(changeSpy.callCount).to.equal(4);
    });
  });
});
