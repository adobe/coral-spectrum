describe('Coral.Shell.SolutionSwitcher', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined in the Coral.Shell namespace', function() {
      expect(Coral.Shell).to.have.property('SolutionSwitcher');
      expect(Coral.Shell).to.have.property('Solutions');
      expect(Coral.Shell).to.have.property('Solution');
      expect(Coral.Shell).to.have.property('SolutionLabel');
    });
  });
  
  describe('Initialization', function() {
    it('should support creation from markup', function() {
      const el = helpers.build(window.__html__['Coral.Shell.SolutionSwitcher.base.html']);
      expect(el instanceof Coral.Shell.SolutionSwitcher).to.equal(true);
    });
  
    it('should support creation from js', function() {
      var el = helpers.build(new Coral.Shell.SolutionSwitcher());
      expect(el instanceof Coral.Shell.SolutionSwitcher).to.equal(true);
    });
  
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Shell.SolutionSwitcher.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      const el = new Coral.Shell.SolutionSwitcher();
      const solutions = el.items.add();
      solutions.items.add();
      
      helpers.cloneComponent(el);
    });
  });
});
