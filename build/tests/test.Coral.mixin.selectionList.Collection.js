describe('Coral.mixin.selectionList.Collection', function() {
  'use strict';

  var TestComponent = Coral.register({
    tagName: 'test-component',
    name: 'TestComponent',
    _render: function() {
      this.appendChild(document.createElement('test-component-content'));
    }
  });

  var TestComponentItem = Coral.register({
    tagName: 'test-component-item',
    name: 'TestComponentItem'
  });

  var host;
  var collection;
  var item1;
  var item2;
  var item3;

  beforeEach(function(done) {
    Coral.commons.ready(new TestComponent(), function(instance) {
      host = instance;
      collection = new Coral.mixin.selectionList.Collection({
        host: host,
        itemTagName: 'test-component-item'
      });
      item1 = collection.add(new TestComponentItem());
      item1.id = 'id1';
      item2 = collection.add({});
      item2.id = 'id2';
      item3 = collection.add({});
      item3.id = 'id3';

      helpers.next(function() {
        done();
      });
    });
  });

  describe('API', function() {

    it('#should be possible to decide where new items are added', function(done) {

      expect(item1.parentNode).to.equal(host, 'per default items are added directly to the host');

      Coral.commons.ready(new TestComponent(), function(instance) {
        var myHost = instance;
        var myTarget = myHost.querySelector('test-component-content');
        var myCollection = new Coral.mixin.selectionList.Collection({
          host: instance,
          container: myTarget,
          itemTagName: 'test-component-item'
        });

        var myItem1 = myCollection.add(new TestComponentItem());
        myItem1.id = 'myItem1';

        expect(myItem1.parentNode).to.equal(myTarget, 'item should be added to the wrapper div now');
        done();
      });

    });

    it('#getAll', function() {
      expect(collection.getAll()).to.eql([item1, item2, item3]);
    });

    it('#getSelected', function() {
      expect(collection.getSelected()).to.eql([]);

      item2.setAttribute('selected', true);
      item3.setAttribute('selected', true);
      expect(collection.getSelected()).to.eql([item2, item3]);
    });

    it('#getSelected, with disabled item', function() {
      expect(collection.getSelected()).to.eql([]);

      item2.setAttribute('selected', true);
      item3.setAttribute('selected', true);
      expect(collection.getSelected()).to.eql([item2, item3]);

      item3.setAttribute('disabled', true);
      expect(collection.getSelected()).to.eql([item2]);
    });

    it('#getSelected, with hidden item', function() {
      expect(collection.getSelected()).to.eql([]);

      item2.setAttribute('selected', true);
      item3.setAttribute('selected', true);
      expect(collection.getSelected()).to.eql([item2, item3]);

      item2.setAttribute('hidden', true);
      expect(collection.getSelected()).to.eql([item2, item3]);
    });

    describe('#getNextSelectable', function() {
      describe('with wrap=false', function() {
        it('should return the next item in the collection', function() {
          expect(collection.getNextSelectable(item1)).to.eql(item2);
          expect(collection.getNextSelectable(item2)).to.eql(item3);
          expect(collection.getNextSelectable(item3)).to.eql(item3);
        });

        it('should ignore items outside of the collection', function() {
          item2.remove();
          expect(collection.getNextSelectable(item1)).to.eql(item3);
          expect(collection.getNextSelectable(item2)).to.eql(item1);
          expect(collection.getNextSelectable(item3)).to.eql(item3);
        });

        it('should ignore hidden items', function() {
          item2.hide();
          expect(collection.getNextSelectable(item1)).to.eql(item3);
          expect(collection.getNextSelectable(item2)).to.eql(item1);
          expect(collection.getNextSelectable(item3)).to.eql(item3);
        });

        it('should ignore disabled items', function() {
          item2.setAttribute('disabled', true);
          expect(collection.getNextSelectable(item1)).to.eql(item3);
          expect(collection.getNextSelectable(item2)).to.eql(item1);
          expect(collection.getNextSelectable(item3)).to.eql(item3);
        });

        it('#getNextSelectable(null/undefined) should return first item', function() {
          expect(collection.getNextSelectable(undefined)).to.eql(item1);
          expect(collection.getNextSelectable(null)).to.eql(item1);
        });
      });

      describe('with wrap=true', function() {
        it('should return the next item in the collection', function() {
          expect(collection.getNextSelectable(item1, true)).to.eql(item2);
          expect(collection.getNextSelectable(item2, true)).to.eql(item3);
          expect(collection.getNextSelectable(item3, true)).to.eql(item1);
        });

        it('should ignore items outside of the collection', function() {
          item2.remove();
          expect(collection.getNextSelectable(item1, true)).to.eql(item3);
          expect(collection.getNextSelectable(item2, true)).to.eql(item1);
          expect(collection.getNextSelectable(item3, true)).to.eql(item1);
        });

        it('should ignore hidden items', function() {
          item2.hide();
          expect(collection.getNextSelectable(item1, true)).to.eql(item3);
          expect(collection.getNextSelectable(item2, true)).to.eql(item1);
          expect(collection.getNextSelectable(item3, true)).to.eql(item1);
        });

        it('should ignore disabled items', function() {
          item2.setAttribute('disabled', true);
          expect(collection.getNextSelectable(item1, true)).to.eql(item3);
          expect(collection.getNextSelectable(item2, true)).to.eql(item1);
          expect(collection.getNextSelectable(item3, true)).to.eql(item1);
        });

        it('#getNextSelectable(null/undefined) should return first item', function() {
          expect(collection.getNextSelectable(undefined, true)).to.eql(item1);
          expect(collection.getNextSelectable(null, true)).to.eql(item1);
        });
      });
    });

    describe('#getPreviousSelectable', function() {
      describe('with wrap=false', function() {
        it('#getPreviousSelectable', function() {
          expect(collection.getPreviousSelectable(item1)).to.eql(item1);
          expect(collection.getPreviousSelectable(item2)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3)).to.eql(item2);
        });

        it('#getPreviousSelectable, item not part of the collection', function() {
          item2.remove();
          expect(collection.getPreviousSelectable(item1)).to.eql(item1);
          expect(collection.getPreviousSelectable(item2)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3)).to.eql(item1);
        });

        it('#getPreviousSelectable, with hidden item', function() {
          item3.hide();
          expect(collection.getPreviousSelectable(item1)).to.eql(item1);
          expect(collection.getPreviousSelectable(item2)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3)).to.eql(item1);
        });

        it('#getPreviousSelectable, with disabled item', function() {
          item3.setAttribute('disabled', true);
          expect(collection.getPreviousSelectable(item1)).to.eql(item1);
          expect(collection.getPreviousSelectable(item2)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3)).to.eql(item1);
        });

        it('#getPreviousSelectable(null/undefined) should return first item', function() {
          expect(collection.getPreviousSelectable(undefined)).to.eql(item1);
          expect(collection.getPreviousSelectable(null)).to.eql(item1);
        });
      });

      describe('with wrap=true', function() {
        it('#getPreviousSelectable', function() {
          expect(collection.getPreviousSelectable(item1, true)).to.eql(item3);
          expect(collection.getPreviousSelectable(item2, true)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3, true)).to.eql(item2);
        });

        it('#getPreviousSelectable, item not part of the collection', function() {
          item2.remove();
          expect(collection.getPreviousSelectable(item1, true)).to.eql(item3);
          expect(collection.getPreviousSelectable(item2, true)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3, true)).to.eql(item1);
        });

        it('#getPreviousSelectable, with hidden item', function() {
          item3.hide();
          expect(collection.getPreviousSelectable(item1, true)).to.eql(item2);
          expect(collection.getPreviousSelectable(item2, true)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3, true)).to.eql(item1);
        });

        it('#getPreviousSelectable, with disabled item', function() {
          item3.setAttribute('disabled', true);
          expect(collection.getPreviousSelectable(item1, true)).to.eql(item2);
          expect(collection.getPreviousSelectable(item2, true)).to.eql(item1);
          expect(collection.getPreviousSelectable(item3, true)).to.eql(item1);
        });

        it('#getPreviousSelectable(null/undefined) should return first item', function() {
          expect(collection.getPreviousSelectable(undefined, true)).to.eql(item1);
          expect(collection.getPreviousSelectable(null, true)).to.eql(item1);
        });
      });
    });

    it('#getFirstSelectable', function() {
      expect(collection.getFirstSelectable()).to.eql(item1);
    });

    it('#getLastSelectable', function() {
      expect(collection.getLastSelectable()).to.eql(item3);
    });

    it('#getFirstSelected', function() {
      item1.setAttribute('selected', true);
      item2.setAttribute('selected', true);
      expect(collection.getFirstSelected()).to.eql(item1);
    });

    it('#getLastSelected', function() {
      item1.setAttribute('selected', true);
      item3.setAttribute('selected', true);
      expect(collection.getLastSelected()).to.eql(item3);
    });

    it('#deselectAll', function() {
      item1.setAttribute('selected', true);
      item2.setAttribute('selected', true);
      expect(collection.getSelected()).to.eql([item1, item2]);
      collection.deselectAll();
      expect(collection.getSelected()).to.eql([]);
    });

    it('#deselectAllExceptLast', function() {
      item1.setAttribute('selected', true);
      item2.setAttribute('selected', true);
      expect(collection.getSelected()).to.eql([item1, item2]);
      collection.deselectAllExceptLast();
      expect(collection.getSelected()).to.eql([item2]);
    });

    it('#deselectAllExcept', function() {
      item1.setAttribute('selected', true);
      item2.setAttribute('selected', true);
      item3.setAttribute('selected', true);
      expect(collection.getSelected()).to.eql([item1, item2, item3]);
      collection.deselectAllExcept(item2);
      expect(collection.getSelected()).to.eql([item2]);
    });
  });
});
