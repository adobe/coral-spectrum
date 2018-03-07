describe('Coral.Table.Cell', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral.Table).to.have.property('HeaderCell');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      const el = helpers.build(new Coral.Table.HeaderCell());
      expect(el.classList.contains('_coral-Table-headerCell')).to.be.true;
    });
  
    it('should be possible using document.createElement', function() {
      const el = helpers.build(document.createElement('th', {is: 'coral-table-headercell'}));
      expect(el.classList.contains('_coral-Table-headerCell')).to.be.true;
    });
  });
  
  describe('API', function() {
    describe('#content', function() {
      it('should exist', function() {
        const el = new Coral.Table.HeaderCell();
        expect(el.content.nodeName).to.equal('CORAL-TABLE-HEADERCELL-CONTENT');
      });
    });
  });
  
  describe('Events', function() {
    
    describe('#coral-table-headercell:_contentchanged', function() {
      it('should trigger when content changed', function(done) {
        const el = new Coral.Table.HeaderCell();
        const spy = sinon.spy();
        el.on('coral-table-headercell:_contentchanged', spy);
        el.content.textContent = 'Some content';
    
        // Wait for MO
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
  });
});
