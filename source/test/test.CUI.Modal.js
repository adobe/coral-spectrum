describe('CUI.Modal', function() {
  var saveClicked = false;
  
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
    CUI.should.have.property('Modal');
  });
  
  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    div.should.have.property('modal');
  });
  
  describe('modal from template', function() {
    var el = $('<div/>').modal(modalConfig);
  
    it('should have correct CSS classname', function() {
      el.hasClass('modal').should.be.true;
    });
    
    it('should have correct markup', function() {
      el.find('.modal-header').should.have.length(1);
      el.find('.modal-body').should.have.length(1);
      el.find('.modal-footer').should.have.length(1);
    });
    
    it('should have correct heading', function() {
      el.find('.modal-header h2').html().should.equal('TestHeading');
    });
    
    it('should have correct content', function() {
      el.find('.modal-body').html().should.equal('TestContent');
    });
    
    it('should have buttons', function() {
      el.find('.modal-footer button').should.have.length(2);
    });
    
    it('should have button with correct class names', function() {
      el.find('.modal-footer button.myCloseButton').should.have.length(1);
      el.find('.modal-footer button.mySaveButton').should.have.length(1);
    });
    
    it('should be visible by default', function() {
      el.hasClass('in').should.be.true;
    });
  });
  
  describe('modal from markup', function() {
    var modalHTML = [
      '<div class="modal">',
      '<div class="modal-header">',
        '<h2>TestHeading</h2>',
        '<button type="button" class="close" data-dismiss="modal">&times;</button>',
      '</div>',
      '<div class="modal-body">TestContent</div>',
      '<div class="modal-footer"></div>',
      '</div>'
    ].join();
    
    var el = $(modalHTML);
    
    var modal = new CUI.Modal({
      element: el
    });
  
    it('should not overwrite heading', function() {
      el.find('.modal-header h2').html().should.equal('TestHeading');
    });
    
    it('should not overwrite content', function() {
      el.find('.modal-body').html().should.equal('TestContent');
    });
  });
  
  describe('click handlers', function() {
    it('should hide with X button', function() {
      var el = $('<div/>').modal(modalConfig);
      el.find('.modal-header button.close').click();
      
      el.hasClass('in').should.be.false;
    });
    
    it('should hide with custom button', function() {
      var el = $('<div/>').modal(modalConfig);
      el.find('.modal-footer button.myCloseButton').click();
      
      el.hasClass('in').should.be.false;
    });
    
    it('should execute button click handlers', function() {
      var el = $('<div/>').modal(modalConfig);
      el.find('.modal-footer button.mySaveButton').click();

      saveClicked.should.be.true;
    });
  });
  
  
  describe('options', function() {
    it('can set heading with class', function() {
      var el = $('<div/>');
      var modal = new CUI.Modal({
        element: el
      });
      modal.set('heading', 'TestHeading');
      
      el.find('.modal-header h2').html().should.equal('TestHeading');
    });
    
    it('can set heading with jQuery', function() {
      var el = $('<div/>').modal();
      el.modal({ heading: 'TestHeading' });
      
      el.find('.modal-header h2').html().should.equal('TestHeading');
    });
    
    it('can set content with class', function() {
      var el = $('<div/>');
      var modal = new CUI.Modal({
        element: el
      });
      modal.set('content', 'TestContent');
      
      el.find('.modal-body').html().should.equal('TestContent');
    });

    it('can set content with jQuery', function() {
      var el = $('<div/>').modal();
      el.modal({ content: 'TestContent' });
      
      el.find('.modal-body').html().should.equal('TestContent');
    });
    
    it('can set type with class', function() {
      var el = $('<div/>');
      var modal = new CUI.Modal({
        element: el
      });
      modal.set('type', 'error');
      
      el.hasClass('error').should.be.true;
    });

    it('can set type with jQuery', function() {
      var el = $('<div/>').modal();
      el.modal({ type: 'error' });
      
      el.hasClass('error').should.be.true;
    });
  });
  
});
