describe.skip('Coral.Select', function() {
  // @todo: test reordeing the options
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Select');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Select.variant).to.exist;
      expect(Coral.Select.variant.DEFAULT).to.equal('default');
      expect(Coral.Select.variant.QUIET).to.equal('quiet');
      expect(Object.keys(Coral.Select.variant).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    function testDefaultInstance(select) {
      expect(select.$).to.have.class('coral3-Select');
    }

    it('should be possible using new', function() {
      var select = new Coral.Select();
      testDefaultInstance(select);
    });

    it('should be possible using createElement', function() {
      var select = document.createElement('coral-select');
      testDefaultInstance(select);
    });

    it('should be possible using markup', function(done) {
      helpers.build('<coral-select></coral-select>', function(select) {
        testDefaultInstance(select);
        done();
      });
    });

    it('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(select) {
        helpers.testComponentClone(select, done);
      });
    });

    it('should be possible to clone using markup with framework data', function(done) {
      helpers.build(window.__html__['Coral.Select.mustache.html'], function(select) {
        helpers.testComponentClone(select, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var select = new Coral.Select();
      helpers.target.appendChild(select);

      helpers.next(function() {
        helpers.testComponentClone(select, done);
      });
    });
  });

  describe('API', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function() {
      el = new Coral.Select();
      item1 = new Coral.Select.Item();
      item2 = new Coral.Select.Item();
      item3 = new Coral.Select.Item();

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

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    // @todo: update if selected item is removed from the DOM
    // @todo: test that selectedItems are hidden in the SelectList
    describe('#selectedItem', function() {
      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });

      it('should update to the selected value', function() {
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.nativeSelect.value).to.equal(item2.value);

        item3.selected = true;
        expect(el.selectedItem).to.equal(item3);
        expect(el._elements.nativeSelect.value).to.equal(item3.value);
      });

      it('should be null if the selected is removed', function() {
        item2.selected = true;
        expect(el.selectedItem).to.equal(item2);
        expect(el._elements.nativeSelect.value).to.equal(item2.value);

        item2.remove();

        expect(el.selectedItem).to.be.null;
      });
    });

    describe('#selectedItems', function() {});

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
        expect(el._elements.taglist.items.getAll().length).to.equal(0);
      });

      it('should to allow multiple selection when true', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        helpers.target.appendChild(el);

        item2.selected = true;
        item3.selected = true;

        helpers.next(function() {
          // wait one frame for FF
          helpers.next(function() {
            expect(el.selectedItem).to.equal(item2);
            expect(el.selectedItems).to.deep.equal([item2, item3]);

            expect(el.value).to.equal('2','Value not matching selectedItem');
            expect(el.values).to.deep.equal(['2', '3']);

            // we check the internals to make sure the selection is correct
            expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
            expect(el._elements.list.selectedItems.length).to.equal(2);
            expect(el._elements.taglist.items.getAll().length).to.equal(2);
            done();
          });
        });
      });

      it('should not have tags and multiple selected options when multiple is switched to single', function(done) {
        el.remove();

        el.multiple = true;

        helpers.target.appendChild(el);

        item2.selected = true;
        item3.selected = true;

        helpers.next(function() {

          expect(el.selectedItem).to.equal(item2);
          expect(el.selectedItems).to.deep.equal([item2, item3]);

          expect(el.value).to.equal('2', 'there should be the value two');
          expect(el.values).to.deep.equal(['2', '3'], 'there should be the array with value two and three');

          // we check the internals to make sure the selection is correct
          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2, 'there should be two selected options');
          expect(el._elements.list.selectedItems.length).to.equal(2, 'there should be two selected items');
          expect(el._elements.taglist.items.getAll().length).to.equal(2, 'there should be two taglist items');

          helpers.next(function() {

            el.multiple = false;

            helpers.next(function() {
              // we check the internals to make sure the selection is correct

              expect(el.selectedItem).to.equal(item2);
              expect(el.selectedItems).to.deep.equal([item2]);

              expect(el.value).to.equal('2', 'there should be the value two');
              expect(el.values).to.deep.equal(['2'], 'there should be the array with value two');

              expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
              expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
              expect(el._elements.taglist.items.getAll().length).to.equal(0, 'there should be zero taglist items');
              done();
            });
          });
        });
      });

      it('should have tags when switched from single to multiple', function(done) {
        el.remove();
        el.multiple = false;

        helpers.target.appendChild(el);

        item2.selected = true;

        helpers.next(function() {

          expect(el.selectedItem).to.equal(item2);
          expect(el.selectedItems).to.deep.equal([item2]);

          expect(el.value).to.equal('2', 'there should be the value two');
          expect(el.values).to.deep.equal(['2'], 'there should be the array with value two');

          // we check the internals to make sure the selection is correct
          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
          expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
          expect(el._elements.taglist.items.getAll().length).to.equal(0, 'there should be zero taglist items');

          helpers.next(function() {

            el.multiple = true;

            expect(el.selectedItem).to.equal(item2);
            expect(el.selectedItems).to.deep.equal([item2]);

            expect(el.value).to.equal('2', 'there should be the value two');
            expect(el.values).to.deep.equal(['2'], 'there should be the array with value two');

            // we check the internals to make sure the selection is correct
            expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1, 'there should be one selected option');
            expect(el._elements.list.selectedItems.length).to.equal(1, 'there should be one selected item');
            expect(el._elements.taglist.items.getAll().length).to.equal(1, 'there should be one taglist items');
            done();
          });
        });
      });

      it('should allow inserting new items', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        helpers.target.appendChild(el);

        var item4 = el.items.add({
          content: {
            textContent: 'Item 4'
          },
          value: '4',
          selected: true
        });

        helpers.next(function() {
          expect(el.selectedItem).to.equal(item4);
          expect(el.selectedItems).to.deep.equal([item4]);

          expect(item4._elements.selectListItem.hidden).to.be.true;
          expect(el._elements.taglist.items.getAll().length).to.equal(1);
          done();
        });
      });
    });

    describe('#placeholder', function() {
      // case 3: !p + !m +  se = se
      it('should default to empty string', function(done) {
        expect(el.placeholder).to.equal('');

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
          done();
        });
      });

      // case 3: !p + !m +  se = se
      it('should correctly change to selected item after changing from multiple to single ', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        helpers.target.appendChild(el);

        expect(el.placeholder).to.equal('');

        // selects an item
        item2.selected = true;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(item2);
          // should update to the default placeholder for multiple
          expect(el._elements.label.textContent).to.equal('Select');

          // we switch back to single
          el.multiple = false;

          helpers.next(function() {
            // should show the first item since there is no placeholder
            expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
            done();
          });
        });
      });

      // case 4: !p + !m + !se = firstSelectable, but with no selectable option
      it('should default to empty string if empty', function(done) {
        // we remove all the items for the text
        el.items.clear();

        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          expect(el._elements.label.innerHTML).to.equal('');
          done();
        });
      });

      // case 4: !p + !m + !se = firstSelectable
      it('should default to firstSelectable', function(done) {
        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);
          done();
        });
      });

      // case 4: !p + !m + !se = firstSelectable
      // should correctly sync the value when switching
      it('should correctly switch the first selectable', function(done) {
        el.multiple = true;
        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          // should update to the default placeholder for multiple
          expect(el._elements.label.textContent).to.equal('Select');

          // we switch back to single
          el.multiple = false;

          helpers.next(function() {
            // should show the first item since there is no placeholder
            expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);
            done();
          });
        });
      });

      // case 8: !p +  m + !se = 'Select'
      it('should to "Select" if multiple', function(done) {
        el.multiple = true;
        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          expect(el.placeholder).to.equal('');
          expect(el._elements.label.textContent).to.equal('Select');
          done();
        });
      });

      // case 8: !p +  m + !se = 'Select'
      // should correctly sync the value
      it('should switch to default placeholder when switched from single to multiple', function(done) {
        // starts as single
        el.multiple = false;
        // with no placeholder
        expect(el.placeholder).to.equal('');

        helpers.next(function() {
          // should show the first item since there is no placeholder
          expect(el._elements.label.innerHTML).to.equal(item1.content.innerHTML);

          // activates the multiple
          el.multiple = true;

          helpers.next(function() {
            // should update to the default placeholder for multiple
            expect(el._elements.label.textContent).to.equal('Select');
            done();
          });
        });
      });

      // case 7: !p +  m +  se = 'Select'
      it('should to "Select" if multiple', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        helpers.target.appendChild(el);

        expect(el.placeholder).to.equal('');

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('');
          expect(el._elements.label.textContent).to.equal('Select');
          expect(el.selectedItems).to.deep.equal([item2]);
          done();
        });
      });

      // case 7: !p +  m +  se = 'Select'
      it('should correctly change to selected item after changing from multiple to single ', function(done) {
        // we start as single
        el.multiple = false;
        // with no placeholder
        expect(el.placeholder).to.equal('');

        // selects an item
        item2.selected = true;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(item2);
          // should show the first item since there is no placeholder
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);

          // we change to multiple to see if the label is correctly updated
          el.multiple = true;

          helpers.next(function() {
            // should show the default placeholder since we are multiple
            expect(el._elements.label.textContent).to.equal('Select');

            done();
          });
        });
      });

      // case 5:  p + !m +  se = se
      it('should be "Select" if multiple and has a selectedItem', function(done) {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
          expect(el.selectedItems).to.deep.equal([item2]);
          done();
        });
      });

      // case 6:  p + !m + !se = p
      it('should be "Select" if multiple and no selectedItem', function(done) {
        el.placeholder = 'Choose an item';

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal('Choose an item');
          expect(el.selectedItems).to.deep.equal([]);
          done();
        });
      });

      // case 1:  p +  m +  se = p
      it('should show the placeholder with multiple and selectedItem(s)', function(done) {
        el.placeholder = 'Choose an item';
        el.multiple = true;

        item1.selected = true;
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal('Choose an item');
          expect(el.selectedItems).to.deep.equal([item1, item2]);
          done();
        });
      });

      // case 2:  p +  m + !se = p
      it('should show the placeholder with multiple and no selectedItem(s)', function(done) {
        el.placeholder = 'Choose an item';

        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        helpers.target.appendChild(el);

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal('Choose an item');
          expect(el.selectedItems).to.deep.equal([]);
          done();
        });
      });

      it('should go back to the placeholder once the selected is removed', function(done) {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
          expect(el.selectedItems).to.deep.equal([item2]);

          // we remove the selection from the current item
          item2.removeAttribute('selected');

          expect(el.selectedItem).to.be.null;

          // we need to wait one more frame
          helpers.next(function() {
            expect(el._elements.label.innerHTML).to.equal('Choose an item');
            done();
          });
        });
      });

      it('should go back to the placeholder once the selected is removed', function(done) {
        el.placeholder = 'Choose an item';

        // selects the second item
        item2.selected = true;

        helpers.next(function() {
          expect(el.placeholder).to.equal('Choose an item');
          expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);
          expect(el.selectedItems).to.deep.equal([item2]);

          // we remove the selection from the current item
          item2.remove();

          expect(el.selectedItem).to.be.null;

          // @todo: why do we need 2 next?
          helpers.next(function() {
            helpers.next(function() {
              expect(el._elements.label.innerHTML).to.equal('Choose an item');
              done();
            });
          });
        });
      });
    });

    describe('#value', function() {

      it('empty select should default to empty string', function() {
        el.items.clear();
        expect(el.value).to.equal('');
      });

      it('should default to the first item', function(done) {
        helpers.next(function() {
          // we need to wait a frame since polyfilled environments will take longer to initalize
          expect(el.value).to.equal(item1.value);
          // value is not reflected
          expect(el.$).not.to.have.attr('value');
          expect(el._elements.nativeSelect.value).to.equal(item1.value);
          done();
        });
      });

      it('should allow to set the value', function() {
        el.value = '2';
        expect(item2.selected).to.be.true;
        expect(el.selectedItem).to.equal(item2);
      });

      it('should allow to set the value even if the select is not attached to dom so far', function(done) {
        var myEl = new Coral.Select();
        var myItem1 = new Coral.Select.Item();
        var myItem2 = new Coral.Select.Item();

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

        helpers.target.appendChild(myEl);

        helpers.next(function() {
          expect(myItem2.selected).to.be.true; // Here chrome failed!
          expect(myEl.selectedItem).to.equal(myItem2);
          done();
        });

      });


      it('should be updated if we select a value', function() {

        item3.selected = true;

        expect(el.selectedItem).to.equal(item3);
        expect(el.value).to.equal(item3.value);
      });

      // @todo: this is inconsistent between firefox and chrome, should we stop using an underlying select?
      it.skip('should accept empty string', function(done) {
        el.value = '';

        helpers.next(function() {
          expect(el.value).to.equal('');
          expect(el.selectedItem).to.be.null;

          done();
        });
      });

      // @todo: this is inconsistent between firefox and chrome, should we stop using an underlying select?
      it.skip('should ignore invalid values', function(done) {
        el.value = '5';

        helpers.next(function() {
          expect(el.value).to.equal('');
          expect(el.selectedItem).to.be.null;

          done();
        });
      });

      it('should deselect the other items', function(done) {
        el.value = '2';

        helpers.next(function() {

          expect(el.value).to.equal('2');
          expect(item2.selected).to.be.true;
          expect(el.selectedItem).to.equal(item2);

          el.value = '3';

          helpers.next(function() {

            expect(el.value).to.equal('3');
            expect(item2.selected).to.be.false;
            expect(item3.selected).to.be.true;
            expect(el.selectedItem).to.equal(item3);

            done();
          });
        });
      });

      it('should selected the first item with the matching value', function(done) {
        // changes the value so that item2 and item3 share a value
        item3.value = '2';

        el.value = '2';

        helpers.next(function() {

          expect(el.value).to.equal('2');
          expect(item2.selected).to.be.true;
          // should be deselected because item2 was found first
          expect(item3.selected).to.be.false;

          done();
        });
      });

      it('should default to empty string when multiple', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;
        // we add it again
        helpers.target.appendChild(el);

        helpers.next(function() {
          expect(el.value).to.equal('');
          done();
        });
      });

      it('should deselect all other items when multiple', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;
        // we add it again
        helpers.target.appendChild(el);

        el.value = '2';

        helpers.next(function() {

          expect(el.value).to.equal('2');
          expect(item2.selected).to.be.true;
          expect(el.selectedItem).to.equal(item2);
          expect(el.selectedItems).to.deep.equal([item2]);

          el.value = '3';

          helpers.next(function() {

            expect(el.value).to.equal('3');
            expect(item2.selected).to.be.false;
            expect(item3.selected).to.be.true;
            expect(el.selectedItem).to.equal(item3);
            expect(el.selectedItems).to.deep.equal([item3]);

            done();
          });
        });
      });

      it('should default to empty string on invalid value', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;
        // we add it again
        helpers.target.appendChild(el);

        // sets an invalid value
        el.value = '10';

        helpers.next(function() {
          // since the value was invalid, it should default to empty string
          expect(el.value).to.equal('');
          expect(el.selectedItem).to.be.null;
          expect(el.selectedItems).to.deep.equal([]);

          done();
        });
      });

      it('should put back the placeholder if value is set to empty string', function(done) {
        // sets the placeholder
        el.placeholder = 'placeholder';

        // sets an empty value
        el.value = '';

        helpers.next(function() {
          // since the value was empty, it should default to placeholder string
          expect(el._elements.label.textContent).to.equal(el.placeholder);

          done();
        });
      });

      it('should be empty if placeholder is set and no item is selected', function(done) {
        helpers.build(window.__html__['Coral.Select.placeholder.html'], function(el) {
          expect(el.selectedItems.length).to.equal(0);
          expect(el._elements.nativeSelect.value).to.equal('');
          expect(el.value).to.equal('');

          done();
        });
      });
    });

    describe('#values', function() {

      it('should get an array with the first item when multiple=false', function(done) {
        helpers.next(function() {
          expect(el.values).to.deep.equal(['1']);
          done();
        });
      });

      it('should get an empty array by default when multiple=true', function() {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        // we add it again
        helpers.target.appendChild(el);

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
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        // we add it again
        helpers.target.appendChild(el);

        el.values = ['1', '3'];

        expect(el.selectedItems.length).to.equal(2);
        expect(el.values.length).to.equal(2);
        expect(el.values[0]).to.equal('1');
        expect(el.values[1]).to.equal('3');
        expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
        expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('1');
        expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal('3');
        expect(el._elements.list.selectedItems.length).to.equal(2);
      });

      it('should deselect all values with empty array and multiple=true', function(done) {
        // @todo: we need to remove it and add it again due to the behavior of the native select. Ideally thi should be
        // handled internally
        el.remove();

        el.multiple = true;

        // we add it again
        helpers.target.appendChild(el);

        // selects 2 items to check if unselecting works
        el.values = ['2', '3'];

        // we need to wait a frame in polyfilled environments
        helpers.next(function() {
          // we check 2 items were properly selected
          expect(el.selectedItems.length).to.equal(2);
          // it should have 3 items
          expect(el.items.length).to.equal(3);

          el.values = [];

          // we need to wait a frame in polyfilled environments
          helpers.next(function() {
            expect(el.selectedItems.length).to.equal(0);

            expect(el.values.length).to.equal(0);
            expect(el._elements.nativeSelect.selectedOptions.length).to.equal(0);
            expect(el._elements.list.selectedItems.length).to.equal(0);

            done();
          });
        });
      });

      it('should put back the placeholder if values is set to empty array', function(done) {
        // sets the placeholder
        el.placeholder = 'placeholder';

        // sets an empty value
        el.values = [];

        helpers.next(function() {
          // since the value was empty, it should default to placeholder string
          expect(el._elements.label.textContent).to.equal(el.placeholder);

          done();
        });
      });
    });

    describe('#variant', function() {
      it('should be initially Coral.Select.variant.DEFAULT', function() {
        expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);
        expect(el.$).not.to.have.attr('variant');
        expect(el._elements.button.variant).to.equal('secondary');
      });

      it('should set the new variant', function(done) {
        el.variant = Coral.Select.variant.QUIET;

        expect(el.variant).to.equal('quiet');
        expect(el._elements.button.variant).to.equal('quiet');

        helpers.next(function() {
          expect(el.$).to.have.class('coral3-Select--quiet');
          expect(el.$).to.have.class('coral3-Select');
          done();
        });
      });

      it('should not add class for invalid variant', function(done) {
          el.variant = 'invalidvariant';

          expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);

          helpers.next(function () {
            expect(el.$).not.to.have.class('coral3-Select--invalidvariant');
            expect(el.$).to.have.class('coral3-Select');
            done();
          });
      });
    });

    describe('#name', function() {

      it('should have empty string as default', function() {
        expect(el.name).to.equal('');
        expect(el._elements.nativeSelect.name).to.equal('');
      });

      it('should submit nothing when name is not specified even though an item is selected', function(done) {

        // we wrap first the select
        el.$.wrap('<form>');

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {
          item2.selected = true;

          expect(el.selectedItems).to.deep.equal([item2]);
          expect(el._elements.nativeSelect.name).to.equal('');
          expect(el._elements.taglist.name).to.equal('');

          var values = el.$.parent().serializeArray();

          expect(values.length).to.equal(0);
          done();
        });
      });

      it('should set the name to the native select', function() {
        el.name = 'select';
        expect(el.name).to.equal('select');
        expect(el._elements.input.name).to.equal('select');
        expect(el._elements.taglist.name).to.equal('');
      });

      it('should submit the one single value', function(done) {

        // we wrap first the select
        el.$.wrap('<form>');

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {
          el.name = 'select';
          item2.selected = true;

          expect(el.name).to.equal('select');
          expect(el.selectedItems).to.deep.equal([item2]);
          expect(el._elements.input.name).to.equal('select');
          expect(el._elements.taglist.name).to.equal('');

          // the native has the correct value
          expect(el._elements.nativeSelect.value).to.equal(item2.value);

          expect(el.$.parent().serializeArray()).to.deep.equal([{
            name: 'select',
            value: '2'
          }]);

          el.$.unwrap();

          done();
        });
      });

      it('should set the input value to the added selected item value', function(done) {
        var template = document.createElement('template');
        template.innerHTML = '<coral-select id="select"><coral-select-item value="abc" selected></coral-select-item></coral-select>';
        var frag = document.importNode(template.content, true);

        helpers.next(function() {
          helpers.target.appendChild(frag);
          helpers.next(function() {
            var el = document.getElementById('select');
            expect(el._elements.input.value).to.equal('abc');
            expect(el.value).to.equal(el._elements.input.value);
            done();
          });
        });
      });

      it('should submit multiple values when multiple', function(done) {
        // we make sure it is multiple
        el.multiple = true;

        // we wrap first the select
        el.$.wrap('<form>');

        // we need to wait a frame because wrap detaches the elements
        helpers.next(function() {

          el.name = 'select';
          item2.selected = true;
          item3.selected = true;

          expect(el.name).to.equal('select');
          expect(el.selectedItems).to.deep.equal([item2, item3]);
          expect(el._elements.input.name).to.equal('');
          expect(el._elements.taglist.name).to.equal('select');

          helpers.next(function() {
            // the native has the first value
            expect(el._elements.nativeSelect.multiple).to.be.true;
            expect(el._elements.nativeSelect.value).to.equal(item2.value);

            expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);

            expect(el.$.parent().serializeArray()).to.deep.equal([{
              name: 'select',
              value: '2'
            }, {
              name: 'select',
              value: '3'
            }]);

            el.$.unwrap();

            done();
          });
        });
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
        el = new Coral.Select();
        item1 = new Coral.Select.Item();
        item2 = new Coral.Select.Item();
        item3 = new Coral.Select.Item();

        item1.content.innerHTML = 'Item 1';
        item1.value = '1';
        item2.content.innerHTML = 'Item 2';
        item2.value = '2';
        item3.content.innerHTML = 'Item 3';
        item3.value = '3';

        helpers.target.appendChild(el);
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

    describe('#focus()', function() {

      it('should focus the button', function() {
        expect(document.activeElement).not.to.equal(el);

        el.focus();

        expect(el.contains(document.activeElement)).to.be.true;
      });

      it('should not focus the button if it is disabled', function(done) {
        expect(document.activeElement).not.to.equal(el);

        el.disabled = true;

        // we wait a frame because disable is applied on a sync()
        helpers.next(function() {

          el.focus();

          expect(el.contains(document.activeElement)).to.be.false;

          expect(el).not.to.equal(document.activeElement);

          done();
        });
      });
    });
  });

  describe('Markup', function() {

    describe('#variant', function() {
      it('should not add class for empty variant', function(done) {
        helpers.build(window.__html__['Coral.Select.variant.empty.html'], function(el) {
          expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);
          expect(el.$).to.have.attr('variant', '');
          expect(el.$).to.have.class('coral3-Select');

          done();
        });
      });

      it('should not add class for invalid variant', function(done) {
        helpers.build(window.__html__['Coral.Select.variant.invalid.html'], function(el) {
          expect(el.variant).to.equal(Coral.Select.variant.DEFAULT);
          expect(el.$).to.have.attr('variant', 'invalidvariant');
          expect(el.$).to.have.class('coral3-Select');
          expect(el.$).not.to.have.class('coral3-Select--invalidvariant');

          done();
        });
      });

      it('should remove variant classnames when variant changes', function(done) {
        helpers.build(window.__html__['Coral.Select.variant.quiet.html'], function(el) {
          expect(el.$).to.have.class('coral3-Select--quiet');
          expect(el._elements.button.variant).to.equal('quiet');

          el.variant = Coral.Select.variant.DEFAULT;
          expect(el._elements.button.variant).to.equal(Coral.Button.variant.DEFAULT);

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(el.$).not.to.have.class('coral3-Select--default');
            expect(el.$).not.to.have.class('coral3-Select--quiet');
            expect(el._elements.button.$).not.to.have.class('coral-Button--quiet');

            done();
          });
        });
      });
    });

    describe('#selectedItem', function() {

      it('should allow selecting items in the DOM', function(done) {
        helpers.build(window.__html__['Coral.Select.selected.html'], function(el) {
          expect(el.selectedItem.value).to.equal('eu');
          expect(el.selectedItems.length).to.equal(1);
          expect(el.value).to.equal('eu');
          expect(el.values).to.deep.equal(['eu']);

          done();
        });
      });

      it('should allow removing the selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.selected.html'], function(el) {
          // removes 'Africa'
          el.selectedItem.remove();

          // selects 'Africa'
          el.items.getAll()[1].selected = true;

          expect(el.selectedItem.value).to.equal('af');
          expect(el.value).to.equal('af');
          expect(el.values).to.deep.equal(['af']);

          done();
        });
      });
    });

    describe('#selectedItems', function() {

      it('should allow selecting items in the DOM', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {

          expect(el.selectedItem.value).to.equal('af');
          expect(el.selectedItems.length).to.equal(2);
          expect(el.value).to.equal('af');
          expect(el.values).to.deep.equal(['af', 'eu']);

          done();
        });
      });

      it('should allow removing the selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          // removes 'Africa'
          el.selectedItem.remove();

          helpers.next(function() {
            expect(el.selectedItem.value).to.equal('eu');
            expect(el.value).to.equal('eu');
            expect(el.values).to.deep.equal(['eu']);

            done();
          });
        });
      });
    });

    // @todo: test that tags are correct
    describe('#multiple', function() {
      it('should default to false', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          expect(el.multiple).to.be.false;
          expect(el.hasAttribute('multiple')).to.be.false;

          done();
        });
      });

      it('should remove the attribute', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {

          expect(el.multiple).to.be.true;

          el.multiple = false;

          helpers.next(function() {
            expect(el.hasAttribute('multiple')).to.be.false;
            done();
          });
        });
      });

      it('should be settable in the markup', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {

          expect(el.multiple).to.be.true;
          expect(el.hasAttribute('multiple')).to.be.true;

          done();
        });
      });

      it('should to allow multiple selection when true', function(done) {

        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {

          expect(el.multiple).to.be.true;

          expect(el.selectedItems.length).to.equal(2);
          expect(el.selectedItem.value).to.equal('af');
          expect(el.selectedItems[0].value).to.equal('af');
          expect(el.selectedItems[1].value).to.equal('eu');

          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
          expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal('af');
          expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal('eu');

          expect(el._elements.list.selectedItems.length).to.equal(2);

          el._elements.list.selectedItems.forEach(function(value) {
            expect(value.hidden).to.be.true;
            expect(value.selected).to.be.true;
          });

          expect(el._elements.taglist.items.getAll().length).to.equal(2);

          done();
        });
      });
    });

    describe('#placeholder', function() {});

    describe('#value', function() {

      it('should be possible to set the value using markup (in single mode)', function(done) {
        helpers.build(window.__html__['Coral.Select.value.html'], function(el) {

          expect(el.selectedItems.length).to.equal(1, 'one item should be selected');
          expect(el.values.length).to.equal(1, 'one value should be set');
          expect(el.selectedItems[0].value).to.equal('oc', '"oc" should be the value of the selected item');
          expect(el.values).to.contain('oc', '"oc" should be one value');
          expect(el.value).to.equal('oc', '"oc" should be set as value');

          done();
        });
      });

      it('should be possible to set the value using markup (in multi mode)', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.value.html'], function(el) {

          // Setting a select.value will force all other selected items to be deselected => only one item is selected
          expect(el.selectedItems.length).to.equal(1, 'one item should be selected');
          expect(el.values.length).to.equal(1, 'one value should be set');
          expect(el.selectedItems[0].value).to.equal('oc', '"oc" should be the value of the selected item');
          expect(el.values).to.contain('oc', '"oc" should be one value');
          expect(el.value).to.equal('oc', '"oc" should be set as value');

          done();
        });
      });

      it('should default to value of first item no items are selected', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          expect(el.value).to.equal('am');
          done();
        });
      });

      it('should return the value of the selected item', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          var item2 = el.items.getAll()[1];
          expect(item2.value).to.equal('af');

          el.value = 'af';

          helpers.next(function() {
            expect(el.value).to.equal(item2.value);
            expect(el.selectedItem).to.equal(item2);
            done();
          });
        });
      });

      it('should default to empty string when multiple', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {
          expect(el.value).to.equal('');
          expect(el.selectedItem).to.be.null;
          done();
        });
      });
    });

    describe('#values', function() {

      it('should ignore the values attribute', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {

          expect(el.selectedItem).to.be.null;
          expect(el.selectedItems.length).to.equal(0);
          expect(el.values).to.deep.equal([]);
          expect(el.value).to.equal('');

          done();
        });
      });

      it('should be possible to get values set in markup', function(done) {
        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {
          expect(el.selectedItems.length).to.equal(2);
          expect(el.values.length).to.equal(2);
          expect(el.values[0]).to.equal('af');
          expect(el.values[1]).to.equal('eu');

          done();
        });
      });
    });

    // @todo: test form submission with the form
    describe('#name', function() {});

    describe('#required', function() {});

    describe('#invalid', function() {});

    describe('#disabled', function() {});

    describe('#readOnly', function() {});

    describe('#labelledBy', function() {});

    describe('#loading', function() {});

    describe('#items', function() {});
  });

  describe('Events', function() {
    // @todo: test multiple
    // @todo: test native
    describe('#change', function() {

      it('should not trigger change while setting values programatically', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          el.on('change', changeSpy);

          expect(changeSpy.callCount).to.equal(0);

          el.items.getAll()[1].selected = true;
          expect(el.value).to.equal('af');

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should not trigger change setting the value', function(done) {
        var changeSpy = sinon.spy();


        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          el.on('change', changeSpy);

          expect(changeSpy.callCount).to.equal(0);

          el.value = 'af';

          expect(el.value).to.equal('af');

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should enable user interaction once overlay is open', function(done) {
        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          expect(el._onUserInteraction).to.be.false;
          if (!el._useNativeInput) {

            // Overlay does not open immediately any longer
            el.on('coral-overlay:open', function() {
              expect(el._onUserInteraction).to.be.true;
              done();
            });

            // opens the overlay (forces a change event to be triggered on next select)
            el._elements.button.click();
          }
        });
      });

      it('should trigger change if the user interacts with the selectlist', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {
          el.on('change', changeSpy);

          var callback = function() {
            if (!el._useNativeInput) {
              expect(el._elements.overlay.open).to.be.true;
              expect($(el._elements.overlay).is(':visible')).to.be.true;
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

            helpers.next(function() {
              expect(el.value).to.equal('af');

              expect(changeSpy.callCount).to.equal(1);
              done();
            });
          };

          if (!el._useNativeInput) {
            // Overlay does not open immediately any longer
            el.on('coral-overlay:open', callback);

            // opens the overlay (forces a change event to be triggered on next select)
            el._elements.button.click();
          }
          else {
            callback();
          }
        });
      });

      it('should not trigger change if the user selects the same item', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          el.on('change', changeSpy);

          var numberOfOpenEvents = 0;
          el.on('coral-overlay:open', function() {

            if (numberOfOpenEvents === 0) {
              expect(el._elements.overlay.open).to.be.true;
              expect($(el._elements.overlay).is(':visible')).to.be.true;

              expect(changeSpy.callCount).to.equal(0);

              // selects the 2nd item in the list
              el._elements.list.items.getAll()[1].click();

              expect(el.value).to.equal('af');

              expect(changeSpy.callCount).to.equal(1);

              // opens the overlay again
              el._elements.button.click();
            }
            else if (numberOfOpenEvents === 1) {
              expect(el._elements.overlay.open).to.be.true;
              expect($(el._elements.overlay).is(':visible')).to.be.true;

              expect(changeSpy.callCount).to.equal(1);

              // selects the 2nd item in the list
              el._elements.list.items.getAll()[1].click();

              expect(el.value).to.equal('af');

              expect(changeSpy.callCount).to.equal(1);

              done();
            }

            numberOfOpenEvents += 1;

          });

          // opens the overlay the first time
          el._elements.button.click();
        });
      });

      it('should not trigger new change while we are updating items in the change callback', function(done) {

        helpers.build(window.__html__['Coral.Select.base.html'], function(el) {

          var changeCallbackCount = 0;
          el.on('change', function() {
            changeCallbackCount += 1;
            el._elements.list.items.getAll()[2].click();
          });

          el.on('coral-overlay:open', function() {
            // selects the 2nd item in the list
            el._elements.list.items.getAll()[1].click();

            expect(el.value).to.equal('as');

            expect(changeCallbackCount).to.equal(1);

            done();
          });

          // opens the overlay
          el._elements.button.click();
        });
      });

      it('should reparent the change event if a tag is removed', function(done) {

        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.multiple.base.html'], function(el) {

          el.on('change', changeSpy);

          var items = el.items.getAll();

          // selects 2 items
          items[1].selected = true;
          items[3].selected = true;

          // no change event since the selection was done programatically
          expect(changeSpy.callCount).to.equal(0);

          // we need to wait in polyfilled environments for the values to be initialized
          helpers.next(function() {
            // checks that the corresponding tags were created
            expect(el._elements.taglist.values).to.deep.equal(['af', 'eu']);

            // clicks on the close button of the tag
            el._elements.taglist.items.getAll()[0]._elements.button.click();

            helpers.next(function() {
              // change event must be triggered
              expect(changeSpy.callCount).to.equal(1);

              // makes sure the target is correct
              expect(changeSpy.getCall(0).calledWithMatch({
                target: el
              })).to.be.true;

              expect(el.selectedItems).to.deep.equal([items[3]]);
              expect(el.value).to.equal('eu');
              expect(el.values).to.deep.equal(['eu']);

              done();
            });
          });
        });
      });
    });
  });

  describe('User Interaction', function() {

    describe('Removing the selected item', function() {
      it('should not cause an error with single selection', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.selected.html'], function(el) {

          el.on('change', changeSpy);

          el.on('coral-overlay:open', function() {

            // we remove the selected item
            el.selectedItem.remove();

            // no change event should have been triggered
            expect(changeSpy.callCount).to.equal(0);

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
      });

      it('should not cause an error with multiple selection', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(el) {

          el.on('change', changeSpy);

          var totalItems = el.items.length;
          var totalSelectedItems = el.selectedItems.length;

          el.on('coral-overlay:open', function() {
            // we remove the selected item ("Africa")
            el.selectedItem.remove();

            // no change event should have been triggered
            expect(changeSpy.callCount).to.equal(0);

            helpers.next(function() {
              // checks the item was properly removed
              expect(el.items.length).to.equal(totalItems - 1);
              expect(el._elements.nativeSelect.options.length).to.equal(totalItems - 1);
              expect(el._elements.list.items.length).to.equal(totalItems - 1);
              expect(el._elements.taglist.items.length).to.equal(totalSelectedItems - 1);

              // makes sure it actually opened
              expect(el._elements.overlay.open).to.be.true;

              // selects the item on index 1 ("Asia")
              el._elements.list.items.getAll()[1].click();

              helpers.next(function() {

                expect(el.selectedItem.value).to.equal('as');
                expect(el.selectedItems.length).to.equal(2);
                expect(el.value).to.equal('as');
                expect(el.values).to.deep.equal(['as', 'eu']);

                expect(changeSpy.callCount).to.equal(1);
                expect(changeSpy.getCall(0).args[0].target.value).to.equal('as');
                expect(changeSpy.getCall(0).args[0].target.values).to.deep.equal(['as', 'eu']);

                // taglist has a different order since it always appends
                expect(el._elements.taglist.values).to.deep.equal(['eu', 'as']);

                done();
              });
            });
          });

          // opens the list
          el._elements.button.click();
        });
      });
    });

    describe('#selectedItem', function() {

      // the select list item used in every test
      var el;
      var item1;
      var item2;
      var item3;

      beforeEach(function() {
        el = new Coral.Select();
        item1 = new Coral.Select.Item();
        item2 = new Coral.Select.Item();
        item3 = new Coral.Select.Item();

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

        helpers.target.appendChild(el);
      });

      afterEach(function() {
        // clears the references. they were automatically removed by the helpers
        el = item1 = item2 = item3 = null;
      });

      it('should update the Placeholder the clicked select list item', function(done) {

        el.placeholder = 'Placeholder';

        // initially empty
        expect(el.selectedItem).to.be.null;

        // opens the list
        el._elements.button.click();

        helpers.next(function() {

          // makes sure it actually opened
          expect(el._elements.overlay.open).to.be.true;

          // selects the item on index 1
          el._elements.list.items.getAll()[1].click();

          expect(el.selectedItem).to.equal(item2);

          helpers.next(function() {
            // makes sure the placeholder was successfully set
            expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);

            done();
          });
        });
      });

      it('should update the placeholder when the content of the selectedItem changes', function(done) {
        // we look for an item to select
        var item = el.items.last();
        item.selected = true;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(item);
          expect(el._elements.label.textContent).to.equal(item.content.textContent);

          item.content.textContent = 'New Content';

          // we wait for the MO to trigger
          helpers.next(function() {
            // after the MO change, we wait for the placeholder and selectedItem sync
            helpers.next(function() {
              expect(el._elements.label.textContent).to.equal('New Content');
              done();
            });
          });
        });
      });

      it('should allow removing the selected item', function(done) {

        el.placeholder = 'Placeholder';

        // initially empty
        expect(el.selectedItem).to.be.null;

        // opens the list
        el._elements.button.click();

        helpers.next(function() {

          // makes sure it actually opened
          expect(el._elements.overlay.open).to.be.true;

          // selects the item on index 1
          el._elements.list.items.getAll()[1].click();

          expect(el.selectedItem).to.equal(item2);

          helpers.next(function() {
            expect(el._elements.label.innerHTML).to.equal(item2.content.innerHTML);

            // we remove the selected item
            item2.remove();

            expect(el.selectedItem).to.be.null;

            // we have one item less in the collection
            expect(el.items.length).to.equal(2);

            // opens the list
            el._elements.button.click();

            helpers.next(function() {

              // there is now one item less in the selectlist
              expect(el._elements.list.items.length).to.equal(2);

              // Firefox needs 2 frames for the placeholder to be updated
              helpers.next(function() {
                // it should show now the placeholder
                expect(el._elements.label.textContent).to.equal('Placeholder');

                // selects the item on index 1
                el._elements.list.items.getAll()[1].click();

                expect(el.selectedItem).to.equal(item3);

                done();
              });
            });
          });
        });
      });
    });
  });

  describe('Implementation Details', function() {
    // the select list item used in every test
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function() {
      el = new Coral.Select();
      item1 = new Coral.Select.Item();
      item2 = new Coral.Select.Item();
      item3 = new Coral.Select.Item();

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

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = item1 = item2 = item3 = null;
    });

    it('should reset the select if reset() is called', function(done) {
      helpers.build(window.__html__['Coral.Select.multiple.selected.html'], function(select) {
        var selectedItems = select.selectedItems;
        var af = selectedItems[0];
        var eu = selectedItems[1];

        expect(select.values.length).to.equal(2, 'two elements should be selected by default');
        expect(select._initalSelectedValues.length).to.equal(2, 'two elements should be selected by default (stored internally)');
        expect(af.selected).to.equal(true, '"af" should be selected by default (stored internally)');
        expect(eu.selected).to.equal(true, '"eu" should be selected by default (stored internally)');

        select.value = '';
        expect(select.values.length).to.equal(0, 'should have cleared the selection');
        expect(af.selected).to.equal(false, '"af" should be deselected now');
        expect(eu.selected).to.equal(false, '"eu" should be deselected now');

        select.reset();
        expect(af.selected).to.equal(true, '"af" should be selected again');
        expect(eu.selected).to.equal(true, '"eu" should be selected again');
        expect(select.values.length).to.equal(2, 'the default elements should be selected again');

        done();
      });
    });

    it('should clear the select if clear() is called', function(done) {
      // wait one frame for FF
      helpers.next(function() {
        item2.selected = true;
        expect(item2.selected).to.be.true;

        el.clear();
        expect(item2.selected).to.be.false;
        done();
      });
    });

    it('should set value of the internal items', function() {
      // wait one frame for FF
      helpers.next(function() {
        expect(item1._elements.selectListItem.value).to.equal(item1.value);
        expect(item2._elements.selectListItem.value).to.equal(item2.value);
        expect(item3._elements.selectListItem.value).to.equal(item3.value);
        expect(item1._elements.nativeOption.value).to.equal(item1.value);
        expect(item2._elements.nativeOption.value).to.equal(item2.value);
        expect(item3._elements.nativeOption.value).to.equal(item3.value);
      });
    });

    it('should change value of the internal items', function(done) {
      // wait one frame for FF
      helpers.next(function() {
        item1.value = '4';

        helpers.next(function() {
          expect(item1._elements.selectListItem.value).to.equal(item1.value);
          expect(item1._elements.nativeOption.value).to.equal(item1.value);

          done();
        });
      });
    });

    it('should change content of the internal items', function(done) {
      // wait one frame for FF
      helpers.next(function() {
        item1.content.innerHTML = 'America';

        helpers.next(function() {
          expect(item1._elements.selectListItem.content.innerHTML).to.equal(item1.content.innerHTML);
          expect(item1._elements.nativeOption.innerHTML).to.equal(item1.content.innerHTML);

          done();
        });
      });
    });

    it('should change disabled of the internal items', function(done) {
      // wait one frame for FF
      helpers.next(function() {
        expect(item1.disabled).to.be.false;

        item1.disabled = true;

        helpers.next(function() {
          expect(item1.disabled).to.be.true;
          expect(item1._elements.selectListItem.disabled).to.equal(item1.disabled);
          expect(item1._elements.nativeOption.disabled).to.equal(item1.disabled);

          done();
        });
      });
    });
  });

  describe('Implementation Details (compliance)', function() {
    describe('#formField (single select)', function () {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Coral.Select.value.html'], {
        value: 'as',
        default: 'am'
      });
    });

    describe('#formField (multi select)', function () {
      // Run generic formField tests
      helpers.testFormField(window.__html__['Coral.Select.multiple.value.html'], {
        value: 'as',
        default: ''
      });
    });
  });
});
