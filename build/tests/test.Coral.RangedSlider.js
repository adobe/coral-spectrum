describe('Coral.RangedSlider', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('RangedSlider');
    });
  });

  describe('API', function() {
    var el;
    var spy;

    beforeEach(function() {
      el = new Coral.RangedSlider();
      el.startValue = '0';
      el.endValue = '100';
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#filled', function() {
      it('should default to true', function(done) {
        expect(el.filled).to.be.true;

        helpers.next(function() {
          expect(el._elements.$fill).not.to.have.class('is-hidden', 'The is-hidden class should not be there');
          done();
        });
      });

      it('should not be settable', function(done) {
        el.filled = false;

        helpers.next(function() {
          expect(el.filled).to.be.true;
          expect(el._elements.$fill).not.to.have.class('is-hidden', 'The is-hidden class should not be there');
          done();
        });
      });
    });

    describe('#step', function() {
      it('should default to 1', function() {
        expect(el.step).to.equal(1);
      });

      it('should be ignored if the input is not a number', function(done) {
        el.step = 99;
        expect(el.step).to.equal(99);
        el.step = 'cats';
        expect(el.step).to.equal(99);

        helpers.next(function() {
          expect(el.getAttribute('step')).to.equal('99');

          done();
        });
      });

      it('should ignore invalid numeric values', function(done) {
        el.step = 0;
        expect(el.step).to.equal(1);

        helpers.next(function() {
          expect(el.getAttribute('step')).to.equal('1');

          done();
        });
      });

      it('should ignore negative values', function(done) {
        el.step = -3;
        expect(el.step).to.equal(1);

        helpers.next(function() {
          expect(el.getAttribute('step')).to.equal('1');

          done();
        });
      });
    });

    describe('#startvalue', function() {
      it('should correctly set the input value', function(done) {
        el.startValue = '20';

        helpers.next(function() {

          expect(el._elements.$inputs[0].value).to.equal('20');

          done();
        });
      });

      it('should correctly snap input values to the nearest step', function(done) {
        el.min = 0;
        el.max = 100;
        el.step = 10;

        var setValue = 27;
        var expectedSnap = 30;

        el.startValue = setValue;

        helpers.next(function() {
          expect(el._elements.$inputs[0].value).to.equal(String(expectedSnap));

          done();
        });
      });

      it('should not trigger a change event on the input field', function(done) {
        spy = sinon.spy();

        el.on('change', spy);

        el.startValue = '20';

        helpers.next(function() {
          expect(spy.callCount).to.equal(0);

          done();
        });
      });
    });

    describe('#endvalue', function() {
      it('should correctly set the input value', function(done) {
        el.endValue = '70';

        helpers.next(function() {

          expect(el._elements.$inputs[1].value).to.equal('70');

          done();
        });
      });

      it('should correctly snap input values to the nearest step', function(done) {
        el.min = 0;
        el.max = 100;
        el.step = 10;

        var setValue = 87;
        var expectedSnap = 90;

        el.endValue = setValue;

        helpers.next(function() {
          expect(el._elements.$inputs[1].value).to.equal(String(expectedSnap));

          done();
        });
      });

      it('should not trigger a change event on the input field', function(done) {
        spy = sinon.spy();

        el.on('change', spy);

        el.endValue = '50';

        helpers.next(function() {
          expect(spy.callCount).to.equal(0);

          done();
        });
      });
    });

    describe('#value', function() {
      it('should correctly set the input value', function(done) {
        var value = 20; // Choose step point, otherwise it would be adjusted
        el.value = value;

        helpers.next(function() {

          expect(el._elements.$inputs[0].value).to.equal(String(value));

          done();
        });
      });

      it('should be equivalent to startValue', function(done) {
        el.value = '20'; // Choose step point, otherwise it would be adjusted

        helpers.next(function() {

          expect(el.value).to.equal(el.startValue);

          done();
        });
      });

      it('should correctly snap input values to the nearest step', function(done) {
        el.min = 0;
        el.max = 100;
        el.step = 10;

        var setValue = 27;
        var expectedSnap = 30;

        el.value = setValue;

        helpers.next(function() {
          expect(el._elements.$inputs[0].value).to.equal(String(expectedSnap));

          done();
        });
      });

      it('should not trigger a change event on the input field', function(done) {
        spy = sinon.spy();

        el.on('change', spy);

        el.value = 20;

        helpers.next(function() {
          expect(spy.callCount).to.equal(0);

          done();
        });
      });
    });

    describe('#values', function() {
      it('should correctly set declared input value of a range input', function(done) {
        var firstValue = 30;
        var secondValue = 80; // Choose step points, otherwise they would be adjusted

        el.values = [firstValue, secondValue];

        helpers.next(function() {
          expect(el._elements.$inputs[0].value).to.equal(String(firstValue));
          expect(el._elements.$inputs[1].value).to.equal(String(secondValue));
          done();
        });
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
