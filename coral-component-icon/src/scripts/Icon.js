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
import {transform, validate, commons, i18n} from '../../../coral-utils';
import ICON_MAP from '../../../coral-compat/data/iconMap';
import SPECTRUM_ICONS_PATH from '../resources/spectrum-icons.svg';
import SPECTRUM_ICONS_COLOR_PATH from '../resources/spectrum-icons-color.svg';
import SPECTRUM_CSS_ICONS_PATH from '../resources/spectrum-css-icons.svg';
import loadIcons from './loadIcons';
import {Decorator} from '../../../coral-decorator';
import {SPECTRUM_ICONS, SPECTRUM_ICONS_COLOR, SPECTRUM_CSS_ICONS} from './iconCollection';

const SPECTRUM_ICONS_IDENTIFIER = 'spectrum-';
const SPECTRUM_COLORED_ICONS_IDENTIFIER = [
  'ColorLight',
  'Color_Light',
  'ColorDark',
  'Color_Dark',
  'ColorActive',
  'Color_Active',
  // Unique colored icons
  'AdobeExperienceCloudColor',
  'AdobeExperiencePlatformColor',
];

let resourcesPath = (commons.options.icons || '').trim();
if (resourcesPath.length && resourcesPath[resourcesPath.length - 1] !== '/') {
  resourcesPath += '/';
}

// @IE11
const IS_IE11 = !window.ActiveXObject && 'ActiveXObject' in window;
let iconsExternal = commons.options.iconsExternal || 'on';
if (IS_IE11) {
  iconsExternal = 'off';
}

const resolveIconsPath = (iconsPath) => {
  const path = commons._script.src;
  return `${path.split('/').slice(0, -iconsPath.split('/').length).join('/')}/${iconsPath}`;
};

/**
 Regex used to match URLs. Assume it's a URL if it has a slash, colon, or dot.

 @ignore
 */
const URL_REGEX = /\/|:|\./g;

/**
 Regex used to match unresolved templates e.g. for data-binding

 @ignore
 */
const TEMPLATE_REGEX = /.*\{\{.+\}\}.*/g;

/**
 Regex used to split camel case icon names into more screen-reader friendly alt text.

 @ignore
 */
const SPLIT_CAMELCASE_REGEX = /([a-z])([A-Z0-9])/g;

/**
 Regex used to match the sized spectrum icon prefix

 @ignore
 */
const SPECTRUM_ICONS_IDENTIFIER_REGEX = /^spectrum(?:-css)?-icon(?:-\d{1,3})?-/gi;

/**
 Regex used match the variant postfix for an icon

 @ignore
 */
const ICONS_VARIANT_POSTFIX_REGEX = /(Outline)?(Filled)?(Small|Medium|Large)?(Color)?_?(Active|Dark|Light)?$/;

/**
 Translation hint used for localizing default alt text for an icon

 @ignore
 */
const ICON_ALT_TRANSLATION_HINT = 'default icon alt text';

/**
 Returns capitalized string. This is used to map the icons with their SVG counterpart.

 @ignore
 @param {String} s
 @return {String}
 */
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

/**
 Enumeration for {@link Icon} sizes.

 @typedef {Object} IconSizeEnum

 @property {String} EXTRA_EXTRA_SMALL
 Extra extra small size icon, typically 9px size.
 @property {String} EXTRA_SMALL
 Extra small size icon, typically 12px size.
 @property {String} SMALL
 Small size icon, typically 18px size. This is the default size.
 @property {String} MEDIUM
 Medium size icon, typically 24px size.
 @property {String} LARGE
 Large icon, typically 36px size.
 @property {String} EXTRA_LARGE
 Extra large icon, typically 48px size.
 @property {String} EXTRA_EXTRA_LARGE
 Extra extra large icon, typically 72px size.
 */
const size = {
  EXTRA_EXTRA_SMALL: 'XXS',
  EXTRA_SMALL: 'XS',
  SMALL: 'S',
  MEDIUM: 'M',
  LARGE: 'L',
  EXTRA_LARGE: 'XL',
  EXTRA_EXTRA_LARGE: 'XXL'
};


/**
 Enumeration for {@link Icon} autoAriaLabel value.

 @typedef {Object} IconAutoAriaLabelEnum

 @property {String} ON
 The aria-label attribute is automatically set based on the icon name.
 @property {String} OFF
 The aria-label attribute is not set and has to be provided explicitly.
 */
const autoAriaLabel = {
  ON: 'on',
  OFF: 'off'
};

// icon's base classname
const CLASSNAME = '_coral-Icon';

// builds an array containing all possible size classnames. this will be used to remove classnames when the size
// changes
const ALL_SIZE_CLASSES = [];
for (const sizeValue in size) {
  ALL_SIZE_CLASSES.push(`${CLASSNAME}--size${size[sizeValue]}`);
}

// Based on https://github.com/adobe/spectrum-css/tree/master/icons
const sizeMap = {
  XXS: 18,
  XS: 24,
  S: 18,
  M: 24,
  L: 18,
  XL: 24,
  XXL: 24
};

/**
 @class Coral.Icon
 @classdesc An Icon component. Icon ships with a set of SVG icons.
 @htmltag coral-icon
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const Icon = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this._elements = {};
  }

  /**
   Whether aria-label is set automatically. See {@link IconAutoAriaLabelEnum}.

   @type {String}
   @default IconAutoAriaLabelEnum.OFF
   */
  get autoAriaLabel() {
    return this._autoAriaLabel || autoAriaLabel.OFF;
  }

  set autoAriaLabel(value) {
    value = transform.string(value).toLowerCase();
    this._autoAriaLabel = validate.enumeration(autoAriaLabel)(value) && value || autoAriaLabel.OFF;
    this._updateAltText();
  }

  /**
   Icon name.

   @type {String}
   @default ""
   @htmlattribute icon
   @htmlattributereflected
   */
  get icon() {
    return this._icon || '';
  }

  set icon(value) {
    const icon = transform.string(value).trim();

    // Avoid rendering the same icon
    if (icon !== this._icon || this.hasAttribute('_context')) {
      this._icon = icon;
      this._reflectAttribute('icon', this._icon);

      // Ignore unresolved templates
      if (this._icon.match(TEMPLATE_REGEX)) {
        return;
      }

      // Use the existing img
      if (this._hasRawImage) {
        this._elements.image.classList.add(CLASSNAME, `${CLASSNAME}--image`);
        this._updateAltText();
        return;
      }

      // Remove image and SVG elements
      ['image', 'svg'].forEach((type) => {
        const el = this._elements[type] || this.querySelector(`.${CLASSNAME}--${type}`);
        if (el) {
          el.remove();
        }
      });

      // Sets the desired icon
      if (this._icon) {
        // Detect if it's a URL
        if (this._icon.match(URL_REGEX)) {
          // Create an image and add it to the icon
          this._elements.image = this._elements.image || document.createElement('img');
          this._elements.image.className = `${CLASSNAME} ${CLASSNAME}--image`;
          this._elements.image.src = this.icon;
          this.appendChild(this._elements.image);
        } else {
          this._updateIcon();
        }
      }

      this._updateAltText();
    }
  }

  /**
   Size of the icon. It accepts both lower and upper case sizes. See {@link IconSizeEnum}.

   @type {String}
   @default IconSizeEnum.SMALL
   @htmlattribute size
   @htmlattributereflected
   */
  get size() {
    return this._size || size.SMALL;
  }

  set size(value) {
    const oldSize = this._size;

    value = transform.string(value).toUpperCase();
    this._size = validate.enumeration(size)(value) && value || size.SMALL;
    this._reflectAttribute('size', this._size);

    // removes all the existing sizes
    this.classList.remove(...ALL_SIZE_CLASSES);
    // adds the new size
    this.classList.add(`${CLASSNAME}--size${this._size}`);

    // We need to update the icon if the size changed
    if (oldSize && oldSize !== this._size && this.contains(this._elements.svg)) {
      this._elements.svg.remove();
      this._updateIcon();
    }

    this._updateAltText();
  }

  /** @private */
  get title() {
    return this.getAttribute('title');
  }

  set title(value) {
    this.setAttribute('title', value);
  }

  /** @private */
  get alt() {
    return this.getAttribute('alt');
  }

  set alt(value) {
    this.setAttribute('alt', value);
  }

  _updateIcon() {
    let iconId = this.icon;

    // If icon name is passed, we have to build the icon Id based on the icon name
    if (iconId.indexOf(SPECTRUM_ICONS_IDENTIFIER) !== 0) {
      const iconMapped = ICON_MAP[iconId];
      let iconName;

      // Restore default state
      this.removeAttribute('_context');

      if (iconMapped) {
        if (iconMapped.spectrumIcon) {
          // Use the default mapped icon
          iconName = iconMapped.spectrumIcon;
        } else {
          // Verify if icon should be light or dark by looking up parents theme
          const closest = this.closest('.coral--light, .coral--dark, .coral--lightest, .coral--darkest');

          if (closest) {
            if (closest.classList.contains('coral--light') || closest.classList.contains('coral--lightest')) {
              // Use light icon
              iconName = iconMapped.spectrumIconLight;
            } else {
              // Use dark icon
              iconName = iconMapped.spectrumIconDark;
            }
          }
          // Use light by default
          else {
            iconName = iconMapped.spectrumIconLight;
          }

          // Mark icon as contextual icon because the icon name is defined based on the theme
          this.setAttribute('_context', '');
        }

        // Inform user about icon name changes
        if (iconName) {
          commons._log('warn', `Coral.Icon: the icon ${iconId} has been deprecated. Please use ${iconName} instead.`);
        } else {
          commons._log('warn', `Coral.Icon: the icon ${iconId} has been removed. Please contact Icons@Adobe.`);
        }
      }
      // In most cases, using the capitalized icon name maps to the spectrum icon name
      else {
        iconName = capitalize(iconId);
      }

      // Verify if icon name is a colored icon
      if (SPECTRUM_COLORED_ICONS_IDENTIFIER.some(identifier => iconName.indexOf(identifier) !== -1)) {
        // Colored icons are 24 by default
        iconId = `spectrum-icon-24-${iconName}`;
      } else {
        const sizeAttribute = this.getAttribute('size');
        const iconSize = sizeMap[sizeAttribute && sizeAttribute.toUpperCase() || size.SMALL];
        iconId = `spectrum-icon-${iconSize}-${iconName}`;
      }
    }

    // Insert SVG Icon using HTML because DOMly doesn't support document.createElementNS for <use> element
    this.insertAdjacentHTML('beforeend', this.constructor._renderSVG(iconId));

    this._elements.svg = this.lastElementChild;
  }

  /**
   Updates the aria-label or img alt attribute depending on value of alt, title, icon and autoAriaLabel.

   In cases where the alt attribute has been removed or set to an empty string,
   for example, when the alt property is undefined and we add the attribute alt=''
   to explicitly override the default behavior, or when we remove an alt attribute
   thus restoring the default behavior, we make sure to update the alt text.
   @private
   */
  _updateAltText(value) {
    const hasAutoAriaLabel = this.autoAriaLabel === autoAriaLabel.ON;
    const img = this._elements.image;
    const isImage = this.contains(img);

    // alt should be prioritized over title
    let altText = typeof this.alt === 'string' ? this.alt : this.title;

    if (typeof value === 'string') {
      altText = this.alt || value;
    } else if (isImage) {
      altText = altText || img.getAttribute('alt') || img.getAttribute('title') || '';
    } else if (hasAutoAriaLabel) {
      let iconName = this.icon.replace(SPECTRUM_ICONS_IDENTIFIER_REGEX, '');
      iconName = iconName.replace(ICONS_VARIANT_POSTFIX_REGEX, '');
      altText = i18n.get(iconName.replace(SPLIT_CAMELCASE_REGEX, '$1 $2').toLowerCase(), ICON_ALT_TRANSLATION_HINT);
    }

    // If no other role has been set, provide the appropriate
    // role depending on whether or not the icon is an arbitrary image URL.
    const role = this.getAttribute('role');
    const roleOverride = role && (role !== 'presentation' && role !== 'img');
    if (!roleOverride) {
      this.setAttribute('role', isImage ? 'presentation' : 'img');
    }

    // Set accessibility attributes accordingly
    if (isImage) {
      hasAutoAriaLabel && this.removeAttribute('aria-label');
      img.setAttribute('alt', altText);
    } else if (altText === '') {
      this.removeAttribute('aria-label');
      if (!roleOverride) {
        this.removeAttribute('role');
      }
    } else if (altText) {
      this.setAttribute('aria-label', altText);
    }
  }

  /**
   Whether SVG icons are referenced as external resource (on/off)

   @return {String}
   */
  static _iconsExternal() {
    return iconsExternal;
  }

  /**
   Returns the SVG markup.

   @param {String} iconId
   @param {Array.<String>} additionalClasses
   @return {String}
   */
  static _renderSVG(iconId, additionalClasses = []) {
    additionalClasses.unshift(CLASSNAME);
    additionalClasses.unshift(`${CLASSNAME}--svg`);

    let iconPath = `#${iconId}`;

    // If not colored icons
    if (this._iconsExternal() === 'on' && !SPECTRUM_COLORED_ICONS_IDENTIFIER.some(identifier => iconId.indexOf(identifier) !== -1)) {
      // Generate spectrum-css-icons path
      if (iconId.indexOf('spectrum-css') === 0) {
        iconPath = resourcesPath ? `${resourcesPath}${SPECTRUM_CSS_ICONS}.svg#${iconId}` : `${resolveIconsPath(SPECTRUM_CSS_ICONS_PATH)}#${iconId}`;
      }
      // Generate spectrum-icons path
      else {
        iconPath = resourcesPath ? `${resourcesPath}${SPECTRUM_ICONS}.svg#${iconId}` : `${resolveIconsPath(SPECTRUM_ICONS_PATH)}#${iconId}`;
      }
    }

    return `
      <svg focusable="false" aria-hidden="true" class="${additionalClasses.join(' ')}">
        <use xlink:href="${iconPath}"></use>
      </svg>
    `;
  }

  /**
   Returns {@link Icon} sizes.

   @return {IconSizeEnum}
   */
  static get size() {
    return size;
  }

  /**
   Returns {@link Icon} autoAriaLabel options.

   @return {IconAutoAriaLabelEnum}
   */
  static get autoAriaLabel() {
    return autoAriaLabel;
  }

  /**
   Loads the SVG icons. It's requesting the icons based on the JS file path by default.

   @param {String} [url] SVG icons url.
   */
  static load(url) {
    const resolveIconsPath = (iconsPath) => {
      const path = commons._script.src;
      if (iconsExternal === 'js') {
        iconsPath = iconsPath.replace('.svg', '.js');
      }

      return `${path.split('/').slice(0, -iconsPath.split('/').length).join('/')}/${iconsPath}`;
    };

    if (url === SPECTRUM_ICONS) {
      url = resolveIconsPath(SPECTRUM_ICONS_PATH);
    } else if (url === SPECTRUM_ICONS_COLOR) {
      url = resolveIconsPath(SPECTRUM_ICONS_COLOR_PATH);
    } else if (url === SPECTRUM_CSS_ICONS) {
      url = resolveIconsPath(SPECTRUM_CSS_ICONS_PATH);
    }

    loadIcons(url);
  }

  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      autoarialabel: 'autoAriaLabel'
    });
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['autoarialabel', 'icon', 'size', 'alt', 'title']);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === 'alt' || name === 'title') {
      this._updateAltText(value);
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  /** @ignore */
  connectedCallback() {
    super.connectedCallback();

    // Contextual icons need to be checked again
    if (this.hasAttribute('_context')) {
      this.icon = this.icon;
    }
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // Set default size
    if (!this._size) {
      this.size = size.SMALL;
    }

    const img = this.querySelector(`img:not(.${CLASSNAME}--image)`);
    if (img) {
      this._elements.image = img;
      this._hasRawImage = true;
      this.icon = img.getAttribute('src');
      this._hasRawImage = false;
    }
  }
});

// Load icon collections by default
const iconCollections = [SPECTRUM_ICONS_COLOR];
let extension = '.svg';
if (Icon._iconsExternal() === 'off' || Icon._iconsExternal() === 'js') {
  iconCollections.push(SPECTRUM_CSS_ICONS);
  iconCollections.push(SPECTRUM_ICONS);

  if (Icon._iconsExternal() === 'js') {
    extension = '.js';
  }
}
iconCollections.forEach(iconSet => Icon.load(resourcesPath ? `${resourcesPath}${iconSet}${extension}` : iconSet));

export default Icon;
