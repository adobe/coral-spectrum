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

    CUI.rte.UIUtils = function() {

        return {

            addStyleSheet: function(cssToAdd, doc) {
                doc = doc || document;
                if (!CUI.rte.Utils.isArray(cssToAdd)) {
                    cssToAdd = [ cssToAdd ];
                }
                var headEl = doc.getElementsByTagName("head")[0];
                var styleSheet = doc.createElement("style");
                styleSheet.type = 'text/css';
                headEl.appendChild(styleSheet);
                var cssText = "";
                var cssCnt = cssToAdd.length;
                for (var c = 0; c < cssCnt; c++) {
                    var css = cssToAdd[c];
                    cssText += css[".name"] + " {\n";
                    for (var key in css) {
                        if (css.hasOwnProperty(key) && (key !== ".name")) {
                            cssText += "    " + key + ": " + css[key] + ";\n";
                        }
                    }
                    cssText += "}\n\n";
                }
                styleSheet.innerHTML = cssText;
                return styleSheet;
            },

            removeStyleSheet: function(styleSheet) {
                styleSheet.parentNode.removeChild(styleSheet);
            },

            getUIContainer: function($editable) {
                var editableDom = $editable[0].previousSibling;
                while (editableDom && (editableDom.nodeType !== 1)) {
                    editableDom = editableDom.previousSibling;
                }
                if (!editableDom || !CUI.rte.Common.hasCSS(editableDom, "rte-ui")) {
                    return null;
                }
                return $(editableDom);
            },

            getToolbar: function($editableOrContainer, tbType) {
                tbType = tbType || "inline";
                var $container = $editableOrContainer.hasClass("rte-ui") ?
                        $editableOrContainer :
                        CUI.rte.UIUtils.getUIContainer($editableOrContainer);
                if (!$container || !$container.length) {
                    return null;
                }
                return $container.find(
                        "div[data-type=\"" + tbType + "\"] > div.rte-toolbar");
            },

            getPopover: function(ref, tbType, $container) {
                tbType = tbType || "inline";
                return $container.find("div[data-type=\"" + tbType + "\"] > " +
                        "div[data-popover=\"" + ref + "\"]");
            },

            getPopoverTrigger: function(ref, tbType, $containerOrToolbar) {
                tbType = tbType || "inline";
                var $toolbar = ($containerOrToolbar.hasClass("rte-toolbar") ?
                        $containerOrToolbar :
                        CUI.rte.UIUtils.getToolbar($containerOrToolbar, tbType));
                return $toolbar.find("button[data-action=\"" + ref + "\"]")
            },

            getElement: function(ref, tbType, $container) {
                tbType = tbType || "inline";
                return $container.find("div[data-type=\"" + tbType + "\"] " +
                        "button[data-action=\"" + ref + "\"]");
            },

            getDialog: function(ref, tbType, $container) {
                tbType = tbType || "inline";
                var $dialog = $container.find("div[data-type=\"" + tbType + "\"] > " +
                        "div[data-rte-dialog=\"" + ref + "\"]");
                if (($dialog.length === 0) && (tbType !== "global")) {
                    $dialog = $container.find("div[data-type=\"global\"] > " +
                        "div[data-rte-dialog=\"" + ref + "\"]");
                }
                return $dialog;
            },

            determineIconClass: function(element) {
                var com = CUI.rte.Common;
                var classes = com.parseCSS(element.jquery ? element[0] : element);
                for (var c = 0; c < classes.length; c++) {
                    if (com.strStartsWith(classes[c],
                            CUI.rte.Theme.TOOLBARITEM_ICON_PREFIX)) {
                        return classes[c];
                    }
                }
                return undefined;
            },

            killEvent: function(e) {
                e.stopPropagation();
                e.preventDefault();
            }

        }

    }();

})(window.jQuery);