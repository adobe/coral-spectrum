describe('Coral.Shell.Header', function() {
  describe('Namespace', function() {
    it('should be defined in the Coral.Shell namespace', function() {
      expect(Coral.Shell).to.have.property('Header');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Shell.Header.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.Shell.Header());
    });
  });
});
