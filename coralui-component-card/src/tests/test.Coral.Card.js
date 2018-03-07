describe('Coral.Card', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Card');
      expect(Coral.Card).to.have.property('Context');
      expect(Coral.Card).to.have.property('Description');
      expect(Coral.Card).to.have.property('Title');
      expect(Coral.Card).to.have.property('Property');
      expect(Coral.Card).to.have.property('Asset');
      expect(Coral.Card).to.have.property('Overlay');
      expect(Coral.Card).to.have.property('Info');
      expect(Coral.Card).to.have.property('Content');
      expect(Coral.Card).to.have.property('PropertyList');
      expect(Coral.Card.Property).to.have.property('Content');
      expect(Coral.Card).to.have.property('Banner');
      expect(Coral.Card.Banner).to.have.property('Header');
      expect(Coral.Card.Banner).to.have.property('Content');
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
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.Card.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.Card());
    });
  });

  describe('API', function() {
    describe('#banner', function() {});
    
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
    describe('#banner', function() {});
    
    describe('#asset', function() {});

    describe('#assetheight', function() {});

    describe('#assetwidth', function() {});

    describe('#colorhint', function() {});

    describe('#content', function() {
      // @todo: it should copy everything to the default content zone
    });

    describe('#info', function() {});

    describe('#overlay', function() {
      // @todo: it should make the overlay optional
    });

    describe('#stacked', function() {});

    describe('#variant', function() {
      it('should be initially Coral.Card.variant.DEFAULT', function() {
        const el = helpers.build(window.__html__['Coral.Card.base.html']);
        expect(el.variant).to.equal(Coral.Card.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Coral.Card.variant.DEFAULT);
      });

      it('should set the new variant', function() {
        const el = helpers.build(window.__html__['Coral.Card.variant.condensed.html']);
        expect(el.variant).to.equal(Coral.Card.variant.CONDENSED);
        expect(el.getAttribute('variant')).to.equal('condensed');
        
        expect(el.classList.contains('_coral-Card--condensed')).to.be.true;
        expect(el.classList.contains('_coral-Card')).to.be.true;
      });
    });
  });

  // @todo: test multiple images loaded
  // @todo: test cached images
  describe('Implementation Details', function() {});
});
