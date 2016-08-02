describe('Coral.ActionBar', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('ActionBar');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function(done) {
      helpers.build(window.__html__['Coral.ActionBar.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element using markup without containers', function(done) {
      helpers.build(window.__html__['Coral.ActionBar.WithoutContainers.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element using markup with disabled', function(done) {
      helpers.build(window.__html__['Coral.ActionBar.Disabled.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.ActionBar();
      helpers.target.appendChild(el);

      var leftItem1 = el.primary.items.add({});
      leftItem1.appendChild(new Coral.Button());

      var leftItem2 = el.primary.items.add({});
      leftItem2.appendChild(new Coral.Button());

      var rightItem1 = el.secondary.items.add({});
      rightItem1.appendChild(new Coral.Button());

      var rightItem2 = el.secondary.items.add({});
      rightItem2.appendChild(new Coral.Button());

      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.ActionBar();
      helpers.target.appendChild(el);
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
      var item = wrapperEl.appendChild(new Coral.Button());

      expect(el.primary.items.length).to.equal(1);
      expect(wrapperEl.tagName.toLowerCase()).to.equal('coral-actionbar-item');
      expect(item.tagName.toLowerCase()).to.equal('button');
      expect(item.getAttribute('is')).to.equal('coral-button');
    });

    it('should be possible to set the more button text', function(done) {
      el.primary.moreButtonText = ':(';
      helpers.next(function() {
        expect(el.primary.moreButtonText).to.equal(':(');
        expect(el.primary._elements.moreButton.label.innerHTML).to.equal(':(');
        done();
      });
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

    it('should be possible to set the threshold on left/right wrappers => invisible items are moved offscreen', function(done) {

      //make sure only one item is visible in each wrapper => move others to popovers
      el.primary.threshold = 1;
      el.secondary.threshold = 1;

      //add two left floating item
      el.primary.items.add({}).appendChild(new Coral.Button());
      el.primary.items.add({}).appendChild(new Coral.Button());

      //add two right floating item
      el.secondary.items.add({}).appendChild(new Coral.Button());
      el.secondary.items.add({}).appendChild(new Coral.Button());

      helpers.next(function() {

        // as 'smart' layouting will not trigger immediately but async, we will have to wait
        // window.setTimeout(function() {
        expect(el.primary.items.getAll().length).to.equal(2);
        expect(el.secondary.items.getAll().length).to.equal(2);

        //one item on the left/right side should be hidden
        expect(el.primary.items._getAllOffScreen().length).to.equal(1);
        expect(el.secondary.items._getAllOffScreen().length).to.equal(1);

        done();
      });
    });
  });

  describe('Markup', function() {
    it('should have right classes set', function(done) {
      var markup = '<coral-actionbar></coral-actionbar>';
      helpers.build(markup, function(bar) {
        expect(bar.$.hasClass('coral-ActionBar')).to.be.true;
        done();
      });
    });

    it('should generate one two coral-actionbar-containers containing all left/right floating elements', function(done) {
      var markup = '<coral-actionbar></coral-actionbar>';
      helpers.build(markup, function(bar) {
        var containers = bar.querySelectorAll('coral-actionbar-container');
        expect(containers.length).to.equal(2);
        expect(containers[0]._position).to.equal(Coral.ActionBar.Container.position.PRIMARY);
        expect(containers[1]._position).to.equal(Coral.ActionBar.Container.position.SECONDARY);
        done();
      });
    });

    it('should have right tagname set', function(done) {
      var markup = '<coral-actionbar></coral-actionbar>';
      helpers.build(markup, function(bar) {
        expect(bar.tagName.toLowerCase()).to.equal('coral-actionbar');
        done();
      });
    });

    it('should generate 2 popovers that are hidden by default', function(done) {
      var markup = '<coral-actionbar></coral-actionbar>';
      helpers.build(markup, function(bar) {
        expect(bar.$.find('coral-popover').length).to.equal(2);
        done();
      });
    });

    it('should generate 2 more buttons that are "hidden" (offscreen) by default', function(done) {
      var markup = '<coral-actionbar></coral-actionbar>';
      helpers.build(markup, function(bar) {
        var $leftButton = bar.primary.$.find('.coral-Button[coral-actionbar-more]');
        var $rightButton = bar.secondary.$.find('.coral-Button[coral-actionbar-more]');

        expect($leftButton.length).to.equal(1);
        expect($rightButton.length).to.equal(1);

        //test that both more buttons are offscreen by default (offscreen in order to still calc their width)
        expect($rightButton[0].hasAttribute('coral-actionbar-offscreen')).to.be.true;
        expect($leftButton[0].hasAttribute('coral-actionbar-offscreen')).to.be.true;
        done();
      });
    });

    it('should be possible to instantiate a complex actionbar using markup', function(done) {
      // should be possible to create elements using snippets
      helpers.build(window.__html__['Coral.ActionBar.html'], function(bar) {

        expect(bar.primary.threshold).to.equal(1);
        expect(bar.secondary.threshold).to.equal(2);

        expect(bar.primary.moreButtonText).to.equal('More Left');
        expect(bar.secondary.moreButtonText).to.equal('More Right');

        expect(bar.primary.items.length).to.equal(4);
        expect(bar.secondary.items.length).to.equal(11);

        // some items should have been moved off screen
        expect(bar.primary.items._getAllOffScreen().length).to.equal(3);
        expect(bar.secondary.items._getAllOffScreen().length).to.equal(9);

        done();
      });
    });

    it('should be possible to instantiate a actionbar without wrapper components using markup', function(done) {
      // should be possible to create elements using snippets
      helpers.build(window.__html__['Coral.ActionBar.WithoutContainers.html'], function(bar) {
        expect(bar.primary.threshold).to.equal(-1);
        expect(bar.secondary.threshold).to.equal(-1);

        expect(bar.primary.moreButtonText).to.equal('');
        expect(bar.secondary.moreButtonText).to.equal('');

        // all items should be automatically moved to the left container
        expect(bar.primary.items.length).to.equal(4);
        expect(bar.secondary.items.length).to.equal(0);

        done();
      });
    });
  });

  describe('Events', function() {});

  describe('User Interaction', function() {
    it('should keyboard navigation to jump from current selected actionbar item to next visible actionbar item', function(done) {
      helpers.build(window.__html__['Coral.ActionBar.html'], function(bar) {
        helpers.next(function() {
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

          // now right more should be active
          expect(document.activeElement).to.equal(bar.secondary._elements.moreButton, 'right more should now be active');

          done();
        });
      });
    });

    it('should open a popover on click on "more" button (only one "more" popover should be open at once)', function(done) {
      helpers.build(window.__html__['Coral.ActionBar.html'], function(bar) {
        expect(bar.primary._elements.popover.open).to.equal(false, 'left popover should be closed by default');
        expect(bar.secondary._elements.popover.open).to.equal(false, 'right popover should be closed by default');

        // click on left more should open a popover
        bar.primary._elements.moreButton.click();

        helpers.next(function() {
          expect(bar.primary._elements.popover.open).to.equal(true, 'left popover should now be open');
          expect(bar.secondary._elements.popover.open).to.equal(false, 'right popover should still be closed');

          // click on right more should open another popover (and close the other one)
          bar.secondary._elements.moreButton.click();

          helpers.next(function() {
            expect(bar.primary._elements.popover.open).to.equal(false, 'left popover should now be closed again');
            expect(bar.secondary._elements.popover.open).to.equal(true, 'right popover should now be open');

            done();
          });

        });

      });
    });

    it('should open a popover on click on "more" button without throwing an exception if all items are disabled', function(done) {

      var _buildComponent = function(markup, callback) {

        // TODO: use this util as long as helpers.build() is broken for FF => Coral.commons.ready() is never triggered if
        // all elements inside are disabled for FF (see: CUI-3907)

        // Create a container element and populate it with the markup
        var div = document.createElement('div');
        div.innerHTML = markup;

        // Get the element from the container element
        var instance = div.children[0];

        // Add the element to the DOM
        helpers.target.appendChild(instance);

        if (typeof callback === 'function') {
          /// Pass the instance along
          callback(instance);
        }

        return instance;
      };

      //helpers.build(window.__html__['Coral.ActionBar.Disabled.html'], function(bar) {
      _buildComponent(window.__html__['Coral.ActionBar.Disabled.html'], function(bar) {

        helpers.next(function() {

          expect(bar.primary._elements.popover.open).to.equal(false, 'left popover should be closed by default');
          expect(bar.secondary._elements.popover.open).to.equal(false, 'right popover should be closed by default');

          // click on left more should open a popover
          bar.primary._elements.moreButton.click(); // used to break as exception was thrown ...

          expect(bar.primary._elements.popover.open).to.equal(true, 'left popover should now be open');
          expect(bar.secondary._elements.popover.open).to.equal(false, 'right popover should still be closed');

          done();
        });
      });
    });

    it('should close a popover on click outside of popover', function(done) {
      helpers.build(window.__html__['Coral.ActionBar.html'], function(bar) {
        // open left popover
        bar.primary._elements.popover.open = true;

        helpers.next(function() {
          expect(bar.primary._elements.popover.open).to.equal(true, 'left popover should be open');

          // click outside of popover should close it
          document.body.click();

          helpers.next(function() {
            expect(bar.primary._elements.popover.open).to.equal(false, 'left popover should now be closed again');
            done();
          });
        });
      });
    });

    it('should be possible to make two bars that switch', function(done) {
      // should be possible to create elements using snippets
      helpers.build(window.__html__['Coral.ActionBar.SwitchBars.html'], function(bar) {

        var bar1 = document.getElementById('switchBar1');
        var bar2 = document.getElementById('switchBar2');

        // all items of bar1 should be visible (as there should be enough space)
        expect(bar1.primary.items.length).to.equal(7, 'bar1 should have 7 items on left side');
        expect(bar1.secondary.items.length).to.equal(3, 'bar1 should have 3 items on right side');
        expect(bar1.primary.items._getAllOffScreen().length).to.equal(0, 'all left items of bar1 should be visible');
        expect(bar1.secondary.items._getAllOffScreen().length).to.equal(0, 'all right items of bar1 should be visible');

        // all items of bar2 should be offscreen (as there should be no space)
        expect(bar2.primary.items.length).to.equal(1, 'bar2 should have 1 items on left side');
        expect(bar2.secondary.items.length).to.equal(0, 'bar2 should have 0 items on right side');
        expect(bar2.primary.items._getAllOffScreen().length).to.equal(1, 'all items of bar2 should be offscreen');

        // as 'smart' layouting will not trigger immediately but async, we will have to wait until layouting is finished
        var onLayoutBar1Called = false;
        var onLayoutBar2Called = false;

        var onLayout = function() {
          if (onLayoutBar1Called && onLayoutBar2Called) {
            helpers.next( function() {
              // items of bar1 should be moved offscreen
              expect(bar1.primary.items._getAllOffScreen().length).to.equal(7, 'all left items of bar1 should be offscreen now');
              expect(bar1.secondary.items._getAllOffScreen().length).to.equal(3, 'all right items of bar1 should be offscreen now');

              // all items of bar2 should be visible now
              expect(bar2.primary.items._getAllOffScreen().length).to.equal(0, 'all left items of bar2 should be visible now');

              done();
            });
          }
        };

        // save original methods for later use
        var bar1OnLayout = bar1._onLayout;
        var bar2OnLayout = bar2._onLayout;

        // overwrite methods and internally use the originals
        bar1._onLayout = function() {
          bar1OnLayout();

          if (bar1.hidden) {
            onLayoutBar1Called = true;

            // reset to original method
            bar1._onLayout = bar1OnLayout;

            onLayout();
          }
        };

        bar2._onLayout = function() {
          bar2OnLayout();

          if (!bar2.hidden) {
            onLayoutBar2Called = true;

            // reset to original method
            bar2._onLayout = bar2OnLayout;

            onLayout();
          }
        };

        //now hide bar1 and show bar2
        bar1.hidden = true;
        bar2.hidden = false;

      });
    });

  });

  describe('Implementation Details', function() {

    var el;

    beforeEach(function() {
      el = new Coral.ActionBar();

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    it('should move "invisible" items into popovers once popovers are opened and moved back once popover is closed', function(done) {

      el.primary.threshold = -1;

      // make sure only a few elements fit
      el.style.width = '300px';

      // create 100 items they should not fit on screen and therefore be hidden
      for (var i = 0; i < 100; i++) {
        el.primary.items.add({}).appendChild(new Coral.Button());
      }

      // save original methods for later use
      var originalOnLayout = el._onLayout;

      // overwrite methods and internally use the originals
      el._onLayout = function() {
        originalOnLayout();

        // there should be no items in popover so far
        expect(el.primary._itemsInPopover.length).to.equal(0);

        // open the popover => some items should be moved into the popover
        el.primary._elements.popover.open = true;

        // there should now be some items in the popover
        expect(el.primary._itemsInPopover.length > 0).to.be.true;

        // you should still be able to get all items over the Collection Api (also the ones in the popover)
        expect(el.primary.items.getAll().length).to.equal(100);

        // close the popover => all items should be moved back from popover
        el.primary._elements.popover.open = false;

        // there should be no items in popover
        expect(el.primary._itemsInPopover.length).to.equal(0);

        // you should still be able to get all items over the Collection Api (also the ones in the popover)
        expect(el.primary.items.getAll().length).to.equal(100);

        // reset to original method
        el._onLayout = originalOnLayout;

        done();
      };
    });


    it('should move items offscreen, if there is not enough space available at screen', function(done) {
      el.primary.threshold = -1;

      // make sure only a few elements fit
      el.style.width = '300px';

      // create 100 items they should not fit on screen and therefore be hidden
      for (var i = 0; i < 100; i++) {
        el.primary.items.add({}).appendChild(new Coral.Button());
      }

      // save original methods for later use
      var originalOnLayout = el._onLayout;

      // overwrite methods and internally use the originals
      el._onLayout = function() {
        originalOnLayout();

        expect(el.primary.items.getAll().length).to.equal(100);
        expect(el.secondary.items.getAll().length).to.equal(0);

        //several items on the left side should be hidden
        expect(el.primary.items._getAllOffScreen().length > 0).to.be.true;
        expect(el.secondary.items._getAllOffScreen().length).to.equal(0);

        // reset to original method
        el._onLayout = originalOnLayout;

        done();
      };

    });

    it('should not move items to popover, that are hidden on purpose', function(done) {
      el.primary.threshold = 1;

      el.primary.items.add({});
      el.primary.items.add({});
      el.primary.items.add({
        hidden: true
      });
      el.primary.items.add({
        hidden: true
      });

      // save original methods for later use
      var originalOnLayout = el._onLayout;

      // overwrite methods and internally use the originals
      el._onLayout = function() {
        originalOnLayout();

        expect(el.primary.items.getAll().length).to.equal(4);

        //only one item on the left side should be hidden
        expect(el.primary.items._getAllOffScreen().length).to.equal(1);

        // reset to original method
        el._onLayout = originalOnLayout;

        done();
      };

    });

    it('should be possible to add items straight after init without messing up the order... (more button used to go to the wrong place)', function(done) {

      var leftItem1 = el.primary.items.add({});
      leftItem1.appendChild(new Coral.Button());

      var leftItem2 = el.primary.items.add({});
      leftItem2.appendChild(new Coral.Button());

      var rightItem1 = el.secondary.items.add({});
      rightItem1.appendChild(new Coral.Button());

      var rightItem2 = el.secondary.items.add({});
      rightItem2.appendChild(new Coral.Button());

      helpers.next(function() {
        // Firefox is a bit slower in reordering after attaching the more button
        helpers.next(function() {

          //assert that the order of element in dom is correct (once more button is in dom)
          expect(leftItem1.$.index() < leftItem2.$.index() < el.primary._elements.moreButton.$.index()).to.be.true;
          expect(el.secondary._elements.moreButton.$.index() < rightItem1.$.index() < rightItem2.$.index()).to.be.true;
          done();
        });
      });
    });


    it('should be possible to create an actionbar that is initially hidden (one of its parents is display:none)', function(done) {
      var outer = document.createElement('div');
      outer.style.display = 'none';

      el = new Coral.ActionBar();
      outer.appendChild(el);

      el.primary.items.add({}).appendChild(new Coral.Button());

      helpers.target.appendChild(outer);

      Coral.commons.ready(outer, function() {
        // show outer
        outer.style.display = 'inherit';

        // save original methods for later use
        var originalOnLayout = el._onLayout;

        // overwrite methods and internally use the originals
        el._onLayout = function() {
          originalOnLayout();

          // there should be no items offscreen
          // in chrome/safari there used to be 1 in here
          expect(el.primary.items._getAllOffScreen().length).to.equal(0);

          // reset to original method
          el._onLayout = originalOnLayout;

          done();
        };

      });
    });

    it('should allow tab navigation to jump between left side and right side of the actionbar all items in between do not have a tabindex )', function(done) {
      helpers.build(window.__html__['Coral.ActionBar.html'], function(bar) {

        helpers.next(function() {
          expect(document.activeElement.tagName.toLowerCase()).to.not.equal('button', 'activeElement should not be an one of the buttons inside the actionbar');

          var leftActionBarItems = bar.primary.items.getAll();
          var rightActionBarItems = bar.secondary.items.getAll();

          // simulate a tab press on first item in actionbar simply by setting focus as I can't trigger a real one ..
          var firstButton = leftActionBarItems[0].querySelector('button');
          firstButton.focus();

          expect(document.activeElement).to.equal(firstButton, 'activeElement should now be the first wrapped item (here button) inside the actionbar');
          expect(document.activeElement.getAttribute('tabindex')).to.not.equal('-1', 'this element should be tabable');
          expect(bar.primary._elements.moreButton.getAttribute('tabindex')).to.equal('-1', 'more should not be tabable');


          var i = 0;
          for (i = 1; i < leftActionBarItems.length; i++) {
            expect(leftActionBarItems[i].querySelector('button').getAttribute('tabindex')).to.equal('-1', 'all other items should not be tabable("' + i + '" failed"');
          }

          // in this case the right more button should be tabable and no item on the right side
          expect(bar.secondary._elements.moreButton.getAttribute('tabindex')).to.not.equal('-1', 'more should be tabable');
          for (i = 0; i < rightActionBarItems.length; i++) {
            expect(rightActionBarItems[i].querySelector('button').getAttribute('tabindex')).to.equal('-1', 'all other items should not be tabable("' + i + '" failed"');
          }

          done();
        });
      });
    });

  });

});
