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
  for (let i = 0; i < items.length; i++) {
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
const getPositiveNumberProperty = (element, property, attribute, defaultValue) => {
  let value = element[property];
  if (value === undefined) {
    value = element.getAttribute(attribute);
  }
  value = parseInt(value, 10);
  if (value <= 0 || isNaN(value)) {
    value = defaultValue;
  }
  return value;
};

export {setTransform, setTransition, getFirstRowFilledColumns, csspx, getPositiveNumberProperty};
