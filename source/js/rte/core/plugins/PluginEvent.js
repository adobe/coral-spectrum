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
 * <p>This class is used for dispatching plugin-related events, mostly used for
 * communications between editor core and plugins.</p>
 * <p>For example, a widget implementation (such as CUI.rte.RichText) may request
 * the source view from a "suitable" plugin (= a plugin that feels resposible for
 * the respective event type) by sending a "sourceedit" event.
 * @class CUI.rte.plugins.PluginEvent
 */
CUI.rte.plugins.PluginEvent = new Class({

    toString: "PluginEvent",

    /**
     * @private
     */
    type: null,

    /**
     * @property editContext
     */
    editContext: null,

    construct: function(type, editContext, params) {
        params = params || { };
        this.type = type;
        this.editContext = editContext;
        CUI.rte.Utils.apply(this, params);
    },

    getType: function() {
        return this.type;
    }

});