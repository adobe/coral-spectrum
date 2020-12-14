/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {helpers} from '../../../coral-utils/src/tests/helpers';
import {NumberInput} from '../../../coral-component-numberinput';
import {commons} from '../../../coral-utils';

describe('NumberInput', function () {
  function testInstance(instance) {
    expect(instance.getAttribute('role')).to.equal('group');
    expect(instance.classList.contains('_coral-Stepper')).to.be.true;

    expect(instance._elements.input).to.exist;
    expect(instance._elements.stepUp).to.exist;
    expect(instance._elements.stepDown).to.exist;

    if (instance._elements.input.type === 'text') {
      expect(instance._elements.input.getAttribute('role')).to.equal('spinbutton');
    }

    expect(instance.getAttribute('min')).to.be.null;
    expect(instance.getAttribute('max')).to.be.null;
    expect(instance.getAttribute('step')).to.equal('1');
    expect(instance.getAttribute('disabled')).to.be.null;
    expect(instance.getAttribute('invalid')).to.be.null;
    expect(instance.getAttribute('name')).to.be.null;
    expect(instance.getAttribute('readonly')).to.be.null;
    expect(instance.getAttribute('required')).to.be.null;
    expect(instance.getAttribute('placeholder')).to.be.null;
    expect(instance.getAttribute('value')).to.be.null;
  }

  describe('Instantiation', function () {
    it('should be possible using new', function () {
      var el = helpers.build(new NumberInput());
      testInstance(el);
    });

    it('should be possible using createElement', function () {
      var el = helpers.build(document.createElement('coral-numberinput'));
      testInstance(el);
    });

    it('should be possible using markup', function () {
      const el = helpers.build(window.__html__['NumberInput.base.html']);
      testInstance(el);
    });

    helpers.cloneComponent(
      'should be possible to clone using markup',
      helpers.build(window.__html__['NumberInput.base.html'])
    );

    helpers.cloneComponent(
      'should be possible to clone using js',
      helpers.build(new NumberInput())
    );
  });

  describe('Markup', function () {

    describe('#disabled', function () {
      it('should be settable from markup', function () {
        const el = helpers.build(window.__html__['NumberInput.disabled.html']);
        expect(el.disabled).to.be.true;
        expect(el.value).to.equal('5');
        expect(el.classList.contains('is-disabled')).to.be.true;
        expect(el.getAttribute('disabled')).to.not.be.null;
      });
    });

    describe('#invalid', function () {

      it('should be settable from markup', function () {
        const el = helpers.build(window.__html__['NumberInput.invalid.html']);
        expect(el.invalid).to.be.true;
        expect(el.value).to.equal('5');
        expect(el.classList.contains('is-invalid')).to.be.true;
        expect(el.getAttribute('invalid')).to.not.be.null;
      });

      it('should remain invalid after setting a valid number programmatically', function () {
        const el = helpers.build(window.__html__['NumberInput.invalid.html']);
        el.value = '7';

        expect(el.value).to.equal('7');
        expect(el.invalid).to.be.true;

        expect(el.classList.contains('is-invalid')).to.be.true;
        expect(el.getAttribute('invalid')).to.not.be.null;
      });

      it('should remove invalid after user interaction', function () {
        const el = helpers.build(window.__html__['NumberInput.invalid.html']);

        el._elements.input.value = '7';
        helpers.event('change', el._elements.input);

        expect(el.value).to.equal('7');
        expect(el.invalid).to.be.false;

        expect(el.classList.contains('is-invalid')).to.be.false;
        expect(el.getAttribute('invalid')).to.be.null;
      });

      it('should remove invalid after button click', function () {
        const el = helpers.build(window.__html__['NumberInput.invalid.html']);

        el._elements.stepUp.click();

        expect(el.value).to.equal('6');
        expect(el.invalid).to.be.false;

        expect(el.classList.contains('is-invalid')).to.be.false;
        expect(el.getAttribute('invalid')).to.be.null;
      });
    });
  });

  describe('API', function () {
    // instantiated number input element
    var el;

    beforeEach(function () {
      el = helpers.build(new NumberInput());
    });

    afterEach(function () {
      el = null;
    });

    describe('#stepUp()', function () {
      it('should increment value by step amount', function () {
        expect(el).to.have.property('stepUp');
        el.value = '5';
        el.stepUp();
        expect(el.value).to.equal('6');
      });

      it('should consider empty value as 0', function () {
        el.value = '';
        el.step = '4';

        expect(el._elements.input.value).to.equal('');
        expect(el.value).to.equal('');

        el.stepUp();
        expect(el.value).to.equal('4');
        expect(el._elements.input.value).to.equal('4');
      });

      it('should work with 0 as initial value', function () {
        el.value = '0';
        el.step = '2';
        expect(el.value).to.equal('0');
        el.stepUp();
        expect(el.value).to.equal('2');
        expect(el._elements.input.value).to.equal('2');
      });

      it('should respect max value', function () {
        el.max = 1;
        el.stepUp();
        el.stepUp();
        expect(el.value).to.equal('1');
      });

      it('should still work while disabled', function () {
        el.value = 3;
        el.disabled = true;

        el.stepUp();
        expect(el.value).to.equal('4');
        expect(el._elements.input.value).to.equal('4');
        expect(el.getAttribute('disabled')).to.not.be.null;
        expect(el._elements.input.getAttribute('disabled')).to.not.be.null;
      });
    });

    describe('#stepDown()', function () {
      it('should decrement value by step amount', function () {
        expect(el).to.have.property('stepDown');
        el.stepDown();
        expect(el.value).to.equal('-1');
      });

      it('should consider empty value as 0', function () {
        el.value = '';
        el.step = '4';

        expect(el._elements.input.value).to.equal('');
        expect(el.value).to.equal('');

        el.stepDown();
        expect(el.value).to.equal('-4');
        expect(el._elements.input.value).to.equal('-4');
      });

      it('should work with 0 as initial value', function () {
        el.value = '0';
        el.step = '2';
        expect(el.value).to.equal('0');
        el.stepDown();
        expect(el.value).to.equal('-2');

        expect(el._elements.input.value).to.equal('-2');
      });

      it('should respect min value', function () {
        el.min = -1;
        el.stepDown();
        el.stepDown();
        expect(el.value).to.equal('-1');
      });

      it('should still work while disabled', function () {
        el.value = 3;
        el.disabled = true;

        el.stepDown();
        expect(el.value).to.equal('2');
        expect(el._elements.input.value).to.equal('2');

        expect(el.getAttribute('disabled')).to.not.be.null;
        expect(el._elements.input.getAttribute('disabled')).to.not.be.null;
      });
    });

    describe('#reset()', function () {
      it('should allow setting the value attribute and then reseting', function () {
        el.setAttribute('value', '10');
        el.value = '1';

        el.reset();
        expect(el.value).to.equal('10', 'The value should match the dom attribute after reset');

        el.removeAttribute('value');

        el.reset();
        expect(el.value).to.equal('', 'The value should be empty string since it was removed from the DOM');
      });
    });

    describe('#clear()', function () {
      it('should clear any type of value', function () {
        el.value = 'XYZ';

        el.clear();
        expect(el.value.length).to.equal(0, 'The value should realy cleared');
      });
    });

    describe('#step', function () {
      it('should default to 1', function () {
        expect(el).to.have.property('step');
        expect(el.step).to.equal(1);
        expect(el._elements.input.getAttribute('step')).to.equal('1');
      });

      it('should change step amount', function () {
        expect(el).to.have.property('step');
        el.step = 5;
        el.stepUp();
        expect(el.value).to.equal('5');
        expect(el._elements.input.getAttribute('step')).to.equal('5');
        expect(el._elements.input.value).to.equal('5');
      });

      it('should be ignored if the input is not a number', function () {
        el.step = 99;
        expect(el.step).to.equal(99);
        el.step = 'cats';
        expect(el.step).to.equal(99);
        expect(el._elements.input.getAttribute('step')).to.equal('99');
      });

      it('should ignore invalid values', function () {
        el.step = 0;
        expect(el.step).to.equal(1);
        el.step = -3;
        expect(el.step).to.equal(1);
        expect(el._elements.input.getAttribute('step')).to.equal('1');
      });

      it('should accept any as value', function () {
        el.step = 'any';
        expect(el.step).to.equal('any');
        expect(el._elements.input.getAttribute('step')).to.equal('any');
      });

      it('should mark input invalid if value is not a multiple of step', function () {
        el.setAttribute('value', '5');
        el.step = '5';
        expect(el.step).to.equal(5);
        expect(el.invalid).to.be.false;

        el.value = '3';
        helpers.event('change', el._elements.input);
        expect(el.invalid).to.be.true;
      });
    });

    describe('#min', function () {
      it('should default to null', function () {
        expect(el.min).to.be.null;
        expect(el._elements.input.getAttribute('aria-valuemin')).to.be.null;
        expect(el._elements.input.getAttribute('min')).to.be.null;
      });

      it('should set min value', function () {
        el.min = 3;
        expect(el.min).to.equal(3);
        expect(el.getAttribute('min')).to.equal('3');
        expect(el._elements.input.getAttribute('aria-valuemin')).to.equal('3');
        expect(el._elements.input.getAttribute('min')).to.equal('3');
      });

      it('should remove the min with null', function () {
        el.min = 3;
        expect(el.min).to.equal(3);
        expect(el.getAttribute('min')).to.equal('3');
        expect(el._elements.input.getAttribute('min')).to.equal('3');

        el.min = null;

        expect(el.min).to.be.null;
        expect(el.getAttribute('min')).to.be.null;
        expect(el._elements.input.getAttribute('aria-valuemin')).to.be.null;
        expect(el._elements.input.getAttribute('min')).to.be.null;
      });

      it('should remove the min with undefined', function () {
        el.min = 3;
        expect(el.min).to.equal(3);
        expect(el.getAttribute('min')).to.equal('3');
        expect(el._elements.input.getAttribute('aria-valuemin')).to.equal('3');
        expect(el._elements.input.getAttribute('min')).to.equal('3');

        el.min = undefined;

        expect(el.min).to.be.null;
        expect(el.getAttribute('min')).to.be.null;
        expect(el._elements.input.getAttribute('aria-valuemin')).to.be.null;
        expect(el._elements.input.getAttribute('min')).to.be.null;
      });
    });

    describe('#max', function () {
      it('should default to null', function () {
        expect(el.max).to.be.null;
        expect(el._elements.input.getAttribute('aria-valuemax')).to.be.null;
        expect(el._elements.input.getAttribute('max')).to.be.null;
      });

      it('should set max value', function () {
        el.max = 9;
        expect(el.max).to.equal(9);
        expect(el.getAttribute('max')).to.equal('9');
        expect(el._elements.input.getAttribute('aria-valuemax')).to.equal('9');
        expect(el._elements.input.getAttribute('max')).to.equal('9');
      });

      it('should remove the max with null', function () {
        el.max = 9;
        expect(el.max).to.equal(9);

        expect(el.getAttribute('max')).to.equal('9');
        expect(el._elements.input.getAttribute('aria-valuemax')).to.equal('9');
        expect(el._elements.input.getAttribute('max')).to.equal('9');

        el.max = null;

        expect(el.max).to.be.null;
        expect(el.getAttribute('max')).to.be.null;
        expect(el._elements.input.getAttribute('aria-valuemax')).to.be.null;
        expect(el._elements.input.getAttribute('max')).to.be.null;
      });

      it('should remove the max with undefined', function () {
        el.max = 9;
        expect(el.max).to.equal(9);

        expect(el.getAttribute('max')).to.equal('9');
        expect(el._elements.input.getAttribute('aria-valuemax')).to.equal('9');
        expect(el._elements.input.getAttribute('max')).to.equal('9');

        el.max = undefined;

        expect(el.max).to.be.null;
        expect(el.getAttribute('max')).to.be.null;
        expect(el._elements.input.getAttribute('aria-valuemax')).to.be.null;
        expect(el._elements.input.getAttribute('max')).to.be.null;
      });
    });

    describe('#value', function () {
      it('should default to empty string', function () {
        expect(el.value).to.equal('');
        expect(el.valueAsNumber).to.be.NaN;
        expect(el.getAttribute('value')).to.be.null;
        expect(el._elements.input.value).to.equal('');
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal(null);
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal(null);
      });

      it('should set the new value', function () {
        el.value = 9;
        expect(el.value).to.equal('9');
        expect(el.valueAsNumber).to.equal(9);
        expect(el.getAttribute('value')).to.be.null;
        expect(el._elements.input.value).to.equal('9');
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal('9');
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal('9');
      });

      it('should ignore null', function () {
        el.value = 5;
        expect(el.value).to.equal('5');
        expect(el.valueAsNumber).to.equal(5);
        expect(el.getAttribute('value')).to.be.null;
        expect(el._elements.input.value).to.equal('5');
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal('5');
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal('5');

        el.value = null;
        expect(el.value).to.equal('');
        expect(el.valueAsNumber).to.be.NaN;
        expect(el._elements.input.value).to.equal('');
        expect(el._elements.input.hasAttribute('aria-valuenow')).to.be.false;
        expect(el._elements.input.hasAttribute('aria-valuetext')).to.be.false;
      });

      it('should ignore boolean values', function () {
        el.value = 5;
        expect(el.value).to.equal('5');
        expect(el.valueAsNumber).to.equal(5);
        expect(el.getAttribute('value')).to.be.null;
        expect(el._elements.input.value).to.equal('5');
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal('5');
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal('5');

        el.value = true;
        expect(el.value).to.equal('');
        expect(el.valueAsNumber).to.be.NaN;
        expect(el._elements.input.value).to.equal('');
        expect(el._elements.input.hasAttribute('aria-valuenow')).to.be.false;
        expect(el._elements.input.hasAttribute('aria-valuetext')).to.be.false;
      });

      it('should set the value regardless of the max and not set it invalid', function () {
        el.max = 3;
        el.value = 100;
        expect(el.value).to.equal('100');
        expect(el.valueAsNumber).to.equal(100);
        expect(el.invalid).to.be.false;
        expect(el.getAttribute('value')).to.be.null;
        expect(el.getAttribute('invalid')).to.be.null;
        expect(el._elements.input.value).to.equal('100');
        expect(el._elements.stepUp.disabled).to.be.true;
        expect(el._elements.stepDown.disabled).to.be.false;
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal('100');
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal('100');
      });

      it('should set the value regardless of the min and not set it invalid', function () {
        el.min = -12;
        el.value = -99;
        expect(el.value).to.equal('-99');
        expect(el.valueAsNumber).to.equal(-99);
        expect(el.invalid).to.be.false;
        expect(el.getAttribute('value')).to.be.null;
        expect(el.getAttribute('invalid')).to.be.null;
        expect(el._elements.input.value).to.equal('-99');
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.true;
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal('-99');
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal('-99');
      });

      it('should allow empty value', function () {
        el.value = 99;
        expect(el.value).to.equal('99');
        expect(el.valueAsNumber).to.equal(99);
        el.value = '';
        expect(el.value).to.equal('');
        expect(el.valueAsNumber).to.be.NaN;
        expect(el.getAttribute('value')).to.be.null;
        expect(el.getAttribute('invalid')).to.be.null;
        expect(el._elements.input.value).to.equal('');
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.false;
        expect(el._elements.input.hasAttribute('aria-valuenow')).to.be.false;
        expect(el._elements.input.hasAttribute('aria-valuetext')).to.be.false;
      });

      it('will parseFloat input values', function () {
        el.value = '12345.678';
        expect(el.value).to.equal('12345.678');
        expect(el.valueAsNumber).to.equal(12345.678);
        expect(el.getAttribute('value')).to.be.null;
        expect(el.getAttribute('invalid')).to.be.null;
        expect(el._elements.input.value).to.equal('12345.678');
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.false;
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal('12345.678');
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal('12345.678');
      });

      it('should set NaN if non-empty input cannot be parsed to number', function () {
        el.value = 99;
        expect(el.value).to.equal('99');
        expect(el.valueAsNumber).to.equal(99);

        el.value = '6 cats';
        expect(el.value).to.equal('');
        expect(el.valueAsNumber).to.be.NaN;
        expect(el.getAttribute('value')).to.be.null;
        expect(el.getAttribute('invalid')).to.be.null;
        expect(el._elements.input.value).to.equal('');
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.false;
        expect(el._elements.input.hasAttribute('aria-valuenow')).to.be.false;
        expect(el._elements.input.hasAttribute('aria-valuetext')).to.be.false;
      });
    });

    describe('#valueAsNumber', function () {
      it('should default to NaN', function () {
        expect(el.value).to.equal('');
        expect(el.valueAsNumber).to.be.NaN;
      });

      it('should return 0 instead of NaN', () => {
        el.value = 0;
        expect(el.valueAsNumber).to.equal(0);
      });

      it('should set the new value', function () {
        el.valueAsNumber = 64;
        expect(el.value).to.equal('64');
        expect(el.valueAsNumber).to.equal(64);
        expect(el.getAttribute('valueAsNumber')).to.be.null;
        expect(el._elements.input.valueAsNumber).to.equal(64);
        expect(el._elements.input.getAttribute('aria-valuenow')).to.equal('64');
        expect(el._elements.input.getAttribute('aria-valuetext')).to.equal('64');
      });

      it('should set to NaN when conversion to number is not possible', function () {
        el.valueAsNumber = 'some string';
        expect(el.valueAsNumber).to.be.NaN;
      });

      it('should get the new value', function () {
        el.valueAsNumber = '100';
        expect(el.valueAsNumber).to.equal(100);
        expect(el.value).to.equal('100');

        el.valueAsNumber = 'April 17, 2015 03:24:00';
        expect(el.valueAsNumber).to.be.NaN;
        expect(el.value).to.equal('');
      });
    });

    describe('#name', function () {
      var form;

      beforeEach(function () {
        // wraps the numberinput in a form element
        form = document.createElement('form');
        form.appendChild(el);
        helpers.target.appendChild(form);
      });

      afterEach(function () {
        form = null;
      });

      it('should default to empty string', function () {
        expect(el.name).to.equal('');
        expect(el.valueAsNumber).to.be.NaN;

        expect(el.getAttribute('name')).to.be.null;
        expect(el._elements.input.getAttribute('name')).to.be.null;

        // should not submit anything
        expect(helpers.serializeArray(form)).to.deep.equal([]);
      });

      it('should be set and reflected', function () {
        el.name = 'ni1';
        expect(el.name).to.equal('ni1');

        expect(el.getAttribute('name')).to.equal('ni1');
        expect(el._elements.input.getAttribute('name')).to.equal('ni1');

        expect(helpers.serializeArray(form)).to.deep.equal([{
          name: 'ni1',
          value: ''
        }]);
      });

      it('should submit the value when the name is set', function () {
        el.name = 'ni1';
        el.value = '17';

        expect(helpers.serializeArray(form)).to.deep.equal([{
          name: 'ni1',
          value: '17'
        }]);
      });
    });

    describe('#invalid', function () {
      it('should default to false', function () {
        expect(el).to.have.property('invalid');
        expect(el.invalid).to.be.false;
        expect(el.getAttribute('invalid')).to.be.null;
        expect(el._elements.input.invalid).to.be.false;
      });

      it('should set "invalid" on true', function () {
        el.invalid = true;
        expect(el.invalid).to.be.true;
        expect(el.getAttribute('invalid')).to.not.be.null;
        expect(el.getAttribute('aria-invalid')).to.equal('true');
        expect(el.classList.contains('is-invalid')).to.be.true;
        expect(el._elements.input.invalid).to.be.true;
      });

      it('should not set "invalid" to true if step="any" and value is decimal', function () {
        el.step = 'any';
        el.value = 10.1;

        el.stepUp();
        helpers.event('change', el._elements.input);
        expect(el.invalid).to.be.false;

        el.stepDown();
        helpers.event('change', el._elements.input);
        expect(el.invalid).to.be.false;
      });
    });

    describe('#disabled', function () {
      it('should default to false', function () {
        expect(el).to.have.property('disabled');
        expect(el.disabled).to.be.false;
        expect(el.getAttribute('disabled')).to.be.null;
        expect(el._elements.input.disabled).to.be.false;
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.false;
      });

      it('should disable with true', function () {
        el.disabled = true;

        expect(el.disabled).to.be.true;
        expect(el.getAttribute('aria-disabled')).to.equal('true');
        expect(el.getAttribute('disabled')).to.not.be.null;
        expect(el._elements.input.disabled).to.be.true;
        expect(el._elements.stepUp.disabled).to.be.true;
        expect(el._elements.stepDown.disabled).to.be.true;
      });

      it('should enable it with false', function () {
        el.disabled = true;
        el.disabled = false;

        expect(el.disabled).to.be.false;
        expect(el.getAttribute('disabled')).to.be.null;
        expect(el._elements.input.disabled).to.be.false;
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.false;
      });

      it('should preserve the disabled buttons state when it is re-enabled', function () {
        el.value = '1';
        el.min = '1';
        el.max = '20';

        expect(el.value).to.equal('1');
        expect(el.min).to.equal(1);
        expect(el.max).to.equal(20);
        expect(el._elements.input.disabled).to.be.false;
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.true;
        expect(el.getAttribute('disabled')).to.be.null;
        expect(el.hasAttribute('aria-disabled')).to.be.false;

        el.disabled = true;
        expect(el._elements.input.disabled).to.be.true;
        expect(el._elements.stepUp.disabled).to.be.true;
        expect(el._elements.stepDown.disabled).to.be.true;
        expect(el.getAttribute('disabled')).to.not.be.null;
        expect(el.getAttribute('aria-disabled')).to.equal('true');

        el.disabled = false;
        expect(el._elements.input.disabled).to.be.false;
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.true;
        expect(el.getAttribute('disabled')).to.be.null;
        expect(el.hasAttribute('aria-disabled')).to.be.false;
      });

      it('should handle manipulating disabled attribute', function () {
        el.setAttribute('disabled', '');
        expect(el.disabled).to.be.true;
        expect(el._elements.input.disabled).to.be.true;
        expect(el._elements.stepUp.disabled).to.be.true;
        expect(el._elements.stepDown.disabled).to.be.true;

        el.removeAttribute('disabled');
        expect(el.disabled).to.be.false;
        expect(el._elements.input.disabled).to.be.false;
        expect(el._elements.stepUp.disabled).to.be.false;
        expect(el._elements.stepDown.disabled).to.be.false;
      });
    });

    // @todo: required missing
    describe('#readOnly', function () {
      it('should default to false', function () {
        expect(el.readOnly).to.be.false;
        expect(el.getAttribute('readonly')).to.be.null;
      });

      it('should block keys on readOnly', function () {
        el.readOnly = true;

        expect(el.value).to.equal('');
        helpers.keypress('up', el._elements.input);
        expect(el.value).to.equal('', 'After up key pressed');

        helpers.keypress('down', el._elements.input);
        expect(el.value).to.equal('', 'After down key pressed');
      });

      it('should ignore readOnly on stepUp() and stepDown()', function () {
        el.readOnly = true;

        expect(el.value).to.equal('');
        el.stepDown();
        expect(el.value).to.equal('-1', 'After stepDown()');
        el.stepUp();
        expect(el.value).to.equal('0', 'After stepUp()');
      });
    });

    describe('#labelledby', function () {
      it('should label the input', function () {
        var label1 = document.createElement('label');
        label1.textContent = 'label1';
        label1.id = commons.getUID();

        helpers.target.appendChild(label1);

        el.labelledBy = label1.id;

        expect(el.labelledBy).to.equal(label1.id);
        expect(label1.getAttribute('for')).to.equal(el._elements.input.id);
        expect(el._elements.input.getAttribute('aria-labelledby')).to.equal(label1.id);
        expect(el._elements.stepUp.hasAttribute('aria-labelledby')).to.be.false;
        expect(el._elements.stepDown.hasAttribute('aria-labelledby')).to.be.false;

        expect(el.getAttribute('aria-labelledby')).to.equal(label1.id);

        el.labelledBy = '';

        expect(el.labelledBy).to.be.null;
        expect(label1.hasAttribute('for')).to.be.false;
        expect(el._elements.input.hasAttribute('aria-labelledby')).to.be.false;
        expect(el._elements.stepUp.hasAttribute('aria-labelledby')).to.be.false;
        expect(el._elements.stepDown.hasAttribute('aria-labelledby')).to.be.false;
        expect(el.hasAttribute('aria-labelledby'), 'aria should be removed').to.be.false;
      });
    });

    describe('#placeholder', function () {
      it('should default to ""', function () {
        expect(el.placeholder).to.equal('');
        expect(el.getAttribute('placeholder')).to.be.null;
      });

      it('should be set and reflected', function () {
        el.placeholder = 'ni1';
        expect(el.placeholder).to.equal('ni1');
        expect(el._elements.input.getAttribute('placeholder')).to.equal('ni1');
      });
    });
  });

  describe('Events', function () {

    describe('#change', function () {

      it('should not trigger change while setting values programmatically', function () {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['NumberInput.base.html']);
        // adds the required listeners
        el.on('change', changeSpy);
        expect(changeSpy.callCount).to.equal(0);
        el.value = -1;
        expect(changeSpy.callCount).to.equal(0);
        el.stepDown();
        expect(changeSpy.callCount).to.equal(0);
        el.stepUp();
        expect(changeSpy.callCount).to.equal(0);
      });

      it('should trigger change when interacted with the input', function () {
        var changeSpy = sinon.spy();

        const el = helpers.build('<coral-numberinput value="0"></coral-numberinput>');

        // adds the required listeners
        el.on('change', changeSpy);

        el._elements.input.value = '5';
        helpers.event('change', el._elements.input);

        expect(changeSpy.callCount).to.equal(1);
      });

      it('should trigger change when interacted with the buttons', function () {
        var changeSpy = sinon.spy();

        const el = helpers.build('<coral-numberinput value="0"></coral-numberinput>');
        // adds the required listeners
        el.on('change', changeSpy);

        el._elements.stepUp.click();
        expect(el.value).to.equal('1');
        expect(changeSpy.callCount).to.equal(1);
        el._elements.stepDown.click();
        expect(el.value).to.equal('0');
        expect(changeSpy.callCount).to.equal(2);
      });

      it('should trigger change when interacted with the mousewheel', function () {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['NumberInput.full.html']);
        // adds the required listeners
        el.on('change', changeSpy);

        el._elements.input.focus();

        // scrolls down => stepUp()
        var mouseEvent = document.createEvent('MouseEvents');
        mouseEvent.initEvent('mousewheel', true, true);
        mouseEvent.wheelDelta = 120;

        el._elements.input.dispatchEvent(mouseEvent);
        expect(el.value).to.equal('6');

        expect(changeSpy.callCount).to.equal(1);

        // scrolls up => stepDown()
        mouseEvent.wheelDelta = -120;
        el._elements.input.dispatchEvent(mouseEvent);
        expect(el.value).to.equal('5');

        expect(changeSpy.callCount).to.equal(2);

        // sets the min value to test if we can trigger a change event after the min
        el.value = el.min;

        // scrolls up => stepDown()
        mouseEvent.wheelDelta = -120;
        el._elements.input.dispatchEvent(mouseEvent);
        expect(el.value).to.equal('0');

        // no new change event recorded
        expect(changeSpy.callCount).to.equal(2);

        // sets the min value to test if we can trigger a change event after the min
        el.value = el.max;

        // scrolls down => stepUp()
        mouseEvent.wheelDelta = 120;
        el._elements.input.dispatchEvent(mouseEvent);
        expect(el.value).to.equal('10');

        // no new change event recorded
        expect(changeSpy.callCount).to.equal(2);
      });

      it('should trigger change when interacted with the keyboard', function () {
        var changeSpy = sinon.spy();

        const el = helpers.build(window.__html__['NumberInput.full.html']);
        // adds the required listeners
        el.on('change', changeSpy);

        helpers.keypress('up', el);

        expect(el.value).to.equal('6', 'After up key pressed');

        expect(changeSpy.callCount).to.equal(1);

        helpers.keypress('pageup', el);
        expect(el.value).to.equal('7', 'After page up key pressed');

        expect(changeSpy.callCount).to.equal(2);

        helpers.keypress('down', el);
        expect(el.value).to.equal('6', 'After down key pressed');

        expect(changeSpy.callCount).to.equal(3);

        helpers.keypress('pagedown', el);
        expect(el.value).to.equal('5', 'After page down key pressed');

        expect(changeSpy.callCount).to.equal(4);

        helpers.keypress('home', el);
        expect(el.value).to.equal('10', 'After home key pressed');

        expect(changeSpy.callCount).to.equal(5);

        // should not trigger an event with the same value
        helpers.keypress('up', el);
        expect(el.value).to.equal('10', 'After up key pressed');

        expect(changeSpy.callCount).to.equal(5);

        helpers.keypress('end', el);
        expect(el.value).to.equal('0', 'After end key pressed');

        expect(changeSpy.callCount).to.equal(6);

        // should not trigger an event with the same value
        helpers.keypress('down', el);
        expect(el.value).to.equal('0', 'After down key pressed');

        expect(changeSpy.callCount).to.equal(6);
      });
    });
  });

  describe('User Interaction', function () {
    var el;

    beforeEach(function () {
      el = helpers.build(new NumberInput());
    });

    afterEach(function () {
      el = null;
    });

    it('should go up when up is pressed', function () {
      helpers.keypress('up', el);
      expect(el.value).to.equal('1', 'After up key pressed');
    });

    it('should ignore up while disabled/readonly', function () {
      el.value = '0';
      el.max = 5;
      el.disabled = true;
      helpers.keypress('up', el);
      expect(el.value).to.equal('0', 'After up key pressed');

      el.disabled = false;
      el.readOnly = true;

      helpers.keypress('up', el);
      expect(el.value).to.equal('0', 'After up key pressed');
    });

    it('should go down when down is pressed', function () {
      helpers.keypress('down', el);
      expect(el.value).to.equal('-1', 'After down key pressed');
    });

    it('should ignore down while disabled/readonly', function () {
      el.value = '0';
      el.max = 5;
      el.disabled = true;
      helpers.keypress('down', el);
      expect(el.value).to.equal('0', 'After down key pressed');

      el.disabled = false;
      el.readOnly = true;

      helpers.keypress('down', el);
      expect(el.value).to.equal('0', 'After down key pressed');
    });

    it('should go down when page down is pressed', function () {
      helpers.keypress('pagedown', el);
      expect(el.value).to.equal('-1', 'After page down key pressed');
    });

    it('should go down when page up is pressed', function () {
      helpers.keypress('pageup', el);
      expect(el.value).to.equal('1', 'After page up key pressed');
    });

    it('should go to max when home is pressed', function () {
      helpers.keypress('home', el);
      expect(el.value).to.equal('', 'After home key pressed');

      el.max = 5;
      helpers.keypress('home', el);
      expect(el.value).to.equal('5', 'After home key pressed');
    });

    it('should ignore home while disabled/readonly', function () {
      el.value = '0';
      el.max = 5;
      el.disabled = true;
      helpers.keypress('home', el);
      expect(el.value).to.equal('0', 'After home key pressed');

      el.disabled = false;
      el.readOnly = true;

      helpers.keypress('home', el);
      expect(el.value).to.equal('0', 'After home key pressed');
    });

    it('should go to min when end is pressed', function () {
      helpers.keypress('end', el);
      expect(el.value).to.equal('', 'After end key pressed');

      el.min = 1;
      helpers.keypress('end', el);
      expect(el.value).to.equal('1', 'After end key pressed');
    });

    it('should ignore end while disabled/readonly', function () {
      el.value = '3';
      el.min = 1;
      el.disabled = true;
      helpers.keypress('end', el);
      expect(el.value).to.equal('3', 'After end key pressed');

      el.disabled = false;
      el.readOnly = true;

      helpers.keypress('end', el);
      expect(el.value).to.equal('3', 'After end key pressed');
    });

    it('should update the value on input trigger', function () {
      el.value = '1';
      expect(el.value).to.equal('1');
      el._elements.input.value = 5;
      el._elements.input.trigger('change');
      expect(el.value).to.equal('5');
    });

    it('should disable the stepDown button when input equals min value', function () {
      el.min = 1;
      el._elements.input.value = 1;
      el._elements.input.trigger('change');

      expect(el.value).to.equal('1');
      expect(el._elements.stepDown.disabled).to.be.true;
    });

    it('should disable the stepUp button when input equals max value', function () {
      el.max = 5;
      el._elements.input.value = 5;
      el._elements.input.trigger('change');

      expect(el.value).to.equal('5');
      expect(el._elements.stepUp.disabled).to.be.true;
    });

    it('should enable the stepDown and stepUp button when input between min and max value', function () {
      el.min = 1;
      el.max = 5;
      el._elements.input.value = 2;
      el._elements.input.trigger('change');

      expect(el.value).to.equal('2');
      expect(el._elements.stepDown.disabled).to.be.false;
      expect(el._elements.stepUp.disabled).to.be.false;
    });

    it('should update the value with the mouse wheel', function () {
      el.value = '2';
      el._elements.input.focus();

      // scrolls down
      var mouseEvent = document.createEvent('MouseEvents');
      mouseEvent.initEvent('mousewheel', true, true);
      mouseEvent.wheelDelta = 120;

      el._elements.input.dispatchEvent(mouseEvent);
      expect(el.value).to.equal('3');

      // scrolls up
      mouseEvent.wheelDelta = -120;
      el._elements.input.dispatchEvent(mouseEvent);
      expect(el.value).to.equal('2');

      el.disabled = true;

      el._elements.input.dispatchEvent(mouseEvent);
      expect(el.value).to.equal('2');

      el.disabled = false;
      el.readOnly = true;
      el._elements.input.dispatchEvent(mouseEvent);
      expect(el.value).to.equal('2');
    });

    it('should not stop the user from scrolling the page if not focused', function () {
      expect(document.activeElement).to.not.equal(el._elements.input);

      var mouseEvent = document.createEvent('MouseEvents');
      mouseEvent.initEvent('mousewheel', true, true);
      mouseEvent.wheelDelta = 120;
      el._elements.input.dispatchEvent(mouseEvent);

      expect(mouseEvent.defaultPrevented).to.be.false;
    });

    it('should not stop the user from scrolling the page if readOnly', function () {
      el._elements.input.focus();
      el.readOnly = true;

      var mouseEvent = document.createEvent('MouseEvents');
      mouseEvent.initEvent('mousewheel', true, true);
      mouseEvent.wheelDelta = 120;
      el._elements.input.dispatchEvent(mouseEvent);

      expect(mouseEvent.defaultPrevented).to.be.false;
    });

    it('should not stop the user from scrolling the page if disabled', function () {
      el._elements.input.focus();
      el.disabled = true;

      var mouseEvent = document.createEvent('MouseEvents');
      mouseEvent.initEvent('mousewheel', true, true);
      mouseEvent.wheelDelta = 120;
      el._elements.input.dispatchEvent(mouseEvent);

      expect(mouseEvent.defaultPrevented).to.be.false;
    });

    it('should fallback an invalid input to empty string', function () {
      el.value = '5';

      el._elements.input.value = 'asdf';
      helpers.event('change', el._elements.input);

      // value should default empty string
      expect(el.value).to.equal('');
    });

    it('should have the is-focused class when it becomes focused', function () {
      const el = helpers.build('<coral-numberinput value="0"></coral-numberinput>');

      el._elements.input.focus();

      // Force trigger the focus event so that event handler executes on Firefox
      el._elements.input.trigger('focus');

      expect(el.classList.contains('is-focused')).to.be.true;
    });

    it('should not have the is-focused class when it becomes blurred', function () {
      const el = helpers.build('<coral-numberinput value="0"></coral-numberinput>');
      el._elements.input.focus();

      // Force trigger the focus event so that event handler executes on Firefox
      el._elements.input.trigger('focus');

      el._elements.input.blur();

      // Force trigger the blur event so that event handler executes on Firefox
      el._elements.input.trigger('blur');

      expect(el.classList.contains('is-focused')).to.be.false;
    });
  });

  describe('Implementation Details', function () {
    describe('#decimals', function () {
      it('should not return fancy decimal value when increasing the actual value', function () {
        var el = new NumberInput();
        el.value = 65.814;
        el.step = 1.567;
        el.stepUp();
        expect(el.value).to.equal('67.381');
      });

      it('should not return fancy decimal value when decreasing the actual value', function () {
        var el = new NumberInput();
        el.value = 32.907;
        el.step = 1.567;
        el.stepDown();
        expect(el.value).to.equal('31.34');
      });

      it('should still work with integers', function () {
        var el = new NumberInput();
        el.value = 32;
        el.step = 1.567;
        el.stepDown();
        expect(el.value).to.equal('30.433');
        el.stepUp();
        expect(el.value).to.equal('32');
      });

      it('should not return fancy decimal due to multiplier', function () {
        var el = new NumberInput();
        el.value = 2.01;
        el.step = 1.01;
        el.stepDown();
        expect(el.value).to.equal('1');
      });

      it('should work with scientific notations', function () {
        const el = new NumberInput();
        el.step = 0.0000001;
        el.stepUp();
        expect(expect(el.value).to.equal('1e-7'));
        el.stepUp();
        expect(expect(el.value).to.equal('2e-7'));
        el.stepDown();
        expect(expect(el.value).to.equal('1e-7'));
        el.stepDown();
        expect(expect(el.value).to.equal('0'));
        el.stepDown();
        expect(expect(el.value).to.equal('-1e-7'));
        el.stepDown();
        expect(expect(el.value).to.equal('-2e-7'));
      });

      it('should not invalidate input with scientific notations', function () {
        const el = new NumberInput();
        el.step = 0.0000001;
        el.stepUp();
        el.stepUp();
        expect(el.invalid).to.be.false;
      });
    });

    describe('#formField', function () {
      helpers.testFormField(window.__html__['NumberInput.value.html'], {
        value: '5'
      });
    });
  });
});
