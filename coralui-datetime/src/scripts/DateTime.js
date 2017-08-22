/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

// Default supported format
const DEFAULT_FORMAT = 'YYYY-MM-DD';

// Default locale
let globalLocale = document.documentElement.lang || window.navigator.language || 'en-US';

// Uses Intl.DateTimeFormat to return a formatted date string
const dateTimeFormat = function(locale, options, date) {
  let formattedDateString = '';
  try {
    formattedDateString = new window.Intl.DateTimeFormat(locale, options).format(date);
  }
  catch (e) {
    console.warn(e.message);
  }
  
  return formattedDateString;
};

/**
 The DateTime API is used as fallback to momentJS.
 
 @param {DateTime|Date|Array<Number>|String} value
 The initial date value. If none provided, the current day is used instead.
 
 @private
 */
class DateTime {
  constructor(value) {
    if (value instanceof this.constructor) {
      // Copy properties
      this._locale = value._locale;
      this._value = value._value;
      this._date = value._date;
    }
    else {
      this._locale = globalLocale;
      this._value = value;
      
      // Support Array
      if (Array.isArray(value)) {
        this._date = value.length ? new Date(value[0], value[1] || 0, value[2] || 1) : new Date();
      }
      else {
        // Create a Date instance from the value or use current day if value is missing
        this._date = this._value ? new Date(this._value) : new Date();
      }
    }
  }
  
  // See https://momentjs.com/docs/#/i18n/instance-locale/
  locale(value) {
    if (value) {
      this._locale = value;
    }
    
    return this._locale;
  }
  
  // See https://momentjs.com/docs/#/displaying/as-javascript-date/
  toDate() {
    return this._date;
  }
  
  // See https://momentjs.com/docs/#/parsing/moment-clone/
  clone() {
    const clone = new this.constructor(this._value);
    clone._date = this._date;
    return clone;
  }
  
  // See https://momentjs.com/docs/#/displaying/format/
  format(format) {
    let formattedDateString = '';
    
    if (!format) {
      format = DEFAULT_FORMAT;
    }
    
    if (format === DEFAULT_FORMAT) {
      formattedDateString += dateTimeFormat(this._locale, {year: 'numeric'}, this._date);
      formattedDateString += '-';
      formattedDateString += dateTimeFormat(this._locale, {month: '2-digit'}, this._date);
      formattedDateString += '-';
      formattedDateString += dateTimeFormat(this._locale, {day: '2-digit'}, this._date);
    }
    else if (format === 'MMMM YYYY') {
      formattedDateString += dateTimeFormat(this._locale, {month: 'long'}, this._date);
      formattedDateString += ' ';
      formattedDateString += dateTimeFormat(this._locale, {year: 'numeric'}, this._date);
    }
    else if (format === 'LL') {
      formattedDateString += dateTimeFormat(this._locale, {
        month: 'long',
        year: 'numeric',
        day: '2-digit'
      }, this._date);
    }
    else if (format === 'dd') {
      formattedDateString += dateTimeFormat(this._locale, {weekday: 'short'}, this._date);
    }
    else if (format === 'dddd') {
      formattedDateString += dateTimeFormat(this._locale, {weekday: 'long'}, this._date);
    }
    else {
      format = typeof format === 'object' ? format : {};
      formattedDateString = dateTimeFormat(this._locale, format, this._date);
    }
    
    return formattedDateString;
  }
  
  // See https://momentjs.com/docs/#/get-set/year/
  year() {
    return this._date.getFullYear();
  }
  
  // See https://momentjs.com/docs/#/get-set/month/
  month() {
    return this._date.getMonth();
  }
  
  // See https://momentjs.com/docs/#/get-set/week/
  week() {
    // Source : https://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
    const date = new Date(Date.UTC(this._date.getFullYear(), this._date.getMonth(), this._date.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
    return Math.ceil((((date - yearStart) / 86400000) + 1)/7)
  }
  
  // See https://momentjs.com/docs/#/get-set/day/
  day(day) {
    if (typeof day === 'number') {
      this._date.setDate(this._date.getDate() - (this._date.getDay() || 7) + day);
      
      return this;
    }
    else {
      return this._date.getDay();
    }
  }
  
  // See https://momentjs.com/docs/#/get-set/date/
  date() {
    return this._date.getDate();
  }
  
  // See https://momentjs.com/docs/#/manipulating/add/
  add(value, type) {
    if (type.indexOf('month') === 0) {
      this._date.setMonth(this._date.getMonth() + value);
    }
    else if (type === 'days') {
      this._date.setDate(this._date.getDate() + value);
    }
    
    return this;
  }
  
  // See https://momentjs.com/docs/#/manipulating/subtract/
  subtract(value, type) {
    if (type.indexOf('month') === 0) {
      this._date.setMonth(this._date.getMonth() - value);
    }
    else if (type === 'days') {
      this._date.setDate(this._date.getDate() - value);
    }
    
    return this;
  }
  
  // See https://momentjs.com/docs/#/displaying/difference/
  diff(obj) {
    const diff = this._date.getTime() - obj._date.getTime();
    
    return diff / 86400000;
  }
  
  // See https://momentjs.com/docs/#/manipulating/start-of/
  startOf(value) {
    if (value === 'day') {
      // Today
      this._date = new Date(this._date.getFullYear(), this._date.getMonth(), this._date.getDate());
    }
    else if (value === 'month') {
      this._date = new Date(this._date.getFullYear(), this._date.getMonth(), 1);
    }
    else if (value === 'year') {
      this._date = new Date(new Date().getFullYear(), 0, 1);
    }
    
    return this;
  }
  
  // See https://momentjs.com/docs/#/query/is-before/
  isBefore(coralDate) {
    const date = coralDate && coralDate._date;
    
    if (date) {
      return date > this._date;
    }
    else {
      return false;
    }
  }
  
  // See https://momentjs.com/docs/#/query/is-after/
  isAfter(coralDate) {
    const date = coralDate && coralDate._date;
    
    if (date) {
      return date < this._date;
    }
    else {
      return false;
    }
  }
  
  // See https://momentjs.com/docs/#/query/is-same/
  isSame(obj) {
    return obj && obj.clone().startOf('day')._date.getTime() === this.clone().startOf('day')._date.getTime();
  }
  
  // See https://momentjs.com/docs/#/parsing/is-valid/
  isValid() {
    return this._date.toString() !== 'Invalid Date';
  }
  
  // Not supported so we return an empty object
  static localeData() {
    return {};
  }
  
  // See https://momentjs.com/docs/#/i18n/changing-locale/
  static locale(value) {
    if (value) {
      globalLocale = value;
    }
    
    return globalLocale;
  }
  
  // See https://momentjs.com/docs/#/query/is-a-moment/
  static isMoment(obj) {
    return obj instanceof this;
  }
}

export default DateTime;
