describe('Coral.Calendar', function() {
  'use strict';

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Calendar');
    });
  });

  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function(done) {
      helpers.build(window.__html__['Coral.Calendar.base.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible to clone the element using markup with a value', function(done) {
      helpers.build(window.__html__['Coral.Calendar.value.html'], function(el) {
        helpers.testComponentClone(el, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      var el = new Coral.Calendar();
      helpers.target.appendChild(el);
      helpers.next(function() {
        helpers.testComponentClone(el, done);
      });
    });
  });

  describe('API', function() {
    // Instantiated calendar element
    var el;

    beforeEach(function() {
      el = new Coral.Calendar();
    });

    afterEach(function() {
      el = null;
    });

    // Repeat these tests with some varying dates + formatting settings:
    [
      {
        valueFormat: undefined,
        setDateStr: '1975-03-02T00:00+01:00'
      },
      {
        valueFormat: 'YYYY-MM-DD',
        setDateStr: '1975-03-02T00:00+01:00'
      },
      {
        valueFormat: undefined,
        setDateStr: '1975-03-02T00:00+03:00'
      },
      {
        valueFormat: 'YYYY-MM-DD',
        setDateStr: '1975-03-02T00:00+03:00'
      },
      {
        valueFormat: 'MM-DD-YYYY',
        setDateStr: '12-31-2000'
      }
    ].map(function(options) {

      var setDateStr = options.setDateStr;
      var valueFormat = options.valueFormat;

      describe('changing value to "' + setDateStr + '", format: "' + valueFormat + '"', function() {

        var expectedFormattedOutput;
        var changeSpy;
        var setMoment;

        beforeEach(function() {
          if (valueFormat) {
            el.valueFormat = valueFormat;
          }
          setMoment = moment(setDateStr, el.valueFormat);

          changeSpy = sinon.spy();
          el.on('change', changeSpy);

          expectedFormattedOutput = setMoment.format(el.valueFormat);
          el.setAttribute('value', setDateStr);
        });

        afterEach(function() {
          el.off('change', changeSpy);
        });

        it('`value` should return set date', function(done) {
          helpers.next(function() {
            expect(el.value).to.eql(expectedFormattedOutput);
            done();
          });
        });

        it('`value` should return today when set to "today"', function(done) {
          el.value = 'today';
          helpers.next(function() {
            expect(moment().isSame(moment(el.value, valueFormat), 'day')).to.be.true;
            done();
          });
        });

        it('`valueAsDate` should return set date', function(done) {
          helpers.next(function() {
            var date = el.valueAsDate;
            expect(moment.isMoment(date)).to.be.false;
            expect(date instanceof Date).to.be.true;
            expect(moment(date).isSame(setMoment)).to.be.true;
            done();
          });
        });

        it('`input.value` should return set date', function() {
          expect(el._elements.input.value).to.eql(expectedFormattedOutput);
        });

        it('should NOT fire a change event when the value property is set programmatically', function(done) {
          helpers.next(function() {
            expect(changeSpy.callCount).to.eql(0);
            done();
          });
        });

        it('should NOT fire a change event when unchanged', function(done) {
          helpers.next(function() {
            el.value = setDateStr;
            helpers.next(function() {
              expect(changeSpy.callCount).to.eql(0);
              done();
            });
          });
        });

      });

      describe('changing valueAsDate to ' + setDateStr + ', format: ' + valueFormat, function() {
        var expectedFormattedOutput;
        var changeSpy;
        var setMoment;
        var setDate;

        beforeEach(function() {
          if (valueFormat) {
            el.valueFormat = valueFormat;
          }
          setMoment = moment(setDateStr, el.valueFormat);
          setDate = setMoment.toDate();

          changeSpy = sinon.spy();
          el.on('change', changeSpy);

          expectedFormattedOutput = setMoment.format(el.valueFormat);
          el.valueAsDate = setDate;
        });

        afterEach(function() {
          el.off('change', changeSpy);
        });

        it('`value` should return set date', function(done) {
          helpers.next(function() {
            expect(el.value).to.eql(expectedFormattedOutput);
            done();
          });
        });

        it('`valueAsDate` should return set date', function(done) {
          helpers.next(function() {
            var date = el.valueAsDate;
            expect(moment.isMoment(date)).to.be.false;
            expect(date instanceof Date).to.be.true;
            expect(moment(date).isSame(setMoment)).to.be.true;
            expect(date === setDate).to.be.false;

            done();
          });
        });

        it('`input.value` should return set date', function() {
          expect(el._elements.input.value).to.eql(expectedFormattedOutput);
        });

        it('should NOT fire a change event when the valueAsDate property is set programmatically', function(done) {
          helpers.next(function() {
            expect(changeSpy.callCount).to.eql(0);

            done();
          });
        });

        it('should NOT fire a change event when unchanged', function(done) {
          helpers.next(function() {
            // We cannot use 'new Date(expectedFormattedOutput' here because Date has limited date format support
            // compared to momentjs
            el.valueAsDate = setDate;

            helpers.next(function() {
              expect(changeSpy.callCount).to.eql(0);

              done();
            });
          });
        });
      });
    });

    describe('[min, max, invalid]', function() {

      it('should never be invalid when min and max are null', function(done) {
        expect(el.min).to.be.null;
        expect(el.max).to.be.null;
        expect(el.invalid).to.be.false;
        el.value = '2000-01-01';

        helpers.next(function() {
          expect(el.invalid).to.be.false;

          done();
        });
      });

      it('should be invalid when min is bigger than value (calculated only after a user interaction)', function(done) {
        el.value = '2000-01-01';
        expect(el.invalid).to.be.false;

        el.min = '2000-01-02';

        // Simulate a user interaction by calling the validate method (is called by every user interaction)
        el._validateCalendar();

        helpers.next(function() {
          expect(el.invalid).to.be.true;

          done();
        });
      });

      it('should not be invalid when min is smaller than value', function(done) {
        el.value = '2000-01-02';
        expect(el.invalid).to.be.false;

        el.min = '2000-01-01';

        // Simulate a user interaction by calling the validate method (is called by every user interaction)
        el._validateCalendar();

        helpers.next(function() {
          expect(el.invalid).to.be.false;

          done();
        });
      });

      it('should be invalid when max is less than value', function(done) {
        el.value = '2000-01-02';
        expect(el.invalid).to.be.false;

        el.max = '2000-01-01';

        // Simulate a user interaction by calling the validate method (is called by every user interaction)
        el._validateCalendar();

        helpers.next(function() {
          expect(el.invalid).to.be.true;

          done();
        });
      });

      it('should not be invalid when max is more than value', function(done) {
        el.value = '2000-01-01';
        expect(el.invalid).to.be.false;

        el.max = '2000-01-02';

        // Simulate a user interaction by calling the validate method (is called by every user interaction)
        el._validateCalendar();

        helpers.next(function() {
          expect(el.invalid).to.be.false;

          done();
        });
      });

      it('should not be invalid when value is between min and max', function(done) {
        el.value = '2000-01-02';
        expect(el.invalid).to.be.false;

        el.min = '2000-01-01';
        el.max = '2000-01-03';

        // Simulate a user interaction by calling the validate method (is called by every user interaction)
        el._validateCalendar();

        helpers.next(function() {
          expect(el.invalid).to.be.false;

          done();
        });
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

      it('should accept date objects for min/max', function() {
        el.min = new Date(1987, 4, 30);
        el.max = new Date(2015, 9, 21);

        // Compare Min value date object to the assigned date
        var minDate = el.min;
        expect(minDate.getFullYear()).to.equal(1987);
        expect(minDate.getMonth() + 1).to.equal(5);
        expect(minDate.getDate()).to.equal(30);

        // Compare Max value date object to the assigned date
        var maxDate = el.max;
        expect(maxDate.getFullYear()).to.equal(2015);
        expect(maxDate.getMonth() + 1).to.equal(10);
        expect(maxDate.getDate()).to.equal(21);
      });

      it('should accept moment objects for min/max', function() {
        el.min = moment('1987-05-30');
        el.max = moment('2015-10-21');

        // Compare Min value date object to the assigned date
        var minDate = el.min;
        expect(minDate.getFullYear()).to.equal(1987);
        expect(minDate.getMonth() + 1).to.equal(5);
        expect(minDate.getDate()).to.equal(30);

        // Compare Max value date object to the assigned date
        var maxDate = el.max;
        expect(maxDate.getFullYear()).to.equal(2015);
        expect(maxDate.getMonth() + 1).to.equal(10);
        expect(maxDate.getDate()).to.equal(21);
      });

      it('should set min/max to null if value is invalid', function() {
        el.min = moment('1987-02-30');
        el.max = new Date('foo');

        expect(el.min).to.be.null;
        expect(el.max).to.be.null;
      });
    });

    describe('#min', function() {
      it('should default to null', function() {
        expect(el.min).to.be.null;
      });
    });

    describe('#max', function() {
      it('should default to max', function() {
        expect(el.max).to.be.null;
      });
    });

    describe('#value', function() {
      it('should default to empty string', function() {
        expect(el.value).to.equal('');
        expect(el._elements.input.value).to.equal('');
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
  });

  describe('Markup', function() {
    describe('#min', function() {
      it('should default to null if not specified', function(done) {
        helpers.build(window.__html__['Coral.Calendar.base.html'], function(el) {
          expect(el.min).to.be.null;

          done();
        });
      });

      it('should accept valid dates as string', function(done) {
        helpers.build(window.__html__['Coral.Calendar.min.html'], function(el) {
          expect(el.min).to.deep.equal(new Date(2015, 3, 21));

          done();
        });
      });

      it('should accept "today" as a value', function(done) {
        helpers.build(window.__html__['Coral.Calendar.min.today.html'], function(el) {
          expect(moment(el.min).isSame(Date.now(), 'day')).to.be.true;

          done();
        });
      });

      it('should set invalid values to null', function(done) {
        helpers.build(window.__html__['Coral.Calendar.min.invalid.html'], function(el) {
          expect(el.min).to.equal(null);

          done();
        });
      });
    });

    describe('#max', function() {
      it('should default to null if not specified', function(done) {
        helpers.build(window.__html__['Coral.Calendar.base.html'], function(el) {
          expect(el.max).to.be.null;

          done();
        });
      });

      it('should accept valid dates as string', function(done) {
        helpers.build(window.__html__['Coral.Calendar.max.html'], function(el) {
          expect(el.max).to.deep.equal(new Date(2015, 3, 21));

          done();
        });
      });

      it('should accept "today" as a value', function(done) {
        helpers.build(window.__html__['Coral.Calendar.max.today.html'], function(el) {
          expect(moment(el.max).isSame(Date.now(), 'day')).to.be.true;

          done();
        });
      });

      it('should set invalid values to null', function(done) {
        helpers.build(window.__html__['Coral.Calendar.max.invalid.html'], function(el) {
          expect(el.max).to.equal(null);

          done();
        });
      });
    });
  });

  describe('User Interaction', function() {
    // Instantiated calendar element
    var el;

    beforeEach(function() {
      el = new Coral.Calendar();
      helpers.target.appendChild(el);
    });

    afterEach(function() {
      el = null;
    });

    it('should display the month of the set date', function(done) {
      var now = moment();
      el.valueAsDate = now;

      helpers.next(function() {
        expect(el._cursor.month()).to.eql(now.month());

        done();
      });
    });

    it('should go to next month on next month button click', function(done) {
      var now = moment();
      el.valueAsDate = now;

      helpers.next(function() {
        el._elements.next.click();

        helpers.next(function() {
          expect(el._cursor.month()).to.eql(now.add(1, 'month').month());

          done();
        });
      });
    });

    it('should calculate invalid only once the user interacted with the component', function(done) {
      el.value = '2000-01-01';
      expect(el.invalid).to.be.false;

      el.min = '2000-01-02';

      helpers.next(function() {
        expect(el.invalid).to.be.false;

        el._elements.next.click();

        helpers.next(function() {
          expect(el.invalid).to.be.true;

          done();
        });

      });
    });

    it('should handle multiple next clicks correctly', function(done) {
      var now = moment();
      el.valueAsDate = now;

      helpers.next(function() {
        el._elements.next.click();
        el._elements.next.click();
        el._elements.next.click();
        el._elements.next.click();
        el._elements.next.click();
        expect(el._cursor.month()).to.eql(now.add(5, 'month').month());

        done();
      });
    });

    it('should go to previous month on prev month button click', function(done) {
      var now = moment();
      el.valueAsDate = now;
      helpers.next(function() {
        el._elements.prev.click();
        helpers.next(function() {
          expect(el._cursor.month()).to.eql(now.subtract(1, 'month').month());

          done();
        });
      });
    });

    it('should handle multiple prev clicks correctly', function(done) {
      var now = moment();
      el.valueAsDate = now;

      helpers.next(function() {
        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.prev.click();

        helpers.next(function() {
          expect(el._cursor.month()).to.eql(now.subtract(5, 'month').month());

          done();
        });
      });
    });

    it('should handle multiple prev and next clicks correctly', function(done) {
      var now = moment();
      el.valueAsDate = now;

      helpers.next(function() {
        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.next.click();
        el._elements.next.click();
        el._elements.prev.click();

        helpers.next(function() {
          expect(el._cursor.month()).to.eql(now.subtract(1, 'month').month());

          done();
        });
      });
    });

    it('should select the clicked day', function(done) {
      el.value = '1975-03-02';

      helpers.next(function() {
        var nextDate = moment.utc('1975-03-03').local();
        var nextDateString = nextDate.format('YYYY-MM-DD');
        var nextDay = el.$.find('a[data-date^="' + nextDateString + '"]').get(0);
        nextDay.click();
        expect(moment(el.valueAsDate).isSame(nextDateString, 'day')).to.be.true;

        done();
      });
    });

    it('should trigger a change event when a new date is selected', function(done) {
      helpers.build('<coral-calendar value="2000-03-06"></coral-calendar>', function(el) {
        var changeSpy = sinon.spy();
        var cell = el._elements.body.querySelector('a');

        el.on('change', changeSpy);
        cell.click();

        helpers.next(function() {
          expect(changeSpy.callCount).to.equal(1);

          done();
        });
      });
    });

    it('should NOT trigger a change event when the same date is selected', function(done) {
      helpers.build('<coral-calendar valueformat="YYYY-MM-DD" value="2000-03-06"></coral-calendar>', function(el) {
        var changeSpy = sinon.spy();
        var dateString = moment('2000-03-06').format('YYYY-MM-DD');
        var cell = el._elements.body.querySelector('[data-date^="' + dateString + '"]');

        el.on('change', changeSpy);
        cell.click();

        helpers.next(function() {
          expect(changeSpy.callCount).to.equal(0);

          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    describe('#formfield', function() {
      helpers.testFormField(window.__html__['Coral.Calendar.value.html'], {
        value: '2015-03-02'
      });
    });
  });
});
