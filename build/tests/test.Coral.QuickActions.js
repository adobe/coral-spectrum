describe('Coral.QuickActions', function() {
  'use strict';

  var buttonSelector = '.coral-QuickActions-button:not([handle="moreButton"])';
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
    it('should have QuickActions defined', function() {
      expect(Coral).to.have.property('QuickActions');
    });

    it('should expose the interaction in an enum', function() {
      expect(Coral.QuickActions).to.have.property('interaction');
      expect(Coral.QuickActions.interaction.ON).to.equal('on');
      expect(Coral.QuickActions.interaction.OFF).to.equal('off');
      expect(Object.keys(Coral.QuickActions.interaction).length).to.equal(2);
    });

    it('should expose the placement in an enum', function() {
      expect(Coral.QuickActions).to.have.property('placement');
      expect(Coral.QuickActions.placement.TOP).to.equal('top');
      expect(Coral.QuickActions.placement.CENTER).to.equal('center');
      expect(Coral.QuickActions.placement.BOTTOM).to.equal('bottom');
      expect(Object.keys(Coral.QuickActions.placement).length).to.equal(3);
    });
  });

  describe('API', function() {
    var el;
    var targetElement;

    beforeEach(function(done) {
      // Create the QuickActions
      el = new Coral.QuickActions();
      helpers.target.appendChild(el);

      // Create the target element
      targetElement = helpers.overlay.createStaticTarget();

      // Set the tabIndex so that we can focus the target
      targetElement.tabIndex = 0;

      // Set the targets
      el.target = targetElement;

      // Wait for mutation observers
      helpers.next(function() {
        done();
      });
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
        expect(el.interaction).to.equal(Coral.QuickActions.interaction.ON);
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
        helpers.build(window.__html__['Coral.QuickActions.open.html'], function(el) {
          el.target = targetElement;
          var buttonListItems = el._elements.buttonList.items.getAll();
          var buttons = el.$.find(buttonSelector);

          expect(buttonListItems.length).to.equal(4, 'buttonList initially has four items');
          expect(buttons.length).to.equal(4, 'four buttons initially');

          // Add a couple more items
          el.items.add(itemObject);
          el.items.add(itemObject1);

          helpers.next(function() {
            buttonListItems = el._elements.buttonList.items.getAll();
            buttons = el.$.find(buttonSelector);
            expect(buttons.length).to.equal(6, 'buttonList has six items after we have added some more');
            expect(buttonListItems.length).to.equal(6, 'six buttons after we have added some more');
            buttons.each(function() {
              expect(window.CustomElements.instanceof(this, Coral.Button)).to.be.true;
            });
            buttonListItems.forEach(function(item) {
              expect(window.CustomElements.instanceof(item, Coral.ButtonList.Item)).to.be.true;
            });
            done();
          });
        });
      });

      it('should support anchorButtons and anchorButtonList items', function(done) {
        helpers.build(window.__html__['Coral.QuickActions.type.html'], function(el) {
          el.target = targetElement;
          // we need to open it to force the creation of the internal elements
          el.open = true;

          var anchorButtonListItems = el._elements.buttonList.items.getAll();
          var anchorButtons = el.$.find(buttonSelector);

          helpers.next(function() {
            anchorButtonListItems = el._elements.buttonList.items.getAll();
            anchorButtons = el.$.find(buttonSelector);
            expect(anchorButtons.length).to.equal(4, 'anchorButtonList has six items after we have added some more');
            expect(anchorButtonListItems.length).to.equal(4, 'six anchorButtons after we have added some more');
            anchorButtons.each(function() {
              expect(window.CustomElements.instanceof(this, Coral.AnchorButton)).to.be.true;
              expect(this.$).to.have.attr('href', '#');
            });
            anchorButtonListItems.forEach(function(item) {
              expect(window.CustomElements.instanceof(item, Coral.AnchorList.Item)).to.be.true;
              expect(item.$).to.have.attr('href', '#');
            });
            done();
          });
        });
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

    it('should trigger click event when an item is selected by clicking a button', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.open.html'], function(el) {
        el.target = targetElement;
        var spy = sinon.spy();

        el.on('click', function(event) {
          expect(event.target.textContent).to.equal('Copy');
          spy.call(spy, this.arguments);
        });

        // Click the button
        var $button = el.$.find(buttonSelector).first();
        $button.click();

        helpers.next(function() {
          expect(spy.callCount).to.equal(1, 'spy called once after clicking item');
          done();
        });
      });
    });

    it('should trigger click event when an item is selected by clicking a ButtonList item', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.open.html'], function(el) {
        el.target = targetElement;
        var spy = sinon.spy();

        el.on('click', function(event) {
          expect(event.target.textContent).to.equal('Copy');
          spy.call(spy, this.arguments);
        });

        // Click the ButtonList item
        var buttonListItems = el._elements.buttonList.items.getAll();
        $(buttonListItems[0]).click();

        helpers.next(function() {
          expect(spy.callCount).to.equal(1, 'spy called once after clicking item');
          done();
        });
      });
    });

    it('should not allow internal Coral.Overlay events to propagate beyond QuickActions', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;
        var spy = sinon.spy();

        // Open the quickActions
        el.open = true;

        helpers.next(function() {
          el.on('coral-overlay:beforeopen', spy);
          el.on('coral-overlay:beforeclose', spy);
          el.on('coral-overlay:open', spy);
          el.on('coral-overlay:close', spy);
          el.on('coral-overlay:positioned', spy);

          // Open and close the overlay to trigger Coral.Overlay events
          el._elements.overlay.open = true;

          helpers.next(function() {
            el._elements.overlay.close = true;
            expect(spy.callCount).to.equal(0, 'no events propagated for internal Coral.Overlay');
            done();
          });
        });
      });
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

    it('should open when mouse enters the target', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        expect(el.open).to.equal(false, 'QuickActions initially closed');

        el.target = targetElement;

        var event = document.createEvent('Event');
        event.initEvent('mouseenter', true, false);
        targetElement.dispatchEvent(event);

        expect(el.open).to.equal(true, 'QuickActions opened after the mouse enters the target');

        done();
      });
    });

    it('should close when mouse leaves the target', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;

        el.show();

        expect(el.open).to.equal(true, 'QuickActions successfully shown');

        // Create and dispatch the event
        var event = document.createEvent('Event');
        event.initEvent('mouseleave', true, false);
        targetElement.dispatchEvent(event);

        expect(el.open).to.equal(false, 'QuickActions closed after mouse leaves target');
        done();
      });
    });

    it('should open when shift + F10 keys pressed', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;
        expect(el.open).to.equal(false, 'QuickActions initially closed');

        // Hit shift + F10 keys
        var event = document.createEvent('Event');
        event.initEvent('keyup', true, true);
        event.keyCode = 121;
        event.which = 121;
        event.shiftKey = true;
        targetElement.dispatchEvent(event);

        helpers.next(function() {
          expect(el.open).to.equal(true, 'QuickActions opened after shift + F10 key pressed');
          done();
        });
      });
    });

    it('should open when ctrl + space keys pressed', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;
        expect(el.open).to.equal(false, 'QuickActions initially closed');

        // Hit ctrl + space keys
        var event = document.createEvent('Event');
        event.initEvent('keyup', true, true);
        event.keyCode = 32;
        event.which = 32;
        event.ctrlKey = true;
        targetElement.dispatchEvent(event);

        helpers.next(function() {
          expect(el.open).to.equal(true, 'QuickActions opened after ctrl + space key pressed');
          done();
        });
      });
    });

    it('should close on escape keypress', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;

        el.show();

        expect(el.open).to.equal(true, 'QuickActions successfully shown');

        // Hit escape key
        helpers.keypress('escape', el);

        helpers.next(function() {
          expect(el.open).to.equal(false, 'QuickActions closed after escape keypress');
          done();
        });
      });
    });

    it('should navigate to next button for "right", "down" and "pagedown" keypresses', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;
        el.show();

        el.style.visibility = 'visible'; // Bypass wait on transition end.

        // Wait for the buttons to be rendered
        helpers.next(function() {
          var buttons = el.$.find(buttonSelector);

          helpers.next(function() {
            expect(document.activeElement).to.equal(buttons.eq(0)[0], 'First QuickAction item focused');

            helpers.keypress('right', buttons.eq(0)[0]);
            expect(document.activeElement).to.equal(buttons.eq(1)[0], 'Second QuickAction item focused');

            helpers.keypress('down', buttons.eq(1)[0]);
            expect(document.activeElement).to.equal(buttons.eq(2)[0], 'Third QuickAction item focused');

            helpers.keypress('pagedown', buttons.eq(2)[0]);
            expect(document.activeElement).to.equal(buttons.eq(3)[0], 'Fourth QuickAction item focused');

            done();
          });
        });
      });
    });

    it('should navigate to previous button for "left", "up" and "pageup" keypresses', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;
        el.show();

        el.style.visibility = 'visible'; // Bypass wait on transition end.

        // Wait for the buttons to be rendered
        helpers.next(function() {
          var buttons = $(el).find('button');

          helpers.next(function() {
            $(buttons.eq(3)[0]).focus();
            expect(document.activeElement).to.equal(buttons.eq(3)[0], 'Fourth QuickAction item focused');

            helpers.keypress('left', buttons.eq(3)[0]);
            expect(document.activeElement).to.equal(buttons.eq(2)[0], 'Third QuickAction item focused');

            helpers.keypress('up', buttons.eq(2)[0]);
            expect(document.activeElement).to.equal(buttons.eq(1)[0], 'Second QuickAction item focused');

            helpers.keypress('pageup', buttons.eq(1)[0]);
            expect(document.activeElement).to.equal(buttons.eq(0)[0], 'First QuickAction item focused');

            done();
          });
        });
      });
    });

    it('should navigate to last button for "end" keypress and first for "home" keypress', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;
        el.show();

        el.style.visibility = 'visible'; // Bypass wait on transition end.

        // Wait for the buttons to be rendered
        helpers.next(function() {
          var buttons = $(el).find('button');

          helpers.next(function() {
            expect(document.activeElement).to.equal(buttons.eq(0)[0], 'First QuickAction item focused initially');

            helpers.keypress('end', buttons.eq(0)[0]);
            expect(document.activeElement).to.equal(buttons.eq(3)[0], 'Last QuickAction item focused for end keypress');

            helpers.keypress('home', buttons.eq(3)[0]);
            expect(document.activeElement).to.equal(buttons.eq(0)[0], 'First QuickAction item focused for home keypress');

            done();
          });
        });
      });
    });

    it('should open the overlay when clicking the more button', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        expect(el._elements.overlay.open).to.equal(false, 'Overlay is initially closed');

        // Simulate a click of the more button
        $(el._elements.moreButton).click();

        expect(el._elements.overlay.open).to.equal(true, 'Overlay is open following a click of the more button');
        done();
      });
    });

    it('should close the overlay on escape keypress when open', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.open = true;
        expect(el._elements.overlay.open).to.equal(false, 'Overlay initially closed');
        el._elements.overlay.open = true;

        // Hit escape key
        helpers.keypress('escape', el);

        helpers.next(function() {
          expect(el._elements.overlay.open).to.equal(false, 'Overlay closed after escape keypress');
          expect(el.open).to.equal(true, 'QuickActions are still open, only the overlay has closed');
          done();
        });
      });
    });

    it('should return focus to the target when launched via keyboard', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;

        $(el.target).focus();

        // Hit shift + F10 keys to open
        var event = document.createEvent('Event');
        event.initEvent('keyup', true, true);
        event.keyCode = 121;
        event.which = 121;
        event.shiftKey = true;
        targetElement.dispatchEvent(event);

        el.style.visibility = 'visible'; // Bypass wait on transition end.

        helpers.next(function() {
          helpers.next(function() {
            expect(document.activeElement === el.target).to.equal(false, 'Focus is internal to the QuickActions');
            el.open = false;

            helpers.next(function() {
              expect(document.activeElement === el.target).to.equal(true, 'Focus is returned to the target on close');
              done();
            });
          });
        });
      });
    });

    it('should trap focus when launched via keyboard', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;

        $(el.target).focus();

        // Hit shift + F10 keys to open
        var event = document.createEvent('Event');
        event.initEvent('keyup', true, true);
        event.keyCode = 121;
        event.which = 121;
        event.shiftKey = true;
        targetElement.dispatchEvent(event);

        el.style.visibility = 'visible'; // Bypass wait on transition end.

        helpers.next(function() {
          var buttons = el.$.find(buttonSelector);

          helpers.next(function() {
            expect(document.activeElement).to.equal(buttons.eq(0)[0], 'First QuickAction item focused');

            // Hit tab key
            helpers.keypress('tab', el);

            expect(document.activeElement).to.equal(buttons.eq(0)[0], 'Focus trapped within the QuickActions');
            done();
          });
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

    it('should allow HTML content in the items', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.htmlcontent.html'], function(el) {
        el.target = targetElement;

        // opening the quickactions initiliazes the buttons
        el.open = true;

        helpers.next(function() {
          var items = el.items.getAll();
          var buttonListItems = el._elements.buttonList.items.getAll();
          var buttons = el.$.find(buttonSelector);

          buttons.each(function(index, button) {
            expect(button.getAttribute('aria-label')).to.equal(items[index].content.textContent, 'the aria-label should be strip the HTML out');
            expect(button.getAttribute('title')).to.equal(items[index].content.textContent, 'the title should strip the HTML out');
            expect(buttonListItems[index].content.innerHTML).to.equal(items[index].content.innerHTML, 'the list item should keep the HTML');
            expect(items[index].content.textContent).not.to.equal(items[index].content.innerHTML);
          });

          done();
        });
      });
    });

    it('should reflect an item icon change in buttons and buttonList items', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.open.html'], function(el) {
        el.target = targetElement;
        var items = el.items.getAll();
        var buttonListItem = el._elements.buttonList.items.getAll()[0];
        var buttonListItemIcon = $(buttonListItem).find('coral-icon')[0];
        var button = el.$.find(buttonSelector).first()[0];

        expect(buttonListItemIcon.icon).to.equal('copy', 'the buttonList item icon is initially "copy"');
        expect(button.icon).to.equal('copy', 'the button icon is initially "copy"');

        // Change the icon for the first item
        items[0].icon = 'share';

        // Wait for mutation observers
        helpers.next(function() {
          // We have to re-sample the buttonList item
          var buttonListItem = el._elements.buttonList.items.getAll()[0];
          var buttonListItemIcon = $(buttonListItem).find('coral-icon')[0];

          expect(buttonListItemIcon.icon).to.equal('share', 'the ButtonList item icon is now "share"');
          expect(button.icon).to.equal('share', 'the button icon is now "share"');
          done();
        });
      });
    });

    it('should reflect an Item content change in button titles and buttonList items', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.open.html'], function(el) {
        el.target = targetElement;
        var items = el.items.getAll();
        var buttonListItem = el._elements.buttonList.items.getAll()[0];
        var button = el.$.find(buttonSelector).first()[0];

        expect(buttonListItem.content.textContent).to.equal('Copy', 'the ButtonList item content is initially "Copy"');
        expect(button.getAttribute('title')).to.equal('Copy', 'the button content is initially "Copy"');

        // Change the content for the first item
        items[0].content.textContent = 'Share';

        helpers.next(function() {
          // We have to re-sample the buttonList item
          var buttonListItem = el._elements.buttonList.items.getAll()[0];

          expect(buttonListItem.content.textContent).to.equal('Share', 'the ButtonList item content is now "Share"');
          expect(button.getAttribute('title')).to.equal('Share', 'the button content is now "Share"');
          done();
        });
      });
    });

    it('should reflect an item type change in buttons and buttonList items', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.open.html'], function(el) {
        el.target = targetElement;
        var items = el.items.getAll();
        var buttonListItem = el._elements.buttonList.items.getAll()[0];
        var button = el.$.find(buttonSelector).first()[0];

        expect(items[0].type).to.equal(Coral.QuickActions.Item.type.BUTTON);
        expect(button.tagName).to.equal('BUTTON');
        expect(buttonListItem.tagName).to.equal('BUTTON');

        // Change the icon for the first item
        items[0].type = Coral.QuickActions.Item.type.ANCHOR;

        // Wait for mutation observers
        helpers.next(function() {
          // We have to re-sample the buttonList item
          buttonListItem = el._elements.buttonList.items.getAll()[0];
          button = el.$.find(buttonSelector).first()[0];

          expect(buttonListItem.tagName).to.equal('A');
          expect(button.tagName).to.equal('A');
          expect(button.href).to.exist;

          done();
        });
      });
    });

    it('should add an offset margin to take into account the animation distance', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        expect(el.style['marginTop'] === '').to.equal(true, 'QuickActions have no margin top set before opening');
        el.open = true;

        // Manually adjust the animation time for testing
        el._overlayAnimationTime = 0;

        helpers.next(function() {
          // Margin top here matches TRANSLATE_DISTANCE of Coral.QuickActions.js
          expect(el.style['marginTop'] === '-5px').to.equal(true, 'QuickActions have a margin top of -5px after opening');
          done();
        });
      });
    });

    it('should offset the quickActions the correct distance from the target', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.base.html'], function(el) {
        el.target = targetElement;
        el.open = true;

        helpers.next(function() {
          // Add TRANSLATE_DISTANCE of Coral.QuickActions.js
          var offset = el.$.offset().top - $(targetElement).offset().top + 5;
          expect(el.offset === offset).to.equal(true, 'QuickActions are offset by the correct distance from the target top');
          done();
        });
      });
    });

    it('should match the Coral.QuickActions width to that of their target on layout', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.empty.html'], function(el) {
        el.target = targetElement;
        el.open = true;
        var target = el._getTarget(el.target);

        helpers.next(function() {
          expect($(el).width() === $(target).width()).to.equal(true, 'Coral.QuickActions width matches that of their target');
          done();
        });
      });
    });

    it('should override the inline max-width applied by extended Coral.Overlay to prevent collapse', function(done) {
      helpers.build(window.__html__['Coral.QuickActions.empty.html'], function(el) {
        el.target = targetElement;
        el.open = true;

        helpers.next(function() {
          expect(el.style.maxWidth === 'none').to.equal(true, 'max-width is correctly overridden');
          done();
        });
      });
    });
  });
});
