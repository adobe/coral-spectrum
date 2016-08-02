describe('Coral.ColumnView', function() {
  'use strict';

  // handles the loading and annotating of the columns so that content can be loaded remotely
  var onLoadEvent = function(event) {
    var cv = event.target;
    var item = event.detail.item;
    var column = event.detail.column;

    // if item is set, it means we load the item content
    var url = item ? $(item).data('src') : $(column).data('src');

    // there is no information on additional items
    if (typeof url === 'undefined') {
      return;
    }

    // we load the url from the snippets instead of using ajax
    var data = window.__html__[url];
    if (typeof data !== 'undefined') {
      var $data = $(data);

      // if it is a preview column we add it directly
      if ($data.is('coral-columnview-preview')) {
        cv.setNextColumn($data[0], column, false);
      }
      else {
        // otherwise we treat it as a normal column
        var $contentWrapper = $data.find('coral-columnview-column-content').first();
        var $columnWrapper = $contentWrapper.closest('coral-columnview-column');

        if ($contentWrapper.length > 0) {
          if (item) {
            // adds an unique id to be able to identify the column
            $data[0].id = Coral.commons.getUID();
            // we add the new column
            cv.setNextColumn($data[0], column, false);
          }
          // we load data in the current column
          else {
            // update the source of the current column (so that lazyloading does work)
            var nextSrcToLoad = $($columnWrapper).attr('data-src');
            if (!nextSrcToLoad) {
              column.removeAttribute('data-src');
            }
            else {
              column.setAttribute('data-src', nextSrcToLoad);
            }

            // update the content
            $(column.content).append($contentWrapper.html());
          }
        }
      }
    }
  };

  describe('Namespace', function() {
    it('should be defined in the Coral namespace', function() {
      expect(Coral).to.have.property('ColumnView');
      expect(Coral.ColumnView).to.have.property('Column');
    });

    it('should define the selection mode in an enum', function() {
      expect(Coral.ColumnView.selectionMode).to.exist;
      expect(Coral.ColumnView.selectionMode.NONE).to.equal('none');
      expect(Coral.ColumnView.selectionMode.SINGLE).to.equal('single');
      expect(Coral.ColumnView.selectionMode.MULTIPLE).to.equal('multiple');
      expect(Object.keys(Coral.ColumnView.selectionMode).length).to.equal(3);
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.ColumnView();

      helpers.target.addEventListener('coral-columnview:loaditems', onLoadEvent);
      helpers.target.appendChild(el);
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
        expect(el.selectionMode).to.equal(Coral.ColumnView.selectionMode.NONE);
        expect(el.columns.length).to.equal(0);
      });

      it('should set the selectionMode on the internal columns', function(done) {
        el.selectionMode = Coral.ColumnView.selectionMode.SINGLE;

        var column = new Coral.ColumnView.Column();
        expect(column._selectionMode).to.equal(undefined, 'The _selectionMode has no default');
        el.columns.add(column);

        // we wait for the mutation observer to kick in
        helpers.next(function() {
          expect(column._selectionMode).to.equal(Coral.ColumnView.selectionMode.SINGLE);

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
    describe.skip('#coral-columnview:loaditems', function() {
      it('should fire a "coral-columnview:loaditems" event after initial load if there is space on screen for more items', function() {

        var loadItemsSpy = sinon.spy();
        var columnView = new Coral.ColumnView();
        var column = new Coral.ColumnView.Column();

        columnView.on('coral-columnview:loaditems', loadItemsSpy);

        helpers.target.appendChild(columnView);
        columnView.appendChild(column);

        expect(loadItemsSpy.callCount).to.equal(1);
      });

      it('should fire a "coral-columnview:loaditems" event until there is no more space on screen', function(done) {
        var columnView = new Coral.ColumnView();
        var column = new Coral.ColumnView.Column();

        var item = null;
        columnView.on('coral-columnview:loaditems', function() {
          // this callback should be called several times until there is no more space available

          // add 2 items
          for (var i = 0; i < 2; i++) {
            item = new Coral.ColumnView.Item();
            item.icon = 'file';

            // should trigger a new "coral-columnview:loaditems" asynchronously if space available
            column.items.add(item);
          }

          // calculate if there is more space and more items should be loaded
          var itemsHeight = 0;
          column.items.getAll().forEach(function(item) {
            itemsHeight += item.offsetHeight;
          });

          if (itemsHeight >= columnView.offsetHeight) {
            done();
          }
        });

        helpers.target.appendChild(columnView);
        columnView.appendChild(column);
      });

      it('should fire a "coral-columnview:loaditems" event until there is no more space on screen', function(done) {
        done();
      });
    });

    describe('#coral-columnview:change', function() {
      it('should not be triggered when the column content is clicked an nothing was active', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should be triggered when an item is selected', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.selectionMode.multiple.html'], function(el) {
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

          done();
        });
      });

      it('should be triggered when an item is activated', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.selectionMode.multiple.html'], function(el) {
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

          done();
        });
      });

      it('should be triggered when an item is activated (selectionMode=single)', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.selectionMode.single.html'], function(el) {
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

          done();
        });
      });

      it('should not be triggered if selectionMode=NONE', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.base.html'], function(el) {
          // no initial events
          expect(columnActiveChangeSpy.callCount).to.equal(0);
          expect(changeSpy.callCount).to.equal(0);

          var column = el.columns.first();

          column.items.first().selected = true;

          expect(column.items.first().selected).to.equal(true, 'The item will have a selected attribute but never trigger an event');

          expect(changeSpy.callCount).to.equal(0);

          done();
        });
      });

      it('should be triggered when selection is in a different column', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should be triggered when another column is activated', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should be triggered when the the content background is clicked', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should be triggered when the the content background of a column without selection is clicked', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should trigger an event when a selected item is removed', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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
    });

    describe('#coral-columnview:navigate', function() {
      it('should not be triggered when the column view initializes', function(done) {
        var navigateSpy = sinon.spy();

        var navigateEvent = function(event) {
          navigateSpy(event);

          // we clean the test afterwards
          helpers.target.removeEventListener('coral-columnview:navigate', navigateEvent);

          done();
        };

        helpers.target.addEventListener('coral-columnview:navigate', navigateEvent);

        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
          // no initial events
          expect(navigateSpy.callCount).to.equal(0);

          done();
        });
      });

      it('should be triggered when a new column is added and it is ready', function(done) {
        var navigateSpy = sinon.spy();

        var navigateEvent = function(event) {
          navigateSpy(event);

          var columns = event.target.columns.getAll();

          expect(columns.length).to.equal(2, 'A new columns has to be added.');
          expect(columns[1].items).to.be.defined;

          expect(navigateSpy.callCount).to.equal(1);
          expect(navigateSpy.getCall(0).args[0].detail.activeItem).to.equal(columns[0].activeItem);
          expect(navigateSpy.getCall(0).args[0].detail.column).to.equal(columns[1]);

          // we clean the test afterwards
          helpers.target.removeEventListener('coral-columnview:navigate', navigateEvent);

          done();
        };

        helpers.target.addEventListener('coral-columnview:navigate', navigateEvent);

        helpers.build(window.__html__['Coral.ColumnView.selectionMode.multiple.html'], function(el) {
          // no initial events
          expect(navigateSpy.callCount).to.equal(0);

          var columns = el.columns.getAll();
          expect(columns.length).to.equal(1);

          var item = columns[0].items.getAll()[2];
          // activates the item which will load a new column
          item.click();
        });
      });

      it('should be triggered when a column is removed', function(done) {
        var navigateSpy = sinon.spy();

        var navigateEvent = function(event) {
          navigateSpy(event);

          var columns = event.target.columns.getAll();

          expect(columns.length).to.equal(1, 'Extra columns have been removed');
          expect(columns[0].items).to.be.defined;

          expect(navigateSpy.callCount).to.equal(1);
          expect(navigateSpy.getCall(0).args[0].detail.activeItem).to.equal(columns[0].activeItem);
          expect(navigateSpy.getCall(0).args[0].detail.column).to.equal(columns[0]);

          // we clean the test afterwards
          helpers.target.removeEventListener('coral-columnview:navigate', navigateEvent);

          done();
        };

        helpers.target.addEventListener('coral-columnview:navigate', navigateEvent);

        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
          // no initial events
          expect(navigateSpy.callCount).to.equal(0);

          var columns = el.columns.getAll();
          //  expect(columns.length).to.equal(3);

          // clicking the content will remove all extra columns
          columns[0].content.click();
        });
      });
    });

    describe('#coral-columnview:activeitemchange', function() {
      it('should be triggered when an item is activated', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should support activating an item in a previous column', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should not trigger an event when the same item is activated', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });

      it('should trigger an event when the active parent is activated again', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.base.html'], function(el) {
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

          // we wait for the column to be ready since it was just added
          Coral.commons.ready(newColumn, function() {
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

            done();
          });
        });
      });

      it('should be triggered when the the content background is clicked', function(done) {
        helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

          done();
        });
      });
    });
  });

  // @todo: add tests for keys
  describe('User Interaction', function() {});

  // @todo: add test for preview resize
  describe('Implementation Details', function() {
    beforeEach(function() {
      helpers.target.addEventListener('coral-columnview:loaditems', onLoadEvent);
    });

    afterEach(function() {
      helpers.target.removeEventListener('coral-columnview:loaditems', onLoadEvent);
    });

    it('should clear the columns to the right when an item is programmatically activated', function(done) {
      helpers.build(window.__html__['Coral.ColumnView.full.html'], function(el) {
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

        done();
      });
    });
  });
});
