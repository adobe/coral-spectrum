import {helpers} from '/coralui-util/src/tests/helpers';
import {Slider} from '/coralui-component-slider';

describe('Slider', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Slider).to.have.property('Item');
    });

    it('should define the orientations in an enum', function() {
      expect(Slider.orientation).to.exist;
      expect(Slider.orientation.HORIZONTAL).to.equal('horizontal');
      expect(Slider.orientation.VERTICAL).to.equal('vertical');
      expect(Object.keys(Slider.orientation).length).to.equal(2);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent(window.__html__['Slider.base.html']);
    });
  
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Slider());
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = helpers.build(new Slider());
    });

    afterEach(function() {
      el = null;
    });
  
    describe('#tooltips', function() {
      it('should default to showValue', function() {
        expect(el.tooltips).to.be.false;
        expect(el.showValue).to.equal(el.tooltips);
        
        el.tooltips = true;
        expect(el.tooltips).to.be.true;
        expect(el.showValue).to.equal(el.tooltips);
      });
    });
    
    describe('#showValue', function() {
      it('should default to false', function() {
        expect(el.showValue).to.equal(false);
      });

      it('should be settable', function() {
        el.showValue = true;
        expect(el._elements.labelValue.hidden).to.be.false;
      });

      it('should be labelled by slider items if available', function() {
        const el = helpers.build(window.__html__['Slider.labelled.html']);
        var slider = el.querySelector('coral-slider');
        
        expect(slider._elements.labelValue.textContent).to.equal('Second Test');
        
        slider.value = '5';
        expect(slider._elements.labelValue.textContent).to.equal('Fifth Test');
      });

      it('should match the label text to the input value on value change', function() {
        var newVal = '60';
        el.value = newVal;
        
        expect(el._elements.labelValue.textContent).to.equal(newVal);
      });
    });

    describe('#orientation', function() {
      it('should default to horizontal', function() {
        expect(el.orientation).to.equal(Slider.orientation.HORIZONTAL);
      });
    });

    describe('#step', function() {
      it('should be possible setting the step', function() {
        el.step = 5;
        
        expect(el.getAttribute('step')).to.equal('5');
        expect(el._elements.inputs[0].getAttribute('aria-valuestep')).to.equal('5');
      });
    });

    describe('#min', function() {
      it('should be possible setting the min', function() {
        el.min = 5;
        
        expect(el.getAttribute('min')).to.equal('5');

        expect(el._elements.inputs[0].getAttribute('min')).to.equal('5');
        expect(el._elements.inputs[0].getAttribute('aria-valuemin')).to.equal('5');
      });
    });

    describe('#max', function() {
      it('should be possible setting the max', function() {
        el.max = 5;
        
        expect(el.getAttribute('max')).to.equal('5');

        expect(el._elements.inputs[0].getAttribute('max')).to.equal('5');
        expect(el._elements.inputs[0].getAttribute('aria-valuemax')).to.equal('5');
      });
    });

    describe('#value', function() {
      it('should be possible setting the value', function() {
        el.value = 5;
        
        expect(el._elements.inputs[0].value).to.equal('5');

        expect(el._elements.inputs[0].getAttribute('aria-valuenow')).to.equal('5');
        expect(el._elements.inputs[0].getAttribute('aria-valuetext')).to.equal('5');
      });

    
      it('should set value and aria-valuetext', function() {
        var input = el.querySelector('input');
        var value = 20;
        el.value = value;
        
        expect(Number(input.value)).to.equal(value);
        expect(Number(input.getAttribute('aria-valuetext'))).to.equal(value);
      });
  
      it('should correctly snap value to the nearest step', function() {
        var input = el.querySelector('input');
        var value = 27;
        var expectedSnap = 30;
        el.min = 10;
        el.step = 10;
        el.value = value;
        
        expect(Number(input.value)).to.equal(expectedSnap);
        expect(Number(input.getAttribute('aria-valuetext'))).to.equal(expectedSnap);
      });
    });

    describe('#valueAsNumber', function() {
      it('should be possible setting the value as number', function() {
        el.valueAsNumber = 5;
        
        expect(el._elements.inputs[0].value).to.equal('5');

        expect(el._elements.inputs[0].getAttribute('aria-valuenow')).to.equal('5');
        expect(el._elements.inputs[0].getAttribute('aria-valuetext')).to.equal('5');
      });

      it('should be possible getting the value as number', function() {
        el.value = '5';
        expect(el.valueAsNumber).to.equal(5);
      });
    });
  });

  describe('Markup', function() {
    describe('#step', function() {});
    describe('#min', function() {});
    describe('#max', function() {});
    describe('#tooltips', function() {});
    describe('#orientation', function() {});
    describe('#filled', function() {});
    describe('#value', function() {});
    describe('#name', function() {});
    describe('#disabled', function() {});
    describe('#labelledBy', function() {});
  });

  describe('Events', function() {});
  
  describe('User Interaction', function() {
    var val = 50;
    var step = 5;
    var min = 40;
    var max = 60;
    var el;
    var handle;
    var input;
    var spy;
  
    function createMouseEvent(type, x, y) {
      return new MouseEvent(type, {
        bubbles: true,
        clientY: y,
        clientX: x
      });
    }
    
    beforeEach(function() {
      el = new Slider();
      helpers.target.appendChild(el);
      
      handle = el._elements.handles[0];
      input = el._elements.inputs[0];
      
      spy = sinon.spy();
      el.on('change', spy);
      
      el.set({
        value: val,
        step: step,
        min: min,
        max: max
      });
    });
    
    afterEach(function() {
      el = handle = input = spy = null;
    });
    
    it('simulate focus and blur on a handle', function() {
      el._focus({
        target: handle
      });
      
      expect(el._elements.handles[0].classList.contains('is-focused')).to.be.true;
      
      el._blur({
        target: handle
      });
  
      expect(el._elements.handles[0].classList.contains('is-focused')).to.be.false;
    });
    
    it('decrease with left key', function() {
      helpers.keydown('left', handle);
      expect(el.value).to.be.equal(String(val - step));
      expect(spy.callCount).to.equal(1);
    });
    
    it('decrease with pageDown key', function() {
      helpers.keydown('pageDown', handle);
      expect(el.value).to.be.equal(String(val - step));
      expect(spy.callCount).to.equal(1);
    });
    
    it('decrease with down key', function() {
      helpers.keydown('down', handle);
      expect(el.value).to.be.equal(String(val - step));
      expect(spy.callCount).to.equal(1);
    });
    
    it('increase with right key', function() {
      helpers.keydown('right', handle);
      expect(el.value).to.be.equal(String(val + step));
      expect(spy.callCount).to.equal(1);
    });
    
    it('increase with pageUp key', function() {
      helpers.keydown('pageUp', handle);
      expect(el.value).to.be.equal(String(val + step));
      expect(spy.callCount).to.equal(1);
    });
    
    it('increase with up key', function() {
      helpers.keydown('up', handle);
      expect(el.value).to.be.equal(String(val + step));
      expect(spy.callCount).to.equal(1);
    });
    
    it('go to min with home key', function() {
      helpers.keydown('home', handle);
      expect(el.value).to.be.equal(String(min));
      expect(spy.callCount).to.equal(1);
    });
    
    it('go to max with end key', function() {
      helpers.keydown('end', handle);
      expect(el.value).to.be.equal(String(max));
      expect(spy.callCount).to.equal(1);
    });
    
    it('decrease without going beneth the minimum, do not trigger "change" event', function() {
      helpers.keydown('left', handle);
      helpers.keydown('left', handle);
      helpers.keydown('left', handle);
      helpers.keydown('left', handle);
      helpers.keydown('left', handle);
      expect(el.value).to.equal(String(min));
      
      spy.reset();
      helpers.keydown('left', handle);
      expect(spy.callCount).to.equal(0);
    });
    
    it('increase without going above the minimum, do not trigger "change" event', function() {
      helpers.keydown('right', handle);
      helpers.keydown('right', handle);
      helpers.keydown('right', handle);
      helpers.keydown('right', handle);
      helpers.keydown('right', handle);
      expect(el.value).to.equal(String(max));
      
      spy.reset();
      helpers.keydown('right', handle);
      expect(spy.callCount).to.equal(0);
    });
    
    it('hold and let got the handle without changing the value nor triggering the "change" event', function() {
      var oldVal = el.value = '40';
      spy.reset();
      
      handle.dispatchEvent(createMouseEvent('mousedown', 0, 0));
      
      document.dispatchEvent(createMouseEvent('mousemove', 0, 0));
      
      document.dispatchEvent(createMouseEvent('mouseup', 0, 0));
      expect(el.value).to.be.equal(oldVal);
      expect(spy.callCount).to.equal(0);
    });
    
    it('drag to maximum, trigger "change" event', function() {
      var oldVal = el.value;
      spy.reset();
      
      handle.dispatchEvent(createMouseEvent('mousedown', 0, 0));
      
      document.dispatchEvent(createMouseEvent('mousemove', 500, 0));
      
      document.dispatchEvent(createMouseEvent('mouseup', 500, 0));
      expect(Number(el.value)).to.be.above(Number(oldVal));
      expect(spy.callCount).to.equal(1);
    });
    
    it('drag to minimum, trigger "change" event', function() {
      var oldVal = el.value;
      spy.reset();
      
      handle.dispatchEvent(createMouseEvent('mousedown', 500, 0));
      
      document.dispatchEvent(createMouseEvent('mousemove', 10, 0));
      
      document.dispatchEvent(createMouseEvent('mouseup', 10, 0));
      expect(Number(el.value)).to.be.below(Number(oldVal));
      expect(spy.callCount).to.equal(1);
    });
  });

  describe('Implementation Details', function() {
    var el;
    var handle;
    var input;
    
    var SLIDER_OPTIONS_MINIMAL = {
      min: 0,
      max: 100,
      step: 10,
      value: 50
    };

    beforeEach(function() {
      el = helpers.build(new Slider());
      el.set(SLIDER_OPTIONS_MINIMAL);
      handle = el._elements.leftHandle;
      input = el._elements.leftInput;
    });

    afterEach(function() {
      el = handle = input = null;
    });
  
    describe('in browsers using that support input[type=range]', function() {
      it('expects the input to have type=range', function() {
        expect(input.type).to.equal('range');
      });

      it('expects the handle to have no defined role', function() {
        el._elements.handles.forEach(function(handle) {
          expect(handle.getAttribute('role')).to.be.null;
        });
      });

      describe('expects the input to have correct', function() {
        it('min', function() {
          expect(Number(input.min)).to.equal(SLIDER_OPTIONS_MINIMAL.min);
        });
        
        it('max', function() {
          expect(Number(input.max)).to.equal(SLIDER_OPTIONS_MINIMAL.max);
        });
        
        it('step', function() {
          expect(Number(input.step)).to.equal(SLIDER_OPTIONS_MINIMAL.step);
        });
        
        it('value', function() {
          expect(Number(input.value)).to.equal(SLIDER_OPTIONS_MINIMAL.value);
        });
        
        it('aria-valuetext', function() {
          expect(Number(input.getAttribute('aria-valuetext'))).to.equal(SLIDER_OPTIONS_MINIMAL.value);
        });
      });
    });

    it('moves the value to the next step using keys', function() {
      var step = 10;

      var prevVal = parseInt(input.value, 10);

      helpers.keypress('up', handle);
      
      var currVal = parseInt(input.value, 10);
      expect(currVal === (prevVal + step)).to.be.true;
    });

    it('move the value to the previous step using keys', function() {
      var step = 10;

      var prevVal = parseInt(input.value, 10);

      helpers.keypress('down', handle);
      
      var currVal = parseInt(input.value, 10);
      expect(currVal === (prevVal - step)).to.be.true;
    });

    it('pages up on "page up" keypress', function() {
      var page = 10;

      var prevVal = parseInt(input.value, 10);

      helpers.keypress('pageUp', handle);
      
      var currVal = parseInt(input.value, 10);
      expect(currVal === (prevVal + page)).to.be.true;
    });

    it('page down on "page down" keypress', function() {
      var page = 10;

      var prevVal = parseInt(input.value, 10);

      helpers.keypress('pageDown', handle);
      
      var currVal = parseInt(input.value, 10);
      expect(currVal === (prevVal - page)).to.be.true;
    });

    it('moves to min on "home" keypress', function() {
      helpers.keypress('home', handle);
      
      expect(parseInt(input.value, 10)).to.equal(SLIDER_OPTIONS_MINIMAL.min);
    });

    it('moves to max on "end" keypress', function() {
      helpers.keypress('end', handle);
      
      expect(parseInt(input.value, 10)).to.equal(SLIDER_OPTIONS_MINIMAL.max);
    });

    it('does not precede min limits when moving to prev step via keys', function() {
      var min = 0;
      el.value = min;

      helpers.keypress('down', handle);
      
      expect(parseInt(input.value, 10)).to.equal(min);
    });

    it('does not exceed max limits when moving to next step via keys', function() {
      var max = 100;
      el.value = max;

      helpers.keypress('up', handle);
      
      expect(parseInt(input.value, 10)).to.equal(max);
    });

    it('should be possible to move the slider in dom without losing the current set "value" "min" and "max" values', function() {
      expect(el.value).to.equal('50', '"50" should be set as value as default');
      expect(el.min).to.equal(0, '0 should be set as min value');
      expect(el.max).to.equal(100, '100 should be set as max value');

      var form = document.createElement('form');
      form.appendChild(el);
      helpers.target.appendChild(form);

      expect(el.value).to.equal('50', '"50" should still be set as value after moving the element in dom');
      expect(el.min).to.equal(0, '0 should still be set as min value');
      expect(el.max).to.equal(100, '100 should still be set as max value');
    });

    it('should be possible to reset the "value" by resetting the surrounding form', function() {
      expect(el.value).to.equal('50', '"50" should be set as value as default') ;

      var form = document.createElement('form');
      form.appendChild(el);
      helpers.target.appendChild(form);

      el.value = '10';
      expect(el.value).to.equal('10');

      form.reset();

      expect(el.value).to.equal('50', '"50" should be set again');
    });
  });

  // section used for compliance since the current one does not follow test conventions
  describe('Implementation Details (compliance)', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Slider.value.html'], {
        value: '50',
        default: '1'
      });
    });
  });
});
