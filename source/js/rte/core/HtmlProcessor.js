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
 * @class CQ.form.rte.HtmlProcessor
 * @static
 * @private
 * <p>The RichText.HtmlProcessor provides the means to process HTML based on its String
 * representation. It contains an HTML parser + several helper methods.</p>
 * <p><b>Caution:</b> String-based processing is a performance bottleneck on IE &lt; 8, so
 * if you plan to process large chunks of HTML, you should better use DOM-based processing
 * instead.</p>
 */
CQ.form.rte.HtmlProcessor = function() {

    return {

        // Helpers -------------------------------------------------------------------------

        /**
         * Does a simple String replacement.
         * @param {String} text The source text
         * @param {Number} startPos The first character to be replaced
         * @param {Number} endPosIncl The last character (inclusive) to be replaced
         * @param {String} replacement The replacement
         * @return {String} The result of the replacement
         */
        replace: function(text, startPos, endPosIncl, replacement) {
            return CQ.form.rte.Common.strReplace(text, startPos, endPosIncl, replacement);
        },

        isBlockTag: function(tagName) {
            var tags = CQ.form.rte.Common.BLOCK_TAGS;
            var tagNameLC = tagName.toLowerCase();
            var tagCnt = tags.length;
            for (var tagIndex = 0; tagIndex < tagCnt; tagIndex++) {
                if (tags[tagIndex] == tagNameLC) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Skips whitespace in the given String (if applicable).
         * @param {String} str The String to be processed
         * @param {Number} pos Position from where to skip whitespaces
         * @return {Number} Position of next non-whitespace character; -1 if no more
         *         (non-whitespace) characters were found
         */
        skipWhitespace: function(str, pos) {
            while ((pos < str.length) && (str.charCodeAt(pos) <= 32)) {
                pos++;
            }
            if (pos >= str.length) {
                return -1;
            }
            return pos;
        },

        /**
         * Strips surrounding whitespace from the given string.
         * @param {String} text The String for which the whitespace should be stripped
         * @return {String} The String, without surrounding whitespace
         * @type String
         */
        stripSurroundingWhitespace: function(text, excludeSpace) {
            var spaceIndex = 0;
            var lastValidChar = (excludeSpace ? 31 : 32);
            while (spaceIndex < text.length) {
                if (text.charCodeAt(spaceIndex) > lastValidChar) {
                    break;
                }
                spaceIndex++;
            }
            if (spaceIndex < text.length) {
                text = text.substring(spaceIndex, text.length);
            } else {
                text = "";
            }
            spaceIndex = text.length;
            while (spaceIndex > 0) {
                spaceIndex--;
                if (text.charCodeAt(spaceIndex) >= lastValidChar) {
                    break;
                }
            }
            if (spaceIndex >= 0) {
                text = text.substring(0, spaceIndex + 1);
            } else {
                text = "";
            }
            return text;
        },

        /**
         * Removes trailing characters.
         * @param {String} text The text to remove trailing characters from
         * @param {String} chars The characters to be removed
         * @return {String} The processed text
         */
        removeTrailingChars: function(text, chars) {
            var pos = text.length - 1;
            while (pos > 0) {
                if (chars.indexOf(text.charAt(pos)) < 0) {
                    return text.substring(0, pos + 1);
                }
                pos--;
            }
            return "";
        },


        // Parsing -------------------------------------------------------------------------

        /**
         * <p>Parses the String representation of a tag into an object representation that
         * is much easier to process.</p>
         * <p>The object representation has the following properties:</p>
         * <ul>
         *   <li><code>tagName</code> : String<br>
         *     The name of the tag (lower case)</li>
         *   <li><code>attributes</code> : Object<br>
         *     A table representing the attributes of the tag; each object has the following
         *     properties:
         *     <ul>
         *       <li><code>name</code> : String<br>
         *         The name of the attribute (lower case).</li>
         *       <li><code>value</code> : String<br>
         *         The value of the attribute</li>
         *       <li><code>quoted</code> : Boolean<br>
         *         True if the attribute value is surrounded by quotation marks (IE loves to
         *         not quote simple attribute values)</li>
         *       <li><code>pos</code> : Number<br>
         *         The position where the attribute starts (relative to <code>tagStr</code>)
         *         </li>
         *       <li><code>cnt</code> : Number<br>
         *         Number of characters the attribute takes</li>
         *     </ul>
         *   </li>
         *   <li><code>isShortTag</code> : Boolean<br>
         *     True if the tag is a "short tag", i.e. &lt;br /&gt;</li>
         * </ul>
         * @param {String} tagStr The String, representing the tag (for example: &lt;a
         *        href="/path/to/page"&gt;)
         * @return {Object} An object representation of the tag String
         */
        parseTag: function(tagStr) {
            var hpr = CQ.form.rte.HtmlProcessor;
            // some preparations ...
            tagStr = tagStr.replace(/\r\n/g, " ");
            tagStr = tagStr.replace(/[\r\n\t]/g, " ");
            var tagDef = {
                tagName: null,
                attributes: { }
            };
            if (tagStr.length < 3) {
                return tagDef;
            }
            // parse tag
            var firstChar = hpr.skipWhitespace(tagStr, 0);
            if (firstChar < 0) {
                return tagDef;
            }
            if (tagStr.charAt(firstChar) != "<") {
                return tagDef;
            }
            var closingBrace = tagStr.lastIndexOf(">");
            if (closingBrace <= firstChar) {
                return tagDef;
            }
            if (closingBrace > 0) {
                // exclude "/" of tag shortform (<br/>) from parsing if necessary
                if (tagStr.charAt(closingBrace - 1) == '/') {
                    closingBrace--;
                    tagDef.isShortTag = true;
                }
            }
            var tagEnd = tagStr.indexOf(" ", firstChar);
            if (tagEnd < 0) {
                // tag only, no attributes
                tagDef.tagName =
                        tagStr.substring(firstChar + 1, closingBrace).toLowerCase();
                return tagDef;
            }
            tagDef.tagName = tagStr.substring(firstChar + 1, tagEnd).toLowerCase();
            // handle attributes
            var processPos = tagEnd;
            while (true) {
                if (processPos >= closingBrace) {
                    return tagDef;
                }
                processPos = hpr.skipWhitespace(tagStr, processPos);
                if (processPos < 0) {
                    return tagDef;
                }
                var attribSepPos = tagStr.indexOf("=", processPos);
                // IE issue: ismap="ismap" gets reduced to ismap
                var shortAttrib = null;
                var spaceSepPos = tagStr.indexOf(" ", processPos);
                if ((spaceSepPos >= 0)
                        && ((spaceSepPos < attribSepPos) || attribSepPos < 0)) {
                    // consider superfluous whitespace (width = "200")
                    var endSpacePos = hpr.skipWhitespace(tagStr, spaceSepPos);
                    if (endSpacePos != attribSepPos) {
                        shortAttrib = tagStr.substring(processPos, spaceSepPos);
                        processPos = endSpacePos;
                    }
                } else if (attribSepPos < 0) {
                    // handle short attrib at end of tag (<img src="..." ismap>)
                    if (processPos < (tagStr.length - 1)) {
                        shortAttrib = tagStr.substring(processPos, tagStr.length);
                        // remove closing ">" and superflous whitespace
                        shortAttrib = hpr.removeTrailingChars(shortAttrib, " >");
                    }
                    processPos = tagStr.length;
                }
                var attributeName;
                if (shortAttrib != null) {
                    attributeName = shortAttrib.toLowerCase();
                    tagDef.attributes[attributeName] = {
                        "name": attributeName,
                        "originalName": shortAttrib,
                        "shortAttrib": true,
                        "quoted": false
                    };
                } else {
                    if (attribSepPos < 0) {
                        return tagDef;
                    }
                    var originalAttributeName = tagStr.substring(processPos, attribSepPos);
                    originalAttributeName = hpr.removeTrailingChars(originalAttributeName,
                            " ");
                    attributeName = originalAttributeName.toLowerCase();
                    attribSepPos = hpr.skipWhitespace(tagStr, attribSepPos + 1);
                    var spacePos = tagStr.indexOf(" ", attribSepPos);
                    var quotChar = "\"";
                    var quotPos = tagStr.indexOf("\"", attribSepPos);
                    var aposPos = tagStr.indexOf("'", attribSepPos);
                    var attributeValue;
                    var valueStartIndex = -1;
                    var valueCharCnt = -1;
                    var isQuotedValue = true;
                    if (quotPos > closingBrace) {
                        quotPos = -1;
                    }
                    if (aposPos > closingBrace) {
                        aposPos = -1;
                    }
                    if (spacePos > closingBrace) {
                        spacePos = -1;
                    }
                    // "browsers do such things", chapter 12789: IE uses ' if attribute values
                    // contain "
                    if (aposPos >= 0) {
                        if ((aposPos < quotPos) || (quotPos < 0)) {
                            quotPos = aposPos;
                            quotChar = "'";
                        }
                    }
                    if ((quotPos >= 0) && ((quotPos < spacePos) || (spacePos < 0))) {
                        var endQuotPos = tagStr.indexOf(quotChar, quotPos + 1);
                        if (endQuotPos < 0) {
                            // error - return what has already been parsed
                            return tagDef;
                        }
                        attributeValue = tagStr.substring(quotPos + 1, endQuotPos);
                        valueStartIndex = quotPos + 1;
                        valueCharCnt = (endQuotPos - (quotPos + 1));
                        processPos = endQuotPos + 1;
                    } else {
                        var lastCharPos = (spacePos >= 0 ? spacePos : closingBrace);
                        // attribute value without quotation marks - IE likes to do such
                        // things
                        attributeValue = tagStr.substring(attribSepPos, lastCharPos);
                        isQuotedValue = false;
                        valueStartIndex = attribSepPos;
                        valueCharCnt = (lastCharPos - attribSepPos);
                        processPos = lastCharPos + 1;
                    }
                    tagDef.attributes[attributeName] = {
                        "name": attributeName,
                        "originalName": originalAttributeName,
                        "value": attributeValue,
                        "pos": valueStartIndex,
                        "cnt": valueCharCnt,
                        "shortAttrib": false,
                        "quoted": isQuotedValue
                    };
                }
            }
        },

        /**
         * Parses the String representation of a CSS style definition into an object
         * representation that is much easier to process.
         * @param {String} styleStr The style definition to parse (for example: font-family:
         *                          Arial; font-weight: bold)
         * @return {Object} A table that contains the parsed style definition (for example:
         *         <code>{ "font-family": "Arial", "font-weight:", "bold" }</code>)
         * @type Object
         */
        parseStyleDef: function(styleStr) {
            styleStr = CQ.form.rte.Utils.htmlDecode(styleStr);
            var processPos = 0;
            var styleDef = { };
            while (true) {
                processPos =
                        CQ.form.rte.HtmlProcessor.skipWhitespace(styleStr, processPos);
                if (processPos < 0) {
                    return styleDef;
                }
                var sepPos = styleStr.indexOf(":", processPos + 1);
                var styleName = styleStr.substring(processPos, sepPos);
                styleName = CQ.form.rte.HtmlProcessor
                            .stripSurroundingWhitespace(styleName);
                if (styleName.length == 0) {
                    return styleDef;
                }
                var defEndPos = styleStr.indexOf(";", sepPos + 1);
                if (defEndPos < 0) {
                    defEndPos = styleStr.length;
                }
                var styleCode = styleStr.substring(sepPos + 1, defEndPos);
                styleCode = CQ.form.rte.HtmlProcessor
                        .stripSurroundingWhitespace(styleCode);
                styleDef[styleName] = styleCode;
                processPos = defEndPos + 1;
            }
        },

        /**
         * <p>Handles the callback for HTML text for <code>parseHtml()</code>.</p>
         * @private
         * @param {String} htmlStr HTML string that is currently being parsed
         * @param {Object} callback callback object
         * @param {Number} startPos position of first character
         * @param {Number} endPos position of last character (exclusive)
         * @return {Object} object containing a <code>html</code> property that contains the
         *         replaced text and a <code>delta</code> property that contains the
         *         positioning delta
         */
        handleHtmlText: function(htmlStr, callback, startPos, endPos) {
            var noReplacementRet = {
                "html": htmlStr,
                "delta": 0
            };
            if (!callback.onHtmlText) {
                return noReplacementRet;
            }
            if (endPos <= startPos) {
                return noReplacementRet;
            }
            var text = htmlStr.substring(startPos, endPos);
            var replaceStr = callback.onHtmlText(text);
            if (replaceStr == null) {
                return noReplacementRet;
            }
            var delta = replaceStr.length - (endPos - startPos);
            htmlStr = CQ.form.rte.HtmlProcessor.replace(
                    htmlStr, startPos, endPos - 1, replaceStr);
            return {
                "html": htmlStr,
                "delta": delta
            };
        },

        /**
         * <p>Gets the most probable end position of the specified processing tag.</p>
         * <p>Currently handled:</p>
         * <ul>
         *   <li>&lt;-- ... --&gt;</li>
         *   <li>&lt;? ... ?&gt;</li>
         *   <li>&lt;<! ... >&gt;<li>
         * </ul>
         * @private
         * @param {String} htmlStr
         * @param {Number} dataPos
         */
        getProcessingTagEndPos: function(htmlStr, dataPos) {
            var strLen = htmlStr.length;
            var charAtPos = htmlStr.charAt(dataPos);
            if (charAtPos == "!") {
                if (strLen > dataPos + 3) {
                    if (htmlStr.substring(dataPos, dataPos + 3) == "!--") {
                        return htmlStr.indexOf("-->", dataPos + 3) + 2;
                    }
                }
                return htmlStr.indexOf(">", dataPos + 1);
            }
            return htmlStr.indexOf(">", dataPos);
        },

        /**
         * <p>Parses the tags of a HTML string generically.</p>
         * <p>The caller should define a callback object with the following methods (each
         * is optional and only called if present):</p>
         * <ul>
         *   <li><code>htmlStart</code> : Function<br>
         *     This method is called before the first tag is parsed.</li>
         *   <li><code>htmlEnd</code> : Function<br>
         *     This method is called after the last tag has been parsed.</li>
         *   <li><code>onTagStart</code> : Function<br>
         *     This method is called on an opening tag. It takes the following parameters:
         *     <ol>
         *       <li><code>tagName</code> : String<br>
         *         The name of the tag.</li>
         *       <li><code>attributes</code> : Object<br>
         *         Information of the attributes as key/value pairs. Each value consists of
         *         the following properties:
         *         <ul>
         *           <li><code>name</code> : String<br>
         *             The name of the attribute (lower case).</li>
         *           <li><code>value</code> : String<br>
         *             The value of the attribute</li>
         *           <li><code>quoted</code> : Boolean<br>
         *             True if the attribute value is surrounded by quotation marks (IE
         *             loves to not quote simple attribute values)</li>
         *           <li><code>pos</code> : Number<br>
         *             The position where the attribute starts (relative to
         *             <code>tagStr</code>)</li>
         *           <li><code>cnt</code> : Number<br>
         *             Number of characters the attribute takes</li>
         *         </ul>
         *       </li>
         *       <li><code>isShortTag</code> : Boolean<br>
         *         True if the tag is a "short tag", that means it already includes the
         *         closing tag (i.e. &lt;br /&gt;). Note that the corresponding
         *         {@link #onTagEnd} method will be called for each tag, including short
         *         tags.</li>
         *       <li><code>startPos</code> : Number<br>
         *         Position (relative to the entire HTML to parse) of the first character (a
         *         '&lt;') of the tag.</li>
         *       <li><code>tagLen</code> : Number<br>
         *         Number of characters the tag is actually consisting of (from '&lt;' to
         *         '&gt;', as it is formatted in the HTML to parse)</li>
         *     </ol>
         *   </li>
         *   <li><code>onTagEnd</code> : Function<br>
         *     This method is called on a closing tag. It takes the following parameters:
         *     <ol>
         *       <li><code>tagName</code> : String<br>
         *         The name of the tag.</li>
         *       <li><code>isShortTag</code> : Boolean<br>
         *         True if the tag is a "short tag", that means it already includes the
         *         closing tag (i.e. &lt;br /&gt;). Note that the corresponding
         *         {@link #onTagEnd} method will be called for each tag, including short
         *         tags.</li>
         *       <li><code>startPos</code> : Number<br>
         *         Position (relative to the entire HTML to parse) of the first character (a
         *         '&lt;') of the tag.</li>
         *       <li><code>tagLen</code> : Number<br>
         *         Number of characters the tag is actually consisting of (from '&lt;' to
         *         '&gt;', as it is formatted in the HTML to parse)</li>
         *     </ol>
         *   </li>
         *   <li><code>onProcessingTag</code> : Function<br>
         *     This method is called on "processing tags" (like &lt;? ... ?&gt;, &lt;!--
         *     &gt;, ...). It takes the entire processing tag as its only parameter.</li>
         *   <li><code>onHtmlText</code> : Function<br>
         *     This method is called for HTML text. It takes the text as its only parameter.
         *     </li>
         * </ul>
         * <p>Note that all tag- and attribute names are lowercase.</p>
         * @param {String} htmlStr HTML string to parse
         * @param {Object} callback callback object which is called on opening and closing
         *                          tags (if <code>tagStart</code> resp. <code>tagEnd</code>
         *                          is specified)
         * @return {String} HTML after processing
         */
        parseHtml: function(htmlStr, callback) {
            var hpr = CQ.form.rte.HtmlProcessor;
            var processingPos = 0;
            var textPos = 0;
            var textHandlerResult;
            while ((processingPos >= 0) && (processingPos < htmlStr.length)) {
                var tagStartPos = htmlStr.indexOf("<", processingPos);
                if (tagStartPos >= 0) {
                    var dataPos = hpr.skipWhitespace(htmlStr, tagStartPos + 1);
                    var firstCharOfTag = htmlStr.charAt(dataPos);

                    var tagName, tagEndPos, replaceStr;
                    if ((firstCharOfTag == "?") || (firstCharOfTag == "!")) {
                        // "Processing tags" (<!DOCTYPE >, <!-- -->, <? ?>)
                        processingPos = hpr.getProcessingTagEndPos(htmlStr, dataPos);
                        if (processingPos > 0) {
                            textHandlerResult = hpr.handleHtmlText(htmlStr, callback,
                                    textPos, tagStartPos);
                            htmlStr = textHandlerResult.html;
                            tagStartPos += textHandlerResult.delta;
                            dataPos += textHandlerResult.delta;
                            processingPos += textHandlerResult.delta;
                            if (callback.onProcessingTag) {
                                var pTag =
                                        htmlStr.substring(tagStartPos, processingPos + 1);
                                replaceStr = callback.onProcessingTag(pTag);
                                if (replaceStr != null) {
                                    htmlStr = hpr.replace(htmlStr,
                                            tagStartPos, processingPos, replaceStr);
                                    processingPos += replaceStr.length - pTag.length + 1;
                                }
                            } else {
                                processingPos++;
                            }
                            textPos = processingPos;
                        }

                    } else if (firstCharOfTag == "/") {

                        // closing tags
                        tagEndPos = htmlStr.indexOf(">", dataPos + 1);
                        if (tagEndPos > 0) {
                            textHandlerResult = hpr.handleHtmlText(htmlStr, callback,
                                    textPos, tagStartPos);
                            htmlStr = textHandlerResult.html;
                            tagStartPos += textHandlerResult.delta;
                            dataPos += textHandlerResult.delta;
                            tagEndPos += textHandlerResult.delta;
                            tagName = htmlStr.substring(dataPos + 1, tagEndPos);
                            tagName = hpr.stripSurroundingWhitespace(tagName);
                            if (callback.onTagEnd) {
                                var endTagLen = tagEndPos - tagStartPos + 1;
                                replaceStr = callback.onTagEnd(tagName.toLowerCase(), false,
                                        tagStartPos, endTagLen);
                                if (replaceStr != null) {
                                    htmlStr = hpr.replace(
                                            htmlStr, tagStartPos, tagEndPos, replaceStr);
                                    tagEndPos += replaceStr.length - endTagLen;
                                }
                            }
                        } else {
                            tagEndPos = dataPos;
                        }
                        processingPos = tagEndPos + 1;
                        textPos = processingPos;

                    } else {

                        // opening tags
                        tagEndPos = htmlStr.indexOf(">", tagStartPos);
                        if (tagEndPos > 0) {
                            var includesClosingTag = false;
                            if (htmlStr.charAt(tagEndPos - 1) == '/') {
                                includesClosingTag = true;
                            }
                            textHandlerResult = hpr.handleHtmlText(htmlStr, callback,
                                    textPos, tagStartPos);
                            htmlStr = textHandlerResult.html;
                            tagStartPos += textHandlerResult.delta;
                            dataPos += textHandlerResult.delta;
                            tagEndPos += textHandlerResult.delta;
                            var tag = htmlStr.substring(tagStartPos, tagEndPos + 1);
                            var tagDef = hpr.parseTag(tag);
                            tagName = tagDef.tagName;
                            if (tagName && callback.onTagStart) {
                                replaceStr = callback.onTagStart(tagName, tagDef.attributes,
                                        includesClosingTag, tagStartPos, tag.length,
                                        tagStartPos, tag.length);
                                if (replaceStr != null) {
                                    htmlStr = hpr.replace(
                                            htmlStr, tagStartPos, tagEndPos, replaceStr);
                                    tagEndPos += replaceStr.length - tag.length;
                                }
                            }
                            if (tagName && includesClosingTag && callback.onTagEnd) {
                                replaceStr = callback.onTagEnd(tagName, includesClosingTag,
                                        tagStartPos, tag.length);
                                if (replaceStr != null) {
                                    htmlStr = hpr.replace(
                                            htmlStr, tagEndPos + 1, tagEndPos, replaceStr);
                                    tagEndPos += replaceStr.length;
                                }
                            }
                        } else {
                            tagEndPos = dataPos;
                        }
                        processingPos = tagEndPos + 1;
                        textPos = processingPos;

                    }
                } else {
                    textHandlerResult = hpr.handleHtmlText(htmlStr, callback, processingPos,
                            htmlStr.length);
                    htmlStr = textHandlerResult.html;
                    processingPos = -1;
                }
            }
            return htmlStr;
        },

        /**
         * Checks if the given attribute definitions equal each other.
         * <p>
         * Both attribute definitions must be in the format that is created by
         * <code>CQ.form.rte.HtmlProcessor.parseTag()</code>.
         * @param {Object} attribs attribute set
         * @param {Object} cmpAttribs attribute set to compare
         * @return {Boolean} True if the given attribute definitions equal each other
         */
        hasEqualAttributes: function(attribs, cmpAttribs) {
            var attribCnt = 0;
            for (var attribToCheck in attribs) {
                if (attribs.hasOwnProperty(attribToCheck)) {
                    if (!cmpAttribs.hasOwnProperty(attribToCheck)) {
                        return false;
                    }
                    if (attribs[attribToCheck].value != cmpAttribs[attribToCheck].value) {
                        return false;
                    }
                    attribCnt++;
                }
            }
            for (attribToCheck in cmpAttribs) {
                if (cmpAttribs.hasOwnProperty(attribToCheck)) {
                    attribCnt--;
                    if (attribCnt < 0) {
                        return false;
                    }
                }
            }
            return (attribCnt == 0);
        },


        // Processing helpers --------------------------------------------------------------

        /**
         * Parses a style-related tag (resp. its style attribute) and creates simple
         * tag replacements that work with the browser's components.
         * @param {String} tagStr The tag string to parse; for example: &lt;span
         *                        style="font-weight:bold"&gt;
         * @return {Array} Array with tag replacements; for example: <code>[ "b" ]</code>
         * @deprecated
         */
        parseStyleTag: function(tagStr) {
            var tagReplacement = null;
            var tagDef = CQ.form.rte.HtmlProcessor.parseTag(tagStr);
            var styleDef = tagDef.attributes["style"];
            if (styleDef) {
                styleDef = styleDef.value;
                var styleDefs = CQ.form.rte.HtmlProcessor.parseStyleDef(styleDef);
                if (styleDefs["font-weight"] == "bold") {
                    if (!tagReplacement) {
                        tagReplacement = new Array();
                    }
                    tagReplacement.push("b");
                }
                if (styleDefs["font-style"] == "italic") {
                    if (!tagReplacement) {
                        tagReplacement = new Array();
                    }
                    tagReplacement.push("i");
                }
            }
            return tagReplacement;
        },


        // Processing ----------------------------------------------------------------------

        /**
         * Executes a simple tag replace.
         * <p>
         * Attributes can not be properly processed using this method. Use
         * <code>parseHtml()</code> instead.
         *
         * @deprecated use pre/post processing facilities instead
         *
         * @param {String} value The String where the given tag replacements will be applied
         *                      to
         * @param {Object} tagReplace The replacements to apply; key: tag to be replace (for
         *                            example: strong); value: replacing tag (for example:
         *                            b)
         */
        executeTagReplace: function(value, tagReplace) {
            if (tagReplace) {
                for (var srcTag in tagReplace) {
                    if (tagReplace.hasOwnProperty(srcTag)) {
                        var destTag = tagReplace[srcTag];
                        if (srcTag && destTag) {
                            var srcStartTag = "<" + srcTag + ">";
                            var srcEndTag = "<\\/" + srcTag + ">";
                            var destStartTag = "<" + destTag + ">";
                            var destEndTag = "</" + destTag + ">";
                            var expStart = eval("/" + srcStartTag + "/gi");
                            var expEnd = eval("/" + srcEndTag + "/gi");
                            value = value.replace(expStart, destStartTag);
                            value = value.replace(expEnd, destEndTag);
                        }
                    }
                }
            }
            return value;
        },

        /**
         * @deprecated use generic parsing functionality if appropriate to avoid unnecessary
         * maintenance
         */
        executeStyleReplace: function(value) {
            var tag, tagEndPos, tagsToReplace, replaceText;
            var replacePos = 0;
            var spanEndTags = new Array();
            while (replacePos >= 0) {
                var valueLC = value.toLowerCase();
                tag = null;
                var closingTagPos = valueLC.indexOf("</span>", replacePos);
                var wholeTagPos = valueLC.indexOf("<span>", replacePos);
                replacePos = valueLC.indexOf("<span ", replacePos);
                if ((wholeTagPos >= 0)
                    && ((wholeTagPos < replacePos) || (replacePos < 0))) {
                    replacePos = wholeTagPos;
                }
                while ((closingTagPos >= 0)
                        && ((closingTagPos < replacePos) || (replacePos < 0))) {
                    tagsToReplace = spanEndTags.pop();
                    var replaceCnt = tagsToReplace.length;
                    if ((replaceCnt > 0) && (tagsToReplace[0] != "span")) {
                        replaceText = "";
                        for (var replaceIndex = replaceCnt - 1;
                                replaceIndex >= 0; replaceIndex--) {
                            replaceText += "</" + tagsToReplace[replaceIndex] + ">";
                        }
                        value = CQ.form.rte.HtmlProcessor.replace(
                                value, closingTagPos, closingTagPos + 6, replaceText);
                        closingTagPos += replaceText.length;
                        // correct replacePos by the difference between old and new
                        // closing tag
                        replacePos += replaceText.length - 7;
                    } else  {
                        closingTagPos += 7;
                    }
                    valueLC = value.toLowerCase();
                    closingTagPos = valueLC.indexOf("</span>", closingTagPos);
                }
                if (replacePos >= 0) {
                    tagEndPos = valueLC.indexOf(">", replacePos);
                    if (tagEndPos > replacePos) {
                         tag = value.substring(replacePos, tagEndPos + 1);
                    }
                }
                if (tag) {
                    tagsToReplace = CQ.form.rte.HtmlProcessor.parseStyleTag(tag);
                    if (tagsToReplace) {
                        replaceText = "";
                        var tagCnt = tagsToReplace.length;
                        var closingTagInfo = new Array();
                        for (var tagIndex = 0; tagIndex < tagCnt; tagIndex++) {
                            var tagToReplace = tagsToReplace[tagIndex];
                            closingTagInfo.push(tagToReplace);
                            replaceText += "<" + tagToReplace + ">";
                        }
                        value = CQ.form.rte.HtmlProcessor.replace(
                            value, replacePos, tagEndPos, replaceText);
                        replacePos += replaceText.length;
                        spanEndTags.push(closingTagInfo);
                    } else {
                        replacePos += tag.length;
                        spanEndTags.push([ "span" ]);
                    }
                }
            }
            return value;
        },

        /**
         * <p>Internalizes links that were rewritten by the underlying browser component to
         * point to URLs that look valid to the browser.</p>
         * <p>Note that link internalizing might become obsolete if we used a different
         * DOM-to-HTML conversion method, as the attribs collection of each DOM element
         * should already contain the correct, relative link. Unfortunately, the innerHTML
         * method currently used for DOM-to-HTML conversion uses DOM attributes instead of
         * the attribs collection, hence requiring link internalizing.</p>
         * @param {String} value The String which contains the links to be internalized
         * @param {Object} linkInternalize definition of which tags are suitable for
         *        link internalization; property tag defines the tag (for example: img);
         *        property attribute defines the attribute that carries the link to
         *        be internalized (for example: src)
         * @return {String} The String with internalized links
         */
        executeInternalizeLinks: function(value, linkInternalize) {
            var valueLC = value.toLowerCase();
            var replacePos, tagEndPos;
            var tagCnt = linkInternalize.length;
            for (var tagIndex = 0; tagIndex < tagCnt; tagIndex++) {
                var tag = linkInternalize[tagIndex];
                var tagName = tag["tag"];
                var attribute = tag["attribute"];
                replacePos = 0;
                while ((replacePos >= 0) && (replacePos < value.length)) {
                    replacePos = valueLC.indexOf("<" + tagName + " ", replacePos);
                    if (replacePos >= 0) {
                        var tagStr = null;
                        tagEndPos = valueLC.indexOf(">", replacePos + 1);
                        if (tagEndPos > replacePos) {
                            tagStr = value.substring(replacePos, tagEndPos + 1);
                        }
                        if (tagStr) {
                            var tagDef = CQ.form.rte.HtmlProcessor.parseTag(tagStr);
                            if (tagDef) {
                                var attribDef = tagDef.attributes[attribute];
                                if (attribDef && !attribDef.shortAttrib) {
                                    var attribValue = attribDef.value;
                                    var attribPos = attribDef.pos;
                                    var attribCharCnt = attribDef.cnt;
                                    var isQuoted = attribDef.quoted;
                                    var url = CQ.form.rte.HtmlRules.Links
                                            .removePrefixForInternalLinks(attribValue);
                                    if (url != attribValue) {
                                        if (!isQuoted) {
                                            url = "\"" + url + "\"";
                                        }
                                        value = CQ.form.rte.HtmlProcessor.replace(
                                                value, replacePos + attribPos,
                                                replacePos + attribPos + attribCharCnt - 1,
                                                url);
                                        valueLC = value.toLowerCase();
                                        replacePos += tagStr.length
                                                + (url.length - attribValue.length);
                                    } else {
                                        replacePos += tagStr.length;
                                    }
                                } else {
                                    replacePos += tagStr.length;
                                }
                            } else {
                                replacePos += tagStr.length;
                            }
                        } else {
                            replacePos += tagName.length + 2;
                        }
                    }
                }
            }
            return value;
        },

        /**
         * Creates HTML code for the specified tag definition.
         * @param {String} tagName Name of the tag
         * @param {Object} attribs Attribute definition as created by
         *        {@link CQ.form.rte.HtmlProcessor.parseHtml}
         * @param {Boolean} isClosingTag True if a closing tag should be created
         * @param {Boolean} isShortTag True if the tag is a "short tag" (for example
         *        &lt;br /&gt;)
         * @param {Boolean} normalizeTag True if the tag should be created in a "normalized"
         *        form (mostly, tag name and attribute names are put to lower case)
         * @return {String} HTML code for the specified tag definition
         */
        createTag: function(tagName, attribs, isClosingTag, isShortTag, normalizeTag) {
            if (isClosingTag && isShortTag) {
                return "";
            }
            var tag = "<";
            if (isClosingTag) {
                tag += "/";
            }
            tag += (normalizeTag ? tagName.toLowerCase() : tagName);
            if (attribs && !isClosingTag) {
                tag += CQ.form.rte.HtmlProcessor.createAttributes(attribs, normalizeTag);
            }
            if (isShortTag) {
                tag += " /";
            }
            tag += ">";
            return tag;
        },

        /**
         * Creates HTML code for the specified attribute definition.
         * @param {Array} attribs
         * @param {Boolean} normalizeTag
         */
        createAttributes: function(attribs, normalizeTag) {
            var strRep = "";
            if (!attribs) {
                return strRep;
            }
            for (var attribName in attribs) {
                if (attribs.hasOwnProperty(attribName)) {
                    if (attribName != "classname") {
                        var attribDef = attribs[attribName];
                        if (attribDef) {
                            strRep += " " + (normalizeTag ? attribName.toLowerCase()
                                    : attribName);
                            if (attribDef.shortAttrib) {
                                if (normalizeTag) {
                                    strRep += "=\"" + attribName.toLowerCase() + "\"";
                                }
                            } else {
                                strRep += "=";
                                var value = attribDef.value;
                                var isQuoted = attribDef.quoted;
                                if (!isQuoted) {
                                    isQuoted = (value.indexOf(" ") >= 0);
                                }
                                if (isQuoted || normalizeTag) {
                                    strRep += "\"";
                                }
                                strRep += value;
                                if (isQuoted || normalizeTag) {
                                    strRep += "\"";
                                }
                            }
                        }
                    }
                }
            }
            return strRep;
        }

    };

}();


/**
 * @class CQ.form.rte.HtmlProcessor.StripTags
 * @private
 * This class implements a "Tag strip" processor, which removes all tags from a given
 * HTML fragment.
 */
CQ.form.rte.HtmlProcessor.StripTags = new Class({

    toString: "HtmlProcessor.StripTags",

    /**
     * Flag if content has to be ignored
     */
    ignoreContent: false,

    /**
     * Strips all tags from the given HTML-String.
     * @param {String} html HTML code
     * @return {String} the plain text code
     */
    strip: function(html) {
        return CQ.form.rte.HtmlProcessor.parseHtml(html, this);
    },

    /**
     * Handler for starting HTML tags.
     * @param {String} tagName Name of tag
     * @private
     */
    onTagStart: function(tagName) {
        if ((tagName == "style") || (tagName == "script")) {
            this.ignoreContent = true;
        }
        if (tagName == "br") {
            return "\n";
        }
        return "";
    },

    /**
     * Handler for ending HTML tags.
     * @param {String} tagName Name of tag
     * @private
     */
    onTagEnd: function(tagName) {
        if ((tagName == "style") || (tagName == "script")) {
            this.ignoreContent = false;
        }
        if (tagName == "tr") {
            return "\n";
        }
        if (tagName == "p") {
            return "\n\n";
        }
        if (tagName.match(/h[1-6]/)) {
            return "\n\n";
        }
        if (tagName == "li") {
            return "\n\n";
        }
        return "";
    },

    onHtmlText: function(text) {
        if (this.ignoreContent) {
            return "";
        }
        var noCrLfText = text.replace(/[\n\r]/g, " ");
        return (noCrLfText != text ? noCrLfText : null);
    },

    onProcessingTag: function(pTag) {
        return "";
    }

});