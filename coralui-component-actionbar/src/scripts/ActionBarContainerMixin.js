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

import ActionBarContainerCollection from './ActionBarContainerCollection';
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
import {Button} from '/coralui-component-button';
import '/coralui-component-anchorbutton';
import {Popover} from '/coralui-component-popover';
import morePopover from '../templates/morePopover';
import moreButton from '../templates/moreButton';
import popoverContent from '../templates/popoverContent';
import {transform, i18n} from '/coralui-util';

/**
 @mixin ActionBarContainerMixin
 @classdesc The base element for action bar containers
 */
const ActionBarContainerMixin = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents({
      'coral-overlay:beforeopen [handle="popover"]': '_onOverlayBeforeOpen',
      'coral-overlay:beforeclose [handle="popover"]': '_onOverlayBeforeClose',
  
      // Accessibility
      'capture:focus .coral3-ActionBar-button:not([disabled])': '_onItemFocusIn',
      'capture:blur .coral3-ActionBar-button:not([disabled])': '_onItemFocusOut'
    });
    
    // Templates
    this._elements = {};
    this._itemsInPopover = [];
    moreButton.call(this._elements);
    morePopover.call(this._elements);
    popoverContent.call(this._elements, this._itemsInPopover);
  
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains.
   
   @type {ActionBarContainerCollection}
   @readonly
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new ActionBarContainerCollection({
        host: this,
        itemTagName: 'coral-actionbar-item',
        onItemAdded: this._styleItem
      });
    }

    return this._items;
  }
  
  /**
   The amount of items that are maximally visible inside the container. Using a value <= 0 will disable this
   feature and show as many items as possible.
   
   @type {Number}
   @default -1
   @htmlattribute threshold
   @htmlattributereflected
   */
  get threshold() {
    return typeof this._threshold === 'number' ? this._threshold : -1;
  }
  set threshold(value) {
    this._threshold = transform.number(value);
    this._reflectAttribute('threshold', this._threshold);
  }
  
  /**
   If there are more ActionBarItems inside the ActionBar than currently can be shown, then a "more" Button with the
   following text will be rendered (and some ActionBarItems will be hidden inside of a Popover).
   
   @type {String}
   @default ""
   @htmlattribute morebuttontext
   */
  get moreButtonText() {
    return this._moreButtonText || '';
  }
  set moreButtonText(value) {
    this._moreButtonText = transform.string(value);
  
    if (this._elements.moreButton) {
      // moreButton might not have been created so far
      this._elements.moreButton.label.innerHTML = this._moreButtonText;
      this._elements.moreButton[this._moreButtonText.trim() === '' ? 'setAttribute' : 'removeAttribute']('title', i18n.get('More'));
    }
  }
  
  /**
   Style item content
   */
  _styleItem(item) {
    const button = item.querySelector('button[is="coral-button"]') || item.querySelector('a[is="coral-anchorbutton"]');
    if (button) {
      button.classList.add('coral3-ActionBar-button');
      
      const oldVariant = button.getAttribute('variant');
      if (oldVariant === Button.variant._CUSTOM) {
        return;
      }
      
      const newVariant = oldVariant === Button.variant.QUIET ? 'coral3-Button--quiet--action' : 'coral3-Button--action';
      button.setAttribute('variant', Button.variant._CUSTOM);
      button.classList.add(newVariant);
    }
    
    const popover = item.querySelector('coral-popover');
    if (popover && (popover.querySelector('coral-buttonlist') || popover.querySelector('coral-anchorlist'))) {
      popover.setAttribute('variant', Popover.variant._CUSTOM);
    }
  }
  
  _onItemFocusIn(event) {
    event.matchedTarget.classList.add('focus-ring');
  }
  
  _onItemFocusOut(event) {
    event.matchedTarget.classList.remove('focus-ring');
  }
  
  /**
   Called after popover.open is set to true, but before the transition of the popover is done. Show elements inside
   the actionbar, that are hidden due to space problems.
   
   @ignore
   */
  _onOverlayBeforeOpen(event) {
    // there might be popovers in popover => ignore them
    if (event.target !== this._elements.popover) {
      return;
    }
    
    this._itemsInPopover = this.items._getAllOffScreen();
    
    if (this._itemsInPopover.length < 1) {
      return;
    }
  
    // Store the button and popover on the item
    this._itemsInPopover.forEach((item) => {
      item._button = item.querySelector('button[is="coral-button"]') || item.querySelector('a[is="coral-anchorbutton"]');
      item._popover = item.querySelector('coral-popover');
    });
    
    // Whether a ButtonList or AnchorList should be rendered
    this._itemsInPopover.isButtonList = this._itemsInPopover.every(item => item._button && item._button.tagName === 'BUTTON');
    this._itemsInPopover.isAnchorList = this._itemsInPopover.every(item => item._button && item._button.tagName === 'A');
    
    // show the current popover (hidden needed to disable fade time of popover)
    this._elements.popover.hidden = false;
    
    // render popover content
    const popover = this._elements.popover;
    popover.content.innerHTML = '';
    popover.content.appendChild(popoverContent.call(this._elements, this._itemsInPopover));
    
    // focus first item (nextFrame needed as popover must be visible and initialized with items)
    const self = this;
    let wrappedItem;
    let loop = true;
    const focusFirstItem = function() {
      wrappedItem = getFirstSelectableWrappedItem(self._itemsInPopover[0]);
      if (wrappedItem) {
        // focus first item
        wrappedItem.removeAttribute('tabindex');
        wrappedItem.focus();
        return;
      }
      
      // If the wrappedItem isn't in the DOM and focusable, try one more time.
      if (loop) {
        loop = false;
        window.requestAnimationFrame(focusFirstItem);
      }
    };
    
    window.requestAnimationFrame(focusFirstItem);
  }
  
  /**
   Called after popover.open is set to false, but before the transition of the popover is done.
   Make items visible again, that now do fit into the actionbar.
   @ignore
   */
  _onOverlayBeforeClose(event) {
    // there might be popovers in popover => ignore them
    if (event.target !== this._elements.popover) {
      return;
    }
    
    const focusedItem = document.activeElement.parentNode;
    
    // hide the popover(needed to disable fade time of popover)
    this._elements.popover.hidden = true;
    
    //close any popovers, that might be inside the 'more' popover
    const childPopovers = this._elements.popover.getElementsByTagName('coral-popover');
    for (let i = 0; i < childPopovers.length; i++) {
      childPopovers[i].open = false;
    }
    
    // return all elements from popover
    this._returnElementsFromPopover();
    
    // clear cached items from popover
    this._itemsInPopover = [];
    
    // we need to check if item has 'hasAttribute' because it is not present on the document
    const isFocusedItemInsideActionBar = this.parentNode.contains(focusedItem);
    const isFocusedItemOffscreen = focusedItem.hasAttribute && focusedItem.hasAttribute('coral-actionbar-offscreen');
    if (isFocusedItemInsideActionBar && isFocusedItemOffscreen) {
      // if currently an element is focused, that should not be visible (or is no actionbar-item) => select 'more'
      // button
      this._elements.moreButton.focus();
    }
  }
  
  /** @ignore */
  static get observedAttributes() {
    return ['moreButtonText', 'morebuttontext', 'threshold'];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
  
    // Cleanup resize helpers object (cloneNode support)
    const resizeHelpers = this.getElementsByTagName('object');
    for (let i = 0; i < resizeHelpers.length; ++i) {
      const resizeElement = resizeHelpers[i];
      if (resizeElement.parentNode === this) {
        this.removeChild(resizeElement);
      }
    }
  
    // Cleanup 'More' button
    const more = this.querySelector('[coral-actionbar-more]');
    if (more) {
      this.removeChild(more);
    }
  
    // Cleanup 'More' popover
    const popover = this.querySelector('[coral-actionbar-popover]');
    if (popover) {
      this.removeChild(popover);
    }
    
    this._elements.moreButton.label.textContent = this.moreButtonText;
    // 'More' button might be moved later in dom when Container is attached to parent
    this.appendChild(this._elements.moreButton);
  
    // Init 'More' popover
    this._elements.popover.target = this._elements.moreButton;
  
    // Insert popover always as firstChild to ensure element order (cloneNode support)
    this.insertBefore(this._elements.popover, this.firstChild);
    
    // Style the items to match action items
    this.items.getAll().forEach(item => this._styleItem(item));
  }
};

export default ActionBarContainerMixin;
