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
 * @class CUI.rte.SearchableDocument
 * @private
 * The RichText.SearchableDocument provides means to execute
 * a plaintext search on a HTML document or fragment.
 */
CUI.rte.SearchableDocument = new Class({

    toString: "SearchableDocument",

    plainText: null,

    plainTextLC: null,

    refs: null,

    findPos: 0,

    currentSearch: 0,

    config: null,

    /**
     * @private
     */
    createInternally: function(dom) {
        var com = CUI.rte.Common;
        if (dom.nodeType == 3) {
            var text = com.getNodeText(dom);
            if (text) {
                this.refs.push({
                    "textPos": this.plainText.length,
                    "charCnt": text.length,
                    "nodeRef": dom
                });
                this.plainText += text;
            }
        } else if (dom.nodeType == 1) {
            var addWhitespace =
                    (com.isTag(dom, CUI.rte.SearchableDocument.WHITESPACE_TAGS)
                    || com.isTag(dom, com.EDITBLOCK_TAGS))
                    && (!com.strEndsWith(this.plainText, " "));
            if ((this.plainText.length > 0) && addWhitespace) {
                this.refs.push({
                    "textPos": this.plainText.length,
                    "charCnt": 1,
                    "nodeRef": dom
                });
                this.plainText += " ";
            }
            var children = dom.childNodes;
            for (var i = 0; i < children.length; i++) {
                this.createInternally(children[i]);
            }
        }
    },

    create: function(dom) {
        this.plainText = "";
        this.refs = [ ];
        this.createInternally(dom);
        this.plainTextLC = this.plainText.toLowerCase();
    },

    getRefForPosition: function(textPos) {
        for (var i = 0; i < this.refs.length; i++) {
            var refToCheck = this.refs[i];
            if ((refToCheck.textPos >= textPos)
                    && ((refToCheck.textPos + refToCheck.charCnt) < textPos)) {
                return refToCheck;
            }
        }
        return null;
    },

    createMatch: function(textPos, charCnt) {
        var result = [ ];
        var endPosIncl = textPos + charCnt - 1;
        var refCnt = this.refs.length;
        for (var i = 0; i < refCnt; i++) {
            var ref = this.refs[i];
            var refEndPosIncl = ref.textPos + ref.charCnt - 1;
            if (((ref.textPos >= textPos) && (ref.textPos <= endPosIncl))
                || ((refEndPosIncl >= textPos) && (refEndPosIncl <= endPosIncl))
                || ((ref.textPos >= textPos) && (refEndPosIncl <= endPosIncl))
                || ((ref.textPos <= textPos) && (refEndPosIncl >= endPosIncl))) {
                result.push({
                    matchPos: textPos,
                    matchChars: charCnt,
                    nodePos: ref.textPos,
                    nodeCharCnt: ref.charCnt,
                    node: ref.nodeRef
                });
            } else {
                // as the array is sorted ascendingly, we are finished if we have already
                // found something and the current reference is not part of the result
                // (anymore)
                if (result.length > 0) {
                    return result;
                }
            }
        }
        return result;
    },

    getRefForNode: function(node) {
        for (var i = 0; i < this.refs.length; i++) {
            if (this.refs[i].nodeRef == node) {
                return this.refs[i];
            }
        }
        return null;
    },

    find: function(text, config) {
        this.config = config;
        this.currentSearch = text;
        this.findPos = config.startPos || 0;
        return this.findNext();
    },

    findNext: function() {
        var baseText = (this.config.ignoreCase ? this.plainTextLC : this.plainText);
        var pattern = (this.config.ignoreCase ? this.currentSearch.toLowerCase()
                : this.currentSearch);
        var textPos = baseText.indexOf(pattern, this.findPos);
        if (textPos < 0) {
            this.findPos = 0;
            return null;
        }
        this.findPos = textPos + pattern.length;
        return this.createMatch(textPos, pattern.length);
    },

    adjustToReplace: function(replaceText) {
        this.findPos += replaceText.length - this.currentSearch.length;
    },

    createDump: function() {
        var dump = "Searchable text:\n" + this.plainText + "\n\n";
        dump += "References:\n" + CUI.rte.Common.dumpObject(this.refs);
        return dump;
    }

});

/**
 * Array that defines tags that should be handled as whitespace when searching an HTML
 * text
 * @static
 * @final
 * @type String[]
 * @private
 */
CUI.rte.SearchableDocument.WHITESPACE_TAGS =  [ "br", "img" ];