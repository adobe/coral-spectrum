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

describe('Shell.Menu', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Shell).to.have.property('Menu');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build('<coral-shell-menu>');
      expect(el).to.be.an.instanceof(Shell.Menu);
    });
    
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-shell-menu></coral-shell-menu>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.Menu()
    );
  });

  describe('API', function() {
    describe('#placement', function() {});
    describe('#from', function() {});
    describe('#full', function() {});
    describe('#top', function() {});
    describe('#focusOnShow', function() {});
    describe('#returnFocus', function() {});
    describe('#open', function() {});
  });

  describe('Markup', function() {
    describe('#placement', function() {});
    describe('#from', function() {});
    describe('#full', function() {});
    describe('#top', function() {});
    describe('#focusOnShow', function() {});
    describe('#returnFocus', function() {});
    describe('#open', function() {});
  });

  describe('Events', function() {
    describe('#coral-overlay:beforeopen', function() {});
    describe('#coral-overlay:beforeclose', function() {});
    describe('#coral-overlay:open', function() {});
    describe('#coral-overlay:close', function() {});
  });

  describe('User Interaction', function() {});
});
