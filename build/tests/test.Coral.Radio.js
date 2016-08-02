describe('Coral.Radio', function() {
  'use strict';

  var helpers = window.helpers;
  /*jshint camelcase:false */
  var defaultMarkup = window.__html__['Coral.Radio.fromElement.html'];

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Radio');
    });
  });

  describe('instantiation', function() {
    it('should be possible using new', function(done) {
      var radio = new Coral.Radio();
      helpers.next(function() {
        expect(radio.$).not.to.have.attr('disabled');
        expect(radio.$).not.to.have.attr('readonly');
        expect(radio.$).not.to.have.attr('invalid');
        expect(radio.$).not.to.have.attr('required');
        expect(radio.$).not.to.have.attr('checked');
        expect(radio.$).to.have.class('coral-Radio');
        expect(helpers.classCount(radio)).to.equal(1);
        done();
      });
    });

    it('should be possible to clone the element using markup', function(done) {
      helpers.build(defaultMarkup, function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element with content using markup', function(done) {
      helpers.build(window.__html__['Coral.Radio.withLabel.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var el = new Coral.Radio();
      el.label.innerHTML = 'Test';
      helpers.target.appendChild(el);

      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });

  });

  describe('markup', function() {
    describe('#checked', function() {
      it('should handle manipulating checked attribute', function(done) {

        helpers.build(defaultMarkup, function(el) {

          el.setAttribute('checked', '');

          helpers.next(function() {
            expect(el._elements.input.checked).to.be.true;
            expect(el.checked).to.be.true;
            expect(el.$).to.have.attr('checked');

            el.removeAttribute('checked');

            helpers.next(function() {
              expect(el._elements.input.checked).to.be.false;
              expect(el.checked).to.be.false;
              expect(el.$).not.to.have.attr('checked');
              done();
            });
          });
        });
      });
    });
  });

  describe('API', function() {

    it('should have proper defaults', function() {
      var radio = new Coral.Radio();

      expect(radio.checked).to.be.false;
      expect(radio.label.textContent).to.equal('');
      expect(radio.name).to.equal('');
      expect(radio.value).to.equal('on');
      expect(radio.disabled).to.be.false;
      expect(radio.required).to.be.false;
      expect(radio.readOnly).to.be.false;
      expect(radio.invalid).to.be.false;
    });

    describe('#label', function() {

      it('should be initially hidden', function(done) {
        var el = new Coral.Radio();

        expect(el.label.textContent).to.equal('');

        helpers.next(function() {
          expect(el._elements.labelWrapper.textContent).to.equal('');
          expect($(el._elements.labelWrapper)).to.have.attr('hidden');
          done();
        });
      });

      it('should hide label when content set to empty', function(done) {
        var el = new Coral.Radio();
        helpers.target.appendChild(el);
        el.label.innerHTML = 'Test';
        el.show();

        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.equal(false);

          el.label.innerHTML = '';
          helpers.next(function() {
            expect(el._elements.labelWrapper.hidden).to.equal(true);
            done();
          });
        });
      });

      it('should hide label when content set to empty when not in DOM', function(done) {
        var el = new Coral.Radio();
        helpers.target.appendChild(el);
        el.label.innerHTML = 'Test';
        el.show();

        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.equal(false);

          helpers.target.removeChild(el);
          el.label.innerHTML = '';

          /*
            Note: this must be async, otherwise IE 9 will not get a mutation at all

            // This does not work in IE 9
            window.el = el
            el.parentNode.removeChild(el)
            el.label.innerHTML = '';
            document.body.appendChild(el)
          */
          helpers.next(function() {
            helpers.target.appendChild(el);

            helpers.next(function() {
              expect(el._elements.labelWrapper.hidden).to.equal(true);
              done();
            });
          });
        });
      });
    });

    describe('#value', function() {
      it('should reflect value changes', function(done) {
        var el = new Coral.Radio();
        el.value = 'yes';

        helpers.next(function() {
          expect(el._elements.input.value).to.equal('yes');
          done();
        });
      });
    });

    describe('#checked', function() {
      it('should reflect checked value', function(done) {
        var el = new Coral.Radio();
        el.checked = 123; // truthy

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.true;
          expect(el.checked).to.be.true;
          expect(el.$).to.have.attr('checked');
          done();
        });
      });

      it('should reflect unchecked value', function(done) {
        var el = new Coral.Radio();
        el.checked = ''; // falsy

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.false;
          expect(el.checked).to.be.false;
          expect(el.$).not.to.have.attr('checked');
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should reflect disabled value', function(done) {
        var el = new Coral.Radio();
        el.disabled = 123; // truthy

        helpers.next(function() {
          expect(el.$).to.have.attr('disabled');
          expect(el.$).to.have.class('is-disabled');
          expect(el._elements.input.disabled).to.be.true;
          done();
        });
      });

      it('should reflect enabled value', function(done) {
        var el = new Coral.Radio();
        el.disabled = ''; // falsy

        helpers.next(function() {
          expect(el.$).not.to.have.attr('disabled');
          expect(el.$).not.to.have.class('is-disabled');
          expect(el._elements.input.disabled).to.be.false;
          done();
        });
      });

      it('should handle manipulating disabled attribute', function(done) {
        var el = new Coral.Radio();
        el.setAttribute('disabled', '');

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.true;
          expect(el.disabled).to.be.true;

          el.removeAttribute('disabled');

          helpers.next(function() {
            expect(el._elements.input.disabled).to.be.false;
            expect(el.disabled).to.be.false;
            done();
          });
        });
      });
    });

    describe('#rendering', function() {
      it('should render with only one input, radio, span and label element', function(done) {
        var radio = new Coral.Radio();
        helpers.target.appendChild(radio);

        helpers.next(function() {
          expectRadioChildren(done);
        });
      });

      it('should render clone with only one input, radio, span and label element', function(done) {
        var radio = new Coral.Radio();
        helpers.target.appendChild(radio);

        helpers.target.appendChild(radio.cloneNode());

        helpers.target.removeChild(radio);

        helpers.next(function() {
          expectRadioChildren(done);
        });
      });

      function expectRadioChildren(done) {
        helpers.next(function() {
          expect(helpers.target.querySelectorAll('coral-radio-label').length).to.equal(1);
          expect(helpers.target.querySelectorAll('input[handle="input"]').length).to.equal(1);
          expect(helpers.target.querySelectorAll('span[handle="checkmark"]').length).to.equal(1);
          expect(helpers.target.querySelectorAll('label[handle="labelWrapper"]').length).to.equal(1);
          done();
        });
      }
    });

  });

  describe('events', function() {
    var radio;
    var changeSpy;
    var preventSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();

      radio = new Coral.Radio();
      helpers.target.appendChild(radio);

      // changeSpy and preventSpy for event bubble
      $(document).on('change', function(event) {

        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-RADIO');

        changeSpy();

        if (event.isDefaultPrevented()) {
          preventSpy();
        }
      });

      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      helpers.target.removeChild(radio);
      $(document).off('change');
    });

    it('should trigger change on click', function(done) {
      radio._elements.input.click();
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        expect(radio.checked).to.be.true;
        expect(radio.$).to.have.attr('checked');
        done();
      });
    });

    it('should not trigger change event when setting checked property', function(done) {
      radio.checked = true;
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });


    it('should trigger change event, when clicked', function(done) {
      expect(radio.checked).to.be.false;
      radio._elements.input.click();
      helpers.next(function() {
        expect(radio.checked).to.be.true;
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should not trigger change event if value changed', function(done) {
      radio.value = 'value';
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });
  });

  describe('named sets', function() {

    var radios;

    beforeEach(function() {
      var index = 0;
      radios = [];
      while (index < 3) {
        radios.push(buildNamedRadio('radio' + index++));
      }
    });

    afterEach(function() {
      radios = null;
    });

    it('should correctly maintain one checked member', function(done) {
      radios[0].checked = true;
      expectOnlyCheckedRadioToBe(0);

      radios[1].checked = true;
      expectOnlyCheckedRadioToBe(1);

      radios[2].checked = true;
      expectOnlyCheckedRadioToBe(2);

      done();
    });

    describe('when dynamic', function() {

      it('should not change checked member if unchecked radio is added', function(done) {
        radios[0].checked = true;
        expectOnlyCheckedRadioToBe(0);

        radios.push(buildNamedRadio('dynamic'));
        expectOnlyCheckedRadioToBe(0);

        radios[3].checked = true;
        expectOnlyCheckedRadioToBe(3);

        done();
      });

      it('should change checked member if checked radio is added', function(done) {
        radios[0].checked = true;
        expectOnlyCheckedRadioToBe(0);

        var dynamicMember = buildNamedRadio('dynamic');
        dynamicMember.checked = true;
        radios.push(dynamicMember);

        expectOnlyCheckedRadioToBe(3);

        done();
      });

    });

    function expectOnlyCheckedRadioToBe(checkedIndex) {
      if (checkedIndex > radios.length - 1) {
        throw new Error('UR DOING IT WRONG');
      }
      for (var i = 0; i < radios.length; i++) {
        var expectedState = i === checkedIndex ? true : false;
        var radio = radios[i];
        expect(radio.checked, 'member checked at ' + i).to.equal(expectedState);
      }
    }

    function buildNamedRadio(value) {
      var instance = new Coral.Radio();
      instance.name = 'namedRadio';
      instance.value = value;
      helpers.target.appendChild(instance);
      return instance;
    }

  });

  describe('in a form', function() {

    var radio;

    beforeEach(function() {
      var form = document.createElement('form');
      form.id = 'testForm';
      helpers.target.appendChild(form);

      radio = new Coral.Radio();
      radio.name = 'formRadio';
      form.appendChild(radio);
    });

    afterEach(function() {
      radio = null;
    });

    it('should include the internal input value when checked', function(done) {
      radio.checked = true;
      expectFormSubmitContentToEqual('formRadio=on', done);
    });

    it('should not include the internal input value when not checked', function(done) {
      // default is not checked
      expectFormSubmitContentToEqual('', done);
    });

    it('should not include the internal input value when not named', function(done) {
      radio.name = '';
      expectFormSubmitContentToEqual('', done);
    });

    it('should include the new value if the value was changed', function(done) {
      radio.value = 'kittens';
      radio.checked = true;
      expectFormSubmitContentToEqual('formRadio=kittens', done);
    });

    function expectFormSubmitContentToEqual(expectedValue, done) {
      helpers.next(function() {
        var content = $('#testForm').serialize();
        expect(content).to.equal(expectedValue);
        done();
      });
    }
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Radio.fromElement.html'], {
        value: 'on',
        default: 'on'
      });
    });

    it('should hide/show label depending on the content', function(done) {
      var el = new Coral.Radio();

      helpers.next(function() {
        expect(el._elements.labelWrapper.hidden).to.equal(true, 'The wrapper must be hidden since there are no contents');

        el.label.textContent = 'Label content';

        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.equal(false, 'The wrapper must be visible');

          done();
        });
      });
    });

    it('should allow replacing the content zone', function(done) {
      var el = new Coral.Radio();

      var label = new Coral.Radio.Label();
      label.textContent = 'Content';

      helpers.next(function() {
        expect(el._elements.labelWrapper.hidden).to.be.true;
        el.label = label;

        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.be.false;

          done();
        });
      });
    });
  });
});
