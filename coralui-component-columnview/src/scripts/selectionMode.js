/**
 Enumeration representing the ColumnView selection modes.
 
 @memberof Coral.ColumnView
 @enum {String}
 */
const selectionMode = {
  /** None is default, selection of items does not happen based on click */
  NONE: 'none',
  /** Single selection mode, only one item per column can be selected. */
  SINGLE: 'single',
  /** Multiple selection mode, multiple items per column can be selected. */
  MULTIPLE: 'multiple'
};

export default selectionMode;
