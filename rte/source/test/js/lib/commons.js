CUI.rte.testing = { };

CUI.rte.testing.Commons = function() {

    var hpr = CUI.rte.HtmlProcessor;

    var _isStandalone = true;

    var TIMEOUT = 5000;

    var continueInformation = null;

    return {

        registerSection: function(id, name) {
            if (CUI.rte.DebugRegistry) {
                CUI.rte.DebugRegistry.registerSection(id, name);
            }
        },

        registerTest: function(section, name, testFn) {
            if (CUI.rte.DebugRegistry) {
                CUI.rte.DebugRegistry.registerTest(section, name, testFn);
            }
        },

        getRteInstance: function() {
            return window.CUI_rteInstance;
        },

        getDocument: function() {
            return window.document;
        },

        getRteFrame: function() {
            var tst = CUI.rte.testing.Commons;
            var rte = tst.getRteInstance();
            if (rte == null) {
                return null;
            }
            return rte.iframe;
        },

        getEditorKernel: function() {
            var tst = CUI.rte.testing.Commons;
            var rte = tst.getRteInstance();
            if (rte == null) {
                return null;
            }
            return rte.editorKernel;
        },

        getEditContext: function() {
            var tst = CUI.rte.testing.Commons;
            var editorKernel = tst.getEditorKernel();
            if (editorKernel == null) {
                return null;
            }
            return editorKernel.getEditContext();
        },

        createFakeEditContext: function(root) {
            return new CUI.rte.EditContext(null, window, document, root);
        },

        getRawEditorContent: function() {
            var tst = CUI.rte.testing.Commons;
            var context = tst.getEditContext();
            if (context == null) {
                return null;
            }
            return context.root.innerHTML;
        },

        removeUnwantedWhitespace: function(html, replaceWithSpace) {
            var replacement = "";
            if (replaceWithSpace === true) {
               replacement = " ";
            }
            html = CUI.rte.testing.Commons.removeAdditives(html);
            html = html.replace(/\n\r|\r\n/g, replacement);
            return html.replace(/[\n\r\t]/g, replacement);
        },

        removeAdditives: function(html) {
            if (CUI.rte.Common.ua.isWebKit) {
                html = html.replace(/<br _rte_wktemp_br="brEOB">/gi, "");
                html = html.replace(
                        /(<img src="img\/spacer\.png" _rte_a_name_repl=")(.*?)"(.*?>)/gi,
                        "<a name=\"$2\" class=\"cq-rte-anchor\"></a>");
            }
            return html;
        },

        removeDoubleSpaces: function(html) {
            return html.replace(/[ ]{2,}/g, " ");
        },

        isInstanceAvailable: function() {
            var tst = CUI.rte.testing.Commons;
            return (tst.getRteInstance() != null);
        },

        createDomFromHtml: function(html) {
            var tst = CUI.rte.testing.Commons;
            var doc = tst.getDocument();
            var parentSpan = doc.createElement("span");
            parentSpan.innerHTML = html;
            return parentSpan;
        },

        compareNode: function(node1, node2) {
            if (node1.nodeType != node2.nodeType) {
                return false;
            }
            if (node1.nodeType == 1) {
                var tag1 = node1.tagName;
                var tag2 = node2.tagName;
                if (tag1.toLowerCase() != tag2.toLowerCase()) {
                    return false;
                }
                var attribs1 = node1.attributes;
                var attribs2 = node2.attributes;
                if (attribs1.length != attribs2.length) {
                    return false;
                }
                for (var a = 0; a < attribs1.length; a++) {
                    var attr1 = attribs1.item(a);
                    var hasAttrib = false;
                    for (var a2 = 0; a < attribs2.length; a++) {
                        var attr2 = attribs2.item(a2);
                        if (attr1.name.toLowerCase() == attr2.name.toLowerCase()) {
                            if (attr1.value == attr2.value) {
                                hasAttrib = true;
                            }
                            break;
                        }
                    }
                    if (!hasAttrib) {
                        return false;
                    }
                }
                return true;
            }
            return node1.nodeValue == node2.nodeValue;
        },

        compareDoms: function(root1, root2, compareRoots) {
            var tst = CUI.rte.testing.Commons;
            if (compareRoots) {
                if (!tst.compareNode(root1, root2)) {
                    return false;
                }
            }
            if (root1.nodeType != root2.nodeType) {
                return false;
            }
            if (root1.nodeType == 1) {
                var children1 = root1.childNodes;
                var childCnt1 = children1.length;
                var children2 = root2.childNodes;
                var childCnt2 = children2.length;
                if (childCnt1 != childCnt2) {
                    return false;
                }
                for (var c = 0; c < childCnt1; c++) {
                    if (!tst.compareDoms(children1[c], children2[c], true)) {
                        return false;
                    }
                }
            }
            return true;
        },

        compareObjects: function(obj1, obj2, excludes) {
            var com = CUI.rte.Common;
            var tst = CUI.rte.testing.Commons;
            var key;
            if (typeof obj1 != typeof obj2) {
                return false;
            }
            if (typeof obj1 == "function") {
                // ignore functions
                return true;
            }
            if (typeof obj1 != "object") {
                return obj1 === obj2;
            }
            if (CUI.rte.Utils.isArray(obj1)) {
                if (!CUI.rte.Utils.isArray(obj2)) {
                    return false;
                }
                var cnt = obj1.length;
                if (obj2.length != cnt) {
                    return false;
                }
                for (var i = 0; i < cnt; i++) {
                    if (!tst.compareObjects(obj1[i], obj2[i], excludes)) {
                        return false;
                    }
                }
                return true;
            }
            // Object: test if each property of the first object exists in the second and
            // is equal
            for (key in obj1) {
                if (obj1.hasOwnProperty(key)) {
                    if (!obj2.hasOwnProperty(key)) {
                        return false;
                    }
                    if (!(excludes && com.arrayContains(excludes, key))) {
                        if (!tst.compareObjects(obj1[key], obj2[key], excludes)) {
                            return false;
                        }
                    }
                }
            }
            // the second object may contain properties the first one doesn't contain -
            // we'll have to check that separately
            for (key in obj2) {
                if (obj2.hasOwnProperty(key) && !obj1.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        },

        recreateThroughDom: function(html) {
            var tcm = CUI.rte.testing.Commons;
            var context = tcm.getEditContext();
            // just "phrasing" contact would be allowed in a span tag (http://www.whatwg.org/specs/web-apps/current-work/multipage/text-level-semantics.html#the-span-element)
            // so it's better to use a div
            var root = context.createElement("div");
            root.innerHTML = html;
            return root.innerHTML;
        },

        postProcessInnerHTML: function(html) {
            if (CUI.rte.Common.ua.isWebKit) {
                // Webkit adds a superfluos space at the end of the style attribute; remove
                // it to get consistent results
                html = html.replace(/(<[^\s][^>].*style=".*)( )(".*>.*)/gi, "$1$3");
            }
            return html;
        },

        getCurrentContent: function(context) {
            var html = context.root.innerHTML;
            if (CUI.rte.Common.ua.isIE8) {
                html = CUI.rte.testing.Commons.recreateThroughDom(html);
            }
            return html;
        },

        compareHTML: function(html1, html2, ignoreWhiteSpace, keepAdditives) {
            var tcm = CUI.rte.testing.Commons;
            if (!keepAdditives) {
                html1 = tcm.removeAdditives(html1);
                html2 = tcm.removeAdditives(html2);
            }
            var callback = {
                onTagStart: function(tagName, attribs) {
                    var keyArray = [ ];
                    for (var key in attribs) {
                        if (attribs.hasOwnProperty(key)) {
                            keyArray.push(key);
                        }
                    }
                    var attribCnt = keyArray.length;
                    if (attribCnt == 0) {
                        return null;
                    }
                    keyArray.sort();
                    var html = "<" + tagName;
                    for (var a = 0; a < attribCnt; a++) {
                        var attrib = attribs[keyArray[a]];
                        html += " " + attrib.name + "=\"" + attrib.value + "\"";
                    }
                    html += ">";
                    return html;
                }
            };
            var normalized1 = hpr.parseHtml(html1, callback);
            var normalized2 = hpr.parseHtml(html2, callback);
            if (ignoreWhiteSpace) {
                normalized1 = normalized1.replace(/[\n\r\t]/g, "");
                normalized2 = normalized2.replace(/[\n\r\t]/g, "");
            }
            return (normalized1 == normalized2);
        },

        isStandalone: function() {
            return _isStandalone;
        },

        notifyServerPresent: function() {
            this._isStandalone = false;
        },

        createDom: function(context, root, html) {
            var com = CUI.rte.Common;
            var nct = CUI.rte.HtmlSerializer.NON_CLOSING_TAGS;
            var processing = root;
            var callback = {
                onTagStart: function(tagName, attribs) {
                    var newItem = context.createElement(tagName);
                    for (var key in attribs) {
                        if (attribs.hasOwnProperty(key)) {
                            com.setAttribute(newItem, key, attribs[key].value);
                        }
                    }
                    processing.appendChild(newItem);
                    if (!com.arrayContains(nct, tagName)) {
                        processing = newItem;
                    }
                    return null;
                },
                onTagEnd: function(tagName) {
                    if (!com.arrayContains(nct, tagName)) {
                        processing = processing.parentNode;
                    }
                },
                onHtmlText: function(text) {
                    processing.appendChild(context.createTextNode(text));
                }
            };
            com.removeAllChildren(root);
            hpr.parseHtml(html, callback);
        },

        /**
         * @private
         */
        compareSubTree: function(dom1, dom2) {
            var com = CUI.rte.Common;
            if (dom1.nodeType != dom2.nodeType) {
                return false;
            }
            if (dom1.nodeType == 1) {
                if (dom1.tagName != dom2.tagName) {
                    return false;
                }
                var attribs1 = com.getAttributeNames(dom1, false);
                var attribs2 = com.getAttributeNames(dom2, false);
                if (attribs1.length != attribs2.length) {
                    return false;
                }
                var attribCnt = attribs1.length;
                for (var a = 0; a < attribCnt; a++) {
                    var attribName = attribs1[a];
                    var a2 = com.arrayIndex(attribs2, attribName);
                    if (a2 < 0) {
                        return false;
                    }
                    if (com.getAttribute(dom1, attribName)
                            != com.getAttribute(dom2, attribName)) {
                        return false;
                    }
                }
                var childCnt = dom1.childNodes.length;
                if (childCnt != dom2.childNodes.length) {
                    return false;
                }
                for (var c = 0; c < childCnt; c++) {
                    var child1 = dom1.childNodes[c];
                    var child2 = dom2.childNodes[c];
                    if (!CUI.rte.testing.Commons.compareSubTree(child1, child2)) {
                        return false;
                    }
                }
            } else if (dom1.nodeType == 3) {
                var value1 = dom1.nodeValue;
                var value2 = dom2.nodeValue;
                value1 = value1.replace(/[\n\r|\r\n]/gi, "\n");
                value2 = value2.replace(/[\n\r|\r\n]/gi, "\n");
                if (value1 != value2) {
                    return false;
                }
            }
            return true;
        },

        compareUsingDom: function(context, html1, html2) {
            var tcm = CUI.rte.testing.Commons;
            var root1 = context.createElement("span");
            tcm.createDom(context, root1, html1);
            var root2 = context.createElement("span");
            tcm.createDom(context, root2, html2);
            return tcm.compareSubTree(root1, root2);
        }

    };

}();

CUI.rte.testing.Commons.DomMockup = new Class({

    tagName: null,

    nodeType: 1,

    parentNode: null,

    childNodes: null,

    attributes: null,

    construct: function(tagName, attributes) {
        this.tagName = tagName;
        this.childNodes = [ ];
        this.attributes = attributes || { };
        // convert attributes to String if necessary
        for (var name in this.attributes) {
            if (this.attributes.hasOwnProperty(name)) {
                var value = this.attributes[name];
                if (typeof value != "string") {
                    this.attributes[name] = String(value);
                }
            }
        }
    },

    appendChild: function(child) {
        child.parentNode = this;
        this.childNodes.push(child);
        return this;
    },

    removeChild: function(nodeToRemove) {
        var childCnt = this.childNodes.length;
        for (var c = 0; c < childCnt; c++) {
            if (this.childNodes[c] === nodeToRemove) {
                nodeToRemove.parentNode = null;
                this.childNodes.splice(c, 1);
                break;
            }
        }
    },

    getAttribute: function(name) {
        name = name.toLowerCase();
        if (this.attributes.hasOwnProperty(name)) {
            return this.attributes[name];
        }
        return null;
    },

    setAttribute: function(name, value) {
        name = name.toLowerCase();
        if (typeof value != "string") {
            value = String(value);
        }
        this.attributes[name] = value;
    },

    removeAttribute: function(name) {
        name = name.toLowerCase();
        delete this.attributes[name];
    }

});

CUI.rte.testing.Commons.DomMockup.CMP_EXCLUDE = [ "parentNode" ];