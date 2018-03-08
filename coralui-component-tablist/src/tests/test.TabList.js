import {TabList, Tab} from '/coralui-component-tablist';
import {Icon} from '/coralui-component-icon';

describe('TabList', function() {
  
  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.getAttribute('aria-multiselectable')).to.equal('false');
      expect(el.classList.contains('_coral-TabList')).to.be.true;
      expect(el.getAttribute('size')).to.equal(TabList.size.MEDIUM);
      expect(el.getAttribute('orientation')).to.equal(TabList.orientation.HORIZONTAL);
      expect(el.getAttribute('role')).to.equal('tablist');
      expect(el.getAttribute('aria-multiselectable')).to.equal('false');
    }

    it('should be possible using new', function() {
      var el = helpers.build(new TabList());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = helpers.build(document.createElement('coral-tablist'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function() {
      testDefaultInstance(helpers.build('<coral-tablist></coral-tablist>'));
    });

    it('should be possible via clone using markup', function() {
      helpers.cloneComponent(window.__html__['TabList.base.html']);
    });

    it('should be possible via clone using markup with textContent', function() {
      helpers.cloneComponent(window.__html__['TabList.selectedItem.html']);
    });

    it('should be possible via clone using js', function() {
      var el;
      var item1, item2, item3;

      el = new TabList();

      item1 = new Tab();
      item1.label.textContent = 'Item 1';

      item2 = new Tab();
      item2.label.textContent = 'Item 2';

      item3 = new Tab();
      item3.label.textContent = 'Item 3';

      el.appendChild(item1);
      el.appendChild(item2);
      el.appendChild(item3);
      
      helpers.cloneComponent(el);
    });
  });

  describe('API', function() {
    var el;
    var item1, item2, item3;

    beforeEach(function() {
      el = new TabList();

      item1 = new Tab();
      item1.label.textContent = 'Item 1';

      item2 = new Tab();
      item2.label.textContent = 'Item 2';

      item3 = new Tab();
      item3.label.textContent = 'Item 3';
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    describe('#selectedItem', function() {

      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
        expect(el.items.length).to.equal(0);
      });

      it('should automatically select the first available item', function(done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);

        // Wait for MO
        helpers.next(function() {
          expect(el.selectedItem).to.equal(item1);
          expect(item1.selected).to.be.true;
          expect(item1.hasAttribute('selected')).to.be.true;
          done();
        });
      });

      it('should select another item when the active one is disabled', function() {
        el.appendChild(item1);
        el.appendChild(item2);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);

        item1.disabled = true;
        expect(el.selectedItem).to.equal(item2);

        item2.disabled = true;
        expect(el.selectedItem).to.be.null;
        expect(item1.selected).to.be.false;
        expect(item2.selected).to.be.false;
      });

      it('should select the tab that just became enabled', function() {
        el.appendChild(item1);
        
        item1.selected = true;
  
        expect(el.selectedItem).to.equal(item1);
  
        item1.disabled = true;
        expect(el.selectedItem).to.be.null;
        expect(item1.selected).to.be.false;
  
        item1.disabled = false;
        expect(el.selectedItem).to.equal(item1);
      });

      it('selecting another item should modify #selectedItem', function() {
        el.appendChild(item1);
        el.appendChild(item2);

        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;
        expect(item2.selected).to.be.false;
        expect(item2.hasAttribute('selected')).to.be.false;

        item2.selected = true;

        expect(el.selectedItem).to.equal(item2);
        expect(item1.selected).to.be.false;
        expect(item1.hasAttribute('selected')).to.be.false;
        expect(item2.selected).to.be.true;
        expect(item2.hasAttribute('selected')).to.be.true;
      });

      it('removing an unselected item should not modify #selectedItem', function() {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
        item1.selected = true;

        item2.remove();

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;
        expect(item2.selected).to.be.false;
        expect(item2.hasAttribute('selected')).to.be.false;
        expect(item3.selected).to.be.false;
        expect(item3.hasAttribute('selected')).to.be.false;
      });

      it('should be null if all items are removed', function() {
        el.appendChild(item1);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;

        item1.remove();
        expect(el.selectedItem).to.be.null;
      });

      it('should be null the last item is disabled', function() {
        el.appendChild(item1);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;

        item1.disabled = true;

        expect(el.selectedItem).to.be.null;
      });

      it('should be the first available item if the current selectedItem is removed', function(done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
        item1.selected = true;
        item2.disabled = true;
  
        // Wait one more frame to make sure MO is ready
        helpers.next(function() {
          item1.remove();
  
          // Wait for MO to detect removed node
          helpers.next(function() {
            expect(el.selectedItem).to.equal(item3);
            expect(item2.selected).to.be.false;
            expect(item2.hasAttribute('selected')).to.be.false;
            expect(item3.selected).to.be.true;
            expect(item3.hasAttribute('selected')).to.be.true;
            done();
          });
        });
      });
      
      describe('#variant', function() {
        it('should default to TabList.variant.PANEL', function() {
          expect(el.variant).to.equal(TabList.variant.PANEL);
        });
  
        it('should set variant classname', function() {
          el.variant = TabList.variant.ANCHORED;
          expect(el.classList.contains('_coral-TabList--anchored')).be.true;
          expect(el.classList.contains('_coral-TabList--panel')).be.false;
          expect(el.classList.contains('_coral-TabList--page')).be.false;
  
          el.variant = TabList.variant.PAGE;
          expect(el.classList.contains('_coral-TabList--page')).be.true;
          expect(el.classList.contains('_coral-TabList--anchored')).be.false;
          expect(el.classList.contains('_coral-TabList--panel')).be.false;
  
          el.variant = TabList.variant.PANEL;
          expect(el.classList.contains('_coral-TabList--panel')).be.true;
          expect(el.classList.contains('_coral-TabList--page')).be.false;
          expect(el.classList.contains('_coral-TabList--anchored')).be.false;
        });
      });
    });

    describe('#icon', function() {
      var defaultMarkup = window.__html__['TabList.base.html'];

      it('should be initially empty', function() {
        const el = helpers.build(defaultMarkup);
        var items = el.items.getAll();
  
        expect(items[0].getAttribute('icon')).to.be.null;
        expect(items[0].icon).to.equal('');
      });

      it('should set the new icon', function() {
        const el = helpers.build(defaultMarkup);
        var items = el.items.getAll();
        var tabPanelItem = items[0];
  
        tabPanelItem.icon = 'settings';
        
        expect(tabPanelItem._elements.icon).to.exist;
        expect(tabPanelItem._elements.icon.icon).to.equal('settings');
  
        // By Default, Extra Small icons are used in tab panel
        expect(tabPanelItem._elements.icon.size).to.equal(Icon.size.EXTRA_SMALL);
      });
  
      it('should change icon size depending on label', function(done) {
        const el = new Tab();
        el.icon = 'add';
        expect(el._elements.icon.size).to.equal(Icon.size.SMALL);
        
        el.label.textContent = 'text';
        // Wait for MO
        helpers.next(() => {
          expect(el._elements.icon.size).to.equal(Icon.size.EXTRA_SMALL);
          
          done();
        });
      });
    });
  });

  describe('Markup', function() {

    describe('#target', function() {
      it('should default to null', function() {
        const el = helpers.build(window.__html__['TabList.base.html']);
        expect(el.target).to.be.null;
      });

      it('should not fail with empty string', function() {
        const el = helpers.build(window.__html__['TabList.target.html']);
        expect(el.target).to.equal('');
      });

      it('should select the target after being inserted in the DOM', function(done) {
        helpers.build(window.__html__['TabList.virtualtarget.html']);
  
        var tabItem = document.getElementById('tabItem');
        var targetItem = document.getElementById('targetItem');
        
        // Wait for target to be in the DOM
        helpers.next(function() {
          expect(targetItem.hasAttribute('selected')).to.be.true;
          expect(targetItem.getAttribute('aria-labelledby')).to.equal(tabItem.id);
          done();
        });
      });
    });

    describe('#selectedItem', function() {
      it('should default to the first item', function() {
        const el = helpers.build(window.__html__['TabList.base.html']);
        expect(el.selectedItem).to.equal(el.items.getAll()[0]);
      });

      it('should take the last selected', function() {
        helpers.target.innerHTML = window.__html__['TabList.doubleselected.html'];
        const el = helpers.target.querySelector('coral-tablist');
        var items = el.items.getAll();
        expect(el.selectedItem).to.equal(items[2]);
        expect(items[2].hasAttribute('selected')).to.be.true;
        expect(items[1].selected).to.be.false;
      });

      it('should read the selected from the markup', function() {
        const el = helpers.build(window.__html__['TabList.selectedItem.html']);
        expect(el.selectedItem).to.equal(el.items.getAll()[1]);
      });
    });
  });
  
  describe('Events', function() {
    let el = null;
    let item1 = null;
    let item2 = null;
    
    beforeEach(function() {
      el = new TabList();
      item1 = el.items.add();
      item2 = el.items.add();
    });
    
    afterEach(function() {
      el = item1 = item2;
    });
    
    it('should trigger a coral-tablist:change event when an item is selected', function() {
      var spy = sinon.spy();
      el.on('coral-tablist:change', spy);
    
      item1.selected = true;
      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(item1);
      expect(spy.args[0][0].detail.oldSelection).to.equal(null);
  
      var spy = sinon.spy();
      el.on('coral-tablist:change', spy);
      item2.selected = true;
      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(item2);
      expect(spy.args[0][0].detail.oldSelection).to.equal(item1);
    });
  
    it('should select the target item before triggering a coral-tablist:change event', function(done) {
      var target = document.createElement('div');
      for (var i = 0; i < el.items.length; i++) {
        target.appendChild(document.createElement('div'));
      }
      helpers.target.appendChild(target);
    
      el.target = target;
    
      el.on('coral-tablist:change', function() {
        expect(target.children[1].hasAttribute('selected')).to.be.true;
        done();
      });
    
      item2.selected = true;
    });
  });

  describe('User Interaction', function() {
    var defaultMarkup = window.__html__['TabList.base.html'];
    var selectedItemMarkup = window.__html__['TabList.selectedItem.html'];

    it('should select tab on click', function() {
      const el = helpers.build(defaultMarkup);
      var items = el.items.getAll();
  
      expect(items.length).to.equal(5);
  
      expect(el.selectedItem).to.equal(items[0]);
  
      items[1].click();
  
      expect(items[0].selected).to.be.false;
      
      expect(items[0].classList.contains('is-selected')).to.be.false;
      expect(items[0].getAttribute('tabindex')).to.equal('-1');
  
      expect(el.selectedItem).to.equal(items[1]);
    });

    it('should ignore clicks on disabled tabs', function() {
      const el = helpers.build(defaultMarkup);
      var items = el.items.getAll();
  
      expect(items.length).to.equal(5);
  
      expect(el.selectedItem).to.equal(items[0]);
  
      items[3].click();
  
      expect(items[0].selected).to.be.true;
    });

    it('should select the last tab on end press', function() {
      const el = helpers.build(defaultMarkup);
      var items = el.items.getAll();
  
      expect(items.length).to.equal(5);
  
      expect(el.selectedItem).to.equal(items[0]);
  
      // focuses the item before producing the key press
      items[0].focus();
  
      expect(document.activeElement).to.equal(items[0]);
  
      helpers.keypress('end', items[0]);
  
      expect(el.selectedItem).to.equal(items[4]);
      expect(document.activeElement).to.equal(items[4]);
    });

    it('should select the first tab on home press', function() {
      const el = helpers.build(selectedItemMarkup);
      var items = el.items.getAll();
  
      expect(el.selectedItem).to.equal(items[1]);
  
      // focuses the item before producing the key press
      items[1].focus();
  
      expect(document.activeElement).to.equal(items[1]);
  
      helpers.keypress('home', items[1]);
  
      expect(el.selectedItem).to.equal(items[0]);
      expect(document.activeElement).to.equal(items[0]);
    });

    it('should select the next tab on pagedown, right, and down', function() {
      const el = helpers.build(defaultMarkup);
      var items = el.items.getAll();
  
      helpers.keypress('pagedown', items[0]);
  
      expect(el.selectedItem).to.equal(items[1]);
      expect(document.activeElement).to.equal(items[1]);
  
      helpers.keypress('right', items[1]);
  
      expect(el.selectedItem).to.equal(items[2]);
      expect(document.activeElement).to.equal(items[2]);
  
      helpers.keypress('down', items[2]);
  
      expect(el.selectedItem).to.equal(items[4]);
      expect(document.activeElement).to.equal(items[4]);
    });

    it('should select the previous item on pageup, left and up', function() {
      const el = helpers.build(defaultMarkup);
      var items = el.items.getAll();
  
      // forces the selected item to be the last one
      helpers.keypress('end', items[0]);
      expect(el.selectedItem).to.equal(items[4]);
      expect(document.activeElement).to.equal(items[4]);
  
      helpers.keypress('pageup', items[4]);
  
      expect(el.selectedItem).to.equal(items[2]);
      expect(document.activeElement).to.equal(items[2]);
  
      helpers.keypress('left', items[2]);
  
      expect(el.selectedItem).to.equal(items[1]);
      expect(document.activeElement).to.equal(items[1]);
  
      helpers.keypress('up', items[1]);
  
      expect(el.selectedItem).to.equal(items[0]);
      expect(document.activeElement).to.equal(items[0]);
    });
  });

  describe('Implementation Details', function() {
    it('clicking the tab should select the tab', function() {
      const el = helpers.build(window.__html__['TabList.selectedItem.html']);
      var tab1 = el.querySelector('[role=tab]');
      tab1.click();

      let item1 = el.items.first();
      expect(el.selectedItem).to.equal(item1);
      expect(item1.selected).to.be.true;
    });
    
    it('should set the line under the selected item', function(done) {
      const el = helpers.build(window.__html__['TabList.selectedItem.html']);
      const selectedItem = el.selectedItem;
      
      helpers.next(() => {
        expect(el._elements.line.style.transform).to.not.equal('');
        expect(el._elements.line.style.width).to.not.equal('');
        expect(el._elements.line.hidden).to.be.false;
        
        done();
      });
    });
  
    it('should set the line under the newly selected item', function(done) {
      const el = helpers.build(window.__html__['TabList.selectedItem.html']);
      el.items.first().selected = true;
    
      helpers.next(() => {
        const selectedItem = el.selectedItem;
        expect(el._elements.line.style.transform).to.not.equal('');
        expect(el._elements.line.style.width).to.not.equal('');
        expect(el._elements.line.hidden).to.be.false;
        
        done();
      });
    });
  
    it('should set the line under the selected item after switching orientation', function(done) {
      const el = helpers.build(window.__html__['TabList.selectedItem.html']);
      const selectedItem = el.selectedItem;
      
      el.orientation = 'vertical';
      
      helpers.next(() => {
        expect(el._elements.line.style.width).to.equal('');
        expect(el._elements.line.style.height).to.not.equal('');
        expect(el._elements.line.style.translate).to.not.equal('');
        expect(el._elements.line.hidden).to.be.false;
        
        done();
      });
    });
  
    it('should hide the line if no selected item', function(done) {
      const el = new TabList();
      expect(el._elements.line.hidden).to.be.true;
      
      helpers.build(el);
  
      // Line is set next frame
      helpers.next(() => {
        // Still hidden
        expect(el._elements.line.hidden).to.be.true;
        
        done();
      });
    });
  });

  describe('Collection API', function() {

    var addSpy;
    var removeSpy;

    var el;
    var item1, item2, item3;

    beforeEach(function() {
      el = new TabList();
      helpers.target.appendChild(el);

      item1 = new Tab();
      item1.label.textContent = 'Item 1';

      item2 = new Tab();
      item2.label.textContent = 'Item 2';

      item3 = new Tab();
      item3.label.textContent = 'Item 3';

      addSpy = sinon.spy();
      removeSpy = sinon.spy();

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);
    });

    afterEach(function() {
      el.off('coral-collection:add', addSpy);
      el.off('coral-collection:remove', removeSpy);

      addSpy = removeSpy = undefined;
      el = item1 = item2 = item3 = null;
    });

    it('#items cannot be set', function() {
      el.appendChild(item1);
      el.appendChild(item2);

      var items = el.items;

      try {
        el.items = null;
      }
      catch (e) {
        expect(el.items).to.equal(items);
      }
    });

    it('triggers coral-collection:add on appendChild', function(done) {
      el.appendChild(item1);
      el.appendChild(item2);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item1);
      expect(all[1]).to.equal(item2);

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['TabList.base.html']);
      
      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);

      expect(el.items.length).to.equal(5);

      var all = el.items.getAll();
      var item = all[2];

      el.removeChild(item);

      expect(el.items.length).to.equal(4);

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function(done) {
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      expect(el.items.length).to.equal(3);
  
      var all = el.items.getAll();
      var item = all[2];
  
      el.removeChild(item);
  
      expect(el.items.length).to.equal(2);
  
      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(3);
        expect(removeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('#add should add the item', function(done) {
      var ret = el.items.add(item1);
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(el.items.length).to.equal(1);
      expect(all.indexOf(item1)).to.equal(0);
      expect(ret).to.equal(item1);

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add should also support config', function(done) {
      var ret = el.items.add({
        label: {
          textContent: 'Header 1'
        },
        selected: true,
        disabled: false,
        invalid: true,
        content: {
          textContent: 'content'
        }
      });
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(all.indexOf(ret)).to.equal(0);
      expect(ret instanceof Tab).to.be.true;

      expect(ret.label.textContent).to.equal('Header 1');
      expect(ret.selected).to.be.true;
      expect(ret.disabled).to.be.false;
      expect(ret.invalid).to.be.true;
      expect(ret.content.textContent).to.equal('content');

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add with before null should insert at the end', function(done) {
      el.items.add(item1, null);
      el.items.add(item2, null);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item1);
      expect(all[1]).to.equal(item2);

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });
    
    it('#add is able to insert before', function(done) {
      el.items.add(item1);
      el.items.add(item2, item1);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item2);
      expect(all[1]).to.equal(item1);

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add with both disabled and selected should make it unselected', function(done) {
      var ret = el.items.add({
        label: {
          textContent: 'Header 1'
        },
        selected: true,
        disabled: true
      });
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(all.indexOf(ret)).to.equal(0);
      expect(ret instanceof Tab).to.be.true;

      expect(ret.label.textContent).to.equal('Header 1');
      expect(ret.selected).to.be.false;
      expect(ret.disabled).to.be.true;

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#remove should remove the item', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['TabList.base.html']);

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);

      expect(el.items.length).to.equal(5);

      var all = el.items.getAll();
      var item = all[2];

      el.items.remove(item);

      expect(el.items.length).to.equal(4);

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('#getAll should be empty initially', function(done) {
      var all = el.items.getAll();
      expect(all.length).to.equal(0);

      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#clear should clear all the items', function(done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();
      var el = helpers.build(window.__html__['TabList.base.html']);
  
      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);
  
      expect(el.items.length).to.equal(5);
      el.items.clear();
      expect(el.items.length).to.equal(0);
  
      // Wait for MO
      helpers.next(function() {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(5);
        done();
      });
    });
  });
});
