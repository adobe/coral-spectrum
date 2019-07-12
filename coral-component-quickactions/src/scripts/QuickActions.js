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

import {Icon} from '../../../coral-component-icon';
import {Button} from '../../../coral-component-button';
import {AnchorButton} from '../../../coral-component-anchorbutton';
import {ButtonList, AnchorList} from '../../../coral-component-list';
import {Overlay} from '../../../coral-component-overlay';
import {Collection} from '../../../coral-collection';
import QuickActionsItem from './QuickActionsItem';
import '../../../coral-component-popover';
import base from '../templates/base';
import {transform, validate, commons, i18n} from '../../../coral-utils';

// 32px button width + 8px left margin
const BUTTON_WIDTH = 32 + 8;

const BUTTON_FOCUSABLE_SELECTOR = '._coral-QuickActions-item:not([disabled]):not([hidden])';

/**
 Enumeration for {@link QuickActions} interaction options.
 
 @typedef {Object} QuickActionsInteractionEnum
 
 @property {String} ON
 Show when the target is hovered or focused and hide when the mouse is moved out or focus is lost.
 @property {String} OFF
 Do not show or hide automatically.
 */
const interaction = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link QuickActions} anchored overlay target options.
 
 @typedef {Object} QuickActionsTargetEnum
 
 @property {String} PARENT
 Use the parent element in the DOM.
 @property {String} PREVIOUS
 Use the previous sibling element in the DOM.
 @property {String} NEXT
 Use the next sibling element in the DOM.
 */
const target = {
  PARENT: '_parent',
  PREVIOUS: '_prev',
  NEXT: '_next'
};

/**
 Enumeration for {@link QuickActions} placement options.
 
 @typedef {Object} QuickActionsPlacementEnum
 
 @property {String} TOP
 QuickActions inset to the top of the target.
 @property {String} CENTER
 QuickActions inset to the center of the target.
 @property {String} BOTTOM
 QuickActions inset to the bottom the target.
 */
const placement = {
  TOP: 'top',
  CENTER: 'center',
  BOTTOM: 'bottom'
};

const OFFSET = 10;

const CLASSNAME = '_coral-QuickActions';

/**
 @class Coral.QuickActions
 @classdesc A QuickActions component is an overlay component that reveals actions when interacting with a container.
 Hovering the target will display the QuickActions. They can also be launched by pressing the shift + F10 key combination
 when the target is focused.
 @htmltag coral-quickactions
 @extends {Overlay}
 */
class QuickActions extends Overlay {
  /** @ignore */
  constructor() {
    super();
    
    // Override defaults
    this._overlayAnimationTime = Overlay.FADETIME;
    this._alignMy = Overlay.align.CENTER_TOP;
    this._alignAt = Overlay.align.CENTER_TOP;
    this._lengthOffset = OFFSET;
    this._inner = true;
    this._target = target.PREVIOUS;
    this._placement = placement.TOP;
    this._focusOnShow = this;
  
    // Flag
    this._openedBefore = false;
  
    // Debounce timer
    this._timeout = null;
    
    // Template
    base.call(this._elements, {commons, i18n});
  
    const events = {
      'global:resize': '_onWindowResize',
      'mouseout': '_onMouseOut',

      // Keyboard interaction
      'key:home': '_onHomeKeypress',
      'key:end': '_onEndKeypress',
      'key:pagedown': '_onButtonKeypressNext',
      'key:right': '_onButtonKeypressNext',
      'key:down': '_onButtonKeypressNext',
      'key:pageup': '_onButtonKeypressPrevious',
      'key:left': '_onButtonKeypressPrevious',
      'key:up': '_onButtonKeypressPrevious',
    
      // Buttons
      'click > ._coral-QuickActions-item:not([handle="moreButton"])': '_onButtonClick',
      'click > ._coral-QuickActions-item[handle="moreButton"]': '_onMoreButtonClick',
    
      // Items
      'coral-quickactions-item:_contentchanged': '_onItemChange',
      'coral-quickactions-item:_iconchanged': '_onItemChange',
      'coral-quickactions-item:_hrefchanged': '_onItemChange',
      'coral-quickactions-item:_typechanged': '_onItemTypeChange'
    };
  
    const overlayId = this._elements.overlay.id;
    
    // Overlay
    events[`global:capture:coral-overlay:beforeopen #${overlayId}`] = '_onOverlayBeforeOpen';
    events[`global:capture:coral-overlay:beforeclose #${overlayId}`] = '_onOverlayBeforeClose';
    events[`global:capture:coral-overlay:open #${overlayId}`] = '_onOverlayOpen';
    events[`global:capture:coral-overlay:close #${overlayId}`] = '_onOverlayClose';
    events[`global:capture:coral-overlay:positioned #${overlayId}`] = '_onOverlayPositioned';
    events[`global:capture:mouseout #${overlayId}`] = '_onMouseOut';
    events[`global:capture:click #${overlayId} [coral-list-item]`] = '_onButtonListItemClick';
  
    // Cache bound event handler functions
    this._onTargetMouseEnter = this._onTargetMouseEnter.bind(this);
    this._onTargetKeyUp = this._onTargetKeyUp.bind(this);
    this._onTargetMouseLeave = this._onTargetMouseLeave.bind(this);
  
    // Events
    this._delegateEvents(events);
  
    // delegates the item handling to the collection
    this.items._startHandlingItems(true);
  }
  
  /**
   Returns the inner overlay to allow customization.
   
   @type {Popover}
   @readonly
   */
  get overlay() {
    return this._elements.overlay;
  }
  
  /**
   The Item collection.
   
   @type {Collection}
   @readonly
   */
  get items() {
    // we do lazy initialization of the collection
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-quickactions-item',
        onItemRemoved: this._onItemRemoved,
        onCollectionChange: this._onCollectionChange
      });
    }
  
    return this._items;
  }
  
  /**
   The number of items that are visible in QuickActions (excluding the show more actions button) before a collapse
   is enforced. A value <= 0 disables this feature and shows as many items as possible. Regardless of this
   property, the QuickActions will still fit within their target's width.
   
   @type {Number}
   @default 4
   @htmlattribute threshold
   @htmlattributereflected
   */
  get threshold() {
    return typeof this._threshold === 'number' ? this._threshold : 4;
  }
  set threshold(value) {
    this._threshold = transform.number(value);
    this._reflectAttribute('threshold', this._threshold);
  }
  
  /**
   The placement of the QuickActions. The value may be one of 'top', 'center' and 'bottom' and indicates the vertical
   alignment of the QuickActions relative to their container.
   See {@link OverlayPlacementEnum}.
   
   @type {String}
   @default OverlayPlacementEnum.TOP
   @htmlattribute placement
   */
  get placement() {
    return super.placement;
  }
  set placement(value) {
    value = transform.string(value).toLowerCase();
    this._placement = validate.enumeration(placement)(value) && value || placement.TOP;
    
    this.reposition();
  }
  
  /**
   Whether the QuickActions should show when the target is interacted with. See {@link QuickActionsInteractionEnum}.
   
   @type {String}
   @default QuickActionsInteractionEnum.ON
   @name interaction
   @htmlattribute interaction
   */
  get interaction() {
    return super.interaction;
  }
  set interaction(value) {
    super.interaction = value;
  
    if (this.interaction === interaction.ON) {
      this._addTargetEventListeners();
    }
    else {
      this._removeTargetEventListeners();
    }
  }
  
  /**
   Inherited from {@link Overlay#target}.
   */
  get target() {
    return super.target;
  }
  set target(value) {
    super.target = value;
  
    const targetElement = this._getTarget(value);
    const targetHasChanged = targetElement !== this._previousTarget;
  
    if (targetElement && targetHasChanged) {
      // Remove listeners from the previous target
      if (this._previousTarget) {
        const previousTarget = this._getTarget(this._previousTarget);
        if (previousTarget) {
          this._removeTargetEventListeners(previousTarget);
          targetElement.removeAttribute('aria-haspopup');
          targetElement.removeAttribute('aria-owns');
        }
      }

      // Set up listeners for the new target
      this._addTargetEventListeners();

      // Mark the target as owning a popup
      targetElement.setAttribute('aria-haspopup', 'true');
      let ariaOwns = targetElement.getAttribute('aria-owns');
      ariaOwns = ariaOwns && ariaOwns.length ? `${ariaOwns.trim()}  ${this.id}` : this.id;
      targetElement.setAttribute('aria-owns', ariaOwns);

      // Cache for use as previous target
      this._previousTarget = targetElement;
    }
  }
  
  /**
   Inherited from {@link Overlay#open}.
   */
  get open() {
    return super.open;
  }
  set open(value) {
    super.open = value;
    
    // Position once we can read items layout in the next frame
    window.requestAnimationFrame(() => {
      if (this.open && !this._openedBefore) {
        // we iterate over all the items initializing them in the correct order
        const items = this.items.getAll();
        for (let i = 0, itemCount = items.length; i < itemCount; i++) {
          this._attachItem(items[i], i);
        }
  
        this._openedBefore = true;
      }
  
      if (this.open) {
        this._layout();
      }
  
      // we toggle "is-selected" on the target to indicate that the over is open
      const targetElement = this._getTarget();
      if (targetElement) {
        targetElement.classList.toggle('is-selected', this.open);
      }
    });
  }
  
  /** @ignore */
  _getTarget(targetValue) {
    // Use passed target
    targetValue = targetValue || this.target;
    
    if (targetValue instanceof Node) {
      // Just return the provided Node
      return targetValue;
    }
    
    // Dynamically get the target node based on target
    let newTarget = null;
    if (typeof targetValue === 'string') {
      if (targetValue === target.PARENT) {
        newTarget = this.parentNode;
      }
      else {
        // Delegate to Coral.Overlay for _prev, _next and general selector
        newTarget = super._getTarget(targetValue);
      }
    }
    
    return newTarget;
  }
  
  /** @ignore */
  _addTargetEventListeners(targetElement) {
    targetElement = targetElement || this._getTarget();
    
    if (!targetElement) {
      return;
    }
    
    // Interaction-sensitive listeners
    if (this.interaction === interaction.ON) {
      // We do not have to worry about the EventListener being called twice as duplicates are discarded
      targetElement.addEventListener('mouseenter', this._onTargetMouseEnter);
      targetElement.addEventListener('keyup', this._onTargetKeyUp);
      targetElement.addEventListener('keydown', this._onTargetKeyDown);
      targetElement.addEventListener('mouseleave', this._onTargetMouseLeave);
    }
  }
  
  /** @ignore */
  _removeTargetEventListeners(targetElement) {
    targetElement = targetElement || this._getTarget();
    
    if (!targetElement) {
      return;
    }
    
    targetElement.removeEventListener('mouseenter', this._onTargetMouseEnter);
    targetElement.removeEventListener('keyup', this._onTargetKeyUp);
    targetElement.removeEventListener('keydown', this._onTargetKeyDown);
    targetElement.removeEventListener('mouseleave', this._onTargetMouseLeave);
  }
  
  /**
   Toggles whether or not an item is tabbable.
   
   @param {HTMLElement} item
   The item to process.
   
   @param {Boolean} tabbable
   Whether the item should be marked tabbable.
   @ignore
   */
  _toggleTabbable(item, tabbable) {
    if (item) {
      if (tabbable) {
        if (item.hasAttribute('tabIndex')) {
          item.removeAttribute('tabIndex');
        }
      }
      else {
        item.setAttribute('tabIndex', '-1');
      }
    }
  }
  
  /**
   Gets the subsequent or previous focusable neighbour relative to an Item button.
   
   @param {HTMLElement} current
   The current button element from which to find the next selectable neighbour.
   @param {Boolean} [previous]
   Whether to look for a previous neighbour rather than a subsequent one.
   
   @returns {HTMLElement|undefined} The focusable neighbour. Undefined if no suitable neighbour found.
   
   @private
   */
  _getFocusableNeighbour(current, previous) {
    // we need to convert the result to an array in order to use .indexOf()
    const focusableButtons = Array.prototype.slice.call(this._getFocusableButtons());
    const index = focusableButtons.indexOf(current);
    
    if (index >= 0) {
      if (!previous) {
        // Pick the next focusable button
        if (index < focusableButtons.length - 1) {
          return focusableButtons[index + 1];
        }
      }
      // Pick the previous focusable button
      else if (index !== 0) {
        return focusableButtons[index - 1];
      }
    }
  }
  
  /**
   Gets the buttons, optionally excluding the more button.
   
   @param {Boolean} excludeMore
   Whether to exclude the more button.
   
   @returns {NodeList} The NodeList containing all the buttons.
   
   @private
   */
  _getButtons(excludeMore) {
    let buttonSelector = '._coral-QuickActions-item';
    buttonSelector = excludeMore ? `${buttonSelector}:not([handle="moreButton"])` : buttonSelector;
    
    return this.querySelectorAll(buttonSelector);
  }
  
  /**
   An element is focusable if it is visible and not disabled.
   
   @returns {NodeList} A NodeList containing the focusable buttons.
   
   @private
   */
  _getFocusableButtons() {
    // since we use the hidden attribute to hide the items, we can rely on this attribute to determine if the button
    // is hidden, instead of using a more expensive :focusable selector
    return this.querySelectorAll(BUTTON_FOCUSABLE_SELECTOR);
  }
  
  /**
   Gets the first focusable button.
   
   @returns {HTMLElement|undefined}
   The first focusable button, undefined if none found.
   @ignore
   */
  _getFirstFocusableButton() {
    return this.querySelector(BUTTON_FOCUSABLE_SELECTOR);
  }
  
  /**
   Gets the last focusable button.
   
   @returns {HTMLElement|undefined}
   The last focusable button, undefined if none found.
   @ignore
   */
  _getLastFocusableButton() {
    const focusableButtons = this._getFocusableButtons();
    return focusableButtons[focusableButtons.length - 1];
  }
  
  /** @ignore */
  _proxyClick(item) {
    const event = item.trigger('click');
    
    if (!event.defaultPrevented && this.interaction === interaction.ON) {
      this._hideAll();
    }
  }
  
  /**
   Gets data from an Item.
   
   @param {HTMLElement} item
   The Item to get the data from.
   @returns {Object}
   The Item data.
   @ignore
   */
  _getItemData(item) {
    return {
      htmlContent: item.innerHTML,
      textContent: item.textContent,
      // fallback to empty string in case it has no icon
      icon: item.getAttribute('icon') || ''
    };
  }
  
  /** @ignore */
  _attachItem(item, index) {
    // since the button has already been initialized we make sure it is up to date
    if (item._elements && item._elements.button) {
      this._updateItem(item);
      return;
    }
    
    // if the index was not provided, we need to calculate it
    if (typeof index === 'undefined') {
      index = Array.prototype.indexOf.call(this.items.getAll(), item);
    }
    
    const itemData = this._getItemData(item);
    const type = QuickActionsItem.type;
    
    let button;
    if (item.type === type.BUTTON) {
      button = new Button().set({
        icon: itemData.icon,
        iconsize: Icon.size.SMALL,
        type: 'button',
        tracking: 'off'
      }, true);
    }
    else if (item.type === type.ANCHOR) {
      button = new AnchorButton().set({
        icon: itemData.icon,
        iconsize: Icon.size.SMALL,
        href: item.href,
        tracking: 'off'
      }, true);
    }
    
    button.variant = Button.variant._CUSTOM;
    button.classList.add('_coral-QuickActions-item', '_coral-ActionButton', '_coral-ActionButton--quiet');
    button.setAttribute('tabindex', '-1');
    button.setAttribute('title', itemData.textContent.trim());
    button.setAttribute('aria-label', itemData.textContent.trim());
    button.setAttribute('role', 'menuitem');
    
    this.insertBefore(button, this.children[index]);
    
    // ButtonList Item
    let buttonListItem;
    if (item.type === type.BUTTON) {
      buttonListItem = new ButtonList.Item();
    }
    else if (item.type === type.ANCHOR) {
      buttonListItem = new AnchorList.Item();
      buttonListItem.href = item.href;
    }
    
    const buttonListItemParent = this._elements.buttonList;
    
    buttonListItemParent.insertBefore(buttonListItem, buttonListItemParent.children[index]);
    buttonListItem.tabIndex = -1;
    buttonListItem.content.innerHTML = itemData.htmlContent;
    buttonListItem.icon = itemData.icon;
    
    item._elements.button = button;
    item._elements.buttonListItem = buttonListItem;
    buttonListItem._elements.quickActionsItem = item;
    button._elements.quickActionsItem = item;
  }
  
  /**
   Layout calculation; collapses QuickActions as necessary.
   */
  _layout() {
    // Set the width of the QuickActions to match that of the target
    this._setWidth();
    
    const buttons = this._getButtons(true);
    
    if (!buttons.length) {
      return;
    }
    
    const buttonListItems = this._elements.buttonList.items.getAll();
    
    // Temporarily display the QuickActions so we can do the calculation
    const display = this.style.display;
    let temporarilyShown = false;
    
    if (!this.open) {
      this.style.left -= 10000;
      this.style.top -= 10000;
      this.style.display = 'block';
      temporarilyShown = true;
    }
    
    const totalAvailableWidth = this.offsetWidth;
    
    let totalFittingButtons = 0;
    let widthUsed = 0;
    
    while (totalAvailableWidth > widthUsed) {
      widthUsed += BUTTON_WIDTH;
      
      if (totalAvailableWidth > widthUsed) {
        totalFittingButtons++;
      }
    }
  
    // Remove one to avoid taking full width space
    totalFittingButtons--;
    
    const threshold = this.threshold;
    const handleThreshold = threshold > 0;
    const moreButtonsThanThreshold = handleThreshold && buttons.length > threshold;
    const collapse = buttons.length > totalFittingButtons || moreButtonsThanThreshold;
    
    // +1 to account for the more button
    const collapseToThreshold = collapse && handleThreshold && threshold + 1 < totalFittingButtons;
    
    let totalButtons;
    if (collapse) {
      if (collapseToThreshold) {
        totalButtons = threshold + 1;
      }
      else {
        totalButtons = totalFittingButtons;
      }
    }
    else {
      totalButtons = buttons.length;
    }
    
    // Show all Buttons and ButtonList Items
    for (let i = 0; i < buttons.length; i++) {
      this._toggleTabbable(buttons[i], false);
      buttons[i].hidden = false;
      if (buttonListItems[i]) {
        buttonListItems[i].hidden = false;
      }
    }
    
    this._toggleTabbable(this._elements.moreButton, false);
    
    if (collapse) {
      if (totalButtons > 0) {
        // Hide the buttons we're collapsing
        for (let j = totalButtons - 1; j < buttons.length; j++) {
          buttons[j].hide();
        }
        
        // Hide the ButtonList items
        for (let k = 0; k < totalButtons - 1; k++) {
          buttonListItems[k].hide();
        }
        
        // Mark the first button as tabbable
        this._toggleTabbable(buttons[0], true);
      }
      else {
        this._toggleTabbable(this._elements.moreButton, true);
      }
      
      this._elements.moreButton.show();
    }
    else {
      // Mark the first button as tabbable
      this._toggleTabbable(buttons[0], true);
      this._elements.moreButton.hide();
    }
  
    this._setWidth(true);
    
    // Reset the QuickActions display
    if (temporarilyShown) {
      this.style.left += 10000;
      this.style.top += 10000;
      this.style.display = display;
    }
    
    // Do a reposition of the overlay
    this.reposition();
  }
  
  /**
   Sets the width of QuickActions from the target.
   
   @ignore
   */
  _setWidth(buttonWidthBased) {
    let width = 0;
    const targetElement = this._getTarget();
    
    if (targetElement) {
      const maxWidth = targetElement.offsetWidth;
      
      if (buttonWidthBased) {
        const visibleButtons = this.querySelectorAll('._coral-QuickActions-item:not([hidden])');
  
        if (visibleButtons.length) {
          for (let i = 0; i < visibleButtons.length && width <= maxWidth; i++) {
            width += BUTTON_WIDTH;
          }
    
          this.style.width = `${width}px`;
        }
      }
      else {
        this.style.width = `${maxWidth}px`;
      }
    }
  }
  
  /** @ignore */
  _setButtonListHeight() {
    // Set height of ButtonList
    this._elements.buttonList.style.height = '';
    
    // Measure actual height
    const style = window.getComputedStyle(this._elements.buttonList);
    const height = parseInt(style.height, 10);
    const maxHeight = parseInt(style.maxHeight, 10);
    
    if (height < maxHeight) {
      // Make it scrollable
      this._elements.buttonList.style.height = `${height - 1}px`;
    }
  }
  
  /** @ignore */
  _isInternalToComponent(element) {
    const targetElement = this._getTarget();
    
    return element && (this.contains(element) || this._elements.overlay.contains(element) || targetElement && targetElement.contains(element));
  }
  
  /** @ignore */
  _onWindowResize() {
    this._layout();
  }
  
  _handleEscape(event) {
    if (typeof this._isTop === 'undefined') {
      this._isTop = this._isTopOverlay();
    }
    
    // Debounce
    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
    }
    
    this._timeout = window.setTimeout(() => {
      if (this._isTop) {
        super._handleEscape(event);
      }
  
      this._isTop = undefined;
    });
  }
  
  /** @ignore */
  _onMouseOut(event) {
    const toElement = event.toElement || event.relatedTarget;
    
    // Hide if we mouse leave to any element external to the component and its target
    if (!this._isInternalToComponent(toElement) && this.interaction === interaction.ON) {
      this._hideAll();
    }
  }
  
  _hideAll() {
    this.hide();
    this._elements.overlay.hide();
  }
  
  /** @ignore */
  _onTargetMouseEnter(event) {
    const fromElement = event.fromElement || event.relatedTarget;
    
    // Open if we aren't already
    if (!this.open && !this._isInternalToComponent(fromElement)) {
      this.show();
  
      this._trackEvent('display', 'coral-quickactions', event);
    }
  }
  
  /** @ignore */
  _onTargetKeyUp(event) {
    const keyCode = event.keyCode;
    
    // shift + F10 or ctrl + space (http://www.w3.org/WAI/PF/aria-practices/#popupmenu)
    if (event.shiftKey && keyCode === 121 || event.ctrlKey && keyCode === 32) {
      if (!this.open) {
        if (this.interaction === interaction.ON) {
          // Launched via keyboard and interaction enabled implies a focus trap and return focus.
          // Remember the relevant properties and return their values on hide.
          this._previousTrapFocus = this.trapFocus;
          this._previousReturnFocus = this.returnFocus;
          this.trapFocus = this.constructor.trapFocus.ON;
        }
        
        this.show();
      }
    }
  }
  
  _onTargetKeyDown(event) {
    const keyCode = event.keyCode;
    
    // shift + F10 or ctrl + space (http://www.w3.org/WAI/PF/aria-practices/#popupmenu)
    if (event.shiftKey && keyCode === 121 || event.ctrlKey && keyCode === 32) {
      // Prevent default context menu show or page scroll behaviour
      event.preventDefault();
    }
  }
  
  /** @ignore */
  _onTargetMouseLeave(event) {
    const toElement = event.toElement || event.relatedTarget;
    
    // Do not hide if we entered the quick actions
    if (!this._isInternalToComponent(toElement)) {
      this._hideAll();
    }
  }
  
  /** @ignore */
  _onHomeKeypress(event) {
    // prevents the page from scrolling
    event.preventDefault();
    
    const firstFocusableButton = this._getFirstFocusableButton();
    
    // Jump focus to the first focusable button
    if (firstFocusableButton) {
      firstFocusableButton.focus();
    }
  }
  
  /** @ignore */
  _onEndKeypress(event) {
    // prevents the page from scrolling
    event.preventDefault();
    
    const lastFocusableButton = this._getLastFocusableButton();
    
    // Jump focus to the last focusable button
    if (lastFocusableButton) {
      lastFocusableButton.focus();
    }
  }
  
  /** @ignore */
  _onButtonKeypressNext(event) {
    event.preventDefault();
  
    if (document.activeElement === this) {
      const firstFocusableButton = this._getFirstFocusableButton();
      
      if (firstFocusableButton) {
        firstFocusableButton.focus();
      }
    }
    else {
      // Handle key presses that imply focus of the next focusable button
      const nextButton = this._getFocusableNeighbour(event.matchedTarget);
      if (nextButton) {
        nextButton.focus();
      }
    }
  }
  
  /** @ignore */
  _onButtonKeypressPrevious(event) {
    event.preventDefault();
  
    if (document.activeElement === this) {
      const lastFocusableButton = this._getLastFocusableButton();
      
      if (lastFocusableButton) {
        lastFocusableButton.focus();
      }
    }
    else {
      // Handle key presses that imply focus of the previous focusable button
      const previousButton = this._getFocusableNeighbour(event.matchedTarget, true);
      if (previousButton) {
        previousButton.focus();
      }
    }
  }
  
  /** @ignore */
  _onButtonClick(event) {
    event.stopPropagation();
    
    if (this._preventClick) {
      return;
    }
    
    const button = event.matchedTarget;
    const item = button._elements.quickActionsItem;
    this._proxyClick(item);
    
    // Prevent double click or alternate selection during animation
    window.setTimeout(() => {
      this._preventClick = false;
    }, this._overlayAnimationTime);
    
    this._preventClick = true;
  
    this._trackEvent('click', 'coral-quickactions-item', event, item);
  }
  
  _onMoreButtonClick(event) {
    const button = event.matchedTarget;
    const item = button._elements.quickActionsItem;
  
    this._trackEvent('click', 'coral-quickactions-more', event, item);
  }
  
  /** @ignore */
  _onOverlayBeforeOpen(event) {
    if (event.target === this) {
      // Reset double-click prevention flag
      this._preventClick = false;
      this._layout();
    }
    else if (event.target === this._elements.overlay) {
      // do not allow internal Overlay events to escape QuickActions
      event.stopImmediatePropagation();
      this._setButtonListHeight();
    }
  }
  
  /** @ignore */
  _onOverlayBeforeClose(event) {
    if (event.target === this._elements.overlay) {
      // do not allow internal Overlay events to escape QuickActions
      event.stopImmediatePropagation();
    }
  }
  
  /** @ignore */
  _onOverlayOpen(event) {
    if (event.target === this._elements.overlay) {
      // do not allow internal Overlay events to escape QuickActions
      event.stopImmediatePropagation();
    }
  }
  
  /** @ignore */
  _onOverlayClose(event) {
    if (event.target === this) {
      this._elements.overlay.open = false;
      
      // Return the trapFocus and returnFocus properties to their state before open.
      // Handles the keyboard launch and interaction enabled case, which implies focus trap and focus return.
      // Wait a frame as this is called before the 'open' property sync. Otherwise, returnFocus is set prematurely.
      window.requestAnimationFrame(() => {
        if (this._previousTrapFocus) {
          this.trapFocus = this._previousTrapFocus;
          this._previousTrapFocus = undefined;
        }
        
        if (this._previousReturnFocus) {
          this.returnFocus = this._previousReturnFocus;
          this._previousReturnFocus = undefined;
        }
      });
    }
    else if (event.target === this._elements.overlay) {
      // do not allow internal Overlay events to escape QuickActions
      event.stopImmediatePropagation();
    }
  }
  
  /** @ignore */
  _onOverlayPositioned(event) {
    if (event.target === this._elements.overlay) {
      // do not allow internal Overlay events to escape QuickActions
      event.stopImmediatePropagation();
    }
  }
  
  /** @ignore */
  _onButtonListItemClick(event) {
    // stops propagation so that this event remains internal to the component
    event.stopImmediatePropagation();
    
    const buttonListItem = event.matchedTarget;
    
    if (!buttonListItem) {
      return;
    }
    
    const item = buttonListItem._elements.quickActionsItem;
    this._proxyClick(item);
  
    this._trackEvent('click', 'coral-quickactions-item', event, item);
  }
  
  /** @ignore */
  _onItemRemoved(item) {
    this._removeItemElements(item);
  }
  
  /** @ignore */
  _onCollectionChange(addedNodes) {
    // Delay the item initialization if the component has not been opened before
    if (!this._openedBefore) {
      return;
    }
    
    // we use the items to be able to find out the index of the added item in reference to the whole collection
    const items = this.items.getAll();
    let index;
    for (let i = 0, addedNodesCount = addedNodes.length; i < addedNodesCount; i++) {
      // we need to know the item's position in relation to the others
      index = Array.prototype.indexOf.call(items, addedNodes[i]);
      this._attachItem(addedNodes[i], index);
    }
    
    this._layout();
  }
  
  /** @ignore */
  _onItemChange(event) {
    // stops propagation so that this event remains internal to the component
    event.stopImmediatePropagation();
    
    this._updateItem(event.target);
  }
  
  /** @ignore */
  _onItemTypeChange(event) {
    // stops propagation so that this event remains internal to the component
    event.stopImmediatePropagation();
    
    const item = event.target;
    this._removeItemElements(item);
    this._attachItem(item);
    this._layout();
  }
  
  /** @ignore */
  _removeItemElements(item) {
    // Remove the associated Button and ButtonList elements
    if (item._elements.button) {
      item._elements.button.remove();
      item._elements.button._elements.quickActionsItem = undefined;
      item._elements.button = undefined;
    }
    
    if (item._elements.buttonListItem) {
      item._elements.buttonListItem.remove();
      item._elements.buttonListItem._elements.quickActionsItem = null;
      item._elements.buttonListItem = undefined;
    }
  }
  
  /** @ignore */
  _updateItem(item) {
    const itemData = this._getItemData(item);
    const type = QuickActionsItem.type;
    
    const button = item._elements.button;
    if (button) {
      button.icon = itemData.icon;
      button.setAttribute('title', itemData.textContent.trim());
      button.setAttribute('aria-label', itemData.textContent.trim());
      button[item.type === type.ANCHOR ? 'setAttribute' : 'removeAttribute']('href', item.href);
    }
    
    const buttonListItem = item._elements.buttonListItem;
    if (buttonListItem) {
      buttonListItem.content.innerHTML = itemData.htmlContent;
      buttonListItem[item.type === type.ANCHOR ? 'setAttribute' : 'removeAttribute']('href', item.href);
      buttonListItem.icon = itemData.icon;
    }
  }
  
  // Maps placement CENTER with RIGHT
  _toggleCenterPlacement(toggle) {
    if (toggle) {
      if (this.placement === placement.CENTER) {
        this._placement = Overlay.placement.RIGHT;
        
        this._oldInner = this._inner;
        this._inner = false;
        this._oldLengthOffset = this._lengthOffset;
        this._lengthOffset = '-50%r - 50%p';
      }
    }
    else if (this._placement === Overlay.placement.RIGHT) {
      this._placement = placement.CENTER;
      
      // Restore
      this._inner = this._oldInner;
      this._lengthOffset = this._oldLengthOffset;
    }
  }
  
  /** @ignore */
  reposition() {
    // Override to support placement.CENTER
    this._toggleCenterPlacement(true);
    super.reposition();
    this._toggleCenterPlacement(false);
  
    // PopperJS inner property issue https://github.com/FezVrasta/popper.js/issues/400
    if (this.placement === placement.TOP) {
      this.style.marginTop = `${parseFloat(this.lengthOffset)}px`;
      this.style.marginBottom = '';
    }
    else if (this.placement === placement.BOTTOM) {
      this.style.marginBottom = `${parseFloat(this.lengthOffset)}px`;
      this.style.marginTop = '';
    }
    else {
      this.style.marginTop = '';
      this.style.marginBottom = '';
    }
  }
  
  // Override placement and target
  /**
   Returns {@link QuickActions} placement options.
   
   @return {QuickActionsPlacementEnum}
   */
  static get placement() { return placement; }
  
  /**
   Returns {@link QuickActions} target options.
   
   @return {QuickActionsTargetEnum}
   */
  static get target() { return target; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['threshold']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Make QuickActions focusable
    this.setAttribute('tabIndex', '-1');
    this.setAttribute('role', 'menu');
    
    // Support cloneNode
    ['moreButton', 'overlay'].forEach((handleName) => {
      const handle = this.querySelector(`[handle="${handleName}"]`);
      if (handle) {
        handle.remove();
      }
    });
  
    // Cannot be open by default when rendered
    this._elements.overlay.removeAttribute('open');
  
    // Inserting the overlay before the items
    this.insertBefore(this._elements.overlay, this.firstChild);
  
    // Inserting the moreButton after the items
    this.appendChild(this._elements.moreButton);
  
    // Link target
    this._elements.overlay.target = this._elements.moreButton;
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
    
    // In case it was moved out don't forget to remove it
    if (!this.contains(this._elements.overlay)) {
      this._elements.overlay.remove();
    }
  }
}

export default QuickActions;
