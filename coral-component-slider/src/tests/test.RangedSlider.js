import {helpers} from '../../../coral-utils/src/tests/helpers';
import {RangedSlider} from '../../../coral-component-slider';

describe('RangedSlider', function() {
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['RangedSlider.base.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new RangedSlider()
    );
  });

  describe('API', function() {
    var el;
    var spy;

    beforeEach(function() {
      el = helpers.build(new RangedSlider());
      el.startValue = '0';
      el.endValue = '100';
    });

    afterEach(function() {
      el = null;
    });

    describe('#filled', function() {
      it('should default to true', function() {
        expect(el.filled).to.be.true;
      });

      it('should not be settable', function() {
        let warn = console.warn;
        
        console.warn = () => {
          // Override it to prevent spamming the console
        };
        
        el.filled = false;
        
        expect(el.filled).to.be.true;
  
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

    describe('#showValue', function() {
      it('should display both values', function() {
        el.showValue = true;
        el.values = [10, 20];
  
        expect(el._elements.labelValue.textContent).to.equal('10 - 20');
      });
    });
  });

  // section used for compliance since the current one does not follow test conventions
  describe('Implementation Details (compliance)', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['RangedSlider.values.html'], {
        value: '50',
        default: '1'
      });
    });
  });
});
