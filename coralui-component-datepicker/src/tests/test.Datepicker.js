import {helpers} from '../../../coralui-util/src/tests/helpers';
import {Datepicker} from '../../../coralui-component-datepicker';
import {DateTime} from '../../../coralui-datetime';
import {commons, Keys} from '../../../coralui-util';

describe('Datepicker', function() {
  // @todo: add tests for mobile
  describe('Namespace', function() {
    it('should define the types in an enum', function() {
      expect(Datepicker.type).to.exist;
      expect(Datepicker.type.DATE).to.equal('date');
      expect(Datepicker.type.DATETIME).to.equal('datetime');
      expect(Datepicker.type.TIME).to.equal('time');
      expect(Datepicker.variant).to.exist;
      expect(Datepicker.variant.DEFAULT).to.equal('default');
      expect(Datepicker.variant.QUIET).to.equal('quiet');
      expect(Object.keys(Datepicker.type).length).to.equal(3);
      expect(Object.keys(Datepicker.variant).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent(window.__html__['Datepicker.base.html']);
    });

    it('should be possible to clone the element using markup type="time"', function() {
      helpers.cloneComponent(window.__html__['Datepicker.type.time.html']);
    });
  });
  
  // Run tests once with moment fallback and once with moment
  for (let useMomentJS = 0; useMomentJS < 2; useMomentJS++) {
    
    const momentJS = window.moment;

    beforeEach(function() {
      // Make sure Clock and tests use momentJS fallback
      if (!useMomentJS) {
        window.moment = undefined;
      }
      // Make sure Clock and tests use momentJS
      else {
        window.moment = momentJS;
      }
    });
  
    describe('API', function() {
      var el;
    
      beforeEach(function() {
        el = helpers.build(new Datepicker());
        el._renderCalendar();
      });
    
      afterEach(function() {
        el = null;
      });
    
      describe('#disabled', function() {
      });
    
      describe('#displayFormat', function() {
        it('should default to YYYY-MM-DD', function() {
          expect(el.displayFormat).to.equal('YYYY-MM-DD');
        });
      
        it('should change the default based on the type', function() {
          expect(el.type).to.equal(Datepicker.type.DATE);
          expect(el.displayFormat).to.equal('YYYY-MM-DD');
        
          el.type = Datepicker.type.DATETIME;
          expect(el.displayFormat).to.equal('YYYY-MM-DD[T]HH:mmZ');
        
          el.type = Datepicker.type.TIME;
          expect(el.displayFormat).to.equal('HH:mm');
        });
      
        it('should allow a custom value', function() {
          expect(el.type).to.equal(Datepicker.type.DATE);
          el.displayFormat = 'MM-DD-YYYY';
          expect(el.displayFormat).to.equal('MM-DD-YYYY');
        
          el.type = Datepicker.type.DATETIME;
          expect(el.displayFormat).to.equal('MM-DD-YYYY');
        });
      
        it('should fallback empty strings to the defaults', function() {
          expect(el.type).to.equal(Datepicker.type.DATE);
          el.displayFormat = 'MM-DD-YYYY';
          expect(el.displayFormat).to.equal('MM-DD-YYYY');
        
          el.displayFormat = '';
          expect(el.displayFormat).to.equal('YYYY-MM-DD');
        });
      
        it('should allow the user to type dates in the displayFormat', function() {
          if (useMomentJS) {
            el.displayFormat = 'DD-MM-YY';
  
            // types a new value in the input field and triggers a change event
            el._elements.input.value = '30-05-15';
            el._elements.input.trigger('change');
  
            expect(el._elements.input.value).to.equal('30-05-15');
  
            // internal value should follow the valueFormat
            expect(el.value).to.equal('2015-05-30');
  
            expect(el._elements.hiddenInput.value).to.equal('2015-05-30');
          }
        });
      
        it('should reject the value if it does not match the format', function() {
          el.displayFormat = 'MM-DD-YYYY';
          el._elements.input.value = '30';
          el._elements.input.trigger('change');
        
          expect(el.value).to.equal('');
          expect(el._elements.input.value).to.equal('');
        });
      
        it('should update the input with the new value based on the format', function() {
          el.value = '2015-07-10';
        
          expect(el._elements.input.value).to.equal('2015-07-10');
        
          if (useMomentJS) {
            el.displayFormat = 'YY';
  
            expect(el.value).to.equal('2015-07-10');
  
            expect(el._elements.input.value).to.equal('15');
          }
        });
      
        it('should allow setting a format with am/pm', function() {
          if (useMomentJS) {
            el.type = Datepicker.type.TIME;
            el.displayFormat = 'hh:mm A';
            expect(el._elements.clock.displayFormat).to.equal('hh:mm A', 'Format should be set on the clock as well');
  
            el.value = '15:37';
  
            expect(el._elements.input.value).to.equal('03:37 PM', 'The input should reflect the format');
          }
        });
      });
    
      describe('#headerFormat', function() {
      });
    
      describe('#invalid', function() {
      });
    
      describe('#labelledBy', function() {
        it('should label the input', function() {
          var label1 = document.createElement('label');
          label1.textContent = 'label1';
          label1.id = commons.getUID();
        
          helpers.target.insertBefore(label1, el);
        
          el.labelledBy = label1.id;
        
          expect(el.labelledBy).to.equal(label1.id);
          expect(label1.getAttribute('for')).to.equal(el._elements.input.id);
          expect(el._elements.input.getAttribute('aria-labelledby')).to.equal(label1.id);
          expect(el._elements.toggle.hasAttribute('aria-labelledby')).to.be.false;
          expect(el._elements.hiddenInput.hasAttribute('aria-labelledby')).to.be.false;
        
          expect(el.getAttribute('aria-labelledby')).to.equal(label1.id);
        
          el.labelledBy = '';
        
          expect(el.labelledBy).to.be.null;
          expect(label1.hasAttribute('for')).to.be.false;
          expect(el._elements.input.hasAttribute('aria-labelledby')).to.be.false;
          expect(el._elements.toggle.hasAttribute('aria-labelledby')).to.be.false;
          expect(el._elements.hiddenInput.hasAttribute('aria-labelledby')).to.be.false;
          expect(el.hasAttribute('aria-labelledby'), 'aria should be removed').to.be.false;
        });
      });
    
      describe('#max', function() {
      });
    
      describe('#min', function() {
      });
    
      describe('#name', function() {
        it('should have empty string as default', function() {
          expect(el.name).to.equal('');
          expect(el._elements.hiddenInput.name).to.equal('');
          expect(el._elements.input.name).to.equal('');
        });
      
        it('should set the name', function() {
          el.name = 'dp';
          expect(el.name).to.equal('dp');
          expect(el._elements.hiddenInput.name).to.equal('dp');
          expect(el._elements.input.name).to.equal('');
        });
      
        it('should submit nothing when the name is not specified', function() {
          // we wrap first the select
          var form = document.createElement('form');
          form.appendChild(el);
          helpers.target.appendChild(form);
        
          el.value = '2000-05-29';
        
          expect(el._elements.hiddenInput.name).to.equal('');
          expect(el._elements.input.name).to.equal('');
        
          var values = helpers.serializeArray(form);
        
          expect(values.length).to.equal(0);
        });
      
        it('should submit the value', function() {
          // we wrap first the select
          var form = document.createElement('form');
          form.appendChild(el);
          helpers.target.appendChild(form);
        
          el.name = 'dp';
          el.value = '2000-05-04';
        
          expect(el.name).to.equal('dp');
          expect(el._elements.hiddenInput.name).to.equal('dp');
          expect(el._elements.input.name).to.equal('');
        
          // the native has the correct value
          expect(el._elements.hiddenInput.value).to.equal('2000-05-04');
        
          expect(helpers.serializeArray(form)).to.deep.equal([{
            name: 'dp',
            value: '2000-05-04'
          }]);
        });
      
        it('should use the valueformat for the submitted value', function() {
          if (useMomentJS) {
            // we wrap first the select
            var form = document.createElement('form');
            form.appendChild(el);
            helpers.target.appendChild(form);
  
            el.name = 'dp';
            el.valueFormat = 'DD-MM-YYYY';
            el.value = '30-08-2005';
  
            expect(el.name).to.equal('dp');
            expect(el._elements.hiddenInput.name).to.equal('dp');
            expect(el._elements.input.name).to.equal('');
  
            // the native has the correct value
            expect(el._elements.hiddenInput.value).to.equal('30-08-2005');
            expect(el._elements.input.value).to.equal('2005-08-30');
  
            expect(helpers.serializeArray(form)).to.deep.equal([{
              name: 'dp',
              value: '30-08-2005'
            }]);
          }
        });
      });
    
      describe('#placeholder', function() {
        it('should default to ""', function() {
          expect(el.placeholder).to.equal('');
          expect(el.hasAttribute('placeholder')).to.be.false;
        });
      
        it('should be set and reflected', function() {
          el.placeholder = 'dp1';
          expect(el.placeholder).to.equal('dp1');
          expect(el._elements.input.getAttribute('placeholder')).to.equal('dp1');
        });
      });
    
      describe('#readOnly', function() {
        it('should default to false', function() {
          expect(el.readOnly).to.be.false;
          expect(el.hasAttribute('readonly')).to.be.false;
        });
      
        it('should set readonly', function() {
          el.readOnly = true;
        
          expect(el._elements.input.readOnly).to.be.true;
          expect(el._elements.toggle.disabled).to.be.true;
          expect(el.hasAttribute('readonly')).to.be.true;
        });
      });
    
      describe('#required', function() {
      });
    
      describe('#startDay', function() {
      });
    
      describe('#type', function() {
        it('should default to false', function() {
          expect(el.type).to.equal(Datepicker.type.DATE);
          expect(el.getAttribute('type')).to.equal(Datepicker.type.DATE);
        });
      
        it('should set the new type', function() {
          el.type = Datepicker.type.TIME;
          expect(el.type).to.equal(Datepicker.type.TIME);
        
          expect(el.getAttribute('type')).to.equal(Datepicker.type.TIME);
        });
      });
    
      describe('#value', function() {
        it('should default to empty string', function() {
          expect(el.value).to.equal('');
        });
      
        it('should accept valid dates', function() {
          el.value = '2000-12-31';
        
          expect(el.value).to.equal('2000-12-31');
          expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment(new Date(2000, 11, 31)), 'day')).to.be.true;
        });
      
        it('should accept "today" as a value', function() {
          el.value = 'today';
        
          expect(new DateTime.Moment().isSame(new DateTime.Moment(el.valueAsDate), 'day')).to.be.true;
          expect(new DateTime.Moment(el.value).isSame(new DateTime.Moment(Date.now()), 'day')).to.be.true;
        });
      
        it('should reject invalid value strings', function() {
          el.value = 'nondate';
        
          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });
      
        it('should reject invalid date strings', function() {
          el.value = 'a';
        
          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });
      
        it('should accept date objects', function() {
          var today = new Date();
        
          el.value = today;
          expect(new DateTime.Moment(el.value, el.valueFormat).isSame(new DateTime.Moment(today), 'day')).to.be.true;
          expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment(today), 'day')).to.be.true;
        });
      
        it('should accept moment objects', function() {
          var date = new DateTime.Moment('1988-01-12');
        
          el.value = date;
          expect(new DateTime.Moment(el.value, el.valueFormat).isSame(new DateTime.Moment(date), 'day')).to.be.true;
          expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment(date), 'day')).to.be.true;
        });
      });
    
      describe('#valueAsDate', function() {
        it('should default to null', function() {
          expect(el.valueAsDate).to.be.null;
        });
      
        it('should accept dates', function() {
          var newDate = new Date();
          el.valueAsDate = newDate;
          expect(new DateTime.Moment(newDate).isSame(new DateTime.Moment(el.valueAsDate), 'day')).to.be.true;
        });
      
        it('should reject date strings', function() {
          el.valueAsDate = '2000-02-20';
        
          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });
      
        it('should be able to clear the value', function() {
          el.valueAsDate = new Date();
          expect(el.value).not.to.equal('');
        
          el.valueAsDate = '';
          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });
      });
    
      describe('#valueFormat', function() {
        it('should default to YYYY-MM-DD', function() {
          expect(el.valueFormat).to.equal('YYYY-MM-DD');
        });
      
        it('should change the default based on the type', function() {
          expect(el.type).to.equal(Datepicker.type.DATE);
          expect(el.valueFormat).to.equal('YYYY-MM-DD');
        
          el.type = Datepicker.type.DATETIME;
          expect(el.valueFormat).to.equal('YYYY-MM-DD[T]HH:mmZ');
        
          el.type = Datepicker.type.TIME;
          expect(el.valueFormat).to.equal('HH:mm');
        });
      
        it('should allow a custom value', function() {
          expect(el.type).to.equal(Datepicker.type.DATE);
          el.valueFormat = 'MM-DD-YYYY';
          expect(el.valueFormat).to.equal('MM-DD-YYYY');
        
          el.type = Datepicker.type.DATETIME;
          expect(el.valueFormat).to.equal('MM-DD-YYYY');
        });
      
        it('should fallback empty strings to the defaults', function() {
          expect(el.type).to.equal(Datepicker.type.DATE);
          el.valueFormat = 'MM-DD-YYYY';
          expect(el.valueFormat).to.equal('MM-DD-YYYY');
        
          el.valueFormat = '';
          expect(el.valueFormat).to.equal('YYYY-MM-DD');
        });
      
        it('should accept values with the new format', function() {
          if (useMomentJS) {
            el.valueFormat = 'DD-MM-YY';
  
            el.value = '30-05-15';
            expect(el._elements.input.value).to.equal('2015-05-30');
          }
        });
      
        it('should update the hidden input with the new value based on the format', function() {
          el.value = '2015-07-10';
  
          expect(el._elements.hiddenInput.value).to.equal('2015-07-10');
  
          if (useMomentJS) {
            el.valueFormat = 'YY';
  
            expect(el.value).to.equal('15');
            expect(el._elements.hiddenInput.value).to.equal('15');
          }
        });
      
        it('should update Min and Max values with the new format', function() {
          if (useMomentJS) {
            el.valueFormat = 'DD-MM-YYYY';
  
            el.min = '10-07-2015';
            el.max = '25-07-2015';
  
            // Compare Min value date object to the assigned date
            var minDate = el.min;
            expect(minDate.getFullYear()).to.equal(2015);
            expect(minDate.getMonth() + 1).to.equal(7);
            expect(minDate.getDate()).to.equal(10);
  
            // Compare Max value date object to the assigned date
            var maxDate = el.max;
            expect(maxDate.getFullYear()).to.equal(2015);
            expect(maxDate.getMonth() + 1).to.equal(7);
            expect(maxDate.getDate()).to.equal(25);
          }
        });
      });
    
      describe('#variant', function() {
        it('should be set to "default" by default', function() {
          expect(el.variant).to.equal(Datepicker.variant.DEFAULT, '"default" should be set');
        });
      
        it('should be possible to set the variant', function() {
          expect(el.classList.contains('_coral-InputGroup--quiet')).to.be.false;
        
          expect(el.variant).to.equal(Datepicker.variant.DEFAULT, '"default" should be set');
          expect(el._elements.toggle.classList.contains('_coral-Button--dropdown')).to.be.true;
          expect(el._elements.input.variant).to.equal(Datepicker.variant.DEFAULT, '"default" should be set to the input variant');
        
          el.variant = Datepicker.variant.QUIET;
        
          expect(el.variant).to.equal(Datepicker.variant.QUIET, '"quiet" should be set');
          expect(el._elements.toggle.classList.contains('_coral-Button--quiet--dropdown')).to.be.true;
          expect(el._elements.input.variant).to.equal(Datepicker.variant.QUIET, '"quiet" should be set tp the input variant');
        
          expect(el.classList.contains('_coral-InputGroup--quiet')).to.be.true;
        });
      });
    });
  
    describe('Markup', function() {
    
      describe('#invalid', function() {
        it('should consider the markup as the truth until user interaction happened', function() {
          helpers.build(window.__html__['Datepicker.invalid.html']);
          var validDatepicker1 = document.getElementById('validDatepicker1');
          var validDatepicker2 = document.getElementById('validDatepicker2');
          var invalidDatepicker = document.getElementById('invalidDatepicker');
        
          expect(validDatepicker1.invalid).to.equal(false, 'validDatepicker1 should not be invalid (markup should be right)');
          expect(validDatepicker2.invalid).to.equal(false, 'validDatepicker2 should not be invalid (markup should be right)');
          expect(invalidDatepicker.invalid).to.equal(true, 'invalidDatepicker should be invalid (markup should be right)');
        
          expect(validDatepicker1.hasAttribute('invalid')).to.equal(false, 'validDatepicker1 should not have an invalid attribute');
          expect(validDatepicker1.hasAttribute('invalid')).to.equal(false, 'validDatepicker2 should not have an invalid attribute');
          expect(invalidDatepicker.hasAttribute('invalid')).to.equal(true, 'invalidDatepicker should have an invalid attribute');
        });
      });
    
      describe('#type', function() {
        it('should default to "date"', function() {
          const el = helpers.build(window.__html__['Datepicker.base.html']);
          expect(el.type).to.equal('date');
          expect(el.valueFormat).to.equal('YYYY-MM-DD');
          expect(el.displayFormat).to.equal(el.valueFormat);
        });
      
        it('should accept "datetime"', function() {
          const el = helpers.build(window.__html__['Datepicker.type.datetime.html']);
          expect(el.type).to.equal('datetime');
          expect(el.valueFormat).to.equal('YYYY-MM-DD[T]HH:mmZ');
          expect(el.displayFormat).to.equal(el.valueFormat);
        });
      
        it('should accept "time"', function() {
          const el = helpers.build(window.__html__['Datepicker.type.time.html']);
          expect(el.type).to.equal('time');
          expect(el.valueFormat).to.equal('HH:mm');
          expect(el.displayFormat).to.equal(el.valueFormat);
        });
      
        it('should accept custom value format', function() {
          const el = helpers.build(window.__html__['Datepicker.type.customvalueformat.html']);
          expect(el.type).to.equal('time');
          // should use the format from the markup
          expect(el.valueFormat).to.equal('mm:HH');
          // should use the default display that matches the type
          expect(el.displayFormat).to.equal('HH:mm');
        });
      
        it('should accept custom display format', function() {
          const el = helpers.build(window.__html__['Datepicker.type.customdisplayformat.html']);
          expect(el.type).to.equal('time');
          // should use the format from the markup
          expect(el.valueFormat).to.equal('HH:mm');
          // should use the default display that matches the type
          expect(el.displayFormat).to.equal('mm:HH');
        });
      });
    
      describe('#value', function() {
        it('should default to empty string', function() {
          const el = helpers.build(window.__html__['Datepicker.base.html']);
          expect(el.value).to.equal('');
        });
      
        it('should accept valid dates', function() {
          const el = helpers.build(window.__html__['Datepicker.value.html']);
          expect(el.value).to.equal('2000-12-31');
          expect(el.getAttribute('value')).to.equal('2000-12-31');
          expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment(new Date(2000, 11, 31)), 'day')).to.be.true;
        });
      
        it('should accept "today" as a value', function() {
          const el = helpers.build(window.__html__['Datepicker.value.today.html']);
          expect(new DateTime.Moment(el.value, el.valueFormat).isSame(new DateTime.Moment(Date.now()), 'day')).to.be.true;
          expect(el.getAttribute('value')).to.equal('today');
        
          expect(new DateTime.Moment().isSame(new DateTime.Moment(el.valueAsDate), 'day')).to.be.true;
          expect(new DateTime.Moment(el.value).isSame(new DateTime.Moment(Date.now()), 'day')).to.be.true;
        });
      
        it('should automatically initialize the clock to "now" if the type is "time" and value "today"', function() {
          const el = helpers.build('<coral-datepicker type="time" value="today"></coral-datepicker>');
          // this test just verifies that the current time is set
        
          var currentDate = new Date();
          var initDate = el.valueAsDate;
        
          var passedMinutesOfCurrentDay = currentDate.getHours() * 60 + currentDate.getMinutes();
          var passedMinutesOfInitDay = initDate.getHours() * 60 + initDate.getMinutes();
        
          // (for simplicity simply check that not more than one minute has passed since init)
          expect(passedMinutesOfInitDay <= passedMinutesOfCurrentDay && passedMinutesOfInitDay + 2 > passedMinutesOfCurrentDay).to.equal(true, 'current time should have been set as default time');
        });
      
        it('should automatically initialize the clock to "now" if the type is "datetime" and value "today"', function() {
          const el = helpers.build('<coral-datepicker type="datetime" value="today" ></coral-datepicker>');
          // this test just verifies that the current date & time is set
        
          var currentDate = new Date();
          var currentTime = currentDate.getTime();
          var initTime = el.valueAsDate.getTime();
        
          // (for simplicity simply check that not more than one minute has passed since init)
          expect(initTime <= currentTime && initTime + 60000 > currentTime).to.equal(true, 'current date & time should have been set as default time');
        });
      
        it('should initialize the clock to 0am if the type is "date" and value "today"', function() {
          const el = helpers.build('<coral-datepicker value="today" type="date"></coral-datepicker>');
          // this test just verifies that the current date & time is set
        
          var currentDate = new Date();
          var initDate = el.valueAsDate;
        
          var passedMinutesOfCurrentDay = currentDate.getHours() * 60 + currentDate.getMinutes();
          var passedMinutesOfInitDay = initDate.getHours() * 60 + initDate.getMinutes();
        
          // (for simplicity simply check that not more than one minute has passed since init)
          expect(passedMinutesOfInitDay === 0 && passedMinutesOfCurrentDay >= passedMinutesOfInitDay).to.equal(true, 'time should have been set to 0:00');
        });
      
        it('should reject invalid value strings', function() {
          const el = helpers.build(window.__html__['Datepicker.value.invalid.html']);
          expect(el.value).to.equal('');
          expect(el.getAttribute('value')).to.equal('a');
          expect(el.valueAsDate).to.be.null;
        });
      });
    
      describe('#valueAsDate', function() {
        it('should default to null', function() {
          const el = helpers.build(window.__html__['Datepicker.base.html']);
          expect(el.valueAsDate).to.be.null;
        });
      
        it('should return assigned value as Date', function() {
          const el = helpers.build(window.__html__['Datepicker.value.html']);
          expect(el.valueAsDate instanceof Date).to.be.true;
          expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment('2000-12-31'), 'day')).to.be.true;
        });
      
        it('should not accept valueAsDate as an attribute', function() {
          const el = helpers.build(window.__html__['Datepicker.valueasdate.html']);
          expect(el.valueAsDate).to.be.null;
        });
      });
    });
  
    describe('Events', function() {
      describe('#change', function() {
        it('should not trigger a change event at instantiation', function() {
          var changeSpy = sinon.spy();
        
          // we assign the listener to the container in case the event bubbles
          helpers.target.addEventListener('change', changeSpy);
        
          const el = helpers.build(window.__html__['Datepicker.value.html']);
        
          expect(changeSpy.callCount).to.equal(0);
        });
      
        it('should not trigger a change event when a value is set programmatically', function() {
          var changeSpy = sinon.spy();
        
          const el = helpers.build(window.__html__['Datepicker.value.html']);
          el.on('change', changeSpy);
          el.value = null;
        
          expect(changeSpy.callCount).to.equal(0);
        });
      
        it('should trigger a change event when a date is selected', function(done) {
          var changeSpy = sinon.spy();
        
          const el = helpers.build(window.__html__['Datepicker.value.html']);
          el.on('change', changeSpy);
        
          el._elements.toggle.click();
        
          // Overlay does not open immediately any longer
          helpers.next(function() {
            var cell = el._elements.calendar._elements.body.querySelector('a');
          
            cell.click();
          
            expect(changeSpy.callCount).to.equal(1);
          
            done();
          });
        });
      
        it('should trigger a change event when a time is selected', function(done) {
          var changeSpy = sinon.spy();
        
          const el = helpers.build(window.__html__['Datepicker.type.time.html']);
          el.on('change', changeSpy);
        
          el._elements.toggle.click();
        
          // Overlay does not open immediately any longer
          helpers.next(function() {
            // we need to select a full time to have a valid change event
            el._elements.clock._elements.hours.value = '12';
            el._elements.clock._elements.hours.trigger('change');
          
            el._elements.clock._elements.minutes.value = '59';
            el._elements.clock._elements.minutes.trigger('change');
          
            expect(changeSpy.callCount).to.equal(1);
            done();
          });
        });
      
        it('should trigger a change event when a datetime is selected', function(done) {
          var changeSpy = sinon.spy();
        
          const el = helpers.build('<coral-datepicker type="datetime" value="2015-04-20T00:00+02:00"></coral-datepicker>');
          el.on('change', changeSpy);
        
          el._elements.toggle.click();
        
          // Overlay does not open immediately any longer
          helpers.next(function() {
            el._elements.clock._elements.minutes.value = '59';
            el._elements.clock._elements.minutes.trigger('change');
          
            expect(changeSpy.callCount).to.equal(1);
            done();
          });
        });
      
        it('should trigger a change event when a datetime (with no initial value) is selected', function(done) {
          var changeSpy = sinon.spy();
        
          const el = helpers.build(window.__html__['Datepicker.type.datetime.html']);
          el.on('change', changeSpy);
        
          el._elements.toggle.click();
        
          // Overlay does not open immediately any longer
          helpers.next(function() {
            // we need to set a full time for the change event to be triggered
            el._elements.clock._elements.hours.value = '12';
            el._elements.clock._elements.hours.trigger('change');
          
            el._elements.clock._elements.minutes.value = '59';
            el._elements.clock._elements.minutes.trigger('change');
          
            expect(changeSpy.callCount).to.equal(1);
            done();
          });
        });
      });
    });
  
    describe('User Interaction', function() {
      it('should show the invalid style if the user sets the date manually', function() {
        const el = helpers.build('<coral-datepicker min="2015-04-10" max="2015-04-28" value="2015-04-15"></coral-datepicker>');
        // sets a value outside of the range
        el._elements.input.value = '2015-04-29';
        el._elements.input.trigger('change');
      
        expect(el.value).to.equal('2015-04-29');
        expect(el.invalid).to.be.true;
        expect(el.classList.contains('is-invalid')).to.be.true;
      });
    
      it('should show set the current time as default when no time is set, but a date was chosen', function(done) {
        const el = helpers.build('<coral-datepicker type="datetime" value=""></coral-datepicker>');
      
        // we open the calendar to select a new date
        el._elements.toggle.click();
      
        // Overlay does not open immediately any longer
        helpers.next(function() {
          var cell = el._elements.calendar._elements.body.querySelector('a');
          cell.click();
        
          // this test is simple and just verifies that the current time is set
          var currentDate = new Date();
          var initDate = el.valueAsDate;
        
          // (for simplicity we only check the minutes)
          var passedMinutesOfCurrentDay = currentDate.getHours() * 60 + currentDate.getMinutes();
          var passedMinutesOfInitDay = initDate.getHours() * 60 + initDate.getMinutes();
        
          // (for simplicity simply check that not more than one minute has passed since init)
          expect(passedMinutesOfInitDay <= passedMinutesOfCurrentDay && passedMinutesOfInitDay + 2 > passedMinutesOfCurrentDay).to.equal(true, 'current time should have been set as default time');
        
          done();
        });
      });
    
      it('toggle should open calendar', function(done) {
        const el = helpers.build(window.__html__['Datepicker.base.html']);
      
        // opens the popover
        el._elements.toggle.click();
      
        // Overlay does not open immediately any longer
        el.on('coral-overlay:open', function() {
          expect(el.getAttribute('aria-expanded')).to.equal('true');
          done();
        });
      });
    
      it('should not toggle the calendar when readonly', function() {
        const el = helpers.build(window.__html__['Datepicker.readonly.html']);
        // opens the popover
        el._elements.toggle.click();
      
        expect(el._elements.overlay.open).to.be.false;
        expect(el.getAttribute('aria-expanded')).to.equal('false');
      });
    
      it('should recheck the invalid state after a user interaction happened', function() {
        helpers.build(window.__html__['Datepicker.invalid.html']);
        var datepicker1 = document.getElementById('validDatepicker1');
        var datepicker2 = document.getElementById('validDatepicker2');
        var datepicker3 = document.getElementById('invalidDatepicker');
      
        datepicker1._elements.input.trigger('change');
        datepicker2._elements.input.trigger('change');
        datepicker3._elements.input.trigger('change');
      
        expect(datepicker1.invalid).to.equal(true, 'datepicker1 should be invalid (calculated by calendar)');
        expect(datepicker2.invalid).to.equal(true, 'datepicker2 should be invalid (calculated by calendar)');
        expect(datepicker3.invalid).to.equal(false, 'datepicker3 should not be invalid (calculated by calendar)');
      
        expect(datepicker1.hasAttribute('invalid')).to.equal(true, 'datepicker1 should have an invalid attribute');
        expect(datepicker2.hasAttribute('invalid')).to.equal(true, 'datepicker2 should have an invalid attribute');
        expect(datepicker3.hasAttribute('invalid')).to.equal(false, 'datepicker3 should not have an invalid attribute');
      });
      
      // @flaky on FF
      it.skip('should restore focus to toggle when closed using ESC key', function(done) {
        const el = helpers.build(window.__html__['Datepicker.type.time.html']);
        el._elements.overlay._overlayAnimationTime = 0;
        
        // explicitly set focus to toggle button
        el._elements.toggle.focus();
      
        // Overlay does not open immediately any longer
        el.on('coral-overlay:open', function() {
          // hours input should have focus when popover opens
          expect(document.activeElement).to.equal(el._elements.clock._elements.hours);
        
          // trigger ESC key down event on hours input
          helpers.keydown(Keys.keyToCode('esc'), el._elements.clock._elements.hours);
        });
        
        el.on('coral-overlay:close', function() {
          // focus should return to toggle button
          expect(document.activeElement).to.equal(el._elements.toggle);
          done();
        });
      
        // trigger a click event on the toggle to open popover
        el._elements.toggle.click();
      });
    });
  
    describe('Implementation details', function() {
      it('should show different controls depending on the type', function(done) {
        var el = new Datepicker();
        el._renderCalendar();
        helpers.target.appendChild(el);
      
        expect(el.type).to.equal('date');
      
        el._elements.toggle.click();
      
        helpers.next(function() {
          expect(el._elements.calendar.hidden).to.be.false;
          expect(el._elements.clock.hidden).to.be.true;
          expect(el._elements.toggle.icon).to.equal('calendar');
        
          // we change the type and check the expected display
          el.type = Datepicker.type.TIME;
        
          expect(el._elements.calendar.hidden).to.be.true;
          expect(el._elements.clock.hidden).to.be.false;
          expect(el._elements.toggle.icon).to.equal('clock');
        
          el.type = Datepicker.type.DATETIME;
        
          expect(el._elements.calendar.hidden).to.be.false;
          expect(el._elements.clock.hidden).be.false;
          expect(el._elements.toggle.icon).to.equal('calendar');
        
          done();
        });
      });
    
      it('should close the popover when a date is clicked', function(done) {
        const el = helpers.build(window.__html__['Datepicker.value.html']);
        // checks that initial value
        expect(el.value).to.equal('2000-12-31');
      
        // we open the calendar to select a new date
        el._elements.toggle.click();
      
        // Overlay does not open immediately any longer
        helpers.next(function() {
          var cell = el._elements.calendar._elements.body.querySelector('a');
        
          cell.click();
        
          expect(el.value).to.equal(cell.dataset.date);
          expect(el._elements.overlay.open).to.be.false;
        
          done();
        });
      });
    
      it('should close the popover when the same date is clicked', function(done) {
        const el = helpers.build(window.__html__['Datepicker.value.html']);
        // checks that initial value
        expect(el.value).to.equal('2000-12-31');
      
        // we open the calendar to select a new date
        el._elements.toggle.click();
      
        // Overlay does not open immediately any longer
        helpers.next(function() {
          var cell = el._elements.calendar._elements.body.querySelector('a[data-date="2000-12-31"]');
          expect(cell.dataset.date).to.equal('2000-12-31');
        
          cell.click();
        
          expect(el.value).to.equal(cell.dataset.date);
          expect(el._elements.overlay.open).to.be.false;
        
          done();
        });
      });
    
      it('should close the popover when the same date is clicked', function(done) {
        const el = helpers.build(window.__html__['Datepicker.value.html']);
        // checks that initial value
        expect(el.value).to.equal('2000-12-31');
      
        // we open the calendar to select a new date
        el._elements.toggle.click();
      
        // Overlay does not open immediately any longer
        helpers.next(function() {
          var cell = el._elements.calendar._elements.body.querySelector('a[data-date="2000-12-31"]');
          expect(cell.dataset.date).to.equal('2000-12-31');
        
          cell.click();
        
          expect(el.value).to.equal(cell.dataset.date);
          expect(el._elements.overlay.open).to.be.false;
        
          done();
        });
      });
  
      describe('Smart Overlay', () => {
        helpers.testSmartOverlay('coral-datepicker');
      });
  
      describe('#formField', function() {
        helpers.testFormField(window.__html__['Datepicker.value.html'], {
          value: '2014-12-31'
        });
      });
    });
  }
});
