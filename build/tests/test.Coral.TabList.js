/*global CustomElements:true */
describe('Coral.TabList', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('TabList');
    });
  });

  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.$).to.have.attr('aria-multiselectable', 'false');
      expect(el.$).to.have.class('coral-TabList');
      expect(el.selectedItem).to.be.null;

      expect(el.$).not.to.have.attr('selectedItem');
      expect(el.$).not.to.have.attr('variant');
      expect(el.$).not.to.have.attr('items');
    }

    it('should be possible using new', function() {
      var el = new Coral.TabList();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-tablist');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-tablist></coral-tablist>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });

    it('should be possible via clone using markup', function(done) {
      helpers.build(window.__html__['Coral.TabList.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using markup with textContent', function(done) {
      helpers.build(window.__html__['Coral.TabList.selectedItem.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via clone using js', function(done) {
      var el;
      var item1, item2, item3;

      el = new Coral.TabList();

      item1 = new Coral.Tab();
      item1.label.textContent = 'Item 1';

      item2 = new Coral.Tab();
      item2.label.textContent = 'Item 2';

      item3 = new Coral.Tab();
      item3.label.textContent = 'Item 3';

      el.appendChild(item1);
      el.appendChild(item2);
      el.appendChild(item3);

      helpers.target.appendChild(el);

      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    var el;
    var item1, item2, item3;

    beforeEach(function() {
      el = new Coral.TabList();
      helpers.target.appendChild(el);

      item1 = new Coral.Tab();
      item1.label.textContent = 'Item 1';

      item2 = new Coral.Tab();
      item2.label.textContent = 'Item 2';

      item3 = new Coral.Tab();
      item3.label.textContent = 'Item 3';
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    describe('#selectedItem', function() {

      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
        expect(el.items.length).to.equal(0);
      });

      it('should automatically select the first available item', function(done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);

        // The trigger for automatically selecting the first item is within the
        // TabList.Item.attachedCallback which is called asynchronously in polyfilled environments.
        Coral.commons.nextFrame(function() {
          expect(el.selectedItem).to.equal(item1);
          expect(item1.selected).to.be.true;
          expect(item1.hasAttribute('selected')).to.be.true;
          done();
        });
      });

      it('should select another item when the active one is disabled', function() {
        el.appendChild(item1);
        el.appendChild(item2);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);

        item1.disabled = true;
        expect(el.selectedItem).to.equal(item2);

        item2.disabled = true;
        expect(el.selectedItem).to.be.null;
        expect(item1.selected).to.be.false;
        expect(item2.selected).to.be.false;
      });

      it('should select the tab that just became enabled', function() {
        el.appendChild(item1);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);

        item1.disabled = true;
        expect(el.selectedItem).to.be.null;
        expect(item1.selected).to.be.false;

        item1.disabled = false;
        expect(el.selectedItem).to.equal(item1);
      });

      it('selecting another item should modify #selectedItem', function() {
        el.appendChild(item1);
        el.appendChild(item2);

        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;
        expect(item2.selected).to.be.false;
        expect(item2.hasAttribute('selected')).to.be.false;

        item2.selected = true;

        expect(el.selectedItem).to.equal(item2);
        expect(item1.selected).to.be.false;
        expect(item1.hasAttribute('selected')).to.be.false;
        expect(item2.selected).to.be.true;
        expect(item2.hasAttribute('selected')).to.be.true;
      });

      it('removing an unselected item should not modify #selectedItem', function() {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
        item1.selected = true;

        item2.remove();

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;
        expect(item2.selected).to.be.false;
        expect(item2.hasAttribute('selected')).to.be.false;
        expect(item3.selected).to.be.false;
        expect(item3.hasAttribute('selected')).to.be.false;
      });

      it('should be null if all items are removed', function() {
        el.appendChild(item1);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;

        item1.remove();
        expect(el.selectedItem).to.be.null;
      });

      it('should be null the last item is disabled', function() {
        el.appendChild(item1);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;

        item1.disabled = true;

        expect(el.selectedItem).to.be.null;
      });

      it('should be the first available item if the current selectedItem is removed', function(done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
        item1.selected = true;
        item2.disabled = true;

        // If we don't wait a frame after adding item1 before removing it, its attached and detached
        // handlers will never be called in a polyfilled environment. item1's detached handler is
        // what will set item1.selected to false.
        Coral.commons.nextFrame(function() {
          item1.remove();

          Coral.commons.nextFrame(function() {
            expect(el.selectedItem).to.equal(item3);
            expect(item2.selected).to.be.false;
            expect(item2.hasAttribute('selected')).to.be.false;
            expect(item3.selected).to.be.true;
            expect(item3.hasAttribute('selected')).to.be.true;
            done();
          });
        });
      });
    });

    // describe('#variant', function() {
    //   it('should default to Coral.TabList.variant.DEFAULT', function() {
    //     expect(el.variant).to.equal(Coral.TabList.variant.DEFAULT);
    //   });

    //   it('should be settable', function(done) {
    //     el.variant = Coral.TabList.variant.STACKED;
    //     expect(el.variant).to.equal(Coral.TabList.variant.STACKED);

    //     el.variant = Coral.TabList.variant.LARGE;
    //     expect(el.variant).to.equal(Coral.TabList.variant.LARGE);

    //     Coral.commons.nextFrame(function() {
    //       expect(el.$).to.have.class('coral-TabList--large');
    //       done();
    //     });
    //   });
    // });

    describe('#icon', function() {
      var defaultMarkup = window.__html__['Coral.TabList.base.html'];

      it('should be initially empty', function(done) {
        helpers.build(defaultMarkup, function(el) {
          var items = el.items.getAll();

          expect(items[0].$).not.to.have.attr('icon');
          expect(items[0]._elements.icon).to.be.undefined;
          done();
        });
      });

      it('should set the new icon', function(done) {
        helpers.build(defaultMarkup, function(el) {
          var items = el.items.getAll(),
            tabPanelItem = items[0];

          tabPanelItem.icon = 'gear';

          // for some reason IE needs another frame
          Coral.commons.nextFrame(function() {
            var $iconEl = $(tabPanelItem._elements.icon);

            expect(tabPanelItem._elements.icon).to.exist;
            expect(tabPanelItem._elements.icon.icon).to.equal('gear');
            expect($iconEl).to.have.class('coral-Icon');

            // By Default, Extra Small icons are used in tab panel
            expect(tabPanelItem._elements.icon.size).to.equal(Coral.Icon.size.SMALL);
            done();
          });
        });
      });
    });

    it('should trigger a coral-tablist:change event when an item is selected', function() {
      var spy = sinon.spy();
      el.on('coral-tablist:change', spy);
      el.appendChild(item1);
      el.appendChild(item2);

      item1.selected = true;
      expect(spy.callCount).to.equal(1);
      expect(spy.getCall(0).calledWithMatch({
        detail: {
          oldSelection: null,
          selection: item1
        }
      })).to.be.true;

      item2.selected = true;
      expect(spy.callCount).to.equal(2);
      expect(spy.getCall(1).calledWithMatch({
        detail: {
          oldSelection: item1,
          selection: item2
        }
      })).to.be.true;
    });
  });

  describe('Markup', function() {

    describe('#target', function() {
      it('should default to null', function(done) {
        helpers.build(window.__html__['Coral.TabList.base.html'], function(el) {
          expect(el.target).to.be.null;
          done();
        });
      });

      it('should not fail with empty string', function(done) {
        helpers.build(window.__html__['Coral.TabList.target.html'], function(el) {
          expect(el.target).to.equal('');

          // waits for the sync to be called
          helpers.next(function() {
            done();
          });
        });
      });
    });

    describe('#selectedItem', function() {
      it('should default to the first item', function(done) {
        helpers.build(window.__html__['Coral.TabList.base.html'], function(el) {
          expect(el.selectedItem).to.equal(el.items.getAll()[0]);
          done();
        });
      });

      it('should take the last selected', function(done) {
        helpers.build(window.__html__['Coral.TabList.doubleselected.html'], function(el) {
          var items = el.items.getAll();
          expect(el.selectedItem).to.equal(items[2]);
          expect(items[2].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          Coral.commons.nextFrame(function() {
            expect(items[1].selected).to.be.false;
            expect(items[1].$).not.to.have.attr('selected');
            expect(items[2].selected).to.be.true;
            done();
          });
        });
      });

      it('should read the selected from the markup', function(done) {
        helpers.build(window.__html__['Coral.TabList.selectedItem.html'], function(el) {
          expect(el.selectedItem).to.equal(el.items.getAll()[1]);
          done();
        });
      });
    });
  });

  describe('User Interaction', function() {
    var defaultMarkup = window.__html__['Coral.TabList.base.html'];
    var selectedItemMarkup = window.__html__['Coral.TabList.selectedItem.html'];

    it('should select tab on click', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();

        expect(items.length).to.equal(5);

        expect(el.selectedItem).to.equal(items[0]);

        items[1].click();

        expect(items[0].selected).to.be.false;

        Coral.commons.nextFrame(function() {
          expect(items[0].$).not.to.have.class('is-selected');
          expect(items[0].$).to.have.attr('tabindex', '-1');

          expect(el.selectedItem).to.equal(items[1]);

          done();
        });
      });
    });

    it('should ignore clicks on disabled tabs', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();

        expect(items.length).to.equal(5);

        expect(el.selectedItem).to.equal(items[0]);

        items[3].click();

        expect(items[0].selected).to.be.true;
        done();
      });
    });

    it('should select the last tab on end press', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();

        expect(items.length).to.equal(5);

        expect(el.selectedItem).to.equal(items[0]);

        // focuses the item before producing the key press
        items[0].focus();

        // expect(document.activeElement).to.equal(items[0]);

        helpers.keypress('end', items[0]);

        expect(el.selectedItem).to.equal(items[4]);
        // expect(document.activeElement).to.equal(items[4]);
        done();
      });
    });

    it('should select the first tab on home press', function(done) {
      helpers.build(selectedItemMarkup, function(el) {
        var items = el.items.getAll();

        expect(el.selectedItem).to.equal(items[1]);

        // focuses the item before producing the key press
        items[1].focus();

        // expect(document.activeElement).to.equal(items[1]);

        helpers.keypress('home', items[1]);

        expect(el.selectedItem).to.equal(items[0]);
        // expect(document.activeElement).to.equal(items[0]);
        done();
      });
    });

    it('should select the next tab on pagedown, right, and down', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();

        // expect(document.activeElement).to.equal(items[0]);

        helpers.keypress('pagedown', items[0]);

        expect(el.selectedItem).to.equal(items[1]);
        // expect(document.activeElement).to.equal(items[1]);

        helpers.keypress('right', items[1]);

        expect(el.selectedItem).to.equal(items[2]);
        // expect(document.activeElement).to.equal(items[2]);

        helpers.keypress('down', items[2]);

        expect(el.selectedItem).to.equal(items[4]);
        // expect(document.activeElement).to.equal(items[4]);
        done();
      });
    });

    it('should select the previous item on pageup, left and up', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();

        // forces the selected item to be the last one
        helpers.keypress('end', items[0]);
        expect(el.selectedItem).to.equal(items[4]);

        helpers.keypress('pageup', items[4]);

        expect(el.selectedItem).to.equal(items[2]);

        helpers.keypress('left', items[2]);

        expect(el.selectedItem).to.equal(items[1]);

        helpers.keypress('up', items[1]);

        expect(el.selectedItem).to.equal(items[0]);
        done();
      });
    });

    it.skip('should select the tab by pressing meta+pageup inside panel ', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();
        var button = el.$.find('button')[0];

        var spy = sinon.spy(items[0], 'focus');

        helpers.keypress('pageup', button, ['meta']);

        expect(el.selectedItem).to.equal(items[0]);
        expect(spy.callCount).to.equal(1);

        helpers.keypress('pageup', button, ['shift']);

        expect(el.selectedItem).to.equal(items[0]);
        expect(spy.callCount).to.equal(1);

        helpers.keypress('pageup', button, ['ctrl']);

        expect(el.selectedItem).to.equal(items[0]);
        expect(spy.callCount).to.equal(2);
        done();
      });
    });

    it.skip('should select the next tab by pressing meta+pagedown inside panel', function(done) {
      helpers.build(defaultMarkup, function(el) {
        var items = el.items.getAll();
        var button = el.$.find('button')[0];

        expect(el.selectedItem).to.equal(items[0]);

        helpers.keypress('pagedown', button, ['meta']);

        expect(el.selectedItem).to.equal(items[1]);

        // goes back to the first item since this is the only one that has a button
        items[0].selected = true;

        helpers.keypress('pagedown', button, ['shift']);

        expect(el.selectedItem).to.equal(items[0]);

        helpers.keypress('pagedown', button, ['ctrl']);

        expect(el.selectedItem).to.equal(items[1]);
        done();
      });
    });
  });

  describe('Implementation Details', function() {
    var el;
    var item1, item2, item3;

    beforeEach(function() {
      el = new Coral.TabList();
      helpers.target.appendChild(el);

      item1 = new Coral.Tab();
      item1.label.textContent = 'Item 1';

      item2 = new Coral.Tab();
      item2.label.textContent = 'Item 2';

      item3 = new Coral.Tab();
      item3.label.textContent = 'Item 3';
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    // it('#variant', function(done) {
    //   el.variant = Coral.TabList.variant.STACKED;

    //   Coral.commons.nextFrame(function() {
    //     expect($(el).hasClass('coral-TabList--vertical')).to.be.true;
    //     done();
    //   });
    // });

    it('clicking the tab should select the tab', function(done) {
      el.appendChild(item1);
      el.appendChild(item2);
      el.appendChild(item3);

      Coral.commons.nextFrame(function() {
        var tab1 = $(el).find('[role=tab]').first();
        tab1.trigger('click');

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        done();
      });
    });
  });

  describe('Collection API', function() {

    var addSpy;
    var removeSpy;

    var el;
    var item1, item2, item3;

    beforeEach(function() {
      el = new Coral.TabList();
      helpers.target.appendChild(el);

      item1 = new Coral.Tab();
      item1.label.textContent = 'Item 1';

      item2 = new Coral.Tab();
      item2.label.textContent = 'Item 2';

      item3 = new Coral.Tab();
      item3.label.textContent = 'Item 3';

      addSpy = sinon.spy();
      removeSpy = sinon.spy();

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);
    });

    afterEach(function() {
      el.off('coral-collection:add', addSpy);
      el.off('coral-collection:remove', removeSpy);

      addSpy = removeSpy = undefined;
      el = item1 = item2 = item3 = null;
    });

    it('#items cannot be set', function() {
      el.appendChild(item1);
      el.appendChild(item2);

      var items = el.items;

      el.items = null;

      expect(el.items).to.equal(items);
    });

    it('triggers coral-collection:add on appendChild', function(done) {
      el.appendChild(item1);
      el.appendChild(item2);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item1);
      expect(all[1]).to.equal(item2);

      Coral.commons.nextFrame(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['Coral.TabList.base.html'], function() {

        el.on('coral-collection:add', addSpy);
        el.on('coral-collection:remove', removeSpy);

        expect(el.items.length).to.equal(5);

        var all = el.items.getAll();
        var item = all[2];

        el.removeChild(item);

        expect(el.items.length).to.equal(4);

        Coral.commons.nextFrame(function() {
          expect(addSpy.callCount).to.equal(0);
          expect(removeSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      expect(el.items.length).to.equal(3);

      var all = el.items.getAll();
      var item = all[2];

      // We must wait a frame between adding and removing an item otherwise the polyfill will not
      // call its attachedCallback or detachedCallback which is what triggers the event.
      Coral.commons.nextFrame(function() {

        el.removeChild(item);

        expect(el.items.length).to.equal(2);

        Coral.commons.nextFrame(function() {
          expect(addSpy.callCount).to.equal(3);
          expect(removeSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('#add should add the item', function(done) {
      var ret = el.items.add(item1);
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(el.items.length).to.equal(1);
      expect(all.indexOf(item1)).to.equal(0);
      expect(ret).to.equal(item1);

      Coral.commons.nextFrame(function() {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add should also support config', function(done) {
      var ret = el.items.add({
        label: {
          textContent: 'Header 1'
        },
        selected: true,
        disabled: false,
        invalid: true,
        content: {
          textContent: 'content'
        }
      });
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(all.indexOf(ret)).to.equal(0);
      // Asserting using native instanceof doesn't work in IE9
      expect(CustomElements.instanceof(ret, Coral.Tab)).to.be.true;

      expect(ret.label.textContent).to.equal('Header 1');
      expect(ret.selected).to.be.true;
      expect(ret.disabled).to.be.false;
      expect(ret.invalid).to.be.true;
      expect(ret.content.textContent).to.equal('content');

      Coral.commons.nextFrame(function() {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add with before null should insert at the end', function(done) {
      el.items.add(item1, null);
      el.items.add(item2, null);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item1);
      expect(all[1]).to.equal(item2);

      Coral.commons.nextFrame(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add is able to insert before', function(done) {
      el.items.add(item1);
      el.items.add(item2, item1);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item2);
      expect(all[1]).to.equal(item1);

      Coral.commons.nextFrame(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add with both disabled and selected should make it unselected', function(done) {
      var ret = el.items.add({
        label: {
          textContent: 'Header 1'
        },
        selected: true,
        disabled: true
      });
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(all.indexOf(ret)).to.equal(0);
      // Asserting using native instanceof doesn't work in IE9
      expect(CustomElements.instanceof(ret, Coral.Tab)).to.be.true;

      expect(ret.label.textContent).to.equal('Header 1');
      expect(ret.selected).to.be.false;
      expect(ret.disabled).to.be.true;

      Coral.commons.nextFrame(function() {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#remove should remove the item', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['Coral.TabList.base.html'], function() {

        el.on('coral-collection:add', addSpy);
        el.on('coral-collection:remove', removeSpy);

        expect(el.items.length).to.equal(5);

        var all = el.items.getAll();
        var item = all[2];

        el.items.remove(item);

        expect(el.items.length).to.equal(4);

        Coral.commons.nextFrame(function() {
          expect(addSpy.callCount).to.equal(0);
          expect(removeSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('#getAll should be empty initially', function(done) {
      var all = el.items.getAll();
      expect(all.length).to.equal(0);

      Coral.commons.nextFrame(function() {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#clear should clear all the items', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['Coral.TabList.base.html'], function() {

        el.on('coral-collection:add', addSpy);
        el.on('coral-collection:remove', removeSpy);

        expect(el.items.length).to.equal(5);
        el.items.clear();
        expect(el.items.length).to.equal(0);

        Coral.commons.nextFrame(function() {
          expect(addSpy.callCount).to.equal(0);
          expect(removeSpy.callCount).to.equal(5);
          done();
        });
      });
    });
  });
});
