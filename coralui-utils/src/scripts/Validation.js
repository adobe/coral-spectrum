/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2015 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import commons from './Commons';

/**
 Set of property value validation functions.
 */
class Validation {
  /**
   Ensures that the value has changed.
   
   @param {*} newValue
   The new value.
   @param {*} oldValue
   The existing value.
   
   @returns {Boolean} <code>true</code> if the values are different.
   */
  valueMustChange(newValue, oldValue) {
    // We can use exact equality here as validation functions are called after transform. Thus, the input value will be
    // converted to the same type as a stored value
    return newValue !== oldValue;
  }
  
  /**
   Ensures that the new value is within the enumeration. The enumeration can be given as an array of values or as a
   key/value Object. Take into consideration that enumerations are case sensitive.
   
   @example // Enumeration as Array
   Coral.validate.enumeration(['xs', 's', 'm', 'l']);
   @example // Enumeration as Object
   Coral.validate.enumeration({EXTRA_SMALL : 'xs', SMALL : 's', MEDIUM : 'm', LARGE : 'l'});
   @param {Object} enumeration
   Object that represents an enum.
   
   @returns {ValidationFunction}
   a validation function that ensures that the given value is within the enumeration.
   */
  enumeration(enumeration) {
    // Reverses the enumeration, so that we can check that the variable new value exists inside
    const enumReversed = commons.swapKeysAndValues(enumeration);
  
    // Returns a new function that matches the newValue, oldValue signature
    return (newValue) => typeof enumReversed[newValue] !== 'undefined';
  }
}

/**
 Signature of the function used to validate new input. It accepts a newValue and an oldValue which are used to
 determine if the newValue is valid.
 
 @typedef {function} ValidationFunction
 
 @param {*} newValue
 The new value to validate.
 @param {*} oldValue
 The existing value.
 
 @returns {Boolean} <code>true</code> if the validation succeeded, otherwise <code>false</code>.
 */

/**
 A property transform utility.
 
 @type {Validation}
 */
const validate = new Validation();

export default validate;
