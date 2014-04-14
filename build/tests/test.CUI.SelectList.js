describe('CUI.SelectList', function() {

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
    for (var i = 0, ii = variants.length; i < ii; i++) {
      var variant = variants[i];
      describe(variant.name, function() {
        beforeEach(function() {
          constructList(variant.html);
        });
        callback();
      });
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

        $toggle.trigger($keyEvent);
        expect($selectList).not.to.have.class('is-visible');
      });

      it('selects the highlighted item using keys', function() {
        var $items = $selectList.find('[role="option"]');

        $items.removeClass('is-highlighted').first().addClass('is-highlighted');

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
          39, // right arrow
          40 // down arrow
        ];

        keyCodes.forEach(function(keyCode) {
          $items.removeClass('is-highlighted');

          var $keyEvent = $.Event('keydown');
          $keyEvent.which = keyCode;

          $toggle.trigger($keyEvent);
          expect($items.eq(0)).to.have.class('is-highlighted');

          $toggle.trigger($keyEvent);
          expect($items.eq(0)).not.to.have.class('is-highlighted');
          expect($items.eq(1)).to.have.class('is-highlighted');
        });
      });

      it('sets the caret to the previous item using keys', function() {
        var $items = $selectList.find('[role="option"]');

        var keyCodes = [
          33, // page up
          37, // left arrow
          38 // up arrow
        ];

        keyCodes.forEach(function(keyCode) {
          $items.removeClass('is-highlighted');

          var $keyEvent = $.Event('keydown');
          $keyEvent.which = keyCode;

          $toggle.trigger($keyEvent);
          expect($items.last()).to.have.class('is-highlighted');

          $toggle.trigger($keyEvent);
          expect($items.last()).not.to.have.class('is-highlighted');
          expect($items.last().prev()).to.have.class('is-highlighted');
        });
      });

      it('sets the caret to the first item using home key', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 36; // home

        $toggle.trigger($keyEvent);
        expect($items.first()).to.have.class('is-highlighted');
      });

      it('sets the caret to the first item using end key', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 35; // end

        $toggle.trigger($keyEvent);
        expect($items.last()).to.have.class('is-highlighted');
      });

      it('never sets the caret to items with is-disabled', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');
        var $firstItem = $items.first().addClass('is-disabled');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 36; // home

        $toggle.trigger($keyEvent);
        expect($firstItem).not.to.have.class('is-highlighted');
      });

      it('never sets the caret to items that are not visible', function() {
        var $items = $selectList.find('[role="option"]').removeClass('is-highlighted');
        var $firstItem = $items.first().addClass('is-hidden');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = 36; // home

        $toggle.trigger($keyEvent);
        expect($firstItem).not.to.have.class('is-highlighted');
      });

      it("shouldn't receive browser focus", function() {
        expect($selectList.addBack($selectList).find(':focusable').length).to.equal(0);
      });
    });
  });

  describe('filtering', function() {
    testAgainst(ALL_VARIANTS, function() {
      it('filters items', function() {
        var $this;
        var itemsToShow = ['bh', 'kh'];

        $selectList.selectList('filter', function(value, display) {
          $this = $(this);
          expect($this).to.have.data('value', value);
          expect($this).to.have.text(display);
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
});
