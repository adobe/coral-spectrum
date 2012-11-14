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
 * @class CUI.rte.commands.Command
 * @private
 * The Command should be implemented by all RTE commands that cannot be handled by the
 * browser's implementation itself.
 */
CUI.rte.commands.Command = new Class({

    toString: "Command",

    isCommand: function(cmdStr) {
        // this method must be overridden
        return false;
    },

    isUndoable: function(cmdStr) {
        // this method can be overridden by commands that are actually not undoable (for
        // example undo/redo commands themselves)
        return true;
    },

    requiresInitializedComponent: function(cmdStr) {
        // this method can be overridden by commands that do not require an initialized
        // RTE component, for example for configuration, setup, etc.
        return true;
    },

    getProcessingOptions: function() {
        return CUI.rte.commands.Command.PO_NONE;
    },

    execute: function(execDef) {
        // this method must be overridden
    },

    // todo use a single parameter
    queryState: function(selectionDef, cmd) {
        return false;
    }

});

/**
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.commands.Command.PO_NONE = 0;

/**
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.commands.Command.PO_SELECTION = 1;

/**
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.commands.Command.PO_BOOKMARK = 2;

/**
 * @static
 * @final
 * @type Number
 * @private
 */
CUI.rte.commands.Command.PO_NODELIST = 4;
