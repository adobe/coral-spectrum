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

import accessibilityState from '../templates/accessibilityState';
import {BaseComponent} from '../../../coral-base-component';
import {BaseLabellable} from '../../../coral-base-labellable';
import {Icon} from '../../../coral-component-icon';
import {Checkbox} from '../../../coral-component-checkbox';
import {commons, i18n, transform, validate} from '../../../coral-utils';
import {Decorator} from '../../../coral-decorator';

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
 Utility that identifies Chrome on macOS, which announces drilldown items as "row 1 expanded" or "row 1 collapsed" when navigating between items.
 */
const isChromeMacOS = !!window && !!window.chrome && /Mac/i.test(window.navigator.platform);

/**
 @class Coral.ColumnView.Item
 @classdesc A ColumnView Item component
 @htmltag coral-columnview-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const ColumnViewItem = Decorator(class extends BaseLabellable(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Content zone
    this._elements = {
      content: this.querySelector('coral-columnview-item-content') || document.createElement('coral-columnview-item-content'),
      thumbnail: this.querySelector('coral-columnview-item-thumbnail') || document.createElement('coral-columnview-item-thumbnail'),
      accessibilityState: this.querySelector('span[handle="accessibilityState"]')
    };

    if (!this._elements.accessibilityState) {
      // Templates
      accessibilityState.call(this._elements, {commons});
    }
  }

  /**
   The content of the item.

   @type {ColumnViewItemContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-columnview-item-content',
      insert: function (content) {
        content.classList.add(`${CLASSNAME}Label`);
        // Insert before chevron
        this.insertBefore(content, this.querySelector('._coral-AssetList-itemChildIndicator'));
      }
    });
  }

  /**
   The thumbnail of the item. It is used to hold an icon or an image.

   @type {ColumnViewItemThumbnail}
   @contentzone
   */
  get thumbnail() {
    return this._getContentZone(this._elements.thumbnail);
  }

  set thumbnail(value) {
    this._setContentZone('thumbnail', value, {
      handle: 'thumbnail',
      tagName: 'coral-columnview-item-thumbnail',
      insert: function (thumbnail) {
        thumbnail.classList.add(`${CLASSNAME}Thumbnail`);
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
    value = validate.enumeration(variant)(value) && value || variant.DEFAULT;

    this._reflectAttribute('variant', value);

    if(validate.valueMustChange(this._variant, value)) {
      this._variant = value;

      if (value === variant.DRILLDOWN) {
        // Render chevron on demand
        const childIndicator = this.querySelector('._coral-AssetList-itemChildIndicator');
        if (!childIndicator) {
          this.insertAdjacentHTML('beforeend', Icon._renderSVG('spectrum-css-icon-ChevronRightMedium', ['_coral-AssetList-itemChildIndicator', '_coral-UIIcon-ChevronRightMedium']));
        }
  
        this.classList.add('is-branch');
  
        // @a11y Update aria-expanded. Active drilldowns should be expanded.
        // Note: Omit aria-expanded on Chrome for macOS, because with VoiceOver tends
        // to announce drilldown items as "row 1 expanded" or "row 1 collapsed" when
        // navigating between items.
        if (this.selected || (isChromeMacOS && this.getAttribute('aria-level') === '1')) {
          this.removeAttribute('aria-expanded');
        } else {
          this.setAttribute('aria-expanded', this.active);
        }
      } else {
        this.classList.remove('is-branch');
        this.removeAttribute('aria-expanded');
      }
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
    value = transform.string(value);
    
    this._reflectAttribute('icon', value);

    if(validate.valueMustChange(this._icon, value)) {
      this._icon = value;

      // ignored if it is an empty string
      if (value) {
        // creates a new icon element
        if (!this._elements.icon) {
          this._elements.icon = new Icon();
          // register observer only if there present an icon field.
          super._observeLabel();
        }
  
        this._elements.icon.icon = this.icon;
        this._elements.icon.size = Icon.size.SMALL;
  
        // removes all the items, since the icon attribute has precedence
        this._elements.thumbnail.innerHTML = '';
  
        // adds the newly created icon
        this._elements.thumbnail.appendChild(this._elements.icon);
      }
  
      super._toggleIconAriaHidden();
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
    value = transform.booleanAttr(value);
    this._reflectAttribute('selected', value);

    if(validate.valueMustChange(this._selected, value)) {
      this._selected = value;
      this.trigger('coral-columnview-item:_selectedchanged');
  
      // wait a frame before updating attributes
      commons.nextFrame(() => {
        this.classList.toggle('is-selected', value);
        this.setAttribute('aria-selected', value);
  
        // @a11y Update aria-expanded. Active drilldowns should be expanded.
        // Note: Omit aria-expanded on Chrome for macOS, because with VoiceOver tends
        // to announce drilldown items as "row 1 expanded" or "row 1 collapsed" when
        // navigating between items.
        if (value === variant.DRILLDOWN) {
          if (this._selected || (isChromeMacOS && this.getAttribute('aria-level') === '1')) {
            this.removeAttribute('aria-expanded');
          } else {
            this.setAttribute('aria-expanded', this.active);
          }
        }
  
        let accessibilityState = this._elements.accessibilityState;
  
        if (value) {
  
          // @a11y Panels to right of selected item are removed, so remove aria-owns and aria-describedby attributes.
          this.removeAttribute('aria-owns');
          this.removeAttribute('aria-describedby');
  
          // @a11y Update content to ensure that checked state is announced by assistive technology when the item receives focus
          accessibilityState.innerHTML = i18n.get(', checked');
  
          // @a11y append live region content element
          if (!this.contains(accessibilityState)) {
            this.appendChild(accessibilityState);
          }
        }
        // @a11y If deselecting from checked state,
        else {
  
          // @a11y remove, but retain reference to accessibilityState state
          if (accessibilityState.parentNode) {
            this._elements.accessibilityState = accessibilityState.parentNode.removeChild(accessibilityState);
          }
  
          // @a11y Update content to remove checked state
          this._elements.accessibilityState.innerHTML = '';
        }
  
        // @a11y Item should be labelled by thumbnail, content, and if appropriate accessibility state.
        let ariaLabelledby = this._elements.thumbnail.id + ' ' + this._elements.content.id;
        this.setAttribute('aria-labelledby', this.selected ? `${ariaLabelledby} ${accessibilityState.id}` : ariaLabelledby);
  
        // Sync checkbox item selector
        const itemSelector = this.querySelector('coral-checkbox[coral-columnview-itemselect]');
        if (itemSelector) {
          itemSelector[value ? 'setAttribute' : 'removeAttribute']('checked', '');
        }
      });
    }
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
    value = transform.booleanAttr(value);
    this._reflectAttribute('active', value);

    if(validate.valueMustChange(this._active, value)) {
      this._active = value;

      this.classList.toggle('is-navigated', value);
      this.setAttribute('aria-selected', this.hasAttribute('_selectable') ? this.selected : value);
  
      // @a11y Update aria-expanded. Active drilldowns should be expanded.
      // Note: Omit aria-expanded on Chrome for macOS, because with VoiceOver tends
      // to announce drilldown items as "row 1 expanded" or "row 1 collapsed" when
      // navigating between items.
      if (this.variant === variant.DRILLDOWN) {
        if (this.selected || (isChromeMacOS && this.getAttribute('aria-level') === '1')) {
          this.removeAttribute('aria-expanded');
        } else {
          this.setAttribute('aria-expanded', this.active);
        }
      }
  
      if (!value) {
        // @a11y Inactive items are not expanded, so remove aria-owns and aria-describedby attributes.
        this.removeAttribute('aria-owns');
        this.removeAttribute('aria-describedby');
      }
  
      this.trigger('coral-columnview-item:_activechanged');
    }
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
          if (this.classList.contains('is-selected')) {
            itemSelector.setAttribute('checked', '');
          }
          itemSelector._elements.input.tabIndex = -1;
          itemSelector.setAttribute('labelledby', this._elements.content.id);

          // Add the item selector as first child
          this.insertBefore(itemSelector, this.firstChild);
        }
      }
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  /**
   Returns {@link ColumnViewItem} variants.

   @return {ColumnViewItemVariantEnum}
   */
  static get variant() {
    return variant;
  }

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
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // @a11y
    this.setAttribute('role', 'treeitem');

    this.id = this.id || commons.getUID();

    // only set tabIndex if it is not already set
    if (!this.hasAttribute('tabindex')) {
      this.tabIndex = this.active || this.selected ? 0 : -1;
    }

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }

    const thumbnail = this._elements.thumbnail;
    const content = this._elements.content;

    const contentZoneProvided = content.parentNode || thumbnail.parentNode;

    if (!contentZoneProvided) {
      // move the contents of the item into the content zone
      while (this.firstChild) {
        content.appendChild(this.firstChild);
      }
    }

    // Assign content zones
    this.content = content;
    this.thumbnail = thumbnail;

    // @a11y thumbnail img element should have alt attribute
    const thumbnailImg = thumbnail.querySelector('img:not([alt])');
    if (thumbnailImg) {
      thumbnailImg.setAttribute('alt', '');
    }

    // @ally add aria-labelledby so that JAWS/IE announces item correctly
    thumbnail.id = thumbnail.id || commons.getUID();

    content.id = content.id || commons.getUID();

    // @a11y Add live region element to ensure announcement of selected state
    const accessibilityState = this._elements.accessibilityState;

    // @a11y accessibility state string should announce in document lang, rather than item lang.
    accessibilityState.setAttribute('lang', i18n.locale);

    // @a11y Item should be labelled by thumbnail, content, and accessibility state.
    this.setAttribute('aria-labelledby', thumbnail.id + ' ' + content.id);

    //adding html title, on hovering over textcontent title will be visible
    this.setAttribute('title', this.content.textContent.trim());
  }
});

export default ColumnViewItem;
