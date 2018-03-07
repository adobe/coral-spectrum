describe('Coral.Table.Foot', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Foot');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Coral.Table.Foot());
      expect(el.classList.contains('_coral-Table-foot')).to.be.true;
    });
    
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('tfoot', {is: 'coral-table-foot'}));
      expect(el.classList.contains('_coral-Table-foot')).to.be.true;
    });
  });
  
  describe('API', function() {
    
    describe('#divider', function() {
      it('should default to row divider', function() {
        var el = helpers.build(new Coral.Table.Foot());
        expect(el.divider).to.equal(Coral.Table.divider.ROW);
        
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });
      
      it('should apply column divider', function() {
        var el = new Coral.Table.Foot();
        el.divider = Coral.Table.divider.COLUMN;
        
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });
      
      it('should apply cell divider', function() {
        var el = new Coral.Table.Foot();
        el.divider = Coral.Table.divider.CELL;
        
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
      });
    });
  });
  
  describe('Implementation Details', function() {
    it('should set a11y attribute', function() {
      const el = helpers.build(new Coral.Table.Foot());
      expect(el.getAttribute('role')).to.equal('rowgroup');
    });
  });
});
