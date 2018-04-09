import {commons} from '../../../../coralui-util';
import {target, build} from './helpers.build';
import {event} from './helpers.events';

var LABELLABLE_ELEMENTS_SELECTOR = 'button,input:not([type=hidden]),keygen,meter,output,progress,select,textarea';

/**
 Helper used to transform submittable form elements into an array of name/value pair.
 
 @param {HTMLElement} form
 The form element that contains the submittable elements
 */
const serializeArray = function(form) {
  var arr = [];
  
  if (form && form.tagName !== 'FORM') {
    return arr;
  }
  
  Array.prototype.forEach.call(form.elements, function(el) {
    if (el.name && !el.disabled && !el.hidden) {
      var isCheckable = (el.tagName === 'INPUT' && (el.type === 'checkbox' || el.type === 'radio'));
      var isSelectable = el.tagName === 'SELECT';
      var isFile = (el.tagName === 'INPUT' && el.type === 'file');
      
      if (isSelectable) {
        Array.prototype.forEach.call(el.options, function(option) {
          if (option.selected) {
            arr.push({name: el.name, value: option.value});
          }
        });
      }
      else {
        if (!isFile && !(isCheckable && !el.checked)) {
          arr.push({name: el.name, value: el.value});
        }
      }
    }
  });
  
  return arr;
};

/**
 Helpers used to check that the component complies with the formField behavior.
 [Some formField components use another property than "value" to transmit their state.
 This is the case of Switch, Radio and Checkbox that used "checked" to indicate their state.
 For these components make sure that the "checked" state is NOT SET in markup and just pass the default value for both "options.value" and "options.default"]
 @param {String} markup
 The markup used to initialize the component. If the component accepts items, then the markup
 should include the items to be able to test the value.
 @param {Object} options
 Object that contains configuration values to test.
 @param {String} options.value
 A valid value to set to the component. Ideally it should not be an empty string.
 @param {String} [options.default=""]
 Default value of the component. If not provided empty string is used.
 */
const testFormField = function(markup, options) {
  // sets the default to empty string since this is the normal value
  options.default = options.default || '';
  
  describe('testFormField', function() {
    
    var el;
    var changeSpy;
    
    beforeEach(function() {
      changeSpy = sinon.spy();
      // event is added before we build the component to make sure instantiation does not trigger any undesired events.
      target.addEventListener('change', changeSpy);
      
      el = build(markup);
    });
    
    afterEach(function() {
      target.removeEventListener('change', changeSpy);
      el = changeSpy = null;
    });
    
    describe('API', function() {
      
      describe('#value', function() {
        it('should be provided', function() {
          // for the purpose of the helper, we want to test that a value is behaving correctly so tests where an initial
          // value is not provided would fail
          expect(el.getAttribute('value')).not.to.equal('');
          expect(el.getAttribute('value')).not.to.equal(options.default);
        });
        
        it('should have the correct default', function() {
          if (el.getAttribute('is') === 'coral-textarea') {
            // As the textarea does not use the "value attribute" but the textContent to set it's initial value we unfortunately have to handle this case seperately
            // e.g.: <textarea is='coral-textarea'>Initial Content</textarea>
            // Fortunately clearing the element should also set back to the default
            el.clear();
          }
          else {
            // removing the attribute falls back to the default
            el.removeAttribute('value');
          }
          
          expect(el.value).to.equal(options.default, 'Removing the value should cause the value to be the default');
        });
        
        it('should not be reflected', function() {
          el.value = options.value;
          
          // in case the reflection takes a new frame
          expect(el.getAttribute('value')).not.to.equal(options.value);
        });
      });
      
      describe('#name', function() {
        it('should have empty string as default', function() {
          expect(el.name).to.equal('');
        });
        
        it('should transform everything to a string', function() {
          el.name = null;
          expect(el.name).to.be.oneOf(['null', '']);
          el.name = undefined;
          expect(el.name).to.be.oneOf(['undefined', '']);
          el.name = 0; // falsy value
          expect(el.name).to.equal('0');
        });
        
        it('should be set synchronously', function() {
          expect(el.name).to.equal('', 'Internal name must be empty');
          
          // we set name to be able to submit the component using a form
          el.name = 'componentName';
          expect(el.hasAttribute('name')).to.equal(true, 'Name is reflected');
          
          expect(el.getAttribute('name')).to.equal('componentName', 'Only one element has the provided name');
          expect(el.name).to.equal('componentName');
        });
        
        it('should not submit a value when the name is not specified even though there is a value', function() {
          var form = document.createElement('form');
          
          // reparents the el
          form.appendChild(el);
          target.appendChild(form);
          
          el.value = options.value;
          expect(el.name).to.equal('');
          expect(el.value).to.equal(options.value);
          
          var values = serializeArray(el.parentNode);
          expect(values.length).to.equal(0);
        });
        
        it('should submit the one single value', function() {
          var form = document.createElement('form');
          
          // reparents the el
          form.appendChild(el);
          target.appendChild(form);
          
          el.name = 'componentName';
          
          if (el._componentTargetProperty === 'checked') {
            // Some formField components use another property than "value" to transmit their state.
            // This is the case of Switch, Radio and Checkbox that used "checked" to indicate their state.
            el.checked = true;
            expect(el.checked).to.equal(true, 'component should now be checked');
          }
          else {
            el.value = options.value;
          }
          
          if (options.value !== '') {
            // we check value immediately to make sure it is set without delay
            expect(serializeArray(form)[0]).to.deep.equal({
              name: 'componentName',
              value: options.value
            });
          }
        });
      });
      
      describe('#required', function() {
        it('should default to false', function() {
          expect(el.required).to.be.false;
          expect(el.hasAttribute('required')).to.equal(false, 'Required is not reflected');
        });
      });
      
      describe('#invalid', function() {
        it('should default to false', function() {
          expect(el.invalid).to.be.false;
          expect(el.hasAttribute('invalid')).to.equal(false, 'Invalid is not reflected');
        });
        
        it('should be settable programmatically', function() {
          el.invalid = true;
          expect(el.invalid).to.equal(true, 'It should respect the set value');
        });
      });
      
      describe('#disabled', function() {
        it('should default to false', function() {
          expect(el.disabled).to.be.false;
          expect(el.hasAttribute('disabled')).to.equal(false, 'Disabled is not reflected');
        });
        
        it('should behave like a boolean value', function() {
          // disables the component
          el.disabled = 'true';
          expect(el.disabled).to.be.true;
          expect(el.hasAttribute('disabled')).to.be.true;
          
          el.disabled = false;
          expect(el.disabled).to.be.false;
          expect(el.hasAttribute('disabled')).to.be.false;
        });
      });
      
      describe('#readOnly', function() {
        it('should default to false', function() {
          expect(el.readOnly).to.be.false;
          expect(el.hasAttribute('readOnly')).to.equal(false, 'ReadOnly is not reflected');
        });
      });
      
      describe('#labelledBy', function() {
        it('should remove labels with empty string', function() {
          var label1 = document.createElement('label');
          
          label1.id = commons.getUID();
          label1.textContent = 'label 1';
          
          target.appendChild(label1);
          
          el.labelledBy = label1.id;
          
          var labelledElement = el._getLabellableElement();
          
          expect(labelledElement.getAttribute('aria-labelledby')).to.contain(label1.id);
          
          if (labelledElement.matches(LABELLABLE_ELEMENTS_SELECTOR)) {
            expect(label1.getAttribute('for')).to.equal(labelledElement.id);
          }
          
          el.labelledBy = '';
          
          expect(labelledElement.hasAttribute('aria-labelledby')).to.be.false;
          expect(label1.hasAttribute('for')).to.be.false;
        });
        
        it('should support multiple labels', function() {
          var label1 = document.createElement('label');
          var label2 = document.createElement('label');
          
          label1.id = commons.getUID();
          label2.id = commons.getUID();
          label1.textContent = 'label 1';
          label2.textContent = 'label 2';
          
          target.appendChild(label1);
          target.appendChild(label2);
          
          var labelledBy = label1.id + ' ' + label2.id;
          el.labelledBy = labelledBy;
          
          var labelledElement = el._getLabellableElement();
          expect(labelledElement.getAttribute('aria-labelledby')).to.contain(labelledBy);
          
          // only while labelling a native element, the for attribute will be added to the labels
          if (labelledElement.matches(LABELLABLE_ELEMENTS_SELECTOR)) {
            expect(label1.getAttribute('for')).to.equal(labelledElement.id);
            expect(label2.getAttribute('for')).to.equal(labelledElement.id);
          }
          
          el.labelledBy = null;
          
          expect(label1.hasAttribute('for')).to.be.false;
          expect(label2.hasAttribute('for')).to.be.false;
          expect(labelledElement.hasAttribute('aria-labelledby')).to.be.false;
        });
      });
      
      describe('#clear()', function() {
        it('should set the valueProperty to the default when called', function() {
          
          var valueProperty = el._componentTargetProperty;
          if (valueProperty === 'checked') {
            // Some formField components use another property than "value" to transmit their state.
            // This is the case of Switch, Radio and Checkbox that used "checked" to indicate their state.
            expect(el.checked).to.equal(false, 'please make sure that your unit test does NOT SET this element to checked by default');
            el.checked = true;
            expect(el.checked).to.equal(true, 'element should now be checked');
          }
          else {
            // we set a valid value into the component
            el.value = options.value;
          }
          
          expect(el.value).to.equal(options.value);
          
          el.clear();
          
          if (el._componentTargetProperty === 'checked') {
            expect(el.checked).to.equal(false, 'should be unchecked again');
          }
          
          expect(el.value).to.equal(options.default, 'Value should be cleared to the default: "' + options.default + '"');
          expect(changeSpy.callCount).to.equal(0, 'Clearing the value does not trigger a change event');
        });
      });
      
      describe('#reset()', function() {
        it('should reset to the initial value when called', function() {
          var valueProperty = el._componentTargetProperty;
          var initialValue = el[valueProperty];
          
          if (valueProperty === 'checked') {
            // Some formField components use another property than "value" to transmit their state.
            // This is the case of Switch, Radio and Checkbox that used "checked" to indicate their state.
            expect(el.checked).to.equal(false, 'please make sure that your unit test DOES NOT set this element to checked');
            el.checked = true;
          }
          else {
            // we set a valid value into the component
            el.value = options.value;
          }
          
          el.reset();
          expect(el[valueProperty]).to.equal(initialValue);
        });
        
        it('should be called when form is reset programmatically', function() {
          var initialValue = el.value;
          
          var form = document.createElement('form');
          
          // reparents the el
          form.appendChild(el);
          target.appendChild(form);
          
          el.value = options.value;
          
          form.reset();
          
          expect(el.value).to.equal(initialValue);
        });
        
        it('should be called when form is reset via reset input', function() {
          var initialValue = el.value;
          
          var form = document.createElement('form');
          
          // reparents the el
          form.appendChild(el);
          target.appendChild(form);
          
          var reset = document.createElement('input');
          reset.type = 'reset';
          form.appendChild(reset);
          
          // we need to wait because wrapping detaches the element
          el.value = options.value;
          
          reset.click();
          
          expect(el.value).to.equal(initialValue, 'Value should reset to the initial value');
          expect(changeSpy.callCount).to.equal(0, 'Clearing the value does not trigger a change event');
        });
      });
    });
    
    describe('Markup', function() {
      describe('#disabled', function() {
        it('should behave like a boolean value', function() {
          // disables the component
          el.disabled = true;
          expect(el.disabled).to.be.true;
          expect(el.hasAttribute('disabled')).to.be.true;
          // removes the disabled attribute
          el.removeAttribute('disabled');
          expect(el.disabled).to.be.false;
          expect(el.hasAttribute('disabled')).to.be.false;
          // setting disabled=""
          el.setAttribute('disabled', '');
          expect(el.disabled).to.be.true;
          expect(el.getAttribute('disabled')).to.equal('');
          // setting disabled="true"
          el.setAttribute('disabled', 'true');
          expect(el.disabled).to.be.true;
          expect(el.getAttribute('disabled')).to.equal('true');
          // setting disabled="false"
          el.setAttribute('disabled', 'false');
          expect(el.disabled).to.be.true;
          expect(el.getAttribute('disabled')).to.equal('false');
          // setting disabled="null"
          el.setAttribute('disabled', null);
          expect(el.disabled).to.be.true;
          expect(el.getAttribute('disabled')).to.equal('null');
        });
      });
      
      describe('#labelledby', function() {
        it('should label component using attribute', function() {
          var label1 = document.createElement('label');
          var label2 = document.createElement('label');
          
          label1.id = commons.getUID();
          label2.id = commons.getUID();
          label1.textContent = 'label 1';
          label2.textContent = 'label 2';
          
          target.appendChild(label1);
          target.appendChild(label2);
          
          var labelledBy = label1.id + ' ' + label2.id;
          el.setAttribute('labelledby', labelledBy);
          
          // internal element that should be labelled
          var labelledElement = el._getLabellableElement();
          
          expect(labelledElement.getAttribute('aria-labelledby')).to.contain(labelledBy);
          
          // only while labelling a native element, the for attribute will be added to the labels
          if (labelledElement.matches(LABELLABLE_ELEMENTS_SELECTOR)) {
            expect(label1.getAttribute('for')).to.equal(labelledElement.id);
            expect(label2.getAttribute('for')).to.equal(labelledElement.id);
          }
          
          el.removeAttribute('labelledby');
          
          expect(label1.hasAttribute('for')).to.be.false;
          expect(label2.hasAttribute('for')).to.be.false;
          expect(labelledElement.hasAttribute('aria-labelledby')).to.be.false;
        });
      });
    });
    
    describe('Events', function() {
      describe('#change', function() {
        it('should not be trigged when setting the value programmatically', function() {
          expect(changeSpy.callCount).to.equal(0);
          
          el.value = options.value;
          expect(changeSpy.callCount).to.equal(0);
          
          el.value = options.default;
          
          expect(changeSpy.callCount).to.equal(0);
        });
        
        it('should trigger a change event when we interact with the internal input', function() {
          // the labellable element should be the one that receives focus and the one that the user interacts with
          var internalInput = el._getLabellableElement();
          
          // in order to keep this test generic enough, we only try this when there is an internal input. we need to check
          // for value in case it is a button
          if (internalInput !== el && 'value' in internalInput && internalInput.type !== 'file') {
            
            internalInput.value = options.value;
            
            event('change', internalInput);
            
            expect(changeSpy.callCount).to.equal(1);
            
            var target = changeSpy.getCall(0).args[0].target;
            if (target.hasAttribute('multiple')) {
              // it the target may have multiple values the new value should be one of them (e.g.: for Autocomplete)
              expect(target.values).to.contain(options.value);
            }
            else {
              expect(target.value).to.equal(options.value);
            }
          }
        });
      });
    });
  });
};

export {serializeArray, testFormField};
