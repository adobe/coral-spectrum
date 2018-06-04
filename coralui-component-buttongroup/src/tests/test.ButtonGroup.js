import {helpers} from '../../../coralui-util/src/tests/helpers';
import {ButtonGroup} from '../../../coralui-component-buttongroup';
import {Button} from '../../../coralui-component-button';

describe('ButtonGroup', function() {
  var el;
  var item1;
  var item2;
  var item3;
  
  var getSimpleButtonGroupElement = function() {
    el = new ButtonGroup();
    
    item1 = new Button();
    item1.set({
      value: 'item1',
      label: {
        textContent: 'Item 1'
      }
    });
    
    item2 = new Button();
    item2.set({
      value: 'item2',
      label: {
        textContent: 'Item 2'
      }
    });
    
    item3 = new Button();
    item3.set({
      value: 'item3',
      label: {
        textContent: 'Item 3'
      }
    });
    
    el.appendChild(item1);
    el.appendChild(item2);
    el.appendChild(item3);
    
    return el;
  };
  
  describe('Namespace', function() {
    it('should define the selection modes in an enum', function() {
      expect(ButtonGroup.selectionMode).to.exist;
      expect(ButtonGroup.selectionMode.NONE).to.equal('none');
      expect(ButtonGroup.selectionMode.SINGLE).to.equal('single');
      expect(ButtonGroup.selectionMode.MULTIPLE).to.equal('multiple');
      expect(Object.keys(ButtonGroup.selectionMode).length).to.equal(3);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['ButtonGroup.base.html']);
    });
    
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(getSimpleButtonGroupElement())
    });
  });
  
  describe('API', function() {
    
    describe('#items', function() {
      
      beforeEach(function() {
        el = getSimpleButtonGroupElement();
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });
      
      it('should be readOnly', function() {
        try {
          el.items = null;
        }
        catch (e) {
          expect(e).not.to.be.null;
          expect(el.items).not.to.be.null;
        }
      });
      
      it('should get all the items with getAll()', function() {
        var items = el.items.getAll();
        
        expect(items.length).to.equal(3);
        expect(items[0]).to.equal(item1);
        expect(items[1]).to.equal(item2);
        expect(items[2]).to.equal(item3);
      });
      
      it('should remove all the items with clear()', function() {
        helpers.build(el);
        // we remove all the items
        el.items.clear();
        
        expect(el.items.length).to.equal(0);
        // makes sure the native select was not blown away
        expect(el._elements.nativeSelect.parentNode).to.equal(el);
      });
      
      it('should add items using add()', function() {
        var item = new Button();
        item.setAttribute('value', 'item4');
        item.label.textContent = 'Item 4';
        
        el.items.add(item);
        expect(el.items.length).to.equal(4);
      });
      
      it('should allow adding using an object notation', function() {
        el.items.add({
          value: 'item4',
          label: {
            textContent: 'Item 4'
          }
        });
        
        expect(el.items.length).to.equal(4);
      });
      
      it('should allow adding selected items using an object notation', function(done) {
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
        
        el.items.add({
          value: 'item4',
          label: {
            textContent: 'Item 4'
          },
          selected: true
        });
        
        expect(el.items.length).to.equal(4);
        
        // we need to wait for the MO to kick in
        helpers.next(function() {
          // the new value should match the added item
          expect(el.value).to.equal('item4', 'Value should match the newly added item');
          expect(el.values).to.deep.equal(['item4']);
          
          var items = el.items.getAll();
          expect(items[0].hasAttribute('selected')).to.be.false;
          expect(items[3].hasAttribute('selected')).to.be.true;
          
          done();
        });
      });
      
      it('should allow adding a selected button', function(done) {
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
      
        // makes sure the selectionMode handled the item selection
        expect(el.value).to.equal('item1');
        
        var item = new Button();
        item.setAttribute('value', 'item4');
        item.setAttribute('selected', '');
        item.label.textContent = 'Item 4';
        
        el.items.add(item);
        
        helpers.next(function() {
          // the new value should match the added item
          expect(el.value).to.equal('item4');
          expect(el.values).to.deep.equal(['item4']);
          
          var items = el.items.getAll();
          expect(items[0].hasAttribute('selected')).to.be.false;
          expect(items[3].hasAttribute('selected')).to.be.true;
          
          done();
        });
      });
  
      it('should allow adding a selected button using appendChild', function(done) {
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
    
        // makes sure the selectionMode handled the item selection
        expect(el.value).to.equal('item1');
    
        var item = new Button();
        item.setAttribute('value', 'item4');
        item.setAttribute('selected', '');
        item.label.textContent = 'Item 4';
    
        el.appendChild(item);
    
        helpers.next(function() {
          // the new value should match the added item
          expect(el.value).to.equal('item4');
          expect(el.values).to.deep.equal(['item4']);
      
          var items = el.items.getAll();
          expect(items[0].hasAttribute('selected')).to.be.false;
          expect(items[3].hasAttribute('selected')).to.be.true;
      
          done();
        });
      });
    });
    
    describe('#selectionMode', function() {
      
      beforeEach(function() {
        el = getSimpleButtonGroupElement();
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });
      
      it('should default to none', function() {
        expect(el.selectionMode).to.equal('none');
        expect(el._elements.nativeSelect.options.length).to.equal(0);
      });
      
      it('should add select options when selection mode changed to single', function() {
        el.selectionMode = 'single';
        expect(el._elements.nativeSelect.options.length).to.equal(3);
      });
      
      it('should remove all options when selection mode changed to none', function() {
        el.selectionMode = 'single';
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        el.selectionMode = 'none';
        
        // checks what still has the selected attribute
        var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
        
        expect(el._elements.nativeSelect.options.length).to.equal(0);
        expect(selectedButtons.length).to.equal(0);
      });
      
      it('should clear the entire selection when selectionMode is set back to none', function() {
        el.selectionMode = 'multiple';
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        
        // we select all the buttons
        var buttons = el.items.getAll();
        buttons.forEach(function(item) {
          item.selected = true;
        });
        
        // we make sure all the buttons were selected
        expect(el.values).to.deep.equal(['item1', 'item2', 'item3']);
        
        // we clear the selection. this should cause all buttons to be deselected
        el.selectionMode = 'none';
        
        // querries the dom for buttons with the selected attribute
        var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
        expect(selectedButtons.length).to.equal(0);
        
        // all options must have been removed
        expect(el._elements.nativeSelect.options.length).to.equal(0);
      });
    });
    
    describe('#name', function() {
      var form;
      
      beforeEach(function() {
        form = document.createElement('form');
        el = getSimpleButtonGroupElement();
        
        form.appendChild(el);
        helpers.target.appendChild(form);
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = form = null;
      });
      
      it('should have empty string as default', function() {
        expect(el.name).to.equal('');
        expect(el._elements.nativeSelect.name).to.equal('');
      });
      
      it('should set the name to the native select', function() {
        el.name = 'buttongroup';
        expect(el.name).to.equal('buttongroup');
        expect(el._elements.nativeSelect.name).to.equal('buttongroup');
      });
      
      it('should submit by default the first item', function() {
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
        
        el.name = 'test';
        
        expect(helpers.serializeArray(el.parentNode)).to.deep.equal([{
          name: 'test',
          value: 'item1'
        }]);
      });
      
      it('should submit nothing when name is not specified even though an item is selected', function() {
        // we select by adding the attribute
        item2.setAttribute('selected', '');
        
        expect(el._elements.nativeSelect.name).to.equal('');
        
        var values = helpers.serializeArray(el.parentNode);
        
        expect(values.length).to.equal(0);
      });
      
      it('should submit nothing when selectionMode = none', function() {
        el.name = 'buttongroup';
        item2.setAttribute('selected', '');
        expect(el.selectionMode).to.equal(ButtonGroup.selectionMode.NONE);
        
        expect(el.name).to.equal('buttongroup');
        expect(el._elements.nativeSelect.name).to.equal('buttongroup');
        
        // native should have no valid value
        expect(el._elements.nativeSelect.value).to.equal('');
        
        expect(el.value).to.equal('');
        
        // no value should be submitted
        expect(helpers.serializeArray(el.parentNode)).to.deep.equal([]);
        
        // makes sure no option is created
        expect(el._elements.nativeSelect.options.length).to.equal(0);
      });
      
      it('should allow changing the selection', function() {
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
        
        el.name = 'buttongroup';
        
        // we select the item
        item2.setAttribute('selected', '');
        
        expect(el.name).to.equal('buttongroup');
        expect(el._elements.nativeSelect.name).to.equal('buttongroup');
        
        // the native has the correct value
        expect(el._elements.nativeSelect.value).to.equal(item2.value, 'Native value should match the selected item');
        
        expect(el.value).to.equal(item2.value, 'value should match the selected item');
        
        expect(helpers.serializeArray(el.parentNode)).to.deep.equal([{
          name: 'buttongroup',
          value: item2.value
        }]);
      });
      
      it('should remove associated option element', function(done) {
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
        
        expect(el.value).to.equal('item1');
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        
        item2.remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(2);
          expect(el.value).to.equal('item1');
          
          done();
        });
      });
      
      it('should allow removing the selected item', function(done) {
        // we set the name and the selection mode
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
        el.name = 'test';
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        
        expect(el.value).to.equal(item1.value);
        expect(el.values).to.deep.equal([item1.value]);
        
        // we remove the selected item
        item1.remove();
        
        helpers.next(() => {
          expect(el._elements.nativeSelect.options.length).to.equal(2);
          
          expect(helpers.serializeArray(el.parentNode)).to.deep.equal([{
            name: 'test',
            value: item2.value
          }]);
          
          done();
        });
      });
      
      it('should submit multiple values with selectionMode = multiple', function() {
        // we set the name and the selection mode
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        el.name = 'test';
        
        // selects 2 items
        item1.setAttribute('selected', '');
        item2.setAttribute('selected', '');
        
        expect(helpers.serializeArray(el.parentNode)).to.deep.equal([
          {
            name: 'test',
            value: item1.value
          },
          {
            name: 'test',
            value: item2.value
          }
        ]);
      });
      
      it('should remove associated option element when selectionMode = multiple', function(done) {
        // we set the name and the selection mode
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        el.name = 'test';
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        
        item2.remove();
        
        helpers.next(() => {
          expect(el._elements.nativeSelect.options.length).to.equal(2);
          done();
        });
      });
      
      it('show allow removing a selected item when selectionMode = multiple', function(done) {
        // we set the name and the selection mode
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        el.name = 'test';
        
        // every item should have a corresponding value
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        
        // selects 2 items
        item2.setAttribute('selected', '');
        item3.setAttribute('selected', '');
        
        expect(el.values).to.deep.equal(['item2', 'item3']);
        
        // we remove one of the selected items
        item2.remove();
        
        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(2);
          
          expect(helpers.serializeArray(el.parentNode)).to.deep.equal([{
            name: 'test',
            value: item3.value
          }]);
          
          done();
        });
      });
    });
    
    describe('#disabled', function() {
      beforeEach(function() {
        el = getSimpleButtonGroupElement();
      });
      
      it('should disable the component and items as well', function() {
        var isDisabled = true;
        el.disabled = isDisabled;
        expect(el.disabled).equal(isDisabled);
        el.items.getAll().forEach(function(item) {
          expect(item.disabled).equal(isDisabled);
        });
      });
    });
    
    describe('#readOnly', function() {
      beforeEach(function() {
        el = getSimpleButtonGroupElement();
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });
      
      it('should disable items as well', function() {
        var isReadOnly = true;
        el.readOnly = isReadOnly;
        
        expect(el.hasAttribute('aria-readonly')).equal(false);
        el.items.getAll().forEach(function(item) {
          expect(item.disabled).equal(isReadOnly);
        });
      });
      
      it('with selectionMode="single", should add "aria-disabled" attribute to selected item', function() {
        var isReadOnly = true;
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
        el.readOnly = isReadOnly;
        
        expect(el.hasAttribute('aria-readonly')).equal(false);
        el.items.getAll().forEach(function(item) {
          expect(item.getAttribute('aria-disabled')).equal('true');
        });
        el.readOnly = !isReadOnly;
        
        el.items.getAll().forEach(function(item) {
          expect(item.hasAttribute('aria-disabled')).equal(!isReadOnly);
        });
      });
      
      it('with selectionMode="multiple", should add "aria-disabled" attribute to selected item', function() {
        var isReadOnly = true;
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        el.readOnly = isReadOnly;
        item1.selected = item3.selected = true;
        
        expect(el.hasAttribute('aria-readonly')).equal(false);
        el.items.getAll().forEach(function(item) {
          expect(item.getAttribute('aria-disabled')).equal('true');
        });
        el.readOnly = !isReadOnly;
        
        el.items.getAll().forEach(function(item) {
          expect(item.hasAttribute('aria-disabled')).equal(!isReadOnly);
        });
      });
    });
    
    describe('#required', function() {
    });
    describe('#invalid', function() {
    });
    describe('#labelledBy', function() {
      
      beforeEach(function() {
        el = getSimpleButtonGroupElement();
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });
      
      it('should default to null', function() {
        expect(el.labelledBy).to.be.null;
        expect(el.getAttribute('aria-labelledby')).to.be.null;
      });
      
      it('should update to the selected value', function() {
        // set labelledby
        el.labelledBy = 'test';
        
        // aria-labelledby attribute on buttongroup should be set synchronously
        expect(el.getAttribute('aria-labelledby')).to.equal('test');
        
        // aria-labelledby attribute on nativeSelect should be set after sync
        expect(el._elements.nativeSelect.getAttribute('aria-labelledby')).to.equal('test');
        
        // set labelledby to null
        el.labelledBy = null;
        
        // aria-labelledby attribute on buttongroup should be removed synchronously
        expect(el.getAttribute('aria-labelledby')).to.be.null;
        
        // aria-labelledby attribute on nativeSelect should be removed after sync
        expect(el.getAttribute('aria-labelledby')).to.be.null;
      });
    });
    
    describe('#value', function() {
      var form;
      
      beforeEach(function() {
        form = document.createElement('form');
        
        el = getSimpleButtonGroupElement();
        
        el.set({
          name: 'test',
          selectionMode: 'single'
        });
        
        form.appendChild(el);
        helpers.target.appendChild(form);
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = form = null;
      });
      
      it('should set value as selected', function() {
        expect(el.value).to.equal('item1');
        
        el.value = 'item2';
        
        expect(helpers.serializeArray(el.parentNode)).to.deep.equal([{
          name: 'test',
          value: 'item2'
        }]);
      });
      
      it('should set value as selected unselecting old values', function() {
        el.selectionMode = 'multiple';
        // select item 2
        // first elem is already selected since we are changing from single selection
        item2.setAttribute('selected', '');
        
        expect(el.values.length).to.equal(2);
        
        var value = 'item2';
        el.value = value;
        
        expect(helpers.serializeArray(el.parentNode)).to.deep.equal([{
          name: 'test',
          value: 'item2'
        }]);
      });
    });
    
    describe('#values', function() {
      var form;
      
      beforeEach(function() {
        form = document.createElement('form');
        
        el = getSimpleButtonGroupElement();
        el.name = 'test';
        
        form.appendChild(el);
        helpers.target.appendChild(form);
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = form = null;
      });
      
      it('should default to empty array when selectionMode = none', function() {
        expect(el.selectionMode).to.equal(ButtonGroup.selectionMode.NONE);
        expect(el.values).to.deep.equal([]);
      });
      
      it('should ignore the setter when selectionMode = none', function() {
        el.values = ['item1'];
        expect(el.values).to.deep.equal([]);
      });
      
      it('should default to the first item when selectionMode = single', function() {
        el.selectionMode = 'single';
        
        expect(el.values).to.deep.equal(['item1']);
      });
      
      it('should default to empty array when selectionMode = multiple', function() {
        el.selectionMode = 'multiple';
        
        expect(el.values).to.deep.equal([]);
      });
      
      it('should set the values for selectionMode = single', function() {
        el.selectionMode = 'single';
        
        el.values = ['item1'];
        
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal(item1.value);
        
        expect(el.values).to.deep.equal(['item1']);
      });
      
      it('should select first value as selected when passed multiple elements for selectionMode = single', function() {
        el.selectionMode = 'single';
        
        // sets the new values. only the first one should be considered
        el.values = ['item2', 'item3'];
        
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal(item2.value);
        
        expect(el.value).to.equal('item2');
        expect(el.values).to.deep.equal(['item2']);
      });
      
      it('should set all values as selected for selectionMode = multiple', function() {
        el.selectionMode = 'multiple';
        el.values = ['item2', 'item3'];
        
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal(item2.value);
        expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal(item3.value);
        
        expect(el.value).to.equal('item2');
        expect(el.values).to.deep.equal(['item2', 'item3']);
      });
      
      it('should allow to clear the selection when selectionMode = multiple', function() {
        el.selectionMode = 'multiple';
        
        // selects all the items
        el.values = ['item1', 'item2', 'item3'];
        
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(3);
        
        expect(el.values).to.deep.equal(['item1', 'item2', 'item3']);
        
        el.values = [];
        
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(0);
        
        expect(el.value).to.equal('');
        expect(el.values).to.deep.equal([]);
      });
    });
    
    describe('#selectedItem', function() {
      
      beforeEach(function() {
        el = getSimpleButtonGroupElement();
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });
      
      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });
      
      it('should update to the selected value', function() {
        el.selectionMode = ButtonGroup.selectionMode.SINGLE;
        
        //select item2
        item2.selected = true;
        
        expect(el.selectedItem).to.equal(item2);
        
        //select item3
        item3.selected = true;
        
        expect(el.selectedItem).to.equal(item3);
      });
      
      it('should return first selected item if selection mode = "multiple"', function() {
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        
        // select all the buttons
        var buttons = el.items.getAll();
        buttons.forEach(function(item) {
          item.selected = true;
        });
        
        expect(el.selectedItem).to.equal(item1);
      });
      
      it('should be null if the selected is removed', function(done) {
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        item2.selected = true;
        
        expect(el.selectedItem).to.equal(item2);
        
        item2.remove();
        
        // Wait for MO
        helpers.next(() => {
          expect(el.selectedItem).to.be.null;
          done();
        });
      });
    });
    
    describe('#selectedItems', function() {
      
      beforeEach(function() {
        el = getSimpleButtonGroupElement();
      });
      
      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });
      
      it('should default to an empty array', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });
      
      it('should update to the selected values', function() {
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        item2.selected = true;
        
        expect(el.selectedItems).to.deep.equal([item2]);
        item3.selected = true;
        
        expect(el.selectedItems).to.deep.equal([item2, item3]);
      });
      
      it('should return all selected items if selection mode = "multiple"', function() {
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        
        // select all the buttons
        var buttons = el.items.getAll();
        buttons.forEach(function(item) {
          item.selected = true;
        });
        
        expect(el.selectedItems).to.deep.equal([item1, item2, item3]);
      });
      
      it('should return an empty array if the selected is removed', function(done) {
        el.selectionMode = ButtonGroup.selectionMode.MULTIPLE;
        
        expect(el._elements.nativeSelect.options.length).to.equal(3);
        item2.selected = true;
        
        expect(el.selectedItems).to.deep.equal([item2]);
        
        item2.remove();
        
        // Wait for MO
        helpers.next(() => {
          expect(el.selectedItems).to.deep.equal([]);
          done();
        });
      });
    });
  });
  
  describe('Markup', function() {
    describe('#value', function() {
      it('should use the value attribute when available', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.selected.html']);
        var items = el.items.getAll();
        
        expect(el.value).to.equal(items[1].getAttribute('value'));
      });
      
      it('should default to the text when value attribute is not available', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.novalues.html']);
        var items = el.items.getAll();
        
        expect(items[1].hasAttribute('value')).to.be.false;
        
        // since no value attribute is available, we use the text content
        expect(el.value).to.equal(items[1].label.textContent);
        
        el.value = items[0].textContent;
        
        expect(el.value).to.equal(items[0].label.textContent);
        
        expect(items[0].hasAttribute('selected')).to.be.true;
      });
      
      it('should clean the fallback values to behave like the native options', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.novalues.html']);
        var items = el.items.getAll();
        
        expect(items[2].hasAttribute('value')).to.be.false;
        expect(items[2].value).not.to.equal(items[2].textContent, 'they should not match due to the transformations');
        
        // value should not have double spaces
        el.value = 'Delete action';
        
        expect(el.value).to.equal('Delete action');
        
        expect(items[2].hasAttribute('selected')).to.be.true;
      });
      
      it('should update the value when changed attribute is changed programatically', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.novalues.html']);
        var items = el.items.getAll();
        
        // since no value attribute is available, we use the text content
        expect(el.value).to.equal(items[1].label.textContent);
        
        // sets a new value
        items[1].setAttribute('value', 'newvalue');
        
        // we wait for the mutation observers
        
        // checks the internal option
        expect(items[1].option.value).to.equal('newvalue');
        // the value to submit must be updated
        expect(el.value).to.equal('newvalue');
      });
      
      it('should to empty string if all items are removed', function(done) {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.html']);
        
        // it had a value before the removal
        expect(el.value).to.equal('item1');
        
        // we remove all the items
        el.items.clear();
        
        // Wait for MO
        helpers.next(() => {
          expect(el.value).to.equal('');
          done();
        });
      });
    });
    
    // values is not available in the markup, but settable using the "selected" attribute in the items
    describe('#values', function() {
      it('should select item with "selected" attribute', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.selected.html']);
        var items = el.items.getAll();
        
        expect(el.value).to.equal(items[1].value);
        expect(el.values).to.deep.equal([items[1].value]);
      });
      
      it('should reject multiple "selected" items', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.doubleselected.html']);
        var items = el.items.getAll();
        
        expect(el.selectedItems.length).to.equal(1);
        // keeps the first selected
        expect(el.value).to.equal(items[1].value);
        expect(el.values).to.deep.equal([items[1].value]);
      });
      
      it('should select all items with "selected" attribute when selectionMode is "multiple"', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.multiple.selected.html']);
        var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
        
        expect(el.values).to.deep.equal([selectedButtons[0].value, selectedButtons[1].value]);
        expect(selectedButtons.length).to.equal(2);
      });
      
      it('should enforce the single selection when selected attribute is added', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.selected.html']);
        var items = el.items.getAll();
        expect(items[1].hasAttribute('selected')).to.be.true;
        
        items[0].setAttribute('selected', '');
        
        // values should match the new selection
        expect(el.value).to.equal(items[0].value, 'Value should match the new selection');
        expect(el.values).to.deep.equal([items[0].value]);
        
        var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
        expect(selectedButtons.length).to.equal(1);
        
        expect(items[1].hasAttribute('selected')).to.be.false;
      });
      
      it('should find an item to select when the selected attribute is removed', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.selected.html']);
        var items = el.items.getAll();
        expect(items[1].hasAttribute('selected')).to.be.true;
        
        // removes the attribute of the selected item, which should trigger a new item to be selected
        items[1].removeAttribute('selected');
        
        // values should match the new selection
        expect(el.value).to.equal(items[0].value, 'Value should match the new selection');
        expect(el.values).to.deep.equal([items[0].value]);
        
        var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
        expect(selectedButtons.length).to.equal(1);
        
        expect(items[1].hasAttribute('selected')).to.be.false;
      });
    });
    
    describe('#reset()', function() {
      it('initial items without an explicit value should get a valid value from the textContent', function() {
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.multiple.novalues.html']);
        var items = el.items.getAll();
        
        expect(items[1].hasAttribute('value')).to.be.false;
        expect(items[2].hasAttribute('value')).to.be.false;
        expect(items[1].value).not.to.equal(items[1].label.textContent, 'they should not match due to the transformations');
        expect(items[2].value).not.to.equal(items[2].label.textContent, 'they should not match due to the transformations');
        
        expect(el.values).to.deep.equal(['Camera', 'Delete action']);
        
        // we force the first item to have the value
        el.value = items[0].label.textContent;
        
        expect(el.items._getAllSelected()).to.deep.equal([items[0]]);
      });
    });
  });
  
  // @todo: test collection events
  describe('Events', function() {
    describe('#change', function() {
      it('should not trigger change while setting values programatically', function() {
        var changeSpy = sinon.spy();
        
        const el = helpers.build(window.__html__['ButtonGroup.base.html']);
        // adds the required listeners
        el.on('change', changeSpy);
        
        expect(changeSpy.callCount).to.equal(0);
        
        el.value = 'item3';
        expect(changeSpy.callCount).to.equal(0);
      });
      
      it('should trigger change when an unselected button is clicked', function() {
        var changeSpy = sinon.spy();
        
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.html']);
        // adds the required listeners
        el.on('change', changeSpy);
        
        var buttons = el.items.getAll();
        
        buttons[2].click();
        
        expect(el.value).to.equal('item3');
        
        expect(changeSpy.callCount).to.equal(1);
      });
      
      it('should not trigger change when the selected button is clicked', function() {
        var changeSpy = sinon.spy();
        
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.html']);
        // adds the required listeners
        el.on('change', changeSpy);
        
        // the 2nd item should be selected initially
        expect(el.value).to.equal('item1');
        
        var buttons = el.items.getAll();
        buttons[0].click();
        
        expect(el.value).to.equal('item1');
        
        expect(changeSpy.callCount).to.equal(0);
      });
      
      it('should trigger change when unselected buttons are clicked and selectionMode = multiple', function() {
        var changeSpy = sinon.spy();
        
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.multiple.html']);
        // adds the required listeners
        el.on('change', changeSpy);
        
        expect(el.value).to.equal('');
        
        var buttons = el.items.getAll();
        buttons[0].click();
        buttons[2].click();
        
        expect(el.value).to.equal('item1');
        expect(el.values).to.deep.equal(['item1', 'item3']);
        
        expect(changeSpy.callCount).to.equal(2);
      });
      
      it('should trigger change when the selected button is clicked and selectionMode = multiple', function() {
        var changeSpy = sinon.spy();
        
        const el = helpers.build(window.__html__['ButtonGroup.selectionMode.multiple.html']);
        // adds the required listeners
        el.on('change', changeSpy);
        
        expect(el.value).to.equal('');
        
        var buttons = el.items.getAll();
        
        buttons[0].click();
        
        expect(el.value).to.equal('item1');
        expect(el.values).to.deep.equal(['item1']);
        
        expect(changeSpy.callCount).to.equal(1);
        
        buttons[0].click();
        
        expect(el.value).to.equal('');
        expect(el.values).to.deep.equal([]);
        
        expect(changeSpy.callCount).to.equal(2);
      });
    });
  });
  
  describe('User Interaction', function() {
    it('nothing should happen when selectionMode = none', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      var items = el.items.getAll();
      items[2].click();
      
      expect(el.value).to.equal('');
      expect(el.selectedItems.length).to.equal(0);
      expect(items[2].hasAttribute('selected')).to.be.false;
    });
    
    it('should select the clicked item when selectionMode = single', function() {
      const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.html']);
      var items = el.items.getAll();
      items[2].click();
      
      expect(el.value).to.equal('item3');
      expect(el.selectedItems.length).to.equal(1);
      expect(items[2].hasAttribute('selected')).to.be.true;
    });
    
    it('should ignore a click on selected item when selectionMode = single', function() {
      const el = helpers.build(window.__html__['ButtonGroup.selectionMode.single.html']);
      var items = el.items.getAll();
      // clicks the item that was already selected
      items[0].click();
      
      expect(el.value).to.equal('item1');
      expect(el.selectedItems.length).to.equal(1);
      expect(items[0].hasAttribute('selected')).to.be.true;
    });
    
    it('should select the clicked item when selectionMode = multiple', function() {
      const el = helpers.build(window.__html__['ButtonGroup.selectionMode.multiple.selected.html']);
      expect(el.values).to.deep.equal(['item2', 'item3']);
      
      var items = el.items.getAll();
      items[0].click();
      
      expect(el.values).to.deep.equal(['item1', 'item2', 'item3']);
      expect(el.selectedItems.length).to.equal(3);
      expect(items[0].hasAttribute('selected')).to.be.true;
    });
    
    it('should toggle a selected item by clicking it when selectionMode = multiple', function() {
      const el = helpers.build(window.__html__['ButtonGroup.selectionMode.multiple.selected.html']);
      expect(el.values).to.deep.equal(['item2', 'item3']);
      
      var items = el.items.getAll();
      items[2].click();
      
      expect(el.values).to.deep.equal(['item2']);
      expect(el.selectedItems.length).to.equal(1);
      expect(items[2].hasAttribute('selected')).to.be.false;
    });
  });
  
  describe('Accessibility', function() {
    
    // Utility method to test tabindex values for items within button group based on current active element
    function testTabIndexValues(activeElement, enabledButtons) {
      var isCurrent = false;
      var enabledButton;
      var tabIndex = -1;
      for (var i = 0; i < enabledButtons.length; i++) {
        enabledButton = enabledButtons[i];
        isCurrent = activeElement === enabledButton;
        tabIndex = isCurrent ? 0 : -1;
        if (tabIndex !== enabledButton.tabIndex) {
          return false;
        }
      }
      return true;
    }
    
    it('should change role of buttons to "radio" when selection mode changed to single', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      el.selectionMode = 'single';
      
      var buttons = el.items.getAll();
      
      expect(el.getAttribute('role')).to.equal('radiogroup');
      
      for (var i = 0; i < buttons.length; i++) {
        expect(buttons[i].getAttribute('role')).to.equal('radio');
      }
      
      expect(el.items._getFirstSelectable().selected).to.be.true;
      expect(el.items._getFirstSelectable().getAttribute('aria-checked')).to.equal('true');
    });
    
    it('should change role of buttons to "checkbox" when selection mode changed to multiple', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      el.selectionMode = 'multiple';
      
      var buttons = el.items.getAll();
      
      expect(el.getAttribute('role')).to.equal('group');
      
      for (var i = 0; i < buttons.length; i++) {
        expect(buttons[i].getAttribute('role')).to.equal('checkbox');
      }
    });
    
    it('should remove role attribute from buttons when selection mode changed to none', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      el.selectionMode = 'single';
      
      var buttons = el.items.getAll();
      
      el.selectionMode = 'none';
      
      expect(el.getAttribute('role')).to.equal('group');
      
      for (var i = 0; i < buttons.length; i++) {
        expect(buttons[i].getAttribute('role')).to.be.null;
        expect(buttons[i].selected).to.be.false;
        expect(buttons[i].getAttribute('aria-checked')).to.be.null;
      }
    });
    
    it('should update aria-checked value when an button is selected with single selectionMode', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      el.selectionMode = 'single';
      
      var buttons = el.items.getAll().filter(function(button, i, array) {
        return !button.disabled;
      });
      
      buttons[0].focus();
      expect(buttons[0].selected).to.be.true;
      expect(buttons[0].getAttribute('aria-checked')).to.equal('true');
      expect(buttons[0].tabIndex).to.equal(0);
      
      // simulate a right arrow keydown event
      var simulatedEvent = {
        matchedTarget: buttons[0], preventDefault: function() {
        }
      };
      el._onButtonKeyDownRight(simulatedEvent);
      
      // next button should have focus
      expect(document.activeElement).to.equal(buttons[1]);
      
      // next button should be checked and tabbable, all others should unchecked and focusable.
      for (var i = 0; i < buttons.length; i++) {
        expect(buttons[i].selected).to.be.equal(i === 1);
        expect(buttons[i].getAttribute('aria-checked')).to.equal(i === 1 ? 'true' : 'false');
        expect(buttons[i].tabIndex).to.equal(i === 1 ? 0 : -1);
      }
    });
    
    it('should permit navigation of enabled buttons using arrow keys with only one button within the group recieving tab focus at a time', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      el.selectionMode = 'multiple';
      
      var buttons = el.items.getAll();
      var enabledButtons = buttons.filter(function(button, i, array) {
        return !button.disabled;
      });
      var button;
      
      button = el.items._getFirstSelectable();
      button.focus();
      expect(button.tabIndex).to.equal(0);
      
      // simulate a right arrow keydown event
      var simulatedEvent = {
        matchedTarget: button, preventDefault: function() {
        }
      };
      el._onButtonKeyDownRight(simulatedEvent);
      
      // next button should have focus
      button = enabledButtons[1];
      expect(document.activeElement).to.equal(button);
      
      // force trigger focus for Firefox
      button.trigger('focus');
      
      // next button should be tabbable, all others should focusable
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
      
      // simulate a right arrow keydown event
      simulatedEvent.matchedTarget = button;
      el._onButtonKeyDownRight(simulatedEvent);
      
      // next button should have focus
      button = enabledButtons[2];
      expect(document.activeElement).to.equal(button);
      
      // force trigger focus for Firefox
      button.trigger('focus');
      
      // next button should be tabbable, all others should focusable
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
      
      // simulate a right arrow keydown event on the last enabled button
      simulatedEvent.matchedTarget = button;
      el._onButtonKeyDownRight(simulatedEvent);
      
      // arrow key navigation should loop to the first selectable item
      button = el.items._getFirstSelectable();
      expect(document.activeElement).to.equal(button);
      
      // force trigger focus for Firefox
      button.trigger('focus');
      
      // first button should be tabbable, all others should focusable
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
      
      // simulate a left arrow keydown event on the first enabled button
      simulatedEvent.matchedTarget = button;
      el._onButtonKeyUpLeft(simulatedEvent);
      
      // arrow key navigation should loop to the last selectable item
      button = enabledButtons[enabledButtons.length - 1];
      expect(document.activeElement).to.equal(button);
      
      // force trigger focus for Firefox
      button.trigger('focus');
      
      // last button should be tabbable, all others should focusable
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
      
      // simulate a left arrow keydown event on the last enabled button
      simulatedEvent.matchedTarget = button;
      el._onButtonKeyUpLeft(simulatedEvent);
      
      // previous button should have focus
      button = enabledButtons[1];
      expect(document.activeElement).to.equal(button);
      
      // force trigger focus for Firefox
      button.trigger('focus');
      
      // previous button should be tabbable, all others should focusable
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
    });
    
    it('should permit navigation with enabled buttons using home/end keys with only one button within the group recieving tab focus at a time', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      el.selectionMode = 'multiple';
      
      var buttons = el.items.getAll();
      var enabledButtons = buttons.filter(function(button, i, array) {
        return !button.disabled;
      });
      var button;
      
      button = el.items._getFirstSelectable();
      button.focus();
      expect(button.tabIndex).to.equal(0);
      
      // simulate end keydown event
      var simulatedEvent = {
        matchedTarget: button, preventDefault: function() {
        }
      };
      el._onButtonKeyEnd(simulatedEvent);
      
      // last button should have focus
      button = enabledButtons[enabledButtons.length - 1];
      expect(document.activeElement).to.equal(button);
      
      // force trigger focus for Firefox
      button.trigger('focus');
      
      // last button should be tabbable, all others should focusable
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
      
      // simulate home keydown event
      simulatedEvent.matchedTarget = button;
      el._onButtonKeyHome(simulatedEvent);
      
      // first button should have focus
      button = el.items._getFirstSelectable();
      expect(document.activeElement).to.equal(button);
      
      // force trigger focus for Firefox
      button.trigger('focus');
      
      // first button should be tabbable, all others should focusable
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
    });
    
    it('blur should set focus to last selected item when selectionMode is multiple', function() {
      const el = helpers.build(window.__html__['ButtonGroup.base.html']);
      el.selectionMode = 'multiple';
      
      var enabledButtons = el.items.getAll().filter(function(button, i, array) {
        return !button.disabled;
      });
      var button;
      
      enabledButtons[0].selected = true;
      enabledButtons[2].selected = true;
      button = enabledButtons[1];
      button.selected = true;
      button.trigger('focus');
      button.trigger('blur');
      
      // if last focused button is selected, it becomes the only tabbable button in the group
      expect(testTabIndexValues(button, enabledButtons)).to.be.true;
      
      button.selected = false;
      button.trigger('blur');
      
      // if the last focused button has been deselected, only the last selected button in the group is tabbable
      expect(testTabIndexValues(enabledButtons[2], enabledButtons)).to.be.true;
      
      enabledButtons[0].selected = false;
      enabledButtons[2].selected = false;
      enabledButtons[2].trigger('blur');
      
      // if no items in the group are selected, only the first button in the group should be tabbable
      expect(testTabIndexValues(enabledButtons[0], enabledButtons)).to.be.true;
    });
  });
  
  describe('Implementation Details', function() {
    var el;
    var item1;
    
    beforeEach(function() {
      el = new ButtonGroup();
      item1 = new Button();
      
      el.appendChild(item1);
      
      helpers.target.appendChild(el);
    });
    
    afterEach(function() {
      el = item1 = null;
    });
    
    it('should be possible to move buttonGroup in dom without losing the current set "value"', function() {
      const el = helpers.build(window.__html__['ButtonGroup.selectionMode.multiple.selected.html']);
      el.value = 'item3';
      expect(el.value).to.equal('item3', '"item3" should be set as value');
      
      var form = document.createElement('form');
      form.appendChild(el);
      helpers.target.appendChild(form);
      
      expect(el.value).to.equal('item3', '"item3" should STILL be set as value');
      
      el.value = 'item1';
      
      expect(el.value).to.equal('item1', '"item1" should now be set as value');
    });
    
    it('should add item classes to children', function() {
      expect(item1.variant).to.equal(Button.variant._CUSTOM);
      expect(item1.classList.contains('_coral-ActionButton')).to.be.true;
    });
    
    it('should remove item classes from children', function(done) {
      item1.remove();
      
      helpers.next(() => {
        expect(item1.variant).to.equal(Button.variant.PRIMARY);
        expect(item1.classList.contains('_coral-ActionButton')).to.be.false;
        done();
      });
    });
  });
  
  describe('Implementation Details (compliance)', function() {
    describe('#formField (multiple)', function() {
      helpers.testFormField(window.__html__['ButtonGroup.selectionMode.multiple.value.html'], {
        value: 'item1',
        default: ''
      });
    });
    
    describe('#formField (single)', function() {
      helpers.testFormField(window.__html__['ButtonGroup.selectionMode.single.value.html'], {
        value: 'item2',
        default: 'item1'
      });
    });
  });
});
