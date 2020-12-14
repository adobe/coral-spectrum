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
import {SplitButton} from '../../../coral-component-splitbutton';

describe('SplitButton', function () {
  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible via clone using markup',
      window.__html__['SplitButton.base.html']
    );

    helpers.cloneComponent(
      'should be possible via clone using markup with buttons',
      window.__html__['SplitButton.variant.html']
    );

    helpers.cloneComponent(
      'should be possible via clone using js',
      new SplitButton()
    );
  });

  describe('API', function () {
    let el;

    beforeEach(function () {
      el = new SplitButton();
    });

    afterEach(function () {
      el = null;
    });

    describe('#variant', function () {
      it('should be set to "default" by default', function () {
        expect(el.variant).to.equal(SplitButton.variant.DEFAULT);
      });

      it('should only accept values from variant enum', function () {
        el.variant = 'secondary';
        expect(el.variant).to.equal(SplitButton.variant.SECONDARY);
        el.variant = 'cta';
        expect(el.variant).to.equal(SplitButton.variant.CTA);
        el.variant = '';
        expect(el.variant).to.equal(SplitButton.variant.DEFAULT);
      });
    });

    describe('#[coral-splitbutton-action]', function () {
      it('should define the action button', function (done) {
        const action = document.createElement('div');
        action.setAttribute('coral-splitbutton-action', '');
        el.appendChild(action);
        helpers.next(() => {
          expect(action.classList.contains('_coral-SplitButton-action')).to.be.true;
          done();
        });
      });
    });

    describe('#[coral-splitbutton-trigger]', function () {
      it('should define the trigger button', function (done) {
        const action = document.createElement('div');
        action.setAttribute('coral-splitbutton-trigger', '');
        el.appendChild(action);
        helpers.next(() => {
          expect(action.classList.contains('_coral-SplitButton-trigger')).to.be.true;
          done();
        });
      });
    });
  });

  describe('Markup', function () {
    describe('#variant', function () {
      it('should reflect the default variant', function () {
        const el = helpers.build(window.__html__['SplitButton.base.html']);
        expect(el.getAttribute('variant')).to.equal(SplitButton.variant.DEFAULT);
      });

      it('should set a variant other than default', function () {
        const el = helpers.build(window.__html__['SplitButton.variant.html']);
        expect(el.variant).to.equal(SplitButton.variant.CTA);
        expect(el.querySelectorAll('[variant="cta"]').length).to.equal(2);

        el.variant = 'secondary';
        expect(el.variant).to.equal(SplitButton.variant.SECONDARY);
        expect(el.getAttribute('variant')).to.equal(SplitButton.variant.SECONDARY);
        expect(el.querySelectorAll('[variant="secondary"]').length).to.equal(2);
      });
    });
  });

  describe('Implementation Details', function () {
    describe('Inner Buttons (action and trigger)', function () {
      it('should update the inner buttons variant', function (done) {
        const el = helpers.build(window.__html__['SplitButton.base.html']);
        const action = document.createElement('div');
        action.setAttribute('coral-splitbutton-action', '');
        el.variant = 'CTA';
        el.appendChild(action);
        // Wait for MO
        helpers.next(() => {
          expect(action.getAttribute('variant')).to.equal('cta');
          done();
        });
      });

      it('should support switching inner buttons order', function (done) {
        const el = helpers.build(window.__html__['SplitButton.variant.html']);
        expect(el.classList.contains('_coral-SplitButton--left')).to.be.false;

        const action = el.querySelector('[coral-splitbutton-action]');
        el.appendChild(action);
        // Wait for MO
        helpers.next(() => {
          el.appendChild(action);
          expect(el.classList.contains('_coral-SplitButton--left')).to.be.true;
          done();
        });
      });
    });
  });
});
