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
        var htmlEditable = 
            '<div class="dropdown" data-editable="true">' + 
                '<select multiple>' +
                    '<option value="red">red</option>' +
                    '<option value="green">rreen</option>' +
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

        // The following test does not work on the command line.
        // although it should. Therefore it is skipped.
        it.skip('should open an edtiable dropdown list with 2 options', function(done) {
            var totalTime = 0, 
                interval = 200, 
                timeout = 2000,
                elEditable = null;

            elEditable = $(htmlEditable).dropdown();
            elEditable
                .find("input")
                .val("re")
                .trigger($.Event('input'))
                .trigger($.Event('input'));

            // setTimeout is used in an futile attempt to get this working in phantomJS
            setTimeout(function checkForDropdownElement() {
                var listElement = elEditable.data("dropdown").autocompleteList.listElement;
                totalTime += interval;

                if (!listElement && timeout < totalTime) {
                    return setTimeout(checkForDropdownElement, interval);
                }

                expect(listElement.find('li').length).to.equal(2);
                done();
            }, interval);
        });
    });      
});
