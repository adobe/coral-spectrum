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

import {target, build} from './helpers.build';

const overlay = {};

overlay.createFloatingTarget = function() {
  var overlayTarget = document.createElement('div');
  overlayTarget.textContent = 'Floating overlay target';
  overlayTarget.style.position = 'fixed';
  overlayTarget.style.left = '50%';
  overlayTarget.style.top = '50%';

  // Add to target so it it cleared after each test
  target.appendChild(overlayTarget);

  return overlayTarget;
};

overlay.createStaticTarget = function() {
  var overlayTarget = document.createElement('div');
  overlayTarget.textContent = 'Static overlay target';

  // Add to target so it it cleared after each test
  target.appendChild(overlayTarget);

  return overlayTarget;
};

/**
 Helper used to check that the component complies with the smart overlay behavior.
 
 @param {String} tagName
 */
const testSmartOverlay = function(tagName) {
  describe('testSmartOverlay', () => {
    it('should add/remove the overlay if the component is added/removed from the document', () => {
      const wrapper = build(`
        <div style="overflow: hidden">
          <${tagName}></${tagName}>
        </div>
      `);
      
      const el = wrapper.querySelector(tagName);
      el._elements.overlay.open = true;
    
      expect(el.contains(el._elements.overlay)).to.be.false;
      expect(document.body.contains(el._elements.overlay)).to.be.true;
    
      el.remove();
    
      expect(document.body.contains(el._elements.overlay)).to.be.false;
    
      wrapper.appendChild(el);
    
      expect(el._elements.overlay.hasAttribute('open')).to.be.false;
      expect(document.body.contains(el._elements.overlay)).to.be.true;
    });
  });
};

export {overlay, testSmartOverlay};
