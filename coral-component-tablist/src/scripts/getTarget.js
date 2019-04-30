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
