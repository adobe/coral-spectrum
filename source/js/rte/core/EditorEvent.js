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
 * This class represents basic editor-related events, such as keystrokes or mouseclicks.
 * @class CUI.rte.EditorEvent
 */
CUI.rte.EditorEvent = new Class({

    toString: "EditorEvent",

    /**
     * The event's type
     * @type String
     * @private
     */
    type: null,

    /**
     * The key (for key-related events)
     * @type String
     * @private
     */
    key: null,

    /**
     * The character code of the key (for key-related events)
     * @type Number
     * @private
     */
    charCode: 0,

    /**
     * Flag that determines if the "Meta" key was held when the event occured
     * @type Boolean
     * @private
     */
    metaKeyPressed: false,

    /**
     * Flag that determines if the "Control" key was held when the event occured
     * @type Boolean
     * @private
     */
    ctrlKeyPressed: false,

    /**
     * The mouse button (for events related to mouse clicks)
     * @type Number
     * @private
     */
    button: Math.NaN,

    /**
     * Property that is used to signal if the event was cancelled by a listener; if a
     * listener sets this to true, event bubbling will be stopped and the system's default
     * behaviour will be  prevented.
     * @property {Boolean} cancelKey
     */
    cancelKey: false,

    /**
     * The edit context for the event
     * @property {CUI.rte.EditContext} editContext
     */
    editContext: null,


    /**
     * Constructor substitution.
     * @private
     */
    _init: function(cfg) {
        CUI.rte.Utils.apply(this, cfg);
    },

    /**
     * Gets the event type.
     * @return {String} The type
     */
    getType: function() {
        return this.type;
    },

    /**
     * <p>Checks if the specified event represents a caret key (left, right, up, down).</p>
     * <p>Returns false for non key-related events.</p>
     * @return {Boolean} True if the specified event represents a caret key
     */
    isCaretKey: function() {
        throw new Error(
                "EditorEvent#isCaretKey must be overridden by the extending class.");
    },

    /**
     * <p>Checks if the specified event describes a caret movement (for example through
     * one of the caret movement keys or pageup/pagedown).</p>
     * <p>Returns false for non key-related events.</p>
     * @return {Boolean} True if the specified event describes a caret movement
     */
    isCaretMovement: function() {
        throw new Error(
                "EditorEvent#isCaretMovement must be overridden by the extending class.");
    },

    /**
     * <p>Gets the key that is connected to the event.</p>
     * <p>Only valid for key-related events; check {@link #getType()} first.</p>
     * @return {String} The key
     */
    getKey: function() {
        return this.key;
    },

    /**
     * <p>Gets the char code that is connected to the event.</p>
     * <p>Only valid for key-related events; check {@link #getType()} first.</p>
     * @return {Number} The char code
     */
    getCharCode: function() {
        return this.charCode;
    },

    /**
     * <p>Checks if the event is related to the Tab key.</p>
     * <p>For non key-related events, this will return false.</p>
     * @return {Boolean} true if the event is related to the Tab key
     */
    isTab: function() {
        throw new Error(
                "EditorEvent#isTab must be overridden by the extending class.");
    },

    /**
     * <p>Checks if the event is related to the Enter key.</p>
     * <p>For non key-related events, this will return false.</p>
     * @return {Boolean} true if the event is related to the Enter key
     */
    isEnter: function() {
        throw new Error(
                "EditorEvent#isEnter must be overridden by the extending class.");
    },

    /**
     * <p>Checks if the event is related to the Space key.</p>
     * <p>For non key-related events, this will return false.</p>
     * @return {Boolean} true if the event is related to the Space key
     */
    isSpace: function() {
        throw new Error(
                "EditorEvent#isSpace must be overridden by the extending class.");
    },

    /**
     * <p>Checks if the event is related to the Backspace key.</p>
     * <p>For non key-related events, this will return false.</p>
     * @return {Boolean} true if the event is related to the Backspace key
     */
    isBackSpace: function() {
        throw new Error(
                "EditorEvent#isBackSpace must be overridden by the extending class.");
    },

    /**
     * <p>Checks if the event is related to the Delete key.</p>
     * <p>For non key-related events, this will return false.</p>
     * @return {Boolean} true if the event is related to the Delete key
     */
    isDelete: function() {
        throw new Error(
                "EditorEvent#isDelete must be overridden by the extending class.");
    },

    /**
     * Determines if one of the Shift keys was held when the event originated.
     * @return {Boolean} True if one of the Shift keys was held
     */
    isShift: function() {
        return this.shiftKeyPressed;
    },

    /**
     * Determines if the Meta key was held when the event originated.
     * @return {Boolean} True if the Meta key was held
     */
    isMeta: function() {
        return this.metaKeyPressed;
    },

    /**
     * Determines if the Control key was held when the event originated.
     * @return {Boolean} True if the Control key was held
     */
    isCtrl: function() {
        return this.ctrlKeyPressed;
    },

    /**
     * <p>Determines the position of the mouse for the event.</p>
     * <p>Only valid for mouse-related events; check {@link #getType()} first.</p>
     * @return {Boolean} True if the Meta key was held
     */
    getPos: function() {
        return this.pos;
    },

    /**
     * <p>Determines the mouse's button state for the event.</p>
     * <p>Only valid for mouse-related events; check {@link #getType()} first.</p>
     * @return {Number} The mouse button held (0 for first/left mouse button)
     */
    getButton: function() {
        return this.button;
    },

    /**
     * Prevents the browser's default behaviour for this event.
     */
    preventDefault: function() {
        throw new Error(
                "EditorEvent#preventDefault must be overridden by the extending class.");
    },

    /**
     * Stops the propagation of the event to parent DOM elements.
     */
    stopPropagation: function() {
        throw new Error(
                "EditorEvent#stopPropagation must be overridden by the extending class.");
    },

    /**
     * Stops the event - shortcut for both preventing the browser's default behaviour and
     * bubbling up to parent elements.
     */
    stopEvent: function() {
        throw new Error(
                "EditorEvent#stopEvent must be overridden by the extending class.");
    }

});