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
import {transform, commons, validate} from '../../../coral-utils';
import {Messenger} from '../../../coral-messenger';
import {Decorator} from '../../../coral-decorator';

const CLASSNAME = '_coral-Masonry-item';

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
    const self = this;

    self._messenger = new Messenger(self);

    // Represents ownership (necessary when the item is moved which triggers callbacks)
    self._masonry = null;

    // Default value
    self._dragAction = null;

    // Template
    self._elements = {};

    quickactions.call(self._elements);
  }

  get removing() {
    return item.hasAttribute('_removing');
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
    this._showRemoveTransition = transform.booleanAttr(value);
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
    const self = this;
    value = transform.booleanAttr(value);

    if(validate.valueMustChange(self._selected, value)) {
      self._selected = value;
      self._reflectAttribute('selected', value);

      self.setAttribute('aria-selected', value);
      self.classList.toggle('is-selected', value);

      self._elements.check[value ? 'setAttribute' : 'removeAttribute']('checked', '');

      self._messenger.postMessage('coral-masonry-item:_selectedchanged');
    }
  }

  /**
   Animates the insertion of the item.

   @private
   */
  _insert() {
    const self = this;
    let classList = self.classList;

    if (classList.contains('is-beforeInserting')) {
      classList.remove('is-beforeInserting');
      classList.add('is-inserting');

      commons.transitionEnd(this, () => {
        classList.remove('is-inserting');
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
    const self = this;

    if (enabled) {
      // Find handle
      if (self.getAttribute('coral-masonry-draghandle') !== null) {
        handle = self;
      } else {
        handle = self.querySelector('[coral-masonry-draghandle]');
        if (!handle) {
          // Disable drag&drop if handle wasn't found
          enabled = false;
        }
      }
    }

    if (enabled) {
      if (!self._dragAction) {
        self._dragAction = new DragAction(self);
        self._dragAction.dropZone = self.parentNode;
      }
      self._dragAction.handle = handle;
    } else if (self._dragAction) {
      self._dragAction.destroy();
      self._dragAction = null;
    }
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', '_removing', '_orderable']);
  }

  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    const self = this;
    if (name === '_removing') {
      // Do it in the next frame so that the removing animation is visible
      window.requestAnimationFrame(() => {
        self.classList.toggle('is-removing', value !== null);
      });
    } else if (name === '_orderable') {
      self._updateDragAction(value !== null);
    } else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }

  /** @ignore */
  connectedCallback() {
    const messenger = this._messenger;

    messenger.connect();

    super.connectedCallback();

    // Inform masonry immediately
    messenger.postMessage('coral-masonry-item:_connected');
  }

  /** @ignore */
  render() {
    super.render();
    const self = this;

    self.classList.add(CLASSNAME);

    // @a11y
    self.setAttribute('tabindex', '-1');

    // Support cloneNode
    const template = self.querySelector('._coral-Masonry-item-quickActions');
    if (template) {
      template.remove();
    }
    self.insertBefore(self._elements.quickactions, self.firstChild);
    // todo workaround to not give user possibility to tab into checkbox
    self._elements.check._labellableElement.tabIndex = -1;
  }

  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();

    const self = this;

    self._messenger.disconnect();

    // Handle it in masonry immediately
    const masonry = self._masonry;
    if (masonry) {
      masonry._onItemDisconnected(self);
    }
  }
});

export default MasonryItem;
