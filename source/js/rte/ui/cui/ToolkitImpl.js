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

CUI.rte.ui.cui.ToolkitImpl = new Class({

    toString: "ToolkitImpl",

    extend: CUI.rte.ui.Toolkit,

    dropDownCls: null,

    menuCls: null,

    initialize: function(cb) {
        // currently not required
    },

    requiresInit: function() {
        return false;
    },

    createToolbarBuilder: function(hint) {
        var cui = CUI.rte.ui.cui;
        return new cui.CuiToolbarBuilder();
    },

    createContextMenuBuilder: function(editorKernel) {
        return new CUI.rte.ui.cui.CuiContextMenuBuilder(editorKernel);
    },

    createDialogManager: function(editorKernel) {
        return new CUI.rte.ui.stub.StubDialogManager(editorKernel)
    }

});

CUI.rte.ui.ToolkitRegistry.register("cui", CUI.rte.ui.cui.ToolkitImpl);
