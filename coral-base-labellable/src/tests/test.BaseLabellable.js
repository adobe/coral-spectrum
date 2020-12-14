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
import {BaseLabellable} from '../../../coral-base-labellable';
import {BaseComponent} from '../../../coral-base-component';
import {Icon} from '../../../coral-component-icon';

describe('BaseLabellable', () => {
  // Dummy component
  window.customElements.define('coral-labellable', class extends BaseLabellable(BaseComponent(HTMLElement)) {
    constructor() {
      super();

      this._elements = {
        icon: new Icon(),
        content: document.createElement('div')
      };

      this._observeLabel();
    }

    get icon() {
      return this._elements.icon;
    }

    set icon(value) {
      this._elements.icon.icon = value;
    }

    get content() {
      return this._elements.content;
    }
  });

  describe('Implementation Details', () => {
    it('should not set icon aria-hidden by default', () => {
      const el = helpers.build('<coral-labellable icon="add"></coral-labellable>');
      expect(el.icon.getAttribute('aria-hidden')).to.equal(null);
    });

    it('should set icon aria-hidden to true if aria-label is not set', () => {
      const el = helpers.build('<coral-labellable icon="add" aria-label="label"></coral-labellable>');
      expect(el.icon.getAttribute('aria-hidden')).to.equal('true');
    });

    it('should set icon aria-hidden to true if aria-labelleby is set', () => {
      const el = helpers.build('<coral-labellable icon="add" aria-labelledby="id"></coral-labellable>');
      expect(el.icon.getAttribute('aria-hidden')).to.equal('true');
    });

    it('should set icon set aria-hidden to true if content is set', (done) => {
      const el = helpers.build('<coral-labellable icon="add"></coral-labellable>');
      el.content.textContent = 'text';

      // Wait for MO
      helpers.next(() => {
        expect(el.icon.getAttribute('aria-hidden')).to.equal('true');
        done();
      });
    });
  });
});
