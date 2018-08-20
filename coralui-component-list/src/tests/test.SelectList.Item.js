import {helpers} from '../../../coralui-util/src/tests/helpers';
import {SelectList} from '../../../coralui-component-list';

describe('SelectList.Item', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(SelectList).to.have.property('Item');
    });
  });

  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-Menu-item')).to.be.true;
      expect(el.getAttribute('role')).to.equal('option');
    }

    it('should be possible using new', function() {
      var el = helpers.build(new SelectList.Item());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = helpers.build(document.createElement('coral-selectlist-item'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function() {
      testDefaultInstance(helpers.build('<coral-selectlist-item></coral-selectlist-item>'));
    });
  });
  
  describe('API', function() {
    describe('#selected', function() {
      it('should default to false', function() {
        const el = new SelectList.Item();
        expect(el.selected).to.be.false;
      });
    });
  
    describe('#disabled', function() {
      it('should default to false', function() {
        const el = new SelectList.Item();
        expect(el.disabled).to.be.false;
      });
    });
  
    describe('#content', function() {
      it('should not be null', function() {
        const el = new SelectList.Item();
        expect(el.content).to.not.equal(null);
      });
    });
    
    describe('#value', function() {
      it('should return textContent if not explictly set', function() {
        var el = new SelectList.Item();
        el.textContent = 'Test 123';
    
        expect(el.value).to.equal('Test 123');
        expect(el.hasAttribute('value')).to.be.false;
      });
  
      it('should reflect an explicitly set string value', function() {
        var el = new SelectList.Item();
        el.value = 'Test 123';
    
        expect(el.value).to.equal('Test 123');
        expect(el.getAttribute('value')).to.equal('Test 123');
      });
    });
  });
});

