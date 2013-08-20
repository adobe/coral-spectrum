describe('CUI.TagList', function() {

              
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('TagList');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('tagList');
    });

    describe("from markup", function() {
        var html = '<ol class="taglist">'+
                        '<li>'+
                            '<button class="icon-close"></button>'+
                            'Carrot'+
                            '<input type="hidden" value="carrot"/>'+
                        '</li>'+
                        '<li>'+
                            '<button class="icon-close"></button>'+
                            'Banana'+
                            '<input type="hidden" value="banana"/>'+
                        '</li>'+
                        '<li>'+
                        '<button class="icon-close"></button>'+
                            'Apple'+
                        '<input type="hidden" value="apple"/>'+
                        '</li>'+
                        '</ol>';
        
        var el = $(html).tagList(),
            widget = el.data("tagList");
                
        it('should have dropdown object attached', function() {
            expect(widget).to.be.an("object");
        });
        
        it('should have the value banana in the private value store', function() {
            expect(widget._existingValues).to.include('banana');
        });

    });

    describe("API access", function() {
        var el = $('<ol/>', {
                'class': 'taglist'
            }).tagList(),
            widget = el.data("tagList");

        it('added value should be in private value store', function() {
            widget.addItem('tomato');
            expect(widget._existingValues).to.include('tomato');
        });

        it('added value should be in markup', function() {
            widget.addItem('pineapple');
            
            var input = el.find('input[value="pineapple"]');
            expect(input.length).to.equal(1);
        });

        it('removed value must not be in private value store', function() {
            widget.removeItem('tomato');
            expect(widget._existingValues).to.not.include('tomato');
        });

        it('added value should be in markup', function() {
            widget.removeItem('pineapple');
            
            var input = el.find('input[value="pineapple"]');
            expect(input.length).to.equal(0);
        });

    });
});
