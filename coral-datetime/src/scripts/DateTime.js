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

// todo add tests

// Used to store DateTimeFormat
const dateTimeFormats = {};

// Default supported format
const DEFAULT_FORMAT = 'YYYY-MM-DD';

const transform2digit = (value) => {
  const s = value.toString();
  return s.length === 1 ? `0${s}` : s;
};

// Default locale
let globalLocale = document.documentElement.lang || window.navigator.language || 'en-US';

// Uses Intl.DateTimeFormat to return a formatted date string
const formatDate = function (date, locale, options) {
  let formattedDateString = '';
  try {
    const key = `${JSON.stringify(locale)}${JSON.stringify(options)}`;
    const dateTimeFormat = dateTimeFormats[key];

    // Use existing DateTimeFormat or create new one
    if (!dateTimeFormat) {
      dateTimeFormats[key] = new window.Intl.DateTimeFormat(locale, options);
    }

    // Format to string
    formattedDateString = dateTimeFormats[key].format(date);
  } catch (e) {
    console.warn(e.message);
  }

  return formattedDateString;
};

/**
 The DateTime API is used as fallback to {@link momentJS}.

 @param {DateTime|Date|Array<Number>|String} value
 The initial date value. If none provided, the current day is used instead.
 */
class DateTime {
  /**
   @see https://momentjs.com/docs/#/parsing/now/
   */
  constructor(value) {
    if (value instanceof this.constructor) {
      // Copy properties
      this._locale = value._locale;
      this._value = value._value;
      this._date = value._date;
    } else {
      this._locale = globalLocale;
      this._value = value;

      // Support Array
      if (Array.isArray(value)) {
        this._date = value.length ? new Date(value[0], value[1] || 0, value[2] || 1) : new Date();
      } else if (typeof value === 'string') {
        const isTime = value.indexOf(':') === 2;

        // For time, we only need to set hours and minutes using current date
        if (isTime) {
          const time = value.split(':');
          const hours = parseInt(time[0], 10);
          const minutes = parseInt(time[1], 10);

          if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
            this._date = new Date();
            this._date.setHours(time[0]);
            this._date.setMinutes(time[1]);
          } else {
            this._date = new Date('Invalid Date');
          }
        } else {
          // If string is invalid, the date will be invalid too
          // "replace" fixes the one day off issue
          this._date = new Date(this._value.replace(/-/g, '/').replace(/T.+/, ''));
        }
      } else if (this._value === null) {
        this._date = new Date('Invalid Date');
      } else {
        // Create a Date instance from the value or use current day if value is missing
        this._date = this._value ? new Date(this._value) : new Date();
      }
    }
  }

  /**
   @see https://momentjs.com/docs/#/i18n/instance-locale/
   */
  locale(value) {
    if (value) {
      this._locale = value;
    }

    return this._locale;
  }

  /**
   @see https://momentjs.com/docs/#/displaying/as-javascript-date/
   */
  toDate() {
    return this._date;
  }

  /**
   @see https://momentjs.com/docs/#/parsing/moment-clone/
   */
  clone() {
    const clone = new this.constructor(this._value);
    clone._date = this._date;
    return clone;
  }

  /**
   @see https://momentjs.com/docs/#/displaying/format/
   */
  format(format) {
    let formattedDateString = '';

    if (!format) {
      format = DEFAULT_FORMAT;
    }

    if (format === DEFAULT_FORMAT) {
      formattedDateString += this._date.getFullYear();
      formattedDateString += '-';
      formattedDateString += transform2digit(this._date.getMonth() + 1);
      formattedDateString += '-';
      formattedDateString += transform2digit(this._date.getDate());
    } else if (format === 'MMMM YYYY') {
      formattedDateString += formatDate(this._date, this._locale, {month: 'long'});
      formattedDateString += ' ';
      formattedDateString += this._date.getFullYear();
    } else if (format === 'LL') {
      formattedDateString += formatDate(this._date, this._locale, {
        month: 'long',
        year: 'numeric',
        day: '2-digit'
      });
    } else if (format === 'dd') {
      formattedDateString += formatDate(this._date, this._locale, {weekday: 'short'});
    } else if (format === 'dddd') {
      formattedDateString += formatDate(this._date, this._locale, {weekday: 'long'});
    } else if (format === 'HH:mm') {
      formattedDateString += transform2digit(this._date.getHours());
      formattedDateString += ':';
      formattedDateString += transform2digit(this._date.getMinutes());
    } else if (format === 'HH') {
      formattedDateString += transform2digit(this._date.getHours());
    } else if (format === 'mm') {
      formattedDateString += transform2digit(this._date.getMinutes());
    } else if (format === 'YYYY-MM-DD[T]HH:mmZ') {
      formattedDateString += this._date.getFullYear();
      formattedDateString += '-';
      formattedDateString += transform2digit(this._date.getMonth() + 1);
      formattedDateString += '-';
      formattedDateString += transform2digit(this._date.getDate());

      formattedDateString += 'T';

      formattedDateString += transform2digit(this._date.getHours());
      formattedDateString += ':';
      formattedDateString += transform2digit(this._date.getMinutes());

      const timezone = -1 * (this._date.getTimezoneOffset() / 60);
      let abs = Math.abs(timezone);
      abs = abs < 10 ? `0${abs}` : abs.toString();

      formattedDateString += timezone < 0 ? `-${abs}:00` : `+${abs}:00`;
    } else {
      format = typeof format === 'object' ? format : {};
      formattedDateString = formatDate(this._date, this._locale, format);
    }

    return formattedDateString;
  }

  /**
   @see https://momentjs.com/docs/#/get-set/year/
   */
  year() {
    return this._date.getFullYear();
  }

  /**
   @see https://momentjs.com/docs/#/get-set/month/
   */
  month() {
    return this._date.getMonth();
  }

  /**
   @see https://momentjs.com/docs/#/get-set/week/
   */
  week() {
    // Source : https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
    const date = new Date(Date.UTC(this._date.getFullYear(), this._date.getMonth(), this._date.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil(((date - yearStart) / 86400000 + 1) / 7);
  }

  /**
   @see https://momentjs.com/docs/#/get-set/day/
   */
  day(day) {
    if (typeof day === 'number') {
      this._date.setDate(this._date.getDate() - (this._date.getDay() || 7) + day);

      return this;
    }

    return this._date.getDay();
  }

  /**
   @see https://momentjs.com/docs/#/get-set/hour/
   */
  hours(hours) {
    if (typeof hours === 'number') {
      this._date.setHours(hours);

      return this;
    }

    return this._date.getHours();
  }

  /**
   @see https://momentjs.com/docs/#/get-set/minute/
   */
  minutes(minutes) {
    if (typeof minutes === 'number') {
      this._date.setMinutes(minutes);

      return this;
    }

    return this._date.getMinutes();
  }

  /**
   @see https://momentjs.com/docs/#/get-set/date/
   */
  date() {
    return this._date.getDate();
  }

  /**
   @see https://momentjs.com/docs/#/manipulating/add/
   */
  add(value, type) {
    let multiplier = 1;
    switch (type) {
      case 'year':
      case 'years':
        multiplier = 12;
      case 'month':
      case 'months':
        const dayOfMonth = this._date.getDate();
        this._date.setMonth(this._date.getMonth() + multiplier * value);
        if (this._date.getDate() != dayOfMonth) {
          this._date.setDate(0);
        }
        break;
      case 'week':
      case 'weeks':
        multiplier = 7;
      case 'day':
      case 'days':
        this._date.setDate(this._date.getDate() + multiplier * value);
        break;
    }

    return this;
  }

  /**
   @see https://momentjs.com/docs/#/manipulating/subtract/
   */
  subtract(value, type) {
    let multiplier = 1;
    switch (type) {
      case 'year':
      case 'years':
        multiplier = 12;
      case 'month':
      case 'months':
        const dayOfMonth = this._date.getDate();
        this._date.setMonth(this._date.getMonth() - multiplier * value);
        if (this._date.getDate() != dayOfMonth) {
          this._date.setDate(0);
        }
        break;
      case 'week':
      case 'weeks':
        multiplier = 7;
      case 'day':
      case 'days':
        this._date.setDate(this._date.getDate() - multiplier * value);
        break;
    }

    return this;
  }


  /**
   @see https://momentjs.com/docs/#/displaying/days-in-month/
  */
  daysInMonth() {
    return new Date(this._date.getFullYear(), this._date.getMonth() + 1, 0).getDate();
  }

  /**
   @see https://momentjs.com/docs/#/displaying/difference/
   */
  diff(obj) {
    let diff = this._date.getTime() - obj._date.getTime();

    let timezoneDiff = this._date.getTimezoneOffset() - obj._date.getTimezoneOffset();
    if (timezoneDiff !== 0) {
      diff -= timezoneDiff * 60000;
    }

    return diff / 86400000;
  }

  /**
   @see https://momentjs.com/docs/#/manipulating/start-of/
   */
  startOf(value) {
    if (value === 'day') {
      // Today
      this._date = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDate());
    } else if (value === 'month') {
      this._date = new Date(this._date.getFullYear(), this._date.getMonth(), 1);
    } else if (value === 'year') {
      this._date = new Date(new Date().getFullYear(), 0, 1);
    }

    return this;
  }

  /**
   @see https://momentjs.com/docs/#/query/is-before/
   */
  isBefore(coralDate, unit) {
    if (coralDate && coralDate._date) {
      return unit ? coralDate[unit]() > this[unit]() : coralDate._date > this._date;
    }

    return false;
  }

  /**
   @see https://momentjs.com/docs/#/query/is-after/
   */
  isAfter(coralDate, unit) {
    if (coralDate && coralDate._date) {
      return unit ? coralDate[unit]() < this[unit]() : coralDate._date < this._date;
    }

    return false;
  }

  /**
   @see https://momentjs.com/docs/#/query/is-same/
   */
  isSame(obj, type) {
    if (type === 'hour') {
      return obj && obj.clone()._date.getHours() === this.clone()._date.getHours();
    } else if (type === 'minute') {
      return obj && obj.clone()._date.getMinutes() === this.clone()._date.getMinutes();
    } else if (type === 'day') {
      return obj && obj.clone().startOf('day')._date.getTime() === this.clone().startOf('day')._date.getTime();
    }

    return obj && obj.clone()._date.getTime() === this.clone()._date.getTime();
  }

  /**
   @see https://momentjs.com/docs/#/parsing/is-valid/
   */
  isValid() {
    return this._date.toString() !== 'Invalid Date';
  }

  /**
   @ignore
   Not supported so we return an empty object
   */
  static localeData() {
    return {};
  }

  /**
   @see https://momentjs.com/docs/#/i18n/changing-locale/
   */
  static locale(value) {
    if (value) {
      globalLocale = value;
    }

    return globalLocale;
  }

  /**
   @see https://momentjs.com/docs/#/query/is-a-moment/
   */
  static isMoment(obj) {
    return obj instanceof this;
  }

  /**
   @return {momentJS|DateTime}
   */
  static get Moment() {
    return window.moment || this;
  }
}

export default DateTime;
