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

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {tracking, i18n} from '../../../coral-utils';
import {Multifield} from '../../../coral-component-multifield';

describe('Multifield', function () {
  // Mock for dragging
  function dragTo(dragAction, x, y) {
    var action = function (type, x, y) {
      dragAction[type]({
        pageX: x,
        pageY: y,
        preventDefault: function () {
        },
        target: {}
      });
    };
    action('_dragStart', 0, 0);
    action('_drag', x, y);
    action('_dragEnd', x, y);
  }

  describe('Namespace', function () {
    it('should be defined', function () {
      expect(Multifield).to.have.property('Item');
      expect(Multifield.Item).to.have.property('Content');
    });
  });

  describe('Instantation', function () {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['Multifield.nested.html']
    );

    var el = new Multifield();
    el.items.add();
    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });

  describe('API', function () {
    describe('#items', function () {
    });

    describe('#min', function () {
      it('remaining items should be added when items count less than min value', function () {
        var el = helpers.build(window.__html__['Multifield.min.html']);
        expect(el.items.length).to.be.equal(el.min);
      });

      it('remaining items should be added when min value increased to more than items count', function () {
        var el = helpers.build(window.__html__['Multifield.min.html']);
        el.min = 5;
        expect(el.items.length).to.be.equal(5);
      });

      it('no items should be added when min value decreased to less than items count', function () {
        var el = helpers.build(window.__html__['Multifield.min.html']);
        var initialCount = el.items.length;
        el.min = initialCount - 1;
        expect(initialCount).to.be.equal(3);
      });

      it('no items should be added when min value is greater than or equal to items count', function () {
        var el = helpers.build(`
          <coral-multifield id="multifieldWithMin" min="1">
            <coral-multifield-item>
              <input type="text"/>
            </coral-multifield-item>
            <coral-multifield-item>
              <input type="text"/>
            </coral-multifield-item>
            <template coral-multifield-template>
              <input type="text"/>
            </template>
            <button coral-multifield-add type="button">Add a field</button>
          </coral-multifield>`
        );
        expect(el.items.length).to.be.equal(2);
      });

      it('items should not be deletable when item count less than or equal to min', function (done) {
        var el = helpers.build(window.__html__['Multifield.min.html']);
        var initialCount = el.items.length;

        expect(initialCount).to.be.equal(el.min);

        //initial min validation takes 1 frame
        helpers.next(function() {
          el.items.getAll().forEach(function(item) {
            expect(item._deletable).to.be.false;
          });

          el.min = el.min + 1;

          expect(initialCount + 1).to.be.equal(el.min);

          el.items.getAll().forEach(function(item) {
            expect(item._deletable).to.be.false;
          });

          done();
        });
      });

      it('items should be deletable when item count greater than min', function (done) {
        var el = helpers.build(window.__html__['Multifield.min.html']);

        // initial min validation takes 1 frame
        helpers.next(function() {
          el.min = el.min - 1;
          el.items.getAll().forEach(function(item) {
            expect(item._deletable).to.be.true;
          });
          done();
        });
      });

      it('toggle items deletable state when items added from button click', function (done) {
        var el = helpers.build(window.__html__['Multifield.min.html']);
        el.querySelector('[coral-multifield-add]').click();
        // MO execution
        helpers.next(function() {
          el.items.getAll().forEach(function(item) {
            expect(item._deletable).to.be.true;
          });
          done();
        });
      });

      it('toggle items deletable state when items removed from button click and items count equal to min', function (done) {
        var el = helpers.build(window.__html__['Multifield.min.html']);

        el.min = 2;

        el.items.getAll()[0].querySelector('._coral-Multifield-remove').click();
        // MO execution
        helpers.next(function() {
          el.items.getAll().forEach(function(item) {
            expect(item._deletable).to.be.false;
          });
          done();
        });
      });
    });

    describe("#readonly", function() {
      it("readOnly property and attribute should be true when readonly is set", function() {
        var el = helpers.build(window.__html__['Multifield.readonly.html']);
        
        expect(el.readOnly).to.be.true;
        expect(el.hasAttribute('readonly')).to.be.true;
      });

      it("should disable add, remove and move buttons when readonly is set", function() {
        var el = helpers.build(window.__html__['Multifield.readonly.html']);
        
        expect(el.querySelector('[coral-multifield-add]').disabled).to.be.true;

        el.items.getAll().forEach(function(item) {
          expect(item.querySelector('[coral-multifield-move]').disabled).to.be.true;
          expect(item.querySelector('[coral-multifield-remove]').disabled).to.be.true;
        });
      });

      it("should enable add, remove and move buttons when readonly is unset", function() {
        var el = helpers.build(window.__html__['Multifield.readonly.html']);
        
        el.readOnly = false;
        expect(el.querySelector('[coral-multifield-add]').disabled).to.be.false;

        el.items.getAll().forEach(function(item) {
          expect(item.querySelector('[coral-multifield-move]').disabled).to.be.false;
          expect(item.querySelector('[coral-multifield-remove]').disabled).to.be.false;
        });
      });

      it("editable fields in multifield should be readable when reaadonly is set", function(done) {
        var el = helpers.build(window.__html__['Multifield.readonly.html']);

        helpers.next(() => {
          el.items.getAll().forEach((item) => {
            var allFields = item.content.querySelectorAll("*");

            Array.prototype.forEach.call(allFields, (field) => {
              if(typeof field.readOnly === "boolean") {
                console.log(field);
                expect(field.readOnly).to.be.true;
              }
            });
          });
          done();
        });
      });

      it("multifield template fields should not be affected when readonly is set", function() {
        var el = helpers.build(window.__html__['Multifield.readonly.html']);

        var template = el.querySelector('template');

        var allFields = template.querySelectorAll("*");

        Array.prototype.forEach.call(allFields, (field) => {
          if(typeof field.readOnly === "boolean") {
            expect(field.readOnly).to.be.false;
          }
        });
      });

      it("should add item with disabled move and remove button when readonly is set and item count less than min", function() {
        var el = helpers.build(`
          <coral-multifield readOnly min="3">
            <coral-multifield-item>
              <input type="text" value="Hello"/>
            </coral-multifield-item>
            <coral-multifield-item>
              <input type="text" value="World"/>
            </coral-multifield-item>
            <button coral-multifield-add type="button" is="coral-button">Add a field</button>
            <template coral-multifield-template>
              <input type="text"/>
            </template>
          </coral-multifield>
        `);
        
        expect(el.querySelector('[coral-multifield-add]').disabled).to.be.true;
        expect(el.items.getAll().length).to.be.equal(3);

        el.items.getAll().forEach(function(item) {
          expect(item.querySelector('[coral-multifield-move]').disabled).to.be.true;
          expect(item.querySelector('[coral-multifield-remove]').disabled).to.be.true;
        });
      });
    })

    describe('#template', function () {
    });
    describe('#coral-multifield-add', function () {
    });
    describe('#coral-multifield-template', function () {
    });
  });

  describe('Markup', function () {
    describe('#items', function () {
    });
    describe('#template', function () {
    });
    describe('#coral-multifield-add', function () {
    });
    describe('#coral-multifield-template', function () {
    });
  });

  describe('Collection API', function () {
    it('#items cannot be set', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      var items = el.items;
      try {
        el.items = null;
      } catch (e) {
        expect(el.items).to.equal(items);
      }
    });

    it('triggers coral-collection:add on appendChild', function (done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:add', eventSpy);
      var item = el.appendChild(new Multifield.Item());

      // Wait for MO
      helpers.next(function () {
        var all = el.items.getAll();
        expect(all.length).to.equal(1);
        expect(all[0]).to.equal(item);
        expect(eventSpy.callCount).to.equal(1);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function (done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:remove', eventSpy);
      var item = el.items.add({});

      // Wait for MO
      helpers.next(function () {
        el.removeChild(item);

        // Wait for MO
        helpers.next(function () {
          expect(el.items.length).to.equal(0);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('#add with before null should insert at the beginning if there are no items', function () {
      var el = new Multifield();
      var item = new Multifield.Item();
      el.items.add(item, null);
      var all = el.items.getAll();
      expect(all.length).to.equal(1);
      expect(all[0]).to.equal(item);
      expect(el.firstChild).to.equal(all[0]);
    });

    it('#add with before null should insert at the end of the last item if at least one item', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item(), null);
      var item = el.items.add(new Multifield.Item(), null);
      var all = el.items.getAll();
      expect(all.length).to.equal(2);
      expect(all[1]).to.equal(item);
      expect(all[0].nextElementSibling).to.equal(all[1]);
    });

    it('#add is able to insert before', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item());
      var item = el.items.add(new Multifield.Item(), el.items.getAll()[0]);
      var all = el.items.getAll();
      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item);
    });

    it('#add should also support config', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      var item = el.items.add({});
      var all = el.items.getAll();
      expect(all.length).to.equal(1);
      expect(all[0]).to.equal(item);
      expect(item.tagName).to.equal('CORAL-MULTIFIELD-ITEM');
    });

    it('should trigger coral-collection:add event when adding an item', function (done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:add', eventSpy);
      el.items.add(new Multifield.Item());

      // Wait for MO
      helpers.next(function () {
        expect(eventSpy.callCount).to.equal(1, 'coral-collection:add should be called once');
        done();
      });
    });

    it('should trigger coral-collection:remove event when removing an item', function (done) {
      var eventSpy = sinon.spy();
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.on('coral-collection:remove', eventSpy);
      el.items.add(new Multifield.Item());

      // Wait for MO
      helpers.next(function () {

        el.items.remove(el.items.getAll()[0]);

        // Wait for MO
        helpers.next(function () {
          expect(eventSpy.callCount).to.equal(1, 'coral-collection:remove should be called once');
          expect(el.items.length).to.equal(0);
          done();
        });
      });
    });

    it('#getAll should be empty initially', function () {
      expect((new Multifield()).items.getAll().length).to.equal(0);
    });

    it('#getAll should retrieve 1 item', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item());
      expect(el.items.getAll().length).to.equal(1);
    });

    it('#clear should remove all items', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add(new Multifield.Item());
      el.items.add(new Multifield.Item());
      el.items.clear();
      expect(el.items.length).to.equal(0);
    });
  });

  describe('User Interaction', function () {
    it('should add an item if clicking the add content zone', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.querySelector('[coral-multifield-add]').click();

      expect(el.items.length).to.equal(1);
    });

    it('should remove an item if clicking the remove button', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add({});
      el.items.add({});
      el.items.add({});
      el.items.getAll()[1]._elements.remove.focus();
      el.items.getAll()[1]._elements.remove.click();

      expect(el.items.length).to.equal(2);

      // when item is removed, focus should be restored to remove button on next element
      expect(el.items.getAll()[1]._elements.remove).to.equal(document.activeElement);
      document.activeElement.click();

      expect(el.items.length).to.equal(1);

      // when item is removed with no next item, focus should be restored to remove button on previous element
      expect(el.items.getAll()[0]._elements.remove).to.equal(document.activeElement);
      document.activeElement.click();

      expect(el.items.length).to.equal(0);

      // when the last item is removed, focus should be restored to the add button
      expect(el.querySelector('[coral-multifield-add]')).to.equal(document.activeElement);
    });

    describe('#reorderupdown', function() {
      it('should move up if up button is clicked', function() {
        const el = helpers.build(window.__html__['Multifield.redorderupdown.html']);
        el.items.getAll()[1].querySelector('[coral-multifield-up]').click();

        expect(el.items.length).to.equal(2);
        expect(el.items.getAll()[0].querySelector('input').value).equal('London');
        expect(el.items.getAll()[1].querySelector('input').value).equal('Basel');
      });

      it('should move down if down button is clicked', function() {
        const el = helpers.build(window.__html__['Multifield.redorderupdown.html']);
        el.items.getAll()[0].querySelector('[coral-multifield-down]').click();

        expect(el.items.length).to.equal(2);
        expect(el.items.getAll()[0].querySelector('input').value).equal('London');
        expect(el.items.getAll()[1].querySelector('input').value).equal('Basel');
      });
    });
  });

  describe('Events', function () {

    describe('#change', function () {
      it('should not trigger change event if item is removed and parent is not multifield', function () {
        var eventSpy = sinon.spy();
        var item = new Multifield.Item();
        helpers.target.appendChild(item);
        item.parentNode.addEventListener('change', eventSpy);
        item._elements.remove.click();

        expect(eventSpy.callCount).to.equal(0);
      });

      it('should trigger a change event if removing a button by clicking the remove button', function () {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        var item = el.items.add({});
        item._elements.remove.click();

        expect(eventSpy.callCount).to.equal(1);
      });

      it('should trigger a change event if reordering the items by drag and drop to bottom', function (done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        el.items.add({});
        el.items.add({});

        // Wait for MO
        helpers.next(function () {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should trigger a change event if reordering the items by drag and drop to top', function (done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        el.items.add({});
        el.items.add({});

        // Wait fo MO
        helpers.next(function () {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[1].dragAction, 0, 0);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    describe('#itemorder', function () {
      it('should trigger a coral-multifield:itemorder event when reordering', function (done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('coral-multifield:itemorder', eventSpy);
        el.items.add({});
        el.items.add({});
        helpers.next(function () {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should trigger a coral-multifield:beforeitemorder event before reordering', function (done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('coral-multifield:beforeitemorder', eventSpy);
        el.items.add({});
        el.items.add({});
        helpers.next(function () {
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });

      it('should not trigger change event if coral-multifield:beforeitemorder event was prevented', function (done) {
        var eventSpy = sinon.spy();
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.addEventListener('change', eventSpy);
        el.items.add({});
        el.items.add({});
        helpers.next(function () {
          el.addEventListener('coral-multifield:beforeitemorder', function (e) {
            e.preventDefault();
            return false;
          });
          expect(el.items.length).to.equal(2);
          dragTo(el.items.getAll()[0].dragAction, 0, 100);
          expect(eventSpy.callCount).to.equal(0);
          done();
        });
      });
    });
  });

  describe('Implementation Details', function () {
    it('should support nested multifield', function (done) {
      const el = helpers.build(window.__html__['Multifield.nested.html']);
      el.items.add();

      // Wait for MO
      helpers.next(function () {
        var firstNested = el.items.first().content.firstElementChild;
        var lastNested = el.items.last().content.firstElementChild;
        expect(lastNested.tagName).to.equal(firstNested.tagName);
        expect(lastNested.items.length).to.equal(firstNested.items.length);
        expect(lastNested.template.innerHTML).to.equal(firstNested.template.innerHTML);
        done();
      });
    });
  });

  describe('Tracking', function () {
    var trackerFnSpy;

    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });

    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });

    it('should call tracker callback only once when the "add" button is clicked', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.querySelector('[coral-multifield-add]').click();
      helpers.next(function () {
        expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should be called once.');
        done();
      });
    });

    it('should call tracker callback with expected track data values when the "add" button is clicked', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.querySelector('[coral-multifield-add]').click();
      helpers.next(function () {
        var spyCall = trackerFnSpy.getCall(0);
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetType', 'add item button');
        expect(trackData).to.have.property('targetElement', 'tag cloud');
        expect(trackData).to.have.property('eventType', 'click');
        expect(trackData).to.have.property('rootFeature', 'sites');
        expect(trackData).to.have.property('rootElement', 'tag cloud');
        expect(trackData).to.have.property('rootType', 'coral-multifield');
        done();
      });
    });

    it('should call tracker callback with expected track data values when "remove" button is clicked', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.querySelector('[coral-multifield-add]').click();

      helpers.next(function () {
        // Click on remove.
        el.querySelector('button[handle="remove"]').click();

        helpers.next(function () {
          expect(trackerFnSpy.callCount).to.equal(2, 'Track callback should be called twice.');
          var spyCall = trackerFnSpy.getCall(1);
          var trackData = spyCall.args[0];
          expect(trackData).to.have.property('targetType', 'remove item button');
          expect(trackData).to.have.property('targetElement', 'tag cloud');
          expect(trackData).to.have.property('eventType', 'click');
          expect(trackData).to.have.property('rootFeature', 'sites');
          expect(trackData).to.have.property('rootElement', 'tag cloud');
          expect(trackData).to.have.property('rootType', 'coral-multifield');
          done();
        });
      });
    });

    it('should call tracker callback with expected track data values when a field value changes', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.trackingOnWithAttrs.html']);
      el.items.add(new Multifield.Item());

      helpers.next(function () {
        var inputEl = el.querySelector('input');
        inputEl.value = 'a';
        helpers.event('change', inputEl, {bubbles: true});

        var spyCall = trackerFnSpy.getCall(0);
        var targetData = spyCall.args[0];

        expect(trackerFnSpy.callCount).to.equal(1);
        expect(targetData).to.have.property('targetType', 'input');
        expect(targetData).to.have.property('eventType', 'change');
        done();
      });
    });
  });

  describe('Accessibility', function () {
    it('should update aria-posinset, aria-setsize and aria-label for items', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.html']);

      function testPosInSet() {
        const items = el.items.getAll();
        items.forEach((item, index) => {
          expect(item.getAttribute('aria-posinset')).to.equal(`${index + 1}`);
          expect(item.getAttribute('aria-setsize')).to.equal(`${items.length}`);
          expect(item.getAttribute('aria-label')).to.equal(`(${index + 1} of ${items.length})`);
        });
      }

      el.items.add({});
      el.items.add({});
      el.items.add({});

      helpers.next(() => {
        testPosInSet();

        el.items.getAll()[1]._elements.remove.focus();
        el.items.getAll()[1]._elements.remove.click();
        helpers.next(() => {
          testPosInSet();

          document.activeElement.click();

          helpers.next(() => {
            testPosInSet();

            done();
          });
        });
      });
    });

    it('should not have role list attribute set initially', function () {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      expect(el.items.getAll().length).to.equal(0);
      expect(el.getAttribute('role')).to.be.null;
    });

    it('should have role list attribute set after adding item', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add({});
      helpers.next(() => {
        expect(el.items.getAll().length).to.equal(1);
        expect(el.getAttribute('role')).to.equal('list');
        done();
      });
    });

    it('should not have role list attribute set after removing all items', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.items.add({});
      el.items.add({});
      helpers.next(() => {
        expect(el.items.getAll().length).to.equal(2);
        expect(el.getAttribute('role')).to.equal('list');
        el.items.clear();
        helpers.next(() => {
          expect(el.items.getAll().length).to.equal(0);
          expect(el.getAttribute('role')).to.be.null;
          done();
        });
      });
    });

    it('should focus the input in item after adding new item', function (done) {
      const el = helpers.build(window.__html__['Multifield.base.html']);
      el.querySelector('[coral-multifield-add]').click();
      helpers.next(function() {
        const items = el.items.getAll();
        const setsize = items.length;
        const itemFocused = items[setsize - 1];
        const inputItemFocused = itemFocused.querySelector('coral-multifield-item-content > input');
        const hasFocus = document.activeElement === inputItemFocused;
        expect(hasFocus).to.be.true;
        done();
      });
    });

    describe('keyboard reordering', function () {
      it('should toggle aria-grabbed and force forms mode when move button is clicked', function () {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        expect(moveButton.getAttribute('role')).to.be.null;
        expect(moveButton.getAttribute('aria-roledescription')).to.equal(i18n.get('reorder_drag_handle'));
        expect(moveButton.getAttribute('title')).to.equal(i18n.get('reorder_hint'));
        expect(moveButton.getAttribute('aria-grabbed')).to.equal('false');
        moveButton.focus();
        moveButton.click();
        expect(moveButton.getAttribute('role')).to.equal('application');
        expect(moveButton.getAttribute('aria-grabbed')).to.equal('true');
        moveButton.click();
        expect(moveButton.getAttribute('role')).to.be.null;
        expect(moveButton.getAttribute('aria-grabbed')).to.equal('false');
      });

      it('ArrowUp should move current item before previous item in the collection', function (done) {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        moveButton.click();
        helpers.keypress('up', moveButton);
        helpers.next(() => {
          expect(items[1]).to.equal(el.items.getAll()[0]);
          helpers.keypress('up', moveButton);
          helpers.next(() => {
            expect(items[1]).to.equal(el.items.getAll()[0]);
            done();
          });
        });
      });

      it('ArrowDown should move current item after next item in the collection', function (done) {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        moveButton.click();
        helpers.keypress('down', moveButton);
        helpers.next(() => {
          expect(items[1]).to.equal(el.items.getAll()[2]);
          helpers.keypress('down', moveButton);
          helpers.next(() => {
            expect(items[1]).to.equal(el.items.getAll()[2]);
            done();
          });
        });
      });

      it('Home should move current item befor first item in the collection', function (done) {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        moveButton.click();
        helpers.keypress('home', moveButton);
        helpers.next(() => {
          expect(items[1]).to.equal(el.items.getAll()[0]);
          helpers.keypress('home', moveButton);
          helpers.next(() => {
            expect(items[1]).to.equal(el.items.getAll()[0]);
            done();
          });
        });
      });

      it('End should move current item after last item in the collection', function (done) {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        moveButton.click();
        helpers.keypress('end', moveButton);
        helpers.next(() => {
          expect(items[1]).to.equal(el.items.getAll()[2]);
          helpers.keypress('end', moveButton);
          helpers.next(() => {
            expect(items[1]).to.equal(el.items.getAll()[2]);
            done();
          });
        });
      });

      it('Esc should cancel and should restore item to its original position in the collection', function (done) {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        moveButton.click();
        helpers.keypress('down', moveButton);
        helpers.next(() => {
          expect(items[1]).to.equal(el.items.getAll()[2]);
          helpers.keypress('esc', moveButton);
          helpers.next(() => {
            expect(items[1]).to.equal(el.items.getAll()[1]);
            expect(moveButton.getAttribute('role')).to.be.null;
            expect(moveButton.getAttribute('aria-grabbed')).to.equal('false');
            done();
          });
        });
      });

      it('Clicking move button should commit the move, setting item to its new position in the collection', function (done) {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        var changeSpy = sinon.spy();
        var beforeItemOrderSpy = sinon.spy();
        var itemOrderSpy = sinon.spy();
        el.addEventListener('change', changeSpy);
        el.addEventListener('coral-multifield:beforeitemorder', beforeItemOrderSpy);
        el.addEventListener('coral-multifield:itemorder', itemOrderSpy);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        moveButton.click();
        helpers.keypress('down', moveButton);
        helpers.next(() => {
          expect(items[1]).to.equal(el.items.getAll()[2]);
          moveButton.click();
          helpers.next(() => {
            expect(items[1]).to.equal(el.items.getAll()[2]);
            expect(moveButton.getAttribute('role')).to.be.null;
            expect(moveButton.getAttribute('aria-grabbed')).to.equal('false');
            expect(changeSpy.calledOnce).to.be.true;
            expect(beforeItemOrderSpy.calledOnce).to.be.true;
            expect(itemOrderSpy.calledOnce).to.be.true;
            done();
          });
        });
      });

      it('Blurring move button should commit the move, setting item to its new position in the collection', function (done) {
        const el = helpers.build(window.__html__['Multifield.base.html']);
        el.items.add({});
        el.items.add({});
        el.items.add({});
        let items = el.items.getAll();
        let moveButton = items[1]._elements.move;
        moveButton.click();
        helpers.keypress('down', moveButton);
        helpers.next(() => {
          expect(items[1]).to.equal(el.items.getAll()[2]);
          moveButton.blur();
          helpers.next(() => {
            expect(items[1]).to.equal(el.items.getAll()[2]);
            expect(moveButton.getAttribute('role')).to.be.null;
            expect(moveButton.getAttribute('aria-grabbed')).to.equal('false');
            done();
          });
        });
      });
    });
  });
});
