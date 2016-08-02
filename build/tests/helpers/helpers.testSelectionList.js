var helpers = helpers || {};

helpers.testSelectionList = function(Group, GroupItem) {
  'use strict';

  var ready = Coral.commons.ready;

  describe('API', function() {

    var group;

    beforeEach(function(done) {
      group = new Group();
      helpers.target.appendChild(group);
      ready(group, function() {
        done();
      });
    });

    afterEach(function() {
      group.remove();
      group = undefined;
    });

    describe('#selectedItem', function() {

      it('should default to null', function(done) {
        expect(group.selectedItem).to.be.null;
        expect(group.selectedItems.length).to.equal(0);
        done();
      });

      it('should take the last selected if not multiple, post init', function(done) {

        var item = group.items.add({});
        item = group.items.add({});
        item.selected = true;
        item = group.items.add({});
        item.selected = true;

        helpers.next(function() {
          var items = group.items.getAll();
          expect(group.selectedItem).to.equal(items[2]);
          expect(group.selectedItems).to.deep.equal([items[2]]);
          expect(items[2].selected).to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[2].selected).to.be.true;
            expect(items[2].$).to.have.attr('selected');
            expect(items[0].$).not.to.have.attr('selected');
            expect(items[0].selected).to.be.false;
            // checks again the items
            expect(group.selectedItem).to.equal(items[2]);
            expect(group.selectedItems).to.deep.equal([items[2]]);
            done();
          });
        });
      });

      it('should take the first selected on multiple, post init', function(done) {
        group.multiple = true;

        var item = group.items.add({});
        item.id = 'i1';
        item.selected = true;
        item = group.items.add({});
        item.id = 'i2';
        item = group.items.add({});
        item.id = 'i3';
        item.selected = true;

        helpers.next(function() {
          var items = group.items.getAll();
          expect(group.selectedItem, 'selected item is first item').to.equal(items[0]);
          expect(group.selectedItems, 'selected item maps to first and last item').to.deep.equal([items[0], items[2]]);
          expect(items[0].selected, 'selected flagged on first item').to.be.true;

          // The items that are not the last selected will not be set to selected=false until
          // the next frame in polyfilled environments.
          helpers.next(function() {
            expect(items[0].selected).to.be.true;
            expect(items[0].$).to.have.attr('selected');
            expect(items[2].$).to.have.attr('selected');
            expect(items[2].selected).to.be.true;
            // checks again the items
            expect(group.selectedItem).to.equal(items[0]);
            expect(group.selectedItems).to.deep.equal([items[0], items[2]]);
            done();
          });
        });
      });
    });

    it('#items cannot be set', function(done) {
      var items = group.items;
      group.items = null;
      Coral.commons.nextFrame(function() {
        expect(group.items).to.equal(items);
        done();
      });
    });

    it('#items should default to 0', function(done) {
      expect(group).to.have.property('items');
      expect(group.items.getAll().length).to.equal(0);
      done();
    });

    it('#set multiple should return set value', function(done) {
      group.multiple = true;
      expect(group.multiple).to.be.true;
      done();
    });

    it('triggers coral-collection:add on appendChild', function(done) {
      var eventSpy = sinon.spy();
      ready(new GroupItem(), function(item) {

        group.on('coral-collection:add', eventSpy);
        expect(item).to.equal(group.items.add(item));

        helpers.next(function() {
          var all = group.items.getAll();
          expect(all.length, 'items length').to.equal(1);
          expect(all[0], 'item match').to.equal(item);
          expect(eventSpy.calledOnce, 'event invoked once').to.be.true;
          done();
        });
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      var eventSpy = sinon.spy();

      var item1 = group.items.add(new GroupItem());
      var item2 = group.items.add(new GroupItem());

      helpers.next(function() {
        expect(group.items.getAll()).to.eql([item1, item2]);

        group.on('coral-collection:remove', eventSpy);
        group.removeChild(item1);

        helpers.next(function() {
          expect(group.items.getAll()).to.eql([item2]);
          done();
        });
      });
    });

    it('#add should support config to create an item', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      group.on('coral-collection:add', addSpy);
      group.on('coral-collection:remove', removeSpy);

      var item = group.items.add({});

      helpers.next(function() {
        expect(window.CustomElements.instanceof(item, GroupItem)).to.be.true;
        expect(group.items.getAll()).to.eql([item]);
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add with before null should insert at the end', function(done) {
      var item1 = group.items.add(new GroupItem());
      var item2 = new GroupItem();
      group.items.add(item2, null);

      helpers.next(function() {
        expect(group.items.getAll()).to.eql([item1, item2]);
        done();
      });
    });

    it('#add is able to insert before', function(done) {
      var item1 = group.items.add(new GroupItem());
      var item2 = new GroupItem();
      group.items.add(item2, item1);

      helpers.next(function() {
        expect(group.items.getAll()).to.eql([item2, item1]);
        done();
      });
    });

    it('#getAll should be empty initially', function() {
      expect(group.items.getAll().length).to.equal(0);
    });

    it('#clear should remove all items', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      group.items.add(new GroupItem());
      group.items.add(new GroupItem());

      helpers.next(function() {

        group.on('coral-collection:add', addSpy);
        group.on('coral-collection:remove', removeSpy);

        expect(group.items.length).to.equal(2);
        group.items.clear();
        expect(group.items.length).to.equal(0);

        helpers.next(function() {
          expect(addSpy.callCount).to.equal(0);
          expect(removeSpy.callCount).to.equal(2);
          done();
        });
      });
    });
  });
};
