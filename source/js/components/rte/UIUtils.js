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
                var $ui = $editable.data("rte-ui");
                if ($ui) {
                    return $ui;
                }
                var editableDom = $editable[0].previousSibling;
                while (editableDom && (editableDom.nodeType !== 1)) {
                    editableDom = editableDom.previousSibling;
                }
                if (!editableDom || !CUI.rte.Common.hasCSS(editableDom, "rte-ui")) {
                    return null;
                }
                return $(editableDom);
            },

            createOrGetUIContainer: function($editable) {
                var $container = CUI.rte.UIUtils.getUIContainer($editable);
                if (!$container) {
                    $container = $("<div class='rte-ui'></div>");
                    $editable.before($container);
                }
                return $container;
            },

            getToolbar: function($editableOrContainer, tbType) {
                tbType = tbType || "inline";
                var $container = $editableOrContainer.hasClass("rte-ui") ?
                        $editableOrContainer :
                        CUI.rte.UIUtils.getUIContainer($editableOrContainer);
                if (!$container || !$container.length) {
                    return null;
                }
                var $toolbar = $container.find(
                        "div[data-type=\"" + tbType + "\"] > div.rte-toolbar");
                if (!$toolbar || !$toolbar.length) {
                    return null;
                }
                return $toolbar;
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

            /**
             * Returns the specified UI "space". Creates it, if it is not yet available.
             * @param {String} mode The mode the UI space is used for
             * @param $container The UI container
             * @return {jQuery} The UI space
             */
            getSpace: function(mode, $container) {
                var $uiSpace = $container.find("> div[data-type=\"" + mode + "\"]");
                if (!$uiSpace.length) {
                    $uiSpace = $(CUI.rte.Templates["ui-space"]({
                        "mode": mode
                    }));
                    $container.append($uiSpace);
                }
                return $uiSpace;
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
            },

            /**
             * <p>Determines the "clipping parent" of the specified DOM object.</p>
             * <p>The clipping parent is a DOM object that might clip the visible area of
             * the specified DOM object by specifiying a suitable "overflow" attribute.</p>
             * @param {jQuery} $dom The jQuery-wrapped DOM object
             * @return {jQuery} The clipping parent as a jQuery object; undefined if no
             *         clipping parent exists
             */
            getClippingParent: function($dom) {
                var $clipParent = undefined;
                var $body = $(document.body);
                while ($dom[0] !== $body[0]) {
                    var ovf = $dom.css("overflow");
                    var ovfX = $dom.css("overflowX");
                    var ovfY = $dom.css("overflowY");
                    if ((ovfX !== "visible") || (ovfY !== "visible") || (ovf !== "visible")) {
                        $clipParent = $dom;
                        break;
                    }
                    $dom = $dom.parent();
                }
                return $clipParent;
            },

            getEditorOffsets: function(context) {
                var top = 0;
                var left = 0;
                var editorDoc = context.doc;
                while (editorDoc !== document) {
                    var win = CUI.rte.Common.getWindowForDocument(editorDoc);
                    if (win.frameElement) {
                        var offsets = $(win.frameElement).offset();
                        top += offsets.top;
                        left += offsets.left;
                    } else {
                        break;
                    }
                    editorDoc = win.frameElement.ownerDocument;
                }
                return {
                    "top": top,
                    "left": left
                };
            },

            isUnder: function($parent, $obj) {
                if (!$parent || ($parent.length === 0)) {
                    return false;
                }
                if (!$obj || ($obj.length === 0)) {
                    return false;
                }
                var obj = $parent[0];
                var toTest = $obj[0];
                while (toTest.tagName !== "BODY") {
                    if (toTest === obj) {
                        return true;
                    }
                    toTest = toTest.parentNode;
                }
                return false;
            }

        }

    }();

})(window.jQuery);