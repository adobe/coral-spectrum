describe('Coral.transform', function() {
  'use strict';

  it('should have transform under Coral', function() {
    expect(Coral).to.have.property('transform');
  });

  describe('Coral.transform.boolean', function() {

    it('should have Coral.transform.boolean defined', function() {
      expect(Coral.transform).to.have.property('boolean');
    });

    it('should accept empty string as false', function() {
      var result = Coral.transform.boolean('');
      expect(result).to.be.false;
    });

    it('should accept "true" as true', function() {
      var result = Coral.transform.boolean('true');
      expect(result).to.be.true;
    });

    it('should accept "false" as true', function() {
      var result = Coral.transform.boolean('false');
      expect(result).to.be.true;
    });

    it('should accept null as false', function() {
      var result = Coral.transform.boolean(null);
      expect(result).to.be.false;
    });

    it('should accept undefined as false', function() {
      var result = Coral.transform.boolean(undefined);
      expect(result).to.be.false;
    });

    it('should accept false as false', function() {
      var result = Coral.transform.boolean(false);
      expect(result).to.be.false;
    });

    it('should accept true as true', function() {
      var result = Coral.transform.boolean(true);
      expect(result).to.be.true;
    });

    it('should accept a 0 as false', function() {
      var result = Coral.transform.boolean(0);
      expect(result).to.be.false;
    });

    it('should accept any other number as true', function() {
      expect(Coral.transform.boolean(1)).to.be.true;
      expect(Coral.transform.boolean(-1)).to.be.true;
      expect(Coral.transform.boolean(17)).to.be.true;
      expect(Coral.transform.boolean(957)).to.be.true;
      expect(Coral.transform.boolean(-53)).to.be.true;
    });

    it('should accept truthy as true', function() {
      expect(Coral.transform.boolean(true)).to.be.true;
      expect(Coral.transform.boolean(1)).to.be.true;
      expect(Coral.transform.boolean([])).to.be.true;
      expect(Coral.transform.boolean('abc')).to.be.true;
    });

    it('should accept truthy as true', function() {
      expect(Coral.transform.boolean(false)).to.be.false;
      expect(Coral.transform.boolean(0)).to.be.false;
      expect(Coral.transform.boolean('')).to.be.false;
      expect(Coral.transform.boolean(null)).to.be.false;
      expect(Coral.transform.boolean(undefined)).to.be.false;
      expect(Coral.transform.boolean(parseInt('xyz', 10))).to.be.false;
    });
  });

  describe('Coral.transform.booleanAttr', function() {

    it('should have Coral.transform.booleanAttr defined', function() {
      expect(Coral.transform).to.have.property('booleanAttr');
    });

    it('should accept empty string as true', function() {
      var result = Coral.transform.booleanAttr('');
      expect(result).to.be.true;
    });

    it('should accept "true" as true', function() {
      var result = Coral.transform.booleanAttr('true');
      expect(result).to.be.true;
    });

    it('should accept "false" as true', function() {
      var result = Coral.transform.booleanAttr('false');
      expect(result).to.be.true;
    });

    it('should accept null as false', function() {
      var result = Coral.transform.booleanAttr(null);
      expect(result).to.be.false;
    });

    it('should accept undefined as false', function() {
      var result = Coral.transform.booleanAttr(undefined);
      expect(result).to.be.false;
    });

    it('should accept false as true', function() {
      var result = Coral.transform.booleanAttr(false);
      expect(result).to.be.true;
    });

    it('should accept true as true', function() {
      var result = Coral.transform.booleanAttr(true);
      expect(result).to.be.true;
    });

    it('should accept a 0 as true', function() {
      var result = Coral.transform.booleanAttr(0);
      expect(result).to.be.true;
    });

    it('should accept any other number as true', function() {
      expect(Coral.transform.booleanAttr(1)).to.be.true;
      expect(Coral.transform.booleanAttr(-1)).to.be.true;
      expect(Coral.transform.booleanAttr(17)).to.be.true;
      expect(Coral.transform.booleanAttr(957)).to.be.true;
      expect(Coral.transform.booleanAttr(-53)).to.be.true;
    });
  });

  describe('Coral.transform.number', function() {

    it('should have Coral.transfor.number defined', function() {
      expect(Coral.transform).to.have.property('number');
    });

    it('should accept 0', function() {
      var result = Coral.transform.number('0');
      expect(result).to.equal(0);
    });

    it('should accept numbers', function() {
      var result = Coral.transform.number('3');
      expect(result).to.equal(3);
    });

    it('should accept negative numbers', function() {
      var result = Coral.transform.number('-3');
      expect(result).to.equal(-3);
    });

    it('should accept floats', function() {
      var result = Coral.transform.number('4.71');
      expect(result).to.equal(4.71);
    });

    it('should accept negative floats', function() {
      var result = Coral.transform.number('-4.98');
      expect(result).to.equal(-4.98);
    });

    it('should return null for non numbers', function() {
      var result = Coral.transform.number('-a.98');
      expect(result).to.be.null;
    });

    it('should accept numbers', function() {
      var result = Coral.transform.number(10);
      expect(result).to.equal(10);
    });

    it('should accept negative numbers', function() {
      var result = Coral.transform.number(-410);
      expect(result).to.equal(-410);
    });

    it('should return null when given null', function() {
      var result = Coral.transform.number(null);
      expect(result).to.be.null;
    });

    it('should null when given empty string', function() {
      var result = Coral.transform.number('');
      expect(result).to.be.null;
    });
  });

  describe('Coral.transform.string', function() {

    it('should have Coral.transfor.string defined', function() {
      expect(Coral.transform).to.have.property('string');
    });

    it('should accept 0', function() {
      var result = Coral.transform.string(0);
      expect(result).to.equal('0');

      result = Coral.transform.string('0');
      expect(result).to.equal('0');
    });

    it('should accept numbers', function() {
      var result = Coral.transform.string(3);
      expect(result).to.equal('3');

      result = Coral.transform.string('3');
      expect(result).to.equal('3');

      result = Coral.transform.string(-3);
      expect(result).to.equal('-3');

      result = Coral.transform.string('-3');
      expect(result).to.equal('-3');
    });

    it('should accept floats', function() {
      var result = Coral.transform.string(4.71);
      expect(result).to.equal('4.71');

      result = Coral.transform.string('4.71');
      expect(result).to.equal('4.71');

      result = Coral.transform.string('-4.98');
      expect(result).to.equal('-4.98');

      result = Coral.transform.string(-4.98);
      expect(result).to.equal('-4.98');
    });

    it('should return "" when given null', function() {
      var result = Coral.transform.string(null);
      expect(result).to.equal('');
    });

    it('should return "" when given undefined', function() {
      var result = Coral.transform.string(undefined);
      expect(result).to.equal('');
    });

    it('should accept booleans', function() {
      var result = Coral.transform.string(false);
      expect(result).to.equal('false');

      result = Coral.transform.string(true);
      expect(result).to.equal('true');
    });

    it('should accept strings', function() {
      var result = Coral.transform.string('string');
      expect(result).to.equal('string');

      result = Coral.transform.string('');
      expect(result).to.equal('');
    });
  });

  describe('Coral.transform.float', function() {

    it('should have Coral.transfor.float defined', function() {
      expect(Coral.transform).to.have.property('float');
    });

    it('should accept numbers', function() {
      var result = Coral.transform.float('64');
      expect(result).to.equal(64);
    });

    it('should accept negative numbers', function() {
      var result = Coral.transform.float('-100');
      expect(result).to.equal(-100);
    });

    it('should accept floats', function() {
      var result = Coral.transform.float('3.14');
      expect(result).to.equal(3.14);
    });

    it('should return null for invalid numbers', function() {
      var result = Coral.transform.float('3-states');
      expect(result).to.be.null;
    });

    it('should accept negative floats', function() {
      var result = Coral.transform.float('-9.8');
      expect(result).to.equal(-9.8);
    });

    it('should return null for non numbers', function() {
      var result = Coral.transform.float('-a.98');
      expect(result).to.be.null;
    });

    it('should return null when given null', function() {
      var result = Coral.transform.float(null);
      expect(result).to.be.null;
    });

    it('should return null when given empty string', function() {
      var result = Coral.transform.float('');
      expect(result).to.be.null;
    });
  });
});
