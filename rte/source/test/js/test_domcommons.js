CUI.rte.testing.DomCommons = function() {

    var tcm = CUI.rte.testing.Commons;

    var com = CUI.rte.Common;

    var dpr = CUI.rte.DomProcessor;

    var NBSP = String.fromCharCode(160);

    var checkTag = function(def, node) {
        if (def == null) {
            if (node == null) {
                return null;
            }
            return "should be: null; is: " + com.dumpNodeRecursively(node);
        }
        if (node == null) {
            return "should be: " + def + "; is: null";
        }
        var nodeType = 3;
        var text = def;
        var tag = null;
        if (com.strStartsWith(def, "<")) {
            nodeType = 1;
            tag = def.substring(1);
            text = null;
        }
        if (node.nodeType != nodeType) {
            return "invalid node type; is: " + node.nodeType + "; should be: " + nodeType;
        }
        if (nodeType == 1) {
            return (com.isTag(node, tag) ? null : "invalid tag name; is: " + node.tagName
                    + "; should be: " + tag);
        }
        return (text == node.nodeValue ? null : "invalid text; is: " + node.nodeValue + "; "
                + "should be: " + text);
    };

    return {

        /**
         * Tests DOM traversal for generic nodes.
         */
        testNodeTraversal: function() {
            var tst = CUI.rte.testing.DomCommons;
            var span = document.createElement("span");
            var context = tcm.createFakeEditContext(span);
            var testCnt = tst.TRAVERSAL_TEST_HTML.length;
            for (var t = 0; t < testCnt; t++) {
                var testHtml = tst.TRAVERSAL_TEST_HTML[t];
                var expectedFirstNode = tst.TRAVERSAL_TEST_FIRST_NODE[t];
                var expectedLastNode = tst.TRAVERSAL_TEST_LAST_NODE[t];
                var nextNodes = tst.TRAVERSAL_TEST_NEXT_NODE[t];
                var prevNodes = tst.TRAVERSAL_TEST_PREVIOUS_NODE[t];
                span.innerHTML = testHtml;
                var firstNode = com.getFirstChild(span);
                var err = checkTag(expectedFirstNode, firstNode);
                if (err != null) {
                    return "Could not retrieve first node; " + err
                            + " (HTML: " + testHtml + ")";
                }
                var nextCnt = nextNodes.length;
                var node = span.childNodes[0];
                for (var nt = 0; nt < nextCnt; nt++) {
                    node = com.getNextNode(context, node);
                    err = checkTag(nextNodes[nt], node);
                    if (err != null) {
                        return "Could not retrieve next node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
                var lastNode = com.getLastChild(span);
                err = checkTag(expectedLastNode, lastNode);
                if (err != null) {
                    return "Could not retrieve last node; " + err
                            + " (HTML: " + testHtml + ")";
                }
                var prevCnt = prevNodes.length;
                node = lastNode;
                for (var pt = 0; pt < prevCnt; pt++) {
                    node = com.getPreviousNode(context, node);
                    err = checkTag(prevNodes[pt], node);
                    if (err != null) {
                        return "Could not retrieve previous node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
            }
            return "success";
        },

        TRAVERSAL_TEST_HTML: [
            "<p>Simple test</p>",
            "<p>Multi</p><p>line</p>",
            "<p><b>Nested</b> test</p>",
            "<p><b><i>Deeply</i> <u>nested</u></b></p>",
            "<p>Test with a<br>linefeed.</p>",
            "<p><br>Complex<br>linefeed<br></p>",
            "<p>Before</p><ul><li>Item 1</li><li>Item 2</li><p>After</p>",
            "<p></p><p>Empty block</p>",
            "<p>Empty block</p></p>"
        ],

        TRAVERSAL_TEST_FIRST_NODE: [
            "Simple test",
            "Multi",
            "Nested",
            "Deeply",
            "Test with a",
            "<br",
            "Before",
            "<p",
            "Empty block"
        ],

        TRAVERSAL_TEST_NEXT_NODE: [
            [
                "Simple test",
                null
            ], [
                "Multi",
                "<p",
                "line",
                null
            ], [
                "<b",
                "Nested",
                " test",
                null
            ], [
                "<b",
                "<i",
                "Deeply",
                " ",
                "<u",
                "nested",
                null
            ], [
                "Test with a",
                "<br",
                "linefeed.",
                null
            ], [
                "<br",
                "Complex",
                "<br",
                "linefeed",
                "<br",
                null
            ], [
                "Before",
                "<ul",
                "<li",
                "Item 1",
                "<li",
                "Item 2",
                "<p",
                "After",
                null
            ], [
                "<p",
                "Empty block",
                null
            ], [
                "Empty block",
                "<p",
                null
            ]
        ],

        TRAVERSAL_TEST_LAST_NODE: [
            "Simple test",
            "line",
            " test",
            "nested",
            "linefeed.",
            "<br",
            "After",
            "Empty block",
            "<p"
        ],

        TRAVERSAL_TEST_PREVIOUS_NODE: [
            [
                "<p",
                "<span",    // implicit test root
                null
            ], [
                "<p",
                "Multi",
                "<p",
                "<span",    // implicit test root
                null
            ], [
                "Nested",
                "<b",
                "<p",
                "<span",    // implict test root
                null
            ], [
                "<u",
                " ",
                "Deeply",
                "<i",
                "<b",
                "<p",
                "<span",    // implict test root
                null
            ], [
                "<br",
                "Test with a",
                "<p",
                "<span",    // implicit test root
                null
            ], [
                "linefeed",
                "<br",
                "Complex",
                "<br",
                "<p",
                "<span",    // implicit test root
                null
            ], [
                "<p",
                "Item 2",
                "<li",
                "Item 1",
                "<li",
                "<ul",
                "Before",
                "<p",
                "<span",    // implicit test root
                null
            ], [
                "<p",
                "<p",
                "<span",    // implicit test root
                null
            ], [
                "Empty block",
                "<p",
                "<span",
                null        // implicit test root
            ]
        ],

        /**
         * Tests DOM traversal for text nodes
         */
        testTextTraversal: function() {
            var tst = CUI.rte.testing.DomCommons;
            var span = document.createElement("span");
            var context = tcm.createFakeEditContext(span);
            var testCnt = tst.TRAVERSAL_TEST_HTML.length;
            for (var t = 0; t < testCnt; t++) {
                var testHtml = tst.TRAVERSAL_TEST_HTML[t];
                var expectedFirstTextNode = tst.TRAVERSAL_TEST_FIRST_TEXT_NODE[t];
                var expectedFirstCharNode = tst.TRAVERSAL_TEST_FIRST_CHARACTER_NODE[t];
                var expectedLastTextNode = tst.TRAVERSAL_TEST_LAST_TEXT_NODE[t];
                var expectedLastCharNode = tst.TRAVERSAL_TEST_LAST_CHARACTER_NODE[t];
                var nextTexts = tst.TRAVERSAL_TEST_NEXT_TEXT_NODE[t];
                var nextCharNodes = tst.TRAVERSAL_TEST_NEXT_CHARACTER_NODE[t];
                var prevTexts = tst.TRAVERSAL_TEST_PREVIOUS_TEXT_NODE[t];
                var prevCharNodes = tst.TRAVERSAL_TEST_PREVIOUS_CHARACTER_NODE[t];
                span.innerHTML = testHtml;
                // text nodes
                var firstTextNode = com.getFirstTextChild(span);
                var err = checkTag(expectedFirstTextNode, firstTextNode);
                if (err != null) {
                    return "Could not retrieve first text node; " + err
                            + " (HTML: " + testHtml + ")";
                }
                var nextCnt = nextTexts.length;
                var node = firstTextNode;
                for (var nt = 0; nt < nextCnt; nt++) {
                    node = com.getNextTextNode(context, node);
                    err = checkTag(nextTexts[nt], node);
                    if (err != null) {
                        return "Could not retrieve next text node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
                // character nodes
                var firstCharNode = com.getFirstTextChild(span, true);
                err = checkTag(expectedFirstCharNode, firstCharNode);
                if (err != null) {
                    return "Could not retrieve first character node; " + err
                            + " (HTML: " + testHtml + ")";
                }
                nextCnt = nextCharNodes.length;
                node = firstCharNode;
                for (var nc = 0; nc < nextCnt; nc++) {
                    node = com.getNextCharacterNode(context, node);
                    err = checkTag(nextCharNodes[nc], node);
                    if (err != null) {
                        return "Could not retrieve next character node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
                var lastTextNode = com.getLastTextChild(span);
                err = checkTag(expectedLastTextNode, lastTextNode);
                if (err != null) {
                    return "Could not retrieve last text node; " + err
                            + " (HTML: " + testHtml + ")";

                }
                var prevCnt = prevTexts.length;
                node = lastTextNode;
                for (var pt = 0; pt < prevCnt; pt++) {
                    node = com.getPreviousTextNode(context, node);
                    err = checkTag(prevTexts[pt], node);
                    if (err != null) {
                        return "Could not retrieve previous text node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
                var lastCharNode = com.getLastTextChild(span, true);
                err = checkTag(expectedLastCharNode, lastCharNode);
                if (err != null) {
                    return "Could not retrieve last character node; " + err
                            + " (HTML: " + testHtml + ")";
                }
                prevCnt = prevCharNodes.length;
                node = lastCharNode;
                for (var pc = 0; pc < prevCnt; pc++) {
                    node = com.getPreviousCharacterNode(context, node);
                    err = checkTag(prevCharNodes[pc], node);
                    if (err != null) {
                        return "Could not retrieve previous character node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
            }
            return "success";
        },

        TRAVERSAL_TEST_FIRST_TEXT_NODE: [
            "Simple test",
            "Multi",
            "Nested",
            "Deeply",
            "Test with a",
            "Complex",
            "Before",
            "Empty block",
            "Empty block"
        ],

        TRAVERSAL_TEST_FIRST_CHARACTER_NODE: [
            "Simple test",
            "Multi",
            "Nested",
            "Deeply",
            "Test with a",
            "<br",
            "Before",
            "<p",
            "Empty block"
        ],

        TRAVERSAL_TEST_NEXT_TEXT_NODE: [
            [
                null
            ], [
                "line",
                null
            ], [
                " test",
                null
            ], [
                " ",
                "nested",
                null
            ], [
                "linefeed.",
                null
            ], [
                "linefeed",
                null
            ], [
                "Item 1",
                "Item 2",
                "After",
                null
            ], [
                null
            ], [
                null
            ]
        ],

        TRAVERSAL_TEST_NEXT_CHARACTER_NODE: [
            [
                null
            ], [
                "line",
                null
            ], [
                " test",
                null
            ], [
                " ",
                "nested",
                null
            ], [
                "<br",
                "linefeed.",
                null
            ], [
                "Complex",
                "<br",
                "linefeed",
                "<br",
                null
            ], [
                "Item 1",
                "Item 2",
                "After",
                null
            ], [
                "Empty block",
                null
            ], [
                "<p",
                null
            ]
        ],

        TRAVERSAL_TEST_LAST_TEXT_NODE: [
            "Simple test",
            "line",
            " test",
            "nested",
            "linefeed.",
            "linefeed",
            "After",
            "Empty block",
            "Empty block"
        ],

        TRAVERSAL_TEST_LAST_CHARACTER_NODE: [
            "Simple test",
            "line",
            " test",
            "nested",
            "linefeed.",
            "<br",
            "After",
            "Empty block",
            "<p"
        ],

        TRAVERSAL_TEST_PREVIOUS_TEXT_NODE: [
            [
                null
            ], [
                "Multi",
                null
            ], [
                "Nested",
                null
            ], [
                " ",
                "Deeply",
                null
            ], [
                "Test with a",
                null
            ], [
                "Complex",
                null
            ], [
                "Item 2",
                "Item 1",
                "Before",
                null
            ], [
                null
            ], [
                null
            ]
        ],

        TRAVERSAL_TEST_PREVIOUS_CHARACTER_NODE: [
            [
                null
            ], [
                "Multi",
                null
            ], [
                "Nested",
                null
            ], [
                " ",
                "Deeply",
                null
            ], [
                "<br",
                "Test with a",
                null
            ], [
                "linefeed",
                "<br",
                "Complex",
                "<br",
                null
            ], [
                "Item 2",
                "Item 1",
                "Before",
                null
            ], [
                "<p",
                null
            ], [
                "Empty block",
                null
            ]

        ],

        /**
         * Tests DOM traversal for text nodes with break tags
         */
        testTextTraversalBreakTags: function() {
            var tst = CUI.rte.testing.DomCommons;
            var span = document.createElement("span");
            var context = tcm.createFakeEditContext(span);
            var testHtmls = tst.TRAVERSAL_TEST_HTML;
            var testCnt = tst.TRAVERSAL_TEST_BREAKTAGS.length;
            for (var t = 0; t < testCnt; t++) {
                var testDef = tst.TRAVERSAL_TEST_BREAKTAGS[t];
                var testIndex = testDef["index"];
                var testHtml = testHtmls[testIndex];
                var breakTags = testDef.breakTags;
                span.innerHTML = testHtml;
                // next text node
                var expectedResults = testDef.nextTextResult;
                var node = com.getFirstTextChild(span);
                var err = checkTag(expectedResults[0], node);
                if (err != null) {
                    return "Could not retrieve first text node; " + err
                            + " (HTML: " + testHtml + ")";
                }
                var nextCnt = expectedResults.length;
                for (var nt = 1; nt < nextCnt; nt++) {
                    node = com.getNextTextNode(context, node, breakTags);
                    err = checkTag(expectedResults[nt], node);
                    if (err != null) {
                        return "Could not retrieve next text node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
                // previous text node
                expectedResults = testDef.previousTextResult;
                node = com.getLastTextChild(span);
                err = checkTag(expectedResults[0], node);
                if (err != null) {
                    return "Could not retrieve last text node; " + err
                            + " (HTML: " + testHtml + ")";
                }
                var prevCnt = expectedResults.length;
                for (var pt = 1; pt < prevCnt; pt++) {
                    node = com.getPreviousTextNode(context, node, breakTags);
                    err = checkTag(expectedResults[pt], node);
                    if (err != null) {
                        return "Could not retrieve previous text node; " + err
                                + " (HTML: " + testHtml + ")";
                    }
                }
            }
            // check special cases
            com.removeAllChildren(span);
            var p1 = document.createElement("p");
            span.appendChild(p1);
            var p2 = document.createElement("p");
            span.appendChild(p2);
            var txt1 = document.createTextNode("Text 1");
            p1.appendChild(txt1);
            var b = document.createElement("b");
            p2.appendChild(b);
            var txt2 = document.createTextNode("Text 2");
            b.appendChild(txt2);
            if (com.getPreviousCharacterNode(context, p2, [ "p" ]) != null) {
                return "Special cases: P2 may not have a previous character node.";
            }
            if (com.getPreviousTextNode(context, p2, [ "p" ]) != null) {
                return "Special cases: P2 may not have a previous text node.";
            }
            if (com.getNextCharacterNode(context, p2, [ "p" ]) != txt2) {
                return "Special cases: P2 must have a next character node.";
            }
            if (com.getNextTextNode(context, p2, [ "p" ]) != txt2) {
                return "Special cases: P2 must have a next text node.";
            }
            return "success";
        },

        TRAVERSAL_TEST_BREAKTAGS: [ {
                "index": 6,
                "breakTags": "li",
                "nextTextResult": [
                    "Before",
                    null
                ],
                "previousTextResult": [
                    "After",
                    "Item 2",
                    null
                ]
            }, {
                "index": 6,
                "breakTags": [ "li", "p" ],
                "nextTextResult": [
                    "Before",
                    null
                ],
                "previousTextResult": [
                    "After",
                    null
                ]
            }, {
                "index": 6,
                "breakTags": [ "p" ],
                "nextTextResult": [
                    "Before",
                    "Item 1",
                    "Item 2",
                    null
                ],
                "previousTextResult": [
                    "After",
                    null
                ]
            }
        ],

        /**
         * Tests the mapping of nodes to individual char positions.
         */
        testNodeToPositionMapping: function() {
            var tst = CUI.rte.testing.DomCommons;
            var span = document.createElement("span");
            var context = tcm.createFakeEditContext(span);
            var testCnt = tst.NODEMAPPING_TEST_HTML.length;
            for (var t = 0; t < testCnt; t++) {
                var testHtml = tst.NODEMAPPING_TEST_HTML[t];
                span.innerHTML = testHtml;
                var expectedResult = tst.NODEMAPPING_OFFSETS[t];
                var offsetCnt = expectedResult.length;
                var node = span;
                for (var o = 0; o < offsetCnt; o++) {
                    node = com.getNextNode(context, node);
                    if (!node) {
                        return "Unexpected end of processing; test html: " + testHtml + "; "
                            + "node #" + o;
                    }
                    var expectedOffset = expectedResult[o];
                    var charPos = com.getCharacterOffsetForNode(context, node);
                    if (charPos != expectedOffset) {
                        return "Invalid offset for node #" + o + ": "
                                + com.dumpNodeRecursively(node) + "; is: " + charPos + "; "
                                + "expected: " + expectedOffset;
                    }
                }
            }
            return "success";
        },

        NODEMAPPING_TEST_HTML: [
            // basics
            "<p>Simple test.</p>",
            "<p>Text <b>with</b> structure</p>",
            "<p>Text with<br>linefeed.</p>",
            "<p>Para 1</p><p>Para 2</p>",
            "<p>Text with <a name=\"anchor\"></a>an anchor.</p>",
            "<p>Empty</p><p><br></p><p>paragraph</p>",
            "<p>Empty</p><p>&nbsp;</p><p>paragraph</p>",
            // list-related test cases
            "<ul><li>Item 1</li><li>Item 2</li></ul>",
            "<ul><li>Item 1<ul><li>Item 1.1</li><li>Item 1.2</li></ul></li><li>"
                    + "Item 2<ul><li>Item 2.1</li><li>Item 2.2</li></ul></li></ul>",
            "<ul><li>Item 1<ul><li>Item 1.1<ul><li>Item 1.1.1</li></ul><ol><li>Item 1.1.2"
                    + "</li></ol></li><li>Item 1.2</li></ul><ol><li>Item 1.3</li>"
                    + "<li>Item 1.4</li></ul>",
            // table-related test cases
            "<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr></tbody></table>",
            "<p>Before</p>"
                    + "<table><tbody><tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr></tbody></table>"
                    + "<p>After</p>",
            "<table><tbody><tr><td>"
                    + "<table><tbody><tr><td>1.1</td><td>1.2</td></tr>"
                        + "<tr><td>1.3</td><td>1.4</td></tr></tbody></table>"
                    + "</td><td>"
                    + "<table><tbody><tr><td>2.1</td><td>2.2</td></tr>"
                        + "<tr><td>2.3</td><td>2.4</td></tr></tbody></table>"
                    + "</td></tr><tr><td>"
                    + "<table><tbody><tr><td>3.1</td><td>3.2</td></tr>"
                        + "<tr><td>3.3</td><td>3.4</td></tr></tbody></table>"
                    + "</td><td>"
                    + "<table><tbody><tr><td>4.1</td><td>4.2</td></tr>"
                        + "<tr><td>4.3</td><td>4.4</td></tr></tbody></table>"
                    + "</td></tr></tbody></table>"
        ],

        // specify the character positions for each node of the corresponding test case
        NODEMAPPING_OFFSETS: [
            // basics
            [ 0, 0 ],
            [ 0, 0, 5, 5, 9 ],
            [ 0, 0, 9, 10 ],
            [ 0, 0, 7, 7 ],
            [ 0, 0, 10, 11 ],
            [ 0, 0, 6, 6, 8, 8 ],
            [ 0, 0, 6, 6, 8, 8 ],
            // list-related test cases
            [ 0, 0, 0, 7, 7 ],
            [ 0, 0, 0, 6, 7, 7, 16, 16, 25, 25, 31, 32, 32, 41, 41 ],
            [ 0, 0, 0, 6, 7, 7, 15, 16, 16, 27, 27, 27, 38, 38, 47, 47, 47 ],
            // table-related test cases
            [ 0, 0, 0, 0, 0, 7, 7, 14, 14, 14, 21, 21 ], [
                // paragraph before
                0, 0,
                // the table
                7, 7, 7, 7, 7, 14, 14, 21, 21, 21, 28, 28,
                // paragraph after
                35, 35
            ], [
                // outer table
                0, 0, 0,
                // inner table: top left  (incl. the introducing td)
                0,
                0, 0, 0, 0, 0, 4, 4, 8, 8, 8, 12, 12,
                // inner table: top right (incl. the introducing td)
                16,
                16, 16, 16, 16, 16, 20, 20, 24, 24, 24, 28, 28,
                // inner table: bottom left (incl. the introducing tr, td)
                32, 32,
                32, 32, 32, 32, 32, 36, 36, 40, 40, 40, 44, 44,
                // inner table: bottom right  (incl. the introducing td)
                48,
                48, 48, 48, 48, 48, 52, 52, 56, 56, 56, 60, 60
            ]
        ],

        testPositionToNodeMapping: function() {
            var tst = CUI.rte.testing.DomCommons;
            var span = document.createElement("span");
            var context = tcm.createFakeEditContext(span);
            var testCnt = tst.NODEMAPPING_TEST_HTML.length;
            for (var t = 0; t < testCnt; t++) {
                var testHtml = tst.NODEMAPPING_TEST_HTML[t];
                span.innerHTML = testHtml;
                var expectedResult = tst.NODEMAPPING_NODES[t];
                var resCnt = expectedResult.length;
                var charPos = 0;
                for (var r = 0; r < resCnt; r++) {
                    var stepResult = expectedResult[r];
                    var isTagExpected = com.strStartsWith(stepResult, "<");
                    var charCnt = (isTagExpected ? 1 : stepResult.length);
                    if (com.strEndsWith(stepResult, "[")) {
                        stepResult = stepResult.substring(0, stepResult.length - 1);
                    }
                    for (var c = 0; c < charCnt; c++) {
                        var result = com.getNodeAtPosition(context, charPos);
                        if (!result) {
                            return "No node found for position #" + charPos + " (HTML: "
                                    + testHtml + ")";
                        }
                        var resultNode = result.dom;
                        var cmpResult = checkTag(stepResult, resultNode);
                        if (cmpResult != null) {
                            return "Invalid result for character position #" + charPos
                                    + " (" + testHtml + "): " + cmpResult;
                        }
                        if (!isTagExpected && (result.offset != c)) {
                            return "Invalid character offset for position #" + charPos
                                    + "; is: " + result.offset + "; should be: " + c
                                    + " (" + testHtml + ")";
                        }
                        charPos++;
                    }
                }
            }
            return "success";
        },

        // Specify the node that is valid for each character position. You don't have to
        // specify a node def for each character position, but only once, as the length
        // is calculated automatically. Note that at the end of each edit block the node
        // of the block must be returned, e.g. <p>Test</p> must be defined as [ "Test",
        // "<p" ]
        NODEMAPPING_NODES: [
            // basics
            [
                "Simple test.",
                "<p"        // "<p" signals that a "p" tag is expected
            ], [
                "Text ",
                "with",
                " structure",
                "<p"
            ], [
                "Text with",
                "<br",
                "linefeed.",
                 "<p"
            ], [
                "Para 1",
                "<p",
                "Para 2",
                "<p"
            ], [
                "Text with ",
                "<a",
                "an anchor.",
                "<p"
            ], [
                "Empty",
                "<p",
                "<br",
                "<p",
                "paragraph",
                "<p"
            ], [
                "Empty",
                "<p",
                NBSP,
                "<p",
                "paragraph",
                "<p"
            ],
            // list-related test cases
            [
                "Item 1",
                "<li",
                "Item 2",
                "<li"
            ], [
                "Item 1[",  // "[" signals that "Item 1" must be returned 1 time more than it should according to its character lengthh
                "Item 1.1",
                "<li",
                "Item 1.2",
                "<li",
                "Item 2[",
                "Item 2.1",
                "<li",
                "Item 2.2",
                "<li"
            ], [
                "Item 1[",
                "Item 1.1[",
                "Item 1.1.1",
                "<li",
                "Item 1.1.2",
                "<li",
                "Item 1.2",
                "<li",
                "Item 1.3",
                "<li",
                "Item 1.4",
                "<li"
            ],
            // table-related test cases
            [
                "Cell 1",
                "<td",
                "Cell 2",
                "<td",
                "Cell 3",
                "<td",
                "Cell 4",
                "<td"
            ], [
                "Before",
                "<p",
                "Cell 1",
                "<td",
                "Cell 2",
                "<td",
                "Cell 3",
                "<td",
                "Cell 4",
                "<td",
                "After",
                "<p"
            ], [
                "1.1",
                "<td",
                "1.2",
                "<td",
                "1.3",
                "<td",
                "1.4",
                "<td",
                "2.1",
                "<td",
                "2.2",
                "<td",
                "2.3",
                "<td",
                "2.4",
                "<td",
                "3.1",
                "<td",
                "3.2",
                "<td",
                "3.3",
                "<td",
                "3.4",
                "<td",
                "4.1",
                "<td",
                "4.2",
                "<td",
                "4.3",
                "<td",
                "4.4",
                "<td"
            ]
        ],

        testCopyAttributes: function() {
            var tst = CUI.rte.testing.DomCommons;
            var t, testHtml, resultHtml, dom1, dom2;
            // use serializer to check result, as the copy attributes method has to
            // work correctly with the serializer
            var root = document.createElement("span");
            var resultRoot = document.createElement("span");
            var context = tcm.createFakeEditContext(root);
            var serializer = new CUI.rte.HtmlSerializer();
            // common test cases
            for (t = 0; t < tst.COPY_ATTRIBUTES_HTMLS.length; t++) {
                testHtml = tst.COPY_ATTRIBUTES_HTMLS[t];
                root.innerHTML = testHtml;
                dom1 = root.childNodes[0];
                dom2 = document.createElement(dom1.tagName);
                resultRoot.appendChild(dom2);
                com.copyAttributes(dom1, dom2);
                resultHtml = serializer.serialize(context, resultRoot);
                resultRoot.removeChild(dom2);
                if (!tcm.compareHTML(resultHtml, testHtml, true)) {
                    return "Invalid serialized HTML (case #" + t + "); is: " + resultHtml
                        + "; expected: " + testHtml;
                }
            }
            // table-related test cases
            for (t = 0; t < tst.COPY_ATTRIBUTES_TABLE.length; t++) {
                testHtml = tst.COPY_ATTRIBUTES_TABLE[t];
                // IE always requires a full table, otherwise chokes
                var fullHtml = "<table><tbody><tr>" + testHtml + "</tr></tbody></table>";
                var fullResultHtml = "<table><tbody><tr><td></td></tr></tbody></table>";
                root.innerHTML = fullHtml;
                resultRoot.innerHTML = fullResultHtml;
                dom1 = root.childNodes[0].childNodes[0].childNodes[0].childNodes[0];
                dom2 = resultRoot.childNodes[0].childNodes[0].childNodes[0].childNodes[0];
                com.copyAttributes(dom1, dom2);
                resultHtml = serializer.serialize(context, dom2.parentNode);
                resultRoot.removeChild(resultRoot.childNodes[0]);
                if (!tcm.compareHTML(resultHtml, testHtml, true)) {
                    return "Invalid serialized HTML table (case #" + t + "); is: "
                        + resultHtml + "; expected: " + testHtml;
                }
            }
            return "success";
        },

        COPY_ATTRIBUTES_HTMLS: [
            "<p align=\"center\">&nbsp;</p>",
            "<span class=\"blubb\"></span>",
            "<span style=\"text-align: center;\"></span>"
        ],

        COPY_ATTRIBUTES_TABLE: [
            "<td colspan=\"2\">&nbsp;</td>"
        ],

        testGetEmptyLine: function(testIndex) {
            var tst = CUI.rte.testing.DomCommons;
            var s = 0;
            var e = tst.EMPTY_LINE_HTMLS.length;
            if (testIndex != null) {
                s = parseInt(testIndex);
                if (s >= tst.EMPTY_LINE_HTMLS.length) {
                    return "invalid";
                }
                e = s + 1;
            }
            var root = document.createElement("span");
            var context = tcm.createFakeEditContext(root);
            for (var t = s; t < e; t++) {
                var html = tst.EMPTY_LINE_HTMLS[t];
                root.innerHTML = html;
                var toCheck = com.getFirstTextChild(root, true, false);
                var checkOffset = null;
                if (toCheck == null) {
                    toCheck = com.getFirstChild(root);
                } else {
                    if (toCheck.nodeType == 3) {
                        checkOffset = 0;
                    }
                }
                var selection = {
                    "startNode": toCheck,
                    "startOffset": checkOffset
                };
                var isEmptyLine = dpr.isEmptyLine(context, selection);
                var isEmptyLineExpected = tst.EMPTY_LINE_RESULTS[t];
                if (isEmptyLine != isEmptyLineExpected) {
                    return "Error in empty line detection (#" + t + "; HTML: " + html
                        + "); is: " + (isEmptyLine ? "empty" : "notempty") + "; expected: "
                        + (isEmptyLineExpected ? "empty" : "notempty") + ")";
                }
            }
            return "success";
        },

        EMPTY_LINE_HTMLS: [
            "<p></p>",                                            // #0
            "<p>&nbsp;</p>",                                      // #1
            "<p><br></p>",                                        // #2
            "<table><tr><td>&nbsp;</td></tr></table>",            // #3
            "<ul><li></li>",                                      // #4
            "<ul><li><br></li>",                                  // #5
            "<p>Some text</p>",                                   // #6
            "<p><br>Some text</p>",                               // #7
            "<p><br><b>Some text</b></p>",                        // #8
            "<p>&nbsp;Some text</p>",                             // #9
            "<p>&nbsp;<b>Some text</b>"                           // #10
        ],

        EMPTY_LINE_RESULTS: [
            true,                                                 // #0
            true,                                                 // #1
            (com.ua.isIE ? false : true),                         // #2
            true,                                                 // #3
            true,                                                 // #4
            (com.ua.isIE ? false : true),                         // #5
            false,                                                // #6
            false,                                                // #7
            false,                                                // #8
            false,                                                // #9
            false                                                 // #10
        ],

        testAttributeManagement: function() {
            // todo testcases for other attribute-related functionality
            // testing ar
            var dom1 = document.createElement("span");
            var dom2 = document.createElement("span");
            if (!com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #0; must be identical.";
            }
            com.setAttribute(dom1, "style", "text-align: right;");
            if (com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #1; must not be identical.";
            }
            com.setAttribute(dom2, "style", "text-align: right;");
            if (!com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #2; must be identical.";
            }
            com.removeAttribute(dom1, "style");
            if (com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #3; must not be identical.";
            }
            com.removeAttribute(dom2, "style");
            if (!com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #4; must be identical.";
            }
            com.setAttribute(dom1, "class", "cssClass");
            if (com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #5; must not be identical.";
            }
            if (!com.hasCSS(dom1, "cssClass")) {
                return "CSS class not found for #5.";
            }
            com.setAttribute(dom2, "class", "cssClass");
            if (!com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #6; must be identical.";
            }
            if (!com.hasCSS(dom2, "cssClass")) {
                return "CSS class not found for #6.";
            }
            // todo more class-related testcases
            com.removeAttribute(dom1, "class");
            if (com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #7; must not be identical.";
            }
            if (com.hasCSS(dom1, "cssClass")) {
                return "CSS class still defined for #7.";
            }
            com.removeAttribute(dom2, "class");
            if (!com.compareAttributes(dom1, dom2)) {
                return "Attribute compare failed #8; must be identical.";
            }
            if (com.hasCSS(dom2, "cssClass")) {
                return "CSS class still defined for #8.";
            }
            // innerHTML-based testcases
            var container = document.createElement("span");
            container.innerHTML = "<span class=\"test\"></span>";
            var target = container.childNodes[0];
            if (!com.isAttribDefined(target, "class")) {
                return "Cannot access 'class' attribute";
            }
            var classAttrib = com.getAttribute(target, "class");
            if (classAttrib != "test") {
                return "Invalid class attribute; expected: test; is: " + classAttrib;
            }
            if (!com.hasCSS(target, "test")) {
                return "Class parsing failed - 'test' not detected";
            }
            var attribs = com.getAttributeNames(target);
            if (attribs.length != 1) {
                return "Invalid number of attributes; expected: 1; is: " + attribs.length;
            }
            if (!com.arrayContains(attribs, "class")) {
                return "Attribute 'class' missing in list of attributes.";
            }
            com.addClass(target, "changed");
            if (!com.hasCSS(target, "test") || !com.hasCSS(target, "changed")) {
                return "Missing one or both class(es) 'test'/'changed'";
            }
            classAttrib = com.getAttribute(target, "class");
            if (classAttrib != "test changed") {
                return "Invalid class attribute; expected: test changed; is: "
                    + classAttrib;
            }
            var value = container.innerHTML;
            var expected = tcm.recreateThroughDom("<span class=\"test changed\"></span>");
            if (value != expected) {
                return "Invalid value; is: " + value + "; expected: " + expected;
            }
            com.removeClass(target, "test");
            if (com.hasCSS(target, "test")) {
                return "Class 'test' still present."
            }
            if (!com.hasCSS(target, "changed")) {
                return "Missing class 'changed'.";
            }
            classAttrib = com.getAttribute(target, "class");
            if (classAttrib != "changed") {
                return "Invalid class attribute; expected: changed; is: " + classAttrib;
            }
            value = container.innerHTML;
            expected = tcm.recreateThroughDom("<span class=\"changed\"></span>");
            if (value != expected) {
                return "Invalid value; is: " + value + "; expected: " + expected;
            }
            com.removeAttribute(target, "class");
            if (com.isAttribDefined(target, "class")) {
                return "Attribute 'class' is still present after removal";
            }
            value = container.innerHTML;
            expected = tcm.recreateThroughDom("<span></span>");
            if (value != expected) {
                return "Invalid value; is: " + value + "; expected: " + expected;
            }
            // Testing tables - this is a specioal case on IE!
            container = document.createElement("div");
            container.innerHTML = "<table cellpadding=\"5\" cellspacing=\"8\">"
                    + "<tbody><tr>"
                    + "<td colspan=\"2\" rowspan=\"4\"></td>"
                    + "</tr></tbody>"
                    + "</table>";
            var table = container.childNodes[0];
            var cell = table.childNodes[0].childNodes[0].childNodes[0];
            if (!com.isAttribDefined(table, "cellspacing")) {
                return "Attribute 'cellspacing' not accessible";
            }
            var attribValue = com.getAttribute(table, "cellspacing");
            if (attribValue != "8") {
                return "Invalid cellspacing; expected: 8; is: " + attribValue;
            }
            if (!com.isAttribDefined(table, "cellpadding")) {
                return "Attribute 'cellpadding' not accessible";
            }
            attribValue = com.getAttribute(table, "cellpadding");
            if (attribValue != "5") {
                return "Invalid cellpadding; expected: 5; is: " + attribValue;
            }
            if (!com.isAttribDefined(cell, "colspan")) {
                return "Attribute 'colspan' not accessible";
            }
            attribValue = com.getAttribute(cell, "colspan");
            if (attribValue != "2") {
                return "Invalid colspan; expected: 2; is: " + attribValue;
            }
            if (!com.isAttribDefined(cell, "rowspan")) {
                return "Attribute 'rowspan' not accessible";
            }
            attribValue = com.getAttribute(cell, "rowspan");
            if (attribValue != "4") {
                return "Invalid rowspan; expected: 4; is: " + attribValue;
            }
            attribs = com.getAttributeNames(table);
            if (attribs.length != 2) {
                return "Invalid number of attributes; expected: 2; is: " + attribs.length;
            }
            if (!com.arrayContains(attribs, "cellpadding")) {
                return "Attribute 'cellpadding' missing in list of attributes.";
            }
            if (!com.arrayContains(attribs, "cellspacing")) {
                return "Attribute 'cellpadding' missing in list of attributes.";
            }
            attribs = com.getAttributeNames(cell);
            if (attribs.length != 2) {
                return "Invalid number of attributes; expected: 2; is: " + attribs.length;
            }
            if (!com.arrayContains(attribs, "colspan")) {
                return "Attribute 'colspan' missing in list of attributes.";
            }
            if (!com.arrayContains(attribs, "rowspan")) {
                return "Attribute 'rowspan' missing in list of attributes.";
            }
            com.setAttribute(table, "cellspacing", "4");
            attribValue = com.getAttribute(table, "cellspacing");
            if (attribValue != "4") {
                return "Invalid cellspacing; expected: 4; is: " + attribValue;
            }
            com.setAttribute(cell, "colspan", "4");
            attribValue = com.getAttribute(cell, "colspan");
            if (attribValue != "4") {
                return "Invalid colspan; expected: 4; is: " + attribValue;
            }
            value = container.innerHTML;
            expected = tcm.recreateThroughDom(
                    "<table cellpadding=\"5\" cellspacing=\"4\">"
                        + "<tbody><tr>"
                        + "<td colspan=\"4\" rowspan=\"4\"></td>"
                        + "</tr></tbody>"
                        + "</table>");
            if (value != expected) {
                return "Invalid value; is: " + value + "; expected: " + expected;
            }
            com.removeAttribute(cell, "colspan");
            if (com.isAttribDefined(cell, "colspan")) {
                return "Attribute 'colspan' still present after removal";
            }
            com.removeAttribute(cell, "rowspan");
            if (com.isAttribDefined(cell, "rowspan")) {
                return "Attribute 'rowspan' still present after removal";
            }
            attribs = com.getAttributeNames(cell);
            if (attribs.length != 0) {
                return "Invalid number of attributes; expected: 0; is: " + attribs.length;
            }
            value = container.innerHTML;
            expected = tcm.recreateThroughDom(
                    "<table cellpadding=\"5\" cellspacing=\"4\">"
                        + "<tbody><tr>"
                        + "<td></td>"
                        + "</tr></tbody>"
                        + "</table>");
            if (value != expected) {
                return "Invalid value; is: " + value + "; expected: " + expected;
            }
            // <a name=""> is also a special case on IE
            container = document.createElement("span");
            container.innerHTML = "<a name=\"anchor\"></a>";
            var anchor = container.childNodes[0];
            if (!com.isAttribDefined(anchor, "name")) {
                return "Attribute 'name' is not accessible";
            }
            attribValue = com.getAttribute(anchor, "name");
            if (attribValue != "anchor") {
                return "Invalid anchor name; expected: anchor; is: " + attribValue;
            }
            com.setAttribute(anchor, "name", "anchorChanged");
            attribValue = com.getAttribute(anchor, "name");
            if (attribValue != "anchorChanged") {
                return "Invalid anchor name; expected: anchorChanged; is: " + attribValue;
            }
            com.removeAttribute(anchor, "name");
            if (com.isAttribDefined(anchor, "name")) {
                return "Attribute 'name' is still present after removal.";
            }
            return "success";
        }

    };

}();


CUI.rte.testing.Commons.registerSection("domcommons", "Basic DOM processing");
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testNodeTraversal",
        CUI.rte.testing.DomCommons.testNodeTraversal);
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testTextTraversal",
        CUI.rte.testing.DomCommons.testTextTraversal);
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testTextTraversalBreakTags",
        CUI.rte.testing.DomCommons.testTextTraversalBreakTags);
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testNodeToPositionMapping",
        CUI.rte.testing.DomCommons.testNodeToPositionMapping);
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testPositionToNodeMapping",
        CUI.rte.testing.DomCommons.testPositionToNodeMapping);
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testCopyAttributes",
        CUI.rte.testing.DomCommons.testCopyAttributes);
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testGetEmptyLine",
        CUI.rte.testing.DomCommons.testGetEmptyLine);
CUI.rte.testing.Commons.registerTest(
        "domcommons", "DomCommons.testAttributeManagement",
        CUI.rte.testing.DomCommons.testAttributeManagement);
