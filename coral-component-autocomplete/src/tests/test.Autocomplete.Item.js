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
import {Autocomplete} from '../../../coral-component-autocomplete';

describe('Autocomplete.Item', function() {
  describe('API', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new Autocomplete.Item());
    });

    afterEach(function() {
      el = null;
    });

    describe('#content', function() {
      it('should default to empty string', function() {
        expect(el.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.innerHTML).to.equal(htmlContent);
      });
    });

    describe('#value', function() {
      it('should default empty string', function() {
        expect(el.value).to.equal('');
        expect(el.hasAttribute('value')).to.be.false;
      });

      it('should default to the content', function() {
        el.content.innerHTML = 'My Content';

        expect(el.content.innerHTML).to.equal('My Content');
        expect(el.value).to.equal('My Content');
        
        expect(el.hasAttribute('value')).to.be.false;
      });

      it('should keep maximum 1 space from the content', function() {
        el.content.innerHTML = 'Two    Words';

        expect(el.content.innerHTML).to.equal('Two    Words');
        expect(el.value).to.equal('Two Words');
      });

      it('should remove the html from the value', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.value).to.equal('Highlighted text');
      });

      it('should convert the value to string', function() {
        el.value = 9.5;

        expect(el.value).to.equal('9.5');
        expect(el.getAttribute('value')).to.equal('9.5');
      });

      it('should reflect the value', function() {
        el.value = 'ch';
        expect(el.getAttribute('value')).to.equal('ch');
      });
    });

    describe('#selected', function() {
      it('should be not be selected by default', function() {
        expect(el.selected).to.be.false;
        expect(el.hasAttribute('selected')).to.be.false;
      });

      it('should be settable', function() {
        el.selected = true;

        expect(el.selected).to.be.true;
        expect(el.hasAttribute('selected')).to.be.true;
      });

      it('should accept truthy', function() {
        el.selected = 1;

        expect(el.selected).to.be.true;
        expect(el.hasAttribute('selected')).to.be.true;
      });
    });
  
    describe('#disabled', function() {
      it('should be false by default', function() {
        expect(el.disabled).to.be.false;
      });
    
      it('should be reflected', function() {
        el.disabled = true;
      
        expect(el.disabled).to.be.true;
        expect(el.hasAttribute('disabled')).to.be.true;
      });
    });
  });

  describe('Markup', function() {

    describe('#content', function() {
      it('should have content set to innerHTML if property not provided', function() {
        const el = helpers.build(window.__html__['Autocomplete.Item.base.html']);
        
        expect(el.content.innerHTML).to.equal('Switzerland');
        expect(el.value).to.equal('Switzerland');
      });

      it('should support HTML content', function() {
        const el = helpers.build(window.__html__['Autocomplete.Item.full.html']);
        
        expect(el.content.innerHTML).to.equal('<em>Switzerland</em>');
        expect(el.innerHTML).to.equal('<em>Switzerland</em>');
        expect(el.value).to.equal('ch');
      });
    });

    // @todo: it can remove the attribute and goes back to default
    describe('#value', function() {
      it('should set the value from markup', function() {
        const el = helpers.build(window.__html__['Autocomplete.Item.full.html']);
        
        expect(el.value).to.equal('ch');
      });

      it('should default to the content', function() {
        const el = helpers.build(window.__html__['Autocomplete.Item.base.html']);
        
        expect(el.value).to.equal('Switzerland');
        expect(el.hasAttribute('value')).to.be.false;
      });
    });
  });

  describe('Events', function() {
    var el;
  
    beforeEach(function() {
      el = new Autocomplete.Item();
    });
  
    afterEach(function() {
      el = null;
    });
    
    describe('#coral-autocomplete-item:_contentchanged', function() {
      it('should trigger when changing the content', function(done) {
        const spy = sinon.spy();
  
        el.on('coral-autocomplete-item:_contentchanged', spy);
        el.content.textContent = 'text';
  
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
  
    describe('#coral-autocomplete-item:_valuechanged', function() {
      it('should trigger when changing the value', function() {
        const spy = sinon.spy();
  
        el.on('coral-autocomplete-item:_valuechanged', spy);
        el.value = 'text';
        
        expect(spy.callCount).to.equal(1);
      });
    });
  
    describe('#coral-autocomplete-item:_selectedchanged', function() {
      it('should trigger when changing the selection', function() {
        const spy = sinon.spy();
    
        el.on('coral-autocomplete-item:_selectedchanged', spy);
        el.selected = true;
    
        expect(spy.callCount).to.equal(1);
      });
    });
  });
});
