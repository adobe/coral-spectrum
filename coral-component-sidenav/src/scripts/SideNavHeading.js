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

const CLASSNAME = '_coral-SideNav-heading';

/**
 @class Coral.SideNav.Heading
 @classdesc The SideNav Heading
 @htmltag coral-sidenav-heading
 @extends {HTMLElement}
 */
class SideNavHeading extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
    
    // a11y
    this.setAttribute('role', 'heading');
  }
}

export default SideNavHeading;
