describe('CUI.TagList', function () {


  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('TagList');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('tagList');
  });

  describe("from markup", function () {
    var html = '<ol class="coral-TagList" role="list">' +
      '<li role="listitem" class="coral-TagList-tag">' +
      '<button class="coral-MinimalButton coral-TagList-tag-removeButton" type="button" title="Remove">' +
      '<i class="coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>' +
      '</button>' +
      '<span class="coral-TagList-tag-label">Carrot</span>' +
      '<input type="hidden" value="carrot"/>' +
      '</li>' +
      '<li role="listitem" class="coral-TagList-tag">' +
      '<button class="coral-MinimalButton coral-TagList-tag-removeButton" type="button" title="Remove">' +
      '<i class="coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>' +
      '</button>' +
      '<span class="coral-TagList-tag-label">Banana</span>' +
      '<input type="hidden" value="banana"/>' +
      '</li>' +
      '<li role="listitem" class="coral-TagList-tag">' +
      '<button class="coral-MinimalButton coral-TagList-tag-removeButton" type="button" title="Remove">' +
      '<i class="coral-Icon coral-Icon--sizeXS coral-Icon--close"></i>' +
      '</button>' +
      '<span class="coral-TagList-tag-label">Banana</span>' +
      '<input type="hidden" value="banana"/>' +
      '</li>' +
      '</ol>';

    var el = $(html).tagList(),
      widget = el.data("tagList");

    it('should have dropdown object attached', function () {
      expect(widget).to.be.an("object");
    });

    it('should have the value banana in the private value store', function () {
      expect(widget._existingValues).to.include('banana');
    });

  });

  describe("API access", function () {
    var el = $('<ol/>', {
        'class': 'coral-Taglist'
      }).tagList(),
      widget = el.data("tagList");

    it('added value should be in private value store', function () {
      widget.addItem('tomato');
      expect(widget._existingValues).to.include('tomato');
    });

    it('added value should be in markup', function () {
      widget.addItem('pineapple');

      var input = el.find('input[value="pineapple"]');
      expect(input.length).to.equal(1);
    });

    it('removed value must not be in private value store', function () {
      widget.removeItem('tomato');
      expect(widget._existingValues).to.not.include('tomato');
    });

    it('added value should be in markup', function () {
      widget.removeItem('pineapple');

      var input = el.find('input[value="pineapple"]');
      expect(input.length).to.equal(0);
    });

    it ('getValues should not include removed item on itemremoved being triggered', function () {
      var values = widget.getValues();
      expect(values.length).to.equal(0);

      var spy = sinon.spy(function () {
        values = widget.getValues();
        expect(values.length).to.equal(0);
      });
      el.on('itemremoved', spy);

      widget.addItem('pineapple');
      widget.removeItem('pineapple');

      expect(spy.callCount).to.be(1);
    });

    it('added value in multiline mode', function () {
      widget.set('multiline', true);
      widget.addItem('many-many-tomatos');
      var multilineItem = widget.$element.find('.coral-TagList-tag input[value="many-many-tomatos"]').parent();

      expect(multilineItem).to.have.class('coral-TagList-tag--multiline');
    });

  });

  describe('Custom renderer', function () {
    var el, widget;

    beforeEach(function () {
      el = $('<ol/>', {
        'class': 'taglist'
      });
    });

    afterEach(function () {
      el = widget = null;
    });

    it('renders tag by html', function () {
      el.tagList({
        renderer: function(value, display) {
          return '<span>' + display + '</span>';
        }
      }).tagList('addItem', 'tomato');
      var span = el.find('span');
      expect(span.length).to.equal(1);
      expect(span).to.have.text('tomato');
    });

    it('renders tag by DOM element', function () {
      el.tagList({
        renderer: function(value, display) {
          return $('<span>' + display + '</span>')[0];
        }
      }).tagList('addItem', 'tomato');
      var span = el.find('span');
      expect(span.length).to.equal(1);
      expect(span).to.have.text('tomato');
    });

    it('renders tag by jQuery', function () {
      el.tagList({
        renderer: function(value, display) {
          return $('<span>' + display + '</span>');
        }
      }).tagList('addItem', 'tomato');
      var span = el.find('span');
      expect(span.length).to.equal(1);
      expect(span).to.have.text('tomato');
    });

    it('removes a tag', function () {
      var data = {
        display: 'tomato',
        value: 'tom'
      };
      el.tagList({
        renderer: function(value, display) {
          return $('' +
            '<span>' +
            display +
            '  <input type="hidden" value="' + value + '"/>' +
            '</span>');
        }
      }).tagList('addItem', data);
      var span = el.find('span');
      expect(el.find('span').length).to.equal(1);
      el.tagList('removeItem', 'tom');
      expect(el.find('span').length).to.equal(0);
    });

    it ('removes a tag through interaction', function () {
      var data = {
        display: 'tomato',
        value: 'tom'
      };

      el.tagList({
        renderer: function(value, display) {
          return $('' +
            '<span>' +
            display +
            '  <button type="button">Remove</button>' +
            '  <input type="hidden" value="' + value + '"/>' +
            '</span>');
        }
      }).tagList('addItem', data);

      expect(el.find('span').length).to.equal(1);
      el.find('button').trigger('click');
      expect(el.find('span').length).to.equal(0);
    });
  })

});
