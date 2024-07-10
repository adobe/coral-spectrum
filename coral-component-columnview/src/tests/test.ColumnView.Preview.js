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
import {ColumnView} from '../../../coral-component-columnview';
import {commons} from '../../../coral-utils';

describe('ColumnView.Preview', function () {
  describe('Namespace', function () {
    it('should be defined', function () {
      expect(ColumnView).to.have.property('Preview');
      expect(ColumnView.Preview).to.have.property('Content');
      expect(ColumnView.Preview).to.have.property('Asset');
      expect(ColumnView.Preview).to.have.property('Label');
      expect(ColumnView.Preview).to.have.property('Value');
      expect(ColumnView.Preview).to.have.property('Separator');
    });
  });

  describe('API', function () {
  });

  describe('Markup', function () {
    describe('#content', function () {
      it('should not move items into the content zone if tag is explicitly given', function () {
        const el = helpers.build(window.__html__['ColumnView.Preview.content.html']);
        var button = el.querySelector('button');
        expect(button.parentElement).not.to.equal(el.content);
      });

      it('should move items into the content zone if tag is not given', function () {
        const el = helpers.build(window.__html__['ColumnView.Preview.content.implicit.html']);
        var button = el.querySelector('button');
        expect(button.parentElement).to.equal(el.content);
      });
    });
  });

  describe('Events', function () {
  });
  describe('User Interaction', function () {
  });
  describe('Accessibility', function () {
    it('should add alt="" to asset img tag when no alt text is provided', function () {
      const el = helpers.build(window.__html__['ColumnView.Preview.content.implicit.html']);
      const img = el.querySelector('img');
      expect(img.hasAttribute('alt')).to.be.true;
      expect(img.getAttribute('alt')).to.equal('');
    });

    it('should not add alt="" to asset img tag when alt text is provided', function () {
      const el = helpers.build(window.__html__['ColumnView.Preview.content.html']);
      const img = el.querySelector('img');
      expect(img.hasAttribute('alt')).to.be.true;
      expect(img.getAttribute('alt')).to.equal('FPO asset image');
    });

    it('should identify each value as a focusable, readOnly textbox labeled by its label', function () {
      const el = helpers.build(window.__html__['ColumnView.Preview.content.html']);
      const elements = el.querySelectorAll('coral-columnview-preview-label + coral-columnview-preview-value');
      let i;
      let element;
      let elementLabel;
      for (i = 0 ; i < elements.length ; i++) {
        element = elements[i];
        elementLabel = element.previousElementSibling;
        elementLabel.id = elementLabel.id || commons.getUID();
        expect(element.getAttribute('aria-readonly')).to.equal('true');
      }
    });

    it('should identify each horizontal separator', function () {
      const el = helpers.build(window.__html__['ColumnView.Preview.content.html']);
      const elements = el.querySelectorAll('coral-columnview-preview-separator');
      let i;
      let element;
      for (i = 0 ; i < elements.length ; i++) {
        element = elements[i];
        expect(element.getAttribute('role')).to.equal('separator');
        expect(element.getAttribute('aria-orientation')).to.equal('horizontal');
      }
    });
  });
  describe('Implementation Details', function () {
  });
});
