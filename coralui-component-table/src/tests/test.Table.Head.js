import {helpers} from '/coralui-util/src/tests/helpers';
import {Table} from '/coralui-component-table';

describe('Table.Head', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Table).to.have.property('Head');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Table.Head());
      expect(el.classList.contains('_coral-Table-head')).to.be.true;
    });
    
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('thead', {is: 'coral-table-head'}));
      expect(el.classList.contains('_coral-Table-head')).to.be.true;
    });
  });

  describe('API', function() {
    describe('#sticky', function() {});

    describe('#divider', function() {
      it('should default to row divider', function() {
        var el = helpers.build(new Table.Head());
        expect(el.divider).to.equal(Table.divider.ROW);
    
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });
  
      it('should apply column divider', function() {
        var el = new Table.Head();
        el.divider = Table.divider.COLUMN;
    
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });
  
      it('should apply cell divider', function() {
        var el = new Table.Head();
        el.divider = Table.divider.CELL;
    
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
      });
    });
  });
  
  describe('Events', function() {
    describe('#coral-table-head:_contentchanged', function() {
      it('should trigger when content changed', function(done) {
        const el = new Table.Head();
        const spy = sinon.spy();
        el.on('coral-table-head:_contentchanged', spy);
        el.appendChild(document.createElement('span'));
      
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
    
    describe('#coral-table-head:_stickychanged', function() {
      it('should trigger when changing sticky', function(done) {
        const el = new Table.Head();
        const spy = sinon.spy();
        el.on('coral-table-head:_stickychanged', spy);
        el.sticky = true;
    
        // Event is triggered in next frame
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    it('should set a11y attribute', function() {
      var row = helpers.build(new Table.Head());
      expect(row.getAttribute('role')).to.equal('rowgroup');
    });
  });
});
