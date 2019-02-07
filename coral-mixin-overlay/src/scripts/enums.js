/**
 Enumeration for {@link OverlayMixin} trap options.
 
 @typedef {Object} OverlayTrapFocusEnum
 
 @property {String} ON
 Focus is trapped such that the use cannot focus outside of the overlay.
 @property {String} OFF
 The user can focus outside the overlay as normal.
 */
const trapFocus = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link OverlayMixin} return focus options.
 
 @typedef {Object} OverlayReturnFocusEnum
 
 @property {String} ON
 When the overlay is closed, the element that was focused before the it was shown will be focused again.
 @property {String} OFF
 Nothing will be focused when the overlay is closed.
 */
const returnFocus = {
  ON: 'on',
  OFF: 'off'
};

/**
 Enumeration for {@link OverlayMixin} focus behavior options.
 
 @typedef {Object} OverlayFocusOnShowEnum
 
 @property {String} ON
 When the overlay is opened, it will be focused.
 @property {String} OFF
 The overlay will not focus itself when opened.
 */
const focusOnShow = {
  ON: 'on',
  OFF: 'off'
};

/**
 The time it should take for {@link OverlayMixin} to fade in milliseconds.
 Important: This should be greater than or equal to the CSS transition time.
 
 @typedef {Number} OverlayFadeTime
 */
const FADETIME = 350;

export {trapFocus, returnFocus, focusOnShow, FADETIME};
