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
  /**
   * this is constructor description.
   * @param {number} arg1 this is arg1 description.
   * @param {string[]} arg2 this is arg2 description.
   */
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
  layout() {
    // To override
  }
  
  /**
   Removes all layout-specific attributes, style, data and event listeners from the masonry and its items.
   */
  destroy() {
    // To override
  }
  
  /**
   Removes the item from the control of the layout. This can be used to position the item differently,
   for example for drag&drop.
   
   @param {MasonryItem} item
   */
  // eslint-disable-next-line no-unused-vars
  detach(item) {
    // To override
  }
  
  /**
   Adds the item to the control of the layout again. The layout has to ensure that the item will be transitioned to
   its normal position flawlessly.
   
   @param {MasonryItem} item
   */
  // eslint-disable-next-line no-unused-vars
  reattach(item) {
    // To override
  }
  
  /**
   Returns the item at the given position. The position coordinates are relative to the masonry.
   
   If an item is being transitioned when this method is called, then it must choose the item based on the final
   instead of the current position.
   
   @param {number} x
   @param {number} y
   @return {?Coral.Masonry.Item}
   */
  // eslint-disable-next-line no-unused-vars
  itemAt(x, y) {
    // To override
  }
  
  /**
   Defines the name of the Layout
   
   @param {String} name
   */
  static defineName(name) {
    this._name = name;
  }
}

export default MasonryLayout;
