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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {transform} from '../../../coralui-util';
import solutionIcon from '../templates/solutionIcon';

const CLASSNAME = '_coral-Shell-solution';

/**
 @class Coral.Shell.Solution
 @classdesc A Shell Solution component
 @htmltag coral-shell-solution
 @extends {HTMLAnchorElement}
 @extends {ComponentMixin}
 */
class ShellSolution extends ComponentMixin(HTMLAnchorElement) {
  /** @ignore */
  constructor() {
    super();
    
    // Prepare templates
    this._elements = {
      // Fetch or create the content zone elements
      label: this.querySelector('coral-shell-solution-label') || document.createElement('coral-shell-solution-label')
    };
    solutionIcon.call(this._elements);
  }
  
  /**
   Specifies the icon name used inside the button. See {@link Icon} for valid icon names.
   
   @type {String}
   @default ""
   @htmlattribute icon
   */
  get icon() {
    return this._elements.icon.icon;
  }
  set icon(value) {
    this._elements.icon.icon = value;
  }
  
  /**
   The solution's label content zone.
   
   @type {HTMLElement}
   @contentzone
   */
  get label() {
    return this._getContentZone(this._elements.label);
  }
  set label(value) {
    this._setContentZone('label', value, {
      handle: 'label',
      tagName: 'coral-shell-solution-label',
      insert: function(content) {
        this.appendChild(content);
      }
    });
  }
  
  /**
   Whether a solution is linked or not
   
   @type {Boolean}
   @default false
   @htmlattribute linked
   @htmlattributereflected
   */
  get linked() {
    return this._linked || false;
  }
  set linked(value) {
    this._linked = transform.booleanAttr(value);
    this._reflectAttribute('linked', this._linked);
    
    this.classList.toggle(`${CLASSNAME}--linked`, this._linked);
  }
  
  get _contentZones() { return {'coral-shell-solution-label': 'label'}; }
  
  /** @ignore */
  static get observedAttributes() { return ['icon', 'linked']; }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    const fragment = document.createDocumentFragment();
  
    // Render template
    fragment.appendChild(this._elements.icon);
  
    const label = this._elements.label;
    
    // Remove it so we can process children
    if (label) { label.remove(); }
  
    // Move any remaining elements into the content sub-component
    while (this.firstChild) {
      const child = this.firstChild;
      
      if (child.nodeType === Node.TEXT_NODE ||
        child.nodeType === Node.ELEMENT_NODE && child.getAttribute('handle') !== 'icon') {
        label.appendChild(child);
      }
      else {
        this.removeChild(child);
      }
    }
  
    // Add template to component
    this.appendChild(fragment);
    
    // Call the content zone insert
    this.label = label;
  }
}

export default ShellSolution;
