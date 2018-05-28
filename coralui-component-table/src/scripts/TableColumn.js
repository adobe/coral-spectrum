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

import {ComponentMixin} from '../../../coralui-mixin-component';
import {alignment} from './TableUtil';
import {transform, validate} from '../../../coralui-util';

const CLASSNAME = '_coral-Table-column';

/**
 Enumeration for {@link TableColumn} sortable direction options.
 
 @typedef {Object} TableColumnSortableDirectionEnum
 
 @property {String} DEFAULT
 Default. No sorting applied.
 @property {String} ASCENDING
 Ascending sort.
 @property {String} DESCENDING
 Descending sort.
 */
const sortableDirection = {
  DEFAULT: 'default',
  ASCENDING: 'ascending',
  DESCENDING: 'descending'
};

/**
 Enumeration for {@link TableColumn} sortable type options.
 
 @typedef {Object} TableColumnSortableTypeEnum
 
 @property {String} ALPHANUMERIC
 Alphanumeric type. If sorting is based on {@link TableCell#value}, use {String}.
 @property {String} NUMBER
 Number type. If sorting is based on {@link TableCell#value}, use {Number}.
 @property {String} DATE
 Date type. If sorting is based on {@link TableCell#value}, use {Date} in milliseconds.
 @property {String} CUSTOM
 Custom type. Sorting is based on user defined sorting.
 */
const sortableType = {
  ALPHANUMERIC: 'alphanumeric',
  NUMBER: 'number',
  DATE: 'date',
  CUSTOM: 'custom'
};

/**
 @class Coral.Table.Column
 @classdesc A Table column component
 @htmltag coral-table-column
 @htmlbasetag col
 @extends {HTMLTableColElement}
 @extends {ComponentMixin}
 */
class TableColumn extends ComponentMixin(HTMLTableColElement) {
  /**
   The column cells alignment. The alignment should take the {@link i18n} configuration into account.
   
   @type {String}
   @default TableColumnAlignmentEnum.LEFT
   @htmlattribute alignment
   @htmlattributereflected
   */
  get alignment() {
    return this._alignment || alignment.LEFT;
  }
  set alignment(value) {
    const oldValue = this._alignment;
    
    value = transform.string(value).toLowerCase();
    this._alignment = validate.enumeration(alignment)(value) && value || alignment.LEFT;
    this._reflectAttribute('alignment', this._alignment);
  
    // Don't trigger on initialization if alignment is LEFT to improve performance
    if (!(typeof oldValue === 'undefined' && this._alignment === alignment.LEFT)) {
      this.trigger('coral-table-column:_alignmentchanged');
    }
  }
  
  /**
   Whether the column has a fixed width.
   
   @type {Boolean}
   @default false
   @htmlattribute fixedwidth
   @htmlattributereflected
   */
  get fixedWidth() {
    return this._fixedWidth || false;
  }
  set fixedWidth(value) {
    this._fixedWidth = transform.booleanAttr(value);
    this._reflectAttribute('fixedwidth', this._fixedWidth);
    
    this.trigger('coral-table-column:_fixedwidthchanged');
  }
  
  /**
   Whether the column is hidden.
   
   @type {Boolean}
   @default false
   @htmlattribute hidden
   @htmlattributereflected
   */
  get hidden() {
    return this._hidden || false;
  }
  set hidden(value) {
    this._hidden = transform.booleanAttr(value);
    this._reflectAttribute('hidden', this._hidden);
    
    this.trigger('coral-table-column:_hiddenchanged');
  }
  
  /**
   Whether the table column is orderable.
   Note that this does not affect the underlying data, only presentation.
   
   @type {Boolean}
   @default false
   @htmlattribute orderable
   @htmlattributereflected
   */
  get orderable() {
    return this._orderable || false;
  }
  set orderable(value) {
    this._orderable = transform.booleanAttr(value);
    this._reflectAttribute('orderable', this._orderable);
    
    window.requestAnimationFrame(() => {
      this.trigger('coral-table-column:_orderablechanged');
    });
  }
  
  /**
   Whether the column is sortable by user interaction.
   
   @type {Boolean}
   @default false
   @htmlattribute sortable
   @htmlattributereflected
   */
  get sortable() {
    return this._sortable || false;
  }
  set sortable(value) {
    this._sortable = transform.booleanAttr(value);
    this._reflectAttribute('sortable', this._sortable);
    
    window.requestAnimationFrame(() => {
      this.trigger('coral-table-column:_sortablechanged');
    });
  }
  
  /**
   The sorting type. See {@link TableColumnSortableTypeEnum}. If setting to <code>custom</code>, columns won't sort
   based on the default table sorting.
   Instead, a custom sorting can be performed when triggered by user interaction. This can be defined by listening to
   the {@link coral-table:beforecolumnsort} event.
   
   @type {String}
   @default TableColumnSortableTypeEnum.ALPHANUMERIC
   @htmlattribute sortabletype
   @htmlattributereflected
   */
  get sortableType() {
    return this._sortableType || sortableType.ALPHANUMERIC;
  }
  set sortableType(value) {
    value = transform.string(value).toLowerCase();
    this._sortableType = validate.enumeration(sortableType)(value) && value || sortableType.ALPHANUMERIC;
    this._reflectAttribute('sortabletype', this._sortableType);
  }
  
  /**
   The sorting direction. Sorts the column cells based on {@link TableCell#value}.
   If not present, the sort is based on the cell text content. See {@link TableColumnSortableDirectionEnum}.
   
   @type {String}
   @default TableColumnSortableDirectionEnum.DEFAULT
   @htmlattribute sortabledirection
   @htmlattributereflected
   */
  get sortableDirection() {
    return this._sortableDirection || sortableDirection.DEFAULT;
  }
  set sortableDirection(value) {
    value = transform.string(value).toLowerCase();
    this._sortableDirection = validate.enumeration(sortableDirection)(value) && value || sortableDirection.DEFAULT;
    this._reflectAttribute('sortabledirection', this._sortableDirection);
    
    // Prevent sorting if unnecessary
    if (!this._preventSort) {
      this._doSort();
      
      this.trigger('coral-table-column:_sortabledirectionchanged');
    }
  }
  
  /** @private */
  _sort() {
    let newSortableDirection;
    if (this.sortableDirection === sortableDirection.DEFAULT) {
      newSortableDirection = sortableDirection.ASCENDING;
    }
    else if (this.sortableDirection === sortableDirection.ASCENDING) {
      newSortableDirection = sortableDirection.DESCENDING;
    }
    else if (this.sortableDirection === sortableDirection.DESCENDING) {
      newSortableDirection = sortableDirection.DEFAULT;
    }
    
    this.trigger('coral-table-column:_beforecolumnsort', {newSortableDirection});
  }
  
  /** @private */
  _doSort(onInitialization) {
    this.trigger('coral-table-column:_sort', {onInitialization, sortableDirection, sortableType});
  }
  
  /**
   Returns {@link TableColumn} sortable direction options.
   
   @return {TableColumnSortableDirectionEnum}
   */
  static get sortableDirection() { return sortableDirection; }
  
  /**
   Returns {@link TableColumn} sortable type options.
   
   @return {TableColumnSortableTypeEnum}
   */
  static get sortableType() { return sortableType; }
  
  /**
   Returns {@link TableColumn} alignment options.
   
   @return {TableColumnAlignmentEnum}
   */
  static get alignment() { return alignment; }
  
  /** @ignore */
  static get observedAttributes() {
    return [
      'fixedwidth',
      'fixedWidth',
      'hidden',
      'alignment',
      'orderable',
      'sortable',
      'sortabletype',
      'sortableType',
      'sortabledirection',
      'sortableDirection'
    ];
  }
  
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._sortableType) { this.sortableType = sortableType.ALPHANUMERIC; }
    if (!this._sortableDirection) { this.sortableDirection = sortableDirection.DEFAULT; }
    if (!this._alignment) { this.alignment = alignment.LEFT; }
  }
  
  /**
   Triggered when {@link TableColumn#alignment} changed.
   
   @typedef {CustomEvent} coral-table-column:_alignmentchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableColumn#fixedWidth} changed.
   
   @typedef {CustomEvent} coral-table-column:_fixedwidthchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableColumn#orderable} changed.
 
   @typedef {CustomEvent} coral-table-column:_orderablechanged
   
   @private
   */
  
  /**
   Triggered when {@link TableColumn#sortable} changed.
 
   @typedef {CustomEvent} coral-table-column:_sortablechanged
   
   @private
   */
  
  /**
   Triggered when {@link TableColumn#sortableDirection} changed.
 
   @typedef {CustomEvent} coral-table-column:_sortabledirectionchanged
   
   @private
   */
  
  /**
   Triggered when {@link TableColumn#hidden} changed.
 
   @typedef {CustomEvent} coral-table-column:_hiddenchanged
   
   @private
   */
  
  /**
   Triggered before {@link TableColumn#sortableDirection} changed.
 
   @typedef {CustomEvent} coral-table-column:_beforecolumnsort
   
   @private
   */
  
  /**
   Triggered when {@link TableColumn#sortableDirection} changed.
 
   @typedef {CustomEvent} coral-table-column:_sort
   
   @private
   */
}

export default TableColumn;
