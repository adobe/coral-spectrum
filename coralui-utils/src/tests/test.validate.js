import {validate} from '../../../coralui-utils';

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
