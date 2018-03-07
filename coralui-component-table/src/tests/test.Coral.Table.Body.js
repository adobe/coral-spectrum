describe('Coral.Table.Body', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('Body');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Coral.Table.Body());
      expect(el.classList.contains('_coral-Table-body')).to.be.true;
    });
    
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('tbody', {is: 'coral-table-body'}));
      expect(el.classList.contains('_coral-Table-body')).to.be.true;
    });
  });

  describe('API', function() {

    describe('#divider', function() {
      it('should default to row divider', function() {
        var el = helpers.build(new Coral.Table.Body());
        expect(el.divider).to.equal(Coral.Table.divider.ROW);
    
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });

      it('should apply column divider', function() {
        var el = new Coral.Table.Body();
        el.divider = Coral.Table.divider.COLUMN;
        
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });

      it('should apply cell divider', function() {
        var el = new Coral.Table.Body();
        el.divider = Coral.Table.divider.CELL;
        
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
      });
    });
  });
  
  describe('Events', function() {
    describe('#coral-table-body:_contentchanged', function() {
      it('should trigger when changing content', function(done) {
        const el = helpers.build(new Coral.Table.Body());
        const spy = sinon.spy();
        
        el.on('coral-table-body:_contentchanged', spy);
        el.appendChild(document.createElement('span'));
        
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
    
    describe('#coral-table-body:_empty', function() {
      it('should trigger if the body is empty', function() {
        const el = new Coral.Table.Body();
        const spy = sinon.spy();
  
        el.on('coral-table-body:_empty', spy);
        helpers.build(el);
  
        expect(spy.callCount).to.equal(1);
      });
    });
  });

  describe('Implementation Details', function() {
    it('should set a11y attribute', function() {
      const el = helpers.build(new Coral.Table.Body());
      expect(el.getAttribute('role')).to.equal('rowgroup');
    });
  });
});
