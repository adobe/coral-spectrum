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
import base from '../templates/base';
import {commons, transform, validate} from '../../../coral-utils';

const COLOR_HINT_REG_EXP = /^#[0-9A-F]{6}$/i;

/**
 Enumeration for {@link Card} variants.
 
 @typedef {Object} CardVariantEnum
 
 @property {String} DEFAULT
 Default card variant that shows the asset, overlay and content in their default positions.
 @property {String} QUIET
 Quiet card variant that shows the asset, overlay and content in their default positions.
 @property {String} CONDENSED
 Condensed card variant where the overlay is hidden and the content is shown over the image.
 @property {String} INVERTED
 Condensed card variant where the overlay is hidden and the content is shown over the image with a dark style.
 @property {String} ASSET
 Card variant where only the asset is shown.
 */
const variant = {
  DEFAULT: 'default',
  QUIET: 'quiet',
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
 @extends {BaseComponent}
 */
class Card extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      asset: this.querySelector('coral-card-asset') || document.createElement('coral-card-asset'),
      content: this.querySelector('coral-card-content') || document.createElement('coral-card-content'),
      info: this.querySelector('coral-card-info') || document.createElement('coral-card-info'),
      overlay: this.querySelector('coral-card-overlay') || document.createElement('coral-card-overlay')
    };
    base.call(this._elements);
    
    // Events
    this._delegateEvents({
      'capture:load coral-card-asset img': '_onLoad'
    });
  }
  
  /**
   The Asset of the card.
   
   @type {CardAsset}
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
   
   @type {CardContent}
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
   The information area of the card, which is placed over all the content. It is typically used for alerts.
   
   @type {CardInfo}
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
   
   @type {CardOverlay}
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
  
  get _contentZones() {
    return {
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
  
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      assetwidth: 'assetWidth',
      assetheight: 'assetHeight',
      colorhint: 'colorHint',
      fixedwidth: 'fixedWidth'
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'assetwidth',
      'assetheight',
      'colorhint',
      'fixedwidth',
      'variant',
      'stacked'
    ]);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
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
  
    this.appendChild(this._elements.wrapper);
  
    // The 'asset' setter knows to insert the element just before the wrapper node.
    this.asset = asset;
    
    // In case a lot of alerts are added, they will not overflow the card
    this.classList.toggle(`${CLASSNAME}--overflow`, this.info.scrollHeight > this.clientHeight);
  }
}

export default Card;
