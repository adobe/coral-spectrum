describe('Coral.ButtonGroup', function() {
  'use strict';

  var el;
  var item1;
  var item2;
  var item3;

  var getSimpleButtonGroupElement = function() {
    el = new Coral.ButtonGroup();

    item1 = new Coral.Button();
    item1.set({
      value: 'item1',
      label: {
        innerHTML: 'Item 1'
      }
    });

    item2 = new Coral.Button();
    item2.set({
      value: 'item2',
      label: {
        innerHTML: 'Item 2'
      }
    });

    item3 = new Coral.Button();
    item3.set({
      value: 'item3',
      label: {
        innerHTML: 'Item 3'
      }
    });

    el.appendChild(item1);
    el.appendChild(item2);
    el.appendChild(item3);

    return el;
  };

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('ButtonGroup');
    });

    it('should define the selection modes in an enum', function() {
      expect(Coral.ButtonGroup.selectionMode).to.exist;
      expect(Coral.ButtonGroup.selectionMode.NONE).to.equal('none');
      expect(Coral.ButtonGroup.selectionMode.SINGLE).to.equal('single');
      expect(Coral.ButtonGroup.selectionMode.MULTIPLE).to.equal('multiple');
      expect(Object.keys(Coral.ButtonGroup.selectionMode).length).to.equal(3);
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone using markup', function(done) {
      helpers.build(window.__html__['Coral.ButtonGroup.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      el = getSimpleButtonGroupElement();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {

    describe('#items', function() {

      beforeEach(function() {
        el = getSimpleButtonGroupElement();
        helpers.target.appendChild(el);
      });

      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });

      it('should be readOnly', function() {
        el.items = null;
        expect(el.items).not.to.be.null;
      });

      it('should get all the items with getAll()', function() {
        var items = el.items.getAll();

        expect(items.length).to.equal(3);
        expect(items[0]).to.equal(item1);
        expect(items[1]).to.equal(item2);
        expect(items[2]).to.equal(item3);
      });

      it('should remove all the items with clear()', function() {
        // we remove all the items
        el.items.clear();

        expect(el.items.length).to.equal(0);
        // makes sure the native select was not blown away
        expect(el._elements.nativeSelect.parentNode).to.equal(el);
      });

      it('should add items using add()', function() {
        var item = new Coral.Button();
        item.setAttribute('value', 'item4');
        item.label.innerHTML = 'Item 4';

        el.items.add(item);
        expect(el.items.length).to.equal(4);
      });

      it('should allow adding using an object notation', function() {
        el.items.add({
          value: 'item4',
          label: {
            innerHTML: 'Item 4'
          }
        });

        expect(el.items.length).to.equal(4);
      });

      it('should allow adding selected items using an object notation', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.SINGLE;

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {

          el.items.add({
            value: 'item4',
            label: {
              innerHTML: 'Item 4'
            },
            selected: true
          });

          expect(el.items.length).to.equal(4);

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

      // @todo: fix this issue
      it('should allow adding a selected button', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.SINGLE;

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          // makes sure the selectionMode handled the item selection
          expect(el.value).to.equal('item1');

          var item = new Coral.Button();
          item.setAttribute('value', 'item4');
          item.setAttribute('selected', true);
          item.label.innerHTML = 'Item 4';

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
      });
    });

    describe('#selectionMode', function() {

      beforeEach(function() {
        el = getSimpleButtonGroupElement();
        helpers.target.appendChild(el);
      });

      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });

      it('should default to none', function(done) {
        expect(el.selectionMode).to.equal('none');

        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(0);

          done();
        });
      });

      it('should add select options when selection mode changed to single', function(done) {
        el.selectionMode = 'single';

        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          done();
        });
      });

      it('should remove all options when selection mode changed to none', function(done) {
        el.selectionMode = 'single';

        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);
          el.selectionMode = 'none';

          helpers.next(function() {
            // checks what still has the selected attribute
            var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');

            expect(el._elements.nativeSelect.options.length).to.equal(0);
            expect(selectedButtons.length).to.equal(0);

            done();
          });
        });
      });

      it('should clear the entire selection when selectionMode is set back to none', function(done) {
        el.selectionMode = 'multiple';

        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          // we select all the buttons
          var buttons = el.items.getAll();
          buttons.forEach(function(item) {
            item.selected = true;
          });

          helpers.next(function() {
            // we make sure all the buttons were selected
            expect(el.values).to.deep.equal(['item1', 'item2', 'item3']);

            // we clear the selection. this should cause all buttons to be deselected
            el.selectionMode = 'none';

            helpers.next(function() {
              // querries the dom for buttons with the selected attribute
              var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
              expect(selectedButtons.length).to.equal(0);

              // all options must have been removed
              expect(el._elements.nativeSelect.options.length).to.equal(0);

              done();
            });
          });
        });
      });
    });

    describe('#name', function() {
      var form;

      beforeEach(function(done) {
        form = document.createElement('form');

        el = getSimpleButtonGroupElement();

        // wait till selectionMode changes are propogated properly
        helpers.next(function() {
          form.appendChild(el);
          helpers.target.appendChild(form);

          done();
        });
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

      it('should submit by default the first item', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.SINGLE;

        el.name = 'test';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          expect(el.$.parent().serializeArray()).to.deep.equal([{
            name: 'test',
            value: 'item1'
          }]);

          done();
        });
      });

      it('should submit nothing when name is not specified even though an item is selected', function(done) {
        // we select by adding the attribute
        item2.setAttribute('selected', '');

        expect(el._elements.nativeSelect.name).to.equal('');

        var values = el.$.parent().serializeArray();

        expect(values.length).to.equal(0);
        done();
      });

      it('should submit nothing when selectionMode = none', function(done) {

        el.name = 'buttongroup';
        item2.setAttribute('selected', '');
        expect(el.selectionMode).to.equal(Coral.ButtonGroup.selectionMode.NONE);

        expect(el.name).to.equal('buttongroup');
        expect(el._elements.nativeSelect.name).to.equal('buttongroup');

        // native should have no valid value
        expect(el._elements.nativeSelect.value).to.equal('');

        expect(el.value).to.equal('');

        // no value should be submitted
        expect(el.$.parent().serializeArray()).to.deep.equal([]);

        helpers.next(function() {
          // makes sure no option is created
          expect(el._elements.nativeSelect.options.length).to.equal(0);

          done();
        });
      });

      it('should allow changing the selection', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.SINGLE;

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {

          el.name = 'buttongroup';

          // we select the item
          item2.setAttribute('selected', '');

          // we need to wait for the MutationObservers to kick in
          helpers.next(function() {

            expect(el.name).to.equal('buttongroup');
            expect(el._elements.nativeSelect.name).to.equal('buttongroup');

            // the native has the correct value
            expect(el._elements.nativeSelect.value).to.equal(item2.value);

            expect(el.value).to.equal(item2.value);

            expect(el.$.parent().serializeArray()).to.deep.equal([{
              name: 'buttongroup',
              value: item2.value
            }]);

            done();
          });
        });
      });

      it('should remove associated option element', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.SINGLE;

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {

          expect(el.value).to.equal('item1');
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          // we need to wait a frame in case the attached event hasn't been processed in polyfilled environments
          helpers.next(function() {

            item2.remove();

            helpers.next(function() {
              expect(el._elements.nativeSelect.options.length).to.equal(2);
              expect(el.value).to.equal('item1');

              done();
            });
          });
        });
      });

      it('should allow removing the selected item', function(done) {
        // we set the name and the selection mode
        el.selectionMode = Coral.ButtonGroup.selectionMode.SINGLE;
        el.name = 'test';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          expect(el.value).to.equal(item1.value);
          expect(el.values).to.deep.equal([item1.value]);

          // we remove the selected item
          item1.remove();

          helpers.next(function() {
            expect(el._elements.nativeSelect.options.length).to.equal(2);

            expect(el.$.parent().serializeArray()).to.deep.equal([{
              name: 'test',
              value: item2.value
            }]);

            done();
          });
        });
      });

      it('should submit multiple values with selectionMode = multiple', function(done) {
        // we set the name and the selection mode
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;
        el.name = 'test';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          // selects 2 items
          item1.setAttribute('selected', true);
          item2.setAttribute('selected', true);

          helpers.next(function() {
            expect(el.$.parent().serializeArray()).to.deep.equal([
              {
                name: 'test',
                value: item1.value
              },
              {
                name: 'test',
                value: item2.value
              }
            ]);

            done();
          });
        });
      });

      it('should remove associated option element when selectionMode = multiple', function(done) {
        // we set the name and the selection mode
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;
        el.name = 'test';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          // we need to wait a frame in case the attached event hasn't been processed in polyfilled environments
          helpers.next(function() {
            item2.remove();

            helpers.next(function() {
              expect(el._elements.nativeSelect.options.length).to.equal(2);

              done();
            });
          });
        });
      });

      it('show allow removing a selected item when selectionMode = multiple', function(done) {
        // we set the name and the selection mode
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;
        el.name = 'test';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {

          // every item should have a corresponding value
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          // selects 2 items
          item2.setAttribute('selected', true);
          item3.setAttribute('selected', true);

          // we wait for the mutation observers
          helpers.next(function() {
            expect(el.values).to.deep.equal(['item2', 'item3']);

            // we remove one of the selected items
            item2.remove();

            helpers.next(function() {
              expect(el._elements.nativeSelect.options.length).to.equal(2);

              expect(el.$.parent().serializeArray()).to.deep.equal([{
                name: 'test',
                value: item3.value
              }]);

              done();
            });
          });
        });
      });
    });

    describe('#disabled', function() {});
    describe('#readOnly', function() {});
    describe('#required', function() {});
    describe('#invalid', function() {});
    describe('#labelledBy', function() {});

    describe('#value', function() {
      var form;

      beforeEach(function(done) {
        form = document.createElement('form');

        el = getSimpleButtonGroupElement();

        el.set({
          name: 'test',
          selectionMode: 'single'
        });

        // wait till selectionMode changes are propogated properly
        helpers.next(function() {
          form.appendChild(el);
          helpers.target.appendChild(form);
          done();
        });
      });

      afterEach(function() {
        el = item1 = item2 = item3 = form = null;
      });

      it('should set value as selected', function(done) {
        expect(el.value).to.equal('item1');

        el.value = 'item2';

        expect(el.$.parent().serializeArray()).to.deep.equal([{
          name: 'test',
          value: 'item2'
        }]);

        done();
      });

      it('should set value as selected unselecting old values', function(done) {
        el.selectionMode = 'multiple';
        // select item 2
        // first elem is already selected since we are changing from single selection
        item2.setAttribute('selected', true);

        helpers.next(function() {
          expect(el.values.length).to.equal(2);

          helpers.next(function() {
            var value = 'item2';
            el.value = value;

            expect(el.$.parent().serializeArray()).to.deep.equal([{
              name: 'test',
              value: 'item2'
            }]);

            done();
          });
        });
      });
    });

    describe('#values', function() {
      var form;

      beforeEach(function(done) {
        form = document.createElement('form');

        el = getSimpleButtonGroupElement();
        el.name = 'test';

        // wait till selectionMode changes are propogated properly
        helpers.next(function() {
          form.appendChild(el);
          helpers.target.appendChild(form);
          done();
        });
      });

      afterEach(function() {
        el = item1 = item2 = item3 = form = null;
      });

      it('should default to empty array when selectionMode = none', function() {
        expect(el.selectionMode).to.equal(Coral.ButtonGroup.selectionMode.NONE);
        expect(el.values).to.deep.equal([]);
      });

      it('should ignore the setter when selectionMode = none', function() {
        el.values = ['item1'];
        expect(el.values).to.deep.equal([]);
      });

      it('should default to the first item when selectionMode = single', function(done) {
        el.selectionMode = 'single';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          expect(el.values).to.deep.equal(['item1']);

          done();
        });
      });

      it('should default to empty array when selectionMode = multiple', function(done) {
        el.selectionMode = 'multiple';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          expect(el.values).to.deep.equal([]);

          done();
        });
      });

      it('should set the values for selectionMode = single', function(done) {
        el.selectionMode = 'single';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          el.values = ['item1'];

          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
          expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal(item1.value);

          expect(el.values).to.deep.equal(['item1']);

          done();
        });
      });

      it('should select first value as selected when passed multiple elements for selectionMode = single', function(done) {
        el.selectionMode = 'single';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          // sets the new values. only the first one should be considered
          el.values = ['item2', 'item3'];

          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(1);
          expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal(item2.value);

          expect(el.value).to.equal('item2');
          expect(el.values).to.deep.equal(['item2']);

          done();
        });
      });

      it('should set all values as selected for selectionMode = multiple', function(done) {
        el.selectionMode = 'multiple';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          el.values = ['item2', 'item3'];

          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(2);
          expect(el._elements.nativeSelect.selectedOptions[0].value).to.equal(item2.value);
          expect(el._elements.nativeSelect.selectedOptions[1].value).to.equal(item3.value);

          expect(el.value).to.equal('item2');
          expect(el.values).to.deep.equal(['item2', 'item3']);

          done();
        });
      });

      it('should allow to clear the selection when selectionMode = multiple', function(done) {
        el.selectionMode = 'multiple';

        // @todo: waits for the selectionMode sync, this should be synchronous
        helpers.next(function() {
          // selects all the items
          el.values = ['item1', 'item2', 'item3'];

          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(3);

          expect(el.values).to.deep.equal(['item1', 'item2', 'item3']);

          el.values = [];

          expect(el._elements.nativeSelect.selectedOptions.length).to.equal(0);

          expect(el.value).to.equal('');
          expect(el.values).to.deep.equal([]);

          done();
        });
      });
    });

    describe('#selectedItem', function() {

      beforeEach(function() {
        el = getSimpleButtonGroupElement();
        helpers.target.appendChild(el);
      });

      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });

      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });

      it('should update to the selected value', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.SINGLE;

        helpers.next(function() {
          //select item2
          item2.selected = true;
          helpers.next(function() {
            expect(el.selectedItem).to.equal(item2);

            //select item3
            item3.selected = true;
            helpers.next(function() {
              expect(el.selectedItem).to.equal(item3);
              done();
            });
          });
        });
      });

      it('should return first selected item if selection mode = "multiple"', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;

        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          // select all the buttons
          var buttons = el.items.getAll();
          buttons.forEach(function(item) {
            item.selected = true;
          });

          helpers.next(function() {
            expect(el.selectedItem).to.equal(item1);
            done();
          });
        });
      });

      it('should be null if the selected is removed', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;
        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);
          item2.selected = true;
          helpers.next(function() {
            expect(el.selectedItem).to.equal(item2);

            item2.remove();
            helpers.next(function() {
              expect(el.selectedItem).to.be.null;
              done();
            });
          });
        });
      });

    });

    describe('#selectedItems', function() {

      beforeEach(function() {
        el = getSimpleButtonGroupElement();
        helpers.target.appendChild(el);
      });

      afterEach(function() {
        el = item1 = item2 = item3 = null;
      });


      it('should default to an empty array', function() {
        expect(el.selectedItems).to.deep.equal([]);
      });

      it('should update to the selected values', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;

        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);
          item2.selected = true;
          helpers.next(function() {
            expect(el.selectedItems).to.deep.equal([item2]);
            item3.selected = true;
            helpers.next(function() {
              expect(el.selectedItems).to.deep.equal([item2, item3]);
              done();
            });
          });
        });
      });

      it('should return all selected items if selection mode = "multiple"', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;

        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);

          // select all the buttons
          var buttons = el.items.getAll();
          buttons.forEach(function(item) {
            item.selected = true;
          });

          helpers.next(function() {
            expect(el.selectedItems).to.deep.equal([item1, item2, item3]);
            done();
          });
        });
      });

      it('should return an empty array if the selected is removed', function(done) {
        el.selectionMode = Coral.ButtonGroup.selectionMode.MULTIPLE;
        helpers.next(function() {
          expect(el._elements.nativeSelect.options.length).to.equal(3);
          item2.selected = true;
          helpers.next(function() {
            expect(el.selectedItems).to.deep.equal([item2]);

            item2.remove();
            helpers.next(function() {
              expect(el.selectedItems).to.deep.equal([]);
              done();
            });
          });
        });
      });
    });
  });

  describe('Markup', function() {
    describe('#value', function() {
      it('should use the value attribute when available', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.selected.html'], function(el) {
          var items = el.items.getAll();

          expect(el.value).to.equal(items[1].getAttribute('value'));

          done();
        });
      });

      it('should default to the text when value attribute is not available', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.novalues.html'], function(el) {
          var items = el.items.getAll();

          expect(items[1].hasAttribute('value')).to.be.false;

          // since no value attribute is available, we use the text content
          expect(el.value).to.equal(items[1].textContent);

          el.value = items[0].textContent;

          expect(el.value).to.equal(items[0].textContent);

          expect(items[0].hasAttribute('selected')).to.be.true;

          done();
        });
      });

      it('should update the value when changed attribute is changed programatically', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.novalues.html'], function(el) {
          var items = el.items.getAll();

          // since no value attribute is available, we use the text content
          expect(el.value).to.equal(items[1].textContent);

          // sets a new value
          items[1].setAttribute('value', 'newvalue');

          // we wait for the mutation observers
          helpers.next(function() {
            // checks the internal option
            expect(items[1].option.value).to.equal('newvalue');
            // the value to submit must be updated
            expect(el.value).to.equal('newvalue');

            done();
          });
        });
      });

      it('should to empty string if all items are removed', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.html'], function(el) {

          // it had a value before the removal
          expect(el.value).to.equal('item1');

          // we remove all the items
          el.items.clear();

          helpers.next(function() {
            expect(el.value).to.equal('');

            done();
          });
        });
      });
    });

    // values is not available in the markup, but settable using the "selected" attribute in the items
    describe('#values', function() {
      it('should select item with "selected" attribute', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.selected.html'], function(el) {
          var items = el.items.getAll();

          expect(el.value).to.equal(items[1].value);
          expect(el.values).to.deep.equal([items[1].value]);

          done();
        });
      });

      it('should reject multiple "selected" items', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.doubleselected.html'], function(el) {
          var items = el.items.getAll();

          helpers.next(function() {
            helpers.next(function() {
              expect(el.items._getSelectedItems().length).to.equal(1);
              // keeps the first selected
              expect(el.value).to.equal(items[1].value);
              expect(el.values).to.deep.equal([items[1].value]);

              done();
            });
          });
        });
      });

      it('should select all items with "selected" attribute when selectionMode is "multiple"', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.multiple.selected.html'], function(el) {
          var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');

          expect(el.values).to.deep.equal([selectedButtons[0].value, selectedButtons[1].value]);
          expect(selectedButtons.length).to.equal(2);

          done();
        });
      });

      it('should enforce the single selection when selected attribute is added', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.selected.html'], function(el) {
          var items = el.items.getAll();
          expect(items[1].hasAttribute('selected')).to.be.true;

          items[0].setAttribute('selected', true);

          // we wait for the mutation observer
          helpers.next(function() {
            // values should match the new selection
            expect(el.value).to.equal(items[0].value, 'Value should match the new selection');
            expect(el.values).to.deep.equal([items[0].value]);

            var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
            expect(selectedButtons.length).to.equal(1);

            expect(items[1].hasAttribute('selected')).to.be.false;

            done();
          });
        });
      });

      it('should find an item to select when the selected attribute is removed', function(done) {
        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.selected.html'], function(el) {
          var items = el.items.getAll();
          expect(items[1].hasAttribute('selected')).to.be.true;

          // removes the attribute of the selected item, which should trigger a new item to be selected
          items[1].removeAttribute('selected');

          // we wait for the mutation observer
          helpers.next(function() {
            // values should match the new selection
            expect(el.value).to.equal(items[0].value, 'Value should match the new selection');
            expect(el.values).to.deep.equal([items[0].value]);

            var selectedButtons = el.querySelectorAll('button[is=coral-button][selected]');
            expect(selectedButtons.length).to.equal(1);

            expect(items[1].hasAttribute('selected')).to.be.false;

            done();
          });
        });
      });
    });
  });

  // @todo: test collection events
  describe('Events', function() {

    describe('#change', function() {
      it('should not trigger change while setting values programatically', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.ButtonGroup.base.html'], function(el) {
          // adds the required listeners
          el.on('change', changeSpy);

          expect(changeSpy.callCount).to.equal(0);

          el.value = 'item3';
          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should trigger change when an unselected button is clicked', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.html'], function(el) {
          // adds the required listeners
          el.on('change', changeSpy);

          var buttons = el.items.getAll();

          buttons[2].click();

          expect(el.value).to.equal('item3');

          expect(changeSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should not trigger change when the selected button is clicked', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.html'], function(el) {
          // adds the required listeners
          el.on('change', changeSpy);

          // the 2nd item should be selected initially
          expect(el.value).to.equal('item1');

          var buttons = el.items.getAll();
          buttons[0].click();

          expect(el.value).to.equal('item1');

          expect(changeSpy.callCount).to.equal(0);
          done();
        });
      });

      it('should trigger change when unselected buttons are clicked and selectionMode = multiple', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.multiple.html'], function(el) {
          // adds the required listeners
          el.on('change', changeSpy);

          expect(el.value).to.equal('');

          var buttons = el.items.getAll();
          buttons[0].click();
          buttons[2].click();

          expect(el.value).to.equal('item1');
          expect(el.values).to.deep.equal(['item1', 'item3']);

          expect(changeSpy.callCount).to.equal(2);
          done();
        });
      });

      it('should trigger change when the selected button is clicked and selectionMode = multiple', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.multiple.html'], function(el) {
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
          done();
        });
      });
    });
  });

  describe('User Interaction', function() {
    it('nothing should happen when selectionMode = none', function(done) {
      helpers.build(window.__html__['Coral.ButtonGroup.base.html'], function(el) {
        var items = el.items.getAll();
        items[2].click();

        helpers.next(function() {
          expect(el.value).to.equal('');
          expect(el.items._getSelectedItems().length).to.equal(0);
          expect(items[2].hasAttribute('selected')).to.be.false;

          done();
        });
      });
    });

    it('should select the clicked item when selectionMode = single', function(done) {
      helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.html'], function(el) {
        var items = el.items.getAll();
        items[2].click();

        helpers.next(function() {
          expect(el.value).to.equal('item3');
          expect(el.items._getSelectedItems().length).to.equal(1);
          expect(items[2].hasAttribute('selected')).to.be.true;

          done();
        });
      });
    });

    it('should ignore a click on selected item when selectionMode = single', function(done) {
      helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.single.html'], function(el) {
        var items = el.items.getAll();
        // clicks the item that was already selected
        items[0].click();

        helpers.next(function() {
          expect(el.value).to.equal('item1');
          expect(el.items._getSelectedItems().length).to.equal(1);
          expect(items[0].hasAttribute('selected')).to.be.true;

          done();
        });
      });
    });

    it('should select the clicked item when selectionMode = multiple', function(done) {
      helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.multiple.selected.html'], function(el) {
        expect(el.values).to.deep.equal(['item2', 'item3']);

        var items = el.items.getAll();
        items[0].click();

        helpers.next(function() {
          expect(el.values).to.deep.equal(['item1', 'item2', 'item3']);
          expect(el.items._getSelectedItems().length).to.equal(3);
          expect(items[0].hasAttribute('selected')).to.be.true;

          done();
        });
      });
    });

    it('should toggle a selected item by clicking it when selectionMode = multiple', function(done) {
      helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.multiple.selected.html'], function(el) {
        expect(el.values).to.deep.equal(['item2', 'item3']);

        var items = el.items.getAll();
        items[2].click();

        helpers.next(function() {
          expect(el.values).to.deep.equal(['item2']);
          expect(el.items._getSelectedItems().length).to.equal(1);
          expect(items[2].hasAttribute('selected')).to.be.false;

          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    var el;
    var item1;

    beforeEach(function() {
      el = new Coral.ButtonGroup();
      item1 = new Coral.Button();

      el.appendChild(item1);

      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = item1 = null;
    });

    describe('#formField', function() {
      describe('#multiple mode', function() {
        helpers.testFormField(window.__html__['Coral.ButtonGroup.selectionMode.multiple.value.html'], {
          value: 'item1',
          default: ''
        });
      });

      describe('#single mode', function() {
        helpers.testFormField(window.__html__['Coral.ButtonGroup.selectionMode.single.value.html'], {
          value: 'item2',
          default: 'item1'
        });
      });
    });

    it('should be possible to move buttonGroup in dom without losing the current set "value"', function(done) {
      helpers.build(window.__html__['Coral.ButtonGroup.selectionMode.multiple.selected.html'], function(el) {
        el.value = 'item3';
        expect(el.value).to.equal('item3', '"item3" should be set as value');

        var form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);

        expect(el.value).to.equal('item3', '"item3" should STILL be set as value');

        el.value = 'item1';

        expect(el.value).to.equal('item1', '"item1" should now be set as value');

        done();
      });
    });

    it('should add "coral-ButtonGroup-item" class to children', function(done) {
      helpers.next(function() {
        expect(item1.$.hasClass('coral-ButtonGroup-item')).to.be.true;

        done();
      });
    });

    it('should remove "coral-ButtonGroup-item" class to children', function(done) {
      helpers.next(function() {
        expect(item1.$.hasClass('coral-ButtonGroup-item')).to.be.true;

        item1.remove();

        helpers.next(function() {
          expect(item1.$.hasClass('coral-ButtonGroup-item')).to.be.false;

          done();
        });
      });
    });
  });
});
