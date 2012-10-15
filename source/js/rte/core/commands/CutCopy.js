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
 * @class CQ.form.rte.commands.CutCopy
 * @extends CQ.form.rte.commands.Command
 * @private
 */
CQ.form.rte.commands.CutCopy = new Class({

    toString: "CutCopy",

    extend: CQ.form.rte.commands.Command,

    isCommand: function(cmdStr) {
        var cmdLC = cmdStr.toLowerCase();
        return (cmdLC == "cut") || (cmdLC == "copy");
    },

    execute: function(execDef) {

        var command = execDef.command;
        var doc = execDef.editContext.doc;

        try {
            doc.execCommand(command, false, null);
        } catch (e) {
            throw new Error("Cannot " + command + ".");
        }
    }

});

// register command
CQ.form.rte.commands.CommandRegistry.register("cutcopy", CQ.form.rte.commands.CutCopy);