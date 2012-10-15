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
 * This class implaments a {@link CQ.form.rte.EditorEvent} for the ExtJS toolkit.
 * @class CQ.form.rte.adapter.ExtEvent
 * @extends CQ.form.rte.EditorEvent
 */
CQ.form.rte.adapter.ExtEvent = new Class({

    toString: "ExtEvent",

    extend: CQ.form.rte.EditorEvent,

    /**
     * The native ExtJS event
     * @type CQ.Ext.EventObject
     * @private
     */
    native: null,

    /**
     * Creates a new editor event from the specified ExtJS event.
     * @param {CQ.Ext.EventObject} extEvent The underlying, native ExtJS event
     * @param {CQ.form.rte.EditContext} editContext The editor context for the event
     */
    construct: function(extEvent, editContext) {
        // console.log(extEvent);
        this.native = extEvent;
        // map to common properties
        var cfg = {
            "type": extEvent.type,
            "key": extEvent.getKey(),
            "charCode": extEvent.getCharCode(),
            "metaKeyPressed": extEvent.metaKey,
            "ctrlKeyPressed": extEvent.ctrlKey,
            "shiftKeyPressed": extEvent.shiftKey,
            "pos": {
                "x": extEvent.getPageX(),
                "y": extEvent.getPageY()
            },
            "button": extEvent.button,
            "editContext": editContext
        };
        this._init(cfg);
    },

    // overrides CQ.form.rte.EdittorEvent#isTab
    isTab: function() {
        return this.native.getKey() == this.native.TAB;
    },

    // overrides CQ.form.rte.EdittorEvent#isEnter
    isEnter: function() {
        return this.native.getKey() == this.native.ENTER;
    },

    // overrides CQ.form.rte.EdittorEvent#isSpace
    isSpace: function() {
        return this.native.getKey() == this.native.SPACE;
    },

    // overrides CQ.form.rte.EdittorEvent#isBackSpace
    isBackSpace: function() {
        return this.native.getKey() == this.native.BACKSPACE;
    },

    // overrides CQ.form.rte.EdittorEvent#isDelete
    isDelete: function() {
        return this.native.getKey() == this.native.DELETE;
    },

     // overrides CQ.form.rte.EdittorEvent#isCaretKey
    isCaretKey: function() {
        var key = this.native.getKey();
        return (key == this.native.UP) || (key == this.native.DOWN)
                || (key == this.native.LEFT) || (key == this.native.RIGHT);
    },

    // overrides CQ.form.rte.EdittorEvent#isCaretMovement
    isCaretMovement: function() {
        var key = this.native.getKey();
        return this.isCaretKey()
                || (key == this.native.PAGE_UP) || (key == this.native.PAGE_DOWN)
                || (key == this.native.HOME) || (key == this.native.END);
    },

    // overrides CQ.form.rte.EdittorEvent#preventDefault
    preventDefault: function() {
        this.native.preventDefault();
    },

    // overrides CQ.form.rte.EdittorEvent#stopPropagation
    stopPropagation: function() {
        this.native.stopPropagation();
    },

    // overrides CQ.form.rte.EdittorEvent#stopEvent
    stopEvent: function() {
        this.native.stopEvent();
    }

});