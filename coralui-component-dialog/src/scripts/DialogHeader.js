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

const CLASSNAME = '_coral-Dialog-title';

/**
 @class Coral.Dialog.Header
 @classdesc The Dialog header content
 @htmltag coral-dialog-header
 @extends {HTMLElement}
 */
class DialogHeader extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  
    this.setAttribute('role', 'heading');
    this.setAttribute('aria-level', '2');
  }
}

export default DialogHeader;
