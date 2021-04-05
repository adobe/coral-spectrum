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

describe('Multifield.Item', function () {
  describe('API', function () {
    describe('#_deletable', function () {
      var el;
      beforeEach(function() {
        el = helpers.build(`<coral-multifield-item></coral-multifield-item`);
      });
      it('remove button should be enable and _deletable true by default', function () {
        expect(el._elements.remove.disabled).to.be.equal(false);
        expect(el._deletable).to.be.equal(true);
      });

      it('should disable remove button when _deletable false', function () {
        el._deletable = false;
        expect(el._elements.remove.disabled).to.be.equal(true);
      });

      it('should enable remove button when _deletable true', function () {
        el._deletable = false;
        expect(el._elements.remove.disabled).to.be.equal(true);

        el._deletable = true;
        expect(el._elements.remove.disabled).to.be.equal(false);
      });
    });
  });
});
