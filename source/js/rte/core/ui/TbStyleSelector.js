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
 * @class CQ.form.rte.ui.TbStyleSelector
 * @extends CQ.form.rte.ui.TbElement
 * @private
 * This class represents a style selecting element for use in
 * {@link CQ.form.rte.ui.ToolbarBuilder}.
 */
CQ.form.rte.ui.TbStyleSelector = new Class({

    toString: "TbStyleSelector",

    extend: CQ.form.rte.ui.TbElement,

    styleSelector: null,

    styles: null,

    toolbar: null,

    _init: function(id, plugin, toggle, tooltip, css, cmdDef, styles) {
        this.inherited(arguments);
        this.styles = styles;
    },

    /**
     * Creates HTML code for rendering the options of the style selector.
     * @return {String} HTML code containing the options of the style selector
     * @private
     */
    createStyleOptions: function() {
        var htmlCode = "<option value=\"\">[None]</option>";
        if (this.styles) {
            var styleCnt = this.styles.length;
            for (var s = 0; s < styleCnt; s++) {
                var styleToAdd = this.styles[s];
                var className = styleToAdd.cssName;
                var text = styleToAdd.text;
                htmlCode += "<option value=\"" + className + "\" class=\"" + className
                    + "\">" + text + "</option>";
            }
        }
        return htmlCode;
    },

    getToolbar: function() {
        return CQ.form.rte.ui.ToolbarBuilder.STYLE_TOOLBAR;
    },

    initializeSelector: function() {
        // must be overridden by implementing classes
        throw new Error("TbStyleSelector#initializeSelector is not implemented.");
    },

    getSelectorDom: function() {
        // must be overridden by implementing classes
        throw new Error("TbStyleSelector#getSelectorDom is not implemented.");
    },

    getSelectedStyle: function() {
        // must be overridden by implementing classes
        throw new Error("TbStyleSelector#getSelectedStyle is not implemented.")
    },

    setRemoveDisabled: function(isDisabled) {
        // must be overridden by implementing classes
        throw new Error("TbStyleSelector#setRemoveDisabled is not implemented.");
    }

});