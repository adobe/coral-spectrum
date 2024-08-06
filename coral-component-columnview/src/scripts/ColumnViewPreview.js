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

import {BaseComponent} from '../../../coral-base-component';
import {commons} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-MillerColumns-item';

/**
 @class Coral.ColumnView.Preview
 @classdesc A ColumnView Preview component
 @htmltag coral-columnview-preview
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const ColumnViewPreview = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Content zone
    this._elements = {
      content: this.querySelector('coral-columnview-preview-content') || document.createElement('coral-columnview-preview-content')
    };
  }

  /**
   The content of the Preview.

   @type {ColumnViewPreviewContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-columnview-preview-content',
      insert: function (content) {
        content.classList.add('coral-Body--small');
        this.appendChild(content);
      }
    });
  }

  get _contentZones() {
    return {'coral-columnview-preview-content': 'content'};
  }

  /** @ignore */
  render() {
    super.render();

    this.setAttribute('role', 'group');

    this.id = this.id || commons.getUID();

    this.classList.add(CLASSNAME);

    const content = this._elements.content;

    // when the content zone was not created, we need to make sure that everything is added inside it as a content.
    // this stops the content zone from being voracious
    if (!content.parentNode) {
      // move the contents of the item into the content zone
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }

    // Call content zone insert
    this.content = content;

    this._makeAccessible();
  }

  /** @ignore */
  _makeAccessible() {

    // @a11y For item values with a label, identify the value as a focusable, readOnly textbox labeled by the label.
    let elements = this.content.querySelectorAll('coral-columnview-preview-label + coral-columnview-preview-value');
    let length = elements.length;
    let i;
    let element;
    let elementLabel;

    // @a11y If the previous column has selected items,
    // do not include item values in the tab order,
    // so that a keyboard user can quickly advance to a subsequent toolbar.

    for (i = 0 ; i < length ; i++) {
      element = elements[i];
      elementLabel = element.previousElementSibling;
      elementLabel.id = elementLabel.id || commons.getUID();

      // force ChromeVox to read value of textbox
      if (window.cvox) {
        element.setAttribute('aria-valuetext', element.textContent);
      }
    }

    // @a11y Expose separator as a horizontally-oriented separator.
    elements = this.content.querySelectorAll('coral-columnview-preview-separator');
    length = elements.length;
    for (i = 0 ; i < length ; i++) {
      element = elements[i];
      element.setAttribute('role', 'separator');
      element.setAttribute('aria-orientation', 'horizontal');
    }

    // @a11y If the preview asset image does not include an alt attribute, set alt="", so that screen readers do not announce the image url.
    elements = this.content.querySelectorAll('coral-columnview-preview-asset > img:not([alt])');
    length = elements.length;
    for (i = 0 ; i < length ; i++) {
      element = elements[i];
      element.setAttribute('alt', '');
    }
  }
});

export default ColumnViewPreview;
