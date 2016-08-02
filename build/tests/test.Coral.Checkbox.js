describe('Coral.Checkbox', function() {
  'use strict';

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Checkbox');
    });
  });

  describe('Instantiation', function() {
    it('should be possible using new', function(done) {
      var checkbox = new Coral.Checkbox();
      helpers.next(function() {
        expect(checkbox.$).not.to.have.attr('disabled');
        expect(checkbox.$).not.to.have.attr('readonly');
        expect(checkbox.$).not.to.have.attr('invalid');
        expect(checkbox.$).not.to.have.attr('required');
        expect(checkbox.$).not.to.have.attr('checked');
        expect(checkbox.$).to.have.class('coral-Checkbox');
        expect(helpers.classCount(checkbox)).to.equal(1);
        done();
      });
    });

    it('should be possible to clone the element using markup', function(done) {
      helpers.build(window.__html__['Coral.Checkbox.fromElement.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element without label element using markup', function(done) {
      helpers.build(window.__html__['Coral.Checkbox.withContent.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element with label using markup', function(done) {
      helpers.build(window.__html__['Coral.Checkbox.withLabel.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone using js', function(done) {
      var el = new Coral.Checkbox();
      el.label.innerHTML = 'Test';
      helpers.target.appendChild(el);

      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });

  });

  describe('Markup', function() {
    it('should be possible using markup', function() {
      helpers.build('<coral-checkbox></coral-checkbox>', function(el) {
        expect(el.$).to.have.class('coral-Checkbox');
      });
    });

    it('should be possible using markup with text', function() {
      helpers.build('<coral-checkbox>Checkbox</coral-checkbox>', function(el) {
        expect(el.$).to.have.class('coral-Checkbox');
        expect(el.label.textContent).to.equal('Checkbox');
      });
    });

    it('should be possible using markup with content zone', function() {
      helpers.build('<coral-checkbox><coral-checkbox-label>Checkbox</coral-checkbox-label></coral-checkbox>', function(el) {
        expect(el.$).to.have.class('coral-Checkbox');
        expect(el.label.textContent).to.equal('Checkbox');
      });
    });

  });

  describe('API', function() {
    it('should have defaults', function() {
      var el = new Coral.Checkbox();

      expect(el.checked).to.be.false;
      expect(el.disabled).to.be.false;
      expect(el.name).to.equal('');
      expect(el.value).to.equal('on');
    });

    describe('#value', function() {
      it('should reflect value changes', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.value = 'yes';

        helpers.next(function() {
          expect(checkbox._elements.input.value).to.equal('yes');
          done();
        });
      });
    });

    describe('#checked', function() {
      it('should reflect checked value', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = true;

        helpers.next(function() {
          expect(checkbox.checked).to.be.true;
          expect(checkbox._elements.input.checked).to.be.true;
          expect(checkbox.hasAttribute('checked')).to.be.true;
          done();
        });
      });

      it('should reflect unchecked value', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = false;

        helpers.next(function() {
          expect(checkbox.checked).to.be.false;
          expect(checkbox._elements.input.checked).to.be.false;
          expect(checkbox.hasAttribute('checked')).to.be.false;
          done();
        });
      });

      it('should handle manipulating checked attribute', function(done) {
        var el = new Coral.Checkbox();
        el.setAttribute('checked', '');

        helpers.next(function() {
          expect(el._elements.input.checked).to.be.true;
          expect(el.checked).to.be.true;

          el.removeAttribute('checked');

          helpers.next(function() {
            expect(el._elements.input.checked).to.be.false;
            expect(el.checked).to.be.false;
            done();
          });
        });
      });
    });

    describe('#indeterminate', function() {
      it('should reflect indeterminate value', function(done) {
        var checkbox = new Coral.Checkbox();
        expect(checkbox._elements.input.indeterminate).to.be.false;

        checkbox.indeterminate = true;

        helpers.next(function() {
          expect(checkbox._elements.input.indeterminate).to.be.true;
          expect(checkbox._elements.input.hasAttribute('aria-checked', 'mixed')).to.be.true;
          done();
        });
      });

      it('should not affect checked state when indeterminate state is changed', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.checked = true;
        checkbox.indeterminate = true;

        helpers.next(function() {
          expect(checkbox._elements.input.checked, 'when indeterminate is set').to.be.true;
          expect(checkbox.checked).to.be.true;

          checkbox.indeterminate = false;

          helpers.next(function() {
            expect(checkbox._elements.input.checked, 'after indeterminate is changed to false').to.be.true;
            expect(checkbox.checked).to.be.true;
            done();
          });
        });
      });

      it('should not affect indeterminate state when checked state is changed', function(done) {
        var checkbox = new Coral.Checkbox();
        checkbox.indeterminate = true;
        checkbox.checked = true;

        helpers.next(function() {
          expect(checkbox.indeterminate).to.be.true;
          expect(checkbox._elements.input.indeterminate, 'when checked is set').to.be.true;

          checkbox.checked = false;

          helpers.next(function() {
            expect(checkbox.indeterminate).to.be.true;
            expect(checkbox._elements.input.indeterminate, 'after checked is changed to false').to.be.true;
            done();
          });
        });
      });

      it('should be removed on user interaction', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);

        checkbox.indeterminate = true;

        checkbox._elements.input.click();
        helpers.next(function() {
          expect(checkbox.indeterminate).to.be.false;
          expect(checkbox._elements.input.indeterminate).to.be.false;
          expect(checkbox.checked).to.be.true;
          expect(checkbox.$).to.have.attr('checked');
          done();
        });
      });
    });

    describe('#disabled', function() {
      it('should reflect disabled value', function(done) {
        var el = new Coral.Checkbox();
        el.disabled = true;

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.true;
          done();
        });
      });

      it('should reflect enabled value', function(done) {
        var el = new Coral.Checkbox();
        el.disabled = false;

        helpers.next(function() {
          expect(el._elements.input.disabled).to.be.false;
          done();
        });
      });

      it('should handle manipulating disabled attribute', function(done) {
        var el = new Coral.Checkbox();
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

    describe('#label', function() {
      it('should hide label when content set to empty', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);
        checkbox.label.innerHTML = 'Test';
        checkbox.show();

        helpers.next(function() {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);

          checkbox.label.innerHTML = '';
          helpers.next(function() {
            expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
            done();
          });
        });
      });

      it('should hide label when content set to empty when not in DOM', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);
        checkbox.label.innerHTML = 'Test';
        checkbox.show();

        helpers.next(function() {
          expect(checkbox._elements.labelWrapper.hidden).to.equal(false);

          helpers.target.removeChild(checkbox);
          checkbox.label.innerHTML = '';

          /*
            Note: this must be async, otherwise IE 9 will not get a mutation at all

            // This does not work in IE 9
            window.checkbox = checkbox
            checkbox.parentNode.removeChild(checkbox)
            checkbox.label.innerHTML = '';
            document.body.appendChild(checkbox)
          */
          helpers.next(function() {
            helpers.target.appendChild(checkbox);

            helpers.next(function() {
              expect(checkbox._elements.labelWrapper.hidden).to.equal(true);
              done();
            });
          });
        });
      });
    });

    describe('#rendering', function() {
      it('should render chechbox with only one input, checkbox, span and label element', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);

        helpers.next(function() {
          expectCheckboxChildren(done);
        });
      });

      it('should render clone of a chechbox with only one input, checkbox, span and label element', function(done) {
        var checkbox = new Coral.Checkbox();
        helpers.target.appendChild(checkbox);

        helpers.target.appendChild(checkbox.cloneNode());

        helpers.target.removeChild(checkbox);

        helpers.next(function() {
          expectCheckboxChildren(done);
        });
      });

      function expectCheckboxChildren(done) {
        helpers.next(function() {
          expect(helpers.target.querySelectorAll('coral-checkbox-label').length).to.equal(1);
          expect(helpers.target.querySelectorAll('input[handle="input"]').length).to.equal(1);
          expect(helpers.target.querySelectorAll('span[handle="checkbox"]').length).to.equal(1);
          expect(helpers.target.querySelectorAll('label[handle="labelWrapper"]').length).to.equal(1);
          done();
        });
      }
    });

  });

  describe('events', function() {
    var checkbox;
    var changeSpy;
    var preventSpy;

    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();

      checkbox = new Coral.Checkbox();
      helpers.target.appendChild(checkbox);

      // changeSpy and preventSpy for event bubble
      $(document).on('change', function(event) {

        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-CHECKBOX');

        changeSpy();

        if (event.isDefaultPrevented()) {
          preventSpy();
        }
      });

      expect(changeSpy.callCount).to.equal(0);
    });

    afterEach(function() {
      $(document).off('change');
    });

    it('should trigger change on click', function(done) {
      checkbox._elements.input.click();
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        expect(checkbox.checked).to.be.true;
        expect(checkbox.$).to.have.attr('checked');
        done();
      });
    });

    it('should trigger change on indeterminate set', function(done) {
      checkbox.indeterminate = true;

      expect(checkbox.indeterminate).to.be.true;
      expect(checkbox.checked).to.be.false;

      checkbox.click();
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        expect(checkbox.checked).to.be.true;
        expect(checkbox.indeterminate).to.be.false;
        expect(checkbox.$).to.have.attr('checked');
        done();
      });
    });

    it('should not trigger change event, when checked property', function(done) {
      checkbox.checked = true;
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });

    it('should trigger change event, when clicked', function(done) {
      expect(checkbox.checked).to.be.false;
      checkbox._elements.input.click();
      helpers.next(function() {
        expect(checkbox.checked).to.be.true;
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(1);
        done();
      });
    });

    it('should not trigger change event if value changed', function(done) {
      checkbox.value = 'value';
      helpers.next(function() {
        expect(preventSpy.callCount).to.equal(0);
        expect(changeSpy.callCount).to.equal(0);
        done();
      });
    });
  });

  describe('in a form', function() {

    var checkbox;

    beforeEach(function() {
      var form = document.createElement('form');
      form.id = 'testForm';
      helpers.target.appendChild(form);

      checkbox = new Coral.Checkbox();
      checkbox.name = 'formCheckbox';
      form.appendChild(checkbox);
    });

    it('should include the internal input value when checked', function(done) {
      checkbox.checked = true;
      expectFormSubmitContentToEqual('formCheckbox=on', done);
    });

    it('should not include the internal input value when not checked', function(done) {
      // default is not checked
      expectFormSubmitContentToEqual('', done);
    });

    it('should not include the internal input value when not named', function(done) {
      checkbox.name = '';
      expectFormSubmitContentToEqual('', done);
    });

    it('should include the new value if the value was changed', function(done) {
      checkbox.value = 'kittens';
      checkbox.checked = true;
      expectFormSubmitContentToEqual('formCheckbox=kittens', done);
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
      helpers.testFormField(window.__html__['Coral.Checkbox.fromElement.html'], {
        value: 'on',
        default: 'on'
      });
    });

    it('should hide/show label depending on the content', function(done) {
      var el = new Coral.Checkbox();

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
      var el = new Coral.Checkbox();

      var label = new Coral.Checkbox.Label();
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
