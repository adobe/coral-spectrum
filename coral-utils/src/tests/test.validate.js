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

import {validate} from '../../../coral-utils';

describe('validate', function() {
  
  describe('validate.valueMustChange', function() {

    it('should have validate.valueMustChange defined', function() {
      expect(validate).to.have.property('valueMustChange');
    });

    it('should return false if values are equal', function() {
      var value = '';
      expect(validate.valueMustChange(value, value)).to.be.false;
    });

    it('should return false on equivalent strings', function() {
      expect(validate.valueMustChange('value', 'value')).to.be.false;
    });

    it('should return true on different strings', function() {
      expect(validate.valueMustChange('', 'value')).to.be.true;
      expect(validate.valueMustChange('value', '')).to.be.true;
    });

    it('should return true on different numbers', function() {
      expect(validate.valueMustChange(-10, 35)).to.be.true;
      expect(validate.valueMustChange(35, -10)).to.be.true;
    });

    it('should return true on different booleans', function() {
      expect(validate.valueMustChange(false, true)).to.be.true;
      expect(validate.valueMustChange(true, false)).to.be.true;
    });

    it('should return false on equivalent booleans', function() {
      expect(validate.valueMustChange(false, false)).to.be.false;
      expect(validate.valueMustChange(true, true)).to.be.false;
    });
  });

  describe('validate.enumeration', function() {

    it('should have validate.enumeration defined', function() {
      expect(validate).to.have.property('enumeration');
    });

    it('should support key/value enums', function() {

      var sizeEnum = {
        SMALL: 'S',
        MEDIUM: 'M',
        LARGE: 'L'
      };

      var validator = validate.enumeration(sizeEnum);

      expect(validator(sizeEnum.SMALL)).to.be.true;
      expect(validator('')).to.be.false;
      expect(validator('SMALL')).to.be.false;
      expect(validator(null)).to.be.false;
      expect(validator(undefined)).to.be.false;
    });

    it('should be case sensitive', function() {

      var sizeEnum = {
        SMALL: 'S',
        MEDIUM: 'M',
        LARGE: 'L'
      };

      var validator = validate.enumeration(sizeEnum);
      expect(validator('s')).to.be.false;
      expect(validator('m')).to.be.false;
      expect(validator('M')).to.be.true;
    });

    it('should support arrays', function() {
      var validator = validate.enumeration(['XS', 'S', 'M']);

      expect(validator('s')).to.be.false;
      expect(validator('m')).to.be.false;
      expect(validator('M')).to.be.true;
      expect(validator('')).to.be.false;
      expect(validator('SMALL')).to.be.false;
      expect(validator(null)).to.be.false;
      expect(validator(undefined)).to.be.false;
    });
  });
});
