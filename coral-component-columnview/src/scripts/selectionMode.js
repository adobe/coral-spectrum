/**
 Enumeration for {@link ColumnView} selection options.
 
 @typedef {Object} ColumnViewSelectionModeEnum
 
 @property {String} NONE
 None is default, selection of items does not happen based on click.
 @property {String} SINGLE
 Single selection mode, only one item per column can be selected.
 @property {String} MULTIPLE
 Multiple selection mode, multiple items per column can be selected.
 */
const selectionMode = {
  NONE: 'none',
  SINGLE: 'single',
  MULTIPLE: 'multiple'
};

export default selectionMode;
