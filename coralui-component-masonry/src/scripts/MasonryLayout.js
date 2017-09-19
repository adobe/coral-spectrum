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
 Base class for masonry layouts.
 
 Whenever a change is detected, the {@link Coral.Masonry.Layout#layout} method is called. This method must then
 ensure that all the items are positioned correctly.
 
 Layout-specific keyboard support must be handled by adding event listeners to the masonry in the constructor. Such
 event listeners must be removed in the {@link Coral.Masonry.Layout#destroy} method.
 
 @param masonry
 @class Coral.Masonry.Layout
 */
class MasonryLayout {
  constructor(masonry) {
    this._masonry = masonry;
  }
  
  /**
   Layout name. Uses the constructor given name by default if defined.
   
   @type {String}
   */
  get name() {
    return this._name || this.constructor._name;
  }
  set name(value) {
    this._name = value;
  }
  
  /**
   Lays out the masonry items according to the implementation.
   */
  layout() {}
  
  /**
   Removes all layout-specific attributes, style, data and event listeners from the masonry and its items.
   */
  destroy() {}
  
  /**
   Removes the item from the control of the layout. This can be used to position the item differently,
   for example for drag&drop.
   
   @param {Coral.Masonry.Item} item
   @see #reattach
   */
  detach(item) {}
  
  /**
   Adds the item to the control of the layout again. The layout has to ensure that the item will be transitioned to
   its normal position flawlessly.
   
   @param {Coral.Masonry.Item} item
   @see #detach
   */
  reattach(item) {}
  
  /**
   Returns the item at the given position. The position coordinates are relative to the masonry.
   
   If an item is being transitioned when this method is called, then it must choose the item based on the final
   instead of the current position.
   
   @param {number} x
   @param {number} y
   @return {?Coral.Masonry.Item}
   */
  itemAt(x, y) {}
  
  /**
   Defines the name of the Layout
   
   @param {String} name
   */
  static defineName(name) {
    this._name = name;
  }
}

export default MasonryLayout;
