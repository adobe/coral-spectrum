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
 * @class CUI.rte.plugins.SimpleFormatPlugin
 * @extends CUI.rte.plugins.Plugin
 * This class provides the plugin functionality that is required by simple formatting
 * operations.
 */
CUI.rte.plugins.SimpleFormatPlugin = new Class({

    toString: "SimpleFormatPlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @private
     */
    commands: null,

    /**
     * @private
     */
    commandsUI: null,

    /**
     * @private
     */
    groupDef: null,

    getFeatures: function() {
        return this.commands;
    },

    _init: function(editorKernel, groupId, groupSort, commands) {
        this.inherited(arguments);
        this.groupDef = {
            "id": groupId,
            "sort": groupSort
        };
        this.commands = commands;
    },

    initializeUI: function(tbGenerator) {
        this.commandsUI = [ ];
        var cmdCnt = this.commands.length;
        for (var cmdIndex = 0; cmdIndex < cmdCnt; cmdIndex++) {
            var command = this.commands[cmdIndex];
            var shortcut = null;
            if (typeof(command) == "object") {
                shortcut = command.shortcut;
                command = command.command;
                this.commands[cmdIndex] = command;
            }
            if (this.isFeatureEnabled(command)) {
                var commandDef = tbGenerator.createElement(command, this, true,
                        this.getTooltip(command));
                this.commandsUI.push(commandDef);
                tbGenerator.addElement(this.groupDef.id, this.groupDef.sort, commandDef,
                        (cmdIndex + 1) * 10);
                if (shortcut) {
                    this.editorKernel.registerKeyboardShortcut(shortcut, command);
                }
            }
        }
    },

    execute: function(id) {
        this.editorKernel.relayCmd(id);
    },

    updateState: function(selectionDef) {
        var cmdCnt = this.commandsUI.length;
        for (var cmdIndex = 0; cmdIndex < cmdCnt; cmdIndex++) {
            var command = this.commandsUI[cmdIndex];
            command.setSelected(this.editorKernel.queryState(command.id, selectionDef));
        }
    }

});