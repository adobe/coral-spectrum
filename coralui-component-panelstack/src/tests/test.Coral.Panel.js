describe('Coral.Panel', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Panel');
      expect(Coral.Panel).to.have.property('Content');
    });
  });

  describe('API', function() {
    var el;
  
    beforeEach(function() {
      el = new Coral.Panel();
    });
  
    afterEach(function() {
      el = null;
    });
    
    describe('#selected', function() {
      it('should have correct defaults', function() {
        expect(el.selected).to.be.false;
      });
  
      it('should be settable to truthy', function() {
        el.selected = true;
    
        expect(el.selected).to.be.true;
        expect(el.hasAttribute('selected')).to.be.true;
        expect(el.classList.contains('is-selected')).to.be.true;
      });
  
      it('should be settable to falsy', function() {
        el.selected = false;
    
        expect(el.selected).to.be.false;
        expect(el.hasAttribute('selected')).to.be.false;
        expect(el.classList.contains('is-selected')).to.be.false;
      });
    });
    
    describe('#content', function() {
      it('should not be null', function() {
        expect(el.content).not.to.be.null;
      });
    });
  });
  
  describe('Implementation Details', function() {
    it('should have a role', function() {
      const el = helpers.build(new Coral.Panel());
      expect(el.getAttribute('role')).to.equal('tabpanel');
    });
  })
});
