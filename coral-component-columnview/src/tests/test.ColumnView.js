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
import {commons, i18n} from '../../../coral-utils';

describe('ColumnView', function () {
  // handles the loading and annotating of the columns so that content can be loaded remotely
  const onLoadEvent = function (event) {
    const cv = event.target;
    const item = event.detail.item;
    const column = event.detail.column;

    // if item is set, it means we load the item content
    const url = item ? item.dataset.src : column.dataset.src;

    // there is no information on additional items
    if (typeof url === 'undefined') {
      return;
    }

    // we load the url from the snippets instead of using ajax
    const data = window.__html__[`examples/${url}`];
    if (typeof data !== 'undefined') {
      const t = document.createElement('div');
      t.innerHTML = data;
      const el = t.firstElementChild;

      // if it is a preview column we add it directly
      if (el.matches('coral-columnview-preview')) {
        cv.setNextColumn(el, column, false);
      } else {
        // otherwise we treat it as a normal column
        const contentWrapper = el.querySelector('coral-columnview-column-content');
        const columnWrapper = contentWrapper.closest('coral-columnview-column');

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
            const nextSrcToLoad = columnWrapper.dataset.src;
            if (!nextSrcToLoad) {
              column.removeAttribute('data-src');
            } else {
              column.setAttribute('data-src', nextSrcToLoad);
            }

            // update the content
            column.content.appendChild(contentWrapper);
          }
        }
      }
    }
  };

  describe('Namespace', function () {
    it('should be defined in the Coral namespace', function () {
      expect(ColumnView).to.have.property('Column');
    });

    it('should define the selection mode in an enum', function () {
      expect(ColumnView.selectionMode).to.exist;
      expect(ColumnView.selectionMode.NONE).to.equal('none');
      expect(ColumnView.selectionMode.SINGLE).to.equal('single');
      expect(ColumnView.selectionMode.MULTIPLE).to.equal('multiple');
      expect(Object.keys(ColumnView.selectionMode).length).to.equal(3);
    });
  });

  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone via markup',
      window.__html__['ColumnView.full.html']
    );
  });

  describe('API', function () {
    let el;

    beforeEach(function () {
      helpers.target.addEventListener('coral-columnview:loaditems', onLoadEvent);
      el = helpers.build(new ColumnView());
      el.focus();
    });

    afterEach(function () {
      helpers.target.removeEventListener('coral-columnview:loaditems', onLoadEvent);
      el = null;
    });

    describe('#activeItem', function () {
    });
    describe('#items', function () {
    });
    describe('#columns', function () {
    });
    describe('#selectedItem', function () {
    });
    describe('#selectedItems', function () {
    });

    describe('#selectionMode', function () {
      it('should default to false', function () {
        expect(el.selectionMode).to.equal(ColumnView.selectionMode.NONE);
        expect(el.columns.length).to.equal(0);
      });

      it('should set the selectionMode on the internal columns', function (done) {
        el.selectionMode = ColumnView.selectionMode.SINGLE;

        const column = new ColumnView.Column();
        expect(column._selectionMode).to.equal(undefined, 'The _selectionMode has no default');
        el.columns.add(column);

        // we wait for the mutation observer to kick in
        helpers.next(function () {
          expect(column._selectionMode).to.equal(ColumnView.selectionMode.SINGLE);

          done();
        });
      });
    });

    describe('#setNextColumn()', function () {
    });
  });

  describe('Markup', function () {
  });

  describe('Events', function () {
    let changeSpy;
    let loadItemsSpy;
    let columnActiveChangeSpy;

    const spiedLoadEvent = function (event) {
      loadItemsSpy(event);
      onLoadEvent(event);
    };

    beforeEach(function () {
      changeSpy = sinon.spy();
      loadItemsSpy = sinon.spy();
      columnActiveChangeSpy = sinon.spy();

      helpers.target.addEventListener('coral-columnview:change', changeSpy);
      helpers.target.addEventListener('coral-columnview:loaditems', spiedLoadEvent);
      helpers.target.addEventListener('coral-columnview:activeitemchange', columnActiveChangeSpy);
    });

    afterEach(function () {
      // clears the event listeners so the target is clean
      helpers.target.removeEventListener('coral-columnview:change', changeSpy);
      helpers.target.removeEventListener('coral-columnview:loaditems', spiedLoadEvent);
      helpers.target.removeEventListener('coral-columnview:activeitemchange', columnActiveChangeSpy);

      changeSpy = loadItemsSpy = columnActiveChangeSpy = null;
    });

    // @todo: add test to make sure loaditems it not triggered when the "item" is not active.
    describe('#coral-columnview:loaditems', function () {
      // @flaky
      it.skip('should fire a "coral-columnview:loaditems" event after initial load if there is space on screen for more items', function (done) {
        const loadItemsSpy = sinon.spy();
        const columnView = new ColumnView();
        const column = new ColumnView.Column();

        columnView.on('coral-columnview:loaditems', loadItemsSpy);

        helpers.target.appendChild(columnView);
        columnView.appendChild(column);

        // The event is triggered in a macrotask
        window.setTimeout(function () {
          expect(loadItemsSpy.callCount).to.not.equal(0);
          done();
        });
      });

      // @flaky
      it('should fire a "coral-columnview:loaditems" event until there is no more space on screen', function (done) {
        const columnView = new ColumnView();
        // Set height to detect overflow is occurring due to items being added
        columnView.style.height = '100px';
        const column = new ColumnView.Column();

        // @flaky this test sometimes fails to call 'coral-columnview:loaditems' within 2 secs, so call done before uncaught exception
        const timeout = window.setTimeout(done, 1900);

        // this callback should be called several times until there is no more space available
        columnView.on('coral-columnview:loaditems', function () {

          // should trigger a new "coral-columnview:loaditems" asynchronously if space available
          column.items.add(new ColumnView.Item());

          // calculate if there is more space and more items should be loaded
          let itemsHeight = 0;
          column.items.getAll().forEach(function (item) {
            itemsHeight += item.offsetHeight + parseFloat(getComputedStyle(item).marginTop);
          });

          if (itemsHeight >= columnView.offsetHeight) {
            clearTimeout(timeout);
            done();
          }
        });

        helpers.target.appendChild(columnView);
        columnView.appendChild(column);
      });
    });

    describe('#coral-columnview:change', function () {
      it('should be triggered once when multiple items are clicked with shift key', function () {
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

      it('should not be triggered when the column content is clicked an nothing was active', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const removeItemSpy = sinon.spy(el, '_afterItemSelectedInColumn');

        const columns = el.columns.getAll();
        const lastColumn = columns[columns.length - 1];

        expect(lastColumn.activeItem).to.be.null;
        expect(lastColumn.selectedItem).to.be.null;

        // this causes the column to be cleared
        lastColumn.content.click();

        // no item should be triggered since nothing changed
        expect(columnActiveChangeSpy.callCount).to.equal(0, 'Active Item remains the same');
        expect(changeSpy.callCount).to.equal(0, 'No previous selection');

        expect(removeItemSpy.callCount).to.equal(0, 'No column was attempted to be cleaned');
      });

      it('should be triggered when an item is selected', function () {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        expect(el.activeItem).to.be.null;

        const items = columns[0].items.getAll();

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

      it('should be triggered when an item is activated', function () {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        expect(el.activeItem).to.be.null;

        const items = columns[0].items.getAll();

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

      it('should be triggered when an item is activated (selectionMode=single)', function () {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.single.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        expect(el.activeItem).to.be.null;

        const items = columns[0].items.getAll();

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

      it('should not be triggered if selectionMode=NONE', function () {
        const el = helpers.build(window.__html__['ColumnView.base.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const column = el.columns.first();

        column.items.first().selected = true;

        expect(column.items.first().selected).to.equal(true, 'The item will have a selected attribute but never trigger an event');

        expect(changeSpy.callCount).to.equal(0);
      });

      it('should be triggered when selection is in a different column', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const lastColumn = columns[columns.length - 1];
        const secondToLastColumn = columns[columns.length - 2];

        // selects the an item in the first column
        const selectedItem1 = lastColumn.items.first();
        selectedItem1.selected = true;

        const selectedItem2 = secondToLastColumn.items.last();
        selectedItem2.selected = true;

        expect(selectedItem1.parentNode).not.to.equal(selectedItem2.parentNode, 'They are not in the same column');

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([selectedItem2]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem1]);
      });

      it('should be triggered when another column is activated', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const lastColumn = columns[columns.length - 1];
        const secondToLastColumn = columns[columns.length - 2];

        // selects the an item in the first column
        const selectedItem = lastColumn.items.first();
        selectedItem.selected = true;

        const activeItem = secondToLastColumn.items.last();
        activeItem.active = true;

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem]);
      });

      it('should be triggered when the the content background is clicked', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const lastColumn = columns[columns.length - 1];

        // selects the an item in the first column
        const selectedItem = lastColumn.items.first();
        selectedItem.selected = true;

        // clicks on the background of the column which should cause the selection to go away
        lastColumn.content.click();

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem]);
      });

      it('should be triggered when the the content background of a column without selection is clicked', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const lastColumn = columns[columns.length - 1];
        const secondToLastColumn = columns[columns.length - 2];

        // selects the an item in the first column
        const selectedItem = lastColumn.items.first();
        selectedItem.selected = true;

        // clicks on the background of the column which should cause the selection to go away
        secondToLastColumn.content.click();

        expect(columnActiveChangeSpy.callCount).to.equal(1);

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([]);
        expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([selectedItem]);

        expect(columnActiveChangeSpy.calledBefore(changeSpy)).to.be.true;
      });

      it('should not active when column is selected ', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const columns = el.columns.getAll();
        const firstColumn = columns[0];
        const selectedItem = firstColumn.items.first();
        const secondColumn = columns[1];
        selectedItem.setAttribute("selected", true);
        const selectedActiveColumn = selectedItem.getAttribute("active");
        const secondColumnActive = secondColumn.getAttribute("active");
        expect(secondColumnActive).to.be.null;
        expect(selectedActiveColumn).to.be.null;
      });

      it('should trigger an event when a selected item is removed', function (done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const lastColumn = columns[columns.length - 1];

        const items = lastColumn.items.getAll();

        // selects the an item in the first column
        const selectedItem1 = items[0];
        selectedItem1.selected = true;

        const selectedItem2 = items[1];
        selectedItem2.selected = true;

        expect(changeSpy.callCount).to.equal(2);

        helpers.next(function () {
          selectedItem2.remove();

          // we need to wait for the mutation observers
          helpers.next(function () {
            expect(changeSpy.callCount).to.equal(3, 'Removing an item should trigger an event');
            expect(changeSpy.getCall(2).args[0].detail.selection).to.deep.equal([selectedItem1]);
            expect(changeSpy.getCall(2).args[0].detail.oldSelection).to.deep.equal([selectedItem1, selectedItem2]);
            done();
          });
        });
      });
    });

    describe('#coral-columnview:navigate', function () {
      it('should not be triggered when the column view initializes', function () {
        const navigateSpy = sinon.spy();

        helpers.target.addEventListener('coral-columnview:navigate', navigateSpy);

        helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(navigateSpy.callCount).to.equal(0);

        // we clean the test afterwards
        helpers.target.removeEventListener('coral-columnview:navigate', navigateSpy);
      });

      it('should be triggered when a new column is added and it is ready', function (done) {
        const navigateSpy = sinon.spy();

        const navigateEvent = function (event) {
          navigateSpy(event);

          const columns = event.target.columns.getAll();

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

        const columns = el.columns.getAll();
        expect(columns.length).to.equal(1);

        const item = columns[0].items.getAll()[2];
        // activates the item which will load a new column
        item.click();
      });

      it.skip('should be triggered when a column is removed', function (done) {
        const navigateSpy = sinon.spy();

        const navigateEvent = function (event) {
          navigateSpy(event);
          helpers.next(() => {
            const columns = event.target.columns.getAll();

            expect(columns.length).to.equal(1, 'Extra columns have been removed');
            expect(columns[0].items.length).to.equal(9, 'Column has 9 items');

            expect(navigateSpy.callCount).to.equal(1);
            expect(navigateSpy.getCall(0).args[0].detail.activeItem).to.equal(columns[0].activeItem);
            expect(navigateSpy.getCall(0).args[0].detail.column).to.equal(columns[0]);

            // we clean the test afterwards
            helpers.target.removeEventListener('coral-columnview:navigate', navigateEvent);

            done();
          });
        };

        helpers.target.addEventListener('coral-columnview:navigate', navigateEvent);

        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(navigateSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();
        expect(columns.length).to.equal(3);

        // clicking the content will remove all extra columns
        columns[0].content.click();
      });
    });

    describe('#coral-columnview:activeitemchange', function () {
      it('should be triggered when an item is activated', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const oldActiveItem = el.activeItem;
        const lastColumn = columns[columns.length - 1];

        const firstItem = lastColumn.items.first();
        const lastItem = lastColumn.items.last();

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

      it('should support activating an item in a previous column', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const oldActiveItem = el.activeItem;
        const lastColumn = columns[columns.length - 1];

        const firstItem = lastColumn.items.first();

        // the first item of the column is activated
        firstItem.click();

        // activating an item causes the selected column to change
        expect(changeSpy.callCount).to.equal(0, 'No selection event should be triggered');

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem);
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(oldActiveItem);

        const firstColumn = columns[0];

        const newActiveItem = firstColumn.items.first();
        newActiveItem.click();

        // since the active is in a different column
        expect(changeSpy.callCount).to.equal(0, 'No selection event should be triggered');

        expect(columnActiveChangeSpy.callCount).to.equal(2, 'Active item should have changed again');
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.activeItem).to.equal(newActiveItem);
        expect(columnActiveChangeSpy.getCall(1).args[0].detail.oldActiveItem).to.equal(firstItem);
      });

      it('should not trigger an event when the same item is activated', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const oldActiveItem = el.activeItem;
        const lastColumn = columns[columns.length - 1];

        const firstItem = lastColumn.items.first();

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

      it('should trigger an event when the active parent is activated again', function () {
        const el = helpers.build(window.__html__['ColumnView.base.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        let columns = el.columns.getAll();
        expect(columns.length).to.equal(1, 'Just the initial column should be there');

        const oldActiveItem = el.activeItem;
        const lastColumn = columns[columns.length - 1];

        expect(oldActiveItem).to.equal(null, 'The column has no initial active item');

        // clicks on the "English" item
        const firstItem = lastColumn.items.first();
        firstItem.click();

        expect(el.activeItem).to.equal(firstItem);

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem, 'The first item is activated');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null, 'No item was active');

        // we refresh the variables since new columns were added
        columns = el.columns.getAll();
        const newColumn = columns[columns.length - 1];

        expect(lastColumn).not.to.equal(newColumn, 'A new column has been added');

        const newActiveItem = newColumn.items.first();
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

      it('should be triggered when the the content background is clicked', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);

        const columns = el.columns.getAll();

        const firstColumn = columns[0];
        const selectedColumnActiveItem = el.activeItem;

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

      it('should trigger an event when the active parent is focused with selected items in next column', function (done) {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        let columns = el.columns.getAll();
        expect(columns.length).to.equal(1, 'Just the initial column should be there');

        const oldActiveItem = el.activeItem;
        const lastColumn = columns[columns.length - 1];

        expect(oldActiveItem).to.equal(null, 'The column has no initial active item');

        // clicks on the "English" item
        const firstItem = lastColumn.items.first();
        firstItem.click();

        expect(el.activeItem).to.equal(firstItem);

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem, 'The first item is activated');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null, 'No item was active');

        // we refresh the variables since new columns were added
        columns = el.columns.getAll();
        const newColumn = columns[columns.length - 1];

        expect(lastColumn).not.to.equal(newColumn, 'A new column has been added');

        // we wait for the column to be ready since it was just added
        helpers.next(() => {
          let newActiveItem = newColumn.items.first();
          newActiveItem.querySelector('[coral-columnview-itemselect]').click();
          newActiveItem.focus();

          expect(changeSpy.callCount).to.equal(1, 'Select event should be triggered');
          expect(changeSpy.getCall(0).args[0].detail.selection).to.deep.equal([newActiveItem], 'Selection should be an array with the selected item');
          expect(changeSpy.getCall(0).args[0].detail.oldSelection).to.deep.equal([], 'Old Selection should be an empty array');

          expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should not have have changed');
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem, 'The first item is activated');
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null, 'No item was active');

          expect(firstItem.active).to.equal(true, 'The initial item should be active although it is not in the selected column');

          helpers.keypress('left', newActiveItem);

          expect(el.activeItem).to.equal(firstItem);

          expect(columnActiveChangeSpy.callCount).to.equal(1, 'Even though the firstItem was active, the event should be triggered because the column changed');
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem);
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null);

          expect(changeSpy.callCount).to.equal(1, 'Select event should not have been triggered');

          helpers.keypress('right', el.activeItem);

          helpers.next(function () {
            expect(document.activeElement.id).to.equal(newActiveItem.id);
            expect(newActiveItem.selected);

            expect(columnActiveChangeSpy.callCount).to.equal(1, 'Even though the focused item changed, the event should not be triggered because focused item is selected');
            expect(changeSpy.callCount).to.equal(1, 'Select event should not have been triggered');

            done();
          });
        });
      });

      it('should not trigger an event when the active parent is clicked with selected items in next column', function (done) {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        // no initial events
        expect(columnActiveChangeSpy.callCount).to.equal(0);

        let columns = el.columns.getAll();
        expect(columns.length).to.equal(1, 'Just the initial column should be there');

        const oldActiveItem = el.activeItem;
        const lastColumn = columns[columns.length - 1];

        expect(oldActiveItem).to.equal(null, 'The column has no initial active item');

        // clicks on the "English" item
        const firstItem = lastColumn.items.first();
        firstItem.click();

        expect(el.activeItem).to.equal(firstItem);

        expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should have changed');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem, 'The first item is activated');
        expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null, 'No item was active');

        // we refresh the variables since new columns were added
        columns = el.columns.getAll();
        const newColumn = columns[columns.length - 1];

        expect(lastColumn).not.to.equal(newColumn, 'A new column has been added');

        // we wait for the column to be ready since it was just added
        helpers.next(function () {
          let newActiveItem = newColumn.items.first();
          newActiveItem.querySelector('[coral-columnview-itemselect]').click();
          newActiveItem.focus();

          expect(changeSpy.callCount).to.equal(1, 'Select event should be triggered');
          expect(changeSpy.getCall(0).args[0].detail.selection).to.deep.equal([newActiveItem], 'Selection should be an array with the selected item');
          expect(changeSpy.getCall(0).args[0].detail.oldSelection).to.deep.equal([], 'Old Selection should be an empty array');

          expect(columnActiveChangeSpy.callCount).to.equal(1, 'Active item should not have have changed');
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem, 'The first item is activated');
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null, 'No item was active');

          expect(firstItem.active).to.equal(true, 'The initial item should be active although it is not in the selected column');

          firstItem.trigger('mousedown');
          firstItem.focus();
          firstItem.trigger('focus');
          firstItem.trigger('mouseup');
          firstItem.click();

          expect(el.activeItem).to.equal(firstItem);

          expect(columnActiveChangeSpy.callCount).to.equal(1, 'Even though the column changed, the event should not be triggered because active item is the same');
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.activeItem).to.equal(firstItem);
          expect(columnActiveChangeSpy.getCall(0).args[0].detail.oldActiveItem).to.equal(null);

          expect(changeSpy.callCount).to.equal(2, 'Select event should have been triggered, to clear selection');
          expect(changeSpy.getCall(1).args[0].detail.selection).to.deep.equal([]);
          expect(changeSpy.getCall(1).args[0].detail.oldSelection).to.deep.equal([newActiveItem]);

          columns = el.columns.getAll();
          newActiveItem = columns[columns.length - 1].items.first();
          newActiveItem.trigger('mousedown');
          newActiveItem.focus();
          newActiveItem.trigger('focus');
          newActiveItem.trigger('mouseup');
          newActiveItem.click();

          helpers.next(function () {
            expect(document.activeElement.id).to.equal(newActiveItem.id);
            expect(!newActiveItem.selected);

            expect(columnActiveChangeSpy.callCount).to.equal(2, 'Active item should not have have changed');
            expect(changeSpy.callCount).to.equal(2, 'Select event should not have been triggered, because nothing new has been selected');

            done();
          });
        });
      });
    });
  });

  // @todo: add tests for keys
  describe('User Interaction', function () {
    it('should select all items between the last selected item and item clicked with shift key (down)', function () {
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

      items.forEach(function (item, i) {
        const isSelected = (i >= fromIndex && i <= toIndex);
        expect(item.selected).to.equal(isSelected);
      });
    });

    describe('#focus()', function () {
      it('should marshall focus to active element', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        el.focus();
        expect(document.activeElement.id).to.equal(el.activeItem.id);
      });
    });

    describe('Keyboard Interaction', function () {
      it('ArrowUp should focus previous item', function (done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const activeItem = el.activeItem;
        activeItem.trigger('click');
        helpers.keypress('up', activeItem);
        helpers.next(function () {
          expect(document.activeElement.id).to.equal(el.columns.getAll()[1].items.first().id);
          expect(document.activeElement.id).to.equal(el.activeItem.id);
          done();
        });
      });

      it('ArrowDown should focus next item', function (done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const activeItem = el.activeItem;
        activeItem.trigger('click');
        helpers.keypress('down', activeItem);
        helpers.next(function () {
          expect(document.activeElement.id).to.equal(el.columns.getAll()[1].items.getAll()[2].id);
          expect(document.activeElement.id).to.equal(el.activeItem.id);
          done();
        });
      });

      it('ArrowRight on item with variant=drilldown should focus first item in next column', function (done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const activeItem = el.items.getAll()[2];
        activeItem.trigger('click');
        helpers.keypress('right', activeItem);
        window.setTimeout(function () {
          helpers.next(function () {
            expect(document.activeElement.id).to.equal(el.columns.getAll()[1].items.first().id);
            done();
          });
        }, 200);
      });

      it('ArrowLeft on item with previous column should focus active item in previous column', function (done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const activeItem = el.activeItem;
        activeItem.trigger('click');
        helpers.keypress('left', activeItem);
        window.setTimeout(function () {
          expect(document.activeElement.id).to.equal(el.columns.first().items.getAll()[1].id);
          expect(document.activeElement.id).to.equal(el.activeItem.id);
          done();
        }, 200);
      });

      it('Space on item should toggle selection', function (done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const activeItem = el.items.getAll()[2];
        activeItem.trigger('click');
        helpers.keypress('space', activeItem);
        helpers.next(function () {
          expect(activeItem.selected).to.be.true;
          expect(activeItem.hasAttribute('selected')).to.be.true;
          expect(activeItem).to.equal(el.selectedItem);
          helpers.keypress('space', activeItem);
          helpers.next(function () {
            expect(activeItem.selected).to.be.false;
            expect(activeItem.hasAttribute('selected')).to.be.false;
            expect(activeItem.id).to.equal(el.activeItem.id);
            done();
          });
        });
      });

      describe('When selectionMode="single", ', function () {

        it('Shift+ArrowUp on item should select previous item', function (done) {
          const el = helpers.build(window.__html__['ColumnView.selectionMode.single.html']);
          const activeItem = el.items.getAll()[1];
          activeItem.trigger('click');
          helpers.keypress('up', activeItem, [16]);
          helpers.next(function () {
            expect(activeItem.previousElementSibling.selected).to.be.true;
            expect(activeItem.previousElementSibling.hasAttribute('selected')).to.be.true;
            expect(activeItem.previousElementSibling.id).to.equal(el.selectedItem.id);
            done();
          });
        });

        it('Shift+ArrowDown on item should select next item', function (done) {
          const el = helpers.build(window.__html__['ColumnView.selectionMode.single.html']);
          const activeItem = el.items.getAll()[1];
          activeItem.trigger('click');
          helpers.keypress('down', activeItem, [16]);
          helpers.next(function () {
            expect(activeItem.nextElementSibling.selected).to.be.true;
            expect(activeItem.nextElementSibling.hasAttribute('selected')).to.be.true;
            expect(activeItem.nextElementSibling.id).to.equal(el.selectedItem.id);
            done();
          });
        });

        it('Command+A on item should select just the current item', function (done) {
          const el = helpers.build(window.__html__['ColumnView.selectionMode.single.html']);
          const activeItem = el.items.getAll()[1];
          activeItem.trigger('click');
          helpers.keypress('a', activeItem, [91]);
          helpers.next(function () {
            expect(activeItem.selected).to.be.true;
            expect(activeItem.hasAttribute('selected')).to.be.true;
            expect(activeItem.id).to.equal(el.selectedItem.id);
            done();
          });
        });

        it('Command+Shift+A on item should deselect all', function (done) {
          const el = helpers.build(window.__html__['ColumnView.selectionMode.single.html']);
          const activeItem = el.items.getAll()[1];
          activeItem.trigger('click');
          activeItem.selected = true;
          helpers.keypress('a', activeItem, [16, 91]);
          helpers.next(function () {
            expect(activeItem.selected).to.be.false;
            expect(activeItem.hasAttribute('selected')).to.be.false;
            expect(activeItem.id).to.equal(el.activeItem.id);
            expect(el.selectedItem).to.be.null;
            done();
          });
        });
      });

      it('should make activeItem tabbable, and other items focusable', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const activeItem = el.activeItem;
        const previousElementSibling = el.activeItem.previousElementSibling;
        el.focus();
        activeItem.trigger('focus');
        expect(activeItem.tabIndex).to.equal(0);
        expect(previousElementSibling.tabIndex).to.equal(-1);
        previousElementSibling.focus();
        previousElementSibling.trigger('focus');
        expect(activeItem.tabIndex).to.equal(-1);
        expect(previousElementSibling.tabIndex).to.equal(0);
      });

      describe('When selectionMode="multiple", ', function () {
        it('Shift+ArrowUp on item should select current and previous item', function (done) {
          const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
          const activeItem = el.items.getAll()[1];
          activeItem.trigger('click');
          helpers.keypress('up', activeItem, [16]);
          helpers.next(function () {
            expect(activeItem.selected).to.be.true;
            expect(activeItem.hasAttribute('selected')).to.be.true;
            expect(activeItem.previousElementSibling.selected).to.be.true;
            expect(activeItem.previousElementSibling.hasAttribute('selected')).to.be.true;
            expect(el.selectedItems.length).to.equal(2);
            done();
          });
        });
        it('Shift+ArrowDown on item should select current and next item', function (done) {
          const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
          const activeItem = el.items.getAll()[1];
          activeItem.trigger('click');
          helpers.keypress('down', activeItem, [16]);
          helpers.next(function () {
            expect(activeItem.selected).to.be.true;
            expect(activeItem.hasAttribute('selected')).to.be.true;
            expect(activeItem.nextElementSibling.selected).to.be.true;
            expect(activeItem.nextElementSibling.hasAttribute('selected')).to.be.true;
            expect(el.selectedItems.length).to.equal(2);
            done();
          });
        });
        it('Command+A on item should select all items in the current column', function (done) {
          const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
          const activeItem = el.items.getAll()[1];
          activeItem.trigger('click');
          helpers.keypress('a', activeItem, [91]);
          helpers.next(function () {
            expect(el.selectedItems.length).to.equal(el.columns.first().items.length);
            done();
          });
        });

        describe('with one or more items selected', function () {
          it('Command+Shift+A on item should deselect all', function (done) {
            const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
            const activeItem = el.items.getAll()[1];
            activeItem.trigger('click');
            helpers.keypress('a', activeItem, [91]);
            helpers.next(function () {
              expect(el.selectedItems.length).to.equal(el.columns.first().items.length);
              helpers.keypress('a', activeItem, [16, 91]);
              helpers.next(function () {
                expect(el.selectedItems.length).to.equal(0);
                expect(activeItem.id).to.equal(el.activeItem.id);
                done();
              });
            });
          });
          it('Esc on item should deselect all', function (done) {
            const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
            const activeItem = el.items.getAll()[1];
            activeItem.trigger('click');
            helpers.keypress('a', activeItem, [91]);
            helpers.next(function () {
              expect(el.selectedItems.length).to.equal(el.columns.first().items.length);
              helpers.keypress('esc', activeItem);
              helpers.next(function () {
                expect(el.selectedItems.length).to.equal(0);
                expect(activeItem.id).to.equal(el.activeItem.id);
                done();
              });
            });
          });
          it('ArrowUp on selected item should focus next item without selecting or activating it', function (done) {
            const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
            const activeItem = el.items.getAll()[1];
            activeItem.trigger('click');
            activeItem.selected = true;
            helpers.keypress('up', activeItem);
            helpers.next(function () {
              expect(document.activeElement.id).to.equal(activeItem.previousElementSibling.id);
              helpers.keypress('space', document.activeElement);
              helpers.next(function () {
                helpers.next(function () {
                  expect(document.activeElement.selected).to.be.true;
                  expect(document.activeElement.hasAttribute('selected')).to.be.true;
                  expect(el.selectedItems.length).to.equal(2);
                  helpers.keypress('space', document.activeElement);
                  helpers.next(function () {
                    helpers.next(function () {
                      expect(document.activeElement.selected).to.be.false;
                      expect(document.activeElement.hasAttribute('selected')).to.be.false;
                      expect(el.selectedItems.length).to.equal(1);
                      expect(el.selectedItem.id).to.equal(activeItem.id);
                      done();
                    });
                  });
                });
              });
            });
          });
          it('ArrowDown on selected item should focus next item without selecting or activating it', function (done) {
            const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
            const activeItem = el.items.getAll()[1];
            activeItem.trigger('click');
            activeItem.selected = true;
            helpers.keypress('down', activeItem);
            helpers.next(function () {
              expect(document.activeElement.id).to.equal(activeItem.nextElementSibling.id);
              helpers.keypress('space', document.activeElement);
              helpers.next(function () {
                helpers.next(function () {
                  expect(document.activeElement.selected).to.be.true;
                  expect(document.activeElement.hasAttribute('selected')).to.be.true;
                  expect(el.selectedItems.length).to.equal(2);
                  helpers.keypress('space', document.activeElement);
                  helpers.next(function () {
                    helpers.next(function () {
                      expect(document.activeElement.selected).to.be.false;
                      expect(document.activeElement.hasAttribute('selected')).to.be.false;
                      expect(el.selectedItems.length).to.equal(1);
                      expect(el.selectedItem.id).to.equal(activeItem.id);
                      done();
                    });
                  });
                });
              });
            });
          });
        });
      });
    });

    it('should select all items between the last selected item and item clicked with shift key (down)', function (done) {
      const el = helpers.build(window.__html__['ColumnView.full.html']);
      const firstColumn = el.columns.first();

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

      items.forEach(function (item, i) {
        const isSelected = (i >= fromIndex && i <= toIndex);
        expect(item.selected).to.equal(isSelected);
      });

      done();
    });
  });

  describe('Accessibility', function () {
    let changeSpy;
    let loadItemsSpy;
    let columnActiveChangeSpy;

    const spiedLoadEvent = function (event) {
      loadItemsSpy(event);
      onLoadEvent(event);
    };

    beforeEach(function () {
      changeSpy = sinon.spy();
      loadItemsSpy = sinon.spy();
      columnActiveChangeSpy = sinon.spy();

      helpers.target.addEventListener('coral-columnview:change', changeSpy);
      helpers.target.addEventListener('coral-columnview:loaditems', spiedLoadEvent);
      helpers.target.addEventListener('coral-columnview:activeitemchange', columnActiveChangeSpy);
    });

    afterEach(function () {
      // clears the event listeners so the target is clean
      helpers.target.removeEventListener('coral-columnview:change', changeSpy);
      helpers.target.removeEventListener('coral-columnview:loaditems', spiedLoadEvent);
      helpers.target.removeEventListener('coral-columnview:activeitemchange', columnActiveChangeSpy);

      changeSpy = loadItemsSpy = columnActiveChangeSpy = null;
    });

    it('should have role equal to "tree"', function () {
      const el = helpers.build(window.__html__['ColumnView.full.html']);
      expect(el.getAttribute('role')).to.equal('tree');
    });

    describe('First column', function () {
      it('should have role equal to "presentation", while subsequent columns have role equal to "group"', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        expect(el.columns.first().getAttribute('role')).to.equal('presentation');
        expect(el.columns.getAll()[1].getAttribute('role')).to.equal('group');
      });
    });

    describe('when selectionMode equals "multiple"', function () {
      it('should have aria-multiselectable equal to "true"', function (done) {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        expect(el.getAttribute('aria-multiselectable')).to.equal('true');
        el.selectionMode = ColumnView.selectionMode.NONE;
        helpers.next(function () {
          expect(el.getAttribute('aria-multiselectable')).to.equal('false');
          done();
        });
      });

      it('should announce item select or unselect using a aria-live region', function (done) {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        const accessibilityState = el._elements.accessibilityState;
        expect(accessibilityState.getAttribute('role')).to.equal('presentation');
        expect(accessibilityState.getAttribute('aria-live')).to.equal('off');
        expect(accessibilityState.getAttribute('aria-atomic')).to.equal('true');
        expect(accessibilityState.hidden).to.be.true;

        // select an item
        const item = el.items.getAll()[1];
        item.focus();
        window.setTimeout(function () {

          item.selected = true;
          helpers.next(function () {
            expect(item.selected).to.be.true;
            // the selected item's accessibility state should be ", checked"
            expect(item._elements.accessibilityState.textContent).to.equal(i18n.get(', checked'));
            // the item's accessibility state lang should match the Coral.i18n.locale
            expect(item._elements.accessibilityState.getAttribute('lang')).to.equal(i18n.locale);

            // wait 20ms for ColumnView accessibilityState to update
            window.setTimeout(function () {
              // ColumnView accessibilityState should announce assertively,
              expect(accessibilityState.getAttribute('aria-live')).to.equal('assertive');
              // and should not be hidden.
              expect(accessibilityState.hidden).to.be.false;
              // accessibilityState firstChild to announce should be <span><span lang="fr">Français</span>, checked<span>
              let spans = accessibilityState.querySelectorAll('span');
              expect(spans.length).to.equal(2);
              expect(spans[0].childNodes[0]).to.equal(spans[1]);
              expect(spans[1].getAttribute('lang')).to.equal(item.getAttribute('lang'));
              expect(spans[1].textContent).to.equal(item.content.textContent);
              expect(spans[1].nextSibling.textContent).to.equal(i18n.get(', checked'));

              // deselect the item
              item.selected = false;
              helpers.next(function () {
                expect(item.selected).to.be.false;
                // item accessibility should be empty for an unselected item
                expect(item._elements.accessibilityState.textContent).to.equal('');
                // ColumnView accessibilityState should be reset.
                expect(accessibilityState.getAttribute('aria-live')).to.equal('off');
                expect(accessibilityState.hidden).to.be.true;
                expect(accessibilityState.innerHTML).to.equal('');
                // wait 20ms for ColumnView accessibilityState to update
                window.setTimeout(function () {
                  // accessibilityState firstChild to announce should be <span><span lang="fr">Français</span>, unchecked<span>
                  spans = accessibilityState.querySelectorAll('span');
                  expect(spans.length).to.equal(2);
                  expect(spans[0].childNodes[0]).to.equal(spans[1]);
                  expect(spans[1].getAttribute('lang')).to.equal(item.getAttribute('lang'));
                  expect(spans[1].textContent).to.equal(item.content.textContent);
                  expect(spans[1].nextSibling.textContent).to.equal(i18n.get(', unchecked'));
                  done();
                }, 20);
              });
            }, 20);
          });
        }, 400);
      });
    });
    describe('#coral-interactive', function () {
      it('Clicking on checkbox within an item should not toggle selection of the item', function (done) {
        const el = helpers.build(window.__html__['ColumnView.coral-interactive.html']);
        const activeItem = el.items.getAll()[0];
        const coralInteractiveElement = activeItem.querySelector('[coral-interactive]');
        coralInteractiveElement.focus();
        coralInteractiveElement.click();
        helpers.next(function () {
          expect(activeItem.selected).to.be.false;
          expect(activeItem.hasAttribute('selected')).to.be.false;
          expect(el.activeItem).to.be.null;
          expect(el.selectedItem).to.be.null;
          expect(coralInteractiveElement.checked).to.be.true;
          coralInteractiveElement.click();
          helpers.next(function () {
            expect(activeItem.selected).to.be.false;
            expect(activeItem.hasAttribute('selected')).to.be.false;
            expect(el.activeItem).to.be.null;
            expect(el.selectedItem).to.be.null;
            expect(coralInteractiveElement.checked).to.be.false;
            done();
          });
        });
      });
      it('Using arrow key with focus on checkbox within an item should not navigate', function (done) {
        const el = helpers.build(window.__html__['ColumnView.coral-interactive.html']);
        const activeItem = el.items.getAll()[0];
        const coralInteractiveElement = activeItem.querySelector('[coral-interactive]');
        coralInteractiveElement.focus();
        helpers.keypress('down', document.activeElement);
        helpers.next(function () {
          expect(document.activeElement).to.equal(coralInteractiveElement);
          done();
        });
      });
    });
    describe('when selectionMode equals "single"', function () {
      it('should have aria-multiselectable equal to "false"', function (done) {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.single.html']);
        expect(el.getAttribute('aria-multiselectable')).to.equal('false');
        el.selectionMode = ColumnView.selectionMode.MULTIPLE;
        helpers.next(function () {
          expect(el.getAttribute('aria-multiselectable')).to.equal('true');
          done();
        });
      });
    });

    describe('when selectionMode equals "none"', function () {
      it('should have aria-multiselectable equal to "false"', function (done) {
        const el = helpers.build(window.__html__['ColumnView.selectionMode.multiple.html']);
        el.selectionMode = ColumnView.selectionMode.NONE;
        helpers.next(function () {
          expect(el.getAttribute('aria-multiselectable')).to.equal('false');
          done();
        });
      });
    });

    describe('when item is expanded', function () {
      it('should have aria-expanded equal to "true"', function (done) {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        helpers.next(function () {
          expect(el.activeItem.getAttribute('aria-expanded')).to.equal('true');
          done();
        });
      });

      it('should express ownership of expanded column using aria-owns', function (done) {
        function navigateEvent(event) {
          const el = event.target;
          const columns = el.columns;
          const lastColumn = columns.last();

          expect(columns.length).to.equal(3, 'A new column has to be added.');
          expect(el.activeItem.getAttribute('aria-owns')).to.equal(lastColumn.id, 'aria-owns of activeItem should reference added column');
          expect(lastColumn.getAttribute('aria-labelledby')).to.equal(el.activeItem.content.id, 'added column should be labelled by activeItem of previous column');

          // we clean the test afterwards
          helpers.target.removeEventListener('coral-columnview:navigate', navigateEvent);

          done();
        };

        helpers.target.addEventListener('coral-columnview:navigate', navigateEvent);

        const el = helpers.build(window.__html__['ColumnView.full.html']);
        el.activeItem.trigger('click');
      });
    });
  });

  // @todo: add test for preview resize
  describe('Implementation Details', function () {
    beforeEach(function () {
      helpers.target.addEventListener('coral-columnview:loaditems', onLoadEvent);
    });

    afterEach(function () {
      helpers.target.removeEventListener('coral-columnview:loaditems', onLoadEvent);
    });

    it('should clear the columns to the right when an item is programmatically activated', function () {
      const el = helpers.build(window.__html__['ColumnView.full.html']);
      const activeItemSpy = sinon.spy();
      const removeItemSpy = sinon.spy(el, '_afterItemSelectedInColumn');

      const columns = el.columns.getAll();

      el.on('coral-columnview:activeitemchange', activeItemSpy);

      const firstActiveItem = columns[0].activeItem;
      expect(firstActiveItem.active).to.equal(true, 'The item was previously active');
      // deactivating the active item is like clicking on the background of the coral-columnview-column-content
      firstActiveItem.active = false;

      expect(activeItemSpy.callCount).to.equal(1, 'Deselecting the item causes the active item to change');
      expect(removeItemSpy.callCount).to.equal(1);
    });

    it('should ensure tabbable item when ColumnView intializes', function () {
      const el = helpers.build(window.__html__['ColumnView.base.html']);
      const items = el.items.getAll();

      items.forEach(function (item, i) {
        expect(item.getAttribute('tabindex')).to.equal(i === 0 ? '0' : '-1');
      });
    });

    describe('ColumnView.Preview', function () {
      function onChangeEvent(event) {
        const columnView = event.target;
        if (event.detail.selection.length) {
          // on selection, it means we load the item content
          let url = columnView.items._getLastSelected().dataset.src;

          // there is no information on additional items
          if (typeof url === 'undefined') {
            return;
          }

          // we load the url from the snippets instead of using ajax
          let data = window.__html__[`examples/${url}`];
          if (typeof data !== 'undefined') {
            let t = document.createElement('div');
            t.innerHTML = data;
            let el = t.firstElementChild;

            // if it is a preview column we add it directly
            if (el.matches('coral-columnview-preview')) {
              columnView.setNextColumn(el, columnView.columns.last(), false);
            }
          }
        }
      }

      beforeEach(function () {
        helpers.target.addEventListener('coral-columnview:change', onChangeEvent);
      });

      afterEach(function () {
        helpers.target.removeEventListener('coral-columnview:change', onChangeEvent);
      });

      it('should not be in tab order with selection in previous column', function () {
        const el = helpers.build(window.__html__['ColumnView.full.html']);
        const item = el.items.getAll()[3];
        item.focus();
        item.active = true;
        let focusables = el.querySelectorAll('coral-columnview-preview coral-columnview-preview-value[tabindex="-1"]');
        let tabbables = el.querySelectorAll('coral-columnview-preview coral-columnview-preview-value[tabindex="0"]');
        expect(focusables.length).to.equal(0);
        expect(tabbables.length).to.equal(7);
        item.selected = true;
        focusables = el.querySelectorAll('coral-columnview-preview coral-columnview-preview-value[tabindex="-1"]');
        tabbables = el.querySelectorAll('coral-columnview-preview coral-columnview-preview-value[tabindex="0"]');
        expect(focusables.length).to.equal(7);
        expect(tabbables.length).to.equal(0);
      })
    });
  });
});
