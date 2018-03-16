import {helpers} from '/coralui-util/src/tests/helpers';
import {Table} from '/coralui-component-table';

describe('Table.Row', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Table).to.have.property('Row');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Table.Row());
      expect(el.classList.contains('_coral-Table-row')).to.be.true;
    });
    
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('tr', {is: 'coral-table-row'}));
      expect(el.classList.contains('_coral-Table-row')).to.be.true;
    });
  });

  describe('API', function() {
    describe('#selectable', function() {
      it('should set all items to selectable items', function() {
        var table = helpers.build(window.__html__['Table.base.html']);
        var row = table.items.first();
        row.selectable = true;
        
        row.items.getAll().forEach(function(item) {
          expect(item.hasAttribute('coral-table-cellselect')).to.be.true;
        });
      });

      it('appended items should be selectable', function(done) {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var cell = table.items.first().items.add();
        
        // Wait for MO
        helpers.next(function() {
          expect(cell.hasAttribute('coral-table-cellselect')).to.be.true;
          done();
        });
      });
    });
  
    describe('#selected', function() {
      it('should be selected', function() {
        const el = new Table.Row();
        el.selected = true;
      
        expect(el.selected).to.be.true;
        expect(el.classList.contains('is-selected')).to.be.true;
        expect(el.getAttribute('aria-selected')).to.equal('true');
      });
    });

    describe('#selectedItem', function() {
      it('should return null if no cells are selected', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        expect(table.items.first().selectedItem).to.equal(null);
      });

      it('should return the selected cell', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cell = row.items.first();
        
        cell.selected = true;
        expect(row.selectedItem).to.equal(cell);
      });

      it('should be readonly', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cell = row.items.first();
        
        cell.selected = true;
        
        try {
          row.selectedItem = '';
        }
        catch (e) {
          expect(row.selectedItem).to.equal(cell);
        }
      });
    });

    describe('#selectedItems', function() {
      it('should return an array of selected cells', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cell = row.items.first();
        
        cell.selected = true;
        
        expect(row.selectedItems.length).to.equal(1);
        expect(row.selectedItems[0]).to.equal(cell);
      });

      it('should return an empty array if no cells are selected', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        expect(table.items.first().selectedItems.length).to.equal(0);
      });

      it('should be readonly', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var row = table.items.first();
        var cell = row.items.first();
        
        cell.selected = true;
        
        try {
          row.selectedItems = '';
        }
        catch (e) {
          expect(row.selectedItems[0]).to.equal(cell);
        }
      });
    });
    
    describe('#items', function() {
      it('should be defined', function() {
        const el = new Table.Row();
        expect(el.items).to.not.equal(undefined);
      })
    });
    
    describe('#multiple', function() {});
    describe('#locked', function() {});
  });
  
  describe('Events', function() {
    describe('#coral-table-row:_contentchanged', function() {
      it('should trigger when content changed', function(done) {
        const el = new Table.Row();
        const spy = sinon.spy();
        el.on('coral-table-row:_contentchanged', spy);
        el.appendChild(document.createElement('span'));
    
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
  
    describe('#coral-table-row:_beforeselectedchanged', function() {
      it('should trigger before selection changed', function(done) {
        const el = new Table.Row();
      
        el.on('coral-table-row:_beforeselectedchanged', function() {
          expect(el.selected).to.be.false;
          done();
        });
        el.selected = true;
      });
    });
  
    describe('#coral-table-row:_selectedchanged', function() {
      it('should trigger when selection changed', function(done) {
        const el = new Table.Row();
      
        el.on('coral-table-row:_selectedchanged', function() {
          expect(el.selected).to.be.true;
          done();
        });
        el.selected = true;
      });
    });
    
    describe('#coral-table-row:_lockedchanged', function() {
      it('should trigger when locked is changed', function() {
        const el = new Table.Row();
        const spy = sinon.spy();
        
        el.on('coral-table-row:_lockedchanged', spy);
        el.locked = true;
        expect(spy.callCount).to.equal(1);
      });
    });
    
    describe('#coral-table-row:_multiplechanged', function() {
      it('should trigger when multiple is changed', function() {
        const el = new Table.Row();
        const spy = sinon.spy();
    
        el.on('coral-table-row:_multiplechanged', spy);
        el.multiple = true;
        expect(spy.callCount).to.equal(1);
      });
    });
    
    describe('#coral-table-row:_change', function() {
      it('should trigger when selecting a cell', function() {
        var table = helpers.build(window.__html__['Table.selectable.cell.html']);
        var spy = sinon.spy();
        var row = table.items.first();
        var cell = row.items.first();
  
        row.on('coral-table-row:_change', spy);
        cell.selected = true;
        
        expect(spy.callCount).to.equal(1);
      });
    });
  });

  describe('Implementation Details', function() {
    it('should set a11y attribute', function() {
      var row = helpers.build(new Table.Row());
      expect(row.getAttribute('role')).to.equal('row');
    });
  });
});
