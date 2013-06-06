describe('CUI.Util', function() {
  
  describe('capitalize()', function() {
    it("should capitalize lowercase string", function() {
      expect(CUI.util.capitalize("testString")).to.equal("TestString");
    });
    
    it("should not break already capitalized string", function() {
      expect(CUI.util.capitalize("TestString")).to.equal("TestString");
    });
  });
  
  describe('decapitalize()', function() {
    it("should decapitalize uppercase string", function() {
      expect(CUI.util.decapitalize("TestString")).to.equal("testString");
    });
    
    it("should not break already decapitalized string", function() {
      expect(CUI.util.decapitalize("testString")).to.equal("testString");
    });
  });
  
  // TODO: test $.fn.loadWithSpinner
  // TODO: test CUI.util.plugClass
});
