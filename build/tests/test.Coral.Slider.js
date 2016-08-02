describe('Coral.Slider', function() {
  'use strict';

  /**
    Boolean to flag support for HTML5 input[type=range]

    @ignore
  */
  var supportsRangeInput = (function() {
    var i = document.createElement('input');
    i.setAttribute('type', 'range');
    return (i.type === 'range');
  })();

  var SLIDER_OPTIONS_MINIMAL = {
    min: 0,
    max: 100,
    step: 10,
    value: 50
  };

  // @todo: remove the usage of this.
  var TEST_ATTRIBUTES = {
    'classes': {
      'modifiers': {
        'bound': 'coral3-Slider--bound',
        'filled': 'coral3-Slider--filled',
        'ticked': 'coral3-Slider--ticked',
        'tooltips': 'coral3-Slider--tooltips',
        'vertical': 'coral3-Slider--vertical',
        'labeled': 'coral3-Slider--labeled',
        'tick_covered': 'coral3-Slider-tick--covered',
        'tooltipInfo': 'coral3-Tooltip--info'
      },
      'components': {
        'clickarea': 'coral3-Slider-clickarea',
        'fill': 'coral3-Slider-fill',
        'handle': 'coral3-Slider-handle',
        'ticks': 'coral3-Slider-ticks',
        'tick': 'coral3-Slider-tick',
        'ticklabels': 'coral3-Slider-tickLabels',
        'ticklabel': 'coral3-Slider-tickLabel',
        'value': 'coral3-Slider-value',
        'tooltip': 'coral3-Tooltip'
      }
    }
  };

  function createMouseEvent(type, x, y) {
    var evt = document.createEvent('MouseEvents');
    evt.initMouseEvent(type, true, true, window, 0, 0, 0, x, y, false, false, false, false, 0, null);

    return evt;
  }

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Slider');
    });

    it('should define the orientations in an enum', function() {
      expect(Coral.Slider.orientation).to.exist;
      expect(Coral.Slider.orientation.HORIZONTAL).to.equal('horizontal');
      expect(Coral.Slider.orientation.VERTICAL).to.equal('vertical');
      expect(Object.keys(Coral.Slider.orientation).length).to.equal(2);
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Slider();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
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

      it('should be labled by slider items if available', function(done) {
        helpers.build(window.__html__['Coral.Slider.labeled.html'], function(el) {

          var tooltip = el.querySelector('coral-tooltip');
          expect(tooltip.content.textContent).to.equal('Second Test');

          var slider = el.querySelector('coral-slider');
          slider.value = '5';
          expect(tooltip.content.textContent).to.equal('Fifth Test');

          done();
        });
      });

      it.skip('should match the tooltip text to the input value on value change (default tooltip formatter)', function(done) {
        var tooltip = el.querySelector('coral-tooltip');

        var newVal = '60';
        el.value = newVal;

        // wait till tooltip is updated
        helpers.next(function() {
          // expect(el._elements.$inputs[0].value).to.equal(String(newVal));
          expect(tooltip.content.textContent).to.equal(newVal);

          done();
        });
      });
    });

    describe('#orientation', function() {
      it('should default to horizontal', function() {
        expect(el.orientation).to.equal(Coral.Slider.orientation.HORIZONTAL);
      });

      it('should be possible setting the orientation', function(done) {
        var verticalAlign = Coral.Slider.orientation.VERTICAL;
        el.orientation = verticalAlign;

        helpers.next(function() {
          expect(el.$.attr('aria-orientation')).to.equal(verticalAlign);
          expect(el.$).to.have.class('coral3-Slider--vertical');

          expect(el._elements.$inputs.attr('aria-orientation')).to.equal(verticalAlign);
          expect(el._elements.$handles.attr('aria-orientation')).to.equal(verticalAlign);

          done();
        });
      });
    });

    describe('#step', function() {
      it('should be possible setting the step', function(done) {
        el.step = 5;

        helpers.next(function() {
          expect(el.$.attr('step')).to.equal('5');
          expect(el._elements.$inputs.attr('aria-valuestep')).to.equal('5');
          expect(el._elements.$handles.attr('aria-valuestep')).to.equal('5');

          done();
        });
      });
    });

    describe('#min', function() {
      it('should be possible setting the min', function(done) {
        el.min = 5;

        helpers.next(function() {
          expect(el.$.attr('min')).to.equal('5');

          expect(el._elements.$inputs.attr('min')).to.equal('5');
          expect(el._elements.$inputs.attr('aria-valuemin')).to.equal('5');
          expect(el._elements.$handles.attr('aria-valuemin')).to.equal('5');

          done();
        });
      });
    });

    describe('#max', function() {
      it('should be possible setting the max', function(done) {
        el.max = 5;

        helpers.next(function() {
          expect(el.$.attr('max')).to.equal('5');

          expect(el._elements.$inputs.attr('max')).to.equal('5');
          expect(el._elements.$inputs.attr('aria-valuemax')).to.equal('5');
          expect(el._elements.$handles.attr('aria-valuemax')).to.equal('5');

          done();
        });
      });
    });

    describe('#value', function() {
      it('should be possible setting the value', function(done) {
        el.value = 5;

        helpers.next(function() {
          expect(el._elements.$inputs[0].value).to.equal('5');

          expect(el._elements.$inputs.attr('aria-valuenow')).to.equal('5');
          expect(el._elements.$inputs.attr('aria-valuetext')).to.equal('5');
          expect(el._elements.$handles.attr('aria-valuenow')).to.equal('5');
          expect(el._elements.$handles.attr('aria-valuetext')).to.equal('5');

          done();
        });
      });
    });

    describe('#valueAsNumber', function() {
      it('should be possible setting the value as number', function(done) {
        el.valueAsNumber = 5;

        helpers.next(function() {
          expect(el._elements.$inputs[0].value).to.equal('5');

          expect(el._elements.$inputs.attr('aria-valuenow')).to.equal('5');
          expect(el._elements.$inputs.attr('aria-valuetext')).to.equal('5');
          expect(el._elements.$handles.attr('aria-valuenow')).to.equal('5');
          expect(el._elements.$handles.attr('aria-valuetext')).to.equal('5');

          done();
        });
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

    beforeEach(function() {
      el = new Coral.Slider();
      helpers.target.appendChild(el);

      handle = el._elements.$handles[0];
      input = el._elements.$inputs[0];

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

    it('simulate focus and blur on a handle', function(done) {
      el._focus({
        target: handle
      });

      helpers.next(function() {
        expect(el.$).to.have.class('is-focused');
        expect(el._elements.$handles).to.have.class('is-focused');

        el._blur({
          target: handle
        });

        helpers.next(function() {
          expect(el.$).not.to.have.class('is-focused');
          expect(el._elements.$handles).not.to.have.class('is-focused');

          done();
        });
      });
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
      expect(el.value).to.be.at.least(min);

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
      expect(el.value).to.be.at.least(max);

      spy.reset();
      helpers.keydown('right', handle);
      expect(spy.callCount).to.equal(0);
    });

    it('hold and let got the handle without changing the value nor triggering the "change" event', function(done) {
      var oldVal = el.value = '40';
      spy.reset();

      handle.dispatchEvent(createMouseEvent('mousedown', 0, 0));

      helpers.next(function() {
        document.dispatchEvent(createMouseEvent('mousemove', 0, 0));

        helpers.next(function() {
          document.dispatchEvent(createMouseEvent('mouseup', 0, 0));
          expect(el.value).to.be.equal(oldVal);
          expect(spy.callCount).to.equal(0);

          done();
        });
      });
    });

    it('drag to maximum, trigger "change" event', function(done) {
      var oldVal = el.value;
      spy.reset();

      handle.dispatchEvent(createMouseEvent('mousedown', 0, 0));

      helpers.next(function() {
        document.dispatchEvent(createMouseEvent('mousemove', 500, 0));

        helpers.next(function() {
          document.dispatchEvent(createMouseEvent('mouseup', 500, 0));
          expect(el.value).to.be.above(oldVal);
          expect(spy.callCount).to.equal(1);

          done();
        });
      });
    });

    it('drag to minimum, trigger "change" event', function(done) {
      var oldVal = el.value;
      spy.reset();

      handle.dispatchEvent(createMouseEvent('mousedown', 500, 0));

      helpers.next(function() {
        document.dispatchEvent(createMouseEvent('mousemove', 10, 0));

        helpers.next(function() {
          document.dispatchEvent(createMouseEvent('mouseup', 10, 0));
          expect(el.value).to.be.below(oldVal);
          expect(spy.callCount).to.equal(1);

          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    var $sliderAccessibility;
    var el;

    beforeEach(function(done) {
      el = new Coral.Slider();
      el.set(SLIDER_OPTIONS_MINIMAL);
      helpers.target.appendChild(el);

      $sliderAccessibility = $(el);

      helpers.next(function() {
        done();
      });
    });

    afterEach(function() {
      $sliderAccessibility.remove();
      el = $sliderAccessibility = null;
    });

    if (supportsRangeInput) {
      describe('in browsers using that support input[type=range]', function() {
        it('expects the input to have type=range', function() {
          var $input = $sliderAccessibility.find('input');
          expect($input.get(0).type).to.equal('range');
        });

        it('expects the handle to have no defined role', function() {
          el._elements.$handles.each(function() {
            expect(this.getAttribute('role')).to.be.null;
          });
        });

        describe('expects the input to have correct', function() {
          it('min', function(done) {
            var $input = $sliderAccessibility.find('input');

            helpers.next(function() {
              expect(Number($input.get(0).min)).to.equal(SLIDER_OPTIONS_MINIMAL.min);
              done();
            });
          });
          it('max', function(done) {
            var $input = $sliderAccessibility.find('input');

            helpers.next(function() {
              expect(Number($input.get(0).max)).to.equal(SLIDER_OPTIONS_MINIMAL.max);
              done();
            });
          });
          it('step', function(done) {
            var $input = $sliderAccessibility.find('input');

            helpers.next(function() {
              expect(Number($input.get(0).step)).to.equal(SLIDER_OPTIONS_MINIMAL.step);
              done();
            });
          });
          it('value', function(done) {
            var $input = $sliderAccessibility.find('input');

            helpers.next(function() {
              expect(Number($input.val())).to.equal(SLIDER_OPTIONS_MINIMAL.value);
              done();
            });
          });
          it('aria-valuetext', function(done) {
            var $input = $sliderAccessibility.find('input');

            helpers.next(function() {
              expect(Number($input.attr('aria-valuetext'))).to.equal(SLIDER_OPTIONS_MINIMAL.value);
              done();
            });
          });

          describe('setValue(value)', function() {
            it('should set value and aria-valuetext', function(done) {
              var $input = $sliderAccessibility.find('input'),
                value = 20; // Choose step point, otherwise it would be adjusted
              $sliderAccessibility[0].set('value', value);

              helpers.next(function() {
                expect(Number($input.val())).to.equal(value);
                expect(Number($input.attr('aria-valuetext'))).to.equal(value);
                done();
              });
            });

            it('should correctly snap value to the nearest step', function(done) {
              var $input = $sliderAccessibility.find('input'),
                setValue = 27,
                expectedSnap = 30;
              $sliderAccessibility[0].set('value', setValue);

              helpers.next(function() {
                expect(Number($input.val())).to.equal(expectedSnap);
                expect(Number($input.attr('aria-valuetext'))).to.equal(expectedSnap);
                done();
              });
            });
          });
        });
      });
    }
    else {
      describe('in browsers using that do not support input[type=range]', function() {
        it('expects the input to have type=hidden', function() {
          var $input = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.input);
          expect($input.get(0).type).to.equal('hidden');
        });

        it('expects the handle to have role=slider', function() {
          var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
          expect($handle.attr('role')).to.equal('slider');
        });

        it('expects the handle to have tabindex=0', function() {
          var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
          expect($handle.attr('tabindex')).to.equal('0');
        });

        describe('expects the handle to have correct', function() {
          it('aria-valuemin', function(done) {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);

            helpers.next(function() {
              expect(Number($handle.attr('aria-valuemin'))).to.equal(SLIDER_OPTIONS_MINIMAL.min);
              done();
            });
          });
          it('aria-valuemax', function(done) {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);

            helpers.next(function() {
              expect(Number($handle.attr('aria-valuemax'))).to.equal(SLIDER_OPTIONS_MINIMAL.max);
              done();
            });
          });
          it('aria-valuestep', function(done) {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);

            helpers.next(function() {
              expect(Number($handle.attr('aria-valuestep'))).to.equal(SLIDER_OPTIONS_MINIMAL.step);
              done();
            });
          });
          it('aria-valuenow', function(done) {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);

            helpers.next(function() {
              expect(Number($handle.attr('aria-valuenow'))).to.equal(SLIDER_OPTIONS_MINIMAL.value);
              done();
            });
          });
          it('aria-valuetext', function(done) {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);

            helpers.next(function() {
              expect(Number($handle.attr('aria-valuetext'))).to.equal(SLIDER_OPTIONS_MINIMAL.value);
              done();
            });
          });
        });

        describe('setValue(value)', function() {
          it('should set aria-valuenow and aria-valuetext', function(done) {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
            var value = 20; // Choose step point, otherwise it would be adjusted

            $sliderAccessibility[0].set('value', value);

            helpers.next(function() {
              expect(Number($handle.attr('aria-valuenow'))).to.equal(value);
              done();
            });
          });

          it('should correctly snap aria-valuenow to the nearest step', function(done) {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
              setValue = 27,
              expectedSnap = 30;
            $sliderAccessibility[0].set('value', setValue);

            helpers.next(function() {
              expect(Number($handle.attr('aria-valuenow'))).to.equal(expectedSnap);
              done();
            });
          });
        });

        it('expects the input to have aria-hidden=true', function() {
          var $input = $sliderAccessibility.find('input');
          expect($input.attr('aria-hidden')).to.equal('true');
        });
      });
    }

    it('moves the value to the next step using keys', function(done) {
      var prevVal;
      var currVal;
      var step = 10;
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      prevVal = parseInt($input.val(), 10);

      helpers.keypress('up', $handle[0]);

      helpers.next(function() {
        currVal = parseInt($input.val(), 10);
        expect(currVal === (prevVal + step)).to.be.true;

        done();
      });
    });

    it('move the value to the previous step using keys', function(done) {
      var prevVal;
      var currVal;
      var step = 10;
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      prevVal = parseInt($input.val(), 10);

      helpers.keypress('down', $handle[0]);

      helpers.next(function() {
        currVal = parseInt($input.val(), 10);
        expect(currVal === (prevVal - step)).to.be.true;

        done();
      });
    });

    it('pages up on "page up" keypress', function(done) {
      var prevVal;
      var currVal;
      var page = 10;
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      prevVal = parseInt($input.val(), 10);

      helpers.keypress('pageUp', $handle[0]);

      helpers.next(function() {
        currVal = parseInt($input.val(), 10);
        expect(currVal === (prevVal + page)).to.be.true;

        done();
      });
    });

    it('page down on "page down" keypress', function(done) {
      var prevVal;
      var currVal;
      var page = 10;
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      prevVal = parseInt($input.val(), 10);

      helpers.keypress('pageDown', $handle[0]);

      helpers.next(function() {
        currVal = parseInt($input.val(), 10);
        expect(currVal === (prevVal - page)).to.be.true;

        done();
      });
    });

    it('moves to min on "home" keypress', function(done) {
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      helpers.keypress('home', $handle[0]);

      helpers.next(function() {
        expect(parseInt($input.val(), 10)).to.equal(SLIDER_OPTIONS_MINIMAL.min);

        done();
      });
    });

    it('moves to max on "end" keypress', function(done) {
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      helpers.keypress('end', $handle[0]);

      helpers.next(function() {
        expect(parseInt($input.val(), 10)).to.equal(SLIDER_OPTIONS_MINIMAL.max);

        done();
      });
    });

    it('does not precede min limits when moving to prev step via keys', function(done) {
      var min = 0;
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      $sliderAccessibility[0].set('value', min);

      helpers.keypress('down', $handle[0]);

      helpers.next(function() {
        expect(parseInt($input.val(), 10)).to.equal(min);

        done();
      });
    });

    it('does not exceed max limits when moving to next step via keys', function(done) {
      var max = 100;
      var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
      var $input = $sliderAccessibility.find('input');

      $sliderAccessibility[0].set('value', max);

      helpers.keypress('up', $handle[0]);

      helpers.next(function() {
        expect(parseInt($input.val(), 10)).to.equal(max);

        done();
      });
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
      helpers.testFormField(window.__html__['Coral.Slider.value.html'], {
        value: '50',
        default: '1'
      });
    });
  });
});
