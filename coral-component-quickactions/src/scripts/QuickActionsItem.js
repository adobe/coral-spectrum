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
import {transform, validate} from '../../../coral-utils';

/**
 Enumeration for {@link QuickActionsItem} type values.

 @typedef {Object} QuickActionsItemTypeEnum

 @property {String} BUTTON
 Default button type
 @property {String} ANCHOR
 Anchor button type
 */
const type = {
  BUTTON: 'button',
  ANCHOR: 'anchor'
};

/**
 @class Coral.QuickActions.Item
 @classdesc A QuickActions item component
 @htmltag coral-quickactions-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class QuickActionsItem extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // QuickActions will add button/anchorbutton references to it
    this._elements = {};

    this._observer = new MutationObserver(this._onMutation.bind(this));
    this._observer.observe(this, {
      characterData: true,
      childList: true,
      subtree: true
    });
  }

  // @compat
  get content() {
    return this;
  }

  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }

  /**
   When <code>type</code> is {@link Coral.QuickActions.Item.type.ANCHOR}, the href will be used for the anchor.

   @type {String}
   @default ""
   @htmlattribute href
   @htmlattributereflected
   @emits {coral-quickactions-item:_hrefchanged}
   */
  get href() {
    return this._href || '';
  }

  set href(value) {
    let _href = transform.string(value);

    if(this._href === _href) {
      return;
    }
    this._href = _href;
    this._reflectAttribute('href', this._href);

    this.trigger('coral-quickactions-item:_hrefchanged');
  }

  /**
   Specifies the name of the icon to be shown in the QuickActions Item. See {@link Icon} for valid icon
   names.

   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   @emits {coral-quickactions-item:_iconchanged}
   */
  get icon() {
    return this._icon || '';
  }

  set icon(value) {
    let _icon = transform.string(value);

    if(this._icon === _icon) {
      return;
    }
    this._icon = _icon;
    this._reflectAttribute('icon', this._icon);

    this.trigger('coral-quickactions-item:_iconchanged');
  }

  /**
   The type of item that will be used. Setting {@link QuickActionsItemTypeEnum}.ANCHOR will allow users to
   navigate using the quickactions proving the correct hypermedia to the users.

   @type {String}
   @default QuickActionsItemTypeEnum.BUTTON
   @htmlattribute type
   @htmlattributereflected
   */
  get type() {
    return this._type || type.BUTTON;
  }

  set type(value) {
    let _value = transform.string(value).toLowerCase();
    let _type = validate.enumeration(type)(_value) && _value || type.BUTTON;

    if(this._type === _type) {
      return;
    }
    this._type = _type;
    this._reflectAttribute('type', this._type);

    this.trigger('coral-quickactions-item:_typechanged');
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.textContent && this.textContent.replace(/\s{2,}/g, ' ').trim() || this.icon) :
      this._trackingElement;
  }

  set trackingElement(value) {
    super.trackingElement = value;
  }

  /**
   Handles mutations on the Item.

   @emits {coral-quickactions-item:_contentchanged}

   @private
   */
  _onMutation() {
    this.trigger('coral-quickactions-item:_contentchanged');
  }

  /**
   Returns {@link QuickActionsItem} type options.

   @return {QuickActionsItemTypeEnum}
   */
  static get type() {
    return type;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['href', 'icon', 'type']);
  }

  /** @ignore */
  render() {
    super.render();

    // Default reflected attributes
    if (!this._type) {
      this.type = type.BUTTON;
    }
  }

  /**
   Triggered when an icon of a {@link QuickActionsItem} was changed.

   @typedef {CustomEvent} coral-quickactions-item:_iconchanged

   @private
   */

  /**
   Triggered when the content of a {@link QuickActionsItem} was changed.

   @typedef {CustomEvent} coral-quickactions-item:_contentchanged

   @private
   */

  /**
   Triggered when the href of a {@link QuickActionsItem} was changed.

   @typedef {CustomEvent} coral-quickactions-item:_hrefchanged

   @private
   */

  /**
   Triggered when the type of a {@link QuickActionsItem} was changed.

   @typedef {CustomEvent} coral-quickactions-item:_typechanged

   @private
   */
}

export default QuickActionsItem;
