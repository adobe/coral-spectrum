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
 * @class CUI.rte.UndoManager
 * @private
 * This class implements undo/redo functionality for the RichText component.
 * @constructor
 * Creates a new UndoManager.
 * @param {Number} maxUndoSteps Number of maximum undo steps
 */
CUI.rte.UndoManager = new Class({

    toString: "UndoManager",

    /**
     * Array that contains all currently available undo steps
     * @type CUI.rte.UndoManager.Step
     * @private
     */
    undoHistory: null,

    /**
     * Number of maximum undo steps
     * @type Number
     * @public
     */
    maxUndoSteps: 0,

    /**
     * Currently active undo step (as array index of array {@link #undoHistory})
     * @type Number
     * @private
     */
    activeUndoStep: 0,

    construct: function(maxUndoSteps) {
        this.undoHistory = [ ];
        this.maxUndoSteps = maxUndoSteps;
        this.activeUndoStep = 0;
    },

    /**
     * <p>Adds the specified undo step to the undo history.</p>
     * <p>The undo step is only added if it is different from the currently active
     * undo step.</p>
     * @param {CUI.rte.UndoManager.Step} stepToAdd The undo step to add
     * @return {Boolean} True if the step has actually been added
     */
    addStep: function(stepToAdd) {
        // special case: if we are somewhere in the history (except at their end) we
        // also have to check if the step to add is the same as the current step and leave
        // the history intact if this is the case.
        var activeStep;
        if (this.activeUndoStep > 0) {
            activeStep = this.undoHistory[this.activeUndoStep - 1];
            if (activeStep.hasEqualSnapshot(stepToAdd)) {
                // window.console.log("Skipping identical undo step.");
                return false;
            }
        }
        // remove all steps behind the currently active, as they become invalid through
        // the newly added
        this.clearRedoHistory();
        // finally add the step
        this.undoHistory.push(stepToAdd);
        // shorten history if it has grown too large
        if (this.undoHistory.length > this.maxUndoSteps) {
            var stepsToRemove = this.undoHistory.length - this.maxUndoSteps;
            /*
            window.console.log("Shortening undo history by " + stepsToRemove + " steps "
                    + " to ensure maximum size.");
            */
            this.undoHistory.splice(0, stepsToRemove);
            this.activeUndoStep -= stepsToRemove;
        }
        this.activeUndoStep++;
        // window.console.log("Step added: " + this.createShortDump());
        return true;
    },

    /**
     * Checks if there are undo steps are defined (and thus undo is available).
     * @return {Boolean} True if undo is currently available
     */
    canUndo: function() {
        return (this.activeUndoStep > 1);
    },

    /**
     * Checks if there are undo steps behind the currently active undo step (and thus
     * redo is available).
     * @return {Boolean} True if redo is currently available
     */
    canRedo: function() {
        return (this.activeUndoStep < this.undoHistory.length);
    },

    /**
     * Executes a one-step undo, if there are undoable steps available.
     * @param {CUI.rte.EditContext} context The edit context
     */
    undo: function(context) {
        // try to add another undo step to reflect the changes that may have been
        // made since the last undo step was recorded
        if (this.addStep(new CUI.rte.UndoManager.Step(context))) {
            // window.console.log("Recorded additional undo step");
        }
        if (this.canUndo()) {
            // the actual undo
            this.activeUndoStep--;
            this.undoHistory[this.activeUndoStep - 1].set(context);
            // window.console.log("After undo: " + this.createShortDump());
        }
    },

    /**
     * Executes a one-step redo, if there are redoable steps available.
     * @param {CUI.rte.EditContext} context The edit context
     */
    redo: function(context) {
        if (this.addStep(new CUI.rte.UndoManager.Step(context))) {
            // window.console.log("Recorded additional undo step");
        }
        if (this.canRedo()) {
            this.undoHistory[this.activeUndoStep].set(context);
            this.activeUndoStep++;
        }
        // window.console.log("After redo: " + this.createShortDump());
    },

    /**
     * <p>Initializes the undo manager from the given editor's iframe.</p>
     * <p>The undo history is cleared and re-initialized with a snapshot of the specified
     * editor content.</p>
     * @param {CUI.rte.EditContext} context The edit context
     */
    initialize: function(context) {
        // window.console.log("Initializing undo manager");
        this.undoHistory.length = 0;
        this.activeUndoStep = 0;
        this.addStep(new CUI.rte.UndoManager.Step(context));
    },

    /**
     * <p>Clears the undo history from the currently active undo step. This has the effect
     * that no more redo steps are available afterwards.</p>
     * <p>This method should be explicitly called if anything is changed after the last undo
     * and no undo step has yet been recorded for the change.</p>
     */
    clearRedoHistory: function() {
        var stepsToRemove = this.undoHistory.length - this.activeUndoStep;
        if (stepsToRemove > 0) {
            // window.console.log("Removing " + stepsToRemove + " steps.");
            this.undoHistory.splice(this.activeUndoStep, stepsToRemove);
        }
    },

    /**
     * Creates a (short) dump of the current undo history
     * @return {String} A short dump of the current undo history
     * @private
     */
    createShortDump: function() {
        var stepCnt = this.undoHistory.length;
        return "Undo history (" + stepCnt + " steps; active step: #"
                + this.activeUndoStep + "; maximum steps: " + this.maxUndoSteps + ")";
    },

    /**
     * Creates a (full) dump of the current undo history
     * @return {String} A full dump of the current undo history
     * @private
     */
    createDump: function() {
        var stepCnt = this.undoHistory.length;
        var dump = this.createShortDump() + ":\n";
        for (var s = 0; s < stepCnt; s++) {
            dump += "#" + s + ": " + this.undoHistory[s].createDump();
        }
        return dump;
    }
});


/**
 * @class CUI.rte.UndoManager.Step
 * @private
 * The UndoManager.Step represents a single undoable step of the undo history.
 * @constructor
 * Creates a new UndoManager.Step from the specified RichText edit frame.
 * @param {CUI.rte.EditContext} context The edit context
 * @param {Object} bookmark (optional) A selection bookmark to be used; if none is
 *        specified, the bookmark is created through the specified edit context
 */
CUI.rte.UndoManager.Step = new Class({

    toString: "UndoManager.Step",

    /**
     * The HTML snapshot representing the undo step
     */
    htmlSnapshot: null,

    /**
     * The bookmark representing the editor's selection at the time of the snapshot taken
     */
    bookmark: null,

    construct: function(context, bookmark) {
        var sel = CUI.rte.Selection;
        this.bookmark = (bookmark ? bookmark : sel.createSelectionBookmark(context));
        // delete object references from bookmark, as they would point to "zombie nodes"
        // after a undo/redo
        this.bookmark.insertObject = undefined;
        this.bookmark.object = undefined;
        var cleanupRoot = context.root.cloneNode(true);
        this.cleanup(cleanupRoot);
        this.htmlSnapshot = cleanupRoot.innerHTML;
    },

    /**
     * Removes temporary stuff from the DOM
     * @private
     */
    cleanup: function(dom) {
        var com = CUI.rte.Common;
        if (dom.nodeType == 1) {
            com.removeClass(dom, CQ.themes.RichText.TABLESELECTION_CLASS);
            var childCnt = dom.childNodes.length;
            for (var c = 0; c < childCnt; c++) {
                this.cleanup(dom.childNodes[c]);
            }
        }
    },

    /**
     * Sets the represented undo step to the RichText represented by the specified edit
     * context.
     * @param {CUI.rte.EditContext} context The edit context
     */
    set: function(context) {
        context.root.innerHTML = this.htmlSnapshot;
        CUI.rte.Selection.selectBookmark(context, this.bookmark);
    },

    /**
     * Compares the HTML snapshot of this undo step with the snapshot of the specified
     * undo step.
     * @param {CUI.rte.UndoManager.Step} stepToCompareWith The undo step to compare with
     * @return {Boolean} True if both steps have the same HTML snapshot
     */
    hasEqualSnapshot: function(stepToCompareWith) {
        return this.htmlSnapshot == stepToCompareWith.htmlSnapshot;
    },

    /**
     * Compares this undo step with the specified undo step.
     * @param {CUI.rte.UndoManager.Step} stepToCompareWith The undo step to compare with
     * @return {Boolean} True if both steps are identical
     */
    equals: function(stepToCompareWith) {
        var sel = CUI.rte.Selection;
        if (this.htmlSnapshot != stepToCompareWith.htmlSnapshot) {
            return false;
        }
        return sel.compareBookmarks(this.bookmark, stepToCompareWith.bookmark);
    },

    /**
     * Creates a dump of the undo step
     * @return {String} A dump of the undo step
     * @private
     */
    createDump: function() {
        var dump = "\n";
        dump += "Bookmark:\n" + this.bookmark.toSource();
        dump += "\nHTML-Snapshot:\n" + this.htmlSnapshot;
        dump += "\n\n";
        return dump;
    }

});