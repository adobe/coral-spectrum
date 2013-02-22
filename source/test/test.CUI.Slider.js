describe('CUI.Slider', function() {

              
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Slider');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('slider');
    });

    describe("from markup", function() {
        it('should be a slider', function() {
            var html = 
              '<div>' + 
                '<input type="range" min="1" max="100" step="10" value="20">' +
              '</div>'; 
            var el = $(html).slider();
            
            expect(el).to.have.class("slider");
        });
      });
      
      
     describe("from options", function() {
         it('should create an input field', function() {
             var html = "<div>";
             
             var el = $(html).slider({
                min: 0,
                max: 100,
                step: 5,
                value: 50,
                ticks: true,
                filled: true,
                orientation: "vertical",
                tooltips: true,
                slide: true
              });
              
              expect(el.find("input").length).to.equal(1);
              expect(parseFloat(el.find("input").val())).to.equal(50);
          });
          
    });
});
