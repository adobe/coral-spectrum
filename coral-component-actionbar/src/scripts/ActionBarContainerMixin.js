import ActionBarContainerCollection from './ActionBarContainerCollection';
import getFirstSelectableWrappedItem from './getFirstSelectableWrappedItem';
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
 @mixin ActionBarContainerMixin
 @classdesc The base element for action bar containers
 */
const ActionBarContainerMixin = (superClass) => class extends superClass {
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
  
    const overlayId = this._elements.overlay.id;
    const events = {
      // Accessibility
      'capture:focus ._coral-ActionBar-button:not([disabled])': '_onItemFocusIn',
      'capture:blur ._coral-ActionBar-button:not([disabled])': '_onItemFocusOut'
    };
    events[`global:capture:coral-overlay:beforeopen #${overlayId}`] = '_onOverlayBeforeOpen';
    events[`global:capture:coral-overlay:beforeclose #${overlayId}`] = '_onOverlayBeforeClose';
  
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
      button.classList.add('_coral-ActionBar-button');
      
      const oldVariant = button.getAttribute('variant');
      if (oldVariant === Button.variant._CUSTOM) {
        return;
      }
      
      button.setAttribute('variant', Button.variant._CUSTOM);
      button.classList.add('_coral-ActionButton');
      
      if (oldVariant === Button.variant.QUIET) {
        button.classList.add('_coral-ActionButton--quiet');
      }
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
    if (event.target !== this._elements.overlay) {
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
    this._elements.overlay.hidden = false;
    
    // render popover content
    const popover = this._elements.overlay;
    popover.content.innerHTML = '';
    popover.content.appendChild(overlayContent.call(this._elements, {
      items: this._itemsInPopover,
      copyAttributes
    }));
    
    // focus first item (nextFrame needed as popover must be visible and initialized with items)
    let wrappedItem;
    let loop = true;
    const focusFirstItem = () => {
      wrappedItem = getFirstSelectableWrappedItem(this._itemsInPopover[0]);
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
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['moreButtonText', 'morebuttontext', 'threshold']);
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
    this._elements.overlay.target = this._elements.moreButton;
  
    // Cannot be open by default when rendered
    this._elements.overlay.removeAttribute('open');
    
    // Insert popover always as firstChild to ensure element order (cloneNode support)
    this.insertBefore(this._elements.overlay, this.firstChild);
    
    // Style the items to match action items
    this.items.getAll().forEach(item => this._styleItem(item));
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
    
    // In case it was moved out don't forget to remove it
    if (!this.contains(this._elements.overlay)) {
      this._elements.overlay.remove();
    }
  }
};

export default ActionBarContainerMixin;
