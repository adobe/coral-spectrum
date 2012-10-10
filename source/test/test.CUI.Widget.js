describe('CUI.Widget', function() {
  it('should be defined in CUI namespace', function() {
    CUI.should.have.property('Widget');
  });
  
  describe('options', function() {
    var div = $('<div/>');
    var widget = new CUI.Widget({
      element: div,
      option1: 1,
      option2: 2,
      option3: 3,
      option4: 4,
      option5: 5
    });
    
    it('can set and get options one at a time', function() {
      widget.set('newOption', 'testVal');
      widget.get('newOption').should.equal('testVal');
    });
    
    it('can set and get multiple options at once', function() {
      widget.set({
        batchOption1: 1,
        batchOption2: 2
      });
      widget.get('batchOption1').should.equal(1);
      widget.get('batchOption2').should.equal(2);
    });
    
    it('can get options set with constructor', function() {
      widget.get('option2').should.equal(2);
    });
    
    it('should fire events when options change', function() {
      var optionChanged = false;
      widget.on('change:option3', function() {
        optionChanged = true;
      });
      
      widget.set('option3', 13);
      
      optionChanged.should.be.true;
    });
    
    it('should provide option name, old value, and new value before option changes', function() {
      widget.on('beforeChange:option4', function(evt) {
        evt.currentValue.should.equal(4);
        evt.value.should.equal(5);
        evt.option.should.equal('option4');
      });
      
      widget.set('option3', 5);
    });
    
    it('should provide option name and new value when option changes', function() {
      widget.on('change:option5', function(evt) {
        evt.value.should.equal(6);
        evt.option.should.equal('option5');
      });

      widget.set('option5', 6);
    });
  });
  
  describe('events', function() {
    var div = $('<div/>');
    var widget = new CUI.Widget({
      element: div
    });
    
    // Start hidden, since we set visible:true above
    widget.hide();
    
    var optionChanged = false;
    function logChanged() {
      optionChanged = true;
    };
    
    widget.on('show', logChanged);
    
    it('should fire added listeners', function() {
      widget.show();
      optionChanged.should.be.true;
    });
    
    it('should not fire removed listeners', function() {
      optionChanged = false;
      widget.hide();
      widget.off('show', logChanged);
      widget.show();
      optionChanged.should.be.false;
    });
  });
  
  describe('show and hide', function() {
    var div = $('<div/>');
    
    var widget = new CUI.Widget({
      element: div
    });
    
    it('should show element', function() {
      widget.show();
      div.css('display').should.equal('block');
    });
    
    it('should hide element', function() {
      widget.hide();
      div.css('display').should.equal('none');
    });
    
    it('should toggle visibility', function() {
      widget.toggleVisibility();
      div.css('display').should.equal('block');
      widget.toggleVisibility();
      div.css('display').should.equal('none');
    });
    
    it('should change visibility when options.visible set', function() {
      widget.set('visible', false);
      div.css('display').should.equal('none');
      widget.set('visible', true);
      div.css('display').should.equal('block');
    });
    
    it('should stay hidden when hidden twice', function() {
      widget.hide();
      widget.hide();
      div.css('display').should.equal('none');
    });
  });
});
