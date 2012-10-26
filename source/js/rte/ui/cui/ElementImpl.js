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

CUI.rte.ui.cui.ElementImpl = new Class({

    toString: "ElementImpl",

    extend: CUI.rte.ui.TbElement,

    dom: null,


    // Helpers -----------------------------------------------------------------------------

    notifyToolbar: function(toolbar) {
        this.toolbar = toolbar;
    },

    notifyGroupBorder: function(isFirst) {
        var cls = (isFirst ? "CUI_Selector_firstButton" : "CUI_Selector_lastButton");
        this.dom.addClass(cls)
    },


    // Interface implementation ------------------------------------------------------------

    addToToolbar: function(toolbar) {
        this.notifyToolbar(toolbar);
        toolbar.add(this.createToolbarDef());
    },

    createToolbarDef: function() {
        this.dom = $(document.createElement("button"));
        this.dom.addClass("CUI_Selector_button");
        this.dom.attr("tabindex", "-1");
        this.dom.attr("type", "button");
        var self = this;
        this.dom.on("click", function() {
            var editContext = self.plugin.editorKernel.getEditContext();
            var cmd = (self.cmdDef ? self.cmdDef.cmd : self.id);
            var cmdValue = (self.cmdDef ? self.cmdDef.cmdValue : undefined);
            var env = {
                "editContext": editContext
            };
            self.plugin.execute(cmd, cmdValue, env);
        });
        var img = $(document.createElement("img"));
        var src = CUI.rte.Utils.processUrl(CUI.rte.Utils.BLANK_IMAGE_URL,
                CUI.rte.Utils.URL_IMAGE);
        img.attr("src", src);
        img.attr("style", "width: 16px; height: 16px;");
        img.addClass(this.css);
        this.dom.append(img);
        return {
            "itemId": this.id,
            "dom": this.dom
        };
    },

    setDisabled: function(isDisabled) {
        if (isDisabled) {
            if (!this.dom.hasClass("disabled")) {
                this.dom.addClass("disabled");
            }
        } else {
            if (this.dom.hasClass("disabled")) {
                this.dom.removeClass("disabled");
            }
        }
    },

    setSelected: function(isSelected, suppressEvent) {
        if (isSelected) {
            if (!this.dom.hasClass("down")) {
                this.dom.addClass("down");
            }
        } else {
            if (this.dom.hasClass("down")) {
                this.dom.removeClass("down");
            }
        }
    },

    isSelected: function() {
        return this.dom.hasClass("down");
    }

});