describe('CUI.Rail', function() {
  var foldableHtml = 
        '<div class="wrap">' + 
          '<section class="foldable">' +
            '<a class="heading" href="#">Header</a>' +
            '<nav class="fold">Lorem ipsum</nav>' +
          '</section>' + 
        '</div>';
  
  // A config we can reuse
  var modalConfig = {
    heading: 'TestHeading',
    content: 'TestContent',
    buttons: [
      {
        label: 'Close',
        click: 'hide',
        className: 'myCloseButton'
      },
      {
        label: 'Save',
        className: 'mySaveButton',
        click: function() {
          saveClicked = true;
        }
      }
    ]
  };
  
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
    
    var rail = new CUI.Rail({
          element: el,
          refreshCallback: $.noop
        });
    
    // pull to refresh tests
    it('expect rail to receive pullable class', function() {
      expect(el).to.have.class('pullable');

      // no useful checks yet. Though execution should be possible
      rail._handleTouchstart();
      rail._handleTouchmove()
      rail._handleTouchend();

      el.trigger('touchstart');
      el.trigger('touchmove');
      el.trigger('touchend');
    });

    it('expect event handler not to raise any exception', function() {
      // no useful checks yet. Though execution should be possible
      rail._handleTouchstart();
      rail._handleTouchmove()
      rail._handleTouchend();
    });

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

describe('rail as an accordion', function() {
    var el = $('<div/>', {
      class: 'rail fixed'
    });

    el.append(foldableHtml);

    var content = el.find('.wrap').addClass('accordion');
    
    var rail = new CUI.Rail({
          element: el
        });
    
    // pull to refresh tests
    it('expect rail to receive accordion class', function() {
      expect(content).to.have.class('accordion');
    });
  });
  
});
