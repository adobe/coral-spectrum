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
 * @class CQ.form.rte.commands.Delete
 * @extends CQ.form.rte.commands.Command
 * @private
 */
CQ.form.rte.commands.Delete = new Class({

    toString: "Delete",

    extend: CQ.form.rte.commands.Command,

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "delete") || (cmdLC == "delete");
    },

    execute: function(execDef) {
        CQ.form.rte.commands.Delete.executeDelete(execDef.editContext);
    }

});

/**
 * <p>Immediately executes the delete command (without using the EditorKernel's selection
 * adjustments).</p>
 * <p>Use this to delete the current (already preprocessed) selection from another command
 * and ensure that the editor is kept in a usable state (at least an empty block will be
 * available afterwards).</p>
 * @param {CQ.form.rte.EditContext} editContext The edit context
 * @private
 */
CQ.form.rte.commands.Delete.executeDelete = function(editContext) {
    editContext.doc.execCommand("delete", false, null);
    CQ.form.rte.DomProcessor.ensureMinimumContent(editContext);
};

// register command
CQ.form.rte.commands.CommandRegistry.register("delete", CQ.form.rte.commands.Delete);