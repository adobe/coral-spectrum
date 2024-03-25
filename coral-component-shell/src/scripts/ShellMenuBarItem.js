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
import {commons, transform, validate} from '../../../coral-utils';
import '../../../coral-component-icon';
import '../../../coral-component-button';
import '../../../coral-component-anchorbutton';
import menuBarItem from '../templates/menuBarItem';

/**
 Enumeration for {@link ShellMenuBarItem} icon variants.

 @typedef {Object} ShellMenuBarItemIconVariantEnum

 @property {String} DEFAULT
 A default menubar item.
 @property {String} CIRCLE
 A round image as menubar item.
 */
const iconVariant = {
  DEFAULT: 'default',
  CIRCLE: 'circle'
};

/**
 Enumeration for valid aria-haspopup values.

 @typedef {Object} ShellMenuBarItemHasPopupRoleEnum
 @property {String} MENU
 ShellMenuBarItem opens a menu.
 @property {String} LISTBOX
 ShellMenuBarItem opens a list box.
 @property {String} TREE
 ShellMenuBarItem opens a tree.
 @property {String} GRID
 ShellMenuBarItem opens a grid.
 @property {String} DIALOG
 ShellMenuBarItem opens a dialog.
 @property {Null} DEFAULT
 Defaults to null.

 */
const hasPopupRole = {
  MENU: 'menu',
  LISTBOX: 'listbox',
  TREE: 'tree',
  GRID: 'grid',
  DIALOG: 'dialog',
  DEFAULT: null
};

// the Menubar Item's base classname
const CLASSNAME = '_coral-Shell-menubar-item';

// Builds a string containing all possible iconVariant classnames. This will be used to remove classnames when the variant
// changes
const ALL_ICON_VARIANT_CLASSES = [];
for (const variantValue in iconVariant) {
  ALL_ICON_VARIANT_CLASSES.push(`${CLASSNAME}--${iconVariant[variantValue]}`);
}

/**
 @class Coral.Shell.MenuBar.Item
 @classdesc A Shell MenuBar Item component
 @htmltag coral-shell-menubar-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class ShellMenuBarItem extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Templates
    this._elements = {};
    menuBarItem.call(this._elements);

    // Events
    this._delegateEvents({
      'click [handle="shellMenuButton"]': '_handleButtonClick',

      // it has to be global because the menus are not direct children
      'global:coral-overlay:close': '_handleOverlayEvent',
      'global:coral-overlay:beforeclose': '_handleOverlayBeforeEvent',
      'global:coral-overlay:open': '_handleOverlayEvent',
      'global:coral-overlay:beforeopen': '_handleOverlayBeforeEvent'
    });
  }

  /**
   Specifies the icon name used inside the menu item.
   See {@link Icon} for valid icon names.

   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.shellMenuButton.icon;
  }

  set icon(value) {
    this._elements.shellMenuButton.icon = value;
  }

  /**
   Size of the icon. It accepts both lower and upper case sizes. See {@link ButtonIconSizeEnum}.

   @type {String}
   @default ButtonIconSizeEnum.SMALL
   @htmlattribute iconsize
   @htmlattributereflected
   */
  get iconSize() {
    return this._elements.shellMenuButton.iconSize;
  }

  set iconSize(value) {
    this._elements.shellMenuButton.iconSize = value;
    // Required for styling
    this._reflectAttribute('iconsize', this.iconSize);
  }

  /**
   The menubar item's iconVariant. See {@link ShellMenuBarItemIconVariantEnum}.

   @type {String}
   @default ShellMenuBarItemIconVariantEnum.DEFAULT
   @htmlattribute iconvariant
   */
  get iconVariant() {
    return this._iconVariant || iconVariant.DEFAULT;
  }

  set iconVariant(value) {
    value = transform.string(value).toLowerCase();
    this._iconVariant = validate.enumeration(iconVariant)(value) && value || iconVariant.DEFAULT;

    // removes all the existing variants
    this.classList.remove(...ALL_ICON_VARIANT_CLASSES);
    // adds the new variant
    if (this.variant !== iconVariant.DEFAULT) {
      this.classList.add(`${CLASSNAME}--${this._iconVariant}`);
    }
  }

  /**
   The notification badge content.

   @type {String}
   @default ""
   @htmlattribute badge
   */
  get badge() {
    return this._elements.shellMenuButton.getAttribute('badge') || '';
  }

  set badge(value) {
    // Non-truthy values shouldn't show
    // null, empty string, 0, etc
    this._elements.shellMenuButton[!value || value === '0' ? 'removeAttribute' : 'setAttribute']('badge', value);
  }

  /**
   Whether the menu is open or not.

   @type {Boolean}
   @default false
   @htmlattribute open
   @htmlattributereflected

   @emits {coral-shell-menubar-item:open}
   @emits {coral-shell-menubar-item:close}
   */
  get open() {
    return this._open || false;
  }

  set open(value) {
    const menu = this._getMenu();

    // if we want to open the dialog we need to make sure there is a valid menu or hasPopup
    if (menu === null && this.hasPopup === hasPopupRole.DEFAULT) {
      return;
    }

    this._open = transform.booleanAttr(value);
    this._reflectAttribute('open', this._open);

    // if the menu is valid, toggle the menu and trigger the appropriate event
    if (menu !== null) {
      // Toggle the target menu
      if (menu.open !== this._open) {
        menu.open = this._open;
      }

      this.trigger(`coral-shell-menubar-item:${this._open ? 'open' : 'close'}`);
    }

    this._elements.shellMenuButton.setAttribute('aria-expanded', this._open);
  }

  /**
   The menubar item's label content zone.

   @type {ButtonLabel}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.shellMenuButtonLabel);
  }

  set label(value) {
    this._setContentZone('label', value, {
      handle: 'shellMenuButtonLabel',
      tagName: 'coral-button-label',
      insert: function (label) {
        this._elements.shellMenuButton.label = label;
      }
    });
  }

  /**
   The menu that this menu item should show. If a CSS selector is provided, the first matching element will be
   used.

   @type {?HTMLElement|String}
   @default null
   @htmlattribute menu
   */
  get menu() {
    return this._menu || null;
  }

  set menu(value) {
    let menu;
    if (value instanceof HTMLElement) {
      this._menu = value;
      menu = this._menu;
    } else {
      this._menu = String(value);
      menu = document.querySelector(this._menu);
    }

    // Link menu with item
    if (menu !== null) {
      this.id = this.id || commons.getUID();
      menu.setAttribute('target', `#${this.id}`);
      if (this.hasPopup === hasPopupRole.DEFAULT) {
        this.hasPopup = menu.getAttribute('role') || hasPopupRole.DIALOG;
      }
    } else if (this._menu && this.hasPopup !== hasPopupRole.DEFAULT) {
      this.hasPopup = hasPopupRole.DEFAULT;
    }
  }

  /**
   Whether the item opens a popup dialog or menu. Accepts either "menu", "listbox", "tree", "grid", or "dialog".
   @type {?String}
   @default ShellMenuBarItemHasPopupRoleEnum.DEFAULT
   @htmlattribute haspopup
   */
  get hasPopup() {
    return this._hasPopup || null;
  }

  set hasPopup(value) {
    value = transform.string(value).toLowerCase();
    this._hasPopup = validate.enumeration(hasPopupRole)(value) && value || hasPopupRole.DEFAULT;

    const shellMenuButton = this._elements.shellMenuButton;
    let ariaHaspopup = this._hasPopup;

    if (ariaHaspopup) {
      shellMenuButton.setAttribute('aria-haspopup', ariaHaspopup);
      shellMenuButton.setAttribute('aria-expanded', this.open);
    } else {
      shellMenuButton.removeAttribute('aria-haspopup');
      shellMenuButton.removeAttribute('aria-expanded');
    }
  }

  _handleOverlayBeforeEvent(event) {
    const target = event.target;

    if (target === this._getMenu()) {
      // Mark button as selected
      this._elements.shellMenuButton.classList.toggle('is-selected', !target.open);
    }
  }

  /** @private */
  _handleOverlayEvent(event) {
    const target = event.target;

    // matches the open state of the target in case it was open separately
    if (target === this._getMenu()) {
      const shellMenuButton = this._elements.shellMenuButton;
      if (this.open !== target.open) {
        this.open = target.open;
      } else if (shellMenuButton.getAttribute('aria-expanded') !== target.open) {
        shellMenuButton.setAttribute('aria-expanded', target.open);
      }
    }
  }

  /** @ignore */
  _handleButtonClick() {
    this.open = !this.open;
  }

  /** @ignore */
  _getMenu(targetValue) {
    // Use passed target
    targetValue = targetValue || this.menu;

    if (targetValue instanceof Node) {
      // Just return the provided Node
      return targetValue;
    }

    // Dynamically get the target node based on target
    let newTarget = null;
    if (typeof targetValue === 'string') {
      newTarget = document.querySelector(targetValue);
    }

    return newTarget;
  }

  get _contentZones() {
    return {'coral-button-label': 'label'};
  }

  /** @ignore */
  focus() {
    this._elements.shellMenuButton.focus();
  }

  /**
   Returns {@link ShellMenuBarItem} icon variants.

   @return {ShellMenuBarItemIconVariantEnum}
   */
  static get iconVariant() {
    return iconVariant;
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      haspopup: 'hasPopup',
      iconsize: 'iconSize',
      iconvariant: 'iconVariant'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'haspopup',
      'icon',
      'iconsize',
      'iconvariant',
      'badge',
      'open',
      'menu',
      'aria-label'
    ]);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    // a11y When user doesn't supply a button label (for an icon-only button),
    // providing aria-label will correctly pass it on to the shell menu button child element.
    if (name === 'aria-label') {
      if (value && this._elements.shellMenuButton.textContent.trim() === '') {
        this._elements.shellMenuButton.setAttribute('aria-label', this.title ? this.title : value);
      }
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  /** @ignore */
  render() {
    super.render();

    this.setAttribute('role', 'listitem');

    this.classList.add(CLASSNAME);

    const button = this.querySelector('._coral-Shell-menu-button');

    if (button) {
      this._elements.shellMenuButton = button;
      this._elements.shellMenuButtonLabel = this.querySelector('coral-button-label');
    } else {
      while (this.firstChild) {
        this._elements.shellMenuButtonLabel.appendChild(this.firstChild);
      }

      this.appendChild(this._elements.shellMenuButton);
    }

    this.label = this._elements.shellMenuButtonLabel;

    // Sync menu
    if (this.menu !== null) {
      this.menu = this.menu;
    }

    commons.nextFrame(() => {
      let shellMenuButtonIcon = this._elements.shellMenuButton.getElementsByTagName('coral-icon')[0];

      if(shellMenuButtonIcon !== null) {
        shellMenuButtonIcon.querySelector('coral-icon')[0].setAttribute('alt', this.title);
      } 
    });
  }

  /**
   Triggered after the {@link ShellMenuBarItem} is opened with <code>show()</code> or <code>instance.open = true</code>

   @typedef {CustomEvent} coral-shell-menubar-item:open
   */

  /**
   Triggered after the {@link ShellMenuBarItem} is closed with <code>hide()</code> or <code>instance.open = false</code>

   @typedef {CustomEvent} coral-shell-menubar-item:close
   */
}

export default ShellMenuBarItem;
