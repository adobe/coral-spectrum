describe('Coral.validate', function() {
  'use strict';

  it('should have validate under Coral', function() {
    expect(Coral).to.have.property('validate');
  });

  describe('Coral.validate.valueMustChange', function() {

    it('should have Coral.validate.valueMustChange defined', function() {
      expect(Coral.validate).to.have.property('valueMustChange');
    });

    it('should return false if values are equal', function() {
      var value = '';
      expect(Coral.validate.valueMustChange(value, value)).to.be.false;
    });

    it('should return false on equivalent strings', function() {
      expect(Coral.validate.valueMustChange('value', 'value')).to.be.false;
    });

    it('should return true on different strings', function() {
      expect(Coral.validate.valueMustChange('', 'value')).to.be.true;
      expect(Coral.validate.valueMustChange('value', '')).to.be.true;
    });

    it('should return true on different numbers', function() {
      expect(Coral.validate.valueMustChange(-10, 35)).to.be.true;
      expect(Coral.validate.valueMustChange(35, -10)).to.be.true;
    });

    it('should return true on different booleans', function() {
      expect(Coral.validate.valueMustChange(false, true)).to.be.true;
      expect(Coral.validate.valueMustChange(true, false)).to.be.true;
    });

    it('should return false on equivalent booleans', function() {
      expect(Coral.validate.valueMustChange(false, false)).to.be.false;
      expect(Coral.validate.valueMustChange(true, true)).to.be.false;
    });
  });

  describe('Coral.validate.enumeration', function() {

    it('should have Coral.validate.enumeration defined', function() {
      expect(Coral.validate).to.have.property('enumeration');
    });

    it('should support key/value enums', function() {

      var sizeEnum = {
        SMALL: 'S',
        MEDIUM: 'M',
        LARGE: 'L'
      };

      var validator = Coral.validate.enumeration(sizeEnum);

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

      var validator = Coral.validate.enumeration(sizeEnum);
      expect(validator('s')).to.be.false;
      expect(validator('m')).to.be.false;
      expect(validator('M')).to.be.true;
    });

    it('should support arrays', function() {
      var validator = Coral.validate.enumeration(['XS', 'S', 'M']);

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
