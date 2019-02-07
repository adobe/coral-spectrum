import {tracking} from '../../../coral-utils';
import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Radio} from '../../../coral-component-radio';
import {events, commons} from '../../../coral-utils';

describe('Radio', function() {
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Radio).to.have.property('Label');
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible using new', function() {
      var radio = helpers.build(new Radio());
      
      ['disabled', 'readonly', 'invalid', 'required', 'checked'].forEach(function(attr) {
        expect(radio.hasAttribute(attr)).to.be.false;
      });
      expect(radio.classList.contains('_coral-Radio')).to.be.true;
    });
  
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['Radio.fromElement.html']
    );
    
    helpers.cloneComponent(
      'should be possible to clone the element with content using markup',
      window.__html__['Radio.withLabel.html']
    );
  
    helpers.cloneComponent(
      'should be possible to clone using js',
      new Radio().set({
        label: {
          innerHTML: 'Test'
        }
      })
    );
  });
  
  describe('API', function() {
    it('should have proper defaults', function() {
      var radio = new Radio();
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
      it('should be initially hidden', function() {
        var el = new Radio();
        
        expect(el.label.textContent).to.equal('');
        expect(el._elements.labelWrapper.textContent).to.equal('');
        expect(el._elements.labelWrapper.hasAttribute('hidden')).to.be.true;
      });
      
      it('should show label when content is not empty', function() {
        const el = helpers.build(window.__html__['Radio.withLabel.html']);
        expect(el._elements.labelWrapper.hidden).to.equal(false);
      });
  
      it('should hide label when content set to empty', function(done) {
        var radio = new Radio();
        helpers.target.appendChild(radio);
    
        expect(radio._elements.labelWrapper.hidden).to.equal(true);
    
        radio.label.innerHTML = 'Test';
    
        // Wait for MO
        helpers.next(() => {
          expect(radio._elements.labelWrapper.hidden).to.equal(false);
      
          radio.label.innerHTML = '';
      
          // Wait for MO
          helpers.next(() => {
            expect(radio._elements.labelWrapper.hidden).to.equal(true);
            done();
          });
        });
      });
      
      it('should hide label when content set to empty when not in DOM', function(done) {
        var el = helpers.build(new Radio());
  
        expect(el._elements.labelWrapper.hidden).to.equal(true);
        
        el.label.innerHTML = 'Test';

        // Wait for MO
        helpers.next(() => {
          expect(el._elements.labelWrapper.hidden).to.equal(false);

          helpers.target.removeChild(el);
          el.label.innerHTML = '';

          // Wait for MO
          helpers.next(() => {
            helpers.target.appendChild(el);

            // Wait for MO
            helpers.next(() => {
              expect(el._elements.labelWrapper.hidden).to.equal(true);
              done();
            });
          });
        });
      });
    });
    
    describe('#value', function() {
      it('should reflect value changes', function() {
        var el = new Radio();
        el.value = 'yes';
        
        expect(el._elements.input.value).to.equal('yes');
      });
    });
    
    describe('#checked', function() {
      it('should reflect checked value', function() {
        var el = new Radio();
        el.checked = true;
        
        expect(el._elements.input.checked).to.be.true;
        expect(el.checked).to.be.true;
        expect(el.hasAttribute('checked')).to.be.true;
      });
      
      it('should reflect unchecked value', function() {
        var el = new Radio();
        el.checked = false;
        
        expect(el._elements.input.checked).to.be.false;
        expect(el.checked).to.be.false;
        expect(el.hasAttribute('checked')).to.be.false;
      });
      
      describe('in named sets', function() {
        
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
          var instance = new Radio();
          instance.name = 'namedRadio';
          instance.value = value;
          helpers.target.appendChild(instance);
          return instance;
        }
        
        it('should correctly maintain one checked member', function() {
          radios[0].checked = true;
          
          expectOnlyCheckedRadioToBe(0);
          radios[1].checked = true;
          
          expectOnlyCheckedRadioToBe(1);
          radios[2].checked = true;
          
          expectOnlyCheckedRadioToBe(2);
        });
        
        describe('when dynamic', function() {
          it('should not change checked member if unchecked radio is added', function() {
            radios[0].checked = true;
            
            expectOnlyCheckedRadioToBe(0);
            radios.push(buildNamedRadio('dynamic'));
            
            expectOnlyCheckedRadioToBe(0);
            radios[3].checked = true;
            
            expectOnlyCheckedRadioToBe(3);
          });
          
          it('should change checked member if checked radio is added', function() {
            radios[0].checked = true;
            
            expectOnlyCheckedRadioToBe(0);
            var dynamicMember = buildNamedRadio('dynamic');
            dynamicMember.checked = true;
            radios.push(dynamicMember);
            
            expectOnlyCheckedRadioToBe(3);
          });
        });
      });
    });
    
    describe('#disabled', function() {
      it('should reflect disabled value', function() {
        var el = new Radio();
        el.disabled = true;
        
        expect(el.hasAttribute('disabled')).to.be.true;
        expect(el.classList.contains('is-disabled')).to.be.true;
        expect(el._elements.input.disabled).to.be.true;
      });
      
      it('should reflect enabled value', function() {
        var el = new Radio();
        el.disabled = false;
        
        expect(el.hasAttribute('disabled')).to.be.false;
        expect(el.classList.contains('is-disabled')).to.be.false;
        expect(el._elements.input.disabled).to.be.false;
      });
      
      it('should handle manipulating disabled attribute', function() {
        var el = new Radio();
        el.setAttribute('disabled', '');
        
        expect(el._elements.input.disabled).to.be.true;
        expect(el.disabled).to.be.true;
        
        el.removeAttribute('disabled');
        
        expect(el._elements.input.disabled).to.be.false;
        expect(el.disabled).to.be.false;
      });
    });
    
    describe('#rendering', function() {
      it('should render with only one input, radio, span and label element', function() {
        helpers.build(new Radio());
        
        expectRadioChildren();
      });
      
      it('should render clone with only one input, radio, span and label element', function() {
        var radio = new Radio();
        helpers.target.appendChild(radio);
        
        helpers.target.appendChild(radio.cloneNode());
        
        helpers.target.removeChild(radio);
        
        expectRadioChildren();
      });
      
      function expectRadioChildren() {
        expect(helpers.target.querySelectorAll('coral-radio-label').length).to.equal(1);
        expect(helpers.target.querySelectorAll('input[handle="input"]').length).to.equal(1);
        expect(helpers.target.querySelectorAll('span[handle="checkmark"]').length).to.equal(1);
        expect(helpers.target.querySelectorAll('label[handle="labelWrapper"]').length).to.equal(1);
      }
    });
  }); // API
  
  describe('Markup', function() {
    describe('#checked', function() {
      function testRadioChecked(el) {
        expect(el._elements.input.checked).to.be.true;
        expect(el.checked).to.be.true;
        expect(el.hasAttribute('checked')).to.be.true;
      }
      
      function testRadioNotChecked(el) {
        expect(el._elements.input.checked).to.be.false;
        expect(el.checked).to.be.false;
        expect(el.hasAttribute('checked')).to.be.false;
      }
      
      it('should be set via markup', function() {
        const el = helpers.build(window.__html__['Radio.checked.html']);
        testRadioChecked(el);
      });
      
      it('should handle manipulating checked attribute', function() {
        const el = helpers.build(window.__html__['Radio.fromElement.html']);
        el.setAttribute('checked', '');
        
        testRadioChecked(el);
        el.removeAttribute('checked');
        
        testRadioNotChecked(el);
      });
      
      it('should be set in a group via markup', function() {
        const group = helpers.build(window.__html__['Radio.Group.checked.html']);
        var el = group.querySelector('coral-radio[checked]');
        testRadioChecked(el);
      });
      
      it('should handle manipulating checked attribute in a group', function() {
        const group = helpers.build(window.__html__['Radio.Group.base.html']);
        var radios = group.querySelectorAll('coral-radio');
        var radioOne = radios[0];
        var radioTwo = radios[1];
        var radioThree = radios[2];
        radioOne.setAttribute('checked', '');
        
        testRadioChecked(radioOne);
        testRadioNotChecked(radioTwo);
        testRadioNotChecked(radioThree);
        radioTwo.setAttribute('checked', '');
        
        testRadioNotChecked(radioOne);
        testRadioChecked(radioTwo);
        testRadioNotChecked(radioThree);
      });
    });
  }); // Markup
  
  describe('Events', function() {
    var radio;
    var changeSpy;
    var preventSpy;
    
    beforeEach(function() {
      changeSpy = sinon.spy();
      preventSpy = sinon.spy();
      
      radio = helpers.build(new Radio());
      
      // changeSpy and preventSpy for event bubble
      events.on('change', function(event) {
        
        // target must always be the switch and not the input
        expect(event.target.tagName).to.equal('CORAL-RADIO');
        
        changeSpy();
        
        if (event.defaultPrevented) {
          preventSpy();
        }
      });
      
      expect(changeSpy.callCount).to.equal(0);
    });
    
    afterEach(function() {
      helpers.target.removeChild(radio);
      events.off('change');
    });
    
    it('should trigger change on click', function() {
      radio._elements.input.click();
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
      expect(radio.checked).to.be.true;
      expect(radio.hasAttribute('checked')).to.be.true;
    });
    
    it('should not trigger change event when setting checked property', function() {
      radio.checked = true;
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });
    
    
    it('should trigger change event, when clicked', function() {
      expect(radio.checked).to.be.false;
      radio._elements.input.click();
      
      expect(radio.checked).to.be.true;
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(1);
    });
    
    it('should not trigger change event if value changed', function() {
      radio.value = 'value';
      
      expect(preventSpy.callCount).to.equal(0);
      expect(changeSpy.callCount).to.equal(0);
    });
  }); // Events
  
  
  describe('in a form', function() {
    
    var radio;
    
    beforeEach(function() {
      var form = document.createElement('form');
      form.id = 'testForm';
      helpers.target.appendChild(form);
      
      radio = new Radio();
      radio.name = 'formRadio';
      form.appendChild(radio);
    });
    
    afterEach(function() {
      radio = null;
    });
    
    it('should include the internal input value when checked', function() {
      radio.checked = true;
      expectFormSubmitContentToEqual([{name: 'formRadio', value: 'on'}]);
    });
    
    it('should not include the internal input value when not checked', function() {
      // default is not checked
      expectFormSubmitContentToEqual([]);
    });
    
    it('should not include the internal input value when not named', function() {
      radio.name = '';
      expectFormSubmitContentToEqual([]);
    });
    
    it('should include the new value if the value was changed', function() {
      radio.value = 'kittens';
      radio.checked = true;
      expectFormSubmitContentToEqual([{name: 'formRadio', value: 'kittens'}]);
    });
    
    function expectFormSubmitContentToEqual(expectedValue) {
      var form = document.getElementById('testForm');
      expect(helpers.serializeArray(form)).to.deep.equal(expectedValue);
    }
  });
  
  describe('Implementation Details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Radio.fromElement.html'], {
        value: 'on',
        default: 'on'
      });
    });
    
    it('should hide/show label depending on the content', function(done) {
      var el = helpers.build(new Radio());
      
      expect(el._elements.labelWrapper.hidden).to.equal(true, 'The wrapper must be hidden since there are no contents');
      
      el.label.textContent = 'Label content';
      
      // Wait for MO
      helpers.next(() => {
        expect(el._elements.labelWrapper.hidden).to.equal(false, 'The wrapper must be visible');
        done();
      });
    });
    
    it('should allow replacing the content zone', function(done) {
      var el = helpers.build(new Radio());
  
      var label = new Radio.Label();
      label.textContent = 'Content';
  
      // Wait for MO
      helpers.next(function() {
        expect(el._elements.labelWrapper.hidden).to.be.true;
        el.label = label;
    
        // Wait for MO
        helpers.next(function() {
          expect(el._elements.labelWrapper.hidden).to.be.false;
      
          done();
        });
      });
    });
    
    it('should support click()', function() {
      var el = new Radio();
      var changeSpy = sinon.spy();
      el.on('change', changeSpy);
      el.click();
      expect(el.checked).to.be.true;
      expect(changeSpy.callCount).to.equal(1);
      el.click();
      expect(el.checked).to.be.true;
      expect(changeSpy.callCount).to.equal(1);
    });
  
    it('should be possible to change the checked radio', function(done) {
      var changeSpy = sinon.spy();
      document.addEventListener('change', changeSpy);
    
      helpers.target.innerHTML = window.__html__['Radio.Group.checked.html'];
    
      var radio1 = helpers.target.querySelector('coral-radio');
      var radio2 = radio1.nextElementSibling;
    
      expect(radio1.hasAttribute('checked')).to.be.true;
      expect(radio2.hasAttribute('checked')).to.be.false;
    
      commons.ready(radio2, function() {
        radio2.checked = true;
        
        expect(radio1.hasAttribute('checked')).to.be.false;
        expect(radio2.hasAttribute('checked')).to.be.true;
        expect(changeSpy.callCount).to.equal(0);
        
        done();
      });
    });
  });
  
  describe('Tracking', function() {
    var trackerFnSpy;
    
    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });
    
    it('should call the tracker callback fn once when selecting the radio with expected trackData parameters', function() {
      const el = helpers.build(window.__html__['Radio.tracking.all.html']);
      el.click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'element name');
      expect(trackData).to.have.property('targetType', 'coral-radio');
      expect(trackData).to.have.property('eventType', 'checked');
      expect(trackData).to.have.property('rootElement', 'element name');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-radio');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Radio);
    });
    
    it('should call the tracker callback fn with targetElement value from the label when the attribute is missing', function() {
      const el = helpers.build(window.__html__['Radio.tracking.feature.html']);
      el.click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'radioName=radioValue');
      expect(trackData).to.have.property('targetType', 'coral-radio');
      expect(trackData).to.have.property('eventType', 'checked');
      expect(trackData).to.have.property('rootElement', 'radioName=radioValue');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-radio');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Radio);
    });
    
    it('should call the tracker callback fn only once when clicking on the same radio input twice', function() {
      const el = helpers.build(window.__html__['Radio.tracking.all.html']);
      el.firstElementChild.click();
      el.firstElementChild.click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');
    });
    
    it('should call the tracker callback fn with targetElement value from the label when the "name" attribute is missing', function() {
      const el = helpers.build(window.__html__['Radio.tracking.name.html']);
      el.click();
      expect(trackerFnSpy.callCount).to.equal(1, 'Track event should have been called once.');
      
      var spyCall = trackerFnSpy.getCall(0);
      expect(spyCall.args.length).to.equal(4);
      
      var trackData = spyCall.args[0];
      expect(trackData).to.have.property('targetElement', 'Some Label');
      expect(trackData).to.have.property('targetType', 'coral-radio');
      expect(trackData).to.have.property('eventType', 'checked');
      expect(trackData).to.have.property('rootElement', 'Some Label');
      expect(trackData).to.have.property('rootFeature', 'feature name');
      expect(trackData).to.have.property('rootType', 'coral-radio');
      expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
      expect(spyCall.args[2]).to.be.an.instanceof(Radio);
    });
  });
});
