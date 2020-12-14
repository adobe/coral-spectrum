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

const CLASSNAME = '_coral-SideNav-item';

import {BaseComponent} from '../../../coral-base-component';
import {BaseLabellable} from '../../../coral-base-labellable';
import {transform} from '../../../coral-utils';
import item from '../templates/item';
import '../../../coral-component-icon';

/**
 @class Coral.SideNav.Item
 @classdesc A SideNav Item component.
 @htmltag coral-sidenav-item
 @extends {HTMLAnchorElement}
 @extends {BaseComponent}
 */
class SideNavItem extends BaseLabellable(BaseComponent(HTMLAnchorElement)) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = {
      content: this.querySelector('coral-sidenav-item-content') || document.createElement('coral-sidenav-item-content')
    };

    item.call(this._elements);

    super._observeLabel();
  }

  /**
   The content of the sidenav item.

   @type {SideNavItemContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-sidenav-item-content',
      insert: function (content) {
        this._elements.container.appendChild(content);
      }
    });
  }

  /**
   Specifies the icon name used inside the item. See {@link Icon} for valid icon names.

   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon.icon;
  }

  set icon(value) {
    this._elements.icon.icon = value;
    this._elements.icon.hidden = this._elements.icon.icon === '';

    super._toggleIconAriaHidden();
  }

  /**
   Whether the item is selected.

   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }

  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);

    this.classList.toggle('is-selected', this._selected);

    this.trigger('coral-sidenav-item:_selectedchanged');
  }

  get _contentZones() {
    return {'coral-sidenav-item-label': 'content'};
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'icon']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Create a fragment
    const fragment = document.createDocumentFragment();

    // Render the main template
    fragment.appendChild(this._elements.container);

    const content = this._elements.content;

    // Remove it so we can process children
    if (content.parentNode) {
      content.parentNode.removeChild(content);
    }

    // Process remaining elements as necessary
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'container') {
        // Add non-template elements to the content
        content.appendChild(child);
      } else {
        // Remove anything else
        this.removeChild(child);
      }
    }

    // Add the frag to the component
    this.appendChild(fragment);

    // Assign the content zones, moving them into place in the process
    this.content = content;
  }
}

export default SideNavItem;
