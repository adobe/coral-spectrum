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
    expect(CUI).to.have.property('Modal');
  });
  
  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    expect(div).to.have.property('modal');
  });
  
  describe('modal from template', function() {
    var el = $('<div/>').modal(modalConfig);
  
    it('should have correct CSS classname', function() {
      expect(el.hasClass('modal')).to.be.true;
    });
    
    it('should have correct markup', function() {
      expect(el.find('.modal-header')).with.length(1);
      expect(el.find('.modal-body')).with.length(1);
      expect(el.find('.modal-footer')).with.length(1);
    });
    
    it('should have correct heading', function() {
      expect(el.find('.modal-header h2').html()).to.equal('TestHeading');
    });
    
    it('should have correct content', function() {
      expect(el.find('.modal-body').html()).to.equal('TestContent');
    });
    
    it('should have buttons', function() {
      expect(el.find('.modal-footer button')).with.length(2);
    });
    
    it('should have button with correct class names', function() {
      expect(el.find('.modal-footer button.myCloseButton')).with.length(1);
      expect(el.find('.modal-footer button.mySaveButton')).with.length(1);
    });
    
    it('should be visible by default', function() {
      expect(el.hasClass('in')).to.be.true;
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
      expect(el.find('.modal-header h2').html()).to.equal('TestHeading');
    });
    
    it('should not overwrite content', function() {
      expect(el.find('.modal-body').html()).to.equal('TestContent');
    });
  });
  
  describe('click handlers', function() {
    it('should hide with X button', function() {
      var el = $('<div/>').modal(modalConfig);
      el.find('.modal-header button.close').click();
      
      expect(el.hasClass('in')).to.be.false;
    });
    
    it('should hide with custom button', function() {
      var el = $('<div/>').modal(modalConfig);
      el.find('.modal-footer button.myCloseButton').click();
      
      expect(el.hasClass('in')).to.be.false;
    });
    
    it('should execute button click handlers', function() {
      var el = $('<div/>').modal(modalConfig);
      el.find('.modal-footer button.mySaveButton').click();

      expect(saveClicked).to.be.true;
    });
  });
  
  
  describe('options', function() {
    it('can set heading with class', function() {
      var el = $('<div/>');
      var modal = new CUI.Modal({
        element: el
      });
      modal.set('heading', 'TestHeading');
      
      expect(el.find('.modal-header h2').html()).to.equal('TestHeading');
    });
    
    it('can set heading with jQuery', function() {
      var el = $('<div/>').modal();
      el.modal({ heading: 'TestHeading' });
      
      expect(el.find('.modal-header h2').html()).to.equal('TestHeading');
    });
    
    it('can set content with class', function() {
      var el = $('<div/>');
      var modal = new CUI.Modal({
        element: el
      });
      modal.set('content', 'TestContent');
      
      expect(el.find('.modal-body').html()).to.equal('TestContent');
    });

    it('can set content with jQuery', function() {
      var el = $('<div/>').modal();
      el.modal({ content: 'TestContent' });
      
      expect(el.find('.modal-body').html()).to.equal('TestContent');
    });
    
    it('can set type with class', function() {
      var el = $('<div/>');
      var modal = new CUI.Modal({
        element: el
      });
      modal.set('type', 'error');
      
      expect(el.hasClass('error')).to.be.true;
    });

    it('can set type with jQuery', function() {
      var el = $('<div/>').modal();
      el.modal({ type: 'error' });
      
      expect(el.hasClass('error')).to.be.true;
    });
  });
  
});
