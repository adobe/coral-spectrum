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
import {Tooltip} from '../../../coral-component-tooltip';

describe('Tooltip', function() {
  describe('Namespace', function() {
    it('should be defined in Coral namespace', function() {
      expect(Tooltip).to.have.property('Content');
    });
  
    it('should have correct default property values', function() {
      var tooltip = helpers.build(new Tooltip());
      helpers.target.appendChild(tooltip);
    
      expect(tooltip.variant).to.equal('default');
      expect(tooltip.delay).to.equal(500);
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      '<coral-tooltip></coral-tooltip>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Tooltip()
    );
  });

  describe('API', function() {
    
    describe('#content', function() {
      it('should set content', function() {
        var tooltip = helpers.build(new Tooltip());
        tooltip.content.innerHTML = 'Test';
        
        expect(tooltip.textContent).to.equal('Test');
      });
    });
    
    describe('#open', function() {
      it('should open when target element is focused', function() {
        var target = helpers.overlay.createFloatingTarget();
    
        var tooltip = new Tooltip().set({
          content: {
            textContent: 'A tooltip'
          },
          target: target,
          placement: 'top',
          delay: 0
        });
        helpers.target.appendChild(tooltip);
    
        expect(tooltip.open).to.equal(false, 'tooltip closed initially');
    
        helpers.mouseEvent('mouseenter', target);
        
        expect(tooltip.open).to.equal(true, 'tooltip open after focusing on target');
      });
  
      it('should not display the tooltip until the specified delay', function() {
        var target = helpers.overlay.createFloatingTarget();
    
        var tooltip = new Tooltip().set({
          target: target,
          placement: 'top',
          delay: 0
        });
        helpers.target.appendChild(tooltip);
    
        expect(tooltip.open).to.be.false;
    
        // trigger twice to check that timeout is cleared.
        helpers.mouseEvent('mouseenter', target);
        helpers.mouseEvent('mouseenter', target);
        expect(tooltip.open).to.be.true;
      });
    });
    
    describe('#target', function() {
      it('should remove and add target listeners when target changed', function() {
        var target = helpers.overlay.createStaticTarget();
    
        var tooltip = new Tooltip().set({
          content: {
            textContent: 'A tooltip'
          },
          placement: 'left',
          delay: 0
        });
        helpers.target.appendChild(tooltip);
    
        // Point at the old target
        tooltip.target = target;
    
        expect(tooltip.open).to.equal(false, 'tooltip closed initially');
    
        // Show via focus
        helpers.mouseEvent('mouseenter', target);
    
        expect(tooltip.open).to.equal(true, 'tooltip open after focusing on target');
    
        tooltip.hide();
    
        expect(tooltip.open).to.equal(false, 'tooltip closed after hide() called');
    
        // Set new target
        var newTarget = helpers.overlay.createStaticTarget();
        tooltip.target = newTarget;
    
        // Try to show via focus on the old target
        helpers.mouseEvent('mouseenter', target);
    
        expect(tooltip.open).to.equal(false, 'tooltip stays closed after clicking old target after target changed');
    
        // Show by focusing on the new target
        helpers.mouseEvent('mouseenter', newTarget);
    
        expect(tooltip.open).to.equal(true, 'tooltip open after clicking new target');
      });
  
      it('should be hidden when focusout triggered on the target element', function(done) {
        var target = helpers.overlay.createFloatingTarget();
    
        var tooltip = new Tooltip().set({
          target: target,
          placement: 'top',
          delay: 0
        });
        helpers.target.appendChild(tooltip);
    
        expect(tooltip.open).to.be.false;
    
        tooltip.show();

        expect(tooltip.open).to.be.true;
  
        helpers.mouseEvent('mouseleave', target);

        helpers.next(function() {
          expect(tooltip.open).to.be.false;
          done();
        });
      });
  
      it('should clear any remaining timeouts when focusout triggered on the target element', function(done) {
        var target = helpers.overlay.createFloatingTarget();
    
        var tooltip = new Tooltip().set({
          target: target,
          placement: 'top',
          delay: 0
        });
        helpers.target.appendChild(tooltip);
    
        expect(tooltip.open).to.be.false;
    
        tooltip.on('coral-overlay:open', function() {
          expect(tooltip.open).to.be.true;
          helpers.mouseEvent('mouseenter', target);
          helpers.mouseEvent('mouseleave', target);
        });
  
        tooltip.on('coral-overlay:close', function() {
          expect(tooltip.open).to.be.false;
          done();
        });
        
        tooltip.show();
      });
    });
    
    describe('#interaction', function() {
      it('should not open on target mouseenter when interaction="off"', function() {
        var target = helpers.overlay.createFloatingTarget();
    
        var tooltip = new Tooltip().set({
          content: {
            textContent: 'A tooltip'
          },
          target: target,
          placement: 'top',
          interaction: 'off',
          delay: 0
        });
        helpers.target.appendChild(tooltip);
    
        expect(tooltip.open).to.equal(false, 'tooltip closed initially');
  
        helpers.mouseEvent('mouseenter', target);
        
        expect(tooltip.open).to.equal(false, 'tooltip still closed after mouseenter on target');
      });
    });
  
    it('should not open on target mouseenter when interaction="off"', function() {
      var target = helpers.overlay.createFloatingTarget();
    
      var tooltip = new Tooltip().set({
        content: {
          textContent: 'A tooltip'
        },
        target: target,
        placement: 'top',
        interaction: 'on',
        delay: 0
      });
      helpers.target.appendChild(tooltip);
    
      expect(tooltip.open).to.equal(false, 'tooltip closed initially');
  
      helpers.mouseEvent('mouseenter', target);
      
      expect(tooltip.open).to.equal(true, 'tooltip open after mouseenter on target');
    
      tooltip.open = false;
      tooltip.interaction = 'off';
  
      helpers.mouseEvent('mouseenter', target);
      
      expect(tooltip.open).to.equal(false, 'tooltip still closed after mouseenter on target');
    });
  });
  
  describe('Implementation Details', function() {
    it('should handle slide in animation', (done) => {
      const target = helpers.overlay.createFloatingTarget();
  
      const el = new Tooltip().set({
        content: {
          textContent: 'A tooltip'
        },
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(el);
      
      el.setAttribute('x-placement', 'top');
      el._onAnimate();
      expect(el.style.top).to.equal('8px');
      el.on('coral-overlay:open', () => {
        expect(el.style.top).to.equal('0px');
        done();
      });
      
      helpers.mouseEvent('mouseenter', target);
    });
    
    it('should support multiple tooltips on the same target', function() {
      var target = helpers.overlay.createFloatingTarget();
    
      var tooltipTop = new Tooltip().set({
        content: {
          textContent: 'A tooltip'
        },
        target: target,
        placement: 'top',
        delay: 0
      });
      helpers.target.appendChild(tooltipTop);
    
      var tooltipBottom = new Tooltip().set({
        content: {
          textContent: 'Another tooltip'
        },
        target: target,
        placement: 'bottom',
        delay: 0
      });
      helpers.target.appendChild(tooltipBottom);
    
      expect(tooltipTop.open).to.equal(false, 'tooltipTop closed initially');
      expect(tooltipBottom.open).to.equal(false, 'tooltipBottom closed initially');
  
      helpers.mouseEvent('mouseenter', target);
      
      expect(tooltipTop.open).to.equal(true, 'tooltipTop open after focusing on target');
      expect(tooltipBottom.open).to.equal(true, 'tooltipBottom open after focusing on target');
    });
  
    it('should not set the tabindex attribute on a target element which already has a tabindex attribute', function() {
      var target = helpers.overlay.createFloatingTarget();
      target.setAttribute('tabindex', 1);
    
      var tooltip = new Tooltip().set({
        target: target,
        variant: 'success'
      });
      helpers.target.appendChild(tooltip);
    
      expect(target.getAttribute('tabindex')).to.equal('1');
    });
    
    it('should hide the tip if no target defined', function() {
      var tooltip = new Tooltip();
      helpers.target.appendChild(tooltip);
      
      expect(tooltip.target).to.equal(null);
      expect(tooltip._elements.tip.hidden).to.be.true;
  
      var target = helpers.overlay.createFloatingTarget();
      tooltip.target = target;
      tooltip.open = true;
  
      expect(tooltip.target).to.equal(target);
      expect(tooltip._elements.tip.hidden).to.be.false;
    });
  });
});
