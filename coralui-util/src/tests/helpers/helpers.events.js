var helpers = helpers || {};

(function() {
  'use strict';

  /**
    Creates a native event

    @param {String} base
      Base parent event. It accepts: HTMLEvents, MouseEvent.
    @param {HTMLElement} target
      Element used to dispatch the event.
    @param {String} type
      Type of event to instantiate. It accepts: change, input, blur
    @param {Object} [options]
      Object with options to pass to the event.
    @returns {Boolean} whether the default action of the event was canceled.
  */
  function createEvent(base, target, type, options) {
    // if options where not provided, we initialize the defaults
    if (typeof options === 'undefined') {
      options = {
        bubbles: true,
        cancelable: true
      };
    }
  
    // Support @IE11
    const event = document.createEvent(base);
    event.initEvent(type, options.bubbles, options.cancelable);

    for (const option in options) {
      if (option !== 'bubbles' && option !== 'cancelable') {
        event[option] = options[option];
      }
    }

    return target.dispatchEvent(event);
  }

  /**
    Triggers a native HTMLEvent.
   
    @param {String} type
      Type of event to instantiate. It accepts: change, input, blur
    @param {HTMLElement} target
      Element used to dispatch the event.
    @param {Object} [options]
      Object with options to pass to the event.
    @returns {Boolean} whether the default action of the event was canceled.
  */
  helpers.event = function(type, target, options) {
    return createEvent('HTMLEvents', target, type, options);
  };

  /**
    Triggers a native Mouse Event.
 
    @param {String} type
      Type of event to instantiate. It accepts: mousemove, mousedown, mouseup, mousewheel.
    @param {HTMLElement} target
      Element used to dispatch the event.
    @param {Object} [options]
      Object with options to pass to the event.
    @returns {Boolean} whether the default action of the event was canceled.
  */
  helpers.mouseEvent = function(type, target , options) {
    return createEvent('MouseEvents', target, type, options);
  };
}());
