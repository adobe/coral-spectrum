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
import {ActionBar} from '../../../coral-component-actionbar';

describe('ActionBar.Primary', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(ActionBar).to.have.property('Primary');
    });
  });

  describe('API', function () {
    var el;
    var item1;

    beforeEach(function () {
      el = new ActionBar.Primary();
      item1 = new ActionBar.Item();

      helpers.target.appendChild(el);
    });

    afterEach(function () {
      el = item1 = null;
    });

    describe('#items', function () {
      describe('#add', function () {
        it('should insert items before the more button', function () {
          expect(el.items.length).to.equal(0, 'collection should start empty');

          el.items.add(item1);

          var children = Array.prototype.slice.call(el.children);
          expect(children.indexOf(el._elements.moreButton)).to.be.above(children.indexOf(item1), 'more button should be placed after the item');
        });
      });
    });
  });
});
