CUI.rte.testing.NodeListTests = function() {

    var com = CUI.rte.Common;
    var tcm = CUI.rte.testing.Commons;
    var tsl = CUI.rte.testing.SelectionLib;
    var sel = CUI.rte.Selection;
    var dpr = CUI.rte.DomProcessor;


    var anchor = "<a name=\"anchor\"></a>";

    var anchor1 = "<a name=\"anchor1\"></a>";

    var anchor2 = "<a name=\"anchor2\"></a>";

    var imgUrl = "img/test_128.png";

    var imgLeft = "<img src=\"" + imgUrl + "\" style=\"float: left;\">";

    var img = "<img src=\"" + imgUrl + "\">";

    var imgSmallUrl = "img/test_32.png";

    var imgSmall = "<img src=\"" + imgSmallUrl + "\">";


    // Helpers -----------------------------------------------------------------------------

    var createPlaceholderChar = function(node) {
        var placeholder = "?";
        if (com.isTag(node, "img")
                && com.isAttribDefined(node, com.A_NAME_REPLACEMENT_ATTRIB)) {
            placeholder = "#";
        } else if (com.isTag(node, "img")) {
            placeholder = "$";
        } else if (com.isTag(node, "a")) {
            placeholder = "#";
        } else if (com.isTag(node, "br")) {
            placeholder = "+";
        }
        return placeholder;
    };

    var normalizeNodeDef = function(context, node, offset, isEndOfSel) {
        if ((node.nodeType == 1) && !com.isOneCharacterNode(node)) {
            // correct "after structure" node definition
            var children = node.childNodes;
            var childCnt = children.length;
            var ftn, ltn;
            if ((offset != null) && (offset < childCnt)) {
                ftn = com.getFirstTextChild(children[offset], true);
                if (ftn) {
                    node = ftn;
                    offset = sel.getFirstSelectionOffset(context, ftn);
                }
            } else {
                ltn = com.getLastTextChild(node, true);
                if (ltn) {
                    node = ltn;
                    offset = sel.getLastSelectionOffset(context, ltn, isEndOfSel);
                }
            }
        }
        var mustCorrect = false;
        if (node.nodeType == 3) {
            mustCorrect = (offset >= node.nodeValue.length);
        } else if (com.isOneCharacterNode(node)) {
            mustCorrect = (offset == 0);
        }
        if (mustCorrect) {
            var ntn = com.getNextCharacterNode(context, node, com.EDITBLOCK_TAGS);
            if (ntn) {
                node = ntn;
                offset = sel.getFirstSelectionOffset(context, ntn);
            }
        }
        return {
            "node": node,
            "offset": offset
        };
    };

    var createContent = function(context, startNode, startOffset, endNode, endOffset) {
        var originalEndNode = endNode;
        var startDef = normalizeNodeDef(context, startNode, startOffset, false);
        startNode = startDef.node;
        startOffset = startDef.offset;
        var endDef = normalizeNodeDef(context, endNode, endOffset, true);
        endNode = endDef.node;
        endOffset = endDef.offset;
        if (startNode == endNode) {
            // everything in the same node
            if (com.isOneCharacterNode(startNode)) {
                if ((startOffset != endOffset)
                        && ((startOffset != null) || (endOffset != 0))) {
                    throw new Error("Invalid content range.");
                }
                if (startOffset == 0) {
                    // anchor/object EOT situation
                    return "**";
                }
                return createPlaceholderChar(startNode);
            }
            // special case: Empty block
            if (startNode.nodeType == 1) {
                if (com.isTag(startNode, com.EDITBLOCK_TAGS)
                        && (startNode.childNodes.length == 0)) {
                    return "=";
                }
            }
            if (startOffset == endOffset) {
                var text = startNode.nodeValue;
                var charToUse = (startOffset < text.length ? text.charAt(startOffset)
                        : '*');
                return "*" + charToUse;
            }
            return startNode.nodeValue.substring(startOffset, endOffset);
        }
        // different start and end nodes; handle corner case first (end of previous block
        // to start of follow-up block equals an empty selection)
        if (com.getNextCharacterNode(context, startNode) == endNode) {
            if ((sel.getLastSelectionOffset(context, startNode, true) == startOffset)
                    && (sel.getFirstSelectionOffset(context, endNode) == endOffset)) {
                // consider empty, in-between blocks
                var nn = com.getNextNode(context, startNode);
                if (com.isEmptyEditingBlock(nn)) {
                    return "**=";
                }
                // consider empty blocks as start node
                if (com.isEmptyEditingBlock(startNode)) {
                    return "=";
                }
                return "**";
            }
        }
        var content = "";
        var node = startNode;
        while (node) {
            var isEndNode = (node == endNode);
            var sOffs = sel.getFirstSelectionOffset(context, node);
            var eOffs = sel.getLastSelectionOffset(context, node, true);
            if (node == startNode) {
                sOffs = startOffset;
            }
            if (isEndNode) {
                eOffs = endOffset;
            }
            if (com.isOneCharacterNode(node)) {
                if ((sOffs == null) && (eOffs == 0)) {
                    content += createPlaceholderChar(node);
                } else if (sOffs == 0) {
                    content += "*";
                }
            } else if (node.nodeType == 3) {
                var nodeText = node.nodeValue;
                if (sOffs < eOffs) {
                    content += nodeText.substring(sOffs, eOffs);
                } else {
                    if (sOffs == node.nodeValue.length) {
                        content += "**";
                    }
                }
            } else if (node.nodeType == 1) {
                // special case: Empty block
                if ((!isEndNode || (endNode == originalEndNode))
                        && com.isEmptyEditingBlock(node)) {
                    content += "=";
                }
            }
            if (isEndNode) {
                break;
            }
            node = com.getNextNode(context, node);
        }
        return content;
    };

    // recursive part of createNodeListContent
    var createNodeContent = function(context, nodeListNode) {
        var content = "";
        var dom = nodeListNode.dom;
        if (nodeListNode.nodeType == dpr.DOM_NODE) {
            if (com.isOneCharacterNode(dom)) {
                content = createPlaceholderChar(dom);
            } else if (com.isEmptyEditingBlock(dom)) {
                // IE: empty (= no content) nodes
                content += "=";
            }
            var children = nodeListNode.childNodes;
            if (children) {
                var childCnt = children.length;
                for (var c = 0; c < childCnt; c++) {
                    content += createNodeContent(context, children[c]);
                }
            }
        } else if (nodeListNode.nodeType == dpr.TEXT_NODE) {
            if (nodeListNode.charCnt == 0) {
                content += "*";
                var startPos = nodeListNode.startPos;
                if (startPos < nodeListNode.nodeLength) {
                    content += dom.nodeValue.charAt(startPos);
                } else {
                    var ntn = com.getNextCharacterNode(context, dom, com.EDITBLOCK_TAGS);
                    if (ntn) {
                        if (com.isOneCharacterNode(ntn)) {
                            content += createPlaceholderChar(ntn);
                        } else {
                            content += ntn.nodeValue.charAt(0);
                        }
                    } else {
                        content += "*";
                    }
                }
            } else {
                content += nodeListNode.getActualTextContent();
            }
        }
        return content;
    };

    var createNodeListContent = function(context, nodeList) {
        var content = "";
        var children = nodeList.nodes;
        var childCnt = children.length;
        if (childCnt == 0) {
            // EOT situation/no "real" content selected
            return "**";
        }
        if (nodeList.nodes.length == 1) {
            // IE: caret in empty block
            var node = nodeList.nodes[0];
            var dom = node.dom;
            if (com.isEmptyEditingBlock(dom)) {
                return "=";
            }
        }
        for (var c = 0; c < childCnt; c++) {
            var childToProcess = children[c];
            if (c == 0) {
                var childToCheck = childToProcess;
                while (childToCheck.childNodes && (childToCheck.childNodes.length > 0)) {
                    childToCheck = childToCheck.childNodes[0];
                }
                if (!childToCheck.hasCharacterNodes()) {
                    // behind last object at the end of a block
                    if (childToCheck.dom.childNodes.length > 0) {
                        content += "*";
                    }
                }
            }
            content += createNodeContent(context, children[c]);
        }
        return content;
    };


    // Test execution locals: Testing the test lib -----------------------------------------

    var testCreateContent = function() {
        var root = document.createElement("span");
        var context = tcm.createFakeEditContext(root);
        var p = document.createElement("p");
        root.appendChild(p);
        var t1 = document.createTextNode("Hello,");
        p.appendChild(t1);
        var br = document.createElement("br");
        p.appendChild(br);
        var b = document.createElement("b");
        p.appendChild(b);
        var t2 = document.createTextNode("good old");
        b.appendChild(t2);
        var t3 = document.createTextNode(" ");
        p.appendChild(t3);
        var a = document.createElement("a");
        a.setAttribute("name", "anchor");
        p.appendChild(a);
        var t4 = document.createTextNode("world!");
        p.appendChild(t4);
        var p2 = document.createElement("p");
        root.appendChild(p2);
        var t5 = document.createTextNode("Test");
        p2.appendChild(t5);
        var a2 = document.createElement("a");
        a2.setAttribute("name", "anchor2");
        p2.appendChild(a2);
        var pEmpty = document.createElement("p");
        root.appendChild(pEmpty);
        var p4 = document.createElement("p");
        root.appendChild(p4);
        var t7 = document.createTextNode("Another");
        p4.appendChild(t7);
        var a4 = document.createElement("a");
        a4.setAttribute("name", "anchor4");
        p4.appendChild(a4);
        var p5 = document.createElement("p");
        root.appendChild(p5);
        var t8 = document.createTextNode("ABC");
        p5.appendChild(t8);
        var pEmpty2 = document.createElement("p");
        root.appendChild(pEmpty2);
        var p3 = document.createElement("p");
        root.appendChild(p3);
        var t6 = document.createTextNode("Aloha");
        p3.appendChild(t6);
        var a3 = document.createElement("a");
        a3.setAttribute("name", "anchor3");
        p3.appendChild(a3);
        // entire content
        var t4Len = t4.nodeValue.length;
        var result = createContent(context, t1, 0, t4, t4Len);
        if (result != RESULTS[0]) {
            return "Invalid result for entire content (#0); is: " + result + "; expected: "
                    + RESULTS[0];
        }
        // intra-node tests
        result = createContent(context, t1, 1, t1, 3);
        if (result != RESULTS[1]) {
            return "Invalid result for intra-node test (#1); is: " + result + "; expected: "
                    + RESULTS[1];
        }
        result = createContent(context, a, null, a, 0);
        if (result != RESULTS[2]) {
            return "Invalid result for intra-node test (#2); is: " + result + "; expected: "
                    + RESULTS[2];
        }
        result = createContent(context, a, null, a, null);
        if (result != RESULTS[3]) {
            return "Invalid result for intra-node test (#3); is: " + result + "; expected: "
                    + RESULTS[3];
        }
        result = createContent(context, a, 0, a, 0);
        if (result != RESULTS[4]) {
            return "Invalid result for intra-node test (#4); is: " + result + "; expected: "
                    + RESULTS[4];
        }
        result = createContent(context, t1, 4, t1, 4);
        if (result != RESULTS[5]) {
            return "Invalid result for intra-node test (#5); is: " + result + "; expected: "
                    + RESULTS[5];
        }
        result = createContent(context, t4, t4Len, t4, t4Len);
        if (result != RESULTS[6]) {
            return "Invalid result for intra-node test (#6); is: " + result + "; expected: "
                    + RESULTS[6];
        }
        // node-to-node cases
        result = createContent(context, t1, 1, t2, 4);
        if (result != RESULTS[7]) {
            return "Invalid result for node-to-node test (#7); is: " + result
                    + "; expected: " + RESULTS[7];
        }
        result = createContent(context, t2, 5, a, null);
        if (result != RESULTS[8]) {
            return "Invalid result for node-to-node test (#8); is: " + result
                    + "; expected: " + RESULTS[8];
        }
        result = createContent(context, t2, 5, a, 0);
        if (result != RESULTS[9]) {
            return "Invalid result for node-to-node test (#9); is: " + result
                    + "; expected: " + RESULTS[9];
        }
        result = createContent(context, t2, 5, t4, 0);
        if (result != RESULTS[10]) {
            return "Invalid result for node-to-node test (#10); is: " + result
                    + "; expected: " + RESULTS[10];
        }
        result = createContent(context, t2, 5, t4, 1);
        if (result != RESULTS[11]) {
            return "Invalid result for node-to-node test (#11); is: " + result
                    + "; expected: " + RESULTS[11];
        }
        // specials
        result = createContent(context, t2, 5, p, null);
        if (result != RESULTS[12]) {
            return "Invalid result for node-to-node test (#12); is: " + result
                    + "; expected: " + RESULTS[12];
        }
        result = createContent(context, t2, 5, root, 1);
        if (result != RESULTS[13]) {
            return "Invalid result for node-to-node test (#13); is: " + result
                    + "; expected: " + RESULTS[13];
        }
        result = createContent(context, root, 1, root, 1);
        if (result != RESULTS[14]) {
            return "Invalid result for node-to-node test (#14); is: " + result
                    + "; expected: " + RESULTS[14];
        }
        result = createContent(context, p, null, p, null);
        if (result != RESULTS[15]) {
            return "Invalid result for node-to-node test (#15); is: " + result
                    + "; expected: " + RESULTS[15];
        }
        result = createContent(context, br, null, br, null);
        if (result != RESULTS[16]) {
            return "Invalid result for node-to-node test (#16); is: " + result
                    + "; expected: " + RESULTS[16];
        }
        result = createContent(context, a2, null, a2, 0);
        if (result != RESULTS[17]) {
            return "Invalid result for node-to-node test (#17); is: " + result
                    + "; expected: " + RESULTS[17];
        }
        result = createContent(context, a2, null, pEmpty, null);
        if (result != RESULTS[18]) {
            return "Invalid result for node-to-node test (#18); is: " + result
                    + "; expected: " + RESULTS[18];
        }
        result = createContent(context, a2, 0, a2, 0);
        if (result != RESULTS[19]) {
            return "Invalid result for node-to-node test (#19); is: " + result
                    + "; expected: " + RESULTS[19];
        }
        result = createContent(context, p3, null, p3, null);
        if (result != RESULTS[20]) {
            return "Invalid result for node-to-node test (#20); is: " + result
                    + "; expected: " + RESULTS[20];
        }
        result = createContent(context, pEmpty, null, pEmpty, null);
        if (result != RESULTS[21]) {
            return "Invalid result for node-to-node test (#21); is: " + result
                    + "; expected: " + RESULTS[21];
        }
        result = createContent(context, t4, 6, t5, 1);
        if (result != RESULTS[22]) {
            return "Invalid result for node-to-node test (#22); is: " + result
                    + "; expected: " + RESULTS[22];
        }
        result = createContent(context, a4, 0, t8, 0);
        if (result != RESULTS[23]) {
            return "Invalid result for node-to-node test (#23); is: " + result
                    + "; expected: " + RESULTS[23];
        }
        result = createContent(context, t8, 3, t6, 0);
        if (result != RESULTS[24]) {
            return "Invalid result for node-to-node test (#24); is: " + result
                    + "; expected: " + RESULTS[24];
        }
        result = createContent(context, a4, 0, t6, 0);
        if (result != RESULTS[25]) {
            return "Invalid result for node-to-node test (#25); is: " + result
                    + "; expected: " + RESULTS[25];
        }
        result = createContent(context, pEmpty2, null, t6, 0);
        if (result != RESULTS[26]) {
            return "Invalid result for node-to-node test (#26); is: " + result
                    + "; expected: " + RESULTS[26];
        }
        result = createContent(context, t8, 3, pEmpty2, null);
        if (result != RESULTS[27]) {
            return "Invalid result for node-to-node test (#27); is: " + result
                    + "; expected: " + RESULTS[27];
        }
        return "success";
    };

    var RESULTS = [
        "Hello,+good old #world!",      // #0
        "el",                           // #1
        "#",                            // #2
        "#",                            // #3
        "*w",                           // #4
        "*o",                           // #5
        "**",                           // #6
        "ello,+good",                   // #7
        "old ",                         // #8
        "old #",                        // #9
        "old #",                        // #10
        "old #w",                       // #11
        "old #world!",                  // #12
        "old #world!",                  // #13
        "*T",                           // #14
        "**",                           // #15
        "+",                            // #16
        "#",                            // #17
        "#=",                           // #18
        "**",                           // #19
        "**",                           // #20
        "=",                            // #21
        "**T",                          // #22
        "**",                           // #23
        "**=",                          // #24
        "*ABC=",                        // #25
        "=",                            // #26
        "**="                           // #27
    ];


    // Test execution locals: Testing node list from processing selection ------------------

    /**
     * Executes a single createProcessingSelection test case.
     */
    var testFromPSelTest = function(htmls, exceptions, testIndex, testRun) {
        if (testIndex >= htmls.length) {
            return "finished";
        }
        var comp = tcm.getRteInstance();
        var context = tcm.getEditContext();
        var testHtml = htmls[testIndex];
        if (testRun == 0) {
            comp.setValue(testHtml);
        }
        comp.focus();
        tsl.selectEOT();
        var caretPosAvail = sel.getCaretPos(context);
        if (testRun > caretPosAvail) {
            return "testrun finished";
        }
        var s = testRun;
        var exCnt = (exceptions ? exceptions.length : 0);
        for (var ex = 0; ex < exCnt; ex++) {
            var exception = exceptions[ex];
            if (exception.index == testIndex) {
                if ((exception.startPos == s)
                        && (exception.charCnt == null)) {
                    if (exception.correctedStartPos != null) {
                        var isValid = true;
                        if (com.ua.isIE) {
                            isValid = (exception.isIE == undefined) || exception.isIE;
                        } else if (com.ua.isGecko) {
                            isValid = (exception.isGecko == undefined) || exception.isGecko;
                        } else if (com.ua.isWebKit) {
                            isValid = (exception.isWebKit == undefined)
                                    || exception.isWebKit;
                        }
                        if (isValid) {
                            s = exception.correctedStartPos;
                        }
                    }
                }
            }
        }
        for (var e = s; e <= caretPosAvail; e++) {
            var endPos = e;
            var bookmark = {
                "startPos": s,
                "charCnt": (e - s)
            };
            for (ex = 0; ex < exCnt; ex++) {
                exception = exceptions[ex];
                if (exception.index == testIndex) {
                    if ((exception.startPos == s)
                            && (exception.charCnt == bookmark.charCnt)) {
                        if (exception.correctedStartPos != null) {
                            bookmark.startPos = exception.correctedStartPos;
                        }
                        if (exception.correctedCharCnt != null) {
                            bookmark.charCnt = exception.correctedCharCnt;
                        }
                        endPos = bookmark.startPos + bookmark.charCnt;
                    }
                }
            }
            // window.console.log("S: " + s + " - E: " + e);
            sel.selectBookmark(context, bookmark);
            var pSel = sel.createProcessingSelection(context);
            // com.setLogEnabled((testRun == 14) && (e == 15));
            var nodeList;
            try {
                nodeList = dpr.createNodeList(context, pSel);
            } catch (ex) {
                // com.setLogEnabled(true);
                // com.ieLog("Error: " + testRun + "-" + e);
                // com.setLogEnabled(false);
                throw ex;
            }
            var startDef = com.getNodeAtPosition(context, s);
            var endDef = startDef;
            if (e != s) {
                endDef = com.getNodeAtPosition(context, e);
            }
            var content = createNodeListContent(context, nodeList);
            var expectedContent = createContent(context, startDef.dom, startDef.offset,
                    endDef.dom, endDef.offset);
            if (content != expectedContent) {
                return "Invalid node list (#" + testIndex + "/" + testRun + "; " + s + "-"
                        + e + "); is: " + content + "; expected: " + expectedContent
                        + " (HTML: " + testHtml + "; pSel: " + com.dumpObject(pSel, 0, true)
                        + "; nodeList: " + nodeList.createDump() + "; startDef: "
                        + com.dumpObject(startDef, 0, true) + "; endDef: "
                        + com.dumpObject(endDef, 0, true) + ")";
            }
        }
        return "success";
    };

    /**
     * Executes a generic createProcessingSelection test set in "deferred" mode.
     * @private
     */
    var deferredFromPSelTestSet = function(htmls, exceptions, testIndex) {
        var isSingleTest = (testIndex != undefined);
        if (!isSingleTest) {
            testIndex = 0;
        }
        CUI.rte.Utils.defer(continueFromPSelTestSet, 1, this,
                [ htmls, exceptions, testIndex, 0, isSingleTest ]);
        return "deferred";
    };

    /**
     * Executes a single step of a generic createProcessingSelection test set in "deferred"
     * mode.
     * @private
     */
    var continueFromPSelTestSet = function(htmls, exceptions, testIndex, testRun,
                                           isSingleTest) {
        var result = testFromPSelTest(htmls, exceptions, testIndex, testRun);
        if (result == "testrun finished") {
            testIndex ++;
            if ((testIndex < htmls.length) && (!isSingleTest)) {
                testRun = 0;
                CUI.rte.Utils.defer(continueFromPSelTestSet, 100, this,
                        [ htmls, exceptions, testIndex, testRun, isSingleTest ]);
            } else {
                CUI.rte.DebugRegistry.notifyDeferredSuccess();
            }
        } else if (result != "success") {
            CUI.rte.DebugRegistry.notifyDeferredError(result);
        } else {
            testRun++;
            CUI.rte.Utils.defer(continueFromPSelTestSet, 1, this,
                    [ htmls, exceptions, testIndex, testRun, isSingleTest ]);
        }
    };

    return {

        // Processing selection to node list -----------------------------------------------

        /**
         * Tests if a node list gets correctly created from a processing selection by
         * checking the corner nodes. Basic test cases.
         */
        testFromSelectionBasics: function(testIndex, testRun) {
            var tst = CUI.rte.testing.NodeListTests;
            if (testRun == null) {
                return deferredFromPSelTestSet(tst.FROMPSEL_HTMLS, tst.FROMPSEL_EXCEPTIONS,
                        testIndex);
            }
            return testFromPSelTest(tst.FROMPSEL_HTMLS, tst.FROMPSEL_EXCEPTIONS, testIndex,
                    testRun);
        },

        FROMPSEL_HTMLS: [
            "<p>Hello, world!</p>",
            "<p>Test with <b>bold</b> content.</p>",
            "<p>Testing a <a href=\"http://pointing.to\">link</a>.</p>",
            "<p>Multiple</p><p>Paragraphs</p>",
            "<p>Linefeed<br>Test 1</p>",
            "<p>Before</p><p>Linefeed<br>Test 2</p><p>After</p>",
            "<p>Before</p><p><br>Linefeed 3</p><p>After</p>",
            "<p>Before</p><p>Linefeed<br><br>Test 4</p><p>After</p>",
            // anchors
            "<p>" + anchor + "anchors at" + anchor1 + "different positions" + anchor2
                    + "</p>",
            "<p>Before</p>"
                    + "<p>" + anchor + "anchors at" + anchor1 + "different positions"
                    + anchor2 + "</p>"
                    + "After",
            "<p>" + anchor + "Para 1</p>"
                    + "<p>" + anchor1 + "Para 2</p>"
                    + "<p>" + anchor2 + "Para 3</p>",
            "<p>" + anchor + "Para 1</p>"
                    + "<p>Para 2" + anchor1 + "</p>",
            "<p>Para 1" + anchor + "</p>"
                    + "<p>" + anchor1 + "Para 2</p>",
            // images
            "<p>" + img + "A nice image with no alignment</p>",
            "<p>" + imgSmall + imgSmall + "Two images in a row</p>",
            "<p>" + imgSmall + "at different " + imgSmall + " positions " + imgSmall
                    + "</p>",
            "<p>" + imgSmall + "at different " + imgSmall + " positions " + imgSmall
                    + "</p>"
                    + "<p>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</p>",
            "<p>Before</p>"
                    + "<p>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</p>"
                    + "<p>After</p>",
            "<p>" + imgLeft + "A nice image with alignment to the left</p>",
            "<p>A nice image with " + imgLeft + "alignment to the left</p>",
            "<p>" + imgSmall + "</p>",
            "<p>" + imgSmall + "</p><p>" + imgSmall + "</p>",
            "<p>Before</p><p>" + imgSmall + "</p><p>After</p>",
            "<p>" + imgSmall + "<br>" + imgSmall + "</p>",
            // combining problem childs ...
            "<p>Test" + anchor + "with" + imgSmall + "</p>",
            "<p>Test" + anchor + imgSmall + "together.</p>",
            "<p>Test" + imgSmall + anchor + "together.</p>",
            "<p>" + anchor + imgSmall + "BOB</p>",
            "<p>" + imgSmall + anchor + "BOB</p>",
            "<p>EOL" + anchor + imgSmall + "</p>",
            "<p>BOL" + imgSmall + anchor + "</p>",
            "<p>Before</p><p>Test" + anchor + "with" + imgSmall + "</p><p>After</p>",
            "<p>Before</p><p>Test" + anchor + imgSmall + "together.</p><p>After</p>",
            "<p>Before</p><p>Test" + imgSmall + anchor + "together.</p><p>After</p>",
            "<p>Before</p><p>" + anchor + imgSmall + "BOB</p><p>After</p>",
            "<p>Before</p><p>" + imgSmall + anchor + "BOB</p><p>After</p>",
            "<p>Before</p><p>EOL" + anchor + imgSmall + "</p><p>After</p>",
            "<p>Before</p><p>BOL" + imgSmall + anchor + "</p><p>After</p>",
            "<p>" + anchor + imgSmall + "BOB</p>"
                    + "<p>" + anchor + imgSmall + "BOB</p>",
            "<p>EOB" + anchor + imgSmall + "</p>"
                    + "<p>EOB" + anchor + imgSmall + "</p>",
            "<p>" + imgSmall + anchor + "BOB</p>"
                    + "<p>EOB" + imgSmall + anchor + "</p>",
            "<p>EOB" + imgSmall + anchor + "</p>"
                    + "<p>" + imgSmall + anchor + "BOB</p>",
            "<p>Before</p><p>" + anchor + imgSmall + "BOB</p>"
                    + "<p>" + anchor + imgSmall + "BOB</p><p>After</p>",
            "<p>Before</p><p>EOB" + anchor + imgSmall + "</p>"
                    + "<p>EOB" + anchor + imgSmall + "</p><p>After</p>",
            "<p>Before</p><p>" + imgSmall + anchor + "BOB</p>"
                    + "<p>EOB" + imgSmall + anchor + "</p><p>After</p>",
            "<p>Before</p><p>EOB" + imgSmall + anchor + "</p>"
                    + "<p>" + imgSmall + anchor + "BOB</p><p>After</p>",
            "<p>" + anchor + imgSmall + "BOB</p>"
                    + "<p>" + imgSmall + anchor + "BOB</p>",
            "<p>EOB" + anchor + imgSmall + "</p>"
                    + "<p>EOB" + imgSmall + anchor + "</p>",
            "<p>" + imgSmall + anchor + "BOB</p>"
                    + "<p>EOB" + anchor + imgSmall + "</p>",
            "<p>EOB" + imgSmall + anchor + "</p>"
                    + "<p>" + anchor + imgSmall + "BOB</p>",
            "<p>Before</p><p>" + anchor + imgSmall + "BOB</p>"
                    + "<p>" + imgSmall + anchor + "BOB</p><p>After</p>",
            "<p>Before</p><p>EOB" + anchor + imgSmall + "</p>"
                    + "<p>EOB" + imgSmall + anchor + "</p><p>After</p>",
            "<p>Before</p><p>" + imgSmall + anchor + "BOB</p>"
                    + "<p>EOB" + anchor + imgSmall + "</p><p>After</p>",
            "<p>Before</p><p>EOB" + imgSmall + anchor + "</p>"
                    + "<p>" + anchor + imgSmall + "BOB</p><p>After</p>",
            "<p>" + imgSmall + anchor + imgSmall + anchor1 + imgSmall + anchor2 + "</p>",
            "<p>" + anchor + anchor1 + imgSmall + imgSmall + "</p>",
            "<p>" + imgSmall + imgSmall + anchor + anchor1 + "</p>",
            "<p>Before</p><p>" + anchor + anchor1 + imgSmall + imgSmall + "</p>"
                    + "<p>After</p>",
            "<p>Before</p><p>" + imgSmall + imgSmall + anchor + anchor1 + "</p>"
                    + "<p>After</p>"
        ],

        FROMPSEL_EXCEPTIONS: [
            // not yet required
        ],

        /**
         * Tests if a node list gets correctly created from a processing selection by
         * checking the corner nodes. List-related test cases.
         */
        testFromSelectionList: function(testIndex, testRun) {
            var tst = CUI.rte.testing.NodeListTests;
            if (testRun == null) {
                return deferredFromPSelTestSet(tst.FROMPSEL_HTMLS_LIST,
                        tst.FROMPSEL_EXCEPTIONS_LIST, testIndex);
            }
            return testFromPSelTest(tst.FROMPSEL_HTMLS_LIST, tst.FROMPSEL_EXCEPTIONS_LIST,
                    testIndex, testRun);
        },

        FROMPSEL_HTMLS_LIST: [
            "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
            "<p>Before</p><ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>"
                    + "<p>After</p>",
            "<ul><li>Item 1<ul>"
                    + "<li>Item 1.1</li>"
                    + "<li>Item 1.2</li>"
                    + "<li>Item 1.3</li>"
                    + "</ul></li>"
                    + "<li>Item 2<ul>"
                    + "<li>Item 2.1</li>"
                    + "<li>Item 2.2</li>"
                    + "<li>Item 2.3</li>"
                    + "</ul></li>"
                    + "<li>Item 3<ul>"
                    + "<li>Item 3.1</li>"
                    + "<li>Item 3.2</li>"
                    + "<li>Item 3.2</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>Item 1<ul>"
                    + "<li>Item 1.1</li>"
                    + "<li>Item 1.2</li>"
                    + "<li>Item 1.3</li>"
                    + "</ul></li>"
                    + "<li>Item 2<ul>"
                    + "<li>Item 2.1</li>"
                    + "<li>Item 2.2</li>"
                    + "<li>Item 2.3</li>"
                    + "</ul></li>"
                    + "<li>Item 3<ul>"
                    + "<li>Item 3.1</li>"
                    + "<li>Item 3.2</li>"
                    + "<li>Item 3.2</li>"
                    + "</ul></li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<ul><li>Item 1</li>"
                    + "<li>Item with" + anchor + "anchor</li>"
                    + "<li>" + anchor1 + "BOL anchor</li>"
                    + "<li>EOL anchor" + anchor2 + "</li>"
                    + "<li>Final item</li>"
                    + "</ul>",
            "<ul><li>" + anchor + "Item 1</li>"
                    + "<li>" + anchor1 + "Item 2</li>"
                    + "<li>" + anchor2 + "Item 3</li>"
                    + "</ul>",
            "<ul><li>Item 1" + anchor + "</li>"
                    + "<li>Item 2" + anchor1 + "</li>"
                    + "<li>Item 3" + anchor2 + "</li>"
                    + "</ul>",
            "<ul><li>Item 1" + anchor + "</li>"
                    + "<li>" + anchor1 + "Item 2</li>"
                    + "</ul>",
            "<ul><li>" + anchor + "Item 1</li>"
                    + "<li>Item 2" + anchor1 + "</li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>" + anchor + "Item 1</li>"
                    + "<li>" + anchor1 + "Item 2</li>"
                    + "<li>" + anchor2 + "Item 3</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<p>Before</p>"
                    + "<ul><li>Item 1" + anchor + "</li>"
                    + "<li>Item 2" + anchor1 + "</li>"
                    + "<li>Item 3" + anchor2 + "</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<p>Before</p>"
                    + "<ul><li>Item 1" + anchor + "</li>"
                    + "<li>" + anchor1 + "Item 2</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<p>Before</p>"
                    + "<ul><li>" + anchor + "Item 1</li>"
                    + "<li>Item 2" + anchor1 + "</li>"
                    + "</ul>"
                    + "<p>After</p>",
            // images
            "<ul><li>" + imgSmall + imgSmall + "Two images in a row</li>"
                    + "<li>" + imgSmall + imgSmall + "Two images in a row</li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>" + imgSmall + imgSmall + "Two images in a row</li>"
                    + "<li>" + imgSmall + imgSmall + "Two images in a row</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<ul><li>" + imgSmall + "at different " + imgSmall + " positions " + imgSmall
                    + "</li>"
                    + "<li>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</li>"
                    + "<li>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<ul><li>" + imgSmall + "</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>" + imgSmall + "</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<ul><li>Item</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>Item</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<ul><li>" + imgSmall + "</li>"
                    + "<li>Item</li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>" + imgSmall + "</li>"
                    + "<li>Item</li>"
                    + "</ul>"
                    + "<p>After</p>",
            "<ul><li>Item</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "<li>Item</li>"
                    + "</ul>",
            "<p>Before</p>"
                    + "<ul><li>Item</li>"
                    + "<li>" + imgSmall + "</li>"
                    + "<li>Item</li>"
                    + "</ul>"
                    + "<p>After</p>"
        ],

        FROMPSEL_EXCEPTIONS_LIST: [
            {
                "index": 2,
                "startPos": 6,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 2,
                "startPos": 6,
                "correctedStartPos": 7,
                "isIE": true,
                "isGecko": false,
                "isWebKit": false
            },
            {
                "index": 2,
                "startPos": 40,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 2,
                "startPos": 40,
                "correctedStartPos": 41,
                "isIE": true,
                "isGecko": false,
                "isWebKit": false
            },
            {
                "index": 2,
                "startPos": 74,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 2,
                "startPos": 74,
                "correctedStartPos": 75,
                "isIE": true,
                "isGecko": false,
                "isWebKit": false
            },
            {
                "index": 3,
                "startPos": 13,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 3,
                "startPos": 13,
                "correctedStartPos": 14,
                "isIE": true,
                "isGecko": false,
                "isWebKit": false
            },
            {
                "index": 3,
                "startPos": 47,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 3,
                "startPos": 47,
                "correctedStartPos": 48,
                "isIE": true,
                "isGecko": false,
                "isWebKit": false
            },
            {
                "index": 3,
                "startPos": 81,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 3,
                "startPos": 81,
                "correctedStartPos": 82,
                "isIE": true,
                "isGecko": false,
                "isWebKit": false
            }
        ],

        /**
         * Tests if a node list gets correctly created from a processing selection by
         * checking the corner nodes. Table-related test cases.
         */
        testFromSelectionTable: function(testIndex, testRun) {
            var tst = CUI.rte.testing.NodeListTests;
            if (testRun == null) {
                return deferredFromPSelTestSet(tst.FROMPSEL_HTMLS_TABLE,
                        tst.FROMPSEL_EXCEPTIONS_TABLE, testIndex);
            }
            return testFromPSelTest(tst.FROMPSEL_HTMLS_TABLE, tst.FROMPSEL_EXCEPTIONS_TABLE,
                    testIndex, testRun);
        },

        FROMPSEL_HTMLS_TABLE: [
            "<table border=\"1\">"
                    + "<tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr>"
                    + "<tr><td>Cell 4</td><td>Cell 5</td><td>Cell 6</td></tr>"
                    + "</table>",
            "<p>Before</p>"
                    + "<table border=\"1\">"
                    + "<tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr>"
                    + "<tr><td>Cell 4</td><td>Cell 5</td><td>Cell 6</td></tr>"
                    + "</table>"
                    + "<p>After</p>",
            "<table border=\"1\">"
                    + "<tr><td>Cell 1<br>Line 2</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4<br>Line 2</td></tr>"
                    + "</table>",
            "<p>Before</p>"
                    + "<table border=\"1\">"
                    + "<tr><td>Cell 1<br>Line 2</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4<br>Line 2</td></tr>"
                    + "</table>"
                    + "<p>After</p>",
            "<table border=\"1\">"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>1.1</td><td>1.2</td><td>1.3</td></tr>"
                    + "<tr><td>1.4</td><td>1.5</td><td>1.6</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>2.1</td><td>2.2</td><td>2.3</td></tr>"
                    + "<tr><td>2.4</td><td>2.5</td><td>2.6</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>3.1</td><td>3.2</td><td>3.3</td></tr>"
                    + "<tr><td>3.4</td><td>3.5</td><td>3.6</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>4.1</td><td>4.2</td><td>4.3</td></tr>"
                    + "<tr><td>4.4</td><td>4.5</td><td>4.6</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "</table>",
            "<p>Before</p>"
                    + "<table border=\"1\">"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>1.1</td><td>1.2</td></tr>"
                    + "<tr><td>1.3</td><td>1.4</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>2.1</td><td>2.2</td></tr>"
                    + "<tr><td>2.3</td><td>2.4</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>3.1</td><td>3.2</td></tr>"
                    + "<tr><td>3.3</td><td>3.4</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>4.1</td><td>4.2</td></tr>"
                    + "<tr><td>4.3</td><td>4.4</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "</table>"
                    + "<p>After</p>",
            "<table border=\"1\">"
                    + "<tr><td><p>Para 1</p><p>Para 2</p></td>"
                    + "<td><p>Para 3</p><p>Para 4</p></td>"
                    + "</table>",
            "<p>Before</p>"
                    + "<table border=\"1\">"
                    + "<tr><td><p>Para 1</p><p>Para 2</p></td>"
                    + "<td><p>Para 3</p><p>Para 4</p></td>"
                    + "</table>"
                    + "<p>After</p>",
            // anchor
            "<table border=\"1\">"
                    + "<tr><td>" + anchor + "Anchors in" + anchor1 + "a table cell"
                    + anchor2 + "</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>" + anchor + "Cell 1</td></tr>"
                    + "<tr><td>" + anchor1 + "Cell 2</td></tr>"
                    + "<tr><td>" + anchor2 + "Cell 3</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>Cell 1" + anchor + "</td></tr>"
                    + "<tr><td>Cell 2" + anchor1 + "</td></tr>"
                    + "<tr><td>Cell 3" + anchor2 + "</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>Cell 1" + anchor + "</td></tr>"
                    + "<tr><td>" + anchor1 + "Cell 2</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>" + anchor + "Cell 1</td></tr>"
                    + "<tr><td>Cell 2" + anchor1 + "</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td><p>Para 1</p><p>Para" + anchor + "2<br>Line 2</p></td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td><p>" + anchor + "Cell 1</p>"
                    + "<p>Para 2" + anchor1 + "</p></td></tr>"
                    + "</table>",
            // images
            "<table border=\"1\">"
                    + "<tr><td>" + imgSmall + imgSmall + "Two images in a row</td>"
                    + "<td>Two images in a row" + imgSmall + imgSmall + "</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</td>"
                    + "<td>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>" + imgSmall + "</td>"
                    + "<td>" + imgSmall + imgSmall + "</td></tr>"
                    + "<tr><td><p>" + imgSmall + "</p></td>"
                    + "<td>" + imgSmall + "<br>" + imgSmall + "</td></tr>"
                    + "<tr><td><p>" + imgSmall + "</p><p>" + imgSmall + "</p></td>"
                    + "<td><p>Before</p><p>" + imgSmall + "</p><p>After</p></td></tr>"
                    + "</table>"
        ],

        FROMPSEL_EXCEPTIONS_TABLE: [
            // these are used for the last block inside a table cell, which is counted
            // for 2 characters internally (for avoiding even more complexity)
            {
                "index": 6,
                "startPos": 13,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 7,
                "startPos": 20,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 7,
                "startPos": 35,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 17,
                "startPos": 6,
                "charCnt": 1,
                "correctedCharCnt": 0
            },
            {
                "index": 17,
                "startPos": 15,
                "charCnt": 1,
                "correctedCharCnt": 0
            }
        ],

        testFromSelectionBrowserSpecific: function(testIndex, testRun) {
            var tst = CUI.rte.testing.NodeListTests;
            var htmls = (com.ua.isIE ? tst.FROMPSEL_HTMLS_IE
                    : (com.ua.isGecko ? tst.FROMPSEL_HTMLS_GECKO
                        : tst.FROMPSEL_HTMLS_WEBKIT));
            var exceptions = (com.ua.isIE ? tst.FROMPSEL_EXCEPTIONS_IE
                    : (com.ua.isGecko ? tst.FROMPSEL_EXCEPTIONS_GECKO
                        : tst.FROMPSEL_EXCEPTIONS_WEBKIT));
            if (testRun == null) {
                return deferredFromPSelTestSet(htmls, exceptions, testIndex);
            }
            return testFromPSelTest(htmls, exceptions, testIndex, testRun);
        },

        FROMPSEL_HTMLS_IE: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            // todo fix test lib to cover this correctly (currently "false positive")
            // "<p>Testing empty</p><p>&nbsp;</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + "&nbsp;an anchor.</p>",
            "<p>" + anchor + "&nbsp;BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + "&nbsp;anchors " + anchor1 + "&nbsp;in one "
                    + anchor2 + "&nbsp;para.</p>"
        ],

        FROMPSEL_HTMLS_GECKO: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>"
        ],

        FROMPSEL_HTMLS_WEBKIT: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>"
        ],

        FROMPSEL_EXCEPTIONS_IE: [
            // not yet required
        ],

        FROMPSEL_EXCEPTIONS_GECKO: [
            // Gecko cannot position the caret "behind" a <br> in an empty paragraph
            {
                "index": 0,
                "startPos": 15,
                "correctedStartPos": 14
            }
        ],

        FROMPSEL_EXCEPTIONS_WEBKIT: [
            // Webkit cannot position the caret "behind" a <br> in an empty paragraph
            {
                "index": 0,
                "startPos": 15,
                "correctedStartPos": 14
            }
        ],


        // Testing the test lib ------------------------------------------------------------

        testNodeListLib: function() {
            var result = testCreateContent();
            if (result != "success") {
                return "createContent: " + result;
            }
            return "success";
        }

    };

}();


CUI.rte.testing.Commons.registerSection("nodelist", "Node list-related stuff");
CUI.rte.testing.Commons.registerTest(
        "nodelist", "NodeList.testFromSelectionBasics",
        CUI.rte.testing.NodeListTests.testFromSelectionBasics);
CUI.rte.testing.Commons.registerTest(
        "nodelist", "NodeList.testFromSelectionList",
        CUI.rte.testing.NodeListTests.testFromSelectionList);
CUI.rte.testing.Commons.registerTest(
        "nodelist", "NodeList.testFromSelectionTable",
        CUI.rte.testing.NodeListTests.testFromSelectionTable);
CUI.rte.testing.Commons.registerTest(
        "nodelist", "NodeList.testFromSelectionBrowserSpecific",
        CUI.rte.testing.NodeListTests.testFromSelectionBrowserSpecific);
CUI.rte.testing.Commons.registerTest(
        "nodelist", "NodeList.testNodeListLib",
        CUI.rte.testing.NodeListTests.testNodeListLib);