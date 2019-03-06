/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coral-mixin-component';
import {transform, commons} from '../../../coral-utils';
import base from '../templates/base';
import {Icon} from '../../../coral-component-icon';

const CLASSNAME = '_coral-Accordion-item';

/**
 @class Coral.Accordion.Item
 @classdesc A Accordion item component
 @htmltag coral-accordion-item
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class AccordionItem extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Create or fetch the content zones
      label: this.querySelector('coral-accordion-item-label') || document.createElement('coral-accordion-item-label'),
      content: this.querySelector('coral-accordion-item-content') || document.createElement('coral-accordion-item-content')
    };
  
    base.call(this._elements, {Icon});
  }
  
  /**
   The label of this accordion item.
   
   @type {HTMLElement}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-accordion-item-label',
      insert: function(label) {
        this._setAria(this._elements.button, this._elements.content);
        
        this._elements.button.appendChild(label);
      }
    });
  }
  
  /**
   The content of this accordion item.
   
   @type {HTMLElement}
   @contentzone
   */
  get content() {
    return this._getContentZone(this._elements.content);
  }
  set content(value) {
    this._setContentZone('content', value, {
      handle: 'content',
      tagName: 'coral-accordion-item-content',
      insert: function(content) {
        this._setAria(this._elements.button, content);
        
        this.appendChild(content);
      }
    });
  }
  
  /**
   Whether the item is selected. If the item has an element with the `coral-interactive` attribute and is clicked,
   then the toggling of the accordion item will not occur.
   
   @type {Boolean}
   @default false
   @htmlattribute selected
   @htmlattributereflected
   */
  get selected() {
    return this._selected || false;
  }
  set selected(value) {
    this._selected = this.hasAttribute('disabled') ? false : transform.booleanAttr(value);
    this._reflectAttribute('selected', this._selected);
    
    // Read it before applying is-open which adds additional padding
    const scrollHeight = this._elements.content.scrollHeight;
    
    this.classList.toggle('is-open', this._selected);
    this._elements.button.setAttribute('aria-expanded', this._selected);
    
    if (!this._selected) {
      this._elements.content.style.height = `${scrollHeight}px`;
      // We read the offset height to force a reflow, this is needed to start the transition between absolute values
      // https://blog.alexmaccaw.com/css-transitions under Redrawing
      // eslint-disable-next-line no-unused-vars
      const offsetHeight = this._elements.content.offsetHeight;
    }
    
    this._elements.content.style.height = this._selected ? `${scrollHeight}px` : '0';

    if (this._selected) {
      commons.transitionEnd(this._elements.content, () => {
        this._elements.content.style.height = '';
      });
    }
  
    this.trigger('coral-accordion-item:_selectedchanged');
  }
  
  /**
   Whether this item is disabled.
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._disabled || false;
  }
  set disabled(value) {
    this._disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this._disabled);
  
    this.classList.toggle('is-disabled', this._disabled);
    this._elements.button[this._disabled ? 'setAttribute' : 'removeAttribute']('disabled', '');
  
    this.selected = this.selected;
  }
  
  /** @private **/
  get _isTabTarget() {
    return this.__isTabTarget || false;
  }
  set _isTabTarget(value) {
    this.__isTabTarget = value;
    
    if (this.disabled) {
      this._elements.button.removeAttribute('tabindex');
    }
    else {
      this._elements.button.setAttribute('tabindex', this.__isTabTarget ? '0' : '-1');
    }
  }
  
  _setAria(button, content) {
    button.id = button.id || commons.getUID();
    content.id = content.id || commons.getUID();
  
    button.setAttribute('aria-controls', content.id);
    content.setAttribute('aria-labelledby', button.id);
  }
  
  /**
   Handles the focus of the item.
 
   @ignore
   */
  focus() {
    this._elements.label.focus();
  }
  
  get _contentZones() { return {'coral-accordion-item-label': 'label', 'coral-accordion-item-content': 'content'}; }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['selected', 'disabled']);
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // a11y
    this.setAttribute('role', 'presentation');
  
    // Support cloneNode
    const template = this.querySelector('._coral-Accordion-itemHeading');
    if (template) {
      template.remove();
    }
    
    // Move content into the content zone if not specified
    if (!this._elements.content.parentNode) {
      while (this.firstChild) {
        this._elements.content.appendChild(this.firstChild);
      }
    }
    
    this.appendChild(this._elements.heading);
  
    // Assign the content zones, moving them into place in the process
    this.label = this._elements.label;
    this.content = this._elements.content;
    
    // Defaults
    this.selected = this.selected;
  }
}

export default AccordionItem;
