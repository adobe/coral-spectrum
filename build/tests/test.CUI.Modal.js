describe('CUI.Modal', function() {

  var saveClicked = false;

  var el, modal, modalHTML = [
    '<div class="coral-Modal" id="modal">',
      '<div class="coral-Modal-header">',
        '<h2>Test Heading</h2>',
        '<button class="coral-Button coral-Modal-closeButton" title="Close" data-dismiss="modal">',
          '<i class="coral-Button-icon coral-Icon coral-Icon--xsmall coral-Icon--close"></i>',
        '</button>',
      '</div>',
      '<div class="coral-Modal-body">',
        '<p>Test Content</p>',
      '</div>',
      '<div class="coral-Modal-footer">',
        '<button class="coral-Button" data-dismiss="modal">Close</button>',
        '<button class="coral-Button coral-Button--primary" data-dismiss="modal">Save</button>',
      '</div>',
    '</div>'
  ].join('');


    var clickTarget = function(target) {
    if (CUI.util.isTouch) {
      target.trigger('tap');
    } else {
      target.trigger('click');
    }
  };

  describe('definition', function() {
    // 'definition' block is a temporary workaround for kmiyashiro/grunt-mocha/issues/22
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Modal');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('modal');
    });
  });


  describe('modal from markup', function() {

    beforeEach(function(){
      el = $(modalHTML).appendTo('body');
    });

    afterEach(function(){
      el.detach();
    });

    var modal = new CUI.Modal({
      element: el
    });

    // TODO: fix these tests
    // it should work as below, but Modal is a bit weird?
    // see the click handler tests below

    // it('should hide with X button', function() {
    //   expect(el).to.have.css('display', 'block');
    //   var closeButton = el.find('.coral-Modal-closeButton')
    //   clickTarget(closeButton);
    //   expect(el).to.have.css('display', 'none');
    // });

  });

  // describe('click handlers', function() {
    // it('should hide with X button', function() {
    //   var el = $('<div/>').modal(modalConfig);
    //   el.find('.coral-Modal-header button.coral-Modal--closeButton').click();

    //   expect(el.hasClass('in')).to.be.false;
    // });

  //   it('should hide with custom button', function() {
  //     var el = $('<div/>').modal(modalConfig);
  //     el.find('.modal-footer button.myCloseButton').click();

  //     expect(el.hasClass('in')).to.be.false;
  //   });

    // TODO: fix and re-enable test (https://issues.adobe.com/browse/CUI-571)
//    it('should execute button click handlers', function() {
//      var el = $('<div/>').modal(modalConfig);
//      el.find('.modal-footer button.mySaveButton').click();
//
//      expect(saveClicked).to.be.true;
//    });
  // });


  describe('Class construction', function() {
    var modal, el;

    it('without options should not overwrite heading', function() {
      el = $(modalHTML).appendTo('body');
      modal = new CUI.Modal({
        element: el
      });
      expect(el.find('.coral-Modal-header h2')).to.have.html('Test Heading');
    });

    it('without options should not overwrite body', function() {
      el = $(modalHTML).appendTo('body');
      modal = new CUI.Modal({
        element: el
      });
      expect(el.find('.coral-Modal-body p')).to.have.html('Test Content');
    });

    it('can set \'heading\' option', function(){
      el = $(modalHTML).appendTo('body');
      expect(el.find('.coral-Modal-header h2')).to.have.html('Test Heading');
      modal = new CUI.Modal({
        element: el,
        heading: 'Expected Heading'
      });
      expect(el.find('.coral-Modal-header h2')).to.have.html('Expected Heading');
    });

    it('can set \'content\' option', function(){
      el = $(modalHTML).appendTo('body');
      expect(el.find('.coral-Modal-body p')).to.have.html('Test Content');
      modal = new CUI.Modal({
        element: el,
        content: 'Expected Content'
      });
      expect(el.find('.coral-Modal-body')).to.have.html('Expected Content');
    });

    it('can set \'type\' option', function(){
      el = $(modalHTML).appendTo('body');
      expect(el).to.not.have.class('coral-Modal--error');
      modal = new CUI.Modal({
        element: el,
        type: 'error'
      });
      expect(el).to.have.class('coral-Modal--error');
    });

  });

  // Note that these test rely on (a) jQuery constructors that we're about
  // the deprecate and (b) jQuery constructors allow to recycle element
  // targets that already have a modal widget attached:
  describe('jQuery construction', function() {
    var modal, el;

    beforeEach(function(){
      el = $(modalHTML).appendTo('body');
      modal = el.modal();
    });

    it('without options should not overwrite heading', function() {
      expect(modal.find('.coral-Modal-header h2')).to.have.html('Test Heading');
    });

    it('without options should not overwrite body', function() {
      expect(el.find('.coral-Modal-body p')).to.have.html('Test Content');
    });

    it('can set \'heading\'', function() {
      expect(el.find('.coral-Modal-header h2')).to.not.have.html('TestHeading');
      el.modal({ heading: 'TestHeading' });
      expect(el.find('.coral-Modal-header h2')).to.have.html('TestHeading');
    });

    it('can set \'content\'', function() {
      expect(el.find('.coral-Modal-body')).to.not.have.html('TestContent');
      el.modal({ content: 'TestContent' });
      expect(el.find('.coral-Modal-body')).to.have.html('TestContent');
    });

    it('can set \'type\'', function() {
      el.modal({ type: 'error' });
      expect(el).to.have.class('coral-Modal--error');
    });

    it('can set \'buttons\'', function(){
      var primaryButton = el.find('.coral-Button--primary');
      expect(primaryButton.length).to.equal(1);
      expect(primaryButton.html()).to.equal('Save');

      var buttonConfig = [
        {
          label: 'Submit',
          className: 'coral-Button--primary'
        }
      ];

      el.modal({ buttons: buttonConfig });

      primaryButton = el.find('.coral-Button--primary');
      expect(primaryButton.length).to.equal(1);
      expect(primaryButton.html()).to.not.equal('Save');
      expect(primaryButton.html()).to.equal('Submit');

      expect(primaryButton).to.have.class("coral-Button");
    });

  });

  describe('Widget #set function', function() {
    var modal, el;

    beforeEach(function(){
      el = $(modalHTML).appendTo('body');
      modal = new CUI.Modal({
        element: el
      });
    });

    it('can set \'heading\'', function() {
      expect(el.find('.coral-Modal-header h2')).to.not.have.html('TestHeading');
      modal.set('heading', 'TestHeading');
      expect(el.find('.coral-Modal-header h2')).to.have.html('TestHeading');
    });

    it('can set \'content\'', function() {
      expect(el.find('.coral-Modal-body')).to.not.have.html('TestContent');
      modal.set('content', 'TestContent');
      expect(el.find('.coral-Modal-body')).to.have.html('TestContent');
    });

    it('can set \'type\'', function() {
      expect(el).to.not.have.class('coral-Modal--error');
      modal.set('type', 'error');
      expect(el).to.have.class('coral-Modal--error');
    });

  });

});
