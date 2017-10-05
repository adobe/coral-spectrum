describe('Coral.RangedSlider', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('RangedSlider');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent(window.__html__['Coral.RangedSlider.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.RangedSlider());
    });
  });

  describe('API', function() {
    var el;
    var spy;

    beforeEach(function() {
      el = helpers.build(new Coral.RangedSlider());
      el.startValue = '0';
      el.endValue = '100';
    });

    afterEach(function() {
      el = null;
    });

    describe('#filled', function() {
      it('should default to true', function() {
        expect(el.filled).to.be.true;
        
        expect(el._elements.fillHandle.classList.contains('is-hidden')).to.be.false;
      });

      it('should not be settable', function() {
        let warn = console.warn;
        
        console.warn = () => {
          // Override it to prevent spamming the console
        };
        
        el.filled = false;
        
        expect(el.filled).to.be.true;
        expect(el._elements.fillHandle.classList.contains('is-hidden')).to.be.false;
  
        // Restore warn
        console.warn = warn;
      });
    });

    describe('#step', function() {
      it('should default to 1', function() {
        expect(el.step).to.equal(1);
      });

      it('should be ignored if the input is not a number', function() {
        el.step = 99;
        expect(el.step).to.equal(99);
        el.step = 'cats';
        expect(el.step).to.equal(99);
        expect(el.getAttribute('step')).to.equal('99');
      });

      it('should ignore invalid numeric values', function() {
        el.step = 0;
        expect(el.step).to.equal(1);
        expect(el.getAttribute('step')).to.equal('1');
      });

      it('should ignore negative values', function() {
        el.step = -3;
        expect(el.step).to.equal(1);
        expect(el.getAttribute('step')).to.equal('1');
      });
    });

    describe('#startValue', function() {
      it('should correctly set the input value', function() {
        el.startValue = '20';
        expect(el._elements.inputs[0].value).to.equal('20');
      });

      it('should correctly snap input values to the nearest step', function() {
        el.min = 0;
        el.max = 100;
        el.step = 10;

        var setValue = 27;
        var expectedSnap = 30;

        el.startValue = setValue;
        
        expect(el._elements.inputs[0].value).to.equal(String(expectedSnap));
      });

      it('should not trigger a change event on the input field', function() {
        spy = sinon.spy();

        el.on('change', spy);

        el.startValue = '20';
        
        expect(spy.callCount).to.equal(0);
      });
    });

    describe('#endValue', function() {
      it('should correctly set the input value', function() {
        el.endValue = '70';
        expect(el._elements.inputs[1].value).to.equal('70');
      });

      it('should correctly snap input values to the nearest step', function() {
        el.min = 0;
        el.max = 100;
        el.step = 10;

        var setValue = 87;
        var expectedSnap = 90;

        el.endValue = setValue;
        
        expect(el._elements.inputs[1].value).to.equal(String(expectedSnap));
      });

      it('should not trigger a change event on the input field', function() {
        spy = sinon.spy();

        el.on('change', spy);

        el.endValue = '50';
        
        expect(spy.callCount).to.equal(0);
      });
    });

    describe('#value', function() {
      it('should correctly set the input value', function() {
        var value = 20; // Choose step point, otherwise it would be adjusted
        el.value = value;

        expect(el._elements.inputs[0].value).to.equal(String(value));
      });

      it('should be equivalent to startValue', function() {
        el.value = '20'; // Choose step point, otherwise it would be adjusted
        
        expect(el.value).to.equal(el.startValue);
      });

      it('should correctly snap input values to the nearest step', function() {
        el.min = 0;
        el.max = 100;
        el.step = 10;

        var setValue = 27;
        var expectedSnap = 30;

        el.value = setValue;
        
        expect(el._elements.inputs[0].value).to.equal(String(expectedSnap));
      });

      it('should not trigger a change event on the input field', function() {
        spy = sinon.spy();

        el.on('change', spy);

        el.value = 20;
        
        expect(spy.callCount).to.equal(0);
      });
    });

    describe('#values', function() {
      it('should correctly set declared input value of a range input', function() {
        var firstValue = 30;
        var secondValue = 80; // Choose step points, otherwise they would be adjusted

        el.values = [firstValue, secondValue];
        
        expect(el._elements.inputs[0].value).to.equal(String(firstValue));
        expect(el._elements.inputs[1].value).to.equal(String(secondValue))
      });
    });

    describe('#tooltips', function() {
      it('should default to false', function() {
        expect(el.tooltips).to.equal(false);
      });

      it('should be settable', function() {
        el.tooltips = true;

        var tooltips = el.querySelectorAll('coral-tooltip');
        var handles = el.querySelectorAll('.coral3-Slider-handle');

        expect(tooltips.length).to.equal(handles.length);
      });
    });
  });

  // section used for compliance since the current one does not follow test conventions
  describe('Implementation Details (compliance)', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.RangedSlider.values.html'], {
        value: '50',
        default: '1'
      });
    });
  });
});
