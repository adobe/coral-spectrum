/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
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

(function($) {

    CUI.rte.ui.cui.ElementImpl = new Class({

        toString: "ElementImpl",

        extend: CUI.rte.ui.TbElement,

        dom: null,

        $ui: null,


        notifyGroupBorder: function(isFirst) {
            // TODO ...?
        },


        // Interface implementation ------------------------------------------------------------

        addToToolbar: function(toolbar) {
            var commandRef = this.plugin.pluginId + "#" + this.id;
            toolbar.push({
                "ref": commandRef,
                "plugin": this.plugin.pluginId,
                "command": this.id
            });
        },

        notifyToolbar: function(toolbar) {
            this.toolbar = toolbar;
            var pluginId = this.plugin.pluginId;
            var $cont = $(toolbar.getToolbarContainer());
            var self = this;
            this.$ui = $cont.find('button[data-action="' + pluginId + '#' + this.id + '"]');
            this.$ui.bind("click.rte.handler", function(e) {
                var editContext = self.plugin.editorKernel.getEditContext();
                editContext.setState("CUI.SelectionLock", 1);
                var cmd = (self.cmdDef ? self.cmdDef.cmd : self.id);
                var cmdValue = (self.cmdDef ? self.cmdDef.cmdValue : undefined);
                var env = {
                    "editContext": editContext
                };
                self.plugin.execute(cmd, cmdValue, env);
                self.plugin.editorKernel.enableFocusHandling();
                self.plugin.editorKernel.focus(editContext);
                e.stopPropagation();
            });
        },

        createToolbarDef: function() {
            return {
                "id": this.id,
                "element": this
            };
        },

        setDisabled: function(isDisabled) {
            if (isDisabled) {
                this.$ui.addClass(CUI.rte.Theme.TOOLBARITEM_DISABLED_CLASS);
            } else {
                this.$ui.removeClass(CUI.rte.Theme.TOOLBARITEM_DISABLED_CLASS);
            }
        },

        setSelected: function(isSelected, suppressEvent) {
            var com = CUI.rte.Common;
            this._isSelected = isSelected;
            if (isSelected) {
                this.$ui.addClass(CUI.rte.Theme.TOOLBARITEM_SELECTED_CLASS);
            } else {
                this.$ui.removeClass(CUI.rte.Theme.TOOLBARITEM_SELECTED_CLASS);
            }
            var pm = this.toolbar.getPopoverManager();
            var $trigger = pm.getTriggerForElement(this.$ui);
            if ($trigger.length) {
                var elements = pm.getElementsForTrigger($trigger);
                elements = (elements ? elements.elements : [ ]);
                var selected = [ ];
                var elementCnt = elements.length;
                for (var e = 0; e < elementCnt; e++) {
                    var $el = $(elements[e]);
                    if ($el.hasClass(CUI.rte.Theme.TOOLBARITEM_SELECTED_CLASS)) {
                        selected.push($el);
                    }
                }
                if (selected.length > 0) {
                    $trigger.addClass("items-selected");
                } else {
                    $trigger.removeClass("items-selected");
                }
                var baseIcon = $trigger.data("base-icon");
                if (baseIcon) {
                    var targetIcon = baseIcon;
                    if (selected.length === 1) {
                        var $sel = selected[0];
                        var classes = com.parseCSS($sel[0]);
                        for (var c = 0; c < classes.length; c++) {
                            if (com.strStartsWith(classes[c],
                                    CUI.rte.Theme.TOOLBARITEM_ICON_PREFIX)) {
                                targetIcon = classes[c];
                                break;
                            }
                        }
                    }
                    var currentIcon = $trigger.data("current-icon");
                    if (currentIcon !== targetIcon) {
                        if (currentIcon) {
                            $trigger.removeClass(currentIcon);
                        }
                        $trigger.addClass(targetIcon);
                        $trigger.data("current-icon", targetIcon);
                    }
                }
            }
        },

        isSelected: function() {
            return this._isSelected;
        },

        destroy: function() {
            this.$ui.off("click.rte.handler");
        }

    });

})(window.jQuery);