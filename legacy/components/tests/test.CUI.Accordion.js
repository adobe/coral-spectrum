describe('CUI.Accordion', function() {

              
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Accordion');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('accordion');
    });

    describe("from markup", function() {
        it('should be an accordion', function() {
            var html = 
                '<ul><li></li></ul>'; 
            var el = $(html).accordion();
            
            expect(el).to.have.class("accordion");
            expect(el).to.not.have.class("collapsible");            
        });
        it('should be a collapsible', function() {
            var html = 
                '<div class="collapsible"></div>'; 
            var el = $(html).accordion();
            
            expect(el).to.have.class("collapsible");
            expect(el).to.not.have.class("accordion");            
        });        
    });  
});
