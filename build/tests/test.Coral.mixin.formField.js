describe('Coral.mixin.formField', function() {
  'use strict';

  function dispatchChangeEvent(element) {
    var event = document.createEvent('HTMLEvents');
    event.initEvent('change', true, true);
    element.dispatchEvent(event);
  }

  // demo component used for the tests
  before(function() {
    Coral.register({
      tagName: 'coral-formfield-example',
      name: 'FormFieldExample',

      mixins: [
        Coral.mixin.formField
      ],

      properties: {
        'disabled': {
          sync: function() {
            this.$.toggleClass('is-disabled', this.disabled);
            this._elements.input.disabled = this.disabled;
          }
        },
        'invalid': {
          sync: function() {
            this.$.toggleClass('is-invalid', this.invalid);
          }
        },
        'required': {
          sync: function() {
            this.$.toggleClass('is-required', this.required);
          }
        },
        'readOnly': {
          sync: function() {
            this.$.toggleClass('is-readonly', this.readOnly);
          }
        },
        'name': {
          set: function(name) {
            this._elements.input.name = name;
          },
          get: function() {
            return this._elements.input.name;
          }
        },
        'value': {
          set: function(value) {
            this._elements.input.value = value;
          },
          get: function() {
            return this._elements.input.value;
          }
        }
      },

      _render: function() {
        var input = document.createElement('input');
        input.type = 'text';
        this._elements.input = input;
        this.appendChild(input);
      },

      clear: function() {
        this._elements.input.value = '';
      }
    });

    Coral.register({
      tagName: 'coral-formfield-checkbox',
      name: 'FormFieldCheckbox',
      mixins: [
        Coral.mixin.formField
      ],

      properties: {
        'checked': {
          default: false,
          reflectAttribute: true,
          transform: Coral.transform.boolean,
          attributeTransform: Coral.transform.booleanAttr,
          get: function() {
            return this._elements.input.checked;
          },
          set: function(value) {
            this._elements.input.checked = value;
          }
        },
        'name': {
          set: function(value) {
            this._elements.input.name = name;
          },
          get: function() {
            return this._elements.input.name;
          }
        },
        'value': {
          set: function(value) {
            this._elements.input.value = value;
          },
          get: function() {
            return this._elements.input.value;
          }
        }
      },

      // overrides completely the method
      _onInputChange: function(event) {
        event.stopPropagation();

        this.checked = event.target.checked;

        // we need to handle trigger now, since we override the method competely
        this.trigger('change');
      },

      _render: function() {
        var input = document.createElement('input');
        input.type = 'checkbox';
        this._elements.input = input;
        this.appendChild(input);
      },

      clear: function() {
        this._elements.input.checked = false;
      }
    });

    Coral.register({
      tagName: 'coral-formfield-checkbox-withtargetproperties',
      name: 'FormFieldCheckboxWithTargetProperties',
      mixins: [
        Coral.mixin.formField
      ],

      properties: {
        'checked': {
          default: false,
          reflectAttribute: true,
          transform: Coral.transform.boolean,
          attributeTransform: Coral.transform.booleanAttr,
          get: function() {
            return this._elements.input.checked;
          },
          set: function(value) {
            this._elements.input.checked = value;
          }
        },
        'name': {
          set: function(name) {
            this._elements.input.name = name;
          },
          get: function() {
            return this._elements.input.name;
          }
        },
        'value': {
          set: function(value) {
            this._elements.input.value = value;
          },
          get: function() {
            return this._elements.input.value;
          }
        }
      },

      /* overrides the component property that is affected by the input change */
      _componentTargetProperty: 'checked',
      /* overrides the event property that is affected by the input change */
      _eventTargetProperty: 'checked',
      /* indicates that no change should be triggered. */
      _triggerChangeEvent: false,

      _render: function() {
        var input = document.createElement('input');
        input.type = 'checkbox';
        this._elements.input = input;
        this.appendChild(input);
      },

      clear: function() {
        this._elements.input.checked = false;
      }
    });

    Coral.register({
      tagName: 'coral-formfield-checkbox-withtargetpropertiesandtrigger',
      name: 'FormFieldCheckboxWithTargetPropertiesAndTrigger',
      mixins: [
        Coral.mixin.formField
      ],

      properties: {
        'checked': {
          default: false,
          reflectAttribute: true,
          transform: Coral.transform.boolean,
          attributeTransform: Coral.transform.booleanAttr,
          set: function(value) {
            this._checked = value;
            this._elements.input.checked = value;
          }
        },
        'name': {
          set: function(name) {
            this._elements.input.name = name;
          },
          get: function() {
            return this._elements.input.name;
          }
        },
        'value': {
          set: function(value) {
            this._elements.input.value = value;
          },
          get: function() {
            return this._elements.input.value;
          }
        }
      },

      /* overrides the component property that is affected by the input change */
      _componentTargetProperty: 'checked',
      /* overrides the event property that is affected by the input change */
      _eventTargetProperty: 'checked',
      /* indicates that a change should be triggered. */
      _triggerChangeEvent: true,

      _render: function() {
        var input = document.createElement('input');
        input.type = 'checkbox';
        this._elements.input = input;
        this.appendChild(input);
      }
    });
  });

  describe('mixin', function() {
    var noop = function() {};

    // Coral.register.defineProperties needs these to be declared
    var fakeComponentProto = {
      _properties: {},
      _attributes: {}
    };

    it('should be defined in Coral.mixin namespace', function() {
      expect(Coral.mixin).to.have.property('formField');
    });

    it('should throw if required setters are not implemented', function() {
      expect(function() {
        Coral.mixin.formField(
          Coral.commons.extend({}, fakeComponentProto),
          {
            properties: {
              name: {
                set: noop,
                get: noop
              }
            }
          }
        );
      }).to.throw(Error);

      expect(function() {
        Coral.mixin.formField(
          Coral.commons.extend({}, fakeComponentProto),
          {
            properties: {
              value: {
                set: noop,
                get: noop
              }
            }
          }
        );
      }).to.throw(Error);

      expect(function() {
        Coral.mixin.formField(
          Coral.commons.extend({}, fakeComponentProto),
          {
            properties: {
              name: {
                set: noop,
                get: noop
              },
              value: {
                set: noop
              }
            }
          }
        );
      }).to.throw(Error);

      expect(function() {
        Coral.mixin.formField(
          Coral.commons.extend({}, fakeComponentProto),
          {
            properties: {
              name: {
                set: noop
              },
              value: {
                set: noop
              }
            }
          }
        );
      }).to.throw(Error);

      expect(function() {
        Coral.mixin.formField(
          Coral.commons.extend({}, fakeComponentProto),
          {
            properties: {
              name: {
                set: noop,
                get: noop
              },
              value: {
                set: noop,
                get: noop
              }
            }
          }
        );
      }).to.not.throw(Error);
    });

    it('should not replace overridden set methods when overide: true', function() {
      var fakeComponent = Coral.commons.extend({}, fakeComponentProto);

      var options = {
        properties: {
          'value': {
            override: true,
            set: noop,
            get: noop
          },
          'name': {
            override: true,
            set: noop,
            get: noop
          }
        }
      };
      Coral.mixin.formField(fakeComponent, options);

      expect(options.properties.name.set).to.equal(noop);
      expect(options.properties.value.set).to.equal(noop);
      expect(options.properties.name.get).to.equal(noop);
      expect(options.properties.value.get).to.equal(noop);
    });

    it('should not attempt to redefine name and value property if defined in prototype chain', function() {
      var fakeComponent = Object.create(HTMLInputElement.prototype);
      Coral.commons.extend(fakeComponent, fakeComponentProto);

      var options = {
        properties: {}
      };
      Coral.mixin.formField(fakeComponent, options);

      expect(options.properties.disabled).to.be.undefined;
      expect(options.properties.name).to.be.undefined;
      expect(options.properties.value).to.be.undefined;
      expect(options.properties.required).to.be.undefined;
      expect(options.properties.readOnly).to.be.undefined;
      expect(options.properties.invalid).to.not.be.undefined;
    });

    it('should not attempt to redefine name and value property if defined in prototype chain', function() {
      var fakeComponent = Object.create(HTMLTextAreaElement.prototype);
      Coral.commons.extend(fakeComponent, fakeComponentProto);

      var options = {
        properties: {}
      };
      Coral.mixin.formField(fakeComponent, options);

      expect(options.properties.disabled).to.be.undefined;
      expect(options.properties.name).to.be.undefined;
      expect(options.properties.value).to.be.undefined;
      expect(options.properties.required).to.be.undefined;
      expect(options.properties.readOnly).to.be.undefined;
      expect(options.properties.invalid).to.not.be.undefined;
    });
  });

  describe('FormField compliance', function() {
    helpers.testFormField('<coral-formfield-example></coral-formfield-example>', {
      value: 'testValue'
    });
  });

  describe('API', function() {
    describe('#clear()', function() {
      it('should reset the value when called', function() {
        var element = new Coral.FormFieldCheckboxWithTargetProperties();

        element.value = 1;
        element.checked = true;

        element.clear();

        expect(element.value).to.equal('1');
        expect(element.checked).to.be.false;
      });
    });

    it('should call overridden sync methods as well as mixin methods', function(done) {
      var example = new Coral.FormFieldExample();

      expect(example.$).to.not.have.class('is-readonly');
      expect(example.$).to.not.have.attr('aria-readonly', 'true');
      example.readOnly = true;

      helpers.next(function() {
        expect(example.$).to.have.class('is-readonly');
        expect(example.$).to.have.attr('aria-readonly', 'true');
        done();
      });
    });

    describe('#value', function() {
      it('should always have a string for value', function() {
        var example = new Coral.FormFieldExample();
        expect(example.value).to.equal('');
        example.value = null;
        expect(example.value).to.equal('');
        example.value = undefined;
        expect(example.value).to.equal('');
        example.value = 0; // falsy value
        expect(example.value).to.equal('0');
      });
    });

    describe('#labelledBy', function() {
      it('should remove old for assignments', function() {
        var label1 = document.createElement('label');
        var label2 = document.createElement('label');

        var example = new Coral.FormFieldExample();
        var example2 = new Coral.FormFieldExample();

        label1.id = Coral.commons.getUID();
        label2.id = Coral.commons.getUID();
        label1.textContent = 'label 1';
        label2.textContent = 'label 2';

        helpers.target.appendChild(label1);
        helpers.target.appendChild(example);
        helpers.target.appendChild(example2);
        helpers.target.appendChild(label2);

        example.labelledBy = label1.id;
        example2.labelledBy = label2.id;

        expect(label1.getAttribute('for')).to.equal(example._elements.input.id);
        expect(label2.getAttribute('for')).to.equal(example2._elements.input.id);
        expect(example._elements.input.getAttribute('aria-labelledby')).to.equal(label1.id);
        expect(example2._elements.input.getAttribute('aria-labelledby')).to.equal(label2.id);

        example.labelledBy = label2.id;
        example2.labelledBy = label1.id;

        expect(label1.getAttribute('for')).to.equal(example2._elements.input.id);
        expect(label2.getAttribute('for')).to.equal(example._elements.input.id);
        expect(example._elements.input.getAttribute('aria-labelledby')).to.equal(label2.id);
        expect(example2._elements.input.getAttribute('aria-labelledby')).to.equal(label1.id);
      });
    });
  });

  describe('Markup', function() {
    describe('#disabled', function() {
      it('should be initially false', function(done) {
        helpers.build('<coral-formfield-example></coral-formfield-example>', function(el) {
          expect(el.disabled).to.be.false;
          expect(el._elements.input.disabled).to.be.false;
          expect(el.$).not.to.have.attr('disabled');
          done();
        });
      });

      it('should disable the component', function(done) {
        helpers.build('<coral-formfield-example disabled></coral-formfield-example>', function(el) {
          expect(el.disabled).to.be.true;
          expect(el.$).to.have.attr('disabled');

          expect(el._elements.input.disabled).to.be.true;
          expect($(el._elements.input)).to.have.attr('disabled');

          expect(helpers.classCount(el)).to.equal(1);
          expect(el.className.trim()).not.to.equal('');
          done();
        });
      });

      it('should enable the component when the attribute is removed', function(done) {
        helpers.build('<coral-formfield-example disabled></coral-formfield-example>', function(el) {
          expect(el.disabled).to.be.true;
          expect(el.$).to.have.attr('disabled');
          el.removeAttribute('disabled');
          expect(el.disabled).to.be.false;

          Coral.commons.nextFrame(function() {
            expect(el._elements.input.disabled).to.be.false;
            expect($(el._elements.input)).not.to.have.attr('disabled');
            expect(el.className.trim()).to.equal('');
            done();
          });
        });
      });
    });

    describe('#reset()', function() {
      it('should reset the value to empty string if no value is provided', function(done) {
        helpers.build('<coral-formfield-example></coral-formfield-example>', function(el) {
          expect(el.value).to.equal('');

          el.value = 'test';

          el.reset();

          expect(el.value).to.equal('');
          done();
        });
      });

      it('should reset the value to the inital value in the DOM', function(done) {
        helpers.build('<coral-formfield-example value="test"></coral-formfield-example>', function(el) {
          expect(el.value).to.equal('test');

          el.value = 'new value';

          el.reset();

          expect(el.value).to.equal('test');
          done();
        });
      });
    });
  });

  describe('Events', function() {
    it('should fire change when input triggers change', function() {
      var element = new Coral.FormFieldExample();
      helpers.target.appendChild(element);
      var valueSpy = sinon.spy();
      element.on('change', valueSpy);

      element._elements.input.value = 1;

      dispatchChangeEvent(element._elements.input);

      expect(valueSpy.callCount).to.equal(1);
    });

    it('checkbox: should not fire change when value changed', function() {
      var element = new Coral.FormFieldCheckbox();
      helpers.target.appendChild(element);
      var valueSpy = sinon.spy();
      element.on('change', valueSpy);
      element.value = 1;
      expect(valueSpy.callCount).to.equal(0);
    });

    it('checkbox with target properties: should not fire change when value changed', function() {
      var element = new Coral.FormFieldCheckboxWithTargetProperties();
      helpers.target.appendChild(element);
      var valueSpy = sinon.spy();
      element.on('change', valueSpy);
      element.value = 1;
      expect(valueSpy.callCount).to.equal(0);
    });

    it('checkbox: should have the correct value when event triggered', function() {
      var element = new Coral.FormFieldCheckboxWithTargetPropertiesAndTrigger();
      helpers.target.appendChild(element);
      var valueSpy = sinon.spy();

      var checkedDuringChange;
      element.on('change', function() {
        checkedDuringChange = element.checked;
        valueSpy();
      });

      element._elements.input.checked = true;
      dispatchChangeEvent(element._elements.input);

      expect(valueSpy.callCount).to.equal(1);
      expect(element.checked).to.equal(true, 'checked value after trigger');
      expect(checkedDuringChange).to.equal(true, 'checked value during trigger');
    });

    it('should update the value on input trigger', function() {
      var element = new Coral.FormFieldExample();
      helpers.target.appendChild(element);

      var valueSpy = sinon.spy();
      element.on('change', function(event) {
        valueSpy();

        // the target has to be the component and not the input
        expect(event.target.tagName).to.equal('CORAL-FORMFIELD-EXAMPLE');
      });

      // This should not trigger a change event
      element.value = '1';

      // The value should change
      expect(element.value).to.equal('1');
      expect(element._elements.input.value).to.equal('1');

      // Trigger a change event
      element._elements.input.value = 5;
      dispatchChangeEvent(element._elements.input);

      expect(element.value).to.equal('5');
      expect(valueSpy.callCount).to.equal(1);
    });

    it('checkbox: should not trigger change when value is updated', function() {
      var element = new Coral.FormFieldCheckbox();
      helpers.target.appendChild(element);

      var valueSpy = sinon.spy();
      element.on('change', valueSpy);
      element.value = '1';
      expect(element.value).to.equal('1');
      element._elements.input.value = 5;
      dispatchChangeEvent(element._elements.input);
      expect(element.value).to.equal('5');
      expect(valueSpy.callCount).to.equal(1);
    });

    it('checkbox: should trigger change after user interaction', function() {
      var element = new Coral.FormFieldCheckbox();
      helpers.target.appendChild(element);

      var valueSpy = sinon.spy();
      element.on('change', valueSpy);
      expect(element.checked).to.be.false;
      element._elements.input.click();
      expect(element.checked).to.be.true;
      expect(valueSpy.callCount).to.equal(1);
    });

    it('checkbox: should trigger change when input is checked', function() {
      var element = new Coral.FormFieldCheckbox();
      helpers.target.appendChild(element);

      var checkedSpy = sinon.spy();
      element.on('change', checkedSpy);
      // this should not trigger an event
      element.checked = true;
      expect(element.checked).to.be.true;
      element._elements.input.checked = false;
      // this should trigger an event
      dispatchChangeEvent(element._elements.input);
      expect(element.checked).to.be.false;
      expect(checkedSpy.callCount).to.equal(1);
    });

    it.skip('checkbox with target properties: should not trigger change when value is updated', function() {
      var element = new Coral.FormFieldCheckboxWithTargetProperties();
      helpers.target.appendChild(element);

      var valueSpy = sinon.spy();
      element.on('change', valueSpy);
      element.value = '1';
      expect(element.value).to.equal('1');
      element._elements.input.value = 5;
      dispatchChangeEvent(element._elements.input);
      expect(element.value).to.equal('5');
      expect(valueSpy.callCount).to.equal(0);
    });

    it('checkbox with target properties: should trigger change when input is checked', function() {
      var element = new Coral.FormFieldCheckboxWithTargetProperties();
      helpers.target.appendChild(element);

      var checkedSpy = sinon.spy();
      element.on('change', checkedSpy);
      // this should not trigger an event
      element.checked = true;
      expect(element.checked).to.be.true;
      element._elements.input.checked = false;
      // this should not trigger an event because we blocked it with the configuration
      dispatchChangeEvent(element._elements.input);
      expect(element.checked).to.be.false;
      expect(checkedSpy.callCount).to.equal(0);
    });
  });
});
