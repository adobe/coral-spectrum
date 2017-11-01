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

import resizer from '../templates/resizer';

/**
 @private
 
 Adaptation of http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/
 */
export default class ResizeObserver {
  constructor() {
    // User agent toggles
    const isIE = navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/Edge/);
    this.useNativeResizeSupport = document.attachEvent && !isIE;
    
    this._resizeListenerObject = resizer().querySelector('object');
  }
  
  _getResizeListenerObject() {
    return this._resizeListenerObject.cloneNode(true);
  }
  
  _addTriggerElement(element, listenerFunction) {
    if (getComputedStyle(element).position === 'static') {
      element.style.position = 'relative';
    }
    
    const obj = this._getResizeListenerObject();
    
    // Remove the old one before adding the new one
    if (element._resizeTriggerElement) {
      element._resizeTriggerElement.remove();
    }
    
    element._resizeTriggerElement = obj;
    
    // eslint-disable-next-line func-names
    obj.onload = function() {
      const contentDocument = this.contentDocument;
      const defaultView = contentDocument.defaultView;
      const documentElement = contentDocument.documentElement;
      
      defaultView._originalElement = element;
      defaultView._listenerFunction = listenerFunction;
      defaultView.addEventListener('resize', listenerFunction);
      
      // CUI-6523 Set lang and document title to avoid automated accessibility testing failures.
      documentElement.lang = 'en';
      contentDocument.title = '\u200b';
      
      // Call one initial resize for all browsers
      // Required, as in WebKit this callback adding the event listeners is called too late. Layout has already finished.
      listenerFunction({
        target: defaultView
      });
    };
    
    obj.type = 'text/html';
    
    // InternetExplorer is picky about the order of "obj.data = ..." and element.appendChild(obj) so make sure to get it right
    element.appendChild(obj);
    obj.data = 'about:blank';
  }
  
  _removeTriggerElement(element) {
    if (!element._resizeTriggerElement) {
      return;
    }
    
    const triggerElement = element._resizeTriggerElement;
    
    // processObjectLoadedEvent might never have been called
    if (triggerElement.contentDocument && triggerElement.contentDocument.defaultView) {
      triggerElement.contentDocument.defaultView.removeEventListener('resize', triggerElement.contentDocument.defaultView._listenerFunction);
    }
    
    element._resizeTriggerElement = !element.removeChild(element._resizeTriggerElement);
  }
  
  _fireResizeListeners(event) {
    const targetElement = event.target || event.srcElement;
    
    const trigger = targetElement._originalElement || targetElement;
    trigger._resizeListeners.forEach((fn) => {
      fn.call(trigger, event);
    });
  }
  
  _addResizeListener(element, onResize) {
    if (!element) {
      return;
    }
    
    if (this.useNativeResizeSupport) {
      element.addEventListener('resize', onResize);
      return;
    }
    
    // The array may still exist, so we check its length too
    if (!element._resizeListeners || element._resizeListeners.length === 0) {
      element._resizeListeners = [];
    }
    
    this._addTriggerElement(element, this._fireResizeListeners.bind(this));
    
    element._resizeListeners.push(onResize);
  }
  
  
  _removeResizeListener(element, onResize) {
    if (!element) {
      return;
    }
    
    if (this.useNativeResizeSupport) {
      element.removeEventListener('resize', onResize);
      return;
    }
    
    // resizeListeners and resizeTrigger must be present
    if (!element._resizeListeners || !element._resizeTriggerElement) {
      return;
    }
    
    const fnIndex = element._resizeListeners.indexOf(onResize);
    
    // Don't remove the function unless it is already registered
    if (fnIndex === -1) {
      return;
    }
    
    element._resizeListeners.splice(fnIndex, 1);
    
    if (!element._resizeListeners.length) {
      this._removeTriggerElement(element);
    }
  }
}
