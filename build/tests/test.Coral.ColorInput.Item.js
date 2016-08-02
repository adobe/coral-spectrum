describe('Coral.ColorInput.Item', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('ColorInput');
      expect(Coral.ColorInput).to.have.property('Item');
    });
  });

  describe('API', function() {
    describe('#value', function() {
      it('should be set up with default values', function() {
        var color = new Coral.ColorInput.Item();
        expect(color.value).to.equal('');
      });

      it('should be possible to get/set a valid color values (generic test)', function(done) {
        // should be possible to create elements using snippets
        helpers.build(window.__html__['Coral.ColorInput.Items.html'], function(colors) {

          var validColorSelectors = ['#rgb1', '#rgb2', '#rgba1', '#rgba2', '#cmyk1', '#hex1', '#hex2', '#hex3', '#hsb1', '#hsb2', '#hsl1', '#hsl2', '#hsla1', '#hsla2'];

          var color = null;
          var colorEl = null;
          for (var i = 0; i < validColorSelectors.length; i++) {
            colorEl = colors.querySelector(validColorSelectors[i]);
            expect(colorEl.value).to.not.equal('');

            color = new Coral.Color();
            color.value = colorEl.value;

            expect(color.rgb).to.not.be.null;
          }
          done();
        });
      });

      it('should not be possible to get/set a invalid color values (generic test)', function(done) {
        // should be possible to create elements using snippets
        helpers.build(window.__html__['Coral.ColorInput.Items.html'], function(colors) {

          var invalidColorSelectors = ['#rgb3', '#rgb4', '#rgba3', '#rgba4', '#rgba5', '#cmyk2', '#hex4', '#hsb3', '#hsb4', '#hsl3', '#hsl4', '#hsla3', '#hsla4'];

          var color = null;
          var colorEl = null;
          for (var i = 0; i < invalidColorSelectors.length; i++) {
            colorEl = colors.querySelector(invalidColorSelectors[i]);
            expect(colorEl.value).to.equal('');

            color = new Coral.Color();
            color.value = colors.querySelector(invalidColorSelectors[i]).value;

            expect(color.rgb).to.be.null;
          }
          done();
        });
      });
    });
  });
});
