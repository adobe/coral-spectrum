describe('CUI.HelpPopover', function() {
	it ('should be defined in CUI namespace', function(){
		expect(CUI).to.have.property('HelpPopover');
	});

	it('should be defined on jQuery object', function () {
    var div = $('<div/>');
    expect(div).to.have.property('helpPopover');
  });

  it('should be instantiated on data-init and cui-contentloaded', function () {
    var div = $('<div data-init="help-popover"/>');
    div.appendTo($(document).find('body'));

    $(document).trigger('cui-contentloaded');

    expect(div.data('helpPopover').toString()).to.eql('HelpPopover');
  });

  describe("Markup generation", function(){
    var $element,
      widget;

    beforeEach(function(){
      $element = $('<div></div>');
      widget = new CUI.HelpPopover({element: $element});
    });

    it ('should add the popover class', function(){
      expect($element.hasClass('coral-Popover')).to.be.true;
    });

    it ('should add default id of help-popover if one doesn\'t exist', function(){
      expect($element.attr('id')).to.eql('help-popover');
    });
  });

  describe("API", function(){
    var $element,
      $widget;

      beforeEach(function(){
        $element = $('<div></div>');
        $widget = new CUI.HelpPopover({element: $element});
      });

      it ('should set the text of the search input when calling setSearchText', function(){
        $widget.setSearchText('hello world');
        expect($element.find('.coral-DecoratedTextfield-input').val()).to.eql('hello world');
      });

      it ('should show/hide the close button depending on whether there is text in the input', function(){
        var closeButton = $element.find('.coral-DecoratedTextfield-button');
        expect(closeButton.css('display')).to.eql('none');
        $widget.setSearchText('hello world');
        expect(closeButton.css('display')).not.to.eql('none');
        $widget.setSearchText('');
        expect(closeButton.css('display')).to.eql('none');
      });

      it ('should clear the text in the search box when the clear button is clicked', function(){
        var closeButton = $element.find('.coral-DecoratedTextfield-button');
        $widget.setSearchText('hello world');
        expect(closeButton.css('display')).not.to.eql('none');
        closeButton.click();
        expect($widget.getSearchText()).to.eql('');
        expect(closeButton.css('display')).to.eql('none');
      });
  });

  describe('l10n', function(){
    var whatsNewLabel = "¿Qué hay de nuevo",
      customerCareLabel = "Atención al cliente",
      helpHomeLabel = "Ayuda Inicio",
      communityLabel = "La Comunidad",
      searchPlaceholder = "Buscar",
      $element,
      $widget;

    beforeEach(function(){
      $element = $('<div></div>');

      $widget = new CUI.HelpPopover({
        element: $element,
        whatsNewLabel: whatsNewLabel,
        customerCareLabel: customerCareLabel,
        helpHomeLabel: helpHomeLabel,
        communityLabel: communityLabel,
        searchPlaceholder: searchPlaceholder
      });
    });

    it ('should set the input placeholder to the appropriate text', function(){
      expect($element.find('.coral-DecoratedTextfield-input').attr('placeholder')).to.eql(searchPlaceholder);
    });

    it ('should set the label the what\'s new link label appropriately', function(){
      expect($($element.find('a').get(0)).text()).to.eql(whatsNewLabel);
    });

    it ('should set the label the help home link label appropriately', function(){
      expect($($element.find('a').get(1)).text()).to.eql(helpHomeLabel);
    });

    it ('should set the label the customer care link label appropriately', function(){
      expect($($element.find('a').get(2)).text()).to.eql(customerCareLabel);
    });

    it ('should set the label the community link label appropriately', function(){
      expect($($element.find('a').get(3)).text()).to.eql(communityLabel);
    });
  });
});