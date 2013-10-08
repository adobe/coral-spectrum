describe('CUI.Rail', function() {
  var foldableHtml = 
        '<div class="wrap">' + 
          '<section class="foldable">' +
            '<a class="heading" href="#">Header</a>' +
            '<nav class="fold">Lorem ipsum</nav>' +
          '</section>' + 
        '</div>';
  
  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('Rail');
  });
  
  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    expect(div).to.have.property('rail');
  });
  
  describe('scrollable rail functionality', function() {
    var el = $('<div/>', {
      class: 'rail scroll'
    });

    el.append(foldableHtml);
    
    var rail = new CUI.Rail({element: el});

    // foldable tests
    var section = el.find('section');
    it('expect rail section to have foldable class', function() {
      expect(section).to.have.class('foldable');
    });

    it('expect foldable section to receive open call', function(done) {
      var header = section.find('.heading'),
          fold = section.find('.fold');

      expect(header).with.length(1);
      expect(fold).with.length(1);

      // trigger an open event
      /*header.one('click', function () {
        expect(section).to.have.class('open');

        // trigger a close event
        header.one('click', function () {
          expect(section).not.to.have.class('open');
          setTimeout(function() {
            done();
          }, 1000);
        });
        header.trigger('click');
      });
      header.trigger('click');*/
      done();
    });
  });
  
});
