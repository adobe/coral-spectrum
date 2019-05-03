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
import {ComponentMixin} from '../../../coral-mixin-component';
import {FormFieldMixin} from '../../../coral-mixin-formfield';
import {commons, transform} from '../../../coral-utils';

describe('mixin._formField', function() {
  // Dummy custom element
  class Element extends FormFieldMixin(ComponentMixin(HTMLElement)) {
    constructor() {
      super();
      
      this._delegateEvents(this._events);
      
      this._elements = {
        input: document.createElement('input')
      };
    }
    
    get disabled() {
      return this._elements.input.disabled;
    }
    set disabled(value) {
      this._elements.input.disabled = transform.booleanAttr(value);
      this._reflectAttribute('disabled', this.disabled);
    }
    
    get required() {
      return this._elements.input.required;
    }
    set required(value) {
      this._elements.input.required = transform.booleanAttr(value);
      this._reflectAttribute('required', this.required);
    }
    
    get readOnly() {
      return this._elements.input.readOnly;
    }
    set readOnly(value) {
      this._elements.input.readOnly = transform.booleanAttr(value);
      this._reflectAttribute('readonly', this.readOnly);
    }
    
    get name() {
      return this._elements.input.name;
    }
    set name(value) {
      this._elements.input.name = value;
      this._reflectAttribute('name', this.name);
    }
    
    get value() {
      return this._elements.input.value;
    }
    set value(value) {
      this._elements.input.value = value;
    }
    
    connectedCallback() {
      super.connectedCallback();
      
      this.appendChild(this._elements.input);
    }
  }
  
  window.customElements.define('coral-formfield-element', Element);
  
  describe('API', function() {
    let el;
    
    beforeEach(function() {
      el = document.createElement('coral-formfield-element');
    });
    
    afterEach(function() {
      el = null;
    });
    
    ['name', 'value', 'disabled', 'required', 'readOnly', 'invalid', 'labelledBy'].forEach((prop) => {
  
      const value = ['name', 'value', 'labelledBy'].indexOf(prop) !== -1 ? 'test' : true;
      
      describe(`#${prop}`, function() {
        it('should set by property', function() {
          el[prop] = value;
          expect(el[prop]).to.equal(value);
          
          if (prop !== 'invalid' && prop !== 'labelledBy') {
            expect(el._elements.input[prop]).to.equal(value);
          }
        });
    
        it('should set by attribute', function() {
          el.setAttribute(prop, value);
          expect(el[prop]).to.equal(value);
  
          if (prop !== 'invalid' && prop !== 'labelledBy') {
            expect(el._elements.input[prop]).to.equal(value);
          }
        });
    
        if (prop !== 'value' && prop !== 'labelledBy') {
          it('should be reflected', function() {
            el[prop] = value;
            
            if (typeof value === 'string') {
              expect(el.getAttribute([prop])).to.equal(value);
            }
            else {
              expect(el.hasAttribute([prop])).to.be.true;
            }
          });
        }
      });
    });
    
    describe('#labelledBy', function() {
      it('should remove old for assignments', function() {
        const label = document.createElement('label');
        const example = document.createElement('coral-formfield-element');
    
        label.id = commons.getUID();
        label.textContent = 'label';
    
        helpers.target.appendChild(label);
        helpers.target.appendChild(example);
        
        example.labelledBy = label.id;
    
        expect(label.getAttribute('for')).to.equal(example._elements.input.id);
        expect(example._elements.input.getAttribute('aria-labelledby')).to.equal(label.id);
      });
    });
    
    describe('#invalid', function() {
      it('should set class and aria', function() {
        el.invalid = true;
        expect(el.getAttribute('aria-invalid')).to.equal('true');
        expect(el.classList.contains('is-invalid')).to.be.true;
      });
    });
    
    describe('#clear', function() {
      it('should set the input to empty string', function() {
        el.value = 'test';
        el.clear();
        
        expect(el.value).to.equal('');
      });
    });
    
    describe('#reset', function() {
      it('should reset to empty string', function() {
        el.value = 'test';
        el.reset();
  
        expect(el.value).to.equal('');
      });
      
      it('should reset to value attribute', function() {
        el.setAttribute('value', 'test');
        
        el.value = 'test2';
        el.reset();
  
        expect(el.value).to.equal('test');
      });
    });
  });
  
  describe('Events', function() {
    describe('#change', function() {
      it('should fire change when input triggers change', function() {
        const spy = sinon.spy();
        const el = document.createElement('coral-formfield-element');
        
        helpers.target.appendChild(el);
        
        el.on('change', spy);
    
        el._elements.input.value = 1;
  
        expect(spy.callCount).to.equal(0);
        
        helpers.event('change', el._elements.input);
    
        expect(spy.callCount).to.equal(1);
      });
    });
  });
  
  describe('Implementation Details', function() {
    helpers.testFormField('<coral-formfield-element></coral-formfield-element>', {
      value: 'testValue'
    });
  });
});
