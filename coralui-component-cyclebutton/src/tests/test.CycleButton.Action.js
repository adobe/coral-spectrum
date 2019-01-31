import {helpers} from '../../../coralui-utils/src/tests/helpers';
import {CycleButton} from '../../../coralui-component-cyclebutton';

describe('CycleButton.Action', function() {
  var el;

  beforeEach(function() {
    el = helpers.build(new CycleButton.Action());
  });

  afterEach(function() {
    el = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(CycleButton).to.have.property('Action');
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      '<coral-cyclebutton-action id="btn1" icon="viewCard">Card</coral-cyclebutton-action>'
    );
  
    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new CycleButton.Action()
    );
  });

  describe('API', function() {
    describe('#content', function() {
      it('should default to empty string', function() {
        expect(el.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function() {
        var htmlContent = '<strong>Highlighted</strong> text';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.innerHTML).to.equal(htmlContent);
      });

      it('should not be settable', function() {
        try {
          el.content = null;
        }
        catch (e) {
          expect(el.content).not.to.be.null;
        }
      });
    });

    describe('#icon', function() {
      it('should default to empty string', function() {
        expect(el.icon).to.equal('');
      });

      it('should be reflected to the DOM', function() {
        el.icon = 'add';
        expect(el.attributes.getNamedItem('icon').value).to.equal('add');
      });

      it('should convert any value to string', function() {
        el.icon = 45;
        expect(el.icon).to.equal('45');
        expect(el.attributes.getNamedItem('icon').value).to.equal('45');
      });
    });
  
    describe('#trackingElement', function() {
      it('should default to empty string', function() {
        expect(el.trackingElement).to.equal('');
        expect(el.content.textContent).to.equal('');
        expect(el.icon).to.equal('');
      });
    
      it('should default to the contents when available', function() {
        el.content.textContent = 'Contents';
        expect(el.trackingElement).to.equal('Contents');
        el.content.textContent = ' Contents with  spaces ';
        expect(el.trackingElement).to.equal('Contents with spaces');
        el.trackingElement = 'user';
        expect(el.trackingElement).to.equal('user', 'Respects the user set value when available');
      });
    
      it('should strip the html out of the content', function() {
        el.content.innerHTML = 'My <b>C</b>ontent';
        expect(el.trackingElement).to.equal('My Content');
      });
    
      it('should default to the icon when there is no content', function() {
        el.icon = 'add';
        expect(el.trackingElement).to.equal('add');
      });
    });
  });
});
