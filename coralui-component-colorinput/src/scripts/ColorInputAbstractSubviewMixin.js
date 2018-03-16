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
 @mixin ColorInputAbstractSubviewMixin
 @classdesc An abstract subview class that other subviews should extend.
 */
const ColorInputAbstractSubviewMixin = (superClass) => class extends superClass {
  /** @ignore */
  constructor() {
    super();
    
    this._events = {
      'click ._coral-ColorInput-preview': '_onPreviewClicked'
    };
  
    // export a static variable used by all subviews
    this.constructor._lastValidColor = null;
  }
  
  /** @ignore */
  _onPreviewClicked() {
    if (this._colorinput.valueAsColor !== null) {
      this.constructor._lastValidColor = this._colorinput.valueAsColor;
      this._colorinput._setActiveColor(null);
    }
    else if (this.constructor._lastValidColor !== null) {
      this._colorinput._setActiveColor(this.constructor._lastValidColor);
    }
  }
  
  /** @ignore */
  _beforeOverlayOpen() {
    // overwrite callback in subclass if needed
  }
  
  /** @ignore */
  _onColorInputChange() {
    // overwrite callback in subclass if needed
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    const overlay = this.closest('._coral-ColorInput-overlay');
    
    if (overlay && overlay._colorinput) {
      // save references to bound callbacks (in order to be able to remove them again from event system)
      this.__beforeOverlayOpen = this._beforeOverlayOpen.bind(this);
      this.__onColorInputChange = this._onColorInputChange.bind(this);
      
      // cache colorinput if this component is attached to dom
      this._colorinput = overlay._colorinput;
      this._colorinput.on('coral-overlay:beforeopen', this.__beforeOverlayOpen);
      this._colorinput.on('coral-colorinput:_valuechange', this.__onColorInputChange);
    
      // trigger one change initially
      this._onColorInputChange();
    }
  }
  
  /** @ignore */
  disconnectedCallback() {
    super.disconnectedCallback();
  
    if (this._colorinput) {
      this._colorinput.off('coral-overlay:beforeopen', this.__beforeOverlayOpen);
      this._colorinput.off('coral-colorinput:_valuechange', this.__onColorInputChange);
    }
  
    this._colorinput = null;
  }
};

export default ColorInputAbstractSubviewMixin;
