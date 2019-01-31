import {helpers} from '../../../coralui-utils/src/tests/helpers';
import {Tree} from '../../../coralui-component-tree';

// @todo
const onIndicatorClick = (el, item) => {
  el._onItemClick({
    target: item.querySelector('._coral-TreeView-indicator'),
    preventDefault: () => {},
    stopPropagation: () => {}
  });
};

describe('Tree', function() {
  // Assert whether an item is properly active or inactive.
  var assertActiveness = function(item, isSelected, isExpanded) {
    expect(item.selected).to.equal(isSelected);
    expect(item.expanded).to.equal(isExpanded);
  };
  
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Tree).to.have.property('Item');
      expect(Tree.Item).to.have.property('Content');
    });
    
    it('Variants should be defined', function() {
      expect(Tree.Item.variant).to.exist;
      expect(Tree.Item.variant.LEAF).to.equal('leaf');
      expect(Tree.Item.variant.DRILLDOWN).to.equal('drilldown');
      expect(Object.keys(Tree.Item.variant).length).to.equal(2);
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Tree.base.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone nested tree using markup',
      window.__html__['Tree.nested.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone tree with interactive elements',
      window.__html__['Tree.interactive.html']
    );
  
    const el = new Tree();
    el.items.add(new Tree.Item());
    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });
  
  describe('API', function() {
    
    describe('#variant', function() {
      it('should have default variant drilldown', function() {
        var item = new Tree.Item();
        expect(item.variant).to.equal(Tree.Item.variant.DRILLDOWN);
      });
      
      it('should be possible to set variant through API', function() {
        var item = new Tree.Item().set({
          variant: 'leaf'
        });
        expect(item.variant).to.equal(Tree.Item.variant.LEAF);
      });
      
      it('should change the variant after initialized', function() {
        var item = new Tree.Item();
        expect(item.variant).to.equal(Tree.Item.variant.DRILLDOWN);
        item.variant = Tree.Item.variant.LEAF;
        expect(item.variant).to.equal(Tree.Item.variant.LEAF);
      });
    });
    
    describe('#expanded', function() {
      it('should be possible to expand collapse items in Tree', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        
        var secondItem = el.items.getAll()[1];
        secondItem.expanded = true;
        
        assertActiveness(secondItem, false, true);
        
        secondItem.expanded = false;
        assertActiveness(secondItem, false, false);
      });
    });
    
    describe('#parent', function() {
      it('should be readonly', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var item = el.items.first();
        try {
          item.parent = document.body;
        }
        catch (e) {
          expect(item.parent).to.equal(null);
        }
      });
      
      it('should retrieve the parent tree', function() {
        const el = helpers.build(window.__html__['Tree.nested.html']).items.first();
        expect(el.parent).to.equal(null);
        el.items.getAll().forEach(function(item) {
          expect(item.parent).to.equal(el);
        });
      });
    });
    
    describe('#selected', function() {
      it('should be possible to select items in Tree', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        
        var secondItem = el.items.getAll()[1];
        secondItem.selected = true;
        
        assertActiveness(secondItem, true, false);
        expect(el.selectedItem).to.equal(secondItem);
        
        secondItem.selected = false;
        
        assertActiveness(secondItem, false, false);
        expect(el.selectedItem).to.equal(null);
      });
      
      it('should be possible to select and expand same item in Tree', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        
        var firstItem = el.items.getAll()[0];
        firstItem.selected = firstItem.expanded = true;
        
        assertActiveness(firstItem, true, true);
        expect(el.selectedItem).to.equal(firstItem);
      });
    });
    
    describe('#expandAll', function() {
      it('should be possible to expand all items in Tree', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        el.expandAll();
        
        var items = el.items.getAll();
        var length = items.length;
        for (var index = 0; index < length; index++) {
          assertActiveness(items[index], false, true);
        }
      });
    });
    
    describe('#collapseAll', function() {
      it('should be possible to collapse all items in Tree', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        el.collapseAll();
        
        var items = el.items.getAll();
        var length = items.length;
        for (var index = 0; index < length; index++) {
          assertActiveness(items[index], false, false);
        }
      });
    });
    
    describe('#disabled', function() {
      it('should be possible to enable/disable item in Tree', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        
        var firstItem = el.items.getAll()[0];
        expect(firstItem.disabled).to.be.false;
        
        firstItem.disabled = true;
        
        assertActiveness(firstItem, false, false);
        expect(firstItem.disabled).to.be.true;
      });
    });
    
    describe('#selectedItems', function() {
      it('should retrieve all selected items included nested ones', function() {
        const el = helpers.build(window.__html__['Tree.nested.html']);
        var items = el.items.getAll();
        el.multiple = true;
        items.forEach(function(item) {
          item.selected = true;
        });
        expect(el.selectedItems).to.deep.equal(items);
      });
    });
    
    describe('#selectedItem', function() {
      it('should retrieve the first selected item', function() {
        const el = helpers.build(window.__html__['Tree.nested.html']);
        var items = el.items.getAll();
        el.multiple = true;
        items.forEach(function(item) {
          item.selected = true;
        });
        expect(el.selectedItem).to.equal(el.selectedItems[0]);
      });
    });
    
    describe('#multiple', function() {
      it('should not allow to select multiple items', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var items = el.items.getAll();
        items.forEach(function(item) {
          item.selected = true;
        });
        expect(el.selectedItems).to.deep.equal([items[items.length - 1]]);
      });
      
      it('should select the last item if multiple is changed to false', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var items = el.items.getAll();
        el.multiple = true;
        items.forEach(function(item) {
          item.selected = true;
        });
        el.multiple = false;
        expect(el.selectedItems).to.deep.equal([items[items.length - 1]]);
      });
    });
    
    describe('#items', function() {
      it('should be readOnly', function() {
        const el = new Tree();
        
        try {
          el.items = null;
        }
        catch (e) {
          expect(el.items).not.to.be.null;
        }
      });
      
      it('should get all the items with getAll()', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        
        var items = el.items.getAll();
        expect(items.length).to.equal(3);
      });
      
      it('should remove all the items with clear()', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        // we remove all the items
        el.items.clear();
        expect(el.items.length).to.equal(0);
      });
      
      it('should add items using add()', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        
        var item = new Tree.Item().set({
          content: {
            innerHTML: 'Item 4'
          }
        });
        
        el.items.add(item);
        expect(el.items.length).to.equal(4);
      });
    });
  });
  
  describe('Markup', function() {
    
    describe('#variant', function() {
      it('should be possible to set variant through markup', function() {
        const item = helpers.build('<coral-tree-item variant="leaf"></coral-tree-item>');
        expect(item.variant).to.equal(Tree.Item.variant.LEAF);
      });
    });
    
    describe('#selected', function() {
      it('should be possible to select item using markup', function() {
        const el = helpers.build(window.__html__['Tree.items.html']);
        var item = el.items.getAll()[0];
        assertActiveness(item, true, false);
      });
    });
    
    describe('#expanded', function() {
      it('should be possible to expand item using markup', function() {
        const el = helpers.build(window.__html__['Tree.items.html']);
        var item = el.items.getAll()[1];
        assertActiveness(item, false, true);
      });
    });
    
    describe('#disabled', function() {
      it('should be possible to disable item using markup', function() {
        const el = helpers.build(window.__html__['Tree.items.html']);
        var item = el.items.getAll()[2];
        expect(item.disabled).to.be.true;
      });
    });
  });
  
  describe('User Interaction', function() {
    
    it('should expand/collapse item in tree when expand/collapse icon is clicked', function() {
      const el = helpers.build(window.__html__['Tree.base.html']);
      
      var item = el.items.getAll()[1];
      
      onIndicatorClick(el, item);
      
      assertActiveness(item, false, true);
      
      onIndicatorClick(el, item);
      
      assertActiveness(item, false, false);
    });
    
    it('should select item in tree when content is clicked', function() {
      const el = helpers.build(window.__html__['Tree.base.html']);
      
      var item = el.items.getAll()[1];
      item._elements.content.click();
      
      assertActiveness(item, true, false);
      
      item._elements.content.click();
      
      assertActiveness(item, false, false);
    });
    
    it('should focus the first item via keyboard', function() {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var lastItem = el.items.last();
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        el._resetFocusableItem(lastItem);
        
        helpers.keypress('home', lastItem._elements.header);
        
        var firstItem = el.items.first();
        expect(lastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(firstItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        expect(firstItem._elements.header).to.equal(document.activeElement);
        done();
      });
    });
    
    it('should focus the last item via keyboard', function(done) {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var firstItem = el.items.first();
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        helpers.keypress('end', firstItem._elements.header);
        
        var lastItem = el.items.last();
        expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(lastItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        expect(lastItem._elements.header).to.equal(document.activeElement);
        done();
      });
    });
    
    it('should focus the next item via keyboard', function(done) {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var firstItem = el.items.first();
      var nextItem = firstItem.nextElementSibling;
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        helpers.keypress('right', firstItem._elements.header);
        
        expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(nextItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        expect(nextItem._elements.header).to.equal(document.activeElement);
        done();
      });
    });
    
    it('should focus the previous item via keyboard', function(done) {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var lastItem = el.items.last();
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        el._resetFocusableItem(lastItem);
        
        var previousItem = lastItem.previousElementSibling;
        helpers.keypress('left', lastItem._elements.header);
        
        expect(lastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(previousItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        expect(previousItem._elements.header).to.equal(document.activeElement);
        done();
      });
    });
    
    it('should focus the next edge item via keyboard', function(done) {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var firstItem = el.items.first();
      var lastItem = el.items.last();
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        helpers.keypress('left', firstItem._elements.header);
        
        expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(lastItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        expect(lastItem._elements.header).to.equal(document.activeElement);
        done();
      });
    });
    
    it('should focus the previous edge item via keyboard', function(done) {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var firstItem = el.items.first();
      var lastItem = el.items.last();
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        el._resetFocusableItem(lastItem);
        
        helpers.keypress('right', lastItem._elements.header);
        
        expect(lastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(firstItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        expect(firstItem._elements.header).to.equal(document.activeElement);
        done();
      });
    });
    
    it('should focus the sibling item via keyboard (nested)', function(done) {
      const el = helpers.build(window.__html__['Tree.nested.html']);
      var items = el.items.getAll();
      var firstItem = items[0];
      var beforeLastItem = items[items.length - 2];
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        el._resetFocusableItem(beforeLastItem);
        
        helpers.keypress('left', beforeLastItem._elements.header);
        
        expect(beforeLastItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(firstItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        expect(firstItem._elements.header).to.equal(document.activeElement);
        done();
      });
    });
    
    it('should set a new focusable item if the current one is disabled', function(done) {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var items = el.items.getAll();
      var firstItem = items[0];
      var secondItem = items[1];
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        firstItem.disabled = true;
        
        expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(secondItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        done();
      });
    });
    
    it('should set a new focusable item if the current one is hidden', function(done) {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var items = el.items.getAll();
      var firstItem = items[0];
      var secondItem = items[1];
      
      // Focusing requires the tree item to be defined
      window.customElements.whenDefined('coral-tree-item').then(() => {
        firstItem.hidden = true;
        
        expect(firstItem._elements.header.getAttribute('tabindex') === '-1').to.be.true;
        expect(secondItem._elements.header.getAttribute('tabindex') === '0').to.be.true;
        done();
      });
    });
    
    it('should expand the tree item with key:enter', function() {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var firstItem = el.items.first();
      helpers.keypress('enter', firstItem._elements.header);
      
      expect(firstItem.expanded).to.be.true;
    });
    
    it('should select the tree item with key:space', function() {
      const el = helpers.build(window.__html__['Tree.base.html']);
      var firstItem = el.items.first();
      helpers.keypress('space', firstItem._elements.header);
      
      expect(firstItem.selected).to.be.true;
    });
  });
  
  describe('Events', function() {
    
    describe('#coral-collection:add', function() {
      it('should be triggered with add()', function(done) {
        var el = helpers.build(new Tree());
        
        // Wait for MO to kick-in
        helpers.next(function() {
          var item = null;
          el.on('coral-collection:add', function(event) {
            expect(event.target).to.equal(el, 'Event should be triggered by the collection');
            expect(event.detail).to.deep.equal({
              item: item
            });
            expect(el.items.length).to.equal(1, 'Collection should have one item');
            done();
          });
          item = el.items.add();
        });
      });
      
      it('should be triggered with add() for nested items', function(done) {
        const el = helpers.build(window.__html__['Tree.base.html']).items.first();
        var spy = sinon.spy();
        el.on('coral-collection:add', spy);
        var item = el.items.add();
        
        // Wait for the MO to kick in
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          expect(spy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(spy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(el.items.length).to.equal(1, 'Collection should have one item');
          done();
        });
      });
    });
    
    describe('#coral-collection:remove', function() {
      it('should be triggered with remove()', function(done) {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var spy = sinon.spy();
        el.on('coral-collection:remove', spy);
        var item = el.items.last();
        item.remove();
        
        // Wait for the MO to kick in
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          expect(spy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(spy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(el.items.length).to.equal(2, 'Collection should have 2 items');
          done();
        });
      });
      
      it('should be triggered with remove() for nested items', function(done) {
        const el = helpers.build(window.__html__['Tree.nested.html']).items.first();
        var spy = sinon.spy();
        el.on('coral-collection:remove', spy);
        var item = el.items.last();
        item.remove();
        
        // Wait for the MO to kick in
        helpers.next(function() {
          expect(spy.callCount).to.equal(1);
          expect(spy.getCall(0).args[0].target).to.equal(el, 'Event should be triggered by the collection');
          expect(spy.getCall(0).args[0].detail).to.deep.equal({
            item: item
          });
          expect(el.items.length).to.equal(2, 'Collection should have 2 items');
          done();
        });
      });
    });
    
    describe('#coral-tree:change', function() {
      it('should trigger a change event on selecting an item', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var spy = sinon.spy();
        var firstItem = el.items.first();
        el.on('coral-tree:change', spy);
        firstItem.selected = true;
        
        expect(spy.callCount).to.equal(1);
        expect(spy.getCall(0).args[0].detail.oldSelection).to.equal(null);
        expect(spy.getCall(0).args[0].detail.selection).to.equal(firstItem);
      });
      
      it('should trigger a change event on deselecting an item', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var spy = sinon.spy();
        var firstItem = el.items.first();
        firstItem.selected = true;
        el.on('coral-tree:change', spy);
        firstItem.selected = false;
        
        expect(spy.callCount).to.equal(1);
        expect(spy.getCall(0).args[0].detail.oldSelection).to.equal(firstItem);
        expect(spy.getCall(0).args[0].detail.selection).to.equal(null);
      });
      
      it('should trigger a change event on changing the selection', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var spy = sinon.spy();
        var firstItem = el.items.first();
        var lastItem = el.items.last();
        firstItem.selected = true;
        el.on('coral-tree:change', spy);
        lastItem.selected = true;
        
        expect(spy.callCount).to.equal(1);
        expect(spy.getCall(0).args[0].detail.oldSelection).to.equal(firstItem);
        expect(spy.getCall(0).args[0].detail.selection).to.equal(lastItem);
      });
  
      it('should return an array for selection and oldSelection if multiple=true', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        el.multiple = true;
        let changeSpy = sinon.spy();
        el.items.first().selected = true;
        el.on('coral-tree:change', changeSpy);
        el.items.last().selected = true;
    
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.deep.equal([el.items.first(), el.items.last()]);
        expect(changeSpy.args[0][0].detail.oldSelection).to.deep.equal([el.items.first()]);
      });
      
      it('should trigger a change event on changing multiple to false', function() {
        const el = helpers.build(window.__html__['Tree.base.html']);
        var spy = sinon.spy();
        el.multiple = true;
        var items = el.items.getAll();
        items.forEach(function(item) {
          item.selected = true;
        });
        el.on('coral-tree:change', spy);
        el.multiple = false;
        
        expect(spy.callCount).to.equal(1);
        expect(spy.getCall(0).args[0].detail.oldSelection).to.deep.equal(items);
        expect(spy.getCall(0).args[0].detail.selection).to.equal(items[items.length - 1]);
      });
    });
    
    describe('#coral-tree:expand', function() {
      it('should trigger the event if an item is expanded', function(done) {
        const el = helpers.build(window.__html__['Tree.nested.html']);
        el.on('coral-tree:expand', (event) => {
          expect(event.detail.item).to.equal(item);
          done();
        });
        
        var item = el.items.first();
        item.expanded = true;
      });
    });
    
    describe('#coral-tree:collapse', function() {
      it('should trigger the event if an item is collapsed', function(done) {
        const el = helpers.build(window.__html__['Tree.items.html']);
        el.on('coral-tree:collapse', (event) => {
          expect(event.detail.item).to.equal(item);
          done();
        });
        
        var item = el.items.getAll()[1];
        item.expanded = false;
      });
    });
  });
  
  describe('Implementation Details', function() {
    var el;
    var item;
    
    beforeEach(function() {
      el = helpers.build(new Tree());
      
      var item = new Tree.Item();
      item.set({
        content: {
          innerHTML: 'Item'
        }
      });
      
      el.items.add(item);
    });
    
    afterEach(function() {
      el = item = null;
    });
    
    it('should have right role set', function() {
      expect(el.getAttribute('role')).to.equal('tree');
      var item = el.items.getAll()[0];
      var header = item._elements.header;
      var subTree = item._elements.subTreeContainer;
      expect(item.getAttribute('role')).to.equal('treeitem');
      expect(header.getAttribute('role')).to.equal('tab');
      
      expect(header.getAttribute('aria-controls'))
        .equal(subTree.getAttribute('id'));
      
      expect(subTree.getAttribute('aria-labelledby'))
        .equal(header.getAttribute('id'));
    });
    
    it('should have right classes set', function() {
      expect(el.classList.contains('_coral-TreeView')).to.be.true;
      var item = el.items.getAll()[0];
      expect(item.classList.contains('_coral-TreeView-item')).to.be.true;
    });
    
    it('should generate header and subtree for tree item with right classes', function() {
      var item = el.items.getAll()[0];
      var header = item._elements.header;
      var subTree = item._elements.subTreeContainer;
      expect(header).not.to.be.null;
      expect(subTree).not.to.be.null;
      expect(header.classList.contains('_coral-TreeView-itemLink')).to.be.true;
      expect(subTree.classList.contains('_coral-TreeView')).to.be.true;
    });
  });
  
  describe('#InteractiveElements', function() {
    
    it('should not select item when checkbox checked', function() {
      const el = helpers.build(window.__html__['Tree.interactive.html']);
      var item = el.items.getAll()[0];
      assertActiveness(item, false, false);
      
      var checkbox = item.querySelector('input[type="checkbox"]');
      expect(checkbox).to.exist;
      checkbox.click();
      
      expect(checkbox.checked).to.equal(true);
      assertActiveness(item, false, false);
      
      onIndicatorClick(el, item);
      
      assertActiveness(item, false, true);
      item._elements.content.click();
      
      assertActiveness(item, true, true);
    });
    
    it('should not select item when select is selected', function() {
      const el = helpers.build(window.__html__['Tree.interactive.html']);
      var item = el.items.getAll()[1];
      assertActiveness(item, false, false);
      
      var select = item.querySelector('select');
      expect(select).to.exist;
      expect(select.value).to.equal('Option 1');
      select.click();
      select.focus();
      
      assertActiveness(item, false, false);
      onIndicatorClick(el, item);
      
      assertActiveness(item, false, true);
      item._elements.content.click();
      
      assertActiveness(item, true, true);
    });
    
    it('should select item when button is selected', function() {
      const el = helpers.build(window.__html__['Tree.interactive.html']);
      var item = el.items.getAll()[2];
      assertActiveness(item, false, false);
      var button = item.querySelector('button');
      expect(button).to.exist;
      button.click();
      
      assertActiveness(item, false, false);
      onIndicatorClick(el, item);
      
      assertActiveness(item, false, true);
      item._elements.content.click();
      
      assertActiveness(item, true, true);
    });
    
    it('should select item when textarea is focused', function() {
      const el = helpers.build(window.__html__['Tree.interactive.html']);
      var item = el.items.getAll()[3];
      assertActiveness(item, false, false);
      var textarea = item.querySelector('textarea');
      expect(textarea).to.exist;
      textarea.click();
      textarea.focus();
      textarea.blur();
      
      assertActiveness(item, false, false);
      onIndicatorClick(el, item);
      
      assertActiveness(item, false, true);
      item._elements.content.click();
      
      assertActiveness(item, true, true);
    });
    
    it('should be possible to select items in an interactive tree', function() {
      const el = helpers.build(window.__html__['Tree.interactive.html']);
      var item = el.items.getAll()[0];
      item.selected = true;
      
      assertActiveness(item, true, false);
      expect(el.selectedItem).to.equal(item);
      item.selected = false;
      
      assertActiveness(item, false, false);
      expect(el.selectedItem).to.equal(null);
    });
    
    it('should not select the item if the radio is selected', function() {
      const el = helpers.build(window.__html__['Tree.interactive.html']);
      var item = el.items.getAll()[4];
      assertActiveness(item, false, false);
      
      var radio = item.querySelector('input[type="radio"]');
      expect(radio).to.exist;
      expect(radio.checked).to.equal(false);
      radio.click();
  
      expect(radio.checked).to.equal(true);
      assertActiveness(item, false, false);
      onIndicatorClick(el, item);
      
      assertActiveness(item, false, true);
      item._elements.content.click();
  
      assertActiveness(item, true, true);
    });
    
    it('should be possible to expand items in an interactive tree', function() {
      const el = helpers.build(window.__html__['Tree.interactive.html']);
      var item = el.items.getAll()[0];
      item.expanded = true;
      
      assertActiveness(item, false, true);
      item.expanded = false;
      
      assertActiveness(item, false, false);
    });
  });
});
