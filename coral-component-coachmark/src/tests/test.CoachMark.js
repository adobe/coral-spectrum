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
import {CoachMark} from '../../../coral-component-coachmark';

describe('CoachMark', function () {
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new CoachMark());
      expect(el.className).to.equal('_coral-CoachMarkIndicator');
      expect(el.querySelectorAll('._coral-CoachMarkIndicator-ring').length).to.equal(3);
    });

    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['CoachMark.default.html']
    );

    helpers.cloneComponent(
      'should be possible to clone the element with a variant',
      window.__html__['CoachMark.variant.html']
    );

    helpers.cloneComponent(
      'should be possible to clone the element with a size',
      window.__html__['CoachMark.size.html']
    );
    
    // todo
    // helpers.cloneComponent(
    //   'should be possible to clone using js',
    //   new CoachMark()
    // );
  });
  
  describe('API', function() {
    let el = null;
  
    beforeEach(function() {
      el = new CoachMark();
    });
  
    afterEach(function() {
      el = null;
    });
    
    describe('#target', function() {
      it('should default to null', function() {
        expect(el.target).to.equal(null);
      });
    });
  
    describe('#variant', function() {
      it('should default to variant.DEFAULT', function() {
        expect(el.variant).to.equal(CoachMark.variant.DEFAULT);
        expect(el.classList.contains('_coral-CoachMarkIndicator--light')).to.be.false;
        expect(el.classList.contains('_coral-CoachMarkIndicator--dark')).to.be.false;
      });
      
      it('should be settable', function() {
        el.variant = CoachMark.variant.LIGHT;
        expect(el.variant).to.equal(CoachMark.variant.LIGHT);
        expect(el.getAttribute('variant')).to.equal(CoachMark.variant.LIGHT);
        expect(el.classList.contains('_coral-CoachMarkIndicator--light')).to.be.true;
        expect(el.classList.contains('_coral-CoachMarkIndicator--dark')).to.be.false;
  
        el.variant = CoachMark.variant.DARK;
        expect(el.variant).to.equal(CoachMark.variant.DARK);
        expect(el.getAttribute('variant')).to.equal(CoachMark.variant.DARK);
        expect(el.classList.contains('_coral-CoachMarkIndicator--light')).to.be.false;
        expect(el.classList.contains('_coral-CoachMarkIndicator--dark')).to.be.true;
      });
    });
  
    describe('#size', function() {
      it('should default to size.MEDIUM', function() {
        expect(el.size).to.equal(CoachMark.size.MEDIUM);
        expect(el.classList.contains('_coral-CoachMarkIndicator--quiet')).to.be.false;
      });
  
      it('should be settable', function() {
        el.size = CoachMark.size.SMALL;
        expect(el.size).to.equal(CoachMark.size.SMALL);
        expect(el.getAttribute('size')).to.equal(CoachMark.size.SMALL);
        expect(el.classList.contains('_coral-CoachMarkIndicator--quiet')).to.be.true;
      });
    });
  });
  
  describe('Markup', function() {
    describe('#target', function() {
      it('should be settable using a string', function(done) {
        const wrapper = helpers.build(window.__html__['CoachMark.target.html']);
        const el = wrapper.querySelector('coral-coachmark');
        expect(el.target).to.equal('#target');
        
        requestAnimationFrame(() => {
          // Implies it was positioned based on the defined target
          expect(wrapper.querySelector('coral-coachmark')._popper).to.not.equal(undefined);
          done();
        });
      });
      
      it('should be settable using a node', function(done) {
        const el = helpers.build(window.__html__['CoachMark.default.html']);
        const target = document.createElement('div');
        helpers.target.appendChild(target);
        el.target = target;
        expect(el.target).to.equal(target);
        requestAnimationFrame(() => {
          // Implies it was positioned based on the defined target
          expect(el._popper).to.not.equal(undefined);
          done();
        });
      });
    });
    
    describe('#variant', function() {
      it('should be settable per attribute', function() {
        const el = helpers.build(window.__html__['CoachMark.variant.html']);
        expect(el.variant).to.equal(CoachMark.variant.LIGHT);
      });
    });
  
    describe('#size', function() {
      it('should be settable per attribute', function() {
        const el = helpers.build(window.__html__['CoachMark.size.html']);
        expect(el.size).to.equal(CoachMark.size.SMALL);
      });
    });
  });
});
