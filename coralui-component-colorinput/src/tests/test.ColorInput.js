import {helpers} from '/coralui-util/src/tests/helpers';
import {ColorInput, Color} from '/coralui-component-colorinput';

describe('ColorInput', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(ColorInput).to.have.property('Slider');
      expect(ColorInput).to.have.property('Swatch');
      expect(ColorInput).to.have.property('Swatches');
      expect(ColorInput).to.have.property('ColorProperties');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent(window.__html__['ColorInput.base.html']);
    });
  
    it('should be possible via cloneNode using js', function() {
      helpers.cloneComponent(new ColorInput());
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new ColorInput());
    });

    afterEach(function() {
      el = null;
    });

    describe('#name', function() {
      it('should be possible to set the name', function() {
        el.name = 'howdy';

        expect(el.name).to.equal('howdy', 'name should have changed');
        expect(el._elements.input.name).to.equal('howdy', 'name should now be reflected by input field');
      });
    });

    describe('#value', function() {
      it('should be possible to set the value', function() {
        expect(el._elements.input.value).to.equal('', 'ColorInput should have an empty string as default value');
        expect(el.invalid).to.be.false;
        expect(el._elements.colorPreview.style.backgroundColor).to.equal('');

        el.value = '#00FF00';
        
        expect(el._elements.input.value).to.equal('#00FF00', 'Color should now be set');
        expect(el.invalid).to.be.false;

        var backgroundColor = new Color();
        backgroundColor.value = el._elements.colorPreview.style.backgroundColor;

        expect(backgroundColor.isSimilarTo(el.valueAsColor)).to.equal(true, 'Background color should reflect the new value');
      });
    });

    describe('#disabled', function() {
      it('should be possible to disable the colorinput', function() {
        el.variant = ColorInput.variant.SWATCH;

        expect(el._elements.colorPreview.icon).to.equal('', 'the color preview icon should not be locked');
        el.disabled = true;

        expect(el.disabled).to.equal(true, 'should now be disabled');
        
        expect(el._elements.colorPreview.disabled).to.equal(true, 'button should now be disabled');
        expect(el._elements.input.disabled).to.equal(true, 'input field should now be disabled');

        expect(el._elements.colorPreview.icon).to.equal('lockClosed', 'the color preview icon should now reflect the locked state (in swatch variant)');
      });
    });

    describe('#invalid', function() {
      it('should be possible to force a value to be invalid', function() {
        expect(el.invalid).to.equal(false, 'colorinput should be valid by default');

        // Set valid value
        el.value = '#000000';
        expect(el.invalid).to.equal(false, 'this should be a valid value');

        // Force colorinput to be invalid ??
        el.invalid = true;
        expect(el.invalid).to.equal(true, 'colorinput should now be forced to be inavalid (although value inside is valid)');
        
        expect(el._elements.input.invalid).to.equal(true, 'input field should now be invalid');
      });
    });

    describe('#readOnly', function() {
      it('should be possible to make colorinput readonly', function() {
        el.readOnly = true;
        
        expect(el._elements.colorPreview.disabled).to.equal(true, 'button should now be disabled');
        expect(el._elements.input.readOnly).to.equal(true, 'input field should now be readOnly');
      });
    });

    describe('#required', function() {
      it('should be possible to make it required to set a value', function() {
        el.required = true;
        
        expect(el._elements.input.required).to.equal(true, 'input field should now be required');
      });
    });

    describe('#labelledBy', function() {
      it('should default to null', function() {
        expect(el.labelledBy).to.be.null;
      });
    });

    describe('#placeholder', function() {
      it('should default to ""', function() {
        expect(el.placeholder).to.equal('');
        expect(el.hasAttribute('placeholder')).to.be.false;
      });

      it('should be set and reflected', function() {
        el.placeholder = 'ni1';
        expect(el.placeholder).to.equal('ni1');
        expect(el._elements.input.getAttribute('placeholder')).to.equal('ni1');
      });
    });

    describe('#variant', function() {
      it('should default to "default"', function() {
        expect(el.variant).to.equal(ColorInput.variant.DEFAULT);
      });

      it('should be possible to set the variant', function() {
        expect(el.classList.contains('_coral-ColorInput--swatch')).to.equal(false, 'ColorInput should not be minimal variant');
        expect(el._elements.input.getAttribute('tabindex')).to.not.equal('-1', 'In default variant colorinput should have no tabindex of -1');
        
        el.variant = ColorInput.variant.SWATCH;
        
        expect(el.variant).to.equal(ColorInput.variant.SWATCH);
        expect(el.classList.contains('_coral-ColorInput--swatch')).to.equal(true, 'ColorInput should now be minimal variant');

        expect(el._elements.input.getAttribute('tabindex')).to.equal('-1', 'In minimal variant colorinput should have no tabindex');
      });
    });

    describe('#valueAsColor', function() {
      it('should default to null', function() {
        expect(el.valueAsColor).to.be.null;
      });

      it('should be possible to get/set the value as Color instead of a string', function() {
        var allColorElements = el.items.getAll();
        var colorEl = allColorElements[1];

        expect(el.valueAsColor).to.equal(null, 'an empty value should be represented by a "null" Color');
        var newColor = new Color();
        newColor.value = colorEl.value;

        el.valueAsColor = newColor;
        
        expect(el.selectedItem).to.equal(colorEl, 'First non-empty color should now be selected');

        var backgroundColor = new Color();
        backgroundColor.value = el._elements.colorPreview.style.backgroundColor;

        expect(backgroundColor.isSimilarTo(el.valueAsColor)).to.equal(true, 'Background color should reflect the new value');

        // must be also possible to unset a color using valueAsColor!
        el.valueAsColor = null;

        expect(el.valueAsColor).to.equal(null, 'valueAsColor should now return null');
        expect(el.value).to.equal('', 'value should now be "" ');
      });
    });

    describe('#autoGenerateColors', function() {
      it('should default to "off"', function() {
        expect(el.autoGenerateColors).to.equal(ColorInput.autoGenerateColors.OFF);
      });

      it('should be possible to auto generate colors and remove them again ', function() {
        expect(el.autoGenerateColors).to.equal(ColorInput.autoGenerateColors.OFF);
        expect(el.items.getAll().length).to.equal(17, 'should be 17 colors by default');
  
        el.autoGenerateColors = ColorInput.autoGenerateColors.SHADES;
        expect(el.autoGenerateColors).to.equal(ColorInput.autoGenerateColors.SHADES);
  
        // 5 shades for every color should be automatically generated
        expect(el.items.getAll().length).to.equal(16 * 6 + 1, '5 shades for every color should be automatically generated + No Color');
  
        el.autoGenerateColors = ColorInput.autoGenerateColors.TINTS;
        expect(el.autoGenerateColors).to.equal(ColorInput.autoGenerateColors.TINTS);
  
        expect(el.items.getAll().length).to.equal(16 * 6 + 1, '5 tints for every "original" color should be automatically generated + No Color');
  
        el.autoGenerateColors = ColorInput.autoGenerateColors.OFF;
        expect(el.autoGenerateColors).to.equal(ColorInput.autoGenerateColors.OFF);
  
        expect(el.items.getAll().length).to.equal(17, 'should be 17 colors again');
      });
    });

    describe('#showSwatches', function() {
      it('should default to "on"', function() {
        expect(el.showSwatches).to.equal(ColorInput.showSwatches.ON);
      });

      it('should be possible to enable/disable the swatches view', function() {
        expect(el.showSwatches).to.equal(ColorInput.showSwatches.ON, 'swatches view should be enabled by default');
        expect(el._elements.swatchesView.hidden).to.equal(false, 'swatches view should be visible');
  
        el.showSwatches = ColorInput.showSwatches.OFF;
  
        expect(el._elements.swatchesView.hidden).to.equal(true, 'swatches view should now be hidden');
  
        el.showSwatches = ColorInput.showSwatches.ON;
  
        expect(el._elements.swatchesView.hidden).to.equal(false, 'swatches view should now be visible again');
      });
    });

    describe('#showProperties', function() {
      it('should default to "on"', function() {
        expect(el.showProperties).to.equal(ColorInput.showProperties.ON);
      });
      
      it('should be possible to enable/disable the color properties view', function() {
        expect(el.showProperties).to.equal(ColorInput.showProperties.ON, 'color properties view should be enabled by default');
        expect(el._elements.propertiesView.hidden).to.equal(false, 'color properties view should be visible');
  
        el.showProperties = ColorInput.showProperties.OFF;
  
        expect(el._elements.propertiesView.hidden).to.equal(true, 'color properties view should now be hidden');
  
        el.showProperties = ColorInput.showProperties.ON;
  
        expect(el._elements.propertiesView.hidden).to.equal(false, 'color properties view should now be visible again');
      });
    });

    describe('#showDefaultColors', function() {
      it('should default to "on"', function() {
        expect(el.showDefaultColors).to.equal(ColorInput.showDefaultColors.ON);
      });

      it('should be possible to add/remove default colors', function() {
        expect(el.showDefaultColors).to.equal(ColorInput.showDefaultColors.ON, 'default colors should be added by default');
        expect(el.items.getAll().length).to.equal(17, 'should be 17 colors by default');
  
        el.showDefaultColors = ColorInput.showDefaultColors.OFF;
  
        expect(el.items.getAll().length).to.equal(0, 'should be 0 colors now');
  
        el.showDefaultColors = ColorInput.showDefaultColors.ON;
  
        expect(el.items.getAll().length).to.equal(17, 'should be 17 colors again');
      });
    });

    describe('#selectedItem', function() {
      it('should default to null', function() {
        expect(el.selectedItem).to.be.null;
      });

      it('should select one of the preconfigured colors if the value specified is one of them (or very similar)', function() {
        expect(el.selectedItem).to.equal(null, 'No color should be selected so far');
        var allColorElements = el.items.getAll();
        var colorEl = allColorElements[1];
        el.value = colorEl.value;
        
        expect(el.selectedItem).to.equal(colorEl, 'First non-empty color should now be selected');
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
      it('should be possible to set the value using markup', function() {
        const el = helpers.build('<coral-colorinput value="#FF851B"></coral-colorinput>');
        expect(el.value).to.equal('#FF851B', 'Orange should be the current value');
        expect(el.valueAsColor.hexValue.toUpperCase()).to.equal('#FF851B', 'valueAsColor should also return orange');
        expect(el.selectedItem.value).to.equal('#FF851B', 'selected item should also be set, as orange is one of the colors in default palette');
      });
    });

    describe('#name', function() {
      it('should be possible to set the name using markup', function() {
        const el = helpers.build('<coral-colorinput name="haxe"></coral-colorinput>');
        expect(el.name).to.equal('haxe', 'name should now be set');
        expect(el._elements.input.name).to.equal('haxe', 'name should be reflected by input field');
      });
    });

    describe('#disabled', function() {
      it('should be possible to disable using markup', function() {
        const el = helpers.build('<coral-colorinput disabled></coral-colorinput>');
        expect(el._elements.input.disabled).to.equal(true, 'input should now be disabled');
        expect(el._elements.colorPreview.disabled).to.equal(true, 'colorPreview should now be disabled');
      });
    });

    describe('#invalid', function() {
      it('should be possible to "force" colorinput to be invalid using markup', function() {
        const el = helpers.build('<coral-colorinput invalid></coral-colorinput>');
        expect(el.invalid).to.equal(true, 'colorinput should now be invalid');
        expect(el._elements.input.invalid).to.equal(true, 'input should now be invalid');
        expect(el._elements.input.hasAttribute('aria-invalid')).to.be.true;
      });
    });

    describe('#readonly', function() {
      it('should be possible to set readOnly using markup', function() {
        const el = helpers.build('<coral-colorinput readonly></coral-colorinput>');
        expect(el.readOnly).to.equal(true, 'colorinput should now be readonly');
        expect(el._elements.input.readOnly).to.equal(true, 'input should now be readOnly');
        expect(el._elements.colorPreview.disabled).to.equal(true, 'colorPreview should now be disabled');
      });
    });

    describe('#required', function() {
      it('should be possible to set required using markup', function() {
        const el = helpers.build('<coral-colorinput required></coral-colorinput>');
        expect(el.required).to.equal(true, 'colorinput should now be required');
        expect(el._elements.input.required).to.equal(true, 'input should now be required');
      });
    });

    describe('#labelledby', function() {
      it('should be possible to set labelledBy using markup', function() {
        const div = helpers.build(window.__html__['ColorInput.labelledBy.html']);
        var el = div.querySelector('coral-colorinput');
        
        expect(el.labelledBy).to.equal('mylabel', 'should be labeled by "mylabel"');
        expect(el.getAttribute('aria-labelledby')).to.equal('mylabel', 'should also be labeled by "mylabel"');
      });
    });

    describe('#variant', function() {
      it('should be possible to set the variant using markup', function() {
        const el = helpers.build('<coral-colorinput variant="swatch"></coral-colorinput>');
        expect(el.classList.contains('_coral-ColorInput')).to.be.true;
        expect(el.classList.contains('_coral-ColorInput--swatch')).to.be.true;
      });
    });

    describe('#autogeneratecolors', function() {
      it('should be possible to autogenerate colors using markup', function() {
        const el = helpers.build('<coral-colorinput autogeneratecolors="shades"></coral-colorinput>');
        // 5 shades for every color should be automatically generated
        expect(el.items.getAll().length).to.equal(16 * 6 + 1, '5 shades for every color should be automatically generated + No Color');
      });
    });

    describe('#showSwatches', function() {
      it('should be possible to turn on/off the different views using markup', function() {
        const el = helpers.build('<coral-colorinput showSwatches="off"></coral-colorinput>');
        expect(el.showSwatches).to.equal(ColorInput.showSwatches.OFF, 'swatches view should be disabled');
        expect(el._elements.swatchesView.hidden).to.equal(true, 'swatches view should be invisible');
      });
    });

    describe('#showProperties', function() {
      it('should be possible to turn on/off the different views using markup', function() {
        const el = helpers.build('<coral-colorinput showProperties="off"></coral-colorinput>');
        expect(el.showProperties).to.equal(ColorInput.showProperties.OFF, 'color properties view should be disabled');
        expect(el._elements.propertiesView.hidden).to.equal(true, 'color properties view should be invisible');
      });
    });

    describe('#showDefaultColors', function() {
      it('should be possible to add custom color with default colors using markup', function() {
        const el = helpers.build(window.__html__['ColorInput.showDefaultColors.on.html']);
        expect(el.showDefaultColors).to.equal(ColorInput.showDefaultColors.ON, 'default colors should be added by default');
        expect(el.items.getAll().length).to.equal(19, 'should be 19 colors (17 default colors + 2 custom colors)');
      });

      it('should be possible to add custom color without default colors using markup', function() {
        const el = helpers.build(window.__html__['ColorInput.showDefaultColors.off.html']);
        expect(el.showDefaultColors).to.equal(ColorInput.showDefaultColors.OFF, 'default colors should be added by default');
        expect(el.items.getAll().length).to.equal(2, 'should be 2 colors (only custom colors)');
      });
    });
  });

  describe('Events', function() {});

  describe('User Interaction', function() {
    it('should open a overlay on click on the colorinput button', function() {
      const el = helpers.build(window.__html__['ColorInput.base.html']);
      expect(el._elements.overlay.open).to.equal(false, 'overlay should be closed by default');

      // click on button should open overlay
      el._elements.colorPreview.click();
      
      expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');
    });

    it('should update all its views if form field is changed directly via input colorinput never the less + select right colors', function() {
      const el = helpers.build(window.__html__['ColorInput.base.html']);
      var allColorElements = el.items.getAll();
      var colorEl = allColorElements[1];
  
      // change is only triggered when not changed via javascript... (so trigger a change ourself to fake)
      el._elements.input.value = colorEl.value;
      el._elements.input.trigger('change');
  
      expect(el.selectedItem).to.equal(colorEl, 'First non-empty color should now be selected');
  
      var backgroundColor = new Color();
      backgroundColor.value = el._elements.colorPreview.style.backgroundColor;
  
      expect(backgroundColor.isSimilarTo(el.valueAsColor)).to.equal(true, 'Background color should reflect the new value');
    });

    it('should set invalid if wrong value is set by user', function() {
      const el = helpers.build('<coral-colorinput value="#FF851B"></coral-colorinput>');
      expect(el._elements.input.value).to.equal('#FF851B', 'Color should be set');

      expect(el.invalid).to.be.false;

      el.value = 'hello';
      
      // value should only be invalid if set via user interaction
      expect(el.invalid).to.be.false;

      // simulate a user interaction in order to invalidate !!!
      el._validateInputValue();
      
      expect(el.invalid).to.be.true;
    });

    it('should select corresponding swatch on pressing arrow keys', function() {
      const el = helpers.build(window.__html__['ColorInput.base.html']);

      el._elements.overlay.open = true;
  
      expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');
  
      el.value = '#2ECC40';
      expect(el._elements.input.value).to.equal('#2ECC40', 'Color should now be set');
  
      var swatchView = el._elements.swatchesView;
      swatchView.selectedItem.focus();
      helpers.keydown('left', swatchView.selectedItem);
      
      expect(el._elements.input.value).to.equal('#3D9970', 'Left Color should be set');
      helpers.keydown('up', swatchView.selectedItem);
      
      expect(el._elements.input.value).to.equal('#001F3F', 'Upper Color should be set');
      helpers.keydown('right', swatchView.selectedItem);
  
      expect(el._elements.input.value).to.equal('#0074D9', 'Right Color should be set');
      helpers.keydown('down', swatchView.selectedItem);
  
      expect(el._elements.input.value).to.equal('#2ECC40', 'Bottom Color should be set');
    });
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['ColorInput.items.value.html'], {
        value: '#DDDDDD'
      });
    });

    it('should have right classes set', function() {
      const el = helpers.build(window.__html__['ColorInput.base.html']);
      expect(el.classList.contains('_coral-ColorInput')).to.be.true;
    });

    it('should have the right role set', function() {
      const el = helpers.build(window.__html__['ColorInput.base.html']);
      expect(el.getAttribute('role')).to.equal('combobox');
    });

    it('should generate a swatches subview for the colorinput', function() {
      const el = helpers.build('<coral-colorinput value="#FF851B" autogeneratecolors="shades"></coral-colorinput>');
      
      el._elements.overlay.open = true;
  
      var swatches = el.querySelectorAll('coral-colorinput-swatches');
      expect(swatches.length).to.equal(1, 'there should be a coral-colorinput-swatches component ');
  
      var swatchItems = swatches[0].querySelectorAll('coral-colorinput-swatch');
      expect(swatchItems.length).to.equal(97, 'there should be 97 swatch items');
    });

    it('should generate a properties subview for the colorinput', function() {
      const el = helpers.build('<coral-colorinput value="#FF851B"></coral-colorinput>');

      el._elements.overlay.open = true;
  
      // Force overlay to show immediately
      el._elements.overlay.style.opacity = 1;
  
      expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');
  
      var properties = el.querySelectorAll('coral-colorinput-colorproperties');
      expect(properties.length).to.equal(1, 'there should be a coral-colorinput-edit component ');
  
      var propertiesView = properties[0].querySelectorAll('._coral-ColorInput-propertiesSubview');
      expect(propertiesView.length).to.equal(1, 'there should be a properties view ');
  
      var previewView = propertiesView[0].querySelectorAll('._coral-ColorInput-previewView');
      expect(previewView.length).to.equal(1, 'there should be a preview View');
  
      var rgbaView = propertiesView[0].querySelectorAll('._coral-ColorInput-rgbaView');
      expect(rgbaView.length).to.equal(1, 'there should be a rgba view');
    });

    it('should update swatches when value is changed', function() {
      const el = helpers.build(window.__html__['ColorInput.base.html']);
      expect(el._elements.input.value).to.equal('', 'ColorInput should have an empty string as default value');

      el._elements.overlay.open = true;
  
      expect(el._elements.overlay.open).to.equal(true, 'overlay should now be open');
  
      el.value = '#0074D9';
  
      expect(el._elements.input.value).to.equal('#0074D9', 'Color should now be set');
  
      var selectedColor = el.items.getAll()[2];
      expect(selectedColor.selected).to.be.true;
  
      // correct swatch should be selected
      var selectedSwatch = el._elements.swatchesView.items.getAll()[2];
      expect(selectedSwatch.selected).to.be.true;
  
      // value should be updated on updating via value API
      el.value = '#39CCCC';
  
      expect(el._elements.input.value).to.equal('#39CCCC', 'Color should now be set');
  
      var selectedColor = el.items.getAll()[4];
      expect(selectedColor.selected).to.be.true;
  
      var selectedSwatch = el._elements.swatchesView.items.getAll()[4];
      expect(selectedSwatch.selected).to.be.true;
    });
  });
});
