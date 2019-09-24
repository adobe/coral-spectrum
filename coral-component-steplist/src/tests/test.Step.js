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

      it('should be a content zone', function() {
        expect(item.label instanceof Step.Label).to.be.true;
      });

      it('should be settable', function() {
        item.label.innerHTML = 'Item 1';
        expect(item.label.innerHTML).to.equal('Item 1');
      });
    });

    describe('#selected', function() {
      it('should default to false', function() {
        expect(item.selected).to.be.false;
        expect(item.tabIndex).to.equal(-1);
      });

      it('should be settable to truthy', function() {
        item1.selected = true;
        
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;
        expect(item1.classList.contains('is-selected')).to.be.true;
        expect(item1.tabIndex).to.equal(0);
      });
    });
  });

  describe('Implementation Details', function() {
    it('tabindex should be removed when StepList interaction is OFF', function() {
      el.interaction = StepList.interaction.OFF;
      
      expect(item1.hasAttribute('tabindex')).to.be.false;
    });
  });
});
