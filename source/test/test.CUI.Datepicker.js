describe('CUI.Datepicker', function() {

              
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Datepicker');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('datepicker');
    });

    describe("from markup", function() {
        it('should be a datepicker', function() {
            var html = 
                '<div><input type="date" value="2012-01-01"></div>'; 
            var el = $(html).datepicker();
            
            expect(el).to.have.class("datepicker");
        });
    });
    
    // TODO: Test dispayFormat vs storedFormat
      
});
