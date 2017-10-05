describe('Coral.Wait', function() {
  describe('Namespace', function() {
    it('should define the variants in an enum', function() {
      expect(Coral.Wait.variant).to.exist;
      expect(Coral.Wait.variant.DEFAULT).to.equal('default');
      expect(Coral.Wait.variant.DOTS).to.equal('dots');
      expect(Object.keys(Coral.Wait.variant).length).to.equal(2);
    });
    
    it('should define the sizes in an enum', function() {
      expect(Coral.Wait.size).to.exist;
      expect(Coral.Wait.size.SMALL).to.equal('S');
      expect(Coral.Wait.size.MEDIUM).to.equal('M');
      expect(Coral.Wait.size.LARGE).to.equal('L');
      expect(Object.keys(Coral.Wait.size).length).to.equal(3);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var wait = helpers.build(new Coral.Wait());
      
      expect(wait.classList.contains('coral3-Wait')).to.be.true;
      expect(wait.hasAttribute('centered')).to.be.false;
      expect(wait.hasAttribute('variant')).to.be.true;
      expect(wait.hasAttribute('size')).to.be.true;
      expect(wait.classList.contains('coral3-Wait--centered')).to.be.false;
      expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
      expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
    });
  });
  
  describe('Markup', function() {
    
    describe('#centered', function() {
      
      it('should be initially false', function() {
        var wait = helpers.build('<coral-wait></coral-wait>');
        
        expect(wait.centered).to.be.false;
        expect(wait.hasAttribute('centered')).to.be.false;
      });
      
      it('should set centered', function() {
        var wait = helpers.build('<coral-wait centered></coral-wait>');
        
        expect(wait.centered).to.be.true;
        expect(wait.getAttribute('centered')).to.equal('');
        expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
        expect(wait.classList.contains('coral3-Wait')).to.be.true;
      });
      
      it('should still be centered', function() {
        var wait = helpers.build('<coral-wait centered="false"></coral-wait>');
  
        expect(wait.centered).to.be.true;
        expect(wait.hasAttribute('centered')).to.be.true;
        expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
        expect(wait.classList.contains('coral3-Wait')).to.be.true;
      });
    });
    
    describe('#size', function() {
      
      it('should default to size small', function() {
        var wait = helpers.build('<coral-wait></coral-wait>');
  
        expect(wait.size).to.equal(Coral.Wait.size.SMALL);
        expect(wait.classList.contains('coral3-Wait')).to.be.true;
        expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
        expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
      });
      
      it('should be able to set to large', function() {
        var wait = helpers.build('<coral-wait size="L"></coral-wait>');
        
        expect(wait.size).to.equal(Coral.Wait.size.LARGE);
        expect(wait.classList.contains('coral3-Wait--large')).to.be.true;
        expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
        expect(wait.classList.contains('coral3-Wait')).to.be.true;
      });
      
      it('should be able to set to medium', function() {
        var wait = helpers.build('<coral-wait size="M"></coral-wait>');
        
        expect(wait.size).to.equal(Coral.Wait.size.MEDIUM);
        expect(wait.classList.contains('coral3-Wait--medium')).to.be.true;
        expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
        expect(wait.classList.contains('coral3-Wait')).to.be.true;
      });
    });
    
    describe('#variant', function() {
      
      it('should default to Coral.Wait.variant.DEFAULT', function() {
        var el = helpers.build('<coral-wait></coral-wait>');
        
        expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.classList.contains('coral3-Wait')).to.be.true;
      });
      
      it('should set the new variant', function() {
        var el = helpers.build('<coral-wait variant="dots"></coral-wait>');
        
        expect(el.variant).to.equal('dots');
        expect(el.variant).to.equal(Coral.Wait.variant.DOTS);
        expect(el.getAttribute('variant')).to.equal('dots');
        expect(el.classList.contains('coral3-Wait--dots')).to.be.true;
        expect(el.classList.contains('coral3-Wait')).to.be.true;
      });
      
      it('should not add class for empty variant', function() {
        var el = helpers.build('<coral-wait variant=""></coral-wait>');
  
        expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.classList.contains('coral3-Wait')).to.be.true;
      });
      
      it('should not add class for invalid variant', function() {
        var el = helpers.build('<coral-wait variant="invalidvariant"></coral-wait>');
        
        expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.classList.contains('coral3-Wait')).to.be.true;
      });
      
      it('should remove variant classnames when variant changes', function() {
        var el = helpers.build('<coral-wait variant="dots"></coral-wait>');
  
        expect(el.classList.contains('coral3-Wait--dots')).to.be.true;
        el.variant = Coral.Wait.variant.DEFAULT;
        
        expect(el.classList.contains('coral3-Wait--dots')).to.be.false;
      });
    });
  });
  
  describe('API', function() {
    describe('#centered', function() {
      it('should default to false', function() {
        var wait = new Coral.Wait();
        
        expect(wait.centered).to.be.false;
      });
      
      it('should be centered', function() {
        var wait = new Coral.Wait();
        wait.centered = true;
        
        expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
      });
    });
    
    describe('#size', function() {
      it('should default to small', function() {
        var wait = new Coral.Wait();
        
        expect(wait.size).to.equal(Coral.Wait.size.SMALL);
      });
      
      it('can be set to large', function() {
        var wait = new Coral.Wait();
        wait.size = Coral.Wait.size.LARGE;
        
        expect(wait.classList.contains('coral3-Wait--large')).to.be.true;
        expect(wait.classList.contains('coral3-Wait--medium')).to.be.false;
      });
      
      it('can be set to medium', function() {
        var wait = new Coral.Wait();
        wait.size = Coral.Wait.size.MEDIUM;
        
        expect(wait.classList.contains('coral3-Wait--large')).to.be.false;
        expect(wait.classList.contains('coral3-Wait--medium')).to.be.true;
      });
    });
    
    describe('#hidden', function() {
      it('should default to false', function() {
        var wait = new Coral.Wait();
        
        expect(wait.hidden).to.be.false;
        expect(wait.hasAttribute('hidden')).to.be.false;
      });
      
      it('should hide component on false', function() {
        var wait = helpers.build('<coral3-Wait></coral3-Wait>');
        wait.hidden = true;
        
        expect(wait.hidden).to.be.true;
        expect(wait.hasAttribute('hidden')).to.be.true;
        expect(getComputedStyle(wait).getPropertyValue('display')).to.equal('none');
      });
    });
    
    it('should be able to set large and centered at the same time', function() {
      var wait = new Coral.Wait();
      wait.size = Coral.Wait.size.LARGE;
      wait.centered = true;
      
      expect(wait.size).to.equal(Coral.Wait.size.LARGE);
      expect(wait.centered).to.be.true;
      expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
      expect(wait.classList.contains('coral3-Wait--large')).to.be.true;
    });
    
    it('should be able to set medium and centered at the same time', function() {
      var wait = new Coral.Wait();
      wait.size = Coral.Wait.size.MEDIUM;
      wait.centered = true;
      
      expect(wait.size).to.equal(Coral.Wait.size.MEDIUM);
      expect(wait.centered).to.be.true;
      expect(wait.classList.contains('coral3-Wait--centered')).to.be.true;
      expect(wait.classList.contains('coral3-Wait--medium')).to.be.true;
    });
  });
});
