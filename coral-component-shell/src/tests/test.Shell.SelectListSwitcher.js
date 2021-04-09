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
import {Shell} from '../../../coral-component-shell';

describe('Shell.SelectListSwitcher', function () {
  describe('Namespace', function () {
    it('should be defined in the Shell namespace', function () {
      expect(Shell).to.have.property('SelectListSwitcher');
      expect(Shell).to.have.property('SwitcherListItem');
    });
  });

  describe('Initialization', function () {
    it('should support creation from markup', function () {
      const el = helpers.build(window.__html__['Shell.SelectListSwitcher.base.html']);
      expect(el instanceof Shell.SelectListSwitcher).to.equal(true);
    });

    it('should support creation from js', function () {
      var el = new Shell.SelectListSwitcher();
      expect(el instanceof Shell.SelectListSwitcher).to.equal(true);
    });

    it('should support dynamic addition of items', function () {
      var el = helpers.build(window.__html__['Shell.SelectListSwitcher.base.html']);
      var switcherItem = document.createElement('coral-shell-switcherlist-item');
      switcherItem.setAttribute("linked", true);
      switcherItem.setAttribute("href", "http://www.adobe.com/go/aem6_5_primetime");
      switcherItem.textContent = "PrimeTime";
      el.appendChild(switcherItem);
      var selectList = el.querySelector("coral-selectlist");
      var selectListItem = selectList.querySelectorAll("coral-selectlist-item[href=\"http://www.adobe.com/go/aem6_5_primetime\"]");
      expect(selectListItem).to.not.be.null;
    });

    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Shell.SelectListSwitcher.base.html']
    );

    const el = new Shell.SelectListSwitcher();

    helpers.cloneComponent(
      'should be possible to clone using js',
      el
    );
  });
});
