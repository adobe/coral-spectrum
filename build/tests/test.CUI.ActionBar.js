describe('CUI.ActionBar', function () {

  var SELECTOR_LEFT = '.endor-ActionBar-left',
      SELECTOR_RIGHT = '.endor-ActionBar-right';

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('ActionBar');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('actionBar');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="action-bar"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('actionBar').toString()).to.eql('ActionBar');
  });

  describe('Markup generation', function () {

    var $element,
        widget;

    beforeEach(function () {
      $element = $('<div></div>');
      widget = new CUI.ActionBar({element: $element});
    });

    it('should have init classes set', function () {
      expect($element.hasClass('endor-ActionBar')).to.be.true;
    });

    it('should generate left container',  function () {
      expect($element.children(SELECTOR_LEFT).length).to.eql(1);
    });

    it('should generate right container',  function () {
      expect($element.children(SELECTOR_RIGHT).length).to.eql(1);
    });

  });

  describe('API', function () {
    var $element,
        $container,
        widget;

    beforeEach(function () {
      $element = $('<div></div>');
      $container = $('<div class="endor-ActionBar-left"></div>').appendTo($element);
      widget = new CUI.ActionBar({element: $element});
    });

    it('should return .getLeftContainer correctly', function () {
      expect(widget.getLeftContainer().get(0)).to.eql($container.get(0));
    });

    it('should return .getRightContainer correctly', function () {
      expect(widget.getRightContainer().get(0)).to.eql($element.children(SELECTOR_RIGHT).get(0));
    });

    it('should add an item correctly', function () {
      var item = widget.addItem('<div>');
      expect(widget.getLeftContainer().children(item).length).to.eql(1);
    });

    it('should add an item correctly, to the right', function () {
      var item = widget.addItem('<div>', { right: true });
      expect(widget.getRightContainer().children(item).length).to.eql(1);
    });

    it('should add an item correctly, marked as text', function () {
      var item = widget.addItem('<div>', { isText: true });
      expect(item.hasClass('endor-ActionBar-item--text')).to.be.true;
    });
  });

});
