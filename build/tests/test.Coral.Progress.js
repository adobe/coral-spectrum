describe('Coral.Progress', function() {
  'use strict';

  var helpers = window.helpers;

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Progress');
    });

    it('should define the sizes in an enum', function() {
      expect(Coral.Progress.size).to.exist;
      expect(Coral.Progress.size.SMALL).to.equal('S');
      expect(Coral.Progress.size.MEDIUM).to.equal('M');
      expect(Coral.Progress.size.LARGE).to.equal('L');
      expect(Object.keys(Coral.Progress.size).length).to.equal(3);
    });
  });

  it('should have the right className', function() {
    var progress = new Coral.Progress();

    expect(progress.$).to.have.class('coral-Progress');
  });

  it('should move child text content into the label content zone', function(done) {
    var htmlFragment = '<coral-progress>SOME LABEL</coral-progress>';
    helpers.build(htmlFragment, function(progress) {
      var contentNodeValue = progress.label.textContent;
      expect(contentNodeValue).to.equal('SOME LABEL');
      done();
    });

  });

  describe('Public API', function() {
    it('should reflect value changes', function(done) {
      var progress = new Coral.Progress();
      progress.value = 50;

      helpers.next(function() {
        expect(progress.getAttribute('value')).to.equal('50', 'Attribute value');
        expect(progress.getAttribute('aria-valuenow')).to.equal('50', 'ARIA value');
        expect(progress._elements.status.style.width).to.equal('50%', 'Width of status bar');
        done();
      });
    });

    it('should reflect indeterminate state as DOM attribute', function(done) {
      var progress = new Coral.Progress();
      expect(progress.hasAttribute('indeterminate')).to.be.false;

      progress.indeterminate = true;
      helpers.next(function() {
        expect(progress.hasAttribute('indeterminate')).to.be.true;

        progress.indeterminate = false;
        helpers.next(function() {
          expect(progress.hasAttribute('indeterminate')).to.be.false;
          done();
        });
      });
    });

    it('label should be hidden when showPercent is off and label has no text content', function() {
      var progress = new Coral.Progress();
      expect(progress._elements.label.hidden).to.equal(true, 'Label should be hidden');
      expect(progress.$).to.have.class(progress._className + '--noLabel');
    });

    it('label should be visible when showPercent false and label has content', function(done) {
      var progress = new Coral.Progress();
      progress.label.innerHTML = 'Custom content';
      expect(progress._elements.label.style['display']).to.not.equal('none', 'Label should be visible');

      helpers.next(function() {
        expect($(progress._elements.label)).to.be.$visible;
        expect(progress._elements.label.style['display']).to.not.equal('none', 'Label should stay visible');
        done();
      });
    });

    it('should set correct classname when showpercent === false', function(done) {
      var progress = new Coral.Progress();

      helpers.next(function() {
        expect(progress.$, 'should have --noLabel class').to.have.class('coral-Progress--noLabel');
        done();
      });
    });

    it('should set correct classname when showpercent === true', function(done) {
      var progress = new Coral.Progress();
      progress.showPercent = true;

      helpers.next(function() {
        expect(progress.$, 'should not have --noLabel class').to.not.have.class('coral-Progress--noLabel');
        done();
      });
    });

    it('should set the correct classname when switching sizes', function(done) {
      var progress = new Coral.Progress();

      progress.size = Coral.Progress.size.LARGE;
      helpers.next(function() {
        expect(progress.$).to.have.class(progress._className+'--large');
        expect(progress.$).to.not.have.class(progress._className+'--small');
        expect(progress.$).to.not.have.class(progress._className+'--medium');

        progress.size = Coral.Progress.size.SMALL;
        helpers.next(function() {
          expect(progress.$).to.have.class(progress._className+'--small');
          expect(progress.$).to.not.have.class(progress._className+'--medium');
          expect(progress.$).to.not.have.class(progress._className+'--large');

          done();
        });
      });
    });

    it('should accept lowercase size values', function(done) {
      var progress = new Coral.Progress();

      progress.size = 'l';
      helpers.next(function() {
        expect(progress.$).to.have.class(progress._className+'--large');
        expect(progress.$).to.not.have.class(progress._className+'--small');
        expect(progress.$).to.not.have.class(progress._className+'--medium');

        progress.size = 's';
        helpers.next(function() {
          expect(progress.$).to.have.class(progress._className+'--small');
          expect(progress.$).to.not.have.class(progress._className+'--medium');
          expect(progress.$).to.not.have.class(progress._className+'--large');

          done();
        });
      });
    });

    it('should set the correct className when switching label positions', function(done) {
      var progress = new Coral.Progress();
      progress.label.innerHTML = 'something';
      progress.labelPosition = 'right';

      helpers.next(function() {
        expect(progress.$).to.have.class(progress._className+'--rightLabel');
        expect(progress.$).to.not.have.class(progress._className+'--leftLabel');
        expect(progress.$).to.not.have.class(progress._className+'--bottomLabel');

        progress.labelPosition = 'bottom';

        helpers.next(function() {
          expect(progress.$).to.have.class(progress._className+'--bottomLabel');
          expect(progress.$).to.not.have.class(progress._className+'--leftLabel');
          expect(progress.$).to.not.have.class(progress._className+'--rightLabel');

          done();
        });
      });
    });

    it('should set minimum value when value set to null', function() {
      var progress = new Coral.Progress();
      progress.value = 50;

      progress.removeAttribute('value');

      expect(progress.value).to.equal(0);
      expect(progress.hasAttribute('value')).to.be.true;
      expect(progress.getAttribute('value')).to.equal('0');
    });

    it('should set maximum value when value set to greater than maximum', function() {
      var progress = new Coral.Progress();
      progress.value = 1000;

      expect(progress.value).to.equal(100);
    });

    it('should set minimum value when value set to greater than minimum', function() {
      var progress = new Coral.Progress();
      progress.value = -1000;

      expect(progress.value).to.equal(0);
    });

    it('should set value to 0 when mode is indeterminate', function() {
      var progress = new Coral.Progress();

      progress.value = 50;
      expect(progress.value).to.equal(50);

      progress.indeterminate = true;

      expect(progress.value).to.equal(0);

      progress.indeterminate = false;

      expect(progress.value).to.equal(50);
    });
  });

  describe('Accessibility', function() {
    it('should remove relevant ARIA attributes when mode is indeterminate', function(done) {
      var progress = new Coral.Progress();
      expect(progress.hasAttribute('aria-valuenow')).to.be.true;
      expect(progress.hasAttribute('aria-valuemin')).to.be.true;
      expect(progress.hasAttribute('aria-valuemax')).to.be.true;

      progress.indeterminate = true;
      helpers.next(function() {
        expect(progress.hasAttribute('aria-valuenow')).to.be.false;
        expect(progress.hasAttribute('aria-valuemin')).to.be.false;
        expect(progress.hasAttribute('aria-valuemax')).to.be.false;

        progress.indeterminate = false;
        helpers.next(function() {
          expect(progress.hasAttribute('aria-valuenow')).to.be.true;
          expect(progress.hasAttribute('aria-valuemin')).to.be.true;
          expect(progress.hasAttribute('aria-valuemax')).to.be.true;

          done();
        });
      });
    });
  });
});
