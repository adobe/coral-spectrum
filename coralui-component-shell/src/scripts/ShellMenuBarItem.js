/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import Component from 'coralui-mixin-component';
import {transform, validate} from 'coralui-util';
import 'coralui-component-icon';
import 'coralui-component-button';
import menuBarItem from '../templates/menuBarItem';

/**
 Enum for menubar item iconVariant.
 @enum {String}
 @memberof Coral.Shell.MenuBar.Item
 */
const iconVariant = {
  /** A default menubar item */
  DEFAULT: 'default',
  /** A round image as menubar item */
  CIRCLE: 'circle'
};

// the Menubar Item's base classname
const CLASSNAME = 'coral3-Shell-menubar-item';

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
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class ShellMenuBarItem extends Component(HTMLElement) {
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
      'global:coral-overlay:open': '_handleOverlayEvent'
    });
  }
  
  /**
   Specifies the icon name used inside the menu item.
   See {@link Coral.Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   @memberof Coral.Shell.MenuBar.Item#
   
   @see {@link Coral.Icon}
   */
  get icon() {
    return this._elements.shellMenuButton.icon;
  }
  set icon(value) {
    this._elements.shellMenuButton.icon = value;
  }
  
  /**
   Size of the icon. It accepts both lower and upper case sizes.
   
   @type {Coral.Icon.size}
   @default Coral.Icon.size.SMALL
   @htmlattribute iconsize
   @memberof Coral.Shell.MenuBar.Item#
   
   @see {@link Coral.Icon#size}
   */
  get iconSize() {
    return this._elements.shellMenuButton.iconSize;
  }
  set iconSize(value) {
    this._elements.shellMenuButton.iconSize = value;
  }
  
  /**
   The menubar item's iconVariant.
   @type {Coral.Shell.MenuBar.Item.iconVariant}
   @default Coral.Shell.MenuBar.Item.iconVariant.DEFAULT
   @htmlattribute iconvariant
   @memberof Coral.Shell.MenuBar.Item#
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
   @memberof Coral.Shell.MenuBar.Item#
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
   @memberof Coral.Shell.MenuBar.Item#
   
   @fires Coral.Shell.MenuBar.Item#coral-shell-menubar-item:open
   @fires Coral.Shell.MenuBar.Item#coral-shell-menubar-item:close
   */
  get open() {
    return this._open || false;
  }
  set open(value) {
    const menu = this._getMenu();
  
    // if we want to open the dialog we need to make sure there is a valid menu
    if (menu !== null) {
      this._open = transform.booleanAttr(value);
      this._reflectAttribute('open', this._open);
    
      // Toggle the target menu
      if (menu.open !== this._open) {
        menu.open = this._open;
      }
  
      this.trigger(`coral-shell-menubar-item:${this._open ? 'open' : 'close'}`);
    }
  }
  
  /**
   The menubar item's label content zone.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Shell.MenuBar.Item#
   */
  get label() {
    return this._getContentZone(this._elements.shellMenuButtonLabel);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'shellMenuButtonLabel',
      tagName: 'coral-button-label',
      insert: function(label) {
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
   @memberof Coral.Shell.MenuBar.Item#
   */
  get menu() {
    return this._menu || null;
  }
  set menu(value) {
    this._menu = value instanceof HTMLElement ? value : String(value);
  }
  
  /** @private */
  _handleOverlayEvent(event) {
    const target = event.target;
    
    // matches the open state of the target in case it was open separately
    if (target === this._getMenu() && this.open !== target.open) {
      this.open = target.open;
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
  
  get defaultContentZone() { return this.label; }
  set defaultContentZone(value) { this.label = value; }
  get _contentZones() { return {'coral-button-label': 'label'}; }
  
  // Expose enums
  static get iconVariant() { return iconVariant; }
  
  static get observedAttributes() {
    return [
      'icon',
      'iconsize',
      'iconSize',
      'iconvariant',
      'iconVariant',
      'badge',
      'open',
      'menu'
    ];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    const button = this.querySelector('.coral3-Shell-menu-button');
    
    if (button) {
      this._elements.shellMenuButton = button;
      this._elements.shellMenuButtonLabel = this.querySelector('coral-button-label');
    }
    else {
      while (this.firstChild) {
        this._elements.shellMenuButtonLabel.appendChild(this.firstChild);
      }
  
      this.appendChild(this._elements.shellMenuButton);
    }
  
    this.label = this._elements.shellMenuButtonLabel;
  }
  
  /**
   Triggerred after the overlay is opened with <code>show()</code> or <code>instance.open = true</code>
   
   @event Coral.Shell.MenuBar.Item#coral-shell-menubar-item:open
   
   @param {Object} event
   Event object.
   */
  
  /**
   Triggerred after the component is closed with <code>hide()</code> or <code>instance.open = false</code>
   
   @event Coral.Shell.MenuBar.Item#coral-shell-menubar-item:close
   
   @param {Object} event
   Event object.
   */
}

export default ShellMenuBarItem;
