describe('Coral.ColumnView.Column', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.ColumnView).to.have.property('Column');
      expect(Coral.ColumnView.Column).to.have.property('Content');
    });
  });

  describe('API', function() {
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function() {
      el = new Coral.ColumnView.Column();
      item1 = new Coral.ColumnView.Item();
      item2 = new Coral.ColumnView.Item();
      item3 = new Coral.ColumnView.Item();

      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    describe('#activeItem', function() {
      it('it should default to null', function() {
        expect(el.activeItem).to.be.null;
      });

      it('should not be settable', function() {
        el.activeItem = new Coral.ColumnView.Item();
        expect(el.activeItem).to.be.null;
      });

      it('should return an active item', function() {
        expect(el.activeItem).to.be.null;

        item1.active = true;
        expect(el.activeItem).to.equal(item1);
      });
    });

    describe('#content', function() {});

    describe('#items', function() {
      it('should not be settable', function() {
        el.items = null;
        expect(el.items).not.to.be.null;
      });
    });

    describe('#selectedItem', function() {
      it('it should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });

      it('should not be settable', function() {
        el.selectedItem = new Coral.ColumnView.Item();
        expect(el.selectedItem).to.be.null;
      });

      it('should return a selected item', function() {
        var item = new Coral.ColumnView.Item();

        el.items.add(item);

        expect(el.selectedItem).to.be.null;

        item.selected = true;
        expect(el.selectedItem).to.equal(item);
      });

      it('should return null when _selectionMode == null', function() {
        el._selectionMode = Coral.ColumnView.selectionMode.NONE;
        item1.selected = true;
        expect(el.selectedItem).to.be.null;
      });
    });

    describe('#selectedItems', function() {
      it('it should default to null', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });

      it('should not be settable', function() {
        el.selectedItems = [new Coral.ColumnView.Item()];
        expect(el.selectedItems).to.deep.equal([]);
      });

      it('should return a selected item', function() {
        var item = new Coral.ColumnView.Item();

        el.items.add(item);

        expect(el.selectedItem).to.be.null;

        item.selected = true;
        expect(el.selectedItem).to.equal(item);
      });
    });
  });

  describe('Markup', function() {
    describe('#content', function() {
      it('should not move items into the content zone if tag is explicitely given', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.Column.content.html'], function(el) {
          var button = el.querySelector('button');
          expect(button.parentElement).not.to.equal(el.content);

          done();
        });
      });

      it('should move items into the content zone if tag is not given', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.Column.content.implicit.html'], function(el) {
          var button = el.querySelector('button');
          expect(button.parentElement).to.equal(el.content);

          done();
        });
      });
    });
  });

  describe('Events', function() {});

  describe('User Interaction', function() {

    it('should selected an item when the thumbnail is clicked', function(done) {
      helpers.build(window.__html__['Coral.ColumnView.Column.base.html'], function(el) {
        // required since NONE will ignore selection
        el._selectionMode = Coral.ColumnView.selectionMode.SINGLE;

        var item = el.items.first();
        expect(el.selectedItem).to.be.null;

        item.thumbnail.click();
        expect(el.selectedItem).to.equal(item);

        // it should toggle
        item.thumbnail.click();
        expect(el.selectedItem).to.be.null;

        done();
      });
    });

    it('should ignore selection when _selectionMode = NONE', function(done) {
      helpers.build(window.__html__['Coral.ColumnView.Column.base.html'], function(el) {
        el._selectionMode = Coral.ColumnView.selectionMode.NONE;

        var item = el.items.first();
        expect(el.selectedItem).to.be.null;

        item.thumbnail.click();
        expect(el.selectedItem).to.be.null;

        done();
      });
    });
  });

  describe('Implementation Details', function() {});
});
