describe('CUI.Tooltip', function() {
  
  // A default target element
  var target = $("<div>");
  
  // A config we can reuse
  var tooltipConfig = {
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
      expect(el).to.have.class('tooltip');
      expect(el).to.have.class('arrow-right');
      expect(el).to.have.class('hidden');  // Hidden on default            
    });
  });
  
  describe('tooltip from markup', function() {
    var tooltipHTML = [
      '<div class="tooltip arrow-left" data-interactive="true">',
      'Tooltip',
      '</div>'
    ].join();
    
    var el = $(tooltipHTML);
    
    var tooltip = new CUI.Tooltip({
      element: el,
      target: target
    });
  
    it('should have correct CSS classnames', function() {
      expect(el).to.have.class('tooltip');
      expect(el).to.have.class('arrow-left');
      expect(el).to.have.class('hidden');  // Hidden on default         
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
  });
  
});
