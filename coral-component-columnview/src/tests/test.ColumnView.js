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
import {ColumnView} from '../../../coral-component-columnview';
import {commons} from '../../../coral-utils';

describe('ColumnView', function() {
  // handles the loading and annotating of the columns so that content can be loaded remotely
  var onLoadEvent = function(event) {
    var cv = event.target;
    var item = event.detail.item;
    var column = event.detail.column;

    // if item is set, it means we load the item content
    var url = item ? item.dataset.src : column.dataset.src;

    // there is no information on additional items
    if (typeof url === 'undefined') {
      return;
    }

    // we load the url from the snippets instead of using ajax
    var data = window.__html__[`examples/${url}` ];
    if (typeof data !== 'undefined') {
      var t = document.createElement('div');
      t.innerHTML = data;
      var el = t.firstElementChild;

      // if it is a preview column we add it directly
      if (el.matches('coral-columnview-preview')) {
        cv.setNextColumn(el, column, false);
      }
      else {
        // otherwise we treat it as a normal column
        var contentWrapper = el.querySelector('coral-columnview-column-content');
        var columnWrapper = contentWrapper.closest('coral-columnview-column');

        if (contentWrapper) {
          if (item) {
            // adds an unique id to be able to identify the column
            el.id = commons.getUID();
            // we add the new column
            cv.setNextColumn(el, column, false);
          }
          // we load data in the current column
          else {
            // update the source of the current column (so that lazyloading does work)
            var nextSrcToLoad = columnWrapper.dataset.src;
            if (!nextSrcToLoad) {
              column.removeAttribute('data-src');
            }
            else {
              column.setAttribute('data-src', nextSrcToLoad);
            }

            // update the content
            column.content.appendChild(contentWrapper);
          }
        }
      }
    }
  };

  describe('Namespace', function() {
    it('should be defined in the Coral namespace', function() {
      expect(ColumnView).to.have.property('Column');
    });

    it('should define the selection mode in an enum', function() {
      expect(ColumnView.selectionMode).to.exist;
      expect(ColumnView.selectionMode.NONE).to.equal('none');
      expect(ColumnView.selectionMode.SINGLE).to.equal('single');
      expect(ColumnView.selectionMode.MULTIPLE).to.equal('multiple');
      expect(Object.keys(ColumnView.selectionMode).length).to.equal(3);
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone via markup',
      window.__html__['ColumnView.full.html']
    );
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      helpers.target.addEventListener('coral-columnview:loaditems', onLoadEvent);
      el = helpers.build(new ColumnView());
    });

    afterEach(function() {
      helpers.target.removeEventListener('coral-columnview:loaditems', onLoadEvent);
      el = null;
    });

    describe('#activeItem', function() {});
    describe('#items', function() {});
    describe('#columns', function() {});
    describe('#selectedItem', function() {});
    describe('#selectedItems', function() {});

    describe('#selectionMode', function() {
      it('should default to false', function() {
        expect(el.selectionMode).to.equal(ColumnView.selectionMode.NONE);
        expect(el.columns.length).to.equal(0);
      });

      it('should set the selectionMode on the internal columns', function(done) {
        el.selectionMode = ColumnView.selectionMode.SINGLE;

        var column = new ColumnView.Column();
        expect(column._selectionMode).to.equal(undefined, 'The _selectionMode has no default');
        el.columns.add(column);

        // we wait for the mutation observer to kick in
        helpers.next(function() {
          expect(column._selectionMode).to.equal(ColumnView.selectionMode.SINGLE);

          done();
        });
      });
    });

    describe('#setNextColumn()', function() {});
  });

  describe('Markup', function() {});

  describe('Events', function() {
    var changeSpy;
    var loadItemsSpy;
    var columnActiveChangeSpy;

    var spiedLoadEvent = function(event) {
      loadItemsSpy(event);
      onLoadEvent(event);
    };

    beforeEach(function() {
      changeSpy = sinon.spy();
      loadItemsSpy = sinon.spy();
      columnActiveChangeSpy = sinon.spy();

      helpers.target.addEventListener('coral-columnview:change', changeSpy);
      helpers.target.addEventListener('coral-columnview:loaditems', spiedLoadEvent);
      helpers.target.addEventListener('coral-columnview:activeitemchange', columnActiveChangeSpy);
    });

    afterEach(function() {
      // clears the event listeners so the target is clean
      helpers.target.removeEventListener('coral-columnview:change', changeSpy);
      helpers.target.removeEventListener('coral-columnview:loaditems', spiedLoadEvent);
      helpers.target.removeEventListener('coral-columnview:activeitemchange', columnActiveChangeSpy);

      changeSpy = loadItemsSpy = columnActiveChangeSpy = null;
    });

    // @todo: add test to make sure loaditems it not triggered when the "item" is not active.
    describe('#coral-columnview:loaditems', function() {
      
      it('should fire a "coral-columnview:loaditems" event after initial load if there is space on screen for more items', function(done) {
        var loadItemsSpy = sinon.spy();
        var columnView = new ColumnView();
        var column = new ColumnView.Column();

        columnView.on('coral-columnview:loaditems', loadItemsSpy);

        helpers.target.appendChild(columnView);
        columnView.appendChild(column);
        
        // The event is triggered in a macrotask
        window.setTimeout(() => {
          expect(loadItemsSpy.callCount).to.not.equal(0);
          done();
        });
      });

      it('should fire a "coral-columnview:loaditems" event until there is no more space on screen', function(done) {
        var columnView = new ColumnView();
        // Set height to detect overflow is occurring due to items being added
        columnView.style.height = '100px';
        var column = new ColumnView.Column();
  
        // this callback should be called several times until there is no more space available
        columnView.on('coral-columnview:loaditems', function() {
          
          // should trigger a new "coral-columnview:loaditems" asynchronously if space available
          column.items.add(new ColumnView.Item());

          // calculate if there is more space and more items should be loaded
          var itemsHeight = 0;
          column.items.getAll().forEach(function(item) {
            itemsHeight += item.offsetHeight + parseFloat(getComputedStyle(item).marginTop);
          });
          
          if (itemsHeight >= columnView.offsetHeight) {
            done();
          }
        });

        helpers.target.appendChild(columnView);
        columnView.appendChild(column);
      });
    });

    describe('#coral-columnview:change', function() {
      it('should be triggered once when multiple items are clicked with shift key', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(changeSpy.callCount).to.equal(0);
    
        const columns = el.columns.getAll();
    
        const firstColumn = columns[0];
    
        // First select an item
        firstColumn.items.first().selected = true;
        expect(changeSpy.callCount).to.equal(1);
    
        // Then select another item with shift key
        firstColumn.items.last().querySelector('[coral-columnview-itemselect]').dispatchEvent(new MouseEvent('click', {
          bubbles: true,
          shiftKey: true
        }));
    
        expect(changeSpy.callCount).to.equal(2, 'The event should be triggered once');
        expect(firstColumn.selectedItems).to.deep.equal(firstColumn.items.getAll());
      });
      
      it('should not be triggered when the column content is clicked an nothing was active', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var removeItemSpy = sinon.spy(el, '_afterItemSelectedInColumn');

        var columns = el.columns.getAll();
        var lastColumn = columns[columns.length - 1];

        expect(lastColumn.activeItem).to.be.null;
        expect(lastColumn.selectedItem).to.be.null;

        // this causes the column to be cleared
        lastColumn.content.click();

        // no item should be triggered since nothing changed
        expect(columnActiveChangeSpy.callCount).to.equal(0, 'Active Item remains the same');
        expect(changeSpy.callCount).to.equal(0, 'No previous selection');

        expect(removeItemSpy.callCount).to.equal(0, 'No column was attempted to be cleaned');
      });

      it('should be triggered when an item is selected', function() {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        expect(el.activeItem).to.be.null;

        var items = columns[0].items.getAll();

        items[0].selected = true;

        expect(columnActiveChangeSpy.callCount).to.equal(0, 'No active event should be triggered because nothing was active before');

        expect(changeSpy.callCount).to.equal(1, 'Select event should be triggered');
        expect(changeSpy.getCall(0).args[0].detail.selection).to.deep.equal([items[0]], 'Selection should be an array with the selected item');
        expect(changeSpy.getCall(0).args[0].detail.oldSelection).to.deep.equal([], 'Old Selection should be an empty array');

        items[2].selected = true;

        expect(columnActiveChangeSpy.callCount).to.equal(0, 'No active event should be triggered because nothing was active before');

        expect(changeSpy.callCount).to.equal(2, 'Select event should be triggered');
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([items[0], items[2]]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([items[0]]);

        items[0].selected = false;

        expect(columnActiveChangeSpy.callCount).to.equal(0, 'No active event should be triggered because nothing was active before');

        expect(changeSpy.callCount).to.equal(3, 'Select event should be triggered');
        expect(changeSpy.getCall(2).args[0].detail.selection).to.deep.equal([items[2]], 'Only the 3rd item should remain selected');
        expect(changeSpy.getCall(2).args[0].detail.oldSelection).to.deep.equal([items[0], items[2]], 'Old selection should include both items');
      });

      it('should be triggered when an item is activated', function() {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        expect(el.activeItem).to.be.null;

        var items = columns[0].items.getAll();

        items[0].selected = true;

        expect(columnActiveChangeSpy.callCount).to.equal(0, 'No active event should be triggered because nothing was active before');

        expect(changeSpy.callCount).to.equal(1, 'Select event should be triggered');
        expect(changeSpy.getCall(0).args[0].detail.selection).to.deep.equal([items[0]], 'Selection should be an array with the selected item');
        expect(changeSpy.getCall(0).args[0].detail.oldSelection).to.deep.equal([], 'Old Selection should be an empty array');

        items[2].selected = true;

        expect(columnActiveChangeSpy.callCount).to.equal(0, 'No active event should be triggered because nothing was active before');

        expect(changeSpy.callCount).to.equal(2, 'Select event should be triggered');
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([items[0], items[2]]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([items[0]]);

        // activating an item will clear the selection
        items[1].active = true;

        expect(columnActiveChangeSpy.callCount).to.equal(1);

        expect(changeSpy.callCount).to.equal(3, 'Select event should be triggered');
        expect(changeSpy.getCall(2).args[0].detail.selection).to.deep.equal([], 'Selection is removed due to activation');
        expect(changeSpy.getCall(2).args[0].detail.oldSelection).to.deep.equal([items[0], items[2]], 'Old selection should include both items');

        expect(columnActiveChangeSpy.calledBefore(changeSpy)).to.be.true;
      });

      it('should be triggered when an item is activated (selectionMode=single)', function() {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.single.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        expect(el.activeItem).to.be.null;

        var items = columns[0].items.getAll();

        items[0].selected = true;

        expect(columnActiveChangeSpy.callCount).to.equal(0, 'No active event should be triggered because nothing was active before');

        expect(changeSpy.callCount).to.equal(1, 'Select event should be triggered');
        expect(changeSpy.getCall(0).args[0].detail.selection).to.deep.equal([items[0]], 'Selection should be an array with the selected item');
        expect(changeSpy.getCall(0).args[0].detail.oldSelection).to.deep.equal([], 'Old Selection should be an empty array');

        // activating an item will clear the selection
        items[1].active = true;

        expect(columnActiveChangeSpy.callCount).to.equal(1);

        expect(changeSpy.callCount).to.equal(2, 'Select event should be triggered');
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([], 'Selection is removed due to activation');
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([items[0]], 'Old selection should include both items');

        expect(columnActiveChangeSpy.calledBefore(changeSpy)).to.be.true;
      });

      it('should not be triggered if selectionMode=NONE', function() {
        const el = helpers.build(window.__html__['ColumnView.base.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var column = el.columns.first();

        column.items.first().selected = true;

        expect(column.items.first().selected).to.equal(true, 'The item will have a selected attribute but never trigger an event');

        expect(changeSpy.callCount).to.equal(0);
      });

      it('should be triggered when selection is in a different column', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var lastColumn = columns[columns.length - 1];
        var secondToLastColumn = columns[columns.length - 2];

        // selects the an item in the first column
        var selectedItem1 = lastColumn.items.first();
        selectedItem1.selected = true;

        var selectedItem2 = secondToLastColumn.items.last();
        selectedItem2.selected = true;

        expect(selectedItem1.parentNode).not.to.equal(selectedItem2.parentNode, 'They are not in the same column');

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([selectedItem2]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem1]);
      });

      it('should be triggered when another column is activated', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var lastColumn = columns[columns.length - 1];
        var secondToLastColumn = columns[columns.length - 2];

        // selects the an item in the first column
        var selectedItem = lastColumn.items.first();
        selectedItem.selected = true;

        var activeItem = secondToLastColumn.items.last();
        activeItem.active = true;

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem]);
      });

      it('should be triggered when the the content background is clicked', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var lastColumn = columns[columns.length - 1];

        // selects the an item in the first column
        var selectedItem = lastColumn.items.first();
        selectedItem.selected = true;

        // clicks on the background of the column which should cause the selection to go away
        lastColumn.content.click();

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem]);
      });

      it('should be triggered when the the content background of a column without selection is clicked', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var lastColumn = columns[columns.length - 1];
        var secondToLastColumn = columns[columns.length - 2];

        // selects the an item in the first column
        var selectedItem = lastColumn.items.first();
        selectedItem.selected = true;

        // clicks on the background of the column which should cause the selection to go away
        secondToLastColumn.content.click();

        expect(columnActiveChangeSpy.callCount).to.equal(1);

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem]);

        expect(columnActiveChangeSpy.calledBefore(changeSpy)).to.be.true;
      });

      it('should trigger an event when a selected item is removed', function(done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var lastColumn = columns[columns.length - 1];

        var items = lastColumn.items.getAll();

        // selects the an item in the first column
        var selectedItem1 = items[0];
        selectedItem1.selected = true;

        var selectedItem2 = items[1];
        selectedItem2.selected = true;

        expect(changeSpy.callCount).to.equal(2);

        selectedItem2.remove();

        // we need to wait for the mutation observers
        helpers.next(function() {
          expect(changeSpy.callCount).to.equal(3, 'Removing an item should trigger an event');
          expect(changeSpy.getCall(2).args[0].detail.selection).to.deep.equal([selectedItem1]);
          expect(changeSpy.getCall(2).args[0].detail.oldSelection).to.deep.equal([selectedItem1, selectedItem2]);

          done();
        });
      });
    });

    describe('#coral-columnview:navigate', function() {
      it('should not be triggered when the column view initializes', function() {
        var navigateSpy = sinon.spy();

        helpers.target.addEventListener('coral-columnview:navigate', navigateSpy);

        helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(navigateSpy.callCount).to.equal(0);
  
        // we clean the test afterwards
        helpers.target.removeEventListener('coral-columnview:navigate', navigateSpy);
      });

      it('should be triggered when a new column is added and it is ready', function(done) {
        var navigateSpy = sinon.spy();

        var navigateEvent = function(event) {
          navigateSpy(event);

          var columns = event.target.columns.getAll();

          expect(columns.length).to.equal(2, 'A new columns has to be added.');
          expect(columns[1].items.length).to.equal(2, 'The new column has 2 items');

          expect(navigateSpy.callCount).to.equal(1);
          expect(navigateSpy.getCall(0).args[0].detail.activeItem).to.equal(columns[0].activeItem);
          expect(navigateSpy.getCall(0).args[0].detail.column).to.equal(columns[1]);

          // we clean the test afterwards
          helpers.target.removeEventListener('coral-columnview:navigate', navigateEvent);

          done();
        };

        helpers.target.addEventListener('coral-columnview:navigate', navigateEvent);

        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        // no initial events
        expect(navigateSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();
        expect(columns.length).to.equal(1);

        var item = columns[0].items.getAll()[2];
        // activates the item which will load a new column
        item.click();
      });
      
      it('should be triggered when a column is removed', function(done) {
        var navigateSpy = sinon.spy();

        var navigateEvent = function(event) {
          navigateSpy(event);

          var columns = event.target.columns.getAll();

          expect(columns.length).to.equal(1, 'Extra columns have been removed');
          expect(columns[0].items.length).to.equal(9, 'Column has 9 items');

          expect(navigateSpy.callCount).to.equal(1);
          expect(navigateSpy.getCall(0).args[0].detail.activeItem).to.equal(columns[0].activeItem);
          expect(navigateSpy.getCall(0).args[0].detail.column).to.equal(columns[0]);

          // we clean the test afterwards
          helpers.target.removeEventListener('coral-columnview:navigate', navigateEvent);

          done();
        };

        helpers.target.addEventListener('coral-columnview:navigate', navigateEvent);

        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(navigateSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();
        expect(columns.length).to.equal(3);

        // clicking the content will remove all extra columns
        columns[0].content.click();
      });
    });

    describe('#coral-columnview:activeitemchange', function() {
      it('should be triggered when an item is activated', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var oldActiveItem = el.activeItem;
        var lastColumn = columns[columns.length - 1];

        var firstItem = lastColumn.items.first();
        var lastItem = lastColumn.items.last();

        // the first item of the column is activated
        firstItem.click();

        // activating an item causes the selected column to change
        expect(changeSpy.callCount).to.equal(0, 'No selection event should be triggered');

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem);
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(oldActiveItem);

        // how we select the last to check oldColumn and oldActiveItem are properly set
        lastColumn.items.last().click();

        // no change event since it is the same column
        expect(changeSpy.callCount).to.equal(0, 'No selection event should be triggered');

        expect(columnActiveChangeSpy.callCount).to.equal(2, 'Active item should have changed again');
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.activeItem).to.equal(lastItem, 'New active item is the last item');
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.oldActiveItem).to.equal(firstItem, 'Old active item is the first item');
      });

      it('should support activating an item in a previous column', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var oldActiveItem = el.activeItem;
        var lastColumn = columns[columns.length - 1];

        var firstItem = lastColumn.items.first();

        // the first item of the column is activated
        firstItem.click();

        // activating an item causes the selected column to change
        expect(changeSpy.callCount).to.equal(0, 'No selection event should be triggered');

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem);
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(oldActiveItem);

        var firstColumn = columns[0];

        var newActiveItem = firstColumn.items.first();
        newActiveItem.click();

        // since the active is in a different column
        expect(changeSpy.callCount).to.equal(0, 'No selection event should be triggered');

        expect(columnActiveChangeSpy.callCount).to.equal(2, 'Active item should have changed again');
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.activeItem).to.equal(newActiveItem);
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.oldActiveItem).to.equal(firstItem);
      });

      it('should not trigger an event when the same item is activated', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var oldActiveItem = el.activeItem;
        var lastColumn = columns[columns.length - 1];

        var firstItem = lastColumn.items.first();

        // the first item of the column is activated
        firstItem.click();

        expect(el.activeItem).to.equal(firstItem);

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem);
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(oldActiveItem);

        firstItem.click();
        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Activating it again causes no change');

        firstItem.active = true;
        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Activating it again causes no change');
      });

      it('should trigger an event when the active parent is activated again', function() {
        const el = helpers.build(window.__html__['ColumnView.base.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();
        expect(columns.length).to.equal(1, 'Just the initial column should be there');

        var oldActiveItem = el.activeItem;
        var lastColumn = columns[columns.length - 1];

        expect(oldActiveItem).to.equal(null, 'The colum has no initial active item');

        // clicks on the "English" item
        var firstItem = lastColumn.items.first();
        firstItem.click();

        expect(el.activeItem).to.equal(firstItem);

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem, 'The first item is activated');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null, 'No item was active');

        // we refresh the variables since new columns were added
        columns = el.columns.getAll();
        var newColumn = columns[columns.length - 1];

        expect(lastColumn).not.to.equal(newColumn, 'A new column has been added');
      
        var newActiveItem = newColumn.items.first();
        newActiveItem.click();

        expect(columnActiveChangeSpy.callCount).to.equal(2, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.activeItem).to.equal(newActiveItem);
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.oldActiveItem).to.equal(firstItem);

        expect(firstItem.active).to.equal(true, 'The initial item should be active although it is not in the selected column');

        firstItem.click();
        expect(el.activeItem).to.equal(firstItem);

        expect(columnActiveChangeSpy.callCount).to.equal(3, 'Even though the firstItem was active, the event should be triggered because the column changed');
        expect(columnActiveChangeSpy.getCall(2).args[0].detail.activeItem).to.equal(firstItem);
        expect(columnActiveChangeSpy.getCall(2).args[0].detail.oldActiveItem).to.equal(newActiveItem);
      });

      it('should be triggered when the the content background is clicked', function() {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        var columns = el.columns.getAll();

        var firstColumn = columns[0];
        var selectedColumnActiveItem = el.activeItem;

        expect(firstColumn).not.to.be.null;
        expect(firstColumn.activeItem).not.to.be.null;

        // clicks on the background of the column which should cause the selection to go away
        firstColumn.content.click();

        expect(changeSpy.callCount).to.equal(0);

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Clicking on the column content, triggers an activate event');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(null, 'Clicking on the column content clears the active item');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(selectedColumnActiveItem, 'oldActiveItem matches the initial active Item');

        firstColumn.content.click();

        expect(changeSpy.callCount).to.equal(0);

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'The event should not be triggered again');
      });
    });
  });

  // @todo: add tests for keys
  describe('User Interaction', function() {
    it('should select all items between the last selected item and item clicked with shift key (down)', function() {
      const el = helpers.build(window.__html__['ColumnView.full.html']);
      const columns = el.columns.getAll();
    
      const firstColumn = columns[0];

      const items = firstColumn.items.getAll();
      const fromIndex = 1;
      const toIndex = 4;
    
      // First select an item
      items[fromIndex].selected = true;
    
      // Then select another item with shift key
      items[toIndex].querySelector('[coral-columnview-itemselect]').dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        shiftKey: true
      }));
    
      items.forEach(function(item, i) {
        const isSelected = (i >= fromIndex && i <= toIndex);
        expect(item.selected).to.equal(isSelected);
      });
    });
  });

  // @todo: add test for preview resize
  describe('Implementation Details', function() {
    beforeEach(function() {
      helpers.target.addEventListener('coral-columnview:loaditems', onLoadEvent);
    });

    afterEach(function() {
      helpers.target.removeEventListener('coral-columnview:loaditems', onLoadEvent);
    });

    it('should clear the columns to the right when an item is programmatically activated', function() {
      const el = helpers.build(window.__html__['ColumnView.full.html']);
      var activeItemSpy = sinon.spy();
      var removeItemSpy = sinon.spy(el, '_afterItemSelectedInColumn');

      var columns = el.columns.getAll();

      el.on('coral-columnview:activeitemchange', activeItemSpy);

      var firstActiveItem = columns[0].activeItem;
      expect(firstActiveItem.active).to.equal(true, 'The item was previously active');
      // deactivating the active item is like clicking on the background of the coral-columnview-column-content
      firstActiveItem.active = false;

      expect(activeItemSpy.callCount).to.equal(1, 'Deselecting the item causes the active item to change');
      expect(removeItemSpy.callCount).to.equal(1);
    });
  });
});
