import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Masonry} from '../../../coral-component-masonry';

describe('Masonry.Item', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Masonry).to.have.property('Item');
    });
  });

  function testInstance(item) {
    expect(item.classList.contains('_coral-Masonry-item')).to.be.true;
    expect(item.getAttribute('tabindex')).to.equal('-1');
  }

  describe('Instantiation', function() {
    
    it('should be possible using new', function() {
      var item = helpers.build(new Masonry.Item());
      testInstance(item);
    });

    it('should be possible using createElement', function() {
      var item = helpers.build(document.createElement('coral-masonry-item'));
      testInstance(item);
    });

    it('should be possible using markup', function() {
      const item = helpers.build(window.__html__['Masonry.Item.text-article.html']);
      testInstance(item);
    });
  });

  describe('API', function() {
  
    var el;
    var item;
    var handle;
  
    beforeEach(function() {
      el = helpers.build(new Masonry());
      el.selectionMode = 'single';
      item = new Masonry.Item();
      el.appendChild(item);
    });
  
    afterEach(function() {
      el = null;
      item = null;
      handle = null;
    });

    describe('#selected', function() {
      it('should be false by default', function() {
        expect(item).to.have.property('selected', false);
        expect(item.hasAttribute('selected')).to.be.false;
        expect(item.classList.contains('is-selected')).to.be.false;
      });

      it('should toggle attribute and class', function() {
        item.selected = true;
        
        expect(item.hasAttribute('selected')).to.be.true;
        expect(item.classList.contains('is-selected')).to.be.true;
      });
      
      it('should toggle checkbox on selection', function() {
        item.selected = true;
        expect(item._elements.check.checked).to.be.true;
  
        item.selected = false;
        expect(item._elements.check.checked).to.be.false;
      });
    });
    
    describe('#content', function() {
      it('should not be null', function() {
        expect(item.content).to.not.equal(null);
      });
      
      it('should be possible to set content', function() {
        item.content.textContent = 'content';
        expect(item.content.textContent).to.equal('content');
      });
    });
    
    describe('#_removing', function() {
      it('should add is-removing class', function(done) {
        item.setAttribute('_removing', '');
        
        // Added in next frame for transition animation to be visible
        helpers.next(function() {
          expect(item.classList.contains('is-removing'));
          done();
        });
      });
      
      it('should temporarily add the item again but flag it as being removed', function() {
        el.removeChild(item);
        expect(item.hasAttribute('_removing')).to.be.true;
        expect(item.parentNode).to.equal(el);
      });
  
      it('should remove the item transition classes', function(done) {
        el.removeChild(item);
    
        // Wait for layout schedule
        window.setTimeout(function() {
          expect(item.parentNode).to.equal(null);
      
          ['is-beforeInserting', 'is-inserting', 'is-removing'].forEach(function(className) {
            expect(item.classList.contains(className)).to.be.false;
          });
      
          done();
        }, 100);
      });
    });
    
    describe('#connectedCallback', function() {
      it('should add the is-managed class', function(done) {
        var item = new Masonry.Item();
        el.appendChild(item);
    
        // Wait for layout schedule
        window.setTimeout(() => {
          expect(item.classList.contains('is-managed')).to.be.true;
          done();
        }, 100);
      });
    });
    
    describe('#coral-masonry-draghandle', function() {
      const expectEnabled = (item, handle) => {
        expect(item._dragAction).to.not.be.null;
        expect(handle.classList.contains('u-coral-openHand')).to.be.true;
      };
  
      const expectDisabled = (item, handle) => {
        expect(item._dragAction).to.be.null;
        expect(handle.classList.contains('u-coral-openHand')).to.be.false;
      };
  
      beforeEach(function() {
        item = new Masonry.Item();
        handle = document.createElement('div');
        handle.setAttribute('coral-masonry-draghandle', '');
        item.appendChild(handle);
      });
  
      it('should allow to initialize drag action', function() {
        item._updateDragAction(true);
        expectEnabled(item, handle);
      });
  
      it('should allow to use the item itself as the handle', function() {
        item.setAttribute('coral-masonry-draghandle', '');
        item.innerHTML = '';
        item._updateDragAction(true);
        expectEnabled(item, item);
      });
  
      it('should allow to destroy drag action', function() {
        item._updateDragAction(true);
        item._updateDragAction(false);
        expectDisabled(item, handle);
      });
  
      it('should disable drag action if handle cannot be found', function() {
        handle.parentNode.removeChild(handle);
        item._updateDragAction(true);
        expectDisabled(item, handle);
      });
    });
  });
  
  describe('Accessibility', function() {
    it('should have an aria attribute for selection', function() {
      const el = new Masonry.Item();
      
      el.selected = true;
      expect(el.getAttribute('aria-selected')).to.equal('true');
  
      el.selected = false;
      expect(el.getAttribute('aria-selected')).to.equal('false');
    });
  });
});
