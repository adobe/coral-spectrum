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

/**
 Set of property value transformation functions.
 */
class Transformation {
  /**
   Transform the provided value into a boolean. Follows the behavior of JavaScript thruty/falsy.
   
   @param {*} value
   The value to convert to Boolean.
   
   @returns {Boolean} The corresponding boolean value.
   */
  boolean(value) {
    return !!value;
  }
  
  /**
   Transform the provided value into a boolean. Follows the behavior of the HTML specification, in which the existence of
   the attribute indicates <code>true</code> regardless of the attribute's value. If the value is a boolean, it ignores
   the transformation.
   
   @param {*} value
   The value to convert to Boolean.
   
   @returns {Boolean} The corresponding boolean value.
   */
  booleanAttr(value) {
    return typeof value === 'boolean' ? value : !(value === null || typeof value === 'undefined');
  }
  
  /**
   Transforms the provided value into a floating point number.
   
   @param {*} value
   The value to convert to a Number.
   
   @returns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to a number.
   */
  number(value) {
    value = parseFloat(value);
    return isNaN(value) ? null : value;
  }
  
  /**
   Transforms the provided value into a floating number. The conversion is strict in the sense that if non numeric values
   are detected, <code>null</code> is returned instead.
   
   @param {*} value
   The value to be converted to a Number.
   
   @retuns {?Number} The corresponding number or <code>null</code> if the passed value cannot be converted to number.
   */
  float(value) {
    if (/^(-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(value)) {
      return Number(value);
    }
  
    return null;
  }
  
  /**
   Transform the provided value into a string. When given <code>null</code> or <code>undefined</code> it will be
   converted to an empty string("").
   
   @param {*} value
   The value to convert to String.
   
   @returns {String} The corresponding string value.
   */
  string(value) {
    if (value === null || typeof value === 'undefined') {
      return '';
    }
  
    return typeof value === 'string' ? value : String(value);
  }
}

/**
 A type transform utility.
 
 @type {Transformation}
 */
const transform = new Transformation();

export default transform;
