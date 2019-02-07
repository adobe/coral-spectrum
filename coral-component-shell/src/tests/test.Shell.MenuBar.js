import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Shell} from '../../../coral-component-shell';

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
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-shell-menubar></coral-shell-menubar>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.MenuBar()
    );
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
