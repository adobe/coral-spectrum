describe('CUI.NumberInput', function() {
                
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('NumberInput');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('numberInput');
    });

});