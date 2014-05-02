describe('CUI.Page', function () {
  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Page');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('page');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="page"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('page').toString()).to.eql('Page');
  });

  describe('API', function () {

    var element,
        widget;

    beforeEach(function () {
      element = $('<div></div>');
      widget = new CUI.Page({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.be.defined;
    });

  });

  describe('HTML', function () {

    describe('content panel', function () {

      var element,
          widget;

      it('should not add "actionBarHeight" class when there is no action-bar', function () {
        element = $('<div></div>');
        widget = new CUI.Page({
          element: element,
          generateActionBar: false
        });

        expect(element.find('.js-endor-content').length).to.eql(1);
        expect(element.find('.endor-Panel-content--actionBarHeight').length).to.eql(0);
      });

      it('should add "actionBarHeight" class when there is an action-bar', function () {
        element = $('<div></div>');
        widget = new CUI.Page({
          element: element,
          generateActionBar: true
        });

        expect(element.find('.js-endor-content').length).to.eql(1);
        expect(element.find('.endor-Panel-content--actionBarHeight').length).to.eql(1);
      });

    });
  });
});
