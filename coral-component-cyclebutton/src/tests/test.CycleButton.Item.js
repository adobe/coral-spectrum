import {helpers} from '../../../coral-utils/src/tests/helpers';
import {CycleButton} from '../../../coral-component-cyclebutton';

describe('CycleButton.Item', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(CycleButton).to.have.property('Item');
    });
    
    it('should define the displayMode in an enum', function() {
      expect(CycleButton.Item.displayMode).to.exist;
      expect(CycleButton.Item.displayMode).to.contain.all.keys(CycleButton.displayMode);
      expect(CycleButton.Item.displayMode.INHERIT).to.equal('inherit');
      expect(Object.keys(CycleButton.Item.displayMode).length).to.equal(4);
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      '<coral-cyclebutton-item id="btn1" icon="viewCard">Card</coral-cyclebutton-item>'
    );
  
    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new CycleButton.Item()
    );
  });

  describe('API', function() {
    var el;

    beforeEach(function () {
      el = helpers.build(new CycleButton.Item());
    });
    afterEach(function () {
      el = null;
    });

    describe('#displayMode', function () {
      it('should exist', function () {
        // check for existence of the key, since using 'to.exist' fails when an existing property equals undefined
        expect('displayMode' in el).to.be.true;
      });
      
      it('should have default set to inherit', function () {
        expect(el.displayMode).to.equal(CycleButton.Item.displayMode.INHERIT);
      });
      
      it('should not accept invalid value', function () {
        el.displayMode = CycleButton.displayMode.ICON;
        el.displayMode = 'invalid';
        expect(el.displayMode).to.equal(CycleButton.Item.displayMode.INHERIT);
      });
    });
    
    describe('#icon', function () {
      it('should exist', function () {
        expect('icon' in el).to.be.true;
      });
    });
  
    describe('#trackingElement', function() {
      it('should exist', function() {
        expect('trackingElement' in el).to.be.true;
      });
    
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
