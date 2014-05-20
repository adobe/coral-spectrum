describe('CUI.Closable', function () {
  it('should be defined in CUI namespace', function () {
    expect(CUI).to.have.property('Closable');
  });

  it('should NOT be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.not.have.property('closable');
  });

  describe('API', function () {

    var element,
        widget;

    beforeEach(function () {

      element = $('<div></div>');
      widget = new CUI.Closable({ element: element});

    });

    afterEach(function () {
      element.remove();
      element = undefined;
      widget = undefined;
    });

    it('should have widget instantiated', function () {
      expect(widget).to.be.defined;
    });

    it('should be open by default', function () {
      expect(widget.getIsClosed()).to.be.false;
      expect(element).not.to.have.class(CUI.Closable.CLASS_CLOSED);
    });

    it('should close on setIsClosed(true)', function () {
      widget.setIsClosed(true);
      expect(widget.getIsClosed()).to.be.true;
      expect(element).to.have.class(CUI.Closable.CLASS_CLOSED);
    });

    it('should open on setIsClosed(false)', function () {
      widget.close();
      widget.setIsClosed(false);
      expect(widget.getIsClosed()).to.be.false;
      expect(element).not.to.have.class(CUI.Closable.CLASS_CLOSED);
    });

    it('should close on close()', function () {
      widget.close();
      expect(widget.getIsClosed()).to.be.true;
      expect(element).to.have.class(CUI.Closable.CLASS_CLOSED);
    });

    it('should open on open()', function () {
      widget.close();
      widget.open();
      expect(widget.getIsClosed()).to.be.false;
      expect(element).not.to.have.class(CUI.Closable.CLASS_CLOSED);
    });

    it('should toggle on toggleIsClosed()', function () {
      widget.toggleIsClosed();
      expect(widget.getIsClosed()).to.be.true;
      expect(element).to.have.class(CUI.Closable.CLASS_CLOSED);
    });


  });
});
