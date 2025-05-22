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

/** @ignore */
const setTransform = (el, value) => {
  el.style.setProperty('-webkit-transform', value);
  el.style.setProperty('-ms-transform', value);
  el.style.transform = value;
};

/** @ignore */
const setTransition = (el, value) => {
  el.style.setProperty('-webkit-transition', value);
  el.style.setProperty('-ms-transition', value);
  el.style.transition = value;
};

/** @ignore */
const getFirstRowFilledColumns = (columns, items) => {
  let filledColumns = 0;
  for (let i = 0 ; i < items.length ; i++) {
    const item = items[i];
    filledColumns += item._layoutData.colspan;
    if (filledColumns >= columns.length) {
      return columns.length;
    }
  }
  return filledColumns;
};

/** @ignore */
const csspx = (el, property) => parseFloat(window.getComputedStyle(el)[property], 10);

// TODO if the property changes, it will not automatically relayout the masonry
// TODO test columnWidth and colspan property and default values
/** @ignore */
const getPositiveNumberProperty = (element, property, attribute, defaultValue, mobileValue) => {
  let value = element[property];
  if (value === undefined) {
    value = element.getAttribute(attribute);
  }
  value = parseInt(value, 10);
  if (value <= 0 || isNaN(value)) {
    value = defaultValue;
  }
  if(mobileValue && window.innerWidth <= 500) {
    value = mobileValue;
  }
  return value;
};

export {setTransform, setTransition, getFirstRowFilledColumns, csspx, getPositiveNumberProperty};
