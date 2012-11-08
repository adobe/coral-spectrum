describe('CUI.Filters', function() {

              
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Filters');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('filters');
    });

    describe("from template with custom config", function() {
        var html = '<div>';
        
        var el = $(html).filters({
            options: ["red", "green", "blue"],
            optionDisplayStrings: ["Red", "Green", "Blue"],
            multiple: true
        });
        
        it('should have filters object attached', function() {
            expect(el.data("filters")).to.be.an("object");
        });
        
        it('should have correct markup', function() {
            expect(el).to.have("select[multiple]");
            expect(el).to.have("input");
        });
      });
      
    describe("from markup", function() {
        var html = 
          '<div data-multiple="true">' + 
            '<select multiple>' +
            '<option value="red">Red</option>' +
            '<option value="green">green</option>' +
            '<option value="blue">blue</option>' +
            '</select>' +
          '</div>';
        
        var el = $(html).filters();
        
        it('should have filters object attached', function() {
            expect(el.data("filters")).to.be.an("object");
        });
        
        it('should have correct markup', function() {
            expect(el).to.have("select[multiple]");
            expect(el).to.have("input");
        });
      });      
});
