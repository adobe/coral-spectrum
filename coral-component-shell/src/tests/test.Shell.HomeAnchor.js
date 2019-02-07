import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Shell} from '../../../coral-component-shell';

describe('Shell.HomeAnchor', function() {
  describe('Namespace', function() {
    it('should be defined in the Shell namespace', function() {
      expect(Shell).to.have.property('HomeAnchor');
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<a is="coral-shell-homeanchor" icon="adobeExperienceManagerColorDark" href="#">Adobe Experience Manager</a>'
    );
    
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.HomeAnchor()
    );
  });
});
