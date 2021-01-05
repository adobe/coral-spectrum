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
import {BaseLabellable} from '../../../coral-base-labellable';
import base from '../templates/base';
import {transform, commons} from '../../../coral-utils';
import {Icon} from '../../../coral-component-icon';
import getTarget from './getTarget';

const CLASSNAME = '_coral-Tabs-item';

/**
 @class Coral.Tab
 @classdesc A Tab component
 @htmltag coral-tab
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Tab extends BaseLabellable(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Templates
    this._elements = {
      label: this.querySelector('coral-tab-label') || document.createElement('coral-tab-label'),
      invalidIcon: this.querySelector('._coral-Tabs-itemInvalidIcon') || this._createInvalidIcon()
    };
    base.call(this._elements);

    // Listen for mutations
    this._observer = new MutationObserver(() => {
      // Change icon size if the label is empty
      const icon = this._elements.icon;
      if (icon) {
        icon.size = this._elements.label.textContent.trim().length ? Icon.size.EXTRA_SMALL : Icon.size.SMALL;
      }

      super._toggleIconAriaHidden();

      this.trigger('coral-tab:_sizechanged');
    });

    // Watch for changes to the label element
    this._observer.observe(this._elements.label, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  /**
   The label of the tab.

   @type {TabLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-tab-label',
      insert: function (label) {
        label.classList.add(`${CLASSNAME}Label`);
        this.appendChild(label);

        this._toggleEllipsis();
      }
    });
  }

  /**
   Specifies the name of the icon used inside the Tab. See {@link Icon} for valid icon names.

   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    const iconElement = this._elements.icon;
    return iconElement ? iconElement.icon : '';
  }

  set icon(value) {
    const iconElement = this._elements.icon;
    iconElement.icon = value;

    // removes the icon element from the DOM.
    if (this.icon === '') {
      iconElement.remove();
      this.trigger('coral-tab:_sizechanged');
    }
    // adds the icon back since it was blown away by textContent
    else if (!iconElement.parentElement) {
      // Change icon size if the label is empty
      if (!this._elements.label.textContent.trim().length) {
        iconElement.size = Icon.size.SMALL;
      }

      super._toggleIconAriaHidden();

      this.insertBefore(iconElement, this.firstChild);
      this.trigger('coral-tab:_sizechanged');
    }
  }

  /**
   Whether the current Tab is invalid.

   @type {Boolean}
   @default false
   @htmlattribute invalid
   @htmlattributereflected
   */
  get invalid() {
    return this._invalid || false;
  }

  set invalid(value) {
    this._invalid = transform.booleanAttr(value);
    this._reflectAttribute('invalid', this._invalid);

    this.classList.toggle('is-invalid', this._invalid);
    this.setAttribute('aria-invalid', this._invalid);
    if (this._invalid) {
      this._elements.invalidIcon.removeAttribute('hidden');
    } else {
      this._elements.invalidIcon.setAttribute('hidden', 'true');
    }
  }

  /**
   Whether this Tab is disabled. When set to true, this will prevent every user interacting with the Tab. If
   disabled is set to true for a selected Tab it will be deselected.

   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }

  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);

    this.classList.toggle('is-disabled', this._disabled);
    this[this._disabled ? 'setAttribute' : 'removeAttribute']('aria-disabled', this._disabled);

    if (this._disabled && this.selected) {
      this.selected = false;
    }

    if (!this._disabled && !this.selected) {
      // We inform the parent to verify if this item should be selected because it's the only one left
      this.trigger('coral-tab:_validateselection');
    }
  }

  /**
   Whether the tab is selected.
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

    if (!_selected || _selected && !this.disabled) {
      this._selected = _selected;
      this._reflectAttribute('selected', this.disabled ? false : this._selected);

      this.classList.toggle('is-selected', this._selected);
      this.setAttribute('tabindex', this._selected ? '0' : '-1');
      this.setAttribute('aria-selected', this._selected);

      // in case the tab is selected, we need to communicate it to the panels.
      if (this._selected) {
        this._selectTarget();
      }
      this.trigger('coral-tab:_selectedchanged');
    }
  }

  /**
   The target element that will be selected when this Tab is selected. It accepts a CSS selector or a DOM element.
   If a CSS Selector is provided, the first matching element will be used.

   @type {?HTMLElement|String}
   @default null
   @htmlattribute target
   */
  get target() {
    return typeof this._target === 'string' ? this._target : this._target || null;
  }

  set target(value) {
    if (value === null || typeof value === 'string' || value instanceof Node) {
      this._target = value;

      const realTarget = getTarget(this.target);

      // we add proper accessibility if available
      if (realTarget) {
        // creates a 2 way binding for accessibility
        this.setAttribute('aria-controls', realTarget.id);
        realTarget.setAttribute('aria-labelledby', this.id);

        // adds role to panel to support accessibility
        realTarget.setAttribute('role', 'tabpanel');
      }
    }
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      // keep spaces to only 1 max and trim. this mimics native html behaviors
      (this.label || this).textContent.replace(/\s{2,}/g, ' ').trim() :
      this._trackingElement;
  }

  set trackingElement(value) {
    super.trackingElement = value;
  }

  _toggleEllipsis() {
    requestAnimationFrame(() => {
      this.classList.toggle('is-overflowing', this._elements.label.clientWidth > this.clientWidth);
    });
  }

  /**
   Selects the target item

   @ignore
   */
  _selectTarget() {
    let realTarget = getTarget(this.target);
    // if the target was define at the tab level, it has precedence over everything
    if (realTarget) {
      realTarget.setAttribute('selected', '');
    }
    // otherwise, we use the target defined at the tablist level
    else {
      const tabList = this.parentNode;

      if (tabList && tabList.target) {
        realTarget = getTarget(tabList.target);

        if (realTarget) {
          // we get the position of this tab inside the tablist
          const currentIndex = tabList.items.getAll().indexOf(this);

          // we select the item with the same index
          const targetItem = (realTarget.items ? realTarget.items.getAll() : realTarget.children)[currentIndex];

          // we select the item if it exists
          if (targetItem) {
            targetItem.setAttribute('selected', '');
          }
        }
      }
    }
  }

  _createInvalidIcon() {
    const iconElement = document.createElement('coral-icon');
    iconElement.icon = 'alert';
    iconElement.size = Icon.size.EXTRA_SMALL;
    iconElement.setAttribute('aria-hidden', 'true');
    iconElement.classList.add('_coral-Tabs-itemInvalidIcon');
    if (!this._invalid) {
      iconElement.setAttribute('hidden', 'true');
    }
    return iconElement;
  }

  get _contentZones() {
    return {'coral-tab-label': 'label'};
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'disabled', 'icon', 'invalid', 'target']);
  }

  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    // Query the tab target once the tab item is inserted in the DOM
    if (this.selected) {
      this._selectTarget();
    }
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // adds the role to support accessibility
    this.setAttribute('role', 'tab');

    // Generate a unique ID for the tab panel if one isn't already present
    // This will be used for accessibility purposes
    this.setAttribute('id', this.id || commons.getUID());

    // Create a fragment
    const frag = document.createDocumentFragment();

    // Render the main template
    if (this.icon) {
      frag.appendChild(this._elements.icon);
    }

    if (this._elements.invalidIcon) {
      frag.append(this._elements.invalidIcon);
    }

    const label = this._elements.label;

    // Remove it so we can process children
    if (label.parentNode) {
      label.parentNode.removeChild(label);
    }

    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'icon') {
        // Add non-template elements to the label
        label.appendChild(child);
      } else {
        this.removeChild(child);
      }
    }

    // Add the frag to the component
    this.appendChild(frag);

    // Assign the content zones, moving them into place in the process
    this.label = label;
  }
}

export default Tab;
