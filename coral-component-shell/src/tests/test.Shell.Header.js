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

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Shell} from '../../../coral-component-shell';

describe('Shell.Header', function() {
  describe('Namespace', function() {
    it('should be defined in the Shell namespace', function() {
      expect(Shell).to.have.property('Header');
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone using markup',
      window.__html__['Shell.Header.base.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.Header()
    );
  });
  
  describe('Implementation Details', function() {
    it('should have inline z-index when open but remove it after closed', function(done) {
      const el = helpers.build(window.__html__['Shell.Header.zIndex.html']);
      const menu = el.querySelector('#menu');
      const header = el.querySelector('coral-shell-header');
  
      menu.on('coral-overlay:close', () => {
        setTimeout(function() {
          expect(header.style.zIndex).to.equal('');
          done();
          
          // Debounce time
        }, menu.constructor.FADETIME * 2);
      });
      
      // show menu
      menu.open = true;
  
      // Wait for menu to open
      helpers.next(() => {
        expect(header.style.zIndex).to.not.equal('');
  
        // hide menu
        menu.open = false;
      });
    });
  });
});
