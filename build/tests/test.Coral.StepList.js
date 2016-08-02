/*global CustomElements:true */
describe('Coral.StepList', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('StepList');
    });

    it('should define the interaction in an enum', function() {
      expect(Coral.StepList.interaction).to.exist;
      expect(Coral.StepList.interaction.ON).to.equal('on');
      expect(Coral.StepList.interaction.OFF).to.equal('off');
      expect(Object.keys(Coral.StepList.interaction).length).to.equal(2);
    });

    it('should define the size in an enum', function() {
      expect(Coral.StepList.size).to.exist;
      expect(Coral.StepList.size.SMALL).to.equal('S');
      expect(Coral.StepList.size.LARGE).to.equal('L');
      expect(Object.keys(Coral.StepList.size).length).to.equal(2);
    });
  });

  function testDefaultInstance(el) {
    expect(el.$).to.have.attr('aria-multiselectable', 'false');
    expect(el.$).to.have.class('coral-StepList');
    expect(el.selectedItem).to.be.null;

    expect(el.$).not.to.have.attr('selectedItem');
    expect(el.$).not.to.have.attr('variant');
    expect(el.$).not.to.have.attr('items');
  }

  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var el = new Coral.StepList();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-steplist');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-steplist></coral-steplist>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });
  });

  var el;
  var item1;
  var item2;
  var item3;

  beforeEach(function() {
    el = new Coral.StepList();
    helpers.target.appendChild(el);

    item1 = new Coral.Step();
    item1.label.innerHTML = 'Item 1';

    item2 = new Coral.Step();
    item2.label.innerHTML = 'Item 2';

    item3 = new Coral.Step();
    item3.label.innerHTML = 'Item 3';
  });

  afterEach(function() {
    el = item1 = item2 = item3 = null;
  });

  describe('API', function() {
    describe('#interaction', function() {});
    describe('#size', function() {});
    describe('#target', function() {});
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
        // StepList.Item.attachedCallback which is called asynchronously in polyfilled environments.
        helpers.next(function() {
          expect(el.selectedItem).to.equal(item1);
          expect(item1.selected).to.be.true;
          expect(item1.hasAttribute('selected')).to.be.true;
          done();
        });
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


      it('should be the first available item, if the current selected item is removed', function(done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
        item1.selected = true;

        // If we don't wait a frame after adding item1 before removing it, its attached and detached handlers will never
        // be called in a polyfilled environment. item1's detached handler is what will set item1.selected to false.
        helpers.next(function() {
          item1.remove();

          helpers.next(function() {
            expect(el.selectedItem).to.equal(item2);
            expect(item2.selected).to.be.true;
            expect(item2.hasAttribute('selected')).to.be.true;
            expect(item3.selected).to.be.false;
            expect(item3.hasAttribute('selected')).to.be.false;
            done();
          });
        });
      });
    });

    describe('#previous()', function() {});
    describe('#next()', function() {});
  });

  describe('Markup', function() {
    describe('#interaction', function() {});
    describe('#size', function() {});
    describe('#target', function() {});
    describe('#selectedItem', function() {
      it('should default to the first item', function(done) {
        helpers.build(window.__html__['Coral.StepList.base.html'], function(el) {
          expect(el.selectedItem).to.equal(el.items.getAll()[0]);
          done();
        });
      });

      it('should take the last selected', function(done) {
        helpers.build(window.__html__['Coral.StepList.doubleselected.html'], function(el) {
          var items = el.items.getAll();
          expect(el.selectedItem).to.equal(items[2]);
          expect(items[2].selected).to.be.true;

          // the items that are not the last selected will not be set to selected=false until the next frame in
          // polyfilled environments.
          helpers.next(function() {
            expect(items[1].selected).to.be.false;
            expect(items[1].$).not.to.have.attr('selected');
            expect(items[2].selected).to.be.true;
            done();
          });
        });
      });

      it('should read the selected from the markup', function(done) {
        helpers.build(window.__html__['Coral.StepList.selectedItem.html'], function(el) {
          expect(el.selectedItem).to.equal(el.items.getAll()[1]);
          done();
        });
      });
    });
  });

  describe('Events', function() {
    describe('coral-steplist:change', function() {
      it('should not trigger an event when it initializes', function(done) {

        var changeSpy = sinon.spy();

        // adds the listener at the document level to see if something bubbles up when it is added to the DOM
        document.addEventListener('coral-steplist:change', changeSpy);

        helpers.build(window.__html__['Coral.StepList.base.html'], function(el) {
          expect(changeSpy.callCount).to.equal(0);
          // cleans the event
          document.removeEventListener('coral-steplist:change', changeSpy);
          done();
        });
      });

      it('should trigger an event when next() is called', function(done) {

        helpers.build(window.__html__['Coral.StepList.base.html'], function(el) {
          var changeSpy = sinon.spy();

          el.on('coral-steplist:change', changeSpy);
          el.next();

          expect(changeSpy.callCount).to.equal(1);

          done();
        });
      });

      it('should not trigger an event when next() on the last item', function(done) {

        helpers.build(window.__html__['Coral.StepList.selectedItem.html'], function(el) {

          var changeSpy = sinon.spy();

          el.on('coral-steplist:change', changeSpy);

          // goes to the 3rd item
          el.next();

          // nothing should happen
          el.next();

          expect(changeSpy.callCount).to.equal(1);

          done();
        });
      });

      it('should trigger an event when previous() is called', function(done) {

        helpers.build(window.__html__['Coral.StepList.selectedItem.html'], function(el) {
          var changeSpy = sinon.spy();

          el.on('coral-steplist:change', changeSpy);
          el.previous();

          expect(changeSpy.callCount).to.equal(1);

          done();
        });
      });

      it('should trigger a coral-steplist:change event when an item is selected', function() {
        var spy = sinon.spy();
        el.on('coral-steplist:change', spy);
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
  });

  describe('User Interaction', function() {
    var defaultMarkup = window.__html__['Coral.StepList.base.html'];
    var selectedItemMarkup = window.__html__['Coral.StepList.selectedItem.html'];

    it('should select step when marker clicked', function(done) {
      helpers.build(defaultMarkup, function(el) {
        // Turn interaction on
        el.interaction = Coral.StepList.interaction.ON;

        var items = el.items.getAll();

        expect(items.length).to.equal(5);

        expect(el.selectedItem).to.equal(items[0]);

        // Click the marker
        items[1]._elements.stepMarkerContainer.click();

        expect(items[0].selected).to.equal(false, 'item[0] is not selected');

        helpers.next(function() {
          expect(items[0].$).not.to.have.class('is-selected');

          expect(el.selectedItem).to.equal(items[1]);

          expect(items[1].selected).to.equal(true, 'item[1] is selected');

          done();
        });
      });
    });

    it('should select step when focused and enter pressed', function(done) {
      helpers.build(defaultMarkup, function(el) {
        // Turn interaction on
        el.interaction = Coral.StepList.interaction.ON;

        var items = el.items.getAll();

        expect(items.length).to.equal(5);

        expect(el.selectedItem).to.equal(items[0]);

        // Focus on the marker
        items[1].focus();

        // Press the enter key
        helpers.keypress(13, items[1]);

        expect(items[0].selected).to.equal(false, 'item[0] is not selected');

        helpers.next(function() {
          expect(items[0].$).not.to.have.class('is-selected');

          expect(el.selectedItem).to.equal(items[1]);

          expect(items[1].selected).to.equal(true, 'item[1] is selected');

          done();
        });
      });
    });

    it('should select the last step on end press', function(done) {
      helpers.build(defaultMarkup, function(el) {

        // we turn interaction on since keyboard is disabled otherwise
        el.interaction = Coral.StepList.interaction.ON;

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

    it('should select the first step on home press', function(done) {
      helpers.build(selectedItemMarkup, function(el) {

        // we turn interaction on since keyboard is disabled otherwise
        el.interaction = Coral.StepList.interaction.ON;

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

    it('should select the next step on pagedown, right, and down', function(done) {
      helpers.build(defaultMarkup, function(el) {

        // we turn interaction on since keyboard is disabled otherwise
        el.interaction = Coral.StepList.interaction.ON;

        var items = el.items.getAll();

        // expect(document.activeElement).to.equal(items[0]);

        helpers.keypress('pagedown', items[0]);

        expect(el.selectedItem).to.equal(items[1]);
        // expect(document.activeElement).to.equal(items[1]);

        helpers.keypress('right', items[1]);

        expect(el.selectedItem).to.equal(items[2]);
        // expect(document.activeElement).to.equal(items[2]);

        helpers.keypress('down', items[2]);

        expect(el.selectedItem).to.equal(items[3]);
        // expect(document.activeElement).to.equal(items[4]);
        done();
      });
    });

    it('should select the previous item on pageup, left and up', function(done) {
      helpers.build(defaultMarkup, function(el) {

        // we turn interaction on since keyboard is disabled otherwise
        el.interaction = Coral.StepList.interaction.ON;

        var items = el.items.getAll();

        // forces the selected item to be the last one
        helpers.keypress('end', items[0]);
        expect(el.selectedItem).to.equal(items[4]);

        helpers.keypress('pageup', items[4]);

        expect(el.selectedItem).to.equal(items[3]);

        helpers.keypress('left', items[3]);

        expect(el.selectedItem).to.equal(items[2]);

        helpers.keypress('up', items[2]);

        expect(el.selectedItem).to.equal(items[1]);
        done();
      });
    });
  });

  describe('Implementation Details', function() {
    it('clicking the step should select the step', function(done) {
      el.appendChild(item1);
      el.appendChild(item2);
      el.appendChild(item3);

      helpers.next(function() {
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

    beforeEach(function() {
      addSpy = sinon.spy();
      removeSpy = sinon.spy();

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);
    });

    afterEach(function() {
      el.off('coral-collection:add', addSpy);
      el.off('coral-collection:remove', removeSpy);

      addSpy = removeSpy = undefined;
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

      helpers.next(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['Coral.StepList.base.html'], function() {

        el.on('coral-collection:add', addSpy);
        el.on('coral-collection:remove', removeSpy);

        expect(el.items.length).to.equal(5);

        var all = el.items.getAll();
        var item = all[2];

        el.removeChild(item);

        expect(el.items.length).to.equal(4);

        helpers.next(function() {
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
      helpers.next(function() {

        el.removeChild(item);

        expect(el.items.length).to.equal(2);

        helpers.next(function() {
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

      helpers.next(function() {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add should also support config', function(done) {
      var ret = el.items.add({
        label: {
          innerHTML: 'Header 1'
        },
        selected: true,
        content: {
          innerHTML: 'content'
        }
      });
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(all.indexOf(ret)).to.equal(0);
      // Asserting using native instanceof doesn't work in IE9
      expect(CustomElements.instanceof(ret, Coral.Step)).to.be.true;

      expect(ret.label.innerHTML).to.equal('Header 1');
      expect(ret.selected).to.be.true;
      expect(ret.content.innerHTML).to.equal('content');

      helpers.next(function() {
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

      helpers.next(function() {
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

      helpers.next(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#remove should remove the item', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['Coral.StepList.base.html'], function() {

        el.on('coral-collection:add', addSpy);
        el.on('coral-collection:remove', removeSpy);

        expect(el.items.length).to.equal(5);

        var all = el.items.getAll();
        var item = all[2];

        el.items.remove(item);

        expect(el.items.length).to.equal(4);

        helpers.next(function() {
          expect(addSpy.callCount).to.equal(0);
          expect(removeSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('#getAll should be empty initially', function(done) {
      var all = el.items.getAll();
      expect(all.length).to.equal(0);

      helpers.next(function() {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#clear should clear all the items', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['Coral.StepList.base.html'], function() {

        el.on('coral-collection:add', addSpy);
        el.on('coral-collection:remove', removeSpy);

        expect(el.items.length).to.equal(5);
        el.items.clear();
        expect(el.items.length).to.equal(0);

        helpers.next(function() {
          expect(addSpy.callCount).to.equal(0);
          expect(removeSpy.callCount).to.equal(5);
          done();
        });
      });
    });
  });
});
