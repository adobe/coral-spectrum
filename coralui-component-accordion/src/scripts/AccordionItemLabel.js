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

const CLASSNAME = '_coral-Accordion-itemHeader';

/**
 @class Coral.Accordion.Item.Label
 @classdesc Accordion item's label component
 @htmltag coral-accordion-item-label
 @extends {HTMLElement}
 */
class AccordionItemLabel extends HTMLElement {
  /** @ignore */
  connectedCallback() {
    this.classList.add(CLASSNAME);
  
    // @spectrum this should be supported
    this.style.display = 'block';
  
    // a11y
    this.setAttribute('role', 'tab');
  }
}

export default AccordionItemLabel;
