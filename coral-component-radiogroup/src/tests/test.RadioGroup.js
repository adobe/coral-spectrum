/**
 * Copyright 2020 Adobe. All rights reserved.
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
import {RadioGroup} from '../../../coral-component-radiogroup';

describe('RadioGroup', function() {
  
  describe('Instantiation', function() {
    it('should support creation from markup', function() {
      expect(helpers.build('<coral-radiogroup>') instanceof RadioGroup).to.equal(true);
    });
    
    it('should expose 3 orientations', () => {
      expect(Object.keys(RadioGroup.orientation).length).to.equal(3);
    });
    
    helpers.cloneComponent(
      'should be possible via cloneNode using markup',
      window.__html__['RadioGroup.base.html']
    );
  });
  
  describe('API', () => {
    it('should support orientation.LABELS_BELOW', () => {
      const el = new RadioGroup();
      el.orientation = RadioGroup.orientation.LABELS_BELOW;
      expect(el.getAttribute('orientation')).to.equal('labelsbelow');
      expect(el.classList.contains('coral-RadioGroup--labelsBelow')).to.be.true;
    });
  });
  
  describe('Markup', function() {
    it('should support orientation.LABELS_BELOW', () => {
      const el = helpers.build(window.__html__['RadioGroup.orientation.labelsBelow.html']);
      expect(el.getAttribute('orientation')).to.equal('labelsbelow');
      expect(el.classList.contains('coral-RadioGroup--labelsBelow')).to.be.true;
    });
  });
});
