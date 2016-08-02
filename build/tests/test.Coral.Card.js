describe('Coral.Card', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Card');
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Card.variant).to.exist;
      expect(Coral.Card.variant.DEFAULT).to.equal('default');
      expect(Coral.Card.variant.CONDENSED).to.equal('condensed');
      expect(Coral.Card.variant.INVERTED).to.equal('inverted');
      expect(Coral.Card.variant.ASSET).to.equal('asset');
      expect(Object.keys(Coral.Card.variant).length).to.equal(4);
    });
  });

  describe('API', function() {
    describe('#asset', function() {});

    describe('#content', function() {});

    describe('#assetheight', function() {});

    describe('#assetwidth', function() {});

    describe('#colorhint', function() {});

    describe('#image', function() {});

    describe('#info', function() {});

    describe('#overlay', function() {});

    describe('#stacked', function() {});

    describe('#variant', function() {});
  });

  describe('Markup', function() {
    describe('#asset', function() {});

    describe('#assetheight', function() {});

    describe('#assetwidth', function() {});

    describe('#colorhint', function() {});

    describe('#content', function() {
      // @todo: it should copy everything to the default content zone
    });

    describe('#hidden', function() {

      it('should hide component on false', function(done) {
        var markup = '<coral-card hidden></coral-card>';
        helpers.build(markup, function(el) {
          expect(el.$).to.have.css('display', 'none');
          expect(el.$).to.have.attr('hidden');
          done();
        });
      });
    });

    describe('#info', function() {});

    describe('#overlay', function() {
      // @todo: it should make the overlay optional
    });

    describe('#stacked', function() {});

    describe('#variant', function() {
      it('should be initially Coral.Card.variant.DEFAULT', function(done) {
        helpers.build(window.__html__['Coral.Card.base.html'], function(el) {
          expect(el.variant).to.equal(Coral.Card.variant.DEFAULT);
          expect(el.$).not.to.have.attr('variant');
          done();
        });
      });

      it('should set the new variant', function(done) {
        helpers.build(window.__html__['Coral.Card.variant.condensed.html'], function(el) {
          expect(el.variant).to.equal(Coral.Card.variant.CONDENSED);
          expect(el.$).to.have.attr('variant', 'condensed');

          helpers.next(function() {
            expect(el.$).to.have.class('coral-Card--condensed');
            expect(el.$).to.have.class('coral-Card');
            done();
          });
        });
      });
    });
  });

  // @todo: test multiple images loaded
  // @todo: test cached images
  describe('Implementation Details', function() {});
});
