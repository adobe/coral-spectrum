import {ComponentMixin} from '/coralui-mixin-component';
import {SelectableCollection} from '/coralui-collection';

describe('SelectableCollection', function() {
  // test collection container
  window.customElements.define('coral-selectablecollection-container', class extends ComponentMixin(HTMLElement) {
    constructor() {
      super();
    }
    
    get items() {
      // we do lazy initialization of the collection
      if (!this._items) {
        this._items = new SelectableCollection({
          host: this,
          itemTagName: 'coral-selectablecollection-item'
        });
      }
      
      return this._items;
    }
  });
  
  window.customElements.define('coral-selectablecollection-item', class extends ComponentMixin(HTMLElement) {
    constructor() {
      super();
    }
  });
  
  describe('API', function() {
    describe('#_getFirstSelectable()', function() {
      it('should return the first valid item for selection', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        var items = el.items.getAll();
        
        var firstSelectable = el.items._getFirstSelectable();
        
        expect(firstSelectable).to.equal(items[0]);
        expect(firstSelectable.title).to.equal('am');
        expect(firstSelectable.textContent).to.equal('America');
      });
      
      it('should return null if no valid selectable item', function() {
        const el = helpers.build(window.__html__['SelectableCollection.empty.html']);
        expect(el.items._getFirstSelectable()).to.equal(null);
      });
      
      it('should ignore disabled and hidden items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        var firstSelectable = el.items._getFirstSelectable();
        
        expect(firstSelectable).to.equal(items[3]);
        expect(firstSelectable.title).to.equal('as');
        expect(firstSelectable.textContent).to.equal('Asia');
      });
    });
    
    describe('#_getLastSelectable()', function() {
      it('should return the last valid item for selection', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        var items = el.items.getAll();
        
        var lastSelectable = el.items._getLastSelectable();
        
        expect(lastSelectable).to.equal(items[6]);
        expect(lastSelectable.title).to.equal('oc');
        expect(lastSelectable.textContent).to.equal('Oceania');
      });
      
      it('should return null if no valid selectable item', function() {
        const el = helpers.build(window.__html__['SelectableCollection.empty.html']);
        expect(el.items._getLastSelectable()).to.equal(null);
      });
      
      it('should ignore disabled and hidden items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        var lastSelectable = el.items._getLastSelectable();
        
        expect(lastSelectable).to.equal(items[5]);
        expect(lastSelectable.title).to.equal('eu');
        expect(lastSelectable.textContent).to.equal('Europe');
      });
    });
    
    describe('#_getFirstSelected()', function() {
      it('should return the first selected item', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        var items = el.items.getAll();
        var firstSelected = el.items._getFirstSelected();
        
        expect(firstSelected).to.equal(items[1]);
        expect(firstSelected.title).to.equal('af');
        expect(firstSelected.textContent).to.equal('Africa');
      });
      
      it('should return null if no item is selected', function() {
        const el = helpers.build(window.__html__['SelectableCollection.empty.html']);
        expect(el.items._getFirstSelected()).to.equal(null);
        expect(el.items._getFirstSelected('active')).to.equal(null);
      });
      
      it('should allow passing another selector', function() {
        const el = helpers.build(window.__html__['SelectableCollection.active.html']);
        var items = el.items.getAll();
        // gets the fist item that has the 'active' attribute
        var firstActive = el.items._getFirstSelected('active');
        
        expect(firstActive).to.equal(items[1]);
        expect(firstActive.title).to.equal('af');
        expect(firstActive.textContent).to.equal('Africa');
        expect(firstActive.hasAttribute('active')).to.be.true;
      });
      
      it('should allow disabled items to be selected if explicitely indicated', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        var firstSelected = el.items._getFirstSelected();
        
        expect(firstSelected).to.equal(items[1]);
        expect(firstSelected.title).to.equal('af');
        expect(firstSelected.textContent).to.equal('Africa');
      });
    });
    
    describe('#_getLastSelected()', function() {
      it('should return the last selected item', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        var items = el.items.getAll();
        var lastSelected = el.items._getLastSelected();
        
        expect(lastSelected).to.equal(items[6]);
        expect(lastSelected.title).to.equal('oc');
        expect(lastSelected.textContent).to.equal('Oceania');
      });
      
      it('should return null if no item is selected', function() {
        const el = helpers.build(window.__html__['SelectableCollection.empty.html']);
        expect(el.items._getLastSelected()).to.equal(null);
      });
      
      it('should allow passing another selector', function() {
        const el = helpers.build(window.__html__['SelectableCollection.active.html']);
        var items = el.items.getAll();
        var lastActive = el.items._getLastSelected('active');
        
        expect(lastActive).to.equal(items[5]);
        expect(lastActive.title).to.equal('eu');
        expect(lastActive.textContent).to.equal('Europe');
        expect(lastActive.hasAttribute('active')).to.be.true;
      });
      
      it('should ignore disabled and hidden items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        var lastSelected = el.items._getLastSelected();
        
        expect(lastSelected).to.equal(items[5]);
        expect(lastSelected.title).to.equal('eu');
        expect(lastSelected.textContent).to.equal('Europe');
      });
    });
    
    describe('#_getAllSelected()', function() {
      it('should return all the selected items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        var items = el.items.getAll();
        var selectedItems = el.items._getAllSelected();
        
        expect(selectedItems).to.deep.equal([items[1], items[2], items[6]]);
      });
      
      it('should return null if no item is selected', function() {
        const el = helpers.build(window.__html__['SelectableCollection.empty.html']);
        expect(el.items._getAllSelected()).to.deep.equal([]);
        
      });
      
      it('should allow passing another selector', function() {
        const el = helpers.build(window.__html__['SelectableCollection.active.html']);
        var items = el.items.getAll();
        var selectedItems = el.items._getAllSelected('active');
        
        expect(selectedItems).to.deep.equal([items[1], items[5]]);
      });
      
      it('should allow disabled items to be selected', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        var selectedItems = el.items._getAllSelected();
        
        expect(selectedItems).to.deep.equal([items[1], items[5]]);
      });
    });
    
    describe('#_deselectAllExceptFirst()', function() {
      it('should all the deselect all items except the first one', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        var items = el.items.getAll();
        el.items._deselectAllExceptFirst();
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[1]]);
      });
      
      it('should allow passing another selector', function() {
        const el = helpers.build(window.__html__['SelectableCollection.active.html']);
        var items = el.items.getAll();
        el.items._deselectAllExceptFirst('active');
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var activeItems = el.querySelectorAll('coral-selectablecollection-item[active]');
        
        expect(Array.prototype.slice.call(activeItems)).to.deep.equal([items[1]]);
      });
      
      it('should ignore disabled and hidden items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        
        el.items._deselectAllExceptFirst();
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[1]]);
        
        // we try deselecting again to see if it works with only 1 item
        el.items._deselectAllExceptFirst();
        selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[1]], 'The last item should be selected');
      });
    });
    
    describe('#_deselectAllExceptLast()', function() {
      it('should all the deselect all items except the last one', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        var items = el.items.getAll();
        el.items._deselectAllExceptLast();
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[6]]);
      });
      
      it('should allow passing another selector', function() {
        const el = helpers.build(window.__html__['SelectableCollection.active.html']);
        var items = el.items.getAll();
        el.items._deselectAllExceptLast('active');
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var activeItems = el.querySelectorAll('coral-selectablecollection-item[active]');
        
        expect(Array.prototype.slice.call(activeItems)).to.deep.equal([items[5]]);
      });
      
      it('should ignore disabled and hidden items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        
        el.items._deselectAllExceptLast();
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[5]]);
        
        // we try deselecting again to see if it works with only 1 item
        el.items._deselectAllExceptLast();
        selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[5]], 'The last item should be selected');
      });
    });
    
    describe('#_deselectAllExcept()', function() {
      it('should all the deselect all items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        el.items._deselectAllExcept();
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([]);
      });
      
      it('should allow passing another selector', function() {
        const el = helpers.build(window.__html__['SelectableCollection.active.html']);
        el.items._deselectAllExcept('active');
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var activeItems = el.querySelectorAll('coral-selectablecollection-item[active]');
        
        expect(Array.prototype.slice.call(activeItems)).to.deep.equal([]);
      });
      
      it('should fallback to "selected" if empty string is provided', function() {
        const el = helpers.build(window.__html__['SelectableCollection.base.html']);
        el.items._deselectAllExcept('');
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([]);
      });
      
      it('should ignore disabled and hidden items', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        el.items._deselectAllExcept();
        
        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([]);
        
        // we try deselecting again to see if it works with only 1 item
        el.items._deselectAllExcept();
        selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([], 'The last item should be selected');
      });
      
      it('should deselect all items except the provided one', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        
        expect(items[5].hasAttribute('selected')).to.equal(true, 'The item needs to be selected');
        el.items._deselectAllExcept(items[5]);
        
        // we query without the collection to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[5]], 'Item 5 should be selected');
      });
      
      it('should deselect all items except the provided one with a custom attribute', function() {
        const el = helpers.build(window.__html__['SelectableCollection.active.html']);
        var items = el.items.getAll();
        
        expect(items[5].hasAttribute('active')).to.equal(true, 'The item needs to be active');
        el.items._deselectAllExcept(items[5], 'active');
        
        // we query without the collection to make sure disabled and hidden items are deselected as well
        var activeItems = el.querySelectorAll('coral-selectablecollection-item[active]');
        expect(Array.prototype.slice.call(activeItems)).to.deep.equal([items[5]], 'Item 5 should be active');
      });
      
      it('should deselect all items except the provided one and fallback the attribute to "selected" if empty string is provided', function() {
        const el = helpers.build(window.__html__['SelectableCollection.selectable.html']);
        var items = el.items.getAll();
        
        expect(items[5].hasAttribute('selected')).to.equal(true, 'The item needs to be selected');
        el.items._deselectAllExcept(items[5], '');
        
        // we query without the collection to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-selectablecollection-item[selected]');
        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[5]], 'Item 5 should be selected');
      });
    });
  });
  
  describe('Implementation Details', function() {
    
    it('should warn that options.filter is not supported', function() {
      let warnCalled = 0;
      const warn = console.warn;
      // Override console.warn to detect if it was called
      console.warn = function() {
        warnCalled++;
      };
      
      // we create a collection with a filter to see if it warns in the console
      new SelectableCollection({
        host: this,
        itemTagName: 'coral-selectablecollection-item',
        // filter is not supported by this collection
        filter: function(element) {
          return !element.hasAttribute('excluded');
        }
      });
      
      expect(warnCalled).to.equal(1);
      
      // Restore console.warn
      console.warn = warn;
    });
  });
});
