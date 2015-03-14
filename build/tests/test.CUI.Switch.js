

describe('CUI.Switch', function() {

    it('should be defined in CUI namespace', function() {
        expect(CUI).to.have.property('Switch');
    });

    it('should be defined on jQuery object', function() {
        var div = $('<div>');
        expect(div).to.have.property('switch');
    });

   describe("API", function() {

     var html = '' +
         '<label>Switch'+
         '  <span class="coral-Switch">'+
         '    <input class="coral-Switch-input" type="checkbox">'+
         '    <span class="coral-Switch-offLabel">Off</span>'+
         '    <span class="coral-Switch-onLabel">On</span>'+
         '  </span>'+
         '</label>';

     var $html = $(html);
     $html.appendTo(document.body);
     $html = $html.find('.coral-Switch:first');

      it('Updates aria-hidden for each on/off label', function() {
        var cuiSwitch = new CUI.Switch({element: $html}),
            checked = cuiSwitch.$input.is(':checked').toString();
        expect(cuiSwitch.$onLabel.attr("aria-hidden")).to.not.equal(checked);
        expect(cuiSwitch.$offLabel.attr("aria-hidden")).to.equal(checked);
        cuiSwitch.$input.trigger('click');
        expect(cuiSwitch.$onLabel.attr("aria-hidden")).to.equal(checked);
        expect(cuiSwitch.$offLabel.attr("aria-hidden")).to.not.equal(checked);
      });

    }); // describe API


  describe("from markup", function() {

    var defaultMarkup = '' +
         '<label>Switch'+
         '  <span class="coral-Switch">'+
         '    <input class="coral-Switch-input" type="checkbox">'+
         '    <span class="coral-Switch-offLabel">Off</span>'+
         '    <span class="coral-Switch-onLabel">On</span>'+
         '  </span>'+
         '</label>';
    var $defaultHtml = $(defaultMarkup);
    $defaultHtml.appendTo(document.body);
    var element = $defaultHtml.find('.coral-Switch:first').switch();

    it('Updates aria-hidden attribute for on/off label', function() {
      var cuiSwitch = element.data('switch'),
          checked = cuiSwitch.$input.is(':checked').toString();
      expect(cuiSwitch.$onLabel.attr("aria-hidden")).to.not.equal(checked);
      expect(cuiSwitch.$offLabel.attr("aria-hidden")).to.equal(checked);
      cuiSwitch.$input.trigger('click');
      expect(cuiSwitch.$onLabel.attr("aria-hidden")).to.equal(checked);
      expect(cuiSwitch.$offLabel.attr("aria-hidden")).to.not.equal(checked);
    });

  });

});
