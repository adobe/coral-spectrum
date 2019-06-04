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
import {transform} from '../../../coral-utils';
import solutionIcon from '../templates/solutionIcon';

const CLASSNAME = '_coral-Shell-solution';

/**
 @class Coral.Shell.Solution
 @classdesc A Shell Solution component
 @htmltag coral-shell-solution
 @extends {HTMLAnchorElement}
 @extends {BaseComponent}
 */
class ShellSolution extends BaseComponent(HTMLAnchorElement) {
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
   
   @type {ShellSolutionLabel}
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
  static get observedAttributes() { return super.observedAttributes.concat(['icon', 'linked']); }
  
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
