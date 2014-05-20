describe('CUI.Shell', function () {

  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Shell');
  });

  it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('shell');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="shell"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('shell').toString()).to.eql('Shell');
  });

});
