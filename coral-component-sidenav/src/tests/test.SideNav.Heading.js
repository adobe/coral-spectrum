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
import {SideNav} from '../../../coral-component-sidenav';

describe('SideNav.Heading', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(SideNav).to.have.property('Heading');
    });
  });
  
  describe('Instantiation', function() {
    function testDefaultInstance(el) {
      expect(el.classList.contains('_coral-SideNav-heading')).to.be.true;
    }
  
    it('should be possible using new', function() {
      const el = helpers.build(new SideNav.Heading());
      testDefaultInstance(el);
    });
  
    it('should be possible using createElement', function() {
      const el = helpers.build(document.createElement('coral-sidenav-heading'));
      testDefaultInstance(el);
    });
  
    it('should be possible using markup', function() {
      const el = helpers.build(window.__html__['SideNav.heading.base.html']);
      testDefaultInstance(el);
    });
  });
  
  describe('Accessibility', function() {
    it('should set a heading role', function() {
      const el = helpers.build(new SideNav.Heading());
      expect(el.getAttribute('role')).to.equal('heading');
    });
  });
});
