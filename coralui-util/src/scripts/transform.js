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
/**
 Property value transform functions.
 @namespace
 */
const transform = {};

/**
 Transform the provided value into a boolean. Follows the behavior of JavaScript thruty/falsy.
 
 @param {*} value
 The value to convert to Boolean.
 
 @returns {Boolean} The corresponding boolean value.
 */
transform.boolean = function(value) {
  'use strict';
  return !!value;
};

/**
 Transform the provided value into a boolean. Follows the behavior of the HTML specification, in which the existence of
 the attribute indicates <code>true</code> regardless of the attribute's value. If the value is a boolean, it ignores
 the transformation.
 
 @param {*} value
 The value to convert to Boolean.
 
 @returns {Boolean} The corresponding boolean value.
 */
transform.booleanAttr = function(value) {
  'use strict';
  return typeof value === 'boolean' ? value : !(value === null || typeof value === 'undefined');
};

/**
 Transforms the provided value into a floating point number.
 
 @param {*} value
 The value to convert to a Number.
 
 @returns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to a number.
 */
transform.number = function(value) {
  'use strict';
  
  value = parseFloat(value);
  return isNaN(value) ? null : value;
};


/**
 Transforms the provided value into a floating number. The conversion is strict in the sense that if non numeric values
 are detected, <code>null</code> is returned instead.
 
 @param {*} value
 The value to be converted to a Number.
 
 @retuns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to number.
 */
transform.float = function(value) {
  'use strict';
  
  if (/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
    return Number(value);
  }
  
  return null;
};

/**
 Transform the provided value into a string. When given <code>null</code> or <code>undefined</code> it will be
 converted to an empty string("").
 
 @param {*} value
 The value to convert to String.
 
 @returns {String} The corresponding string value.
 */
transform.string = function(value) {
  'use strict';
  if (value === null || typeof value === 'undefined') {
    return '';
  }
  return typeof value === 'string' ? value : String(value);
};

/**
  Transform the provided value into an HTML attribute on the provided HTMLElement.
 
  @param {HTMLElement} element
    The HTMLElement that will receive the HTML attribute.
  @param {String} attributeName
    The attribute name.
  @param {*} value
    The value to reflect as HTML attribute.
*/
transform.reflect = function(element, attributeName, value) {
  if (typeof value === 'boolean') {
    if (value && !element.hasAttribute(attributeName)) {
      element.setAttribute(attributeName, '');
    }
    else if (!value && element.hasAttributes(attributeName)) {
      element.removeAttribute(attributeName);
    }
  }
  else {
    if (element.getAttribute(attributeName) !== value) {
      element.setAttribute(attributeName, value);
    }
  }
};

export default transform;
