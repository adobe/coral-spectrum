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
import {PanelStack, Panel} from '../../../coral-component-panelstack';

describe('PanelStack', function () {

  describe('Instantiation', function () {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-PanelStack')).to.be.true;
      expect(el.selectedItem).to.be.null;

      expect(el.hasAttribute('selectedItem')).to.be.false;
      expect(el.hasAttribute('items')).to.be.false;
    }

    it('should be possible using new', function () {
      var el = helpers.build(new PanelStack());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function () {
      var el = helpers.build(document.createElement('coral-panelstack'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function () {
      testDefaultInstance(helpers.build('<coral-panelstack></coral-panelstack>'));
    });

    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['PanelStack.base.html']
    );

    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new PanelStack()
    );
  });

  describe('API', function () {

    var el;
    var item1, item2, item3;

    beforeEach(function () {
      el = new PanelStack();

      item1 = new Panel();
      item1.content.innerHTML = 'Item 1';

      item2 = new Panel();
      item2.content.innerHTML = 'Item 2';

      item3 = new Panel();
      item3.content.innerHTML = 'Item 3';
    });

    afterEach(function () {
      el = item1 = item2 = item3 = null;
    });

    describe('#selectedItem', function () {

      it('should default to null', function () {
        expect(el.selectedItem).to.be.null;
        expect(el.items.length).to.equal(0);
      });

      it('should not automatically select an item', function () {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);

        expect(el.selectedItem).to.be.null;
        expect(item1.selected).to.be.false;
        expect(item1.hasAttribute('selected')).to.be.false;
      });

      it('selecting another item should modify #selectedItem', function () {
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

      it('removing an unselected item should not modify #selectedItem', function () {
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

      it('should be null if all items are removed', function () {
        el.appendChild(item1);
        item1.selected = true;

        expect(el.selectedItem).to.equal(item1);
        expect(item1.selected).to.be.true;
        expect(item1.hasAttribute('selected')).to.be.true;

        item1.remove();
        expect(el.selectedItem).to.be.null;
      });
    });

    it('should not automatically select an item if the current selected item is removed', function (done) {
      el.appendChild(item1);
      el.appendChild(item2);
      el.appendChild(item3);
      item1.selected = true;

      item1.remove();

      // Wait for MO
      helpers.next(function () {
        expect(el.selectedItem).to.be.null;
        expect(item2.selected).to.be.false;
        expect(item2.hasAttribute('selected')).to.be.false;
        expect(item3.selected).to.be.false;
        expect(item3.hasAttribute('selected')).to.be.false;
        done();
      });
    });

    it('should trigger a coral-panelstack:change event when an item is selected', function () {
      var spy = sinon.spy();
      el.on('coral-panelstack:change', spy);
      el.appendChild(item1);
      el.appendChild(item2);

      item1.selected = true;
      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(item1);
      expect(spy.args[0][0].detail.oldSelection).to.equal(null);

      spy = sinon.spy();
      el.on('coral-panelstack:change', spy);
      item2.selected = true;
      expect(spy.callCount).to.equal(1);
      expect(spy.args[0][0].detail.selection).to.equal(item2);
      expect(spy.args[0][0].detail.oldSelection).to.equal(item1);
    });
  });

  describe('Markup', function () {
    describe('#selectedItem', function () {
      it('should not automatically select an item', function () {
        const el = helpers.build(window.__html__['PanelStack.base.html']);
        expect(el.selectedItem).to.be.null;
      });

      it('should take the last selected', function () {
        helpers.target.innerHTML = window.__html__['PanelStack.doubleselected.html'];
        const el = document.querySelector('coral-panelstack');
        var items = el.items.getAll();
        expect(el.selectedItem).to.equal(items[2]);
        expect(items[2].selected).to.be.true;
        expect(items[1].selected).to.be.false;
        expect(items[1].hasAttribute('selected')).to.be.false;
        expect(items[2].selected).to.be.true;
      });

      it('should read the selected from the markup', function () {
        const el = helpers.build(window.__html__['PanelStack.selectedItem.html']);
        expect(el.selectedItem).to.equal(el.items.getAll()[1]);
      });
    });
  });

  describe('Implementation Details', function () {
  });

  describe('Collection API', function () {

    var el;
    var item1, item2, item3;
    var addSpy;
    var removeSpy;

    beforeEach(function () {
      el = helpers.build(new PanelStack());

      item1 = new Panel();
      item1.content.innerHTML = 'Item 1';

      item2 = new Panel();
      item2.content.innerHTML = 'Item 2';

      item3 = new Panel();
      item3.content.innerHTML = 'Item 3';
      addSpy = sinon.spy();
      removeSpy = sinon.spy();

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);
    });

    afterEach(function () {
      el.off('coral-collection:add', addSpy);
      el.off('coral-collection:remove', removeSpy);

      el = item1 = item2 = item3 = null;
      addSpy = removeSpy = undefined;
    });

    it('#items cannot be set', function () {
      el.appendChild(item1);
      el.appendChild(item2);

      var items = el.items;

      try {
        el.items = null;
      } catch (e) {
        expect(el.items).to.equal(items);
      }
    });

    it('triggers coral-collection:add on appendChild', function (done) {
      el.appendChild(item1);
      el.appendChild(item2);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item1);
      expect(all[1]).to.equal(item2);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function (done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['PanelStack.base.html']);

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);

      expect(el.items.length).to.equal(5);

      var all = el.items.getAll();
      var item = all[2];

      el.removeChild(item);

      expect(el.items.length).to.equal(4);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('triggers coral-collection:remove on removeChild', function (done) {
      el.items.add(item1);
      el.items.add(item2);
      el.items.add(item3);

      expect(el.items.length).to.equal(3);

      var all = el.items.getAll();
      var item = all[2];

      el.removeChild(item);

      expect(el.items.length).to.equal(2);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(3);
        expect(removeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('#add should add the item', function (done) {
      var ret = el.items.add(item1);
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(el.items.length).to.equal(1);
      expect(all.indexOf(item1)).to.equal(0);
      expect(ret).to.equal(item1);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add should also support config', function (done) {
      var ret = el.items.add({
        label: {
          innerHTML: 'Header 1'
        },
        selected: true,
        content: {
          innerHTML: 'content'
        }
      });
      var all = el.items.getAll();

      expect(all.length).to.equal(1);
      expect(all.indexOf(ret)).to.equal(0);

      expect(ret instanceof Panel).to.be.true;

      expect(ret.label.innerHTML).to.equal('Header 1');
      expect(ret.selected).to.be.true;
      expect(ret.content.innerHTML).to.equal('content');

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(1);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add with before null should insert at the end', function (done) {
      el.items.add(item1, null);
      el.items.add(item2, null);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item1);
      expect(all[1]).to.equal(item2);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#add is able to insert before', function (done) {
      el.items.add(item1);
      el.items.add(item2, item1);
      var all = el.items.getAll();

      expect(all.length).to.equal(2);
      expect(all[0]).to.equal(item2);
      expect(all[1]).to.equal(item1);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(2);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#remove should remove the item', function (done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['PanelStack.base.html']);

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);

      expect(el.items.length).to.equal(5);

      var all = el.items.getAll();
      var item = all[2];

      el.items.remove(item);

      expect(el.items.length).to.equal(4);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('#getAll should be empty initially', function (done) {
      var all = el.items.getAll();
      expect(all.length).to.equal(0);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('#clear should clear all the items', function (done) {
      var addSpy = sinon.spy();
      var removeSpy = sinon.spy();

      var el = helpers.build(window.__html__['PanelStack.base.html']);

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);

      expect(el.items.length).to.equal(5);
      el.items.clear();
      expect(el.items.length).to.equal(0);

      // Wait for MO
      helpers.next(function () {
        expect(addSpy.callCount).to.equal(0);
        expect(removeSpy.callCount).to.equal(5);
        done();
      });
    });
  });
});
