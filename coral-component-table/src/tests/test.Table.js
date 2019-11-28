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
import {Table} from '../../../coral-component-table';
import {getIndexOf, getRows, getColumns, getHeaderCells} from '../scripts/TableUtil';

// Mock for dragging
const dragHeaderCellTo = (headerCell, direction) => {
  // Calculate distance to enable swap
  var x = headerCell.getBoundingClientRect().width * 2 * direction;
  // Initiates the dragAction
  headerCell.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true
  }));
  // Triggering twice is enough to perform the swap
  for (var i = 0; i < 2; i++) {
    headerCell.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: x
    }));
  }
  // Destroy dragAction
  headerCell.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true
  }));
};

// Mock for dragging
const dragRowTo = (row, direction) => {
  // Calculate distance to enable swap
  var y = row.getBoundingClientRect().height * 2 * direction;
  // Initiates the dragAction
  row.dispatchEvent(new MouseEvent('mousedown', {
    bubbles: true
  }));
  // Triggering twice is enough to perform the swap
  for (var i = 0; i < 2; i++) {
    row.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientY: y
    }));
  }
  // Destroy dragAction
  row.dispatchEvent(new MouseEvent('mouseup', {
    bubbles: true
  }));
};

describe('Table', function() {
  describe('Namespace', function() {
    it('should expose enums', function() {
      expect(Table).to.have.property('variant');
      expect(Table).to.have.property('divider');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Table());
      expect(el.classList.contains('_coral-Table-wrapper')).to.be.true;
    });
  
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('table', {is: 'coral-table'}));
      expect(el.classList.contains('_coral-Table-wrapper')).to.be.true;
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Table.base.html']
    );
  });
  
  describe('API', function() {
    describe('#head', function() {
      it('should return the table head', function() {
        const el = helpers.build(new Table());
        expect(el._elements.table.tHead).to.equal(el.head);
      });
    });
  
    describe('#body', function() {
      it('should return the table body', function() {
        const el = helpers.build(new Table());
        expect(el._elements.table.tBodies[0]).to.equal(el.body);
      });
    });
  
    describe('#foot', function() {
      it('should return the table foot', function() {
        const el = helpers.build(new Table());
        expect(el._elements.table.tFoot).to.equal(el.foot);
      });
    });
  
    describe('#columns', function() {
      it('should return the table columns', function() {
        const el = helpers.build(new Table());
        expect(el._elements.table.querySelector('colgroup')).to.equal(el.columns);
      });
    });
  
    describe('#items', function() {
      it('should be readonly', function() {
        const el = new Table();
        const items = el.items;
        try {
          el.items = '';
        }
        catch (e) {
          expect(el.items).to.equal(items);
        }
      });
  
      it('should retrieve all coral-table-body rows', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var rows = table.body.rows;
        var all = table.items.getAll();
        
        expect(rows.length).to.equal(all.length);
        all.forEach(function(row, i) {
          expect(rows[i]).to.equal(row);
          expect(row instanceof Table.Row).to.be.true;
        });
      });
  
      it('should append a row to the existing coral-table-body', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var length = table.items.length;
        var row = table.items.add(document.createElement('tr', 'coral-table-row'));
        
        expect(table.items.length).to.equal(length + 1);
        expect(row instanceof Table.Row).to.be.true;
      });
  
      it('should append a row when using an object', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var length = table.items.length;
        var row = table.items.add({});
        
        expect(table.items.length).to.equal(length + 1);
        expect(row instanceof Table.Row).to.be.true;
      });
  
      it('should append a row at the given position to the existing body', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var length = table.items.length;
        var row = table.items.add(document.createElement('tr', 'coral-table-row'), table.body.rows[0]);
        
        expect(table.items.length).to.equal(length + 1);
        expect(row).to.equal(table.items.getAll()[0]);
        expect(row instanceof Table.Row).to.be.true;
      });
  
      it('should append a row to the existing body', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var length = table.items.length;
        var row = table.items.add(document.createElement('tr', 'coral-table-row'));
        
        expect(table.items.length).to.equal(length + 1);
        expect(table.items.getAll()[table.items.length - 1]).to.equal(row);
        expect(row instanceof Table.Row).to.be.true;
      });
  
      it('should append a coral-table-body if none', function() {
        var table = helpers.build(window.__html__['Table.empty.html']);
        var row = table.items.add(document.createElement('tr', 'coral-table-row'));
        
        expect(table.items.length).to.equal(1);
        expect(table.items.getAll()[0]).to.equal(row);
        expect(row instanceof Table.Row).to.be.true;
      });
  
      it('should remove all rows', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        expect(table.items.length > 0).to.be.true;
        
        table.items.clear();
        expect(table.items.length).to.equal(0);
      });
  
      it('should trigger coral-collection:add when appending a row', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var eventSpy = sinon.spy();
        table.on('coral-collection:add', eventSpy);
        
        var row = table.items.add();
        
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.item).to.equal(row);
          done();
        });
      });
  
      it('should trigger coral-collection:add when appending a not upgraded row', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var eventSpy = sinon.spy();
        table.body.innerHTML = '';
        table.on('coral-collection:add', eventSpy);
        
        table.body.innerHTML = '<tr is="coral-table-row"></tr>';
        
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
  
      it('should trigger coral-collection:remove', function(done) {
        var table = helpers.build(new Table());
        var eventSpy = sinon.spy();
        table.on('coral-collection:remove', eventSpy);
        
        var row = table.items.add();
        row.remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.item).to.equal(row);
          done();
        });
      });
  
      it('should disable table features if no items', function() {
        var table = helpers.build(window.__html__['Table.selectable.empty.html']);
        expect(table.classList.contains('is-disabled')).to.be.true;
        expect(table.querySelector('[coral-table-select]').disabled).to.be.true;
      });
    });
  
    describe('#variant', function() {
      it('should have a quiet variant', function() {
        const el = new Table();
        el.variant = Table.variant.QUIET;
        expect(el.classList.contains('_coral-Table-wrapper--quiet')).to.be.true;
      });
    });
  
    describe('#selectable', function() {
      it('should set all items to selectable items', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.selectable = true;
        
        helpers.next(() => {
          table.items.getAll().forEach(function(item) {
            expect(item.hasAttribute('coral-table-rowselect')).be.true;
          });
          
          done();
        });
      });
  
      it('should remove selection mode', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        table.selectable = false;
        
        var row = table.body.rows[0];
        row.click();
        
        expect(row.selected).to.be.false;
        expect(row.classList.contains('is-selected')).to.be.false;
        expect(row.getAttribute('aria-selected') === 'false').to.be.true;
      });
  
      it('appended items should be selectable', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var item = table.items.add();
        
        // Wait for MO
        setTimeout(function() {
          item.click();
          
          expect(item.selected).to.be.true;
          expect(item.hasAttribute('coral-table-rowselect')).to.be.true;
          done();
        }, 100);
      });
  
      it('should trigger a change event if selectable is set to false with selected items', function() {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        var eventSpy = sinon.spy();
        var items = table.items.getAll();
        
        items.forEach(function(item) {
          item.selected = true;
        });
        table.on('coral-table:change', eventSpy);
        table.selectable = false;
        
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(items);
        expect(eventSpy.args[0][0].detail.selection).to.deep.equal([]);
      });
    });
  
    describe('#orderable', function() {
      it('should set all items to orderable items', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.orderable = true;
        
        helpers.next(() => {
          table.items.getAll().forEach(function(item) {
            expect(item.hasAttribute('coral-table-roworder')).to.be.true;
          });
          
          done();
        });
      });
  
      it('should remove orderable mode', function() {
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        table.orderable = false;
        
        table.items.getAll().forEach(function(item) {
          expect(item.dragAction).to.be.undefined;
        });
      });
  
      it('appended items should be orderable', function(done) {
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        var item = table.items.add();
        
        // Wait for MO
        setTimeout(function() {
          // Initiates the dragAction
          item.dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true
          }));
          
          expect(item.dragAction).to.not.be.undefined;
          expect(item.hasAttribute('coral-table-roworder')).be.true;
          done();
        }, 100);
      });
    });
  
    describe('#multiple', function() {
      it('should only select the last selected row if multiple is false', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        expect(table.multiple).to.be.false;
        
        row1.selected = true;
        row2.selected = true;
        
        expect(row1.selected).to.be.false;
        expect(row2.selected).to.be.true;
      });
  
      it('should select multiple rows if multiple is true', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        table.multiple = true;
        row1.selected = true;
        row2.selected = true;
        
        expect(table.multiple).to.be.true;
        expect(row1.selected).to.be.true;
        expect(row2.selected).to.be.true;
      });
  
      it('should select multiple rows after enabling table selection', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        table.multiple = true;
        table.selectable = true;
        
        row1.selected = true;
        row2.selected = true;
        
        expect(table.multiple).to.be.true;
        expect(row1.selected).to.be.true;
        expect(row2.selected).to.be.true;
      });
  
      it('should enable multiple selection after adding the body to the table', function(done) {
        var table = new Table().set({
          selectable: true,
          multiple: true
        });
        var body = document.createElement('tbody', 'coral-table-body');
        table._elements.table.appendChild(body);
        
        // Wait for MO
        helpers.next(function() {
          expect(table._elements.table.getAttribute('aria-multiselectable')).to.equal('true');
          done();
        });
      });
    });
  
    describe('#lockable', function() {
      it('should set all items to lockable items', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.lockable = true;
        
        helpers.next(() => {
          table.items.getAll().forEach(function(item) {
            expect(item.hasAttribute('coral-table-rowlock')).to.be.true;
          });
          
          done();
        });
      });
  
      it('should remove lockable mode', function() {
        var table = helpers.build(window.__html__['Table.lockable.html']);
        var row = table.body.rows[1];
        table.lockable = false;
        row.click();
        
        expect(row.locked).to.be.false;
      });
  
      it('appended items should be lockable', function(done) {
        var table = helpers.build(window.__html__['Table.lockable.html']);
        var item = table.items.add();
        
        // Wait for MO
        setTimeout(function() {
          item.click();
          
          expect(item.locked).to.be.true;
          expect(item.hasAttribute('coral-table-rowlock')).to.be.true;
          done();
        }, 100);
      });
    });
  
    describe('#selectedItem', function() {
      it('should return null if no rows are selected', function() {
        var table = helpers.build(window.__html__['Table.empty.html']);
        expect(table.selectedItem).to.equal(null);
      });
  
      it('should return the selected row', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row = table.body.rows[0];
        
        row.selected = true;
        expect(table.selectedItem).to.equal(row);
      });
  
      it('should be readonly', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row = table.body.rows[0];
        
        row.selected = true;
        
        try {
          table.selectedItem = '';
        }
        catch(e) {
          expect(table.selectedItem).to.equal(row);
        }
      });
    });
  
    describe('#selectedItems', function() {
      it('should return an array of selected rows', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row = table.body.rows[0];
        
        row.selected = true;
        expect(table.selectedItems.length).to.equal(1);
        expect(table.selectedItems[0]).to.equal(row);
      });
  
      it('should return an empty array if no rows are selected', function() {
        var table = helpers.build(window.__html__['Table.empty.html']);
        expect(table.selectedItems.length).to.equal(0);
      });
  
      it('should be readonly', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row = table.body.rows[0];
        
        row.selected = true;
        try {
          table.selectedItems = '';
        }
        catch(e) {
          expect(table.selectedItems[0]).to.equal(row);
        }
      });
    });
    
    describe('#coral-table-select', function() {
      it('should set the select all handle to indeterminate state if not all rows are selected', function() {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.body.rows[0].selected = true;
        
        expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
      });
  
      it('should set the select all handle to indeterminate state on initialization', function() {
        var table = helpers.build(window.__html__['Table.preselected.html']);
        expect(table.selectedItems.length).to.equal(table.items.length - 1);
        expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
      });
  
      it('should set the select all handle to checked if an item is removed and all others are selected', function(done) {
        var table = helpers.build(window.__html__['Table.preselected.html']);
        table.items.last().remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(table.querySelector('[coral-table-select]').checked).to.be.true;
          done();
        });
      });
  
      it('should set the select all handle to indeterminate if unselected item is added', function(done) {
        var table = helpers.build(window.__html__['Table.preselected.html']);
        table.items.last().remove();
        table.items.add();
        
        // Wait for MO
        helpers.next(function() {
          expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
          done();
        });
      });
  
      it('should set the select all handle to unchecked if the only selected item is removed', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        var last = table.items.last();
        last.selected = true;
        last.remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(table.querySelector('[coral-table-select]').checked).to.be.false;
          done();
        });
      });
  
      it('should set the select all handle to indeterminate if selected item is added', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.items.add({
          selected: true
        });
        
        // Wait for MO
        helpers.next(function() {
          expect(table.querySelector('[coral-table-select]').indeterminate).to.be.true;
          done();
        });
      });
  
      it('should set the select all handle to checked if only selected item is added', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.items.clear();
        table.items.add({
          selected: true
        });
        
        // Wait for MO
        helpers.next(function() {
          expect(table.querySelector('[coral-table-select]').checked).to.be.true;
          done();
        });
      });
  
      it('should set the select all handle to unchecked if removing the body with selected items', function(done) {
        var table = helpers.build(window.__html__['Table.preselected.html']);
        table.body.remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(table.querySelector('[coral-table-select]').checked).to.be.false;
          done();
        });
      });
  
      it('should set the select all handle to checked if adding a body with a selected item', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.body.remove();
  
        // Wait for MO
        helpers.next(function() {
          var body = new Table.Body();
          body.appendChild(new Table.Row().set({
            selected: true
          }));
          table.body = body;
          
          // Wait for MO
          helpers.next(function() {
            expect(table.querySelector('[coral-table-select]').checked).to.be.true;
            done();
          });
        });
      });
  
      it('should set the select all handle to checked if all rows are selected', function() {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.items.getAll().forEach(function(row) {
          row.selected = true;
        });
        
        expect(table.querySelector('[coral-table-select]').checked).to.be.true;
      });
  
      it('should set the select all handle to unchecked if no rows are selected', function() {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.body.rows[0].selected = true;
        table.body.rows[0].selected = false;
        
        expect(table.querySelector('[coral-table-select]').checked).to.be.false;
      });
  
      it('should set the select all handle to unchecked if there are no items', function() {
        var table = helpers.build(window.__html__['Table.selectable.empty.html']);
        expect(table.items.length).to.equal(0);
        expect(table.querySelector('[coral-table-select]').checked).to.be.false;
      });
  
      it('should select all rows if the select all handle is checked', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        
        table.on('coral-table:change', eventSpy);
        table.querySelector('[coral-table-select] input').click();
        
        table.items.getAll().forEach(function(row) {
          expect(row.selected).to.be.true;
          expect(row.classList.contains('is-selected')).to.be.true;
          expect(row.hasAttribute('selected')).to.be.true;
        });
        
        expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
        expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
      });
  
      it('should deselect all rows if the select all handle is unchecked', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        var items = table.items.getAll();
        
        items.forEach(function(item) {
          item.selected = true;
        });
        
        table.on('coral-table:change', eventSpy);
        table.querySelector('[coral-table-select] input').click();
        
        items.forEach(function(row) {
          expect(row.selected).to.be.false;
          expect(row.classList.contains('is-selected')).to.be.false;
          expect(row.hasAttribute('selected')).to.be.false;
        });
        
        expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(items);
        expect(eventSpy.args[0][0].detail.selection).to.deep.equal([]);
      });
  
      it('should select the last row if table selection multiple is false and select all handle is checked', function() {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.multiple = false;
        table.querySelector('[coral-table-select] input').click();
        
        var rows = table.items.getAll();
        rows.forEach(function(row, i) {
          expect(row.selected).to.equal(i === rows.length - 1);
        });
      });
  
      it('should deselect the last row if table selection multiple is false and select all handle gets unchecked', function() {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        table.multiple = false;
        table.items.last().selected = true;
        
        table.querySelector('[coral-table-select] input').click();
        
        var rows = table.items.getAll();
        rows.forEach(function(row) {
          expect(row.selected).to.be.false;
        });
      });
      
      it('should select all rows except disabled ones if the select all handle is checked', function() {
        const table = helpers.build(window.__html__['Table.selectable.all.html']);
    
        const firstItem = table.items.first();
        const lastItem = table.items.last();
        const selectAll = table.querySelector('[coral-table-select]');
        
        firstItem.querySelector('[coral-table-rowselect]').setAttribute('disabled', '');
        selectAll.querySelector('input').click();
        
        expect(firstItem.selected).to.be.false;
        expect(lastItem.selected).to.be.true;
      });
    });
  });
  
  describe('Events', function() {
    describe('#coral-table:change', function() {
      it('should trigger if the row is clicked', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.selectable = true;
        
        var eventSpy = sinon.spy();
        table.on('coral-table:change', eventSpy);
        
        helpers.next(function() {
          var row = table.body.rows[0];
          row.click();
          
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
          
          done();
        });
      });
  
      it('should pass selection and oldSelection', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var eventSpy = sinon.spy();
        table.multiple = true;
        
        var rows = table.body.rows;
        rows[0].selected = true;
        rows[1].selected = true;
        
        var selection = table.selectedItems;
        table.on('coral-table:change', eventSpy);
        
        table.body.rows[2].selected = true;
        
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
        expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
      });
  
      it('should trigger a change event when adding a selected item', function(done) {
        var table = helpers.build(new Table());
        var eventSpy = sinon.spy();
        table.selectable = true;
        
        var selection = table.selectedItems;
        table.on('coral-table:change', eventSpy);
        
        var row = new Table.Row();
        row.selected = true;
        table.body.appendChild(row);
        
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
          
          done();
        });
      });
  
      it('should trigger a change event when removing a selected item', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var eventSpy = sinon.spy();
        table.multiple = true;
        
        var rows = table.body.rows;
        rows[0].selected = true;
        rows[1].selected = true;
        
        var selection = table.selectedItems;
        table.on('coral-table:change', eventSpy);
        
        rows[1].remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
          done();
        });
      });
  
      it('should trigger a change events when adding a body with a selected item', function(done) {
        var table = helpers.build(window.__html__['Table.empty.html']);
        table.selectable = true;
        
        var body = new Table.Body();
        body.appendChild(new Table.Row().set({selected: true}));
        
        var eventSpy = sinon.spy();
        table.on('coral-table:change', eventSpy);
        table.body = body;
  
        // Wait for MO
        helpers.next(function() {
          // One event for the added row and one for the added body
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
          done();
        });
      });
  
      it('should trigger a change event when removing a body with a selected item', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var eventSpy = sinon.spy();
        
        table.body.rows[0].selected = true;
        var selection = table.selectedItems;
      
        table.on('coral-table:change', eventSpy);
        table.body.remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
          
          done();
        });
      });
  
      it('should trigger a change event if multiple is set to false with selected items', function() {
        var table = helpers.build(window.__html__['Table.selectable.all.html']);
        var eventSpy = sinon.spy();
        var items = table.items.getAll();
        
        items.forEach(function(item) {
          item.selected = true;
        });
        
        table.on('coral-table:change', eventSpy);
        table.multiple = false;
        
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(items);
        expect(eventSpy.args[0][0].detail.selection).to.deep.equal(table.selectedItems);
      });
  
      it('should not trigger coral-table:change event when sorting', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
    
        table.selectable = true;
        table.body.rows[0].selected = true;
        table.on('coral-table:change', eventSpy);
    
        var col = getColumns(table.columns)[0];
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
    
        expect(eventSpy.callCount).to.equal(0);
      });
    });
  
    describe('#coral-table:rowchange', function() {
      it('should trigger when selecting a cell', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var eventSpy = sinon.spy();
        var row = table.items.first();
        var cell = row.items.first();
      
        table.on('coral-table:rowchange', eventSpy);
        
        helpers.next(() => {
          cell.click();
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          
          done();
        });
      });
    
      it('should trigger when deselecting a cell', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var eventSpy = sinon.spy();
        var row = table.items.first();
        var cell = row.items.first();
        cell.selected = true;
        table.on('coral-table:rowchange', eventSpy);
        
        helpers.next(() => {
          cell.click();
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([cell]);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal([]);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          
          done();
        });
      });
    
      it('should pass selection and oldSelection', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var eventSpy = sinon.spy();
        var row = table.items.first();
      
        row.multiple = true;
      
        var cells = row.cells;
        cells[0].selected = true;
        cells[1].selected = true;
      
        var selection = row.selectedItems;
        table.on('coral-table:rowchange', eventSpy);
        cells[2].selected = true;
      
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
        expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
        expect(eventSpy.args[0][0].detail.row).to.equal(row);
      });
    
      it('should trigger a change event when adding a selected item', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var eventSpy = sinon.spy();
        var row = table.items.first();
      
        row.multiple = true;
      
        var cells = row.cells;
        cells[0].selected = true;
        cells[1].selected = true;
      
        var selection = row.selectedItems;
        table.on('coral-table:rowchange', eventSpy);
        row.items.add({
          selected: true
        });
      
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          done();
        });
      });
    
      it('should trigger a change event when removing a selected item', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var eventSpy = sinon.spy();
        var row = table.items.first();
      
        row.multiple = true;
      
        var cells = row.cells;
        cells[0].selected = true;
        cells[1].selected = true;
      
        var selection = row.selectedItems;
        table.on('coral-table:rowchange', eventSpy);
        cells[1].remove();
      
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          done();
        });
      });
    
      it('should trigger a change event when adding a selected item to a row', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var eventSpy = sinon.spy();
        var row = table.items.first();
      
        table.on('coral-table:rowchange', eventSpy);
        row.items.add({
          selected: true
        });
      
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([]);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          done();
        });
      });
    
      it('should trigger a change event when removing a row with a selected item', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var eventSpy = sinon.spy();
        var row = table.items.first();
        var cell = row.items.first();
      
        cell.selected = true;
      
        var selection = row.selectedItems;
        table.on('coral-table:rowchange', eventSpy);
        row.removeChild(cell);
      
        // Wait for MO
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(selection);
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal(row.selectedItems);
          expect(eventSpy.args[0][0].detail.row).to.deep.equal(row);
          done();
        });
      });
    
      it('should only trigger one coral-table:rowchange event on single selection change', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var firstItem = row.items.first();
        var lastItem = row.items.last();
        
        firstItem.selected = true;
        table.on('coral-table:rowchange', eventSpy);
        lastItem.selected = true;
        
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.row).to.equal(row);
        expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal([firstItem]);
        expect(eventSpy.args[0][0].detail.selection).to.deep.equal([lastItem]);
      });
    
      it('should only trigger one coral-table:rowchange event on multiple false change', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        
        row.multiple = true;
        row.items.getAll().forEach(function(item) {
          item.selected = true;
        });
        
        table.on('coral-table:rowchange', eventSpy);
        row.multiple = false;
        
        // Wait additional frame until first selected items are deselected
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          expect(eventSpy.args[0][0].detail.oldSelection).to.deep.equal(row.items.getAll());
          expect(eventSpy.args[0][0].detail.selection).to.deep.equal([row.items.last()]);
          
          done();
        });
      });
    });
    
    describe('#coral-table:roworder', function() {
      it('should trigger if dragging the row to the top', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        
        table.on('coral-table:roworder', eventSpy);
        var row = table.body.rows[1];
        
        helpers.next(() => {
          dragRowTo(row, -1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          
          done();
        });
      });
  
      it('should pass the sibling row to allow reverting', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        
        table.on('coral-table:roworder', eventSpy);
        
        var row = table.body.rows[0];
        var oldBefore = table.body.rows[1];
        
        expect(getIndexOf(row)).to.equal(0);
        
        helpers.next(() => {
          dragRowTo(row, 1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.row).to.equal(row);
          expect(eventSpy.args[0][0].detail.oldBefore).to.equal(oldBefore);
          expect(eventSpy.args[0][0].detail.before).to.equal(row.nextElementSibling);
          
          done();
        });
      });
    });
    
    describe('#coral-table:beforeroworder', function() {
      it('should call first beforeroworder and then roworder', function(done) {
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        var spy = sinon.spy();
        
        table.on('coral-table:beforeroworder', spy);
    
        table.on('coral-table:roworder', function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
    
        helpers.next(() => {
          dragRowTo(table.body.rows[0], 1);
        });
      });
    });
    
    describe('#coral-table:rowlock', function() {
      it('should trigger if the row is locked', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.base.html']);
        
        table.on('coral-table:rowlock', eventSpy);
        var row = table.body.rows[1];
        
        row.locked = true;
        
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.row).to.equal(row);
        expect(getIndexOf(row)).to.equal(0);
      });
    });
    
    describe('#coral-table:rowunlock', function() {
      it('should trigger if the row is unlocked', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.base.html']);
        
        table.on('coral-table:rowunlock', eventSpy);
        var row = table.body.rows[1];
        var initialRowIndex = getIndexOf(row);
        
        row.locked = true;
        row.locked = false;
        
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.row).to.equal(row);
        expect(getIndexOf(row)).to.equal(initialRowIndex);
      });
    });
    
    describe('#coral-table:beforecolumnsort', function() {
      it('should trigger coral-table:beforecolumnsort', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:beforecolumnsort', eventSpy);
    
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
    
        headerCell.click();
    
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.column).to.equal(col);
        expect(eventSpy.args[0][0].detail.direction).to.equal(Table.Column.sortableDirection.ASCENDING);
      });
    });
    
    describe('#coral-table:columnsort', function() {
      it('should trigger once when setting direction to ascending', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:columnsort', eventSpy);
    
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
    
        headerCell.click();
    
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.column).to.equal(col);
      });
    });
    
    describe('#coral-table:beforecolumndrag', function() {
      it('should trigger when dragging the header cell to the left', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[1];
        table.on('coral-table:beforecolumndrag', eventSpy);
        
        // Columns are moved in the event
        table.on('coral-table:beforecolumndrag', function() {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(eventSpy.args[0][0].detail.before).to.equal(getColumns(table.columns)[0]);
  
          done();
        });
        
        // Wait for layouting before moving columns around
        helpers.next(function() {
          var headerCell = table.head.rows[0].cells[1];
          dragHeaderCellTo(headerCell, -1);
        });
      });
    });
    
    describe('#coral-table:columndrag', function() {
      it('should trigger when dragging the header cell to the left', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[1];
        
        table.on('coral-table:columndrag', eventSpy);
  
        // Wait for layouting before moving columns around
        helpers.next(function() {
          var headerCell = table.head.rows[0].cells[1];
          dragHeaderCellTo(headerCell, -1);
  
          expect(eventSpy.callCount).to.equal(1);
          
          done();
        });
      });
  
      it('should pass the sibling column to allow reverting', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[0];
        var oldBefore = getColumns(table.columns)[1];
    
        table.on('coral-table:columndrag', eventSpy);
  
        // Wait for layouting before moving columns around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[0], 1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(eventSpy.args[0][0].detail.oldBefore).to.equal(oldBefore);
          expect(eventSpy.args[0][0].detail.before).to.equal(col.nextElementSibling);
          
          done();
        });
      });
    });
  });
  
  describe('User Interaction', function() {
    describe('#selectable', function() {
      it('should select the row if clicked', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row = table.body.rows[0];
        
        helpers.next(() => {
          row.click();
  
          expect(row.selected).to.be.true;
          expect(row.classList.contains('is-selected')).to.be.true;
          expect(row.getAttribute('aria-selected')).to.equal('true');
          
          done();
        });
      });
      
      it('should select the cell when clicked', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cell = row.items.first();
        
        helpers.next(() => {
          cell.click();
  
          expect(cell.selected).to.be.true;
          expect(cell.classList.contains('is-selected')).to.be.true;
          expect(cell.getAttribute('aria-selected')).to.equal('true');
          
          done();
        });
      });
      
      it('should only be possible to select a cell if selection mode is on', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        row.selectable = false;
  
        helpers.next(() => {
          var cell = row.items.first();
          cell.click();
          
          expect(cell.selected).to.be.false;
          expect(cell.classList.contains('is-selected')).to.be.false;
          expect(cell.getAttribute('aria-selected') === 'true').to.be.false;
          
          row.selectable = true;
          
          cell.click();
          
          expect(cell.selected).to.be.true;
          expect(cell.classList.contains('is-selected')).to.be.true;
          expect(cell.getAttribute('aria-selected') === 'true').to.be.true;
          
          done();
        });
      });
    });
    
    describe('#orderable', function() {
      it('should drag the row to the top', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        
        table.on('coral-table:roworder', eventSpy);
        
        var row = table.body.rows[1];
        
        expect(getIndexOf(row)).to.equal(1);
        
        helpers.next(() => {
          dragRowTo(row, -1);
  
          // Wait for dragging
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(getIndexOf(row)).to.equal(0);
            expect(document.activeElement).to.equal(row);
    
            done();
          });
        });
      });
      
      it('should drag the row to the bottom', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        
        table.on('coral-table:roworder', eventSpy);
        
        var row = table.body.rows[0];
        
        expect(getIndexOf(row)).to.equal(0);
        
        helpers.next(() => {
          dragRowTo(row, 1);
  
          // Wait for dragging
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(getIndexOf(row)).to.equal(1);
            expect(document.activeElement).to.equal(row);
    
            done();
          });
        });
      });
      
      it('should prevent the row from being inserted at the dragged position', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        
        table.on('coral-table:beforeroworder', eventSpy);
        table.on('coral-table:beforeroworder', function(event) {
          event.preventDefault();
        });
        
        var row = table.body.rows[0];
        
        expect(getIndexOf(row)).to.equal(0);
        
        helpers.next(() => {
          dragRowTo(row, 1);
  
          // Wait for dragging
          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(1);
            expect(eventSpy.args[0][0].detail.row).to.equal(row);
            expect(eventSpy.args[0][0].detail.before).to.equal(null);
            expect(getIndexOf(row)).to.equal(0);
            expect(document.activeElement).to.equal(row);
    
            done();
          });
        });
      });
      
      it('should not initialize dragging logic if the order handle is disabled', function() {
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        var row = table.body.rows[0];
        
        row.setAttribute('disabled', '');
        row.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true
        }));
        
        expect(row.dragAction).to.be.undefined;
        expect(table.querySelector('._coral-Table-row--placeholder')).to.be.null;
      });
      
      // @flaky
      it.skip('should scroll to the table bottom in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.orderable.row.html']);
        var row = table.items.first();
        var container = table._elements.container;
        
        // setTimeout required else scrolling won't be effective
        window.setTimeout(function() {
          container.scrollTop = 0;
          
          dragRowTo(row, 1);
          
          // Wait for dragging
          helpers.next(function() {
            expect(row).to.equal(table.items.last());
            expect(container.scrollTop > 0).to.be.true;
            done();
          });
        }, 100);
      });
  
      // @flaky
      it.skip('should scroll to the table top in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.orderable.row.html']);
        var row = table.items.last();
        var container = table._elements.container;
        
        // setTimeout required else scrolling won't be effective
        window.setTimeout(function() {
          container.scrollTop = 100;
          
          var maxScrollTop = container.scrollTop;
          dragRowTo(row, -1);
          
          // Wait for dragging
          helpers.next(function() {
            expect(row).to.equal(table.items.first());
            expect(container.scrollTop < maxScrollTop).to.be.true;
            done();
          });
        }, 100);
      });
    });
    
    describe('#sortable', function() {
      it('should prevent sorting if user clicks the sorting arrow', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:columnsort', eventSpy);
        table.on('coral-table:beforecolumnsort', function(event) {
          event.preventDefault();
        });
        
        var col = getColumns(table.columns)[0];
        var sortableDirection = col.sortableDirection;
        table.head.rows[0].cells[0].click();
        
        expect(eventSpy.callCount).to.equal(0);
        expect(col.sortableDirection).to.equal(sortableDirection);
      });
      
      it('should set sortable direction to ascending', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:columnsort', eventSpy);
        
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
        
        headerCell.click();
        
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.ASCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
          done();
        });
      });
      
      it('should set sortable direction to descending', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:columnsort', eventSpy);
        
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
        
        headerCell.click();
        headerCell.click();
        
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(2);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DESCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
          done();
        });
      });
      
      it('should set sortable direction back to default', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:columnsort', eventSpy);
        
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
        
        headerCell.click();
        headerCell.click();
        headerCell.click();
        
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(3);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DEFAULT);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
          done();
        });
      });
    });
    
    describe('#lockable', function() {
      it('should lock the row if lock element is clicked', function(done) {
        var table = helpers.build(window.__html__['Table.lockable.html']);
        var row = table.body.rows[1];
        
        expect(getIndexOf(row)).to.equal(1);
        
        row.click();
        
        // Wait for dom changes
        helpers.next(function() {
          expect(getIndexOf(row)).to.equal(0);
          expect(document.activeElement).to.equal(row);
          done();
        });
      });
      
      it('should not lock the row if table is not lockable', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.base.html']);
        
        table.lockable = false;
        table.on('coral-table:rowlock', eventSpy);
        
        var row = table.body.rows[1];
        expect(getIndexOf(row)).to.equal(1);
        
        row.click();
        
        // Wait for dom changes
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(0);
          expect(getIndexOf(row)).to.equal(1);
          done();
        });
      });
      
      it('should preserve the selection after locking', function() {
        var table = helpers.build(window.__html__['Table.lockable.html']);
        table.selectable = true;
        
        var row = table.body.rows[1];
        row.selected = true;
        
        row.click();
        
        expect(row.selected).to.be.true;
        expect(row.locked).to.be.true;
      });
    });
    
    describe('#keyboard support', function() {
      it('first selectable item is focusable by default', function() {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        expect(table.items.first().getAttribute('tabindex') === '0').to.be.true;
      });
      
      it('first lockable item is focusable by default', function() {
        var table = helpers.build(window.__html__['Table.lockable.html']);
        expect(table.items.first().getAttribute('tabindex') === '0').to.be.true;
      });
      
      it('first orderable item is focusable by default', function() {
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        expect(table.items.first().getAttribute('tabindex') === '0').to.be.true;
      });
      
      it('should focus the selected item', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        helpers.next(() => {
          row2.click();
  
          expect(row1.hasAttribute('tabindex')).to.be.false;
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should focus the first item with key:home', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row3 = table.body.rows[2];
        
        helpers.next(() => {
          row3.click();
  
          expect(row3.getAttribute('tabindex') === '0').to.be.true;
          expect(row3).to.equal(document.activeElement);
  
          helpers.keypress('home', row3);
  
          expect(row1.getAttribute('tabindex') === '0').to.be.true;
          expect(row1).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should focus the last item with key:end', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row3 = table.body.rows[2];
        
        helpers.next(() => {
          row1.click();
  
          expect(row1.getAttribute('tabindex') === '0').to.be.true;
          expect(row1).to.equal(document.activeElement);
  
          helpers.keypress('end', row1);
  
          expect(row3.getAttribute('tabindex') === '0').to.be.true;
          expect(row3).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should focus the next item with key:right', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        helpers.next(() => {
          helpers.keypress('right', row1);
  
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should focus the next item with key:down', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        helpers.next(() => {
          helpers.keypress('down', row1);
  
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should focus the next item with key:pagedown', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        helpers.next(() => {
          helpers.keypress('pagedown', row1);
  
          expect(row2.getAttribute('tabindex') === '0').to.be.true;
          expect(row2).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should focus the previous item with key:left, key:up, key:pageup', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        helpers.next(() => {
          row2.click();
  
          helpers.keypress('left', row2);
  
          expect(row1.getAttribute('tabindex') === '0').to.be.true;
          expect(row1).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should focus the previous item with key:up', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        helpers.next(() => {
          row2.click();
  
          helpers.next(() => {
            helpers.keypress('up', row2);
    
            expect(row1.getAttribute('tabindex') === '0').to.be.true;
            expect(row1).to.equal(document.activeElement);
    
            done();
          });
        });
      });
      
      it('should focus the previous item with key:pageup', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        helpers.next(() => {
          row2.click();
  
          helpers.keypress('up', row2);
  
          expect(row1.getAttribute('tabindex') === '0').to.be.true;
          expect(row1).to.equal(document.activeElement);
          
          done();
        });
      });
      
      it('should select next item with key:down+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        table.selectable = true;
        table.multiple = true;
        
        helpers.next(() => {
          row1.click();
  
          helpers.keypress('down', row1, ['shift']);
  
          // Wait for selection
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row2).to.equal(document.activeElement);
    
            done();
          });
        });
      });
      
      it('should select next item with key:pagedown+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
        
        table.selectable = true;
        table.multiple = true;
        
        helpers.next(() => {
          row1.click();
  
          helpers.keypress('down', row1, ['shift']);
  
          // Wait for selection
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row2).to.equal(document.activeElement);
    
            done();
          });
        });
      });
      
      it('should select next item with key:right+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
  
        table.selectable = true;
        table.multiple = true;
        
        helpers.next(() => {
          row1.click();
  
          helpers.keypress('down', row1, ['shift']);
  
          // Wait for selection
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row2).to.equal(document.activeElement);
    
            done();
          });
        });
      });
      
      it('should select previous item with key:up+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
  
        table.selectable = true;
        table.multiple = true;
        
        helpers.next(() => {
          row2.click();
  
          helpers.keypress('up', row2, ['shift']);
  
          // Wait for selection
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row1).to.equal(document.activeElement);
    
            done();
          });
        });
      });
      
      it('should select previous item with key:pageup+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
  
        table.selectable = true;
        table.multiple = true;
        
        helpers.next(() => {
          row2.click();
  
          helpers.keypress('up', row2, ['shift']);
  
          // Wait for selection
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row1).to.equal(document.activeElement);
    
            done();
          });
        });
      });
      
      it('should select previous item with key:left+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row1 = table.body.rows[0];
        var row2 = table.body.rows[1];
  
        table.selectable = true;
        table.multiple = true;
        
        helpers.next(() => {
          row2.click();
  
          helpers.keypress('up', row2, ['shift']);
  
          // Wait for selection
          helpers.next(function() {
            expect(table.selectedItems.length).to.equal(2);
            expect(row1.selected).to.be.true;
            expect(row2.selected).to.be.true;
            expect(row1).to.equal(document.activeElement);
    
            done();
          });
        });
      });
      
      it('should prevent text-selection', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.selectable = true;
        
        var row = table.body.rows[0];
        
        row.selected = true;
        table.multiple = true;
        
        helpers.next(() => {
          table.body.rows[1].dispatchEvent(new MouseEvent('mousedown', {
            bubbles: true,
            shiftKey: true
          }));
  
          expect(table.selectedItems.length).to.equal(1);
          expect(table.selectedItem).to.equal(row);
          expect(table.classList.contains('is-unselectable')).to.be.true;
          
          done();
        });
      });
      
      it('should select multiple items with click+shift if no items selected by default', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.selectable = true;
        table.multiple = true;
        table.items.add();
        
        helpers.next(() => {
          table.body.rows[1].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
  
          expect(table.body.rows[0].selected).to.be.true;
          expect(table.body.rows[1].selected).to.be.true;
          expect(table.body.rows[2].selected).to.be.false;
          
          done();
        });
      });
      
      it('should select an item range with click+shift on deselected item', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.selectable = true;
        
        var rows = table.body.rows;
        table.multiple = true;
        rows[0].selected = true;
        
        helpers.next(() => {
          rows[rows.length - 1].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
  
          expect(table.selectedItems.length).to.equal(table.items.length);
          
          done();
        });
      });
      
      it('should select an item range if click+shift on selected item', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.items.add();
        table.selectable = true;
        table.multiple = true;
        
        table.body.rows[0].selected = true;
        table.body.rows[2].selected = true;
        
        helpers.next(() => {
          table.body.rows[0].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
  
          expect(table.selectedItems.length).to.equal(table.items.length);
          
          done();
        });
      });
      
      it('should reverse selection with click+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.items.add();
        table.selectable = true;
        table.multiple = true;
        
        table.body.rows[1].selected = true;
        
        helpers.next(() => {
          table.body.rows[0].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
  
          table.body.rows[2].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
  
          expect(table.body.rows[0].selected).to.be.false;
          expect(table.body.rows[1].selected).to.be.true;
          expect(table.body.rows[2].selected).to.be.true;
          
          done();
        });
      });
      
      it('should deselect siblings items of selected row with click+shift', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        table.items.add();
        table.selectable = true;
        table.multiple = true;
        
        table.body.rows[0].selected = true;
        table.body.rows[1].selected = true;
        table.body.rows[2].selected = true;
        
        helpers.next(() => {
          table.body.rows[1].dispatchEvent(new MouseEvent('click', {
            bubbles: true,
            shiftKey: true
          }));
  
          expect(table.body.rows[0].selected).to.be.false;
          expect(table.body.rows[1].selected).to.be.true;
          expect(table.body.rows[2].selected).to.be.true;
          
          done();
        });
      });
    });
  });
  
  describe('Implementation Details', function() {
    describe('#a11y', function() {
      it('should set a11y attributes', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        expect(table._elements.container.getAttribute('role')).to.equal('presentation');
        expect(table.getAttribute('role')).to.equal('presentation');
        expect(table._elements.table.getAttribute('role')).to.equal('grid');
      
        var headerCell = table.head.rows[0].cells[0];
        expect(headerCell.getAttribute('scope')).to.equal('col');
        expect(headerCell.getAttribute('role')).to.equal('columnheader');
      
        table.body.rows[0].appendChild(headerCell);
        
        // Wait for MO
        helpers.next(function() {
          expect(headerCell.getAttribute('scope')).to.equal('row');
          expect(headerCell.getAttribute('role')).to.equal('rowheader');
          done();
        });
      });
    });
    
    describe('#orderable', function() {
      it('should remove the row placeholder before triggering roworder events', function(done) {
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
    
        table.on('coral-table:beforeroworder', function() {
          expect(table.querySelector('._coral-Table-row--placeholder')).to.be.null;
        });
    
        table.on('coral-table:roworder', function() {
          expect(table.querySelector('._coral-Table-row--placeholder')).to.be.null;
          done();
        });
    
        helpers.next(() => {
          dragRowTo(table.body.rows[0], 1);
        });
      });
      
      it('should destroy the dragaction', function() {
        var table = helpers.build(window.__html__['Table.orderable.row.html']);
        var row = table.body.rows[1];
        
        row.orderable = false;
        
        expect(row.dragaction).to.be.undefined;
      });
    });
    
    describe('#selectable', function() {
      it('should allow input without selecting the row', function() {
        var table = helpers.build(window.__html__['Table.selectable.input.html']);
        var row = table.body.rows[0];
        
        row.querySelector('input[type="text"]').click();
        
        expect(row.selected).to.be.false;
      });
      
      it('should only select the last selected cell if multiple is false', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cells = row.items.getAll();
        var cell1 = cells[0];
        var cell2 = cells[1];
    
        expect(row.multiple).to.be.false;
    
        cell1.selected = true;
        cell2.selected = true;
    
        expect(cell1.selected).to.be.false;
        expect(cell2.selected).to.be.true;
      });
  
      it('should select multiple cells if multiple is true', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cells = row.items.getAll();
        var cell1 = cells[0];
        var cell2 = cells[1];
    
        row.multiple = true;
        cell1.selected = true;
        cell2.selected = true;
    
        expect(row.multiple).to.be.true;
        expect(cell1.selected).to.be.true;
        expect(cell2.selected).to.be.true;
      });
  
      it('should select multiple cells after enabling row selection', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row = table.items.first();
        var cells = row.items.getAll();
        var cell1 = cells[0];
        var cell2 = cells[1];
    
        row.multiple = true;
        row.selectable = true;
    
        cell1.selected = true;
        cell2.selected = true;
    
        expect(row.multiple).to.be.true;
        expect(cell1.selected).to.be.true;
        expect(cell2.selected).to.be.true;
      });
  
      it('appended items should be selectable', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var cell = table.items.first().items.add();
    
        // Wait for MO
        setTimeout(function() {
          cell.click();
      
          expect(cell.selected).to.be.true;
          expect(cell.hasAttribute('coral-table-cellselect')).to.be.true;
          done();
        }, 100);
      });
  
      it('should only select the last selected cell if multiple is false', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cells = row.items.getAll();
        var cell1 = cells[0];
        var cell2 = cells[1];
    
        expect(row.multiple).to.be.false;
    
        cell1.selected = true;
        cell2.selected = true;
    
        expect(cell1.selected).to.be.false;
        expect(cell2.selected).to.be.true;
      });
  
      it('should select multiple cells if multiple is true', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cells = row.items.getAll();
        var cell1 = cells[0];
        var cell2 = cells[1];
    
        row.multiple = true;
        cell1.selected = true;
        cell2.selected = true;
    
        expect(row.multiple).to.be.true;
        expect(cell1.selected).to.be.true;
        expect(cell2.selected).to.be.true;
      });
  
      it('should select multiple cells after enabling row selection', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row = table.items.first();
        var cells = row.items.getAll();
        var cell1 = cells[0];
        var cell2 = cells[1];
    
        row.multiple = true;
        row.selectable = true;
    
        cell1.selected = true;
        cell2.selected = true;
    
        expect(row.multiple).to.be.true;
        expect(cell1.selected).to.be.true;
        expect(cell2.selected).to.be.true;
      });
  
      it('appended items should be selectable', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var cell = table.items.first().items.add();
    
        // Wait for MO
        setTimeout(function() {
          cell.click();
      
          expect(cell.selected).to.be.true;
          expect(cell.hasAttribute('coral-table-cellselect')).to.be.true;
          done();
        }, 100);
      });
      
      it('should render a selectable checkbox (row selection)', function() {
        const table = helpers.build(window.__html__['Table.selectable.rowhandle.html']);
        const items = table.items.getAll();
        
        expect(items[0].querySelector('coral-checkbox:first-child[coral-table-rowselect][checked]')).to.not.equal(null);
        expect(items[1].querySelector('coral-checkbox[coral-table-rowselect][checked]')).to.not.equal(null);
        expect(items[2].querySelector('coral-checkbox[coral-table-rowselect][checked]')).to.not.equal(null);
      });
  
      it('should render a selectable checkbox (cell selection)', function() {
        const table = helpers.build(window.__html__['Table.selectable.cellhandle.html']);
        const row = table.items.first();
        const items = row.items.getAll();
        
        items.forEach((item) => {
          expect(item.hasAttribute('coral-table-cellselect')).to.be.true;
        });
        
        expect(items[0].querySelector('coral-checkbox:first-child[checked]')).to.not.equal(null);
        expect(items[1].querySelector('coral-checkbox[checked]')).to.not.equal(null);
        expect(items[2].querySelector('coral-checkbox[checked]:not([coral-table-cellselect])')).to.not.equal(null);
      });
    });
    
    describe('#lockable', function() {
      it('should lock the row by placing it as first child of body', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row = table.body.rows[1];
        
        expect(getIndexOf(row)).to.equal(1);
        row.locked = true;
        
        expect(getIndexOf(row)).to.equal(0);
      });
  
      it('should unlock the row by placing back to its position', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        
        var row = table.body.rows[1];
        var initialRowIndex = getIndexOf(row);
        
        row.locked = true;
        row.locked = false;
        
        expect(getIndexOf(row)).to.equal(initialRowIndex);
      });
    });
    
    describe('#sticky', function() {
      it('should scroll to the table right', function(done) {
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var headerCell = table.head.rows[0].cells[0];
        var container = table._elements.container;
        
        // setTimeout required else scrolling won't be effective
        window.setTimeout(function() {
          container.scrollLeft = 0;
          
          dragHeaderCellTo(headerCell, 1);
          
          expect(headerCell).to.equal(table.head.rows[0].cells[1]);
          expect(container.scrollLeft > 0).to.be.true;
          done();
        }, 100);
      });
  
      it('should scroll to the table left', function(done) {
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var headerCell = table.head.rows[0].cells[1];
        var container = table._elements.container;
        
        // setTimeout required else scrolling won't be effective
        window.setTimeout(function() {
          container.scrollLeft = 1000;
          var maxScrollLeft = container.scrollLeft;
          
          dragHeaderCellTo(headerCell, -1);
          
          expect(headerCell).to.equal(table.head.rows[0].cells[0]);
          expect(container.scrollLeft < maxScrollLeft).to.be.true;
          done();
        }, 100);
      });
  
      it('should scroll to the table right in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.orderable.column.html']);
        var headerCell = table.head.rows[0].cells[0];
        var container = table._elements.container;
        
        // setTimeout required else scrolling won't be effective
        window.setTimeout(function() {
          container.scrollLeft = 0;
          dragHeaderCellTo(headerCell.content, 1000);
          
          expect(headerCell).to.equal(table.head.rows[0].cells[1]);
          expect(container.scrollLeft > 0).to.be.true;
          done();
        }, 100);
      });
  
      it('should scroll to the table left in sticky mode', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.orderable.column.html']);
        var headerCell = table.head.rows[0].cells[1];
        var container = table._elements.container;
        
        // setTimeout required else scrolling won't be effective
        window.setTimeout(function() {
          container.scrollLeft = 1000;
          var maxScrollLeft = container.scrollLeft;
          
          dragHeaderCellTo(headerCell.content, -1);
          
          expect(headerCell).to.equal(table.head.rows[0].cells[0]);
          expect(container.scrollLeft < maxScrollLeft).to.be.true;
          done();
        }, 100);
      });
  
      // @flaky
      it.skip('should add the sticky class and prepare the header cells', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.empty.html']);
        var wait = table._wait;
        table._wait = 0;
      
        // Because of debouncing
        window.setTimeout(function() {
          expect(table.classList.contains('_coral-Table-wrapper--sticky')).to.be.true;
        
          getHeaderCells(table.head.rows[0]).forEach(function(headerCell) {
            var computedStyle = window.getComputedStyle(headerCell);
            var cellWidth = Math.round(parseFloat(computedStyle.width));
            var cellPadding = Math.round(parseFloat(computedStyle.paddingLeft)) + Math.round(parseFloat(computedStyle.paddingRight));
            var borderRightWidth = Math.round(parseFloat(computedStyle.borderRightWidth));
            borderRightWidth = window.isNaN(borderRightWidth) ? 0 : borderRightWidth;
          
            expect(parseInt(headerCell._elements.content.style.width, 10)).to.equal(cellWidth + cellPadding + borderRightWidth);
            done();
          });
        }, wait);
      });
  
      // @flaky
      it.skip('should calculate head placeholder size if head is sticky', function(done) {
        var table = helpers.build(window.__html__['Table.resize.html']);
        var wait = table._wait;
        table._wait = 0;
      
        // Because of debouncing
        window.setTimeout(function() {
          var headHeight = 0;
          getRows([table.head]).forEach(function(row, i) {
            // +1 pixel for the border between both header rows
            headHeight += row.cells[0].content.clientHeight + (i > 0 ? 1 : 0);
          });
        
          expect(table.head.divider).to.equal(Table.divider.CELL);
          expect(table.head.sticky).to.be.true;
          expect(table._elements.container.style.marginTop).to.equal(headHeight + 'px');
        
          // Add 2 pixels for table border top and bottom
          headHeight += 2;
        
          expect(table._elements.container.style.height).to.equal('calc(100% - ' + headHeight + 'px)');
          done();
        }, wait);
      });
  
      // @flaky
      it.skip('should calculate the sticky headercells when table has empty columns', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.empty.html']);
        var wait = table._wait;
        table._wait = 0;
      
        // Because of debouncing
        window.setTimeout(function() {
          getHeaderCells(table.head.rows[0]).forEach(function(headerCell) {
            var computedStyle = window.getComputedStyle(headerCell);
            var cellWidth = Math.round(parseFloat(computedStyle.width));
            var cellPadding = Math.round(parseFloat(computedStyle.paddingLeft)) + Math.round(parseFloat(computedStyle.paddingRight));
            var borderRightWidth = Math.round(parseFloat(computedStyle.borderRightWidth));
            borderRightWidth = window.isNaN(borderRightWidth) ? 0 : borderRightWidth;
          
            expect(parseInt(headerCell._elements.content.style.width, 10)).to.equal(cellWidth + cellPadding + borderRightWidth);
            done();
          });
        }, wait);
      });
    
      it('should scroll the sticky headercells when scrolling the table', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.html']);
        table.style.width = '50px';
      
        var scrollLeft = 10;
        var headerCells = getHeaderCells(table.head.rows[0]);
        headerCells.forEach(function(headerCell) {
          for (var i = 0; i < 10; i++) {
            headerCell.content.textContent += headerCell.content.textContent;
          }
        });
      
        table._elements.container.scrollLeft = scrollLeft;
      
        // Wait for scrolling
        setTimeout(function() {
          headerCells.forEach(function(headerCell) {
            if (table._layoutStickyCellOnScroll) {
              var paddingLeft = Math.round(parseFloat(window.getComputedStyle(headerCell).paddingLeft));
              expect(headerCell._elements.content.style.marginLeft).to.equal('-' + (scrollLeft + paddingLeft) + 'px');
            }
          });
        
          done();
        }, 500);
      });
    
      it('should not set a 0 width to the header cells if they are hidden', function(done) {
        var table = helpers.build(window.__html__['Table.sticky.hidden.html']);
        var wait = table._wait;
        table._wait = 0;
        table.hidden = false;
      
        // Because of debouncing
        window.setTimeout(function() {
          var headerCells = getHeaderCells(table.head.rows[0]);
          headerCells.forEach(function(headerCell) {
            expect(parseFloat(headerCell.style.minWidth) > 0).to.be.true;
          });
        
          done();
        }, wait);
      });
    });
  
    describe('#fixedWidth', function() {
      it('should set a fixed width to the column', function(done) {
        var table = helpers.build(window.__html__['Table.fixedwidth.html']);
        var headRow = table.head.rows[0];
        var col = getColumns(table.columns)[0];
        var bodyRow = table.body.rows[0];
        var headerCell1 = headRow.cells[0];
        var headerCell2 = headRow.cells[1];
        var cell1 = bodyRow.cells[0];
        var cell2 = bodyRow.cells[1];
        var cell1Width = cell1.getBoundingClientRect().width;
        var cell2Width = cell2.getBoundingClientRect().width;
      
        col.fixedWidth = true;
        
        helpers.next(() => {
          expect(cell1.getBoundingClientRect().width < cell1Width).to.be.true;
          expect(cell2.getBoundingClientRect().width > cell2Width).to.be.true;
          expect(headerCell1.hasAttribute('fixedwidth')).to.be.true;
          expect(headerCell2.hasAttribute('fixedwidth')).to.be.false;
          done();
        });
      });
    });
  
    describe('#hidden', function() {
      it('should hide the column', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        getColumns(table.columns)[0].hidden = true;
  
        helpers.next(() => {
          getRows([table._elements.table]).forEach(function(row) {
            expect(row.cells[0].offsetParent).to.equal(null);
          });
          done();
        });
      });
    
      it('appended cells should be hidden', function(done) {
        var table = helpers.build(window.__html__['Table.hidden.html']);
        var cell1 = new Table.Cell();
        var cell2 = new Table.Cell();
      
        var row = table.items.add({});
        row.appendChild(cell1);
        row.appendChild(cell2);
      
        table.body.appendChild(row);
        
        helpers.next(() => {
          expect(cell1.offsetParent).to.equal(null);
          expect(cell2.offsetParent).to.not.equal(null);
          done();
        });
      });
    });
  
    describe('#alignment', function() {
      it('should set the text alignment to right', function(done) {
        var table = helpers.build(window.__html__['Table.base.html']);
        getColumns(table.columns)[0].alignment = Table.Column.alignment.RIGHT;
      
        helpers.next(() => {
          getRows([table._elements.table]).forEach(function(row) {
            expect(getComputedStyle(row.cells[0]).textAlign).to.equal('right');
          });
          done();
        });
      });
    
      it('appended cells should have the text alignment right', function(done) {
        var table = helpers.build(window.__html__['Table.alignment.html']);
        var cell1 = new Table.Cell();
        var cell2 = new Table.Cell();
      
        var row = table.items.add({});
        row.appendChild(cell1);
        row.appendChild(cell2);
      
        table.body.appendChild(row);
      
        helpers.next(() => {
          expect(getComputedStyle(cell1).textAlign).to.equal('right');
          expect(getComputedStyle(cell2).textAlign).to.not.equal('right');
          done();
        });
      });
    });
  
    describe('#sortable', function() {
      it('should set sortable direction to default', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[0];
        
        expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DEFAULT);
      });
    
      it('should sort ascending by alphanumeric type', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[0];
      
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
        
        table.items.getAll().forEach(function(row, i) {
          expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
        });
      });
    
      it('should sort ascending by alphanumeric type by default', function() {
        var table = helpers.build(window.__html__['Table.sortable.default.html']);
        
        table.items.getAll().forEach(function(row, i) {
          expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
        });
      });
    
      it('should sort descending by alphanumeric type', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[0];
      
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        var rows = table.items.getAll().reverse();
        rows.forEach(function(row, i) {
          expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
        });
      });
    
      it('should sort ascending by number type', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[1];
      
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
      
        table.items.getAll().forEach(function(row, i) {
          expect(parseInt(row.dataset.number)).to.equal(i);
        });
      });
    
      it('should sort descending by number type', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[1];
      
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        var rows = table.items.getAll().reverse();
        rows.forEach(function(row, i) {
          expect(parseInt(row.dataset.number)).to.equal(i);
        });
      });
    
      it('should sort ascending by date type', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[getColumns(table.columns).length - 1];
      
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
      
        table.items.getAll().forEach(function(row, i) {
          expect(parseInt(row.dataset.date)).to.equal(i);
        });
      });
    
      it('should sort descending by date type', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[getColumns(table.columns).length - 1];
      
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        var rows = table.items.getAll().reverse();
        rows.forEach(function(row, i) {
          expect(parseInt(row.dataset.date)).to.equal(i);
        });
      });
    
      it('should restore default sorting', function() {
        var table = helpers.build(window.__html__['Table.sortable.html']);
        var col = getColumns(table.columns)[0];
      
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
        col.sortableDirection = Table.Column.sortableDirection.DEFAULT;
      
        table.items.getAll().forEach(function(row, i) {
          expect(parseInt(row.dataset.default)).to.equal(i);
        });
      });
    
      it('should sort by alphanumeric type ascending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.value.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
      
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.ASCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
  
          table.items.getAll().forEach(function(row, i) {
            expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
          });
          done();
        });
      });
    
      it('should sort by alphanumeric type descending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.value.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DESCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
  
          var rows = table.items.getAll().reverse();
          rows.forEach(function(row, i) {
            expect(parseInt(row.dataset.alphanumeric)).to.equal(i);
          });
          done();
        });
      });
    
      it('should sort by number type ascending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.value.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[1];
        var headerCell = table.head.rows[0].cells[1];
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
      
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.ASCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
  
          table.items.getAll().forEach(function(row, i) {
            expect(parseInt(row.dataset.number)).to.equal(i);
          });
          done();
        });
      });
    
      it('should sort by number type descending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.value.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[1];
        var headerCell = table.head.rows[0].cells[1];
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DESCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
  
          var rows = table.items.getAll().reverse();
          rows.forEach(function(row, i) {
            expect(parseInt(row.dataset.number)).to.equal(i);
          });
          done();
        });
      });
    
      it('should sort by date type ascending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.value.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[2];
        var headerCell = table.head.rows[0].cells[2];
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
      
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.ASCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
  
          table.items.getAll().forEach(function(row, i) {
            expect(parseInt(row.dataset.date)).to.equal(i);
          });
          done();
        });
      });
    
      it('should sort by date type descending using cells value property', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.value.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[2];
        var headerCell = table.head.rows[0].cells[2];
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        helpers.next(() => {
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DESCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
  
          var rows = table.items.getAll().reverse();
          rows.forEach(function(row, i) {
            expect(parseInt(row.dataset.date)).to.equal(i);
          });
          done();
        });
      });
    
      it('should be able to sort programmatically by setting the sortableDirection property', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.column).to.equal(col);
        expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DESCENDING);
      });
    
      it('should be able to sort programmatically if beforecolumnsort event is prevented', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:beforecolumnsort', function(event) {
          event.preventDefault();
        });
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.column).to.equal(col);
        expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DESCENDING);
      });
    
      it('should not sort if sortableType is set to custom but still allow to change sortableDirection', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.sortable.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        var headerCell = table.head.rows[0].cells[0];
      
        col.sortableType = Table.Column.sortableType.CUSTOM;
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
        
        helpers.next(() => {
          // 'coral-table:columnsort' is not triggered if custom sorting
          expect(eventSpy.callCount).to.equal(0);
          expect(col.sortableDirection).to.equal(Table.Column.sortableDirection.DESCENDING);
          expect(headerCell.getAttribute('sortabledirection')).to.equal(col.sortableDirection);
  
          table.items.getAll().forEach(function(row, i) {
            expect(parseInt(row.dataset.default)).to.equal(i);
          });
          done();
        });
      });
    
      it('should disable row ordering if table is in a sorted state (ascending)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.hidden.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        col.sortableDirection = Table.Column.sortableDirection.ASCENDING;
      
        helpers.next(() => {
          expect(table._isSorted()).to.equal(col);
          expect(table.classList.contains('is-sorted')).to.be.true;
          done();
        });
      });
    
      it('should disable row ordering if table is in a sorted state (descending)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.hidden.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
      
        helpers.next(() => {
          expect(table._isSorted()).to.equal(col);
          expect(table.classList.contains('is-sorted')).to.be.true;
          done();
        });
      });
    
      it('should enable row ordering back if table is not in a sorted state anymore', function() {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.hidden.html']);
        table.on('coral-table:columnsort', eventSpy);
      
        var col = getColumns(table.columns)[0];
        col.sortableDirection = Table.Column.sortableDirection.DESCENDING;
        col.sortableDirection = Table.Column.sortableDirection.DEFAULT;
      
        expect(table._isSorted()).to.be.false;
        expect(table.classList.contains('is-sorted')).to.be.false;
      });
    });
  
    describe('#orderable', function() {
      it('should initialize the dragAction on the sticky header cells', function(done) {
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        table._elements.head.sticky = true;
      
        // sticky event is triggered in next frame
        helpers.next(function() {
          getHeaderCells(table.head.rows[0]).forEach(function(headerCell) {
            expect(headerCell.content.dragAction).to.be.not.undefined;
          });
          
          done();
        });
      });
    
      it('should drag the header cell to the left', function(done) {
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[1], -1);
  
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[0].dataset.dragged)).to.equal(0);
          });
          
          done();
        });
      });
    
      it('should prevent the header cell from being inserted at the dragged position', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[1];
      
        table.on('coral-table:beforecolumndrag', eventSpy);
        table.on('coral-table:beforecolumndrag', function(event) {
          event.preventDefault();
        });
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[1], -1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          expect(eventSpy.args[0][0].detail.before).to.equal(table.columns.firstElementChild);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[0].dataset.dragged)).to.equal(1);
          });
          
          done();
        });
      });
    
      it('should drag the header cell to the left (sortable)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[1];
      
        col.sortable = true;
        table.on('coral-table:columndrag', eventSpy);
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[1], -1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[0].dataset.dragged)).to.equal(0);
          });
          
          done();
        })
      });
    
      it('should drag the header cell to the left (sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[1];
      
        table.on('coral-table:columndrag', eventSpy);
        table._elements.head.sticky = true;
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[1].content, -1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[0].dataset.dragged)).to.equal(0);
          });
          
          done();
        });
      });
    
      it('should drag the header cell to the left (sortable + sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[1];
      
        table.on('coral-table:columndrag', eventSpy);
        table._elements.head.sticky = true;
        col.sortable = true;
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[1].content, 0, 0);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[0].dataset.dragged)).to.equal(0);
          });
          
          done();
        });
      });
    
      it('should drag the header cell to the right', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[0];
      
        table.on('coral-table:columndrag', eventSpy);
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[0], 1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[1].dataset.dragged)).to.equal(1);
          });
          
          done();
        });
      });
    
      it('should drag the header cell to the right (sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[0];
      
        table.on('coral-table:columndrag', eventSpy);
        table._elements.head.sticky = true;
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[0].content, 1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[1].dataset.dragged)).to.equal(1);
          });
          
          done();
        });
      });
    
      it('should drag the header cell to the right (sortable)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        var col = getColumns(table.columns)[0];
        
        col.sortable = true;
        table.on('coral-table:columndrag', eventSpy);
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[0], 1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[1].dataset.dragged)).to.equal(1);
          });
          
          done();
        });
      });
    
      it('should drag the header cell to the right (sortable + sticky)', function(done) {
        var eventSpy = sinon.spy();
        var table = helpers.build(window.__html__['Table.orderable.column.html']);
        table._elements.head.sticky = true;
      
        var col = getColumns(table.columns)[0];
        col.sortable = true;
        table.on('coral-table:columndrag', eventSpy);
  
        // Wait for layouting before moving headerCells around
        helpers.next(function() {
          dragHeaderCellTo(table.head.rows[0].cells[0].content, 1);
  
          expect(eventSpy.callCount).to.equal(1);
          expect(eventSpy.args[0][0].detail.column).to.equal(col);
          getRows([table._elements.table]).forEach(function(row) {
            expect(parseInt(row.cells[1].dataset.dragged)).to.equal(1);
          });
          
          done();
        });
      });
    });
  });
});
