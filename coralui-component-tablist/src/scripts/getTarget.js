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
 Gets the target panel of the item.
 
 @private
 @param {HTMLElement|String} [targetValue]
 A specific target value to use.
 
 @returns {?HTMLElement}
 */
export default function getTarget(targetValue) {
  if (targetValue instanceof Node) {
    // Just return the provided Node
    return targetValue;
  }
  
  // Dynamically get the target node based on target
  let newTarget = null;
  if (typeof targetValue === 'string' && targetValue.trim() !== '') {
    newTarget = document.querySelector(targetValue);
  }
  
  return newTarget;
}
