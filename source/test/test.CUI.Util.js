describe('CUI.Util', function() {
  
  describe('capitalize()', function() {
    it("should capitalize lowercase string", function() {
      CUI.util.capitalize("testString").should.equal("TestString");
    });
    
    it("should not break already capitalized string", function() {
      CUI.util.capitalize("TestString").should.equal("TestString");
    });
  });
  
  describe('decapitalize()', function() {
    it("should decapitalize uppercase string", function() {
      CUI.util.decapitalize("TestString").should.equal("testString");
    });
    
    it("should not break already decapitalized string", function() {
      CUI.util.decapitalize("testString").should.equal("testString");
    });
  });
  
  // TODO: test $.fn.loadWithSpinner
  // TODO: test CUI.util.plugClass
});
