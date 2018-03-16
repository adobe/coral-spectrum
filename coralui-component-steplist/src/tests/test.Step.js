import {helpers} from '/coralui-util/src/tests/helpers';
import {Step, StepList} from '/coralui-component-steplist';

describe('Step', function() {
  var el;
  var item;
  var item2;

  beforeEach(function() {
    el = new StepList();
    el.interaction = StepList.interaction.ON;

    item = new Step();
    el.appendChild(item);
    item2 = new Step();
    el.appendChild(item2);
  });

  afterEach(function() {
    el = item = item2 = null;
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Step).to.have.property('Label');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent('<coral-step></coral-step>');
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Step());
    });
  });

  describe('API', function() {
    describe('#label', function() {

      it('should default to empty string', function() {
        expect(item.label.textContent).to.equal('');
      });

      it('should be a content zone', function() {
        expect(item.label instanceof HTMLElement).to.be.true;
      });

      it('should be settable', function() {
        item.label.innerHTML = 'Item 1';
        expect(item.label.innerHTML).to.equal('Item 1');
      });
    });

    describe('#selected', function() {
      it('should default to false', function() {
        expect(item.selected).to.be.false;
        expect(item.tabIndex).to.equal(-1);
      });

      it('should be settable to truthy', function() {
        item.selected = true;
        
        expect(item.selected).to.be.true;
        expect(item.hasAttribute('selected')).to.be.true;
        expect(item.classList.contains('is-selected')).to.be.true;
        expect(item.tabIndex).to.equal(0);
      });
    });
  });

  describe('Implementation Details', function() {
    it('tabindex should be removed when StepList interaction is OFF', function() {
      el.interaction = StepList.interaction.OFF;
      
      expect(item.hasAttribute('tabindex')).to.be.false;
      expect(item.getAttribute('aria-readonly')).to.equal('true');
    });
  });
});
