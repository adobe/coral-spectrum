describe('CUI.BlackBar', function () {

  var SELECTOR_NAV_TOGGLE = '.endor-BlackBar-nav',
      SELECTOR_BACK_BUTTON = '.endor-BlackBar-back',
      SELECTOR_TITLE = '.endor-BlackBar-title',
      SELECTOR_RIGHT_CONTENTS = '.endor-BlackBar-right';

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('BlackBar');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('blackBar');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="black-bar"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('blackBar').toString()).to.eql('BlackBar');
  });

  var $element,
      widget;

  describe('Markup generation', function () {

    beforeEach(function () {
      $element = $('<div></div>');
      widget = new CUI.BlackBar({element: $element});
    });

    afterEach(function () {
      $element.remove();
      widget.destruct();
    });

    it('should have init classes set', function () {
      expect($element.hasClass('endor-BlackBar')).to.be.true;
    });

    it('should gen nav toggle', function () {
      expect($element.children(SELECTOR_NAV_TOGGLE).length).to.eql(1);
    });

    it('should gen back button', function () {
      expect($element.children(SELECTOR_BACK_BUTTON).length).to.eql(1);
    });

    it('should gen title button', function () {
      expect($element.children(SELECTOR_TITLE).length).to.eql(1);
    });

    it('should gen right hand side container', function () {
      expect($element.children(SELECTOR_RIGHT_CONTENTS).length).to.eql(1);
    });

  });

  describe('Markup generation, options set', function () {

    function construct(options) {
      $element = $('<div></div>');
      widget = new CUI.BlackBar($.extend({element: $element}, options));
    }

    it('should not gen nav toggle', function () {
      construct({ noNavToggle: true });
      expect($element.children(SELECTOR_NAV_TOGGLE).length).to.eql(0);
    });

    it('should not gen back button', function () {
      construct({ noBackButton: true });
      expect($element.children(SELECTOR_BACK_BUTTON).length).to.eql(0);
    });

    it('should not gen title button', function () {
      construct({ noTitle: true });
      expect($element.children(SELECTOR_TITLE).length).to.eql(0);
    });

  });

  describe('Eventing', function () {

    beforeEach(function () {
      $element = $('<div></div>');
      widget = new CUI.BlackBar({element: $element});
    });

    afterEach(function () {
      $element.remove();
      widget.destruct();
    });

    it('should emit title click on title click', function () {
      var handler = sinon.spy();
      widget.on(CUI.BlackBar.EVENT_TITLE_CLICK, handler);
      $element.find(SELECTOR_TITLE).trigger('click');
      expect(handler.called).to.be.true;
    });

    it('should emit back click on back click', function () {
      var handler = sinon.spy();
      widget.on(CUI.BlackBar.EVENT_BACK_BUTTON_CLICK, handler);
      $element.find(SELECTOR_BACK_BUTTON).trigger('click');
      expect(handler.called).to.be.true;
    });

  });

  describe('API', function () {

    beforeEach(function () {
      $element = $('<div>');
      widget = new CUI.BlackBar({element: $element});
    });

    afterEach(function () {
      $element.remove();
      widget.destruct();
    });

    it('should set title', function () {
      widget.setTitle('title');
      expect(widget.get('title')).to.equal('title');
      expect($element.find('.endor-BlackBar-title').html()).to.eql('title');
    });

    it('should return .getRightContainer correctly', function () {
      expect(widget.getRightContainer().get(0)).to.eql($element.children(SELECTOR_RIGHT_CONTENTS).get(0));
    });

    it('should add an item correctly', function () {
      var item = widget.addItem('<div>');
      expect(widget.getRightContainer().children(item).length).to.eql(1);
    });

    it('should add an item correctly, marked as text', function () {
      var item = widget.addItem('<div>', { isText: true });
      expect(item.hasClass('endor-BlackBar-item--text')).to.be.true;
    });
  });


});
