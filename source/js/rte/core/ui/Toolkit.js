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
 * This class defines the toolkit abstraction layer for the underlying UI toolkit.
 * @class CQ.form.rte.ui.Toolkit
 */
CQ.form.rte.ui.Toolkit = new Class({

    toString: "Toolkit",

    initialize: function() {
        // can be overridden for additional initialization the first time the toolkit
        // is acquired
    },

    requiresInit: function() {
        throw new Error("Toolkit#requiresInit is not implemented by the specific toolkit.");
    },

    createToolbarBuilder: function(hint) {
        throw new Error("Toolkit#createToolbarBuilder is not implemented by the specific "
                + "toolkit.");
    },

    createContextMenuBuilder: function(editorKernel) {
        throw new Error("Toolkit#createContextMenuBuilder is not implemented by the "
                + "specific toolkit.");
    },

    createDialogManager: function(editorKernel) {
        throw new Error("Toolkit#createDialogManager is not implemented by the specific "
                + "toolkit.");
    }

});

CQ.form.rte.ui.Toolkit.TBHINT_LOCAL = "local";

CQ.form.rte.ui.Toolkit.TBHINT_GLOBAL = "global";