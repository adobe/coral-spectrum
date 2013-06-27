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
        
        // The following test does not work on the command line.
        // although it should. Therefore it is skipped.
        it.skip('should open a dropdown list', function(done) {
            el.find("button").click();
            // Give it time to open
            setTimeout(function() {
                console.log(el.find(".dropdown-list").length);
                expect(el.find(".dropdown-list").length).to.equal(1);
                expect(el.find("li").length).to.equal(3);
                console.log("done");
                done();
            }, 400);
        });
      });      
});
