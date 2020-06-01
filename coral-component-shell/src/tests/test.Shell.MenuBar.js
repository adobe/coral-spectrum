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

describe('Shell.MenuBar', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Shell).to.have.property('MenuBar');
    });
  });

  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      const el = helpers.build('<coral-shell-menubar>');
      expect(el).to.be.an.instanceof(Shell.MenuBar);
    });
  
    helpers.cloneComponent(
      'should be possible to clone using markup',
      '<coral-shell-menubar></coral-shell-menubar>'
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Shell.MenuBar()
    );
  });

  describe('API', function() {
    describe('#items', function() {});
  });

  describe('Markup', function() {
    describe('#items', function() {});
  });

  describe('Events', function() {});

  describe('User Interaction', function() {});

  describe('Implementation Details', function() {});

  describe('Accessibility', function() {
    it('should support have role="list"', function() {
      const el = helpers.build('<coral-shell-menubar>');
      expect(el.getAttribute('role')).to.equal('list');
    });
  });
});
