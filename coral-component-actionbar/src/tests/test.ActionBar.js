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
import {ActionBar} from '../../../coral-component-actionbar';
import {Button} from '../../../coral-component-button';

describe('ActionBar', function() {

  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone via markup',
      window.__html__['ActionBar.base.html']
    );
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new ActionBar());
    });

    afterEach(function() {
      el = null;
    });

    it('should initialize ActionBar left wrapper with right default values', function() {
      expect(el.primary.items.length).to.equal(0);
      expect(el.primary.threshold).to.equal(-1);
      expect(el.primary.moreButtonText).to.equal('');
    });

    it('should initialize ActionBar right wrapper with right default values', function() {
      expect(el.secondary.items.length).to.equal(0);
      expect(el.secondary.threshold).to.equal(-1);
      expect(el.secondary.moreButtonText).to.equal('');
    });

    it('should create action bar items by default (wrapped in actionbar-items)', function() {
      var wrapperEl = el.primary.items.add({});
      var item = wrapperEl.appendChild(new Button());

      expect(el.primary.items.length).to.equal(1);
      expect(wrapperEl.tagName.toLowerCase()).to.equal('coral-actionbar-item');
      expect(item.tagName.toLowerCase()).to.equal('button');
      expect(item.getAttribute('is')).to.equal('coral-button');
    });

    it('should be possible to set the more button text', function() {
      el.primary.moreButtonText = ':)';
      expect(el.primary.moreButtonText).to.equal(':)');
      expect(el.primary._elements.moreButton.label.innerHTML).to.equal(':)');
    });

    it('should be possible to add ActionBarItems to the ActionBar (it uses the normal collection API)', function() {
      el.primary.items.add({});
      expect(el.primary.items.length).to.equal(1);
    });

    it('should be possible to remove ActionBarItems from the ActionBar (it uses the normal collection API)', function() {
      var item = el.primary.items.add({});
      expect(el.primary.items.length).to.equal(1);
      el.primary.items.remove(item);
      expect(el.primary.items.length).to.equal(0);
    });

    it('should be possible to set the threshold on left/right wrappers => invisible items are moved offscreen', function() {
      //make sure only one item is visible in each wrapper => move others to popovers
      el.primary.threshold = 1;
      el.secondary.threshold = 1;

      //add two left floating item
      el.primary.items.add({}).appendChild(new Button());
      el.primary.items.add({}).appendChild(new Button());

      //add two right floating item
      el.secondary.items.add({}).appendChild(new Button());
      el.secondary.items.add({}).appendChild(new Button());
      
      expect(el.primary.items.getAll().length).to.equal(2);
      expect(el.secondary.items.getAll().length).to.equal(2);

      //one item on the left/right side should be hidden
      expect(el.primary.querySelectorAll('[coral-actionbar-offscreen]').length).to.equal(1);
      expect(el.secondary.querySelectorAll('[coral-actionbar-offscreen]').length).to.equal(1);
    });
  });

  describe('Markup', function() {
    it('should have right classes set', function() {
      const bar = helpers.build(window.__html__['ActionBar.empty.html']);
      expect(bar.classList.contains('_coral-ActionBar')).to.be.true;
    });

    it('should generate the matching content zones', function() {
      const bar = helpers.build(window.__html__['ActionBar.empty.html']);
      expect(bar.primary).to.exist;
      expect(bar.secondary).to.exist;
    });

    it('should have right tagname set', function() {
      const bar = helpers.build(window.__html__['ActionBar.empty.html']);
      expect(bar.tagName.toLowerCase()).to.equal('coral-actionbar');
    });

    it('should generate 2 popovers that are hidden by default', function() {
      const bar = helpers.build(window.__html__['ActionBar.empty.html']);
      expect(bar.querySelectorAll('coral-popover').length).to.equal(2);
    });

    it('should generate 2 more buttons that are "hidden" (offscreen) by default', function() {
      const bar = helpers.build(window.__html__['ActionBar.empty.html']);
      
      var leftButton = bar.primary.querySelectorAll('button[is="coral-button"][coral-actionbar-more]');
      var rightButton = bar.secondary.querySelectorAll('button[is="coral-button"][coral-actionbar-more]');

      expect(leftButton.length).to.equal(1);
      expect(rightButton.length).to.equal(1);

      //test that both more buttons are offscreen by default (offscreen in order to still calc their width)
      expect(rightButton[0].hasAttribute('coral-actionbar-offscreen')).to.be.true;
      expect(leftButton[0].hasAttribute('coral-actionbar-offscreen')).to.be.true;
    });

    it('should be possible to instantiate a complex actionbar using markup', function() {
      const bar = helpers.build(window.__html__['ActionBar.base.html']);
      
      expect(bar.primary.threshold).to.equal(1);
      expect(bar.secondary.threshold).to.equal(2);

      expect(bar.primary.moreButtonText).to.equal('More Left');
      expect(bar.secondary.moreButtonText).to.equal('More Right');

      expect(bar.primary.items.length).to.equal(4);
      expect(bar.secondary.items.length).to.equal(11);

      // some items should have been moved off screen
      expect(bar.primary.items._getAllOffScreen().length).to.equal(3);
      expect(bar.secondary.items._getAllOffScreen().length).to.equal(9);
    });

    it('should be possible to instantiate a actionbar without wrapper components using markup', function() {
      const bar = helpers.build(window.__html__['ActionBar.containers.none.html']);
      
      expect(bar.primary.threshold).to.equal(-1);
      expect(bar.secondary.threshold).to.equal(-1);

      expect(bar.primary.moreButtonText).to.equal('');
      expect(bar.secondary.moreButtonText).to.equal('');

      // all items should be automatically moved to the left container
      expect(bar.primary.items.length).to.equal(4);
      expect(bar.secondary.items.length).to.equal(0);
    });

    describe('#coral-actionbar-container', function() {
      it('should generate the matching content zones with all containers', function() {
        const bar = helpers.build(window.__html__['ActionBar.container.multiple.html']);
        
        expect(bar.primary).to.exist;
        expect(bar.primary.tagName).to.equal('CORAL-ACTIONBAR-PRIMARY');
        expect(bar.secondary).to.exist;
        expect(bar.secondary.tagName).to.equal('CORAL-ACTIONBAR-SECONDARY');
      });

      it('should generate the matching content zones with one container', function() {
        const bar = helpers.build(window.__html__['ActionBar.container.single.html']);
        
        expect(bar.primary).to.exist;
        expect(bar.primary.tagName).to.equal('CORAL-ACTIONBAR-PRIMARY');
        expect(bar.secondary).to.exist;
        expect(bar.secondary.tagName).to.equal('CORAL-ACTIONBAR-SECONDARY');
      });

      it('should copy the container configurations to the new container', function() {
        const el = helpers.build(window.__html__['ActionBar.containers.legacy.html']);

        expect(el.primary.threshold).to.equal(1);
        expect(el.primary.moreButtonText).to.equal('More Left');
        expect(el.secondary.threshold).to.equal(2);
        expect(el.secondary.moreButtonText).to.equal('More Right');
      });

      it('should copy content into new container', function() {
        const bar = helpers.build(window.__html__['ActionBar.container.content.html']);
        
        var content = bar.primary.querySelector('span');
        expect(content.tagName).to.equal('SPAN');
        expect(content.textContent).to.equal('TextContent');
      });

      it('should copy over existing items', function() {
        const el = helpers.build(window.__html__['ActionBar.containers.legacy.html']);

        expect(el.primary.items.length).to.equal(4, 'primary should have 4 items');
        expect(el.secondary.items.length).to.equal(11, 'secondary should have 11 items');
      });
    });
  });

  describe('Events', function() {});

  describe('User Interaction', function() {
    
    it('should keyboard navigation to jump from current selected actionbar item to next visible actionbar item', function() {
      const bar = helpers.build(window.__html__['ActionBar.base.html']);
    
      var leftItems = bar.primary.items.getAll();
      var firstButton = leftItems[0].querySelector('button');
  
      // focus first item on left side to start keyboard navi
      leftItems[0].querySelector('button').focus();
  
      expect(document.activeElement).to.equal(firstButton, 'first button in actionbar should be active');
  
      // if I trigger one keyright next item (or a more button) should be selected (simulate press)
      bar._onFocusNextItem({
        preventDefault: function() {},
        target: document.activeElement.parentNode
      });
  
      // as on left side only one item should be visible threshold === 1 => next item will be the left 'more' button
      expect(document.activeElement).to.equal(bar.primary._elements.moreButton, 'left more should now be active');
      
      // if I trigger one keyright next item (or a more button) should be selected (simulate press)
      bar._onFocusNextItem({
        preventDefault: function() {},
        target: document.activeElement
      });
  
      // arrow key navigation should be restricted to current wrapper
      expect(document.activeElement).to.equal(bar.primary._elements.moreButton, 'left more should still be active');
  
      // For security reasons, we can't test a TAB key press.
  
      // focus the first element in the secondary wrapper
      bar.secondary._elements.moreButton.focus();
  
      // if I trigger one keyleft previous item (or a more button) should be selected (simulate press)
      bar._onFocusPreviousItem({
        preventDefault: function() {},
        target: document.activeElement
      });
  
      // arrow key navigation should be restricted to current wrapper
      expect(document.activeElement).to.equal(bar.secondary._elements.moreButton, 'right more should be active');
    });

    it('should open a popover on click on "more" button (only one "more" popover should be open at once)', function() {
      const bar = helpers.build(window.__html__['ActionBar.base.html']);
      expect(bar.primary._elements.overlay.open).to.equal(false, 'left popover should be closed by default');
      expect(bar.secondary._elements.overlay.open).to.equal(false, 'right popover should be closed by default');

      // click on left more should open a popover
      bar.primary._elements.moreButton.click();
      
      expect(bar.primary._elements.overlay.open).to.equal(true, 'left popover should now be open');
      expect(bar.secondary._elements.overlay.open).to.equal(false, 'right popover should still be closed');
  
      // click on right more should open another popover (and close the other one)
      bar.secondary._elements.moreButton.click();
  
      expect(bar.primary._elements.overlay.open).to.equal(false, 'left popover should now be closed again');
      expect(bar.secondary._elements.overlay.open).to.equal(true, 'right popover should now be open');
    });
  
    it('should open a popover on click on "more" button without throwing an exception if all items are disabled', function() {
      const bar = helpers.build(window.__html__['ActionBar.disabled.html']);
      
      expect(bar.primary._elements.overlay.open).to.equal(false, 'left popover should be closed by default');
      expect(bar.secondary._elements.overlay.open).to.equal(false, 'right popover should be closed by default');
  
      // click on left more should open a popover
      bar.primary._elements.moreButton.click(); // used to break as exception was thrown ...
  
      expect(bar.primary._elements.overlay.open).to.equal(true, 'left popover should now be open');
      expect(bar.secondary._elements.overlay.open).to.equal(false, 'right popover should still be closed');
    });

    it('should close a popover on click outside of popover', function() {
      const bar = helpers.build(window.__html__['ActionBar.base.html']);
      // open left popover
      bar.primary._elements.overlay.open = true;
  
      expect(bar.primary._elements.overlay.open).to.equal(true, 'left popover should be open');
  
      // click outside of popover should close it
      document.body.click();
  
      expect(bar.primary._elements.overlay.open).to.equal(false, 'left popover should now be closed again');
    });

    // @flaky
    it.skip('should be possible to make two bars that switch', function(done) {
      helpers.build(window.__html__['ActionBar.visibility.html']);

      var bar1 = document.getElementById('switchBar1');
      var bar2 = document.getElementById('switchBar2');
      
      bar1._wait = 0;
      bar2._wait = 0;

      // all items of bar1 should be visible (as there should be enough space)
      expect(bar1.primary.items.length).to.equal(7, 'bar1 should have 7 items on left side');
      expect(bar1.secondary.items.length).to.equal(3, 'bar1 should have 3 items on right side');
      expect(bar1.primary.items._getAllOffScreen().length).to.equal(0, 'all left items of bar1 should be visible');
      expect(bar1.secondary.items._getAllOffScreen().length).to.equal(0, 'all right items of bar1 should be visible');

      // all items of bar2 should be offscreen (as there should be no space)
      expect(bar2.primary.items.length).to.equal(1, 'bar2 should have 1 items on left side');
      expect(bar2.secondary.items.length).to.equal(0, 'bar2 should have 0 items on right side');
      expect(bar2.primary.items._getAllOffScreen().length).to.equal(1, 'all items of bar2 should be offscreen');
      
      // now hide bar1 and show bar2
      bar1.hidden = true;
      bar2.hidden = false;
      
      // Wait for resize listener
      window.setTimeout(() => {
        expect(bar1.hidden).to.be.true;
        expect(bar2.hidden).to.be.false;
  
        // items of bar1 should be moved offscreen
        expect(bar1.primary.items._getAllOffScreen().length).to.equal(7, 'all left items of bar1 should be offscreen now');
        expect(bar1.secondary.items._getAllOffScreen().length).to.equal(3, 'all right items of bar1 should be offscreen now');
        
        // all items of bar2 should be visible now
        expect(bar2.primary.items._getAllOffScreen().length).to.equal(0, 'all left items of bar2 should be visible now');
        
        done();
      }, 100);
    });
  
    it('should allow tab navigation to jump between left side and right side of the actionbar all items in between do not have a tabindex', function() {
      const bar = helpers.build(window.__html__['ActionBar.base.html']);
    
      expect(document.activeElement.tagName.toLowerCase()).to.not.equal('button', 'activeElement should not be an one of the buttons inside the actionbar');
    
      var leftActionBarItems = bar.primary.items.getAll();
      var rightActionBarItems = bar.secondary.items.getAll();
    
      // simulate a tab press on first item in actionbar simply by setting focus as I can't trigger a real one ..
      var firstButton = leftActionBarItems[0].querySelector('button');
      firstButton.focus();
    
      expect(document.activeElement).to.equal(firstButton, 'activeElement should now be the first wrapped item (here button) inside the actionbar');
      expect(document.activeElement.getAttribute('tabindex')).to.not.equal('-1', 'this element should be tabbable');
      expect(bar.primary._elements.moreButton.getAttribute('tabindex')).to.equal('-1', 'more should not be tabbable');
    
      var i;
      for (i = 1; i < leftActionBarItems.length; i++) {
        expect(leftActionBarItems[i].querySelector('button').getAttribute('tabindex')).to.equal('-1', 'all other items should not be tabbable("' + i + '" failed"');
      }
    
      // in this case the right more button should be tabbable and no item on the right side
      expect(bar.secondary._elements.moreButton.getAttribute('tabindex')).to.not.equal('-1', 'more should be tabbable');
      for (i = 0; i < rightActionBarItems.length; i++) {
        expect(rightActionBarItems[i].querySelector('button').getAttribute('tabindex')).to.equal('-1', 'all other items should not be tabbable("' + i + '" failed"');
      }
    });
  
    it('should support hidden actions and find the first tabbable item for both left side and right side of the actionbar', function() {
      const bar = helpers.build(window.__html__['ActionBar.hidden.html']);
      
      const primaryItems = bar.primary.items.getAll();
      const secondaryItems = bar.secondary.items.getAll();
      
      const firstLeftTabbableItem = bar.querySelector('coral-actionbar-item:not([hidden]) button:not([tabindex="-1"])');
      const firstRightTabbableItem = bar.querySelector('coral-actionbar-item:not([hidden]) a:not([tabindex="-1"])');
      
      expect(firstLeftTabbableItem.closest('coral-actionbar-item')).to.equal(primaryItems[1]);
      expect(firstRightTabbableItem.closest('coral-actionbar-item')).to.equal(secondaryItems[1]);
      
      primaryItems.forEach((item) => {
        if (item !== firstLeftTabbableItem) {
          expect(item.querySelector('button').getAttribute('tabindex') === '-1');
        }
      });
  
      secondaryItems.forEach((item) => {
        if (item !== firstRightTabbableItem) {
          expect(item.querySelector('a').getAttribute('tabindex') === '-1');
        }
      });
    });
  });

  describe('Implementation Details', function() {
    var el;

    beforeEach(function() {
      el = new ActionBar();

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    it('should move "invisible" items into popovers once popovers are opened and moved back once popover is closed', function(done) {
      el._wait = 0;
      el.primary.threshold = 1;

      // create 2 items. 1 should not fit on screen and therefore be hidden
      el.primary.items.add({}).appendChild(new Button());
      el.primary.items.add({}).appendChild(new Button());
  
      // there should be no items in popover so far
      expect(el.primary._itemsInPopover.length).to.equal(0);
      
      // Wait for resize listener and MO
      window.setTimeout(function() {
        el.primary._elements.overlay.open = true;
  
        el.primary._elements.overlay.on('coral-overlay:open', function() {
          // there should now be some items in the popover
          expect(el.primary._itemsInPopover.length === 1).to.be.true;
  
          // you should still be able to get all items over the Collection Api (also the ones in the popover)
          expect(el.primary.items.getAll().length).to.equal(2);
  
          // close the popover => all items should be moved back from popover
          el.primary._elements.overlay.open = false;
        });
  
        el.primary._elements.overlay.on('coral-overlay:close', function() {
          // there should be no items in popover
          expect(el.primary._itemsInPopover.length).to.equal(0);
  
          done();
        });
      }, 200);
    });

    it('should move items offscreen, if there is not enough space available at screen', function(done) {
      el._wait = 0;
      el.primary.threshold = 1;
  
      // create 2 items. 1 should not fit on screen and therefore be hidden
      el.primary.items.add({}).appendChild(new Button());
      el.primary.items.add({}).appendChild(new Button());
      
      // Wait for resize listener and MO
      window.setTimeout(() => {
        expect(el.primary.items.getAll().length).to.equal(2);
        expect(el.secondary.items.getAll().length).to.equal(0);
  
        // 1 item should be hidden
        expect(el.primary.items._getAllOffScreen().length === 1).to.be.true;
        expect(el.secondary.items._getAllOffScreen().length).to.equal(0);
        
        done();
      }, 100);
    });
    
    it('should copy button items attributes including classes', (done) => {
      el._wait = 0;
      el.primary.threshold = 1;
  
      const button1 = new Button();
      const button2 = new Button();
      
      button2.classList.add('custom');
      button2.dataset.custom = 'custom';
      
      el.primary.items.add({}).appendChild(button1);
      el.primary.items.add({}).appendChild(button2);
  
      // Wait for resize listener and MO
      window.setTimeout(() => {
        el.primary._elements.moreButton.click();
  
        // 2nd item is hidden and only visible in more overlay
        const hiddenButton = el.primary._elements.buttonList.items.first();
        expect(hiddenButton.classList.contains('custom')).to.be.true;
        expect(hiddenButton.dataset.custom).to.equal('custom');
        done();
      }, 100);
    });

    it('should not move items to popover, that are hidden on purpose', function(done) {
      el._wait = 0;
      el.primary.threshold = 1;

      el.primary.items.add({});
      el.primary.items.add({});
      el.primary.items.add({
        hidden: true
      });
      el.primary.items.add({
        hidden: true
      });
  
      // Wait for resize listener and MO
      window.setTimeout(() => {
        expect(el.primary.items.getAll().length).to.equal(4);
  
        //only one item on the left side should be hidden
        expect(el.primary.items._getAllOffScreen().length).to.equal(1);
        
        done();
      }, 100);
    });

    it('should be possible to add items straight after init without messing up the order... (more button used to go to the wrong place)', function() {
      el._wait = 0;
      
      var leftItem1 = el.primary.items.add({});
      leftItem1.appendChild(new Button());

      var leftItem2 = el.primary.items.add({});
      leftItem2.appendChild(new Button());

      var rightItem1 = el.secondary.items.add({});
      rightItem1.appendChild(new Button());

      var rightItem2 = el.secondary.items.add({});
      rightItem2.appendChild(new Button());
  
      var primaryButton = el.primary._elements.moreButton;
      var secondaryButton = el.secondary._elements.moreButton;
      
      var leftItemIndex1 = Array.prototype.indexOf.call(leftItem1.parentNode.children, leftItem1);
      var leftItemIndex2 = Array.prototype.indexOf.call(leftItem2.parentNode.children, leftItem2);
      var rightItemIndex1 = Array.prototype.indexOf.call(rightItem1.parentNode.children, rightItem1);
      var rightItemIndex2 = Array.prototype.indexOf.call(rightItem2.parentNode.children, rightItem2);
      var primaryButtonIndex = Array.prototype.indexOf.call(primaryButton.parentNode.children, primaryButton);
      var secondaryButtonIndex = Array.prototype.indexOf.call(secondaryButton.parentNode.children, secondaryButton);
      
      //assert that the order of element in dom is correct (once more button is in dom)
      expect(leftItemIndex1 < leftItemIndex2 < primaryButtonIndex).to.be.true;
      expect(secondaryButtonIndex < rightItemIndex1 < rightItemIndex2).to.be.true;
    });

    // @flaky
    it.skip('should be possible to create an actionbar that is initially hidden (one of its parents is display:none)', function(done) {
      var outer = document.createElement('div');
      outer.style.display = 'none';

      el = new ActionBar();
      el._wait = 0;
      outer.appendChild(el);

      el.primary.items.add({}).appendChild(new Button());

      helpers.target.appendChild(outer);
    
      // show outer
      outer.style.display = 'inherit';
      
      // Wait for resize listener
      window.setTimeout(() => {
        // there should be no items offscreen
        expect(el.primary.items._getAllOffScreen().length).to.equal(0);
  
        done();
      }, 100);
    });
  
    describe('Smart Overlay', () => {
      helpers.testSmartOverlay('coral-actionbar-primary');
      helpers.testSmartOverlay('coral-actionbar-secondary');
      helpers.testSmartOverlay('coral-actionbar-container');
    });
  });
});
