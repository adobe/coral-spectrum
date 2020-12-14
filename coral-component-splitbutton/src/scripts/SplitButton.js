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
import '../../../coral-component-anchorbutton';
import '../../../coral-component-popover';
import '../../../coral-component-list';
import {transform, validate, commons} from '../../../coral-utils';

/**
 Enumeration for {@link SplitButton} variants.

 @typedef {Object} SplitButtonVariantEnum

 @property {String} DEFAULT
 The default button look and feel.
 @property {String} CTA
 A button that is meant to grab the user's attention.
 @property {String} SECONDARY
 A button that indicates that the button's action is the secondary action.
 */
const variant = {
  DEFAULT: 'default',
  CTA: 'cta',
  SECONDARY: 'secondary'
};

const CLASSNAME = '_coral-SplitButton';

/**
 @class Coral.SplitButton
 @classdesc A Split Button component composed of an action and a trigger {@link AnchorButton} or {@link Button}.
 These elements should be marked with following attributes:
 - <code>[coral-splitbutton-action]</code> for the main action button.
 - <code>[coral-splitbutton-trigger]</code> for the trigger button.

 @htmltag coral-splitbutton
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class SplitButton extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Watch for inner button changes
    this._observer = new MutationObserver(() => {
      this._updateLeftVariant();
      this._updateInnerButtons();
      this._updateInnerButtonsVariant(this.variant);
    });

    this._observer.observe(this, {
      subtree: true,
      childList: true
    });
  }

  /**
   The button's variant. See {@link SplitButtonVariantEnum}.

   @type {String}
   @default SplitButtonVariantEnum.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }

  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);

    this._updateInnerButtonsVariant(this._variant);
  }

  _getInnerButtons() {
    const action = this.querySelector('[coral-splitbutton-action]');
    const trigger = this.querySelector('[coral-splitbutton-trigger]');
    return {action, trigger};
  }

  _updateLeftVariant() {
    for (let i = 0 ; i < this.children.length ; i++) {
      const child = this.children[i];
      if (child.hasAttribute('coral-splitbutton-trigger')) {
        this.classList.add('_coral-SplitButton--left');
        return;
      } else if (child.hasAttribute('coral-splitbutton-action')) {
        this.classList.remove('_coral-SplitButton--left');
        return;
      }
    }
  }

  _updateInnerButtonsVariant(variant) {
    const {action, trigger} = this._getInnerButtons();
    if (action) {
      action.setAttribute('variant', variant);
    }
    if (trigger) {
      trigger.setAttribute('variant', variant);
    }
  }

  _updateInnerButtons() {
    const {action, trigger} = this._getInnerButtons();
    if (action) {
      action.classList.add('_coral-SplitButton-action');
    }
    if (trigger) {
      trigger.classList.add('_coral-SplitButton-trigger');
      // a11y assume a popover is targeting the trigger
      trigger.setAttribute('aria-haspopup', 'true');
      if (action) {
        action.id = action.id || commons.getUID();
        trigger.setAttribute('aria-labelledby', action.id);
      }
    }
  }

  /**
   Returns {@link SplitButton} variants.

   @return {SplitButtonVariantEnum}
   */
  static get variant() {
    return variant;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['variant']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // a11y
    this.setAttribute('role', 'group');

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }

    // Update styles
    this._updateLeftVariant();
    this._updateInnerButtons();
  }
}

export default SplitButton;
