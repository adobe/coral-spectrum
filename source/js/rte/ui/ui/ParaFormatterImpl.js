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

CQ.form.rte.ui.cui.ParaFormatterImpl = new Class({

    toString: "ParaFormatterImpl",

    extend: CQ.form.rte.ui.TbParaFormatter,


    // Stuff -------------------------------------------------------------------------------

    notifyGroupBorder: function() {
        // do nothing
    },


    // Interface implementation ------------------------------------------------------------

    addToToolbar: function(toolbar) {
        this.toolbar = toolbar;
        // TODO implement for global toolbar
    },

    createFormatItems: function() {
        var items = [ ];
        var fmtCnt = this.formats.length;
        for (var f = 0; f < fmtCnt; f++) {
            var fmt = this.formats[f];
            items.push({
                "id": fmt.tag,
                "label": fmt.description,
                "value": fmt.tag
            });
        }
        return items;
    },

    createToolbarDef: function() {
        var tk = CQ.form.rte.ui.ToolkitRegistry.get("cui");
        this.dom = $CQ(document.createElement("span"));
        this.formatSelector = tk.createDropDown({
            "parent": this.dom,
            "width": '120px',
            "items": this.createFormatItems()
        });
        this.formatSelector.render();
        this.initializeSelector();
        return {
            "itemId": this.id,
            "dom": this.dom
        };
    },

    initializeSelector: function() {
        var self = this;
        this.formatSelector.on("change:value", function(evt) {
            var format = evt.newValue;
            if (format.length > 0) {
                self.plugin.execute(self.id)
            }
        });
    },

    selectFormat: function(formatToSelect, auxRoot, formatCnt, noFormatCnt) {
        // TODO consider other parameters (see Ext implementation)
        this.formatSelector.set("selectedItem", formatToSelect, true);
    },

    getSelectorDom: function() {
        return this.formatSelector[0];
    },

    getSelectedFormat: function() {
        return this.formatSelector.get("selectedItem");
    }

});
