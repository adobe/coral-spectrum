describe('Coral.List', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('List');
      expect(Coral).to.have.property('ButtonList');
      expect(Coral).to.have.property('AnchorList');
    });
  });
  
  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      expect(helpers.build('<coral-list>') instanceof Coral.List).to.equal(true);
    });
  
    it('should support creation from markup', function() {
      expect(helpers.build('<coral-buttonlist>') instanceof Coral.ButtonList).to.equal(true);
    });
  
    it('should support creation from markup', function() {
      expect(helpers.build('<coral-anchorlist>') instanceof Coral.AnchorList).to.equal(true);
    });
  
    it('should support co-existing anchor/button/list items', function() {
      const el = helpers.build(window.__html__['Coral.List.mixed.html']);
      expect(el.items.length).to.equal(3);
    });
  
    it('should be possible via cloneNode using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.List.mixed.html']);
    });
  });
});
