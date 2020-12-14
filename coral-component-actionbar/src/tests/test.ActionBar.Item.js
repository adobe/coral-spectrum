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

describe('ActionBar.Item', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(ActionBar).to.have.property('Item');
    });
  });

  describe('API', function () {
    // the select list item used in every test
    var el;

    beforeEach(function () {
      el = helpers.build(new ActionBar.Item());
    });

    afterEach(function () {
      el = null;
    });

    describe('#content', function () {
      it('should default to empty string', function () {
        expect(el.content.innerHTML).to.equal('');
      });

      it('should support HTML content', function () {
        var htmlContent = '<button>Highlighted</button>';
        el.content.innerHTML = htmlContent;

        expect(el.content.innerHTML).to.equal(htmlContent);
        expect(el.innerHTML).to.equal(htmlContent);
      });

      it('should not be settable', function () {
        var newContent = new ActionBar.Item();

        try {
          el.content = newContent;
        } catch (e) {
          expect(el.content).not.to.equal(newContent);
        }
      });
    });
  });

  describe('Markup', function () {

    describe('#content', function () {
      it('should have content set to innerHTML if property not provided', function () {
        const el = helpers.build(window.__html__['ActionBar.Item.base.html']);
        expect(el.content.innerHTML).to.equal('<button>Delete</button>');
      });
    });
  });
});
