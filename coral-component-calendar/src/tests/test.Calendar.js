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
import {Calendar} from '../../../coral-component-calendar';
import {DateTime} from '../../../coral-datetime';

describe('Calendar', function () {
  describe('Instantiation', function () {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['Calendar.base.html']
    );

    helpers.cloneComponent(
      'should be possible to clone the element using markup with a value',
      window.__html__['Calendar.value.html']
    );

    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new Calendar()
    );
  });

  // Run tests once with moment fallback and once with moment
  for (let useMomentJS = 0 ; useMomentJS < 2 ; useMomentJS++) {

    const momentJS = window.moment;

    beforeEach(function () {
      // Make sure Calendar and tests use momentJS fallback
      if (!useMomentJS) {
        window.moment = undefined;
      }
      // Make sure Calendar and tests use momentJS
      else {
        window.moment = momentJS;
      }
    });

    describe('API', function () {

      // Instantiated calendar element
      var el;
      var valuesMap = [{
        valueFormat: 'YYYY-MM-DD',
        setDateStr: '1975-03-02'
      }];

      if (useMomentJS) {
        // This one only works if moment JS is enabled
        valuesMap.push({
          valueFormat: 'MM-DD-YYYY',
          setDateStr: '12-31-2000'
        });
      }

      beforeEach(function () {
        el = new Calendar();
      });

      afterEach(function () {
        el = null;
      });

      // Repeat these tests with some varying dates + formatting settings:
      valuesMap.map(function (options) {

        var setDateStr = options.setDateStr;
        var valueFormat = options.valueFormat;

        describe('#value', function () {
          describe('changing value to "' + setDateStr + '", format: "' + valueFormat + '"', function () {

            var expectedFormattedOutput;
            var changeSpy;
            var setDateTime;

            beforeEach(function () {
              if (valueFormat) {
                el.valueFormat = valueFormat;
              }
              setDateTime = new DateTime.Moment(setDateStr, el.valueFormat);

              changeSpy = sinon.spy();
              el.on('change', changeSpy);

              expectedFormattedOutput = setDateTime.format(el.valueFormat);
              el.setAttribute('value', setDateStr);
            });

            afterEach(function () {
              el.off('change', changeSpy);
            });

            it('`value` should return set date', function () {
              expect(el.value).to.equal(expectedFormattedOutput);
            });

            it('`value` should return today when set to "today"', function () {
              el.value = 'today';

              expect(new DateTime.Moment().isSame(new DateTime.Moment(el.value, valueFormat), 'day')).to.be.true;
            });

            it('`valueAsDate` should return set date', function () {
              var date = el.valueAsDate;
              expect(DateTime.Moment.isMoment(date)).to.be.false;
              expect(date instanceof Date).to.be.true;
              expect(new DateTime.Moment(date).isSame(setDateTime, 'day')).to.be.true;
            });

            it('`input.value` should return set date', function () {
              expect(el._elements.input.value).to.eql(expectedFormattedOutput);
            });

            it('should NOT fire a change event when the value property is set programmatically', function () {
              expect(changeSpy.callCount).to.eql(0);
            });

            it('should NOT fire a change event when unchanged', function () {
              el.value = setDateStr;

              expect(changeSpy.callCount).to.eql(0);
            });
          });
        });

        describe('#valueAsDate', function () {
          describe('changing valueAsDate to ' + setDateStr + ', format: ' + valueFormat, function () {
            var expectedFormattedOutput;
            var changeSpy;
            var setDateTime;
            var setDate;

            beforeEach(function () {
              if (valueFormat) {
                el.valueFormat = valueFormat;
              }
              setDateTime = new DateTime.Moment(setDateStr, el.valueFormat);
              setDate = setDateTime.toDate();

              changeSpy = sinon.spy();
              el.on('change', changeSpy);

              expectedFormattedOutput = setDateTime.format(el.valueFormat);
              el.valueAsDate = setDate;
            });

            afterEach(function () {
              el.off('change', changeSpy);
            });

            it('`value` should return set date', function () {
              expect(el.value).to.eql(expectedFormattedOutput);
            });

            it('`valueAsDate` should return set date', function () {
              var date = el.valueAsDate;
              expect(DateTime.Moment.isMoment(date)).to.be.false;
              expect(date instanceof Date).to.be.true;
              expect(new DateTime.Moment(date).isSame(setDateTime)).to.be.true;
              expect(date === setDate).to.be.false;
            });

            it('`input.value` should return set date', function () {
              expect(el._elements.input.value).to.eql(expectedFormattedOutput);
            });

            it('should NOT fire a change event when the valueAsDate property is set programmatically', function () {
              expect(changeSpy.callCount).to.eql(0);
            });

            it('should NOT fire a change event when unchanged', function () {
              // We cannot use 'new Date(expectedFormattedOutput' here because Date has limited date format support
              // compared to momentjs
              el.valueAsDate = setDate;

              expect(changeSpy.callCount).to.eql(0);
            });
          });
        });
      });

      describe('#invalid', function () {
        it('should never be invalid when min and max are null', function () {
          expect(el.min).to.be.null;
          expect(el.max).to.be.null;
          expect(el.invalid).to.be.false;
          el.value = '2000-01-01';

          expect(el.invalid).to.be.false;
        });

        it('should be invalid when min is bigger than value (calculated only after a user interaction)', function () {
          helpers.build(el);
          el.value = '2000-01-01';
          expect(el.invalid).to.be.false;

          el.min = '2000-01-02';

          // Simulate a user interaction by calling the validate method (is called by every user interaction)
          el._validateCalendar();

          expect(el.invalid).to.be.true;

          // the activeDescendant element should be the minimum date that can be selected
          expect(el.querySelector('#' + el._activeDescendant + ' [data-date]').dataset.date).to.equal('2000-01-02');
        });

        it('should not be invalid when min is smaller than value', function () {
          el.value = '2000-01-02';
          expect(el.invalid).to.be.false;

          el.min = '2000-01-01';

          // Simulate a user interaction by calling the validate method (is called by every user interaction)
          el._validateCalendar();

          expect(el.invalid).to.be.false;
        });

        it('should be invalid when max is less than value', function () {
          helpers.build(el);
          el.value = '2000-01-02';
          expect(el.invalid).to.be.false;

          el.max = '2000-01-01';

          // Simulate a user interaction by calling the validate method (is called by every user interaction)
          el._validateCalendar();

          expect(el.invalid).to.be.true;

          // the activeDescendant element should be the maximum date that can be selected
          expect(el.querySelector('#' + el._activeDescendant + ' [data-date]').dataset.date).to.equal('2000-01-01');
        });

        it('should not be invalid when max is more than value', function () {
          el.value = '2000-01-01';
          expect(el.invalid).to.be.false;

          el.max = '2000-01-02';

          // Simulate a user interaction by calling the validate method (is called by every user interaction)
          el._validateCalendar();

          expect(el.invalid).to.be.false;
        });

        it('should not be invalid when value is between min and max', function () {
          el.value = '2000-01-02';

          expect(el.invalid).to.be.false;

          el.min = '2000-01-01';
          el.max = '2000-01-03';

          // Simulate a user interaction by calling the validate method (is called by every user interaction)
          el._validateCalendar();

          expect(el.invalid).to.be.false;
        });
      });

      describe('#max', function () {
        it('should update max value with the new format', function () {
          if (useMomentJS) {
            el.valueFormat = 'DD-MM-YYYY';

            el.max = '25-07-2015';

            // Compare Max value date object to the assigned date
            var maxDate = el.max;
            expect(maxDate.getFullYear()).to.equal(2015);
            expect(maxDate.getMonth() + 1).to.equal(7);
            expect(maxDate.getDate()).to.equal(25);
          }
        });

        it('should accept date objects for max', function () {
          el.max = new Date(2015, 9, 21);

          // Compare Max value date object to the assigned date
          var maxDate = el.max;
          expect(maxDate.getFullYear()).to.equal(2015);
          expect(maxDate.getMonth() + 1).to.equal(10);
          expect(maxDate.getDate()).to.equal(21);
        });

        it('should set max to null if value is invalid', function () {
          el.max = new Date('foo');

          expect(el.max).to.be.null;
        });

        it('should default to max', function () {
          expect(el.max).to.be.null;
        });
      });

      describe('#min', function () {
        it('should update min value with the new format', function () {
          if (useMomentJS) {
            el.valueFormat = 'DD-MM-YYYY';

            el.min = '10-07-2015';

            // Compare Min value date object to the assigned date
            var minDate = el.min;
            expect(minDate.getFullYear()).to.equal(2015);
            expect(minDate.getMonth() + 1).to.equal(7);
            expect(minDate.getDate()).to.equal(10);
          }
        });

        it('should accept date objects for min', function () {
          el.min = new Date(1987, 4, 30);

          // Compare Min value date object to the assigned date
          var minDate = el.min;
          expect(minDate.getFullYear()).to.equal(1987);
          expect(minDate.getMonth() + 1).to.equal(5);
          expect(minDate.getDate()).to.equal(30);
        });

        it('should set min to null if value is invalid', function () {
          el.min = 'a';

          expect(el.min).to.be.null;
        });

        it('should default to null', function () {
          expect(el.min).to.be.null;
        });
      });

      describe('#value', function () {
        it('should default to empty string', function () {
          expect(el.value).to.equal('');
          expect(el._elements.input.value).to.equal('');
        });

        it('should accept valid dates', function () {
          el.value = '2000-12-31';

          expect(el.value).to.equal('2000-12-31');
          expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment(new Date(2000, 11, 31)), 'day')).to.be.true;
        });

        it('should accept "today" as a value', function () {
          el.value = 'today';

          expect(new DateTime.Moment().isSame(new DateTime.Moment(el.valueAsDate), 'day')).to.be.true;
          expect(new DateTime.Moment(el.value).isSame(new DateTime.Moment(Date.now()), 'day')).to.be.true;
        });

        it('should reject invalid value strings', function () {
          el.value = 'nondate';

          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });

        it('should reject invalid date strings', function () {
          el.value = 'a';

          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });

        it('should accept date objects', function () {
          var today = new Date();

          el.value = today;
          expect(new DateTime.Moment(el.value, el.valueFormat).isSame(new DateTime.Moment(el.today), 'day')).to.be.true;
          expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment(today), 'day')).to.be.true;
        });
      });

      describe('#valueAsDate', function () {
        it('should default to null', function () {
          expect(el.valueAsDate).to.be.null;
        });

        it('should accept dates', function () {
          var newDate = new Date();
          el.valueAsDate = newDate;
          expect(new DateTime.Moment(newDate).isSame(new DateTime.Moment(el.valueAsDate), 'day')).to.be.true;
        });

        it('should reject date strings', function () {
          el.valueAsDate = '2000-02-20';

          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });

        it('should be able to clear the value', function () {
          el.valueAsDate = new Date();
          expect(el.value).not.to.equal('');

          el.valueAsDate = '';
          expect(el.value).to.equal('');
          expect(el.valueAsDate).to.be.null;
        });
      });

      describe('#focus()', function () {
        it('should set focus to calendar body if no other descendant has focus', function () {
          helpers.build(el);

          // set focus to element
          el.focus();

          // document focus should be body element
          expect(document.activeElement).to.equal(el._elements.body);

          // explicitly move focus to prev button
          el._elements.prev.focus();

          // set focus to element again
          el.focus();

          // document focus should remain on body button
          expect(document.activeElement).to.equal(el._elements.body);
        });
      });

      describe('#disabled', function () {
        it('should not receive focus when disabled', function () {
          helpers.build(el);

          // disable element
          el.disabled = true;

          // set focus to element
          el.focus();

          // document focus should remain on document.body
          expect(document.activeElement).to.not.equal(el._elements.body);
        });
      });
    });

    describe('Markup', function () {
      describe('#min', function () {
        it('should default to null if not specified', function () {
          const el = helpers.build(window.__html__['Calendar.base.html']);
          expect(el.min).to.be.null;
        });

        it('should accept valid dates as string', function () {
          const el = helpers.build(window.__html__['Calendar.min.html']);
          expect(el.min).to.deep.equal(new Date(2015, 3, 21));
        });

        it('should accept "today" as a value', function () {
          const el = helpers.build(window.__html__['Calendar.min.today.html']);
          expect(new DateTime.Moment(el.min).isSame(new DateTime.Moment(Date.now()), 'day')).to.be.true;
        });

        it('should set invalid values to null', function () {
          const el = helpers.build(window.__html__['Calendar.min.invalid.html']);
          expect(el.min).to.equal(null);
        });
      });

      describe('#max', function () {
        it('should default to null if not specified', function () {
          const el = helpers.build(window.__html__['Calendar.base.html']);
          expect(el.max).to.be.null;
        });

        it('should accept valid dates as string', function () {
          const el = helpers.build(window.__html__['Calendar.max.html']);
          expect(el.max).to.deep.equal(new Date(2015, 3, 21));
        });

        it('should accept "today" as a value', function () {
          const el = helpers.build(window.__html__['Calendar.max.today.html']);
          expect(new DateTime.Moment(el.max).isSame(new DateTime.Moment(Date.now()), 'day')).to.be.true;
        });

        it('should set invalid values to null', function () {
          const el = helpers.build(window.__html__['Calendar.max.invalid.html']);
          expect(el.max).to.equal(null);
        });
      });
    });

    describe('User Interaction', function () {
      // Instantiated calendar element
      var el;

      beforeEach(function () {
        el = helpers.build(new Calendar());
      });

      afterEach(function () {
        el = null;
      });

      it('should display the month of the set date', function () {
        var now = new DateTime.Moment();
        el.valueAsDate = now;

        expect(el._cursor.month()).to.eql(now.month());
      });

      it('should go to next month on next month button click', function () {
        var now = new DateTime.Moment();
        el.valueAsDate = now;

        el._elements.next.click();

        expect(el._cursor.month()).to.eql(now.add(1, 'month').month());
      });

      it('should go to next month on next month button click when max is set', function () {
        el.value = '2017-07-31';
        el.max = '2017-08-17';

        el._elements.next.click();

        expect(el._cursor.month()).to.eql(moment(el.valueAsDate).add(1, 'month').month());
      });

      it('should go to previous month on previous month button click when min is set', function () {
        el.value = '2017-07-31';
        el.min = '2017-06-17';

        el._elements.prev.click();

        expect(el._cursor.month()).to.eql(moment(el.valueAsDate).subtract(1, 'month').month());
      });

      it('should go to next month on next month button click when min and max are set', function () {
        el.value = '2018-03-14';
        el.min = '2018-03-03';
        el.max = '2018-05-20';

        el._elements.next.click();

        expect(el._cursor.month()).to.eql(moment(el.valueAsDate).add(1, 'month').month());
      });

      it('should calculate invalid only once the user interacted with the component', function () {
        el.value = '2000-01-01';
        expect(el.invalid).to.be.false;

        el.min = '2000-01-02';

        expect(el.invalid).to.be.false;

        el._elements.next.click();

        expect(el.invalid).to.be.true;
      });

      it('should handle multiple next clicks correctly', function () {
        var now = new DateTime.Moment();
        el.valueAsDate = now;

        el._elements.next.click();
        el._elements.next.click();
        el._elements.next.click();
        el._elements.next.click();
        el._elements.next.click();
        expect(el._cursor.month()).to.eql(now.add(5, 'month').month());
      });

      it('should go to previous month on prev month button click', function () {
        var now = new DateTime.Moment();
        el.valueAsDate = now;

        el._elements.prev.click();

        expect(el._cursor.month()).to.eql(now.subtract(1, 'month').month());
      });

      it('should handle multiple prev clicks correctly', function () {
        var now = new DateTime.Moment();
        el.valueAsDate = now;

        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.prev.click();

        expect(el._cursor.month()).to.eql(now.subtract(5, 'month').month());
      });

      it('should handle multiple prev and next clicks correctly', function () {
        var now = new DateTime.Moment();
        el.valueAsDate = now;

        el._elements.prev.click();
        el._elements.prev.click();
        el._elements.next.click();
        el._elements.next.click();
        el._elements.prev.click();

        expect(el._cursor.month()).to.eql(now.subtract(1, 'month').month());
      });

      it('should select the clicked day', function () {
        el.value = '1975-03-02';

        var nextDate = new DateTime.Moment('1975-03-03');
        var nextDateString = nextDate.format('YYYY-MM-DD');
        var nextDay = el.querySelector('a[data-date^="' + nextDateString + '"]');
        nextDay.click();
        expect(new DateTime.Moment(el.valueAsDate).isSame(new DateTime.Moment(nextDateString), 'day')).to.be.true;
      });

      it('should trigger a change event when a new date is selected', function () {
        const el = helpers.build('<coral-calendar value="2000-03-06"></coral-calendar>');
        var changeSpy = sinon.spy();
        var cell = el._elements.body.querySelector('a');

        el.on('change', changeSpy);
        cell.click();


        expect(changeSpy.callCount).to.equal(1);
      });

      it('should NOT trigger a change event when the same date is selected', function () {
        const el = helpers.build('<coral-calendar valueformat="YYYY-MM-DD" value="2000-03-06"></coral-calendar>');
        var changeSpy = sinon.spy();
        var dateString = new DateTime.Moment('2000-03-06').format('YYYY-MM-DD');
        var cell = el._elements.body.querySelector('[data-date^="' + dateString + '"]');

        el.on('change', changeSpy);
        cell.click();

        expect(changeSpy.callCount).to.equal(0);
      });

      describe('Keyboard', function() {
        it('should go to previous day on ArrowLeft', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;
  
          helpers.next(function() {
            helpers.keypress('left', el._elements.body);
  
            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date');
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.date()).to.eql(now.subtract(1, 'day').date());
              }
  
              done();
            });
          });
        });

        it('should go to next day on ArrowRight', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;
  
          helpers.next(function() {
            helpers.keypress('right', el._elements.body);
  
            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.date()).to.eql(now.add(1, 'day').date());
              }
  
              done();
            });
          });
        });

        it('should go to previous week on ArrowUp', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;
  
          helpers.next(function() {
            helpers.keypress('up', el._elements.body);
  
            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date');
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.date()).to.eql(now.subtract(1, 'week').date());
              }
  
              done();
            });
          });
        });
  
        it('should go to next week on ArrowDown', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;
  
          helpers.next(function() {
            helpers.keypress('down', el._elements.body);
  
            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.date()).to.eql(now.add(1, 'week').date());
              }
  
              done();
            });
          });
        });

        it('should go to previous month on PageUp', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;
  
          helpers.next(function() {
            helpers.keypress('pageup', el);
  
            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.month()).to.eql(now.subtract(1, 'month').month());
              }
  
              done();
            });
          });
        });
  
        it('should go to next month on PageDown', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;
  
          helpers.next(function() {
            helpers.keypress('pagedown', el);
  
            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.month()).to.eql(now.add(1, 'month').month());
              }
  
              done();
            });
          });
        });


        it('should go to previous year on Ctrl+PageUp', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.ctrlKey = true;
            el.dispatchEvent(event);

            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.ctrlKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.subtract(1, 'year').year());
              }

              done();
            });
          });
        });

        it('should go to next year on Ctrl+PageDown', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.ctrlKey = true;
            el.dispatchEvent(event);
            
            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.ctrlKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.add(1, 'year').year());
              }

              done();
            });
          });
        });

        it('should go to previous year on Meta+PageUp', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.metaKey = true;
            el.dispatchEvent(event);

            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.metaKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.subtract(1, 'year').year());
              }

              done();
            });
          });
        });

        it('should go to next year on Meta+PageDown', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.metaKey = true;
            el.dispatchEvent(event);
            
            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.metaKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.add(1, 'year').year());
              }

              done();
            });
          });
        });

        it('should go to previous year on Alt+PageUp', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.altKey = true;
            el.dispatchEvent(event);

            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.altKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.subtract(1, 'year').year());
              }

              done();
            });
          });
        });

        it('should go to next year on Alt+PageDown', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.altKey = true;
            el.dispatchEvent(event);
            
            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.altKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.add(1, 'year').year());
              }

              done();
            });
          });
        });

        it('should go to previous year on Shift+PageUp', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.shiftKey = true;
            el.dispatchEvent(event);

            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 33;
            event.which = 33;
            event.shiftKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.subtract(1, 'year').year());
              }

              done();
            });
          });
        });

        it('should go to next year on Shift+PageDown', function(done) {
          var now = new DateTime.Moment();
          el.valueAsDate = now;

          helpers.next(function() {
            var event = document.createEvent('Event');
            event.initEvent('keydown', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.shiftKey = true;
            el.dispatchEvent(event);
            
            event = document.createEvent('Event');
            event.initEvent('keyup', true, true);
            event.keyCode = 34;
            event.which = 34;
            event.shiftKey = true;
            el.dispatchEvent(event);

            helpers.next(function() {
              var dateEl = el._elements.body.querySelector('td.is-focused .coral3-Calendar-date'); 
              if (dateEl) {
                var currentActive = dateEl.dataset.date;
                var currentMoment = moment(currentActive);
                expect(currentMoment.year()).to.eql(now.add(1, 'year').year());
              }

              done();
            });
          });
        });
      });
    });

    describe('Implementation Details', function () {
      describe('rendering', function () {
        it('should render correctly out of range dates', function () {
          const el = helpers.build(window.__html__['Calendar.base.html']);
          var testDate = '2017-03-02';
          // we set the date and then we check that it is rendered corrected
          el.value = testDate;

          var rows = el._elements.body.querySelectorAll('tbody > tr');
          expect(rows.length).to.equal(6, 'Six rows should be created in the calendar');

          for (var x = 0 ; x < rows.length ; x++) {
            var cells = rows[x].querySelectorAll('td');
            for (var y = 0 ; y < cells.length ; y++) {
              expect(cells[y].textContent.trim()).not.to.equal('NaN', 'All entries should be valid');
            }
          }
        });
      });

      describe('#formfield', function () {
        helpers.testFormField(window.__html__['Calendar.value.html'], {
          value: '2015-03-02'
        });
      });
    });
  }
});
