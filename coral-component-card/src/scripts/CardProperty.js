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
import '../../../coral-component-icon';
import icon from '../templates/icon';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-Card-property';

/**
 @class Coral.Card.Property
 @classdesc A Card property component
 @htmltag coral-card-property
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const CardProperty = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = {
      content: this.querySelector('coral-card-property-content') || document.createElement('coral-card-property-content')
    };
    icon.call(this._elements);
  }

  /**
   The property's content zone

   @type {CardPropertyContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-card-property-content',
      insert: function (content) {
        this.appendChild(content);
      }
    });
  }

  /**
   Specifies the icon name used inside the property. See {@link Icon} for valid icon names.

   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon.icon;
  }

  set icon(value) {
    this._elements.icon.icon = value;

    // removes the icon element from the DOM since there is no valid icon. this causes the content to have the
    // correct styling
    if (this.icon === '') {
      this._elements.icon.remove();
    } else if (!this._elements.icon.parentNode) {
      this.insertBefore(this._elements.icon, this.firstChild);
    }
  }

  /**
   Specifies the alternative text to be used for the icon.

   @type {String}
   @default ""
   @htmlattribute iconalt
   */
  get iconAlt() {
    return this._elements.icon ? this._elements.icon.getAttribute('alt') : undefined;
  }

  set iconAlt(value) {
    this._elements.icon && this._elements.icon.setAttribute('alt', value);
  }

  /**
   Specifies the title attribute to be used for the icon.

   @type {String}
   @default ""
   @htmlattribute icontitle
   */
  get iconTitle() {
    return this._elements.icon ? this._elements.icon.getAttribute('title') : undefined;
  }

  set iconTitle(value) {
    this._elements.icon && this._elements.icon.setAttribute('title', value);
  }

  get _contentZones() {
    return {'coral-card-property-content': 'content'};
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      iconalt: 'iconAlt',
      icontitle: 'iconTitle',
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['icon', 'iconalt', 'icontitle']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME, 'coral-Body--small');

    // Create a fragment
    const frag = document.createDocumentFragment();

    // Render the main template
    if (this.icon) {
      frag.appendChild(this._elements.icon);
    }

    const content = this._elements.content;

    // Remove it so we can process children
    if (content.parentNode) {
      content.parentNode.removeChild(content);
    }

    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'icon') {
        // Add non-template elements to the label
        content.appendChild(child);
      } else {
        this.removeChild(child);
      }
    }

    // Add the frag to the component
    this.appendChild(frag);

    // Assign the content zones, moving them into place in the process
    this.content = content;

    // Adjusting icon aria-label attribute as per coral-card-property title attribute

    var parentElement = this._elements.icon.parentElement;

    if (parentElement !== null && parentElement.hasAttribute("title")) {
      console.log("test");
      const iconParentTitle = parentElement.getAttribute("title");
      this._elements.icon.setAttribute("aria-label", iconParentTitle);
    }
  }
});

export default CardProperty;
