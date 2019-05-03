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

import {ComponentMixin} from '../../../coral-mixin-component';
import {Icon} from '../../../coral-component-icon';
import {Checkbox} from '../../../coral-component-checkbox';
import {transform, validate} from '../../../coral-utils';

const CLASSNAME = '_coral-AssetList-item';

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
        // Insert before chevron
        this.insertBefore(content, this.querySelector('._coral-MillerColumn-childIndicator'));
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
        // Insert before content
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
    this._variant = validate.enumeration(variant)(value) && value || variant.DEFAULT;
    this._reflectAttribute('variant', this._variant);
  
    if (this._variant === variant.DRILLDOWN) {
      // Render chevron on demand
      const childIndicator = this.querySelector('._coral-AssetList-itemChildIndicator');
      if (!childIndicator) {
        this.insertAdjacentHTML('beforeend', Icon._renderSVG('spectrum-css-icon-ChevronRightMedium', ['_coral-AssetList-itemChildIndicator', '_coral-UIIcon-ChevronRightMedium']));
      }
      
      this.classList.add('is-branch');
    }
    else {
      this.classList.remove('is-branch');
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
        this._elements.icon = new Icon();
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
  
    // Sync checkbox item selector
    const itemSelector = this.querySelector('coral-checkbox[coral-columnview-itemselect]');
    if (itemSelector) {
      itemSelector[this._selected ? 'setAttribute' : 'removeAttribute']('checked', '');
    }
    
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
  
    this.classList.toggle('is-navigated', this._active);
    this.setAttribute('aria-selected', this._active || this.selected);
    
    this.trigger('coral-columnview-item:_activechanged');
  }
  
  get _contentZones() {
    return {
      'coral-columnview-item-content': 'content',
      'coral-columnview-item-thumbnail': 'thumbnail'
    };
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_selectable') {
      // Disable selection
      if (value === null) {
        this.classList.remove('is-selectable');
      }
      // Enable selection
      else {
        this.classList.add('is-selectable');
        let itemSelector = this.querySelector('[coral-columnview-itemselect]');
  
        // Render checkbox on demand
        if (!itemSelector) {
          itemSelector = new Checkbox();
          itemSelector.setAttribute('coral-columnview-itemselect', '');
      
          // Add the item selector as first child
          this.insertBefore(itemSelector, this.firstChild);
        }
      }
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /**
   Returns {@link ColumnViewItem} variants.
   
   @return {ColumnViewItemVariantEnum}
   */
  static get variant() { return variant; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'variant',
      'icon',
      'selected',
      'active',
      '_selectable'
    ]);
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
    
    const contentZoneProvided = content.parentNode || thumbnail.parentNode;
    
    if (!contentZoneProvided) {
      // move the contents of the item into the content zone
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
  
      this.content = content;
      this.thumbnail = thumbnail;
    }
    // Insert thumbnail if icon is specified
    else if (this.icon) {
      this.thumbnail = this._elements.thumbnail;
    }
  }
}

export default ColumnViewItem;
