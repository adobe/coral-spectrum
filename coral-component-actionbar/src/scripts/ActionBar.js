/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coral-mixin-component';
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
import {commons} from '../../../coral-utils';

const CLASSNAME = '_coral-ActionBar';

/**
 @class Coral.ActionBar
 @classdesc An ActionBar component containing arbitrary items. An item can either be added to the left or the right side
 of the bar. All items that do not fit into the bar are hidden but still accessible.
 @htmltag coral-actionbar
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ActionBar extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents({
      'key:up': '_onFocusPreviousItem',
      'key:left': '_onFocusPreviousItem',
      'key:down': '_onFocusNextItem',
      'key:right': '_onFocusNextItem',
      'global:resize': '_onResizeWindow'
    });
  
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      primary: this.querySelector('coral-actionbar-primary') || document.createElement('coral-actionbar-primary'),
      secondary: this.querySelector('coral-actionbar-secondary') || document.createElement('coral-actionbar-secondary')
    };
  
    // Debounce wait time in milliseconds
    this._wait = 50;
  
    // bind this._onLayout so it can be removed again
    this._onLayout = this._onLayout.bind(this);
    this._debounceOnLayout = this._debounceOnLayout.bind(this);
  
    // use the smart strategy instead of re-rendering every frame
    this._recalculateLayoutOnMutation();
  }
  
  /**
   The primary (left) container of the ActionBar.
   
   @type {HTMLElement}
   @contentzone
   */
  get primary() {
    return this._getContentZone(this._elements.primary);
  }
  set primary(value) {
    this._setContentZone('primary', value, {
      handle: 'primary',
      tagName: 'coral-actionbar-primary',
      insert: function(content) {
        // primary has to be before secondary if available
        this.insertBefore(content, this.secondary);
      }
    });
  }

  /**
   The secondary (right) container of the ActionBar.
   
   @type {HTMLElement}
   @contentzone
   */
  get secondary() {
    return this._getContentZone(this._elements.secondary);
  }
  set secondary(value) {
    this._setContentZone('secondary', value, {
      handle: 'secondary',
      tagName: 'coral-actionbar-secondary',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /** @ignore */
  _recalculateLayoutOnMutation() {
    // recalculate layout on dom element size change + on dom mutation
    // http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
    
    // relayout any time the dom changes
    this._observer = new MutationObserver(() => {
      this._debounceOnLayout();
    });
    
    // Watch for changes
    this._observer.observe(this, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true
    });
  }
  
  /** @ignore */
  _onFocusPreviousItem(event) {
    // stops the page from scrolling
    event.preventDefault();
    
    const previousItem = this._getPreviousSelectableWrappedItem(event.target);
    if (previousItem !== null) {
      previousItem.focus();
    }
  }
  
  /** @ignore */
  _onFocusNextItem(event) {
    // stops the page from scrolling
    event.preventDefault();
    
    const nextWrappedItem = this._getNextSelectableWrappedItem(event.target);
    if (nextWrappedItem !== null) {
      nextWrappedItem.focus();
    }
  }
  
  /** @ignore */
  _onResizeWindow() {
    // just close all popovers for now when screen is resized
    // there might be more popovers, then the 'more' popovers
    const popovers = this.getElementsByTagName('coral-popover');
    for (let i = 0; i < popovers.length; i++) {
      popovers[i].removeAttribute('open');
    }
    
    // force a relayout (needed especially if framerate during resize drops e.g.: in FF)
    this._debounceOnLayout();
  }
  
  /** @ignore */
  _onLayout() {
    if (!this.primary || !this.primary._elements || !this.primary._elements.overlay ||
      !this.secondary || !this.secondary._elements || !this.secondary._elements.overlay) {
      // while containers are not cached or no items are rendered do nothing
      return;
    }
    
    if (this.primary._elements.overlay.open === true || this.secondary._elements.overlay.open === true) {
      // while popovers are open do not relayout
      return;
    }
    
    let focusedItem = document.activeElement;
    if (!(this !== focusedItem && this.contains(focusedItem))) {
      // focus not on the actionbar => do not bother
      focusedItem = null;
    }
    
    if (focusedItem && focusedItem.parentNode && focusedItem.parentNode.tagName === 'CORAL-ACTIONBAR-ITEM') {
      // focusedItem is wrapped
      focusedItem = focusedItem.parentNode;
    }
    
    const ERROR_MARGIN = 25;
    
    const leftItems = this.primary.items.getAll();
    const rightItems = this.secondary.items.getAll().reverse();
    let itemLeft = null;
    let itemRight = null;
    const widthCache = this._newWidthCache();
    const leftMoreButtonWidth = leftItems.length > 0 ? widthCache.getOuterWidth(this.primary._elements.moreButton) : 0;
    const rightMoreButtonWidth = rightItems.length > 0 ? widthCache.getOuterWidth(this.secondary._elements.moreButton) : 0;
    
    // Make it possible to set left/right padding to the containers
    const borderWidthLeftContainer = this.primary.offsetWidth - this.primary.getBoundingClientRect().width;
    const borderWidthRightContainer = this.secondary.offsetWidth - this.secondary.getBoundingClientRect().width;
    
    const primaryLeftOffset = this.primary.offsetLeft;
    const secondaryRightOffset = this.offsetWidth - (this.secondary.offsetLeft + this.secondary.offsetWidth);
    
    let availableWidth = this.offsetWidth - primaryLeftOffset - secondaryRightOffset - leftMoreButtonWidth -
      rightMoreButtonWidth - borderWidthLeftContainer - borderWidthRightContainer - ERROR_MARGIN;
    let currentUsedWidth = 0;
    let leftVisibleItems = 0;
    let rightVisibleItems = 0;
    let moreButtonLeftVisible = false;
    let moreButtonRightVisible = false;
    let showItem = false;
    let itemWidth = 0;
    
    for (let i = 0; i < leftItems.length || i < rightItems.length; i++) {
      itemLeft = i < leftItems.length ? leftItems[i] : null;
      itemRight = i < rightItems.length ? rightItems[i] : null;
      
      // first calculate visibility of left item
      showItem = false;
      if (itemLeft !== null) {
        if (itemLeft.hidden || itemLeft.style.display === 'none') {
          // item is hidden on purpose (we don't use it for layouting but do also not move offscreen) needed as it
          // might already have been moved offscreen before
          this._moveToScreen(itemLeft);
        }
        else {
          // if item is not hidden on purpose (hiding by actionBar due to space problems does not count) => layout
          // element
          if (!moreButtonLeftVisible && (this.primary.threshold <= 0 || leftVisibleItems < this.primary.threshold)) {
            // if threshold is not reached so far
            itemWidth = widthCache.getOuterWidth(itemLeft);
            
            if (currentUsedWidth + itemWidth < availableWidth) {
              // if there is still enough space to show another item
              showItem = true;
            }
            else if (leftVisibleItems === leftItems.length - 1 &&
              currentUsedWidth + itemWidth < availableWidth + leftMoreButtonWidth
            ) {
              // if this is the last item and so far there have been no items hidden => don't show more button
              showItem = true;
            }
          }
          
          // enable tab for first left item
          this._makeItemTabEnabled(itemLeft, showItem && i === 0);
          
          if (showItem) {
            leftVisibleItems += 1;
            currentUsedWidth += itemWidth;
            this._moveToScreen(itemLeft);
          }
          else {
            this._hideItem(itemLeft);
            moreButtonLeftVisible = true;
          }
          
          if (leftVisibleItems === leftItems.length) {
            // left more button not needed => more free space available
            availableWidth += leftMoreButtonWidth;
            moreButtonLeftVisible = false;
          }
        }
      }
      
      // then calculate visibility of right item
      showItem = false;
      if (itemRight !== null) {
        if (itemRight.hidden || itemRight.style.display === 'none') {
          // item is hidden on purpose (we don't use it for layouting but do also not move offscreen) needed as it
          // might already have been moved offscreen before
          this._moveToScreen(itemRight);
        }
        else {
          // if item is not hidden on purpose (hiding by actionBar due to space problems does not count) => layout
          // element
          if (!moreButtonRightVisible && (this.secondary.threshold <= 0 || rightVisibleItems < this.secondary.threshold)) {
            // if threshold is not reached so far
            itemWidth = widthCache.getOuterWidth(itemRight);
            
            if (currentUsedWidth + itemWidth < availableWidth) {
              // if there is still enough space to show another item
              showItem = true;
            }
            else if (rightVisibleItems === rightItems.length - 1 &&
              currentUsedWidth + itemWidth < availableWidth + rightMoreButtonWidth
            ) {
              // if this is the last item and so far there have been no items hidden => don't show more button
              showItem = true;
            }
          }
          
          // enable tab for 'first' right item
          this._makeItemTabEnabled(itemRight, showItem && i === rightItems.length - 1);
          
          if (showItem) {
            rightVisibleItems += 1;
            currentUsedWidth += itemWidth;
            this._moveToScreen(itemRight);
          }
          else {
            this._hideItem(itemRight);
            moreButtonRightVisible = true;
          }
          
          if (rightVisibleItems === rightItems.length) {
            // left more button not needed => more free space available
            availableWidth += rightMoreButtonWidth;
            moreButtonRightVisible = false;
          }
        }
      }
    }
    
    // show or hide more buttons
    this._moveToScreen(this.primary._elements.moreButton, moreButtonLeftVisible);
    this._moveToScreen(this.secondary._elements.moreButton, moreButtonRightVisible);
    
    // enable tabs on more buttons if needed
    this._makeItemTabEnabled(this.primary._elements.moreButton, leftVisibleItems < 1);
    this._makeItemTabEnabled(this.secondary._elements.moreButton, rightVisibleItems < rightItems.length);
    
    // we need to check if item has 'hasAttribute' because it is not present on the document
    if (focusedItem && focusedItem.hasAttribute && focusedItem.hasAttribute('coral-actionbar-offscreen')) {
      // if currently an element is focused, that should not be visible => select first selectable element nicer
      // algorithm possible
      const wrappedItem = getFirstSelectableWrappedItem(this._getAllSelectableItems()[0]);
      if (wrappedItem) {
        wrappedItem.focus();
      }
    }
  
    // re-calculate layout on element resize
    if (!this._resizeListenerAttached) {
      commons.addResizeListener(this, this._debounceOnLayout);
      commons.addResizeListener(this.primary, this._debounceOnLayout);
      commons.addResizeListener(this.secondary, this._debounceOnLayout);
  
      this._resizeListenerAttached = true;
    }
  }
  
  /** @ignore */
  _getNextSelectableWrappedItem(currentItem) {
    if (currentItem.parentNode.tagName === 'CORAL-ACTIONBAR-ITEM') {
      // currentItem is wrapped
      currentItem = currentItem.parentNode;
    }
    
    const selectableItems = this._getAllSelectableItems(currentItem);
    const index = selectableItems.indexOf(currentItem);
    
    if (index >= 0 && selectableItems.length > index + 1) {
      // if there is a next selectable element return it
      return getFirstSelectableWrappedItem(selectableItems[index + 1]);
    }
    
    return null;
  }
  
  /** @ignore */
  _getPreviousSelectableWrappedItem(currentItem) {
    if (currentItem.parentNode.tagName === 'CORAL-ACTIONBAR-ITEM') {
      // currentItem is wrapped
      currentItem = currentItem.parentNode;
    }
    
    const selectableItems = this._getAllSelectableItems(currentItem);
    const index = selectableItems.indexOf(currentItem);
    
    if (index > 0) {
      // if there is a previous selectable element return it
      return getFirstSelectableWrappedItem(selectableItems[index - 1]);
    }
    
    return null;
  }
  
  /** @ignore */
  _getAllSelectableItems(currentItem) {
    let selectableItems = [];
    
    if (this.primary._elements.overlay.open === true || this.secondary._elements.overlay.open === true) {
      // if popover is open only items in popover can be selected
      const popoverItems = this.primary._elements.overlay.open === true ? this.primary._itemsInPopover :
        this.secondary._itemsInPopover;
      let item = null;
      
      for (let i = 0; i < popoverItems.length; i++) {
        item = popoverItems[i];
        if (!item.hasAttribute('disabled') &&
          !item.hasAttribute('hidden') &&
          item.style.display !== 'none' &&
          getFirstSelectableWrappedItem(item)
        ) {
          selectableItems.push(item);
        }
      }
    }
    else {
      // concat selectable items from left side of the bar and right side of the bar
      const leftSelectableItems = this.primary.items._getAllSelectable();
      const rightSelectableItems = this.secondary.items._getAllSelectable();
      if (currentItem) {
        if (leftSelectableItems.indexOf(currentItem) >= 0) {
          selectableItems = leftSelectableItems;
        }
        else if (rightSelectableItems.indexOf(currentItem) >= 0) {
          selectableItems = rightSelectableItems;
        }
      }
      else {
        selectableItems = leftSelectableItems.concat(rightSelectableItems);
      }
    }
    
    return selectableItems;
  }
  
  /** @ignore */
  _newWidthCache() {
    return {
      _items: [],
      _outerWidth: [],
      getOuterWidth: function(item) {
        let index = this._items.indexOf(item);
        if (index < 0) {
          // if item was not cached in current frame => cache it
          this._items.push(item);
          
          const width = item.offsetWidth;
          this._outerWidth.push(width);
          index = this._outerWidth.length - 1;
        }
        
        return this._outerWidth[index];
      }
    };
  }
  
  /** @ignore */
  _forceWebkitRedraw(el) {
    const isWebkit = 'WebkitAppearance' in document.documentElement.style;
    
    if (isWebkit && el.style.display !== 'none') {
      el.style.display = 'none';
      
      // no need to store this anywhere, the reference would be enough
      this._cachedOffsetHeight = el.offsetHeight;
      
      el.style.display = '';
    }
  }
  
  /** @ignore */
  _hideItem(item, hide) {
    if (hide === false) {
      this._moveToScreen(item);
    }
    else if (!item.hasAttribute('coral-actionbar-offscreen')) {
      // actually just move element offscreen to be able to measure the size while calculating the layout
      item.setAttribute('coral-actionbar-offscreen', '');
      // if I do not force a browser redraw webkit has layouting problems
      this._forceWebkitRedraw(item);
    }
  }
  
  /** @ignore */
  _moveToScreen(item, show) {
    if (show === false) {
      this._hideItem(item);
    }
    else if (item.hasAttribute('coral-actionbar-offscreen')) {
      // actually just move element onscreen again (see _hideItem)
      item.removeAttribute('coral-actionbar-offscreen');
      // if I do not force a browser redraw webkit has layouting problems
      this._forceWebkitRedraw(item);
    }
  }
  
  /** @ignore */
  _makeItemTabEnabled(item, tabable) {
    // item might be wrapped (for now remove/add tabindex only on the first wrapped item)
    item = getFirstSelectableWrappedItem(item);
    
    if (item !== null) {
      if (tabable && item.hasAttribute('tabindex')) {
        item.removeAttribute('tabindex');
      }
      else if (!tabable && !item.hasAttribute('tabindex')) {
        item.setAttribute('tabindex', '-1');
      }
    }
  }
  
  /** @ignore */
  _debounceOnLayout() {
    // Debounce
    if (this._timeout !== null) {
      window.clearTimeout(this._timeout);
    }
  
    this._timeout = window.setTimeout(() => {
      this._timeout = null;
      this._onLayout();
    }, this._wait);
  }
  
  _moveDirectItemChildren() {
    const items = Array.prototype.filter.call(this.children, child => child.nodeName === 'CORAL-ACTIONBAR-ITEM');
    const frag = document.createDocumentFragment();
    
    // Move them to the frag
    items.forEach((item) => {
      frag.appendChild(item);
    });
    
    // Add the frag to primary content zone
    this._elements.primary.appendChild(frag);
  }
  
  get _contentZones() {
    return {
      'coral-actionbar-primary': 'primary',
      'coral-actionbar-secondary': 'secondary'
    };
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Move direct items into primary content zone
    this._moveDirectItemChildren();
  
    // Cleanup resize helpers object (cloneNode support)
    const resizeHelpers = this.querySelectorAll('object');
    for (let i = 0; i < resizeHelpers.length; ++i) {
      const resizeElement = resizeHelpers[i];
      if (resizeElement.parentNode === this) {
        this.removeChild(resizeElement);
      }
    }
  
    const primary = this._elements.primary;
    const secondary = this._elements.secondary;
  
    // we need to know if the content zone was provided to stop the voracious behavior
    let primaryProvided = primary.parentNode === this;
  
    // as a way to transition to the new content zones, we need to provide support for the old container tag. we copy
    // everything from these containers into the corresponding content zones, including the configurations
    const containers = Array.prototype.slice.call(this.getElementsByTagName('coral-actionbar-container'));
  
    let legacyContainer;
    let targetContainer;
    for (let j = 0, containersCount = containers.length; j < containersCount; j++) {
      legacyContainer = containers[j];
    
      // move first container content to new primary element
      if (j === 0) {
        targetContainer = primary;
        // overrides the previous configuration as we support older containers
        primaryProvided = true;
      }
      else if (j === 1) {
        targetContainer = secondary;
      }
    
      // it may happen that more than 2 containers were provided, in such case we simply ignore it
      if (targetContainer) {
        // we need to copy the existing configuration to the new content zone
        if (legacyContainer.hasAttribute('threshold')) {
          targetContainer.setAttribute('threshold', legacyContainer.getAttribute('threshold'));
        }
        if (legacyContainer.hasAttribute('morebuttontext')) {
          targetContainer.setAttribute('morebuttontext', legacyContainer.getAttribute('morebuttontext'));
        }
      
        // @todo: are we copying the more button?
        while (legacyContainer.firstChild) {
          targetContainer.appendChild(legacyContainer.firstChild);
        }
      }
    
      this.removeChild(legacyContainer);
    }
  
    // to prevent the content zone being voracious, we only move the children if primary was not explicitely provided
    if (!primaryProvided) {
      while (this.firstChild) {
        primary.appendChild(this.firstChild);
      }
    }
    
    // Call content zone inserts
    this.primary = this._elements.primary;
    this.secondary = this._elements.secondary;

    // force one layout
    this._onLayout();
  }
}

export default ActionBar;
