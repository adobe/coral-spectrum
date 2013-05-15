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

CUI.rte.Eventing = function($) {

    var handlerMap = [ ];

    var delayed = [ ];

    var Wrapper = new Class({

        construct: function($obj, eventName, handler, delay, scope, editContext) {
            this.$obj = $obj;
            this.eventName = eventName;
            this.handler = handler;
            this.delay = delay;
            this.scope = scope;
            this.editContext = editContext;
        },

        execute: function(jqEvent) {
            var evt = new CUI.rte.adapter.JQueryEvent(jqEvent, this.editContext);
            if (this.delay > 0) {
                for (var s = delayed.length - 1; s >= 0; s--) {
                    var toCheck = delayed[s];
                    if ((toCheck.obj = this.$obj) && (toCheck.evt == this.eventName) &&
                            (toCheck.handler == this.handler)) {
                        window.clearTimeout(toCheck.tid);
                        delayed.splice(s, 1);
                    }
                }
                var self = this;
                var task = function() {
                    self.handler.call(self.scope, evt);
                };
                var taskDef = {
                    "obj": this.$obj,
                    "evt": this.eventName,
                    "handler": this.handler
                };
                taskDef.tid = window.setTimeout(task, this.delay);
                delayed.push(taskDef);
            } else {
                this.handler.call(this.scope, evt);
            }
        }

    });


    return {

        on: function(editContext, obj, eventName, handler, scope, options) {
            var $obj = $(obj);
            options = options || { };
            var delay = (options.buffer ? options.buffer : 0);
            scope = scope || options.scope || $obj;
            var wrapper = new Wrapper($obj, eventName, handler, delay, scope, editContext);
            var fn = CUI.rte.Utils.scope(wrapper.execute, wrapper);
            handlerMap.push({
                "handler": handler,
                "wrapper": wrapper,
                "fn": fn
            });
            $obj.on(eventName, fn);
        },

        un: function(obj, eventName, handler, scope) {
            var fn = null;
            for (var e = 0; e < handlerMap.length; e++) {
                if (handlerMap[e].handler === handler) {
                    fn = handlerMap[e].fn;
                    handlerMap.splice(e, 1);
                    break;
                }
            }
            if (fn == null) {
                throw new Error(
                        "Unregistered handler provided for event '" + eventName + "'.");
            }
            $(obj).off(eventName, fn);
        }

    };

}(window.jQuery);