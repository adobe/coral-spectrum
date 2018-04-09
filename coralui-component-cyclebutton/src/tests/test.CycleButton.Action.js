import {helpers} from '../../../coralui-util/src/tests/helpers';
import {CycleButton} from '../../../coralui-component-cyclebutton';

describe('CycleButton.Action', function() {
  var action;

  beforeEach(function() {
    action = helpers.build(new CycleButton.Action());
  });

  afterEach(function() {
    action = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(CycleButton).to.have.property('Action');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent('<coral-cyclebutton-action id="btn1" icon="viewCard">Card</coral-cyclebutton-action>');
    });
  
    it('should be possible via cloneNode using js', function() {
      helpers.cloneComponent(new CycleButton.Action());
    });
  });

  describe('API', function() {
    describe('#content', function() {
      it('should default to empty string', function() {
        expect(action.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        action.content.innerHTML = htmlContent;

        expect(action.content.innerHTML).to.equal(htmlContent);
        expect(action.innerHTML).to.equal(htmlContent);
      });

      it('should not be settable', function() {
        try {
          action.content = null;
        }
        catch (e) {
          expect(action.content).not.to.be.null;
        }
      });
    });

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(action.icon).to.equal('');
      });

      it('should be reflected to the DOM', function() {
        action.icon = 'add';
        expect(action.attributes.getNamedItem('icon').value).to.equal('add');
      });

      it('should convert any value to string', function() {
        action.icon = 45;
        expect(action.icon).to.equal('45');
        expect(action.attributes.getNamedItem('icon').value).to.equal('45');
      });
    });
  });
});
