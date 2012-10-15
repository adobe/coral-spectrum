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

CQ.form.rte.ui.cui.ToolkitImpl = new Class({

    toString: "ToolkitImpl",

    extend: CQ.form.rte.ui.Toolkit,

    dropDownCls: null,

    menuCls: null,

    initialize: function(cb) {
        // currently not required
    },

    requiresInit: function() {
        return false;
    },

    createToolbarBuilder: function(hint) {
        var tk = CQ.form.rte.ui.Toolkit;
        var cui = CQ.form.rte.ui.cui;
        switch(hint) {
            case tk.TBHINT_LOCAL:
                return new cui.CuiToolbarBuilder();
        }
        throw new Error("Invalid toolbar type (parameter 'hint'): " + hint);
    },

    createContextMenuBuilder: function(editorKernel) {
        return new CQ.form.rte.ui.cui.CuiContextMenuBuilder(editorKernel);
    },


    // Component access --------------------------------------------------------------------

    createDropDown: function(config) {
        return new this.dropDownCls(config);
    },

    createMenu: function(config) {
        return new this.menuCls(config);
    }

});

CQ.form.rte.ui.ToolkitRegistry.register("cui", CQ.form.rte.ui.cui.ToolkitImpl);
