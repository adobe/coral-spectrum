import {helpers} from '../../../coralui-utils/src/tests/helpers';
import {Masonry} from '../../../coralui-component-masonry';

describe('Masonry.Layout', function() {
  
  describe('Instantiation', function() {
  
    function testInstance(masonry, expectedLayout) {
      expect(masonry.classList.contains('_coral-Masonry')).to.be.true;
      expect(masonry.getAttribute('layout')).to.equal(expectedLayout);
    }
    
    it('should be possible using new', function() {
      const el = helpers.build(new Masonry());
      el.layout = 'variable';
      testInstance(el, 'variable');
    });
    
    it('should be possible using createElement', function() {
      const el = helpers.build(document.createElement('coral-masonry'));
      el.layout = 'variable';
      testInstance(el, 'variable');
    });
    
    it('should be possible using markup', function() {
      const el = helpers.build(window.__html__['Masonry.variable.empty.html']);
      testInstance(el, 'variable');
    });
  
    helpers.cloneComponent(
      'should be possible to clone via markup',
      window.__html__['Masonry.base.html']
    );
  });
  
  describe('API', function() {
    let el;
    
    beforeEach(() => {
      el = helpers.build(new Masonry());
    });
    
    afterEach(function() {
      el = null;
    });
    
    describe('#layout', function() {
  
      it('should have 4 default layouts defined', function() {
        for (let key in Masonry.layouts) {
          const layoutName = Masonry.layouts[key];
          const layout = new Masonry._layouts[layoutName](el);
      
          expect(layout.name).to.equal(layoutName);
          expect(layout).to.be.an.instanceof(Masonry.Layout);
        }
      });
    
      it('should be set and reflected', function() {
        el.layout = Masonry.layouts.FIXED_SPREAD;
      
        expect(el.layout).to.equal(Masonry.layouts.FIXED_SPREAD);
        expect(el.getAttribute('layout')).to.equal(Masonry.layouts.FIXED_SPREAD);
      });
    
      it('should not change the layout if it does not exist', function() {
        el.layout = 'layout1';
        
        expect(el.layout).to.equal(Masonry.layouts.FIXED_CENTERED);
        expect(el.getAttribute('layout')).to.equal(Masonry.layouts.FIXED_CENTERED);
      });
    });
  
    describe('#selectedItem', function() {
      var item1;
      var item2;
    
      beforeEach(function() {
        item1 = new Masonry.Item();
        item2 = new Masonry.Item();
        el.appendChild(item1);
        el.appendChild(item2);
      });
      
      afterEach(function() {
        item1 = null;
        item2 = null;
      });
    
      it('should be read-only', function() {
        var selectedItem = el.selectedItem;
        try {
          el.selectedItem = item1;
        }
        catch (e) {
          expect(el.selectedItem).to.equal(selectedItem);
        }
      });
    
      it('should return the selected item', function() {
        item2.selected = true;
      
        expect(el.selectedItem).to.equal(item2);
      });
    
      it('should return the first selected item', function() {
        item1.selected = true;
        item2.selected = true;
  
        expect(el.selectedItem).to.equal(item1);
      });
    
      it('should return null if there are no items selected', function() {
        expect(el.selectedItem).to.equal(null);
      });
    });
  
    describe('#items', function() {
      it('should be read-only', function() {
        const items = el.items;
        try {
          el.items = 2;
        }
        catch (e) {
          expect(items).to.equal(items);
        }
      });
    });
  
    describe('#selectedItems', function() {
      var item1;
      var item2;
      var item3;
    
      beforeEach(function() {
        item1 = new Masonry.Item();
        item2 = new Masonry.Item();
        item3 = new Masonry.Item();
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
      });
    
      it('should be read-only', function() {
        const selectedItems = el.selectedItems;
        try {
          el.selectedItems = 2;
        }
        catch (e) {
          expect(el.selectedItems).to.deep.equal(selectedItems);
        }
      });
    
      it('should return all selected items', function() {
        item1.selected = true;
        item2.selected = true;
      
        expect(el.selectedItems).to.deep.equal([item1, item2]);
      });
    
      it('should return an empty array if there are no items selected', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });
    });
  
    describe('#orderable', function() {
      var item1;
      var item2;
    
      beforeEach(function() {
        item1 = new Masonry.Item();
        item1.setAttribute('coral-masonry-draghandle', '');
        item2 = new Masonry.Item();
        item2.setAttribute('coral-masonry-draghandle', '');
        el.appendChild(item1);
        el.appendChild(item2);
      });
    
      it('should be disabled by default', function() {
        expect(el.orderable).to.equal(false);
        expect(el.hasAttribute('orderable')).to.equal(false);
      });
    
      it('should allow to enable drag & drop for all items', function() {
        el.orderable = true;
  
        expect(item1.hasAttribute('_orderable')).to.be.true;
        expect(item2.hasAttribute('_orderable')).to.be.true;
        expect(item1.classList.contains('u-coral-openHand')).to.be.true;
        expect(item2.classList.contains('u-coral-openHand')).to.be.true;
      });
    
      it('should allow to disable drag & drop for all items', function() {
        el.orderable = true;
        el.orderable = false;
  
        expect(item1.hasAttribute('_orderable')).to.be.false;
        expect(item2.hasAttribute('_orderable')).to.be.false;
        expect(item1.classList.contains('u-coral-openHand')).to.be.false;
        expect(item2.classList.contains('u-coral-openHand')).to.be.false;
      });
    });
  
    describe('#spacing', function() {
      it('should allow to set spacing', function(done) {
        var spacing = 123;
      
        el.spacing = spacing;
        el.layout = 'variable';
        el.setAttribute('columnwidth', 100);
        el.style.width = '500px';
      
        var item = new Masonry.Item();
        item.textContent = 'text';
        el.appendChild(item);
  
        // Wait for layout schedule
        helpers.next(function() {
          var masonryRect = el.getBoundingClientRect();
          var itemRect = item.getBoundingClientRect();
  
          expect(itemRect.left - masonryRect.left).to.equal(spacing);
          expect(masonryRect.right - itemRect.right).to.equal(spacing);
          expect(itemRect.top - masonryRect.top).to.equal(spacing);
          expect(masonryRect.bottom - Math.ceil(itemRect.bottom)).to.equal(spacing);
          
          done();
        });
      });
    });
  });

  describe('Events', function() {
    let el;
    
    beforeEach(() => {
      el = helpers.build(new Masonry());
    });
    
    afterEach(() => {
      el = null;
    });
    
    describe('#coral-collection:add', function() {
      it('should trigger when adding an item', function(done) {
        const spy = sinon.spy();
        el.on('coral-collection:add', spy);
    
        const item = el.items.add(new Masonry.Item());
    
        // Wait for animations
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          expect(spy.args[0][0].detail.item).to.equal(item);
          done();
        });
      });
    });
    
    describe('#coral-collection:remove', function() {
      it('should trigger when removing an item', function(done) {
        el.on('coral-collection:add', (event) => {
          const spy = sinon.spy();
          el.on('coral-collection:remove', spy);
  
          const item = event.detail.item;
          el.items.remove(item);
          
          // Wait for animations
          window.setTimeout(function() {
            expect(spy.callCount).to.equal(1);
            expect(spy.args[0][0].detail.item).to.equal(item);
            done();
          }, 100);
        });
    
        el.items.add(new Masonry.Item());
      });
    });
  });
  
  describe('User Interaction', function() {
    it('should be possible to focus the first item with tab', function(done) {
      const el = helpers.build(window.__html__['Masonry.variable.3-columns-9-items.html']);
      
      // Wait for layouting
      helpers.next(function() {
        expect(el.items.first().getAttribute('tabindex')).to.equal('0');
        done();
      });
    });
  });
  
  describe('Implementation Details', function() {
    
    describe('#resizable', function() {
      it('should resize the masonry when the container changes its width', function(done) {
        const container = helpers.build(window.__html__['Masonry.container.html']);
        const el = container.querySelector('coral-masonry');
        
        const widthBefore = el.getBoundingClientRect().width;
        container.style.width = '500px';
      
        // Wait for layouting
        helpers.next(function() {
          expect(el.getBoundingClientRect().width).to.not.equal(widthBefore);
          done();
        });
      });
  
      it('should resize the masonry when the container becomes visible', function(done) {
        const container = helpers.build(window.__html__['Masonry.hidden-container.html']);
        const el = container.querySelector('coral-masonry');
        
        const heightBefore = el.getBoundingClientRect().height;
        container.style.display = 'block';
  
        // Wait for layouting
        helpers.next(function() {
          expect(el.getBoundingClientRect().height).to.be.above(heightBefore);
          done();
        });
      });
    });
  });
});
