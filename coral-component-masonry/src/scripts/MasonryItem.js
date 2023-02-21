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
import {DragAction} from '../../../coral-dragaction';
import '../../../coral-component-checkbox';
import quickactions from '../templates/quickactions';
import {transform, commons, validate, i18n} from '../../../coral-utils';
import MasonryItemAccessibilityState from './MasonryItemAccessibilityState';
import {Messenger} from '../../../coral-messenger';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-Masonry-item';

/** @ignore */
const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(window.navigator.platform);

/**
 @class Coral.Masonry.Item
 @classdesc A Masonry Item component
 @htmltag coral-masonry-item
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
const MasonryItem = Decorator(class extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // messenger
    this._messenger = new Messenger(this);

    // Represents ownership (necessary when the item is moved which triggers callbacks)
    this._masonry = null;

    // Default value
    this._dragAction = null;

    // Template
    this._elements = {};

    quickactions.call(this._elements);
  }

  // @compat
  get content() {
    return this;
  }

  set content(value) {
    // Support configs
    if (typeof value === 'object') {
      for (const prop in value) {
        /** @ignore */
        this[prop] = value[prop];
      }
    }
  }

  /**
   Specify while disconnecting the item, should it show transition or not.
   This is useful when replacing large items, this result in delay.

   @type {Boolean}
   @default true
   @private No need to update in public document.
   */
  get showRemoveTransition() {
    return !(this._showRemoveTransition === false);
  }

  set showRemoveTransition(value) {
    this._showRemoveTransition = transform.boolean(value);
  }


  /**
   Specify whether the item is in removing state or not.
   @type {Boolean}
   */
  get removing() {
    return this.hasAttribute('_removing');
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

    if(validate.valueMustChange(this._selected, value)) {
      this._selected = value;
      this._reflectAttribute('selected', value);
      this.trigger('coral-masonry-item:_selecteditemchanged');

      this.setAttribute('aria-selected', value);
      this.classList.toggle('is-selected', value);

      this._elements.check[value ? 'setAttribute' : 'removeAttribute']('checked', '');

      this._messenger.postMessage('coral-masonry-item:_selectedchanged');
    }
  }

  /**
   Animates the insertion of the item.

   @private
   */
  _insert() {
    if (this.classList.contains('is-beforeInserting')) {
      this.classList.remove('is-beforeInserting');
      this.classList.add('is-inserting');

      commons.transitionEnd(this, () => {
        this.classList.remove('is-inserting');
      });
    }
  }

  /** @private */
  _setTabbable(tabbable) {
    this.setAttribute('tabindex', tabbable ? 0 : -1);
  }

  /** @private */
  _updateDragAction(enabled) {
    let handle;
    if (enabled) {
      // Find handle
      if (this.getAttribute('coral-masonry-draghandle') !== null) {
        handle = this;
      } else {
        handle = this.querySelector('[coral-masonry-draghandle]');
        if (!handle) {
          // Disable drag&drop if handle wasn't found
          enabled = false;
        }
      }
    }

    if (enabled) {
      if (!this._dragAction) {
        this._dragAction = new DragAction(this);
        this._dragAction.dropZone = this.parentNode;
      }
      this._dragAction.handle = handle;
    } else if (this._dragAction) {
      this._dragAction.destroy();
      this._dragAction = null;
    }
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', '_removing', '_orderable']);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_removing') {
      // Do it in the next frame so that the removing animation is visible
      window.requestAnimationFrame(() => {
        this.classList.toggle('is-removing', value !== null);
      });
    } else if (name === '_orderable') {
      this._updateDragAction(value !== null);
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  /** @ignore */
  _suspendCallback() {
    super._suspendCallback();
    this._messenger.disconnect();
  }

  /** @ignore */
  _resumeCallback() {
    this._messenger.connect();
    super._resumeCallback();
    // In case an already connected element is switched to new parent,
    // we would be ignoring the connected callback,
    // as the item will be connected to new parent, the new parent should be informed immediately
    this._messenger.postMessage('coral-masonry-item:_connected');
  }

  /** @ignore */
  connectedCallback() {
    this._messenger.connect();
    super.connectedCallback();

    // Inform masonry immediately
    this._messenger.postMessage('coral-masonry-item:_connected');
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // @a11y
    this.setAttribute('tabindex', '-1');

    // @a11y Add live region element to ensure announcement of selected state
    const accessibilityState = this._elements.accessibilityState || this.querySelector('coral-masonry-item-accessibilitystate') || new MasonryItemAccessibilityState();

    // @a11y Style to be visually hidden yet accessible to screen readers
    if (!accessibilityState.classList.contains('u-coral-screenReaderOnly')) {
      accessibilityState.classList.add('u-coral-screenReaderOnly');
    }

    // @a11y accessibility state string should announce in document lang, rather than item lang.
    accessibilityState.setAttribute('lang', i18n.locale);

    // @a11y accessibility state has role="status" to announce as a live region
    accessibilityState.setAttribute('role', 'status');
    accessibilityState.setAttribute('aria-live', 'off');
    accessibilityState.hidden = true;

    accessibilityState.id = accessibilityState.id || commons.getUID();

    // @a11y Wait a frame and append live region content element so that it is the last child within item.
    // wait for next macrotask to avoid appending the accessibility state element before quickactions.
    setTimeout(() => {
      if (!accessibilityState.parentNode) {
        this.appendChild(accessibilityState);
      }

      // @a11y Item should be labelled by accessibility state.
      if (isMacLike) {
        const ariaLabelledby = this.getAttribute('aria-labelledby');
        if (ariaLabelledby) {
          this.setAttribute('aria-labelledby', ariaLabelledby + ' ' + accessibilityState.id);
        }
      }
    });

    this._elements.accessibilityState = accessibilityState;

    // Support cloneNode
    const template = this.querySelector('._coral-Masonry-item-quickActions');
    if (template) {
      template.remove();
    }
    this.insertBefore(this._elements.quickactions, this.firstChild);
    // todo workaround to not give user possibility to tab into checkbox
    this._elements.check._labellableElement.tabIndex = -1;
    this._elements.check.setAttribute('aria-hidden', 'true');
  }

  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
    // disconnect messenger before calling masonry._onItemDisconnected
    this._messenger.disconnect();

    // Handle it in masonry immediately
    const masonry = this._masonry;
    if (masonry) {
      masonry._onItemDisconnected(this);
    }
  }
});

export default MasonryItem;
