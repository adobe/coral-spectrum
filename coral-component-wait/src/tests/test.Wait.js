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
import {Wait} from '../../../coral-component-wait';

describe('Wait', function () {

  describe('Namespace', function () {
    it('should define the variants in an enum', function () {
      expect(Wait.variant).to.exist;
      expect(Wait.variant.DEFAULT).to.equal('default');
      expect(Wait.variant.DOTS).to.equal('dots');
      expect(Object.keys(Wait.variant).length).to.equal(2);
    });

    it('should define the sizes in an enum', function () {
      expect(Wait.size).to.exist;
      expect(Wait.size.SMALL).to.equal('S');
      expect(Wait.size.MEDIUM).to.equal('M');
      expect(Wait.size.LARGE).to.equal('L');
      expect(Object.keys(Wait.size).length).to.equal(3);
    });
  });

  describe('Instantiation', function () {
    it('should be possible using new', function () {
      var wait = helpers.build(new Wait());

      expect(wait.classList.contains('_coral-CircleLoader')).to.be.true;
      expect(wait.hasAttribute('centered')).to.be.false;
      expect(wait.hasAttribute('variant')).to.be.true;
      expect(wait.hasAttribute('size')).to.be.true;
      expect(wait.classList.contains('_coral-CircleLoader--centered')).to.be.false;
      expect(wait.classList.contains('_coral-CircleLoader--large')).to.be.false;
      expect(wait.classList.contains('_coral-CircleLoader--medium')).to.be.false;
    });
  });

  describe('API', function () {
    describe('#centered', function () {
      it('should default to false', function () {
        var wait = new Wait();

        expect(wait.centered).to.be.false;
      });

      it('should be centered', function () {
        var wait = helpers.build(new Wait());
        wait.centered = true;

        expect(wait.classList.contains('_coral-CircleLoader--centered')).to.be.true;
      });

      it('should not be centered', function () {
        var wait = helpers.build(new Wait());
        wait.centered = true;
        wait.centered = false;

        expect(wait.classList.contains('_coral-CircleLoader--centered')).to.be.false;
      });
    });

    describe('#size', function () {
      it('should default to medium', function () {
        var wait = new Wait();

        expect(wait.size).to.equal(Wait.size.MEDIUM);
      });

      it('can be set to large', function () {
        var wait = new Wait();
        wait.size = Wait.size.LARGE;

        expect(wait.classList.contains('_coral-CircleLoader--large')).to.be.true;
      });

      it('can be set to small', function () {
        var wait = new Wait();
        wait.size = Wait.size.SMALL;

        expect(wait.classList.contains('_coral-CircleLoader--small')).to.be.true;
      });
    });

    describe('#value', function () {
      it('should reflect value changes', function () {
        var wait = new Wait();
        wait.value = 50;

        expect(wait.getAttribute('value')).to.equal('50');
        expect(wait.getAttribute('aria-valuenow')).to.equal('50');
      });

      it('should set minimum value when value set to null', function () {
        var wait = new Wait();
        wait.value = 50;

        wait.removeAttribute('value');

        expect(wait.value).to.equal(0);
        expect(wait.hasAttribute('value')).to.be.true;
        expect(wait.getAttribute('value')).to.equal('0');
      });

      it('should set maximum value when value set to greater than maximum', function () {
        var wait = new Wait();
        wait.value = 1000;

        expect(wait.value).to.equal(100);
      });

      it('should set minimum value when value set to greater than minimum', function () {
        var wait = new Wait();
        wait.value = -1000;

        expect(wait.value).to.equal(0);
      });
    });

    describe('#indeterminate', function () {
      it('should be false by default', function () {
        expect(new Wait().indeterminate).to.be.false;
      });

      it('should be true if no value is set', function () {
        var wait = helpers.build(new Wait());

        expect(wait.indeterminate).to.be.true;
      });

      it('should be false if value is set', function () {
        var wait = new Wait();
        wait.value = 10;

        helpers.build(wait);

        expect(wait.indeterminate).to.be.false;
      });

      it('should set value to 0 when mode is indeterminate', function () {
        var wait = new Wait();

        wait.value = 50;
        expect(wait.value).to.equal(50);

        wait.indeterminate = true;
        expect(wait.value).to.equal(0);

        wait.indeterminate = false;
        expect(wait.value).to.equal(50);
      });

      it('should remove value specific attributes', function () {
        var wait = helpers.build(new Wait());

        wait.indeterminate = true;

        expect(wait.hasAttribute('aria-valuenow')).to.be.false;
        expect(wait.hasAttribute('aria-valuemin')).to.be.false;
        expect(wait.hasAttribute('aria-valuemax')).to.be.false;
        expect(wait.style.backgroundPosition).to.equal('');
      });
    });
  });

  describe('Markup', function () {

    describe('#centered', function () {

      it('should be initially false', function () {
        var wait = helpers.build('<coral-wait></coral-wait>');

        expect(wait.centered).to.be.false;
        expect(wait.hasAttribute('centered')).to.be.false;
        expect(wait.classList.contains('_coral-CircleLoader--centered')).to.be.false;
      });

      it('should set centered', function () {
        var wait = helpers.build('<coral-wait centered></coral-wait>');

        expect(wait.centered).to.be.true;
        expect(wait.getAttribute('centered')).to.equal('');
        expect(wait.classList.contains('_coral-CircleLoader')).to.be.true;
        expect(wait.classList.contains('_coral-CircleLoader--centered')).to.be.true;
      });

      it('should still be centered', function () {
        var wait = helpers.build('<coral-wait centered="false"></coral-wait>');

        expect(wait.centered).to.be.true;
        expect(wait.hasAttribute('centered')).to.be.true;
        expect(wait.classList.contains('_coral-CircleLoader')).to.be.true;
        expect(wait.classList.contains('_coral-CircleLoader--centered')).to.be.true;
      });
    });

    describe('#size', function () {

      it('should default to medium small', function () {
        var wait = helpers.build('<coral-wait></coral-wait>');

        expect(wait.size).to.equal(Wait.size.MEDIUM);
        expect(wait.classList.contains('_coral-CircleLoader')).to.be.true;
        expect(wait.classList.contains('_coral-CircleLoader--large')).to.be.false;
        expect(wait.classList.contains('_coral-CircleLoader--medium')).to.be.false;
      });

      it('should be able to set to large', function () {
        var wait = helpers.build('<coral-wait size="L"></coral-wait>');

        expect(wait.size).to.equal(Wait.size.LARGE);
        expect(wait.classList.contains('_coral-CircleLoader--large')).to.be.true;
        expect(wait.classList.contains('_coral-CircleLoader--medium')).to.be.false;
        expect(wait.classList.contains('_coral-CircleLoader')).to.be.true;
      });

      it('should be able to set to medium', function () {
        var wait = helpers.build('<coral-wait size="M"></coral-wait>');

        expect(wait.size).to.equal(Wait.size.MEDIUM);
        expect(wait.classList.contains('_coral-CircleLoader--large')).to.be.false;
        expect(wait.classList.contains('_coral-CircleLoader--small')).to.be.false;
        expect(wait.classList.contains('_coral-CircleLoader')).to.be.true;
      });
    });

    describe('#variant', function () {

      it('should default to Wait.variant.DEFAULT', function () {
        var el = helpers.build('<coral-wait></coral-wait>');

        expect(el.variant).to.equal(Wait.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Wait.variant.DEFAULT);
      });

      it('should set the new variant', function () {
        var el = helpers.build('<coral-wait variant="dots"></coral-wait>');

        expect(el.variant).to.equal(Wait.variant.DOTS);
        expect(el.getAttribute('variant')).to.equal('dots');
      });
    });
  });

  describe('Events', function () {
    it('#coral-wait:change', function () {
      it('should trigger when changing the value', function () {
        const spy = sinon.spy();
        const el = new Wait();
        el.on('coral-wait:change', spy);

        el.value = 30;
        expect(spy.callCount).to.equal(1);
      });
    });
  });

  describe('Accessibility', function () {
    it('should have "role=progressbar" by default', function () {
      var el = helpers.build('<coral-wait></coral-wait>');
      expect(el.getAttribute('role')).to.equal('progressbar');
    });

    it('should have "role=treeitem" when has class "tree-loading-wait"', function () {
      var el = helpers.build('<coral-wait class="tree-loading-wait"></coral-wait>');
      expect(el.getAttribute('role')).to.equal('treeitem');
    });

    it('should have "role=row" when has class "grid-loading-wait"', function () {
      var el = helpers.build('<coral-wait class="grid-loading-wait"></coral-wait>');
      expect(el.getAttribute('role')).to.equal('row');
    });
  });
});
