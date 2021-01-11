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
import {Masonry} from '../../../coral-component-masonry';
import {commons} from '../../../coral-utils';

describe('Masonry.Item', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(Masonry).to.have.property('Item');
    });
  });

  function testInstance(item) {
    expect(item.classList.contains('_coral-Masonry-item')).to.be.true;
    expect(item.getAttribute('tabindex')).to.equal('-1');
  }

  describe('Instantiation', function () {

    it('should be possible using new', function () {
      var item = helpers.build(new Masonry.Item());
      testInstance(item);
    });

    it('should be possible using createElement', function () {
      var item = helpers.build(document.createElement('coral-masonry-item'));
      testInstance(item);
    });

    it('should be possible using markup', function () {
      const item = helpers.build(window.__html__['Masonry.Item.text-article.html']);
      testInstance(item);
    });
  });

  describe('API', function () {

    var el;
    var item;
    var handle;

    beforeEach(function () {
      el = helpers.build(new Masonry());
      el.selectionMode = 'single';
      item = new Masonry.Item();
      el.appendChild(item);
    });

    afterEach(function () {
      el = null;
      item = null;
      handle = null;
    });

    describe('#selected', function () {
      it('should be false by default', function () {
        expect(item).to.have.property('selected', false);
        expect(item.hasAttribute('selected')).to.be.false;
        expect(item.classList.contains('is-selected')).to.be.false;
      });

      it('should toggle attribute and class', function () {
        item.selected = true;

        expect(item.hasAttribute('selected')).to.be.true;
        expect(item.classList.contains('is-selected')).to.be.true;
      });

      it('should toggle checkbox on selection', function () {
        item.selected = true;
        expect(item._elements.check.checked).to.be.true;

        item.selected = false;
        expect(item._elements.check.checked).to.be.false;
      });
    });

    describe('#content', function () {
      it('should not be null', function () {
        expect(item.content).to.not.equal(null);
      });

      it('should be possible to set content', function () {
        item.content.textContent = 'content';
        expect(item.content.textContent).to.equal('content');
      });
    });

    describe('#_removing', function () {
      it('should add is-removing class', function (done) {
        item.setAttribute('_removing', '');

        // Added in next frame for transition animation to be visible
        helpers.next(function () {
          expect(item.classList.contains('is-removing'));
          done();
        });
      });

      it('should temporarily add the item again but flag it as being removed', function () {
        el.removeChild(item);
        expect(item.hasAttribute('_removing')).to.be.true;
        expect(item.parentNode).to.equal(el);
      });

      // @flaky on FF
      it.skip('should remove the item transition classes', function (done) {
        el.removeChild(item);

        // Wait for layout schedule
        window.setTimeout(function () {
          expect(item.parentNode).to.equal(null);

          ['is-beforeInserting', 'is-inserting', 'is-removing'].forEach(function (className) {
            expect(item.classList.contains(className)).to.be.false;
          });

          done();
        }, 100);
      });
    });

    describe('#connectedCallback', function () {
      it('should add the is-managed class', function (done) {
        var item = new Masonry.Item();
        el.appendChild(item);

        // Wait for layout schedule
        window.setTimeout(() => {
          expect(item.classList.contains('is-managed')).to.be.true;
          done();
        }, 100);
      });

      it('should avoid connectedCallback when encounter skipped cases', function(done){
        const spy = sinon.spy();
        const el = helpers.build(window.__html__['Masonry.with.div.wrapper.html']);
        const masonry = el.querySelector("coral-masonry");
        const items = masonry.querySelectorAll("coral-masonry-item");
        const item1 = items[0];
        const item2 = items[1];

        masonry.on('coral-masonry-item:_connected', spy, true);

        const newItem = new Masonry.Item();
        newItem.content.innerHTML = "Hi";
        masonry.appendChild(newItem);

        expect(spy.calledOnce).to.be.true;

        spy.resetHistory();

        item1._ignoreConnectedCallback = true;
        masonry.appendChild(item1);

        expect(spy.notCalled).to.be.true;

        masonry.removeChild(item2);

        // let the removing transition to end
        commons.transitionEnd(item2, () => {
          helpers.next(function() {
            spy.resetHistory();
            // assume item is in connected state.
            item2._disconnected = false;
            masonry.appendChild(item2);

            expect(spy.notCalled).to.be.true;
            done();
          });
        });
      });
    });

    describe('#coral-masonry-draghandle', function () {
      const expectEnabled = (item, handle) => {
        expect(item._dragAction).to.not.be.null;
        expect(handle.classList.contains('u-coral-openHand')).to.be.true;
      };

      const expectDisabled = (item, handle) => {
        expect(item._dragAction).to.be.null;
        expect(handle.classList.contains('u-coral-openHand')).to.be.false;
      };

      beforeEach(function () {
        item = new Masonry.Item();
        handle = document.createElement('div');
        handle.setAttribute('coral-masonry-draghandle', '');
        item.appendChild(handle);
      });

      it('should allow to initialize drag action', function () {
        item._updateDragAction(true);
        expectEnabled(item, handle);
      });

      it('should allow to use the item itself as the handle', function () {
        item.setAttribute('coral-masonry-draghandle', '');
        item.innerHTML = '';
        item._updateDragAction(true);
        expectEnabled(item, item);
      });

      it('should allow to destroy drag action', function () {
        item._updateDragAction(true);
        item._updateDragAction(false);
        expectDisabled(item, handle);
      });

      it('should disable drag action if handle cannot be found', function () {
        handle.parentNode.removeChild(handle);
        item._updateDragAction(true);
        expectDisabled(item, handle);
      });
    });
  });

  describe('Attach/Detach', function () {
    describe('replacing masonry item', function () {
      it('with another masonry item using replaceChild', function (done) {
        const el = helpers.build(window.__html__['Masonry.with.div.wrapper.html']);
        const masonry = el.querySelector("coral-masonry");
        const oldItem = masonry.querySelector("coral-masonry-item");

        const newItem = new Masonry.Item();
        newItem.content.innerHTML = "Hi";

        masonry.replaceChild(newItem, oldItem);

        // Here we cannot test oldItem _disconnected and isConnected
        // because we again attach item with removing attribute to show transition.
        expect(oldItem.hasAttribute("_removing")).to.be.true;

        expect(newItem.isConnected).to.be.true;
        expect(newItem.parentElement).to.equal(masonry);
        expect(masonry.items.getAll().length).to.equal(2);

        const item = masonry.querySelector("coral-masonry-item");
        //wait for transition to end
        commons.transitionEnd(oldItem, () => {
          helpers.next(function () {
            expect(masonry.items.getAll().length).to.equal(2);
            // After transition, we test for oldItem _disconnected and isConnected
            expect(oldItem._disconnected).to.be.true;
            expect(oldItem.isConnected).to.be.false;
            expect(oldItem.parentElement).to.equal(null);
            done();
          });
        });
      });

      it('with another masonry item using replaceWith', function (done) {
        const el = helpers.build(window.__html__['Masonry.with.div.wrapper.html']);
        const masonry = el.querySelector("coral-masonry");
        const oldItem = masonry.querySelector("coral-masonry-item");

        const newItem = new Masonry.Item();
        newItem.content.innerHTML = "Hi";

        oldItem.replaceWith(newItem);

        // Here we cannot test oldItem _disconnected and isConnected
        // because we again attach item with removing attribute to show transition.
        expect(oldItem.hasAttribute("_removing")).to.be.true;

        expect(newItem.isConnected).to.be.true;
        expect(newItem.parentElement).to.equal(masonry);
        expect(masonry.items.getAll().length).to.equal(2);

        const item = masonry.querySelector("coral-masonry-item");
        //wait for transition to end
        commons.transitionEnd(oldItem, () => {
          helpers.next(function () {
            expect(masonry.items.getAll().length).to.equal(2);
            // after actual removal _disconnected is false and isConnected is true
            expect(oldItem._disconnected).to.be.true;
            expect(oldItem.isConnected).to.be.false;
            expect(oldItem.parentElement).to.equal(null);
            done();
          });
        });
      });
    });
  });

  describe('Accessibility', function () {
    it('should have an aria attribute for selection', function () {
      const el = new Masonry.Item();

      el.selected = true;
      expect(el.getAttribute('aria-selected')).to.equal('true');

      el.selected = false;
      expect(el.getAttribute('aria-selected')).to.equal('false');
    });
  });
});
