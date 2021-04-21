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
import {BaseButton} from '../../../coral-base-button';

/**
 @class Coral.Button
 @classdesc A Button component containing text and/or an icon.
 @htmltag coral-button
 @htmlbasetag button
 @extends {HTMLButtonElement}
 @extends {BaseComponent}
 @extends {BaseButton}
 */
class Button extends BaseButton(BaseComponent(HTMLButtonElement)) {
  /** @ignore */
  constructor() {
    super();
  
    if (!this.hasAttribute('is')) {
      this.setAttribute('is', 'coral-button');
    }
    
    // Events
    this._delegateEvents(this._events);
  }
}

export default Button;
