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
import fastdom from 'fastdom';

/**
 @class Coral.Card.PropertyList
 @classdesc The Card PropertyList component
 @htmltag coral-card-propertylist
 @extends {HTMLElement}
 @extends {BaseComponent}
 */
class CardPropertyList extends BaseComponent(HTMLElement) {
  /** @ignore */
  render() {
    super.render();
    
    fastdom.mutate(() => {
      this.classList.add('u-coral-clearFix');
      
      // Empty it if no items
      if (this.innerHTML.trim() === '') {
        this.textContent = '';
      }
    });
  }
}

export default CardPropertyList;
