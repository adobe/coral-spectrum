describe('CUI.Alert', function() {
    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Alert');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div/>');
        expect(div).to.have.property('alert');
    });

    describe("from markup", function() {
        var html, el;

        beforeEach(function() {
          html = 
          '<div class="alert error">' +
            '<button class="close" data-dismiss="alert">&times;</button>' +
            '<strong>ERROR</strong><div>Uh oh, something went wrong with the whozit!</div>' +
          '</div>';
        
          el = $(html).appendTo('body');
        });
        
        // TODO: these tests cause timeouts right now, not sure why
        it.skip('should hide when dismissed', function(done) {
            el.find('button').click();
            expect(el).to.have.css('display', 'none');
        });

        it.skip('should not submit a form when dismissed', function(done) {
            var form = $('<form />'), spy = sinon.spy();
            el.wrap(form);
            form.on('submit', spy);
            el.find('button').click();
            expect(spy).to.not.been.called;
        });
    });      
});
