describe('Coral.Wait', function() {
  
  describe('Namespace', function() {
    it('should define the variants in an enum', function() {
      expect(Coral.Wait.variant).to.exist;
      expect(Coral.Wait.variant.DEFAULT).to.equal('default');
      expect(Coral.Wait.variant.MONOCHROME).to.equal('monochrome');
      expect(Coral.Wait.variant.DOTS).to.equal('dots');
      expect(Object.keys(Coral.Wait.variant).length).to.equal(3);
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
      
      expect(wait.classList.contains('_coral-Loader')).to.be.true;
      expect(wait.hasAttribute('centered')).to.be.false;
      expect(wait.hasAttribute('variant')).to.be.true;
      expect(wait.hasAttribute('size')).to.be.true;
      expect(wait.classList.contains('_coral-Loader--centered')).to.be.false;
      expect(wait.classList.contains('_coral-Loader--large')).to.be.false;
      expect(wait.classList.contains('_coral-Loader--medium')).to.be.false;
    });
  });
  
  describe('API', function() {
    describe('#centered', function() {
      it('should default to false', function() {
        var wait = new Coral.Wait();
        
        expect(wait.centered).to.be.false;
      });
      
      it('should be centered', function() {
        var wait = helpers.build(new Coral.Wait());
        wait.centered = true;
        
        expect(wait.classList.contains('_coral-Loader--centered')).to.be.true;
      });
  
      it('should not be centered', function() {
        var wait = helpers.build(new Coral.Wait());
        wait.centered = true;
        wait.centered = false;
  
        expect(wait.classList.contains('_coral-Loader--centered')).to.be.false;
      });
    });
    
    describe('#size', function() {
      it('should default to medium', function() {
        var wait = new Coral.Wait();
        
        expect(wait.size).to.equal(Coral.Wait.size.MEDIUM);
      });
      
      it('can be set to large', function() {
        var wait = new Coral.Wait();
        wait.size = Coral.Wait.size.LARGE;
        
        expect(wait.classList.contains('_coral-Loader--large')).to.be.true;
      });
      
      it('can be set to small', function() {
        var wait = new Coral.Wait();
        wait.size = Coral.Wait.size.SMALL;
        
        expect(wait.classList.contains('_coral-Loader--small')).to.be.true;
      });
    });
  
    describe('#value', function() {
      it('should reflect value changes', function() {
        var wait = new Coral.Wait();
        wait.value = 50;
      
        expect(wait.getAttribute('value')).to.equal('50');
        expect(wait.getAttribute('aria-valuenow')).to.equal('50');
      });
    
      it('should set minimum value when value set to null', function() {
        var wait = new Coral.Wait();
        wait.value = 50;
  
        wait.removeAttribute('value');
      
        expect(wait.value).to.equal(0);
        expect(wait.hasAttribute('value')).to.be.true;
        expect(wait.getAttribute('value')).to.equal('0');
      });
    
      it('should set maximum value when value set to greater than maximum', function() {
        var wait = new Coral.Wait();
        wait.value = 1000;
      
        expect(wait.value).to.equal(100);
      });
    
      it('should set minimum value when value set to greater than minimum', function() {
        var wait = new Coral.Wait();
        wait.value = -1000;
      
        expect(wait.value).to.equal(0);
      });
    });
    
    describe('#indeterminate', function() {
      it('should be false by default', function() {
        expect(new Coral.Wait().indeterminate).to.be.false;
      });
  
      it('should be true if no value is set', function() {
        var wait = helpers.build(new Coral.Wait());
        
        expect(wait.indeterminate).to.be.true;
      });
  
      it('should be false if value is set', function() {
        var wait = new Coral.Wait();
        wait.value = 10;
    
        helpers.build(wait);
        
        expect(wait.indeterminate).to.be.false;
      });
      
      it('should set value to 0 when mode is indeterminate', function() {
        var wait = new Coral.Wait();
        
        wait.value = 50;
        expect(wait.value).to.equal(50);
  
        wait.indeterminate = true;
        expect(wait.value).to.equal(0);
  
        wait.indeterminate = false;
        expect(wait.value).to.equal(50);
      });
      
      it('should remove value specific attributes', function() {
        var wait = helpers.build(new Coral.Wait());
        
        wait.indeterminate = true;
        
        expect(wait.hasAttribute('aria-valuenow')).to.be.false;
        expect(wait.hasAttribute('aria-valuemin')).to.be.false;
        expect(wait.hasAttribute('aria-valuemax')).to.be.false;
        expect(wait.style.backgroundPosition).to.equal('');
      });
    });
  });
  
  describe('Markup', function() {
    
    describe('#centered', function() {
      
      it('should be initially false', function() {
        var wait = helpers.build('<coral-wait></coral-wait>');
        
        expect(wait.centered).to.be.false;
        expect(wait.hasAttribute('centered')).to.be.false;
        expect(wait.classList.contains('_coral-Loader--centered')).to.be.false;
      });
      
      it('should set centered', function() {
        var wait = helpers.build('<coral-wait centered></coral-wait>');
        
        expect(wait.centered).to.be.true;
        expect(wait.getAttribute('centered')).to.equal('');
        expect(wait.classList.contains('_coral-Loader')).to.be.true;
        expect(wait.classList.contains('_coral-Loader--centered')).to.be.true;
      });
      
      it('should still be centered', function() {
        var wait = helpers.build('<coral-wait centered="false"></coral-wait>');
  
        expect(wait.centered).to.be.true;
        expect(wait.hasAttribute('centered')).to.be.true;
        expect(wait.classList.contains('_coral-Loader')).to.be.true;
        expect(wait.classList.contains('_coral-Loader--centered')).to.be.true;
      });
    });
    
    describe('#size', function() {
      
      it('should default to medium small', function() {
        var wait = helpers.build('<coral-wait></coral-wait>');
  
        expect(wait.size).to.equal(Coral.Wait.size.MEDIUM);
        expect(wait.classList.contains('_coral-Loader')).to.be.true;
        expect(wait.classList.contains('_coral-Loader--large')).to.be.false;
        expect(wait.classList.contains('_coral-Loader--medium')).to.be.false;
      });
      
      it('should be able to set to large', function() {
        var wait = helpers.build('<coral-wait size="L"></coral-wait>');
        
        expect(wait.size).to.equal(Coral.Wait.size.LARGE);
        expect(wait.classList.contains('_coral-Loader--large')).to.be.true;
        expect(wait.classList.contains('_coral-Loader--medium')).to.be.false;
        expect(wait.classList.contains('_coral-Loader')).to.be.true;
      });
      
      it('should be able to set to medium', function() {
        var wait = helpers.build('<coral-wait size="M"></coral-wait>');
        
        expect(wait.size).to.equal(Coral.Wait.size.MEDIUM);
        expect(wait.classList.contains('_coral-Loader--large')).to.be.false;
        expect(wait.classList.contains('_coral-Loader--small')).to.be.false;
        expect(wait.classList.contains('_coral-Loader')).to.be.true;
      });
    });
    
    describe('#variant', function() {
      
      it('should default to Coral.Wait.variant.DEFAULT', function() {
        var el = helpers.build('<coral-wait></coral-wait>');
        
        expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.classList.contains('_coral-Loader')).to.be.true;
      });
      
      it('should set the new variant', function() {
        var el = helpers.build('<coral-wait variant="monochrome"></coral-wait>');
        
        expect(el.variant).to.equal('monochrome');
        expect(el.variant).to.equal(Coral.Wait.variant.MONOCHROME);
        expect(el.getAttribute('variant')).to.equal('monochrome');
        expect(el.classList.contains('_coral-Loader--fullpage')).to.be.true;
        expect(el.classList.contains('_coral-Loader')).to.be.true;
      });
      
      it('should not add class for empty variant', function() {
        var el = helpers.build('<coral-wait variant=""></coral-wait>');
  
        expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.classList.contains('_coral-Loader')).to.be.true;
      });
      
      it('should not add class for invalid variant', function() {
        var el = helpers.build('<coral-wait variant="invalidvariant"></coral-wait>');
        
        expect(el.variant).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.getAttribute('variant')).to.equal(Coral.Wait.variant.DEFAULT);
        expect(el.classList.contains('_coral-Loader')).to.be.true;
      });
      
      it('should remove variant classnames when variant changes', function() {
        var el = helpers.build('<coral-wait variant="monochrome"></coral-wait>');
  
        expect(el.classList.contains('_coral-Loader--fullpage')).to.be.true;
        el.variant = Coral.Wait.variant.DEFAULT;
        
        expect(el.classList.contains('_coral-Loader--fullpage')).to.be.false;
      });
    });
  });
  
  describe('Events', function() {
    it('#coral-wait:change', function() {
      it('should trigger when changing the value', function() {
        const spy = sinon.spy();
        const el = new Coral.Wait();
        el.on('coral-wait:change', spy);
        
        el.value = 30;
        expect(spy.callCount).to.equal(1);
      });
    });
  });
});
