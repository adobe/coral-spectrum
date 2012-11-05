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

CUI.rte.Eventing = function() {

    var handlerMap = [ ];

    return {

        on: function(editContext, obj, eventName, handler, scope, options) {
            var wrapper = function(extEvent) {
                var evt = new CUI.rte.adapter.ExtEvent(extEvent, editContext);
                handler.call(this, evt);
            };
            handlerMap.push({
                "handler": handler,
                "wrapper": wrapper
            });
            CQ.Ext.EventManager.on(obj, eventName, wrapper, scope, options);
        },

        un: function(obj, eventName, handler, scope) {
            var wrapper = null;
            for (var e = 0; e < handlerMap.length; e++) {
                if (handlerMap[e].handler === handler) {
                    wrapper = handlerMap[e].wrapper;
                    handlerMap.splice(e, 1);
                    break;
                }
            }
            if (wrapper == null) {
                throw new Error("Unregistered handler provided.");
            }
            CQ.Ext.EventManager.un(obj, eventName, wrapper, scope);
        }

    };

}();