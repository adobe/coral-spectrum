import {helpers} from '../../../coralui-utils/src/tests/helpers';
import {SelectList} from '../../../coralui-component-list';

describe('SelectList', function() {
  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-Menu')).to.be.true;
      expect(el.getAttribute('role')).equal('listbox');
    }

    it('should be possible using new', function() {
      var el = helpers.build(new SelectList());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function() {
      var el = helpers.build(document.createElement('coral-selectlist'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function() {
      testDefaultInstance(helpers.build('<coral-selectlist></coral-selectlist>'));
    });
    
    helpers.cloneComponent(
      'should be possible to clone using markup',
      helpers.build(window.__html__['SelectList.base.html'])
    );
    
    helpers.cloneComponent(
      'should be possible to clone using markup with groups',
      helpers.build(window.__html__['SelectList.groups.html'])
    );
    
    const el = new SelectList();
    el.items.add({
      content: {
        innerHTML: 'Item 1'
      }
    });
    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });
  
  describe('API', function() {
    
    let el = null;
    let item = null;
    let group = null;
    
    beforeEach(function() {
      el = new SelectList();
      item = new SelectList.Item();
      group = new SelectList.Group();
    });
    
    afterEach(function() {
      el = item = group = null;
    });
    
    describe('#selectedItems', function() {
      it('should default to empty array', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });
    });
    
    describe('#selectedItem', function() {
      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });
    });
    
    describe('#multiple', function() {
      it('should default to false', function() {
        expect(el.multiple).to.be.false;
      });
    });
    
    describe('#loading', function() {
      it('should default to false', function() {
        expect(el.loading).to.be.false;
      });
    });
  });

  describe('Markup', function() {
  
    describe('#multiple', function() {
      it('should allow to select all items if [multiple=true]', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        const items = el.items.getAll();
      
        el.multiple = true;
        items.forEach((item) => {
          item.setAttribute('selected', '');
        });
        expect(items).to.deep.equal(el.selectedItems);
      });
    
      it('should only allow to select 1 item if [multiple=false]', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        expect(el.multiple).to.be.false;
      
        el.items.getAll().forEach((item) => {
          item.setAttribute('selected', '');
        });
        expect(el.selectedItems).to.deep.equal([el.items.last()]);
      });
    });

    describe('#selectedItem', function() {
      it('should default to null', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        expect(el.selectedItem).to.be.null;
      });

      it('should take the last selected if not multiple', function() {
        helpers.target.innerHTML = window.__html__['SelectList.doubleselected.html'];
        const el = document.querySelector('coral-selectlist');
        var items = el.items.getAll();
        expect(el.multiple).to.be.false;
        expect(el.selectedItem).to.equal(items[2]);
        expect(el.selectedItems).to.deep.equal([items[2]]);
        expect(items[2].selected).to.be.true;
      });

      it('should take the first selected with multiple', function() {
        helpers.target.innerHTML = (window.__html__['SelectList.multiple.html']);
        const el = document.querySelector('coral-selectlist');
        var items = el.items.getAll();
        expect(el.multiple).to.be.true;
        expect(el.selectedItem).to.equal(items[0]);
        expect(el.selectedItems).to.deep.equal([items[0], items[2]]);
        expect(items[0].selected).to.be.true;
      });

      it('should read the selected from the markup', function() {
        const el = helpers.build(window.__html__['SelectList.selected.html']);
        expect(el.selectedItem).to.equal(el.items.first());
      });
    });
  
    describe('#selectedItems', function() {
      it('should return all selected items', function() {
        const el = helpers.build(window.__html__['SelectList.selected.html']);
        expect(el.selectedItems).to.deep.equal([el.items.first()]);
        el.items.first().selected = false;
        expect(el.selectedItems).to.deep.equal([]);
        el.multiple = true;
        el.items.first().selected = true;
        el.items.last().selected = true;
        expect(el.selectedItems).to.deep.equal([el.items.first(), el.items.last()]);
      });
    });

    describe('#loading', function() {
      it('should show a loading indicator when set to true', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        el.loading = true;
      
        var indicator = el.querySelector('._coral-SelectList-loading');
        expect(indicator).to.not.equal(null);
      });

      it('should hide a loading indicator when set to false', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        el.loading = true;
        el.loading = false;
        
        var indicator = el.querySelector('._coral-SelectList-loading');
        expect(indicator).to.equal(null);
      });

      it('should always add the loading at the end', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        el.loading = true;
        el.loading = false;
        
        var indicator = el.querySelector('._coral-SelectList-loading');
        expect(indicator).to.equal(null);

        el.items.add({
          value: 'other',
          content: {
            innerHTML: 'Other'
          }
        });

        el.loading = true;
        
        var indicator = el.children[el.children.length - 1];

        expect(indicator.classList.contains('_coral-SelectList-loading')).to.be.true;
      });
    });

    describe('#groups', function() {
      var el;

      beforeEach(function() {
        el = helpers.build(window.__html__['SelectList.groups.html']);
      });

      it('retrieves all groups', function() {
        var groups = el.groups.getAll();
        expect(groups.length).to.equal(2);
      });

      it('adds a group instance', function() {
        var group = new SelectList.Group();
        group.label = 'Test group';

        el.groups.add(group);

        var groups = Array.prototype.slice.call(el.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(3);
        expect(groups[2].label).to.equal('Test group');
      });

      it('adds a group using a config object', function() {
        el.groups.add({
          label: 'Test group'
        });

        var groups = Array.prototype.slice.call(el.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(3);
        expect(groups[2].label).to.equal('Test group');
      });

      it('removes a group', function() {
        var group = el.groups.getAll()[0];
        el.groups.remove(group);

        var groups = Array.prototype.slice.call(el.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(1);
        expect(group.parentNode).to.be.null;
      });

      it('clears all groups', function() {
        el.groups.clear();

        var groups = Array.prototype.slice.call(el.getElementsByTagName('coral-selectlist-group'));
        expect(groups.length).to.equal(0);
      });
    });
  
    describe('#focus()', function() {
      it('should focus the first item when no selection is available', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        expect(document.activeElement).not.to.equal(el);
        
        el.focus();
  
        expect(document.activeElement).to.equal(el.items.first(), 'Focus should move to the first item');
      });
    
      it('should not shift focus if already inside the component', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        expect(document.activeElement).not.to.equal(el);
        
        // we focus the last item to shift focus into the component
        el.items.last().focus();
        
        expect(document.activeElement).to.equal(el.items.last(), 'Focus should move inside the component');
      
        el.focus();
        
        expect(document.activeElement).to.equal(el.items.last(), 'Focus should not be reset');
      });
    
      it('should should move the focus to the selected item', function() {
        const el = helpers.build(window.__html__['SelectList.selected.html']);
        expect(document.activeElement).not.to.equal(el);
        
        el.focus();
        
        expect(document.activeElement).to.equal(el.selectedItem, 'Focus should move to the selected item');
      });
    });
  });

  describe('Events', function() {

    var el;
    var item1, item2, item3;

    beforeEach(function() {
      el = helpers.build(new SelectList());

      item1 = new SelectList.Item();
      item1.label = 'Item 1';

      item2 = new SelectList.Item();
      item2.label = 'Item 2';

      item3 = new SelectList.Item();
      item3.label = 'Item 3';
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });
  
    describe('#coral-selectlist:beforechange', function() {
      it('should be able to prevent a user selection', function() {
        const el = helpers.build(window.__html__['SelectList.selected.html']);
        el.on('coral-selectlist:beforechange', function(e) {
          e.preventDefault();
        });
        el.selectedItem.click();
        expect(el.selectedItem).to.not.be.null;
      });
    });
    
    describe('#coral-selectlist:change', function() {
      it('should trigger on selection change', function() {
        const el = helpers.build(window.__html__['SelectList.base.html']);
        let changeSpy = sinon.spy();
        el.on('coral-selectlist:change', changeSpy);
        el.items.first().selected = true;
      
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(el.selectedItem);
        expect(changeSpy.args[0][0].detail.oldSelection).to.equal(null);
      });
    
      it('should return an array for selection and oldSelection if multiple=true', function() {
        const el = helpers.build(window.__html__['SelectList.selected.html']);
        el.multiple = true;
        let changeSpy = sinon.spy();
        el.on('coral-selectlist:change', changeSpy);
        el.items.last().selected = true;
      
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.deep.equal([el.items.first(), el.items.last()]);
        expect(changeSpy.args[0][0].detail.oldSelection).to.deep.equal([el.items.first()]);
      });
    
      it('should trigger on multiple change', function() {
        const el = helpers.build(window.__html__['SelectList.selected.html']);
        el.multiple = true;
        el.items.last().selected = true;
      
        let changeSpy = sinon.spy();
        el.on('coral-selectlist:change', changeSpy);
        el.multiple = false;
      
        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.args[0][0].detail.selection).to.equal(el.items.last());
        expect(changeSpy.args[0][0].detail.oldSelection).to.deep.equal([el.items.first(), el.items.last()]);
      });
    });

    describe('#coral-selectlist:scrollbottom', function() {

      it('should trigger a scrollbottom event when user scrolls to the bottom of the list', function() {
        const el = helpers.build(new SelectList());
        for (var i = 0; i < 50; i++) {
          el.items.add({
            value: 'value' + i,
            content: {
              innerHTML: 'content' + i
            }
          });
        }
  
        var spy = sinon.spy();
        var clock = sinon.useFakeTimers();
  
        el.on('coral-selectlist:scrollbottom', spy);
  
        el.scrollTop = 10000;
        el.trigger('scroll');
        clock.tick(1000); // Fast-forward past scroll debounce.
  
        expect(spy.callCount).to.equal(1);
  
        // If the user scrolls again but doesn't scroll outside of the bottom threshold
        // distance it should still trigger another scrollbottom event.
        el.scrollTop -= 10;
        el.trigger('scroll');
        clock.tick(1000); // Fast-forward past scroll debounce.
  
        expect(spy.callCount).to.equal(2);
  
        clock.restore();
      });
    });
  });

  describe('User Interaction', function() {
    it('should focus the item which contains text starting with the letter O', function(done) {
      const el = helpers.build(window.__html__['SelectList.base.html']);
      el._keypressTimeoutDuration = 0;
      
      const lastItem = el.items.last();
      el._onKeyPress({which: 'O'.charCodeAt(0)});
      
      // Key press search is implemented with a 1 sec timeout but we override it
      window.setTimeout(function() {
        expect(lastItem.getAttribute('tabindex')).to.equal('0');
        expect(document.activeElement).to.equal(lastItem);
        done();
      });
    });
    // @todo: test focus of initial state
    // @todo: test focus of an empty list
    // @todo: test focus of a list with a selected item
    // @todo: focus on a hidden selected item
    // @todo: add a test for focus() and no children
  });
});
