describe('CUI.Brand', function () {

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Brand');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('brand');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="brand"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('brand').toString()).to.eql('Brand');
  });

  describe('HTML', function () {

    var element,
        widget;

    beforeEach(function () {

      element = $([
        '<a data-init="brand">',
        '<i class="endor-Brand-icon html-icon"></i>',
        'html-title',
        '</a>'
      ].join(''));

      widget = new CUI.Brand({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.be.defined;
    });

    it('should ingest preset title', function () {
      expect(widget.get('title')).to.eql('html-title');
    });

    it('should ingest preset icon class', function () {
      expect(widget.get('icon')).to.eql('html-icon');
    });

  });

  describe('API', function () {

    var element,
        widget;

    beforeEach(function () {

      element = $([
        '<div data-init="brand">',
        '</div>'
      ].join());

      widget = new CUI.Brand({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.exist;
    });

    it('should reflect set title', function () {
      var value = 'value';
      widget.setTitle(value);
      expect(element.contents()[1].textContent).eql(value);
    });

    it('should reflect set href', function () {
      var value = 'value';
      widget.setHref(value);
      expect(element.attr('href')).eql(value);
    });

    it('should reflect set icon', function () {
      var value = 'value';
      widget.setIcon(value);
      expect(element.children('i').hasClass(value)).to.be.true;
    });

    it('should emit event on click when href is falsy', function(){
      var callback = sinon.spy();

      widget.setHref('');
      element.on(CUI.Brand.EVENT_CLICK, callback);
      element.trigger('click');

      expect(callback.called).to.be.true;
    });

  });
});
