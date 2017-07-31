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
import {ListItem as ListItemMixin} from 'coralui-mixin-list';

/**
 @class Coral.List.Item
 @classdesc A List item component
 @htmltag coral-list-item
 @extends HTMLElement
 @extends Coral.mixin.component
 @extends Coral.mixin.list.item
 */
class ListItem extends ListItemMixin(Component(HTMLElement)) {
  constructor() {
    super();
    
    // Events
    this._delegateEvents(this._events);
  }
}

export default ListItem;
