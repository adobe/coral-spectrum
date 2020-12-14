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

describe('Select.Collection', function () {
  describe('API', function () {
    describe('#_getFirstSelectable()', function () {
      it('should return the first valid item for selection', function () {
        const el = helpers.build(window.__html__['Select.items.base.html']);
        var items = el.items.getAll();
        var firstSelectable = el.items._getFirstSelectable();

        expect(firstSelectable).to.equal(items[0]);
        expect(firstSelectable.value).to.equal('am');
        expect(firstSelectable.content.textContent).to.equal('America');
      });

      it('should include disabled and hidden items', function () {
        const el = helpers.build(window.__html__['Select.items.selectable.html']);
        var items = el.items.getAll();
        var firstSelectable = el.items._getFirstSelectable();

        expect(firstSelectable).to.equal(items[3]);
        expect(firstSelectable.value).to.equal('as');
        expect(firstSelectable.content.textContent).to.equal('Asia');
      });
    });

    describe('#_getFirstSelected()', function () {
      it('should return the first selected item', function () {
        const el = helpers.build(window.__html__['Select.items.base.html']);
        var items = el.items.getAll();
        var firstSelected = el.items._getFirstSelected();

        expect(firstSelected).to.equal(items[1]);
        expect(firstSelected.value).to.equal('af');
        expect(firstSelected.content.textContent).to.equal('Africa');
      });

      it('should include disabled and hidden items', function () {
        const el = helpers.build(window.__html__['Select.items.selectable.html']);
        var items = el.items.getAll();
        var firstSelected = el.items._getFirstSelected();

        expect(firstSelected).to.equal(items[0]);
        expect(firstSelected.value).to.equal('am');
        expect(firstSelected.content.textContent).to.equal('America');
      });
    });

    describe('#_getLastSelected()', function () {
      it('should return the last selected item', function () {
        const el = helpers.build(window.__html__['Select.items.base.html']);
        var items = el.items.getAll();
        var lastSelected = el.items._getLastSelected();

        expect(lastSelected).to.equal(items[6]);
        expect(lastSelected.value).to.equal('oc');
        expect(lastSelected.content.textContent).to.equal('Oceania');
      });

      it('should ignore disabled and hidden items', function () {
        const el = helpers.build(window.__html__['Select.items.selectable.html']);
        var items = el.items.getAll();
        var lastSelected = el.items._getLastSelected();

        expect(lastSelected).to.equal(items[5]);
        expect(lastSelected.value).to.equal('eu');
        expect(lastSelected.content.textContent).to.equal('Europe');
      });
    });

    describe('#_getAllSelected()', function () {
      it('should all the selected items', function () {
        const el = helpers.build(window.__html__['Select.items.base.html']);
        var items = el.items.getAll();
        var selectedItems = el.items._getAllSelected();

        expect(selectedItems).to.deep.equal([items[1], items[2], items[6]]);
      });

      it('should include disabled and hidden items', function () {
        const el = helpers.build(window.__html__['Select.items.selectable.html']);
        var items = el.items.getAll();
        var selectedItems = el.items._getAllSelected();

        expect(selectedItems).to.deep.equal([items[0], items[1], items[5]]);
      });
    });

    describe('#_deselectAllExceptLast()', function () {
      it('should all the deselect all items except the last one', function () {
        const el = helpers.build(window.__html__['Select.items.base.html']);
        var items = el.items.getAll();
        el.items._deselectAllExceptLast();

        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-select-item[selected]');

        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[6]]);
      });

      it('should include disabled and hidden items', function () {
        const el = helpers.build(window.__html__['Select.items.selectable.html']);
        var items = el.items.getAll();

        el.items._deselectAllExceptLast();

        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-select-item[selected]');

        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[5]]);

        // we try deselecting again to see if it works with only 1 item
        el.items._deselectAllExceptLast();
        selectedItems = el.querySelectorAll('coral-select-item[selected]');

        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([items[5]], 'The last item should be selected');
      });
    });

    describe('#_deselectAllExcept()', function () {
      it('should all the deselect all items', function () {
        const el = helpers.build(window.__html__['Select.items.base.html']);
        el.items._deselectAllExcept();

        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-select-item[selected]');

        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([]);
      });

      it('should ignore disabled and hidden items', function () {
        const el = helpers.build(window.__html__['Select.items.selectable.html']);
        el.items._deselectAllExcept();

        // we query without the collection api to make sure disabled and hidden items are deselected as well
        var selectedItems = el.querySelectorAll('coral-select-item[selected]');

        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([]);

        // we try deselecting again to see if it works with only 1 item
        el.items._deselectAllExcept();
        selectedItems = el.querySelectorAll('coral-select-item[selected]');

        expect(Array.prototype.slice.call(selectedItems)).to.deep.equal([], 'The last item should be selected');
      });
    });
  });
});
