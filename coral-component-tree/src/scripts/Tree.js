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
import {SelectableCollection} from '../../../coral-collection';
import TreeItem from './TreeItem';
import {transform} from '../../../coral-utils';

const CLASSNAME = '_coral-TreeView';

/**
 @class Coral.Tree
 @classdesc A Tree component is a container component to display collapsible content.
 Tree items don't expand by default. It's the developer's responsibility to handle it by listening to the
 {@link coral-collection:add} and {@link coral-collection:remove} events.
 @htmltag coral-tree
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class Tree extends BaseComponent(HTMLElement) {
  /** @ignore */
  constructor() {
    super();

    // Attach events
    this._delegateEvents({
      'click ._coral-TreeView-itemLink': '_onItemClick',
      'click ._coral-TreeView-indicator': '_onExpandCollapseClick',
      'coral-collection:add coral-tree-item': '_onCollectionChange',
      'coral-collection:remove coral-tree-item': '_onCollectionChange',
      // a11y
      'key:space ._coral-TreeView-itemLink': '_onItemClick',
      'key:space ._coral-TreeView-indicator': '_onExpandCollapseClick',
      'key:return ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onExpandCollapseClick',
      'key:pageup ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onFocusPreviousItem',
      'key:left ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onCollapseItem',
      'key:up ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onFocusPreviousItem',
      'key:pagedown ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onFocusNextItem',
      'key:right ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onExpandItem',
      'key:down ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onFocusNextItem',
      'key:home ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onFocusFirstItem',
      'key:end ._coral-TreeView-itemLink, ._coral-TreeView-indicator': '_onFocusLastItem',
      'capture:blur ._coral-TreeView-itemLink[tabindex="0"]': '_onItemBlur',
      // private
      'coral-tree-item:_selectedchanged': '_onItemSelectedChanged',
      'coral-tree-item:_disabledchanged': '_onFocusableChanged',
      'coral-tree-item:_expandedchanged': '_onFocusableChanged',
      'coral-tree-item:_afterexpandedchanged': '_onExpandedChanged',
      'coral-tree-item:_hiddenchanged': '_onFocusableChanged'
    });

    // Used for eventing
    this._oldSelection = [];

    // Init the collection mutation observer
    this.items._startHandlingItems(true);

    // Listen for mutations for Torq compatibility
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (let i = 0 ; i < mutation.addedNodes.length ; i++) {
          const addedNode = mutation.addedNodes[i];
          if (addedNode.tagName === 'CORAL-TREE-ITEM') {
            // Move tree items to their container
            if (addedNode.parentNode.tagName === addedNode.tagName) {
              addedNode.parentNode._elements.subTreeContainer.appendChild(addedNode);
            }
          }
        }
      });
    });

    observer.observe(this, {
      childList: true,
      subtree: true
    });
  }

  /**
   The Collection Interface that allows interacting with the items that the component contains.

   @type {SelectableCollection}
   @readonly
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new SelectableCollection({
        host: this,
        itemTagName: 'coral-tree-item'
      });
    }
    return this._items;
  }

  /**
   Indicates whether the tree accepts multiple selected items.
   @type {Boolean}
   @default false
   @htmlattribute multiple
   @htmlattributereflected
   */
  get multiple() {
    return this._multiple || false;
  }

  set multiple(value) {
    this._multiple = transform.booleanAttr(value);
    this._reflectAttribute('multiple', this._multiple);

    this.setAttribute('aria-multiselectable', this._multiple);

    this._validateSelection();
  }

  /**
   Returns an Array containing the set selected items.
   @type {Array.<HTMLElement>}
   @readonly
   */
  get selectedItems() {
    return this.items._getAllSelected();
  }

  /**
   Returns the first selected item in the Tree. The value <code>null</code> is returned if no element is
   selected.
   @type {?HTMLElement}
   @readonly
   */
  get selectedItem() {
    return this.items._getAllSelected()[0] || null;
  }

  /** @private */
  _onItemSelectedChanged(event) {
    event.stopImmediatePropagation();

    this._validateSelection(event.target);
  }

  /** @private */
  _validateSelection(item) {
    const selectedItems = this.selectedItems;

    if (!this.multiple) {
      // Last selected item wins if multiple selection while not allowed
      item = item || selectedItems[selectedItems.length - 1];

      if (item && item.hasAttribute('selected') && selectedItems.length > 1) {
        selectedItems.forEach((selectedItem) => {
          if (selectedItem !== item) {
            // Don't trigger change events
            this._preventTriggeringEvents = true;
            selectedItem.removeAttribute('selected');
          }
        });

        // We can trigger change events again
        this._preventTriggeringEvents = false;
      }
    }

    this._triggerChangeEvent();
  }

  /** @private */
  _triggerChangeEvent() {
    const selectedItems = this.selectedItems;
    const oldSelection = this._oldSelection;

    if (!this._preventTriggeringEvents && this._arraysAreDifferent(selectedItems, oldSelection)) {
      // We differentiate whether multiple is on or off and return an array or HTMLElement respectively
      if (this.multiple) {
        this.trigger('coral-tree:change', {
          oldSelection: oldSelection,
          selection: selectedItems
        });
      } else {
        // Return all items if we just switched from multiple=true to multiple=false and we had >1 selected items
        this.trigger('coral-tree:change', {
          oldSelection: oldSelection.length > 1 ? oldSelection : oldSelection[0] || null,
          selection: selectedItems[0] || null
        });
      }

      this._oldSelection = selectedItems;
    }
  }

  /** @private */
  _arraysAreDifferent(selection, oldSelection) {
    let diff = [];

    if (oldSelection.length === selection.length) {
      diff = oldSelection.filter((item) => selection.indexOf(item) === -1);
    }

    // since we guarantee that they are arrays, we can start by comparing their size
    return oldSelection.length !== selection.length || diff.length !== 0;
  }

  /** @private */
  _toggleItemAttribute(item, attributeName) {
    if (item) {
      item[item.hasAttribute(attributeName) ? 'removeAttribute' : 'setAttribute'](attributeName, '');
    }
  }

  /** @private */
  _onCollectionChange(event) {
    // Prevent triggering collection event twice. Only coral-tree collection events are propagated.
    event.stopImmediatePropagation();
  }

  /** @private */
  _onItemClick(event) {
    // Clickable item inside Tree Item should not trigger selection of item
    if (event.target.hasAttribute('coral-interactive') || event.target.closest('[coral-interactive]')) {
      return;
    }

    // If the indicator is clicked, expand/collapse the tree item
    if (event.target.closest('._coral-TreeView-indicator')) {
      this._onExpandCollapseClick(event);
      return;
    }

    // The click was performed on the header so we select the item (parentNode) the selection is toggled
    const item = event.target.closest('coral-tree-item');
    if (item && !item.hasAttribute('disabled')) {
      event.preventDefault();
      event.stopPropagation();

      // We ignore the selection if the item is disabled
      this._toggleItemAttribute(item, 'selected');
      const focusable = this._getFocusable();
      if (focusable) {
        focusable.setAttribute('tabindex', '-1');
      }
      item._elements.header.setAttribute('tabindex', '0');
      item._elements.header.focus();
    }
  }

  /** @private */
  _onExpandCollapseClick(event) {
    event.preventDefault();
    event.stopPropagation();

    // The click was performed on the icon to expand/collapse  the sub tree
    const item = event.target.closest('coral-tree-item');
    if (item) {
      // We ignore the expand/collapse if the item is disabled
      if (item.hasAttribute('disabled')) {
        return;
      }

      // Toggle the expanded of the item:
      this._toggleItemAttribute(item, 'expanded');
    }
  }

  /** @private */
  _onExpandItem(event) {
    event.preventDefault();
    event.stopPropagation();

    // The click was performed on the icon to expand the sub tree
    const item = event.target.closest('coral-tree-item');
    if (item) {
      // We ignore the expand if the item is disabled
      if (item.hasAttribute('disabled')) {
        return;
      }

      if (!item.expanded && item.variant === TreeItem.variant.DRILLDOWN) {
        // If the item is not expanded, expand the item
        item.expanded = !item.expanded;
        item._elements.header.classList.add('focus-ring');
      } else if (item.items.length > 0) {
        // If the item is expanded, and contains items, focus the next item
        this._onFocusNextItem(event);
      }
    }
  }

  /** @private */
  _onCollapseItem(event) {
    event.preventDefault();
    event.stopPropagation();

    // The click was performed on the icon to collapse the sub tree
    const item = event.target.closest('coral-tree-item');
    if (item) {
      // We ignore the expand if the item is disabled
      if (item.hasAttribute('disabled')) {
        return;
      }

      if (item.expanded && item.variant === TreeItem.variant.DRILLDOWN) {
        // If the item is not expanded, expand the item
        item.expanded = !item.expanded;
        item._elements.header.classList.add('focus-ring');
      } else if (item.parent) {
        item._elements.header.setAttribute('tabindex', '-1');
        item._elements.header.classList.remove('focus-ring');
        item.parent.focus();
        item.parent._elements.header.classList.add('focus-ring');
      }
    }
  }

  /** @private */
  _focusSiblingItem(item, next) {
    const focusableItems = this._getFocusableItems();

    // There's not enough items to change focus
    if (focusableItems.length < 2) {
      return;
    }

    let index = focusableItems.indexOf(item) + (next ? 1 : -1);
    let siblingItem = null;

    // If we reached the edge, target the other edge
    if (index > focusableItems.length - 1) {
      siblingItem = focusableItems[0];
    } else if (index < 0) {
      siblingItem = focusableItems[focusableItems.length - 1];
    }

    // Find the sibling item
    while (!siblingItem) {
      siblingItem = focusableItems[index];
      // The item might be hidden because a parent is collapsed
      if (siblingItem.parentNode.closest('coral-tree-item.is-collapsed')) {
        if (next) {
          index++;
          siblingItem = index > focusableItems.length - 1 ? item : null;
        } else {
          index--;
          siblingItem = index < 0 ? item : null;
        }
      }
    }

    // Change focus
    if (siblingItem !== item) {
      item._elements.header.setAttribute('tabindex', '-1');
      item._elements.header.classList.remove('focus-ring');

      siblingItem._elements.header.setAttribute('tabindex', '0');
      siblingItem._elements.header.classList.add('focus-ring');
      siblingItem._elements.header.focus();
    }
  }

  /** @private */
  _focusEdgeItem(last) {
    // Query the focusable item
    const focusable = this._getFocusable();
    if (focusable) {
      const focusableItems = this._getFocusableItems();
      const edgeItem = focusableItems[last ? focusableItems.length - 1 : 0];

      // Change focus
      if (edgeItem !== focusable) {
        focusable.setAttribute('tabindex', '-1');
        edgeItem._elements.header.setAttribute('tabindex', '0');
        edgeItem._elements.header.focus();
      }
    }
  }

  /** @private */
  _onFocusNextItem(event) {
    event.preventDefault();
    event.stopPropagation();

    const item = event.target.closest('coral-tree-item');
    if (item) {
      this._focusSiblingItem(item, true);
    }
  }

  /** @private */
  _onFocusPreviousItem(event) {
    event.preventDefault();
    event.stopPropagation();

    const item = event.target.closest('coral-tree-item');
    if (item) {
      this._focusSiblingItem(item, false);
    }
  }

  /** @private */
  _onFocusFirstItem(event) {
    event.preventDefault();
    event.stopPropagation();

    this._focusEdgeItem(false);
  }

  /** @private */
  _onFocusLastItem(event) {
    event.preventDefault();
    event.stopPropagation();

    this._focusEdgeItem(true);
  }

  /** @private */
  _onFocusableChanged(event) {
    event.preventDefault();
    event.stopPropagation();

    if (event.target.contains(this._getFocusable())) {
      this._resetFocusableItem();
    }
  }


  /** @private */
  _onExpandedChanged(event) {
    event.stopImmediatePropagation();

    const item = event.target;
    this.trigger(`coral-tree:${item.expanded ? 'expand' : 'collapse'}`, {item});
  }

  /** @private */
  _getFocusable() {
    return this.querySelector('coral-tree-item > ._coral-TreeView-itemLink[tabindex="0"]');
  }

  /** @private */
  _getFocusableItems() {
    return this.items.getAll().filter((item) => !item.closest('coral-tree-item[disabled]') && !item.closest('coral-tree-item[hidden]'));
  }

  /** @private */
  _onItemBlur() {
    const focused = this.querySelector('._coral-TreeView-itemLink.focus-ring');
    if (focused) {
      focused.classList.remove('focus-ring');
    }
  }

  /** @private */
  _resetFocusableItem(item) {
    // Old focusable becomes unfocusable
    const focusable = this._getFocusable();
    if (focusable) {
      focusable.setAttribute('tabindex', '-1');
      focusable.classList.remove('focus-ring');
    }

    // Defined item or first item by default gets the focus
    item = item || this._getFocusableItems()[0];
    if (item) {
      item._elements.header.setAttribute('tabindex', '0');
    }
  }

  /** @private */
  _expandCollapseAll(expand) {
    const coralTreeItems = this.querySelectorAll('coral-tree-item');
    if (coralTreeItems) {
      let item;
      const length = coralTreeItems.length;
      if (length > 0) {
        for (let index = 0 ; index < length ; index++) {
          item = coralTreeItems[index];
          if (item) {
            item.expanded = expand;
          }
        }
      }
    }
  }

  /**
   Expand all the Tree Items
   */
  expandAll() {
    this._expandCollapseAll(true);
  }

  /**
   Collapse all the Tree Items
   */
  collapseAll() {
    this._expandCollapseAll(false);
  }

  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['multiple']);
  }

  /** @ignore */
  render() {
    super.render();

    this.classList.add(CLASSNAME);

    // a11y
    this.setAttribute('role', 'tree');
    this.setAttribute('aria-multiselectable', this.multiple);

    // Enable keyboard interaction
    requestAnimationFrame(() => {
      this._resetFocusableItem();
    });

    // Don't trigger events once connected
    this._preventTriggeringEvents = true;
    this._validateSelection();
    this._preventTriggeringEvents = false;

    this._oldSelection = this.selectedItems;
  }

  /**
   Triggered when the {@link Tree} selection changed.

   @typedef {CustomEvent} coral-tree:change

   @property {Array.<TreeItem>} detail.oldSelection
   The old selected item.
   @property {Array.<TreeItem>} detail.selection
   The selected items.
   */

  /**
   Triggered when a {@link Tree} item expanded.

   @typedef {CustomEvent} coral-tree:expand

   @property {TreeItem} detail.item
   The expanded item.
   */

  /**
   Triggered when a {@link Tree} item collapsed.

   @typedef {CustomEvent} coral-tree:collapse

   @property {TreeItem} detail.item
   The collapsed item.
   */
}

export default Tree;
