describe('CUI.Alert', function() {

  var alertHtml = [
     "<div class='coral-Alert coral-Alert--error'>",
        "<button class='coral-Button coral-Alert-closeButton' title='Close' data-dismiss='alert'>",
          "<i class='coral-Button-icon coral-Icon coral-Icon--xsmall coral-Icon--close'></i>",
        "</button>",
        "<i class='coral-Icon coral-Icon--small coral-Icon--alert'></i>",
        "<strong class='coral-Alert-title'>",
          "Error",
        "</strong>",
        "<div class='coral-Alert-message'>There is something borked with the whozit!</div>",
      "</div>"].join('');

  var typeClassBase = 'coral-Alert--';

  var clickClose = function(target) {
    target.trigger('click');
  };

  it('should be defined in CUI namespace', function() {
    expect(CUI).to.have.property('Alert');
  });

  it('should be defined on jQuery object', function() {
    var div = $('<div/>');
    expect(div).to.have.property('alert');
  });

  describe("from markup", function() {
    var el;

    beforeEach(function() {
      el = $(alertHtml).appendTo('body');
    });

    afterEach( function() {
      el.detach();
    });

    it('should hide when dismissed', function() {
      expect(el).to.have.css('display', 'block');
      clickClose(el.find('button'));
      expect(el).to.have.css('display', 'none');
    });

    it('should not submit a form when dismissed', function() {
      var spy = sinon.spy(function() { return false; });
      var form = $('<form />').appendTo('body').on('submit', spy).append(el.detach());
      expect(spy.called).to.be.false;
      clickClose(el.find('button'));
      expect(spy.called).to.be.false;
      form.detach();
    });

    it('should support \'notice\' class as type parameter', function() {
      el.alert({type:'notice'});
      expect(el).to.have.class(typeClassBase + 'notice');
      expect(el).to.not.have.class(typeClassBase + 'help');
      expect(el).to.not.have.class(typeClassBase + 'error');
      expect(el).to.not.have.class(typeClassBase + 'success');
      expect(el).to.not.have.class(typeClassBase + 'info');
    });

    it('should support \'help\' class as type parameter', function() {
      el.alert({type:'help'});
      expect(el).to.have.class(typeClassBase + 'help');
      expect(el).to.not.have.class(typeClassBase + 'notice');
      expect(el).to.not.have.class(typeClassBase + 'error');
      expect(el).to.not.have.class(typeClassBase + 'success');
      expect(el).to.not.have.class(typeClassBase + 'info');
    });

    it('should support \'success\' class as type parameter', function() {
      el.alert({type:'success'});
      expect(el).to.have.class(typeClassBase + 'success');
      expect(el).to.not.have.class(typeClassBase + 'help');
      expect(el).to.not.have.class(typeClassBase + 'error');
      expect(el).to.not.have.class(typeClassBase + 'notice');
      expect(el).to.not.have.class(typeClassBase + 'info');
    });

    it('should support \'info\' class as type parameter', function() {
      el.alert({type:'info'});
      expect(el).to.have.class(typeClassBase + 'info');
      expect(el).to.not.have.class(typeClassBase + 'help');
      expect(el).to.not.have.class(typeClassBase + 'error');
      expect(el).to.not.have.class(typeClassBase + 'notice');
      expect(el).to.not.have.class(typeClassBase + 'success');
    });

    it('should support \'error\' class as type parameter', function() {
      el.alert({type:'error'});
      expect(el).to.have.class(typeClassBase + 'error');
      expect(el).to.not.have.class(typeClassBase + 'help');
      expect(el).to.not.have.class(typeClassBase + 'info');
      expect(el).to.not.have.class(typeClassBase + 'notice');
      expect(el).to.not.have.class(typeClassBase + 'success');
    });

    it('should ignore \'somethingNotSupported\' as type parameter', function() {
      el.alert({type:'somethingNotSupported'});
      expect(el).to.have.class(typeClassBase + 'error');
      expect(el).to.not.have.class(typeClassBase + 'help');
      expect(el).to.not.have.class(typeClassBase + 'info');
      expect(el).to.not.have.class(typeClassBase + 'notice');
      expect(el).to.not.have.class(typeClassBase + 'success');
    });

    it('should ignore non-string value as type parameter', function() {
      el.alert({type: 0});
      expect(el).to.have.class(typeClassBase + 'error');
      expect(el).to.not.have.class(typeClassBase + 'help');
      expect(el).to.not.have.class(typeClassBase + 'info');
      expect(el).to.not.have.class(typeClassBase + 'notice');
      expect(el).to.not.have.class(typeClassBase + 'success');
    });

    it('should set heading to parameter value if specified', function() {
      el.alert({heading:'Not Notice'});
      var heading = el.find('strong');
      expect(heading.html()).to.equal("Not Notice");
    });

    it('should change icon when type changes', function() {
      var types = CUI.Alert()._types;
      for (var typeKey in types ) {
        el.alert({type: typeKey});
        var iconClass = types[typeKey]["iconClass"];
        var iconElement = el.find('> .coral-Icon');
        // var className = iconElement.hasClass();
        expect(iconElement).to.have.class(iconClass);
      }
    });

    it('should not set large size by default', function() {
      el.alert();
      expect(el.hasClass('coral-Alert--large')).to.equal(false);
    });

    it('should set size to large if size parameter is specified', function() {
      el.alert({size:'large'});
      expect(el.hasClass('coral-Alert--large')).to.equal(true);
    });

    it('should remove large if size small is specified', function() {
      el.addClass('coral-Alert--large');
      el.alert({size:'small'});
      expect(el.hasClass('coral-Alert--large')).to.equal(false);
    });

    it('should set content in div if parameter is specified', function() {
      var EXPECTED_CONTENT = 'some expected content';
      el.alert({content:EXPECTED_CONTENT});
      var content = el.find('div');
      expect(content.html()).to.equal(EXPECTED_CONTENT);
    });


    it('should not add small if size small is specified', function() {
      el.alert({size:'small'});
      expect(el.hasClass('coral-Alert--small')).to.equal(false);
    });

    it('should ignore size if an invalid value is passed', function() {
      el.addClass('coral-Alert--large');
      el.alert({size:'invalid value'});
      expect(el.hasClass('coral-Alert--large')).to.equal(true);
    });

    it('should ignore size if a non-string value is passed', function() {
      el.addClass('coral-Alert--large');
      el.alert({size:0});
      expect(el.hasClass('coral-Alert--large')).to.equal(true);
    });

    it('should not submit a form when dismissed', function() {
      var spy = sinon.spy(function() { return false; });
      $('<form />').appendTo('body').on('submit', spy).append(el.detach());
      expect(spy.called).to.be.false;
      clickClose(el.find('button'));
      expect(spy.called).to.be.false;
    });

    it('should include a close button of closable set to true', function() {
      var closer = el.find('button');
      closer.detach();
      el.alert({closeable:true});
      var button = el.find('button');
      expect(button).to.have.class('coral-Alert-closeButton');
    });

    it('should set close button display none if closeable set to false', function() {
      el.alert({closeable:false});
      var button = el.find('button');
      expect(button).to.have.class('coral-Alert-closeButton');
      expect(button).to.have.css('display', 'none');
    });

  }); // /from markup


}); // /CUI.Alert
