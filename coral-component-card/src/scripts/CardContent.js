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

const CLASSNAME = '_coral-Card-content';

/**
 @class Coral.Card.Content
 @classdesc The Card Content
 @htmltag coral-card-content
 @extends {HTMLElement}
 */
class CardContent extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
    
    // Ensure title comes first
    const title = this.querySelector('coral-card-title');
    if (title) {
      this.insertBefore(title, this.firstChild);
    }
  }
}

export default CardContent;
