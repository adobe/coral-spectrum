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
 * @class CUI.rte.DivKernel
 * @extends CUI.rte.EditorKernel
 * @private
 * This class implements an EditorKernel for div-based rich text editing.
 * @constructor
 * Creates a new DivKernel for rich text editing.
 * @param {Object} config The kernel's configuration
 */
CUI.rte.DivKernel = new Class({

    toString: "DivKernel",

    extend: CUI.rte.EditorKernel,

    /**
     * Path to content being edited
     * @private
     * @type String
     */
    contentPath: null,


    // Interface implementation ------------------------------------------------------------

    /**
     * Initializes the edit context once the rich text editing has been initialized.
     * @param {window} win The window object that is responsible for editing
     * @param {document} doc The document object that is reponsible for editing
     * @param {HTMLElement} root The root element (the "div" element being edited)
     */
    initializeEditContext: function(win, doc, root) {
        this.editContext = new CUI.rte.EditContext(null, win, doc, root);
        this.addFeatureClasses(root);
    },

    /**
     * <p>Ensures that the caret gets initialized.</p>
     * <p>Will be executed immediately, if the editor kernel currently has the focus, or
     * optionally on next focus gain.</p>
     */
    initializeCaret: function(enforceInit, emptyTextPara) {
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var context = this.getEditContext();
        if (com.ua.isGecko || com.ua.isWebKit) {
            this.deferFocus(CUI.rte.Utils.scope(function() {
                sel.resetSelection(context, "start");
                this.fireUIEvent("updatestate");
            }, this));
        } else if (com.ua.isIE) {
            CUI.rte.Utils.defer(function() {
                this.focus();
                // workaround: EditorKernel does not always get first focus, so manually
                // ensuring that editorKernel.hasFocus is set correctly
                this.hasFocus = true;
                if (emptyTextPara != null) {
                    sel.selectNode(context, emptyTextPara, true);
                } else {
                    sel.resetSelection(context, "start");
                }
            }, 1, this);
        }
    },

    /**
     * Gets the path to the content being edited.
     * @return {String} The content path
     */
    getContentPath: function() {
        return this.contentPath;
    },

    /**
     * Get the DOM element that is responsible for focus handling.
     * @param {CUI.rte.EditContext} context (optional) The edit context
     * @return {HTMLElement} The DOM element that is responsible for focus handling
     */
    getFocusDom: function(context) {
        if (!context) {
            context = this.getEditContext();
        }
        return context.root;
    },

    /**
     * Focusses the DOM element responsible for rich text editing.
     * @param {CUI.rte.EditContext} context (optional) The edit context
     */
    focus: function(context) {
        if (!context) {
            context = this.getEditContext();
        }
        if (context.root) {
            try {
                context.root.focus();
            } catch (e) {
                // IE sometimes chokes on this, so at least prevent an error message popping
                // up
            }
        }
    },

    /**
     * Blurs the focus.
     * @param {CUI.rte.EditContext} context (optional) The edit context
     */
    blurFocus: function(context) {
        if (!context) {
            context = this.getEditContext();
        }
        if (context.root) {
            context.root.blur();
        }
    },

    /**
     * Calculates a suitable position for a subordinate window.
     * @param {String} hint A positioning hint; allowed values are: "default"; defaults to
     *        "default"
     * @return {Number[]} The XY position for the subordinate window (e.g., [100, 200])
     */
    calculateWindowPosition: function(hint) {
        var context = this.getEditContext();
        var winPos = null;
        var scrollTop = context.doc.documentElement.scrollTop || context.doc.body.scrollTop;
        switch (hint) {
            default:
                winPos = [ 0, scrollTop ];
                break;
        }
        return winPos || [ 0, 0 ];
    },

    // overrides CUI.rte.EditorKernel#calculateContextMenuPosition
    calculateContextMenuPosition: function(event) {
        var eventPos = event.getPos();
        return [ eventPos.x, eventPos.y ];
    },

    // overrides CUI.rte.EditorKernel#createToolbarBuilder
    createToolbarBuilder: function() {
        var ui = CUI.rte.ui;
        return ui.ToolkitRegistry.get(this.uiToolkit).createToolbarBuilder(
                ui.Toolkit.TBHINT_GLOBAL);
    },


    // Additional methods ------------------------------------------------------------------

    /**
     * Sets the path to the content being edited.
     * @param {String} contentPath The content path
     */
    setContentPath: function(contentPath) {
        this.contentPath = contentPath;
    }

});
