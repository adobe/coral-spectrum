describe('Coral.Wait', function() {
  'use strict';


  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Wait');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Wait.variant).to.exist;
      expect(Coral.Wait.variant.DEFAULT).to.equal('default');
      expect(Coral.Wait.variant.DOTS).to.equal('dots');
      expect(Object.keys(Coral.Wait.variant).length).to.equal(2);
    });
  });

  describe('instantiation', function() {
    it('should be possible using new', function(done) {
      var wait = new Coral.Wait();
      expect(wait.$).to.have.class('coral-Wait');

      helpers.next(function() {
        expect(wait.$).not.to.have.attr('centered');
        expect(wait.$).not.to.have.attr('variant');
        expect(wait.$).not.to.have.attr('size');
        expect(wait.$).not.to.have.class('coral-Wait--centered');
        expect(wait.$).not.to.have.class('coral-Wait--large');
        done();
      });
    });
  });

  describe('markup', function() {

    describe('centered attribute', function() {

      it('should be initially false', function(done) {
        var markup = '<coral-wait></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.centered).to.be.false;
          expect(wait.$).not.to.have.attr('centered');
          done();
        });
      });

      it('should set centered', function(done) {
        var markup = '<coral-wait centered></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.centered).to.be.true;
          expect(wait.$).to.have.attr('centered', '');
          expect(wait.$).to.have.class('coral-Wait--centered');
          expect(wait.$).to.have.class('coral-Wait');
          done();
        });
      });

      it('should transform centered to html5 attribute boolean', function(done) {
        var markup = '<coral-wait centered="false"></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.centered).to.be.true;
          expect(wait.$).to.have.attr('centered', '');
          expect(wait.$).to.have.class('coral-Wait--centered');
          expect(wait.$).to.have.class('coral-Wait');
          done();
        });
      });
    });

    describe('size attribute', function() {

      it('should default to size small', function(done) {
        var markup = '<coral-wait></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.size).to.equal(Coral.Wait.size.SMALL);
          expect(wait.$).to.have.class('coral-Wait');
          expect(wait.$).to.not.have.class('coral-Wait--large');
          done();
        });
      });

      it('should be able to set to large', function(done) {
        var markup = '<coral-wait size="L"></coral-wait>';
        helpers.build(markup, function(wait) {
          expect(wait.size).to.equal(Coral.Wait.size.LARGE);
          expect(wait.$).to.have.class('coral-Wait--large');
          expect(wait.$).to.have.class('coral-Wait');
          done();
        });
      });
    });

    describe('#variant', function() {

      it('should default to Coral.Wait.variant.DEFAULT', function(done) {
        var markup = '<coral-wait></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
          expect(el.$).not.to.have.attr('variant');
          expect(el.$).to.have.class('coral-Wait');
          done();
        });
      });

      it('should set the new variant', function(done) {
        var markup = '<coral-wait variant="dots"></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal('dots');
          expect(el.variant).to.equal(Coral.Wait.variant.DOTS);
          expect(el.$).to.have.attr('variant', 'dots');
          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(el.$).to.have.class('coral-Wait--dots');
            expect(el.$).to.have.class('coral-Wait');
            done();
          });
        });
      });

      it('should not add class for empty variant', function(done) {
        var markup = '<coral-wait variant=""></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
          expect(el.$).to.have.attr('variant', '');
          expect(el.$).to.have.class('coral-Wait');
          done();
        });
      });

      it('should not add class for invalid variant', function(done) {
        var markup = '<coral-wait variant="invalidvariant"></coral-wait>';
        helpers.build(markup, function(el) {
          expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
          expect(el.$).to.have.attr('variant', 'invalidvariant');
          expect(el.$).to.have.class('coral-Wait');
          done();
        });
      });

      it('should remove variant classnames when variant changes', function(done) {
        var markup = '<coral-wait variant="dots"></coral-wait>';
        helpers.build(markup, function(el) {

          expect(el.$).to.have.class('coral-Wait--dots');

          el.variant = Coral.Wait.variant.DEFAULT;

          // these need an extra frame to pass in IE11
          helpers.next(function() {
            expect(el.$).not.to.have.class('coral-Wait--dots');
            done();
          });
        });
      });
    });
  });

  describe('API', function() {
    describe('#centered', function() {
      it('should default to false', function(done) {
        var wait = new Coral.Wait();
        expect(wait.centered).to.be.false;
        expect(wait.className).to.equal('coral-Wait');

        helpers.next(function() {
          expect(wait.$).not.to.have.class('coral-Wait--centered');
          expect(wait.$).to.have.class('coral-Wait');
          done();
        });
      });

      it('should be centered', function(done) {
        var wait = new Coral.Wait();
        wait.centered = true;

        helpers.next(function() {
          expect(wait.$).to.have.class('coral-Wait--centered');
          expect(wait.$).to.have.class('coral-Wait');
          done();
        });
      });
    });

    describe('#size', function() {
      it('should default to small', function(done) {
        var wait = new Coral.Wait();
        expect(wait.size).to.equal(Coral.Wait.size.SMALL);
        expect(wait.className).to.equal('coral-Wait');

        helpers.next(function() {
          expect(wait.$).not.to.have.class('coral-Wait--large');
          expect(wait.$).to.have.class('coral-Wait');
          done();
        });
      });

      it('can be set to large', function(done) {
        var wait = new Coral.Wait();
        wait.size = Coral.Wait.size.LARGE;

        helpers.next(function() {
          expect(wait.$).to.have.class('coral-Wait--large');
          expect(wait.$).to.have.class('coral-Wait');
          done();
        });
      });
    });

    describe('#hidden', function() {
      it('should default to false', function() {
        var wait = new Coral.Wait();
        expect(wait.hidden).to.be.false;
        expect(wait.$).not.to.have.attr('hidden');
      });

      it('should hide component on false', function(done) {
        var waitFragment = '<coral-Wait></coral-Wait>';
        helpers.build(waitFragment, function(wait) {
          wait.hidden = true;
          expect(wait.hidden).to.be.true;

          helpers.next(function() {
            expect(wait.$).to.have.attr('hidden');
            expect(wait.$).to.have.css('display', 'none');
            done();
          });
        });
      });
    });

    it('should be able to set large and centered at the same time', function(done) {
      var wait = new Coral.Wait();
      wait.size = Coral.Wait.size.LARGE;
      wait.centered = true;
      expect(wait.size).to.equal(Coral.Wait.size.LARGE);
      expect(wait.centered).to.be.true;

      helpers.next(function() {
        expect(wait.$).to.have.class('coral-Wait--centered');
        expect(wait.$).to.have.class('coral-Wait--large');
        expect(wait.$).to.have.class('coral-Wait');
        done();
      });
    });
  });
});
