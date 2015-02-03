/* jshint expr:true */
/* global describe, it, expect, $, sinon, afterEach, beforeEach */
describe('CUI.Autocomplete', function () {

  var INITIAL_ITEMS_LENGTH = 12;

  var $autocomplete, $input, $toggle, $selectList, $tagList, $button;

  beforeEach(function () {
    var autocompleteHtml = '' +
      '<div class="coral-Autocomplete" data-init="autocomplete" data-multiple="true">' +
      '  <div class="coral-InputGroup coral-InputGroup--block js-coral-Autocomplete-field">' +
      '    <label class="coral-DecoratedTextfield coral-InputGroup-input">' +
      '      <span class="u-coral-screenReaderOnly">Search</span>' +
      '      <span class="coral-DecoratedTextfield-icon coral-Icon coral-Icon--sizeXS coral-Icon--search" aria-hidden="true"></span>' +
      '      <input class="coral-DecoratedTextfield-input coral-Textfield js-coral-Autocomplete-textfield" type="text"' +
      '        name="name1" placeholder="Search" value="Initial Text">' +
      '    </label>' +
      '    <span class="coral-InputGroup-button">' +
      '      <button class="coral-Button coral-Button--secondary coral-Button--square js-coral-Autocomplete-toggleButton" type="button">' +
      '        <i class="coral-Icon coral-Icon--sizeXS coral-Icon--triangleDown"></i>' +
      '      </button>' +
      '    </span>' +
      '  </div>' +
      '  <ul class="coral-SelectList js-coral-Autocomplete-selectList">' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="af">Afghanistan</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="al">Albania</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="bs">Bahamas</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="bh">Bahrain</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="kh">Cambodia</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="cm">Cameroon</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="dk">Denmark</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="dj">Djibouti</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="ec">Ecuador</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="eg">Egypt</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="fj">Fiji</li>' +
      '    <li class="coral-SelectList-item coral-SelectList-item--option" data-value="fi">Finland</li>' +
      '  </ul>' +
      '</div>';

    $autocomplete = $(autocompleteHtml)
      .autocomplete()
      .appendTo(document.body);
    $input = $autocomplete.find('.js-coral-Autocomplete-textfield');
    $toggle = $autocomplete.find('.js-coral-Autocomplete-toggleButton');
    $selectList = $autocomplete.find('.js-coral-Autocomplete-selectList');
    $tagList = $autocomplete.find('.js-coral-Autocomplete-tagList');
    $button = $autocomplete.find('.js-coral-Autocomplete-toggleButton');

  });

  afterEach(function () {
    $autocomplete.remove();
    $input.remove();
    $toggle.remove();
    $selectList.remove();
    $tagList.remove();
    $button.remove();
    $autocomplete = $input = $toggle = $selectList = $tagList = $button = null;
  });

  describe('selectlist visibility', function () {
    it('shows when toggle is clicked', function () {
      $toggle.trigger('click');
      expect($selectList).to.have.class('is-visible');
    });

    it('hides when toggle is clicked', function () {
      $selectList.selectList('show');
      $toggle.trigger('click');
      expect($selectList).not.to.have.class('is-visible');
    });

    it('hides on click outside', function () {
      $selectList.selectList('show');
      $(document.body).trigger('click');
      expect($selectList).not.to.have.class('is-visible');
    });

    it('does not hide when clicking inside list', function () {
      $selectList.selectList('show');
      $selectList.trigger('click');
      expect($selectList).to.have.class('is-visible');
    });

    it('hides when clicking text input with no value', function () {
      $selectList.selectList('show');
      $input.trigger('click');
      expect($selectList).not.to.have.class('is-visible');
    });

    it('remains showing when input gains focus', function () {
      $input.val('Bah');
      $selectList.selectList('show');
      $input.focus();
      expect($selectList).to.have.class('is-visible');
    });

    it('shows when text is entered with matching options', function () {
      var clock = sinon.useFakeTimers();
      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).to.have.class('is-visible');
      clock.restore();
    });

    it('hides when removing text that had matching options', function () {
      var clock = sinon.useFakeTimers();
      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      $input.val('').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).not.to.have.class('is-visible');
      clock.restore();
    });

    // There's a reasonable case for showing the matching suggestions if
    // there's a value in the text field when the user tabs into it.
    // The problem is that the next tab-stop is the first item in the select
    // list. If the user is just tabbing through fields in a form they likely
    // don't want to have to tab through all the items in the select list to
    // get to the next form element.
    it('does not show when tabbing into the text input', function () {
      var keyEvent = $.Event('keyup');
      keyEvent.which = 9; // tab
      $input.val('Bah');
      $input.focus().trigger(keyEvent);
      expect($selectList).not.to.have.class('is-visible');
    });

    it('does not show when using non-value-changing keys in text input', function () {
      var keyEvent = $.Event('keyup');
      keyEvent.which = 37; // left arrow
      $input.val('Bah');
      $input.focus().trigger(keyEvent);
      keyEvent.which = 39; // right arrow
      $input.trigger(keyEvent);
      expect($selectList).not.to.have.class('is-visible');
    });

    it('with multiple=false hides after selecting an item from list by hitting enter', function () {
      var clock = sinon.useFakeTimers();

      $autocomplete.autocomplete('set', 'multiple', false);
      $selectList.selectList('show');
      var $firstItem = $selectList.find('li').eq(0).addClass('is-highlighted');

      $selectList.data('selectList').setCaretToItem($firstItem);

      var keyDownEvent = $.Event('keydown');
      keyDownEvent.which = 13; // enter
      $firstItem.focus().trigger(keyDownEvent);

      var keyUpEvent = $.Event('keyup');
      keyUpEvent.which = 13; // enter
      $(document.activeElement).trigger(keyUpEvent);

      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.

      clock.tick(100000);
      expect($selectList).not.to.have.class('is-visible');
      clock.restore();
    });

    it('with multiple=true hides after creating a tag by hitting enter', function () {
      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.
      var clock = sinon.useFakeTimers();

      $autocomplete.autocomplete('set', 'multiple', true);

      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).to.have.class('is-visible');

      var keyUpEvent = $.Event('keyup');
      keyUpEvent.which = 13;
      $input.trigger(keyUpEvent);

      expect($selectList).not.to.have.class('is-visible');
      clock.restore();
    });

    it('shows when pasting matching text into input', function () {
      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.
      var clock = sinon.useFakeTimers();

      $input.val('Bah').trigger('input').trigger('paste');
      clock.tick(100000); // Skip the debounce wait.

      expect($selectList).to.have.class('is-visible');
      clock.restore();
    });

    it('hides when cutting matching text from input', function () {
      // Fast forward past any potential debounce.
      // We want to make sure it doesn't show up again.
      var clock = sinon.useFakeTimers();

      $input.val('Bah').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).to.have.class('is-visible');

      $input.val('').trigger('input').trigger('cut');

      clock.tick(100000); // Skip the debounce wait.
      expect($selectList).not.to.have.class('is-visible');

      clock.restore();
    });

    it('shows full list when text is entered and button is clicked', function () {
      var clock = sinon.useFakeTimers();

      $input.val('Bah').trigger('input');
      clock.tick(100000);
      $button.trigger('click'); // Close suggestions
      clock.tick(100000);
      $button.trigger('click'); // Open suggestions
      clock.tick(100000);

      $selectList.find('li').each(function() {
         expect($(this)).not.to.have.class('is-hidden');
      });

      clock.restore();
    });
  });

  describe('static search mode', function () {
    var clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers();
      $selectList.selectList('set', 'type', 'static');
    });

    afterEach(function () {
      clock.restore();
      clock = null;
    });

    it('matches using contains mode', function () {
      $autocomplete.autocomplete('set', 'mode', 'contains');
      $input.val('ma').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      var $visibleItems = $selectList.find('li:not(.is-hidden)');
      expect($visibleItems.length).to.equal(2);
      expect($visibleItems.eq(0)).to.have.text('Bahamas');
      expect($visibleItems.eq(1)).to.have.text('Denmark');
    });

    it('matches using starts mode', function () {
      $autocomplete.autocomplete('set', 'mode', 'starts');
      $input.val('Cam').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      var $visibleItems = $selectList.find('li:not(.is-hidden)');
      expect($visibleItems.length).to.equal(2);
      expect($visibleItems.eq(0)).to.have.text('Cambodia');
      expect($visibleItems.eq(1)).to.have.text('Cameroon');
    });

    it('respects case-sensitivity when ignorecase=false', function () {
      $autocomplete.autocomplete('set', 'mode', 'starts');
      $autocomplete.autocomplete('set', 'ignorecase', false);
      $input.val('cam').trigger('input');
      clock.tick(100000); // Skip the debounce wait.
      var $visibleItems = $selectList.find('li:not(.is-hidden)');
      expect($visibleItems.length).to.equal(0);
    });
  });


  describe('dynamic search mode', function () {
    var clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers();
      $selectList.selectList('set', {
        'type': 'dynamic',
        'dataurl': 'examples/autocomplete/remotehtml.html'
      });
    });

    afterEach(function () {
      clock.restore();
      clock = null;
    });

    it('initiates data request', function () {
      $autocomplete.autocomplete('set', {
        'type': 'dynamic',
        'dataurl': 'examples/autocomplete/remotehtml.html'
      }, 3000);

      var selectListWidget = $selectList.data('selectList');
      selectListWidget.set('dataadditional', { abc: 'abc'});

      var setSpy = sinon.spy(selectListWidget, 'set');
      var triggerLoadDataSpy = sinon.spy(selectListWidget, 'triggerLoadData');

      $input.val('foo').trigger('input');
      clock.tick(100000); // Skip the debounce wait.

      var queryMatch = sinon.match({query: 'foo', abc: 'abc'});
      expect(setSpy.calledWith('dataadditional', queryMatch)).to.be.true;
      expect(triggerLoadDataSpy.calledWith(true)).to.be.true;
    });
  });

  describe('keystroke debouncing', function () {
    it('waits for additional keystrokes based on delay option', function () {
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

  describe('selection', function () {
    it('creates tags when multiple=true using text input', function () {
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

    it('creates tags when multiple=true using select list', function () {
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

    it('creates a hidden input when force selection = true', function () {
      var autocomplete = $autocomplete.data('autocomplete');

      // changes multiple since it is set to true in the tests
      $autocomplete.autocomplete('set', 'multiple', false);

      // changes the displayed value before changing the selection mode
      $selectList.trigger($.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      }));

      // // gets the name that the field initially had.
      var oldName = $input.attr('name');
      var oldValue = $input.val();
      // sets the desired option
      $autocomplete.autocomplete('set', 'forceselection', true);

      // gets the values to check
      var hiddenInput = $autocomplete.find('input[type="hidden"]');

      expect($input.attr('name')).to.be.empty;
      expect(oldName).to.equal(hiddenInput.attr('name'));
      expect(oldValue).to.equal(hiddenInput.val());
    });

    it('creates tags when multiple=true and force selection', function () {
      $autocomplete.autocomplete('set', 'multiple', true);
      $autocomplete.autocomplete('set', 'forceselection', true);
      var autocomplete = $autocomplete.data('autocomplete');

      var addItemSpy = sinon.spy($tagList.data('tagList'), 'addItem');

      $input.val('foo').trigger($.Event('keyup', {
        which: 13
      }));

      expect(addItemSpy.callCount).to.equal(0);
      expect($input.val()).to.equal('foo');
      expect(autocomplete.getValue()).to.be.empty;


      $selectList.trigger($.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      }));

      expect(addItemSpy.callCount).to.equal(1);
      expect(autocomplete.getValue()).to.eql(['bs']);
    });

    it('sets input value when multiple=false', function () {
      $autocomplete.autocomplete('set', 'multiple', false);
      var keyEvent = $.Event('keyup');
      keyEvent.which = 13; // enter

      $input.val('foo').trigger(keyEvent);
      $input.val('bar').trigger(keyEvent);

      // The tag list should have been removed when we set multiple=false
      expect($autocomplete.find('.taglist').length).to.equal(0);
      expect($input).to.have.value('bar');


      $selectList.trigger($.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      }));

      expect($input).to.have.value('bs');


      $selectList.trigger($.Event('selected', {
        displayedValue: 'text'
      }));

      expect($input).to.have.value('text');
    });

    it('sets input value when multiple=false and force selection', function () {
      var clock = sinon.useFakeTimers();

      $autocomplete.autocomplete('set', 'multiple', false);
      $autocomplete.autocomplete('set', 'forceselection', true);
      var autocomplete = $autocomplete.data('autocomplete');

      $input.val('foo');
      expect($input).to.have.value('foo');

      $input.trigger('blur');

      clock.tick(100000); // the handler of the blur is under setTimeout, so to wait first
      // input and value match
      expect($input.val()).to.equal(autocomplete.getValue());
      // expect(autocomplete.getValue()).to.be.undefined;
      clock.restore();


      var selectEvent = $.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      });
      $selectList.trigger(selectEvent);

      expect($input).to.have.value('Bahamas');
      expect($input.next('input[type=hidden]')).to.have.value('bs');
    });
  });

  describe('clear API (multiple = false, forceselection = false)', function () {
    it('clears the input', function () {

      $autocomplete.autocomplete('set', 'multiple', false);
      $autocomplete.autocomplete('set', 'forceselection', false);

      $input.val('foo');
      $autocomplete.data('autocomplete').clear();
      expect($input).to.have.value('');
      expect($autocomplete.data('autocomplete').getValue()).to.equal('');
    });
  });

  describe('clear API (multiple = false, forceselection = true', function () {
    it('clears the input', function () {

      $autocomplete.autocomplete('set', 'multiple', false);
      $autocomplete.autocomplete('set', 'forceselection', true);

      $input.val('foo');
      $autocomplete.data('autocomplete').clear();
      expect($input).to.have.value('');
      expect($autocomplete.data('autocomplete').getValue()).to.equal('');
    });
  });

  describe('clear API (multiple = true, forceselection = false)', function () {
    it('clears the input', function () {

      $autocomplete.autocomplete('set', 'multiple', true);
      $autocomplete.autocomplete('set', 'forceselection', false);

      $input.val('foo');
      $autocomplete.data('autocomplete').clear();
      expect($input).to.have.value('');
      expect($autocomplete.data('autocomplete').getValue()).to.be.empty;
    });
  });

  describe('clear API dynamic search mode', function () {
    var clock;

    beforeEach(function () {
      clock = sinon.useFakeTimers();
      $selectList.selectList('set', {
        'type': 'dynamic',
        'dataurl': 'examples/autocomplete/remotehtml.html'
      });
    });

    afterEach(function () {
      clock.restore();
      clock = null;
    });

    it('clears the input and check dynamic properties after clean up', function () {

      // create dynamic selectList
      $autocomplete.autocomplete('set', {
        'type': 'dynamic',
        'dataurl': 'examples/autocomplete/remotehtml.html'
      }, 3000);

      // set some additional data
      var selectListWidget = $selectList.data('selectList');
      selectListWidget.set('dataadditional', { abc: 'abc'});

      // test dynamic list
      var setSpy = sinon.spy(selectListWidget, 'set');
      var triggerLoadDataSpy = sinon.spy(selectListWidget, 'triggerLoadData');

      $input.val('foo').trigger('input');
      clock.tick(100000); // Skip the debounce wait.

      var queryMatch = sinon.match({query: 'foo', abc: 'abc'});
      expect(setSpy.calledWith('dataadditional', queryMatch)).to.be.true;
      expect(triggerLoadDataSpy.calledWith(true)).to.be.true;

      // clear the autocomplete
      $autocomplete.data('autocomplete').clear();

      expect($input).to.have.value('');
      expect($autocomplete.data('autocomplete').getValue()).to.be.empty;

      // expect previously added properties to remain
      expect(selectListWidget.get('dataadditional')).to.have.property('abc');

      // expect autocomplete related properties to be removed
      expect(selectListWidget.get('dataadditional')).to.not.have.property('query');

      // test re-executing a dynamic search
      $input.val('bar').trigger('input');
      clock.tick(100000); // Skip the debounce wait.

      expect($input).to.have.value('bar');

      var value = selectListWidget.get('dataadditional');
      expect(value).to.have.property('abc');
      expect(value).to.have.property('query');

    });
  });

  describe("getItems API", function () {
    it("returns one CUI.SelectList.Option per option", function () {
      var autocompleteWidget = $autocomplete.data('autocomplete');
      var items = autocompleteWidget.getItems();

      expect(items.length).to.equal(INITIAL_ITEMS_LENGTH);

      var item = items[3];
      expect(item instanceof CUI.SelectList.Option).to.be.true;
      expect(item.getValue()).to.equal("bh");
      expect(item.getDisplay()).to.equal("Bahrain");
    });
  });

  describe('getValue API', function () {

    it ('returns the selected item', function () {

      $autocomplete.autocomplete('set', 'multiple', false);

      var selectEvent = $.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      });
      $selectList.trigger(selectEvent);

      var autocomplete = $autocomplete.data('autocomplete');
      var value = autocomplete.getValue();
      expect(value).to.eql('bs');
    });

    it('returns the selected items', function () {

      var spy = sinon.spy(function () {
        return false;
      });

      $autocomplete.on('selected', spy);

      var selectEvent = $.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      });
      $selectList.trigger(selectEvent);

      expect(spy.callCount).to.equal(1);

      selectEvent = $.Event('selected', {
        selectedValue: 'dk',
        displayedValue: 'Denmark'
      });
      $selectList.trigger(selectEvent);

      expect(spy.callCount).to.equal(2);

      var autocomplete = $autocomplete.data('autocomplete');
      var value = autocomplete.getValue();

      expect(value).to.eql(['bs', 'dk']);
    });
  });

  describe('getOption API', function() {

    it('returns option item at given index', function() {
      var selectListWidget = $selectList.data('selectList');
      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH);

      var autocompleteWidget = $autocomplete.data('autocomplete');

      var thirdItem = autocompleteWidget.getOption(3);
      expect(thirdItem.getDisplay()).to.equal('Bahrain');
    });
  });

  describe('addOption API', function() {

    it('adds an option at the end when no index provided', function() {
      var selectListWidget = $selectList.data('selectList');
      var autocompleteWidget = $autocomplete.data('autocomplete');

      var LAST_ITEM_INDEX = INITIAL_ITEMS_LENGTH - 1;

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH);
      var lastItem = autocompleteWidget.getOption(LAST_ITEM_INDEX);
      expect(lastItem.getDisplay()).to.equal('Finland');

      autocompleteWidget.addOption({value: 'ki', display: "I <3 Kittens"});

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH + 1);

      lastItem = autocompleteWidget.getOption(LAST_ITEM_INDEX + 1);
      expect(lastItem.getDisplay()).to.equal('I <3 Kittens');
    });

    it('adds an option in the right place when an index is provided', function() {
      var selectListWidget = $selectList.data('selectList');
      var autocompleteWidget = $autocomplete.data('autocomplete');

      var TARGET_INDEX = 3;

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH);

      var referenceItem = autocompleteWidget.getOption(TARGET_INDEX);
      expect(referenceItem.getDisplay()).to.equal('Bahrain');

      autocompleteWidget.addOption({value: 'ki', display: "I <3 KITTEH"}, TARGET_INDEX);

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH + 1);

      referenceItem = autocompleteWidget.getOption(TARGET_INDEX);
      expect(referenceItem.getDisplay()).to.equal('I <3 KITTEH');
    });
  });

  describe("removeOption API", function () {

    it("removes the option at a given index", function() {
      var autocompleteWidget = $autocomplete.data('autocomplete');
      var selectListWidget = $selectList.data('selectList');

      var TARGET_INDEX = 3;

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH);

      var referenceItem = autocompleteWidget.getOption(TARGET_INDEX);
      expect(referenceItem.getDisplay()).to.equal('Bahrain');

      autocompleteWidget.removeOption(TARGET_INDEX);
      referenceItem = autocompleteWidget.getOption(TARGET_INDEX);

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH - 1);
      expect(referenceItem.getDisplay()).to.equal('Cambodia');

    });

    it("cleans up the selected item and input values", function () {

      var autocompleteWidget = $autocomplete.data('autocomplete');
      var selectListWidget = $selectList.data('selectList');

      expect(autocompleteWidget.getValue()).to.be.empty;

      $selectList.trigger($.Event('selected', {
        selectedValue: 'bs',
        displayedValue: 'Bahamas'
      }));
      expect(autocompleteWidget.getValue().length).to.equal(1);

      var selected = autocompleteWidget.getValue()[0];
      var bahamas = autocompleteWidget.getOption(2);
      expect(bahamas instanceof CUI.SelectList.Option).to.be.true;
      expect(bahamas.getValue()).to.equal(selected);

      var removeSpy = sinon.spy($tagList.data('tagList'), 'removeItem');

      bahamas.remove();

      expect(removeSpy.called).to.be.true;
      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH - 1);
      expect(autocompleteWidget.getValue().length).to.equal(0);

    });
  });

  describe("getGroup API", function () {
    it("returns a SelectList.Group for the given position", function () {
      // add a group first so there's something to get back
      var selectListWidget = $selectList.data('selectList');
      selectListWidget.addGroup("Expected Group Name", 7);

      var autocompleteWidget = $autocomplete.data('autocomplete');
      var groupResult = autocompleteWidget.getGroup(7);

      expect(groupResult.getDisplay()).to.equal("Expected Group Name");
    });
  });

  describe("addGroup API", function () {
    it("adds a group at the given position", function () {
      var autocompleteWidget = $autocomplete.data('autocomplete');
      autocompleteWidget.addGroup("Expected Group Name", 3);

      var selectListWidget = $selectList.data('selectList');
      var groupResult = selectListWidget.getGroup(3);

      expect(groupResult.getDisplay()).to.equal("Expected Group Name");
    });

    it("adds a group to the end if no position given", function () {
      var autocompleteWidget = $autocomplete.data('autocomplete');
      autocompleteWidget.addGroup("Expected Group Name");

      var selectListWidget = $selectList.data('selectList');
      var itemsLength = selectListWidget.getItems().length;
      var groupResult = selectListWidget.getGroup(itemsLength -1);

      expect(groupResult.getDisplay()).to.equal("Expected Group Name");
    });
  });

  describe("removeGroup API", function () {
    it("removes the group at a given index", function() {
      var autocompleteWidget = $autocomplete.data('autocomplete');
      var selectListWidget = $selectList.data('selectList');
      var TARGET_INDEX = 3;

      // add a group first so there's something to remove
      selectListWidget.addGroup("Expected Group Name", TARGET_INDEX);

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH + 1);

      expect(autocompleteWidget.getOption.bind(TARGET_INDEX)).to.throw;
      var referenceItem = autocompleteWidget.getGroup(TARGET_INDEX);
      expect(referenceItem.getDisplay()).to.equal('Expected Group Name');

      autocompleteWidget.removeGroup(TARGET_INDEX);

      expect(autocompleteWidget.getGroup.bind(TARGET_INDEX)).to.throw;
      referenceItem = autocompleteWidget.getOption(TARGET_INDEX);

      expect(selectListWidget.getItems().length).to.equal(INITIAL_ITEMS_LENGTH);
      expect(referenceItem.getDisplay()).to.equal('Bahrain');

    });
  });

  describe('form submission', function () {
    it('it does not submit a parent form when clicking the toggle', function () {
      var spy = sinon.spy(function () {
        return false;
      });
      var $form = $('<form></form>')
        .appendTo(document.body)
        .on('submit', spy);

      $autocomplete.detach().appendTo($form);

      $toggle.trigger('click');
      expect(spy.called).to.be.false;

      $form.remove();
    });

    it('it does not submit a parent form when hitting enter on the input when multiple=true', function () {
      $autocomplete.autocomplete('set', 'multiple', true);

      var keyEvent = $.Event('keypress');
      keyEvent.which = 13; // enter

      var spy = sinon.spy(keyEvent, 'preventDefault');
      $input.val('foo').focus().trigger(keyEvent);
      expect(spy.called).to.be.true;
    });

    it('it does submit a parent form when hitting enter on the input when multiple=false', function () {
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
