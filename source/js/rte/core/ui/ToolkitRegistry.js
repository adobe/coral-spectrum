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

CQ.form.rte.ui.ToolkitRegistry = function() {

    var toolkits = { };

    return {

        register: function(toolkitName, cls) {
            toolkits[toolkitName] = {
                "initialized": false,
                "obj": new cls()
            };
        },

        initialize: function(toolkitName, callback) {
            if (!toolkits.hasOwnProperty(toolkitName)) {
                throw new Error("No toolkit registered for type '" + toolkitName + "'");
            }
            var toolkitDef = toolkits[toolkitName];
            var toolkit = toolkitDef.obj;
            if (!toolkitDef.initialized && toolkit.requiresInit()) {
                toolkit.initialize(function() {
                    toolkitDef.initialized = true;
                    if (callback) {
                        callback(toolkit);
                    }
                });
            } else {
                if (callback) {
                    callback(toolkit);
                }
            }
        },

        get: function(toolkitName) {
            if (!toolkits.hasOwnProperty(toolkitName)) {
                throw new Error("No toolkit registered for type '" + toolkitName + "'");
            }
            var toolkitDef = toolkits[toolkitName];
            var toolkit = toolkitDef.obj;
            if (!toolkitDef.initialized) {
                if (toolkit.requiresInit()) {
                    throw new Error("Toolkit not yet initialized.");
                } else {
                    toolkitDef.initialized = true;
                }
            }
            return toolkitDef.obj;
        }

    };

}();