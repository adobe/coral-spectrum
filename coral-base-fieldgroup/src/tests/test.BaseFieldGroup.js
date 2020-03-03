/**
 * Copyright 2020 Adobe. All rights reserved.
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
import {BaseComponent} from '../../../coral-base-component';
import {BaseFieldGroup} from '../../../coral-base-fieldgroup';

describe('BaseFieldGroup', function() {
  // Dummy custom element
  class FieldGroup extends BaseFieldGroup(BaseComponent(HTMLElement)) {
    get _itemTagName() {
      // Used for Collection
      return 'coral-fieldgroup-item';
    }
  }
  
  window.customElements.define('coral-fieldgroup', FieldGroup);
  
  describe('API', function() {
    let el;
    
    beforeEach(function() {
      el = new FieldGroup();
    });
    
    afterEach(function() {
      el = null;
    });
    
    describe('#orientation', function() {
      it('should default to horizontal', () => {
        expect(el.orientation).to.equal(FieldGroup.orientation.HORIZONTAL);
      });
      
      it('should support vertical orientation', () => {
        el.orientation = FieldGroup.orientation.VERTICAL;
        expect(el.orientation).to.equal(FieldGroup.orientation.VERTICAL);
        expect(el.getAttribute('orientation')).to.equal('vertical');
        expect(el.classList.contains('coral-RadioGroup--vertical')).to.be.true;
      });
    });
  
    describe('#items', function() {
      it('should be readonly', function() {
        const items = el.items;
        try {
          el.items = '';
        }
        catch (e) {
          expect(el.items).to.equal(items);
        }
      });

      it('should retrieve all items', function() {
        el.appendChild(document.createElement('coral-fieldgroup-item'));
        el.appendChild(document.createElement('coral-fieldgroup-item'));
  
        expect(el.items.length).to.equal(2);
        expect(el.items.length).to.equal(el.querySelectorAll('coral-fieldgroup-item').length);
      });
    });
  
    describe('#selectedItem', function() {
      it('should return selected item', () => {
        el.appendChild(document.createElement('coral-fieldgroup-item'));
        el.appendChild(document.createElement('coral-fieldgroup-item'));
  
        el.items.last().setAttribute('checked');
        expect(el.selectedItem).to.equal(el.items.last());
      });
    });
  });
  
  describe('Markup', () => {
    describe('#orientation', () => {
      it('should default to horizontal', () => {
        const el = helpers.build('<coral-fieldgroup></coral-fieldgroup>');
        expect(el.orientation).to.equal(FieldGroup.orientation.HORIZONTAL);
        expect(el.getAttribute('orientation')).to.equal('horizontal');
      });
  
      it('should support vertical orientation', () => {
        const el = helpers.build('<coral-fieldgroup></coral-fieldgroup>');
        el.setAttribute('orientation', 'vertical');
        expect(el.orientation).to.equal(FieldGroup.orientation.VERTICAL);
        expect(el.getAttribute('orientation')).to.equal('vertical');
        expect(el.classList.contains('coral-RadioGroup--vertical')).to.be.true;
      });
    });
  });
  
  describe('Accessibility', function() {
    it('should have role group', () => {
      const el = helpers.build(document.createElement('coral-fieldgroup'));
      expect(el.getAttribute('role')).to.equal('group');
    });
  });
});
