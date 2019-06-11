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

import {tracking} from '../../../coral-utils';
import {helpers} from '../../../coral-utils/src/tests/helpers';
import {QuickActions} from '../../../coral-component-quickactions';
import {Button} from '../../../coral-component-button';
import {AnchorButton} from '../../../coral-component-anchorbutton';
import {ButtonList, AnchorList} from '../../../coral-component-list';

describe('QuickActions', function() {
  var BUTTON_SELECTOR = '._coral-QuickActions-item:not([handle="moreButton"])';

  var itemObject = {
    icon: 'copy',
    content: {
      textContent: 'Copy'
    }
  };
  var itemObject1 = {
    icon: 'paste',
    content: {
      textContent: 'Paste'
    }
  };

  describe('Namespace', function() {
    
    it('should expose the interaction in an enum', function() {
      expect(QuickActions).to.have.property('interaction');
      expect(QuickActions.interaction.ON).to.equal('on');
      expect(QuickActions.interaction.OFF).to.equal('off');
      expect(Object.keys(QuickActions.interaction).length).to.equal(2);
    });

    it('should expose the placement in an enum', function() {
      expect(QuickActions).to.have.property('placement');
      expect(QuickActions.placement.TOP).to.equal('top');
      expect(QuickActions.placement.CENTER).to.equal('center');
      expect(QuickActions.placement.BOTTOM).to.equal('bottom');
      expect(Object.keys(QuickActions.placement).length).to.equal(3);
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['QuickActions.empty.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new QuickActions()
    );
  });

  describe('API', function() {
    var el;
    var targetElement;

    beforeEach(function() {
      // Create the QuickActions
      el = helpers.build(new QuickActions());

      // Create the target element
      targetElement = helpers.overlay.createStaticTarget();

      // Set the tabIndex so that we can focus the target
      targetElement.tabIndex = 0;

      // Set the targets
      el.target = targetElement;
    });

    afterEach(function() {
      el = targetElement = null;
    });

    describe('#threshold', function() {
      it('should default to 4', function() {
        expect(el.threshold).to.equal(4);
      });
    });

    describe('#interaction', function() {
      it('should default to on', function() {
        expect(el.interaction).to.equal(QuickActions.interaction.ON);
      });
    });

    describe('#offset', function() {
      it('should default to 10', function() {
        expect(el.offset).to.equal(10);
      });
    });

    describe('#alignMy', function() {
      it('should default to "center top"', function() {
        expect(el.alignMy).to.equal('center top');
      });
    });

    describe('#alignAt', function() {
      it('should default to "center top"', function() {
        expect(el.alignAt).to.equal('center top');
      });
    });

    describe('#items', function() {
      it('should be possible to add/remove items via Collection API', function() {
        var items = el.items.getAll();
        expect(items.length).to.equal(0, 'quickActions initially have no items');

        var item = el.items.add(itemObject);
        items = el.items.getAll();
        expect(items.length).to.equal(1, 'quickActions have a single item after add');

        el.items.remove(item);
        items = el.items.getAll();
        expect(items.length).to.equal(0, 'quickActions have no items after remove');
      });
    });

    describe('#target', function() {});
    describe('#placement', function() {});
  });

  describe('Markup', function() {
    var targetElement;

    beforeEach(function() {
      // Create the target element
      targetElement = helpers.overlay.createStaticTarget();

      // Set the tabIndex so that we can focus the target
      targetElement.tabIndex = 0;
    });

    afterEach(function() {
      targetElement = null;
    });

    describe('#items', function() {
      it('should sync buttons and buttonList when items are added/removed via Collection API', function(done) {
        const el = helpers.build(window.__html__['QuickActions.open.html']);
        el.target = targetElement;
        var buttonListItems = el._elements.buttonList.items.getAll();
        var buttons = el.querySelectorAll(BUTTON_SELECTOR);

        expect(buttonListItems.length).to.equal(4, 'buttonList initially has four items');
        expect(buttons.length).to.equal(4, 'four buttons initially');

        // Add a couple more items
        el.items.add(itemObject);
        el.items.add(itemObject1);

        // Wait for MO
        helpers.next(function() {
          buttonListItems = el._elements.buttonList.items.getAll();
          buttons = Array.prototype.slice.call(el.querySelectorAll(BUTTON_SELECTOR));
          expect(buttons.length).to.equal(6, 'buttonList has six items after we have added some more');
          expect(buttonListItems.length).to.equal(6, 'six buttons after we have added some more');
          buttons.forEach(function(item) {
            expect(item instanceof Button).to.be.true;
          });
          buttonListItems.forEach(function(item) {
            expect(item instanceof ButtonList.Item).to.be.true;
          });
          done();
        });
      });

      it('should support anchorButtons and anchorButtonList items', function(done) {
        const el = helpers.build(window.__html__['QuickActions.type.html']);
        el.target = targetElement;
        // we need to open it to force the creation of the internal elements
        el.open = true;

        // Wait until opened
        helpers.next(function() {
          var anchorButtonListItems = el._elements.buttonList.items.getAll();
          var anchorButtons = Array.prototype.slice.call(el.querySelectorAll(BUTTON_SELECTOR));
          
          expect(anchorButtons.length).to.equal(4, 'anchorButtonList has six items after we have added some more');
          expect(anchorButtonListItems.length).to.equal(4, 'six anchorButtons after we have added some more');
          anchorButtons.forEach(function(item) {
            expect(item instanceof AnchorButton).to.be.true;
            expect(item.getAttribute('href')).to.equal('#');
          });
          anchorButtonListItems.forEach(function(item) {
            expect(item instanceof AnchorList.Item).to.be.true;
            expect(item.getAttribute('href')).to.equal('#');
          });
          done();
        });
      });
    });
    
    describe('#focus', function() {
      it('should move the focus inside the component', function(done) {
        const el = helpers.build(window.__html__['QuickActions.base.html']);
        el.on('coral-overlay:open', function() {
          expect(document.activeElement).not.to.equal(el);
        
          var buttons = el.querySelectorAll(BUTTON_SELECTOR);
          // we focus the component
          el.focus();
        
          // expect(el.contains(document.activeElement)).to.equal()
          expect(document.activeElement).to.equal(buttons[0], 'The first button should be focused');
          done();
        });
      
        el.show();
      });
  
      it('should not shift focus if already inside the component', function(done) {
        const el = helpers.build(window.__html__['QuickActions.base.html']);
        el.on('coral-overlay:open', function() {
          expect(el.contains(document.activeElement)).to.equal(true, 'Focus should be inside the component');
        
          var buttons = el.querySelectorAll(BUTTON_SELECTOR);
          // we move focus to the 3rd item
          buttons[3].focus();
        
          // we focus the component
          el.focus();
          expect(document.activeElement).to.equal(buttons[3], 'Focus should not be moved');
        
          done();
        });
      
        el.show();
      });
  
      it('should not focus the component if not shown', function() {
        const el = helpers.build(window.__html__['QuickActions.base.html']);
        expect(document.activeElement).not.to.equal(el);
      
        // we focus the component
        el.focus();
      
        expect(el.contains(document.activeElement)).to.equal(false, 'Should not change the focus');
      });
    });
  });

  describe('Events', function() {
    var targetElement;

    beforeEach(function() {
      // Create the target element
      targetElement = helpers.overlay.createStaticTarget();

      // Set the tabIndex so that we can focus the target
      targetElement.tabIndex = 0;
    });

    afterEach(function() {
      targetElement = null;
    });

    it('should trigger click event when an item is selected by clicking a button', function() {
      const el = helpers.build(window.__html__['QuickActions.open.html']);
      el.target = targetElement;
      var spy = sinon.spy();

      el.on('click', function(event) {
        expect(event.target.textContent).to.equal('Copy');
        spy.call(spy, this.arguments);
      });

      // Click the button
      var button = el.querySelector(BUTTON_SELECTOR);
      button.click();
      
      expect(spy.callCount).to.equal(1, 'spy called once after clicking item');
    });

    it('should trigger click event when an item is selected by clicking a ButtonList item', function() {
      const el = helpers.build(window.__html__['QuickActions.open.html']);
      el.target = targetElement;
      var spy = sinon.spy();

      el.on('click', function(event) {
        expect(event.target.textContent).to.equal('Copy');
        spy.call(spy, this.arguments);
      });

      // Click the ButtonList item
      var buttonListItem = el._elements.buttonList.items.first();
      buttonListItem.click();
    
      expect(spy.callCount).to.equal(1, 'spy called once after clicking item');
    });

    it('should not allow internal Overlay events to propagate beyond QuickActions', function(done) {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;
      var spy = sinon.spy();
      
      el.on('coral-overlay:open', () => {
        el.on('coral-overlay:beforeopen', spy);
        el.on('coral-overlay:beforeclose', spy);
        el.on('coral-overlay:open', spy);
        el.on('coral-overlay:close', spy);
        el.on('coral-overlay:positioned', spy);
  
        // Open and close the overlay to trigger Overlay events
        el._elements.overlay.open = true;
  
        helpers.next(function() {
          el._elements.overlay.open = false;
    
          helpers.next(function() {
            expect(spy.callCount).to.equal(0, 'no events propagated for internal Overlay');
            done();
          });
        });
      });
      
      // Open the quickActions
      el.open = true;
    });
  });

  describe('User Interaction', function() {
    var targetElement;

    beforeEach(function() {
      // Create the target element
      targetElement = helpers.overlay.createStaticTarget();

      // Set the tabIndex so that we can focus the target
      targetElement.tabIndex = 0;
    });

    afterEach(function() {
      targetElement = null;
    });

    it('should open when mouse enters the target', function() {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      expect(el.open).to.equal(false, 'QuickActions initially closed');

      el.target = targetElement;

      helpers.mouseEvent('mouseenter', targetElement);

      expect(el.open).to.equal(true, 'QuickActions opened after the mouse enters the target');
    });

    it('should close when mouse leaves the target', function() {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;

      el.show();

      expect(el.open).to.equal(true, 'QuickActions successfully shown');
      
      helpers.mouseEvent('mouseleave', targetElement);
      
      expect(el.open).to.equal(false, 'QuickActions closed after mouse leaves target');
    });

    it('should open when shift + F10 keys pressed', function() {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;
      expect(el.open).to.equal(false, 'QuickActions initially closed');

      // Hit shift + F10 keys
      var event = document.createEvent('Event');
      event.initEvent('keyup', true, true);
      event.keyCode = 121;
      event.which = 121;
      event.shiftKey = true;
      targetElement.dispatchEvent(event);
      
      expect(el.open).to.equal(true, 'QuickActions opened after shift + F10 key pressed');
    });

    it('should open when ctrl + space keys pressed', function() {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;
      expect(el.open).to.equal(false, 'QuickActions initially closed');

      // Hit ctrl + space keys
      var event = document.createEvent('Event');
      event.initEvent('keyup', true, true);
      event.keyCode = 32;
      event.which = 32;
      event.ctrlKey = true;
      targetElement.dispatchEvent(event);
      
      expect(el.open).to.equal(true, 'QuickActions opened after ctrl + space key pressed');
    });

    it('should close on escape keypress', function(done) {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;

      el.show();

      expect(el.open).to.equal(true, 'QuickActions successfully shown');

      // Hit escape key
      helpers.keypress('escape', el);
      
      // Wait for debounce to end
      setTimeout(() => {
        expect(el.open).to.equal(false, 'QuickActions closed after escape keypress');
        done();
      });
    });

    it('should navigate to next button for "right", "down" and "pagedown" keypresses', function(done) {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;
      el.show();
  
      // Wait until opened
      el.on('coral-overlay:open', () => {
        var buttons = el.querySelectorAll(BUTTON_SELECTOR);
      
        expect(document.activeElement).to.equal(buttons[0], 'First QuickAction item focused');

        helpers.keypress('right', buttons[0]);
        expect(document.activeElement).to.equal(buttons[1], 'Second QuickAction item focused');

        helpers.keypress('down', buttons[1]);
        expect(document.activeElement).to.equal(buttons[2], 'Third QuickAction item focused');

        helpers.keypress('pagedown', buttons[2]);
        expect(document.activeElement).to.equal(buttons[3], 'Fourth QuickAction item focused');

        done();
      });
    });

    it('should navigate to previous button for "left", "up" and "pageup" keypresses', function(done) {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;
      el.show();
  
      // Wait until opened
      el.on('coral-overlay:open', () => {
        var buttons = el.querySelectorAll(BUTTON_SELECTOR);
      
        buttons[3].focus();
        expect(document.activeElement).to.equal(buttons[3], 'Fourth QuickAction item focused');

        helpers.keypress('left', buttons[3]);
        expect(document.activeElement).to.equal(buttons[2], 'Third QuickAction item focused');

        helpers.keypress('up', buttons[2]);
        expect(document.activeElement).to.equal(buttons[1], 'Second QuickAction item focused');

        helpers.keypress('pageup', buttons[1]);
        expect(document.activeElement).to.equal(buttons[0], 'First QuickAction item focused');

        done();
      });
    });

    it('should navigate to last button for "end" keypress and first for "home" keypress', function(done) {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      
      el.target = targetElement;
      el.show();
  
      // Wait until opened
      el.on('coral-overlay:open', () => {
        var buttons = el.querySelectorAll(BUTTON_SELECTOR);
      
        expect(document.activeElement).to.equal(buttons[0], 'First QuickAction item focused initially');

        helpers.keypress('end', buttons[0]);
        expect(document.activeElement).to.equal(buttons[3], 'Last QuickAction item focused for end keypress');

        helpers.keypress('home', buttons[3]);
        expect(document.activeElement).to.equal(buttons[0], 'First QuickAction item focused for home keypress');

        done();
      });
    });

    it('should open the overlay when clicking the more button', function() {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      expect(el._elements.overlay.open).to.equal(false, 'Overlay is initially closed');

      // Simulate a click of the more button
      el._elements.moreButton.click();

      expect(el._elements.overlay.open).to.equal(true, 'Overlay is open following a click of the more button');
    });

    it('should close the overlay on escape keypress when open', function() {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.open = true;
      expect(el._elements.overlay.open).to.equal(false, 'Overlay initially closed');
      el._elements.overlay.open = true;

      // Hit escape key
      helpers.keypress('escape', el);
      
      expect(el._elements.overlay.open).to.equal(false, 'Overlay closed after escape keypress');
      expect(el.open).to.equal(true, 'QuickActions are still open, only the overlay has closed');
    });

    // @flaky
    it.skip('should return focus to the target when launched via keyboard', function(done) {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el._overlayAnimationTime = 0;
      
      el.target = targetElement;
      el.target.focus();

      // Hit shift + F10 keys to open
      var event = document.createEvent('Event');
      event.initEvent('keyup', true, true);
      event.keyCode = 121;
      event.which = 121;
      event.shiftKey = true;
      targetElement.dispatchEvent(event);
      
      el.on('coral-overlay:open', function() {
        expect(document.activeElement === el.target).to.equal(false, 'Focus is internal to the QuickActions');
        el.open = false;
      });
      
      el.on('coral-overlay:close', function() {
        expect(document.activeElement === el.target).to.equal(true, 'Focus is returned to the target on close');
        done();
      });
    });

    it('should trap focus when launched via keyboard', function(done) {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;
      el.target.focus();

      // Hit shift + F10 keys to open
      var event = document.createEvent('Event');
      event.initEvent('keyup', true, true);
      event.keyCode = 121;
      event.which = 121;
      event.shiftKey = true;
      targetElement.dispatchEvent(event);
  
      // Wait until opened
      el.on('coral-overlay:open', () => {
        var buttons = el.querySelectorAll(BUTTON_SELECTOR);

        helpers.next(function() {
          expect(document.activeElement).to.equal(buttons[0], 'First QuickAction item focused');

          // Hit tab key
          helpers.keypress('tab', el);

          expect(document.activeElement).to.equal(buttons[0], 'Focus trapped within the QuickActions');
          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    var targetElement;

    beforeEach(function() {
      // Create the target element
      targetElement = helpers.overlay.createStaticTarget();

      // Set the tabIndex so that we can focus the target
      targetElement.tabIndex = 0;
    });

    afterEach(function() {
      targetElement = null;
    });

    it('should allow HTML content in the items', function() {
      const el = helpers.build(window.__html__['QuickActions.base.htmlcontent.html']);
      el.target = targetElement;

      // opening the quickactions initiliazes the buttons
      el.open = true;
      
      var items = el.items.getAll();
      var buttonListItems = el._elements.buttonList.items.getAll();
      var buttons = Array.prototype.slice.call(el.querySelectorAll(BUTTON_SELECTOR));

      buttons.forEach(function(button, index) {
        expect(button.getAttribute('aria-label')).to.equal(items[index].content.textContent, 'the aria-label should be strip the HTML out');
        expect(button.getAttribute('title')).to.equal(items[index].content.textContent, 'the title should strip the HTML out');
        expect(buttonListItems[index].content.innerHTML).to.equal(items[index].content.innerHTML, 'the list item should keep the HTML');
        expect(items[index].content.textContent).not.to.equal(items[index].content.innerHTML);
      });
    });

    it('should trim the content', function() {
      const el = helpers.build(window.__html__['QuickActions.base.html']);
      el.target = targetElement;

      // opening the quickactions initiliazes the buttons
      el.open = true;
    
      var items = el.items.getAll();
      var buttons = Array.prototype.slice.call(el.querySelectorAll(BUTTON_SELECTOR));

      buttons.forEach(function(button, index) {
        expect(button.getAttribute('title')).to.equal(items[index].content.textContent.trim(), 'The title should be trimmed');
        expect(button.getAttribute('aria-label')).to.equal(items[index].content.textContent.trim(), 'The aria-label should be strip the trimmed');
      });
    });

    it('should reflect an item icon change in buttons and buttonList items', function() {
      const el = helpers.build(window.__html__['QuickActions.open.html']);
      el.target = targetElement;
      var items = el.items.getAll();
      var buttonListItem = el._elements.buttonList.items.first();
      var buttonListItemIcon = buttonListItem.querySelector('coral-icon');
      var button = el.querySelector(BUTTON_SELECTOR);

      expect(buttonListItemIcon.icon).to.equal('copy', 'the buttonList item icon is initially "copy"');
      expect(button.icon).to.equal('copy', 'the button icon is initially "copy"');

      // Change the icon for the first item
      items[0].icon = 'share';
      
      // We have to re-sample the buttonList item
      var buttonListItem = el._elements.buttonList.items.first();
      var buttonListItemIcon = buttonListItem.querySelector('coral-icon');

      expect(buttonListItemIcon.icon).to.equal('share', 'the ButtonList item icon is now "share"');
      expect(button.icon).to.equal('share', 'the button icon is now "share"');
    });

    it('should reflect an Item content change in button titles and buttonList items', function(done) {
      const el = helpers.build(window.__html__['QuickActions.open.html']);
      el.target = targetElement;
      var items = el.items.getAll();
      var buttonListItem = el._elements.buttonList.items.first();
      var button = el.querySelector(BUTTON_SELECTOR);

      expect(buttonListItem.content.textContent).to.equal('Copy', 'the ButtonList item content is initially "Copy"');
      expect(button.getAttribute('title')).to.equal('Copy', 'the button content is initially "Copy"');

      // Change the content for the first item
      items[0].content.textContent = '  Share  ';

      // Wait for MO
      helpers.next(function() {
        button = el.querySelector(BUTTON_SELECTOR);
        
        // We have to re-sample the buttonList item
        var buttonListItem = el._elements.buttonList.items.first();

        expect(buttonListItem.content.textContent).to.equal('  Share  ', 'the ButtonList item content is now "Share"');
        // expect(button.getAttribute('title')).to.equal('Share', 'Title content should be trimmed');
        expect(button.getAttribute('aria-label')).to.equal('Share', 'Aria-label content should be trimmed');
        done();
      });
    });

    it('should reflect an item type change in buttons and buttonList items', function() {
      const el = helpers.build(window.__html__['QuickActions.open.html']);
      el.target = targetElement;
      var items = el.items.getAll();
      var buttonListItem = el._elements.buttonList.items.first();
      var button = el.querySelector(BUTTON_SELECTOR);

      expect(items[0].type).to.equal(QuickActions.Item.type.BUTTON);
      expect(button.tagName).to.equal('BUTTON');
      expect(buttonListItem.tagName).to.equal('BUTTON');

      // Change the icon for the first item
      items[0].type = QuickActions.Item.type.ANCHOR;
      
      // We have to re-sample the buttonList item
      buttonListItem = el._elements.buttonList.items.first();
      button = el.querySelector(BUTTON_SELECTOR);

      expect(buttonListItem.tagName).to.equal('A', 'item should be converted to anchor');
      expect(button.tagName).to.equal('A');
      expect(button.href).to.exist;
    });

    it('should match the QuickActions width to that of their target on layout', function(done) {
      const el = helpers.build(window.__html__['QuickActions.empty.html']);
      el.target = targetElement;
      el.open = true;
      var target = el._getTarget(el.target);

      // Wait for quickactions to be open to read layout
      helpers.next(function() {
        expect(el.getBoundingClientRect().width === target.getBoundingClientRect().width).to.equal(true, 'QuickActions width matches that of their target');
        done();
      });
    });
  
    describe('Smart Overlay', () => {
      helpers.testSmartOverlay('coral-quickactions');
    });
  });
  
  describe('Tracking', function() {
    var trackerFnSpy;
    
    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });
    
    it('should call the tracker callback fn with expected parameters when the quickactions are opened', function() {
      const el = helpers.build(window.__html__['QuickActions.tracking.html']);
      var areaEl = el.firstElementChild;
      var event = document.createEvent('Event');
      
      event.initEvent('mouseenter', true, false);
      areaEl.dispatchEvent(event);
      expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'element name');
      expect(trackData).to.have.property('targetType', 'coral-quickactions');
      expect(trackData).to.have.property('eventType', 'display');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-quickactions');
      expect(spyCall.args[1]).to.be.an.instanceof(Event);
      expect(spyCall.args[2]).to.be.an.instanceof(QuickActions);
    });
    
    it('should call the tracker callback fn with expected parameters when the quickactions are opened and a button is clicked', function() {
      const el = helpers.build(window.__html__['QuickActions.tracking.html']);
      var areaEl = el.firstElementChild;
      var actionsEl = el.querySelector('coral-quickactions');
      var event = document.createEvent('Event');
      event.initEvent('mouseenter', true, false);
      areaEl.dispatchEvent(event);
      
      var firstBtn = actionsEl.firstElementChild;
      firstBtn.click();
      expect(trackerFnSpy.callCount).to.equal(2, 'Tracker should have been called twice.');
      
      var spyCall = trackerFnSpy.getCall(1);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'Copy');
      expect(trackData).to.have.property('targetType', 'coral-quickactions-item');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-quickactions');
      expect(spyCall.args[1]).to.be.an.instanceof(Event);
      expect(spyCall.args[2]).to.be.an.instanceof(QuickActions);
    });
    
    it('should call the tracker callback fn with expected parameters when the quickactions more button is clicked', function() {
      const el = helpers.build(window.__html__['QuickActions.tracking.html']);
      var areaEl = el.firstElementChild;
      var actionsEl = el.querySelector('coral-quickactions');
      var event = document.createEvent('Event');
      event.initEvent('mouseenter', true, false);
      areaEl.dispatchEvent(event);
      
      var moreBtn = actionsEl.querySelector('[handle="moreButton"]');
      moreBtn.click();
      expect(trackerFnSpy.callCount).to.equal(2, 'Tracker should have been called twice.');
      
      var spyCall = trackerFnSpy.getCall(1);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'element name');
      expect(trackData).to.have.property('targetType', 'coral-quickactions-more');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-quickactions');
      expect(spyCall.args[1]).to.be.an.instanceof(Event);
      expect(spyCall.args[2]).to.be.an.instanceof(QuickActions);
    });
    
    it('should call the tracker callback fn with expected parameters when the first button from the quickactions more list is clicked', function() {
      const el = helpers.build(window.__html__['QuickActions.tracking.html']);
      var areaEl = el.firstElementChild;
      var actionsEl = el.querySelector('coral-quickactions');
      var event = document.createEvent('Event');
      event.initEvent('mouseenter', true, false);
      areaEl.dispatchEvent(event);
      
      var moreBtn = actionsEl.querySelector('[handle="moreButton"]');
      moreBtn.click();
      // Note: I found no way to separate the children who appear in the list from the ones visible on hover.
      var firstBtnFromList = actionsEl.overlay.querySelector('coral-buttonlist [coral-list-item]:nth-child(3)');
      firstBtnFromList.click();
      expect(trackerFnSpy.callCount).to.equal(3, 'Tracker should have been called three times.');
      
      var spyCall = trackerFnSpy.getCall(2);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'Download');
      expect(trackData).to.have.property('targetType', 'coral-quickactions-item');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-quickactions');
      expect(spyCall.args[1]).to.be.an.instanceof(Event);
      expect(spyCall.args[2]).to.be.an.instanceof(QuickActions);
    });
  });
});
