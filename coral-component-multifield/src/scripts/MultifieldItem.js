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
import '../../../coral-component-button';
import item from '../templates/item';
import {DragAction} from '../../../coral-dragaction';
import {i18n, transform, commons} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-Multifield-item';

/**
 @class Coral.Multifield.Item
 @classdesc A Multifield item component. It can have a pre-filled content different from the Multifield template but
 added items will always be rendered based on the template.
 @htmltag coral-multifield-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const MultifieldItem = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = {
      // Create or fetch the content zones
      content: this.querySelector('coral-multifield-item-content') || document.createElement('coral-multifield-item-content')
    };

    const uid = this.id || commons.getUID();
    this.setAttribute('id', uid);
    this._elements.content.setAttribute('id', `${uid}-content`);
    item.call(this._elements, {i18n, uid});
  }

  /**
   The item content.

   @type {MultifieldItemContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-multifield-item-content',
      insert: function (content) {
        // Insert the content zone before the move and remove buttons
        this.insertBefore(content, this.firstChild);
      }
    });
  }

  /**
    Specify whether the remove button is in disabled state or not.

    @type {Boolean}
    @default false
    @private
    */
  get _deletable() {
    return typeof this.__deletable === 'boolean' ? this.__deletable : true;
  }

  set _deletable(value) {
    value = transform.boolean(value);
    this.__deletable = value;

    if(!this._readOnly) {
      this._elements.remove.disabled = !value;
    }
  }

  /**
   Whether the item is set to be reorder using the keyboard

   @type {boolean}
   @private
   */
  get _dragging() {
    return this.__dragging || false;
  }

  set _dragging(value) {
    this.__dragging = transform.boolean(value);
    if (this.__dragging) {
      // Setting role="application" to the move button forces
      // NVDA and JAWS screen readers into forms mode,
      // so arrow keys can be used to reorder.
      this._elements.move.setAttribute('role', 'application');
    } else {
      // when reordering stops, restore the default role for the move button
      this._elements.move.removeAttribute('role');
    }
    // aria-grabbed, may be deprecated in WAI-ARIA 1.1, but it is still reported by NVDA as "draggable" or "dragging"
    this._elements.move.setAttribute('aria-grabbed', this.__dragging);
    this._elements.move.setAttribute('aria-pressed', this.__dragging);
    this._elements.move.selected = this.__dragging;
  }

  /**
   Whether this multifieldItem is readOnly or not. Indicating that the user cannot modify the value of the multifieldItem fields.
   @type {Boolean}
   @default false
   @private
   */
  get _readOnly() {
    return this.__readOnly || false;
  }

  set _readOnly(value) {
    value = transform.booleanAttr(value);
    this.__readOnly = value;
    this._reflectAttribute('_readonly', value);

    // get all fields and set readonly to those whose has this property
    let allFields = this.querySelectorAll("*");
    Array.prototype.forEach.call(allFields, (field) => {
      if(typeof field.readOnly === "boolean") {
        field.readOnly = value;
      }
    });

    this._elements.move.disabled = value;
    this._elements.remove.disabled = value;
    this._elements.reorderup.disabled = value;
    this._elements.reorderdown.disabled = value;
  }

  get _contentZones() {
    return {'coral-multifield-item-content': 'content'};
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      '_readonly'
    ]);
  }

  /** @ignore */
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      _readonly: '_readOnly',
    });
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // a11y
    this.setAttribute('role', 'listitem');

    // Create a fragment
    const fragment = document.createDocumentFragment();

    const templateHandleNames = ['move', 'remove', 'reorderup', 'reorderdown'];

    // Render the main template
    fragment.appendChild(this._elements.remove);
    fragment.appendChild(this._elements.move);
    fragment.appendChild(this._elements.reorderup);
    fragment.appendChild(this._elements.reorderdown);

    const content = this._elements.content;

    // Remove it so we can process children
    if (content.parentNode) {
      this.removeChild(content);
    }

    // Process remaining elements as necessary
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
        // Add non-template elements to the label
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

    // Attach drag events
    const dragAction = new DragAction(this);
    dragAction.axis = 'vertical';
    dragAction.handle = this._elements.move;
    dragAction.scroll = true;
    dragAction.useScrollParent = true;
  }
});

export default MultifieldItem;
