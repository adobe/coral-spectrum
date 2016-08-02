describe('Coral.Collection', function() {
  'use strict';

  before(function() {
    Coral.register({
      name: 'CollectionTestItem',
      tagName: 'coral-collection-test-item'
    });

    Coral.register({
      name: 'CollectionTestButtonItem',
      tagName: 'coral-collection-test-button-item',
      baseTagName: 'button'
    });
  });

  describe('Namespace', function() {
    it('should be defined in the Coral namespace', function() {
      expect(Coral).to.have.property('Collection');
    });
  });

  describe('Instantiation', function() {
    it('should not enable a custom element', function() {
      var test = document.createElement('coral-collection');
      expect(test).not.to.have.property('length');
    });
  });

  describe('API', function() {
    var element;
    var collection;
    var vanillaCollection;
    var onItemAddedSpy = sinon.spy();
    var onItemRemovedSpy = sinon.spy();
    var filter = function(element) {
      return !element.hasAttribute('excluded');
    };

    var addExcludedItem = function(title, collection) {
      var excludedItem = document.createElement('coral-collection-test-item');
      excludedItem.setAttribute('excluded', '');
      excludedItem.title = title;
      collection.add(excludedItem);
    };

    beforeEach(function() {
      element = document.createElement('div');
      vanillaCollection = new Coral.Collection();
      collection = new Coral.Collection({
        host: element,
        itemTagName: 'coral-collection-test-item',
        onItemAdded: onItemAddedSpy,
        onItemRemoved: onItemRemovedSpy,
        filter: filter
      });

      // Adding this allows us to test first() + filter
      addExcludedItem('-1', collection);

      collection.add({
        title: '0'
      });

      collection.add({
        title: '1'
      });

      // Adding this allows us to test last() + filter
      addExcludedItem('2', collection);
    });

    describe('#options', function() {
      it('should default container to host', function() {
        expect(collection._container).to.equal(element);
      });

      it('should default itemSelector to the itemTagName', function() {
        expect(collection._itemSelector).to.equal('coral-collection-test-item');
      });

      it('should support base tags in the default itemSelector', function() {
        var element = document.createElement('div');
        var collection = new Coral.Collection({
          host: element,
          itemTagName: 'coral-collection-test-button-item',
          itemBaseTagName: 'button'
        });

        expect(collection._itemSelector).to.equal('button[is="coral-collection-test-button-item"]');
      });
    });

    describe('#length', function() {
      it('should return the amount of items', function() {
        expect(collection.length).to.equal(2);
      });
    });

    describe('#getAll()', function() {
      it('should get all elements', function() {
        var all = collection.getAll();
        expect(all.length).to.equal(2);
        expect(all[0].title).to.equal('0');
        expect(all[1].title).to.equal('1');
      });

      it('should not return elements that do not pass the filter() function', function() {
        var all = collection.getAll();
        expect(all.length).to.equal(2);
        all.forEach(function(item) {
          expect(filter(item)).to.equal(true, 'should pass filter test');
        });
      });

      it('should return all element when no filter is provided', function() {
        // clears the filter for the purpose of the test
        collection._filter = undefined;

        var all = collection.getAll();

        expect(all.length).to.equal(4);
        expect(all[0].title).to.equal('-1');
        expect(all[3].title).to.equal('2');
      });

      it('should accept consider the itemSelector to query', function() {
        var e = document.createElement('div');
        var c = new Coral.Collection({
          host: e,
          itemTagName: 'coral-collection-test-item',
          itemSelector: 'coral-collection-test-item:not([excluded])'
        });

        addExcludedItem('-1', c);

        c.add({
          title: '0'
        });

        c.add({
          title: '1'
        });

        addExcludedItem('2', c);

        var all = c.getAll();
        expect(all.length).to.equal(2);

      });

      it('should throw an error if no host is provided', function() {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function() {
          vanillaCollection.getAll();
        }).to.throw(Error);
      });
    });

    describe('#clear()', function() {
      it('should remove all the items', function() {
        var length = element.children.length;
        var collectionLength = collection.length;

        expect(collectionLength).not.to.equal(0);
        collection.clear();

        expect(collection.length).to.equal(0);
        expect(element.children.length).to.equal(length - collectionLength);
      });

      it('should call onItemRemoved for every item removed', function() {
        onItemRemovedSpy.reset();
        collection.clear();
        expect(onItemRemovedSpy.callCount).to.equal(2);
      });
    });

    describe('#first()', function() {
      it('should return the first item in the collection', function() {
        expect(collection.first().title).to.equal('0');
      });

      it('should take the filter into consideration', function() {
        collection._filter = undefined;
        expect(collection.first().title).to.equal('-1');

        collection._filter = filter;
        expect(collection.first().title).to.equal('0');
      });

      it('should return null if the collection is empty', function() {
        collection.clear();
        expect(collection.first()).to.be.null;
      });

      it('should throw an error if no host is provided', function() {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function() {
          vanillaCollection.first();
        }).to.throw(Error);
      });
    });

    describe('#last()', function() {
      it('should return the last item in the collection', function() {
        expect(collection.last().title).to.equal('1');
      });

      it('should take the filter into consideration', function() {
        collection._filter = undefined;
        expect(collection.last().title).to.equal('2');

        collection._filter = filter;
        expect(collection.last().title).to.equal('1');
      });

      it('should return null if the collection is empty', function() {
        collection.clear();
        expect(collection.last()).to.be.null;
      });

      it('should throw an error if no host is provided', function() {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function() {
          vanillaCollection.last();
        }).to.throw(Error);
      });
    });

    describe('#add()', function() {
      it('should append items directly to the element by default', function() {
        var item = collection.add({
          title: '0'
        });

        expect(item.parentNode).to.equal(element);
      });

      it('should allow to insertBefore an item', function() {
        var all = collection.getAll();

        expect(all[0].title).to.equal('0');
        expect(all[1].title).to.equal('1');

        var newItem = collection.add({
          title: '0.5'
        }, all[1]);

        expect(collection.getAll()[1]).to.equal(newItem);
      });

      it('should append if insertBefore is null', function() {
        var newItem = collection.add({
          title: '3'
        }, null);

        var all = collection.getAll();

        expect(all[all.length - 1]).to.equal(newItem);
      });

      it('should append items into the specified container', function() {
        var element = document.createElement('div');
        var container = document.createElement('div');
        element.appendChild(container);

        var collection = new Coral.Collection({
          host: element,
          container: container,
          itemTagName: 'coral-collection-test-item'
        });

        var item = collection.add({
          title: '0'
        });

        expect(item.parentNode).to.equal(container);
      });

      it('should create elements with the specificed tagName', function() {
        var element = document.createElement('div');
        var collection = new Coral.Collection({
          host: element,
          itemTagName: 'coral-collection-test-item'
        });
        var item = collection.add({
          title: '3'
        });
        expect(item.tagName.toLowerCase()).to.equal('coral-collection-test-item');
      });

      it('should create elements with the specified baseTagName', function() {
        var element = document.createElement('div');
        var collection = new Coral.Collection({
          host: element,
          itemTagName: 'coral-collection-test-button-item',
          itemBaseTagName: 'button'
        });

        var item = collection.add({
          title: '0'
        });

        expect(item.tagName.toLowerCase()).to.equal('button');
        expect(item.getAttribute('is')).to.equal('coral-collection-test-button-item');
      });

      it('should add items to the specified container', function() {
        var element = document.createElement('div');
        var container = document.createElement('div');
        container.className = 'collection-container';
        element.appendChild(container);
        var collection = new Coral.Collection({
          host: element,
          container: container,
          itemTagName: 'coral-collection-test-item'
        });

        var item = collection.add({
          title: '0'
        });

        expect(item.parentNode).to.equal(container);
      });

      it('should call onItemAdded', function() {
        onItemAddedSpy.reset();
        collection.add({});
        expect(onItemAddedSpy.callCount).to.equal(1);
      });

      it('should not call onItemAdded if the host is not set', function() {
        onItemAddedSpy.reset();
        collection._host = undefined;
        expect(collection._container).not.to.be.undefined;
        collection.add({});
        expect(onItemAddedSpy.callCount).to.equal(0);
      });

      it('should throw an error if no host is provided', function() {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function() {
          vanillaCollection.add({});
        }).to.throw(Error);
      });
    });

    describe('#remove()', function() {
      it('should remove the item', function() {
        var length = collection.getAll().length;
        collection.remove(collection.first());
        expect(collection.getAll().length).to.equal(length - 1, 'length should decrease by 1');
      });

      it('should call onItemRemoved', function() {
        onItemRemovedSpy.reset();
        collection.remove(collection.first());
        expect(onItemRemovedSpy.callCount).to.equal(1);
      });

      it('should not call onItemRemoved if the host is not set', function() {
        onItemRemovedSpy.reset();
        var itemToRemove = collection.first();
        collection._host = undefined;
        collection.remove(itemToRemove);
        expect(onItemRemovedSpy.callCount).to.equal(0);
      });

      it('should not call onItemRemoved if the item was not in the DOM', function() {
        onItemRemovedSpy.reset();

        var item = document.createElement('coral-collection-test-item');
        collection.remove(item);

        expect(item.parentNode).to.be.null;
        expect(onItemRemovedSpy.callCount).to.equal(0);
      });
    });
  });
});
