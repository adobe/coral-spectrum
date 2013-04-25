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
 * @class CUI.rte.IFrameKernel
 * @extends CUI.rte.EditorKernel
 * @private
 * This class implements an EditorKernel for iFrame-based rich text editing.
 * @constructor
 * Creates a new IFrameKernel for rich text editing.
 * @param {Object} config The kernel's configuration
 */
CUI.rte.IFrameKernel = new Class({

    toString: "IFrameKernel",

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
     * @param {HTMLElement} iFrame The iFrame
     * @param {window} win The window object that is responsible for editing
     * @param {document} doc The document object that is reponsible for editing
     * @param {HTMLElement} root The root element (the "body" element of the iFrame)
     */
    initializeEditContext: function(iFrame, win, doc, root) {
        var com = CUI.rte.Common;
        this.editContext = new CUI.rte.EditContext(iFrame, win, doc, root);
        com.initializeTouchInIframe(this.editContext);
        // switch off auto linking - see http://msdn.microsoft.com/en-us/library/aa769893%28v=vs.85%29.aspx
        if (com.ua.isW3cIE) {
            doc.execCommand("AutoUrlDetect", false, false);
        }
        this.addFeatureClasses(root);
        if (this.toolbar) {
            this.toolbar.startEditing(this);
        }
    },

    /**
     * <p>Ensures that the caret gets initialized.</p>
     * <p>Will be executed immediately, if the editor kernel currently has the focus, or
     * optionally on next focus gain.</p>
     */
    initializeCaret: function(enforceInit) {
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        if (this.hasFocus) {
            var context = this.getEditContext();
            sel.resetSelection(context, "start");
            if ((com.ua.isGecko || com.ua.isWebKit) && context.iFrame) {
                sel.ensureCaretVisibility(context, 0);
            }
        } else if (enforceInit) {
            this.focusGainActions.initializeCaret = true;
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
        return context.win;
    },

    /**
     * Focusses the DOM element responsible for rich text editing.
     * @param {CUI.rte.EditContext} context (optional) The edit context
     */
    focus: function(context) {
        if (!context) {
            context = this.getEditContext();
        }
        if (context.win) {
            context.win.focus();
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
        if (context.win) {
            context.win.blur();
        }
    },

    /**
     * Calculates a suitable position for a subordinate window.
     * @param {String} hint A positioning hint; allowed values are: "default"; defaults to
     *        "default"
     * @return {Number[]} The XY position for the subordinate window (e.g., [100, 200])
     */
    calculateWindowPosition: function(hint) {
        var winPos = null;
        switch (hint) {
            default:
                winPos = this.getEditorPosition();
                break;
        }
        return winPos || [ 0, 0 ];
    },

    // overrides CUI.rte.EditorKernel#calculateContextMenuPosition
    calculateContextMenuPosition: function(event) {
        var editContext = this.getEditContext();
        var editorPos = this.getEditorPosition();
        var scrollPos = [ 0, 0 ];
        var com = CUI.rte.Common;

        if (!com.ua.isOldIE) {
            scrollPos = [ editContext.root.scrollLeft, editContext.root.scrollTop ];
        } else {
            var contentWindow = CUI.rte.Utils.getMainWindow();
            var doc = contentWindow.document;
            var body = doc.body;
            scrollPos = [ doc.documentElement.scrollLeft || body.scrollLeft,
                    doc.documentElement.scrollTop || body.scrollTop ];
        }
        var eventPos = event.getPos();
        return [ editorPos[0] + eventPos.x - scrollPos[0],
                editorPos[1] + eventPos.y - scrollPos[1] ];
    },

    // overrides CUI.rte.EditorKernel#createToolbarBuilder
    createToolbarBuilder: function() {
        var ui = CUI.rte.ui;
        return ui.ToolkitRegistry.get(this.uiToolkit).createToolbarBuilder(
                ui.Toolkit.TBHINT_LOCAL);
    },

    // overrides CUI.rte.EditorKernel#canEditSource
    canEditSource: function() {
        return true;
    },


    // Additional methods ------------------------------------------------------------------

    /**
     * Sets the path to the content being edited.
     * @param {String} contentPath The content path
     */
    setContentPath: function(contentPath) {
        this.contentPath = contentPath;
    },

    // Helpers -----------------------------------------------------------------------------

    /**
     * <p>Gets the current position of the iframe.</p>
     * @return {Number[]} The XY position of the element (e.g., [100, 200])
     */
    getEditorPosition: function() {
        var context = this.getEditContext();
        if (!context.iFrame) {
            return null;
        }
        return CUI.rte.Utils.getPagePosition(context.iFrame);
    }

});
