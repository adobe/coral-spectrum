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

import Component from 'coralui-mixin-component';
import {Collection} from 'coralui-collection';
import 'coralui-component-icon';
import item from '../templates/item';
import spacer from '../templates/spacer';
import {transform, commons, validate} from 'coralui-util';

const CLASSNAME = 'coral3-Tree-item';

// Chevron classes for expanded/collapse states
const CHEVRON_CLASSES = {
  'true': 'chevronDown',
  'false': 'chevronRight'
};

const variant = {
  /* Default variant with icon to expand/collapse subtree. */
  DRILLDOWN: 'drilldown',
  /* Variant for leaf items. Icon to expand/collapse subtree is hidden. */
  LEAF: 'leaf'
};

const ALL_VARIANT_CLASSES = [];

for (const variantValue in variant) {
  if (variant.hasOwnProperty(variantValue)) {
    ALL_VARIANT_CLASSES.push(`${CLASSNAME}--${variant[variantValue]}`);
  }
}

const addTreeItemSpacer = function(item) {
  if (item) {
    let parentItem = item._parent;
    while (parentItem) {
      const headerNode = item._elements.header;
      if (headerNode) {
        headerNode.insertBefore(spacer(), headerNode.firstChild);
      }
      parentItem = parentItem._parent;
    }
  }
};

/**
 @class Coral.Tree.Item
 @classdesc A Tree item component
 @htmltag coral-tree-item
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class TreeItem extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Create or fetch the content zones
      content: this.querySelector('coral-tree-item-content') || document.createElement('coral-tree-item-content')
    };
    item.call(this._elements);
  
    // Tells the collection to automatically detect the items and handle the events
    this.items._startHandlingItems();
  }
  
  /**
   The parent tree. Returns <code>null</code> if item is the root.
   
   @type {HTMLElement}
   @readonly
   @memberof Coral.Tree.Item#
   */
  get parent() {
    return this._parent || null;
  }
  
  /**
   The content of this tree item.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Tree.Item#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-tree-item-content',
      insert: function(content) {
        this._elements.contentContainer.appendChild(content);
      }
    });
  }
  
  /**
   The Collection Interface that allows interacting with the items that the component contains. See
   {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.Tree.Item#
   */
  get items() {
    // Construct the collection on first request
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-tree-item',
        itemSelector: ':scope > coral-tree-item',
        container: this._elements.subTreeContainer,
        filter: this._filterItem.bind(this),
        onItemAdded: this._onItemAdded,
        onItemRemoved: this._onItemRemoved
      });
    }
  
    return this._items;
  }
  
  /**
   Whether the item is expanded. Expanded cannot be set to <code>true</code> if the item is disabled.
   
   @type {Boolean}
   @default false
   @htmlattribute expanded
   @htmlattributereflected
   @memberof Coral.Tree.Item#
   */
  get expanded() {
    return this._expanded || false;
  }
  set expanded(value) {
    value = transform.booleanAttr(value);
    const triggerEvent = this.expanded !== value;
    
    this._expanded = value;
    this._reflectAttribute('expanded', this._expanded);
  
    const header = this._elements.header;
    const chevron = this._elements.icon;
    const subTreeContainer = this._elements.subTreeContainer;
  
    this.classList.toggle('is-expanded', this._expanded);
    this.classList.toggle('is-collapsed', !this._expanded);
    header.setAttribute('aria-expanded', this._expanded);
    subTreeContainer.setAttribute('aria-hidden', !this._expanded);
  
    chevron.icon = CHEVRON_CLASSES[this._expanded];
    
    this.trigger('coral-tree-item:_expandedchanged');
    
    // Do animation in next frame to avoid a forced reflow
    window.requestAnimationFrame(function() {
      // Don't animate on initialization
      if (this._animate) {
        let offsetHeight;
        
        // Remove height as we want the drawer to naturally grow if content is added later
        commons.transitionEnd(subTreeContainer, function() {
          if (this.expanded) {
            subTreeContainer.style.height = '';
          }
          else {
            subTreeContainer.hidden = true;
          }
        }.bind(this));
    
        // Force height to enable transition
        if (!this.expanded) {
          subTreeContainer.style.height = subTreeContainer.scrollHeight + 'px';
        }
        else {
          subTreeContainer.hidden = false;
        }
  
        // We read the offset height to force a reflow, this is needed to start the transition between absolute values
        // https://blog.alexmaccaw.com/css-transitions under Redrawing
        offsetHeight = subTreeContainer.offsetHeight;
        
        subTreeContainer.style.height = this.expanded ? subTreeContainer.scrollHeight + 'px' : 0;
      
        // Trigger once the animation is over to inform coral-tree
        if (triggerEvent) {
          this.trigger('coral-tree-item:_afterexpandedchanged');
        }
      }
      else {
        // Make sure it's animated next time
        this._animate = true;
    
        // Hide it on initialization if closed
        if (!this.expanded) {
          subTreeContainer.style.height = 0;
          subTreeContainer.hidden = true;
        }
      }
    }.bind(this));
  }
  
  /**
   The item's variant.
   
   @type {Coral.Tree.Item.variant}
   @default Coral.Tree.Item.variant.DRILLDOWN
   @htmlattribute variant
   @htmlattributereflected
   @memberof Coral.Tree.Item#
   */
  get variant() {
    return this._variant || variant.DRILLDOWN;
  }
  set variant(value) {
    value = transform.string(value).toLowerCase();
    this._variant = validate.enumeration(variant, value) && value || variant.DRILLDOWN;
  
    // removes every existing variant
    this.classList.remove.apply(this.classList, ALL_VARIANT_CLASSES);
    this.classList.add(`${CLASSNAME}--${this._variant}`);
  }
  
  /**
   Whether the item is selected.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.Tree.Item#
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
  
    this.classList.toggle('is-selected', this._selected);
    this.setAttribute('aria-selected', this._selected);
    
    this.trigger('coral-tree-item:_selectedchanged');
  }
  
  /**
   Whether this item is disabled.
   
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   @memberof Coral.Tree.Item#
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
  
    this.classList.toggle('is-disabled', this._disabled);
    this._elements.header.setAttribute('aria-disabled', this._disabled);
    
    this.trigger('coral-tree-item:_disabledchanged');
  }
  
  /**
   @ignore
   */
  get hidden() {
    return this.hasAttribute('hidden');
  }
  set hidden(value) {
    this._reflectAttribute('hidden', transform.booleanAttr(value));
  
    // We redefine hidden to trigger an event
    this.trigger('coral-tree-item:_hiddenchanged');
  }
  
  /** @private */
  _filterItem(item) {
    // Handle nesting check for parent tree item
    // Use parentNode for added items
    // Use _parent for removed items
    return (item.parentNode && item.parentNode.parentNode === this) || (item._parent === this);
  }
  
  /** @private */
  _onItemAdded(item) {
    item._parent = this;
    addTreeItemSpacer(item);
  }
  
  /** @private */
  _onItemRemoved(item) {
    item._parent = undefined;
  }
  
  /**
   Handles the focus of the item.
 
   @ignore
   */
  focus() {
    this._elements.header.focus();
  }
  
  // Expose enum
  static get variant() {return variant;}
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {return {'coral-tree-item-content': 'content'};}
  
  static get observedAttributes() {
    return ['selected', 'disabled', 'variant', 'expanded', 'hidden'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // a11y
    this.setAttribute('role', 'treeitem');
    this.setAttribute('aria-selected', this.selected);
    this._elements.header.setAttribute('aria-controls', this._elements.subTreeContainer.id);
    this._elements.subTreeContainer.setAttribute('aria-labelledby', this._elements.header.id);
  
    // Default reflected attributes
    if (!this._variant) {this.variant = variant.DRILLDOWN;}
    this.expanded = this.expanded;
    
    // Render the template and set element references
    const frag = document.createDocumentFragment();
  
    const templateHandleNames = ['header', 'icon', 'contentContainer', 'subTreeContainer'];
    
    // Support cloning nested structures by moving spacers into the header and existing tree items into the sub tree
    let header = this.querySelector('.coral3-Tree-header');
    if (header) {
      let spacers = header.querySelectorAll('.coral3-Tree-item-spacer');
      for (let i = 0; i < spacers.length; i++) {
        this._elements.header.insertBefore(spacers[i], this._elements.header.firstChild);
      }
    }
    
    let subTree = this.querySelector('.coral3-Tree-subTree');
    if (subTree) {
      let items = subTree.querySelectorAll('coral-tree-item');
      for (let i = 0; i < items.length; i++) {
        this._elements.subTreeContainer.appendChild(items[i]);
      }
    }
    
    // Add templates into the frag
    frag.appendChild(this._elements.header);
    frag.appendChild(this._elements.subTreeContainer);
  
    const content = this._elements.content;
    const subTreeContainer = this._elements.subTreeContainer;
  
    // Assign the content zones, moving them into place in the process
    this.content = content;
  
    // Move any remaining elements into the content sub-component
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeName === 'CORAL-TREE-ITEM') {
        // Adding parent attribute to access the parent directly
        child._parent = this;
        // Add tree items to the sub tree container
        subTreeContainer.appendChild(child);
      }
      else if (child.nodeType === Node.TEXT_NODE ||
        (child.nodeType === Node.ELEMENT_NODE && templateHandleNames.indexOf(child.getAttribute('handle')) === -1)) {
        // Add non-template elements to the content
        content.appendChild(child);
      }
      else {
        // Remove anything else element
        this.removeChild(child);
      }
    }
  
    // Lastly, add the fragment into the container
    this.appendChild(frag);
  }
  
  /**
   Triggered when {@link Coral.Tree.Item#selected} changed.
   
   @event Coral.Tree.Item#coral-tree-item:_selectedchanged
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Tree.Item#expanded} changed.
   
   @event Coral.Tree.Item#coral-tree-item:_expandedchanged
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Tree.Item#hidden} changed.
   
   @event Coral.Tree.Item#coral-tree-item:_hiddenchanged
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Tree.Item#disabled} changed.
   
   @event Coral.Tree.Item#coral-tree-item:_disabledchanged
   @param {Object} event Event object
   @private
   */
}

export default TreeItem;
