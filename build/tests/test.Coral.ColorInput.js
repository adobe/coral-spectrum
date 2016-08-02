describe('Coral.ColorInput', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('ColorInput');
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.ColorInput();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#name', function() {
      it('should be possible to set the name', function(done) {
        el.name = 'howdy';

        expect(el.name).to.equal('howdy', 'name should have changed');
        helpers.next(function() {
          expect(el._elements.input.name).to.equal('howdy', 'name should now be reflected by input field');
          done();
        });
      });
    });

    describe('#value', function() {
      it('should be possible to set the value', function(done) {
        expect(el._elements.input.value).to.equal('', 'ColorInput should have an empty string as default value');
        expect(el.invalid).to.be.false;
        expect(el._elements.colorPreview.style.backgroundColor).to.equal('');

        el.value = '#00FF00';
        helpers.next(function() {
          expect(el._elements.input.value).to.equal('#00FF00', 'Color should now be set');
          expect(el.invalid).to.be.false;

          var backgroundColor = new Coral.Color();
          backgroundColor.value = el._elements.colorPreview.style.backgroundColor;

          expect(backgroundColor.isSimilarTo(el.valueAsColor)).to.equal(true, 'Background color should reflect the new value');

          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should be possible to disable the colorinput', function(done) {
        el.variant = Coral.ColorInput.variant.SWATCH;

        expect(el._elements.colorPreview.icon).to.equal('', 'the color preview icon should not be locked');
        el.disabled = true;

        expect(el.disabled).to.equal(true, 'should now be disabled');
        helpers.next(function() {
          expect(el._elements.colorPreview.disabled).to.equal(true, 'button should now be disabled');
          expect(el._elements.input.disabled).to.equal(true, 'input field should now be disabled');

          expect(el._elements.colorPreview.icon).to.equal('lockOn', 'the color preview icon should now reflect the locked state (in swatch variant)');
          done();
        });
      });
    });

    describe('#invalid', function() {
      it('should be possible to force a value to be invalid', function(done) {
        expect(el.invalid).to.equal(false, 'colorinput should be valid by default');

        // Set valid value
        el.value = '#000000';
        expect(el.invalid).to.equal(false, 'this should be a valid value');

        // Force colorinput to be invalid ??
        el.invalid = true;
        expect(el.invalid).to.equal(true, 'colorinput should now be forced to be inavalid (although value inside is valid)');

        helpers.next(function() {
          expect(el._elements.input.invalid).to.equal(true, 'input field should now be invalid');
          done();
        });
      });
    });

    describe('#readOnly', function() {
      it('should be possible to make colorinput readonly', function(done) {
        el.readOnly = true;

        helpers.next(function() {
          expect(el._elements.colorPreview.disabled).to.equal(true, 'button should now be disabled');
          expect(el._elements.input.disabled).to.equal(true, 'input field should now be disabled');
          done();
        });
      });
    });

    describe('#required', function() {
      it('should be possible to make it required to set a value', function(done) {
        el.required = true;

        helpers.next(function() {
          expect(el._elements.input.required).to.equal(true, 'input field should now be required');
          done();
        });
      });
    });

    describe('#labelledBy', function() {
      it('should default to null', function() {
        expect(el.labelledBy).to.be.null;
      });
    });

    describe('#placeholder', function() {
      it('should default to ""', function(done) {
        expect(el.placeholder).to.equal('');
        helpers.next(function() {
          expect(el.$).not.to.have.attr('placeholder');
          done();
        });
      });

      it('should be set and reflected', function(done) {
        el.placeholder = 'ni1';
        expect(el.placeholder).to.equal('ni1');

        helpers.next(function() {
          expect(el._elements.input.$).to.have.attr('placeholder', 'ni1');
          done();
        });
      });
    });

    describe('#variant', function() {
      it('should default to "default"', function() {
        expect(el.variant).to.equal(Coral.ColorInput.variant.DEFAULT);
      });

      it('should be possible to set the variant', function(done) {
        helpers.next(function() {
          expect(el.$.hasClass('coral-ColorInput--swatch')).to.equal(false, 'ColorInput should not be minimal variant');

          expect(el._elements.input.getAttribute('tabindex')).to.not.equal('-1', 'In default variant colorinput should have no tabindex of -1');


          el.variant = Coral.ColorInput.variant.SWATCH;
          helpers.next(function() {
            expect(el.variant).to.equal(Coral.ColorInput.variant.SWATCH);
            expect(el.$.hasClass('coral-ColorInput--swatch')).to.equal(true, 'ColorInput should now be minimal variant');

            expect(el._elements.input.getAttribute('tabindex')).to.equal('-1', 'In minimal variant colorinput should have no tabindex');
            done();
          });
        });
      });
    });

    describe('#valueAsColor', function() {
      it('should default to null', function() {
        expect(el.valueAsColor).to.be.null;
      });

      it('should be possible to get/set the value as Coral.Color instead of a string', function(done) {
        var allColorElements = el.items.getAll();
        var colorEl = allColorElements[1];

        expect(el.valueAsColor).to.equal(null, 'an empty value should be represented by a "null" Color');
        var newColor = new Coral.Color();
        newColor.value = colorEl.value;

        el.valueAsColor = newColor;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(colorEl, 'First non-empty color should now be selected');

          var backgroundColor = new Coral.Color();
          backgroundColor.value = el._elements.colorPreview.style.backgroundColor;

          expect(backgroundColor.isSimilarTo(el.valueAsColor)).to.equal(true, 'Background color should reflect the new value');

          // must be also possible to unset a color using valueAsColor!
          el.valueAsColor = null;

          expect(el.valueAsColor).to.equal(null, 'valueAsColor should now return null');
          expect(el.value).to.equal('', 'value should now be "" ');

          done();
        });
      });
    });

    describe('#autoGenerateColors', function() {
      it('should default to "off"', function() {
        expect(el.autoGenerateColors).to.equal(Coral.ColorInput.autoGenerateColors.OFF);
      });

      it('should be possible to auto generate colors and remove them again ', function(done) {
        expect(el.autoGenerateColors).to.equal(Coral.ColorInput.autoGenerateColors.OFF);
        expect(el.items.getAll().length).to.equal(17, 'should be 17 colors by default');

        el.autoGenerateColors = Coral.ColorInput.autoGenerateColors.SHADES;
        expect(el.autoGenerateColors).to.equal(Coral.ColorInput.autoGenerateColors.SHADES);

        helpers.next(function() {
          // 5 shades for every color should be automatically generated
          expect(el.items.getAll().length).to.equal(16 * 6 + 1, '5 shades for every color should be automatically generated + No Color');

          el.autoGenerateColors = Coral.ColorInput.autoGenerateColors.TINTS;
          expect(el.autoGenerateColors).to.equal(Coral.ColorInput.autoGenerateColors.TINTS);

          helpers.next(function() {
            expect(el.items.getAll().length).to.equal(16 * 6 + 1, '5 tints for every "original" color should be automatically generated + No Color');

            el.autoGenerateColors = Coral.ColorInput.autoGenerateColors.OFF;
            expect(el.autoGenerateColors).to.equal(Coral.ColorInput.autoGenerateColors.OFF);

            helpers.next(function() {
              expect(el.items.getAll().length).to.equal(17, 'should be 17 colors again');
              done();
            });
          });
        });
      });
    });

    describe('#showSwatches', function() {
      it('should default to "on"', function() {
        expect(el.showSwatches).to.equal(Coral.ColorInput.showSwatches.ON);
      });

      it('should be possible to enable/disable the swatches view', function(done) {
        // we need to wait because views are shown/hidden in sync
        helpers.next(function() {
          expect(el.showSwatches).to.equal(Coral.ColorInput.showSwatches.ON, 'swatches view should be enabled by default');
          expect(el._elements.swatchesView.hidden).to.equal(false, 'swatches view should be visible');

          el.showSwatches = Coral.ColorInput.showSwatches.OFF;

          helpers.next(function() {
            expect(el._elements.swatchesView.hidden).to.equal(true, 'swatches view should now be hidden');

            el.showSwatches = Coral.ColorInput.showSwatches.ON;

            helpers.next(function() {
              expect(el._elements.swatchesView.hidden).to.equal(false, 'swatches view should now be visible again');
              done();
            });
          });
        });
      });
    });

    describe('#showProperties', function() {
      it('should default to "on"', function() {
        expect(el.showProperties).to.equal(Coral.ColorInput.showProperties.ON);
      });

      it('should be possible to enable/disable the color properties view', function(done) {
        // we need to wait because views are shown/hidden in sync
        helpers.next(function() {
          expect(el.showProperties).to.equal(Coral.ColorInput.showProperties.ON, 'color properties view should be enabled by default');
          expect(el._elements.propertiesView.hidden).to.equal(false, 'color properties view should be visible');

          el.showProperties = Coral.ColorInput.showProperties.OFF;

          helpers.next(function() {
            expect(el._elements.propertiesView.hidden).to.equal(true, 'color properties view should now be hidden');

            el.showProperties = Coral.ColorInput.showProperties.ON;

            helpers.next(function() {
              expect(el._elements.propertiesView.hidden).to.equal(false, 'color properties view should now be visible again');
              done();
            });
          });
        });
      });
    });

    describe('#showDefaultColors', function() {
      it('should default to "on"', function() {
        expect(el.showDefaultColors).to.equal(Coral.ColorInput.showDefaultColors.ON);
      });

      it('should be possible to add/remove default colors', function(done) {
        // we need to wait because views are shown/hidden in sync
        helpers.next(function() {
          expect(el.showDefaultColors).to.equal(Coral.ColorInput.showDefaultColors.ON, 'default colors should be added by default');
          expect(el.items.getAll().length).to.equal(17, 'should be 17 colors by default');

          el.showDefaultColors = Coral.ColorInput.showDefaultColors.OFF;

          helpers.next(function() {
            expect(el.items.getAll().length).to.equal(0, 'should be 0 colors now');

            el.showDefaultColors = Coral.ColorInput.showDefaultColors.ON;

            helpers.next(function() {
              expect(el.items.getAll().length).to.equal(17, 'should be 17 colors again');
              done();
            });
          });
        });
      });
    });

    describe('#selectedItem', function() {
      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });

      it('should select one of the preconfigured colors if the value specified is one of them (or very similar)', function(done) {
        expect(el.selectedItem).to.equal(null, 'No color should be selected so far');
        var allColorElements = el.items.getAll();
        var colorEl = allColorElements[1];
        el.value = colorEl.value;

        helpers.next(function() {
          expect(el.selectedItem).to.equal(colorEl, 'First non-empty color should now be selected');
          done();
        });
      });
    });

    describe('#items', function() {
      it('should start with the initial default colors', function() {
        expect(el.items.getAll().length).to.equal(17); //default color are  17
      });
    });
  });

  describe('Markup', function() {
    describe('#value', function() {
      it('should be possible to set the value using markup', function(done) {
        helpers.build('<coral-colorinput value="#FF851B"></coral-colorinput>', function(el) {
          expect(el.value).to.equal('#FF851B', 'Orange should be the current value');
          expect(el.valueAsColor.hexValue.toUpperCase()).to.equal('#FF851B', 'valueAsColor should also return orange');
          expect(el.selectedItem.value).to.equal('#FF851B', 'selected item should also be set, as orange is one of the colors in default palette');
          done();
        });
      });
    });

    describe('#name', function() {
      it('should be possible to set the name using markup', function(done) {
        helpers.build('<coral-colorinput name="haxe"></coral-colorinput>', function(el) {
          expect(el.name).to.equal('haxe', 'name should now be set');
          expect(el._elements.input.name).to.equal('haxe', 'name should be reflected by input field');
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should be possible to disable using markup', function(done) {
        helpers.build('<coral-colorinput disabled></coral-colorinput>', function(el) {
          expect(el._elements.input.disabled).to.equal(true, 'input should now be disabled');
          expect(el._elements.colorPreview.disabled).to.equal(true, 'colorPreview should now be disabled');
          done();
        });
      });
    });

    describe('#invalid', function() {
      it('should be possible to "force" colorinput to be invalid using markup', function(done) {
        helpers.build('<coral-colorinput invalid></coral-colorinput>', function(el) {
          expect(el.invalid).to.equal(true, 'colorinput should now be invalid');
          expect(el._elements.input.invalid).to.equal(true, 'input should now be invalid');
          expect(el._elements.input.hasAttribute('aria-invalid')).to.be.true;
          done();
        });
      });
    });

    describe('#readonly', function() {
      it('should be possible to set readOnly using markup', function(done) {
        helpers.build('<coral-colorinput readonly></coral-colorinput>', function(el) {
          expect(el.readOnly).to.equal(true, 'colorinput should now be readonly');
          expect(el._elements.input.disabled).to.equal(true, 'input should now be disabled');
          expect(el._elements.colorPreview.disabled).to.equal(true, 'colorPreview should now be disabled');
          done();
        });
      });
    });

    describe('#required', function() {
      it('should be possible to set required using markup', function(done) {
        helpers.build('<coral-colorinput required></coral-colorinput>', function(el) {
          expect(el.required).to.equal(true, 'colorinput should now be required');
          expect(el._elements.input.required).to.equal(true, 'input should now be required');
          done();
        });
      });
    });

    describe('#labelledby', function() {
      it('should be possible to set labelledBy using markup', function(done) {
        helpers.build(window.__html__['Coral.ColorInput.labelledBy.html'], function(div) {
          var el = div.querySelector('coral-colorinput');
          helpers.next(function() {
            expect(el.labelledBy).to.equal('mylabel', 'should be labeled by "mylabel"');
            expect(el.getAttribute('aria-labelledby')).to.equal('mylabel', 'should also be labeled by "mylabel"');
            done();
          });
        });
      });
    });

    describe('#variant', function() {
      it('should be possible to set the variant using markup', function(done) {
        helpers.build('<coral-colorinput variant="swatch"></coral-colorinput>', function(el) {
          expect(el.$.hasClass('coral-ColorInput')).to.be.true;
          expect(el.$.hasClass('coral-ColorInput--swatch')).to.be.true;
          done();
        });
      });
    });

    describe('#autogeneratecolors', function() {
      it('should be possible to autogenerate colors using markup', function(done) {
        helpers.build('<coral-colorinput autogeneratecolors="shades"></coral-colorinput>', function(el) {
          // 5 shades for every color should be automatically generated
          expect(el.items.getAll().length).to.equal(16 * 6 + 1, '5 shades for every color should be automatically generated + No Color');
          done();
        });
      });
    });

    describe('#showSwatches', function() {
      it('should be possible to turn on/off the different views using markup', function(done) {
        helpers.build('<coral-colorinput showSwatches="off"></coral-colorinput>', function(el) {
          expect(el.showSwatches).to.equal(Coral.ColorInput.showSwatches.OFF, 'swatches view should be disabled');
          expect(el._elements.swatchesView.hidden).to.equal(true, 'swatches view should be invisible');

          done();
        });
      });
    });

    describe('#showProperties', function() {
      it('should be possible to turn on/off the different views using markup', function(done) {
        helpers.build('<coral-colorinput showProperties="off"></coral-colorinput>', function(el) {
          expect(el.showProperties).to.equal(Coral.ColorInput.showProperties.OFF, 'color properties view should be disabled');
          expect(el._elements.propertiesView.hidden).to.equal(true, 'color properties view should be invisible');

          done();
        });
      });
    });

    describe('#showDefaultColors', function() {
      it('should be possible to add custom color with default colors using markup', function(done) {
        helpers.build(window.__html__['Coral.ColorInput.showDefaultColors.on.html'], function(el) {
          expect(el.showDefaultColors).to.equal(Coral.ColorInput.showDefaultColors.ON, 'default colors should be added by default');
          expect(el.items.getAll().length).to.equal(19, 'should be 19 colors (17 default colors + 2 custom colors)');

          done();
        });
      });

      it('should be possible to add custom color without default colors using markup', function(done) {
        helpers.build(window.__html__['Coral.ColorInput.showDefaultColors.off.html'], function(el) {
          expect(el.showDefaultColors).to.equal(Coral.ColorInput.showDefaultColors.OFF, 'default colors should be added by default');
          expect(el.items.getAll().length).to.equal(2, 'should be 2 colors (only custom colors)');

          done();
        });
      });
    });
  });

  describe('Events', function() {});

  describe('User Interaction', function() {
    it('should open a overlay on click on the colorinput button', function(done) {
      helpers.build(window.__html__['Coral.ColorInput.base.html'], function(el) {
        expect(el._elements.overlay.open).to.equal(false, 'overlay should be closed by default');

        // click on button should open overlay
        el._elements.colorPreview.click();

        helpers.next(function() {
          expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');
          done();
        });
      });
    });

    it('should update all its views if form field is changed directly via input colorinput never the less + select right colors', function(done) {
      helpers.build(window.__html__['Coral.ColorInput.base.html'], function(el) {
        var allColorElements = el.items.getAll();
        var colorEl = allColorElements[1];

        helpers.next(function() {
          // change is only triggered when not changed via javascript... (so trigger a change ourself to fake)
          el._elements.input.value = colorEl.value;
          el._elements.input.trigger('change');

          // Wait two frames util views should be updated
          helpers.next(function() {
            helpers.next(function() {
              expect(el.selectedItem).to.equal(colorEl, 'First non-empty color should now be selected');

              var backgroundColor = new Coral.Color();
              backgroundColor.value = el._elements.colorPreview.style.backgroundColor;

              expect(backgroundColor.isSimilarTo(el.valueAsColor)).to.equal(true, 'Background color should reflect the new value');

              done();
            });
          });
        });
      });
    });

    it('should set invalid if wrong value is set by user', function(done) {
      helpers.build('<coral-colorinput value="#FF851B"></coral-colorinput>', function(el) {
        expect(el._elements.input.value).to.equal('#FF851B', 'Color should be set');

        expect(el.invalid).to.be.false;

        el.value = 'hello';
        helpers.next(function() {
          // value should only be invalid if set via user interaction
          expect(el.invalid).to.be.false;

          // simulate a user interaction in order to invalidate !!!
          el._validateInputValue();

          helpers.next(function() {
            expect(el.invalid).to.be.true;
            done();
          });
        });
      });
    });
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.ColorInput.items.value.html'], {
        value: '#DDDDDD'
      });
    });

    it('should have right classes set', function(done) {
      helpers.build(window.__html__['Coral.ColorInput.base.html'], function(el) {
        expect(el.$.hasClass('coral-ColorInput')).to.be.true;
        done();
      });
    });

    it('should generate a swatches subview for the colorinput', function(done) {
      helpers.build('<coral-colorinput value="#FF851B" autogeneratecolors="shades"></coral-colorinput>', function(el) {

        el.on('coral-overlay:open', function() {
          // Force overlay to show immediately
          el._elements.overlay.style.opacity = 1;

          var $swatches = el.$.find('coral-colorinput-swatches');
          var $swatchItems = $swatches.find('coral-colorinput-swatch');

          expect($swatches.length).to.equal(1, 'there should be a coral-colorinput-swatches component ');
          expect($swatchItems.length).to.equal(97, 'there should be 97 swatch items');

          done();
        });

        el._elements.overlay.open = true;
      });
    });

    it('should generate a properties subview for the colorinput', function(done) {
      helpers.build('<coral-colorinput value="#FF851B"></coral-colorinput>', function(el) {

        el.on('coral-overlay:open', function() {

          // Force overlay to show immediately
          el._elements.overlay.style.opacity = 1;

          expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');

          helpers.next(function() {
            expect(el._elements.overlay.open).to.equal(true, 'overlay should still be open');

            var $properties = el.$.find('coral-colorinput-colorproperties');
            var $propertiesView = $properties.find('.coral-ColorInput-propertiesSubview');
            var $previewView = $propertiesView.find('.coral-ColorInput-previewView');
            var $rgbaView = $propertiesView.find('.coral-ColorInput-rgbaView');

            expect($properties.length).to.equal(1, 'there should be a coral-colorinput-edit component ');
            expect($propertiesView.length).to.equal(1, 'there should be a properties view ');
            expect($previewView.length).to.equal(1, 'there should be a preview View');
            expect($rgbaView.length).to.equal(1, 'there should be a rgba view');

            done();
          });
        });

        el._elements.overlay.open = true;
      });
    });

    it('should update swatches when value is changed', function(done) {
      helpers.build(window.__html__['Coral.ColorInput.base.html'], function(el) {
        expect(el._elements.input.value).to.equal('', 'ColorInput should have an empty string as default value');
        /**
         open overlay first so that swatches can be generated and
         their selection can be tested with value change.
         */
        el.on('coral-overlay:open', function () {

          expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');

          el.value = '#0074D9';
          helpers.next(function () {
            expect(el._elements.input.value).to.equal('#0074D9', 'Color should now be set');

            var selectedColor = el.items.getAll()[2];
            expect(selectedColor.selected).to.be.true;

            // correct swatch should be selected
            var selectedSwatch = el._elements.swatchesView.items.getAll()[2];
            expect(selectedSwatch.selected).to.be.true;

            // value should be updated on updating via value API
            el.value = '#39CCCC';
            helpers.next(function () {
              expect(el._elements.input.value).to.equal('#39CCCC', 'Color should now be set');

              var selectedColor = el.items.getAll()[4];
              expect(selectedColor.selected).to.be.true;

              var selectedSwatch = el._elements.swatchesView.items.getAll()[4];
              expect(selectedSwatch.selected).to.be.true;

              done();
            });
          });
        });

        el._elements.overlay.open = true;
      });
    });
  });
});
