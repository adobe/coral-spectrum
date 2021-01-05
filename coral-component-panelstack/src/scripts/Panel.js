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
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-Panel';

/**
 @class Coral.Panel
 @classdesc A Panel component
 @htmltag coral-panel
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Panel extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Templates
    this._elements = {
      content: this.querySelector('coral-panel-content') || document.createElement('coral-panel-content')
    };
  }

  /**
   The content of the panel.

   @type {PanelContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-panel-content',
      insert: function (content) {
        this.appendChild(content);
      }
    });
  }

  /**
   Whether the item is selected. When true, the item will appear as the active element in the PanelStack. The item
   must be a child of a PanelStack before this property is set to true. This property cannot be programmatically set
   to false.

   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }

  set selected(value) {
    let _selected = transform.booleanAttr(value);

    if(this._selected === _selected) {
      return;
    }

    this._selected = _selected;
    this._reflectAttribute('selected', this._selected);

    this.classList.toggle('is-selected', this._selected);
    this.setAttribute('aria-hidden', !this.selected);

    this.trigger('coral-panel:_selectedchanged');
  }

  get _contentZones() {
    return {'coral-panel-content': 'content'};
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Adds the role to support accessibility when role is not already defined.
    if (!this.hasAttribute('role')) {
      this.setAttribute('role', 'region');
    }

    // Fetch the content zone elements
    const content = this._elements.content;

    // Move the content into the content zone if none specified
    if (!content.parentNode) {
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }

    // Assign the content zone so the insert function will be called
    this.content = content;
  }
}

export default Panel;
