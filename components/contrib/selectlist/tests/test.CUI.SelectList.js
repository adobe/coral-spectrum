describe('CUI.SelectList', function() {

  var $toggle, $selectList;

  beforeEach(function() {
    var id = CUI.util.getNextId();

    $toggle = $('<button data-toggle="selectlist" ' +
        'data-target="#' + id + '">Show List</button>')
        .appendTo(document.body);

    $selectList = $('' +
        '<ul id="' + id + '" class="selectlist">' +
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
        '</ul>')
        .appendTo(document.body).selectList({
            relatedElement: $toggle[0]
        });
  });

  afterEach(function() {
    $toggle.remove();
    $selectList.remove();
  });

  describe('visibility through API', function() {
    it('shows/hides when show/hide is called', function() {
      $selectList.selectList('show');
      expect($selectList).to.have.class('visible');
      $selectList.selectList('hide');
      expect($selectList).not.to.have.class('visible');
    });
  });

  describe('visibility through interaction', function() {
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
  });
    
  describe('accessibility', function() {
    beforeEach(function() {
      $selectList.selectList('show');
    });
    
    it('closes the menu using the escape key', function() {
      expect($selectList).to.have.class('visible');
      
      var $keyEvent = $.Event('keydown');
      $keyEvent.which = 27; // esc

      $toggle.trigger($keyEvent);
      expect($selectList).not.to.have.class('visible');
    });
    
    it('selects the highlighted item using keys', function() {
      var $items = $selectList.find('li');
      
      $items.removeClass('focus').first().addClass('focus');

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
      var $items = $selectList.find('li');
      
      var keyCodes = [
        34, // page down
        39, // right arrow
        40 // down arrow
      ];
          
      keyCodes.forEach(function(keyCode) {
        $items.removeClass('focus');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = keyCode;

        $toggle.trigger($keyEvent);
        expect($items.eq(0)).to.have.class('focus');

        $toggle.trigger($keyEvent);
        expect($items.eq(0)).not.to.have.class('focus');
        expect($items.eq(1)).to.have.class('focus');
      });
    });

    it('sets the caret to the previous item using keys', function() {
      var $items = $selectList.find('li');

      var keyCodes = [
        33, // page up
        37, // left arrow
        38 // up arrow
      ];

      keyCodes.forEach(function(keyCode) {
        $items.removeClass('focus');

        var $keyEvent = $.Event('keydown');
        $keyEvent.which = keyCode;

        $toggle.trigger($keyEvent);
        expect($items.last()).to.have.class('focus');

        $toggle.trigger($keyEvent);
        expect($items.last()).not.to.have.class('focus');
        expect($items.last().prev()).to.have.class('focus');
      });
    });

    it('sets the caret to the first item using home key', function() {
      var $items = $selectList.find('li').removeClass('focus');

      var $keyEvent = $.Event('keydown');
      $keyEvent.which = 36; // home

      $toggle.trigger($keyEvent);
      expect($items.first()).to.have.class('focus');
    });

    it('sets the caret to the first item using end key', function() {
      var $items = $selectList.find('li').removeClass('focus');

      var $keyEvent = $.Event('keydown');
      $keyEvent.which = 35; // end

      $toggle.trigger($keyEvent);
      expect($items.last()).to.have.class('focus');
    });
      
    it('never sets the caret to items with aria-disabled=true', function() {
      var $items = $selectList.find('li').removeClass('focus');
      var $firstItem = $items.first().attr('aria-disabled', true);

      var $keyEvent = $.Event('keydown');
      $keyEvent.which = 36; // home

      $toggle.trigger($keyEvent);
      expect($firstItem).not.to.have.class('focus');
    });

    it('never sets the caret to items that are not visible', function() {
      var $items = $selectList.find('li').removeClass('focus');
      var $firstItem = $items.first().hide();

      var $keyEvent = $.Event('keydown');
      $keyEvent.which = 36; // home

      $toggle.trigger($keyEvent);
      expect($firstItem).not.to.have.class('focus');
    });

    it("shouldn't receive browser focus", function() {
      expect($selectList.addBack($selectList).find(':focusable').length).to.equal(0);
    });
      
    it("doesn't prevent default of enter keyDown event if caret is not set", function() {
      $selectList.find('li').removeClass('focus');

      var $keyEvent = $.Event('keydown');
      $keyEvent.which = 13; // enter

      $toggle.trigger($keyEvent);
      
      expect($keyEvent.isDefaultPrevented()).to.be.false;
    });
  });
});


