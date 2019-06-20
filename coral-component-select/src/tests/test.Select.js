/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {tracking} from '../../../coral-utils';
import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Select} from '../../../coral-component-select';

describe('Select', function() {
  // @todo: test reordering the options
  describe('Namespace', function() {
    it('should define the variants in an enum', function() {
      expect(Select.variant).to.exist;
      expect(Select.variant.DEFAULT).to.equal('default');
      expect(Select.variant.QUIET).to.equal('quiet');
      expect(Object.keys(Select.variant).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    function testDefaultInstance(select) {
      expect(select.classList.contains('_coral-Dropdown')).to.be.true;
    }

    it('should be possible using new', function() {
      var select = helpers.build(new Select());
      testDefaultInstance(select);
    });

    it('should be possible using createElement', function() {
      var select = helpers.build(document.createElement('coral-select'));
      testDefaultInstance(select);
    });

    it('should be possible using markup', function() {
      const el = helpers.build('<coral-select></coral-select>');
      testDefaultInstance(el);
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      helpers.build(window.__html__['Select.multiple.base.html'])
    );
  
    helpers.cloneComponent(
      'should be possible to clone using markup with framework data',
      window.__html__['Select.mustache.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Select()
    );
  });

  // API tests that do not set the placeholder as default
  describe('API', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function(done) {
      el = helpers.build(new Select());

      item1 = new Select.Item();
      item2 = new Select.Item();
      item3 = new Select.Item();

      item1.content.textContent = 'Item 1';
      item1.value = '1';
      item2.content.textContent = 'Item 2';
      item2.value = '2';
      item3.content.textContent = 'Item 3';
      item3.value = '3';

      // adds the item to the select
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);
      
      // Wait for MO
      helpers.next(function() {
        done();
      });
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    describe('#placeholder', function() {
      // case 3: !p + !m +  se = se
      it('should default to empty string', function() {
        expect(el.placeholder).to.equal('');

        // selects the second item
        item2.selected = true;
        
        expect(el.placeholder).to.equal('');
        expect(el._elements.label.textContent.trim()).to.equal(item2.content.textContent);
      });

      // case 3: !p + !m +  se = se
      it('should correctly change to selected item after changing from multiple to single', function() {
        el.multiple = true;
        
        expect(el.placeholder).to.equal('');
  
        // selects an item
        item1.selected = true;
        item2.selected = true;
        
        expect(el.selectedItem).to.equal(item1);
        expect(el.selectedItems).to.deep.equal([item1, item2]);
        // should update to the default placeholder for multiple
        expect(el._elements.label.textContent).to.equal('Select');
  
        // we switch back to single
        el.multiple = false;
  
        // should switch to the 2nd item
        expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
      });

      // case 4: !p + !m + !se = firstSelectable, but with no selectable option
      it('should default to empty string if empty', function(done) {
        // we remove all the items for the text
        el.items.clear();

        expect(el.placeholder).to.equal('');

        // waits for the MO to kick-in
        helpers.next(function() {
          expect(el._elements.label.innerHTML).to.equal('');

          done();
        });
      });

      // case 4: !p + !m + !se = firstSelectable
      it('should default to first selectable', function() {
        expect(el.placeholder).to.equal('');
        expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);
      });

      // case 4: !p + !m + !se = firstSelectable
      // should correctly sync the value when switching
      it('should correctly switch the first selectable', function() {
        el.multiple = true;

        expect(el.placeholder).to.equal('');
        
        // should update to the default placeholder for multiple
        expect(el._elements.label.textContent).to.equal('Select');

        // we switch back to single
        el.multiple = false;
        
        // should show the first item since there is no placeholder
        expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);
      });

      // case 8: !p +  m + !se = 'Select'
      it('should show "Select" if no placeholder, multiple and nothing selected', function() {
        el.multiple = true;
        el.selectedItem.selected = false;
        
        expect(el.placeholder).to.equal('');
        expect(el._elements.label.textContent).to.equal('Select');
      });

      // case 8: !p +  m + !se = 'Select'
      // should correctly sync the value
      it('should switch to default placeholder when switched from single to multiple', function() {
        // starts as single
        expect(el.multiple).to.be.false;
        // with no placeholder
        expect(el.placeholder).to.equal('');
        
        // should show the first item since there is no placeholder
        expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);

        // activates the multiple
        el.multiple = true;
        el.selectedItem.selected = false;
        
        // should update to the default placeholder for multiple
        expect(el._elements.label.textContent).to.equal('Select');
      });

      // case 7: !p +  m +  se = 'Select'
      it('should enumerate the selected items in the label if multiple=true and there is selection', function() {
        // we wait for the selection to happen
        el.multiple = true;

        expect(el.selectedItem).to.equal(item1);
        expect(el.selectedItems).to.deep.equal([item1]);
        expect(el.placeholder).to.equal('');
        expect(el._elements.label.textContent).to.equal('Select');
      });

      // case 7: !p +  m +  se = 'Select'
      it('should correctly change to selected item after changing from single to multiple without placeholder', function() {
        // we start as single
        expect(el.multiple).to.be.false;
        // with no placeholder
        expect(el.placeholder).to.equal('');

        // selects an item
        item2.selected = true;

        expect(el.selectedItem).to.equal(item2);
        // should show the first item since there is no placeholder
        expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);

        // we change to multiple to see if the label is correctly updated
        el.multiple = true;
        item1.selected = true;
        
        // should show the default placeholder since we are multiple
        expect(el._elements.label.textContent).to.equal('Select');
      });

      // case 5:  p + !m +  se = se
      it('should be "Select" if multiple and has a selectedItem', function() {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;
        
        expect(el.placeholder).to.equal('Choose an item');
        expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
        expect(el.selectedItems).to.deep.equal([item2]);
      });

      // case 6:  p + !m + !se = p
      it('should be "Select" if not multiple and no selectedItem', function() {
        el.placeholder = 'Choose an item';

        // since the select was initialized without a placeholder we revert the forced selection
        item1.selected = false;
        
        expect(el._elements.label.innerHTML).to.equal('Choose an item');
        expect(el.selectedItems).to.deep.equal([]);
      });

      // case 1:  p +  m +  se = p
      it('should show the placeholder with multiple and selectedItem(s)', function() {
        el.placeholder = 'Choose an item';
        el.multiple = true;

        item1.selected = true;
        item2.selected = true;
        
        expect(el.placeholder).to.equal('Choose an item');
        expect(el._elements.label.innerHTML).to.equal('Choose an item');
        expect(el.selectedItems).to.deep.equal([item1, item2]);
      });

      // case 2:  p +  m + !se = p
      it('should show the placeholder with multiple and no selectedItem(s)', function() {
        el.placeholder = 'Choose an item';

        el.multiple = true;
        
        expect(el.placeholder).to.equal('Choose an item');
        expect(el._elements.label.innerHTML).to.equal('Choose an item');
        expect(el.selectedItem).to.equal(item1);
        expect(el.selectedItems).to.deep.equal([item1]);
      });

      it('should go back to the placeholder once the selected is removed', function() {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;
      
        expect(el.placeholder).to.equal('Choose an item');
        expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
        expect(el.selectedItems).to.deep.equal([item2]);

        // we remove the selection from the current item
        item2.removeAttribute('selected');

        expect(el.selectedItem).to.be.null;
        expect(el._elements.label.innerHTML).to.equal('Choose an item');
      });

      it('should go back to the placeholder once the selected is removed', function(done) {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;
        
        expect(el.placeholder).to.equal('Choose an item');
        expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
        expect(el.selectedItems).to.deep.equal([item2]);

        // we remove the selection from the current item
        item2.remove();

        expect(el.selectedItem).to.be.null;

        // we wait for the MO to kick in
        helpers.next(function() {
          expect(el._elements.label.innerHTML).to.equal('Choose an item');
          
          done();
        });
      });
    });
  });

  describe('API', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function(done) {
      el = helpers.build(new Select());
      // using a placeholder stops the component from finding an initial selection
      el.placeholder = 'Placeholder';

      item1 = new Select.Item();
      item2 = new Select.Item();
      item3 = new Select.Item();

      item1.content.textContent = 'Item 1';
      item1.value = '1';
      item2.content.textContent = 'Item 2';
      item2.value = '2';
      item3.content.textContent = 'Item 3';
      item3.value = '3';

      // adds the item to the select
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);
      
      // Wait for MO
      helpers.next(function() {
        done();
      });
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    describe('#placeholder', function() {
      // case 6:  p + !m + !se = p
      it('should default to the placeholder when multiple=false and no selection', function() {
        expect(el._elements.label.textContent).to.equal('Placeholder');
        expect(el.selectedItems).to.deep.equal([]);
      });

      // case 6:  p + !m + !se = p, no items for selection
      it('should default to placeholder when no items', function(done) {
        expect(el.placeholder).to.equal('Placeholder');

        item3.selected = true;
        expect(el.selectedItem).to.equal(item3);
        
        expect(el._elements.label.textContent).to.equal(item3.textContent, 'label should match the selected item');
        // we remove all items which should cause the placeholder to fallback to the initial value
        el.items.clear();

        // we wait for the MO to kick-in
        helpers.next(function() {
          expect(el.items.length).to.equal(0);
          expect(el.selectedItems).to.deep.equal([]);
          expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should be the placeholder');
          
          done();
        });
      });
    });

    describe('#selectedItem', function() {
      it('should default to null when a placeholder is added', function() {
        expect(el.placeholder).not.to.equal('');
        expect(el.selectedItem).to.equal(null);
        expect(el._elements.label.textContent).to.equal(el.placeholder);
      });

      it('should not be settable', function() {
        expect(el.selectedItem).to.equal(null);
        try {
          el.selectedItem = item2;
        }
        catch (e) {
          expect(el.selectedItem).to.equal(null);
        }
      });

      it('should default to the first item when the placeholder is removed', function() {
        // removing the placeholder should cause the select to find a candiate for selection
        el.placeholder = '';
        
        expect(el.selectedItem).to.equal(el.items.first());
        expect(el._elements.label.textContent).to.equal(el.items.first().textContent);
      });

      it('should update to the selected value', function() {
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.nativeSelect.value).to.equal(item2.value);

        item3.selected = true;
        expect(el.selectedItem).to.equal(item3);
        expect(el._elements.nativeSelect.value).to.equal(item3.value);
      });

      it('should be null if the selected is removed', function(done) {
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.nativeSelect.value).to.equal(item2.value);

        item2.remove();
        
        // Wait for MO
        helpers.next(function() {
          expect(el.selectedItem).to.be.null;
          expect(el._elements.label.textContent).to.equal(el.placeholder);
          done();
        });
      });
    });

    describe('#selectedItems', function() {
      it('should default to empty array', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });

      it('should not be settable', function() {
        try {
          el.selectedItems = [item2];
        }
        catch (e) {
          expect(el.selectedItems).to.deep.equal([]);
        }
      });

      it('should return all the selected items when multiple', function() {
        el.multiple = true;

        item2.selected = true;
        item3.selected = true;

        expect(el.selectedItems).to.deep.equal([item2, item3]);
        expect(el._elements.taglist.values).to.deep.equal(['2', '3']);
      });

      it('should return an array when a single item when single', function() {
        item2.selected = true;
        // only the second one will stay because multiple=false
        item3.selected = true;

        expect(el.selectedItems).to.deep.equal([item3]);
      });
    });

    describe('#multiple', function() {
      it('should default to false', function() {
        expect(el.multiple).to.be.false;

        expect(el._elements.nativeSelect.multiple).to.be.false;
        expect(el._elements.list.multiple).to.be.false;
      });

      it('should not allow multiple selection when false', function() {
        item2.selected = true;
        item3.selected = true;

        expect(el.selectedItem).to.equal(item3);
        expect(el.selectedItems.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
        expect(el._elements.list.selectedItems.length).to.equal(1);
        expect(el._elements.taglist.items.length).to.equal(0);
      });

      it('should allow multiple selection when true', function() {
        el.multiple = true;

        // since the item was already initialized and is ready, it was initialized as multiple=false, meaning that it
        // had to find a candidate for selection
        item1.selected = false;
        item2.selected = true;
        item3.selected = true;
        
        expect(el.selectedItem).to.equal(item2, 'item2 should be selected because it is the first selected one');
        expect(el.selectedItems).to.deep.equal([item2, item3], 'both items should be selected');

        expect(el.value).to.equal('2', 'value matches item2');
        expect(el.values).to.deep.equal(['2', '3']);

        // we check the internals to make sure the selection is correct
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
        expect(el._elements.list.selectedItems.length).to.equal(2);
        expect(el._elements.taglist.items.length).to.equal(2);
      });

      it('should transform single selected items to multiple correctly', function() {
        expect(el.selectedItem).to.equal(null, 'no initial selection due to placeholder');
        item2.selected = true;

        expect(el._elements.input.value).to.equal(item2.value);
        expect(el._elements.taglist.value).to.equal('');

        el.multiple = true;

        var tags = el._elements.taglist.items.getAll();

        expect(tags.length).to.equal(1, 'there should be 1 tag');
        expect(tags[0].value).to.equal(item2.value);
      });

      it('should not have tags and multiple selected options when multiple is switched to single', function() {
        el.multiple = true;

        expect(el.selectedItem).to.equal(null, 'no initial selection due to placeholder');

        item2.selected = true;
        item3.selected = true;
      
        expect(el.selectedItem).to.equal(item2, 'item2 should be selected because it is the first selected one.');
        expect(el.selectedItems).to.deep.equal([item2, item3], 'Both items should be selected');

        expect(el.value).to.equal('2', 'there should be the value two');
        expect(el.values).to.deep.equal(['2', '3'], 'there should be the array with value two and three');

        // we check the internals to make sure the selection is correct
        // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2, 'there should be two selected options');
        expect(el._elements.list.selectedItems.length).to.equal(2, 'there should be two selected items');
        expect(el._elements.taglist.items.length).to.equal(2, 'there should be two taglist items');
        
        el.multiple = false;
  
        // we check the internals to make sure the selection is correct
        expect(el.selectedItem).to.equal(item3, 'the last item should remain selected');
        expect(el.selectedItems).to.deep.equal([item3]);
  
        expect(el.value).to.equal('3');
        expect(el.values).to.deep.equal(['3']);
  
        // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
        expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
        expect(el._elements.taglist.items.length).to.equal(0, 'there should be zero taglist items');
        
        // now instead of showing 'Select', the actual item needs to be shown
        expect(el._elements.label.textContent).to.equal(item3.content.textContent);
      });

      it('should have tags when switched from single to multiple', function() {
        expect(el.multiple).to.be.false;
  
        // changes selection to 2nd item
        item2.selected = true;
  
        expect(el.selectedItem).to.equal(item2);
        expect(el.selectedItems).to.deep.equal([item2]);
  
        expect(el.value).to.equal('2', 'there should be the value of the 2nd item');
        expect(el.values).to.deep.equal(['2'], 'there should be the array with value of the 2nd item');
  
        // we check the internals to make sure the selection is correct
        // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
        expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
        expect(el._elements.taglist.items.length).to.equal(0, 'there should be zero taglist items');
  
        el.multiple = true;
  
        expect(el.selectedItem).to.equal(item2);
        expect(el.selectedItems).to.deep.equal([item2]);
  
        expect(el.value).to.equal('2', 'there should be the value two');
        expect(el.values).to.deep.equal(['2'], 'there should be the array with value two');
  
        // we check the internals to make sure the selection is correct
        // expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
        expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
        expect(el._elements.taglist.items.length).to.equal(1, 'there should be one taglist items');
      });

      it('should allow inserting new items', function(done) {
        el.multiple = true;

        var itemCount = el._elements.list.items.length;

        var item4 = el.items.add({
          content: {
            textContent: 'Item 4'
          },
          value: '4',
          // new item starts selected
          selected: true
        });

        expect(el.selectedItem).to.equal(item4);
        expect(el.selectedItems).to.deep.equal([item4]);

        // Wait for MO
        helpers.next(function() {
          expect(el._elements.list.items.length).to.equal(itemCount + 1);
          expect(el._elements.taglist.items.length).to.equal(1);

          done();
        });
      });
    });

    describe('#value', function() {
      it('should default to empty string, if select is empty', function(done) {
        el.items.clear();

        // Wait for MO
        helpers.next(function() {
          expect(el.value).to.equal('');

          done();
        });
      });

      it('should default to empty string when there is a placeholder', function() {
        expect(el.value).to.equal('');
        expect(el.getAttribute('value')).not.to.equal('value should not be reflected');
      });

      it('should default to the first item when there is no placeholder', function() {
        el.placeholder = '';

        // selection will happen in the sync when the placeholder detects there is no valid value
        expect(el.value).to.equal(item1.value, 'value should default to the first item');
        expect(el.getAttribute('value')).not.to.equal('value should not be reflected');
        expect(el._elements.nativeSelect.value).to.equal(item1.value);
      });

      it('should allow to set the value', function() {
        el.value = '2';
        expect(item2.selected).to.be.true;
        expect(el.selectedItem).to.equal(item2);
      });

      it('should allow to set the value even if the select is not attached to dom so far', function() {
        var myEl = new Select();
        var myItem1 = new Select.Item();
        var myItem2 = new Select.Item();

        myItem1.content.innerHTML = 'Item 1';
        myItem1.value = '1';
        myItem2.content.innerHTML = 'Item 2';
        myItem2.value = '2';

        // adds the item to the select
        myEl.items.add(myItem1);
        myEl.items.add(myItem2);

        myEl.value = '2';

        expect(myItem2.selected).to.be.true;
        expect(myEl.selectedItem).to.equal(myItem2);
      });

      it('should be updated if we select a value', function() {
        item3.selected = true;
        expect(el.selectedItem).to.equal(item3);
        expect(el.value).to.equal(item3.value);
        expect(el.selectedItem).to.equal(item3);
        expect(el.value).to.equal(item3.value);
      });

      it('should accept empty string', function() {
        // we select something to force a value
        item2.selected = true;

        expect(el.value).to.equal(item2.value);

        el.value = '';

        expect(el.value).to.equal('');
        expect(el.selectedItem).to.be.null;
      });

      it('should ignore invalid values', function() {
        el.value = '5';

        expect(el.value).to.equal('');
        expect(el.selectedItem).to.be.null;
      });

      it('should deselect the other items', function() {
        el.value = '2';
        
        expect(el.value).to.equal('2');
        expect(item2.selected).to.be.true;
        expect(el.selectedItem).to.equal(item2);
  
        el.value = '3';
  
        expect(el.value).to.equal('3');
        expect(item2.selected).to.be.false;
        expect(item3.selected).to.be.true;
        expect(el.selectedItem).to.equal(item3);
      });

      it('should selected the first item with the matching value', function() {
        // changes the value so that item2 and item3 share a value
        item3.value = '2';

        el.value = '2';
        
        expect(el.value).to.equal('2');
        expect(item2.selected).to.be.true;
        // should be deselected because item2 was found first
        expect(item3.selected).to.be.false;
      });

      it('should default to empty string when multiple', function() {
        el.multiple = true;
        
        expect(el.value).to.equal('');
      });

      it('should deselect all other items when multiple', function() {
        el.multiple = true;
        el.value = '2';
  
        expect(el.value).to.equal('2');
        expect(item2.selected).to.be.true;
        expect(el.selectedItem).to.equal(item2);
        expect(el.selectedItems).to.deep.equal([item2]);
  
        el.value = '3';
  
        expect(el.value).to.equal('3');
        expect(item2.selected).to.be.false;
        expect(item3.selected).to.be.true;
        expect(el.selectedItem).to.equal(item3);
        expect(el.selectedItems).to.deep.equal([item3]);
      });

      it('should default to empty string on invalid value', function() {
        el.multiple = true;

        // sets an invalid value
        el.value = '10';
        
        // since the value was invalid, it should default to empty string
        expect(el.value).to.equal('');
        expect(el.selectedItem).to.be.null;
        expect(el.selectedItems).to.deep.equal([]);
      });

      it('should put back the placeholder if value is set to empty string', function() {
        // sets the placeholder
        el.placeholder = 'placeholder';

        // sets an empty value
        el.value = '';
        
        // since the value was empty, it should default to placeholder string
        expect(el._elements.label.textContent).to.equal(el.placeholder);
      });

      it('should be empty if placeholder is set and no item is selected', function() {
        const el = helpers.build(window.__html__['Select.placeholder.html']);
        expect(el.selectedItems.length).to.equal(0);
        expect(el._elements.input.value).to.equal('');
        expect(el._elements.taglist.value).to.equal('');
        expect(el.value).to.equal('');
      });
    });

    describe('#values', function() {
      it('should default to [] when there is a placeholder and multiple=false', function() {
        expect(el.placeholder).not.to.equal('');
        expect(el.values).to.deep.equal([]);
      });

      it('should ignore null', function() {
        item2.selected = true;

        expect(el.values).to.deep.equal(['2']);

        el.values = null;
        expect(el.values).to.deep.equal(['2']);

        el.values = undefined;
        expect(el.values).to.deep.equal(['2']);
      });

      it('should get an array with the first item when there is no placeholder and multiple=false', function() {
        // setting the placeholder as empty will cause the first item to be selected
        el.placeholder = '';
        
        expect(el.values).to.deep.equal(['1']);
      });

      it('should get an empty array by default when multiple=true', function() {
        el.multiple = true;
        expect(el.values.length).to.equal(0);
      });

      it('should only set the first value when multiple=false', function() {
        el.values = ['1', '3'];

        expect(el.value).to.equal('1');
        expect(el.values).to.deep.equal(['1']);

        expect(el.selectedItems.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('1');
      });

      it('should be possible to set multiple values if multiple=true', function() {
        el.multiple = true;

        el.values = ['1', '3'];

        expect(el.selectedItems.length).to.equal(2);
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('1');
        expect(el.values[1]).to.equal('3');
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('1');
        expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal('3');
        expect(el._elements.list.selectedItems.length).to.equal(2);
        expect(el._elements.taglist.items.length).to.equal(2);
      });

      it('should deselect all values with empty array and multiple=true', function() {
        el.multiple = true;

        expect(el.values.length).to.equal(0);
        // selects 2 items to check if unselecting works
        el.values = ['2', '3'];

        // we check 2 items were properly selected
        expect(el.selectedItems.length).to.equal(2);
        // it should have 3 items
        expect(el.items.length).to.equal(3);

        // we clear all the items
        el.values = [];

        expect(el.selectedItems.length).to.equal(0);
        expect(el.value).to.equal('');
        expect(el.values.length).to.equal(0);
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(0);
        expect(el._elements.list.selectedItems.length).to.equal(0);
        expect(el._elements.taglist.items.length).to.equal(0);
      });

      it('should return [""] when an item has empty string as its value', function() {
        item1.value = '';
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(el.value).to.equal('');
        expect(el.values).to.deep.equal(['']);
      });

      it('should allow selecting items with value as empty string', function() {
        item2.value = '';

        el.values = [''];

        expect(el.selectedItem).to.equal(item2);
        expect(el.values).to.deep.equal(['']);
      });
    });

    describe('#variant', function() {
      it('should be initially Select.variant.DEFAULT', function() {
        expect(el.variant).to.equal(Select.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Select.variant.DEFAULT);
      });

      it('should set the new variant', function() {
        el.variant = Select.variant.QUIET;

        expect(el.variant).to.equal('quiet');
        expect(el._elements.button.classList.contains('_coral-FieldButton--quiet')).to.be.true;
      });

      it('should set the default variant', function() {
        el.variant = Select.variant.DEFAULT;

        expect(el.variant).to.equal(Select.variant.DEFAULT);
        expect(el._elements.button.classList.contains('_coral-FieldButton--quiet')).to.be.false;
      });
    });

    describe('#name', function() {
      it('should have empty string as default', function() {
        expect(el.name).to.equal('');
        expect(el._elements.input.name).to.equal('');
        expect(el._elements.taglist.name).to.equal('');
      });

      it('should submit nothing when name is not specified even though an item is selected', function() {
        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        // we need to wait a frame because wrap detaches the elements
        item2.selected = true;

        expect(el.selectedItems).to.deep.equal([item2]);
        expect(el._elements.taglist.name).to.equal('');
        expect(el._elements.input.name).to.equal('');

        var values = helpers.serializeArray(form);

        expect(values.length).to.equal(0);
      });

      it('should set the name to the native select', function() {
        el.name = 'select';
        expect(el.name).to.equal('select');
        expect(el._elements.input.name).to.equal('select');
        expect(el._elements.taglist.name).to.equal('');
      });

      it('should submit the one single value', function() {

        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);
        
        el.name = 'select';
        item2.selected = true;

        expect(el.name).to.equal('select');
        expect(el.selectedItems).to.deep.equal([item2]);
        expect(el._elements.input.name).to.equal('select');
        expect(el._elements.taglist.name).to.equal('');

        // the native has the correct value
        expect(el._elements.nativeSelect.value).to.equal(item2.value);

        expect(helpers.serializeArray(form)).to.deep.equal([{
          name: 'select',
          value: '2'
        }]);

        while (el.firstChild) {
          el.parentNode.insertBefore(el.firstChild, el);
        }
      });

      it('should set the input value to the added selected item value', function() {
        var template = document.createElement('template');
        template.innerHTML = '<coral-select id="select"><coral-select-item value="abc" selected></coral-select-item></coral-select>';
        var frag = document.importNode(template.content, true);
        
        helpers.target.appendChild(frag);
  
        var el = document.getElementById('select');
        expect(el._elements.input.value).to.equal('abc');
        expect(el.value).to.equal(el._elements.input.value);
      });

      it('should submit multiple values when multiple', function() {
        // we make sure it is multiple
        el.multiple = true;
  
        // we wrap first the select
        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);
  
        el.name = 'select';
        item2.selected = true;
        item3.selected = true;
  
        expect(el.name).to.equal('select');
        expect(el.selectedItems).to.deep.equal([item2, item3]);
        expect(el._elements.input.name).to.equal('');
        expect(el._elements.taglist.name).to.equal('select');
  
        // the native has the first value
        expect(el._elements.nativeSelect.multiple).to.be.true;
        expect(el._elements.nativeSelect.value).to.equal(item2.value);
  
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
  
        expect(helpers.serializeArray(form)).to.deep.equal([{
          name: 'select',
          value: '2'
        }, {
          name: 'select',
          value: '3'
        }]);
      });
    });

    describe('#required', function() {});

    describe('#invalid', function() {});

    describe('#disabled', function() {});

    describe('#readOnly', function() {});

    describe('#labelledBy', function() {});

    describe('#loading', function() {});

    describe('#items', function() {
      // the select list item used in every test
      var el;
      var item1;
      var item2;
      var item3;

      beforeEach(function() {
        el = helpers.build(new Select());
        item1 = new Select.Item();
        item2 = new Select.Item();
        item3 = new Select.Item();

        item1.content.innerHTML = 'Item 1';
        item1.value = '1';
        item2.content.innerHTML = 'Item 2';
        item2.value = '2';
        item3.content.innerHTML = 'Item 3';
        item3.value = '3';
      });

      it('should not be settable', function() {
        try {
          el.items = null;
        }
        catch(e) {
          expect(el.items).not.to.equal(null, 'items is not settable');
        }
      });

      describe('#add()', function() {
        it('should allow to add a selected item using object notation', function() {

          el.items.add(item1);
          el.items.add(item2);
          el.items.add(item3);

          item2.selected = true;

          expect(el.selectedItem).to.equal(item2);

          var item4 = el.items.add({
            content: {
              innerHTML: 'America'
            },
            disabled: false,
            selected: true
          });

          expect(item4).to.equal(el.selectedItem);

          expect(el.selectedItem.content.innerHTML).to.equal('America');
        });
      });
    });

    describe('#clear()', function() {
      it('should default value "" when placeholder is available', function() {
        expect(el.placeholder).not.to.equal('');
  
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.label.textContent).to.equal(item2.textContent, 'label should be updated to the item');
  
        el.clear();
  
        expect(el.selectedItem).to.equal(null, 'no item should be selected');
        expect(el.value).to.equal('', 'new value should be empty string');
        expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');
      });

      it('should default to the first item when placeholder is not available', function() {
        el.placeholder = '';
  
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.label.textContent).to.equal(item2.textContent, 'label should be updated to the item');
  
        el.clear();
  
        expect(el.selectedItem).to.equal(item1, 'should automatically select the first item');
        expect(el.value).to.equal(item1.value, 'should have the value of the first item');
        expect(el._elements.label.textContent).to.equal(item1.textContent, 'label should match the first item');
      });

      it('should produce value "" when multiple', function() {
        expect(el.placeholder).not.to.equal('');

        el.multiple = true;
  
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');
  
        el.clear();
  
        expect(el.selectedItem).to.equal(null, 'no item should be selected');
        expect(el.value).to.equal('');
        expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');
      });
    });

    describe('#focus()', function() {
      it('should focus the button', function() {
        expect(document.activeElement).not.to.equal(el);
        // we focus the component
        el.focus();
        expect(el.contains(document.activeElement)).to.be.true;
      });

      it('should not shift focus if already inside the component ', function(done) {
        el.on('coral-select:_overlayopen', function() {
          expect(document.activeElement).not.to.equal(el._elements.button);
          // we focus the component
          el.focus();
          expect(document.activeElement).not.to.equal(el._elements.button, 'focus should not be in the button');

          done();
        });

        // opens the overlay
        el._elements.button.click();
      });

      it('should not focus the button if it is disabled', function() {
        expect(document.activeElement).not.to.equal(el);

        el.disabled = true;

        // we wait a frame because disable is applied on a sync()
        
        // we focus the component
        el.focus();
        expect(el.contains(document.activeElement)).to.be.false;
        expect(el).not.to.equal(document.activeElement);
      });
    });
  });

  describe('Markup', function() {
    describe('#variant', function() {
      it('should not set empty variant', function() {
        const el = helpers.build(window.__html__['Select.variant.empty.html']);
        expect(el.variant).to.equal(Select.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Select.variant.DEFAULT);
      });

      it('should not set invalid variant', function() {
        const el = helpers.build(window.__html__['Select.variant.invalid.html']);
        expect(el.variant).to.equal(Select.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Select.variant.DEFAULT);
      });

      it('should remove variant classnames when variant changes', function() {
        const el = helpers.build(window.__html__['Select.variant.quiet.html']);
        expect(el._elements.button.classList.contains('_coral-FieldButton--quiet')).to.be.true;
        
        el.variant = Select.variant.DEFAULT;
        expect(el._elements.button.classList.contains('_coral-FieldButton--quiet')).to.be.false;
      });
    });

    describe('#selectedItem', function() {
      it('should allow selecting items in the DOM', function() {
        const el = helpers.build(window.__html__['Select.selected.html']);
        expect(el.selectedItem.value).to.equal('eu');
        expect(el.selectedItems.length).to.equal(1);
        expect(el.value).to.equal('eu');
        expect(el.values).to.deep.equal(['eu']);
      });

      it('should allow removing the selected item', function() {
        const el = helpers.build(window.__html__['Select.selected.html']);
        // removes 'Africa'
        el.selectedItem.remove();

        // selects 'Africa'
        el.items.getAll()[1].selected = true;

        expect(el.selectedItem.value).to.equal('af');
        expect(el.value).to.equal('af');
        expect(el.values).to.deep.equal(['af']);
      });
    });

    describe('#selectedItems', function() {
      it('should allow selecting items in the DOM', function() {
        const el = helpers.build(window.__html__['Select.multiple.selected.html']);

        expect(el.selectedItem.value).to.equal('af');
        expect(el.selectedItems.length).to.equal(2);
        expect(el.value).to.equal('af');
        expect(el.values).to.deep.equal(['af', 'eu']);
      });

      it('should allow removing the selected item', function(done) {
        const el = helpers.build(window.__html__['Select.multiple.selected.html']);
        // removes 'Africa'
        el.selectedItem.remove();

        // Wait for MO
        helpers.next(function() {
          expect(el.selectedItem.value).to.equal('eu');
          expect(el.value).to.equal('eu');
          expect(el.values).to.deep.equal(['eu']);

          done();
        });
      });
    });

    describe('#multiple', function() {
      it('should default to false', function() {
        const el = helpers.build(window.__html__['Select.base.html']);

        expect(el.multiple).to.be.false;
        expect(el.hasAttribute('multiple')).to.be.false;
      });

      it('should remove the attribute', function() {
        const el = helpers.build(window.__html__['Select.multiple.base.html']);

        expect(el.multiple).to.be.true;
        expect(el.hasAttribute('multiple')).to.be.true;

        el.multiple = false;
        
        expect(el.hasAttribute('multiple')).to.be.false;
      });

      it('should allow multiple selection when true', function() {
        const el = helpers.build(window.__html__['Select.multiple.selected.html']);
        var items = el.items.getAll();

        expect(el.multiple).to.be.true;

        expect(el.selectedItem).to.equal(items[1], 'Should return the first selected item when multiple');
        expect(el.selectedItems).to.deep.equal([items[1], items[3]]);

        expect(el.value).to.equal(items[1].value, 'value matches item2');
        expect(el.values).to.deep.equal([items[1].value, items[3].value]);

        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('af');
        expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal('eu');

        expect(el._elements.list.selectedItems.length).to.equal(2);

        el._elements.list.selectedItems.forEach(function(item) {
          expect(item.selected).to.be.true;
        });

        expect(el._elements.taglist.items.length).to.equal(2, 'tags must have been created for the selected items');
      });
    });

    describe('#placeholder', function() {
      it('should show placeholder when there is no selection', function() {
        const el = helpers.build(window.__html__['Select.placeholder.html']);
        expect(el.selectedItem).to.be.null;
        expect(el._elements.label.textContent).to.equal('Placeholder');
      });

      it('should update the label to the selected item when there is selection', function() {
        const el = helpers.build(window.__html__['Select.placeholder.selected.html']);
        var item = el.items.getAll()[2];
        expect(el.selectedItem).to.equal(item);
        expect(el._elements.label.textContent).to.equal(item.textContent, 'label should match the selected item');
      });

      it('should show the placeholder when there is no selection and multiple=true', function() {
        const el = helpers.build(window.__html__['Select.placeholder.multiple.html']);
        expect(el.selectedItem).to.equal(null, 'no selected item');
        expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');
      });

      it('should show the placeholder when there is selection and multiple=true', function() {
        const el = helpers.build(window.__html__['Select.placeholder.multiple.selected.html']);
        var item = el.items.getAll()[2];
        expect(el.selectedItem).to.equal(item);
        expect(el._elements.label.textContent).to.equal(el.placeholder, 'label should match the placeholder');
      });

      // case 7: !p +  m +  se = 'Select'
      it('should enumerate the selected items in the label if multiple and has a selected item', function() {
        const el = helpers.build(window.__html__['Select.multiple.selected.html']);
        var items = el.items.getAll();

        expect(el.placeholder).to.equal('');
        expect(el.selectedItem).to.equal(items[1]);
        expect(el.selectedItems).to.deep.equal([items[1], items[3]]);

        expect(el._elements.label.textContent).to.equal('Select');
      });
    });

    describe('#value', function() {
      it('should be possible to set the value using markup (in single mode)', function() {
        const el = helpers.build(window.__html__['Select.value.html']);
        expect(el.selectedItems.length).to.equal(1, 'one item should be selected');
        expect(el.values.length).to.equal(1, 'one value should be set');
        expect(el.selectedItems[0].value).to.equal('oc', '"oc" should be the value of the selected item');
        expect(el.values).to.contain('oc', '"oc" should be one value');
        expect(el.value).to.equal('oc', '"oc" should be set as value');
      });

      it('should be possible to set the value using markup (in multi mode)', function() {
        const el = helpers.build(window.__html__['Select.multiple.value.selected.html']);
        // Setting a select.value will force all other selected items to be deselected => only one item is selected
        expect(el.selectedItems.length).to.equal(1, 'one item should be selected');
        expect(el.values.length).to.equal(1, 'one value should be set');
        expect(el.selectedItems[0].value).to.equal('oc', '"oc" should be the value of the selected item');
        expect(el.values).to.contain('oc', '"oc" should be one value');
        expect(el.value).to.equal('oc', '"oc" should be set as value');
      });

      it('should default to value of first item, if no items are selected', function() {
        const el = helpers.build(window.__html__['Select.base.html']);
        expect(el.value).to.equal('am');
      });

      it('should return the value of the selected item', function() {
        const el = helpers.build(window.__html__['Select.base.html']);
        
        var item2 = el.items.getAll()[1];
        expect(item2.value).to.equal('af');

        el.value = 'af';
        
        expect(el.value).to.equal(item2.value);
        expect(el.selectedItem).to.equal(item2);
      });

      it('should default to empty string when multiple', function() {
        const el = helpers.build(window.__html__['Select.multiple.base.html']);
        expect(el.value).to.equal('');
        expect(el.selectedItem).to.be.null;
      });
    });

    describe('#values', function() {
      it('should ignore the values attribute', function() {
        const el = helpers.build(window.__html__['Select.multiple.base.html']);
        expect(el.selectedItem).to.be.null;
        expect(el.selectedItems.length).to.equal(0);
        expect(el.values).to.deep.equal([]);
        expect(el.value).to.equal('');
      });

      it('should be possible to get values set in markup', function() {
        const el = helpers.build(window.__html__['Select.multiple.selected.html']);
        expect(el.selectedItems.length).to.equal(2);
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('af');
        expect(el.values[1]).to.equal('eu');
      });
    });

    // name is tested with the formField
    describe('#name', function() {});

    describe('#required', function() {});

    describe('#invalid', function() {});

    describe('#disabled', function() {});

    describe('#readOnly', function() {});

    describe('#labelledBy', function() {});

    describe('#loading', function() {});

    describe('#items', function() {});

    describe('#reset()', function() {
      it('should reset the select if reset() is called', function() {
        const el = helpers.build(window.__html__['Select.multiple.selected.html']);
        var selectedItems = el.selectedItems;
        var af = selectedItems[0];
        var eu = selectedItems[1];

        expect(el.values.length).to.equal(2, 'two elements should be selected by default');
        expect(el.selectedItems).to.deep.equal([af, eu]);
        expect(el._initialValues.length).to.equal(2, 'two elements should be selected by default (stored internally)');

        el.value = '';
        expect(el.values.length).to.equal(0, 'should have cleared the selection');
        expect(el.selectedItems).to.deep.equal([]);

        el.reset();
        expect(el.values.length).to.equal(2, 'the default elements should be selected again');
        expect(el.selectedItems).to.deep.equal([af, eu]);
      });

      it('should allow removing an initial value', function(done) {
        const el = helpers.build(window.__html__['Select.multiple.selected.html']);
        var selectedItems = el.selectedItems;
        var af = selectedItems[0];
        var eu = selectedItems[1];

        expect(el.values.length).to.equal(2, 'two elements should be selected by default');
        expect(el.selectedItems).to.deep.equal([af, eu]);
        expect(el._initialValues.length).to.equal(2, 'two elements should be selected by default (stored internally)');

        // removes one of the initial values
        af.remove();

        // we need to wait for the MO to detect the element removal
        helpers.next(function() {
          expect(el._initialValues.length).to.equal(1, 'one item should be removed from the initial selection');

          el.value = '';

          el.reset();
          expect(el.values.length).to.equal(1);

          done();
        });
      });
    });
  });

  // @todo: test multiple
  describe('Events', function() {
    // @todo: test these events
    describe('#coral-select:showitems', function() {});

    describe('#coral-select:hideitems', function() {});

    describe('#change', function() {
      it('should not trigger change while setting values programatically', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.base.html']);

        el.on('change', changeSpy);

        expect(changeSpy.callCount).to.equal(0);

        el.items.getAll()[1].selected = true;
        expect(el.value).to.equal('af');

        expect(changeSpy.callCount).to.equal(0);
      });

      it('should not trigger change setting the value', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.base.html']);

        el.on('change', changeSpy);

        expect(changeSpy.callCount).to.equal(0);

        el.value = 'af';

        expect(el.value).to.equal('af');

        expect(changeSpy.callCount).to.equal(0);
      });

      it('should trigger change if the user interacts with the selectlist', function(done) {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.base.html']);
        el.on('change', changeSpy);

        var callback = function() {
          if (!el._useNativeInput) {
            expect(el._elements.overlay.open).to.be.true;
            expect(el._elements.overlay.offsetParent).to.not.equal(null);
          }

          expect(changeSpy.callCount).to.equal(0);

          // selects the 2nd item in the list
          // as change is only triggered on real user interaction, we have to fake the interaction
          if (el._useNativeInput) {
            var dummyOptions = [el._elements.nativeSelect.children[1]];
            dummyOptions.item = function(index) {
              return dummyOptions[index];
            };
            var dummyEvent = {
              stopImmediatePropagation: function() {},
              target: {
                selectedOptions: dummyOptions
              }
            };
            el._onNativeSelectChange(dummyEvent);
          }
          else {
            el._elements.list.items.getAll()[1].click();
          }

          
          expect(el.value).to.equal('af');

          expect(changeSpy.callCount).to.equal(1);
          done();
        };

        if (!el._useNativeInput) {
          // Overlay does not open immediately any longer
          el.on('coral-select:_overlayopen', callback);

          // opens the overlay (forces a change event to be triggered on next select)
          el._elements.button.click();
        }
        else {
          callback();
        }
      });

      it('should not trigger change if the user selects the same item', function(done) {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.base.html']);
        el.on('change', changeSpy);

        var openEventCount = 0;
        el.on('coral-select:_overlayopen', function() {
          if (openEventCount === 0) {
            expect(changeSpy.callCount).to.equal(0);
            // selects the 2nd item in the list
            el._elements.list.items.getAll()[1].click();
            expect(el.value).to.equal('af');
            expect(changeSpy.callCount).to.equal(1);

            // opens the overlay again
            helpers.next(() => {
              el._elements.button.click();
            });
          }
          else if (openEventCount === 1) {
            expect(changeSpy.callCount).to.equal(1, 'selecting an item again must not trigger a change event');
            // selects the 2nd item in the list
            el._elements.list.items.getAll()[1].click();
            // value must be the same
            expect(el.value).to.equal('af');
            // change must not be triggered for the same item
            expect(changeSpy.callCount).to.equal(1);

            done();
          }

          openEventCount++;
        });

        // opens the overlay the first time
        el._elements.button.click();
      });

      it('should not trigger new change while we are updating items in the change callback', function(done) {
        const el = helpers.build(window.__html__['Select.base.html']);
        var changeCallbackCount = 0;
        el.on('change', function() {
          changeCallbackCount++;
          el._elements.list.items.getAll()[2].click();
        });

        el.on('coral-select:_overlayopen', function() {
          // selects the 2nd item in the list
          el._elements.list.items.getAll()[1].click();
          expect(el.value).to.equal('as');
          expect(changeCallbackCount).to.equal(1);

          done();
        });

        // opens the overlay
        el._elements.button.click();
      });

      it('should trigger a change event when a tag is removed', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.multiple.base.html']);
        el.on('change', changeSpy);

        var items = el.items.getAll();

        // selects 2 items
        items[1].selected = true;
        items[3].selected = true;

        // no change event since the selection was done programatically
        expect(changeSpy.callCount).to.equal(0);
        
        // checks that the corresponding tags were created
        expect(el._elements.taglist.values).to.deep.equal(['af', 'eu']);

        // clicks on the close button of the tag
        el._elements.taglist.items.getAll()[0]._elements.button.click();
        
        // change event must be triggered
        expect(changeSpy.callCount).to.equal(1);

        // makes sure the target is correct
        expect(changeSpy.getCall(0).args[0].target).to.equal(el);

        expect(el.selectedItems).to.deep.equal([items[3]]);
        expect(el.value).to.equal('eu');
        expect(el.values).to.deep.equal(['eu']);
      });

      it('should trigger change if the user interacts with the native select', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.base.html']);
        el.on('change', changeSpy);

        var items = el.items.getAll();

        // we fake the native input
        el._useNativeInput = true;
        el.classList.add('_coral-Dropdown--native');
        el.appendChild(el._elements.nativeSelect);

        var options = el._elements.nativeSelect.options;
        options[2].selected = true;

        helpers.event('change', el._elements.nativeSelect);

        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.getCall(0).args[0].target).to.equal(el, 'change event must be reparented');

        expect(el.selectedItem).to.equal(items[2]);
        expect(el.value).to.equal(items[2].value);

        expect(document.activeElement).to.equal(el._elements.button, 'focus should be on the button');
      });

      it('should trigger change if the user interacts with the native select and multiple=true', function() {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.multiple.base.html']);
        el.on('change', changeSpy);

        var items = el.items.getAll();

        // we fake the native input
        el._useNativeInput = true;
        el.classList.add('_coral-Dropdown--native');
        el.appendChild(el._elements.nativeSelect);

        var options = el._elements.nativeSelect.options;

        options[2].selected = true;
        helpers.event('change', el._elements.nativeSelect);

        expect(changeSpy.callCount).to.equal(1);
        expect(changeSpy.getCall(0).args[0].target).to.equal(el);
        expect(changeSpy.getCall(0).args[0].target.values).to.deep.equal([items[2].value]);
        expect(changeSpy.getCall(0).args[0].target.selectedItems).to.deep.equal([items[2]]);

        options[4].selected = true;
        helpers.event('change', el._elements.nativeSelect);

        expect(changeSpy.callCount).to.equal(2);
        expect(changeSpy.getCall(1).args[0].target.values).to.deep.equal([items[2].value, items[4].value]);
        expect(changeSpy.getCall(1).args[0].target.selectedItems).to.deep.equal([items[2], items[4]]);

        options[2].selected = false;
        helpers.event('change', el._elements.nativeSelect);
        expect(changeSpy.callCount).to.equal(3);
        expect(changeSpy.getCall(2).args[0].target.values).to.deep.equal([items[4].value]);
        expect(changeSpy.getCall(2).args[0].target.selectedItems).to.deep.equal([items[4]]);

        expect(document.activeElement).not.to.equal(el._elements.button, 'focus not should be on the button');
      });
    });
  });
  
  describe('User Interaction', function() {
    // @todo: add tests for space key
    // @todo: add tests for key down
    // @todo: add tests for tab key
    // @todo: add tests for global click
    // @todo: add tests for scrolling at the bottom of the list
    
    describe('Removing the selected item', function() {
    
      it('should not cause an error with single selection', function(done) {
        var changeSpy = sinon.spy();
  
        const el = helpers.build(window.__html__['Select.selected.html']);
        el.on('change', changeSpy);

        el.on('coral-select:_overlayopen', function() {
          // we remove the selected item
          el.selectedItem.remove();

          // no change event should have been triggered
          expect(changeSpy.callCount).to.equal(0);

          // Wait for MO
          helpers.next(function() {
            // selects the item on index 1 ("Africa")
            el._elements.list.items.getAll()[1].click();

            expect(el.selectedItem.value).to.equal('af');
            expect(el.selectedItems.length).to.equal(1);
            expect(el.value).to.equal('af');
            expect(el.values).to.deep.equal(['af']);

            expect(changeSpy.callCount).to.equal(1);
            expect(changeSpy.getCall(0).args[0].target.value).to.equal('af');
            expect(changeSpy.getCall(0).args[0].target.values).to.deep.equal(['af']);

            done();
          });
        });

        // opens the list
        el._elements.button.click();
      });
      
      it('should not cause an error with multiple selection', function(done) {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['Select.multiple.selected.html']);
        el.on('change', changeSpy);

        var totalItems = el.items.length;
        var totalSelectedItems = el.selectedItems.length;

        // we remove the selected item ("Africa")
        el.selectedItem.remove();
  
        // no change event should have been triggered
        expect(changeSpy.callCount).to.equal(0);
  
        // Wait for MO
        helpers.next(function() {
          // checks the item was properly removed
          expect(el.items.length).to.equal(totalItems - 1);
          expect(el._elements.nativeSelect.options.length).to.equal(totalItems - 1);
          expect(el._elements.list.items.length).to.equal(totalItems - 1);
          expect(el._elements.taglist.items.length).to.equal(totalSelectedItems - 1);

          // Change event is only triggered if the overlay is opened
          el._elements.overlay.open = true;
          
          // selects the item on index 1 ("Asia")
          el._elements.list.items.getAll()[1].click();

          expect(el.selectedItem.value).to.equal('as', 'selectedItem should match the first item');
          expect(el.selectedItems.length).to.equal(2);

          // values may be inverted because the taglist appends them
          expect(el.value).to.equal('eu');
          expect(el.values).to.deep.equal(['eu', 'as']);

          expect(changeSpy.callCount).to.equal(1);
          expect(changeSpy.getCall(0).args[0].target.value).to.equal('eu');
          expect(changeSpy.getCall(0).args[0].target.values).to.deep.equal(['eu', 'as']);
    
          done();
        });
      });
    });

    describe('Placeholder', function() {
      it('should be updated when an item is clicked', function(done) {
        const el = helpers.build(window.__html__['Select.placeholder.html']);
        // all the available items
        var items = el.items.getAll();

        // we handle the event instead of assuming that it opens the next frame
        el.on('coral-select:_overlayopen', function() {
          // selects the item on index 1
          el._elements.list.items.getAll()[1].click();
          expect(el.selectedItem).to.equal(items[1]);
          
          expect(el._elements.label.innerHTML).to.equal(items[1].content.innerHTML);

          done()
        });

        // opens the list
        el._elements.button.click();
      });

      it('should allow removing the selected item', function(done) {
        const el = helpers.build(window.__html__['Select.placeholder.html']);
        // all the available items
        var items = el.items.getAll();
        var itemCount = items.length;
        
        el.on('coral-select:_overlayopen', function() {
          // selects the item on index 1, this will cause the overlay to close
          el._elements.list.items.getAll()[1].click();
  
          expect(el.selectedItem).to.equal(items[1]);
  
          expect(el._elements.label.innerHTML).to.equal(items[1].content.innerHTML);
  
          // we remove the selected item
          items[1].remove();
  
          expect(el.selectedItem).to.be.null;
          // we have one item less in the collection
          expect(el.items.length).to.equal(itemCount - 1);
  
          // Wait for MO
          helpers.next(function() {
            // there is now one item less in the selectlist
            expect(el._elements.list.items.length).to.equal(itemCount - 1);
            // it should show now the placeholder
            expect(el._elements.label.textContent).to.equal('Placeholder');
            // selects the item on index 1
            el._elements.list.items.getAll()[1].click();
            // selected item should match selectedItem
            helpers.next(() => {
              expect(el.selectedItem).to.equal(items[2]);
              done();
            });
          });
        });

        // opens the list
        el._elements.button.click();
      });

      it('should update the placeholder when the content of the selectedItem changes', function(done) {
        const el = helpers.build(window.__html__['Select.selected.html']);
        expect(el._elements.label.textContent).to.equal('Europe');
        
        el.selectedItem.content.textContent = 'New Content';

        // we wait for the MO to trigger
        helpers.next(function() {
          expect(el._elements.label.textContent).to.equal('New Content');

          done();
        });
      });
    });

    describe('Accessibility', function() {
      it('button should communicate expanded state', function(done) {
        const el = helpers.build(window.__html__['Select.base.html']);
        el.on('coral-select:_overlayopen', function() {
          // selects the 2nd item in the list
          expect(el._elements.button.getAttribute('aria-expanded')).to.equal('true');

          // closes the overlay
           el._elements.button.click();
        });
        
        el.on('coral-select:_overlayclose', function() {
          expect(el._elements.button.getAttribute('aria-expanded')).to.equal('false');
          
          done();
        });
  
        // opens the overlay
        el._elements.button.click();
      });
    });

    it('should remove selected items using the taglist when multiple=true', function() {
      const el = helpers.build(window.__html__['Select.multiple.selected.html']);
      expect(el.multiple).to.equal(true);
      // number of currently selected items
      var selectedItemCount = el.selectedItems.length;
      // we get all the selected tags
      var tags = el._elements.taglist.items.getAll();
      // we remove the a tag through interaction, which causes the taglist to trigger a change event
      tags[0]._elements.button.click();
      
      expect(el.selectedItems.length).to.equal(selectedItemCount - 1);
    });

    it('should focus the button when an item is selected', function(done) {
      const el = helpers.build(window.__html__['Select.placeholder.html']);
      el.on('coral-select:_overlayopen', function() {
        // selects the 2nd item in the list
        el._elements.list.items.getAll()[1].click();
      });
      
      el.on('coral-select:_overlayclose', function() {
        expect(document.activeElement).to.equal(el._elements.button);
        
        done();
      });

      // opens the overlay
      el._elements.button.click();
    });

    it('should focus the button when the selected item is clicked again', function(done) {
      const el = helpers.build(window.__html__['Select.placeholder.html']);
      el.on('coral-select:_overlayopen', function() {
        var selectListItems = el._elements.list.items.getAll();

        expect(selectListItems[2].selected).to.be.true;
        selectListItems[2].click();
      });
      
      el.on('coral-select:_overlayclose', function() {
        expect(document.activeElement).to.equal(el._elements.button);
  
        done();
      });

      // we select first an item
      el.items.getAll()[2].selected = true;

      // opens the overlay
      el._elements.button.click();
    });

    it('should focus the button when it is toggled', function(done) {
      const el = helpers.build(window.__html__['Select.placeholder.html']);
      el.on('coral-select:_overlayopen', function() {
        // we click the button again to toggle the overlay
        el._elements.button.click();
      });
      
      el.on('coral-select:_overlayclose', function() {
        expect(document.activeElement).to.equal(el._elements.button);
  
        done();
      });

      // opens the overlay
      el._elements.button.click();
    });

    // this behavior matches the native select
    it('should focus the button when the overlay is open and the user clicks outside', function(done) {
      const el = helpers.build(window.__html__['Select.placeholder.html']);
      el.on('coral-select:_overlayopen', function() {
        // we simulate a click somewhere else in the page
        document.body.click();
      });
      
      el.on('coral-select:_overlayclose', function() {
        expect(document.activeElement).to.equal(el._elements.button);
  
        done();
      });

      // opens the overlay
      el._elements.button.click();
    });

    it('should focus the button when user interacts with the native select', function(done) {
      const el = helpers.build(window.__html__['Select.base.html']);
      // we fake the native input
      el._useNativeInput = true;
      el.classList.add('_coral-Dropdown--native');
      el.appendChild(el._elements.nativeSelect);

      var options = el._elements.nativeSelect.options;
      options[2].selected = true;

      helpers.event('change', el._elements.nativeSelect);

      // Wait next frame for button to be focused
      helpers.next(function() {
        expect(document.activeElement).to.equal(el._elements.button, 'focus should be on the button');

        done();
      });
    });
  
    it('should keep the overlay open if multiple=true and an item is selected', function(done) {
      const el = helpers.build(window.__html__['Select.placeholder.multiple.html']);
      
      el.on('coral-select:_overlayopen', function() {
        // selects the 2nd item in the list
        el._elements.list.items.getAll()[1].click();
        
        expect(el._elements.overlay.open).to.be.true;
        
        done();
      });
    
      // opens the overlay
      el._elements.button.click();
    });

    it('should close the overlay using esc key', function(done) {
      const el = helpers.build(window.__html__['Select.base.html']);
      el.on('coral-select:_overlayopen', function() {
        // pressing escape should close the overlay
        helpers.keypress('esc', helpers.target);
      });

      el.on('coral-select:_overlayclose', function() {
        expect(el._elements.overlay.open).to.equal(false, 'overlay should be closed');
        expect(document.activeElement).to.equal(el._elements.button, 'focus should return to the button');

        done();
      });

      // opens the overlay
      el._elements.button.click();
    });
  });

  // @todo: add tests for overlay position
  // @todo: add tests for internal events not bubbling (taglist, select, selectlist)
  describe('Implementation Details', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function(done) {
      el = helpers.build(new Select());
      item1 = new Select.Item();
      item2 = new Select.Item();
      item3 = new Select.Item();

      item1.content.innerHTML = 'Item 1';
      item1.value = '1';
      item2.content.innerHTML = 'Item 2';
      item2.value = '2';
      item3.content.innerHTML = 'Item 3';
      item3.value = '3';

      // adds the item to the select
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);
      
      // Wait for MO
      helpers.next(function() {
        done();
      });
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    it('should set value of the internal items', function() {
      // all items should initialize the selectListItem and nativeOption
      expect(item1._selectListItem.value).to.equal(item1.value);
      expect(item2._selectListItem.value).to.equal(item2.value);
      expect(item3._selectListItem.value).to.equal(item3.value);
      expect(item1._nativeOption.value).to.equal(item1.value);
      expect(item2._nativeOption.value).to.equal(item2.value);
      expect(item3._nativeOption.value).to.equal(item3.value);
    });

    it('should change value of the internal items', function() {
      item1.value = '4';

      expect(item1._selectListItem.value).to.equal(item1.value);
      expect(item1._nativeOption.value).to.equal(item1.value);
    });

    it('should change value of the internal items and multiple=true', function() {
      // we switch to multiple because it includes tags
      el.multiple = true;

      item1.selected = true;

      expect(el.multiple).to.be.true;
      expect(el.selectedItem).to.equal(item1);

      expect(item1._selectListItem.value).to.equal('1');
      expect(item1._nativeOption.value).to.equal('1');
      expect(item1._tag.value).to.equal('1');

      item1.value = '4';

      expect(item1._selectListItem.value).to.equal('4', 'select list item should be updated');
      expect(item1._nativeOption.value).to.equal('4', 'navive option should be updated');
      expect(item1._tag.value).to.equal('4', 'tag value should be updated');
    });

    it('should change content of the internal items', function(done) {
      item1.content.textContent = 'America';

      // waits for the MO to kick in
      helpers.next(function() {
        expect(item1._selectListItem.content.textContent).to.equal(item1.content.textContent);
        expect(item1._nativeOption.textContent).to.equal(item1.content.textContent);

        done();
      });
    });

    it('should change content of the internal items and multiple=true', function(done) {
      el.multiple = true;

      item1.selected = true;

      expect(el.multiple).to.be.true;
      expect(el.selectedItem).to.equal(item1);

      item1.content.textContent = 'America';

      // waits for the MO to kick in
      helpers.next(function() {
        expect(item1._selectListItem.content.textContent).to.equal(item1.content.textContent);
        expect(item1._nativeOption.textContent).to.equal(item1.content.textContent);
        expect(item1._tag.label.textContent).to.equal(item1.content.textContent);

        done();
      });
    });

    it('should change disabled of the internal items', function() {
      expect(item1.disabled).to.be.false;

      item1.disabled = true;

      expect(item1.disabled).to.be.true;
      expect(item1._selectListItem.disabled).to.equal(item1.disabled);
      expect(item1._nativeOption.disabled).to.equal(item1.disabled);
    });

    describe('arrayDiff', function() {
      // this is copied from Select.js since it is private
      var arrayDiff = function(a, b) {
        return a.filter(function(item) {
          return !b.some(function(item2) {
              return item === item2;
            });
        });
      };

      it('should calculate the different between 2 arrays', function() {
        expect(arrayDiff([item1, item2], [item2])).to.deep.equal([item1]);
        expect(arrayDiff([item1, item2], [])).to.deep.equal([item1, item2]);
        expect(arrayDiff([], [item1, item2, item3])).to.deep.equal([]);
        expect(arrayDiff([item1, item2, item3], [item1, item2, item3])).to.deep.equal([]);
        expect(arrayDiff([item1, item2], [item2, item1])).to.deep.equal([], 'order should not matter');
      });
    });
  
    describe('Smart Overlay', () => {
      helpers.testSmartOverlay('coral-select');
    });
  });

  describe('Implementation Details (compliance)', function() {
    describe('#formField (single select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Select.value.html'], {
        value: 'as',
        default: 'am'
      });
    });

    describe('#formField (multi select)', function() {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Select.multiple.value.html'], {
        value: 'as',
        default: ''
      });
    });
  });
  
  describe('Tracking', function() {
    var trackerFnSpy;
    
    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });
    
    it('should call the tracker callback fn with expected parameters when the simple select changes it\'s value that has a trackingElement attribute', function() {
      const el = helpers.build(window.__html__['Select.tracking.single.html']);
      el.click();
      
      el._elements.list.items.first().click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'First element name');
      expect(trackData).to.have.property('targetType', 'coral-select-item');
      expect(trackData).to.have.property('eventType', 'change');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-select');
      expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Select);
    });
    
    it('should call the tracker callback fn with expected parameters when the simple select changes it\'s value that doesn\'t have a trackingElement attribute', function() {
      const el = helpers.build(window.__html__['Select.tracking.single.html']);
      el.click();
      
      el._elements.list.items.getAll()[1].click();
      
      expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'Second');
      expect(trackData).to.have.property('targetType', 'coral-select-item');
      expect(trackData).to.have.property('eventType', 'change');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-select');
      expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Select);
    });
    
    it('should call the tracker callback fn with expected parameters when the multiple select changes it\'s value that doesn\'t have a trackingElement attribute', function() {
      const el = helpers.build(window.__html__['Select.tracking.multiple.html']);
      el.click();
  
      el._elements.list.items.first().click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'First element name');
      expect(trackData).to.have.property('targetType', 'coral-select-item');
      expect(trackData).to.have.property('eventType', 'select');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-select');
      expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Select);
    });
    
    it.skip('should call the tracker callback fn with expected parameters when the multiple select adds a new tag and then removes it', function() {
      const el = helpers.build(window.__html__['Select.tracking.multiple.html']);
      el.click();
  
      const listItem = el._elements.list.items.first().click();
      listItem.click();
      
      var tagItemCloseBtn = el.querySelector('coral-taglist coral-tag button[coral-close]');
      tagItemCloseBtn.click();
      
      expect(trackerFnSpy.callCount).to.equal(2, 'Tracker should have been called twice.');
      var spyCall = trackerFnSpy.getCall(1);
      expect(spyCall.args.length).to.equal(4);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'First element name');
      expect(trackData).to.have.property('targetType', 'coral-select-item');
      expect(trackData).to.have.property('eventType', 'deselect');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-select');
      expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Select);
    });
  });
});
