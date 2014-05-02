describe('CUI.InnerRailToggle', function () {

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('InnerRailToggle');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('innerRailToggle');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="inner-rail-toggle"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('innerRailToggle').toString()).to.eql('InnerRailToggle');
  });
});
