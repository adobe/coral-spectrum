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
      
      describe("with complex usage", function() {
        var html = 
          '<div data-multiple="true">' + 
            '<select multiple>' +
            '<option value="red" selected>red</option>' +
            '<option value="green">green</option>' +
            '<option value="blue">blue</option>' +
            '</select>' +
          '</div>';  
          var el = $(html).filters();
          $("body").append(el);
          
          it('should have one option selected', function() {
                var list = el.data("filters").getSelectedIndices();
                expect(list.length).to.equal(1);
                expect(list[0]).to.equal(0);
          });
          it('should select correct items by API', function() {
                el.data("filters").setSelectedIndices([1,2]);
                expect(el.find("select option:selected").length).to.equal(2);
                expect(el.find("select option:selected:eq(0)").text()).to.equal("green");
                expect(el.find("select option:selected:eq(1)").text()).to.equal("blue");  
                
                el.data("filters").setSelectedIndices([]);
                el.data("filters").setSelectedIndex(0);
                el.data("filters").setSelectedIndex(1);
                expect(el.find("select option:selected:eq(0)").text()).to.equal("red");
                expect(el.find("select option:selected:eq(1)").text()).to.equal("green");              
          });
          it('should respect options set by API', function() {
                var html = 
                      '<div data-multiple="true">' + 
                        '<select multiple>' +
                        '</select>' +
                      '</div>';
                
                var el2 = $(html).filters({options: [
                    "white", "yellow"
                ]});
                el2.data('filters').setSelectedIndices([0, 1]);
                expect(el2.find("select option:selected:eq(0)").text()).to.equal("white");
                expect(el2.find("select option:selected:eq(1)").text()).to.equal("yellow");  
          });         
      });
});
