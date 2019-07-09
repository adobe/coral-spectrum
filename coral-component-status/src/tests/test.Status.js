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
import {Status} from '../../../coral-component-status';

describe('Status', function() {
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible via clone using markup',
      window.__html__['Status.base.html']
    );
    
    helpers.cloneComponent(
      'should be possible via clone using markup with variant',
      window.__html__['Status.variant.html']
    );
    
    helpers.cloneComponent(
      'should be possible via clone using js',
      new Status()
    );
  });
  
  describe('API', function() {
    let el;
    
    beforeEach(function() {
      el = new Status();
    });
    
    afterEach(function() {
      el = null;
    });
  
    describe('#label', function() {
      it('should return a coral-status-label content zone', function() {
        expect(el.label.tagName).to.equal('CORAL-STATUS-LABEL');
      });
    });
    
    describe('#variant', function() {
      it('should be set to "neutral" by default', function() {
        expect(el.variant).to.equal(Status.variant.NEUTRAL);
      });
      
      it('should only accept values from variant enum', function() {
        el.variant = 'info';
        expect(el.variant).to.equal(Status.variant.INFO);
        el.variant = 'warning';
        expect(el.variant).to.equal(Status.variant.WARNING);
        el.variant = '';
        expect(el.variant).to.equal(Status.variant.NEUTRAL);
      });
    });
  
    describe('#color', function() {
      it('should be set to "default" by default', function() {
        expect(el.color).to.equal(Status.color.DEFAULT);
      });
    
      it('should only accept values from color enum', function() {
        el.color = 'seafoam';
        expect(el.color).to.equal(Status.color.SEA_FOAM);
        el.color = 'magenta';
        expect(el.color).to.equal(Status.color.MAGENTA);
        el.color = 'red';
        expect(el.color).to.equal(Status.color.DEFAULT);
      });
    });
    
    describe('#disabled', function() {
      it('should be false by default', function() {
        expect(el.disabled).to.be.false;
      });
      
      it('should set disabled to true', function() {
        el.disabled = true;
        expect(el.disabled).to.equal(true);
      });
    });
  });
  
  describe('Markup', function() {
    describe('#label', function() {
      it('should set the label', function() {
        const el = helpers.build(window.__html__['Status.label.html']);
        expect(el.label.textContent).to.equal('Label');
      });
    });
    
    describe('#variant', function() {
      it('should set the variant', function() {
        const el = helpers.build(window.__html__['Status.variant.html']);
        expect(el.getAttribute('variant')).to.equal(Status.variant.ERROR);
        expect(el.variant).to.equal(Status.variant.ERROR);
      });
  
      it('should reflect the variant', function() {
        const el = helpers.build(window.__html__['Status.variant.html']);
        el.variant = 'success';
        expect(el.getAttribute('variant')).to.equal('success');
      });
      
      it('should map to the right classnames', function() {
        const el = helpers.build(window.__html__['Status.variant.html']);
        expect(el.classList.contains('_coral-StatusLight--info')).to.be.false;
        expect(el.classList.contains('_coral-StatusLight--negative')).to.be.true;
  
        el.variant = 'info';
        expect(el.classList.contains('_coral-StatusLight--negative')).to.be.false;
        expect(el.classList.contains('_coral-StatusLight--info')).to.be.true;
      });
    });
  
    describe('#color', function() {
      it('should set the color', function() {
        const el = helpers.build(window.__html__['Status.color.html']);
        expect(el.getAttribute('color')).to.equal(Status.color.SEA_FOAM);
        expect(el.color).to.equal(Status.color.SEA_FOAM);
      });
  
      it('should reflect the color', function() {
        const el = helpers.build(window.__html__['Status.color.html']);
        el.color = 'magenta';
        expect(el.getAttribute('color')).to.equal('magenta');
      });
  
      it('should map to the right classnames', function() {
        const el = helpers.build(window.__html__['Status.color.html']);
        expect(el.classList.contains('_coral-StatusLight--magenta')).to.be.false;
        expect(el.classList.contains('_coral-StatusLight--seafoam')).to.be.true;
    
        el.color = 'magenta';
        expect(el.classList.contains('_coral-StatusLight--seafoam')).to.be.false;
        expect(el.classList.contains('_coral-StatusLight--magenta')).to.be.true;
      });
    });
    
    describe('#disabled', function() {
      it('should set disabled', function() {
        const el = helpers.build(window.__html__['Status.disabled.html']);
        expect(el.disabled).to.be.true;
      });
      
      it('should reflect disabled', function() {
        const el = helpers.build(window.__html__['Status.base.html']);
        
        el.disabled = true;
        expect(el.hasAttribute('disabled')).to.be.true;
        expect(el.getAttribute('aria-disabled')).to.equal('true');
  
        el.disabled = false;
        expect(el.hasAttribute('disabled')).to.be.false;
        expect(el.getAttribute('aria-disabled')).to.equal('false');
      });
    });
  });
});
