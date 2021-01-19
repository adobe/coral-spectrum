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
import {Table} from '../../../coral-component-table';

describe('Table.Cell', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(Table).to.have.property('HeaderCell');
    });
  });

  describe('Instantiation', function () {
    it('should be possible using new', function () {
      const el = helpers.build(new Table.HeaderCell());
      expect(el.classList.contains('_coral-Table-headerCell')).to.be.true;
    });

    it('should be possible using document.createElement', function () {
      const th = document.createElement('th');
      th.setAttribute('is', 'coral-table-headercell');
      const el = helpers.build(th);
      expect(el.classList.contains('_coral-Table-headerCell')).to.be.true;
    });
  });

  describe('API', function () {
    describe('#content', function () {
      it('should exist', function () {
        const el = new Table.HeaderCell();
        expect(el.content.nodeName).to.equal('CORAL-TABLE-HEADERCELL-CONTENT');
      });
    });
  });

  describe('Events', function () {

    describe('#coral-table-headercell:_contentchanged', function () {
      it('should trigger when content changed', function (done) {
        const el = new Table.HeaderCell();
        const spy = sinon.spy();
        el.on('coral-table-headercell:_contentchanged', spy);
        el.content.textContent = 'Some content';

        // Wait for MO
        helpers.next(function () {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });
  });
});
