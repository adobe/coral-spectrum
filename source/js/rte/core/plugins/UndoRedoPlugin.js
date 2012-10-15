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
 * @class CQ.form.rte.plugins.UndoRedoPlugin
 * @extends CQ.form.rte.plugins.Plugin
 * <p>This class implements undo/redo functionality as a plugin.</p>
 * <p>The plugin ID is "<b>undo</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>undo</b> - adds a button for undoing a single undo step</li>
 *   <li><b>redo</b> - adds a button for redoing a single undo step</li>
 * </ul>
 * @since 5.3
 */
CQ.form.rte.plugins.UndoRedoPlugin = new Class({

    toString: "UndoRedoPlugin",

    extend: CQ.form.rte.plugins.Plugin,

    undoUI: null,

    redoUI: null,

    /**
     * @cfg {Number} maxUndoSteps
     * Number of maximum undo steps (defaults to 50); use 0 to disable undo/redo completely
     * @since 5.3
     */
    maxUndoSteps: 0,

    /**
     * Flag that determines if we are currently in a "Delete"-Sequence (which will be
     * recorded as a single undo step)
     * @type Boolean
     * @private
     */
    isDeleteSequence: false,

    /**
     * Flag that determines if we are currently in a "Caret movement"-Sequence (which will
     * be handled specially regarding undo undo)
     * @type Boolean
     * @private
     */
    isCaretMovement: false,

    _init: function(editorKernel) {
        this.inherited(arguments);
        editorKernel.addPluginListener("mouseup", this.addUndoStep, this, this, false);
        editorKernel.addPluginListener("beforekeydown", this.handleKeyDown, this, this,
                false);
        editorKernel.addPluginListener("keyup", this.handleKeyUp, this, this,
                false);
        editorKernel.addPluginListener("beforecommandexecuted", this.handleCommand, this,
                this, false);
        editorKernel.addPluginListener("commandexecuted", this.handleCommand, this, this,
                false);
    },

    addUndoStep: function() {
        this.editorKernel.execCmd("addundostep");
    },

    handleCommand: function(e) {
        if (!e.customCommand || e.customCommand.isUndoable(e.cmd)) {
            this.addUndoStep();
        }
    },

    handleKeyDown: function(e) {
        // todo will this prevent some undo action from being recorded?
        if (e.cancelKey) {
            return;
        }
        var key = e.getKey();
        var isControl = e.isCtrl();
        var isShift = e.isShift();
        var isUndoKey = isControl && !isShift && (key == 90);
        var isRedoKey = (isControl && !isShift && (key == 89))
                || (isShift && isControl && (key == 90));       // Cmd + Shift + Z on Mac
        if (isUndoKey || isRedoKey) {
            e.cancelKey = true;
            this.editorKernel.relayCmd(isUndoKey ? "undo" : "redo");
        } else if (e.isSpace()) {
            // record a undo step if the space bar has been pressed
            this.editorKernel.execCmd("addundostep");
        } else if ((e.isBackSpace()) || (e.isDelete())) {
            if (!this.isDeleteSequence) {
                this.editorKernel.execCmd("addundostep");
                this.isDeleteSequence = true;
            }
        } else if (e.isCaretMovement()) {
            if (!this.isCaretMovement) {
                this.editorKernel.execCmd("addundostep");
                this.isCaretMovement = true;
            }
        } else {
            if (this.isDeleteSequence || this.isCaretMovement) {
                if (this.isDeleteSequence) {
                    // take a snapshot of the content after the deletion sequence
                    this.editorKernel.execCmd("addundostep");
                }
                this.isDeleteSequence = false;
                this.isCaretMovement = false;
            }
            if ((key > 32) && (key != 224)) {
                this.editorKernel.execCmd("clearredohistory");
            }
        }
    },

    handleKeyUp: function(e) {
        if (e.isEnter()) {
            // record a undo step if return has been pressed
            this.editorKernel.execCmd("addundostep");
        }
    },

    getFeatures: function() {
        return [ "undo", "redo" ];
    },

    notifyPluginConfig: function(pluginConfig) {
        var defaults = {
            "maxUndoSteps": 50,
            "tooltips": {
                "undo": {
                    "title": CQ.I18n.getMessage("Undo"),
                    "text": CQ.I18n.getMessage("Undo the last change.")
                },
                "redo": {
                    "title": CQ.I18n.getMessage("Redo"),
                    "text": CQ.I18n.getMessage("Redo previously undone changes.")
                }
            }
        };
        CQ.Util.applyDefaults(pluginConfig, defaults);
        this.config = pluginConfig;
        var commandCfg = {
            "maxUndoSteps": this.config.maxUndoSteps
        };
        this.editorKernel.execCmd("undoconfig", commandCfg);
    },

    initializeUI: function(tbGenerator) {
        var plg = CQ.form.rte.plugins;
        if (this.isFeatureEnabled("undo")) {
            this.undoUI = new tbGenerator.createElement("undo", this, false,
                    this.getTooltip("undo"));
            tbGenerator.addElement("undo", plg.Plugin.SORT_UNDO, this.undoUI, 100);
        }
        if (this.isFeatureEnabled("redo")) {
            this.redoUI = new tbGenerator.createElement("redo", this, false,
                    this.getTooltip("redo"));
            tbGenerator.addElement("undo", plg.Plugin.SORT_UNDO, this.redoUI, 110);
        }
    },

    execute: function(pluginCommand, value, envOptions) {
        if (pluginCommand == "undo") {
            this.editorKernel.relayCmd("undo", value);
        } else if (pluginCommand == "redo") {
            this.editorKernel.relayCmd("redo", value);
        }
    },

    updateState: function(selectionDef) {
        if (this.undoUI) {
            this.undoUI.setDisabled(!this.editorKernel.queryState("undo", selectionDef));
        }
        if (this.redoUI) {
            this.redoUI.setDisabled(!this.editorKernel.queryState("redo", selectionDef));
        }
    }

});


// register plugin
CQ.form.rte.plugins.PluginRegistry.register("undo", CQ.form.rte.plugins.UndoRedoPlugin);