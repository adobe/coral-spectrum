describe('Coral.Datepicker', function() {
  'use strict';

  // @todo: add tests for mobile
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Datepicker');
    });

    it('should define the types in an enum', function() {
      expect(Coral.Datepicker.type).to.exist;
      expect(Coral.Datepicker.type.DATE).to.equal('date');
      expect(Coral.Datepicker.type.DATETIME).to.equal('datetime');
      expect(Coral.Datepicker.type.TIME).to.equal('time');
      expect(Coral.Datepicker.variant).to.exist;
      expect(Coral.Datepicker.variant.DEFAULT).to.equal('default');
      expect(Coral.Datepicker.variant.QUIET).to.equal('quiet');
      expect(Object.keys(Coral.Datepicker.type).length).to.equal(3);
      expect(Object.keys(Coral.Datepicker.variant).length).to.equal(2);
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element using markup type="time"', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.type.time.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.Datepicker();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    var el;

    beforeEach(function() {
      el = new Coral.Datepicker();
      el._renderCalendar();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    describe('#disabled', function() {});

    describe('#displayFormat', function() {
      it('should default to YYYY-MM-DD', function() {
        expect(el.displayFormat).to.equal('YYYY-MM-DD');
      });

      it('should change the default based on the type', function() {
        expect(el.type).to.equal(Coral.Datepicker.type.DATE);
        expect(el.displayFormat).to.equal('YYYY-MM-DD');

        el.type = Coral.Datepicker.type.DATETIME;
        expect(el.displayFormat).to.equal('YYYY-MM-DD[T]HH:mmZ');

        el.type = Coral.Datepicker.type.TIME;
        expect(el.displayFormat).to.equal('HH:mm');
      });

      it('should allow a custom value', function() {
        expect(el.type).to.equal(Coral.Datepicker.type.DATE);
        el.displayFormat = 'MM-DD-YYYY';
        expect(el.displayFormat).to.equal('MM-DD-YYYY');

        el.type = Coral.Datepicker.type.DATETIME;
        expect(el.displayFormat).to.equal('MM-DD-YYYY');
      });

      it('should fallback empty strings to the defaults', function() {
        expect(el.type).to.equal(Coral.Datepicker.type.DATE);
        el.displayFormat = 'MM-DD-YYYY';
        expect(el.displayFormat).to.equal('MM-DD-YYYY');

        el.displayFormat = '';
        expect(el.displayFormat).to.equal('YYYY-MM-DD');
      });

      it('should allow the user to type dates in the displayFormat', function() {
        el.displayFormat = 'DD-MM-YY';

        // types a new value in the input field and triggers a change event
        el._elements.input.value = '30-05-15';
        el._elements.input.trigger('change');

        expect(el._elements.input.value).to.equal('30-05-15');

        // internal value should follow the valueFormat
        expect(el.value).to.equal('2015-05-30');

        expect(el._elements.hiddenInput.value).to.equal('2015-05-30');
      });

      it('should reject the value if it does not match the format', function() {
        el.displayFormat = 'MM-DD-YYYY';
        el._elements.input.value = '30';
        el._elements.input.trigger('change');

        expect(el.value).to.equal('');
        expect(el._elements.input.value).to.equal('');
      });

      it('should update the input with the new value based on the format', function(done) {
        el.value = '2015-07-10';

        expect(el._elements.input.value).to.equal('2015-07-10');

        el.displayFormat = 'YY';

        // display format needs a sync to update the value
        helpers.next(function() {
          expect(el.value).to.equal('2015-07-10');

          expect(el._elements.input.value).to.equal('15');

          done();
        });
      });
    });

    describe('#headerFormat', function() {});

    describe('#invalid', function() {});

    describe('#labelledBy', function() {
      it('should label the input', function(done) {
        var label1 = document.createElement('label');
        label1.textContent = 'label1';
        label1.id = Coral.commons.getUID();

        helpers.target.insertBefore(label1, el);

        el.labelledBy = label1.id;

        expect(el.labelledBy).to.equal(label1.id);
        expect(label1.getAttribute('for')).to.equal(el._elements.input.id);
        expect(el._elements.input.getAttribute('aria-labelledby')).to.equal(label1.id);
        expect(el._elements.toggle.hasAttribute('aria-labelledby')).to.be.false;
        expect(el._elements.hiddenInput.hasAttribute('aria-labelledby')).to.be.false;

        helpers.next(function() {
          expect(el.getAttribute('aria-labelledby')).to.equal(label1.id);

          el.labelledBy = '';

          expect(el.labelledBy).to.be.null;
          expect(label1.hasAttribute('for')).to.be.false;
          expect(el._elements.input.hasAttribute('aria-labelledby')).to.be.false;
          expect(el._elements.toggle.hasAttribute('aria-labelledby')).to.be.false;
          expect(el._elements.hiddenInput.hasAttribute('aria-labelledby')).to.be.false;

          helpers.next(function() {
            expect(el.hasAttribute('aria-labelledby'), 'aria should be removed').to.be.false;

            done();
          });
        });
      });
    });

    describe('#max', function() {});

    describe('#min', function() {});

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
        el.$.wrap('<form>');

        el.value = '2000-05-29';

        expect(el._elements.hiddenInput.name).to.equal('');
        expect(el._elements.input.name).to.equal('');

        var values = el.$.parent().serializeArray();

        expect(values.length).to.equal(0);
      });

      it('should submit the value', function() {
        // we wrap first the select
        el.$.wrap('<form>');

        el.name = 'dp';
        el.value = '2000-05-04';

        expect(el.name).to.equal('dp');
        expect(el._elements.hiddenInput.name).to.equal('dp');
        expect(el._elements.input.name).to.equal('');

        // the native has the correct value
        expect(el._elements.hiddenInput.value).to.equal('2000-05-04');

        expect(el.$.parent().serializeArray()).to.deep.equal([{
          name: 'dp',
          value: '2000-05-04'
        }]);
      });

      it('should use the valueformat for the submitted value', function() {
        // we wrap first the select
        el.$.wrap('<form>');

        el.name = 'dp';
        el.valueFormat = 'DD-MM-YYYY';
        el.value = '30-08-2005';

        expect(el.name).to.equal('dp');
        expect(el._elements.hiddenInput.name).to.equal('dp');
        expect(el._elements.input.name).to.equal('');

        // the native has the correct value
        expect(el._elements.hiddenInput.value).to.equal('30-08-2005');
        expect(el._elements.input.value).to.equal('2005-08-30');

        expect(el.$.parent().serializeArray()).to.deep.equal([{
          name: 'dp',
          value: '30-08-2005'
        }]);
      });
    });

    describe('#placeholder', function() {
      it('should default to ""', function() {
        expect(el.placeholder).to.equal('');
        expect(el.$).not.to.have.attr('placeholder');
      });

      it('should be set and reflected', function() {
        el.placeholder = 'dp1';
        expect(el.placeholder).to.equal('dp1');
        expect(el._elements.input.$).to.have.attr('placeholder', 'dp1');
      });
    });

    describe('#readOnly', function() {
      it('should default to false', function() {
        expect(el.readOnly).to.be.false;
        expect(el.$).not.to.have.attr('readonly');
      });

      it('should set readonly', function(done) {
        el.readOnly = true;

        helpers.next(function() {
          expect(el._elements.input.readOnly).to.be.true;
          expect(el._elements.toggle.disabled).to.be.true;
          expect(el.$).to.have.attr('readonly');
          done();
        });
      });
    });

    describe('#required', function() {});

    describe('#startDay', function() {});

    describe('#type', function() {
      it('should default to false', function() {
        expect(el.type).to.equal(Coral.Datepicker.type.DATE);
        expect(el.$).to.have.attr('type', Coral.Datepicker.type.DATE);
      });

      it('should set the new type', function(done) {
        el.type = Coral.Datepicker.type.TIME;
        expect(el.type).to.equal(Coral.Datepicker.type.TIME);
        helpers.next(function() {
          expect(el.$).to.have.attr('type', Coral.Datepicker.type.TIME);
          done();
        });
      });
    });

    describe('#value', function() {
      it('should default to empty string', function() {
        expect(el.value).to.equal('');
      });

      it('should accept valid dates', function() {
        el.value = '2000-12-31';

        expect(el.value).to.equal('2000-12-31');
        expect(moment(el.valueAsDate).isSame(new Date(2000, 11, 31), 'day')).to.be.true;
      });

      it('should accept "today" as a value', function() {
        el.value = 'today';

        expect(moment().isSame(el.valueAsDate, 'day')).to.be.true;
        expect(moment(el.value).isSame(Date.now(), 'day')).to.be.true;
      });

      it('should reject invalid value strings', function() {
        el.value = 'nondate';

        expect(el.value).to.equal('');
        expect(el.valueAsDate).to.be.null;
      });

      it('should reject invalid date strings', function() {
        el.value = '2000-02-30';

        expect(el.value).to.equal('');
        expect(el.valueAsDate).to.be.null;
      });

      it('should accept date objects', function() {
        var today = new Date();

        el.value = today;
        expect(moment(el.value, el.valueFormat).isSame(el.today, 'day')).to.be.true;
        expect(moment(el.valueAsDate).isSame(today, 'day')).to.be.true;
      });

      it('should accept moment objects', function() {
        var date = moment('1988-01-12');

        el.value = date;
        expect(moment(el.value, el.valueFormat).isSame(date, 'day')).to.be.true;
        expect(moment(el.valueAsDate).isSame(date, 'day')).to.be.true;
      });
    });

    describe('#valueAsDate', function() {
      it('should default to null', function() {
        expect(el.valueAsDate).to.be.null;
      });

      it('should accept dates', function() {
        var newDate = new Date();
        el.valueAsDate = newDate;
        expect(moment(newDate).isSame(el.valueAsDate, 'day')).to.be.true;
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
        expect(el.type).to.equal(Coral.Datepicker.type.DATE);
        expect(el.valueFormat).to.equal('YYYY-MM-DD');

        el.type = Coral.Datepicker.type.DATETIME;
        expect(el.valueFormat).to.equal('YYYY-MM-DD[T]HH:mmZ');

        el.type = Coral.Datepicker.type.TIME;
        expect(el.valueFormat).to.equal('HH:mm');
      });

      it('should allow a custom value', function() {
        expect(el.type).to.equal(Coral.Datepicker.type.DATE);
        el.valueFormat = 'MM-DD-YYYY';
        expect(el.valueFormat).to.equal('MM-DD-YYYY');

        el.type = Coral.Datepicker.type.DATETIME;
        expect(el.valueFormat).to.equal('MM-DD-YYYY');
      });

      it('should fallback empty strings to the defaults', function() {
        expect(el.type).to.equal(Coral.Datepicker.type.DATE);
        el.valueFormat = 'MM-DD-YYYY';
        expect(el.valueFormat).to.equal('MM-DD-YYYY');

        el.valueFormat = '';
        expect(el.valueFormat).to.equal('YYYY-MM-DD');
      });

      it('should accept values with the new format', function() {
        el.valueFormat = 'DD-MM-YY';

        el.value = '30-05-15';
        expect(el._elements.input.value).to.equal('2015-05-30');
      });

      it('should update the hidden input with the new value based on the format', function() {
        el.value = '2015-07-10';

        expect(el._elements.hiddenInput.value).to.equal('2015-07-10');

        el.valueFormat = 'YY';

        expect(el.value).to.equal('15');

        expect(el._elements.hiddenInput.value).to.equal('15');
      });

      it('should update Min and Max values with the new format', function() {
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
      });
    });

    describe('#variant', function() {
      it('should be set to "default" by default', function() {
        expect(el.variant).to.equal(Coral.Datepicker.variant.DEFAULT, '"default" should be set');
        expect(el._elements.toggle.variant).to.equal('secondary', '"default" should be set the toggle variant to the default of the button');
      });

      it('should be possible to set the variant', function(done) {
        expect(el.$).to.not.have.class('coral-InputGroup--quiet');

        expect(el.variant).to.equal(Coral.Datepicker.variant.DEFAULT, '"default" should be set');
        expect(el._elements.toggle.variant).to.equal('secondary', '"default" should be set the toggle variant to the default of the button');
        expect(el._elements.input.variant).to.equal(Coral.Datepicker.variant.DEFAULT, '"default" should be set tp the input variant');

        el.variant = Coral.Datepicker.variant.QUIET;

        expect(el.variant).to.equal(Coral.Datepicker.variant.QUIET, '"quiet" should be set');
        expect(el._elements.toggle.variant).to.equal(Coral.Datepicker.variant.QUIET, '"quiet" should be set the toggle variant');
        expect(el._elements.input.variant).to.equal(Coral.Datepicker.variant.QUIET, '"quiet" should be set tp the input variant');

        helpers.next(function() {
          expect(el.$).to.have.class('coral-InputGroup--quiet');
          done();
        });
      });
    });
  });

  describe('Markup', function() {

    describe('#invalid', function() {
      it('should consider the markup as the truth until user interaction happened', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.invalid.html'], function() {
          var validDatepicker1 = document.getElementById('validDatepicker1');
          var validDatepicker2 = document.getElementById('validDatepicker2');
          var invalidDatepicker = document.getElementById('invalidDatepicker');

          expect(validDatepicker1.invalid).to.equal(false, 'validDatepicker1 should not be invalid (markup should be right)');
          expect(validDatepicker2.invalid).to.equal(false, 'validDatepicker2 should not be invalid (markup should be right)');
          expect(invalidDatepicker.invalid).to.equal(true, 'invalidDatepicker should be invalid (markup should be right)');

          expect(validDatepicker1.hasAttribute('invalid')).to.equal(false, 'validDatepicker1 should not have an invalid attribute');
          expect(validDatepicker1.hasAttribute('invalid')).to.equal(false, 'validDatepicker2 should not have an invalid attribute');
          expect(invalidDatepicker.hasAttribute('invalid')).to.equal(true, 'invalidDatepicker should have an invalid attribute');

          done();
        });
      });
    });

    describe('#type', function() {
      it('should default to "date"', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.base.html'], function(el) {
          expect(el.type).to.equal('date');
          expect(el.valueFormat).to.equal('YYYY-MM-DD');
          expect(el.displayFormat).to.equal(el.valueFormat);

          done();
        });
      });

      it('should accept "datetime"', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.type.datetime.html'], function(el) {
          expect(el.type).to.equal('datetime');
          expect(el.valueFormat).to.equal('YYYY-MM-DD[T]HH:mmZ');
          expect(el.displayFormat).to.equal(el.valueFormat);

          done();
        });
      });

      it('should accept "time"', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.type.time.html'], function(el) {
          expect(el.type).to.equal('time');
          expect(el.valueFormat).to.equal('HH:mm');
          expect(el.displayFormat).to.equal(el.valueFormat);

          done();
        });
      });

      it('should accept custom value format', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.type.customvalueformat.html'], function(el) {
          expect(el.type).to.equal('time');
          // should use the format from the markup
          expect(el.valueFormat).to.equal('mm:HH');
          // should use the default display that matches the type
          expect(el.displayFormat).to.equal('HH:mm');

          done();
        });
      });

      it('should accept custom display format', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.type.customdisplayformat.html'], function(el) {
          expect(el.type).to.equal('time');
          // should use the format from the markup
          expect(el.valueFormat).to.equal('HH:mm');
          // should use the default display that matches the type
          expect(el.displayFormat).to.equal('mm:HH');

          done();
        });
      });
    });

    describe('#value', function() {
      it('should default to empty string', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.base.html'], function(el) {
          expect(el.value).to.equal('');

          done();
        });
      });

      it('should accept valid dates', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {
          expect(el.value).to.equal('2000-12-31');
          expect(el.$).attr('value', '2000-12-31');
          expect(moment(el.valueAsDate).isSame(new Date(2000, 11, 31), 'day')).to.be.true;

          done();
        });
      });

      it('should accept "today" as a value', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.value.today.html'], function(el) {
          expect(moment(el.value, el.valueFormat).isSame(Date.now(), 'day')).to.be.true;
          expect(el.$).attr('value', 'today');

          expect(moment().isSame(el.valueAsDate, 'day')).to.be.true;
          expect(moment(el.value).isSame(Date.now(), 'day')).to.be.true;

          done();
        });
      });

      it('should automatically initialize the clock to "now" if the type is "time" and value "today"', function(done) {
        helpers.build('<coral-datepicker type="time" value="today"></coral-datepicker>', function(el) {
          // this test just verifies that the current time is set

          var currentDate = new Date();
          var initDate = el.valueAsDate;

          var passedMinutesOfCurrentDay = currentDate.getHours() * 60 + currentDate.getMinutes();
          var passedMinutesOfInitDay = initDate.getHours() * 60 + initDate.getMinutes();

          // (for simplicity simply check that not more than one minute has passed since init)
          expect(passedMinutesOfInitDay <= passedMinutesOfCurrentDay && passedMinutesOfInitDay + 2 > passedMinutesOfCurrentDay).to.equal(true, 'current time should have been set as default time');

          done();
        });
      });

      it('should automatically initialize the clock to "now" if the type is "datetime" and value "today"', function(done) {
        helpers.build('<coral-datepicker type="datetime" value="today" ></coral-datepicker>', function(el) {
          // this test just verifies that the current date & time is set

          var currentDate = new Date();
          var currentTime = currentDate.getTime();
          var initTime = el.valueAsDate.getTime();

          // (for simplicity simply check that not more than one minute has passed since init)
          expect(initTime <= currentTime && initTime + 60000 > currentTime).to.equal(true, 'current date & time should have been set as default time');

          done();
        });
      });

      it('should initialize the clock to 0am if the type is "date" and value "today"', function(done) {
        helpers.build('<coral-datepicker value="today" type="date"></coral-datepicker>', function(el) {
          // this test just verifies that the current date & time is set

          var currentDate = new Date();
          var initDate = el.valueAsDate;

          var passedMinutesOfCurrentDay = currentDate.getHours() * 60 + currentDate.getMinutes();
          var passedMinutesOfInitDay = initDate.getHours() * 60 + initDate.getMinutes();

          // (for simplicity simply check that not more than one minute has passed since init)
          expect(passedMinutesOfInitDay === 0 && passedMinutesOfCurrentDay >= passedMinutesOfInitDay).to.equal(true, 'time should have been set to 0:00');

          done();
        });
      });

      it('should reject invalid value strings', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.value.invalid.1.html'], function(el) {
          expect(el.value).to.equal('');
          expect(el.$).attr('value', 'nondate');
          expect(el.valueAsDate).to.be.null;

          done();
        });
      });

      it('should reject invalid date strings', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.value.invalid.2.html'], function(el) {
          expect(el.value).to.equal('');
          expect(el.$).attr('value', '2000-02-30');
          expect(el.valueAsDate).to.be.null;

          done();
        });
      });
    });

    describe('#valueAsDate', function() {
      it('should default to null', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.base.html'], function(el) {
          expect(el.valueAsDate).to.be.null;

          done();
        });
      });

      it('should return assigned value as Date', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {
          expect(el.valueAsDate instanceof Date).to.be.true;
          expect(moment(el.valueAsDate).isSame('2000-12-31', 'day')).to.be.true;

          done();
        });
      });

      it('should null if invalid date was given', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.value.invalid.2.html'], function(el) {
          expect(el.valueAsDate).to.be.null;

          done();
        });
      });

      it('should not accept valueAsDate as an attribute', function(done) {
        helpers.build(window.__html__['Coral.Datepicker.valueasdate.html'], function(el) {
          expect(el.valueAsDate).to.be.null;

          done();
        });
      });
    });
  });

  describe('Events', function() {
    describe('#change', function() {
      it('should not trigger a change event at instantiation', function(done) {
        var changeSpy = sinon.spy();

        // we assign the listener to the container in case the event bubbles
        helpers.target.addEventListener('change', changeSpy);

        helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {

          helpers.next(function() {
            expect(changeSpy.callCount).to.equal(0);
            done();
          });
        });
      });

      it('should not trigger a change event when a value is set programmatically', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {
          el.on('change', changeSpy);
          el.value = null;

          helpers.next(function() {
            expect(changeSpy.callCount).to.equal(0);
            done();
          });
        });
      });

      it('should trigger a change event when a date is selected', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {
          el.on('change', changeSpy);

          // Overlay does not open immediately any longer
          el.on('coral-overlay:open', function() {
            var cell = el._elements.calendar._elements.body.querySelector('a');

            cell.click();

            helpers.next(function() {
              expect(changeSpy.callCount).to.equal(1);
              done();
            });
          });

          el._elements.toggle.click();
        });
      });

      it('should trigger a change event when a time is selected', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Datepicker.type.time.html'], function(el) {
          el.on('change', changeSpy);

          // Overlay does not open immediately any longer
          el.on('coral-overlay:open', function() {
            // we need to select a full time to have a valid change event
            el._elements.clock._elements.hours.value = '12';
            el._elements.clock._elements.hours.trigger('change');

            el._elements.clock._elements.minutes.value = '59';
            el._elements.clock._elements.minutes.trigger('change');

            expect(changeSpy.callCount).to.equal(1);
            done();
          });

          el._elements.toggle.click();
        });
      });

      it('should trigger a change event when a datetime is selected', function(done) {
        var changeSpy = sinon.spy();

        helpers.build('<coral-datepicker type="datetime" value="2015-04-20T00:00+02:00"></coral-datepicker>', function(el) {
          el.on('change', changeSpy);

          // Overlay does not open immediately any longer
          el.on('coral-overlay:open', function() {
            el._elements.clock._elements.minutes.value = '59';
            el._elements.clock._elements.minutes.trigger('change');

            expect(changeSpy.callCount).to.equal(1);
            done();
          });

          el._elements.toggle.click();

        });
      });

      it('should trigger a change event when a datetime (with no initial value) is selected', function(done) {
        var changeSpy = sinon.spy();

        helpers.build(window.__html__['Coral.Datepicker.type.datetime.html'], function(el) {
          el.on('change', changeSpy);

          // Overlay does not open immediately any longer
          el.on('coral-overlay:open', function() {
            // we need to set a full time for the change event to be triggered
            el._elements.clock._elements.hours.value = '12';
            el._elements.clock._elements.hours.trigger('change');

            el._elements.clock._elements.minutes.value = '59';
            el._elements.clock._elements.minutes.trigger('change');

            expect(changeSpy.callCount).to.equal(1);
            done();
          });

          el._elements.toggle.click();
        });
      });
    });
  });

  describe('User Interaction', function() {
    it('should show the invalid style if the user sets the date manually', function(done) {
      helpers.build('<coral-datepicker min="2015-04-10" max="2015-04-28" value="2015-04-15"></coral-datepicker>', function(el) {
        // sets a value outside of the range
        el._elements.input.value = '2015-04-29';
        el._elements.input.trigger('change');

        helpers.next(function() {
          expect(el.value).to.equal('2015-04-29');
          expect(el.invalid).to.be.true;
          expect(el.$).to.have.class('is-invalid');
          done();
        });
      });
    });

    it('should show set the current time as default when no time is set, but a date was chosen', function(done) {
      helpers.build('<coral-datepicker type="datetime" value=""></coral-datepicker>', function(el) {

        // Overlay does not open immediately any longer
        el.on('coral-overlay:open', function() {
          var cell = el._elements.calendar._elements.body.querySelector('a');
          cell.click();

          helpers.next(function() {
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

        // we open the calendar to select a new date
        el._elements.toggle.click();

      });
    });

    it('toggle should open calendar', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.base.html'], function(el) {

        // Overlay does not open immediately any longer
        el.on('coral-overlay:open', function() {
          expect(el.$).to.have.attr('aria-expanded', 'true');
          done();
        });

        // opens the popover
        el._elements.toggle.click();

      });
    });

    it('should not toggle the calendar when readonly', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.readonly.html'], function(el) {
        // opens the popover
        el._elements.toggle.click();

        helpers.next(function() {
          expect(el._elements.popover.open).to.be.false;
          expect(el.$).to.have.attr('aria-expanded', 'false');

          done();
        });
      });
    });

    it('should recheck the invalid state after a user interaction happened', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.invalid.html'], function() {
        var datepicker1 = document.getElementById('validDatepicker1');
        var datepicker2 = document.getElementById('validDatepicker2');
        var datepicker3 = document.getElementById('invalidDatepicker');

        datepicker1._elements.input.trigger('change');
        datepicker2._elements.input.trigger('change');
        datepicker3._elements.input.trigger('change');

        // wait two frames to be sure all sync() methods have been called
        helpers.next(function() {
          helpers.next(function() {

            expect(datepicker1.invalid).to.equal(true, 'datepicker1 should be invalid (calculated by calendar)');
            expect(datepicker2.invalid).to.equal(true, 'datepicker2 should be invalid (calculated by calendar)');
            expect(datepicker3.invalid).to.equal(false, 'datepicker3 should not be invalid (calculated by calendar)');

            expect(datepicker1.hasAttribute('invalid')).to.equal(true, 'datepicker1 should have an invalid attribute');
            expect(datepicker2.hasAttribute('invalid')).to.equal(true, 'datepicker2 should have an invalid attribute');
            expect(datepicker3.hasAttribute('invalid')).to.equal(false, 'datepicker3 should not have an invalid attribute');

            done();
          });
        });
      });
    });
  });

  describe('Implementation details', function() {
    describe('#formField', function() {
      helpers.testFormField(window.__html__['Coral.Datepicker.value.html'], {
        value: '2014-12-31'
      });
    });

    it('should show different controls depending on the type', function(done) {
      var el = new Coral.Datepicker();
      el._renderCalendar();
      helpers.target.appendChild(el);

      expect(el.type).to.equal('date');

      helpers.next(function() {
        expect(el._elements.calendar.$).to.be.visible;
        expect($(el._elements.clockContainer)).to.be.hidden;
        expect(el._elements.toggle.icon).to.equal('calendar');

        // we change the type and check the expected display
        el.type = Coral.Datepicker.type.TIME;

        helpers.next(function() {
          expect(el._elements.calendar.$).to.be.hidden;
          expect($(el._elements.clockContainer)).to.be.visible;
          expect(el._elements.toggle.icon).to.equal('clock');

          el.type = Coral.Datepicker.type.DATETIME;

          helpers.next(function() {
            expect(el._elements.calendar.$).to.be.visible;
            expect($(el._elements.clockContainer)).to.be.visible;
            expect(el._elements.toggle.icon).to.equal('calendar');

            done();
          });
        });
      });
    });

    it('should close the popover when a date is clicked', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {
        // checks that initial value
        expect(el.value).to.equal('2000-12-31');

        // Overlay does not open immediately any longer
        el.on('coral-overlay:open', function() {
          var cell = el._elements.calendar._elements.body.querySelector('a');

          cell.click();

          helpers.next(function() {
            expect(el.value).to.equal(cell.dataset.date);
            expect(el._elements.popover.open).to.be.false;

            done();
          });
        });

        // we open the calendar to select a new date
        el._elements.toggle.click();

      });
    });

    it('should close the popover when the same date is clicked', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {
        // checks that initial value
        expect(el.value).to.equal('2000-12-31');

        // Overlay does not open immediately any longer
        el.on('coral-overlay:open', function() {
          var cell = el._elements.calendar._elements.body.querySelector('a[data-date="2000-12-31"]');
          expect(cell.dataset.date).to.equal('2000-12-31');

          cell.click();

          helpers.next(function() {
            expect(el.value).to.equal(cell.dataset.date);
            expect(el._elements.popover.open).to.be.false;

            done();
          });
        });

        // we open the calendar to select a new date
        el._elements.toggle.click();
      });
    });

    it('should close the popover when the same date is clicked', function(done) {
      helpers.build(window.__html__['Coral.Datepicker.value.html'], function(el) {
        // checks that initial value
        expect(el.value).to.equal('2000-12-31');

        // Overlay does not open immediately any longer
        el.on('coral-overlay:open', function() {
          var cell = el._elements.calendar._elements.body.querySelector('a[data-date="2000-12-31"]');
          expect(cell.dataset.date).to.equal('2000-12-31');

          cell.click();

          helpers.next(function() {
            expect(el.value).to.equal(cell.dataset.date);
            expect(el._elements.popover.open).to.be.false;

            done();
          });
        });

        // we open the calendar to select a new date
        el._elements.toggle.click();
      });
    });

  });
});
