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
import {tracking} from '../../../coral-utils';
import {Step, StepList} from '../../../coral-component-steplist';

describe('StepList', function () {
  describe('Namespace', function () {

    it('should define the interaction in an enum', function () {
      expect(StepList.interaction).to.exist;
      expect(StepList.interaction.ON).to.equal('on');
      expect(StepList.interaction.OFF).to.equal('off');
      expect(Object.keys(StepList.interaction).length).to.equal(2);
    });

    it('should define the size in an enum', function () {
      expect(StepList.size).to.exist;
      expect(StepList.size.SMALL).to.equal('S');
      expect(StepList.size.LARGE).to.equal('L');
      expect(Object.keys(StepList.size).length).to.equal(2);
    });
  });

  function testDefaultInstance(el) {
    expect(el.getAttribute('role')).to.equal('list');
    expect(el.getAttribute('aria-label')).to.equal('Step List');
    expect(el.hasAttribute('aria-multiselectable')).to.be.false;
    expect(el.classList.contains('_coral-Steplist')).to.be.true;
    expect(el.selectedItem).to.be.null;
  }

  describe('Instantiation', function () {
    it('should be possible using new', function () {
      var el = helpers.build(new StepList());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function () {
      var el = helpers.build(document.createElement('coral-steplist'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function () {
      const el = helpers.build('<coral-steplist></coral-steplist>');
      testDefaultInstance(el);
    });

    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['StepList.base.html']
    );

    helpers.cloneComponent(
      'should be possible to clone using js',
      new StepList()
    );
  });

  describe('API', function () {
    var el;
    var item1;
    var item2;
    var item3;

    beforeEach(function () {
      el = helpers.build(new StepList());

      item1 = new Step();
      item1.label.innerHTML = 'Item 1';

      item2 = new Step();
      item2.label.innerHTML = 'Item 2';

      item3 = new Step();
      item3.label.innerHTML = 'Item 3';
    });

    afterEach(function () {
      el = item1 = item2 = item3 = null;
    });

    describe('#interaction', function () {
    });
    describe('#size', function () {
      it('should support Coral.StepList.size.SMALL', function (done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
        el.size = StepList.size.SMALL;
        var steps = el.items.getAll();
        helpers.next(function () {
          for (var i = 0 ; i < steps.length ; i++) {
            expect(steps[i].label.classList.contains('u-coral-screenReaderOnly')).to.be.true;
            expect(steps[i].label.style.display).to.equal('block');
          }
          el.size = StepList.size.LARGE;
          helpers.next(function () {
            for (var i = 0 ; i < steps.length ; i++) {
              expect(steps[i].label.classList.contains('u-coral-screenReaderOnly')).to.be.false;
              expect(steps[i].label.style.display).to.equal('');
            }
            item1.labelled = item1.label.textContent;
            el.size = StepList.size.SMALL;
            helpers.next(function () {
              expect(item1.label.classList.contains('u-coral-screenReaderOnly')).to.be.false;
              expect(item1.label.style.display).to.equal('');
              expect(item1._elements.stepMarkerContainer.getAttribute('aria-label')).to.equal(item1.label.textContent);
              expect(item1._elements.stepMarkerContainer.hasAttribute('aria-hidden')).to.be.false;
              for (var i = 1 ; i < steps.length ; i++) {
                expect(steps[i].label.classList.contains('u-coral-screenReaderOnly')).to.be.true;
                expect(steps[i].label.style.display).to.equal('block');
              }
              done();
            });
          });
        });
      });
    });
    describe('#target', function () {
    });
    describe('#selectedItem', function () {

      it('should default to null', function () {
        expect(el.selectedItem).to.be.null;
        expect(el.items.length).to.equal(0);
      });

      it('should automatically select the first available item', function (done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);

        // Wait for MO
        helpers.next(function () {
          expect(el.selectedItem).to.equal(item1);
          expect(item1.selected).to.be.true;
          expect(item1.hasAttribute('selected')).to.be.true;
          done();
        });
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


      it('should be the first available item, if the current selected item is removed', function (done) {
        el.appendChild(item1);
        el.appendChild(item2);
        el.appendChild(item3);
        item1.selected = true;

        item1.remove();

        // Wait for MO
        helpers.next(function () {
          expect(el.selectedItem).to.equal(item2);
          expect(item2.selected).to.be.true;
          expect(item2.hasAttribute('selected')).to.be.true;
          expect(item3.selected).to.be.false;
          expect(item3.hasAttribute('selected')).to.be.false;
          done();
        });
      });
    });

    describe('#previous()', function () {
    });
    describe('#next()', function () {
    });
  });

  describe('Markup', function () {
    describe('#interaction', function () {
    });
    describe('#size', function () {
      it('should support Coral.StepList.size.SMALL', function (done) {

        const el = helpers.build(window.__html__['StepList.base.html']);
        el.size = StepList.size.SMALL;
        const steps = el.items.getAll();
        const item1 = steps[0];
        helpers.next(function () {
          for (var i = 0 ; i < steps.length ; i++) {
            expect(steps[i].label.classList.contains('u-coral-screenReaderOnly')).to.be.true;
            expect(steps[i].label.style.display).to.equal('block');
          }
          el.size = StepList.size.LARGE;
          helpers.next(function () {
            for (var i = 0 ; i < steps.length ; i++) {
              expect(steps[i].label.classList.contains('u-coral-screenReaderOnly')).to.be.false;
              expect(steps[i].label.style.display).to.equal('');
            }
            item1.labelled = item1.label.textContent;
            el.size = StepList.size.SMALL;
            helpers.next(function () {
              expect(item1.label.classList.contains('u-coral-screenReaderOnly')).to.be.false;
              expect(item1.label.style.display).to.equal('');
              expect(item1._elements.stepMarkerContainer.getAttribute('aria-label')).to.equal(item1.label.textContent);
              expect(item1._elements.stepMarkerContainer.hasAttribute('aria-hidden')).to.be.false;
              for (var i = 1 ; i < steps.length ; i++) {
                expect(steps[i].label.classList.contains('u-coral-screenReaderOnly')).to.be.true;
                expect(steps[i].label.style.display).to.equal('block');
              }
              done();
            });
          });
        });
      });
    });
    describe('#target', function () {
    });
    describe('#selectedItem', function () {
      it('should default to the first item', function () {
        const el = helpers.build(window.__html__['StepList.base.html']);
        expect(el.selectedItem).to.equal(el.items.getAll()[0]);
      });

      it('should take the last selected', function () {
        helpers.target.innerHTML = window.__html__['StepList.doubleselected.html'];
        const el = helpers.target.querySelector('coral-steplist');
        var items = el.items.getAll();
        expect(el.selectedItem).to.equal(items[2]);
        expect(items[2].hasAttribute('selected')).to.be.true;
        expect(items[1].selected).to.be.false;
      });

      it('should read the selected from the markup', function () {
        const el = helpers.build(window.__html__['StepList.selectedItem.html']);
        expect(el.selectedItem).to.equal(el.items.getAll()[1]);
      });
    });
  });

  describe('Events', function () {

    describe('coral-steplist:change', function () {
      it('should not trigger an event when it initializes', function () {
        var changeSpy = sinon.spy();

        // adds the listener at the document level to see if something bubbles up when it is added to the DOM
        document.addEventListener('coral-steplist:change', changeSpy);

        const el = helpers.build(window.__html__['StepList.base.html']);
        expect(changeSpy.callCount).to.equal(0);
        // cleans the event
        document.removeEventListener('coral-steplist:change', changeSpy);
      });

      it('should trigger an event when next() is called', function () {
        const el = helpers.build(window.__html__['StepList.base.html']);
        var changeSpy = sinon.spy();

        el.on('coral-steplist:change', changeSpy);
        el.next();

        expect(changeSpy.callCount).to.equal(1);
      });

      it('should not trigger an event when next() on the last item', function () {
        const el = helpers.build(window.__html__['StepList.selectedItem.html']);

        var changeSpy = sinon.spy();

        el.on('coral-steplist:change', changeSpy);

        // goes to the 3rd item
        el.next();

        // nothing should happen
        el.next();

        expect(changeSpy.callCount).to.equal(1);
      });

      it('should trigger an event when previous() is called', function () {
        const el = helpers.build(window.__html__['StepList.selectedItem.html']);
        var changeSpy = sinon.spy();

        el.on('coral-steplist:change', changeSpy);
        el.previous();

        expect(changeSpy.callCount).to.equal(1);
      });

      it('should trigger a coral-steplist:change event when an item is selected', function () {
        const el = helpers.build(window.__html__['StepList.base.html']);
        var spy = sinon.spy();
        el.on('coral-steplist:change', spy);

        const item3 = el.items.last();
        item3.selected = true;
        expect(spy.callCount).to.equal(1);
        expect(spy.args[0][0].detail.selection).to.equal(item3);
        expect(spy.args[0][0].detail.oldSelection).to.equal(el.items.first());
      });
    });
  });

  describe('User Interaction', function () {
    var defaultMarkup = window.__html__['StepList.base.html'];
    var selectedItemMarkup = window.__html__['StepList.selectedItem.html'];

    it('should select step when marker clicked', function () {
      const el = helpers.build(defaultMarkup);
      // Turn interaction on
      el.interaction = StepList.interaction.ON;

      var items = el.items.getAll();

      expect(items.length).to.equal(5);
      expect(el.selectedItem).to.equal(items[0]);

      // Click the marker
      items[1]._elements.stepMarkerContainer.click();

      expect(items[0].selected).to.equal(false, 'item[0] is not selected');
      expect(items[0].classList.contains('is-selected')).to.be.false;
      expect(el.selectedItem).to.equal(items[1]);
      expect(items[1].selected).to.equal(true, 'item[1] is selected');
    });

    it('should select step when focused and enter pressed', function () {
      const el = helpers.build(defaultMarkup);
      // Turn interaction on
      el.interaction = StepList.interaction.ON;

      var items = el.items.getAll();

      expect(items.length).to.equal(5);
      expect(el.selectedItem).to.equal(items[0]);

      // Focus on the marker
      items[1].focus();

      // Press the enter key
      helpers.keypress(13, document.activeElement);

      expect(items[0].selected).to.equal(false, 'item[0] is not selected');
      expect(items[0].classList.contains('is-selected')).to.be.false;
      expect(el.selectedItem).to.equal(items[1]);
      expect(items[1].selected).to.equal(true, 'item[1] is selected');
    });

    it('should select the last step on end press', function () {
      const el = helpers.build(defaultMarkup);

      // we turn interaction on since keyboard is disabled otherwise
      el.interaction = StepList.interaction.ON;

      var items = el.items.getAll();

      expect(items.length).to.equal(5);
      expect(el.selectedItem).to.equal(items[0]);

      // focuses the item before producing the key press
      items[0].focus();
      expect(document.activeElement).to.equal(items[0]._elements.link);

      helpers.keypress('end', document.activeElement);

      expect(el.selectedItem).to.equal(items[4]);
      expect(document.activeElement).to.equal(items[4]._elements.link);
    });

    it('should select the first step on home press', function () {
      const el = helpers.build(selectedItemMarkup);

      // we turn interaction on since keyboard is disabled otherwise
      el.interaction = StepList.interaction.ON;

      var items = el.items.getAll();

      expect(el.selectedItem).to.equal(items[1]);

      // focuses the item before producing the key press
      items[1].focus();
      expect(document.activeElement).to.equal(items[1]._elements.link);

      helpers.keypress('home', document.activeElement);

      expect(el.selectedItem).to.equal(items[0]);
      expect(document.activeElement).to.equal(items[0]._elements.link);
    });

    it('should select the next step on pagedown, right, and down', function () {
      const el = helpers.build(defaultMarkup);

      // we turn interaction on since keyboard is disabled otherwise
      el.interaction = StepList.interaction.ON;

      var items = el.items.getAll();

      helpers.keypress('pagedown', items[0]._elements.link);

      expect(el.selectedItem).to.equal(items[1]);

      helpers.keypress('right', items[1]._elements.link);

      expect(el.selectedItem).to.equal(items[2]);

      helpers.keypress('down', items[2]._elements.link);

      expect(el.selectedItem).to.equal(items[3]);
    });

    it('should select the previous item on pageup, left and up', function () {
      const el = helpers.build(defaultMarkup);

      // we turn interaction on since keyboard is disabled otherwise
      el.interaction = StepList.interaction.ON;

      var items = el.items.getAll();

      // forces the selected item to be the last one
      helpers.keypress('end', items[0]._elements.link);
      expect(el.selectedItem).to.equal(items[4]);

      helpers.keypress('pageup', items[4]._elements.link);

      expect(el.selectedItem).to.equal(items[3]);

      helpers.keypress('left', items[3]._elements.link);

      expect(el.selectedItem).to.equal(items[2]);

      helpers.keypress('up', items[2]._elements.link);

      expect(el.selectedItem).to.equal(items[1]);
    });
  });

  describe('Implementation Details', function () {
    it('clicking the step should select the step', function () {
      const el = helpers.build(window.__html__['StepList.selectedItem.html']);
      el.interaction = 'on';
      var step1 = el.querySelector('[role=link]');
      step1.click();

      let item1 = el.items.first();
      expect(el.selectedItem).to.equal(item1);
      expect(item1.selected).to.be.true;
    });

    it('should select the target after being inserted in the DOM', function (done) {
      helpers.build(window.__html__['StepList.virtualtarget.html']);

      var stepItem = document.getElementById('stepItem');
      var targetItem = document.getElementById('targetItem');

      // Wait for target to be in the DOM
      helpers.next(function () {
        expect(targetItem.hasAttribute('selected')).to.be.true;
        expect(targetItem.getAttribute('aria-labelledby')).to.equal(stepItem.id);
        done();
      });
    });
  });

  describe('Collection API', function () {

    var el;
    var item1;
    var item2;
    var item3;
    var addSpy;
    var removeSpy;

    beforeEach(function () {
      el = helpers.build(new StepList());
      item1 = new Step();
      item2 = new Step();
      item3 = new Step();
      addSpy = sinon.spy();
      removeSpy = sinon.spy();

      el.on('coral-collection:add', addSpy);
      el.on('coral-collection:remove', removeSpy);
    });

    afterEach(function () {
      el.off('coral-collection:add', addSpy);
      el.off('coral-collection:remove', removeSpy);

      el = item1 = item2 = item3 = addSpy = removeSpy = undefined;
    });

    it('#items is readonly', function () {
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

      el = helpers.build(window.__html__['StepList.base.html']);

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
      expect(ret instanceof Step).to.be.true;

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

      el = helpers.build(window.__html__['StepList.base.html']);

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

      el = helpers.build(window.__html__['StepList.base.html']);

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

  describe('Tracking', function () {
    var trackerFnSpy;

    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });

    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });

    it('should not call the tracker callback if interaction is OFF', function () {
      const el = helpers.build(window.__html__['StepList.tracking.html']);
      // Turn interaction on
      el.interaction = StepList.interaction.OFF;
      var steps = el.items.getAll();
      steps[0]._elements.stepMarkerContainer.click();
      expect(trackerFnSpy.callCount).to.equal(0, 'Track callback should not be called.');
    });

    it('should call tracker callback with the expected tracker data when first step is clicked', function () {
      const el = helpers.build(window.__html__['StepList.tracking.html']);
      var steps = el.items.getAll();
      steps[0]._elements.stepMarkerContainer.click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should be called once.');

      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetType', 'coral-steplist-item');
      expect(trackData).to.have.property('targetElement', 'Step 1');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootType', 'coral-steplist');
    });

    it('should call tracker callback with the expected tracker data when an annotated step is clicked', function () {
      const el = helpers.build(window.__html__['StepList.tracking.html']);
      var steps = el.items.getAll();
      steps[1]._elements.stepMarkerContainer.click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Track callback should be called once.');

      var spyCall = trackerFnSpy.getCall(0);
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetType', 'coral-steplist-item');
      expect(trackData).to.have.property('targetElement', 'step two');
      expect(trackData).to.have.property('eventType', 'click');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootType', 'coral-steplist');
    });
  });
});
