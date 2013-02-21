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
 * This class implaments a {@link CUI.rte.EditorEvent} for the ExtJS toolkit.
 * @class CUI.rte.adapter.ExtEvent
 * @extends CUI.rte.EditorEvent
 */
CUI.rte.adapter.ExtEvent = new Class({

    toString: "ExtEvent",

    extend: CUI.rte.EditorEvent,

    /**
     * The native ExtJS event
     * @type CQ.Ext.EventObject
     * @private
     */
    nativeEvent: null,

    /**
     * The native ExtJS event (for backward compatibility)
     * @type CQ.Ext.EventObject
     * @private
     */
    extEvent: null,

    /**
     * Creates a new editor event from the specified ExtJS event.
     * @param {CQ.Ext.EventObject} extEvent The underlying, native ExtJS event
     * @param {CUI.rte.EditContext} editContext The editor context for the event
     */
    construct: function(extEvent, editContext) {
        // console.log(extEvent);
        this.nativeEvent = extEvent;
        this.extEvent = extEvent;
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

    // overrides CUI.rte.EditorEvent#isTab
    isTab: function() {
        return this.nativeEvent.getKey() == this.nativeEvent.TAB;
    },

    // overrides CUI.rte.EditorEvent#isEnter
    isEnter: function() {
        return this.nativeEvent.getKey() == this.nativeEvent.ENTER;
    },

    // overrides CUI.rte.EditorEvent#isSpace
    isSpace: function() {
        return this.nativeEvent.getKey() == this.nativeEvent.SPACE;
    },

    // overrides CUI.rte.EditorEvent#isBackSpace
    isBackSpace: function() {
        return this.nativeEvent.getKey() == this.nativeEvent.BACKSPACE;
    },

    // overrides CUI.rte.EditorEvent#isDelete
    isDelete: function() {
        return this.nativeEvent.getKey() == this.nativeEvent.DELETE;
    },

     // overrides CUI.rte.EditorEvent#isCaretKey
    isCaretKey: function() {
        var key = this.nativeEvent.getKey();
        return (key == this.nativeEvent.UP) || (key == this.nativeEvent.DOWN)
                || (key == this.nativeEvent.LEFT) || (key == this.nativeEvent.RIGHT);
    },

    // overrides CUI.rte.EditorEvent#isCaretMovement
    isCaretMovement: function() {
        var key = this.nativeEvent.getKey();
        return this.isCaretKey()
                || (key == this.nativeEvent.PAGE_UP) || (key == this.nativeEvent.PAGE_DOWN)
                || (key == this.nativeEvent.HOME) || (key == this.nativeEvent.END);
    },

    // overrides CUI.rte.EditorEvent#preventDefault
    preventDefault: function() {
        this.nativeEvent.preventDefault();
    },

    // overrides CUI.rte.EditorEvent#stopPropagation
    stopPropagation: function() {
        this.nativeEvent.stopPropagation();
    },

    // overrides CUI.rte.EditorEvent#stopEvent
    stopEvent: function() {
        this.nativeEvent.stopEvent();
    }

});