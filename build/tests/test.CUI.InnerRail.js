describe('CUI.InnerRail', function () {

  var SELECTOR_PANELS = '.coral-MultiPanel',
      SELECTOR_ACTIVE = '.is-active';

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('InnerRail');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('innerRail');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="inner-rail"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('innerRail').toString()).to.eql('InnerRail');
  });

  describe('HTML', function () {

    var element,
        widget;

    beforeEach(function () {

      element = $([
        '<div data-init="inner-rail">',
        '  <div class="coral-MultiPanel"></div>',
        '  <div class="coral-MultiPanel"></div>',
        '  <div class="coral-MultiPanel is-active"></div>',
        '</div>'
      ].join());

      widget = new CUI.InnerRail({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.be.defined;
    });

    it('should have ids set on panels', function () {
      var panels = element.children(SELECTOR_PANELS);
      expect(panels.length).to.eql(3);
      panels.each(function() {
        expect($(this).attr('id')).to.have.string('coral');
      });
    });

    it('should have set the active panel id', function () {
      var panels = element.children(SELECTOR_PANELS + SELECTOR_ACTIVE);
      var panelId = widget.get('activePanelId');
      expect(panels.attr('id')).to.eql(panelId);
    });
  });

  describe('API', function () {

    var element,
        widget;

    beforeEach(function () {

      element = $([
        '<div data-init="inner-rail">',
        '</div>'
      ].join());

      widget = new CUI.InnerRail({ element: element});
    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.exist;
    });

    it('should return the empty string for activePanelId', function () {
      expect(widget.getActivePanelId()).to.eql('');
    });

    it('should should update classes when setting a panel active', function () {
      var panel = widget.addPanel('<div>');
      expect(widget.getActivePanelId()).to.eql('');

      widget.setActivePanel(panel);
      expect(widget.getActivePanelId()).to.eql(panel.attr('id'));
      expect(panel.hasClass('is-active')).to.be.true;
    });

    it('should ad multiple panels when an array is passed to addPanel', function (){
      var panels = widget.addPanel(['<div>', '<div>', '<div>', '<div>', '<div>']);
      expect(panels.length).to.eql(5);
      expect(element.find(SELECTOR_PANELS).length).to.eql(5);
    });

    it('should remove a panel, if present', function () {
      var panels = widget.addPanel(['<div>', '<div>', '<div>', '<div>', '<div>']);
      expect(panels.length).to.eql(5);
      expect(element.find(SELECTOR_PANELS).length).to.eql(5);

      var result = widget.removePanel(panels[0]);
      expect(element.find(SELECTOR_PANELS).length).to.eql(4);
      expect(result.get(0)).to.eql(panels[0].get(0));
    });

    it('should reset the active panel when the active panel gets removed', function () {
      var panel = widget.addPanel('<div>');
      widget.setActivePanel(panel);
      widget.removePanel(panel);
      expect(widget.getActivePanelId()).to.eql('');
    });


  });
});
