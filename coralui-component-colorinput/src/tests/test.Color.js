import {Color} from '../../../coralui-component-colorinput';

describe('Color', function() {
  
  describe('API', function() {
    it('should be set up with default values', function() {
      var color = new Color();
      expect(color.value).to.equal('');

      expect(color.rgbValue).to.equal('');
      expect(color.rgbaValue).to.equal('');
      expect(color.hexValue).to.equal('');
      expect(color.cmykValue).to.equal('');
      expect(color.hsbValue).to.equal('');
      expect(color.hslValue).to.equal('');
      expect(color.hslaValue).to.equal('');

      expect(color.rgb).to.be.null;
      expect(color.rgba).to.be.null;
      expect(color.hex).to.be.null;
      expect(color.cmyk).to.be.null;
      expect(color.hsb).to.be.null;
      expect(color.hsl).to.be.null;
      expect(color.hsla).to.be.null;
    });

    it('should be possible to get/set alpha', function() {
      var color = new Color();

      // 1 by default
      expect(color.alpha).to.equal(1);

      color.alpha = 0.5;
      expect(color.alpha).to.equal(0.5);

      // can't set a 2 ;)
      color.alpha = 2;
      expect(color.alpha).to.equal(0.5);
    });

    it('should be possible to set rgb values', function() {
      var color = new Color();

      expect(color.rgb).to.be.null;

      color.rgb = {
        r: 255,
        g: 0,
        b: 0
      };

      expect(color.rgb.r).to.equal(255);
      expect(color.rgb.g).to.equal(0);
      expect(color.rgb.b).to.equal(0);
    });

    it('should be possible to set an rgb string as value', function() {
      // parsing color should work the same as setting values directly
      var color = new Color();
      color.value = 'rgb(255,0,0)';

      var color2 = new Color();
      color2.rgb = {
        r: 255,
        g: 0,
        b: 0
      };

      expect(color.isSimilarTo(color2)).to.be.true;
    });

    it('should be possible to parse an rgba', function() {
      // parsing color should work the same as setting values directly
      var color = new Color();
      color.value = 'rgb(255,0,0)';

      var color2 = new Color();
      color2.rgb = {
        r: 255,
        g: 0,
        b: 0
      };

      expect(color.isSimilarTo(color2)).to.be.true;
    });

    it('should be possible to use isSimilarTo', function() {
      // converting between this color spaces might loose some data
      var rgb = {
        r: 148,
        g: 205,
        b: 75
      };

      var rgbColor = new Color();
      rgbColor.rgb = rgb;

      var cmykColor = new Color();
      cmykColor.cmyk = rgbColor.cmyk;

      expect(rgbColor.isSimilarTo(cmykColor)).to.be.true;

      //values are slightly different, so an exact test would fail (due to conversion loss)
      expect(rgbColor.isSimilarTo(cmykColor, false)).to.be.false;
    });

    it('should be possible to parse a cmyk', function() {
      var color1 = new Color();
      color1.cmyk = {
        c: 0,
        m: 100,
        y: 50,
        k: 0
      };
      var color2 = new Color();
      color2.value = 'cmyk(0, 100, 50, 0)';

      expect(color1.isSimilarTo(color2)).to.be.true;
    });

    it('should be possible to parse a hex color', function() {
      var color1 = new Color();
      color1.rgb = {
        r: 148,
        g: 205,
        b: 75
      };
      var color2 = new Color();
      color2.value = '#94CD4B';

      expect(color1.isSimilarTo(color2)).to.be.true;
    });

    it('should be possible to parse a hsb color', function() {
      var color1 = new Color();
      color1.hsb = {
        h: 0,
        s: 0,
        b: 0
      };
      var color2 = new Color();
      color2.value = 'hsb(0,0,0)';

      expect(color1.isSimilarTo(color2)).to.be.true;
    });

    it('should be possible to parse a hsl color', function() {
      var color1 = new Color();
      color1.hsl = {
        h: 0,
        s: 0,
        l: 0
      };
      var color2 = new Color();
      color2.value = 'hsl(0,0%,0%)';

      expect(color1.isSimilarTo(color2)).to.be.true;
    });

    it('should be possible to parse a hsla color', function() {
      var color1 = new Color();
      color1.hsla = {
        h: 360,
        s: 0,
        l: 100,
        a: 0.5
      };
      var color2 = new Color();
      color2.value = 'hsla(360,0%,100%,0.5)';

      expect(color1.isSimilarTo(color2)).to.be.true;
    });

    it('should be possible to get/set rgbValue', function() {
      var string = 'rgb(255,0,0)';
      var color = new Color();
      color.rgbValue = string;
      expect(color.rgbValue).to.equal(string);
    });

    it('should be possible to get/set rgbaValue', function() {
      var string = 'rgba(255,0,0,1)';
      var color = new Color();
      color.rgbaValue = string;
      expect(color.rgbaValue).to.equal(string);
    });

    it('should be possible to get/set hexValue', function() {
      var string = '#94cd4b';
      var color = new Color();
      color.hexValue = string;
      expect(color.hexValue).to.equal(string);
    });

    it('should be possible to get/set cmykValue', function() {
      var string = 'cmyk(100,0,0,0)';
      var color = new Color();
      color.cmykValue = string;
      expect(color.cmykValue).to.equal(string);
    });

    it('should be possible to get/set hsbValue', function() {
      var string = 'hsb(180,100,100)';
      var color = new Color();
      color.hsbValue = string;
      expect(color.hsbValue).to.equal(string);
    });

    it('should be possible to get/set hslValue', function() {
      var string = 'hsl(180,100%,100%)';
      var color = new Color();
      color.hslValue = string;
      expect(color.hslValue).to.equal(string);
    });

    it('should be possible to get/set hslaValue', function() {
      var string = 'hsla(180,100%,100%,0.4)';
      var color = new Color();
      color.hslaValue = string;
      expect(color.hslaValue).to.equal(string);
    });

    it('should be able to parse valid colors (generic test)', function() {
      var someValidColors = ['rgb(0,0,0)', 'rgb(0, 0, 0)', 'rgb(255,255,255)',
        'rgba(0,0,0,0)', 'rgba(255,255,255,1)',
        'cmyk(0,100,50,0)',
        '#94CD4B', '#9C4', '94CD4B',
        'hsb(0,0,0)', 'hsb(360,100,100)',
        'hsl(0,0%,0%)', 'hsl(360,100%,100%)',
        'hsla(0,0%,0%,0.1)', 'hsla(360,100%,100%,1)'
      ];

      var color = null;
      for (var i = 0; i < someValidColors.length; i++) {
        color = new Color();
        color.value = someValidColors[i];
        expect(color.rgb).to.not.be.null;
      }
    });

    it('should not be to parse all invalid colors (generic test)', function() {
      var someInvalidColors = ['rgb(-1,-1,-1)', 'rgb(256,256,256)', 'rgb(,,)',
        'rgba(0,0,0)', 'rgba(-1,-1,-1,0)', 'rgba(0,0,0,2)',
        'cmyk(0,100,50)',
        '94CD4B9',
        'hsb(-1,-1,-1)', 'hsb(361,101,101)',
        'hsl(-1,-1,-1)', 'hsl(361,101,101)',
        'hsla(1,1%,1%,-1)', 'hsla(360,100%,100%,2)'
      ];

      var color = null;
      for (var i = 0; i < someInvalidColors.length; i++) {
        color = new Color();
        color.value = someInvalidColors[i];
        expect(color.rgb).to.be.null;
      }
    });

    it('should be possible to check if colors are similar (generic test)', function() {
      var someColors = [
        ['#a96836', 'rgb(169, 104, 54)', 'rgba(169, 104, 54, 1)', 'hsb(26.1, 68.1, 66.3)', 'hsl(26.1, 51.6%, 43.7%)', 'hsla(26.1, 51.6%, 43.7%, 1)', 'cmyk(0, 38.5, 68.1, 33.7)'],
        ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'hsb(0, 0, 0)', 'hsl(0, 0%, 0%)', 'hsla(0, 0%, 0%, 1)', 'cmyk(0, 0, 0, 100)'],
        ['#fff', 'rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)', 'hsb(0, 0, 100)', 'hsl(0, 0%, 100%)', 'hsla(0, 0%, 100%, 1)', 'cmyk(0, 0, 0, 0)'],
        ['#142d26', 'rgb(20, 45, 38)', 'rgba(20, 45, 38, 1)', 'hsb(163.9, 55, 17.68)', 'hsl(163.9, 37.9%, 12.8%)', 'hsla(163.9, 37.9%, 12.8%, 1)', 'cmyk(55, 0, 14.76, 82.32)']
      ];

      var colorGroup = null;
      var previousColor = null;
      var currentColor = null;
      for (var i = 0; i < someColors.length; i++) {
        colorGroup = someColors[i];
        for (var j = 1; j < colorGroup.length; j++) {
          previousColor = new Color();
          previousColor.value = colorGroup[j - 1];

          currentColor = new Color();
          currentColor.value = colorGroup[j];

          var isSimilar = previousColor.isSimilarTo(currentColor, true);
          expect(isSimilar).to.equal(true, previousColor.value + ' alpha: ' + previousColor.alpha + ' is not similar to ' + currentColor.value + ' alpha: ' + currentColor.alpha);
        }
      }
    });

    it('should be possible to easily convert colors without loss (generic test)', function() {
      var someColors = [
        ['#a96836', 'rgb(169, 104, 54)', 'rgba(169, 104, 54, 1)', 'hsb(26.1, 68.1, 66.3)', 'hsl(26.1, 51.6%, 43.7%)', 'hsla(26.1, 51.6%, 43.7%, 1)', 'cmyk(0, 38.5, 68.1, 33.7)'],
        ['#000', 'rgb(0, 0, 0)', 'rgba(0, 0, 0, 1)', 'hsb(0, 0, 0)', 'hsl(0, 0%, 0%)', 'hsla(0, 0%, 0%,1)', 'cmyk(0, 0, 0, 100)'],
        ['#fff', 'rgb(255, 255, 255)', 'rgba(255, 255, 255, 1)', 'hsb(0, 0, 100)', 'hsl(0, 0%, 100%)', 'hsla(0, 0%, 100%, 1)', 'cmyk(0, 0, 0, 0)'],
        ['#142d26', 'rgb(20, 45, 38)', 'rgba(20, 45, 38, 1)', 'hsb(163.9, 55, 17.68)', 'hsl(163.9, 37.9%, 12.8%)', 'hsla(163.9, 37.9%, 12.8%, 1)', 'cmyk(55, 0, 14.76, 82.32)']
      ];

      var colorGroup, color, rgb, hsb, hsl, cmyk, rgba, hsla,
        hex = null;
      for (var i = 0; i < someColors.length; i++) {
        colorGroup = someColors[i];
        for (var j = 0; j < colorGroup.length; j++) {
          color = new Color();
          color.value = colorGroup[j];

          rgb = new Color();
          rgb.value = color.rgbValue;
          expect(rgb.isSimilarTo(color)).to.equal(true, rgb.value + ' (rgb) is not similar to ' + color.value);

          hsb = new Color();
          hsb.value = color.hsbValue;
          expect(hsb.isSimilarTo(color)).to.equal(true, hsb.value + ' (hsb) is not similar to ' + color.value);

          hsl = new Color();
          hsl.value = color.hslValue;
          expect(hsl.isSimilarTo(color)).to.equal(true, hsl.value + ' (hsl) is not similar to ' + color.value);

          cmyk = new Color();
          cmyk.value = color.cmykValue;
          expect(cmyk.isSimilarTo(color)).to.equal(true, cmyk.value + ' (cmyk) is not similar to ' + color.value);

          hsla = new Color();
          hsla.value = color.hslaValue;
          expect(hsla.isSimilarTo(color)).to.equal(true, hsla.value + ' (hsla) is not similar to ' + color.value);

          rgba = new Color();
          rgba.value = color.rgbaValue;
          expect(hsla.isSimilarTo(color)).to.equal(true, rgba.value + ' (rgba) is not similar to ' + color.value);

          hex = new Color();
          hex.value = color.hexValue;
          expect(hex.isSimilarTo(color)).to.equal(true, hex.value + ' (hex) is not similar to ' + color.value);
        }
      }
    });
  });
});
