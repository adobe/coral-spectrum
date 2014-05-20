describe('CUI.Select', function() {


  var cachedIsTouch = CUI.util.isTouch;

  afterEach(function() {
    CUI.util.isTouch = cachedIsTouch;
  });

  describe('definition', function() {
    // 'definition' block is a temporary workaround for kmiyashiro/grunt-mocha/issues/22
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Select');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('select');
    });
  });


  var minMarkup =  '<span class="coral-Select" data-init="select"></span>';

  var singleSelectMarkup = '<span class="coral-Select" data-init="select">' +
    '<button type="button" class="coral-Select-button coral-MinimalButton">' +
     '<span class="coral-Select-button-text">Select</span>' +
    '</button>' +
    '<select class="coral-Select-select">' +
    '<option value="1">One</option>' +
    '<option value="2">Two</option>' +
    '<option value="3">Three</option>'  +
    ' </select>'  +
    '</span>';

  var multiSelectMarkup = singleSelectMarkup.replace( '"coral-Select-select"', '"coral-Select-select" multiple="true"');

  var multiSelectPreselectedMarkup = multiSelectMarkup.replace( 'value="1"', 'value="1" selected')
                                                      .replace( 'value="3"', 'value="3" selected');


  var optGroupMarkup = '<span class="coral-Select" data-init="select">' +
    '<button type="button" class="coral-Select-button coral-MinimalButton">' +
      '<span class="coral-Select-button-text">Select</span>' +
    '</button>' +
    '<select class="coral-Select-select">' +
      '<optgroup label="Group 1">' +
        '<option value="1">One</option>' +
        '<option value="2">Two</option>' +
        '<option value="3">Three</option>' +
      '</optgroup>' +
        '<optgroup label="Group 2">'  +
        '<option value="4">Fourth</option>' +
        '<option value="5">Fifth</option>' +
      '</optgroup>' +
    ' </select>'  +
    '</span>';


  describe('SelectList/Taglist generation on desktop', function() {

    beforeEach(function() {
      CUI.util.isTouch = false;
    });

    it('should create empty selectList for minimal markup', function() {
      var widget = $(minMarkup).select().data('select');
      var selectList = widget._selectList;

      expect(selectList.length).to.equal(1);
      expect(selectList.children().length).to.equal(0);
    });

    it('should create populated selectList from normal markup', function() {
      var widget = $(singleSelectMarkup).select().data('select');
      var selectList = widget._selectList;

      expect(selectList.length).to.equal(1);
      expect(selectList.children().length).to.equal(3);


      var secondOption = selectList.children()[1];
      expect($(secondOption).data('value')).to.equal(2);
    });

    it('should create populated selectList from optgroup markup', function() {
      var widget = $(optGroupMarkup).select().data('select');
      var selectList = widget._selectList;
      expect(widget._selectList.length).to.equal(1);

      // two opt-groups
      expect(widget._selectList.children().length).to.equal(2);

      var optGroup = widget._selectList.children()[0];

      // and the first opt-group should have two items
      expect(optGroup.children.length).to.equal(2);

      // with a header
      var groupSpan = optGroup.children[0];
      expect($(groupSpan).text()).to.equal("Group 1");

      // and a list with three elements
      var list = optGroup.children[1];
      expect(list.children.length).to.equal(3);

      // and the second option to equal two
      var secondOption = list.children[1];
      expect($(secondOption).data('value')).to.equal(2);

    });


    it('should not create tagList for single select', function() {
      var widget = $(singleSelectMarkup).select().data('select');
      expect(widget._tagList.length).to.equal(0);
    });

    it('should create empty tagList for multi-select markup with no selections', function() {
      var widget = $(multiSelectMarkup).select().data('select');
      expect(widget._tagList.length).to.equal(1);
      expect(widget._tagList.children().length).to.equal(0);
    });

    it('should create populated tagList for multi-select preselected markup', function() {
      var widget = $(multiSelectPreselectedMarkup).select().data('select');
      expect(widget._tagList.length).to.equal(1);
      expect(widget._tagList.children().length).to.equal(2);
    });

  });

  describe('Native widget on desktop', function() {

    var markup, widget, element, select, selectList;

    beforeEach(function() {
      markup = $(singleSelectMarkup).attr('data-nativewidget', 'true');
      widget = markup.select().data('select');
      element = widget.$element;
      select = widget._select;
      selectList = widget._selectList;
    });

    afterEach(function() {
      element.remove();
      widget = element = select = selectList = null;
    });

    it('should be a native selectList', function() {
      expect(selectList.length).to.equal(0);
      expect(select).to.have.class('coral-Select-select--native');
    });

  });


  describe('SelectList generation on touch', function() {

    var widget, element, select, selectList;

    beforeEach(function() {
      CUI.util.isTouch = true;
      widget = $(singleSelectMarkup).select().data('select');
      element = widget.$element;
      select = widget._select;
      selectList = widget._selectList;
    });

    afterEach(function() {
      element.remove();
      widget = element = select = selectList = null;
    });

    it('should be a native selectList', function() {
      expect(selectList.length).to.equal(0);
      expect(select).to.have.class('coral-Select-select--native');
    });

  });


  describe('Selectlist visibility on desktop', function() {

    var widget, element, button, selectList;

    beforeEach(function() {
      CUI.util.isTouch = false;
      widget = $(singleSelectMarkup).select().data('select');
      element = widget.$element;
      button = widget._button;
      selectList = widget._selectList;
      element.appendTo(document.body);

    });

    afterEach(function() {
      element.remove();
      button.remove();
      selectList.remove();
      widget = element = button = selectList = null;
    });

    // Note these tests were cribbed from autocomplete. Dupe coverage here is
    // a good idea.

    it('should show the selectList on click', function() {
      button.trigger('click');
      expect(selectList).to.have.class('is-visible');
    });

    it('hides when toggle is clicked', function() {
      selectList.selectList('show');
      button.trigger('click');
      expect(selectList).not.to.have.class('is-visible');
    });

    it('hides on click outside', function() {
      selectList.selectList('show');
      $(document.body).trigger('click');
      expect(selectList).not.to.have.class('is-visible');
    });

    it('does not hide when clicking inside list', function() {
      selectList.selectList('show');
      selectList.trigger('click');
      expect(selectList).to.have.class('is-visible');
    });

  });

  describe('Selection Behavior on Desktop', function() {

    var widget, element, button, selectList, valueInput;

    beforeEach(function() {
      CUI.util.isTouch = false;
      widget = $(singleSelectMarkup).select().data('select');
      element = widget.$element;
      button = widget._button;
      selectList = widget._selectList;
      element.appendTo(document.body);

    });

    afterEach(function() {
      element.remove();
      button.remove();
      selectList.remove();
      widget = element = button = selectList = null;
    });


    it('should show "Two" when Value=2 event occurs', function() {
      selectList.trigger('click');

      var selectEvent = $.Event('selected', {
        selectedValue: '2',
        displayedValue: 'Two'
      });
      selectList.trigger(selectEvent);

      var buttonText = button.find('.coral-Select-button-text').text();
      expect(buttonText).to.equal('Two');
    });

    it('should have getValue()=2 when Value=2 event occurs', function() {
      selectList.trigger('click');

      var selectEvent = $.Event('selected', {
        selectedValue: '2',
        displayedValue: 'Two'
      });
      selectList.trigger(selectEvent);

      expect(widget.getValue()).to.equal('2');
    });

    it('should fire a "selected" event when the selectList fires an event', function() {
      var spy = sinon.spy();
      widget.on('selected', spy) ;

      var selectEvent = $.Event('selected', {
        selectedValue: '2',
        displayedValue: 'Two'
      });
      selectList.trigger(selectEvent);

      expect(spy.called).to.be.true;
    });

  });


  describe('Selection Behavior on touch/native', function() {

    var widget, element, button, select;

    beforeEach(function() {
      CUI.util.isTouch = true;
      widget = $(singleSelectMarkup).select().data('select');
      element = widget.$element;
      button = widget._button;
      select = widget._select;
      element.appendTo(document.body);

    });

    afterEach(function() {
      element.remove();
      button.remove();
      select.remove();
      widget = element = button = select = null;
    });

    it('should show "Two" when Value=2 event occurs', function() {

      // we have to manually trigger the change event
      select.val('2').trigger('change');

      var buttonText = button.find('.coral-Select-button-text').text();
      expect(buttonText).to.equal('Two');
    });

    it('should hav a value of "2" when Value=2 event occurs', function() {

      // simulate the select event
      select.val('2').trigger('change');

      expect(widget.getValue()).to.equal('2');
    });

    it('should fire a "selected" event when a value change occurs', function() {
      // we have to manually trigger the change event

      var spy = sinon.spy();
      widget.on('selected', spy) ;

      // simulate the select event
      select.val('2').trigger('change');
      expect(spy.called).to.be.true;
    });

  });


});
