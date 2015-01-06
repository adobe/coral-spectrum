describe('CUI.Select', function() {

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

  var dynamicMarkup =
    '<span class="coral-Select" data-init="select">' +
    '  <button type="button" class="coral-Select-button coral-MinimalButton">' +
    '    <span class="coral-Select-button-text">Select</span>' +
    '  </button>' +
    '  <input type="hidden">' +
    '  <ul class="coral-SelectList"></ul>' +
    '</span>';

  var singleSelectMarkup =
    '<span class="coral-Select" data-init="select">' +
    '  <button type="button" class="coral-Select-button coral-MinimalButton">' +
    '    <span class="coral-Select-button-text">One</span>' +
    '  </button>' +
    '  <select class="coral-Select-select">' +
    '    <option value="1">One</option>' +
    '    <option value="2">Two</option>' +
    '    <option value="3">Three</option>'  +
    '  </select>'  +
    '</span>';

  var singleSelectPreselectedMarkup = singleSelectMarkup.replace('value="2"', 'value="2" selected');

  var multiSelectMarkup = singleSelectMarkup
    .replace('"coral-Select-select"', '"coral-Select-select" multiple="true"')
    .replace('<span class="coral-Select-button-text">One</span>', '<span class="coral-Select-button-text">Select</span>');

  var multiSelectPreselectedMarkup = multiSelectMarkup.replace( 'value="1"', 'value="1" selected')
                                                      .replace( 'value="3"', 'value="3" selected');

  var disabledSelectMarkup = singleSelectMarkup.replace("coral-Select-button", "coral-Select-button is-disabled");

  var optGroupMarkup =
    '<span class="coral-Select" data-init="select">' +
    '  <button type="button" class="coral-Select-button coral-MinimalButton">' +
    '    <span class="coral-Select-button-text">Select</span>' +
    '  </button>' +
    '  <select class="coral-Select-select">' +
    '    <optgroup label="Group 1">' +
    '      <option value="1">One</option>' +
    '      <option value="2">Two</option>' +
    '      <option value="3">Three</option>' +
    '    </optgroup>' +
    '    <optgroup label="Group 2">'  +
    '      <option value="4">Fourth</option>' +
    '      <option value="5">Fifth</option>' +
    '    </optgroup>' +
    '  </select>'  +
    '</span>';


  describe('Initialization/Setup', function() {

    it('should create empty selectList for minimal markup', function() {
      var widget = $(minMarkup).select().data('select');
      var selectList = widget.$element.find(".coral-SelectList");

      expect(selectList.length).to.equal(1);
      expect(selectList.children().length).to.equal(0);
    });

    it('should create populated selectList from normal markup', function() {
      var widget = $(singleSelectMarkup).select().data('select');
      var selectList = widget.$element.find(".coral-SelectList");

      expect(selectList.length).to.equal(1);
      expect(selectList.children().length).to.equal(3);

      var secondOption = selectList.children().eq(1);
      expect(secondOption.data('value')).to.equal(2);
    });

    it('should create populated selectList from optgroup markup', function() {
      var widget = $(optGroupMarkup).select().data('select');
      var selectList = widget.$element.find(".coral-SelectList");
      expect(selectList.length).to.equal(1);

      // two opt-groups
      expect(selectList.children().length).to.equal(2);

      var optGroup = selectList.children()[0];

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
      var tagList = widget.$element.find(".coral-TagList");

      expect(tagList.length).to.equal(0);
    });

    it('should set button text for single select preselected markup', function() {
      var widget = $(singleSelectPreselectedMarkup).select().data('select');
      var button = widget.$element.find('.coral-Select-button');
      var buttonText = button.find('.coral-Select-button-text').text();

      expect(buttonText).to.equal('Two');
    });

    it('should create empty tagList for multi-select markup with no selections', function() {
      var widget = $(multiSelectMarkup).select().data('select');
      var tagList = widget.$element.find(".coral-TagList");

      expect(tagList.length).to.equal(1);
      expect(tagList.children().length).to.equal(0);
    });

    it('should create populated tagList for multi-select preselected markup', function() {
      var widget = $(multiSelectPreselectedMarkup).select().data('select');
      var tagList = widget.$element.find(".coral-TagList");

      expect(tagList.length).to.equal(1);
      expect(tagList.children().length).to.equal(2);
    });
  });

  describe("Interaction", function () {
    var select;

    var testSetup = function (configuration) {
      beforeEach(function () {
        select = $(singleSelectMarkup).select(configuration);
        select.appendTo(document.body);
      });
      afterEach(function () {
        select.remove();
        select = null;
      });
    };

    var getActionableElement = function () {
      var nativeSelect = select.find("select");

      if (nativeSelect.is(".coral-Select-select--native")) {
        // Select is expected to sit on top of button, so whenever the user
        // clicks the element, she interacts with the select
        return nativeSelect;
      }
      else {
        // Select is expected to be display: none, so whenever the user clicks
        // the element, she interacts with the button
        return select.find(".coral-Select-button");
      }
    };

    var tapOnSelect = function () {
      var button = getActionableElement();

      // Add some data to please toe.js's normalize algorithm
      button.trigger($.Event("touchstart", {originalEvent: {}, touches: []}));

      // Simulate left clicks
      button.trigger($.Event("mousedown", {which: 1}));
      button.trigger($.Event("click", {which: 1}));
    };
    var clickOnSelect = function () {
      var button = getActionableElement();

      // Simulate left clicks
      button.trigger($.Event("mousedown", {which: 1}));
      button.trigger($.Event("click", {which: 1}));
    };

    var itUsesNativeWidgetOnTouchInteraction = function () {
      it("should not open SelectList on tap", function () {
        tapOnSelect();

        var list = select.find(".coral-SelectList");

        if (list.length === 0) {
          expect("No SelectList there, which could be opened").to.be.okay;
        }
        else {
          // Initially visible is undefined. Only when the select list is opened
          // the first time, then visible is set to a proper boolean.
          expect(!!list.data("selectList").options.visible).to.be.false;
        }
      });
    };

    var itUsesNativeWidgetOnMouseInteraction = function () {
      it("should not open SelectList on click", function () {
        clickOnSelect();

        var list = select.find(".coral-SelectList");

        if (list.length === 0) {
          expect("No SelectList there, which could be opened").to.be.okay;
        }
        else {
          // Initially visible is undefined. Only when the select list is opened
          // the first time, then visible is set to a proper boolean.
          expect(!!list.data("selectList").options.visible).to.be.false;
        }
      });
    };

    var itUsesCoralWidgetOnTouchInteration = function () {
      it("should open SelectList on first tap", function () {
        tapOnSelect();

        var list = select.find(".coral-SelectList");

        if (list.length === 0) {
          expect("No SelectList there, which could be opened").to.be.false;
        }
        else {
          expect(list.data("selectList").options.visible).to.be.true;
        }
      });

      it("should close SelectList on second tap", function () {
        tapOnSelect();
        tapOnSelect();

        var list = select.find(".coral-SelectList");

        if (list.length === 0) {
          expect("No SelectList there, which could be opened").to.be.false;
        }
        else {
          expect(list.data("selectList").options.visible).to.be.false;
        }
      });
    };

    var itUsesCoralWidgetOnMouseInteraction = function () {
      it("should open SelectList on first click", function () {
        clickOnSelect();

        var list = select.find(".coral-SelectList");

        if (list.length === 0) {
          expect("No SelectList there, which could be opened").to.be.false;
        }
        else {
          expect(list.data("selectList").options.visible).to.be.true;
        }
      });

      it("should close SelectList on second click", function () {
        clickOnSelect();
        clickOnSelect();

        var list = select.find(".coral-SelectList");

        if (list.length === 0) {
          expect("No SelectList there, which could be opened").to.be.false;
        }
        else {
          expect(list.data("selectList").options.visible).to.be.false;
        }
      });
    };


    describe("{nativewidgetonmobile:true, nativewidget:false} - hybrid widget selection -", function () {
      testSetup({nativewidgetonmobile: true, nativewidget: false});

      describe("Touch interaction -", function () {
        itUsesNativeWidgetOnTouchInteraction();
      });

      describe("Mouse interaction -", function () {
        itUsesCoralWidgetOnMouseInteraction();
      });
    });

    describe("{nativewidgetonmobile:false, nativewidget:false} - forcing custom widget -", function () {
      testSetup({nativewidgetonmobile: false, nativewidget: false});

      describe("Touch interaction -", function () {
        itUsesCoralWidgetOnTouchInteration();
      });

      describe("Mouse interaction -", function () {
        itUsesCoralWidgetOnMouseInteraction();
      });
    });

    describe("{nativewidgetonmobile:true, nativewidget:true} - forcing native widget -", function () {
      testSetup({nativewidgetonmobile: true, nativewidget: true});

      describe("Touch interaction -", function () {
        itUsesNativeWidgetOnTouchInteraction();
      });

      describe("Mouse interaction -", function () {
        itUsesNativeWidgetOnMouseInteraction();
      });
    });

    describe("{nativewidgetonmobile:false, nativewidget:true} - forcing native widget -", function () {
      testSetup({nativewidgetonmobile: false, nativewidget: true});

      describe("Touch interaction -", function () {
        itUsesNativeWidgetOnTouchInteraction();
      });

      describe("Mouse interaction -", function () {
        itUsesNativeWidgetOnMouseInteraction();
      });
    });

    describe("disabled widget", function () {
      beforeEach(function () {
        select = $(disabledSelectMarkup).select();
        select.appendTo(document.body);
      });

      afterEach(function () {
        select.remove();
        select = null;
      });

      describe("Touch interaction -", function () {
        it("should not open SelectList on click", function () {
          clickOnSelect();

          var list = select.find(".coral-SelectList");

          if (list.length === 0) {
            expect("No SelectList there, which could be opened").to.be.okay;
          }
          else {
            // Initially visible is undefined. Only when the select list is opened
            // the first time, then visible is set to a proper boolean.
            expect(!!list.data("selectList").options.visible).to.be.false;
          }
        });
      });

      describe("Mouse interaction -", function () {
        it("should not open SelectList on tap", function () {
          tapOnSelect();

          var list = select.find(".coral-SelectList");

          if (list.length === 0) {
            expect("No SelectList there, which could be opened").to.be.okay;
          }
          else {
            // Initially visible is undefined. Only when the select list is opened
            // the first time, then visible is set to a proper boolean.
            expect(!!list.data("selectList").options.visible).to.be.false;
          }
        });
      });

    });
  });


  describe("Selection Behavior -", function () {
    describe("Single Select -", function () {
      describe("with SelectList widget", function() {

        var widget, element, button, selectList, valueInput;

        beforeEach(function() {
          widget = $(singleSelectMarkup).select().data('select');
          element = widget.$element;
          button = element.find(".coral-Select-button");
          selectList = element.find(".coral-SelectList");
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

        it('should show "Two" when value 2 gets selected via API', function() {
          widget.setValue('2');
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

      describe("with native widget", function() {

        var widget, element, button, select;

        beforeEach(function() {
          widget = $(singleSelectMarkup).select().data('select');
          element = widget.$element;
          button = element.find(".coral-Select-button");
          select = element.find(".coral-Select-select");
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

        it('should show "Two" when setting value via JS api', function() {

          widget.setValue('2');

          var buttonText = button.find('.coral-Select-button-text').text();
          expect(buttonText).to.equal('Two');
        });

        it('should have a value of "2" when Value=2 event occurs', function() {

          // simulate the select event
          select.val('2').trigger('change');

          expect(widget.getValue()).to.equal('2');
        });

        it('should fire a "selected" event when a value change occurs', function() {
          // we have to manually trigger the change event

          var spy = sinon.spy();
          widget.on('selected', spy);

          // simulate the select event
          select.val('2').trigger('change');
          expect(spy.called).to.be.true;
        });
      });
    });

    describe("Multi Select -", function () {
      describe("with SelectList widget", function() {
        var widget, element, button, selectList, valueInput;

        beforeEach(function() {
          widget = $(multiSelectMarkup).select().data('select');
          element = widget.$element;
          button = element.find(".coral-Select-button");
          selectList = element.find(".coral-SelectList");
          element.appendTo(document.body);
        });

        afterEach(function() {
          element.remove();
          button.remove();
          selectList.remove();
          widget = element = button = selectList = null;
        });

        it('should keep button text when selected event occurs', function() {
          selectList.trigger('click');

          var selectEvent = $.Event('selected', {
            selectedValue: '2',
            displayedValue: 'Two'
          });
          selectList.trigger(selectEvent);

          var buttonText = button.find('.coral-Select-button-text').text();
          expect(buttonText).to.equal('Select');
        });

        it('should have getValue()=[2] when Value=2 event occurs', function() {
          selectList.trigger($.Event('selected', {
            selectedValue: '2',
            displayedValue: 'Two'
          }));

          var values = widget.getValue();

          expect(values.length).to.equal(1);
          expect(values).to.have.members(['2']);
        });

        it('should have getValue()=[2] when value 2 is API selected', function() {

          widget.setValue('2');

          var values = widget.getValue();

          expect(values.length).to.equal(1);
          expect(values).to.have.members(['2']);
        });

        it("should add new values to the list, when selected event occurs multiple times", function () {
          selectList.trigger($.Event('selected', {
            selectedValue: '2',
            displayedValue: 'Two'
          }));

          selectList.trigger($.Event('selected', {
            selectedValue: '1',
            displayedValue: 'One'
          }));

          var values = widget.getValue();

          expect(values.length).to.equal(2);
          expect(values).to.have.members(['2', '1']);
        });

        it("should add new values to the list, when API selected", function () {

          widget.setValue(['2', '1']);

          var values = widget.getValue();

          expect(values.length).to.equal(2);
          expect(values).to.have.members(['2', '1']);
        });

        it('should fire a "selected" event when the selectList fires an event', function() {
          var spy = sinon.spy();
          widget.on('selected', spy) ;

          var selectEvent = $.Event('selected', {
            selectedValue: '2',
            displayedValue: 'Two'
          });
          selectList.trigger(selectEvent);

          expect(spy.calledOnce).to.be.true;

          var e = spy.getCall(0).args[0];
          expect(e.selected.length).to.equal(1);
          expect(e.selected).to.have.members(['2']);
        });
      });

      describe("with native widget", function() {

        var widget, element, button, select;

        beforeEach(function() {
          widget = $(multiSelectMarkup).select().data('select');
          element = widget.$element;
          button = element.find(".coral-Select-button");
          select = element.find(".coral-Select-select");
          element.appendTo(document.body);
        });

        afterEach(function() {
          element.remove();
          button.remove();
          select.remove();
          widget = element = button = select = null;
        });

        it('should keep button text when selected event occurs', function() {

          // we have to manually trigger the change event
          select.val('2').trigger('change');

          var buttonText = button.find('.coral-Select-button-text').text();
          expect(buttonText).to.equal('Select');
        });

        it('should have a getValue()=["1", "2"] when select has ["1","2"] value', function() {
          // simulate the select event
          select.val(['1', '2']).trigger('change');

          var values = widget.getValue();
          expect(values.length).to.equal(2);
          expect(values).to.have.members(['1', '2']);
        });

        it('should have a getValue()=["1", "2"] when setValue got ["1","2"] value', function() {

          widget.setValue(['1', '2']);

          var values = widget.getValue();
          expect(values.length).to.equal(2);
          expect(values).to.have.members(['1', '2']);
        });

        it('should fire a "selected" event when a value change occurs', function() {
          // we have to manually trigger the change event

          var spy = sinon.spy();
          widget.on('selected', spy);

          // simulate the select event
          select.val(['1', '2']).trigger('change');
          expect(spy.calledOnce).to.be.true;

          var e = spy.getCall(0).args[0];
          expect(e.selected.length).to.equal(2);
          expect(e.selected).to.have.members(['1', '2']);
        });
      });
    });
  });

  describe("Manipulation API", function () {
    // This is about the add/remove API methods, that are shared with
    // CUI.SelectList.
    //
    // The main challenge is to keep the SelectList and the <select> in sync.
    //
    // We also need to make sure, that the different modes of operation (native,
    // hybrid, dynamic) do not interfere with the functioning of these API
    // methods.

    var select, $select;

    var disabled = function () {
      $select = $(disabledSelectMarkup);
      select = new CUI.Select({
        element: $select
      });
    };

    var native = function () {
      $select = $(singleSelectMarkup);
      select = new CUI.Select({
        element: $select,
        nativewidget: true,
        nativewidgetonmobile: true
      });
    };

    var widget = function () {
      $select = $(singleSelectMarkup);
      select = new CUI.Select({
        element : $select,
        nativewidget : false,
        nativewidgetonmobile : false
      });
    };

    var widgetWithGroups = function () {
      $select = $(optGroupMarkup);
      select = new CUI.Select({
        element : $select,
        nativewidget : false,
        nativewidgetonmobile : false
      });
    };

    var hybrid = function () {
      $select = $(singleSelectMarkup);
      select = new CUI.Select({
        element: $select,
        // Those are the default values, but, you know, better safe than sorry.
        nativewidget: false,
        nativewidgetonmobile: true
      });
    };

    var multiple = function () {
      $select = $(multiSelectMarkup);
      select = new CUI.Select({
        element: $select,
      });
    };

    var dynamic = function () {
      $select = $(dynamicMarkup);
      select = new CUI.Select({
        element: $select,
        type: 'dynamic',
        selectlistConfig : {
          loadData: function (pageStart, pageEnd) {
            var deferred = $.Deferred();

            // For ease of testing, create the same elements, that are in the
            // singleSelectMarkup and do it synchronously.
            this.addOption({display: "One",   value: "1"});
            this.addOption({display: "Two",   value: "2"});
            this.addOption({display: "Three", value: "3"});

            deferred.resolve(true);

            return deferred.promise();
          }
        }
      });
      // Display selectList, so that initial options are populated.
      select._selectListWidget.show();
    };

    var testVariants = function (variants, testFn) {
      $.each(variants, function (name, beforeFn) {
        describe(name, function () {
          beforeEach(beforeFn);
          testFn.call(this);
        });
      });
    };

    testVariants({
      disabled: disabled,
      native: native,
      widget: widget,
      hybrid: hybrid,
      dynamic: dynamic
    }, function () {
      describe("getItems", function () {
        describe("with Options only", function () {
          it("returns one CUI.SelectList.Option per option", function () {
            var items = select.getItems();

            // When you happen to change this, make sure, that all the other
            // magic constants below are changed as well.
            expect(items.length).to.equal(3);

            var i = 0;
            $.each({1: "One", 2: "Two", 3: "Three"}, function (value, display) {
              var item = items[i++];
              expect(item instanceof CUI.SelectList.Option).to.be.true;
              expect(item.getValue()).to.equal(value);
              expect(item.getDisplay()).to.equal(display);
            });
          });
        });
      });

      describe("getOption", function () {
        it("returns the CUI.SelectList.Option for the given position", function () {
          var option = select.getOption(1);

          expect(option.getDisplay()).to.equal("Two");
          expect(option.getValue()).to.equal("2");
        });
      });

      describe("getGroup", function () {
        it("returns the CUI.SelectList.Group for the given position", function () {
          select.addGroup("Expected Group Name");
          var group = select.getGroup(3);

          expect(group.getDisplay()).to.equal("Expected Group Name");
        });
      });

      describe("addOption", function () {
        var expectOptionInSelectListAt = function (option, position, element) {
          var s = $select.find(".coral-SelectList"),
              o = s.children(".coral-SelectList-item").eq(position);

          if (s.length === 0) {
            // no further test needed. no SelectList present
            return;
          }

          expect(o.is(".coral-SelectList-item--option"), "Could not find option in SelectList").to.be.true;
          expect(o.text()).to.equal(option.display);
          expect(o.attr("data-value")).to.equal(option.value);

          if (element) {
            expect(o.get(0)).to.equal(element.get(0));
          }
        };

        var expectOptionInSelectAt = function (option, position) {
          var s = $select.find(".coral-Select-select"),
              o = s.children().eq(position);

          if (s.length === 0) {
            // no further test needed. no SelectList present
            return;
          }

          expect(o.is("option"), "Could not find option in <select>").to.be.true;
          expect(o.text()).to.equal(option.display);
          expect(o.attr("value")).to.equal(option.value);
        };

        var expectSelectListLength = function (length) {
          var s = $select.find(".coral-SelectList");

          if (s.length) {
            expect(s.children(".coral-SelectList-item").length).to.equal(length);
          }
        };

        var expectSelectLength = function (length) {
          var s = $select.find(".coral-Select-select");

          if (s.length) {
            expect(s.children().length).to.equal(length);
          }
        };

        var createOptionElement = function (item) {
          return $("<li>", {
            "class": "coral-SelectList-item coral-SelectList-item--option",
            "data-value": item.value
          }).text(item.display);
        };

        it("adds an Option at the end with addOption(CUI.SelectList.Option);", function () {
          var option = {value: "4", display: "Four"},
              element = createOptionElement(option),
              cuiOption = new CUI.SelectList.Option({element: element});

          select.addOption(cuiOption);

          expectSelectListLength(4);
          expectOptionInSelectListAt(option, 3, element);

          expectSelectLength(4);
          expectOptionInSelectAt(option, 3);
        });

        it("adds an Option at the end with addOption({value: , display: });", function () {
          var option = {value: "4", display: "Four"};

          select.addOption(option);

          expectSelectListLength(4);
          expectOptionInSelectListAt(option, 3);

          expectSelectLength(4);
          expectOptionInSelectAt(option, 3);
        });

        it("adds an Option at the end with addOption({value: , display: }, listLength);", function () {
          var option = {value: "4", display: "Four"};

          select.addOption(option, 3);

          expectSelectListLength(4);
          expectOptionInSelectListAt(option, 3);

          expectSelectLength(4);
          expectOptionInSelectAt(option, 3);
        });

        it("adds an Option in the middle with addOption({value: , display: }, 1);", function () {
          var option = {value: "4", display: "Four"};

          select.addOption(option, 1);

          expectSelectListLength(4);
          expectOptionInSelectListAt(option, 1);

          expectSelectLength(4);
          expectOptionInSelectAt(option, 1);
        });

        it("adds multiple Options in the middle with addOption([..., ...], 1);", function () {
          var optionA = {value: "4", display: "Four"},
              optionB = {value: "5", display: "Five"};

          select.addOption([optionA, optionB], 1);

          expectSelectListLength(5);
          expectOptionInSelectListAt(optionA, 1);
          expectOptionInSelectListAt(optionB, 2);

          expectSelectLength(5);
          expectOptionInSelectAt(optionA, 1);
          expectOptionInSelectAt(optionB, 2);
        });

        it("adds an Option to the beginning with addOption({value: , display: }, 0);", function () {
          var option = {value: "4", display: "Four"};

          select.addOption(option, 0);

          expectSelectListLength(4);
          expectOptionInSelectListAt(option, 0);

          expectSelectLength(4);
          expectOptionInSelectAt(option, 0);
        });

        describe("remove()", function () {
          it("removes options from <select> when CUI.SelectList.Option is removed", function () {

            expectSelectLength(3);
            expectSelectListLength(3);

            expectOptionInSelectListAt({value: "2", display: "Two"}, 1);
            expectOptionInSelectAt({value: "2", display: "Two"}, 1);

            select.getOption(1).remove();

            // Option was removed in both lists
            expectSelectLength(2);
            expectSelectListLength(2);

            // Three is now where Two was earlier
            expectOptionInSelectListAt({value: "3", display: "Three"}, 1);
            expectOptionInSelectAt({value: "3", display: "Three"}, 1);
          });
        });
      });

      describe("addGroup", function () {
        var expectGroupInSelectListAt = function (group, position, element) {
          var s = $select.find(".coral-SelectList"),
              o = s.children(".coral-SelectList-item").eq(position);

          if (s.length === 0) {
            // no further test needed. no SelectList present
            return;
          }

          expect(o.is(".coral-SelectList-item--optgroup"), "Could not find group in SelectList").to.be.true;
          expect(o.children(".coral-SelectList-groupHeader").text()).to.equal(group);

          if (element) {
            expect(o.get(0)).to.equal(element.get(0));
          }
        };

        var expectGroupInSelectAt = function (group, position) {
          var s = $select.find(".coral-Select-select"),
              o = s.children().eq(position);

          if (s.length === 0) {
            // no further test needed. no SelectList present
            return;
          }

          expect(o.is("optgroup"), "Could not find optgroup in <select>").to.be.true;
          expect(o.text()).to.equal(group);
        };

        var expectSelectListLength = function (length) {
          var s = $select.find(".coral-SelectList");

          if (s.length) {
            expect(s.children(".coral-SelectList-item").length).to.equal(length);
          }
        };

        var expectSelectLength = function (length) {
          var s = $select.find(".coral-Select-select");

          if (s.length) {
            expect(s.children().length).to.equal(length);
          }
        };

        var createGroupElement = function (display) {
          var element;

          element = $("<li>", {"class": "coral-SelectList-item coral-SelectList-item--optgroup"});
          element.prepend($("<span>", {"class": "coral-SelectList-groupHeader"}).text(display));
          element.append($("<ul>", {"class": "coral-SelectList-sublist"}));

          return element;
        };

        it("adds a Group at the end with addGroup(CUI.SelectList.Group);", function () {
          var group = "Group",
              element = createGroupElement(group),
              cuiGroup = new CUI.SelectList.Group({element: element});

          select.addGroup(cuiGroup);

          expectSelectListLength(4);
          expectGroupInSelectListAt(group, 3, element);

          expectSelectLength(4);
          expectGroupInSelectAt(group, 3);
        });

        it("adds a Group at the end with addGroup(\"display\");", function () {
          var group = "Group";

          select.addGroup(group);

          expectSelectListLength(4);
          expectGroupInSelectListAt(group, 3);

          expectSelectLength(4);
          expectGroupInSelectAt(group, 3);
        });

        it("adds a Group at the end with addGroup(\"display\", listLength);", function () {
          var group = "Group";

          select.addGroup(group, 3);

          expectSelectListLength(4);
          expectGroupInSelectListAt(group, 3);

          expectSelectLength(4);
          expectGroupInSelectAt(group, 3);
        });

        it("adds a Group in the middle with addGroup(\"display\", 1);", function () {
          var group = "Group";

          select.addGroup(group, 1);

          expectSelectListLength(4);
          expectGroupInSelectListAt(group, 1);

          expectSelectLength(4);
          expectGroupInSelectAt(group, 1);
        });

        it("adds a Group in the beginning with addGroup(\"display\", 0);", function () {
          var group = "Group";

          select.addGroup(group, 0);

          expectSelectListLength(4);
          expectGroupInSelectListAt(group, 0);

          expectSelectLength(4);
          expectGroupInSelectAt(group, 0);
        });

        describe("remove()", function () {
          it("removes groups from <select> when CUI.SelectList.Group is removed", function () {
            select.addGroup("Group 1");
            select.addGroup("Group 2");

            // Make sure, that the addGroup worked as expected.
            expectSelectLength(5);
            expectSelectListLength(5);

            expectGroupInSelectListAt("Group 1", 3);
            expectGroupInSelectAt("Group 1", 3);

            select.getGroup(3).remove();

            // Group was removed in both lists
            expectSelectLength(4);
            expectSelectListLength(4);

            // Group 2 is now where Group 1 was earlier
            expectGroupInSelectListAt("Group 2", 3);
            expectGroupInSelectAt("Group 2", 3);
          });
        });

        describe("Options within Groups", function () {
          it("should add/remove items within groups", function () {
            var s = $select.find(".coral-Select-select");

            if (!s.length) {
              // Nothing to test, there is no select which should be in sync.
              // This is probably the dynamic Select, which only has a hidden input
              return;
            }

            // Builds the following structure:
            //
            //   Group A
            //      A 1
            //      A 2
            //   One
            //   Two
            //   Three
            //   Group B
            //      B 1
            //      B 2

            select.addGroup("Group A", 0);
            select.addGroup("Group B");

            var a = select.getGroup(0),
                b = select.getGroup(4);

            a.addOption({value: "a1", display: "A 1"});
            a.addOption({value: "a2", display: "A 2"});

            b.addOption({value: "b1", display: "B 1"});
            b.addOption({value: "b2", display: "B 2"});

            // 3 options + 2 groups
            expectSelectListLength(5);
            expectSelectLength(5);

            expect(s.find("optgroup:first option").length).to.equal(2);
            expect(s.find("optgroup:first option:first").text()).to.equal("A 1");
            expect(s.find("optgroup:first option:first").attr("value")).to.equal("a1");

            expect(s.find("optgroup:first option:last").text()).to.equal("A 2");
            expect(s.find("optgroup:first option:last").attr("value")).to.equal("a2");


            expect(s.find("optgroup:last option").length).to.equal(2);
            expect(s.find("optgroup:last option:first").text()).to.equal("B 1");
            expect(s.find("optgroup:last option:first").attr("value")).to.equal("b1");

            expect(s.find("optgroup:last option:last").text()).to.equal("B 2");
            expect(s.find("optgroup:last option:last").attr("value")).to.equal("b2");

            // And now, let's remove an option
            a.getOption(1).remove();
            b.getOption(0).remove();

            // still, 3 options + 2 groups
            expectSelectListLength(5);
            expectSelectLength(5);

            expect(s.find("optgroup:first option").length).to.equal(1);
            expect(s.find("optgroup:first option:first").text()).to.equal("A 1");
            expect(s.find("optgroup:first option:first").attr("value")).to.equal("a1");

            expect(s.find("optgroup:last option").length).to.equal(1);
            expect(s.find("optgroup:last option:first").text()).to.equal("B 2");
            expect(s.find("optgroup:last option:first").attr("value")).to.equal("b2");
          });
        });
      });
    });

    describe("value handling when removing options", function () {
      testVariants({
        disabled: disabled,
        native: native,
        widget: widget,
        hybrid: hybrid
      }, function () {
        it("selects first option in list when selected option is removed", function () {

          // Testing precondition
          expect(select.getValue()).to.equal("1");
          expect($select.find('.coral-Select-button-text').text()).to.equal('One');

          select.getOption(0).remove(); // removing "1"

          // Testing outcome
          expect(select.getValue()).to.equal("2");
          expect($select.find('.coral-Select-button-text').text()).to.equal('Two');
        });

        it("does nothing if an unselected option is removed", function () {

          // Testing precondition
          expect(select.getValue()).to.equal("1");
          expect($select.find('.coral-Select-button-text').text()).to.equal('One');

          select.getOption(1).remove(); // removing "2"

          // Testing outcome
          expect(select.getValue()).to.equal("1");
          expect($select.find('.coral-Select-button-text').text()).to.equal('One');
        });
      });

      testVariants({
        widgetWithGroups: widgetWithGroups
      }, function () {
        it("selects first option in the list when group containing selected option is removed", function () {
          // Selecting One and Two
          $select.find(".coral-SelectList").trigger($.Event('selected', {
            selectedValue: '2',
            displayedValue: 'Two'
          }));

          // Testing precondition
          expect(select.getValue()).to.equal("2");
          expect($select.find('.coral-Select-button-text').text()).to.equal('Two');

          select.getGroup(0).remove(); // removing first group which contains "2"

          // Testing outcome
          expect($select.find('.coral-Select-button-text').text()).to.equal('Fourth');
          expect(select.getValue()).to.equal("4");
        });
      });

      testVariants({
        multiple : multiple
      }, function () {
        it("removes selected option's value from value list when option is removed", function () {
          // Selecting One and Two
          $select.find(".coral-SelectList").trigger($.Event('selected', {
            selectedValue: '2',
            displayedValue: 'Two'
          }));

          $select.find(".coral-SelectList").trigger($.Event('selected', {
            selectedValue: '1',
            displayedValue: 'One'
          }));

          // Testing precondition
          expect(select.getValue().length).to.equal(2);
          expect(select.getValue()[0]).to.equal("2");
          expect(select.getValue()[1]).to.equal("1");


          select.getOption(0).remove(); // removing "1"

          expect(select.getValue().length).to.equal(1);
          expect(select.getValue()[0]).to.equal("2");

          select.getOption(0).remove(); // removing "2"

          expect(select.getValue().length).to.equal(0);
        });
      });

      /**
       * No tests for dynamic??
       *
       * Dynamic lists are special, since they remove all options whenever an
       * options is selected anyway (the SelectList is closed and therefore the
       * list is cleared). Therefore it would not make much sense to remove
       * the selected value, when its matching option is removed. They are not
       * in sync anyway.
       */
    });
  });
});
