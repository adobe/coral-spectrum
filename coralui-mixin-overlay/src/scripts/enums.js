/**
 Focus trap options.
 @memberof Coral.mixin.overlay
 @enum {String}
 */
const trapFocus = {
  /** Focus is trapped such that the use cannot focus outside of the overlay. */
  ON: 'on',
  /** The user can focus outside the overlay as normal. */
  OFF: 'off'
};

/**
 Return focus options.
 
 @memberof Coral.mixin.overlay
 @enum {String}
 */
const returnFocus = {
  /** When the overlay is closed, the element that was focused before the it was shown will be focused again. */
  ON: 'on',
  /** Nothing will be focused when the overlay is closed. */
  OFF: 'off'
};

/**
 Focus behavior options.
 
 @memberof Coral.mixin.overlay
 @enum {String}
 */
const focusOnShow = {
  /** When the overlay is opened, it will be focused. */
  ON: 'on',
  /** The overlay will not focus itself when opened. */
  OFF: 'off'
};


/**
 The time it should take for overlays to fade in milliseconds.
 Important: This should be greater than or equal to the CSS transition time.
 
 @memberof Coral.mixin.overlay
 @type {Number}
 */
const FADETIME = 350;

export {trapFocus, returnFocus, focusOnShow, FADETIME};
