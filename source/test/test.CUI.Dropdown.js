describe('CUI.Dropdown', function() {

              
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Dropdown');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('dropdown');
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
        

        
        var el = $(html).dropdown();

                
        it('should have dropdown object attached', function() {
            expect(el.data("dropdown")).to.be.an("object");
        });
        
        it('should have correct markup', function() {
            expect(el).to.have("select[multiple]");
            expect(el).to.have("button");
        });
        
        it('should open a dropdown list', function() {
            el.find("button").click();
            expect(el).to.have(".dropdown-list");
            // TODO fails randomly expect(el.find("li").length).to.equal(3);
        });
      });      
});
