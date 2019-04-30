import MasonryColumnLayout from './MasonryColumnLayout';

/**
 Layout with variable width items. The minimal width of the items is defined with the <code>columnwidth</code>
 attribute.
 
 @example
 <coral-masonry layout="dashboard" columnwidth="300">
 
 @class Coral.Masonry.VariableLayout
 @extends {MasonryColumnLayout}
 */
class MasonryVariableLayout extends MasonryColumnLayout {
  /** @inheritdoc */
  _getItemWidth(colspan) {
    return this._masonryAvailableWidth / this._columns.length * colspan - this._horSpacing;
  }
  
  /** @inheritdoc */
  _getItemLeft(columnIndex) {
    return this._offsetLeft + this._masonryAvailableWidth * columnIndex / this._columns.length;
  }
}

export default MasonryVariableLayout;
