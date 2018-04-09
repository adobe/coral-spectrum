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
import {Collection} from '../../../coralui-collection';
import solutionSwitcher from '../templates/solutionSwitcher';

const CLASSNAME = '_coral-Shell-solutionSwitcher';

/**
 @class Coral.Shell.SolutionSwitcher
 @classdesc A Shell Solution Switcher component
 @htmltag coral-shell-solutionswitcher
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class ShellSolutionSwitcher extends ComponentMixin(HTMLElement) {
  /** @ignore */
  constructor() {
    super();
  
    // Template
    this._elements = {};
    solutionSwitcher.call(this._elements);
    
    const self = this;
    // Listen for mutations
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const addedNode = mutation.addedNodes[i];
          // Move non secondary solutions to the container
          if (addedNode.nodeName === 'CORAL-SHELL-SOLUTIONS' && !addedNode.hasAttribute('secondary')) {
            self._elements.container.appendChild(addedNode);
          }
        }
      });
    });
  
    observer.observe(this, {
      // Only care about direct children
      childList: true
    });
  }
  
  /**
   The item collection.
   
   @type {Collection}
   @readonly
   */
  get items() {
    // Construct the collection on first request
    if (!this._items) {
      this._items = new Collection({
        host: this,
        itemTagName: 'coral-shell-solutions'
      });
    }
  
    return this._items;
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  
    // force dark theme
    this.classList.add('coral--dark');
    
    const container = this.querySelector('._coral-Shell-solutions-container') || this._elements.container;
    
    // Remove it so we can process solutions
    if (container.parentNode) {
      container.remove();
    }
  
    // Move non secondary solutions to the container
    Array.prototype.forEach.call(this.querySelectorAll('coral-shell-solutions:not([secondary])'), (item) => {
      container.appendChild(item);
    });
  
    // Put the container as first child
    this.insertBefore(container, this.firstChild);
  }
}

export default ShellSolutionSwitcher;
