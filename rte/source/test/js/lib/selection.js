CUI.rte.testing.SelectionLib = function() {

    var tcm = CUI.rte.testing.Commons;
    var com = CUI.rte.Common;
    var dpr = CUI.rte.DomProcessor;
    var sel = CUI.rte.Selection;

    var getSelection = function() {
        var context = tcm.getEditContext();
        if (CUI.rte.Common.ua.isOldIE) {
            return context.doc.selection;
        }
        return context.win.getSelection();
    };

    var createRange = function() {
        var context = tcm.getEditContext();
        if (com.ua.isOldIE) {
            return context.doc.body.createTextRange();
        }
        return context.doc.createRange();
    };

    var getLeadRange = function(sel) {
        if (!sel) {
            sel = getSelection();
        }
        if (com.ua.isOldIE) {
            return sel.createRange();
        }
        return sel.getRangeAt(0);
    };

    var selectRange = function(range) {
        if (com.ua.isOldIE) {
            range.select();
            return;
        }
        var sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    };

    return {

        /**
         * Move caret to the end of a text (EOT).
         */

        selectEOT: function() {
            var range = createRange();
            var context = tcm.getEditContext();
            if (com.ua.isOldIE) {
                var editBlocks = dpr.getEditBlocks(context.root);
                if (editBlocks.length > 0) {
                    var lastBlock = editBlocks[editBlocks.length - 1];
                    if (!com.getLastTextChild(lastBlock, true)) {
                        range.moveToElementText(lastBlock);
                        range.collapse(false);
                        selectRange(range);
                        return;
                    }
                }
                var lastTextChild = com.getLastTextChild(context.root, true);
                range.moveToElementText(lastTextChild.parentNode);
                range.collapse(false);
                selectRange(range);
                return;
            }
            var children = context.root.childNodes;
            if (children.length > 0) {
                var blockToSelect = children[children.length - 1];
                if (blockToSelect.nodeType == 3) {
                    range.selectNodeContents(blockToSelect);
                    range.collapse(false);
                } else {
                    var lastTextNode = com.getLastTextChild(blockToSelect, true);
                    if (lastTextNode) {
                        range.setStartAfter(lastTextNode);
                        range.setEndAfter(lastTextNode);
                    } else {
                        // IE 9 - empty block
                        range.selectNodeContents(blockToSelect);
                    }
                }
            } else {
                range.selectNodeContents(context.root);
                range.collapse(false);
            }
            selectRange(range);
        },

        /**
         * Get the (HTML) content of the current selection.
         * @return {String} HTML content of the current selection
         */
        getSelectionContents: function() {
            var range = getLeadRange();
            if (com.ua.isOldIE) {
                return range.htmlText;
            }
            var domFrag = range.cloneContents();
            var context = tcm.getEditContext();
            // just "phrasing" contact would be allowed in a span tag (http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-span-element)
            // so it's better to use a div
            var div = context.createElement("div");
            div.appendChild(domFrag);
            return div.innerHTML;
        },

        /**
         * Creates a marker span that is used for detecting if the caret has been set to
         * the correct place.
         */
        insertMarker: function() {
            var tsl = CUI.rte.testing.SelectionLib;
            var context = tcm.getEditContext();
            var range = getLeadRange();
            if (com.ua.isOldIE) {
                range.pasteHTML(tsl.INSERT_MARKER_HTML);
                return context.doc.getElementById("cqInsertMarker");
            }
            var span = context.createElement("span");
            span.id = "cqInsertMarker";
            range.deleteContents();
            // Webkit auto-"corrects" ranges that point to the first character node after a
            // link (@offset 0) to point directly after the link, so we'll insert the marker
            // span manually in this case
            if (com.ua.isWebKit) {
                var rgNode = range.startContainer;
                var rgOffset = range.startOffset;
                var parent = rgNode.parentNode;
                if (com.isTag(parent, "a")
                        && (rgNode.nodeType == 3)
                        && (rgNode.nodeValue.length == rgOffset)) {
                    com.insertBefore(parent.parentNode, span, parent.nextSibling);
                } else {
                    range.insertNode(span);
                }
            } else {
                range.insertNode(span);
            }
            // Gecko may insert an additional empty text node at the end of a block
            // when the span is inserted
            var nextNode = span.nextSibling;
            if (nextNode && (nextNode.nodeType == 3)) {
                if (com.getNodeCharacterCnt(nextNode) == 0) {
                    nextNode.parentNode.removeChild(nextNode);
                }
            }
            return span;
        },

        /**
         * Checks if the specified node definitions are exchangeable. For example:
         * abc |<b>def</b> is exchangeable with abc <b>|def</b>, as they specify the same
         * position (at least in cases where we don't need to cope with that small
         * difference).
         */
        isExchangeable: function(context, node1, offset1, node2, offset2, isSelEnd) {
            var prev1, prev2;
            if (node1 == node2) {
                // Gecko/Webkit issue: |br <-> br|
                if (!com.ua.isIE) {
                    if (com.isTag(node1, "br")) {
                        if (((offset1 == null) && (offset2 == 0))
                                || ((offset1 == 0) && (offset2 == null))) {
                            return true;
                        }
                    }
                }
                return (offset1 == offset2);
            }
            // Gecko issue: empty paragraph handling (<p><br>|</p><p>Text <->
            // <p><br></p>|<p>Text
            if (!com.ua.isIE) {
                if (com.isTag(node1, "p") && (offset1 == null)) {
                    var n1Children = node1.childNodes;
                    if ((n1Children.length == 1) && com.isTag(n1Children[0], "br")) {
                        var nextSibling1 = node1.nextSibling;
                        if (nextSibling1) {
                            var nextSibTextChild1 = com.getFirstTextChild(nextSibling1,
                                    true);
                            if (nextSibTextChild1 == node2) {
                                return true;
                            }
                        }
                    }
                }
                if (com.isTag(node2, "p") && (offset2 == null)) {
                    var n2Children = node2.childNodes;
                    if ((n2Children.length == 1) && com.isTag(n2Children[0], "br")) {
                        var nextSibling2 = node2.nextSibling;
                        if (nextSibling2) {
                            var nextSibTextChild2 = com.getFirstTextChild(nextSibling2,
                                    true);
                            if (nextSibTextChild2 == node1) {
                                return true;
                            }
                        }
                    }
                }
            }
            // Webkit issue: <p>|<br></p> <-> <p><br>|</p> (the br is not visible in any way
            // and simply ignored by Webkit if at the end of an edit block
            if (com.ua.isWebKit) {
                if (com.isTag(node1, "br") && (offset1 == null)) {
                    if ((offset2 == null) && (com.getLastChild(node2) == node1)) {
                        return true;
                    }
                }
            }
            var useNestedListExchange = com.ua.isOldIE
                    || (((com.ua.isIE && !com.ua.isOldIE) || com.ua.isGecko
                        || com.ua.isWebKit)
                    && isSelEnd);
            if (useNestedListExchange) {
                // <li>Item|<ul><li>Item</li></ul></li> <-> <li>Item<ul><li>|Item</li></ul>
                // </li> (required for different reasons for both browsers ...)
                var block1 = com.getBlockNode(context, node1);
                var block2 = com.getBlockNode(context, node2);
                // only exchangeable if we're in the same root list, but in different
                // nested lists
                if ((block1 == block2) && com.isTag(block1, [ "ol", "ul" ])) {
                    var list1 = com.getTagInPath(context, node1, [ "ol", "ul"]);
                    var list2 = com.getTagInPath(context, node2, [ "ol", "ul"]);
                    if (list1 != list2) {
                        prev2 = com.getPreviousCharacterNode(context, node2);
                        if (prev2 && (prev2 == node1) && (offset2 == 0)) {
                            if (com.getNodeCharacterCnt(prev2) == offset1) {
                                return true;
                            }
                        }
                        prev1 = com.getPreviousCharacterNode(context, node1);
                        if (prev1 && (prev1 == node2) && (offset1 == 0)) {
                            if (com.getNodeCharacterCnt(prev1) == offset2) {
                                return true;
                            }
                        }
                    }
                }
            }
            if ((node1 == null) || (node2 == null)) {
                return false;
            }
            // check EOB cases (p|h1|.../undefined <-> <lastCharNode>/<lastCharOffset>)
            var lastTextNode, lastOffset;
            if (com.isTag(node1, com.EDITBLOCK_TAGS) && (offset1 == null)) {
                lastTextNode = com.getLastTextChild(node1, true);
                if (lastTextNode == node2) {
                    lastOffset = sel.getLastSelectionOffset(context, lastTextNode,  false);
                    if (offset2 == lastOffset) {
                        return true;
                    }
                }
            }
            if (com.isTag(node2, com.EDITBLOCK_TAGS) && (offset2 == null)) {
                lastTextNode = com.getLastTextChild(node2, true);
                lastOffset = sel.getLastSelectionOffset(context, lastTextNode, false);
                if (lastTextNode == node1) {
                    if (offset1 == lastOffset) {
                        return true;
                    }
                }
            }
            // check cases: abc |<b>def</b> <-> abc <b>|def
            prev2 = com.getPreviousCharacterNode(context, node2, com.EDITBLOCK_TAGS);
            if (prev2  && (prev2 == node1)) {
                var expOffs2 = sel.getFirstSelectionOffset(context, node2);
                if (node1.nodeType == 1) {
                    return (offset1 == 0) && (offset2 == expOffs2);
                }
                return (offset1 == com.getNodeCharacterCnt(node1)) && (offset2 == expOffs2);
            }
            prev1 = com.getPreviousCharacterNode(context, node1, com.EDITBLOCK_TAGS);
            if (prev1 && (prev1 == node2)) {
                var expOffs1 = sel.getFirstSelectionOffset(context, node1);
                if (node2.nodeType == 1) {
                    return (offset2 == 0) && (offset1 == expOffs1);
                }
                return (offset2 == com.getNodeCharacterCnt(node2)) && (offset1 == expOffs1);
            }
            return false;
        },

        INSERT_MARKER_HTML: "<span id=\"cqInsertMarker\"></span>",

        /**
         * Converts HTML to plain text by removing most tags and converting several
         * tags into characters. "br" is converted to \n; "a name" is converted to # and
         * "img" is converted to $.
         */
        toPlainText: function(html) {
            var hpr = CUI.rte.HtmlProcessor;
            return hpr.parseHtml(html, {

                "onTagStart": function(tagName, attribs) {
                    switch (tagName) {
                        case "br":
                            return "\n";
                        case "img":
                            if (attribs.hasOwnProperty(com.A_NAME_REPLACEMENT_ATTRIB)) {
                                return "#";
                            }
                            return "$";
                        case "a":
                            if (attribs.hasOwnProperty("name")) {
                                return "#";
                            }
                            break;
                    }
                    return "";
                },

                "onTagEnd": function(tagName) {
                    return "";
                },

                "onHtmlText": function(html) {
                    return html.replace(/[\n\r\t]/g, "");
                }

            });
        }

    };
}();