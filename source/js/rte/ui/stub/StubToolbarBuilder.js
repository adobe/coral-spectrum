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

CUI.rte.ui.stub.StubToolbarBuilder = new Class({

    toString: "StubToolbarBuilder",

    extend: CUI.rte.ui.ToolbarBuilder,


    // Toolbar management ------------------------------------------------------------------

    /**
     * Create the toolbar as a suitable Ext component.
     * @return {CUI.rte.ui.Toolbar} The toolbar
     */
    createToolbar: function(options) {
        return new CUI.rte.ui.stub.ToolbarImpl({ });
    },


    // Creating elements -------------------------------------------------------------------

    createElement: function(id, plugin, toggle, tooltip, css, cmdDef) {
        return new CUI.rte.ui.stub.ElementImpl(id, plugin, toggle, tooltip, css,
                cmdDef);
    },

    createParaFormatter: function(id, plugin, tooltip, formats) {
        return new CUI.rte.ui.stub.ParaFormatterImpl(id, plugin, false, tooltip, false,
                undefined, formats);
    },

    createStyleSelector: function(id, plugin, tooltip, styles) {
        return new CUI.rte.ui.stub.StyleSelectorImpl(id, plugin, false, tooltip, false,
                undefined, styles);
    }

});