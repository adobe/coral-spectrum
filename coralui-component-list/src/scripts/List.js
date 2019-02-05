/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

import {ComponentMixin} from '../../../coralui-mixin-component';
import {ListMixin} from '../../../coralui-mixin-list';

/**
 @class Coral.List
 @classdesc A List component that supports multi-line text, icons, and text wrapping with ellipsis.
 @htmltag coral-list
 @extends {HTMLElement}
 @extends {ComponentMixin}
 @extends {ListMixin}
 */
class List extends ListMixin(ComponentMixin(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(this._events);
  }
}

export default List;
