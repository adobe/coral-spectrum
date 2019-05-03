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

const CLASSNAME = '_coral-Accordion-itemContent';

/**
 @class Coral.Accordion.Item.Content
 @classdesc Accordion item's content component
 @htmltag coral-accordion-item-content
 @extends {HTMLElement}
 */
class AccordionItemContent extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  
    // WAI-ARIA 1.1
    this.setAttribute('role', 'region');
  }
}

export default AccordionItemContent;
