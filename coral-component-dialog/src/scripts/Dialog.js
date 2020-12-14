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
import {BaseOverlay} from '../../../coral-base-overlay';
import {DragAction} from '../../../coral-dragaction';
import {Icon} from '../../../coral-component-icon';
import '../../../coral-component-button';
import base from '../templates/base';
import {commons, transform, validate, i18n} from '../../../coral-utils';

/**
 Enumeration for {@link Dialog} closable options.

 @typedef {Object} DialogClosableEnum

 @property {String} ON
 Show a close button on the dialog and close the dialog when clicked.
 @property {String} OFF
 Do not show a close button. Elements with the <code>coral-close</code> attribute will still close the dialog.
 */
const closable = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link Dialog} keyboard interaction options.

 @typedef {Object} DialogInteractionEnum

 @property {String} ON
 Keyboard interaction is enabled.
 @property {String} OFF
 Keyboard interaction is disabled.
 */
const interaction = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link Dialog} variants.

 @typedef {Object} DialogVariantEnum

 @property {String} DEFAULT
 A default dialog without header icon.
 @property {String} ERROR
 A dialog with an error header and icon, indicating that an error has occurred.
 @property {String} WARNING
 A dialog with a warning header and icon, notifying the user of something important.
 @property {String} SUCCESS
 A dialog with a success header and icon, indicates to the user that an operation was successful.
 @property {String} HELP
 A dialog with a question header and icon, provides the user with help.
 @property {String} INFO
 A dialog with an info header and icon, informs the user of non-critical information.
 */
const variant = {
  DEFAULT: 'default',
  ERROR: 'error',
  WARNING: 'warning',
  SUCCESS: 'success',
  HELP: 'help',
  INFO: 'info'
};

/**
 Enumeration for {@link Dialog} backdrops.

 @typedef {Object} DialogBackdropEnum

 @property {String} NONE
 No backdrop.
 @property {String} MODAL
 A backdrop that hides the dialog when clicked.
 @property {String} STATIC
 A backdrop that does not hide the dialog when clicked.
 */
const backdrop = {
  NONE: 'none',
  MODAL: 'modal',
  STATIC: 'static'
};

// Used to map icon with variant
const capitalize = s => s.charAt(0).toUpperCase() + s.slice(1);

// The dialog's base classname
const CLASSNAME = '_coral-Dialog';
// Modifier classnames
const FULLSCREEN_CLASSNAME = `${CLASSNAME}--fullscreenTakeover`;

// A string of all possible variant classnames
const ALL_VARIANT_CLASSES = [];
for (const variantValue in variant) {
  ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
}

/**
 @class Coral.Dialog
 @classdesc A Dialog component that supports various use cases with custom content. The Dialog can be given a size by
 using the special attribute <code>[coral-dialog-size]</code> as selector.
 @htmltag coral-dialog
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseOverlay}
 */
class Dialog extends BaseOverlay(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();

    // Prepare templates
    this._elements = commons.extend(this._elements, {
      // Fetch or create the content zone elements
      header: this.querySelector('coral-dialog-header') || document.createElement('coral-dialog-header'),
      content: this.querySelector('coral-dialog-content') || document.createElement('coral-dialog-content'),
      footer: this.querySelector('coral-dialog-footer') || document.createElement('coral-dialog-footer')
    });
    base.call(this._elements, {i18n});

    // Events
    this._delegateEvents({
      'coral-overlay:open': '_handleOpen',
      'click [coral-close]': '_handleCloseClick',

      // Since we cover the backdrop with ourself for positioning purposes, this is implemented as a click listener
      // instead of using backdropClickedCallback
      'click': '_handleClick',

      // Handle resize events
      'global:resize': 'center',

      'global:key:escape': '_handleEscape'
    });

    // Override defaults from Overlay
    this._trapFocus = this.constructor.trapFocus.ON;
    this._returnFocus = this.constructor.returnFocus.ON;
    this._overlayAnimationTime = this.constructor.FADETIME;

    // Listen for mutations
    this._headerObserver = new MutationObserver(this._hideHeaderIfEmpty.bind(this));

    // Watch for changes to the header element's children
    this._observeHeader();
  }

  /**
   Whether keyboard interaction is enabled. See {@link DialogInteractionEnum}.

   @type {DialogInteractionEnum}
   @default DialogInteractionEnum.ON
   */
  get interaction() {
    return this._interaction || interaction.ON;
  }

  set interaction(value) {
    value = transform.string(value).toLowerCase();
    this._interaction = validate.enumeration(interaction)(value) && value || interaction.ON;
  }

  /**
   The dialog header element.

   @type {DialogHeader}
   @contentzone
   */
  get header() {
    return this._getContentZone(this._elements.header);
  }

  set header(value) {
    this._setContentZone('header', value, {
      handle: 'header',
      tagName: 'coral-dialog-header',
      insert: function (header) {
        header.classList.add(`${CLASSNAME}-title`);
        // Position the header between the drag zone and the type icon
        this._elements.headerWrapper.insertBefore(header, this._elements.dragZone.nextElementSibling);
      },
      set: function () {
        // Stop observing the old header and observe the new one
        this._observeHeader();

        // Check if header needs to be hidden
        this._hideHeaderIfEmpty();
      }
    });
  }

  /**
   The dialog content element.

   @type {DialogContent}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }

  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-dialog-content',
      insert: function (content) {
        content.classList.add(`${CLASSNAME}-content`);
        const footer = this.footer;
        // The content should always be before footer
        this._elements.wrapper.insertBefore(content, this.contains(footer) && footer || null);
      }
    });
  }

  /**
   The dialog footer element.

   @type {DialogFooter}
   @contentzone
   */
  get footer() {
    return this._getContentZone(this._elements.footer);
  }

  set footer(value) {
    this._setContentZone('footer', value, {
      handle: 'footer',
      tagName: 'coral-dialog-footer',
      insert: function (footer) {
        footer.classList.add(`${CLASSNAME}-footer`);
        // The footer should always be after content
        this._elements.wrapper.appendChild(footer);
      }
    });
  }

  /**
   The backdrop configuration for this dialog. See {@link DialogBackdropEnum}.

   @type {String}
   @default DialogBackdropEnum.MODAL
   @htmlattribute backdrop
   */
  get backdrop() {
    return this._backdrop || backdrop.MODAL;
  }

  set backdrop(value) {
    value = transform.string(value).toLowerCase();
    this._backdrop = validate.enumeration(backdrop)(value) && value || backdrop.MODAL;

    const showBackdrop = this._backdrop !== backdrop.NONE;
    this._elements.wrapper.classList.toggle(`${CLASSNAME}--noBackdrop`, !showBackdrop);

    // We're visible now, so hide or show the modal accordingly
    if (this.open && showBackdrop) {
      this._showBackdrop();
    }
  }

  /**
   The dialog's variant. See {@link DialogVariantEnum}.

   @type {String}
   @default DialogVariantEnum.DEFAULT
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

    // Insert SVG icon
    this._insertTypeIcon();

    // Remove all variant classes
    this._elements.wrapper.classList.remove(...ALL_VARIANT_CLASSES);

    if (this._variant === variant.DEFAULT) {
      // ARIA
      this.setAttribute('role', 'dialog');
    } else {
      // Set new variant class
      this._elements.wrapper.classList.add(`${CLASSNAME}--${this._variant}`);

      // ARIA
      this.setAttribute('role', 'alertdialog');
    }

    const hasHeader = this.header && this.header.textContent !== '';

    // If the dialog has a header and is not otherwise labelled,
    if (hasHeader && !(this.hasAttribute('aria-labelledby') || this.hasAttribute('aria-label'))) {
      this.header.id = this.header.id || commons.getUID();

      // label the dialog with a reference to the header
      this.setAttribute('aria-labelledby', this.header.id);
    }

    // If the dialog has no content, or the content is empty, do nothing further.
    if (!this.content || this.content.textContent === '') {
      return;
    }

    // If the dialog has a content,
    this.content.id = this.content.id || commons.getUID();

    // In an alertdialog with a content region, if the alertdialog is not otherwise described.
    if (this._variant !== variant.DEFAULT) {

      // with no header,
      if (!hasHeader) {

        // label the alertdialog with a reference to the content
        this.setAttribute('aria-labelledby', this.content.id);
      }

      // otherwise, if the alertdialog is not otherwise described,
      else if (!this.hasAttribute('aria-describedby')) {

        // ensure that the alertdialog is described by the content.
        this.setAttribute('aria-describedby', this.content.id);
      }
    } else if (this.getAttribute('aria-labelledby') === this.content.id) {
      this.removeAttribute('aria-labelledby');
    }
  }

  /**
   Whether the dialog should be displayed full screen (without borders or margin).

   @type {Boolean}
   @default false
   @htmlattribute fullscreen
   @htmlattributereflected
   */
  get fullscreen() {
    return this._fullscreen || false;
  }

  set fullscreen(value) {
    this._fullscreen = transform.booleanAttr(value);
    this._reflectAttribute('fullscreen', this._fullscreen);

    if (this._fullscreen) {
      // Full screen and movable are not compatible
      this.movable = false;
      this._elements.wrapper.classList.add(FULLSCREEN_CLASSNAME);
    } else {
      this._elements.wrapper.classList.remove(FULLSCREEN_CLASSNAME);
    }
  }

  /**
   Inherited from {@link BaseOverlay#open}.
   */
  get open() {
    return super.open;
  }

  set open(value) {
    super.open = value;

    // Ensure we're in the DOM
    if (this.open) {
      // If not child of document.body, we have to move it there
      this._moveToDocumentBody();

      // Show the backdrop, if necessary
      if (this.backdrop !== backdrop.NONE) {
        this._showBackdrop();
      }
    }

    // Support animation
    requestAnimationFrame(() => {
      // Support wrapped dialog
      this._elements.wrapper.classList.toggle('is-open', this.open);

      // Handles what to focus based on focusOnShow
      if (this.open) {
        commons.transitionEnd(this._elements.wrapper, () => {
          this._handleFocus();
          this._elements.closeButton.tabIndex = 0;
          this._elements.closeButton.removeAttribute('coral-tabcapture');
        });
      } else {
        this._elements.closeButton.tabIndex = -1;
        this._elements.closeButton.setAttribute('coral-tabcapture', '');
      }
    });
  }

  /**
   The dialog's icon.

   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon;
  }

  set icon(value) {
    this._elements.icon = value;
  }

  /**
   Whether the dialog should have a close button. See {@link DialogClosableEnum}.

   @type {String}
   @default DialogClosableEnum.OFF
   @htmlattribute closable
   @htmlattributereflected
   */
  get closable() {
    return this._closable || closable.OFF;
  }

  set closable(value) {
    value = transform.string(value).toLowerCase();
    this._closable = validate.enumeration(closable)(value) && value || closable.OFF;
    this._reflectAttribute('closable', this._closable);

    this._elements.wrapper.classList.toggle(`${CLASSNAME}--dismissible`, this._closable === closable.ON);
  }

  /**
   Whether the dialog can moved around by dragging the title.

   @type {Boolean}
   @default false
   @htmlattribute movable
   @htmlattributereflected
   */
  get movable() {
    return this._movable || false;
  }

  set movable(value) {
    this._movable = transform.booleanAttr(value);
    this._reflectAttribute('movable', this._movable);

    // Movable and fullscreen are not compatible
    if (this._movable) {
      this.fullscreen = false;
    }

    if (this._movable) {
      const dragAction = new DragAction(this);
      dragAction.handle = this._elements.headerWrapper;
    } else {
      // Disables any dragging interaction
      if (this.dragAction) {
        this.dragAction.destroy();
      }

      // Recenter the dialog once it's not movable anymore
      this.center();
    }
  }

  /**
   Inherited from {@link BaseComponent#trackingElement}.
   */
  get trackingElement() {
    return typeof this._trackingElement === 'undefined' ?
      (this.header && this.header.textContent && this.header.textContent.replace(/\s{2,}/g, ' ').trim() || '') :
      this._trackingElement;
  }

  set trackingElement(value) {
    super.trackingElement = value;
  }

  /** @ignore */
  _observeHeader() {
    if (this._headerObserver) {
      this._headerObserver.disconnect();

      if (this._elements.header) {
        this._headerObserver.observe(this._elements.header, {
          // Catch changes to childList
          childList: true,
          // Catch changes to textContent
          characterData: true,
          // Monitor any child node
          subtree: true
        });
      }
    }
  }

  /**
   Hide the header wrapper if the header content zone is empty.
   @ignore
   */
  _hideHeaderIfEmpty() {
    const header = this._elements.header;

    if (header) {
      const headerWrapper = this._elements.headerWrapper;

      // If it's empty and has no non-textnode children, hide the header
      const hiddenValue = header.children.length === 0 && header.textContent.replace(/\s*/g, '') === '';

      // Only bother if the hidden status has changed
      if (hiddenValue !== headerWrapper.hidden) {
        headerWrapper.hidden = hiddenValue;
      }

      this.variant = this.variant;
    }
  }

  _handleOpen(event) {
    this._trackEvent('display', 'coral-dialog', event);
  }

  /** @ignore */
  _handleEscape(event) {
    // When escape is pressed, hide ourselves
    if (this.interaction === interaction.ON && this.open && this._isTopOverlay()) {
      event.stopPropagation();
      this.open = false;
    }
  }

  /**
   @ignore
   @todo maybe this should be base or something
   */
  _handleCloseClick(event) {
    const dismissTarget = event.matchedTarget;
    const dismissValue = dismissTarget.getAttribute('coral-close');
    if (!dismissValue || this.matches(dismissValue)) {
      this.open = false;
      event.stopPropagation();

      this._trackEvent('close', 'coral-dialog', event);
    }
  }

  _handleClick(event) {
    // When we're modal, we close when our outer area (over the backdrop) is clicked
    if (event.target === this && this.backdrop === backdrop.MODAL && this._isTopOverlay()) {
      this.open = false;

      this._trackEvent('close', 'coral-dialog', event);
    }
  }

  /** @ignore */
  _moveToDocumentBody() {
    // Not in the DOM
    if (!document.body.contains(this)) {
      document.body.appendChild(this);
    }
    // In the DOM but not a direct child of body
    else if (this.parentNode !== document.body) {
      this._ignoreConnectedCallback = true;
      this._repositioned = true;
      document.body.appendChild(this);
      this._ignoreConnectedCallback = false;
    }
  }

  _insertTypeIcon() {
    if (this._elements.icon) {
      this._elements.icon.remove();
    }

    let variantValue = this.variant;

    // Warning icon is same as ERROR icon
    if (variantValue === variant.WARNING || variantValue === variant.ERROR) {
      variantValue = 'alert';
    }

    // Inject the SVG icon
    if (variantValue !== variant.DEFAULT) {
      const iconName = capitalize(variantValue);
      this._elements.headerWrapper.insertAdjacentHTML('beforeend', Icon._renderSVG(`spectrum-css-icon-${iconName}Medium`, ['_coral-Dialog-typeIcon', `_coral-UIIcon-${iconName}Medium`]));
      this._elements.icon = this._elements.headerWrapper.querySelector('._coral-Dialog-typeIcon');
    }
  }

  /** @ignore */
  backdropClickedCallback() {
    // When we're modal, we close when the backdrop is clicked
    if (this.backdrop === backdrop.MODAL && this._isTopOverlay()) {
      this.open = false;
    }
  }

  /**
   Centers the dialog in the middle of the screen.

   @returns {Dialog} this, chainable.
   */
  center() {
    // We're already centered in fullscreen mode
    if (this.fullscreen) {
      return;
    }

    // If moved we reset the position
    this.style.top = '';
    this.style.left = '';

    return this;
  }

  get _contentZones() {
    return {
      'coral-dialog-header': 'header',
      'coral-dialog-content': 'content',
      'coral-dialog-footer': 'footer'
    };
  }

  /**
   Returns {@link Dialog} variants.

   @return {DialogVariantEnum}
   */
  static get variant() {
    return variant;
  }

  /**
   Returns {@link Dialog} backdrops.

   @return {DialogBackdropEnum}
   */
  static get backdrop() {
    return backdrop;
  }

  /**
   Returns {@link Dialog} close options.

   @return {DialogClosableEnum}
   */
  static get closable() {
    return closable;
  }

  /**
   Returns {@link Dialog} interaction options.

   @return {DialogInteractionEnum}
   */
  static get interaction() {
    return interaction;
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'interaction',
      'backdrop',
      'variant',
      'fullscreen',
      'icon',
      'closable',
      'movable'
    ]);
  }

  /** @ignore */
  connectedCallback() {
    if (this._ignoreConnectedCallback) {
      return;
    }

    super.connectedCallback();
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(`${CLASSNAME}-wrapper`);

    // Default reflected attributes
    if (!this._variant) {
      this.variant = variant.DEFAULT;
    }
    if (!this._backdrop) {
      this.backdrop = backdrop.MODAL;
    }
    if (!this._closable) {
      this.closable = closable.OFF;
    }
    if (!this._interaction) {
      this.interaction = interaction.ON;
    }

    // Fetch the content zones
    const header = this._elements.header;
    const content = this._elements.content;
    const footer = this._elements.footer;

    // Verify if a content zone is provided
    const contentZoneProvided = this.contains(content) && content || this.contains(footer) && footer || this.contains(header) && header;

    // Verify if the internal wrapper exists
    let wrapper = this.querySelector(`.${CLASSNAME}`);

    // Case where the dialog was rendered already - cloneNode support
    if (wrapper) {
      // Remove tab captures
      Array.prototype.filter.call(this.children, (child) => child.hasAttribute('coral-tabcapture')).forEach((tabCapture) => {
        this.removeChild(tabCapture);
      });

      // Assign internal elements
      this._elements.headerWrapper = this.querySelector('._coral-Dialog-header');
      this._elements.closeButton = this.querySelector('._coral-Dialog-closeButton');

      this._elements.wrapper = wrapper;
    }
    // Case where the dialog needs to be rendered
    else {
      // Create default wrapper
      wrapper = this._elements.wrapper;

      // Create default header wrapper
      const headerWrapper = this._elements.headerWrapper;

      // Case where the dialog needs to be rendered and content zones are provided
      if (contentZoneProvided) {
        // Check if user wrapper is provided
        if (contentZoneProvided.parentNode === this) {
          // Content zone target defaults to default wrapper if no user wrapper element is provided
          this._elements.wrapper = wrapper;
        } else {
          // Content zone target defaults to user wrapper element if provided
          this._elements.wrapper = contentZoneProvided.parentNode;
        }

        // Move everything in the wrapper
        while (this.firstChild) {
          wrapper.appendChild(this.firstChild);
        }

        // Add the dialog header before the content
        this._elements.wrapper.insertBefore(headerWrapper, content);
      }
      // Case where the dialog needs to be rendered and content zones need to be created
      else {
        // Default content zone target is wrapper
        this._elements.wrapper = wrapper;

        // Move everything in the "content" content zone
        while (this.firstChild) {
          content.appendChild(this.firstChild);
        }

        // Add the content zones in the wrapper
        wrapper.appendChild(headerWrapper);
        wrapper.appendChild(content);
        wrapper.appendChild(footer);
      }

      // Add the wrapper to the dialog
      this.appendChild(wrapper);
    }

    // Only the wrapper gets the dialog class
    this._elements.wrapper.classList.add(CLASSNAME);
    // Mark the dialog with a public attribute for sizing
    this._elements.wrapper.setAttribute('coral-dialog-size', '');
    // Close button should stay under the dialog
    this._elements.wrapper.appendChild(this._elements.closeButton);

    // Copy styles over to new wrapper
    if (this._elements.wrapper.parentNode !== this) {
      const contentWrapper = this.querySelector('[handle="wrapper"]');
      Array.prototype.forEach.call(contentWrapper.classList, style => this._elements.wrapper.classList.add(style));
      contentWrapper.removeAttribute('class');
    }

    // Assign content zones
    this.header = header;
    this.footer = footer;
    this.content = content;
  }

  /** @ignore */
  disconnectedCallback() {
    if (this._ignoreConnectedCallback) {
      return;
    }

    super.disconnectedCallback();
  }
}

export default Dialog;
