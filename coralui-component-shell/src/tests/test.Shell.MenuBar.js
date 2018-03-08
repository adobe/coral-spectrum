import {Shell} from '/coralui-component-shell';

describe('Shell.MenuBar', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Shell).to.have.property('MenuBar');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build('<coral-shell-menubar>');
      expect(el).to.be.an.instanceof(Shell.MenuBar);
    });
  
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<coral-shell-menubar></coral-shell-menubar>');
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Shell.MenuBar());
    });
  });

  describe('API', function() {
    describe('#items', function() {});
  });

  describe('Markup', function() {
    describe('#items', function() {});
  });

  describe('Events', function() {});

  describe('User Interaction', function() {});

  describe('Implementation Details', function() {});
});
