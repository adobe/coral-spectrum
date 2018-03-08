import {TabList, Tab} from '/coralui-component-tablist';

describe('Tab', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Tab).to.have.property('Label');
    });
  });

  describe('Instantiation', function() {
    it('should be possible via clone using markup', function() {
      helpers.cloneComponent('<coral-tab>Tab One</coral-tab>');
    });

    it('should be possible via clone using markup with textContent', function() {
      helpers.cloneComponent('<coral-tab><coral-tab-label>Tab One</coral-tab-label></coral-tab>');
    });
  
    it('should be possible via clone using markup with icon', function() {
      helpers.cloneComponent('<coral-tab icon="add"><coral-tab-label>Tab One</coral-tab-label></coral-tab>');
    });

    it('should be possible via clone using js', function() {
      helpers.cloneComponent(new Tab());
    });
  });

  describe('API', function() {
    var el;
    var item;
    var item2;

    beforeEach(function() {
      el = new TabList();
      item = new Tab();
      el.appendChild(item);
      item2 = new Tab();
      el.appendChild(item2);
    });

    afterEach(function() {
      el = item = item2 = null;
    });
    
    describe('#selected', function() {
      it('should default to false', function() {
        expect(item2.selected).to.be.false;
        expect(item2.hasAttribute('selected')).to.be.false;
      });
  
      it('should be settable to truthy', function() {
        item2.selected = true;
        
        expect(item2.selected).to.be.true;
        expect(item2.hasAttribute('selected')).to.be.true;
        expect(item2.classList.contains('is-selected')).to.be.true;
        expect(item2.getAttribute('tabindex')).to.equal('0');
      });
  
      it('selecting a disabled item should make it unselected', function() {
        item.disabled = true;
        item.selected = true;
    
        expect(item.disabled).to.be.true;
        expect(item.hasAttribute('disabled')).to.be.true;
        expect(item.selected).to.be.false;
        expect(item.hasAttribute('selected')).to.be.false;
      });
    });
    
    describe('#disabled', function() {
      it('should default to false', function() {
        expect(item.disabled).to.be.false;
        expect(item.hasAttribute('disabled')).to.be.false;
      });
  
      it('should be settable to truthy/falsy', function() {
        item.disabled = true;
        expect(item.disabled).to.be.true;
        expect(item.hasAttribute('disabled')).to.be.true;
        expect(item.classList.contains('is-disabled')).to.be.true;
        expect(item.getAttribute('aria-disabled')).to.equal('true');
    
        item.disabled = false;
        expect(item.disabled).to.be.false;
        expect(item.hasAttribute('disabled')).to.be.false;
        expect(item.classList.contains('is-disabled')).to.be.false;
        expect(item.getAttribute('aria-disabled')).to.equal('false');
      });
  
      it('disabled items cannot be selected', function() {
        item.disabled = true;
        expect(item.disabled).to.be.true;
        expect(item.hasAttribute('disabled')).to.be.true;
    
        expect(item.selected).to.be.false;
    
        item.selected = true;
    
        expect(item.selected).to.be.false;
      });
  
      it('disabling should make it unselected', function() {
        item.selected = true;
        item.disabled = true;
    
        expect(item.disabled).to.be.true;
        expect(item.hasAttribute('disabled')).to.be.true;
        expect(item.selected).to.be.false;
        expect(item.hasAttribute('selected')).to.be.false;
      });
    });
    
    describe('#invalid', function() {
      it('should default to false', function() {
        expect(item.invalid).to.be.false;
        expect(item.hasAttribute('invalid')).to.be.false;
      });
  
      it('should be settable to truthy/falsy', function() {
        item.invalid = true;
        expect(item.invalid).to.be.true;
        expect(item.hasAttribute('invalid')).to.be.true;
        expect(item.classList.contains('is-invalid')).to.be.true;
    
        item.invalid = false;
        expect(item.invalid).to.be.false;
        expect(item.hasAttribute('invalid')).to.be.false;
        expect(item.classList.contains('is-invalid')).to.be.false;
      });
    });

    describe('#label', function() {
      it('should be settable', function() {
        item.label.textContent = 'Item 1';
        expect(item.label.textContent).to.equal('Item 1');
      });
    });
  });
});
