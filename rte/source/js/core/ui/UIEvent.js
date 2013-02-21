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
 * <p>This class is used for UI-related events.</p>
 * <p>UI-related events are used for communication between the toolkit-specific
 * implementation and the editor core. For example, a dialog (toolkit-specific) fires
 * events when it is shown or hidden to inform the editor's core about such actions.
 * The editor core then dispatches the event to registered listeners - allowing
 * other plugins to react on events triggered by an originating plugin.</p>
 * @type CUI.rte.ui.UIEvent
 */
CUI.rte.ui.UIEvent = new Class({

    toString: "UIEvent",

    /**
     * The event type
     * @type String
     * @private
     */
    type: null,

    /**
     * The edit context for the event
     * @property editContext
     */
    editContext: null,

    /**
     * Creates a new UI-related event.
     * @param {String} type The event type
     * @param {CUI.rte.EditContext} editContext The edit context
     * @param {Object} params The parameters (content is dependent on the event type)
     */
    construct: function(type, editContext, params) {
        params = params || { };
        this.type = type;
        this.editContext = editContext;
        CUI.rte.Utils.apply(this, params);
    },

    /**
     * Returns the UI event's type.
     * @return {String} The event type
     */
    getType: function() {
        return this.type;
    }

});