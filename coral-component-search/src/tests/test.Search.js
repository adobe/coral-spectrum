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
import {Search} from '../../../coral-component-search';
import {Textfield} from '../../../coral-component-textfield';

describe('Search', function() {
  function testInstance(instance) {
    expect(instance.classList.contains('_coral-Search')).to.be.true;
    expect(instance._elements.input).to.exist;
    expect(instance.getAttribute('icon')).to.equal('search');
    expect(instance.hasAttribute('disabled')).to.be.false;
    expect(instance.hasAttribute('invalid')).to.be.false;
    expect(instance.hasAttribute('name')).to.be.false;
    expect(instance.hasAttribute('required')).to.be.false;
    expect(instance.hasAttribute('placeholder')).to.be.false;
    expect(instance.hasAttribute('value')).to.be.false;
  }
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var ni = helpers.build(new Search());
      testInstance(ni);
    });

    it('should be possible using createElement', function() {
      var ni = helpers.build(document.createElement('coral-search'));
      testInstance(ni);
    });

    it('should be possible using markup', function() {
      var ni = helpers.build(window.__html__['Search.html']);
      testInstance(ni);
    });
  
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['Search.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Search()
    );
  });

  describe('API', function() {
    var el;
    beforeEach(function() {
      el = new Search();
    });

    afterEach(function() {
      el = null;
    });

    describe('#icon', function() {
      it('should default to "search"', function() {
        expect(el.icon).to.equal('search');
      });

      it('should set icon', function() {
        el.icon = 'launch';
        expect(el.icon).to.equal('launch');
      });
    });

    describe('#variant', function() {
      it('should default to "default', function() {
        expect(el.variant).to.equal(Search.variant.DEFAULT);
        expect(el._elements.input.variant).to.equal(Search.variant.DEFAULT);
      });

      it('should set the variant', function() {
        el.variant = Search.variant.QUIET;
        expect(el.variant).to.be.equal(Search.variant.QUIET);
        expect(el._elements.input.variant).to.equal(Search.variant.QUIET);
      });

      // this test should fail in case the variant values of the textfield stop matching the ones that the search has
      it('should match the internal variant values', function() {
        expect(Search.variant.QUIET).to.equal(Textfield.variant.QUIET);
        expect(Search.variant.DEFAULT).to.equal(Textfield.variant.DEFAULT);
      });
    });
  
    describe('#maxlength', function() {
      it('should return maxlength from the input', function() {
        expect(el.maxLength).to.equal(-1);
        expect(el.hasAttribute('maxlength')).to.be.false;
      });
      
      it('should set field maxlength to 10', function() {
        el.maxLength = 10;
        expect(el._elements.input.getAttribute('maxlength')).to.equal('10');
        expect(el.getAttribute('maxlength')).to.equal('10');
      });
    });
  });

  describe('clearInput', function() {
    it('should clear text value', function() {
      var instance = helpers.build(new Search());
      instance._elements.input.value = 'dummy text';
      instance._clearInput();
      expect(instance._elements.input.value).to.equal('');
    });
    
    it('should hide the clear button on clear()', () => {
      const el = helpers.build(new Search());
      el.value = 'dummy text';
      expect(el._elements.clearButton.style.display).to.equal('');
      el.clear();
      expect(el._elements.clearButton.style.display).to.equal('none');
    });
  
    it('should hide the clear button on reset()', () => {
      const el = helpers.build(new Search());
      el.value = 'dummy text';
      expect(el._elements.clearButton.style.display).to.equal('');
      el.reset();
      expect(el._elements.clearButton.style.display).to.equal('none');
    });
  
    it('should hide the clear button on setting empty string value', () => {
      const el = helpers.build(new Search());
      el.value = 'dummy text';
      expect(el._elements.clearButton.style.display).to.equal('');
      el.value = '';
      expect(el._elements.clearButton.style.display).to.equal('none');
    });
  });
  
  it('should submit the one single value', function() {
    var el = new Search();
    // we wrap first the select
    var form = document.createElement('form');
    form.appendChild(el);
    helpers.target.appendChild(form);
    
    el.name = 'search';
    el._elements.input.value = 'dummy text';
    
    expect(helpers.serializeArray(form)).to.deep.equal([{
      name: 'search',
      value: 'dummy text'
    }]);
  });
});
