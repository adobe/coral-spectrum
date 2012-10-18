describe('CUI.Widget', function() {
  describe('definition', function() {
    // 'definition' block is a temporary workaround for kmiyashiro/grunt-mocha/issues/22
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Widget');
    });
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
      expect(widget.get('newOption')).to.equal('testVal');
    });
    
    it('can set and get multiple options at once', function() {
      widget.set({
        batchOption1: 1,
        batchOption2: 2
      });
      expect(widget.get('batchOption1')).to.equal(1);
      expect(widget.get('batchOption2')).to.equal(2);
    });
    
    it('can get options set with constructor', function() {
      expect(widget.get('option2')).to.equal(2);
    });
    
    it('should fire events when options change', function() {
      var optionChanged = false;
      widget.on('change:option3', function() {
        optionChanged = true;
      });
      
      widget.set('option3', 13);
      
      expect(optionChanged).to.be.true;
    });
    
    it('should provide option name, old value, and new value before option changes', function() {
      widget.on('beforeChange:option4', function(evt) {
        expect(evt.currentValue).to.equal(4);
        expect(evt.value).to.equal(5);
        expect(evt.option).to.equal('option4');
      });
      
      widget.set('option3', 5);
    });
    
    it('should provide option name and new value when option changes', function() {
      widget.on('change:option5', function(evt) {
        expect(evt.value).to.equal(6);
        expect(evt.option).to.equal('option5');
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
      expect(optionChanged).to.be.true;
    });
    
    it('should not fire removed listeners', function() {
      optionChanged = false;
      widget.hide();
      widget.off('show', logChanged);
      widget.show();
      expect(optionChanged).to.be.false;
    });
  });
  
  describe('show and hide', function() {
    var div = $('<div/>');
    
    var widget = new CUI.Widget({
      element: div
    });
    
    it('should show element', function() {
      widget.show();
      expect(div).to.have.css('display', 'block');
    });
    
    it('should hide element', function() {
      widget.hide();
      expect(div).to.have.css('display', 'none');
    });
    
    it('should toggle visibility', function() {
      widget.toggleVisibility();
      expect(div).to.have.css('display', 'block');
      widget.toggleVisibility();
      expect(div).to.have.css('display', 'none');
    });
    
    it('should change visibility when options.visible set', function() {
      widget.set('visible', false);
      expect(div).to.have.css('display', 'none');
      widget.set('visible', true);
      expect(div).to.have.css('display', 'block');
    });
    
    it('should stay visible when shown twice', function() {
      widget.show();
      widget.show();
      expect(div).to.have.css('display', 'block');
    });
    
    it('should stay hidden when hidden twice', function() {
      widget.hide();
      widget.hide();
      expect(div).to.have.css('display', 'none');
    });
  });
});
