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

import ActionBarContainerCollection from './ActionBarContainerCollection';
import {Button} from '../../../coral-component-button';
import '../../../coral-component-anchorbutton';
import moreOverlay from '../templates/moreOverlay';
import moreButton from '../templates/moreButton';
import overlayContent from '../templates/overlayContent';
import {commons, transform, i18n} from '../../../coral-utils';

// Matches private Coral classes in class attribute
const REG_EXP = /_coral([^\s]+)/g;

const copyAttributes = (from, to) => {
  const excludedAttributes = ['is', 'id', 'variant', 'size'];
  
  for (let i = 0; i < from.attributes.length; i++) {
    const attr = from.attributes[i];
    
    if (excludedAttributes.indexOf(attr.nodeName) === -1) {
      if (attr.nodeName === 'class') {
        // Filter out private Coral classes
        to.setAttribute(attr.nodeName, `${to.className} ${attr.nodeValue.replace(REG_EXP, '')}`);
      }
      else {
        to.setAttribute(attr.nodeName, attr.nodeValue);
      }
    }
  }
};

/**
 @base BaseActionBarContainer
 @classdesc The base element for action bar containers
 */
const BaseActionBarContainer = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
    
    // Templates
    this._elements = {};
    this._itemsInPopover = [];
    moreButton.call(this._elements);
    moreOverlay.call(this._elements, {commons});
    overlayContent.call(this._elements, {
      items: this._itemsInPopover,
      copyAttributes
    });
  
    // Return focus to overlay by default
    this._elements.overlay.focusOnShow = this._elements.overlay;
  
    const overlayId = this._elements.overlay.id;
    const events = {};
    events[`global:capture:coral-overlay:beforeopen #${overlayId}`] = '_onOverlayBeforeOpen';
    events[`global:capture:coral-overlay:beforeclose #${overlayId}`] = '_onOverlayBeforeClose';
    // Keyboard interaction
    events[`global:key:down #${overlayId}`] = '_onOverlayKeyDown';
    events[`global:key:up #${overlayId}`] = '_onOverlayKeyUp';
  
    // Events
    this._delegateEvents(events);
  
    // Init the collection mutation observer
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
      this._elements.moreButtonLabel.innerHTML = this._moreButtonText;
      this._elements.moreButton[this._moreButtonText.trim() === '' ? 'setAttribute' : 'removeAttribute']('title', i18n.get('More'));
    }
  }
  
  /**
   Style item content
   */
  _styleItem(item) {
    const button = item.querySelector('button[is="coral-button"]') || item.querySelector('a[is="coral-anchorbutton"]');
    if (button) {
      button.classList.add('_coral-ActionBar-button');
      
      const oldVariant = button.getAttribute('variant');
      if (oldVariant === Button.variant.ACTION || oldVariant === Button.variant.QUIET_ACTION) {
        return;
      }
      
      button.setAttribute('variant', oldVariant === Button.variant.QUIET ? Button.variant.QUIET_ACTION : Button.variant.ACTION);
    }
  }
  
  /**
   Called after popover.open is set to true, but before the transition of the popover is done. Show elements inside
   the actionbar, that are hidden due to space problems.
   
   @ignore
   */
  _onOverlayBeforeOpen(event) {
    // there might be popovers in popover => ignore them
    if (event.target !== this._elements.overlay) {
      return;
    }
    
    this._itemsInPopover = this.items._getAllOffScreen();
    
    if (this._itemsInPopover.length < 1) {
      return;
    }

    this._itemsInPopover.forEach((item) => {
      item.style.visibility = '';
    });
  
    // Store the button and popover on the item
    this._itemsInPopover.forEach((item) => {
      item._button = item.querySelector('button[is="coral-button"]') || item.querySelector('a[is="coral-anchorbutton"]');
      item._popover = item.querySelector('coral-popover');
    });
    
    // Whether a ButtonList or AnchorList should be rendered
    this._itemsInPopover.isButtonList = this._itemsInPopover.every(item => item._button && item._button.tagName === 'BUTTON');
    this._itemsInPopover.isAnchorList = this._itemsInPopover.every(item => item._button && item._button.tagName === 'A');
    
    // show the current popover (hidden needed to disable fade time of popover)
    this._elements.overlay.hidden = false;
    
    // render popover content
    const popover = this._elements.overlay;
    popover.content.innerHTML = '';
    popover.content.appendChild(overlayContent.call(this._elements, {
      items: this._itemsInPopover,
      copyAttributes
    }));
  }
  
  /**
   Called after popover.open is set to false, but before the transition of the popover is done.
   Make items visible again, that now do fit into the actionbar.
   @ignore
   */
  _onOverlayBeforeClose(event) {
    // there might be popovers in popover => ignore them
    if (event.target !== this._elements.overlay) {
      return;
    }
    
    const focusedItem = document.activeElement.parentNode;
    
    // hide the popover(needed to disable fade time of popover)
    this._elements.overlay.hidden = true;
    
    // close any popovers, that might be inside the 'more' popover
    const childPopovers = this._elements.overlay.getElementsByTagName('coral-popover');
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
  
  _onOverlayKeyDown(event) {
    event.preventDefault();
    
    // Focus first item
    this._elements.anchorList && this._elements.anchorList._focusFirstItem(event);
    this._elements.buttonList && this._elements.buttonList._focusFirstItem(event);
  }
  
  _onOverlayKeyUp(event) {
    event.preventDefault();
    
    // Focus last item
    this._elements.anchorList && this._elements.anchorList._focusLastItem(event);
    this._elements.buttonList && this._elements.buttonList._focusLastItem(event);
  }
  
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      morebuttontext: 'moreButtonText'
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['morebuttontext', 'threshold']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    const overlay = this._elements.overlay;
    // Cannot be open by default when rendered
    overlay.removeAttribute('open');
    // Restore in DOM
    if (overlay._parent) {
      overlay._parent.appendChild(overlay);
    }
  }
  
  /** @ignore */
  render() {
    super.render();
  
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
  
    // Copy more text
    this._elements.moreButton.label.textContent = this.moreButtonText;
    
    // Init 'More' popover
    this._elements.overlay.target = this._elements.moreButton;
    
    // Create empty frag
    const frag = document.createDocumentFragment();
  
    // 'More' button might be moved later in dom when Container is attached to parent
    frag.appendChild(this._elements.moreButton);
    frag.appendChild(this._elements.overlay);
  
    // Render template
    this.appendChild(frag);
  
    // Style the items to match action items
    this.items.getAll().forEach(item => this._styleItem(item));
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
    
    const overlay = this._elements.overlay;
    // In case it was moved out don't forget to remove it
    if (!this.contains(overlay)) {
      overlay._parent = overlay._repositioned ? document.body : this;
      overlay.remove();
    }
  }
};

export default BaseActionBarContainer;
