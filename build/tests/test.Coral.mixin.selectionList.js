describe('Coral.mixin.selectionList', function() {
  'use strict';

  var SNIPPET_BASE = window.__html__['Coral.mixin.selection.selectionList.base.html'];
  var buildTwoChildrenSnippet = helpers.build.bind(undefined, SNIPPET_BASE);

  var SNIPPET_NESTED = window.__html__['Coral.mixin.selection.selectionList.nested.html'];
  var buildNestedSnippet = helpers.build.bind(undefined, SNIPPET_NESTED);

  var SNIPPET_FORCE = window.__html__['Coral.mixin.selection.selectionList.forceSelection.html'];
  var SNIPPET_DOUBLE_PRESET_SINGLE = window.__html__['Coral.mixin.selection.selectionList.doublePresetSingle.html'];
  var SNIPPET_NO_MULTIPLE_SUPPORT_FORCE = window.__html__['Coral.mixin.selection.selectionList.noMultipleSupportForce.html'];

  var SNIPPET_TARGET = window.__html__['Coral.mixin.selection.selectionListTarget.html'];

  var SelectionListExample = Coral.register({
    tagName: 'coral-selectionlist-example',
    name: 'SelectionListExample',
    mixins: [
      Coral.mixin.selectionList({
        itemTagName: 'coral-selectionlist-exampleitem',
        role: 'coral-selectionlist-role',
        forceSelection: true
      })
    ]
  });

  var SelectionListItemExample = Coral.register({
    tagName: 'coral-selectionlist-exampleitem',
    name: 'SelectionListItemExample',
    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-selectionlist-example',
        role: 'coral-item-role'
      })
    ]
  });

  Coral.register({
    tagName: 'coral-selectionlist-targetexample',
    name: 'SelectionListTargetExample',
    mixins: [
      Coral.mixin.selectionList({
        itemTagName: 'coral-selectionlist-targetexampleitem',
        containerSelector: '.coral-Selectionlist-targetexamplecontent',
        role: 'coral-selectionlist-role',
        forceSelection: true
      })
    ],
    _render: function() {

      // move items to a wrapper element
      var wrapper = document.createElement('div');
      wrapper.className = 'coral-Selectionlist-targetexamplecontent';

      var items = this.querySelectorAll('coral-selectionlist-targetexampleitem');
      for (var i = 0; i < items.length; i++) {
        wrapper.appendChild(items[i]);
      }

      this.appendChild(wrapper);
    }
  });

  var SelectionListTargetItemExample = Coral.register({
    tagName: 'coral-selectionlist-targetexampleitem',
    name: 'SelectionListTargetItemExample',
    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-selectionlist-targetexample',
        role: 'coral-item-role'
      })
    ]
  });

  Coral.register({
    tagName: 'coral-selectionlist-no-multi-support-example',
    name: 'SelectionListNoMultiSupportExample',
    mixins: [
      Coral.mixin.selectionList({
        itemTagName: 'coral-selectionlist-no-multi-support-exampleitem',
        role: 'coral-selectionlist-role',
        forceSelection: true,
        supportMultiple: false
      })
    ]
  });

  Coral.register({
    tagName: 'coral-selectionlist-no-multi-support-exampleitem',
    name: 'SelectionListNoMultiSupportItemExample',
    mixins: [
      Coral.mixin.selectionList.Item({
        listSelector: 'coral-selectionlist-no-multi-support-example',
        role: 'coral-item-role'
      })
    ]
  });

  describe('namespace', function() {
    it('should be defined in Coral.mixin namespace', function() {
      expect(Coral.mixin).to.have.property('selectionList');
    });
  });

  describe('API', function() {

    it('#should add items as direct children per default', function(done) {

      helpers.build(SNIPPET_BASE, function(list) {
        expect(list.selectedItem.parentNode).to.equal(list);

        var myItem1 = list.items.add(new SelectionListItemExample());
        expect(myItem1.parentNode).to.equal(list, 'item should be added as direct child of list');

        done();
      });

    });

    it('#should be possible to decide where new items are added', function(done) {

      helpers.build(SNIPPET_TARGET, function(list) {
        var targetEl = list.querySelector('.coral-Selectionlist-targetexamplecontent');

        expect(list.selectedItem.parentNode).to.equal(targetEl, 'selected item should be moved inside the _render method');

        var myItem1 = list.items.add(new SelectionListTargetItemExample());
        expect(myItem1.parentNode).to.equal(targetEl, 'item should be added to the wrapper div now');

        done();
      });

    });

    it('should add an item with the right role', function(done) {
      var eventSpy = sinon.spy();

      buildTwoChildrenSnippet(function(selectionList) {
        selectionList.on('coral-collection:add', eventSpy);
        selectionList.items.add({});
        helpers.next(function() {
          expect(eventSpy.args[0][0].detail.item.tagName).to.equal('CORAL-SELECTIONLIST-EXAMPLEITEM');
          expect(eventSpy.args[0][0].detail.item.$).to.have.attr('role', 'coral-item-role');
          expect(selectionList.items.length).to.equal(3);
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:add should be called once');
          expect(selectionList.$.children()).to.have.attr('role', 'coral-item-role');
          done();
        });
      });
    });

    it('should remove an item', function(done) {
      var eventSpy = sinon.spy();

      buildTwoChildrenSnippet(function(selectionList) {
        selectionList.on('coral-collection:remove', eventSpy);
        selectionList.items.remove(selectionList.items.getAll()[0]);
        helpers.next(function() {
          expect(selectionList.items.length).to.equal(1);
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:remove should be called once');
          done();
        });
      });
    });

    it('should remove an item, nested', function(done) {

      buildNestedSnippet(function(outer) {

        var outerSpy = sinon.spy();
        var inner1Spy = sinon.spy();
        var inner2Spy = sinon.spy(function(event) {
          event.stopPropagation();
        });

        var inner1 = outer.$.find('#inner1').get(0);
        var inner2 = outer.$.find('#inner2').get(0);

        outer.on('coral-collection:remove', outerSpy);
        inner1.on('coral-collection:remove', inner1Spy);
        inner2.on('coral-collection:remove', inner2Spy);

        inner2.items.getAll()[0].remove();

        helpers.next(function() {
          expect(inner2.items.length).to.equal(1);
          expect(inner2Spy.callCount).to.equal(1, 'coral-collection:remove should be called once');

          expect(outer.items.length, 'outer should have 2 children').to.equal(2);
          expect(outerSpy.callCount, 'outer should not fire removed events').to.equal(0);

          expect(inner1.items.length, 'inner1 should have 2 children').to.equal(2);
          expect(inner1Spy.callCount, 'inner1 should fire no removed events').to.equal(0);

          done();
        });
      });
    });

    describe('single mode', function() {
      it('should remove double set selection at init time', function(done) {
        helpers.build(SNIPPET_DOUBLE_PRESET_SINGLE, function(list) {
          expect(list.selectedItem).to.not.be.null;
          expect(list.selectedItem.id).to.equal('item2');
          expect(list.$.find('[selected]').length).to.equal(1);
          done();
        });
      });
    });

    describe('forced selection', function() {
      it('should set the first item selected', function(done) {
        helpers.build(SNIPPET_FORCE, function(list) {
          expect(list.multiple).to.be.false;
          expect(list.selectedItem).to.not.be.null;
          expect(list.selectedItem.id).to.equal('item1');
          done();
        });
      });
    });

    describe('no multiple support forced selection', function() {
      var list;
      beforeEach(function(done){
        helpers.build(SNIPPET_NO_MULTIPLE_SUPPORT_FORCE, function(_list) {
          list = _list;
          done();
        });
      });
      it('should have multiple set as false', function(done) {
        expect(list.multiple).to.be.false;
        done();
      });
      it('should enforce multiple attribute as read-only', function(done) {
        list.multiple = true;
        expect(list.multiple).to.be.false;
        done();
      });
      it('should not have a selectedItems API', function(done) {
        expect(list.selectedItems).to.be.undefined;
        done();
      });
      it('should remove double set selection at init time', function(done) {
        expect(list.items).to.not.be.null;
        expect(list.selectedItem).to.not.be.null;
        expect(list.selectedItem.id).to.equal('item2');
        expect(list.$.find('[selected]').length).to.equal(1);
        done();
      });
    });

    describe('selection', function() {
      var list;
      var item;
      var item2;

      beforeEach(function() {
        list = new SelectionListExample();
        list.forceSelection = true;

        item = new SelectionListItemExample();
        list.appendChild(item);
        item.id = 'id1';

        item2 = new SelectionListItemExample();
        list.appendChild(item2);
        item2.id = 'id2';
      });

      it('disabling should make it unselected', function() {
        item.selected = 123;
        item.disabled = 123;

        expect(item.disabled, 'disabled').to.be.true;
        expect(item.hasAttribute('disabled'), 'disabled attr').to.be.true;
        expect(item.selected, 'selected').to.be.false;
        expect(item.hasAttribute('selected'), 'selected attr').to.be.false;
      });
    });

    describe('(private) _getSelectionList', function() {

      it('should return the correct parent', function() {
        var listA = new SelectionListExample();
        var listB = new SelectionListExample();

        var item = new SelectionListItemExample();
        listA.appendChild(item);

        expect(item._getSelectionList(), 'should be list A').to.equal(listA);

        item.remove();

        expect(item._getSelectionList(), 'should be undefined').to.be.undefined;

        listB.appendChild(item);

        expect(item._getSelectionList(), 'should be list B').to.equal(listB);
      });
    });

    describe('(private) _oldSelection', function() {
      it('should match the first item', function(done) {

        var changeSpy = sinon.spy();

        document.addEventListener('coral-selectionlist-example:change', changeSpy);

        helpers.build(window.__html__['Coral.mixin.selection.selectionList.base.html'], function(el) {

          expect(el._oldSelection).to.equal(el.items.getAll()[0]);
          expect(el.selectedItem).to.equal(el.items.getAll()[0]);
          expect(changeSpy.callCount).to.equal(0);

          done();
        });
      });

      it('should match the selected item', function(done) {

        var changeSpy = sinon.spy();

        document.addEventListener('coral-selectionlist-example:change', changeSpy);

        helpers.build(window.__html__['Coral.mixin.selection.selectionList.selected.html'], function(el) {

          expect(el._oldSelection).to.equal(el.items.getAll()[1]);
          expect(el.selectedItem).to.equal(el.items.getAll()[1]);
          expect(changeSpy.callCount).to.equal(0);

          done();
        });
      });

      it('should clear when a selected item was deleted', function(done) {

        var changeSpy = sinon.spy();

        document.addEventListener('coral-selectionlist-example:change', changeSpy);

        helpers.build(window.__html__['Coral.mixin.selection.selectionList.base.html'], function(el) {

          expect(el._oldSelection).to.equal(el.items.getAll()[0]);
          expect(el.selectedItem).to.equal(el.items.getAll()[0]);
          expect(changeSpy.callCount).to.equal(0);

          var item1 = el.items.getAll()[0];
          var item2 = el.items.getAll()[1];

          // force selection automatically chose the first item
          expect(el.selectedItem).to.equal(item1);

          // removes the selected item to check if the inner status remains correct
          item1.remove();

          // we need to wait a frame because in polyfilled environments the detachedCallback needs to be called
          helpers.next(function() {
            // it should have chosen "item2" since it is the next item in the component
            expect(el.selectedItem).to.equal(item2);
            // not it becomes the new "old selection"
            expect(el._oldSelection).to.equal(item2);

            // verifies that the change event was triggered, one for setting item2 and another one for item1 when item2
            // was removed
            expect(changeSpy.callCount).to.equal(1);

            // first call, it sets the item2 as the select item
            expect(changeSpy.getCall(0).args[0].target.selectedItem).to.equal(item2);

            expect(changeSpy.getCall(0).calledWithMatch({
              detail: {
                oldSelection: null,
                selection: item2
              }
            })).to.be.true;

            done();
          });
        });
      });
    });

    describe('(private) _isEmptySelection', function() {
      it('should be true if undefined, null, or an empty array', function() {
        var list = new SelectionListExample();
        expect(list._isEmptySelection()).to.be.true;
        var test = null;
        expect(list._isEmptySelection(test)).to.be.true;
        test = [];
        expect(list._isEmptySelection(test)).to.be.true;
      });
    });
  });

  describe('events', function() {
    describe(':change', function() {
      it('should not trigger a change when selected is in the DOM', function(done) {
        var changeSpy = sinon.spy();

        document.addEventListener('coral-selectionlist-example:change', changeSpy);

        helpers.build(window.__html__['Coral.mixin.selection.selectionList.selected.html'], function(el) {

          expect(el.selectedItem).to.equal(el.items.getAll()[1]);
          expect(changeSpy.callCount).to.equal(0);

          done();
        });

        it('should not trigger a change if the component finds the selected', function(done) {

          var changeSpy = sinon.spy();

          document.addEventListener('coral-selectionlist-example:change', changeSpy);

          helpers.build(window.__html__['Coral.mixin.selection.selectionList.base.html'], function(el) {

            expect(el.selectedItem).to.equal(el.items.getAll()[0]);
            expect(changeSpy.callCount).to.equal(0);

            done();
          });
        });

        it('should trigger a change if a new element is selected', function(done) {
          var changeSpy = sinon.spy();

          document.addEventListener('coral-selectionlist-example:change', changeSpy);

          helpers.build(window.__html__['Coral.mixin.selection.selectionList.selected.html'], function(el) {

            expect(changeSpy.callCount).to.equal(0);

            var item1 = el.items.getAll()[0];
            var item2 = el.items.getAll()[1];

            // selects the new item
            item1.selected = true;

            expect(el.selectedItem).to.equal(item1);

            expect(changeSpy.callCount).to.equal(1);

            expect(changeSpy.getCall(0).calledWithMatch({
              detail: {
                oldSelection: item2,
                selection: item1
              }
            })).to.be.true;

            done();
          });
        });

        it('should not trigger a change if the the same item is selected (via attribute)', function(done) {
          var changeSpy = sinon.spy();

          document.addEventListener('coral-selectionlist-example:change', changeSpy);

          helpers.build(window.__html__['Coral.mixin.selection.selectionList.selected.html'], function(list) {

            var item2 = list.items.getAll()[1];
            expect(list.selectedItem).to.equal(item2);

            expect(changeSpy.callCount).to.equal(0);

            // selects again the same item
            item2.selected = true;

            expect(list.selectedItem).to.equal(item2);

            expect(changeSpy.callCount).to.equal(0);

            done();
          });
        });

        it('should not trigger a change if the the same item is selected (via force selection)', function(done) {
          var changeSpy = sinon.spy();

          document.addEventListener('coral-selectionlist-example:change', changeSpy);

          helpers.build(window.__html__['Coral.mixin.selection.selectionList.base.html'], function(list) {

            var item1 = list.items.getAll()[0];
            // should automatically select the first item
            expect(list.selectedItem).to.equal(item1);

            expect(changeSpy.callCount).to.equal(0);

            // selects again the same item
            item1.selected = true;

            expect(list.selectedItem).to.equal(item1);

            expect(changeSpy.callCount).to.equal(0);

            done();
          });
        });
      });
    });
  });

  describe('coral-selectionlist-example', function() {
    helpers.testSelectionList(SelectionListExample, SelectionListItemExample);
  });
});
