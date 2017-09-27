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

import Component from 'coralui-mixin-component';
import {transform, validate} from 'coralui-util';

const CLASSNAME = 'coral-Table-column';

/**
 Enum for cell sortable directions.
 
 @enum {String}
 @memberof Coral.Table.Column
 */
const sortableDirection = {
  /** Default. */
  DEFAULT: 'default',
  /** Ascending sort. */
  ASCENDING: 'ascending',
  /** Descending sort. */
  DESCENDING: 'descending'
};

/**
 Enum for sortable type values.
 
 @enum {String}
 @memberof Coral.Table.Column
 */
const sortableType = {
  /** Alphanumeric type. If sorting is based on {@link Coral.Table.Cell#value}, use JavaScript String. */
  ALPHANUMERIC: 'alphanumeric',
  /** Number type. If sorting is based on {@link Coral.Table.Cell#value}, use JavaScript Numbers */
  NUMBER: 'number',
  /** Date type. If sorting is based on {@link Coral.Table.Cell#value}, use the date numeric value in milliseconds. */
  DATE: 'date',
  /** Custom type. Sorting is based on user defined sorting. */
  CUSTOM: 'custom'
};

/**
 @class Coral.Table.Column
 @classdesc A Table column component
 @htmltag coral-table-column
 @htmlbasetag col
 @extends HTMLTableColElement
 @extends Coral.mixin.component
 */
class TableColumn extends Component(HTMLTableColElement) {
  constructor() {
    super();
  }
  
  /**
   Whether the column has a fixed width.
   
   @type {Boolean}
   @default false
   @htmlattribute fixedwidth
   @htmlattributereflected
   @memberof Coral.Table.Column#
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
   @memberof Coral.Table.Column#
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
   @memberof Coral.Table.Column#
   */
  get orderable() {
    return this._orderable || false;
  }
  set orderable(value) {
    this._orderable = transform.booleanAttr(value);
    this._reflectAttribute('orderable', this._orderable);
    
    window.requestAnimationFrame(function() {
      this.trigger('coral-table-column:_orderablechanged');
    }.bind(this));
  }
  
  /**
   Whether the column is sortable by user interaction.
   
   @type {Boolean}
   @default false
   @htmlattribute sortable
   @htmlattributereflected
   @memberof Coral.Table.Column#
   */
  get sortable() {
    return this._sortable || false;
  }
  set sortable(value) {
    this._sortable = transform.booleanAttr(value);
    this._reflectAttribute('sortable', this._sortable);
    
    window.requestAnimationFrame(function() {
      this.trigger('coral-table-column:_sortablechanged');
    }.bind(this));
  }
  
  /**
   The sorting type.
   
   @type {Coral.Table.Column.sortableType}
   @default {Coral.Table.Column.sortableType.ALPHANUMERIC}
   @htmlattribute sortabletype
   @htmlattributereflected
   @memberof Coral.Table.Column#
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
   The sorting direction. Sorts the column cells based on {@link Coral.Table.Cell#value}.
   If not present, the sort is based on the cell text content.
   
   @type {Coral.Table.Column.sortableDirection}
   @default {Coral.Table.Column.sortableDirection.DEFAULT}
   @htmlattribute sortabledirection
   @htmlattributereflected
   @memberof Coral.Table.Column#
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
    
    this.trigger('coral-table-column:_beforecolumnsort', {
      newSortableDirection: newSortableDirection
    });
  }
  
  /** @private */
  _doSort(onInitialization) {
    this.trigger('coral-table-column:_sort', {
      onInitialization: onInitialization,
      sortableDirection: sortableDirection,
      sortableType: sortableType
    });
  }
  
  // Expose enums
  static get sortableDirection() {return sortableDirection;}
  static get sortableType() {return sortableType;}
  
  static get observedAttributes() {
    return [
      'fixedwidth',
      'fixedWidth',
      'hidden',
      'orderable',
      'sortable',
      'sortabletype',
      'sortableType',
      'sortabledirection',
      'sortableDirection'
    ];
  }
  
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
    
    // Default reflected attributes
    if (!this._sortableType) {this.sortableType = sortableType.ALPHANUMERIC;}
    if (!this._sortableDirection) {this.sortableDirection = sortableDirection.DEFAULT;}
  }
  
  /**
   Triggered when {@link Coral.Table.Column#fixedWidth} changed.
   
   @event Coral.Table.Column#coral-table-column:_fixedwidthchanged
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Table.Column#orderable} changed.
   
   @event Coral.Table.Column#coral-table-column:_orderablechanged
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Table.Column#sortable} changed.
   
   @event Coral.Table.Column#coral-table-column:_sortablechanged
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Table.Column#sortableDirection} changed.
   
   @event Coral.Table.Column#coral-table-column:_sortabledirectionchanged
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Table.Column#hidden} changed.
   
   @event Coral.Table.Column#coral-table-column:_hiddenchanged
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered before {@link Coral.Table.Column#sortableDirection} changed.
   
   @event Coral.Table.Column#coral-table-column:_beforecolumnsort
   
   @param {Object} event Event object
   @private
   */
  
  /**
   Triggered when {@link Coral.Table.Column#sortableDirection} changed.
   
   @event Coral.Table.Column#coral-table-column:_sort
   
   @param {Object} event Event object
   @private
   */
}

export default TableColumn;
