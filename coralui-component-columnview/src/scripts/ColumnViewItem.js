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

import {ComponentMixin} from 'coralui-mixin-component';
import {Icon} from 'coralui-component-icon';
import {transform, validate} from 'coralui-util';

const CLASSNAME = 'coral3-ColumnView-item';

/**
 Enumeration for {@link ColumnViewItem} variants.
 
 @typedef {Object} ColumnViewItemVariantEnum
 
 @property {String} DEFAULT
 Default item variant. Contains no special decorations.
 @property {String} DRILLDOWN
 An item with a right arrow indicating that the navigation will go one level down.
 */
const variant = {
  DEFAULT: 'default',
  DRILLDOWN: 'drilldown'
};

// builds a string containing all possible variant classnames. this will be used to remove classnames when the variant
// changes
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.ColumnView.Item
 @classdesc A ColumnView Item component
 @htmltag coral-columnview-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ColumnViewItem extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
  
    // Content zone
    this._elements = {
      content: this.querySelector('coral-columnview-item-content') || document.createElement('coral-columnview-item-content'),
      thumbnail: this.querySelector('coral-columnview-item-thumbnail') || document.createElement('coral-columnview-item-thumbnail')
    };
  }
  
  /**
   The content of the item.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-columnview-item-content',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   The thumbnail of the item. It is used to hold an icon or an image.
   
   @type {HTMLElement}
   @contentzone
   */
  get thumbnail() {
    return this._getContentZone(this._elements.thumbnail);
  }
  set thumbnail(value) {
    this._setContentZone('thumbnail', value, {
      handle: 'thumbnail',
      tagName: 'coral-columnview-item-thumbnail',
      insert: function(thumbnail) {
        this.insertBefore(thumbnail, this.content || null);
      }
    });
  }
  
  /**
   The item's variant. See {@link ColumnViewItemVariantEnum}.
   
   @type {String}
   @default ColumnViewItemVariantEnum.DEFAULT
   @htmlattribute variant
   @htmlattributereflected
   */
  get variant() {
    return this._variant || variant.DEFAULT;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration('variant', value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);
    
    // removes every existing variant
    this.classList.remove(...ALL_VARIANT_CLASSES);
  
    if (this._variant !== variant.DEFAULT) {
      this.classList.add(`${CLASSNAME}--${this._variant}`);
    }
  }
  
  /**
   Specifies the icon that will be placed inside the thumbnail. The size of the icon is always controlled by the
   component.
   
   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   */
  get icon() {
    return this._icon || '';
  }
  set icon(value) {
    this._icon = transform.string(value);
    this._reflectAttribute('icon', this._icon);
  
    // ignored if it is an empty string
    if (this._icon) {
      // creates a new icon element
      if (!this._elements.icon) {
        this._elements.icon = document.createElement('coral-icon');
      }
    
      this._elements.icon.icon = this.icon;
      this._elements.icon.size = Icon.size.SMALL;
    
      // removes all the items, since the icon attribute has precedence
      this._elements.thumbnail.innerHTML = '';
    
      // adds the newly created icon
      this._elements.thumbnail.appendChild(this._elements.icon);
    }
  }
  
  /**
   Whether the item is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
  
    this.classList.toggle('is-selected', this._selected);
    this.setAttribute('aria-selected', this._selected || this.active);
    
    this.trigger('coral-columnview-item:_selectedchanged');
  }
  
  /**
   Whether the item is active.
   
   @type {Boolean}
   @default false
   @htmlattribut active
   @htmlattributereflected
   */
  get active() {
    return this._active || false;
  }
  set active(value) {
    this._active = transform.booleanAttr(value);
    this._reflectAttribute('active', this._active);
  
    this.classList.toggle('is-active', this._active);
    this.setAttribute('aria-selected', this._active || this.selected);
    
    this.trigger('coral-columnview-item:_activechanged');
  }
  
  get _contentZones() {
    return {
      'coral-columnview-item-content': 'content',
      'coral-columnview-item-thumbnail': 'thumbnail'
    };
  }
  
  /**
   Returns {@link ColumnViewItem} variants.
   
   @return {ColumnViewItemVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return [
      'variant',
      'icon',
      'selected',
      'active'
    ];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // @a11y
    this.setAttribute('role', 'treeitem');
    
    // Default reflected attributes
    if (!this._variant) { this.variant = variant.DEFAULT; }
    
    const thumbnail = this._elements.thumbnail;
    const content = this._elements.content;
    
    // Remove content zones so we can process children
    if (content.parentNode) { content.remove(); }
    if (thumbnail.parentNode) { thumbnail.remove(); }
  
    // move the contents of the item into the content zone
    while (this.firstChild) {
      content.appendChild(this.firstChild);
    }
    
    this.content = content;
    this.thumbnail = thumbnail;
  }
}

export default ColumnViewItem;
