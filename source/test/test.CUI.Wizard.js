describe('CUI.Wizard', function() {

              
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Wizard');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('wizard');
    });

    describe("from markup", function() {
        var html = 
            '<div class="wizard" data-init="wizard">'+
                '<nav>'+
                    '<button class="back">Back</button>'+
                    '<ol>'+
                        '<li>Frist step</li>'+
                        '<li>Second step</li>'+
                        '<li>Third step</li>'+
                        '<li>Last step</li>'+
                    '</ol>'+
                    '<button class="next" disabled>Next</button>'+
                '</nav>'+
                '<section data-next-disabled="false" data-back-label="Cancel">'+
                    'The first step is optional.'+
                '</section>'+
                '<section data-next-disabled="false">'+
                    'The second step is optional.'+
                '</section>'+
                '<section data-next-disabled="false">'+
                    'The third step is optional.'+
                '</section>'+
                '<section data-next-label="Create">'+
                    'Name is required.'+
                '</section>'+
            '</div>';
        
        $('body').append(html);
        var wizard = new CUI.Wizard({element: '.wizard'});
                
        it('should have wizard object attached', function() {
            expect(wizard).to.be.an("object");
        });
        
        it('should be in the first page', function() {
            expect(wizard.getCurrentPageNumber()).to.equal(1);
        });
        
        it('should go to the second page', function() {
            wizard.$element.find("button.next").click();
            expect(wizard.getCurrentPageNumber()).to.equal(2);
        });
        
        it('should go to the third page', function() {
            wizard.$element.find("button.next").click();
            expect(wizard.getCurrentPageNumber()).to.equal(3);
        });
        
        it('should deactivate page 2', function() {
            wizard.deactivatePage(2);
            wizard.$element.find("button.back").click();
            expect(wizard.getCurrentPageNumber()).to.equal(1);
        });
        
      });      
});
