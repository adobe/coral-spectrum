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
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
import ActionBarContainerCollection from './ActionBarContainerCollection';
import ActionBarContainerMixin from './ActionBarContainerMixin';
import {transform, commons, i18n} from 'coralui-util';

const CLASSNAME = 'coral3-ActionBar-container';

/**
 Enum for container position.
 
 @private
 @enum {String}
 @memberof Coral.ActionBar.Container
 */
const position = {
  /** Primary (left) ActionBar container */
  PRIMARY: 'primary',
  /** Secondary (right) ActionBar container */
  SECONDARY: 'secondary',
  /** Invalid ActionBar container */
  INVALID: 'invalid'
};

/**
 @class Coral.ActionBar.Container
 @classdesc An ActionBar container component
 @htmltag coral-actionbar-container
 @extends HTMLElement
 @extends Coral.mixin.component
 
 @deprecated
 */
class ActionBarContainer extends ActionBarContainerMixin(Component(HTMLElement)) {
  constructor() {
    super();
  
    console.warn('@deprecated: coral-actionbar-container is deprecated, use coral-actionbar-primary and ' +
      'coral-actionbar-secondary instead');
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains. See
   {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.ActionBar.Container#
   */
  get items() {
    // Construct the collection on first request:
    if (!this._items) {
      this._items = new ActionBarContainerCollection({
        host: this,
        itemTagName: 'coral-actionbar-item'
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
   @memberof Coral.ActionBar.Container#
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
   @memberof Coral.ActionBar.Container#
   */
  get moreButtonText() {
    return this._moreButtonText || '';
  }
  set moreButtonText(value) {
    this._moreButtonText = transform.string(value);
    this._reflectAttribute('moreButtonText', this._moreButtonText);
  
    if (this._elements.moreButton) {
      // moreButton might not have been created so far
      this._elements.moreButton.label.innerHTML = this._moreButtonText;
      this._elements.moreButton[this._moreButtonText.trim() === '' ? 'setAttribute' : 'removeAttribute']('title', i18n.get('More'));
    }
  }
  
  /**
   The container position inside the actionbar.
   
   @private
   @type {Coral.ActionBar.Container.position}
   @readonly
   @default Coral.ActionBar.Container.position.INVALID
   @memberof Coral.ActionBar.Container#
   */
  get _position() {
    if (this.parentNode) {
      const containers = this.parentNode.getElementsByTagName('coral-actionbar-container');
    
      if (containers.length > 0 && containers[0] === this) {
        return position.PRIMARY;
      }
      else if (containers.length > 1 && containers[1] === this) {
        return position.SECONDARY;
      }
    }
  
    return position.INVALID;
  }
  
  /**
   Called after popover.open is set to true, but before the transition of the popover is done.
   Show elements inside the actionbar, that are hidden due to space problems.
   @ignore
   */
  _beforePopoverOpen(event) {
    // there might be popovers in popover => ignore them
    if (event.target !== this._elements.popover) {
      return;
    }
    
    this._itemsInPopover = this.items._getAllOffScreen();
    
    if (this._itemsInPopover.length < 1) {
      return;
    }
    
    // show the current popover (hidden needed to disable fade time of popover)
    this._elements.popover.hidden = false;
    
    // render popover content
    const popoverContent = this._elements.popover.content;
    popoverContent.innerHTML = '';
    popoverContent.appendChild(Coral.templates.ActionBar.popovercontent(this._itemsInPopover));
    
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
  _beforePopoverClose(event) {
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
    if (this._position === position.PRIMARY) {
      this._returnLeftElementsFromPopover();
    }
    else if (this._position === position.SECONDARY) {
      this._returnRightElementsFromPopover();
    }
    
    // clear cached items from popover
    this._itemsInPopover = [];
    
    // we need to check if item has 'hasAttribute' because it is not present on the document
    const isFocusedItemInsideActionBar = (this.parentNode !== focusedItem && this.parentNode.contains(focusedItem));
    
    const isFocusedItemOffscreen = focusedItem.hasAttribute && focusedItem.hasAttribute('coral-actionbar-offscreen');
    if (isFocusedItemInsideActionBar && isFocusedItemOffscreen) {
      // if currently an element is focused, that should not be visible (or is no actionbar-item) => select 'more'
      // button
      this._elements.moreButton.focus();
    }
  }
  
  /** @ignore */
  _returnLeftElementsFromPopover() {
    let item = null;
    let wrappedItem = null;
    
    for (let i = 0; i < this._itemsInPopover.length; i++) {
      item = this._itemsInPopover[i];
      
      // remove tabindex again
      wrappedItem = getFirstSelectableWrappedItem(item);
      if (wrappedItem && wrappedItem.hasAttribute('tabindex')) {
        wrappedItem.setAttribute('tabindex', -1);
      }
      
      this.insertBefore(item, this._elements.moreButton);
    }
  }
  
  /** @ignore */
  _returnRightElementsFromPopover() {
    let item = null;
    let wrappedItem = null;
    
    for (let i = this._itemsInPopover.length - 1; i >= 0; i--) {
      item = this._itemsInPopover[i];
      
      // remove tabindex again
      wrappedItem = getFirstSelectableWrappedItem(item);
      if (wrappedItem && wrappedItem.hasAttribute('tabindex')) {
        wrappedItem.setAttribute('tabindex', -1);
      }
      
      this.insertBefore(item, this.firstChild.nextSibling);
    }
  }
  
  /** @ignore */
  _attachMoreButtonToContainer() {
    if (this.parentNode && this.parentNode.secondary === this) {
      this.insertBefore(this._elements.moreButton, this.firstChild);
    }
    else {
      // add the button to the left/primary contentzone
      this.appendChild(this._elements.moreButton);
    }
  }
  
  // Expose enums
  static get position() {return position;}
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // Cleanup resize helpers object (cloneNode support)
    const resizeHelpers = this.getElementsByTagName('object');
    for (let i = 0; i < resizeHelpers.length; ++i) {
      const resizeElement = resizeHelpers[i];
      if (resizeElement.parentNode === this) {
        this.removeChild(resizeElement);
      }
    }
  
    // Cleanup 'More' button
    this._elements.moreButton = this.querySelector('[coral-actionbar-more]');
    if (this._elements.moreButton) {
      this.removeChild(this._elements.moreButton);
    }
  
    // Cleanup 'More' popover
    this._elements.popover = this.querySelector('[coral-actionbar-popover]');
    if (this._elements.popover) {
      this.removeChild(this._elements.popover);
    }
  
    // Init 'More' button
    this._elements.moreButton.label.textContent = this.moreButtonText;
    // 'More' button might be moved later in dom when Container is attached to parent
    this.appendChild(this._elements.moreButton);
  
    // Init 'More' popover
    this._elements.popover.target = this._elements.moreButton;
  
    // Insert popover always as firstChild to ensure element order (cloneNode support)
    this.insertBefore(this._elements.popover, this.firstChild);
  
    this._attachMoreButtonToContainer();
  }
}

export default ActionBarContainer;
