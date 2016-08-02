describe('Coral.Multifield', function() {
  'use strict';

  // Mock for dragging
  function dragTo(dragAction, x, y) {
    var action = function(type, x, y) {
      dragAction[type]({
        pageX: x,
        pageY: y,
        preventDefault: function() {},
        target: {}
      });
    };
    action('_dragStart', 0, 0);
    action('_drag', x, y);
    action('_dragEnd', x, y);
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Multifield');
      expect(Coral.Multifield).to.have.property('Item');
    });
  });

  describe('API', function() {
    describe('#items', function() {});
    describe('#template', function() {});
    describe('#coral-multifield-add', function() {});
    describe('#coral-multifield-template', function() {});
  });

  describe('Markup', function() {
    describe('#items', function() {});
    describe('#template', function() {});
    describe('#coral-multifield-add', function() {});
    describe('#coral-multifield-template', function() {});
  });

  describe('Collection API', function() {
    it('#items cannot be set', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        var items = el.items;
        el.items = null;
        expect(el.items).to.equal(items);
        done();
      });
    });

    it('triggers coral-collection:add on appendChild', function(done) {
      var eventSpy = sinon.spy();
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.on('coral-collection:add', eventSpy);
        var item = el.appendChild(new Coral.Multifield.Item());
        helpers.next(function() {
          var all = el.items.getAll();
          expect(all.length).to.equal(1);
          expect(all[0]).to.equal(item);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      var eventSpy = sinon.spy();
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.on('coral-collection:remove', eventSpy);
        var item = el.items.add({});
        helpers.next(function() {
          el.removeChild(item);
          helpers.next(function() {
            expect(el.items.length).to.equal(0);
            expect(eventSpy.callCount).to.equal(1);
            done();
          });
        });
      });
    });

    it('#add with before null should insert at the beginning if there are no items', function(done) {
      var el = new Coral.Multifield();
      var item = new Coral.Multifield.Item();
      el.items.add(item, null);
      var all = el.items.getAll();
      expect(all.length).to.equal(1);
      expect(all[0]).to.equal(item);
      expect(el.firstChild).to.equal(all[0]);
      done();
    });

    it('#add with before null should insert at the end of the last item if at least one item', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.items.add(new Coral.Multifield.Item(), null);
        var item = el.items.add(new Coral.Multifield.Item(), null);
        var all = el.items.getAll();
        expect(all.length).to.equal(2);
        expect(all[1]).to.equal(item);
        expect(all[0].$.next()[0]).to.equal(all[1]);
        done();
      });
    });

    it('#add is able to insert before', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.items.add(new Coral.Multifield.Item());
        var item = el.items.add(new Coral.Multifield.Item(), el.items.getAll()[0]);
        var all = el.items.getAll();
        expect(all.length).to.equal(2);
        expect(all[0]).to.equal(item);
        done();
      });
    });

    it('#add should also support config', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        var item = el.items.add({});
        var all = el.items.getAll();
        expect(all.length).to.equal(1);
        expect(all[0]).to.equal(item);
        expect(item.tagName).to.equal('CORAL-MULTIFIELD-ITEM');
        done();
      });
    });

    it('should trigger coral-collection:add event when adding an item', function(done) {
      var eventSpy = sinon.spy();
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.on('coral-collection:add', eventSpy);
        el.items.add(new Coral.Multifield.Item());
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:add should be called once');
          done();
        });
      });
    });

    it('should trigger coral-collection:remove event when removing an item', function(done) {
      var eventSpy = sinon.spy();
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.on('coral-collection:remove', eventSpy);
        el.items.add(new Coral.Multifield.Item());
        helpers.next(function() {
          el.items.remove(el.items.getAll()[0]);
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1, 'coral-collection:remove should be called once');
            expect(el.items.length).to.equal(0);
            done();
          });
        });
      });
    });

    it('#getAll should be empty initially', function() {
      expect((new Coral.Multifield()).items.getAll().length).to.equal(0);
    });

    it('#getAll should retrieve 1 item', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.items.add(new Coral.Multifield.Item());
        expect(el.items.getAll().length).to.equal(1);
        done();
      });
    });

    it('#clear should remove all items', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.items.add(new Coral.Multifield.Item());
        el.items.add(new Coral.Multifield.Item());
        el.items.clear();
        expect(el.items.length).to.equal(0);
        done();
      });
    });
  });

  describe('User Interaction', function() {
    it('should add an item if clicking the add content zone', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.$.find('[coral-multifield-add]').trigger('click');
        helpers.next(function() {
          expect(el.items.length).to.equal(1);
          done();
        });
      });
    });

    it('should remove an item if clicking the remove button', function(done) {
      helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
        el.items.add({});
        el.items.getAll()[0]._elements.remove.click();
        helpers.next(function() {
          expect(el.items.length).to.equal(0);
          done();
        });
      });
    });
  });

  describe('Events', function() {

    describe('#change', function() {
      it('should not trigger change event if item is removed and parent is not multifield', function(done) {
        var eventSpy = sinon.spy();
        var item = new Coral.Multifield.Item();
        helpers.target.appendChild(item);
        item.parentNode.addEventListener('change', eventSpy);
        item._elements.remove.click();
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should trigger a change event if removing a button by clicking the remove button', function(done) {
        var eventSpy = sinon.spy();
        helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
          el.addEventListener('change', eventSpy);
          var item = el.items.add({});
          item._elements.remove.click();
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            done();
          });
        });
      });

      it('should trigger a change event if reordering the items by drag and drop to bottom', function(done) {
        var eventSpy = sinon.spy();
        helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
          el.addEventListener('change', eventSpy);
          el.items.add({});
          el.items.add({});
          helpers.next(function() {
            expect(el.items.length).to.equal(2);
            dragTo(el.items.getAll()[0].dragAction, 0, 100);
            expect(eventSpy.callCount).to.equal(1);
            done();
          });
        });
      });

      it('should trigger a change event if reordering the items by drag and drop to top', function(done) {
        var eventSpy = sinon.spy();
        helpers.build(window.__html__['Coral.Multifield.base.html'], function(el) {
          el.addEventListener('change', eventSpy);
          el.items.add({});
          el.items.add({});
          helpers.next(function() {
            expect(el.items.length).to.equal(2);
            dragTo(el.items.getAll()[1].dragAction, 0, 0);
            expect(eventSpy.callCount).to.equal(1);
            done();
          });
        });
      });
    });
  });

  describe('Implementation Details', function() {});
});
