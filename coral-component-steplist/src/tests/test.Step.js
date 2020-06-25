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
import {Step, StepList} from '../../../coral-component-steplist';

describe('Step', function() {
  var el;
  var item;
  var item1;
  var item2;

  beforeEach(function(done) {
    el = new StepList();
    el.interaction = StepList.interaction.ON;

    // Not added to StepList
    item = new Step();
    
    item1 = new Step();
    el.appendChild(item1);
    item2 = new Step();
    el.appendChild(item2);
    
    // Wait for MO
    helpers.next(() => {
      done();
    })
  });

  afterEach(function() {
    el = item = item1 = item2 = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Step).to.have.property('Label');
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      '<coral-step></coral-step>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Step()
    );
  });

  describe('API', function() {
    describe('#label', function() {

      it('should default to empty string', function() {
        expect(item.label.textContent).to.equal('');
      });

      it('should be settable', function() {
        item.label.innerHTML = 'Item 1';
        expect(item.label.innerHTML).to.equal('Item 1');
      });
    });

    describe('#selected', function() {
      it('should default to false', function() {
        expect(item.selected).to.be.false;
        expect(item.hasAttribute('tabindex')).to.be.false;
        expect(item._elements.link.hasAttribute('role')).to.be.false;
        expect(item._elements.link.hasAttribute('tabindex')).to.be.false;
        expect(item._elements.link.hasAttribute('aria-current')).to.be.false;
      });

      it('should be settable to truthy', function() {
        item1.selected = true;
        
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;
        expect(item1.classList.contains('is-selected')).to.be.true;
        expect(item1.hasAttribute('tabindex')).to.be.false;
        expect(item1._elements.link.getAttribute('role')).to.equal('link');
        expect(item1._elements.link.getAttribute('tabindex')).to.equal('0');
        expect(item1._elements.link.getAttribute('aria-current')).to.equal('step');
      });
    });

    describe('#labelled', function() {
      it('should default to empty string', function() {
        expect(item.labelled).to.equal('');
      });

      it('should be settable', function(done) {
        item.labelled = 'Item 1';
        helpers.next(function() {
          expect(item._elements.stepMarkerContainer.getAttribute('aria-label')).to.equal(item.labelled);
          expect(item._elements.stepMarkerContainer.hasAttribute('aria-hidden')).to.be.false;
          item.labelled = null;
          helpers.next(function() {
            expect(item._elements.stepMarkerContainer.hasAttribute('aria-label')).to.be.false;
            expect(item._elements.stepMarkerContainer.getAttribute('aria-hidden')).to.equal('true');
            done();
          });
        });
      });
    });
  });

  describe('Implementation Details', function() {
    it('tabindex should be removed when StepList interaction is OFF', function() {
      expect(item1.hasAttribute('tabindex')).to.be.false;
      expect(item1._elements.link.getAttribute('role')).to.equal('link');
      expect(item1._elements.link.getAttribute('tabindex')).to.equal('0');
      expect(item1._elements.link.getAttribute('aria-current')).to.equal('step');

      el.interaction = StepList.interaction.OFF;
      
      expect(item1._elements.link.hasAttribute('role')).to.be.false;
      expect(item1._elements.link.hasAttribute('tabindex')).to.be.false;
      expect(item1._elements.link.getAttribute('aria-current')).to.equal('step');
    });
  });
});
