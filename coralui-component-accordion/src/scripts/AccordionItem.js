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
import 'coralui-component-icon';
import item from '../templates/item';
import {transform, commons} from 'coralui-util';

const CLASSNAME = 'coral3-Accordion-item';

// Chevron classes for selected states
const CHEVRON_CLASSES = {
  'true': 'chevronDown',
  'false': 'chevronRight'
};

/**
 @class Coral.Accordion.Item
 @classdesc A Accordion item component
 @htmltag coral-accordion-item
 @extends HTMLElement
 @extends Coral.mixin.component
 */
class AccordionItem extends Component(HTMLElement) {
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Create or fetch the content zones
      label: this.querySelector('coral-accordion-item-label') || document.createElement('coral-accordion-item-label'),
      content: this.querySelector('coral-accordion-item-content') || document.createElement('coral-accordion-item-content')
    };
    item.call(this._elements);
  }
  
  /**
   The label of this accordion item.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Accordion.Item#
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-accordion-item-label',
      insert: function(label) {
        this._elements.labelContainer.appendChild(label);
      }
    });
  }
  
  /**
   The content of this accordion item.
   
   @type {HTMLElement}
   @contentzone
   @memberof Coral.Accordion.Item#
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-accordion-item-content',
      insert: function(content) {
        this._elements.acContent.appendChild(content);
      }
    });
  }
  
  /**
   Whether the item is selected.
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   @memberof Coral.Accordion.Item#
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = transform.booleanAttr(value);
    transform.reflect(this, 'selected', this.disabled ? false : this._selected);
    
    this.classList.toggle('is-selected', this._selected);
    this.removeAttribute('aria-selected');
    this._elements.acHeader.setAttribute('aria-selected', this._selected);
    this._elements.acHeader.setAttribute('aria-expanded', this._selected);
    this._elements.acContent.setAttribute('aria-hidden', !this._selected);
    this._elements.icon.icon = CHEVRON_CLASSES[this._selected];
  
    const animateElement = this._elements.acContent;
  
    let offsetHeight;
    if (!this._animate) {
      this._animate = true;
      if (this._selected) {
        animateElement.classList.add('is-open');
      }
      else {
        animateElement.classList.add('is-closed');
        animateElement.style.height = '0';
      }
    }
    else {
      if (this._selected) {
        animateElement.classList.remove('is-closed');
        animateElement.classList.add('is-collapsing');
        animateElement.style.height = animateElement.scrollHeight + 'px';
      }
      else {
        animateElement.style.height = animateElement.scrollHeight + 'px';
        // We read the offset height to force a reflow, this is needed to start the transition between absolute values
        // https://blog.alexmaccaw.com/css-transitions under Redrawing
        offsetHeight = animateElement.offsetHeight;
        animateElement.classList.add('is-collapsing');
        animateElement.classList.remove('is-open');
        animateElement.style.height = 0;
      }
    
      commons.transitionEnd(animateElement, function() {
        this._onCollapsed();
      }.bind(this));
  
      this.trigger('coral-accordion-item:_selectedchanged');
    }
  }
  
  /**
   Whether this item is disabled.
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   @memberof Coral.Accordion.Item#
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    transform.reflect(this, 'disabled', this._disabled);
  
    this.classList.toggle('is-disabled', this.disabled);
    this.removeAttribute('aria-disabled');
    this._elements.acHeader.setAttribute('aria-disabled', this.disabled);
  
    this.selected = this.selected;
  }
  
  /** @private **/
  get _isTabTarget() {
    return this.__isTabTarget || false;
  }
  set _isTabTarget(value) {
    this.__isTabTarget = value;
    
    if (this.disabled) {
      this._elements.acHeader.removeAttribute('tabindex');
    }
    else {
      this._elements.acHeader.setAttribute('tabindex', this.__isTabTarget ? '0' : '-1');
    }
  }
  
  /** @private **/
  _onCollapsed() {
    // Handles styling of the container after collapsing.
    const animateElement = this._elements.acContent;
    animateElement.classList.remove('is-collapsing');
    animateElement.classList.add('is-closed');
    if (this.selected) {
      animateElement.classList.add('is-open');
      animateElement.classList.remove('is-closed');
      animateElement.style.height = '';
    }
    else {
      animateElement.classList.add('is-closed');
      animateElement.classList.remove('is-open');
    }
  }
  
  /**
   Handles the focus of the item.
 
   @ignore
   */
  focus() {
    this._elements.acHeader.focus();
  }
  
  // For backwards compatibility + Torq
  get defaultContentZone() {return this.content;}
  set defaultContentZone(value) {this.content = value;}
  get _contentZones() {return {'coral-accordion-item-label': 'label', 'coral-accordion-item-content': 'content'};}
  
  static get observedAttributes() {
    return ['selected', 'disabled'];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    const header = this._elements.acHeader;
  
    // a11y
    header.setAttribute('aria-controls', this._elements.acContent.id);
    this._elements.acContent.setAttribute('aria-labelledby', header.id);
    this.setAttribute('role', 'presentation');
    
    // Defaults
    this.selected = this.selected;
    
    // Render the template and set element references
    const frag = document.createDocumentFragment();
    
    const templateHandleNames = ['acHeader', 'icon', 'labelContainer', 'acContent'];
    
    frag.appendChild(this._elements.acHeader);
    frag.appendChild(this._elements.acContent);
    
    const label = this._elements.label;
    const content = this._elements.content;
  
    // Assign the content zones, moving them into place in the process
    this.label = label;
    this.content = content;
  
    // Move any remaining elements into the content sub-component
    while (this.firstChild) {
      const child = this.firstChild;
      if (child.nodeType === Node.TEXT_NODE ||
        templateHandleNames.indexOf(child.getAttribute('handle')) === -1) {
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
}

export default AccordionItem;
