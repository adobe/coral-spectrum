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
import {Panel} from '../../../coral-component-panelstack';

describe('Panel', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(Panel).to.have.property('Content');
    });
  });

  describe('API', function () {
    var el;

    beforeEach(function () {
      el = new Panel();
    });

    afterEach(function () {
      el = null;
    });

    describe('#selected', function () {
      it('should have correct defaults', function () {
        expect(el.selected).to.be.false;
      });

      it('should be settable to truthy', function () {
        el.selected = true;

        expect(el.selected).to.be.true;
        expect(el.hasAttribute('selected')).to.be.true;
        expect(el.classList.contains('is-selected')).to.be.true;
      });

      it('should be settable to falsy', function () {
        el.selected = false;

        expect(el.selected).to.be.false;
        expect(el.hasAttribute('selected')).to.be.false;
        expect(el.classList.contains('is-selected')).to.be.false;
      });
    });

    describe('#content', function () {
      it('should not be null', function () {
        expect(el.content).not.to.be.null;
      });
    });
  });

  describe('Implementation Details', function () {
    it('should have a role', function () {
      const el = helpers.build(new Panel());
      expect(el.getAttribute('role')).to.equal('region');
    });
  })
});
