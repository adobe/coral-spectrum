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
import base from '../templates/base';
import {transform, validate} from '../../../coral-utils';

const COLOR_HINT_REG_EXP = /^#[0-9A-F]{6}$/i;

/**
 Enumeration for {@link Card} variants.
 
 @typedef {Object} CardVariantEnum
 
 @property {String} DEFAULT
 Default card variant that shows the asset, overlay and content in their default positions.
 @property {String} CONDENSED
 Condensed card variant where the overlay is hidden and the content is shown over the image.
 @property {String} INVERTED
 Condensed card variant where the overlay is hidden and the content is shown over the image with a dark style.
 @property {String} ASSET
 Card variant where only the asset is shown.
 */
const variant = {
  DEFAULT: 'default',
  CONDENSED: 'condensed',
  INVERTED: 'inverted',
  ASSET: 'asset'
};

// the card's base classname
const CLASSNAME = '_coral-Card';

// builds a string containing all possible variant classnames. this will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Card
 @classdesc A Card component to display content in different variations.
 @htmltag coral-card
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class Card extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      banner: this.querySelector('coral-card-banner') || document.createElement('coral-card-banner'),
      asset: this.querySelector('coral-card-asset') || document.createElement('coral-card-asset'),
      content: this.querySelector('coral-card-content') || document.createElement('coral-card-content'),
      info: this.querySelector('coral-card-info') || document.createElement('coral-card-info'),
      overlay: this.querySelector('coral-card-overlay') || document.createElement('coral-card-overlay')
    };
    base.call(this._elements);
  
    // Check if the banner is empty whenever we get a mutation
    this._observer = new MutationObserver(this._hideBannerIfEmpty.bind(this));
    
    // Watch for changes to the banner element's children
    this._observer.observe(this._elements.banner, {
      // Catch changes to childList
      childList: true,
      // Catch changes to textContent
      characterData: true,
      // Monitor any child node
      subtree: true
    });
    
    // Events
    this._delegateEvents({
      'capture:load coral-card-asset img': '_onLoad'
    });
  }
  
  /**
   The Asset of the card.
   
   @type {HTMLElement}
   @contentzone
   */
  get asset() {
    return this._getContentZone(this._elements.asset);
  }
  set asset(value) {
    this._setContentZone('asset', value, {
      handle: 'asset',
      tagName: 'coral-card-asset',
      insert: function(asset) {
        this.insertBefore(asset, this.info || this._elements.wrapper || null);
      }
    });
  }
  
  /**
   Hints the height of the asset that is going to be loaded. This prepares the size so that when the image is
   loaded no reflow is triggered. Both <code>assetHeight</code> and <code>assetWidth</code> need to be specified
   for this feature to take effect.
   
   @type {String}
   @default ""
   @htmlattribute assetheight
   */
  get assetHeight() {
    return this._assetHeight || '';
  }
  set assetHeight(value) {
    this._assetHeight = transform.number(value);
    
    // Avoid a forced reflow by executing following in the next frame
    window.requestAnimationFrame(() => {
      // both hint dimensions need to be set in order to use this feature
      if (!this._loaded && this._elements.asset && this.assetWidth && this._assetHeight) {
        // gets the width without the border of the card
        const clientRect = this.getBoundingClientRect();
        const width = clientRect.right - clientRect.left;
        // calculates the image ratio used to resize the height
        const ratio = width / this.assetWidth;
    
        // the image is considered "low resolution"
        // @todo: check this after removal of lowResolution
        if (ratio > 1) {
          // 32 = $card-asset-lowResolution-padding * 2
          this._elements.asset.style.height = `${this._assetHeight + 32}px`;
        }
        // for non-low resolution images, condensed and inverted cards do not require the height to be set
        else if (this.variant !== variant.CONDENSED && this.variant !== variant.INVERTED) {
          this._elements.asset.style.height = `${ratio * this._assetHeight}px`;
        }
      }
    });
  }
  
  /**
   Hints the width of the asset that is going to be loaded. This prepares the size so that when the image is
   loaded no reflow is triggered. Both <code>assetHeight</code> and <code>assetWidth</code> need to be specified
   for this feature to take effect.
   
   @type {String}
   @default ""
   @htmlattribute assetwidth
   */
  get assetWidth() {
    return this._assetWidth || '';
  }
  set assetWidth(value) {
    this._assetWidth = transform.number(value);
  }
  
  /**
   @type {String}
   @default ""
   @htmlattribute colorhint
   */
  get colorHint() {
    return this._colorHint || '';
  }
  set colorHint(value) {
    if (COLOR_HINT_REG_EXP.test(value)) {
      this._colorHint = value;
  
      // if the image is already loaded we do not add the color hint to the asset
      if (!this._loaded) {
        this._elements.asset.style['background-color'] = this._colorHint;
      }
    }
  }
  
  /**
   The Content of the card.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-card-content',
      insert: function(content) {
        content.classList.add('u-coral-padding');
        this._elements.wrapper.insertBefore(content, this.overlay || null);
      }
    });
  }
  
  /**
   The Banner of the card.
   
   @type {HTMLElement}
   @contentzone
   */
  get banner() {
    return this._getContentZone(this._elements.banner);
  }
  set banner(value) {
    this._setContentZone('banner', value, {
      handle: 'banner',
      tagName: 'coral-card-banner',
      insert: function(content) {
        content.classList.add('_coral-Banner--corner');
        this.appendChild(content);
      }
    });
  }
  
  /**
   The information area of the card, which is placed over all the content. It is typically used for alerts.
   
   @type {HTMLElement}
   @contentzone
   */
  get info() {
    return this._getContentZone(this._elements.info);
  }
  set info(value) {
    this._setContentZone('info', value, {
      handle: 'info',
      tagName: 'coral-card-info',
      insert: function(info) {
        this.appendChild(info);
      }
    });
  }
  
  /**
   Fixes the width of the card. By default cards will take the width of their containers allowing them to interact
   nicely with grids. Whenever they are used standalone fixing the width might be desired.
   
   @type {Boolean}
   @default false
   @htmlattribute fixedwidth
   @htmlattributereflected
   */
  get fixedWidth() {
    return this._fixedWidth || false;
  }
  set fixedWidth(value) {
    this._fixedWidth = transform.booleanAttr(value);
    this._reflectAttribute('fixedwidth', this._fixedWidth);
  
    this.classList.toggle(`${CLASSNAME}--fixedWidth`, this._fixedWidth);
  }
  
  /**
   The Overlay of the card.
   
   @type {HTMLElement}
   @contentzone
   */
  get overlay() {
    return this._getContentZone(this._elements.overlay);
  }
  set overlay(value) {
    this._setContentZone('overlay', value, {
      handle: 'overlay',
      tagName: 'coral-card-overlay',
      insert: function(overlay) {
        this._elements.wrapper.appendChild(overlay);
      }
    });
  }
  
  /**
   Whether the card is stacked or not. This is used to represent several assets grouped together.
   
   @type {Boolean}
   @default false
   @htmlattribute stacked
   @htmlattributereflected
   */
  get stacked() {
    return this._stacked || false;
  }
  set stacked(value) {
    this._stacked = transform.booleanAttr(value);
    this._reflectAttribute('stacked', this._stacked);
  
    this.classList.toggle(`${CLASSNAME}--stacked`, this._stacked);
  }
  
  /**
   The card's variant. It determines which sections of the Card and in which position they are shown.
   See {@link CardVariantEnum}.
   
   @type {String}
   @default CardVariantEnum.DEFAULT
   @htmlattribute variant
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);

    this.classList.remove(...ALL_VARIANT_CLASSES);

    if (this._variant !== variant.DEFAULT) {
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
    
    this.assetHeight = this.assetHeight;
  }
  
  /** @ignore */
  _onLoad(event) {
    // @todo fix me for multiple images
    // sets the image as loaded
    this._loaded = true;
  
    // removes the height style since the asset has been completely loaded
    this._elements.asset.style.height = '';
  
    // enables the transition
    event.target.classList.remove('is-loading');
  }
  
  /**
   Hide the banner if it's empty
   @ignore
   */
  _hideBannerIfEmpty() {
    const banner = this._elements.banner;
    const bannerHeader = banner._elements.header;
    const bannerContent = banner._elements.content;
    
    // If it's empty and has no non-textnode children, hide the label
    const headerHiddenValue = bannerHeader.children.length === 0 && bannerHeader.textContent.replace(/\s*/g, '') === '';
    const contentHiddenValue = bannerContent.children.length === 0 && bannerContent.textContent.replace(/\s*/g, '') === '';
    const hiddenValue = headerHiddenValue && contentHiddenValue;
    
    // Only bother if the hidden status has changed
    if (hiddenValue !== this._elements.banner.hidden) {
      this._elements.banner.hidden = hiddenValue;
    }
  }
  
  get _contentZones() {
    return {
      'coral-card-banner': 'banner',
      'coral-card-asset': 'asset',
      'coral-card-content': 'content',
      'coral-card-info': 'info',
      'coral-card-overlay': 'overlay'
    };
  }
  
  /**
   Returns {@link Card} variants.
   
   @return {CardVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'assetwidth',
      'assetWidth',
      'assetheight',
      'assetHeight',
      'colorhint',
      'colorHint',
      'fixedwidth',
      'fixedWidth',
      'variant',
      'stacked'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME, 'coral-Well');
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
  
    const content = this._elements.content;
    const asset = this._elements.asset;
    
    // Prepares images to be loaded nicely
    const images = asset.querySelectorAll('img');
    const imagesCount = images.length;
    for (let i = 0; i < imagesCount; i++) {
      const image = images[i];
      if (!image.complete) {
        image.classList.add('is-loading');
      }
    }
  
    for (const contentZone in this._contentZones) {
      const element = this._elements[this._contentZones[contentZone]];
      // Remove it so we can process children
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  
    // Moves everything into the main content zone
    while (this.firstChild) {
      const child = this.firstChild;
      // Removes the empty spaces
      if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() !== '' ||
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'wrapper') {
        // Add non-template elements to the content
        content.appendChild(child);
      }
      // Remove anything else element
      else {
        this.removeChild(child);
      }
    }
  
    // Assign the content zones so the insert functions will be called
    this.overlay = this._elements.overlay;
    this.content = content;
    this.info = this._elements.info;
    this.banner = this._elements.banner;
  
    this.appendChild(this._elements.wrapper);
  
    // The 'asset' setter knows to insert the element just before the wrapper node.
    this.asset = asset;
  }
}

export default Card;
