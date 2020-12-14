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
import MultifieldCollection from './MultifieldCollection';
import '../../../coral-component-textfield';
import {commons, i18n} from '../../../coral-utils';

const CLASSNAME = '_coral-Multifield';
const IS_DRAGGING_CLASS = 'is-dragging';
const IS_AFTER_CLASS = 'is-after';
const IS_BEFORE_CLASS = 'is-before';
const TEMPLATE_SUPPORT = 'content' in document.createElement('template');

/**
 @class Coral.Multifield
 @classdesc A Multifield component that enables adding, reordering, and removing multiple instances of a component.
 Multifield partially supports the <code>template</code> element in IE 11. If adding/removing items in the template
 is required, <code>template.content</code> should be used.
 Child elements can be given a special attribute to enable functionality:
 - <code>[coral-multifield-add]</code>. Click to add an item.
 @htmltag coral-multifield
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Multifield extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    this.setAttribute('id', this.id || commons.getUID());

    // Attach events
    const events = {
      'coral-dragaction:dragstart coral-multifield-item': '_onDragStart',
      'coral-dragaction:drag coral-multifield-item': '_onDrag',
      'coral-dragaction:dragend coral-multifield-item': '_onDragEnd',

      'click [coral-multifield-add]': '_onAddItemClick',
      'click ._coral-Multifield-remove': '_onRemoveItemClick',
      'click [coral-multifield-move]': '_onClickDragHandle',
      'key:up [coral-multifield-move]': '_onMoveItemUp',
      'key:pageup [coral-multifield-move]': '_onMoveItemUp',
      'key:down [coral-multifield-move]': '_onMoveItemDown',
      'key:pagedown [coral-multifield-move]': '_onMoveItemDown',
      'key:home [coral-multifield-move]': '_onMoveItemHome',
      'key:end [coral-multifield-move]': '_onMoveItemEnd',
      'key:esc [coral-multifield-move]': '_onMoveItemEsc',
      'capture:blur [coral-multifield-move]': '_onBlurDragHandle',
      'change coral-multifield-item-content > input': '_onInputChange'
    };

    events[`global:key:escape #${this.id} > [coral-multifield-move]`] = '_onMoveItemEsc';

    this._delegateEvents(events);

    // Templates
    this._elements = {
      template: this.querySelector(`#${this.id} > template[coral-multifield-template]`) || document.createElement('template')
    };
    this._elements.template.setAttribute('coral-multifield-template', '');

    // In case <template> is not supported
    this._handleTemplateSupport(this._elements.template);

    // Template support: move nodes added to the <template> to its content fragment
    this._observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (let i = 0 ; i < mutation.addedNodes.length ; i++) {
          const addedNode = mutation.addedNodes[i];
          const template = this.template;

          if (template.contains(addedNode) && template !== addedNode) {
            // Move the node to the template content
            template.content.appendChild(addedNode);
            // Update all items content with the template content
            this.items.getAll().forEach((item) => {
              this._renderTemplate(item);
            });
            this._updatePosInSet();
          }
        }
      });
    });

    // Watch for changes to the template element
    this._observer.observe(this, {
      childList: true,
      subtree: true
    });

    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }

  /**
   The Collection Interface that allows interacting with the Coral.Multifield items that the component contains.

   @type {MultifieldCollection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new MultifieldCollection({
        host: this,
        itemTagName: 'coral-multifield-item',
        // allows multifields to be nested
        itemSelector: ':scope > coral-multifield-item',
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved
      });
    }
    return this._items;
  }

  /**
   The Multifield template element. It will be used to render a new item once the element with the attribute
   <code>coral-multifield-add</code> is clicked. It supports the <code>template</code> tag. While specifying the
   template from markup, it should include the <code>coral-multifield-template</code> attribute.
   NOTE: On IE11, only <code>template.content</code> is supported to add/remove elements to the template.

   @type {HTMLElement}
   @contentzone
   */
  get template() {
    return this._getContentZone(this._elements.template);
  }

  set template(value) {
    this._setContentZone('template', value, {
      handle: 'template',
      tagName: 'template',
      insert: function (template) {
        this.appendChild(template);
      },
      set: function (content) {
        // Additionally add support for template
        this._handleTemplateSupport(content);
      }
    });
  }

  /** @ignore */
  _handleTemplateSupport(template) {
    // @polyfill IE
    if (!TEMPLATE_SUPPORT && !template.content) {
      const frag = document.createDocumentFragment();
      while (template.firstChild) {
        frag.appendChild(template.firstChild);
      }
      template.content = frag;
    }
  }

  /** @ignore */
  _onAddItemClick(event) {
    if (event.matchedTarget.closest('coral-multifield') === this) {
      this.items.add(document.createElement('coral-multifield-item'));

      // Wait for MO to render item template
      window.requestAnimationFrame(() => {
        this.trigger('change');

        this._trackEvent('click', 'add item button', event);
      });
    }
  }

  /** @ignore */
  _onRemoveItemClick(event) {
    if (event.matchedTarget.closest('coral-multifield') === this) {
      const item = event.matchedTarget.closest('coral-multifield-item');
      if (item) {
        // manage focus when item is removed
        let itemToFocus;
        const items = this.items.getAll();
        const setsize = items.length;
        if (setsize > 1) {
          const itemIndex = items.indexOf(item);
          if (itemIndex === setsize - 1) {
            itemToFocus = items[itemIndex - 1];
          } else {
            itemToFocus = items[itemIndex + 1];
          }
        }
        item.remove();
        if (itemToFocus) {
          itemToFocus._elements.remove.focus();
        } else {
          itemToFocus = this.querySelector('[coral-multifield-add]');
          if (itemToFocus) {
            itemToFocus.focus();
          }
        }
      }

      this.trigger('change');

      this._trackEvent('click', 'remove item button', event);
    }
  }

  /**
   * Toggles keyboard accessible dragging of the current multifield item.
   * @ignore
   */
  _toggleItemDragging(multiFieldItem, dragging = false) {
    if (multiFieldItem._dragging === dragging) {
      return;
    }
    multiFieldItem._dragging = dragging;
    if (dragging) {
      this._oldBefore = multiFieldItem.previousElementSibling;
      this._before = multiFieldItem.nextElementSibling;
    } else {
      this.trigger('coral-multifield:beforeitemorder', {
        item: multiFieldItem,
        oldBefore: this._oldBefore,
        before: this._before
      });
      this.trigger('coral-multifield:itemorder', {
        item: multiFieldItem,
        oldBefore: this._oldBefore,
        before: multiFieldItem.nextElementSibling
      });
      this.trigger('change');
      this._oldBefore = null;
      this._before = null;
    }
  }

  /**
   * Clicking dragHandle toggles keyboard accessible dragging of the current multifield item.
   * @ignore
   */
  _onClickDragHandle(event) {
    event.preventDefault();
    event.stopPropagation();
    const multiFieldItem = event.matchedTarget.closest('coral-multifield-item');
    this._toggleItemDragging(multiFieldItem, !multiFieldItem._dragging);
  }

  /**
   * When the drag handle blurs, cancel dragging, leaving item where it is.
   * @ignore
   */
  _onBlurDragHandle(event) {
    const dragHandle = event.matchedTarget;
    const multiFieldItem = dragHandle.closest('coral-multifield-item');
    commons.nextFrame(() => {
      if (document.activeElement !== dragHandle) {
        this._toggleItemDragging(multiFieldItem, false);
      }
    });
  }

  /**
   * Moves multiField item selected for dragging up one index position in the multifield collection.
   * @ignore
   */
  _onMoveItemUp(event) {
    const dragHandle = event.matchedTarget;
    const dragElement = dragHandle.closest('coral-multifield-item');
    if (!dragElement._dragging) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const items = this.items.getAll();
    const dragElementIndex = items.indexOf(dragElement);
    if (dragElementIndex > 0) {
      this.insertBefore(dragElement, dragElement.previousElementSibling);
    }
    dragElement._dragging = true;
    dragHandle.focus();
  }

  /**
   * Moves multiField item selected for dragging down one index position in the multifield collection.
   * @ignore
   */
  _onMoveItemDown(event) {
    const dragHandle = event.matchedTarget;
    const dragElement = dragHandle.closest('coral-multifield-item');
    if (!dragElement._dragging) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const items = this.items.getAll();
    const dragElementIndex = items.indexOf(dragElement);
    if (dragElementIndex < items.length - 1) {
      const nextElement = dragElement.nextElementSibling;
      this.insertBefore(dragElement, nextElement.nextElementSibling);
    }
    dragElement._dragging = true;
    dragHandle.focus();
  }

  /**
   * Moves multiField item selected for dragging to start of multifield collection.
   * @ignore
   */
  _onMoveItemHome(event) {
    const dragHandle = event.matchedTarget;
    let dragElement = dragHandle.closest('coral-multifield-item');
    if (!dragElement._dragging) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const items = this.items.getAll();
    const dragElementIndex = items.indexOf(dragElement);
    if (dragElementIndex > 0) {
      this.insertBefore(dragElement, this.items.first());
    }
    dragElement._dragging = true;
    dragHandle.focus();
  }

  /**
   * Moves multiField item selected for dragging to end of multifield collection.
   * @ignore
   */
  _onMoveItemEnd(event) {
    const dragHandle = event.matchedTarget;
    let dragElement = dragHandle.closest('coral-multifield-item');
    if (!dragElement._dragging) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    const items = this.items.getAll();
    const dragElementIndex = items.indexOf(dragElement);
    if (dragElementIndex < items.length - 1) {
      this.insertBefore(dragElement, this.items.last().nextElementSibling);
    }
    dragElement._dragging = true;
    dragHandle.focus();
  }

  /**
   * Cancels keyboard drag and drop operation, restoring item to its previous location.
   * @ignore
   */
  _onMoveItemEsc(event) {
    const dragHandle = event.matchedTarget;
    const multiFieldItem = dragHandle.closest('coral-multifield-item');
    if (multiFieldItem._dragging && this._oldBefore && this._before) {
      event.stopPropagation();
      this.insertBefore(multiFieldItem, this._before);
      dragHandle.focus();
    }
    this._toggleItemDragging(multiFieldItem, false);
  }

  _onInputChange(event) {
    this._trackEvent('change', 'input', event);
  }

  /** @ignore */
  _onDragStart(event) {
    if (event.target.closest('coral-multifield') === this) {
      document.body.classList.add('u-coral-closedHand');

      const dragElement = event.detail.dragElement;
      const items = this.items.getAll();
      const dragElementIndex = items.indexOf(dragElement);

      // Toggle dragging state on multifield item.
      dragElement._dragging = true;
      dragElement.classList.add(IS_DRAGGING_CLASS);
      items.forEach((item, i) => {
        if (i < dragElementIndex) {
          item.classList.add(IS_BEFORE_CLASS);
        } else if (i > dragElementIndex) {
          item.classList.add(IS_AFTER_CLASS);
        }
      });
    }
  }

  /** @ignore */
  _onDrag(event) {
    if (event.target.closest('coral-multifield') === this) {
      const items = this.items.getAll();
      let marginBottom = 0;

      if (items.length) {
        marginBottom = parseFloat(window.getComputedStyle(items[0]).marginBottom);
      }

      items.forEach((item) => {
        if (!item.classList.contains(IS_DRAGGING_CLASS)) {
          const dragElement = event.detail.dragElement;
          const dragElementBoundingClientRect = dragElement.getBoundingClientRect();
          const itemBoundingClientRect = item.getBoundingClientRect();
          const dragElementOffsetTop = dragElementBoundingClientRect.top;
          const itemOffsetTop = itemBoundingClientRect.top;

          const isAfter = dragElementOffsetTop < itemOffsetTop;
          const itemReorderedTop = `${dragElementBoundingClientRect.height + marginBottom}px`;

          item.classList.toggle(IS_AFTER_CLASS, isAfter);
          item.classList.toggle(IS_BEFORE_CLASS, !isAfter);

          if (item.classList.contains(IS_AFTER_CLASS)) {
            item.style.top = items.indexOf(item) < items.indexOf(dragElement) ? itemReorderedTop : '';
          }

          if (item.classList.contains(IS_BEFORE_CLASS)) {
            const afterDragElement = items.indexOf(item) > items.indexOf(dragElement);
            item.style.top = afterDragElement ? `-${itemReorderedTop}` : '';
          }
        }
      });
    }
  }

  /** @ignore */
  _onDragEnd(event) {
    if (event.target.closest('coral-multifield') === this) {
      document.body.classList.remove('u-coral-closedHand');

      const dragElement = event.detail.dragElement;
      const items = this.items.getAll();
      const beforeArr = [];
      const afterArr = [];

      items.forEach((item) => {
        if (item.classList.contains(IS_AFTER_CLASS)) {
          afterArr.push(item);
        } else if (item.classList.contains(IS_BEFORE_CLASS)) {
          beforeArr.push(item);
        }

        item.classList.remove(IS_DRAGGING_CLASS, IS_AFTER_CLASS, IS_BEFORE_CLASS);
        item.style.top = '';
        item.style.position = '';
      });

      const oldBefore = dragElement.previousElementSibling;
      const before = afterArr.shift();
      const after = beforeArr.pop();
      const beforeEvent = this.trigger('coral-multifield:beforeitemorder', {
        item: dragElement,
        oldBefore: oldBefore,
        before: before
      });

      if (!beforeEvent.defaultPrevented) {
        if (before) {
          this.insertBefore(dragElement, before);
        }
        if (after) {
          this.insertBefore(dragElement, after.nextElementSibling);
        }

        // Toggle dragging state on multifield item.
        dragElement._dragging = false;

        this.trigger('coral-multifield:itemorder', {
          item: dragElement,
          oldBefore: oldBefore,
          before: before
        });

        this.trigger('change');

        dragElement._elements.move.focus();
      }
    }
  }

  /** @private */
  _onItemAdded(item) {
    // Update the item content with the template content
    if (item.parentNode === this) {
      this._renderTemplate(item);
      this._updatePosInSet();
    }
  }

  _onItemRemoved() {
    this._updatePosInSet();
  }

  /**
   * update aria-posinset and aria-setsize for each item in the collection
   * @private
   */
  _updatePosInSet() {
    const items = this.items.getAll();
    const setsize = items.length;
    items.forEach((item, i) => {
      item.setAttribute('aria-posinset', i + 1);
      item.setAttribute('aria-setsize', setsize);
      item.setAttribute('aria-label', i18n.get('({0} of {1})', i + 1, setsize));
      // so long as item content is not another multifield,
      // add aria-labelledby so that the item is labelled by its content and itself.
      if (!item.querySelector('coral-multifield')) {
        item.setAttribute('aria-labelledby', `${item.id}-content ${item.id}`);
      }
    });
  }

  /** @private */
  _renderTemplate(item) {
    const content = item.content || item.querySelector('coral-multifield-item-content') || item;

    // Insert the template if item content is empty
    if (!content.firstChild) {
      // @polyfill IE
      if (!TEMPLATE_SUPPORT) {
        // Before cloning, put the nested templates content back in the DOM
        const nestedTemplates = this.template.content.querySelectorAll('template[coral-multifield-template]');

        Array.prototype.forEach.call(nestedTemplates, (template) => {
          while (template.content.firstChild) {
            template.appendChild(template.content.firstChild);
          }
        });
      }

      // Clone the template and append it to the item content
      content.appendChild(document.importNode(this.template.content, true));
    }
  }

  get _contentZones() {
    return {template: 'template'};
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME, 'coral-Well');

    // a11y
    this.setAttribute('role', 'list');

    // Assign the content zones, moving them into place in the process
    this.template = this._elements.template;

    // Prepare items content based on the given template
    this.items.getAll().forEach((item) => {
      this._renderTemplate(item);
    });

    // update aria-posinset and aria-setsize for each item in the collection
    this._updatePosInSet();
  }

  /**
   Triggered when the {@link Multifield} item are reordered.

   @typedef {CustomEvent} coral-multifield:beforeitemorder

   @property {MultifieldItem} detail.item
   The item to be ordered.
   @property {MultifieldItem} detail.oldBefore
   Ordered item next sibling before the swap. If <code>null</code>, the item was the last item.
   @property {MultifieldItem} detail.before
   Ordered item will be inserted before this sibling item. If <code>null</code>, the item is inserted at the end.
   */

  /**
   Triggered when the {@link Multifield} item are reordered.

   @typedef {CustomEvent} coral-multifield:itemorder

   @property {MultifieldItem} detail.item
   The ordered item.
   @property {MultifieldItem} detail.oldBefore
   Ordered item next sibling before the swap. If <code>null</code>, the item was the last item.
   @property {MultifieldItem} detail.before
   Ordered item was inserted before this sibling item. If <code>null</code>, the item was inserted at the end.
   */
}

export default Multifield;
