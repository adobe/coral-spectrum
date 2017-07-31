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
import MultifieldCollection from './MultifieldCollection';
import {commons} from 'coralui-util';

const CLASSNAME = 'coral3-Multifield';
const IS_DRAGGING_CLASS = 'is-dragging';
const IS_AFTER_CLASS = 'is-after';
const IS_BEFORE_CLASS = 'is-before';
const TEMPLATE_SUPPORT = 'content' in document.createElement('template');

/**
 @class Coral.Multifield
 @classdesc A Multifield component
 @htmltag coral-multifield
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class Multifield extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Attach events
    this._delegateEvents({
      'coral-dragaction:dragstart coral-multifield-item': '_onDragStart',
      'coral-dragaction:drag coral-multifield-item': '_onDrag',
      'coral-dragaction:dragend coral-multifield-item': '_onDragEnd',
  
      'click [coral-multifield-add]': '_onAddItemClick',
      'click .coral3-Multifield-remove': '_onRemoveItemClick'
    });
    
    // Templates
    this.id = this.id || commons.getUID();
    this._elements = {
      template: this.querySelector(`#${this.id} > template[coral-multifield-template]`) || document.createElement('template')
    };
    this._elements.template.setAttribute('coral-multifield-template', '');
    
    // In case <template> is not supported
    this._handleTemplateSupport(this._elements.template);
    
    // Template support: move nodes added to the <template> to its content fragment
    const self = this;
    self._observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const addedNode = mutation.addedNodes[i];
          const template = self.template;
        
          if (template.contains(addedNode) && template !== addedNode) {
            // Move the node to the template content
            template.content.appendChild(addedNode);
            // Update all items content with the template content
            self.items.getAll().forEach((item) => {
              self._renderTemplate(item);
            });
          }
        }
      });
    });
  
    // Watch for changes to the template element
    self._observer.observe(self, {
      childList: true,
      subtree: true
    });
  
    // Init the collection mutation observer
    this.items._startHandlingItems(true);
  }
  
  /**
   The Collection Interface that allows interacting with the Coral.Multifield items that the component contains.
   See {@link Coral.Collection} for more details.
   
   @type {Coral.Collection}
   @readonly
   @memberof Coral.Multifield#
   */
  get items() {
    // just init on demand
    if (!this._items) {
      this._items = new MultifieldCollection({
        host: this,
        itemTagName: 'coral-multifield-item',
        // allows multifields to be nested
        itemSelector: ':scope > coral-multifield-item',
        onItemAdded: this._onItemAdded
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
   @memberof Coral.Multifield#
   */
  get template() {
    return this._getContentZone(this._elements.template);
  }
  set template(value) {
    this._setContentZone('template', value, {
      handle: 'template',
      tagName: 'template',
      insert: function(template) {
        this.appendChild(template);
      },
      set: function(value) {
        // Additionally add support for template
        this._handleTemplateSupport(value);
      }
    });
  }
  
  /** @ignore */
  _handleTemplateSupport(template) {
    // @polyfill IE
    if (!TEMPLATE_SUPPORT) {
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
      window.requestAnimationFrame(function() {
        this.trigger('change');
      }.bind(this));
    }
  }
  
  /** @ignore */
  _onRemoveItemClick(event) {
    if (event.matchedTarget.closest('coral-multifield') === this) {
      const item = event.matchedTarget.closest('coral-multifield-item');
      if (item) {
        item.remove();
      }
      
      this.trigger('change');
    }
  }
  
  /** @ignore */
  _onDragStart(event) {
    if (event.target.closest('coral-multifield') === this) {
      const dragElement = event.detail.dragElement;
      const items = this.items.getAll();
      const dragElementIndex = items.indexOf(dragElement);
    
      dragElement.classList.add(IS_DRAGGING_CLASS);
      items.forEach(function(item, i) {
        if (i < dragElementIndex) {
          item.classList.add(IS_BEFORE_CLASS);
        }
        else if (i > dragElementIndex) {
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
      
      items.forEach(function(item) {
        if (!item.classList.contains(IS_DRAGGING_CLASS)) {
          const dragElement = event.detail.dragElement;
          const dragElementBoundingClientRect = dragElement.getBoundingClientRect();
          const itemBoundingClientRect = item.getBoundingClientRect();
          const itemOffsetTop = itemBoundingClientRect.top + document.body.scrollTop;
          const isAfter = event.detail.pageY < (itemOffsetTop + itemBoundingClientRect.height / 2);
          const itemReorderedTop = dragElementBoundingClientRect.height + marginBottom + 'px';
          
          item.classList.toggle(IS_AFTER_CLASS, isAfter);
          item.classList.toggle(IS_BEFORE_CLASS, !isAfter);
          
          if (item.classList.contains(IS_AFTER_CLASS)) {
            item.style.top = items.indexOf(item) < items.indexOf(dragElement) ? itemReorderedTop : '';
          }
          
          if (item.classList.contains(IS_BEFORE_CLASS)) {
            const afterDragElement = items.indexOf(item) > items.indexOf(dragElement);
            item.style.top = afterDragElement ? '-' + itemReorderedTop : '';
          }
        }
      });
    }
  }
  
  /** @ignore */
  _onDragEnd(event) {
    if (event.target.closest('coral-multifield') === this) {
      const dragElement = event.detail.dragElement;
      const items = this.items.getAll();
      const beforeArr = [];
      const afterArr = [];
      
      items.forEach(function(item) {
        if (item.classList.contains(IS_AFTER_CLASS)) {
          afterArr.push(item);
        }
        else if (item.classList.contains(IS_BEFORE_CLASS)) {
          beforeArr.push(item);
        }
        
        item.classList.remove(IS_DRAGGING_CLASS, IS_AFTER_CLASS, IS_BEFORE_CLASS);
        item.style.top = '';
        item.style.position = '';
      });
  
      const before = afterArr.shift();
      const after = beforeArr.pop();
      
      if (before) {
        this.insertBefore(dragElement, before);
        this.trigger('change');
      }
      if (after) {
        this.insertBefore(dragElement, after.nextElementSibling);
        this.trigger('change');
      }
    }
  }
  
  /** @private */
  _onItemAdded(item) {
    // Update the item content with the template content
    if (item.parentNode === this) {
      this._renderTemplate(item);
    }
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
        
        Array.prototype.forEach.call(nestedTemplates, function(template) {
          while (template.content.firstChild) {
            template.appendChild(template.content.firstChild);
          }
        });
      }
    
      // Clone the template and append it to the item content
      content.appendChild(document.importNode(this.template.content, true));
    }
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // a11y
    this.setAttribute('role', 'list');
    
    // Assign the content zones, moving them into place in the process
    this.template = this._elements.template;
  
    // Prepare items content based on the given template
    this.items.getAll().forEach(function(item) {
      this._renderTemplate(item);
    }.bind(this));
  }
  
  /**
   Triggered when the items are reordered/added/removed and when item fields are updated.
   
   @event Coral.Multifield#change
   
   @param {Object} event
   Event object
   */
}

export default Multifield;
