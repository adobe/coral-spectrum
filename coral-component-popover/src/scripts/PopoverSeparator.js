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

import {ComponentMixin} from '../../../coral-mixin-component';

const CLASSNAMES = ['coral-Rule', 'coral-Rule--subsection2'];

/**
 @class Coral.Popover.Separator
 @classdesc The Popover separator
 @htmltag coral-popover-separator
 @extends {HTMLElement}
 @extends {ComponentMixin}
 */
class PopoverSeparator extends ComponentMixin(HTMLElement) {
  /** @ignore */
  connectedCallback() {
    this.classList.add(...CLASSNAMES);
  }
}

export default PopoverSeparator;
