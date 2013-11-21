describe('CUI.Autocomplete', function() {

  var $autocomplete, $input, $toggle, $selectList, $tagList;

  beforeEach(function() {
    var autocompleteHtml = '' +
        '<span class="autocomplete icon-search" data-init="autocomplete" data-multiple="true">' +
        '  <input type="text" name="name1" placeholder="Search">' +
        '  <button class="autocomplete-suggestion-toggle"></button>' +
        '  <ul class="autocomplete-suggestions selectlist">' +
        '    <li data-value="af">Afghanistan</li>' +
        '    <li data-value="al">Albania</li>' +
        '    <li data-value="bs">Bahamas</li>' +
        '    <li data-value="bh">Bahrain</li>' +
        '    <li data-value="kh">Cambodia</li>' +
        '    <li data-value="cm">Cameroon</li>' +
        '    <li data-value="dk">Denmark</li>' +
        '    <li data-value="dj">Djibouti</li>' +
        '    <li data-value="ec">Ecuador</li>' +
        '    <li data-value="eg">Egypt</li>' +
        '    <li data-value="fj">Fiji</li>' +
        '    <li data-value="fi">Finland</li>' +
        '  </ul>' +
        '</span>';

    $autocomplete = $(autocompleteHtml)
        .autocomplete()
        .appendTo(document.body);
    $input = $autocomplete.find('input');
    $toggle = $autocomplete.find('.autocomplete-suggestion-toggle');
    $selectList = $autocomplete.find('.selectlist');
    $tagList = $autocomplete.find('.taglist');
  });

  afterEach(function() {
    $autocomplete.remove();
    $input.remove();
    $toggle.remove();
    $selectList.remove();
    $tagList.remove();
    $autocomplete = $input = $toggle = $selectList = $tagList = null;
  });

  describe('selectlist visibility', function() {
    it('shows when trigger is clicked', function() {
      $toggle.trigger('click');
      expect($selectList).to.have.class('visible');
    });

    it('hides when trigger is clicked', function() {
      $selectList.selectList('show');
      $toggle.trigger('click');
      expect($selectList).not.to.have.class('visible');
    });

    it('hides on click outside', function() {
      $selectList.selectList('show');
      $(document.body).trigger('click');
      expect($selectList).not.to.have.class('visible');
    });

    it('does not hide when clicking inside list', function() {
      $selectList.selectList('show');
      $selectList.trigger('click');
      expect($selectList).to.have.class('visible');
    });

    it('hides when clicking text input with no value', function() {
      $selectList.selectList('show');
      $input.trigger('click');
      expect($selectList).not.to.have.class('visible');
    });

    it('remains showing when input gains focus', function() {
      $input.val('Bah');
      $selectList.selectList('show');
      $input.focus();
      expect($selectList).to.have.class('visible');
    });

    it('shows when text is entered with matching options', function() {
      var clock = sinon.useFakeTimers();
      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).to.have.class('visible');
      clock.restore();
    });

    it('hides when removing text that had matching options', function() {
      var clock = sinon.useFakeTimers();
      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      $input.val('').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).not.to.have.class('visible');
      clock.restore();
    });

    // There's a reasonable case for showing the matching suggestions if
    // there's a value in the text field when the user tabs into it.
    // The problem is that the next tab-stop is the first item in the select
    // list. If the user is just tabbing through fields in a form they likely
    // don't want to have to tab through all the items in the select list to
    // get to the next form element.
    it('does not show when tabbing into the text input', function() {
      var keyEvent = $.Event('keyup');
      keyEvent.which = 9; // tab
      $input.val('Bah');
      $input.focus().trigger(keyEvent);
      expect($selectList).not.to.have.class('visible');
    });

    it('does not show when using non-value-changing keys in text input', function() {
      var keyEvent = $.Event('keyup');
      keyEvent.which = 37; // left arrow
      $input.val('Bah');
      $input.focus().trigger(keyEvent);
      keyEvent.which = 39; // right arrow
      $input.trigger(keyEvent);
      expect($selectList).not.to.have.class('visible');
    });

    it('with multiple=false hides after selecting an item from list by hitting enter', function() {
      var clock = sinon.useFakeTimers();

      $autocomplete.autocomplete('set', 'multiple', false);
      $selectList.selectList('show');
      var $firstItem = $selectList.find('li').eq(0);

      var keyDownEvent = $.Event('keydown');
      keyDownEvent.which = 13; // enter
      $firstItem.focus().trigger(keyDownEvent);

      var keyUpEvent = $.Event('keyup');
      keyUpEvent.which = 13; // enter
      $(document.activeElement).trigger(keyUpEvent);

      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.

      clock.tick(100000);
      expect($selectList).not.to.have.class('visible');
      clock.restore();
    });

    it('with multiple=true hides after creating a tag by hitting enter', function() {
      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.
      var clock = sinon.useFakeTimers();

      $autocomplete.autocomplete('set', 'multiple', true);

      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).to.have.class('visible');

      var keyUpEvent = $.Event('keyup');
      keyUpEvent.which = 13;
      $input.trigger(keyUpEvent);

      expect($selectList).not.to.have.class('visible');
      clock.restore();
    });

    it('shows when pasting matching text into input', function() {
      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.
      var clock = sinon.useFakeTimers();

      $input.val('Bah').trigger('input').trigger('paste');
      clock.tick(100000); // Skip the debounce wait.

      expect($selectList).to.have.class('visible');
      clock.restore();
    });

    it('hides when cutting matching text from input', function() {
      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.
      var clock = sinon.useFakeTimers();

      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).to.have.class('visible');

      $input.val('').trigger('input').trigger('cut');

      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).not.to.have.class('visible');

      clock.restore();
    });
  });

  describe('static search mode', function() {
    var clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      $selectList.selectList('set', 'type', 'static');
    });

    afterEach(function() {
      clock.restore();
      clock = null;
    });

    it('matches using contains mode', function() {
      $autocomplete.autocomplete('set', 'mode', 'contains');
      $input.val('ma').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      var $visibleItems = $selectList.find('li:visible');
      expect($visibleItems.length).to.equal(2);
      expect($visibleItems.eq(0)).to.have.text('Bahamas');
      expect($visibleItems.eq(1)).to.have.text('Denmark');
    });

    it('matches using starts mode', function() {
      $autocomplete.autocomplete('set', 'mode', 'starts');
      $input.val('Cam').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      var $visibleItems = $selectList.find('li:visible');
      expect($visibleItems.length).to.equal(2);
      expect($visibleItems.eq(0)).to.have.text('Cambodia');
      expect($visibleItems.eq(1)).to.have.text('Cameroon');
    });

    it('respects case-sensitivity when ignorecase=false', function() {
      $autocomplete.autocomplete('set', 'mode', 'starts');
      $autocomplete.autocomplete('set', 'ignorecase', false);
      $input.val('cam').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      var $visibleItems = $selectList.find('li:visible');
      expect($visibleItems.length).to.equal(0);
    });
  });


  describe('dynamic search mode', function() {
    var clock;

    beforeEach(function() {
      clock = sinon.useFakeTimers();
      $selectList.selectList('set', {
        'type': 'dynamic',
        'dataurl': 'examples/autocomplete/remotehtml.html'
      });
    });

    afterEach(function() {
      clock.restore();
      clock = null;
    });

    it('initiates data request', function() {
      $autocomplete.autocomplete('set', {
        'type': 'dynamic',
        'dataurl': 'examples/autocomplete/remotehtml.html'
      }, 3000);

      var selectListWidget = $selectList.data('selectList');
      var setSpy = sinon.spy(selectListWidget, 'set');
      var triggerLoadDataSpy = sinon.spy(selectListWidget, 'triggerLoadData');

      $input.val('foo').trigger('input');
      clock.tick(100000); // Skip the debounce wait.

      var queryMatch = sinon.match({query: 'foo'});
      expect(setSpy.calledWith('dataadditional', queryMatch)).to.be.true;
      expect(triggerLoadDataSpy.calledWith(true)).to.be.true;
    })
  });

  describe('keystroke debouncing', function() {
    it('waits for additional keystrokes based on delay option', function() {
      var clock = sinon.useFakeTimers();
      var spy = sinon.spy();

      $autocomplete.autocomplete('set', 'delay', 3000);
      $autocomplete.on('query', spy);
      $input.val('B').trigger('input');
      $input.val('Ba').trigger('input');

      clock.tick(1000);
      expect(spy.called).to.be.false;
      $input.val('Bah').trigger('input');
      clock.tick(2990);
      expect(spy.called).to.be.false;
      clock.tick(20);
      expect(spy.called).to.be.true;
      clock.restore();
    });
  });

  describe('selection', function() {
    it('creates tags when multiple=true using text input', function() {
      $autocomplete.autocomplete('set', 'multiple', true);
      var keyEvent = $.Event('keyup');
      keyEvent.which = 13; // enter

      var addItemSpy = sinon.spy($tagList.data('tagList'), 'addItem');

      $input.val('foo').trigger(keyEvent);
      $input.val('bar').trigger(keyEvent);

      expect(addItemSpy.callCount).to.equal(2);
      expect(addItemSpy.calledWith('foo'));
      expect(addItemSpy.calledWith('bar'));
    });

    it('creates tags when multiple=true using select list', function() {
      $autocomplete.autocomplete('set', 'multiple', true);
      var selectEvent = $.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      });

      var addItemSpy = sinon.spy($tagList.data('tagList'), 'addItem');
      $selectList.trigger(selectEvent);

      var matcher = sinon.match({display: 'Bahamas', value: 'bs'});
      expect(addItemSpy.calledWith(matcher)).to.be.true;
    });

    it('sets input value when multiple=false', function() {
      $autocomplete.autocomplete('set', 'multiple', false);
      var keyEvent = $.Event('keyup');
      keyEvent.which = 13; // enter

      $input.val('foo').trigger(keyEvent);
      $input.val('bar').trigger(keyEvent);

      // The tag list should have been removed when we set multiple=false
      expect($autocomplete.find('.taglist').length).to.equal(0);
      expect($input).to.have.value('bar');
    });
  });

  describe('clear API', function() {
    it('clears the input', function() {
      $input.val('foo');
      $autocomplete.autocomplete('clear');
      expect($input).to.have.value('');
    });
  });

  describe('form submission', function() {
    it('it does not submit a parent form when clicking the toggle', function() {
      var spy = sinon.spy(function() { return false; });
      var $form = $('<form></form>')
          .appendTo(document.body)
          .on('submit', spy);

      $autocomplete.detach().appendTo($form);

      $toggle.trigger('click');
      expect(spy.called).to.be.false;

      $form.remove();
    });

    it('it does not submit a parent form when hitting enter on the input when multiple=true', function() {
      $autocomplete.autocomplete('set', 'multiple', true);

      var keyEvent = $.Event('keydown');
      keyEvent.which = 13; // enter

      var spy = sinon.spy(keyEvent, 'preventDefault');
      $input.val('foo').focus().trigger(keyEvent);
      expect(spy.called).to.be.true;
    });

    it('it does submit a parent form when hitting enter on the input when multiple=false', function() {
      $autocomplete.autocomplete('set', 'multiple', false);

      var keyDown = $.Event('keydown');
      keyDown.which = 13; // enter

      var keyDownSpy = sinon.spy(keyDown, 'preventDefault');
      $input.val('foo').focus().trigger(keyDown);
      expect(keyDownSpy.called).to.be.false;

      var keyPress = $.Event('keypress');
      keyPress.which = 13; // enter

      var keyPressSpy = sinon.spy(keyPress, 'preventDefault');
      $input.trigger(keyPress);
      expect(keyPressSpy.called).to.be.false;
    });
  });
});