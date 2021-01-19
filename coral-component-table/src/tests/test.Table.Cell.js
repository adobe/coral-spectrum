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
      expect(Table).to.have.property('Cell');
    });
  });

  describe('Instantiation', function () {
    it('should be possible using new', function () {
      const el = helpers.build(new Table.Cell());
      expect(el.classList.contains('_coral-Table-cell')).to.be.true;
    });

    it('should be possible using document.createElement', function () {
      const td = document.createElement('td');
      td.setAttribute('is', 'coral-table-cell');
      const el = helpers.build(td);
      expect(el.classList.contains('_coral-Table-cell')).to.be.true;
    });
  });

  describe('API', function () {
    describe('#content', function () {
      it('should exist', function () {
        const el = new Table.Cell();
        expect(el.content).to.equal(el);
      });
    });

    describe('#value', function () {
      it('should default to empty string', function () {
        const el = new Table.Cell();
        expect(el.value).to.equal('');
      });

      it('should be reflected', function () {
        const el = new Table.Cell();
        el.value = 'test';
        expect(el.value).to.equal('test');
        expect(el.getAttribute('value')).to.equal('test');
      });

      it('should be settable by attribute', function () {
        const el = new Table.Cell();
        el.setAttribute('value', 'test');
        expect(el.value).to.equal('test');
        expect(el.getAttribute('value')).to.equal('test');
      });
    });

    describe('#selected', function () {
      it('should be selected', function (done) {
        const el = new Table.Cell();
        el.selected = true;

        expect(el.selected).to.be.true;
        expect(el.classList.contains('is-selected')).to.be.true;
        expect(el.hasAttribute('aria-selected')).to.be.false;
        el.setAttribute('_selectable', '');
        helpers.next(() => {
          expect(el.getAttribute('aria-selected')).to.equal('true');
          done();
        });
      });

      it('should not select if disabled', function (done) {
        const el = new Table.Cell();
        el.setAttribute('_selectable', '');
        helpers.next(() => {
          el.setAttribute('disabled', '');

          el.selected = true;
          expect(el.selected).to.be.false;
          done();
        });
      });

      it('should not select if inner [coral-table-cellselect] is disabled', function () {
        const el = new Table.Cell();
        const select = document.createElement('div');
        select.setAttribute('coral-table-cellselect', '');
        select.setAttribute('disabled', '');
        el.appendChild(select);

        el.selected = true;
        expect(el.selected).to.be.false;
      });
    });
  });

  describe('Events', function () {

    describe('#coral-table-cell:_beforeselectedchanged', function () {
      it('should trigger before selection changed', function (done) {
        const el = new Table.Cell();

        el.on('coral-table-cell:_beforeselectedchanged', function () {
          expect(el.selected).to.be.false;
          done();
        });
        el.selected = true;
      });
    });

    describe('#coral-table-cell:_selectedchanged', function () {
      it('should trigger when selection changed', function (done) {
        const el = new Table.Cell();

        el.on('coral-table-cell:_selectedchanged', function () {
          expect(el.selected).to.be.true;
          done();
        });
        el.selected = true;
      });
    });
  });
});
