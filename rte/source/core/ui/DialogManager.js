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
 * This class should be overridden by toolkit-specific dialog implementations.
 */
CUI.rte.ui.DialogManager = new Class({

    create: function(dialogId, config) {
        throw new Error("DialogManager#create must be implemented")
    },

    mustRecreate: function(dialog) {
        throw new Error("DialogManager#mustRecreate must be implemented");
    },

    show: function(dialog) {
        throw new Error("DialogManager#show must be implemented");
    },

    hide: function(dialog) {
        throw new Error("DialogManager#hide must be implemented");
    },

    alert: function(title, message, fn) {
        throw new Error("DialogManager#alert must be implemented");
    },

    createDialogHelper: function() {
        throw new Error("DialogManager#createDialogHelper must be implemented");
    }

});

/**
 * ID for the "link" dialog
 * @type {String}
 */
CUI.rte.ui.DialogManager.DLG_LINK = "linkDialog";

/**
 * ID for the "anchor" dialog
 * @type {String}
 */
CUI.rte.ui.DialogManager.DLG_ANCHOR = "anchorDialog";

/**
 * ID for the "find &amp; replace" dialog
 * @type {String}
 */
CUI.rte.ui.DialogManager.DLG_FINDREPLACE = "findReplaceDialog";

/**
 * ID for the "paste" dialog
 * @type {String}
 */
CUI.rte.ui.DialogManager.DLG_PASTE = "pasteDialog";

/**
 * ID for the "special chars" dialog
 * @type {String}
 */
CUI.rte.ui.DialogManager.DLG_SPECCHARS = "specCharsDialog";

/**
 * ID for the "table properties" dialog
 * @type {String}
 */
CUI.rte.ui.DialogManager.DLG_TABLEPROPS = "tablePropsDialog";

/**
 * ID for the "cell properties" dialog
 * @type {String}
 */
CUI.rte.ui.DialogManager.DLG_CELLPROPS = "cellPropsDialog";
