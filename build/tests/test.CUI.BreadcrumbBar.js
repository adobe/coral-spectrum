describe('CUI.BreadcrumbBar', function () {
  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('BreadcrumbBar');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('breadcrumbBar');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="breadcrumb-bar"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('breadcrumbBar').toString()).to.eql('BreadcrumbBar');
  });

  describe('Markup generation bare', function () {

    var $element,
        widget;

    beforeEach(function () {
      $element = $([
        '<div>',
        '<nav data-init="crumbs">',
        '  <a class="endor-Crumbs-item" href="#">Experience Manager</a>',
        '  <a class="endor-Crumbs-item ' + CUI.Crumbs.CLASS_ITEM_NONAVIGATION + '" href="#">Siteadmin</a>',
        '  <a class="endor-Crumbs-item ' + CUI.Crumbs.CLASS_ITEM_UNAVAILABLE + '" href="#">Siteadmin</a>',
        '</nav></div>'].join(''));
      widget = new CUI.BreadcrumbBar({element: $element});
    });

    afterEach(function () {
      widget.destruct();
      $element.remove();
      $element = null;
    });

    it('should have init classes set', function () {
      expect($element.hasClass('endor-Panel-header')).to.be.true;
      expect($element.hasClass('endor-BreadcrumbBar')).to.be.true;
    });

    it('should add a close indicator', function () {
      expect($element.children('div.endor-BreadcrumbBar-closeIndicator').length).to.equal(1);
    });

    it('should not close on click', function () {
      $element.trigger('click');
      expect(widget.getIsClosed()).to.be.false;
    });

    it('should close on indicator click', function () {
      var closeIndicator = $element.children('div.endor-BreadcrumbBar-closeIndicator').get(0);

      var event = jQuery.Event('click');
      $element.find('div.endor-BreadcrumbBar-closeIndicator > i').eq(0).trigger(event);

      expect(widget.getIsClosed()).to.be.true;
    });

    it('should not close on nav click', function () {
      $element.find('nav > a').eq(0).trigger('click');
      expect(widget.getIsClosed()).to.be.false;
    });

    it('should not close on non-nav click', function () {
      $element.find('nav > a').eq(1).trigger('click');
      expect(widget.getIsClosed()).to.be.false;
    });

    it('should not close on unavailable click', function () {
      $element.find('nav > a').eq(2).trigger('click');
      expect(widget.getIsClosed()).to.be.false;
    });

  });

  describe('Markup generation decorated', function () {

    var $element,
        widget;

    beforeEach(function () {

      $element = $([
        '<div data-close-on-navigate="true" data-close-on-click="true" data-hide-close-indicator="true">',
        '<nav data-init="crumbs">',
        '  <a class="endor-Crumbs-item" href="#">Experience Manager</a>',
        '  <a class="endor-Crumbs-item ' + CUI.Crumbs.CLASS_ITEM_NONAVIGATION + '" href="#">Siteadmin</a>',
        '  <a class="endor-Crumbs-item ' + CUI.Crumbs.CLASS_ITEM_UNAVAILABLE + '" href="#">Siteadmin</a>',
        '</nav></div>'].join(''));

      $element.breadcrumbBar();
      widget = $element.data('breadcrumbBar');
    });

    afterEach(function () {
      widget.destruct();
      $element.remove();
      $element = null;
    });

    it('should not have a close indicator', function () {
      expect($element.children('div.endor-BreadcrumbBar-closeIndicator').length).to.equal(0);
    });

    it('should close on click', function () {
      $element.trigger('click');
      expect(widget.getIsClosed()).to.be.true;
    });

    it('should close on nav click', function () {
      $element.find('nav > a').eq(0).trigger('click');
      expect(widget.getIsClosed()).to.be.true;
    });

    it('should close on non-nav click', function () {
      $element.find('nav > a').eq(1).trigger('click');
      expect(widget.getIsClosed()).to.be.true;
    });

    it('should close on unavailable click', function () {
      $element.find('nav > a').eq(2).trigger('click');
      expect(widget.getIsClosed()).to.be.true;
    });

  });

  describe('API', function () {

    var $element,
        widget;

    beforeEach(function () {
      $element = $([
        '<div class="endor-Panel-header endor-BreadcrumbBar is-closed">',
        '  <nav class="endor-Crumbs">',
        '    <a class="endor-Crumbs-item" href="/amc"> <i class="coral-Icon coral-Icon--adobeExperienceManager coral-Icon--sizeM"></i>',
        '      Adobe Marketing Cloud',
        '    </a>',
        '    <a class="endor-Crumbs-item endor-Crumbs-item--ellipsis" href="#"></a>',
        '    <a class="endor-Crumbs-item" href="/em">Experience Manager</a>',
        '    <a class="endor-Crumbs-item" href="/sites">Siteadmin</a>',
        '    <span class="endor-Crumbs-item endor-Crumbs-item--unavailable">Settings</span>',
        '  </nav>',
        '  <div class="endor-BreadcrumbBar-closeIndicator">',
        '    <i class="coral-Icon coral-Icon--chevronUp coral-Icon--sizeS"></i>',
        '  </div>',
        '</div>'].join(''));

      widget = new CUI.BreadcrumbBar({element: $element});

    });

    it('should be initially closed', function () {
      expect(widget.get('isClosed')).to.be.true;
    });

  });
});