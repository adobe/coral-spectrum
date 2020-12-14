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
import {Toast} from '../../../coral-component-toast';

describe('Toast', function () {
  const REDUCED_DURATION = 100;
  // We don't need this in most our test cases
  const moveToDocumentBody = Toast.prototype._moveToDocumentBody;
  Toast.prototype._moveToDocumentBody = function () {
  };

  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible via clone using markup',
      window.__html__['Toast.base.html']
    );

    helpers.cloneComponent(
      'should be possible via clone using markup with action',
      window.__html__['Toast.action.html']
    );

    // todo
    // helpers.cloneComponent(
    //   'should be possible via clone using js',
    //   new Toast()
    // );
  });

  describe('API', function () {
    var el;

    beforeEach(function () {
      el = new Toast();
    });

    afterEach(function () {
      el = null;
    });

    describe('#focusOnShow', function () {
      it('should default to OFF', function () {
        expect(el.focusOnShow).to.equal(Toast.focusOnShow.OFF);
      });
    });

    describe('#autoDismiss', function () {
      it('should default to 5 secs by default', function () {
        expect(el.autoDismiss).to.equal(5000);
      });

      it('should be settable to 0', function () {
        el.autoDismiss = 0;
        expect(el.autoDismiss).to.equal(0);
      });

      it('should not be lower that 5 secs', function () {
        el.autoDismiss = 2000;
        expect(el.autoDismiss).to.equal(5000);
      });

      it('should always return a number', function () {
        el.autoDismiss = '10000';
        expect(el.autoDismiss).to.equal(10000);
        el.autoDismiss = null;
        expect(el.autoDismiss).to.equal(10000);
      });
    });

    describe('#action', function () {
      it('should return null if not set', function () {
        expect(el.action).to.equal(null);
      });

      it('should only accept Button or AnchorButton elements', function () {
        let warnCalled = 0;
        const warn = console.warn;
        // Override console.warn to detect if it was called
        console.warn = function () {
          warnCalled++;
        };

        const div = document.createElement('div');
        const button = document.createElement('button', {is: 'coral-button'});
        const anchor = document.createElement('a', {is: 'coral-anchorbutton'});

        el.action = div;
        expect(el.action).to.equal(null);
        expect(warnCalled).to.equal(1);
        // Restore console.warn
        console.warn = warn;

        el.action = button;
        expect(el.action).to.equal(button);

        el.action = anchor;
        expect(el.action).to.equal(anchor);
      });

      it('should render the new action', function () {
        const button = document.createElement('button', {is: 'coral-button'});
        el.action = button;

        expect(button.hasAttribute('coral-toast-action')).to.be.true;
        expect(el._elements.body.contains(button)).to.be.true;
      });
    });

    describe('#open', function () {
      it('should be false by default', function () {
        expect(el.open).to.equal(false);
      });

      it('should be possible to open the toast even if not part of the DOM', function (done) {
        const toast = new Toast();

        // Restore to test it
        toast._moveToDocumentBody = moveToDocumentBody;

        toast.open = true;

        helpers.next(function () {
          expect(toast.parentNode === document.body).to.be.true;
          toast.remove();
          done();
        });
      });
    });

    describe('#content', function () {
      it('should only accept a coral-toast-content element', function () {
        expect(el.content.tagName).to.equal('CORAL-TOAST-CONTENT');
        const content = new Toast.Content();
        el.content = content;
        expect(el.content).to.equal(content);
      });

      it('should render the new content', function () {
        const content = new Toast.Content();
        el.content = content;
        expect(el._elements.body.contains(content)).to.be.true;
      });
    });

    describe('#placement', function () {
      it('should return center by default', function () {
        expect(el.placement).to.equal(Toast.placement.CENTER);
      });

      it('should only accept values from placement enum', function () {
        el.placement = 'left';
        expect(el.placement).to.equal(Toast.placement.LEFT);
        el.placement = 'right';
        expect(el.placement).to.equal(Toast.placement.RIGHT);
        el.placement = '';
        expect(el.placement).to.equal(Toast.placement.CENTER);
      });
    });

    describe('#variant', function () {
      it('should be set to "default" by default', function () {
        expect(el.variant).to.equal(Toast.variant.DEFAULT);
      });

      it('should only accept values from variant enum', function () {
        el.variant = 'error';
        expect(el.variant).to.equal(Toast.variant.ERROR);

        el.variant = 'success';
        expect(el.variant).to.equal(Toast.variant.SUCCESS);
        el.variant = 'info';
        expect(el.variant).to.equal(Toast.variant.INFO);
        el.variant = '';
        expect(el.variant).to.equal(Toast.variant.DEFAULT);
      });
    });
  });

  describe('Markup', function () {
    describe('#variant', function () {
      it('should reflect the default variant', function () {
        const el = helpers.build(window.__html__['Toast.base.html']);
        expect(el.getAttribute('variant')).to.equal(Toast.variant.DEFAULT);
      });

      it('should set a variant other than default', function () {
        const el = helpers.build(window.__html__['Toast.variant.html']);
        expect(el.variant).to.equal(Toast.variant.ERROR);
        expect(el.classList.contains('_coral-Toast--error')).to.be.true;
        expect(el.classList.contains('_coral-Toast--info')).to.be.false;

        el.variant = 'info';
        expect(el.variant).to.equal(Toast.variant.INFO);
        expect(el.getAttribute('variant')).to.equal(Toast.variant.INFO);
        expect(el.classList.contains('_coral-Toast--info')).to.be.true;
        expect(el.classList.contains('_coral-Toast--error')).to.be.false;
      });

      it('should render the variant icon', function () {
        const el = helpers.build(window.__html__['Toast.variant.html']);
        expect(el.querySelector('._coral-Toast-typeIcon')).to.not.equal(null);
      });
    });

    describe('#content', function () {
      it('should place the text into the content zone', function () {
        const el = helpers.build(window.__html__['Toast.base.html']);
        expect(el._elements.body.contains(el.content)).to.be.true;
        expect(el.content.textContent.trim()).to.equal('Text');
      });
    });

    describe('#action', function () {
      it('should set the defined action', function () {
        const el = helpers.build(window.__html__['Toast.action.html']);
        expect(el.action).to.not.equal(null);
        expect(el.content.textContent.trim()).to.equal('Text');
      });
    });

    describe('#open', function () {
      it('should add it to the queue', function () {
        const el = helpers.build(window.__html__['Toast.open.html']);
        expect(el.open).to.be.true;
        expect(el._queued).to.be.true;
        expect(el.classList.contains('is-open')).to.be.false;
      });
    });

    describe('#autodismiss', function () {
      it('should set the value to 6000', function () {
        const el = helpers.build(window.__html__['Toast.autodismiss.html']);
        expect(el.autoDismiss).to.equal(6000);
      });
    });

    describe('#placement', function () {
      it('should set the placement to left', function () {
        const el = helpers.build(window.__html__['Toast.placement.html']);
        expect(el.placement).to.equal(Toast.placement.LEFT);
      });

      it('should position the toast accordingly to its placement value (center)', function (done) {
        const el = helpers.build(window.__html__['Toast.open.html']);
        el._overlayAnimationTime = REDUCED_DURATION;

        el.on('coral-overlay:open', function () {
          expect(parseFloat(el.style.left) > 0).to.be.true;
          expect(el.style.right).to.equal('');
          done();
        });
      });

      it('should position the toast accordingly to its placement value (left)', function (done) {
        const el = helpers.build(window.__html__['Toast.open.html']);
        el._overlayAnimationTime = REDUCED_DURATION;
        el.placement = 'left';

        el.on('coral-overlay:open', function () {
          expect(el.style.left).to.equal('0px');
          expect(el.style.right).to.equal('');
          done();
        });
      });

      it('should position the toast accordingly to its placement value (right)', function (done) {
        const el = helpers.build(window.__html__['Toast.open.html']);
        el._overlayAnimationTime = REDUCED_DURATION;
        el.placement = 'right';

        el.on('coral-overlay:open', function () {
          expect(el.style.left).to.equal('');
          expect(el.style.right).to.equal('0px');
          done();
        });
      });
    });
  });

  describe('User Interaction', function () {
    describe('#ESC', function () {
      it('should close when escape is pressed', function (done) {
        const el = helpers.build(window.__html__['Toast.open.html']);
        el.on('coral-overlay:open', function () {
          helpers.keypress('escape');
          expect(el.open).to.be.false;
          done();
        });
      });
    });

    describe('#[coral-close]', function () {
      it('should close when close button clicked', function (done) {
        const el = helpers.build(window.__html__['Toast.open.html']);
        el.on('coral-overlay:open', function () {
          el.querySelector('[coral-close]').click();
          expect(el.open).to.be.false;
          done();
        });
      });
    });
  });

  describe('Accessibility', function () {
    it('should set a live region role', function () {
      const el = helpers.build(new Toast());
      el.variant = 'error';
      expect(el.getAttribute('role')).to.equal(el.variant);
    });
  });

  describe('Implementation Details', function () {
    describe('Priority queue', function () {
      it('should define a priority queue', function () {
        const wrapper = helpers.build(window.__html__['Toast.queue.html']);

        expect(Toast._queue.length).to.equal(wrapper.querySelectorAll('coral-toast[open]').length);
        Toast._queue.forEach((item) => {
          expect(item.priority).to.equal(parseInt(item.el.dataset.priority));
        });
      });

      it('should open toasts 1 by 1', function (done) {
        const wrapper = helpers.build(window.__html__['Toast.multiple.html']);
        const elements = wrapper.getElementsByTagName('coral-toast');
        let count = 1;

        for (let i = 0 ; i < elements.length ; i++) {
          const el = elements[i];

          el._overlayAnimationTime = REDUCED_DURATION;
          el._autoDismiss = REDUCED_DURATION;

          el.on('coral-overlay:open', function () {
            expect(el._queued).to.be.true;
            expect(parseInt(el.dataset.priority)).to.equal(count);
            expect(wrapper.querySelectorAll('coral-toast.is-open').length).to.equal(1);
          });

          el.on('coral-overlay:close', function () {
            expect(el._queued).to.be.false;
            count++;
            if (count === elements.length) {
              done();
            }
          });

          el.open = true;
        }
      });
    });
  });
});
