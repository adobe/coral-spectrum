describe('Coral.Progress', function() {
  describe('Namespace', function() {
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
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<coral-progress>SOME LABEL</coral-progress>');
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.Progress());
    });
  });
  
  describe('API', function() {
    let el = null;
    
    beforeEach(function() {
      el = new Coral.Progress();
    });
    
    afterEach(function() {
      el = null;
    });
    
    describe('#label', function() {
      it('should have a label content zone', function() {
        expect(el.label).not.to.be.null;
      });
    });
    
    describe('#value', function() {
      it('should be equal to 0 by default', function() {
        expect(el.value).to.equal(0);
      });
    });
    
    describe('#indeterminate', function() {
      it('should be false by default', function() {
        expect(el.indeterminate).to.be.false;
      });
    });
  
    describe('#showPercent', function() {
      it('should be false by default', function() {
        expect(el.showPercent).to.be.false;
      });
    });
  
    describe('#size', function() {
      it('should be equal to medium by default', function() {
        expect(el.size).to.equal(Coral.Progress.size.MEDIUM);
      });
    });
  
    describe('#labelPosition', function() {
      it('should be equal to right by default', function() {
        expect(el.labelPosition).to.equal(Coral.Progress.labelPosition.RIGHT);
      });
    });
  });

  describe('Markup', function() {
    describe('#value', function() {
      it('should reflect value changes', function() {
        var progress = helpers.build(new Coral.Progress());
        progress.value = 50;
    
        expect(progress.getAttribute('value')).to.equal('50', 'Attribute value');
        expect(progress.getAttribute('aria-valuenow')).to.equal('50', 'ARIA value');
        expect(progress._elements.status.style.width).to.equal('50%', 'Width of status bar');
      });
  
      it('should set minimum value when value set to null', function() {
        var progress = helpers.build(new Coral.Progress());
        progress.value = 50;
    
        progress.removeAttribute('value');
    
        expect(progress.value).to.equal(0);
        expect(progress.hasAttribute('value')).to.be.true;
        expect(progress.getAttribute('value')).to.equal('0');
      });
  
      it('should set maximum value when value set to greater than maximum', function() {
        var progress = helpers.build(new Coral.Progress());
        progress.value = 1000;
    
        expect(progress.value).to.equal(100);
      });
  
      it('should set minimum value when value set to greater than minimum', function() {
        var progress = helpers.build(new Coral.Progress());
        progress.value = -1000;
    
        expect(progress.value).to.equal(0);
      });
    });
    
    describe('#indeterminate', function() {
      it('should reflect indeterminate state as DOM attribute', function() {
        var progress = helpers.build(new Coral.Progress());
        expect(progress.hasAttribute('indeterminate')).to.be.false;
    
        progress.indeterminate = true;
        expect(progress.hasAttribute('indeterminate')).to.be.true;

        progress.indeterminate = false;
        expect(progress.hasAttribute('indeterminate')).to.be.false;
      });
  
      it('should set value to 0 when mode is indeterminate', function() {
        var progress = helpers.build(new Coral.Progress());
    
        progress.value = 50;
        expect(progress.value).to.equal(50);
    
        progress.indeterminate = true;
    
        expect(progress.value).to.equal(0);
    
        progress.indeterminate = false;
    
        expect(progress.value).to.equal(50);
      });
    });
    
    describe('#label', function() {
      it('should move child text content into the label content zone', function() {
        var progress = helpers.build('<coral-progress>SOME LABEL</coral-progress>');
    
        var contentNodeValue = progress.label.textContent;
        expect(contentNodeValue).to.equal('SOME LABEL');
      });
    });
    
    describe('#showPercent', function() {
      it('label should be hidden when showPercent is off and label has no text content', function() {
        var progress = helpers.build(new Coral.Progress());
        expect(progress._elements.label.hidden).to.equal(true, 'Label should be hidden');
        expect(progress.classList.contains('coral3-Progress--noLabel')).to.be.true;
      });
  
      it('label should be visible when showPercent false and label has content', function() {
        var progress = helpers.build(new Coral.Progress());
        progress.label.innerHTML = 'Custom content';
        expect(progress._elements.label.style['display']).to.not.equal('none', 'Label should be visible');
        expect(progress._elements.label.style['display']).to.not.equal('none', 'Label should stay visible');
      });
  
      it('should set correct classname when showpercent === false', function() {
        var progress = helpers.build(new Coral.Progress());
        expect(progress.classList.contains('coral3-Progress--noLabel'), 'should have --noLabel class').to.be.true;
      });
  
      it('should set correct classname when showpercent === true', function() {
        var progress = helpers.build(new Coral.Progress());
        progress.showPercent = true;
        
        expect(progress.classList.contains('coral3-Progress--noLabel'), 'should not have --noLabel class').to.be.false;
      });
    });
    
    describe('#size', function() {
      it('should set the correct classname when switching sizes', function() {
        var progress = helpers.build(new Coral.Progress());
  
        progress.size = Coral.Progress.size.LARGE;
  
        expect(progress.classList.contains('coral3-Progress--large')).to.be.true;
        expect(progress.classList.contains('coral3-Progress--small')).to.be.false;
        expect(progress.classList.contains('coral3-Progress--medium')).to.be.false;
  
        progress.size = Coral.Progress.size.SMALL;
  
        expect(progress.classList.contains('coral3-Progress--small')).to.be.true;
        expect(progress.classList.contains('coral3-Progress--medium')).to.be.false;
        expect(progress.classList.contains(progress._className+'--large')).to.be.false;
      });
  
      it('should accept lowercase size values', function() {
        var progress = helpers.build(new Coral.Progress());
        progress.size = 'l';
  
        expect(progress.classList.contains('coral3-Progress--large')).to.be.true;
        expect(progress.classList.contains('coral3-Progress--small')).to.be.false;
        expect(progress.classList.contains('coral3-Progress--medium')).to.be.false;
  
        progress.size = 's';
  
        expect(progress.classList.contains('coral3-Progress--small')).to.be.true;
        expect(progress.classList.contains('coral3-Progress--medium')).to.be.false;
        expect(progress.classList.contains(progress._className+'--large')).to.be.false;
      });
    });
    
    describe('#labelPosition', function() {
      it('should set the correct className when switching label positions', function() {
        var progress = new Coral.Progress();
        progress.label.innerHTML = 'something';
        progress.labelPosition = 'right';
  
        expect(progress.classList.contains('coral3-Progress--rightLabel')).to.be.true;
        expect(progress.classList.contains('coral3-Progress--leftLabel')).to.be.false;
        expect(progress.classList.contains('coral3-Progress--bottomLabel')).to.be.false;
  
        progress.labelPosition = 'bottom';
  
        expect(progress.classList.contains('coral3-Progress--bottomLabel')).to.be.true;
        expect(progress.classList.contains('coral3-Progress--leftLabel')).to.be.false;
        expect(progress.classList.contains(progress._className+'--rightLabel')).to.be.false;
      });
    });
  });

  describe('Accessibility', function() {
    it('should remove relevant ARIA attributes when mode is indeterminate', function() {
      var progress = helpers.build(new Coral.Progress());
      expect(progress.hasAttribute('aria-valuenow')).to.be.true;
      expect(progress.hasAttribute('aria-valuemin')).to.be.true;
      expect(progress.hasAttribute('aria-valuemax')).to.be.true;
  
      progress.indeterminate = true;
  
      expect(progress.hasAttribute('aria-valuenow')).to.be.false;
      expect(progress.hasAttribute('aria-valuemin')).to.be.false;
      expect(progress.hasAttribute('aria-valuemax')).to.be.false;
  
      progress.indeterminate = false;
  
      expect(progress.hasAttribute('aria-valuenow')).to.be.true;
      expect(progress.hasAttribute('aria-valuemin')).to.be.true;
      expect(progress.hasAttribute('aria-valuemax')).to.be.true;
    });
  });
});
