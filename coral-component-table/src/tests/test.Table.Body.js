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

describe('Table.Body', function () {
  describe('Instantiation', function () {
    it('should be possible using new', function () {
      const el = helpers.build(new Table.Body());
      expect(el.classList.contains('_coral-Table-body')).to.be.true;
    });

    it('should be possible using document.createElement', function () {
      const el = helpers.build(document.createElement('tbody', {is: 'coral-table-body'}));
      expect(el.classList.contains('_coral-Table-body')).to.be.true;
    });
  });

  describe('API', function () {

    describe('#divider', function () {
      it('should default to row divider', function () {
        var el = helpers.build(new Table.Body());
        expect(el.divider).to.equal(Table.divider.ROW);

        expect(el.classList.contains('_coral-Table-divider--row')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });

      it('should apply column divider', function () {
        var el = new Table.Body();
        el.divider = Table.divider.COLUMN;

        expect(el.classList.contains('_coral-Table-divider--column')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.false;
      });

      it('should apply cell divider', function () {
        var el = new Table.Body();
        el.divider = Table.divider.CELL;

        expect(el.classList.contains('_coral-Table-divider--cell')).to.be.true;
        expect(el.classList.contains('_coral-Table-divider--column')).to.be.false;
        expect(el.classList.contains('_coral-Table-divider--row')).to.be.false;
      });
    });
  });

  describe('Events', function () {
    describe('#coral-table-body:_contentchanged', function () {
      it('should trigger when changing content', function (done) {
        const el = helpers.build(new Table.Body());
        const spy = sinon.spy();

        el.on('coral-table-body:_contentchanged', spy);
        el.appendChild(document.createElement('span'));

        // Wait for MO
        helpers.next(function () {
          expect(spy.callCount).to.equal(1);
          done();
        });
      });
    });

    describe('#coral-table-body:_empty', function () {
      it('should trigger if the body is empty', function () {
        const el = new Table.Body();
        const spy = sinon.spy();

        el.on('coral-table-body:_empty', spy);
        helpers.build(el);

        expect(spy.callCount).to.equal(1);
      });
    });
  });

  describe('Implementation Details', function () {
    it('should set a11y attribute', function () {
      const el = helpers.build(new Table.Body());
      expect(el.tagName).to.equal('TBODY');
      expect(el.hasAttribute('role')).to.be.false;
    });
  });
});
