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
import {SelectList} from '../../../coral-component-list';

describe('SelectList.Item', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(SelectList).to.have.property('Item');
    });
  });

  describe('Instantiation', function () {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-Menu-item')).to.be.true;
      expect(el.getAttribute('role')).to.equal('listitem');
    }

    it('should be possible using new', function () {
      var el = helpers.build(new SelectList.Item());
      testDefaultInstance(el);
    });

    it('should be possible using createElement', function () {
      var el = helpers.build(document.createElement('coral-selectlist-item'));
      testDefaultInstance(el);
    });

    it('should be possible using markup', function () {
      testDefaultInstance(helpers.build('<coral-selectlist-item></coral-selectlist-item>'));
    });
  });

  describe('API', function () {
    describe('#selected', function () {
      it('should default to false', function () {
        const el = new SelectList.Item();
        expect(el.selected).to.be.false;
      });
    });

    describe('#disabled', function () {
      it('should default to false', function () {
        const el = new SelectList.Item();
        expect(el.disabled).to.be.false;
      });
    });

    describe('#content', function () {
      it('should not be null', function () {
        const el = new SelectList.Item();
        expect(el.content).to.not.equal(null);
      });
    });

    describe('#value', function () {
      it('should return textContent if not explictly set', function () {
        var el = new SelectList.Item();
        el.textContent = 'Test 123';

        expect(el.value).to.equal('Test 123');
        expect(el.hasAttribute('value')).to.be.false;
      });

      it('should reflect an explicitly set string value', function () {
        var el = new SelectList.Item();
        el.value = 'Test 123';

        expect(el.value).to.equal('Test 123');
        expect(el.getAttribute('value')).to.equal('Test 123');
      });
    });
  });

  describe('Markup', function () {
    it('should return the value different from the content', function () {
      const el = helpers.build('<coral-selectlist-item value="2">Test</coral-selectlist-item>');
      expect(el.value).to.equal('2');
      expect(el.content.textContent).to.equal('Test');
    });
  });
});

