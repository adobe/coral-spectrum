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
 * This class implaments a {@link CUI.rte.EditorEvent} for the jQuery toolkit.
 * @class CUI.rte.adapter.ExtEvent
 * @extends CUI.rte.EditorEvent
 */
CUI.rte.adapter.JQueryEvent = new Class({

    toString: "JQueryEvent",

    extend: CUI.rte.EditorEvent,

    /**
     * The native jQuery event
     * @type jQuery.Event
     * @private
     */
    native: null,

    /**
     * Creates a new editor event from the specified jQuery event.
     * @param {jQuery.Event} jqEvent The underlying, native jQuery event
     * @param {CUI.rte.EditContext} editContext The editor context for the event
     */
    construct: function(jqEvent, editContext) {
        var isMac = CUI.rte.Common.ua.isMac;
        this.native = jqEvent;
        var key = (jqEvent.key ? jqEvent.key : jqEvent.keyCode);
        // map to common properties
        var cfg = {
            "type": jqEvent.type,
            "key": jqEvent.keyCode || jqEvent.charCode,
            "charCode": jqEvent.charCode || jqEvent.keyCode,
            "metaKeyPressed": jqEvent.metaKey,
            "ctrlKeyPressed": jqEvent.ctrlKey | (isMac && jqEvent.metaKey),
            "shiftKeyPressed": jqEvent.shiftKey,
            "pos": {
                "x": jqEvent.pageX,
                "y": jqEvent.pageY
            },
            "button": jqEvent.button,
            "editContext": editContext
        };
        this._init(cfg);
    },

    // overrides CUI.rte.EdittorEvent#isTab
    isTab: function() {
        return (this.charCode == 9);
    },

    // overrides CUI.rte.EdittorEvent#isEnter
    isEnter: function() {
        return (this.charCode == 13);
    },

    // overrides CUI.rte.EdittorEvent#isSpace
    isSpace: function() {
        return (this.charCode == 32);
    },

    // overrides CUI.rte.EdittorEvent#isBackSpace
    isBackSpace: function() {
        return (this.charCode == 8);
    },

    // overrides CUI.rte.EdittorEvent#isDelete
    isDelete: function() {
        return (this.charCode == 46);
    },

     // overrides CUI.rte.EdittorEvent#isCaretKey
    isCaretKey: function() {
        return (this.charCode >= 37) && (this.charCode <= 40);
    },

    // overrides CUI.rte.EdittorEvent#isCaretMovement
    isCaretMovement: function() {
        return this.isCaretKey()
                || ((this.charCode >= 33) && (this.charCode <= 36));
    },

    // overrides CUI.rte.EdittorEvent#preventDefault
    preventDefault: function() {
        this.native.preventDefault();
    },

    // overrides CUI.rte.EdittorEvent#stopPropagation
    stopPropagation: function() {
        this.native.stopPropagation();
    },

    // overrides CUI.rte.EdittorEvent#stopEvent
    stopEvent: function() {
        this.native.preventDefault();
        this.native.stopPropagation();
    }

});