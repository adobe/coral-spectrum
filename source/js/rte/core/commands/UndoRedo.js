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
 * @class CQ.form.rte.commands
 * @private
 * The Command should be implemented by all RTE commands that cannot be handled by the
 * browser's implementation itself.
 */
CQ.form.rte.commands.UndoRedo = new Class({

    toString: "UndoRedo",

    extend: CQ.form.rte.commands.Command,

    /**
     * The undo manager object for this RichText instance
     * @private
     */
    undoManager: null,

    construct: function() {
        this.undoManager = new CQ.form.rte.UndoManager(50);
    },

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "undo") || (cmdLC == "redo") || (cmdLC == "undoconfig")
                || (cmdLC == "initializeundo") || (cmdLC == "addundostep")
                || (cmdLC == "clearredohistory");
    },

    isUndoable: function(cmdStr) {
        return false;
    },

    requiresInitializedComponent: function(cmdStr) {
        return (cmdStr != "undoconfig");
    },

    getProcessingOptions: function() {
        return CQ.form.rte.commands.Command.PO_NONE;
    },

    execute: function(execDef) {
        var cmdLC = execDef.command.toLowerCase();
        var context = execDef.editContext;
        switch (cmdLC) {
            case "undo":
                this.undoManager.undo(context);
                break;
            case "redo":
                this.undoManager.redo(context);
                break;
            case "undoconfig":
                if (execDef.value.maxUndoSteps != undefined) {
                    this.undoManager.maxUndoSteps = execDef.value.maxUndoSteps;
                }
                break;
            case "initializeundo":
                this.undoManager.initialize(context);
                break;
            case "addundostep":
                this.undoManager.addStep(new CQ.form.rte.UndoManager.Step(context));
                break;
            case "clearredohistory":
                this.undoManager.clearRedoHistory();
                break;
        }
    },

    queryState: function(selectionDef, cmd) {
        var cmdLC = cmd.toLowerCase();
        var state = false;
        switch (cmdLC) {
            case "undo":
                state = this.undoManager.canUndo();
                break;
            case "redo":
                state = this.undoManager.canRedo();
                break;
        }
        return state;
    }

});


// register command
CQ.form.rte.commands.CommandRegistry.register("undoredo", CQ.form.rte.commands.UndoRedo);