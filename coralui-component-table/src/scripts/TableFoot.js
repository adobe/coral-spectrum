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
import TableSectionMixin from './TableSectionMixin';

const CLASSNAME = '_coral-Table-foot';

/**
 @class Coral.Table.Foot
 @classdesc A Table foot component
 @htmltag coral-table-foot
 @htmlbasetag tfoot
 @extends {HTMLTableSectionElement}
 @extends {ComponentMixin}
 @extends {TableSectionMixin}
 */
class TableFoot extends TableSectionMixin(ComponentMixin(HTMLTableSectionElement)) {
  /** @ignore */
  connectedCallback() {
    super.connectedCallback();
    
    this.classList.add(CLASSNAME);
  }
}

export default TableFoot;
