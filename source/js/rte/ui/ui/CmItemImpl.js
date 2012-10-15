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
 * @class CQ.form.rte.ui.cui.CmItemImpl
 * @private
 */
CQ.form.rte.ui.cui.CmItemImpl = new Class({

    toString: "CmItemImpl",

    extend: CQ.form.rte.ui.CmItem,

    /**
     * @cfg {Object} text Descriptive text for the context menu item
     */
    text: null,

    /**
     * @cfg {String} iconCls CSS class to be used for item's icon
     */
    iconCls: null,

    /**
     * @cfg {Function} handlerFn Custom handler function that is called when the context
     * menu item is invoked
     */
    handlerFn: null,

    /**
     * The selection context (contains selection definition + node list represented by the
     * selection).
     * @type Object
     * @private
     */
    selectionContext: null,

    /**
     * The edit context to be used
     * @type CQ.form.rte.EditContext
     * @private
     */
    editContext: null,

    /**
     * @private
     */
    defaultHandlerFn: null,

    /**
     * Array with sub items
     * @private
     * @type Array
     */
    subItems: null,

    construct: function(config) {
        this.subItems = [ ];
        if (config.subItems) {
            var subCnt = config.subItems.length;
            for (var i = 0; i < subCnt; i++) {
                this.subItems.push(new CQ.form.rte.ui.ext.CmItemImpl(config.subItems[i]));
            }
            delete config.subItems;
        }
        this.defaultHandlerFn = CQ.form.rte.Utils.scope(function(comp, evt) {
            evt.stopEvent();
            var envOptions = {
                "selectionContext": this.selectionContext,
                "editContext": this.editContext
            };
            if (this.editorKernel.contextMenuSavedRange) {
                envOptions.savedRange = this.editorKernel.contextMenuSavedRange;
            }
            // focus RTE before executing the command - otherwise IE chokes if CF is present
            // (see bug #32831)
            this.editorKernel.focus();
            this.editorKernel.isEventingDisabled = false;
            if (this.plugin && this.cmd) {
                this.plugin.execute(this.cmd, this.cmdValue, envOptions);
            }
        }, this);
        CQ.form.rte.Utils.apply(this, config);
    },

    build: function(items, editorKernel, editContext, selectionContext) {
        this.editorKernel = editorKernel;
        this.selectionContext = selectionContext;
        this.editContext = editContext;
        var subItemCnt = this.subItems.length;
        var children = [ ];
        for (var i = 0; i < subItemCnt; i++) {
            this.subItems[i].build(children, editorKernel, editContext, selectionContext);
        }
        items.push({
            "id": "_" + new Date().getTime() + "_" + parseInt(Math.random() * 10000),
            "label": this.text,
            "children": children,
            "onClick": this.handlerFn ? this.handlerFn : this.defaultHandlerFn,
            "disabled": this.disabled === true
        });
    }

});