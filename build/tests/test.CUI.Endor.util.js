describe('CUI.Endor.util', function () {

  var util = CUI.Endor.util;

  it('should be defined', function (){
    expect(util).to.be.defined;
  });

  describe('ensureElementId', function () {

    it('should add id when missing', function () {
      var $el = $('<a></a>');
      util.ensureElementId($el);
      expect($el.attr('id')).to.contain('coral');
    });

    it('should keep id when id is set', function () {
      var $el = $('<a></a>').attr('id', 'id');
      util.ensureElementId($el);
      expect($el.attr('id')).to.equal('id');
    });

  });

  describe('pascalCaseToSelectorCase', function () {

    it('should convert pascal case', function (){
      expect(util.pascalCaseToSelectorCase('MyPascalCaseValue')).to.eql('my-pascal-case-value');
    });

    it('should convert camel case', function (){
      expect(util.pascalCaseToSelectorCase('myCamelCaseValue')).to.eql('my-camel-case-value');
    });

  });

});