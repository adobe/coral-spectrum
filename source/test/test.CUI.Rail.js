describe('CUI.Rail', function() {
  var htmlWithPtr = 
      '<div class="rail">' + 
        '<div class="pull-to-refresh">' + 
          '<div class="icon"></div>' + 
          '<div class="message">' + 
            '<i class="arrow"></i>' + 
            '<i class="spinner large"></i>' + 
            '<span class="pull">Pull to refresh</span>' + 
            '<span class="release">Release to refresh</span>' + 
            '<span class="loading">Loading</span>' + 
          '</div>' + 
        '</div>' + 
        '<div class="wrap">' + 
          'Place your content here.' + 
        '</div>' + 
      '</div>',
      html = 
      '<div class="rail">' + 
        '<div class="wrap">' + 
          'Place your content here.' + 
        '</div>' + 
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
  
  describe('pull-to-request from markup', function() {
    var el = $('<div/>');
    
    var modal = new CUI.Rail({
      element: el,
      refreshCallback: $.noop
    });
  
    it('expect rail to receive pullable class', function() {
      expect(el).to.have.class('pullable');
    });
  });
  
});
