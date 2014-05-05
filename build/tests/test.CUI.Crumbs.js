describe('CUI.Crumbs', function () {
  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Crumbs');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('crumbs');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var nav = $('<nav data-init="crumbs"/>');
    nav.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(nav.data('crumbs').toString()).to.eql('Crumbs');
  });

  describe('API', function () {

    var element,
        widget,
        itemsSelector = '.endor-Crumbs-item';

    beforeEach(function () {

      element = $([
        '<nav class="endor-Crumbs" data-init="crumbs">',
        '</nav>'
      ].join());

      widget = new CUI.Crumbs({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.be.defined;
    });

    it('should add a crumb for title and href', function () {
      var title = 'title',
          href = 'href';

      expect(element.find(itemsSelector).length).to.eql(0);

      widget.addItem(title, href);

      var items = element.find(itemsSelector);
      expect(items.length).to.eql(1);

      var anchor = items.eq(0);
      expect(anchor.text()).to.eql(title);
      expect(anchor.attr('href')).to.eql(href);
    });

    it('should add a crumb for an object', function () {
      var object = {
        title: 'title',
        href: 'href'
      };

      expect(element.find(itemsSelector).length).to.eql(0);

      widget.addItem(object);

      var items = element.find(itemsSelector);
      expect(items.length).to.eql(1);

      var anchor = items.eq(0);
      expect(anchor.text()).to.eql(object.title);
      expect(anchor.attr('href')).to.eql(object.href);
    });

    it('should add a crumb for an element', function () {
      var object = {
        title: 'title',
        href: 'href'
      };

      expect(element.find(itemsSelector).length).to.eql(0);

      var $anchor = $('<a class="endor-Crumbs-item" href="href">title</a>');

      widget.addItem($anchor);

      var items = element.find(itemsSelector);
      expect(items.length).to.eql(1);

      var anchor = items.eq(0);
      expect(anchor.text()).to.eql('title');
      expect(anchor.attr('href')).to.eql('href');
    });

    it('should remove and return a crumb', function () {
      widget.addItem('link1', 'href');
      var crumb = widget.addItem('link2', 'href');

      expect(element.find(itemsSelector).length).to.eql(2);

      var removed = widget.removeItem();

      expect(element.find(itemsSelector).length).to.eql(1);
      expect(removed.get(0)).to.equal(crumb.get(0));
    });

    it('should ignore remove and return no elements when there are no crumbs', function () {
      var removed = widget.removeItem();
      expect(removed.length).to.eql(0);
    });

    it('should remove all crumbs, and return crumbs', function () {
      var crumb1 = widget.addItem('link1', 'href');
      var crumb2 = widget.addItem('link2', 'href');
      var removed = widget.removeAllItems();

      expect(element.find(itemsSelector).length).to.eql(0);
      expect(removed.eq(0).get(0)).to.equal(crumb1.get(0));
      expect(removed.eq(1).get(0)).to.equal(crumb2.get(0));
    });

    it('should ignore removesAllItems and return no elements when there are no crumbs', function () {
      var removed = widget.removeItem();
      expect(removed.length).to.eql(0);
    });

    it ('should return empty on getLastNavigableItem for an empty list of items', function (){
      var previous = widget.getLastNavigableItem();
      expect(previous.length).to.eql(0);
    });

    it ('should return correctly on getLastNavigableItem for a plain list items', function (){
      var crumb1 = widget.addItem('link1', 'href');
      var crumb2 = widget.addItem('link2', 'href');
      var crumb3 = widget.addItem('link3', 'href');
      var previous = widget.getLastNavigableItem();
      expect(previous.get(0)).to.equal(crumb3.get(0));
    });

    it ('should skip non navigable items on getLastNavigableItem', function (){
      var crumb1 = widget.addItem('link1', 'href');
      var crumb2 = widget.addItem('link2', 'href');
      var crumb3 = widget.addItem('link3', 'href');
      widget.addItem({title: 'title', href:'', isAvailable: false});
      widget.addItem({title: 'title', href:'', isNavigable: false});

      var previous = widget.getLastNavigableItem();
      expect(previous.get(0)).to.equal(crumb3.get(0));
    });

    it ('should skip non available items on getLastNavigableItem', function (){
      var crumb1 = widget.addItem('link1', 'href');
      var crumb2 = widget.addItem('link2', 'href');
      var crumb3 = widget.addItem('link3', 'href');
      widget.addItem({title: 'title', href:'', isNavigable: false});
      widget.addItem({title: 'title', href:'', isAvailable: false});

      var previous = widget.getLastNavigableItem();
      expect(previous.get(0)).to.equal(crumb3.get(0));
    });

    it ('should return the currently set crumbs', function (){
      expect(widget.getItems().length).to.eql(0);
      var crumb1 = widget.addItem('link1', 'href');
      expect(widget.getItems().length).to.eql(1);
      var crumb2 = widget.addItem('link2', 'href');
      expect(widget.getItems().length).to.eql(2);
      var crumb3 = widget.addItem('link3', 'href');
      expect(widget.getItems().length).to.eql(3);

      var items = widget.getItems();
      expect(items.eq(0).is(crumb1)).to.be.true;
      expect(items.eq(1).is(crumb2)).to.be.true;
      expect(items.eq(2).is(crumb3)).to.be.true;
    });


  });
});
