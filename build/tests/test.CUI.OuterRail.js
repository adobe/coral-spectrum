describe('CUI.OuterRail', function () {

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('OuterRail');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('outerRail');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="outer-rail"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('outerRail').toString()).to.eql('OuterRail');
  });

  describe('HTML', function () {

    var elementHTML = [
          '<div data-init="outer-rail">',
          '</div>'
        ].join(),
        element,
        widget;

    beforeEach(function () {
      element = $(elementHTML);
      widget = new CUI.OuterRail({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.be.defined;
    });

    it('should default to dark ui', function () {
      expect(widget.get('theme')).to.eql('dark');
      expect(widget.$element).to.have.class('coral--dark');
    });

    it('should not have dark class when theme is not dark', function () {
      var element = $(elementHTML);
      var widget = new CUI.OuterRail({ element: element, theme: 'light'});

      expect(widget.get('theme')).to.eql('light');
      expect(widget.$element).to.not.have.class('coral--dark');

    });


  });

  describe('API', function () {

    var element,
        widget;

    beforeEach(function () {

      element = $([
        '<div data-init="outer-rail">',
        '</div>'
      ].join());

      widget = new CUI.OuterRail({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.exist;
    });

  });
});
