describe('CUI.OuterRailToggle', function () {

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('OuterRailToggle');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('outerRailToggle');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<button data-init="outer-rail-toggle"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('outerRailToggle').toString()).to.eql('OuterRailToggle');
  });

  it('should emit event on click', function () {
    var callback = sinon.spy();

    var widget = new CUI.OuterRailToggle({
      element: $('<button data-init="outer-rail-toggle"></button>')
    });

    widget.$element.on(CUI.OuterRailToggle.EVENT_CLICK, callback);
    widget.$element.trigger('click');

    expect(callback.called).to.be.true;

    widget.$element.remove();

  });
});
