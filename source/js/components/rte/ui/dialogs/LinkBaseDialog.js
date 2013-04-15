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

    CUI.rte.ui.cui.LinkBaseDialog = new Class({

        extend: CUI.rte.ui.cui.AbstractDialog,

        toString: "LinkBaseDialog",

        getDataType: function() {
            return "link";
        },

        preprocessModel: function() {
            if (this.objToEdit && this.objToEdit.dom) {
                this.objToEdit.href = CUI.rte.HtmlRules.Links.getLinkHref(
                        this.objToEdit.dom);
                var com = CUI.rte.Common;
                var attribNames = com.getAttributeNames(this.objToEdit.dom, false,
                    function(dom, attribName, attribNameLC) {
                        // exclude href, rte_href & target from generic attribute handling,
                        // as they are handled explicitly and not generically
                        return attribNameLC == com.HREF_ATTRIB || attribNameLC == "href"
                                || attribNameLC == "target";
                    });
                for (var i = 0; i < attribNames.length; i++) {
                    var attribName = attribNames[i];
                    var value = com.getAttribute(this.objToEdit.dom, attribName);
                    if (typeof value !== 'undefined') {
                        this.objToEdit.attributes[attribName] = value;
                    }
                }
            }
        },

        dlgFromModel: function() {
            var hrefField = this.getFieldByType("href");
            if (hrefField) {
                var value = "";
                if (this.objToEdit) {
                    var href = this.objToEdit.href;
                    if (href) {
                        value = href;
                    }
                }
                hrefField.val(value);
            }
            var targetBlankField = this.getFieldByType("targetBlank");
            if (targetBlankField) {
                var target = (this.objToEdit && this.objToEdit.target
                        ? this.objToEdit.target.toLowerCase() : null);
                targetBlankField.val([ target == "_blank" ? "true" : "false" ]);
            }
        },

        validate: function() {
            var hrefField = this.getFieldByType("href");
            if (hrefField) {
                var href = hrefField.val();
                if (href && (href.length > 0)) {
                    return true;
                }
            }
            return false;
        },

        dlgToModel: function() {
            if (this.objToEdit) {
                var hrefField = this.getFieldByType("href");
                if (hrefField) {
                    var href = hrefField.val();
                    if (href) {
                        this.objToEdit.href = href;
                    }
                }
                var targetBlankField = this.getFieldByType("targetBlank");
                if (targetBlankField) {
                    var blankValue;
                    if (targetBlankField.is("input:radio")) {
                        blankValue = targetBlankField.filter(":checked").val();
                    } else {
                        blankValue = targetBlankField.val();
                    }
                    if (blankValue === "true") {
                        this.objToEdit.target = "_blank";
                    } else {
                        this.objToEdit.target = null;
                    }
                }
            }
        },

        postprocessModel: function() {
            var linkRules = this.getParameter("linkRules");
            if (linkRules) {
                linkRules.applyToObject(this.objToEdit);
            }
       }

    });


})(window.jQuery);