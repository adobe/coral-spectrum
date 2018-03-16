import {helpers} from '/coralui-util/src/tests/helpers';
import {Button} from '/coralui-component-button';

describe('Button', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Button).to.have.property('Label');
    });
  });

  describe('Implementation Details', function() {
    helpers.testButton(Button, 'coral-button', 'button');
  });
});
