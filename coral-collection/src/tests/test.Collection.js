/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {BaseComponent} from '../../../coral-base-component';
import {Collection} from '../../../coral-collection';
import {transform} from '../../../coral-utils';

describe('Collection', function () {
  var onItemAddedSpy = sinon.spy();
  var onItemRemovedSpy = sinon.spy();
  var onItemAddedNestedSpy = sinon.spy();
  var onItemRemovedNestedSpy = sinon.spy();
  var onCollectionChangedSpy = sinon.spy();
  var onNestedCollectionChangedSpy = sinon.spy();

  var filter = function (element) {
    return !element.hasAttribute('excluded');
  };

  // test collection container
  window.customElements.define('coral-collection-test', class extends BaseComponent(HTMLElement) {
    constructor() {
      super();
    }

    get items() {
      // we do lazy initialization of the collection
      if (!this._items) {
        this._items = new Collection({
          host: this,
          filter: filter,
          itemTagName: 'coral-collection-test-item',
          onItemAdded: onItemAddedSpy,
          onItemRemoved: onItemRemovedSpy,
          onCollectionChange: onCollectionChangedSpy
        });
      }

      return this._items;
    }
  });

  // test nested collection container
  window.customElements.define('coral-collection-nested-test', class extends BaseComponent(HTMLElement) {
    constructor() {
      super();
    }

    get items() {
      // we do lazy initialization of the collection
      if (!this._items) {
        this._items = new Collection({
          host: this,
          itemTagName: 'coral-collection-test-item',
          itemSelector: ':scope > coral-collection-test-item',
          filter: filter,
          onItemAdded: onItemAddedNestedSpy,
          onItemRemoved: onItemRemovedNestedSpy,
          onCollectionChange: onNestedCollectionChangedSpy
        });
      }

      return this._items;
    }

    connectedCallback() {
      // handles collection events automatically
      this.items._startHandlingItems();
    }
  });

  window.customElements.define('coral-collection-test-item', class extends BaseComponent(HTMLElement) {
    constructor() {
      super();
    }

    get title() {
      return this._title || this.getAttribute('title');
    }

    set title(value) {
      this._title = transform.string(value);
      this._reflectAttribute('title', this._title);
    }

    static get observedAttributes() {
      return ['title'];
    }
  });

  window.customElements.define('coral-collection-test-button-item', class extends BaseComponent(HTMLButtonElement) {
    constructor() {
      super();
    }
  }, {extends: 'button'});

  // we need to reset all the spies
  afterEach(function () {
    onItemAddedSpy.resetHistory();
    onItemRemovedSpy.resetHistory();
    onItemAddedNestedSpy.resetHistory();
    onItemRemovedNestedSpy.resetHistory();
    onCollectionChangedSpy.resetHistory();
    onNestedCollectionChangedSpy.resetHistory();
  });

  describe('Instantiation', function () {
    it('should not enable a custom element', function () {
      var test = document.createElement('coral-collection');
      expect(test).not.to.have.property('length');
    });
  });

  describe('API', function () {
    var vanillaCollection;

    var addExcludedItem = function (title, collection) {
      var excludedItem = document.createElement('coral-collection-test-item');
      excludedItem.setAttribute('excluded', '');
      excludedItem.title = title;
      collection.add(excludedItem);
    };

    beforeEach(function () {
      vanillaCollection = new Collection();
    });

    afterEach(function () {
      vanillaCollection = null;
    });

    describe('#options', function () {
      it('should default container to host', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        expect(el.items._container).to.equal(el);
      });

      it('should default itemSelector to the itemTagName', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        expect(el.items._itemSelector).to.equal('coral-collection-test-item');
        expect(el.items._allItemsSelector).to.equal('coral-collection-test-item');
      });

      it('should allow setting your own itemSelector', function () {
        var el = document.createElement('div');

        var collection = new Collection({
          host: el,
          itemTagName: 'coral-collection-test-item',
          itemSelector: 'coral-collection-test-item:not([disabled])'
        });

        expect(collection._itemSelector).to.equal('coral-collection-test-item:not([disabled])');
        expect(collection._allItemsSelector).to.equal(collection._itemSelector);
      });

      it('should default filter to undefined', function () {
        var el = document.createElement('div');

        var collection = new Collection({
          host: el,
          itemTagName: 'coral-collection-test-item'
        });

        expect(collection._filter).to.be.undefined;
      });

      it('should support base tags in the default itemSelector', function () {
        var element = document.createElement('div');
        var collection = new Collection({
          host: element,
          itemTagName: 'coral-collection-test-button-item',
          itemBaseTagName: 'button'
        });

        expect(collection._itemSelector).to.equal('button[is="coral-collection-test-button-item"]');
      });

      it('should convert :scope in the item selector to an id', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        expect(el.items._itemSelector).to.equal('coral-collection-test-item');
        expect(el.items._allItemsSelector).to.equal('#' + el.items._container.id + ' > coral-collection-test-item');
      });

      it('should call onCollectionChange on both collections with the initial state', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        const nestedEl = el.querySelector('coral-collection-nested-test');

        expect(onNestedCollectionChangedSpy.callCount).to.equal(2);
        // we cannot predict the order in every browser due to polyfills
        expect(onNestedCollectionChangedSpy.thisValues.includes(el)).to.be.true;
        expect(onNestedCollectionChangedSpy.thisValues.includes(nestedEl)).to.be.true;
        expect(onNestedCollectionChangedSpy.calledWith(el.items.getAll(), []), 'Changed callback for outer element');
        expect(onNestedCollectionChangedSpy.calledWith(nestedEl.items.getAll(), []), 'Changed callback for nested element');
      });

      it('should call onCollectionChange with the initial state', function () {
        const el = helpers.build(window.__html__['Collection.nested.html']);
        expect(onNestedCollectionChangedSpy.callCount).to.equal(1);
        expect(onNestedCollectionChangedSpy.getCall(0).args[0]).to.deep.equal(el.items.getAll(), 'Added nodes array must all the initial items');
        expect(onNestedCollectionChangedSpy.getCall(0).args[1]).to.deep.equal([], 'Removed nodes array must be empty');
      });

      it('should not call onCollectionChange when items are not handled', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        expect(onCollectionChangedSpy.callCount).to.equal(0);
      });

      it('should not call onCollectionChange when the item is excluded', function () {
        const el = helpers.build(window.__html__['Collection.nested.excluded.html']);
        expect(el.items.length).to.equal(0, 'Collection should have no items');
        expect(el.children.length).not.to.equal(0, 'It should have nodes that are not part of the collection');
        expect(onNestedCollectionChangedSpy.callCount).to.equal(0, 'Collection should have no initial items');
      });

      it('should not call any callback when there are no initial items', function () {
        const el = helpers.build(window.__html__['Collection.nested.empty.html']);
        expect(onItemAddedNestedSpy.callCount).to.equal(0, 'No item was added');
        expect(onItemRemovedNestedSpy.callCount).to.equal(0, 'No item was removed');
        expect(onNestedCollectionChangedSpy.callCount).to.equal(0, 'No collection change registered');
        expect(el.items.length).to.equal(0, 'Collection should not have no initial items');
      });
    });

    describe('#length', function () {
      it('should return the amount of items', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        expect(el.items.length).to.equal(5, 'should include the nested items but ignore the excluded');
      });

      it('should return the amount of items ignoring nested items', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        expect(el.items.length).to.equal(3, 'nested items should ignore the internal component');
      });
    });

    describe('#getAll()', function () {
      it('should get all elements', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var all = el.items.getAll();
        expect(all.length).to.equal(5);
        expect(all[0].title).to.equal('Item 1');
        expect(all[1].title).to.equal('Item 2');
        expect(all[2].title).to.equal('Nested Item 1');
        expect(all[3].title).to.equal('Nested Item 3');
        expect(all[4].title).to.equal('Item 4');
      });

      it('should get all elements', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var items = el.items.getAll();
        expect(items.length).to.equal(3);
        expect(items[0].title).to.equal('Item 1');
        expect(items[1].title).to.equal('Item 2');
        expect(items[2].title).to.equal('Item 4');
      });

      it('should not return elements that do not pass the filter() function', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var all = el.items.getAll();
        expect(all.length).to.equal(5);

        all.forEach(function (item) {
          expect(filter(item)).to.equal(true, 'should pass filter test');
        });
      });

      it('should return all element when no filter is provided', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        // clears the filter for the purpose of the test
        el.items._filter = undefined;

        var all = el.items.getAll();

        expect(all.length).to.equal(8);
        expect(all[0].title).to.equal('Item 1');
        expect(all[1].title).to.equal('Item 2');
        expect(all[2].title).to.equal('Item 3');
        expect(all[3].title).to.equal('Nested Item 1');
        expect(all[4].title).to.equal('Nested Item 2');
        expect(all[5].title).to.equal('Nested Item 3');
        expect(all[6].title).to.equal('Item 4');
        expect(all[7].title).to.equal('Item 5');
      });

      it('should consider the itemSelector to query', function () {
        var e = document.createElement('coral-collection-test');
        var c = new Collection({
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

      it('should throw an error if no host is provided', function () {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function () {
          vanillaCollection.getAll();
        }).to.throw(Error);
      });
    });

    describe('#clear()', function () {
      it('should remove all the items except excluded', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var length = el.querySelectorAll('coral-collection-test-item').length;
        var collectionLength = el.items.length;

        expect(collectionLength).not.to.equal(0);
        el.items.clear();

        expect(el.items.length).to.equal(0);
        expect(el.children.length).to.equal(length - collectionLength);
      });

      it('should call onItemRemoved for every item removed', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        el.items.clear();
        expect(onItemRemovedSpy.callCount).to.equal(5);
      });
    });

    describe('#first()', function () {
      it('should return the first item in the collection', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        expect(el.items.first().title).to.equal('Item 1');
      });

      it('should take the filter into consideration', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        el.items._filter = undefined;
        expect(el.items.first().title).to.equal('Item 1');

        el.items._filter = filter;
        expect(el.items.first().title).to.equal('Item 1');
      });

      it('should return null if the collection is empty', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        el.items.clear();
        expect(el.items.first()).to.be.null;
      });

      it('should throw an error if no host is provided', function () {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function () {
          vanillaCollection.first();
        }).to.throw(Error);
      });
    });

    describe('#last()', function () {
      it('should return the last item in the collection', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        expect(el.items.last().title).to.equal('Item 4');
      });

      it('should take the filter into consideration', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        el.items._filter = undefined;
        expect(el.items.last().title).to.equal('Item 5');

        el.items._filter = filter;
        expect(el.items.last().title).to.equal('Item 4');
      });

      it('should return null if the collection is empty', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        el.items.clear();
        expect(el.items.last()).to.be.null;
      });

      it('should throw an error if no host is provided', function () {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function () {
          vanillaCollection.last();
        }).to.throw(Error);
      });
    });

    describe('#add()', function () {
      it('should append items directly to the element by default', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var item = el.items.add({
          title: '0'
        });

        expect(item.parentNode).to.equal(el);
      });

      it('should allow to insertBefore an item', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var all = el.items.getAll();

        expect(all[0].title).to.equal('Item 1');
        expect(all[1].title).to.equal('Item 2');

        var newItem = el.items.add({
          title: '0.5'
        }, all[1]);

        expect(el.items.getAll()[1]).to.equal(newItem);
      });

      it('should append if insertBefore is null', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var newItem = el.items.add({
          title: '3'
        }, null);

        var all = el.items.getAll();

        expect(all[all.length - 1]).to.equal(newItem);
      });

      it('should append items into the specified container', function () {
        var element = document.createElement('coral-collection-test');
        var container = document.createElement('div');
        element.appendChild(container);

        var collection = new Collection({
          host: element,
          container: container,
          itemTagName: 'coral-collection-test-item'
        });

        var item = collection.add({
          title: '0'
        });

        expect(item.parentNode).to.equal(container);
      });

      it('should create elements with the specified tagName', function () {
        var element = document.createElement('coral-collection-test');
        var collection = new Collection({
          host: element,
          itemTagName: 'coral-collection-test-item'
        });
        var item = collection.add({
          title: '3'
        });
        expect(item.tagName.toLowerCase()).to.equal('coral-collection-test-item');
      });

      it('should create elements with the specified baseTagName', function () {
        var element = document.createElement('coral-collection-test');
        var collection = new Collection({
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

      it('should add items to the specified container', function () {
        var element = document.createElement('coral-collection-test');
        var container = document.createElement('coral-collection-test');
        container.className = 'collection-container';
        element.appendChild(container);
        var collection = new Collection({
          host: element,
          container: container,
          itemTagName: 'coral-collection-test-item'
        });

        var item = collection.add({
          title: '0'
        });

        expect(item.parentNode).to.equal(container);
      });

      it('should call onItemAdded immediately after an item is added', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var item = el.items.add({
          title: 'Item 6'
        });

        expect(onItemAddedSpy.callCount).to.equal(1);
        expect(onItemAddedSpy.getCall(0).args[0]).to.equal(item, 'should match the newly added item');
      });

      it('should not call onItemAdded when the item is excluded', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        expect(onItemAddedSpy.callCount).to.equal(0, 'no initial calls since _startHandlingItems has not been called');

        // we add an excluded item that should not call the callback
        addExcludedItem('Item 6', el.items);

        expect(onItemAddedSpy.callCount).to.equal(0);
      });

      it('should correctly call onItemAdded on nested and direct items', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var nestedEl = el.querySelector('coral-collection-nested-test');
        expect(onItemAddedNestedSpy.callCount).to.equal(5, 'Should include nested items');

        var call;
        var nestedCount = 0;
        var outerCount = 0;

        // we need to check that the calls are triggered by the correct collection. different browsers handle MO
        // differently, so we need to iterate over the calls to find what we want
        for (var i = 0 ; i < onItemAddedNestedSpy.callCount ; i++) {
          call = onItemAddedNestedSpy.getCall(i);

          if (call.thisValue === el) {
            outerCount++;
          } else if (call.thisValue === nestedEl) {
            nestedCount++;
          }
        }

        expect(outerCount).to.equal(el.items.length, 'Should be called for all direct items except excluded');
        expect(nestedCount).to.equal(nestedEl.items.length, 'Should be called for all internal items except excluded');
      });

      it('should delegate the call on onItemAdded when _startHandlingItems is called (nested)', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        // due to startHandlingItems, initial items also call the callback
        expect(onItemAddedNestedSpy.callCount).to.equal(5, 'Should include nested items');

        el.items.add({
          title: 'Item 6'
        });

        // we wait for the MO
        helpers.next(function () {
          expect(onItemAddedNestedSpy.callCount).to.equal(6);
          expect(onItemAddedNestedSpy.getCall(5).args[0].title).to.equal('Item 6', 'should match the newly added item');

          done();
        });
      });

      it('should delegate the call on onItemAdded when _startHandlingItems is called', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.subtree.html']);
        // due to startHandlingItems, initial items also call the callback
        expect(onItemAddedNestedSpy.callCount).to.equal(3, 'Previously added items should call the listener');

        el.items.add({
          title: 'Item 6'
        });

        // we wait for the MO
        helpers.next(function () {
          expect(onItemAddedNestedSpy.callCount).to.equal(4);
          expect(onItemAddedNestedSpy.getCall(3).args[0].title).to.equal('Item 6', 'should match the newly added item');

          done();
        });
      });

      it('should not call onItemAdded if the host is not set', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        el.items._host = undefined;
        expect(el.items._container).not.to.be.undefined;
        el.items.add({});
        expect(onItemAddedSpy.callCount).to.equal(0);
      });

      it('should throw an error if no host is provided', function () {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function () {
          vanillaCollection.add({});
        }).to.throw(Error);
      });
    });

    describe('#remove()', function () {
      it('should remove the item', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var length = el.items.getAll().length;
        el.items.remove(el.items.first());
        expect(el.items.getAll().length).to.equal(length - 1, 'length should decrease by 1');
      });

      it('should call onItemRemoved', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var item = el.items.first();
        el.items.remove(item);
        expect(onItemRemovedSpy.callCount).to.equal(1);
        expect(onItemRemovedSpy.getCall(0).args[0]).to.equal(item, 'It should match the removed item');
      });

      it('should not call onItemRemoved when the item is excluded', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        // we need to query the first item with excluded since it won't be part of the collection
        var item = el.querySelector('coral-collection-test-item[excluded]');
        el.items.remove(item);

        expect(onItemRemovedSpy.callCount).to.equal(0, 'it should be called since the item is excluded');


      });

      it('should delegate the call on onItemRemoved when _startHandlingItems is called', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var item = el.items.first();

        // we remove an item
        el.items.remove(item);
        expect(onItemRemovedNestedSpy.callCount).to.equal(0, 'callback should not be called immediately');

        // we wait for the MO
        helpers.next(function () {
          expect(onItemRemovedNestedSpy.callCount).to.equal(1);
          expect(onItemRemovedNestedSpy.getCall(0).args[0].title).to.equal(item.title, 'should match the newly added item');

          done();
        });
      });

      it('should not call onItemRemoved if the host is not set', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var itemToRemove = el.items.first();
        el.items._host = undefined;
        el.items.remove(itemToRemove);
        expect(onItemRemovedSpy.callCount).to.equal(0);
      });

      it('should not call onItemRemoved if the item was not in the DOM', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var item = document.createElement('coral-collection-test-item');
        el.items.remove(item);

        expect(item.parentNode).to.be.null;
        expect(onItemRemovedSpy.callCount).to.equal(0);
      });
    });

    describe('#_startHandlingItems', function () {
      it('should disconnect the old MO to avoid double events', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.html']);
        expect(onItemAddedNestedSpy.callCount).to.equal(3, 'should match the initial items');
        // we call the startHandleItems to make sure the MO is correctly setup. we use true to avoid initial items
        // from being processed again
        el.items._startHandlingItems(true);

        // we add an item to force a MO
        el.items.add({
          title: 'Item 6'
        });

        expect(onItemAddedNestedSpy.callCount).to.equal(3, 'should wait for the MO');

        helpers.next(function () {
          expect(onItemAddedNestedSpy.callCount).to.equal(4, 'added item should call onItemAdded callback');

          done();
        });
      });

      it('should skip the initial items again if skipInitialItems=true', function (done) {
        const el = helpers.build(window.__html__['Collection.base.html']);
        // we want to skip the initial items and initialize the MO
        el.items._startHandlingItems(true);

        var itemCount = el.items.length;
        expect(itemCount).to.equal(5);

        // we wait for the MO to be initialized
        helpers.next(function () {
          // if we would add this before the helpers.next, it would be processed as part of the initial items
          var item = el.items.add({
            title: 'Item 6'
          });

          expect(onItemAddedSpy.callCount).to.equal(0, 'item added callback is not called immediately');
          expect(onCollectionChangedSpy.callCount).to.equal(0, 'collection changed collback is not called immediately');

          // we wait for the MO
          helpers.next(function () {
            expect(el.items.length).to.equal(itemCount + 1, 'There should be 1 more item');
            expect(onItemAddedSpy.callCount).to.equal(1, 'Only the newly added item should call the callback');
            expect(onItemAddedSpy.getCall(0).args[0]).to.equal(item, 'Should match the added item');
            expect(onCollectionChangedSpy.callCount).to.equal(1, 'Callback should be called for the first item');
            expect(onCollectionChangedSpy.getCall(0).args[0]).to.deep.equal([item], 'Added items should include the new item');
            expect(onCollectionChangedSpy.getCall(0).args[1]).to.deep.equal([], 'Removed items should be empty');

            done();
          });
        });
      });

      it('should process the initial items again if skipInitialItems=false', function (done) {
        const el = helpers.build(window.__html__['Collection.base.html']);
        // we call the startHandleItems to make sure the MO is correctly setup. we use false to force initial items
        // from being processed
        el.items._startHandlingItems(false);

        var itemCount = el.items.length;
        expect(itemCount).to.equal(5);

        el.items.add({
          title: 'Item 6'
        });

        expect(onItemAddedSpy.callCount).to.equal(itemCount);
        expect(onCollectionChangedSpy.callCount).to.equal(1);

        // Wait for MO
        helpers.next(function () {
          expect(el.items.length).to.equal(itemCount + 1);
          expect(onItemAddedSpy.callCount).to.equal(itemCount + 1, 'all items should call the item add callback');
          expect(onCollectionChangedSpy.callCount).to.equal(2, 'initial items should call collection change callback');

          done();
        });
      });

      it('should process the initial items again if skipInitialItems=false', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var nestedEl = el.querySelector('coral-collection-nested-test');
        // we consider both outer and nested elements
        var itemCount = el.items.length + nestedEl.items.length;

        // we call the startHandleItems to make sure the MO is correctly setup. we use false to force initial items
        // from being processed
        el.items._startHandlingItems(false);

        expect(onItemAddedNestedSpy.callCount).to.equal(itemCount + el.items.length, 'should wait for the MO');
        expect(onNestedCollectionChangedSpy.callCount).to.equal(3, 'Should be called by both outer and nested');
      });

      it('should throw an error if no host is provided', function () {
        expect(vanillaCollection._host).to.be.undefined;
        expect(vanillaCollection._itemSelector).to.be.undefined;
        expect(function () {
          vanillaCollection._startHandlingItems();
        }).to.throw(Error);
      });
    });

    describe('#_stopHandlingItems', function () {
      it('should disconnect the MO when called', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.html']);
        // listens to collection events
        var collectionAddSpy = sinon.spy();
        el.on('coral-collection:add', collectionAddSpy);

        // disconnects the MO which stops onItemAdded and onItemRemoved from being called
        el.items._stopHandlingItems();

        el.items.add({
          title: 'Item 6'
        });

        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(0, 'collection events should not be triggered');
          expect(onItemAddedNestedSpy.callCount).to.equal(3, 'new item should not call the callback');

          done();
        });
      });

      it('should have no side effects if _startHandlingItems has not previously called ', function () {
        const el = helpers.build(window.__html__['Collection.base.html']);

        el.items._stopHandlingItems();

        expect(el.items._observer).to.be.undefined;
        expect(el.items._handleItems).to.be.false;
      });
    });
  });

  describe('Events', function () {
    describe('#coral-collection:add', function () {
      var collectionAddSpy = sinon.spy();

      beforeEach(function () {
        helpers.target.addEventListener('coral-collection:add', collectionAddSpy);
      });

      afterEach(function () {
        helpers.target.removeEventListener('coral-collection:add', collectionAddSpy);

        collectionAddSpy.resetHistory();
      });

      it('should not trigger collection events for initial items', function () {
        const el = helpers.build(window.__html__['Collection.nested.html']);
        expect(collectionAddSpy.callCount).to.equal(0, 'Should not be initially called');
        // excluded items should call the callback
        expect(onItemAddedNestedSpy.callCount).to.equal(3, 'But added callback must be called');
        expect(onNestedCollectionChangedSpy.callCount).to.equal(1, 'Initial state must be reported');
      });

      it('should not trigger collection events for initial items (nested)', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var nestedEl = el.querySelector('coral-collection-nested-test');

        // we consider both outer and nested elements
        var itemCount = el.items.length + nestedEl.items.length;

        expect(collectionAddSpy.callCount).to.equal(0, 'Should not be initially called');
        // excluded items should call the callback
        expect(onItemAddedNestedSpy.callCount).to.equal(itemCount, 'But added callback must be called');
        expect(onNestedCollectionChangedSpy.callCount).to.equal(2, 'Initial state must be reported, including nested');
      });

      it('should be triggered when an item is added using appendChild()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        // we create and add a new item using appendChild
        var item = document.createElement('coral-collection-test-item');
        el.appendChild(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(1);
          expect(collectionAddSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionAddSpy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(el.items.length).to.equal(itemCount + 1, 'Collection should have one more item');

          done();
        });
      });

      it('should be triggered when an item is added using add()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        // we create and add a new item using the collection API
        var item = document.createElement('coral-collection-test-item');
        el.items.add(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(1);
          expect(collectionAddSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionAddSpy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(el.items.length).to.equal(itemCount + 1, 'Collection should have one more item');

          done();
        });
      });

      it('should be triggered when an item is added using object notation', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        // we use the object notation to add the new item
        var item = el.items.add({
          title: 'Item 6'
        });

        // we wait for the MO
        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(1);
          expect(collectionAddSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionAddSpy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(collectionAddSpy.getCall(0).args[0].detail.item.title).to.equal('Item 6');
          expect(el.items.length).to.equal(itemCount + 1, 'Collection should have one more item');

          done();
        });
      });

      it('should not be triggered if the item is excluded', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);

        var item = document.createElement('coral-collection-test-item');
        item.setAttribute('excluded', '');

        el.items.add(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          done();
        });
      });

      it('should not be triggered when non matching item is added', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var item = document.createElement('div');

        el.items.add(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          done();
        });
      });

      it('should not be triggered when text nodes are added', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.text.html']);
        // number of items before the text nodes
        var itemCount = el.items.length;

        el.appendChild(document.createTextNode('text'));

        // we wait for the MO to detect the text node
        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          // clears the filter for the purpose of the test
          el.items._filter = undefined;

          el.appendChild(document.createTextNode('text2'));

          // we wait for the MO to detect the text node
          helpers.next(function () {
            // we restore the filter to get the correct collection count
            el.items._filter = filter;

            expect(collectionAddSpy.callCount).to.equal(0, 'Should not be called because text nodes are not part of the collection');
            expect(el.items.length).to.equal(itemCount, 'Text nodes should not be part of the collection');

            done();
          });
        });
      });

      it('should be triggered even though no onItemAdded callback was provided', function (done) {
        var container = document.createElement('coral-collection-test');
        helpers.target.appendChild(container);

        var collection = new Collection({
          // host has to be a coral component
          host: container,
          itemTagName: 'coral-collection-test-item'
        });

        expect(collection._onItemAdded).to.be.undefined;

        // we need to call _startHandlingItems to enable the mutation observers
        collection._startHandlingItems();

        // observing starts on a different frame
        helpers.next(function () {
          var item = document.createElement('coral-collection-test-item');
          collection.add(item);

          // we wait for the MO
          helpers.next(function () {
            expect(collectionAddSpy.callCount).to.equal(1, 'New item must be notified');
            expect(collectionAddSpy.getCall(0).args[0].target).to.equal(container);
            expect(collectionAddSpy.getCall(0).args[0].detail).to.deep.equal({
              item: item
            });

            done();
          });
        });
      });
    });

    describe('#coral-collection:remove', function () {
      var collectionRemoveSpy = sinon.spy();

      beforeEach(function () {
        helpers.target.addEventListener('coral-collection:remove', collectionRemoveSpy);
      });

      afterEach(function () {
        helpers.target.removeEventListener('coral-collection:remove', collectionRemoveSpy);

        collectionRemoveSpy.resetHistory();
      });

      it('should be triggered when an item is removed using removeChild()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        var item = el.items.first();

        el.removeChild(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionRemoveSpy.callCount).to.equal(1);
          expect(collectionRemoveSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionRemoveSpy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(el.items.length).to.equal(itemCount - 1, 'Collection should have one item less');

          done();
        });
      });

      it('should be triggered when an item is removed using remove()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        var item = el.items.first();

        el.items.remove(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionRemoveSpy.callCount).to.equal(1);
          expect(collectionRemoveSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionRemoveSpy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(el.items.length).to.equal(itemCount - 1, 'Collection should have one item less');

          done();
        });
      });

      it('should not be triggered if the item is excluded', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        // we use query selector since the collection won't return this item
        var item = el.querySelector('coral-collection-test-item[excluded]');

        el.items.remove(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionRemoveSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          done();
        });
      });

      it('should not be triggered when non matching item is removed', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        // we add first a non-collection item to remove it later
        var item = document.createElement('div');
        el.appendChild(item);

        // we wait for the MO
        helpers.next(function () {
          el.items.remove(item);

          helpers.next(function () {
            expect(collectionRemoveSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

            done();
          });
        });
      });

      it('should not be triggered when text nodes are removed', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.text.html']);
        // number of items before the text nodes
        var itemCount = el.items.length;

        // we need to extract all the current text nodes
        var textNodes = [];
        for (var node = el.firstChild ; node !== null ; node = node.nextSibling) {
          if (node.nodeType === 3 && node.textContent.trim() !== '') {
            textNodes.push(node);
          }
        }

        // we remove the first node we found
        el.removeChild(textNodes[0]);

        // we wait for the MO to detect the text node
        helpers.next(function () {
          expect(collectionRemoveSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          // clears the filter for the purpose of the test
          el.items._filter = undefined;

          el.removeChild(textNodes[1]);

          // we wait for the MO to detect the text node
          helpers.next(function () {
            // we restore the filter to get the correct collection count
            el.items._filter = filter;

            expect(collectionRemoveSpy.callCount).to.equal(0, 'Should not be called because text nodes are not part of the collection');
            expect(el.items.length).to.equal(itemCount, 'Text nodes should not be part of the collection');

            done();
          });
        });
      });

      it('should be triggered even though no onItemRemoved callback was provided', function (done) {
        // we create a container with just 3 items
        var container = document.createElement('coral-collection-test');
        container.appendChild(document.createElement('coral-collection-test-item'));
        container.appendChild(document.createElement('coral-collection-test-item'));
        container.appendChild(document.createElement('coral-collection-test-item'));

        helpers.target.appendChild(container);

        var collection = new Collection({
          // host has to be a coral component
          host: container,
          itemTagName: 'coral-collection-test-item'
        });

        expect(collection._onItemRemoved).to.be.undefined;

        // we need to call _startHandlingItems to enable the mutation observers
        collection._startHandlingItems();

        // observing starts on a different frame
        helpers.next(function () {
          // we use the first item for testing purposes
          var item = collection.first();
          collection.remove(item);

          // we wait for the MO
          helpers.next(function () {
            expect(collectionRemoveSpy.callCount).to.equal(1, 'New item must be notified');
            expect(collectionRemoveSpy.getCall(0).args[0].target).to.equal(container);
            expect(collectionRemoveSpy.getCall(0).args[0].detail).to.deep.equal({
              item: item
            });

            done();
          });
        });
      });
    });

    describe('#coral-collection:change', function () {
      var collectionChangeSpy = sinon.spy();

      beforeEach(function () {
        helpers.target.addEventListener('coral-collection:change', collectionChangeSpy);
      });

      afterEach(function () {
        helpers.target.removeEventListener('coral-collection:change', collectionChangeSpy);

        collectionChangeSpy.resetHistory();
      });

      it('should not trigger collection change event for initial items', function () {
        const el = helpers.build(window.__html__['Collection.nested.html']);
        expect(collectionChangeSpy.callCount).to.equal(0, 'Should not be initially called');
        // excluded items should call the callback
        expect(onItemAddedNestedSpy.callCount).to.equal(3, 'But added callback must be called');
        expect(onNestedCollectionChangedSpy.callCount).to.equal(1, 'Initial state must be reported');
      });

      it('should not trigger collection change event for initial items (nested)', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var nestedEl = el.querySelector('coral-collection-nested-test');

        // we consider both outer and nested elements
        var itemCount = el.items.length + nestedEl.items.length;

        expect(collectionChangeSpy.callCount).to.equal(0, 'Should not be initially called');
        // excluded items should call the callback
        expect(onItemAddedNestedSpy.callCount).to.equal(itemCount, 'But added callback must be called');
        expect(onNestedCollectionChangedSpy.callCount).to.equal(2, 'Initial state must be reported, including nested');
      });

      it('should be triggered when an item is added using appendChild()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        // we create and add a new item using appendChild
        var item = document.createElement('coral-collection-test-item');
        el.appendChild(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(1);
          expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
            addedItems: [item],
            removedItems: []
          });
          expect(el.items.length).to.equal(itemCount + 1, 'Collection should have one more item');

          done();
        });
      });

      it('should be triggered when an item is added using add()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        // we create and add a new item using the collection API
        var item = document.createElement('coral-collection-test-item');
        el.items.add(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(1);
          expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
            addedItems: [item],
            removedItems: []
          });
          expect(el.items.length).to.equal(itemCount + 1, 'Collection should have one more item');

          done();
        });
      });

      it('should be triggered when an item is added using object notation', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        // we use the object notation to add the new item
        var item = el.items.add({
          title: 'Item 6'
        });

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(1);
          expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
            addedItems: [item],
            removedItems: []
          });
          expect(collectionChangeSpy.getCall(0).args[0].detail.addedItems[0].title).to.equal('Item 6');
          expect(el.items.length).to.equal(itemCount + 1, 'Collection should have one more item');

          done();
        });
      });

      it('should not be triggered if the item is excluded', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);

        var item = document.createElement('coral-collection-test-item');
        item.setAttribute('excluded', '');

        el.items.add(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          done();
        });
      });

      it('should not be triggered when non matching item is added', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var item = document.createElement('div');

        el.items.add(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          done();
        });
      });

      it('should not be triggered when text nodes are added', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.text.html']);
        // number of items before the text nodes
        var itemCount = el.items.length;

        el.appendChild(document.createTextNode('text'));

        // we wait for the MO to detect the text node
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          // clears the filter for the purpose of the test
          el.items._filter = undefined;

          el.appendChild(document.createTextNode('text2'));

          // we wait for the MO to detect the text node
          helpers.next(function () {
            // we restore the filter to get the correct collection count
            el.items._filter = filter;

            expect(collectionChangeSpy.callCount).to.equal(0, 'Should not be called because text nodes are not part of the collection');
            expect(el.items.length).to.equal(itemCount, 'Text nodes should not be part of the collection');

            done();
          });
        });
      });

      it('should be triggered even though no onCollectionChange callback was provided', function (done) {
        var container = document.createElement('coral-collection-test');
        helpers.target.appendChild(container);

        var collection = new Collection({
          // host has to be a coral component
          host: container,
          itemTagName: 'coral-collection-test-item'
        });

        expect(collection._onCollectionChange).to.be.undefined;

        // we need to call _startHandlingItems to enable the mutation observers
        collection._startHandlingItems();

        // observing starts on a different frame
        helpers.next(function () {
          var item = document.createElement('coral-collection-test-item');
          collection.add(item);

          // we wait for the MO
          helpers.next(function () {
            expect(collectionChangeSpy.callCount).to.equal(1, 'New item must be notified');
            expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(container);
            expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
              addedItems: [item],
              removedItems: []
            });

            done();
          });
        });
      });

      it('should be triggered when an item is removed using removeChild()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        var item = el.items.first();

        el.removeChild(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(1);
          expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
            addedItems: [],
            removedItems: [item]
          });
          expect(el.items.length).to.equal(itemCount - 1, 'Collection should have one item less');

          done();
        });
      });

      it('should be triggered when an item is removed using remove()', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var itemCount = el.items.length;
        var item = el.items.first();

        el.items.remove(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(1);
          expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
            addedItems: [],
            removedItems: [item]
          });
          expect(el.items.length).to.equal(itemCount - 1, 'Collection should have one item less');

          done();
        });
      });

      it('should not be triggered if the item is excluded', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        // we use query selector since the collection won't return this item
        var item = el.querySelector('coral-collection-test-item[excluded]');

        el.items.remove(item);

        // we wait for the MO
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          done();
        });
      });

      it('should not be triggered when non matching item is removed', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        // we add first a non-collection item to remove it later
        var item = document.createElement('div');
        el.appendChild(item);

        // we wait for the MO
        helpers.next(function () {
          el.items.remove(item);

          helpers.next(function () {
            expect(collectionChangeSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

            done();
          });
        });
      });

      it('should not be triggered when text nodes are removed', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.text.html']);
        // number of items before the text nodes
        var itemCount = el.items.length;

        // we need to extract all the current text nodes
        var textNodes = [];
        for (var node = el.firstChild ; node !== null ; node = node.nextSibling) {
          if (node.nodeType === 3 && node.textContent.trim() !== '') {
            textNodes.push(node);
          }
        }

        // we remove the first node we found
        el.removeChild(textNodes[0]);

        // we wait for the MO to detect the text node
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(0, 'It should not be called because the item does not match the collection');

          // clears the filter for the purpose of the test
          el.items._filter = undefined;

          el.removeChild(textNodes[1]);

          // we wait for the MO to detect the text node
          helpers.next(function () {
            // we restore the filter to get the correct collection count
            el.items._filter = filter;

            expect(collectionChangeSpy.callCount).to.equal(0, 'Should not be called because text nodes are not part of the collection');
            expect(el.items.length).to.equal(itemCount, 'Text nodes should not be part of the collection');

            done();
          });
        });
      });

      it('should be triggered even though no onCollectionChange callback was provided', function (done) {
        // we create a container with just 3 items
        var container = document.createElement('coral-collection-test');
        container.appendChild(document.createElement('coral-collection-test-item'));
        container.appendChild(document.createElement('coral-collection-test-item'));
        container.appendChild(document.createElement('coral-collection-test-item'));

        helpers.target.appendChild(container);

        var collection = new Collection({
          // host has to be a coral component
          host: container,
          itemTagName: 'coral-collection-test-item'
        });

        expect(collection._onCollectionChange).to.be.undefined;

        // we need to call _startHandlingItems to enable the mutation observers
        collection._startHandlingItems();

        // observing starts on a different frame
        helpers.next(function () {
          // we use the first item for testing purposes
          var item = collection.first();
          collection.remove(item);

          // we wait for the MO
          helpers.next(function () {
            expect(collectionChangeSpy.callCount).to.equal(1, 'New item must be notified');
            expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(container);
            expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
              addedItems: [],
              removedItems: [item]
            });

            done();
          });
        });
      });

      it('should be triggered once for all mutations', function (done) {
        // we create a container with just 3 items
        var container = document.createElement('coral-collection-test');

        helpers.target.appendChild(container);

        var collection = new Collection({
          // host has to be a coral component
          host: container,
          itemTagName: 'coral-collection-test-item'
        });

        expect(collection._onCollectionChange).to.be.undefined;

        // we need to call _startHandlingItems to enable the mutation observers
        collection._startHandlingItems();

        var item1 = document.createElement('coral-collection-test-item');
        var item2 = document.createElement('coral-collection-test-item');
        var item3 = document.createElement('coral-collection-test-item');

        container.appendChild(item1);
        container.appendChild(item2);
        container.appendChild(item3);

        item3.remove();

        // observing starts on a different frame
        helpers.next(function () {
          expect(collectionChangeSpy.callCount).to.equal(1, 'New item must be notified');
          expect(collectionChangeSpy.getCall(0).args[0].target).to.equal(container);
          expect(collectionChangeSpy.getCall(0).args[0].detail).to.deep.equal({
            addedItems: [item1, item2, item3],
            removedItems: [item3]
          });
          done();
        });
      });
    });
  });

  describe('Implementation Details', function () {
    describe('Handling items', function () {
      var collectionAddSpy = sinon.spy();
      var collectionRemoveSpy = sinon.spy();

      beforeEach(function () {
        helpers.target.addEventListener('coral-collection:add', collectionAddSpy);
        helpers.target.addEventListener('coral-collection:remove', collectionRemoveSpy);
      });

      afterEach(function () {
        helpers.target.removeEventListener('coral-collection:add', collectionAddSpy);
        helpers.target.removeEventListener('coral-collection:remove', collectionRemoveSpy);

        collectionAddSpy.resetHistory();
        collectionRemoveSpy.resetHistory();
      });

      it('should correctly report the initial state', function () {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var nestedEl = el.querySelector('coral-collection-nested-test');

        expect(collectionAddSpy.callCount).to.equal(0);
        expect(collectionRemoveSpy.callCount).to.equal(0);
        expect(onItemAddedNestedSpy.callCount).to.equal(el.items.length + nestedEl.items.length, 'Should be called for every initial item');
        expect(onItemRemovedNestedSpy.callCount).to.equal(0);
        expect(onNestedCollectionChangedSpy.callCount).to.equal(2, 'Initial change must be reported');
        expect(onNestedCollectionChangedSpy.thisValues.includes(el)).to.be.true;
        expect(onNestedCollectionChangedSpy.thisValues.includes(nestedEl)).to.be.true;
        expect(onNestedCollectionChangedSpy.calledWith(el.items.getAll(), [])).to.equal(true, 'Change callback is correct for the outer element');
        expect(onNestedCollectionChangedSpy.calledWith(nestedEl.items.getAll(), [])).to.equal(true, 'Change callback is correct for the inner element');
      });

      it('should call onItemAdded for every added item', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.html']);
        var addedItems = [];
        var TOTAL_NEW_ITEMS = 10;

        for (var i = 0 ; i < TOTAL_NEW_ITEMS ; i++) {
          addedItems.push(el.items.add({
            title: 'Generated ' + i
          }));
        }

        // we help for the MO to detect the new item
        helpers.next(function () {
          expect(collectionAddSpy.callCount).to.equal(TOTAL_NEW_ITEMS, 'Added event must be triggered for every added item');
          expect(collectionRemoveSpy.callCount).to.equal(0, 'Removed event must not be called');
          expect(onItemAddedNestedSpy.callCount).to.equal(el.items.length, 'Every new item should call the callback');
          expect(onItemRemovedNestedSpy.callCount).to.equal(0);
          expect(onNestedCollectionChangedSpy.callCount).to.equal(2, 'Only called once more (after initialization)');
          expect(onNestedCollectionChangedSpy.getCall(1).args[0]).to.deep.equal(addedItems, 'Only newly added items are reported');
          expect(onNestedCollectionChangedSpy.getCall(1).args[1]).to.deep.equal([], 'No items were removed');

          done();
        });
      });

      it('should call onItemRemoved for every removed item', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.subtree.html']);
        var initialCount = el.items.length;
        var removedItems = el.items.getAll();

        // we remove all items
        for (var i = 0, removedItemsCount = removedItems.length ; i < removedItemsCount ; i++) {
          el.items.remove(removedItems[i]);
        }

        // we help for the MO to detect the new item
        helpers.next(function () {
          expect(onItemAddedNestedSpy.callCount).to.equal(initialCount, 'No items were added');
          expect(onItemRemovedNestedSpy.callCount).to.equal(removedItems.length, 'Every removed item should call the callback');
          expect(onNestedCollectionChangedSpy.callCount).to.equal(2, 'Only called once more (after initialization)');
          expect(onNestedCollectionChangedSpy.getCall(1).args[0]).to.deep.equal([], 'No items were added');
          expect(onNestedCollectionChangedSpy.getCall(1).args[1]).to.deep.equal(removedItems, 'Every removed item must be reported');

          done();
        });
      });

      it('should correctly report added and removed items', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var initialCount = onItemAddedNestedSpy.callCount;

        var item1 = document.createElement('coral-collection-test-item');
        item1.title = 'Generated 1';

        var item2 = document.createElement('coral-collection-test-item');
        item2.title = 'Generated 2';

        el.items.add(item1);
        var removedItem = el.items.remove(el.items.first());
        el.items.add(item2);

        // we wait for the MO to detect the added/removed items
        helpers.next(function () {
          expect(onItemRemovedNestedSpy.callCount).to.equal(1);
          expect(onItemRemovedNestedSpy.getCall(0).args[0]).to.equal(removedItem, 'Should match the removed item');

          expect(onItemAddedNestedSpy.callCount).to.equal(initialCount + 2, 'Should have been called for every item in the collection');
          expect(onItemAddedNestedSpy.getCall(initialCount).args[0]).to.equal(item1);
          expect(onItemAddedNestedSpy.getCall(initialCount + 1).args[0]).to.equal(item2);

          expect(onNestedCollectionChangedSpy.callCount).to.equal(3, 'Only called once more (after initialization)');
          expect(onNestedCollectionChangedSpy.getCall(2).args[0]).to.deep.equal([item1, item2]);
          expect(onNestedCollectionChangedSpy.getCall(2).args[1]).to.deep.equal([removedItem]);

          done();
        });
      });

      it('should report add and remove if done on the same frame', function (done) {
        const el = helpers.build(window.__html__['Collection.nested.nested.html']);
        var nestedEl = el.querySelector('coral-collection-nested-test');

        // we need to consider both outer and inner elements
        var initialCount = el.items.length + nestedEl.items.length;

        var first = el.items.first();

        // we remove the first item
        el.items.remove(first);
        // and add it at the end
        el.items.add(first);

        // we wait for the MO to detect the element movement
        helpers.next(function () {
          expect(onItemRemovedNestedSpy.callCount).to.equal(1);
          expect(onItemRemovedNestedSpy.getCall(0).args[0]).to.equal(first, 'Should match the removed item');

          expect(onItemAddedNestedSpy.callCount).to.equal(initialCount + 1, 'Should have been called for the added item');
          expect(onItemAddedNestedSpy.getCall(initialCount).args[0]).to.equal(first, 'Should match the added item');

          expect(onNestedCollectionChangedSpy.callCount).to.equal(3, 'Only called once more (after initialization)');
          expect(onNestedCollectionChangedSpy.getCall(2).args[0]).to.deep.equal([first]);
          expect(onNestedCollectionChangedSpy.getCall(2).args[1]).to.deep.equal([first]);

          done();
        });
      });

      it('should allow custom item selectors', function (done) {
        const el = helpers.build(window.__html__['Collection.base.customAttribute.html']);
        var collection = new Collection({
          host: el,
          itemTagName: 'coral-collection-test-item',
          itemSelector: '[coral-collection-item]',
          onItemAdded: onItemAddedSpy,
          onItemRemoved: onItemRemovedSpy
        });

        // we enable automatic item handling
        collection._startHandlingItems();

        expect(collection._useItemTagName).to.equal(undefined, 'Optimization does not take place due to item selector');

        // we need to wait for the MO to be setup
        helpers.next(function () {
          expect(collection.length).to.equal(5, 'Items with the coral-collection-item are part of the collection');

          // we create an item that matches the selector
          var item = document.createElement('coral-collection-test-item');
          item.setAttribute('coral-collection-item', '');
          item.title = 'Generated 1';

          expect(onItemAddedSpy.callCount).to.equal(5, 'All initial items should be initialized');
          expect(onItemRemovedSpy.callCount).to.equal(0, 'No removals should be recorded');

          collection.add(item);

          // we wait for the MO to detect the new item
          helpers.next(function () {
            expect(onItemAddedSpy.callCount).to.equal(6, 'New item should be recorded');
            expect(onItemAddedSpy.getCall(5).args[0]).to.equal(item);

            var removed = collection.remove(collection.first());

            // we wait for the MO to detect the removed item
            helpers.next(function () {
              expect(onItemRemovedSpy.callCount).to.equal(1, 'Removed item should be recorded');
              expect(onItemRemovedSpy.getCall(0).args[0]).to.equal(removed);

              done();
            });
          });
        });
      });

      it('should call onCollectionChange with the initial items', function (done) {
        const el = helpers.build(window.__html__['Collection.base.html']);
        var collection = new Collection({
          host: el,
          itemTagName: 'coral-collection-test-item',
          onCollectionChange: onCollectionChangedSpy
        });

        // we enable automatic item handling
        collection._startHandlingItems();

        // we need to wait for the MO to be setup
        helpers.next(function () {
          expect(collection.length).to.equal(8, 'It should not filter the items');

          expect(onCollectionChangedSpy.callCount).to.equal(1, 'It should be called with the initial items');
          expect(onCollectionChangedSpy.getCall(0).args[0]).to.deep.equal(collection.getAll(), 'All items should be reported');
          expect(onCollectionChangedSpy.getCall(0).args[1]).to.deep.equal([], 'No removed items on initialization');

          done();
        });
      });

      it('should allow custom item selectors with :scope', function (done) {
        const el = helpers.build(window.__html__['Collection.base.customAttribute.html']);
        var collection = new Collection({
          host: el,
          itemTagName: 'coral-collection-test-item',
          // we use :scope to allow nested collections
          itemSelector: ':scope > [coral-collection-item]',
          onItemAdded: onItemAddedSpy,
          onItemRemoved: onItemRemovedSpy
        });

        // we enable automatic item handling
        collection._startHandlingItems();

        expect(collection._useItemTagName).to.equal(undefined, 'Optimization does not take place due to item selector');

        // we need to wait for the MO to be setup
        helpers.next(function () {
          expect(collection.length).to.equal(3, 'Items with the coral-collection-item are part of the collection');

          // we create an item that matches the selector
          var item = document.createElement('coral-collection-test-item');
          item.setAttribute('coral-collection-item', '');
          item.title = 'Generated 1';

          expect(onItemAddedSpy.callCount).to.equal(3, 'All initial items should be initialized');
          expect(onItemRemovedSpy.callCount).to.equal(0, 'No removals should be recorded');

          collection.add(item);

          // we wait for the MO to detect the new item
          helpers.next(function () {
            expect(onItemAddedSpy.callCount).to.equal(4, 'New item should be recorded');
            expect(onItemAddedSpy.getCall(3).args[0]).to.equal(item);

            var removed = collection.remove(collection.first());

            // we wait for the MO to detect the removed item
            helpers.next(function () {
              expect(onItemRemovedSpy.callCount).to.equal(1, 'Removed item should be recorded');
              expect(onItemRemovedSpy.getCall(0).args[0]).to.equal(removed);

              done();
            });
          });
        });
      });

      it('should detect adding items that are not direct children', function (done) {
        const el = helpers.build(window.__html__['Collection.base.subtree.html']);
        // we need to enable automatic item detection
        el.items._startHandlingItems();

        helpers.next(function () {
          expect(el.items.length).to.equal(5, 'Should include subtree items');
          expect(onItemAddedSpy.callCount).to.equal(5, 'Even subtree items must be reported');

          var item = document.createElement('coral-collection-test-item');
          item.title = 'Sutree item 3';

          // we find the first div, so that we add an item in a subtree
          var div = el.querySelector('div');
          div.appendChild(item);

          helpers.next(function () {
            expect(onItemAddedSpy.callCount).to.equal(6, 'It should detect the subtree addition');
            expect(el.items.length).to.equal(6, 'There should be one more item');


            done();
          });
        });
      });

      it('should detect removing items that are not direct children', function (done) {
        const el = helpers.build(window.__html__['Collection.base.subtree.html']);
        // we need to enable automatic item detection
        el.items._startHandlingItems();

        helpers.next(function () {
          expect(el.items.length).to.equal(5, 'Should include subtree items');
          expect(onItemAddedSpy.callCount).to.equal(5, 'Even subtree items must be reported');
          expect(onItemRemovedSpy.callCount).to.equal(0);

          // we find the first div, so that we add an item in a subtree
          var nestedItem = el.querySelector('div > coral-collection-test-item');
          nestedItem.remove();

          helpers.next(function () {
            expect(onItemRemovedSpy.callCount).to.equal(1, 'It should detect the removal');
            expect(el.items.length).to.equal(4, 'There should be one less item');

            done();
          });
        });
      });
    });
  });
});
