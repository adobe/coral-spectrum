/**
 * Copyright 2020 Adobe. All rights reserved.
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
import {CheckboxGroup} from '../../../coral-component-checkboxgroup';

describe('CheckboxGroup', function () {

  describe('Instantiation', function () {
    it('should support creation from markup', function () {
      expect(helpers.build('<coral-checkboxgroup>') instanceof CheckboxGroup).to.equal(true);
    });

    helpers.cloneComponent(
      'should be possible via cloneNode using markup',
      window.__html__['CheckboxGroup.base.html']
    );
  });

  describe('Markup', function () {
    describe('#selectedItems', function () {
      it('should return all checked checkboxes', function () {
        const el = helpers.build(window.__html__['CheckboxGroup.items.checked.html']);
        expect(el.items.length).to.equal(3);
        expect(el.selectedItems.length).to.equal(2);
        expect(el.selectedItems).to.deep.equal([el.items.first(), el.items.last()]);
      });
    });
  });
});
