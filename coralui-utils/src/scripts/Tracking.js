/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
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
/**
 Signature function used to track the usage of Coral components. By default, there is no out of the box
 implementation as tracking is agnostic of the underlying technology.
 
 You need to implement a new tracker and add it with: <code>Coral.tracking.addListener(fn(){ });</code>
 
 The <code>fn()</code> callback will receive multiple arguments:
 * <code>trackData</code> - an object with fixed structure e.g. <code>{type: "button", eventType: "click", element: "save settings", feature: "sites"}</code>
 * <code>event</code> - the CustomEvent or MouseEvent details object.
 * <code>component</code> - the component reference object.
 
 Using the above data you can map it to your own analytics tracker.
 */
class Tracking {
  /* @ignore */
  constructor() {
    /**
     All registered trackers.
     
     @type {Array<Function>}
     */
    this._trackers = [];
  }
  
  /**
   Returns <code>true</code> if the tracking is disabled for the given component, otherwise false.
   
   @param {HTMLElement} component
   @returns {Boolean}
   */
  _isTrackingDisabledForComponent(component) {
    return component &&
      typeof component.tracking !== 'undefined' &&
      component.tracking === component.constructor.tracking.OFF;
  }
  
  /**
   Get tracking annotations from the parent Component to which the event was bound.
   
   @param {ComponentMixin} component
   @returns {{trackingElement: String, trackingElement: String}}
   */
  _getTrackingDataFromComponentAttr(component) {
    if (this._isTrackingDisabledForComponent(component)) {
      return {
        trackingElement: '',
        trackingFeature: ''
      };
    }
    
    // Eg. from DOM trackingfeature="sites"
    const trackingFeature = component.trackingFeature || '';
    
    // Eg. from DOM trackingelement="rail toggle"
    const trackingElement = component.trackingElement || '';
    
    return {trackingFeature, trackingElement};
  }
  
  /**
   Returns a tracking data object that can be used to compile data to send to an actual Analytics tracker.
   
   @param {String} eventType
   @param {String} targetType
   @param {CustomEvent} event
   @param {ComponentMixin} component
   @param {ComponentMixin} childComponent
   @returns {Object} An object with the tracking data.
   */
  _createTrackingData(eventType, targetType, event, component, childComponent) {
    const parentComponentType = (component.getAttribute('is') || component.tagName).toLowerCase();
    
    // Gather data into the Coral Tracking structure.
    const trackDataFromAttr = this._getTrackingDataFromComponentAttr(component);
    
    // Compile data
    /**
     The default Coral tracking data object
     filled with values from root Component and child Component (if exists).
     @type {{targetType: string, targetElement: string, eventType: string, rootElement: string, rootFeature: string, rootType: string}}
     */
    return {
      targetType: targetType || parentComponentType || '',
      targetElement: typeof childComponent !== 'undefined' && childComponent.trackingElement ? childComponent.trackingElement : component.trackingElement,
      eventType: eventType || event.type,
      rootElement: trackDataFromAttr.trackingElement,
      rootFeature: trackDataFromAttr.trackingFeature,
      rootType: parentComponentType
    };
  }
  
  /**
   Add a tracking callback. This will be invoked every time a tracking event is emitted.
   
   @param {TrackingCallback} trackingCallback
   The callback to execute.
   */
  addListener(trackingCallback) {
    if (typeof trackingCallback !== 'function') {
      throw new Error('Coral.Tracking: Tracker must be a function callback.');
    }
    
    if (this._trackers.indexOf(trackingCallback) !== -1) {
      throw new Error('Coral.Tracking: Tracker callback cannot be added twice.');
    }
    
    this._trackers.push(trackingCallback);
  }
  
  /**
   Removes a tracker.
   
   @param {TrackingCallback} trackingCallback
   */
  removeListener(trackingCallback) {
    this._trackers = this._trackers.filter(trackerFn => trackerFn !== trackingCallback);
  }
  
  /**
   Notify all trackers subscribed.
   
   @param {String} eventType
   Eg. click, select, etc.
   @param {String} targetType
   Eg. cycle button, cycle button item, etc.
   @param {CustomEvent} event
   @param {ComponentMixin} component
   @param {ComponentMixin} childComponent
   Optional, in case the event occurred on a child component.
   @returns {Boolean} if the event was dispatch to at least 1 tracker.
   */
  track(eventType, targetType, event, component, childComponent) {
    if (
      this._trackers.length === 0 ||
      this._isTrackingDisabledForComponent(component) ||
      this._isTrackingDisabledForComponent(childComponent)
    ) {
      return false;
    }
    
    const args = Array.prototype.slice.call(arguments, [2]);
    
    const trackingData = this._createTrackingData(eventType, targetType, event, component, childComponent);
    this._trackers.forEach((trackerFn) => {
      trackerFn.apply(null, [trackingData].concat(args));
    });
    
    return true;
  }
}
/**
 Executes the callback when ever there is an interaction inside the component that needs to be tracked. This can be used
 to get insight on how users interact with the page and the features that available.
 
 @typedef {function} TrackingCallback
 
 @param {Object} trackData
 Object containing the data to be tracked. It contains the properties <code>type</code>, <code>eventType</code>,
 <code>element</code> and <code>feature</code>.
 @param {CustomEvent} event
 Underlying event that was generated by the user
 @param {HTMLElement} component
 Component that triggered the tracking event.
 */
/**
 Tracking API to get insight on component usage.
 
 @type {Tracking}
 */
const tracking = new Tracking();
export default tracking;
