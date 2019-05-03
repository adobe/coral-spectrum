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

describe('mixin._component', function() {
  // Dummy custom element
  class Element extends ComponentMixin(HTMLElement) {
    constructor() {
      super();
      
      this._elements = {
        content: this.querySelector('x-element-content') || document.createElement('x-element-content')
      };
      
      this._delegateEvents({
        'click': '_onClick',
        'capture:click x-element-content': '_onClickCapture',
        'global:capture:click x-element-content': '_onGlobalClick'
      });
      
      this._observer = new MutationObserver(function() {
        this.trigger('x-attribute');
      }.bind(this));
      
      this._observer.observe(this, {
        attributes: true,
        attributeFilter: ['testattribute']
      });
    }
    
    get testAttribute() {
      return this._testAttribute;
    }
    set testAttribute(value) {
      this._testAttribute = value;
      this._reflectAttribute('testattribute', value);
    }
    
    get content() {
      return this._getContentZone(this._elements.content);
    }
    set content(value) {
      this._setContentZone('content', value, {
        handle: 'content',
        tagName: 'x-element-content',
        insert: function(content) {
          this.appendChild(content);
        }
      });
    }
    
    get _contentZones() {return {'x-element-content': 'content'};}
    
    static get observedAttributes() {
      return [
        'testattribute',
        'testAttribute',
      ];
    }
    
    _onClick() {
      this.trigger('x-click');
    }
    
    _onClickCapture(event) {
      this.trigger('x-capture-click', {
        currentTarget: event.currentTarget,
        eventPhase: event.eventPhase
      })
    }
    
    _onGlobalClick(event) {
      this.trigger('x-global-click', {
        currentTarget: event.currentTarget,
        eventPhase: event.eventPhase
      });
    }
    
    connectedCallback() {
      super.connectedCallback();
      
      this.content = this._elements.content;
    }
  }
  
  window.customElements.define('x-element', Element);
  
  before(function() {
    window.Coral = window.Coral || {};
    window.Coral.Element = Element;
  });
  
  after(function() {
    window.Coral.Element = undefined;
  });
  
  describe('API', function() {
    let el;
    
    beforeEach(function() {
      el = document.createElement('x-element');
    });
    
    afterEach(function() {
      el = null;
    });
    
    describe('#_attributes', function() {
      it('should return the properties/attribute map', function() {
        expect(el._attributes).to.deep.equal({testattribute: 'testAttribute'});
      });
    });
    
    describe('#_reflectAttribute()', function() {
      it('should reflect the attribute when setting the property', function() {
        el.testAttribute = true;
        expect(el.hasAttribute('testattribute')).to.be.true;
      });
  
      it('should reflect the attribute value when setting the property', function() {
        el.testAttribute = 'test';
        expect(el.getAttribute('testattribute')).to.equal('test');
      });
      
      it('should prevent same multiple attribute reflection', function(done) {
        const spy = sinon.spy();
        el.on('x-attribute', spy);
        el.testAttribute = 'test';
        
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
      
      it('should prevent reflection if attribute is already set', function(done) {
        const spy = sinon.spy();
        el.on('x-attribute', spy);
        el.setAttribute('testattribute', 'test');
  
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
      
      it('should be possible to set the attribute by using the property name', function() {
        el.setAttribute('testAttribute', 'test');
        expect(el.testAttribute).to.equal('test');
        expect(el.getAttribute('testattribute')).to.equal('test');
      });
    });
    
    describe('#_delegateEvents()', function() {
      it('should trigger component registered events', function() {
        const spy = sinon.spy();
        el.on('x-click', spy);
        
        helpers.event('click', el);
        
        expect(spy.callCount).to.equal(1);
      });
  
      it('should support listening to events in the capture phase', function(done) {
        el.on('x-capture-click', function(event) {
          expect(event.detail.currentTarget).to.equal(el);
          expect(event.detail.eventPhase).to.equal(Event.CAPTURING_PHASE);
          
          done();
        });
        
        helpers.target.appendChild(el);
        
        el.content.click();
      });
  
      it('should support listening to global events in the capture phase', function(done) {
        el.on('x-global-click', function(event) {
          expect(event.detail.currentTarget).to.equal(window);
          expect(event.detail.eventPhase).to.equal(Event.CAPTURING_PHASE);
    
          done();
        });
  
        helpers.target.appendChild(el);
  
        el.content.click();
      });
  
      it('should support listening to window events only when attached', function(done) {
        const spy = sinon.spy();
        el.on('x-global-click', spy);
  
        el.content.click();
        
        helpers.next(function() {
          expect(spy.callCount).to.equal(0);
          
          helpers.target.appendChild(el);
          
          el.content.click();
  
          expect(spy.callCount).to.equal(1);
  
          helpers.target.removeChild(el);
  
          el.content.click();
  
          expect(spy.callCount).to.equal(1);
          
          done();
        });
      });
    });
  
    describe('#_getContentZone()', function() {
      it('should return the content zone', function() {
        expect(el.content).to.equal(el._elements.content);
        expect(el.content.tagName.toLowerCase()).to.equal('x-element-content');
      });
  
      it('should return null if no content zone', function() {
        helpers.target.appendChild(el);
        el.content.remove();
        expect(el.content).to.equal(null);
      });
    });
    
    describe('#_setContentZone()', function() {
      it('should insert the content zone once the element is connected', function() {
        helpers.target.appendChild(el);
        expect(el.content).to.equal(el.querySelector('x-element-content'));
      });
  
      it('should allow setting values on content zones via object notation', function() {
        helpers.target.appendChild(el);
        el.set({
          content: {
            innerHTML: 'text'
          }
        });
    
        expect(el.content.tagName.toLowerCase()).to.equal('x-element-content');
        expect(el.content.innerHTML).to.equal('text');
      });
  
      it('should set content zone elements via object notation', function() {
        const newContent = document.createElement('x-element-content');
        newContent.innerHTML = 'text';
    
        el.set({
          content: newContent
        });
    
        expect(el.content.innerHTML).to.equal('text');
      });
  
      it('should set content zone elements with content = HTMLElement', function() {
        const newContent = document.createElement('x-element-content');
        newContent.innerHTML = 'text';
    
        el.content = newContent;
    
        expect(el.content.innerHTML).to.equal('text');
      });
  
      it('should allow setting the content zone to null', function() {
        el.content = null;
    
        expect(el.content).to.equal(null);
  
        helpers.target.appendChild(el);
  
        expect(el.content).to.equal(null);
        expect(el.querySelector('x-element-content')).to.equal(null);
      });
      
      it('should set content zone in virtual dom', function(done) {
        const content = el.content;
        const newContent = document.createElement('x-element-content');
        newContent.innerHTML = 'text';
        
        el.appendChild(newContent);
  
        // Wait for content zone MO
        helpers.next(() => {
          expect(el.contains(content)).to.be.false;
          expect(el.contains(newContent)).to.be.true;
          expect(el.content.innerHTML).to.equal('text');
          expect(el.content._contentZoned).to.be.true;
          done();
        });
      });
    });
  
    describe('#toString()', function() {
      it('should return the right value for toString()', function() {
        expect(el.toString()).to.equal('Coral.Element');
      });
    });
    
    describe('#on', function() {
      it('should support on()', function() {
        const spy = sinon.spy();
        el.on('click', spy);
        
        helpers.event('click', el);
        
        expect(spy.callCount).to.equal(1);
      });
    });
    
    describe('#off', function() {
      it('should support off()', function() {
        const spy = sinon.spy();
        el.on('click', spy);
        el.off('click');
    
        helpers.event('click', el);
    
        expect(spy.callCount).to.equal(0);
      });
    });
    
    describe('#trigger', function() {
      it('should support trigger()', function() {
        const spy = sinon.spy();
        el.on('click', spy);
    
        el.trigger('click');
    
        expect(spy.callCount).to.equal(1);
      });
    });
  
    describe('#show()', function() {
      it('should change hidden state', function() {
        el.hidden = true;
        el.show();
        
        expect(el.hidden).to.be.false;
      });
    });
  
    describe('#hide()', function() {
      it('should change hidden state', function() {
        el.hidden = false;
      
        el.hide();
        expect(el.hidden).to.be.true;
      });
    });
    
    describe('#set', function() {
      it('should support setting a property', function() {
        el.set('testAttribute', 'test');
        expect(el.testAttribute).to.equal('test');
      });
    });
    
    describe('#get', function() {
      it('should support getting a property', function() {
        el.set('testAttribute', 'test');
        expect(el.get('testAttribute')).to.equal('test');
      });
    });
  });
});
