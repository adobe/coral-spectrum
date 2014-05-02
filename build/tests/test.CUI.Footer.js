describe('CUI.Footer', function () {

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Footer');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('footer');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="footer"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('footer').toString()).to.eql('Footer');
  });

  describe('Markup generation', function () {

    var $element,
        widget;

    beforeEach(function () {
      $element = $('<footer></footer>');
      widget = new CUI.Footer({element: $element});
    });

    it('should have init classes set', function () {
      expect($element.hasClass('endor-Footer')).to.be.true;
      expect($element.hasClass('endor-Panel-footer')).to.be.true;
    });

    it('should generate a link element', function () {
      expect($element.children('div.endor-Footer-links').length).to.eql(1);
    });

    it('should generate a copyright element', function () {
      expect($element.children('span.endor-Footer-copyright').length).to.eql(1);
    });

  });

  describe('Markup preservation', function () {

    var $element,
        $links,
        $copyright;

    beforeEach(function () {
      $element = $('<footer></footer>');
      $copyright = $('<span>').addClass('endor-Footer-copyright').appendTo($element);
      $links = $('<div>').addClass('endor-Footer-links').appendTo($element);
      new CUI.Footer({element: $element});
    });

    it('should preserve set link element', function () {
      expect($element.children('div.endor-Footer-links').get(0)).to.eql($links.get(0));
    });

    it('should preserve set copyright element', function () {
      expect($element.children('span.endor-Footer-copyright').get(0)).to.eql($copyright.get(0));
    });

  });

  describe('API', function () {

    var $element,
        widget;

    beforeEach(function () {
      $element = $('<footer></footer>');
      widget = new CUI.Footer({element: $element, copyright: 'copyright'});
    });

    it('should set the copyright', function () {
      expect($element.children('span.endor-Footer-copyright').text()).to.eql('copyright');
    });

    it('should reset the copyright', function () {
      widget.setCopyright('copyright-v2');
      expect($element.children('span.endor-Footer-copyright').text()).to.eql('copyright-v2');
    });

    it('should add an item', function () {
      var item = $('<a>').text('item');
      var result = widget.addItem(item);

      expect(result.get(0)).to.eql(item.get(0));
    });

    it('should add items', function () {
      var items = [ $('<a>').text('item1'), $('<a>').text('item2') ];
      var result = widget.addItem(items);

      expect(result[0].get(0)).to.eql(items[0].get(0));
      expect(result[1].get(0)).to.eql(items[1].get(0));
    });

    it('should remove an item', function (){
      var items = widget.addItem(['<a></a>', '<a></a>', '<a></a>']);
      expect($element.find('.endor-Footer-item').length).to.eql(3);

      var result = widget.removeItem(items[0]);
      expect($element.find('.endor-Footer-item').length).to.eql(2);
    });

  });

});
