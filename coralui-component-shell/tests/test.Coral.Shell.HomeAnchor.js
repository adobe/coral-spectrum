describe('Coral.Shell.HomeAnchor', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined in the Coral.Shell namespace', function() {
      expect(Coral.Shell).to.have.property('HomeAnchor');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<a is="coral-shell-homeanchor" icon="adobeExperienceManagerColor" href="#">Adobe Experience Manager</a>');
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.Shell.HomeAnchor());
    });
  });
});
