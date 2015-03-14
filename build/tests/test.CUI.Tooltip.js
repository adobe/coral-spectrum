describe('CUI.Tooltip', function() {

  // A default target element
  var target = $("<div>");

  // A config we can reuse
  var tooltipConfig = {
    content: 'TestContent',
    interactive: true,
    delay: 10,
    target: target
  };

  // A config we can reuse
  var tooltipConfigArrowRight = {
    content: 'TestContent',
    interactive: true,
    delay: 10,
    arrow: "right",
    target: target
  };

  describe('definition', function() {
    // 'definition' block is a temporary workaround for kmiyashiro/grunt-mocha/issues/22
    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Tooltip');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('tooltip');
    });
  });

  describe('tooltip from plugin', function() {
    var el = $('<div/>').tooltip(tooltipConfig);

    it('should have correct CSS classnames', function() {
      expect(el).to.have.class('coral-Tooltip');
      expect(el).to.have.class('coral-Tooltip--info'); // info on default
      expect(el).to.have.class('coral-Tooltip--positionRight'); // positionRight on default
      expect(el).to.have.class('is-hidden');  // Hidden on default
    });
  });

  describe('tooltip from plugin with arrow right', function() {
    var el = $('<div/>').tooltip(tooltipConfigArrowRight);

    it('should have correct CSS classnames', function() {
      expect(el).to.have.class('coral-Tooltip');
      expect(el).to.have.class('coral-Tooltip--info'); // info on default
      expect(el).to.have.class('coral-Tooltip--positionLeft');
      expect(el).to.have.class('is-hidden');  // Hidden on default
    });
  });

  describe('tooltip from markup with default arrow style', function() {
    var tooltipHTML = [
      '<div class="coral-Tooltip" data-interactive="true">',
      'Tooltip',
      '</div>'
    ].join();

    var el = $(tooltipHTML);

    var tooltip = new CUI.Tooltip({
      element: el,
      target: target
    });

    it('should have correct CSS classnames', function() {
      expect(el).to.have.class('coral-Tooltip');
      expect(el).to.have.class('coral-Tooltip--info'); // info on default
      expect(el).to.have.class('coral-Tooltip--positionRight');
      expect(el).to.have.class('is-hidden');  // Hidden on default
    });
  });

  describe('tooltip from markup', function() {
    var tooltipHTML = [
      '<div class="coral-Tooltip coral-Tooltip--positionRight" data-interactive="true">',
      'Tooltip',
      '</div>'
    ].join();

    var el = $(tooltipHTML);

    var tooltip = new CUI.Tooltip({
      element: el,
      target: target
    });

    it('should have correct CSS classnames', function() {
      expect(el).to.have.class('coral-Tooltip');
      expect(el).to.have.class('coral-Tooltip--info'); // info on default
      expect(el).to.have.class('coral-Tooltip--positionRight');
      expect(el).to.have.class('is-hidden');  // Hidden on default
    });
  });

  describe('options', function() {
    it('can set content with class', function() {
      var el = $('<div/>');
      var tooltip = new CUI.Tooltip({
        element: el
      });
      tooltip.set('content', 'TestContent');
      expect(el).to.have.html('TestContent');
    });

    it('can set type with class', function() {
      var el = $('<div/>');
      var tooltip = new CUI.Tooltip({
        element: el
      });
      tooltip.set('type', 'success');
      expect(el).to.have.class('coral-Tooltip--success');
    });
  });

  describe('visibility', function() {
    it('shows tooltip elements', function(done) {
      // Create a tooltip and get a reference to the element
      var $element = $('<div/>').tooltip(tooltipConfig);
      $element.appendTo(document.body);

      // Get a reference to the tooltip instance
      var tooltip = $element.data('tooltip');

      // Show the tooltip
      tooltip.show();

      // Wait for animation to complete
      setTimeout(function() {
        // Make sure the tooltip exists in the DOM
        // If not, things get weird
        expect($element.parent().length).to.equal(1);

        // Make sure it's visible
        expect($element.css('display')).to.equal('block');
        done();
      }, 500);
    });

    it('hides tooltip elements', function(done) {
      // Create a tooltip and get a reference to the element
      var $element = $('<div/>').tooltip(tooltipConfig);
      $element.appendTo(document.body);

      // Get a reference to the tooltip instance
      var tooltip = $element.data('tooltip');

      // Show the tooltip
      tooltip.show();

      // Wait for animation to complete
      setTimeout(function() {
        // Hide the tooltip
        tooltip.hide();

        // Wait for animation to complete
        setTimeout(function() {
          // Make sure the tooltip exists in the DOM
          // If not, things get weird
          expect($element.parent().length).to.equal(1);

          // Make sure it's not visible
          expect($element.css('display')).to.equal('none');
          done();
        }, 500);
      }, 500);
    });
  });

  describe('accessibility', function() {
    it('shows tooltip elements', function() {
      var $element = $('<button data-init="quicktip" data-quicktip-arrow="left" data-quicktip-type="success" data-quicktip-content="Success!">Quicktipper</button>');
      $element.appendTo(document.body);

      $element.focusin();

      // Get the tooltip from the target
      var tooltip = $element.data('quicktip');
      expect(tooltip, 'Should be able to get tooltip instance from quicktip data attribute').to.exist;

      var $tooltipElement = tooltip.$element;

      // Make sure it appears
      expect($tooltipElement.css('display')).to.equal('block');
    });

    it('hides tooltip elements', function(done) {
       var $element = $('<button data-init="quicktip" data-quicktip-arrow="left" data-quicktip-type="success" data-quicktip-content="Success!">Quicktipper</button>');
      $element.appendTo(document.body);

      $element.focusin();

      // Get the tooltip from the target
      var tooltip = $element.data('quicktip');
      expect(tooltip, 'Should be able to get tooltip instance from quicktip data attribute').to.exist;

      var $tooltipElement = tooltip.$element;

      // Wait for animation to complete
      setTimeout(function() {
        $element.focusout();

        // Wait for animation to complete
        setTimeout(function() {
          // Make sure it dissapears
          expect($tooltipElement.css('display')).to.equal('none');
          done();
        }, 500);
      }, 500);
    });
  });

});
