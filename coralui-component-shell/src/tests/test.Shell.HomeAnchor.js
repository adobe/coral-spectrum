import {helpers} from '../../../coralui-util/src/tests/helpers';
import {Shell} from '../../../coralui-component-shell';

describe('Shell.HomeAnchor', function() {
  describe('Namespace', function() {
    it('should be defined in the Shell namespace', function() {
      expect(Shell).to.have.property('HomeAnchor');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<a is="coral-shell-homeanchor" icon="adobeExperienceManagerColorDark" href="#">Adobe Experience Manager</a>');
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Shell.HomeAnchor());
    });
  });
});
