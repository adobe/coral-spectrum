/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2012 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

/**
 * @class CQ.form.rte.EditContext
 * This class is used to abstract the context the editor is used in.
 * @constructor
 * @param {HTMLElement} iFrame iframe the editor is running in (if any)
 * @param {window} win The window object that is suitable for the editor
 * @param {document} doc The document object that is suitable for the editor
 * @param {HTMLElement} root The "root" element (the iframe's body tag or the div that is
 *        made editable)
 */
CQ.form.rte.EditContext = new Class({

    toString: "EditContext",

    /**
     * @private
     * @type HTMLElement
     */
    iFrame: null,

    /**
     * @private
     * @type window
     */
    win: null,

    /**
     * @private
     * @type document
     */
    doc: null,

    /**
     * @private
     * @type HTMLElement
     */
    root: null,

    construct: function(iFrame, win, doc, root) {
        this.iFrame = iFrame;
        this.win = win;
        this.doc = doc;
        this.root = root;
    },

    /**
     * Creates the specified DOM element for the context.
     * @param {String} tagName The element's name
     * @return {HTMLElement} The DOM element; null, if context is not yet initialized
     */
    createElement: function(tagName) {
        return (this.doc != null ? this.doc.createElement(tagName) : null);
    },

    /**
     * Creates a text node with the specified text data.
     * @param {String} textData Text data of the node
     * @return {HTMLElement} The text node
     */
    createTextNode: function(textData) {
        return (this.doc != null ? this.doc.createTextNode(textData) : null);
    },

    /**
     * Checks if the edit context is fully initialized.
     * @return {Boolean} true if the edit context is fully initialized
     */
    isInitialized: function() {
        return (this.win != null) && (this.doc != null) && (this.root != null);
    }

});