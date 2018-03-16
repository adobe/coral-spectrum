import {helpers} from '/coralui-util/src/tests/helpers';
import {Progress} from '/coralui-component-progress';

describe('Progress', function() {
  describe('Namespace', function() {
    it('should define the sizes in an enum', function() {
      expect(Progress.size).to.exist;
      expect(Progress.size.SMALL).to.equal('S');
      expect(Progress.size.MEDIUM).to.equal('M');
      expect(Progress.size.LARGE).to.equal('L');
      expect(Object.keys(Progress.size).length).to.equal(3);
    });
  
    it('should define the labelPosition in an enum', function() {
      expect(Progress.labelPosition).to.exist;
      expect(Progress.labelPosition.LEFT).to.equal('left');
      expect(Progress.labelPosition.RIGHT).to.equal('right');
      expect(Progress.labelPosition.SIDE).to.equal('side');
      expect(Progress.labelPosition.BOTTOM).to.equal('bottom');
      expect(Object.keys(Progress.labelPosition).length).to.equal(4);
    });
  
    it('should define the variant in an enum', function() {
      expect(Progress.variant).to.exist;
      expect(Progress.variant.DEFAULT).to.equal('default');
      expect(Progress.variant.MONOCHROME).to.equal('monochrome');
      expect(Object.keys(Progress.variant).length).to.equal(2);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone using markup', function() {
      helpers.cloneComponent('<coral-progress>SOME LABEL</coral-progress>');
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Progress());
    });
  });
  
  describe('API', function() {
    let el = null;
    
    beforeEach(function() {
      el = new Progress();
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
        expect(el.size).to.equal(Progress.size.MEDIUM);
      });
    });
  
    describe('#labelPosition', function() {
      it('should be equal to left by default', function() {
        expect(el.labelPosition).to.equal(Progress.labelPosition.LEFT);
      });
    });
  });

  describe('Markup', function() {
    describe('#value', function() {
      it('should reflect value changes', function() {
        var progress = helpers.build(new Progress());
        progress.value = 50;
    
        expect(progress.getAttribute('value')).to.equal('50', 'Attribute value');
        expect(progress.getAttribute('aria-valuenow')).to.equal('50', 'ARIA value');
        expect(progress._elements.status.style.width).to.equal('50%', 'Width of status bar');
      });
  
      it('should set minimum value when value set to null', function() {
        var progress = helpers.build(new Progress());
        progress.value = 50;
    
        progress.removeAttribute('value');
    
        expect(progress.value).to.equal(0);
        expect(progress.hasAttribute('value')).to.be.true;
        expect(progress.getAttribute('value')).to.equal('0');
      });
  
      it('should set maximum value when value set to greater than maximum', function() {
        var progress = helpers.build(new Progress());
        progress.value = 1000;
    
        expect(progress.value).to.equal(100);
      });
  
      it('should set minimum value when value set to greater than minimum', function() {
        var progress = helpers.build(new Progress());
        progress.value = -1000;
    
        expect(progress.value).to.equal(0);
      });
    });
    
    describe('#indeterminate', function() {
      it('should reflect indeterminate state as DOM attribute', function() {
        var progress = helpers.build(new Progress());
        expect(progress.hasAttribute('indeterminate')).to.be.false;
    
        progress.indeterminate = true;
        expect(progress.hasAttribute('indeterminate')).to.be.true;

        progress.indeterminate = false;
        expect(progress.hasAttribute('indeterminate')).to.be.false;
      });
  
      it('should set value to 0 when mode is indeterminate', function() {
        var progress = helpers.build(new Progress());
    
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
  
      it('should not be visible if it has no content', function() {
        var progress = helpers.build(new Progress());
        expect(progress._elements.label.style.visibility).to.equal('hidden', 'Label should be hidden');
        expect(progress._elements.label.getAttribute('aria-hidden')).to.equal('true');
      });
  
      it('should be visible if it has content', function(done) {
        var progress = helpers.build(new Progress());
        progress.label.innerHTML = 'Custom content';
        
        // Wait for MO
        helpers.next(function() {
          expect(progress._elements.label.style.visibility).to.equal('visible', 'Label should be visible');
          expect(progress._elements.label.getAttribute('aria-hidden')).to.equal('false');
          
          done();
        });
      });
  
      it('should not be hidden if it has content and is side positioned', function() {
        var progress = helpers.build(new Progress());
        progress.label.innerHTML = 'Custom content';
        progress.labelPosition = 'side';
        
        expect(progress._elements.label.hidden).to.be.false;
      });
  
      it('should be hidden if it has no content and is side positioned', function() {
        var progress = helpers.build(new Progress());
        progress.labelPosition = 'side';
    
        expect(progress._elements.label.hidden).to.be.true;
      });
    });
    
    describe('#showPercent', function() {
      it('should be not be visible if not set', function() {
        var progress = helpers.build(new Progress());
  
        expect(progress._elements.percentage.style.visibility).to.equal('hidden', 'Percentage should be hidden');
        expect(progress._elements.percentage.getAttribute('aria-hidden')).to.equal('true');
      });
      
      it('should be visible if set', function() {
        var progress = helpers.build(new Progress());
        progress.showPercent = true;
  
        expect(progress._elements.percentage.style.visibility).to.equal('visible', 'Percentage should be visible');
        expect(progress._elements.percentage.getAttribute('aria-hidden')).to.equal('false');
      });
  
      it('should not be hidden if it is set and is side positioned', function() {
        var progress = helpers.build(new Progress());
        progress.labelPosition = 'side';
        progress.showPercent = true;
    
        expect(progress._elements.percentage.hidden).to.be.false;
      });
  
      it('should be hidden if it no content and is side positioned', function() {
        var progress = helpers.build(new Progress());
        progress.labelPosition = 'side';
    
        expect(progress._elements.percentage.hidden).to.be.true;
      });
    });
    
    describe('#size', function() {
      it('should set the correct classname when switching sizes', function() {
        var progress = helpers.build(new Progress());
  
        progress.size = Progress.size.SMALL;
        expect(progress.classList.contains('_coral-Loader--bar--small')).to.be.true;
      });
  
      it('should accept lowercase size values', function() {
        var progress = helpers.build(new Progress());
        
        progress.size = 's';
        expect(progress.classList.contains('_coral-Loader--bar--small')).to.be.true;
      });
    });
    
    describe('#labelPosition', function() {
      it('should switch label with percentage', function() {
        var progress = new Progress();
        
        progress.labelPosition = 'right';
        ['percentage', 'label', 'bar'].forEach((el, i) => {
          expect(progress._elements[el].style.order).to.equal(i.toString());
        });
        
        progress.labelPosition = 'left';
        ['label', 'percentage', 'bar'].forEach((el, i) => {
          expect(progress._elements[el].style.order).to.equal(i.toString());
        });
  
        progress.labelPosition = 'side';
        ['label', 'bar', 'percentage'].forEach((el, i) => {
          expect(progress._elements[el].style.order).to.equal(i.toString());
        });
      });
    });
  });
  
  describe('Events', function() {
    it('#coral-progress:change', function() {
      it('should trigger when changing the value', function() {
        const spy = sinon.spy();
        const el = new Progress();
        el.on('coral-progress:change', spy);
        el.value = 30;
        expect(spy.callCount).to.equal(1);
      });
    });
  });

  describe('Accessibility', function() {
    it('should remove relevant ARIA attributes when mode is indeterminate', function() {
      var progress = helpers.build(new Progress());
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
