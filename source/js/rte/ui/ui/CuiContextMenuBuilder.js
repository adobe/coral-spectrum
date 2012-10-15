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

CQ.form.rte.ui.cui.CuiContextMenuBuilder = new Class({

    toString: "CuiContextMenuBuilder",

    extend: CQ.form.rte.ui.ContextMenuBuilder,

    posContainer: null,

    visible: false,

    construct: function(editorKernel) {
        this.visible = false;
    },

    build: function(selectionContext, context) {
        var tk = CQ.form.rte.ui.ToolkitRegistry.get("cui");
        this.posContainer = $CQ(document.createElement("div"));
        this.posContainer.css("position", "absolute");
        this.posContainer.css("z-index", "15000");
        this.menu = this.menu = tk.createMenu({
            "parent": this.posContainer
        });
        var itemCnt = this.items.length;
        if (itemCnt == 0) {
            return null;
        }
        var items = [ ];
        for (var i = 0; i < itemCnt; i++) {
            var itemToBuild = this.items[i];
            itemToBuild.build(items, this.editorKernel, context, selectionContext);
        }
        this.menu.addItems(items);
        this.menu.render();
        return this.menu;
    },

    createItem: function(config) {
        return new CQ.form.rte.ui.cui.CmItemImpl(config);
    },

    createSeparator: function() {
        return new CQ.form.rte.ui.cui.CmSeparatorImpl();
    },

    showAt: function(x, y) {
        var parent = $CQ(document.body);
        this.posContainer.offset({
            "left": x,
            "top": y
        });
        parent.append(this.posContainer);
        this.menu.show();
        this.visible = true;
    },

    hideAll: function() {
        if (this.posContainer) {
            this.menu.hide();
            this.posContainer.remove();
            this.posContainer = null;
            this.visible = false;
        }
    },

    isVisible: function() {
        return (this.posContainer != null) && this.visible;
    }

});