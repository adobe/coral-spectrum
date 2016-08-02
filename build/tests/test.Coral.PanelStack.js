/*global CustomElements:true */
describe('Coral.PanelStack', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('PanelStack');
      expect(Coral).to.have.property('Panel');
    });
  });

  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.$).to.have.class('coral-PanelStack');
      expect(el.selectedItem).to.be.null;

      expect(el.$).not.to.have.attr('selectedItem');
      expect(el.$).not.to.have.attr('items');
    }

    it('should be possible using new', function() {
      var el = new Coral.PanelStack();
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = document.createElement('coral-panelstack');
      testDefaultInstance(el);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-panelstack></coral-panelstack>', function(el) {
        testDefaultInstance(el);
        done();
      });
    });

    it('should be possible to clone the element using markup', function(done) {
      helpers.build(window.__html__['Coral.PanelStack.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.PanelStack();
      helpers.target.appendChild(el);

      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  var el;
  var item1, item2, item3;

  beforeEach(function() {
    el = new Coral.PanelStack();

    item1 = new Coral.Panel();
    item1.content.innerHTML = 'Item 1';

    item2 = new Coral.Panel();
    item2.content.innerHTML = 'Item 2';

    item3 = new Coral.Panel();
    item3.content.innerHTML = 'Item 3';

    helpers.target.appendChild(el);
  });

  afterEach(function() {
    el = item1 = item2 = item3 = null;
  });

  describe('Markup', function() {
    describe('#selectedItem', function() {
      it('should not automatically select an item', function(done) {
        helpers.build(window.__html__['Coral.PanelStack.base.html'], function(el) {
          expect(el.selectedItem).to.be.null;
          done();
        });
      });

      it('should take the last selected', function(done) {
        helpers.build(window.__html__['Coral.PanelStack.doubleselected.html'], function(el) {
          var items = el.items.getAll();
          expect(el.selectedItem).to.equal(items[2]);
          expect(items[2].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[1].selected).to.be.false;
            expect(items[1].$).not.to.have.attr('selected');
            expect(items[2].selected).to.be.true;
            done();
          });
        });
      });

      it('should read the selected from the markup', function(done) {
        helpers.build(window.__html__['Coral.PanelStack.selectedItem.html'], function(el) {
          expect(el.selectedItem).to.equal(el.items.getAll()[1]);
          done();
        });
      });
    });
  });

  describe('API', function() {
    describe('#selectedItem', function() {

      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
        expect(el.items.length).to.equal(0);
      });

      it('should not automatically select an item', function(done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);

        // The trigger for automatically selecting the first item is within the
        // PanelStack.Item.attachedCallback which is called asynchronously in polyfilled environments.
        helpers.next(function() {
          expect(el.selectedItem).to.be.null;
          expect(item1.selected).to.be.false;
          expect(item1.hasAttribute('selected')).to.be.false;
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
    });

    it('should not automatically select an item if the current selected item is removed', function(done) {
      el.appendChild(item1);
      el.appendChild(item2);
      el.appendChild(item3);
      item1.selected = true;

      // If we don't wait a frame after adding item1 before removing it, its attached and detached handlers will never
      // be called in a polyfilled environment. item1's detached handler is what will set item1.selected to false.
      helpers.next(function() {
        item1.remove();

        helpers.next(function() {
          expect(el.selectedItem).to.be.null;
          expect(item2.selected).to.be.false;
          expect(item2.hasAttribute('selected')).to.be.false;
          expect(item3.selected).to.be.false;
          expect(item3.hasAttribute('selected')).to.be.false;
          done();
        });
      });
    });

    it('should trigger a coral-panelstack:change event when an item is selected', function() {
      var spy = sinon.spy();
      el.on('coral-panelstack:change', spy);
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

  describe('Implementation Details', function() {});

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

      var el = helpers.build(window.__html__['Coral.PanelStack.base.html'], function() {

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
      expect(CustomElements.instanceof(ret, Coral.Panel)).to.be.true;

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

      var el = helpers.build(window.__html__['Coral.PanelStack.base.html'], function() {

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

      var el = helpers.build(window.__html__['Coral.PanelStack.base.html'], function() {

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
