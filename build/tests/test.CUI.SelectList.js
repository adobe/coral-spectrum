describe('CUI.SelectList', function() {

  var EMPTY_LIST = {
    name: 'empty list',
    html: '<ul class="coral-SelectList"></ul>'
  };

  var BASIC_LIST = {
    name: 'basic list',
    html: '' +
        '<ul class="coral-SelectList">' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="af">Afghanistan</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="al">Albania</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="bs">Bahamas</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="bh">Bahrain</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="kh">Cambodia</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="cm">Cameroon</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="dk">Denmark</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="dj">Djibouti</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="ec">Ecuador</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="eg">Egypt</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="fj">Fiji</li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--option" data-value="fi">Finland</li>' +
        '  <li id="no-value-and-display" class="coral-SelectList-item coral-SelectList-item--option">Display</li>' +
        '  <li id="value-and-display" class="coral-SelectList-item coral-SelectList-item--option" data-value="value" data-display="Display"><b>Complex Display</b></li>' +
        '</ul>'
  };

  var GROUP_LIST = {
    name: 'group list',
    html: '' +
        '<ul class="coral-SelectList">' +
        '  <li class="coral-SelectList-item coral-SelectList-item--optgroup">' +
        '    <span class="coral-SelectList-groupHeader">Group 1</span>' +
        '    <ul class="coral-SelectList-sublist">' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="af">Afghanistan</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="bs">Bahamas</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="kh">Cambodia</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="dk">Denmark</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="ec">Ecuador</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="fi">Finland</li>' +
        '    </ul>' +
        '  </li>' +
        '  <li class="coral-SelectList-item coral-SelectList-item--optgroup">' +
        '    <span class="coral-SelectList-groupHeader">Group 2</span>' +
        '    <ul class="coral-SelectList-sublist">' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="al">Albania</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="bh">Bahrain</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="cm">Cameroon</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="dj">Djibouti</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="eg">Egypt</li>' +
        '      <li class="coral-SelectList-item coral-SelectList-item--option" data-value="fj">Fiji</li>' +
        '    </ul>' +
        '  </li>' +
        '</ul>'
  };

  var ALL_VARIANTS = [
    BASIC_LIST,
    GROUP_LIST
  ];

  var $toggle, $selectList;

  var constructList = function(html) {
    var id = CUI.util.getNextId();

    $toggle = $('<button data-toggle="selectlist" ' +
        'data-target="#' + id + '">Show List</button>')
        .appendTo(document.body);

    $selectList = $(html).appendTo(document.body).attr('id', id).selectList({
      relatedElement: $toggle[0]
    });
  };

  var testAgainst = function(variants, callback) {
    var testVariant = function (html) {
      return function () {
        beforeEach(function() {
          constructList(html);
        });
        callback();
      };
    };

    for (var i = 0, ii = variants.length; i < ii; i++) {
      var variant = variants[i];
      describe(variant.name, testVariant(variant.html));
    }
  };

  afterEach(function() {
    $toggle.remove();
    $selectList.remove();
  });

  describe('visibility through API', function() {
    testAgainst(ALL_VARIANTS, function() {
      it('shows/hides when show/hide is called', function() {
        $selectList.selectList('show');
        expect($selectList).to.have.class('is-visible');
        $selectList.selectList('hide');
        expect($selectList).not.to.have.class('is-visible');
      });
    });
  });

  describe('visibility through interaction', function() {
    testAgainst(ALL_VARIANTS, function() {
      it('shows when trigger is clicked', function() {
        $toggle.trigger('click');
        expect($selectList).to.have.class('is-visible');
      });

      it('hides when trigger is clicked', function() {
        $selectList.selectList('show');
        $toggle.trigger('click');
        expect($selectList).not.to.have.class('is-visible');
      });

      it('hides on click outside', function() {
        $selectList.selectList('show');
        $(document.body).trigger('click');
        expect($selectList).not.to.have.class('is-visible');
      });

      it('does not hide when clicking inside list', function() {
        $selectList.selectList('show');
        $selectList.trigger('click');
        expect($selectList).to.have.class('is-visible');
      });
    });
  });

  describe('Accessibility', function() {
    testAgainst(ALL_VARIANTS, function() {
      beforeEach(function() {
        $selectList.selectList('show');
      });

      it('closes the menu using the escape key', function() {
        expect($selectList).to.have.class('is-visible');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 27; // esc

        $toggle.focus().trigger($keyEvent);
        expect($selectList).not.to.have.class('is-visible');
      });

      it('selects the highlighted item using keys', function() {
        var $items = $selectList.find('[role="option"]');

        $toggle.focus();

        $selectList.selectList('setCaretToItem', $items.first());

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 13; // enter

        var spy = sinon.spy();
        $selectList.on('selected', spy);

        $toggle.trigger($keyEvent);

        var itemMatch = sinon.match({
          selectedValue: 'af',
          displayedValue: 'Afghanistan'
        });
        expect(spy.calledWith(itemMatch)).to.be.true;
      });

      it('sets the caret to the next item using keys', function() {
        var $items = $selectList.find('[role="option"]');

        var keyCodes = [
          34, // page down
          40 // down arrow
        ];

        keyCodes.forEach(function(keyCode) {
          $items.removeClass('is-highlighted');

          var $keyEvent = $.Event('keydown');
          $keyEvent.which = keyCode;

          $toggle.focus().trigger($keyEvent);
          expect($items.eq(0)).to.have.class('is-highlighted');

          $toggle.focus().trigger($keyEvent);
          expect($items.eq(0)).not.to.have.class('is-highlighted');
          expect($items.eq(1)).to.have.class('is-highlighted');
        });
      });

      it('sets the caret to the previous item using keys', function() {
        var $items = $selectList.find('[role="option"]');

        var keyCodes = [
          33, // page up
          38 // up arrow
        ];

        keyCodes.forEach(function(keyCode) {
          $items.removeClass('is-highlighted');

          var $keyEvent = $.Event('keydown');
          $keyEvent.which = keyCode;

          $toggle.focus().trigger($keyEvent);
          expect($items.last()).to.have.class('is-highlighted');

          $toggle.focus().trigger($keyEvent);
          expect($items.last()).not.to.have.class('is-highlighted');
          expect($items.last().prev()).to.have.class('is-highlighted');
        });
      });

      it('sets the caret to the first item using home key', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 36; // home

        $toggle.focus().trigger($keyEvent);
        expect($items.first()).to.have.class('is-highlighted');
      });

      it('sets the caret to the last item using end key', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 35; // end

        $toggle.focus().trigger($keyEvent);
        expect($items.last()).to.have.class('is-highlighted');
      });

      it('never sets the caret to items with is-disabled', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');
        var $firstItem = $items.first().addClass('is-disabled');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 36; // home

        $toggle.focus().trigger($keyEvent);
        expect($firstItem).not.to.have.class('is-highlighted');
      });

      it('never sets the caret to items that are not visible', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');
        var $firstItem = $items.first().addClass('is-hidden');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 36; // home

        $toggle.focus().trigger($keyEvent);
        expect($firstItem).not.to.have.class('is-highlighted');
      });

      it("item at caret position should receive browser focus", function() {
        expect($selectList.find('.is-highlighted:focusable').length).to.equal(1);
      });

      describe("keyboard search", function () {
        describe("on first keypress", function () {
          it("highlights the next option whose display starts with key", function () {
            var selectList = $selectList.data("selectList"),
                $items = $selectList.find('[role="option"]');

            selectList.setCaretToItem($items.eq(0));

            $selectList.trigger($.Event("keypress", {which: "a".charCodeAt(0)}));

            expect($selectList.find(".is-highlighted").data("value")).to.equal("al");
          });

          it("highlights the next option whose display starts with key and wraps search", function () {
            var selectList = $selectList.data("selectList"),
                $items = $selectList.find('[role="option"]');

            selectList.setCaretToItem($items.last());

            $selectList.trigger($.Event("keypress", {which: "a".charCodeAt(0)}));

            expect($selectList.find(".is-highlighted").data("value")).to.equal("af");
          });
        });

        it("continues search on repetitive keypresses", function () {
          var selectList = $selectList.data("selectList"),
              $items = $selectList.find('[role="option"]');

          $selectList.trigger($.Event("keypress", {which: "b".charCodeAt(0)}));
          $selectList.trigger($.Event("keypress", {which: "a".charCodeAt(0)}));
          $selectList.trigger($.Event("keypress", {which: "h".charCodeAt(0)}));

          expect($selectList.find(".is-highlighted").data("value")).to.equal("bs");

          $selectList.trigger($.Event("keypress", {which: "r".charCodeAt(0)}));

          expect($selectList.find(".is-highlighted").data("value")).to.equal("bh");
        });
      });
    });
  });

  describe('filtering', function() {
    testAgainst(ALL_VARIANTS, function() {
      it('filters items', function() {
        var $this;
        var itemsToShow = ['bh', 'kh'];

        $selectList.selectList('filter', function(value, display) {
          return itemsToShow.indexOf(value) > -1;
        });

        $selectList.find('[role="option"]').each(function() {
          $this = $(this);
          var value = $this.data('value');
          if (itemsToShow.indexOf(value) > -1) {
            expect($this).not.to.have.class('is-hidden');
          } else {
            expect($this).to.have.class('is-hidden');
          }
        });
      });
    });

    testAgainst([GROUP_LIST], function() {
      it('toggles group visibility based on visibility of children', function() {
        var itemsToShow = ['al', 'bh'];

        $selectList.selectList('filter', function(value, display) {
          return itemsToShow.indexOf(value) > -1;
        });

        var $groups = $selectList.find('.coral-SelectList-item--optgroup');
        expect($groups.first()).to.have.class('is-hidden');
        expect($groups.last()).not.to.have.class('is-hidden');

        $selectList.selectList('filter'); // reset

        expect($groups.first()).not.to.have.class('is-hidden');
        expect($groups.last()).not.to.have.class('is-hidden');
      });
    });

    testAgainst(ALL_VARIANTS, function() {
      it('Passes data-display to filter if it exists, text value if it does not', function () {
        $selectList.selectList('filter', function(value, display) {
          var $this = $(this);
          var displayData = $this.data('display');
          if (displayData) {
            expect(display).to.equal(displayData);
          } else {
            expect(display).to.equal($this.text());
          }
          return true;
        });
      });
    });
  });

  describe('eventing', function() {
    testAgainst([BASIC_LIST], function() {
      it('trigger selected event without [data-value] and [data-display]', function(done) {
        $selectList.on('selected', function(e) {
          expect(e.selectedValue).to.be.undefined;
          expect(e.displayedValue).to.equal('Display');
          done();
        });

        $selectList.children('#no-value-and-display').click();
      });

      it('trigger selected event with [data-value] and [data-display]', function(done) {
        $selectList.on('selected', function(e) {
          expect(e.selectedValue).to.equal('value');
          expect(e.displayedValue).to.equal('Display');
          done();
        });

        $selectList.children('#value-and-display').click();
      });
    });
  });

  describe('positioning', function() {
    testAgainst(ALL_VARIANTS, function() {
      it('passes the option collisionAdjustment', function() {
        var selectList = $selectList.data('selectList');
        selectList.set('collisionAdjustment', 'none');
        var positionSpy = sinon.spy(selectList.$element, 'position');
        selectList.show();
        expect(positionSpy.getCall(0).args[0].collision).to.equal('none');
      });
    });

    testAgainst(ALL_VARIANTS, function() {
      it('repositions on each filter', function() {
        var selectList = $selectList.data('selectList');
        selectList.show();
        var positionSpy = sinon.spy(selectList.$element, 'position');
        selectList.filter();
        selectList.filter();
        selectList.filter();
        expect(positionSpy.callCount).to.equal(3);
      });
    });
  });

  describe("JS API", function () {
    describe("getItems()", function () {
      testAgainst([BASIC_LIST], function () {
        it("returns a list of CUI.SelectList.Option instances", function () {
          var selectList = $selectList.data('selectList'),
              items = selectList.getItems();

          items.forEach(function(item) {
            expect(item instanceof CUI.SelectList.Option).to.be.true;
          });

          expect(items.length).to.equal(14);
        });

        it("returns a list in proper DOM order", function() {
          var selectList = $selectList.data('selectList'),
              items = selectList.getItems();

          expect(items[0].$element.data("value")).to.equal("af");
          expect(items[1].$element.data("value")).to.equal("al");
          expect(items[2].$element.data("value")).to.equal("bs");
          expect(items[3].$element.data("value")).to.equal("bh");
          expect(items[13].$element.data("value")).to.equal("value");
        });
      });

      testAgainst([GROUP_LIST], function () {
        it("returns a list of CUI.SelectList.Group instances", function () {
          var selectList = $selectList.data('selectList'),
              items = selectList.getItems();

          items.forEach(function(item) {
            expect(item instanceof CUI.SelectList.Group).to.be.true;
          });

          expect(items.length).to.equal(2);
        });

        it("returns a list in proper DOM order", function() {
          var selectList = $selectList.data('selectList'),
              items = selectList.getItems();

          expect(items[0].$element.find("span").text()).to.equal("Group 1");
          expect(items[1].$element.find("span").text()).to.equal("Group 2");
        });
      });
    });

    describe("getOption()", function () {
      testAgainst([BASIC_LIST], function () {
        it("throws TypeError if position is not numeric", function () {
          var selectList = $selectList.data('selectList');

          expect(function () { selectList.getOption("1!"); }).to.throw(TypeError);
          expect(function () { selectList.getOption(); }).to.throw(TypeError);
        });

        it("throws RangeError if position is out of bounds", function () {
          var selectList = $selectList.data('selectList');

          expect(function () { selectList.getOption(-1); }).to.throw(RangeError);
          expect(function () { selectList.getOption(selectList.getItems().length); }).to.throw(RangeError);
        });

        it("returns an option instance if index is within bounds", function () {
          var selectList = $selectList.data('selectList');

          expect(selectList.getOption( 0).$element.get(0)).to.equal($selectList.children("li").get( 0));
          expect(selectList.getOption(13).$element.get(0)).to.equal($selectList.children("li").get(13));
        });
      });

      testAgainst([GROUP_LIST], function () {
        it("throws TypeError if position points to group instead of option", function () {
          var selectList = $selectList.data('selectList');

          expect(function () { selectList.getOption(0); }).to.throw(TypeError);
        });
      });
    });

    describe("addOption()", function () {
      var expectOption = function (option, display, value) {
        expect(option.getDisplay()).to.equal(display);
        expect(option.getValue()).to.equal(value);

        expect(option.$element.is("[role=option]"), "Option has role attribute").to.be.true;
      };

      testAgainst([EMPTY_LIST], function () {
        describe("optionDescription parameter - ", function () {
          it("adds {display, value}", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addOption({display: "Brazil", value: "br"});

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectOption(items[0], "Brazil", "br");
          });

          it("adds Element", function () {
            var selectList = $selectList.data('selectList'),
                li, items;

            li = document.createElement("li");
            li.className = "coral-SelectList-item coral-SelectList-item--option";
            li.setAttribute("data-value", "Value");
            li.innerText = "Display";

            selectList.addOption(li);

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectOption(items[0], "Display", "Value");

            expect(items[0].$element.get(0)).to.equal(li);
          });

          it("adds CUI.SelectList.Option", function () {
            var selectList = $selectList.data('selectList'),
                li, items;

            li = jQuery("<li>", {
              "class" : "coral-SelectList-item coral-SelectList-item--option",
              "data-value" : "Value"
            }).text("Display");

            selectList.addOption(new CUI.SelectList.Option({element: li}));

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectOption(items[0], "Display", "Value");

            expect(items[0].$element.get(0)).to.equal(li.get(0));
          });

          it("adds single jQuery element", function () {
            var selectList = $selectList.data('selectList'),
                li, items;

            li = jQuery("<li>", {
              "class" : "coral-SelectList-item coral-SelectList-item--option",
              "data-value" : "Value"
            }).text("Display");

            selectList.addOption(li);

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectOption(items[0], "Display", "Value");

            expect(items[0].$element.get(0)).to.equal(li.get(0));
          });

          it("adds jQuery collection", function () {
            var selectList = $selectList.data('selectList'),
                lis, items;

            lis = jQuery(BASIC_LIST.html).find("li");

            selectList.addOption(lis);

            items = selectList.getItems();

            expect(items.length).to.equal(14);
            expectOption(items[0], "Afghanistan", "af");
            expectOption(items[1], "Albania", "al");

            expect(items[0].$element.get(0)).to.equal(lis.get(0));
          });

          it("adds array of optionDescriptions", function () {
            var selectList = $selectList.data('selectList'),
                lis, items;

            lis = [
              {value: "br", display: "Brazil"},
              jQuery("<li>", {
                "class" : "coral-SelectList-item coral-SelectList-item--option",
                "data-value" : "pt"
              }).text("Portugal")
            ];

            selectList.addOption(lis);

            items = selectList.getItems();

            expect(items.length).to.equal(2);
            expectOption(items[0], "Brazil", "br");
            expectOption(items[1], "Portugal", "pt");
          });
        });

        describe("position parameter - ", function () {
          beforeEach(function () {
            var selectList = $selectList.data('selectList');

            selectList.addOption({display: "Argentina", value: "ar"});
            selectList.addOption({display: "Bolivia", value: "bo"});
            selectList.addOption({display: "Colombia", value: "co"});
          });

          it("adds single element at the beginning", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addOption({display: "Brazil", value: "br"}, 0);

            items = selectList.getItems();

            expect(items.length).to.equal(4);
            expectOption(items[0], "Brazil", "br");
          });

          it("adds single element in the middle", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addOption({display: "Brazil", value: "br"}, 2);

            items = selectList.getItems();

            expect(items.length).to.equal(4);
            expectOption(items[2], "Brazil", "br");
          });

          it("adds multiple elements in the middle", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addOption([
                {display: "Brazil", value: "br"},
                {display: "Uruguay", value: "uy"}
              ], 2);

            items = selectList.getItems();

            expect(items.length).to.equal(5);
            expectOption(items[2], "Brazil", "br");
            expectOption(items[3], "Uruguay", "uy");
          });

          it("adds single element at the end", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addOption({display: "Brazil", value: "br"}, 3);

            items = selectList.getItems();

            expect(items.length).to.equal(4);
            expectOption(items[3], "Brazil", "br");
          });

          it("throws RangeError if position is out of bounds", function () {
            var selectList = $selectList.data('selectList');

            expect(function () { selectList.addOption({display: "Brazil", value: "br"}, -1); }).to.throw(RangeError);
            expect(function () { selectList.addOption({display: "Brazil", value: "br"}, 4); }).to.throw(RangeError);
          });
        });

        describe("Events", function () {
          it("emits an itemadded event", function (done) {
            var selectList = $selectList.data('selectList');

            $selectList.on("itemadded", function (e) {
              expect(e.item instanceof CUI.SelectList.Option).to.be.true;
              expect(e.item.getDisplay()).to.equal("Brazil");
              expect(e.item.getValue()).to.equal("br");
              expect(e.item.getPosition()).to.equal(0);
              done();
            });

            selectList.addOption({value: "br", display: "Brazil"});
          });
        });
      });
    });

    describe("getGroup()", function () {
      testAgainst([GROUP_LIST], function () {
        it("throws TypeError if position is not numeric", function () {
          var selectList = $selectList.data('selectList');

          expect(function () { selectList.getGroup("1!"); }).to.throw(TypeError);
          expect(function () { selectList.getGroup(); }).to.throw(TypeError);
        });

        it("throws RangeError if position is out of bounds", function () {
          var selectList = $selectList.data('selectList');

          expect(function () { selectList.getGroup(-1); }).to.throw(RangeError);
          expect(function () { selectList.getGroup(selectList.getItems().length); }).to.throw(RangeError);
        });

        it("returns an group instance if index is within bounds", function () {
          var selectList = $selectList.data('selectList');

          expect(selectList.getGroup(0).$element.get(0)).to.equal($selectList.children("li").get(0));
          expect(selectList.getGroup(1).$element.get(0)).to.equal($selectList.children("li").get(1));
        });
      });

      testAgainst([BASIC_LIST], function () {
        it("throws TypeError if position points to option instead of group", function () {
          var selectList = $selectList.data('selectList');

          expect(function () { selectList.getGroup(0); }).to.throw(TypeError);
        });
      });
    });

    describe("addGroup()", function () {
      var expectGroup = function (group, display) {
        expect(group.getDisplay()).to.equal(display);

        expect(group.$element.is("[role=presentation]"), "Group has role attribute").to.be.true;
        expect(group.$element.children("ul").is("[role=group]"), "Sublist has role attribute").to.be.true;
      };

      var CONTINENT_LIST =
        "<li class=\"coral-SelectList-item coral-SelectList-item--optgroup\">" +
        "  <span class=\"coral-SelectList-groupHeader\">Asia</span>" +
        "</li>" +
        "<li class=\"coral-SelectList-item coral-SelectList-item--optgroup\">" +
        "  <span class=\"coral-SelectList-groupHeader\">Africa</span>" +
        "</li>" +
        "<li class=\"coral-SelectList-item coral-SelectList-item--optgroup\">" +
        "  <span class=\"coral-SelectList-groupHeader\">North America</span>" +
        "</li>" +
        "<li class=\"coral-SelectList-item coral-SelectList-item--optgroup\">" +
        "  <span class=\"coral-SelectList-groupHeader\">South America</span>" +
        "</li>" +
        "<li class=\"coral-SelectList-item coral-SelectList-item--optgroup\">" +
        "  <span class=\"coral-SelectList-groupHeader\">Europe</span>" +
        "</li>" +
        "<li class=\"coral-SelectList-item coral-SelectList-item--optgroup\">" +
        "  <span class=\"coral-SelectList-groupHeader\">Australia</span>" +
        "</li>";

      testAgainst([EMPTY_LIST], function () {
        describe("groupDescription parameter - ", function () {
          it("adds \"display\"", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addGroup("Africa");

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectGroup(items[0], "Africa");
          });

          it("adds Element", function () {
            var selectList = $selectList.data('selectList'),
                el, li, items;

            el = document.createElement("ul");
            el.innerHTML = CONTINENT_LIST;

            li = el.firstChild;

            selectList.addGroup(li);

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectGroup(items[0], "Asia");

            expect(items[0].$element.get(0)).to.equal(li);
          });

          it("adds CUI.SelectList.Group", function () {
            var selectList = $selectList.data('selectList'),
                li, items;

            li = jQuery(CONTINENT_LIST).eq(0);

            selectList.addGroup(new CUI.SelectList.Group({element: li}));

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectGroup(items[0], "Asia");

            expect(items[0].$element.get(0)).to.equal(li.get(0));
          });

          it("adds single jQuery element", function () {
            var selectList = $selectList.data('selectList'),
                li, items;

            li = jQuery(CONTINENT_LIST).eq(0);

            selectList.addGroup(li);

            items = selectList.getItems();

            expect(items.length).to.equal(1);
            expectGroup(items[0], "Asia");

            expect(items[0].$element.get(0)).to.equal(li.get(0));
          });

          it("adds jQuery collection", function () {
            var selectList = $selectList.data('selectList'),
                lis, items;

            lis = jQuery(CONTINENT_LIST);

            selectList.addGroup(lis);

            items = selectList.getItems();

            expect(items.length).to.equal(6);
            expectGroup(items[0], "Asia");
            expectGroup(items[1], "Africa");

            expect(items[0].$element.get(0)).to.equal(lis.get(0));
          });

          it("adds array of groupDescriptions", function () {
            var selectList = $selectList.data('selectList'),
                lis, items;

            lis = [
              jQuery(CONTINENT_LIST),
              "Antarctica"
            ];

            selectList.addGroup(lis);

            items = selectList.getItems();

            expect(items.length).to.equal(7);
            expectGroup(items[0], "Asia");
            expectGroup(items[6], "Antarctica");
          });
        });

        describe("position parameter - ", function () {
          beforeEach(function () {
            var selectList = $selectList.data('selectList');

            selectList.addGroup("Asia");
            selectList.addGroup("Africa");
            selectList.addGroup("Europe");
          });

          it("adds single element at the beginning", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addGroup("North America", 0);

            items = selectList.getItems();

            expect(items.length).to.equal(4);
            expectGroup(items[0], "North America");
          });

          it("adds single element in the middle", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addGroup("North America", 2);

            items = selectList.getItems();

            expect(items.length).to.equal(4);
            expectGroup(items[2], "North America");
          });

          it("adds multiple elements in the middle", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addGroup([
                "North America",
                "South America"
              ], 2);

            items = selectList.getItems();

            expect(items.length).to.equal(5);
            expectGroup(items[2], "North America");
            expectGroup(items[3], "South America");
          });

          it("adds single element at the end", function () {
            var selectList = $selectList.data('selectList'), items;

            selectList.addGroup("North America", 3);

            items = selectList.getItems();

            expect(items.length).to.equal(4);
            expectGroup(items[3], "North America");
          });

          it("throws RangeError if position is out of bounds", function () {
            var selectList = $selectList.data('selectList');

            expect(function () { selectList.addGroup("Brazil", -1); }).to.throw(RangeError);
            expect(function () { selectList.addGroup("Brazil", 4); }).to.throw(RangeError);
          });
        });

        describe("Events", function () {
          it("emits an itemadded event", function (done) {
            var selectList = $selectList.data('selectList');

            $selectList.on("itemadded", function (e) {
              expect(e.item instanceof CUI.SelectList.Group).to.be.true;
              expect(e.item.getDisplay()).to.equal("Brazil");
              expect(e.item.getPosition()).to.equal(0);
              done();
            });

            selectList.addGroup("Brazil");
          });
        });
      });
    });

    describe("CUI.SelectList.Option", function () {
      testAgainst([BASIC_LIST], function () {
        describe("getDisplay()", function () {
          it("returns the displayed text", function () {
            var selectList = $selectList.data('selectList'),
                option =  selectList.getOption(3);

            expect(option.getDisplay()).to.equal("Bahrain");
          });
        });

        describe("getValue()", function () {
          it("returns the value attribute", function () {
            var selectList = $selectList.data('selectList'),
                option =  selectList.getOption(3);

            expect(option.getValue()).to.equal("bh");
          });

          it("always returns string values", function () {
            var selectList = $selectList.data('selectList'),
                option;

            $selectList.on("itemadded", function (e) {
              option = selectList.getOption(e.item.getPosition());
            });

            selectList.addOption({value: 2, display: "deux"});

            expect(option.getValue()).to.equal("2");
            expect($.type(option.getValue())).to.equal("string");
          });
        });

        describe("getPosition()", function () {
          it("returns the current position within the SelectList", function () {
            var selectList = $selectList.data('selectList'),
                option =  selectList.getOption(3);

            expect(option.getPosition()).to.equal(3);
          });

          it("returns the updated position after a list update", function () {
            var selectList = $selectList.data('selectList'),
                option = selectList.getOption(3);

            selectList.getOption(2).remove();

            expect(option.getPosition()).to.equal(2);
          });
        });

        describe("remove()", function () {
          it("removes the option from the list", function () {
            var selectList = $selectList.data('selectList'),
                option =  selectList.getOption(3);

            option.remove();

            expect(selectList.getItems().length).to.equal(13);
            expect(selectList.getOption(3).getValue()).to.equal("kh");
          });

          it("emits an itemremoved event", function (done) {
            var selectList = $selectList.data('selectList'),
                option =  selectList.getOption(3);

            $selectList.on("itemremoved", function (e) {
              expect(e.item instanceof CUI.SelectList.Option).to.be.true;
              expect(e.item.getDisplay()).to.equal("Bahrain");
              expect(e.item.getValue()).to.equal("bh");
              expect(e.item.getPosition()).to.equal(3);
              expect(e.target).to.equal(selectList.$element.get(0));

              done();
            });

            option.remove();
          });
        });
      });

      testAgainst([GROUP_LIST], function () {
        describe("getPosition()", function () {
          it("returns the current position within the SelectList.Group", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0),
                option = group.getOption(3);

            expect(option.getPosition()).to.equal(3);
          });

          it("returns the updated position after a group update", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0),
                option = group.getOption(3);

            group.getOption(2).remove();

            expect(option.getPosition()).to.equal(2);
          });
        });

        describe("remove()", function () {
          it("removes the option from the list", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0),
                option = group.getOption(3);

            option.remove();

            expect(group.getItems().length).to.equal(5);
            expect(group.getOption(3).getValue()).to.equal("ec");
          });

          it("emits an itemremoved event", function (done) {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0),
                option = group.getOption(3);

            group.$element.on("itemremoved", function (e) {
              expect(e.item instanceof CUI.SelectList.Option).to.be.true;
              expect(e.item.getDisplay()).to.equal("Denmark");
              expect(e.item.getValue()).to.equal("dk");
              expect(e.item.getPosition()).to.equal(3);
              expect(e.target).to.equal(group.$element.get(0));

              done();
            });

            option.remove();
          });
        });
      });
    });

    describe("CUI.SelectList.Group", function () {
      testAgainst([GROUP_LIST], function () {
        describe("getDisplay()", function () {
          it("returns the displayed text", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0);

            expect(group.getDisplay()).to.equal("Group 1");
          });
        });

        describe("getItems()", function () {
          it("returns a list of CUI.SelectList.Option instances", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0),
                items = group.getItems();

            items.forEach(function(item) {
              expect(item instanceof CUI.SelectList.Option).to.be.true;
            });

            expect(items.length).to.equal(6);
          });

          it("returns a list in proper DOM order", function() {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0),
                items = group.getItems();

            expect(items[0].$element.data("value")).to.equal("af");
            expect(items[1].$element.data("value")).to.equal("bs");
            expect(items[2].$element.data("value")).to.equal("kh");
            expect(items[3].$element.data("value")).to.equal("dk");
            expect(items[4].$element.data("value")).to.equal("ec");
            expect(items[5].$element.data("value")).to.equal("fi");
          });
        });

        describe("getOption()", function () {
          it("throws TypeError of position is not numeric", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0);

            expect(function () { group.getOption("1!"); }).to.throw(TypeError);
            expect(function () { group.getOption(); }).to.throw(TypeError);
          });

          it("throws RangeError if position is out of bounds", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0);

            expect(function () { group.getOption(-1); }).to.throw(RangeError);
            expect(function () { group.getOption(group.getItems().length); }).to.throw(RangeError);
          });

          it("returns option at given position", function () {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0),
                option = group.getOption(1);

            expect(option.$element.get(0)).to.equal(
                $selectList.find(".coral-SelectList-item--optgroup .coral-SelectList-item--option").get(1));
          });
        });

        describe("remove()", function () {
          it("removes the group from the list", function () {
            var selectList = $selectList.data('selectList'),
                group =  selectList.getGroup(0);

            group.remove();

            expect(selectList.getItems().length).to.equal(1);
            expect(selectList.getGroup(0).getDisplay()).to.equal("Group 2");
          });

          it("emits an itemremoved event", function (done) {
            var selectList = $selectList.data('selectList'),
                group = selectList.getGroup(0);

            $selectList.on("itemremoved", function (e) {
              expect(e.item instanceof CUI.SelectList.Group).to.be.true;
              expect(e.item.getDisplay()).to.equal("Group 1");
              expect(e.item.getPosition()).to.equal(0);
              expect(e.target).to.equal(selectList.$element.get(0));

              done();
            });

            group.remove();
          });
        });
      });

      testAgainst([EMPTY_LIST], function () {
        describe("addOption()", function () {
          var expectOption = function (option, display, value) {
            expect(option.getDisplay()).to.equal(display);
            expect(option.getValue()).to.equal(value);

            expect(option.$element.is("[role=option]"), "Option has role attribute").to.be.true;
          };

          describe("optionDescription parameter - ", function () {
            it("adds {display, value}", function () {
              var selectList = $selectList.data('selectList'),
                  group, items;

              selectList.addGroup("Test Group");
              group = selectList.getGroup(0);

              group.addOption({display: "Brazil", value: "br"});

              items = group.getItems();

              expect(items.length).to.equal(1);
              expectOption(items[0], "Brazil", "br");
            });

            it("adds Element", function () {
              var selectList = $selectList.data('selectList'),
                  group, li, items;

              selectList.addGroup("Test Group");
              group = selectList.getGroup(0);

              li = document.createElement("li");
              li.className = "coral-SelectList-item coral-SelectList-item--option";
              li.setAttribute("data-value", "Value");
              li.innerText = "Display";

              group.addOption(li);

              items = group.getItems();

              expect(items.length).to.equal(1);
              expectOption(items[0], "Display", "Value");

              expect(items[0].$element.get(0)).to.equal(li);
            });

            it("adds CUI.SelectList.Option", function () {
              var selectList = $selectList.data('selectList'),
                  group, li, items;

              selectList.addGroup("Test Group");
              group = selectList.getGroup(0);

              li = jQuery("<li>", {
                "class" : "coral-SelectList-item coral-SelectList-item--option",
                "data-value" : "Value"
              }).text("Display");

              group.addOption(new CUI.SelectList.Option({element: li}));

              items = group.getItems();

              expect(items.length).to.equal(1);
              expectOption(items[0], "Display", "Value");

              expect(items[0].$element.get(0)).to.equal(li.get(0));
            });

            it("adds single jQuery element", function () {
              var selectList = $selectList.data('selectList'),
                  group, li, items;

              selectList.addGroup("Test Group");
              group = selectList.getGroup(0);

              li = jQuery("<li>", {
                "class" : "coral-SelectList-item coral-SelectList-item--option",
                "data-value" : "Value"
              }).text("Display");

              group.addOption(li);

              items = group.getItems();

              expect(items.length).to.equal(1);
              expectOption(items[0], "Display", "Value");

              expect(items[0].$element.get(0)).to.equal(li.get(0));
            });

            it("adds jQuery collection", function () {
              var selectList = $selectList.data('selectList'),
                  group, lis, items;

              selectList.addGroup("Test Group");
              group = selectList.getGroup(0);

              lis = jQuery(BASIC_LIST.html).find("li");

              group.addOption(lis);

              items = group.getItems();

              expect(items.length).to.equal(14);
              expectOption(items[0], "Afghanistan", "af");
              expectOption(items[1], "Albania", "al");

              expect(items[0].$element.get(0)).to.equal(lis.get(0));
            });

            it("adds array of optionDescriptions", function () {
              var selectList = $selectList.data('selectList'),
                  group, lis, items;

              selectList.addGroup("Test Group");
              group = selectList.getGroup(0);

              lis = [
                {value: "br", display: "Brazil"},
                jQuery("<li>", {
                  "class" : "coral-SelectList-item coral-SelectList-item--option",
                  "data-value" : "pt"
                }).text("Portugal")
              ];

              group.addOption(lis);

              items = group.getItems();

              expect(items.length).to.equal(2);
              expectOption(items[0], "Brazil", "br");
              expectOption(items[1], "Portugal", "pt");
            });
          });

          describe("position parameter - ", function () {
            beforeEach(function () {
              var selectList = $selectList.data('selectList');

              selectList.addGroup("South America");

              var group = selectList.getGroup(0);

              group.addOption({display: "Argentina", value: "ar"});
              group.addOption({display: "Bolivia", value: "bo"});
              group.addOption({display: "Colombia", value: "co"});
            });

            it("adds single element at the beginning", function () {
              var selectList = $selectList.data('selectList'),
                  group = selectList.getGroup(0), items;

              group.addOption({display: "Brazil", value: "br"}, 0);

              items = group.getItems();

              expect(items.length).to.equal(4);
              expectOption(items[0], "Brazil", "br");
            });

            it("adds single element in the middle", function () {
              var selectList = $selectList.data('selectList'),
                  group = selectList.getGroup(0), items;

              group.addOption({display: "Brazil", value: "br"}, 2);

              items = group.getItems();


              expect(items.length).to.equal(4);
              expectOption(items[2], "Brazil", "br");
            });

            it("adds multiple elements in the middle", function () {
              var selectList = $selectList.data('selectList'),
                  group = selectList.getGroup(0), items;

              group.addOption([
                  {display: "Brazil", value: "br"},
                  {display: "Uruguay", value: "uy"}
                ], 2);

              items = group.getItems();

              expect(items.length).to.equal(5);
              expectOption(items[2], "Brazil", "br");
              expectOption(items[3], "Uruguay", "uy");
            });

            it("adds single element at the end", function () {
              var selectList = $selectList.data('selectList'),
                  group = selectList.getGroup(0), items;

              group.addOption({display: "Brazil", value: "br"}, 3);

              items = group.getItems();

              expect(items.length).to.equal(4);
              expectOption(items[3], "Brazil", "br");
            });

            it("throws RangeError if position is out of bounds", function () {
              var selectList = $selectList.data('selectList'),
                  group = selectList.getGroup(0), items;

              expect(function () { group.addOption({display: "Brazil", value: "br"}, -1); }).to.throw(RangeError);
              expect(function () { group.addOption({display: "Brazil", value: "br"}, 4); }).to.throw(RangeError);
            });
          });

          describe("Events", function () {
            it("emits an itemadded event", function (done) {
              var selectList = $selectList.data('selectList'), group;

              selectList.addGroup("Test Group");
              group = selectList.getGroup(0);

              $selectList.on("itemadded", function (e) {
                expect(e.item instanceof CUI.SelectList.Option).to.be.true;
                expect(e.item.getDisplay()).to.equal("Brazil");
                expect(e.item.getValue()).to.equal("br");
                expect(e.item.getPosition()).to.equal(0);
                done();
              });

              group.addOption({value: "br", display: "Brazil"});
            });
          });
        });
      });
    });
  });
});
