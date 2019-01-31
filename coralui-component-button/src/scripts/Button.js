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
import {ButtonMixin} from '../../../coralui-mixin-button';

/**
 @class Coral.Button
 @classdesc A Button component containing text and/or an icon.
 @htmltag coral-button
 @htmlbasetag button
 @extends {HTMLButtonElement}
 @extends {ComponentMixin}
 @extends {ButtonMixin}
 */
class Button extends ButtonMixin(ComponentMixin(HTMLButtonElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(this._events);
  }
}

export default Button;
