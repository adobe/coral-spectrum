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

import {commons} from '../../../coral-utils';
import {BaseComponent} from '../../../coral-base-component';

const CLASSNAME = '_coral-SideNav';

/**
 @class Coral.SideNav.Level
 @classdesc A SideNav Level component
 @htmltag coral-sidenav-level
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class SideNavLevel extends BaseComponent(HTMLElement) {
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat(['_expanded']);
  }
  
  /** @ignore */
  attributeChangedCallback(name, oldValue, value) {
    if (name === '_expanded') {
      const isExpanded = value === 'on';
      
      if (oldValue === value) {
        return;
      }
  
      this.classList.toggle('is-expanded', isExpanded);
  
      // Do animation in next frame to avoid a forced reflow
      window.requestAnimationFrame(() => {
        // Don't animate on initialization
        if (this._animate) {
          // Remove height as we want the level to naturally grow if content is added later
          commons.transitionEnd(this, () => {
            if (isExpanded) {
              this.style.height = '';
            }
            else {
              this.hidden = true;
            }
          });
      
          // Force height to enable transition
          if (!isExpanded) {
            this.style.height = `${this.scrollHeight}px`;
          }
          else {
            this.hidden = false;
          }
      
          // We read the offset height to force a reflow, this is needed to start the transition between absolute values
          // https://blog.alexmaccaw.com/css-transitions under Redrawing
          // eslint-disable-next-line no-unused-vars
          const offsetHeight = this.offsetHeight;
      
          this.style.height = isExpanded ? `${this.scrollHeight}px` : 0;
        }
        else {
          // Make sure it's animated next time
          this._animate = true;
      
          // Hide it on initialization if closed
          if (!isExpanded) {
            this.style.height = 0;
            this.hidden = true;
          }
        }
      });
    }
    else {
      super.attributeChangedCallback(name, oldValue, value);
    }
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
    
    // a11y
    this.setAttribute('role', 'region');
  }
}

export default SideNavLevel;
