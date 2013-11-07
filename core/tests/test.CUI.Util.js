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

  describe('uuid()', function() {
    it("should create a string 36 characters long", function() {
      expect(CUI.util.uuid().length).to.equal(36);
    });

    it("should create unique ids", function() {
      var uuids = [];

      for (var i = 0; i < 100; i++) {
        var uuid = CUI.util.uuid();
        expect(uuids.indexOf(uuid)).to.equal(-1);
        uuids.push(uuid);
      }
    });
  });

  // TODO: test $.fn.loadWithSpinner
  // TODO: test CUI.util.plugClass
});
