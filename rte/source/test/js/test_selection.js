CUI.rte.testing.SelectionTests = function() {

    var com = CUI.rte.Common;
    var tcm = CUI.rte.testing.Commons;
    var tsl = CUI.rte.testing.SelectionLib;
    var sel = CUI.rte.Selection;

    var marker = tsl.INSERT_MARKER_HTML;

    var anchor = "<a name=\"anchor\"></a>";

    var anchor1 = "<a name=\"anchor1\"></a>";

    var anchor2 = "<a name=\"anchor2\"></a>";

    var anchorResult = "<a name=\"anchor\" class=\"" + CUI.rte.Theme.ANCHOR_CLASS
            + "\"></a>";

    var anchor1Result = "<a name=\"anchor1\" class=\"" + CUI.rte.Theme.ANCHOR_CLASS
            + "\"></a>";

    var anchor2Result = "<a name=\"anchor2\" class=\"" + CUI.rte.Theme.ANCHOR_CLASS
            + "\"></a>";

    var tempBR = (com.ua.isIE ? "" : "<br " + com.BR_TEMP_ATTRIB + "=\"brEOB\">");

    var imgUrl = "img/test_128.png";

    var imgLeft = "<img src=\"" + imgUrl + "\" style=\"float: left;\">";

    var imgLeftResult = "<img src=\"" + imgUrl + "\" style=\"float: left;\" "
            + com.SRC_ATTRIB + "=\"" + imgUrl + "\">";

    var img = "<img src=\"" + imgUrl + "\">";

    var imgResult = "<img src=\"" + imgUrl + "\" " + com.SRC_ATTRIB + "=\"" + imgUrl
            + "\">";

    var imgSmallUrl = "img/test_32.png";

    var imgSmall = "<img src=\"" + imgSmallUrl + "\">";

    var imgSmallResult = "<img src=\"" + imgSmallUrl + "\" " + com.SRC_ATTRIB + "=\""
            + imgSmallUrl + "\">";


    // selection lib testing ---------------------------------------------------------------

    /**
     * Tests selecting the end of a text
     * @private
     */
    var testSelectEOT = function() {
        var tst = CUI.rte.testing.SelectionTests;
        var comp = tcm.getRteInstance();
        var testCnt = tst.TEST_HTMLS.length;
        for (var t = 0; t < testCnt; t++) {
            var testHtml = tst.TEST_HTMLS[t];
            comp.setValue(testHtml);
            tsl.selectEOT();
            tsl.insertMarker();
            var expectedHtml = tcm.recreateThroughDom(tcm.removeUnwantedWhitespace(
                    tst.EOT_HTMLS[t]));
            var cmpHtml = tcm.recreateThroughDom(tcm.removeUnwantedWhitespace(
                    tcm.getRawEditorContent()));
            if (cmpHtml != expectedHtml) {
                return "Could not select end of text; result: " + cmpHtml + "; "
                        + "expected: " + expectedHtml;
            }
        }
        return "success";
    };

    /**
     * Tests #isExchangeable.
     */
    var testIsExchangeable = function() {
        var root = document.createElement("div");
        var context = tcm.createFakeEditContext(root);
        var p1 = document.createElement("p");
        root.appendChild(p1);
        var t1 = document.createTextNode("Txt1");
        p1.appendChild(t1);
        var b = document.createElement("b");
        p1.appendChild(b);
        var t2 = document.createTextNode("Txt2");
        b.appendChild(t2);
        var br = document.createElement("br");
        p1.appendChild(br);
        var t3 = document.createTextNode("Txt3");
        p1.appendChild(t3);
        var p2 = document.createElement("p");
        root.appendChild(p2);
        var t4 = document.createTextNode("Txt4");
        p2.appendChild(t4);
        var ul = document.createElement("ul");
        root.appendChild(ul);
        var li1 = document.createElement("li");
        ul.appendChild(li1);
        var lit1 = document.createTextNode("Item 1");
        li1.appendChild(lit1);
        var ul1 = document.createElement("ul");
        li1.appendChild(ul1);
        var li11 = document.createElement("li");
        ul1.appendChild(li11);
        var lit11 = document.createTextNode("Item 1.1");
        li11.appendChild(lit11);
        // W3C only (empty paragraph handling)
        if (!com.ua.isOldIE) {
            var p3 = document.createElement("p");
            root.appendChild(p3);
            var elbr = document.createElement("br");
            p3.appendChild(elbr);
            var p4 = document.createElement("p");
            root.appendChild(p4);
            var t5 = document.createTextNode("Txt5");
            p4.appendChild(t5);
        }
        // musts
        if (!tsl.isExchangeable(context, t1, 4, t2, 0)) {
            return "t1/4 and t2/0 must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, t2, 0, t1, 4)) {
            return "t2/0 and t1/4 must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, t2, 4, br, null)) {
            return "t2/4 and br/null must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, br, null, t2, 4)) {
            return "br/null and t2/4 must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, br, 0, t3, 0)) {
            return "br/0 and t3/0 must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, t3, 0, br, 0)) {
            return "t3/0 and br/0 must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, t3, 4, p1, null)) {
            return "t3/4 and p1/null must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, p1, null, t3, 4)) {
            return "p1/null and t3/4 must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, t4, 4, p2, null)) {
            return "t4/4 and p2/null must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, lit1, 6, lit11, 0, true)) {
            return "lit1/6 and lit11/0 (EOS) must be exchangeable, but are not";
        }
        if (!tsl.isExchangeable(context, lit11, 0, lit1, 6, true)) {
            return "lit11/0 and lit1/6 (EOS) must be exchangeable, but are not";
        }
        if (!com.ua.isOldIE) {
            if (!tsl.isExchangeable(context, br, 0, br, null)) {
                return "br/0 and br/null must be exchangeable (W3C), but are not";
            }
            if (!tsl.isExchangeable(context, br, null, br, 0)) {
                return "br/null and br/0 must be exchangeable (W3C), but are not";
            }
        }
        if (com.ua.isOldIE) {
            if (!tsl.isExchangeable(context, lit1, 6, lit11, 0, false)) {
                return "lit1/6 and lit11/0 (BOS) must be exchangeable (IE), but are not";
            }
            if (!tsl.isExchangeable(context, lit11, 0, lit1, 6, false)) {
                return "lit11/0 and lit1/6 (BOS) must be exchangeable (IE), but are not";
            }
        } else {
            if (!tsl.isExchangeable(context, p3, null, t5, 0)) {
                return "p3/null and t5/0 must be exchangeable (W3C), but are not";
            }
            if (!tsl.isExchangeable(context, t5, 0, p3, null)) {
                return "t5/4 and p3/null must be exchangeable (W3C), but are not";
            }
        }
        // must-nots
        if (tsl.isExchangeable(context, t3, 4, t4, 0)) {
            return "t3/4 and t4/0 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t4, 0, t3, 4)) {
            return "t4/0 and t3/4 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t1, 4, t2, 1)) {
            return "t1/4 and t2/1 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t2, 1, t1, 4)) {
            return "t2/1 and t1/4 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t1, 3, t2, 0)) {
            return "t1/3 and t2/0 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t1, 2, t2, 1)) {
            return "t1/2 and t2/1 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t2, 4, br, 0)) {
            return "t2/4 and br/0 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t3, 0, br, null)) {
            return "t3/0 and br/null must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t3, 3, p1, null)) {
            return "t3/3 and p1/null must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t3, 0, p1, null)) {
            return "t3/3 and p1/null must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t3, 4, p2, null)) {
            return "t3/4 and p2/null must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, p1, null, t4, 0)) {
            return "p1/null and t4/0 must not be exchangeable, but are";
        }
        if (tsl.isExchangeable(context, t4, 0, p1, null)) {
            return "t4/0 and p1/null must not be exchangeable, but are";
        }
        if (com.ua.isOldIE) {
            if (tsl.isExchangeable(context, br, 0, br, null)) {
                return "br/0 and br/null must not be exchangeable (IE), but are";
            }
            if (tsl.isExchangeable(context, br, null, br, 0)) {
                return "br/null and br/0 must not be exchangeable (IE), but are";
            }
        } else {
            if (tsl.isExchangeable(context, lit1, 6, lit11, 0, false)) {
                return "lit1/6 and lit11/0 (BOS) must not be exchangeable (W3C), but are";
            }
            if (tsl.isExchangeable(context, lit11, 0, lit1, 6, false)) {
                return "lit11/0 and lit1/6 (BOS) must not be exchangeable (W3C), but are";
            }
        }
        return "success";
    };

    var testToPlainText = function() {
        var tst = CUI.rte.testing.SelectionTests;
        var testCnt = tst.PLAINTEXT_HTMLS.length;
        for (var t = 0; t < testCnt; t++) {
            var result = tsl.toPlainText(tst.PLAINTEXT_HTMLS[t]);
            if (result != tst.PLAINTEXT_RESULTS[t]) {
                return "Plain text conversion failed on test case #" + t + "; is: "
                        + result + "; expected: " + tst.PLAINTEXT_RESULTS[t] + "; HTML: "
                        + tst.PLAINTEXT_HTMLS[t];
            }
        }
        return "success";
    };


    // Helpers -----------------------------------------------------------------------------

    /**
     * Creates the "expected" result HTML for the setCaretPos test cases.
     * @private
     */
    var createFullHtml = function(caretPos, splitResult) {
        var html = "";
        for (var p = 0; p < (caretPos + 1); p++) {
            html += splitResult[p];
        }
        html += tsl.INSERT_MARKER_HTML;
        for (; p < splitResult.length; p++) {
            html += splitResult[p];
        }
        return html;
    };

    /**
     * Creates the "expected" result HTML for the selectBookmark test cases.
     * @private
     */
    var createPartialHtml = function(startPos, endPos, splitResult) {
        var html = "";
        for (var p = startPos; p < endPos; p++) {
            html += splitResult[p + 1];
        }
        return html;
    };

    /**
     * Calculates the maximum caret position (required for testing getCaretPos) from
     * a result array used by testSetCaretTest.
     * @private
     */
    var calcMaxCaretPos = function(resultHtmls) {
        var maxCaretPos = [ ];
        var testCnt = resultHtmls.length;
        for (var t = 0; t < testCnt; t++) {
            var html = resultHtmls[t];
            var posArray = html.split("|");
            maxCaretPos.push(posArray.length - 1);
        }
        return maxCaretPos;
    };

    /**
     * Adds information about the current Gecko selection to the result string.
     */
    var addGeckoSelectionInfo = function(str) {
        if (com.ua.isGecko) {
            if (str.length > 0) {
                str += " - ";
            }
            var context = tcm.getEditContext();
            var selection = sel.getSelection(context);
            str += "Selection is: "
                    + "anchor(node "
                    + com.dumpNodeRecursively(selection.anchorNode)
                    + " offset " + selection.anchorOffset + ") "
                    + "focus(node "
                    + com.dumpNodeRecursively(selection.focusNode)
                    + " offset " + selection.focusOffset + ")";
        }
        return str;
    };


    // "Continue"-Methods ------------------------------------------------------------------

    var TIMEOUT = 3000;

    var continueInformation = null;

    var startTest = function(defaultStartIter) {
        if (continueInformation == null) {
            continueInformation = {
                "iteration": defaultStartIter,
                "timeoutTc": (new Date().getTime()) + TIMEOUT
            };
            return defaultStartIter;
        }
        continueInformation.timeoutTc = new Date().getTime() + TIMEOUT;
        return continueInformation.iteration;
    };

    var notifyContinue = function() {
        continueInformation.iteration++;
        return (new Date().getTime() >= continueInformation.timeoutTc);
    };

    var endTest = function() {
        continueInformation = null;
    };


    // Test execution locals: Caret positioning --------------------------------------------

    /**
     * Executes a single setCaretPos test case.
     */
    var testSetCaretTest = function(htmls, resultHtmls, testIndex, testRun) {
        if (testIndex >= htmls.length) {
            return "finished";
        }
        var comp = tcm.getRteInstance();
        var context = tcm.getEditContext();
        var testHtml = htmls[testIndex];
        var isSetDirectly = false;
        if (typeof(testHtml) == "object") {
            isSetDirectly = testHtml.setDirectly;
            testHtml = testHtml.html;
        }
        var resultHtmlCode = resultHtmls[testIndex];
        var posArray = resultHtmlCode.split("|");
        var caretPosAvail = posArray.length - 1;
        if (testRun >= caretPosAvail) {
            return "testrun finished";
        }
        if (!isSetDirectly) {
            comp.setValue(testHtml);
        } else {
            context.root.innerHTML = testHtml;
        }
        comp.focus();
        sel.setCaretPos(context, testRun);
        tsl.insertMarker();
        var expectedHtml = tcm.recreateThroughDom(createFullHtml(testRun, posArray));
        var resultHtml = tcm.recreateThroughDom(tcm.removeUnwantedWhitespace(
                tcm.getRawEditorContent()));
        if (!tcm.compareHTML(expectedHtml, resultHtml)) {
            return "Invalid result for test #" + testIndex + "; position #" + testRun + "; "
                    + "is: " + resultHtml + "; expected: " + expectedHtml;
        }
        return "success";
    };

    /**
     * Executes a single getCaretPos test case.
     */
    var testGetCaretTest = function(htmls, maxCaretPos, exceptions, testIndex, testRun) {
        if (testIndex >= htmls.length) {
            return "finished";
        }
        var comp = tcm.getRteInstance();
        var context = tcm.getEditContext();
        var testHtml = htmls[testIndex];
        var isSetDirectly = false;
        if (typeof(testHtml) == "object") {
            isSetDirectly = testHtml.setDirectly;
            testHtml = testHtml.html;
        }
        var caretPosAvail = maxCaretPos[testIndex];
        if (testRun >= caretPosAvail) {
            return "testrun finished";
        }
        if (!isSetDirectly) {
            comp.setValue(testHtml);
        } else {
            context.root.innerHTML = testHtml;
        }
        comp.focus();
        sel.setCaretPos(context, testRun);
        var detectedCaretPos = sel.getCaretPos(context);
        if (detectedCaretPos != testRun) {
            // there may be some exceptions defined
            var isSuccessThroughException = false;
            if (exceptions) {
                var exCnt = exceptions.length;
                for (var ex = 0; ex < exCnt; ex++) {
                    var exception = exceptions[ex];
                    if (exception.index == testIndex) {
                        if ((exception.charPos == testRun)
                                && (exception.reportedPos == detectedCaretPos)) {
                            isSuccessThroughException = true;
                            break;
                        }
                    }
                }
            }
            if (!isSuccessThroughException) {
                return "Invalid caret position for test #" + testIndex + "; "
                        + "is: " + detectedCaretPos + "; expected: " + testRun + "; HTML: "
                        + testHtml;
            }
        }
        return "success";
    };

    /**
     * Executes a generic setCaretPos test set in "deferred" mode.
     * @private
     */
    var deferredSetCaretTestSet = function(htmls, resultHtmls, testIndex) {
        var isSingleTest = (testIndex != undefined);
        if (!isSingleTest) {
            testIndex = 0;
        }
        CUI.rte.Utils.defer(continueSetCaretTestSet, 1, this,
                [ htmls, resultHtmls, testIndex, 0, isSingleTest ]);
        return "deferred";
    };

    /**
     * Executes a single step of a generic setCaretPos test set in "deferred" mode.
     * @private
     */
    var continueSetCaretTestSet = function(htmls, resultHtmls, testIndex, testRun,
                                           isSingleTest) {
        var result = testSetCaretTest(htmls, resultHtmls, testIndex, testRun);
        if (result == "testrun finished") {
            testIndex ++;
            if ((testIndex < htmls.length) && !isSingleTest) {
                testRun = 0;
                CUI.rte.Utils.defer(continueSetCaretTestSet, 1, this,
                        [ htmls, resultHtmls, testIndex, testRun, isSingleTest ]);
            } else {
                CUI.rte.DebugRegistry.notifyDeferredSuccess();
            }
        } else if (result != "success") {
            CUI.rte.DebugRegistry.notifyDeferredError(result);
        } else {
            testRun++;
            if (testIndex < htmls.length) {
                CUI.rte.Utils.defer(continueSetCaretTestSet, 1, this,
                        [ htmls, resultHtmls, testIndex, testRun, isSingleTest ]);
            } else {
                CUI.rte.DebugRegistry.notifyDeferredSuccess();
            }
        }
    };

    /**
     * Executes a generic getCaretPos test set in "deferred" mode.
     * @private
     */
    var deferredGetCaretTestSet = function(htmls, maxCaretPos, exceptions, testIndex) {
        var isSingleTest = (testIndex != undefined);
        if (!isSingleTest) {
            testIndex = 0;
        }
        CUI.rte.Utils.defer(continueGetCaretTestSet, 1, this,
                [ htmls, maxCaretPos, exceptions, testIndex, 0, isSingleTest ]);
        return "deferred";
    };

    /**
     * Executes a single step of a generic setCaretPos test set in "deferred" mode.
     * @private
     */
    var continueGetCaretTestSet = function(htmls, maxCaretPos, exceptions, testIndex,
                                           testRun, isSingleTest) {
        var result = testGetCaretTest(htmls, maxCaretPos, exceptions, testIndex, testRun);
        if (result == "testrun finished") {
            testIndex++;
            if ((testIndex < htmls.length) && !isSingleTest) {
                testRun = 0;
                CUI.rte.Utils.defer(continueGetCaretTestSet, 1, this,
                        [ htmls, maxCaretPos, exceptions, testIndex, testRun,
                                isSingleTest]);
            } else {
                CUI.rte.DebugRegistry.notifyDeferredSuccess();
            }
        } else if (result != "success") {
            CUI.rte.DebugRegistry.notifyDeferredError(result);
        } else {
            testRun++;
            if (testIndex < htmls.length) {
                CUI.rte.Utils.defer(continueGetCaretTestSet, 1, this,
                        [ htmls, maxCaretPos, exceptions, testIndex, testRun,
                                isSingleTest]);
            } else {
                CUI.rte.DebugRegistry.notifyDeferredSuccess();
            }
        }
    };


    // Test execution locals: Processing selection -----------------------------------------

    /**
     * Executes a single createProcessingSelection test case.
     */
    var testCreatePSelTest = function(htmls, exceptions, testIndex, testRun) {
        if (testIndex >= htmls.length) {
            return "finished";
        }
        var loopStart = startTest(testRun);
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
            endTest();
            return "testrun finished";
        }
        for (var e = loopStart; e <= caretPosAvail; e++) {
            var endPos = e;
            var bookmark = {
                "startPos": testRun,
                "charCnt": (e - testRun)
            };
            var exCnt = (exceptions ? exceptions.length : 0);
            for (var ex = 0; ex < exCnt; ex++) {
                var exception = exceptions[ex];
                if (exception.index == testIndex) {
                    if ((exception.startPos == testRun)
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
            sel.selectBookmark(context, bookmark);
            var pSel = sel.createProcessingSelection(context);
            var startDef = com.getNodeAtPosition(context, testRun);
            var selStartNode = pSel.startNode;
            var selStartOffset = pSel.startOffset;
            var isValid;
            if ((startDef.dom != selStartNode)
                    || (startDef.offset != selStartOffset)) {
                isValid = tsl.isExchangeable(context, selStartNode, selStartOffset,
                        startDef.dom, startDef.offset, false);
                if (!isValid) {
                    endTest();
                    return "Invalid start of selection; is: "
                            + com.dumpNode(selStartNode) + "/" + selStartOffset + "; "
                            + "expected: " + com.dumpNode(startDef.dom) + "/"
                            + startDef.offset + " (Start: " + testRun + "; End: " + e
                            + "; #" + testIndex + "; HTML: " + testHtml + ")";
                }
            }
            // Gecko can't select single "br"'s correctly in our context, so handle
            // this case as a caret selection (which it actually is)
            var isGeckoBR = com.ua.isGecko && ((testRun + 1) == endPos)
                    && com.isTag(startDef.dom, "br") && (startDef.offset == null);
            if (testRun == endPos) {
                if ((pSel.endNode != null) || (pSel.endOffset != null)) {
                    endTest();
                    return "Invalid end of selection; is: "
                            + com.dumpNode(pSel.endNode) + "/" + pSel.endOffset
                            + "; should be undefined (Position: " + testRun + "; #"
                            + testIndex + "; HTML: " + testHtml + ")";
                }
            } else if (!isGeckoBR) {
                var endDef = com.getNodeAtPosition(context, e);
                var selEndNode = pSel.endNode;
                var selEndOffset = pSel.endOffset;
                if ((endDef.dom != selEndNode) || (endDef.offset != selEndOffset)) {
                    isValid = tsl.isExchangeable(context, selEndNode, selEndOffset,
                            endDef.dom, endDef.offset, true);
                    // handle WebKit problems with "before table cell"
                    // IE has the same behavior, probably this is not a problem but a feature :)
                    if ((com.ua.isWebKit || (com.ua.isIE && !com.ua.isOldIE)) && !isValid
                            && (selEndNode == null)) {
                        isValid = false;
                        if (endDef.offset == null) {
                            var lastChildNode = com.getLastChild(endDef.dom);
                            if ((lastChildNode == selStartNode)
                                    && (selStartOffset == null)) {
                                isValid = true;
                            }
                        }
                    }
                    if (!isValid) {
                        // empty edit blocks are always "inclusive"!
                        if (com.isEmptyEditingBlock(endDef.dom)) {
                            var nextNode = com.getNextNode(context, endDef.dom);
                            while (nextNode) {
                                var isSuitableNext = com.isEmptyEditingBlock(nextNode)
                                        || com.isCharacterNode(nextNode);
                                if (isSuitableNext) {
                                    break;
                                }
                                nextNode = com.getNextNode(context, nextNode);
                            }
                            if (nextNode && (selEndNode == nextNode)) {
                                isValid = sel.getFirstSelectionOffset(context, nextNode)
                                        == selEndOffset;
                            }
                        } else if (bookmark.charCnt == 1) {
                            // special case: a single "one character structural node" is
                            // selected - this will be expressed as a startNode without
                            // an offset and without an end node
                            if (com.isOneCharacterNode(pSel.startNode)
                                    && (pSel.startOffset == null)
                                    && (pSel.endNode == null) && (pSel.endOffset == null)) {
                                isValid = true;
                            }
                        }
                    }
                    if (!isValid) {
                        endTest();
                        return "Invalid end of selection; is: "
                                + com.dumpNode(selEndNode) + "/" + selEndOffset + "; "
                                + "expected: " + com.dumpNode(endDef.dom) + "/"
                                + endDef.offset + " (Start: " + testRun + "; End: " + e
                                + "; #" + testIndex + "; HTML: " + testHtml + ")";
                    }
                }
            }
            if (notifyContinue()) {
                return "continue";
            }
        }
        endTest();
        return "success";
    };

    /**
     * Executes a generic createProcessingSelection test set in "deferred" mode.
     * @private
     */
    var deferredCreatePSelTestSet = function(htmls, exceptions, testIndex) {
        var isSingleTest = (testIndex != undefined);
        if (!isSingleTest) {
            testIndex = 0;
        }
        CUI.rte.Utils.defer(continueCreatePSelTestSet, 1, this,
                [ htmls, exceptions, testIndex, 0, isSingleTest ]);
        return "deferred";
    };

    /**
     * Executes a single step of a generic createProcessingSelection test set in "deferred"
     * mode.
     * @private
     */
    var continueCreatePSelTestSet = function(htmls, exceptions, testIndex, testRun,
                                             isSingleTest) {
        var result = testCreatePSelTest(htmls, exceptions, testIndex, testRun);
        if (result == "testrun finished") {
            testIndex ++;
            if ((testIndex < htmls.length) && (!isSingleTest)) {
                testRun = 0;
                CUI.rte.Utils.defer(continueCreatePSelTestSet, 100, this,
                        [ htmls, exceptions, testIndex, testRun, isSingleTest ]);
            } else {
                CUI.rte.DebugRegistry.notifyDeferredSuccess();
            }
        } else if (result == "continue") {
            CUI.rte.DebugRegistry.notifyDeferredError("continue: " + testIndex + "/"
                    + testRun);
            CUI.rte.Utils.defer(function() {
                continueCreatePSelTestSet(htmls, exceptions, testIndex, testRun,
                        isSingleTest);
            }, 1);
        } else if (result == "finished") {
            CUI.rte.DebugRegistry.notifyDeferredError(result);
        } else if (result != "success") {
            result = addGeckoSelectionInfo(result);
            CUI.rte.DebugRegistry.notifyDeferredError(result);
        } else  {
            testRun++;
            CUI.rte.Utils.defer(continueCreatePSelTestSet, 1, this,
                    [ htmls, exceptions, testIndex, testRun, isSingleTest ]);
        }
    };


    // Test execution locals: Bookmarks ----------------------------------------------------

    /**
     * Starts executing a single run of a single selectBookmark test case.
     */
    var testSelectBookmarkTest = function(htmls, resultHtmls, exceptions, testIndex,
                                          testRun) {
        if (testIndex >= htmls.length) {
            return "finished";
        }
        var loopStart = startTest(testRun);
        var comp = tcm.getRteInstance();
        var context = tcm.getEditContext();
        var testHtml = htmls[testIndex];
        var resultHtml = resultHtmls[testIndex];
        var posArray = resultHtml.split("|");
        if (testRun == 0) {
            comp.setValue(testHtml);
        }
        comp.focus();
        var caretPosAvail = posArray.length - 1;
        if (testRun > caretPosAvail) {
            endTest();
            return "testrun finished";
        }
        for (var e = loopStart; e <= caretPosAvail; e++) {
            var bookmark = {
                "startPos": testRun,
                "charCnt": (e - testRun)
            };
            sel.selectBookmark(context, bookmark);
            var selectionOrig = tsl.getSelectionContents();
            var selectionContent = tsl.toPlainText(selectionOrig);
            var expectedContent = tsl.toPlainText(createPartialHtml(testRun, e, posArray));
            var selection;
            // Workarounds for several Gecko bugs
            if (com.ua.isGecko) {
                selection = sel.getSelection(context);
                // bug that wrongly interprets "br"/0 at the start
                // of a selection
                if (com.strStartsWith(selectionContent, "\n")) {
                    if (com.isTag(selection.anchorNode, "br")
                            && (selection.anchorOffset == 0)) {
                        selectionContent = selectionContent.substring(1,
                                selectionContent.length);
                    }
                }
                // bug that handles images at the end of a block
                // wrongly
                if (com.strStartsWith(selectionContent, "$")) {
                    if (com.isTag(selection.anchorNode, "img")
                            && (selection.anchorOffset == 0)) {
                        selectionContent = selectionContent.substring(1,
                                selectionContent.length);
                    }
                }
            }
            // handle exceptions if available
            if ((selectionContent != expectedContent) && exceptions) {
                var excptCnt = exceptions.length;
                for (var ex = 0; ex < excptCnt; ex++) {
                    var excpt = exceptions[ex];
                    if ((excpt.index == testIndex)
                            && (excpt.startPos == bookmark.startPos)) {
                        if (excpt.removePrecedingLF) {
                            if (com.strStartsWith(selectionContent, "\n")) {
                                selectionContent = selectionContent.substring(1,
                                        selectionContent.length);
                            }
                        } else if (excpt.charCnt == bookmark.charCnt) {
                            expectedContent = excpt.expected;
                        }
                    }
                }
            }
            if (selectionContent != expectedContent) {
                selectionContent = selectionContent.replace(/\n/g, "\\n");
                expectedContent = expectedContent.replace(/\n/g, "\\n");
                endTest();
                return "Invalid selection from bookmark (" + testRun + " to " + e + "); "
                        + "is: " + selectionContent + "; expected: " + expectedContent
                        + " (" + "HTML: " + testHtml + "; selection HTML: " + selectionOrig
                        + ")";
            }
            if (notifyContinue()) {
                return "continue";
            }
        }
        endTest();
        return "success";
    };

    /**
     * Executes a generic selectBookmark test set in "deferred" mode.
     * @private
     */
    var deferredSelectBookmarkTestSet = function(htmls, results, exceptions, testIndex) {
        var isSingleTest = (testIndex != undefined);
        if (!isSingleTest) {
            testIndex = 0;
        }
        CUI.rte.Utils.defer(continueSelectBookmarkTestSet, 1, this,
                [ htmls, results, exceptions, testIndex, 0, isSingleTest ]);
        return "deferred";
    };

    /**
     * Executes a single step of a generic selectBookmark test set in "deferred" mode.
     * @private
     */
    var continueSelectBookmarkTestSet = function(htmls, results, exceptions, testIndex,
                                                 testRun, isSingleTest) {
        var result = testSelectBookmarkTest(htmls, results, exceptions, testIndex, testRun);
        if (result == "testrun finished") {
            testIndex ++;
            if ((testIndex < htmls.length) && !isSingleTest) {
                testRun = 0;
                CUI.rte.Utils.defer(continueSelectBookmarkTestSet, 100, this,
                        [ htmls, results, exceptions, testIndex, testRun, isSingleTest ]);
            } else {
                CUI.rte.DebugRegistry.notifyDeferredSuccess();
            }
        } else if (result == "continue") {
            CUI.rte.Utils.defer(function() {
                continueSelectBookmarkTestSet(htmls, results, exceptions, testIndex,
                testRun, isSingleTest);
            }, 1);
        } else if (result != "success") {
            result = addGeckoSelectionInfo(result);
            CUI.rte.DebugRegistry.notifyDeferredError(result);
        } else {
            testRun++;
            CUI.rte.Utils.defer(continueSelectBookmarkTestSet, 1, this,
                    [ htmls, results, exceptions, testIndex, testRun, isSingleTest ]);
        }
    };


    return {

        // Testing caret handling ----------------------------------------------------------

        // Caret handling is the most basic selection operation. Caret handling is about
        // mapping a character position to a node and a character offset (relative to that
        // node if it is a text node). As bookmarks are also based on caret positioning,
        // it is important that each caret position is addressable by an individual
        // character position. Furthermore, as bookmarks are also used for some serverside
        // processing (for example, specifiying invalidly spelled words by the
        // spellchecker), character positions have also to be consistent across different
        // browsers and easily to be derivable serverside from the corresponding HTML
        // code.

        /**
         * Basic tests for setting the caret.
         */
        testSetCaretBasics: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            if (testRun == null) {
                return deferredSetCaretTestSet(tst.SETCARET_TEST_BASICS,
                        tst.SETCARET_RESULT_BASICS, testIndex);
            }
            return testSetCaretTest(tst.SETCARET_TEST_BASICS,
                    tst.SETCARET_RESULT_BASICS, testIndex, testRun);
        },

        /**
         * Basic tests for getting the caret position.
         */
        testGetCaretBasics: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var maxCharPos = calcMaxCaretPos(tst.SETCARET_RESULT_BASICS);
            if (testRun == null) {
                return deferredGetCaretTestSet(tst.SETCARET_TEST_BASICS, maxCharPos,
                        null, testIndex);
            }
            return testGetCaretTest(tst.SETCARET_TEST_BASICS, maxCharPos, null, testIndex,
                    testRun);
        },

        SETCARET_TEST_BASICS: [
            // absolutely basic ...
            "<p>Hello, World!</p>",
            "<p>A world with</p><p>two paragraphs</p>",
            "<p><b><i>Formatted</i> test text</b>, easy one.</p>",
            "<p>More <b><i>complex</i> formatting</b>, <u>so far</u>, so good.</p>",
            "<p>A test with a<br>linefeed inside.</p>",
            "<p>Testing<br><br>multiple linefeeds (1).</p>",
            "<p>Testing<br>multiple<br>linefeeds (2).</p>",
            "<p><br>complex linefeed 1</p>",
            "<p><br><br>complex linefeed 3</p>",
            "<p>Testing <a href=\"http://www.somesite.com\">links</a>.</p>",
            // anchors (not so basic on IE)
            "<p>Before" + anchor + "</p><p>Middle" + anchor1 + "</p><p>After"
                    + anchor2 + "</p>",
            "<p>" + anchor + "Before</p><p>" + anchor1 + "Middle</p><p>" + anchor2
                    + "After</p>",
            "<p>" + anchor + "Para 1</p><p>Para 2" + anchor1 + "</p>",
            "<p>Para 1" + anchor + "</p><p>" + anchor1 + "Para 2</p>",
            "<p>Before</p>"
                    + "<p>" + anchor + "Para 1</p><p>Para 2" + anchor1 + "</p>"
                    + "<p>After</p>",
            "<p>Before</p>"
                    + "<p>Para 1" + anchor + "</p><p>" + anchor1 + "Para 2</p>"
                    + "<p>After</p>",
            // images
            "<p>" + img + "A nice image with no alignment</p>",
            "<p>" + imgSmall + imgSmall + "Two images in a row</p>",
            "<p>" + imgSmall + "at different " + imgSmall + " positions " + imgSmall
                    + "</p>",
            "<p>" + imgSmall + "at different " + imgSmall + " positions " + imgSmall
                    + "</p>"
                    + "<p>" + imgSmall + "at different " + imgSmall + " positions "
                    + imgSmall + "</p>",
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
                    + "<p>After</p>",
            // Preformatted test cases (leading and trailing \n - if available - should be
            // removed; as they represent a special case here, they are still contained in
            // the test cases, contrary to other test cases)
            "<p>Before</p><pre>Preformatted</pre><p>After</p>",
            "<p>Before</p><pre>\nPreformatted\nMultiline\n</pre><p>After</p>",
            "<p>Before</p><pre>\nMultiple   whitespace</pre><p>After</p>",
            "<p>Before</p><pre>\n   Leading whitespace</pre><p>After</p>",
            "<p>Before</p><pre>\nTrailing whitespace   </pre><p>After</p>",
            "<p>Before</p><pre>  Mixed  whitespace     </pre><p>After</p>",
            "<p>Before</p><pre>\nComplex multi-\n  line\n    whitespace  \ntest.\n</pre>"
                    + "<p>After</p>",
            "<pre>\nPreformatted\n  trailing empty line\n\n</pre>"
        ],

        SETCARET_RESULT_BASICS: [
            // each addressable caret position has to be marked using a "|"
            "<p>|H|e|l|l|o|,| |W|o|r|l|d|!|</p>",
            "<p>|A| |w|o|r|l|d| |w|i|t|h|</p><p>|t|w|o| |p|a|r|a|g|r|a|p|h|s|</p>",
            "<p><b><i>|F|o|r|m|a|t|t|e|d|</i> |t|e|s|t| |t|e|x|t|</b>,| |e|a|s|y| |o|n|e|"
                    + ".|</p>",
            "<p>|M|o|r|e| |<b><i>c|o|m|p|l|e|x|</i> |f|o|r|m|a|t|t|i|n|g|</b>,| |<u>s|o| |"
                    + "f|a|r|</u>,| |s|o| |g|o|o|d|.|</p>",
            "<p>|A| |t|e|s|t| |w|i|t|h| |a|<br>|l|i|n|e|f|e|e|d| |i|n|s|i|d|e|.|</p>",
            "<p>|T|e|s|t|i|n|g|<br>|<br>|m|u|l|t|i|p|l|e| |l|i|n|e|f|e|e|d|s| |(|1|)|.|"
                    + "</p>",
            "<p>|T|e|s|t|i|n|g|<br>|m|u|l|t|i|p|l|e|<br>|l|i|n|e|f|e|e|d|s| |(|2|)|.|</p>",
            "<p>|<br>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |1|</p>",
            "<p>|<br>|<br>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |3|</p>",
            "<p>|T|e|s|t|i|n|g| |<a href=\"http://www.somesite.com\" "
                    + com.HREF_ATTRIB + "=\"http://www.somesite.com\">l|i|n|k|s</a>|.|</p>",
            // anchors
            "<p>|B|e|f|o|r|e|" + anchorResult + "|</p>"
                    + "<p>|M|i|d|d|l|e|" + anchor1Result + "|</p>"
                    + "<p>|A|f|t|e|r|" + anchor2Result + "|</p>",
            "<p>|" + anchorResult + "|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchor1Result + "|M|i|d|d|l|e|</p>"
                    + "<p>|" + anchor2Result + "|A|f|t|e|r|</p>",
            "<p>|" + anchorResult + "|P|a|r|a| |1|</p>"
                    + "<p>|P|a|r|a| |2|" + anchor1Result + "|</p>",
            "<p>|P|a|r|a| |1|" + anchorResult + "|</p>"
                    + "<p>|" + anchor1Result + "|P|a|r|a| |2|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|P|a|r|a| |1|</p>"
                    + "<p>|P|a|r|a| |2|" + anchor1Result + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|P|a|r|a| |1|" + anchorResult + "|</p>"
                    + "<p>|" + anchor1Result + "|P|a|r|a| |2|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            // images
            "<p>|" + imgResult + "|A| |n|i|c|e| |i|m|a|g|e| |w|i|t|h| |n|o| "
                    + "|a|l|i|g|n|m|e|n|t|</p>",
            "<p>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| |i|m|a|g|e|s| "
                    + "|i|n| |a| |r|o|w|</p>",
            "<p>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |" + imgSmallResult + "| "
                    + "|p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |" + imgSmallResult + "| "
                    + "|p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</p>"
                    + "<p>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</p>",
            "<p>|" + imgLeftResult + "|A| |n|i|c|e| |i|m|a|g|e| |w|i|t|h| "
                    + "|a|l|i|g|n|m|e|n|t| |t|o| |t|h|e| |l|e|f|t|"
                    + "</p>",
            "<p>|A| |n|i|c|e| |i|m|a|g|e| |w|i|t|h| |" + imgLeftResult
                    + "|a|l|i|g|n|m|e|n|t| |t|o| |t|h|e| |l|e|f|t|</p>",
            "<p>|" + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|</p><p>|" + imgSmallResult + "|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|" + imgSmallResult + "|</p><p>|A|f|t|e|r|</p>",
            "<p>|" + imgSmallResult + "|<br>|" + imgSmallResult + "|</p>",
            // combining problem childs ...
            "<p>|T|e|s|t|" + anchorResult + "|w|i|t|h|" + imgSmallResult + "|</p>",
            "<p>|T|e|s|t|" + anchorResult + "|" + imgSmallResult + "|t|o|g|e|t|h|e|r|.|"
                    + "</p>",
            "<p>|T|e|s|t|" + imgSmallResult + "|" + anchorResult + "|t|o|g|e|t|h|e|r|.|"
                    + "</p>",
            "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>",
            "<p>|E|O|L|" + anchorResult + "|" + imgSmallResult + "|</p>",
            "<p>|B|O|L|" + imgSmallResult + "|" + anchorResult + "|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|T|e|s|t|" + anchorResult + "|w|i|t|h|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|T|e|s|t|" + anchorResult + "|" + imgSmallResult
                    + "|t|o|g|e|t|h|e|r|.|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|T|e|s|t|" + imgSmallResult + "|" + anchorResult
                    + "|t|o|g|e|t|h|e|r|.|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|L|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|B|O|L|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>",
            "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>",
            "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>",
            "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>",
            "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|" + imgSmallResult + "|"
                    + anchor1Result + "|" + imgSmallResult + "|" + anchor2Result + "|</p>",
            "<p>|" + anchorResult + "|" + anchor1Result + "|" + imgSmallResult + "|"
                    + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|" + imgSmallResult + "|" + anchorResult + "|"
                    + anchor1Result + "|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|" + anchorResult + "|" + anchor1Result + "|"
                    + imgSmallResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|" + imgSmallResult + "|" + imgSmallResult + "|"
                    + anchorResult + "|" + anchor1Result + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            // Preformatted test cases - \n must be substituted with <br> (direct access)
            "<p>|B|e|f|o|r|e|</p><pre>|P|r|e|f|o|r|m|a|t|t|e|d|</pre><p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<pre>|P|r|e|f|o|r|m|a|t|t|e|d|<br>|M|u|l|t|i|l|i|n|e|</pre>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<pre>|M|u|l|t|i|p|l|e| | | |w|h|i|t|e|s|p|a|c|e|</pre>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<pre>| | | |L|e|a|d|i|n|g| |w|h|i|t|e|s|p|a|c|e|</pre>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<pre>|T|r|a|i|l|i|n|g| |w|h|i|t|e|s|p|a|c|e| | | |</pre>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<pre>| | |M|i|x|e|d| | |w|h|i|t|e|s|p|a|c|e| | | | | |</pre>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<pre>|C|o|m|p|l|e|x| |m|u|l|t|i|-|<br>| | |l|i|n|e|<br>"
                        + "| | | | |w|h|i|t|e|s|p|a|c|e| | |<br>|t|e|s|t|.|</pre>"
                    + "<p>|A|f|t|e|r|</p>",
            "<pre>|P|r|e|f|o|r|m|a|t|t|e|d|<br>| | |t|r|a|i|l|i|n|g| |e|m|p|t|y| |l|i|n|e|"
                    + "<br>|" + tempBR + "</pre>"
        ],

        /**
         * List-related tests for setting the caret.
         */
        testSetCaretList: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var results = com.arrayCopy(tst.SETCARET_RESULT_LIST);
            if (com.ua.isOldIE) {
                com.arrayAdd(results, tst.SETCARET_RESULT_LIST_IE);
            } else {
                com.arrayAdd(results, tst.SETCARET_RESULT_LIST_GECKO);
            }
            if (testRun == null) {
                return deferredSetCaretTestSet(tst.SETCARET_TEST_LIST, results, testIndex);
            }
            return testSetCaretTest(tst.SETCARET_TEST_LIST, results, testIndex, testRun);
        },

        /**
         * List-related tests for getting the caret position.
         */
        testGetCaretList: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var results = com.arrayCopy(tst.SETCARET_RESULT_LIST);
            if (com.ua.isOldIE) {
                com.arrayAdd(results, tst.SETCARET_RESULT_LIST_IE);
            } else {
                com.arrayAdd(results, tst.SETCARET_RESULT_LIST_GECKO);
            }
            var exceptions = (com.ua.isOldIE ? tst.GETCARET_EXCEPTIONS_LIST_IE : undefined);
            var maxCharPos = calcMaxCaretPos(results);
            if (testRun == null) {
                return deferredGetCaretTestSet(tst.SETCARET_TEST_LIST, maxCharPos,
                        exceptions, testIndex);
            }
            return testGetCaretTest(tst.SETCARET_TEST_LIST, maxCharPos, exceptions,
                    testIndex, testRun);
        },

        SETCARET_TEST_LIST: [
            // crossbrowser tests
            "<ul><li>A simple</li><li>list</li></ul>",
            "<p>Before list</p><ul><li>A simple</li><li>list</li></ul><p>After list</p>",
            "<ul><li>Item 1<br>with linefeed</li>"
                    + "<li><br>Item 2 with linefeed</li>"
                    + "<li>Item 3</li>"
                    + "</ul>",
            "<p>Before list</p>"
                    + "<ul><li>Item 1<br>with linefeed</li>"
                    + "<li><br>Item 2 with linefeed</li>"
                    + "<li>Item 3</li>"
                    + "</ul>"
                    + "<p>Behind list</p>",
            "<ul><li>Item 1</li>"
                    + "<li>Item with" + anchor + "anchor</li>"
                    + "<li>" + anchor1 + "BOL anchor</li>"
                    + "<li>EOL anchor" + anchor2 + "</li>"
                    + "<li>Final item</li>"
                    + "</ul>",
            // anchors
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
                    + "<p>After</p>",
            // browser-specific tests
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
                    + "<li>Item 3.3</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<p>Before list</p>"
                    + "<ul><li>Item A<ul>"
                    + "<li>Item B</li>"
                    + "<li>Item C</li>"
                    + "<li>Item D</li>"
                    + "</ul></li>"
                    + "</ul>"
                    + "<p>After list</p>",
            "<ul><li>Item 1<ul>"
                    + "<li><b>Item</b> 1.1</li>"
                    + "<li>It<b>em</b> 1.2</li>"
                    + "<li>Item <b>1.3</b></li>"
                    + "</ul></li>"
                    + "<li>Item 2<ul>"
                    + "<li>It<b>em</b> 2.1</li>"
                    + "<li>Item <b>2.2</b></li>"
                    + "<li><b>Item</b> 2.3</li>"
                    + "</ul></li>"
                    + "<li>Item 3<ul>"
                    + "<li>Item <b>3.1</b></li>"
                    + "<li><b>Item</b> 3.2</li>"
                    + "<li>It<b>em</b> 3.3</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<ul><li>Item 1<ul>"
                        + "<li>Item 1.1<ul>"
                            + "<li>Item 1.1.1</li>"
                            + "<li>Item 1.1.2</li>"
                            + "<li>Item 1.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 1.2<ul>"
                            + "<li>Item 1.2.1</li>"
                            + "<li>Item 1.2.2</li>"
                            + "<li>Item 1.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 1.3<ul>"
                            + "<li>Item 1.3.1</li>"
                            + "<li>Item 1.3.2</li>"
                            + "<li>Item 1.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>Item 2<ul>"
                        + "<li>Item 2.1<ul>"
                            + "<li>Item 2.1.1</li>"
                            + "<li>Item 2.1.2</li>"
                            + "<li>Item 2.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 2.2<ul>"
                            + "<li>Item 2.2.1</li>"
                            + "<li>Item 2.2.2</li>"
                            + "<li>Item 2.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 2.3<ul>"
                            + "<li>Item 2.3.1</li>"
                            + "<li>Item 2.3.2</li>"
                            + "<li>Item 2.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>Item 3<ul>"
                        + "<li>Item 3.1<ul>"
                            + "<li>Item 3.1.1</li>"
                            + "<li>Item 3.1.2</li>"
                            + "<li>Item 3.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 3.2<ul>"
                            + "<li>Item 3.2.1</li>"
                            + "<li>Item 3.2.2</li>"
                            + "<li>Item 3.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 3.3<ul>"
                            + "<li>Item 3.3.1</li>"
                            + "<li>Item 3.3.2</li>"
                            + "<li>Item 3.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                + "</ul>",
            "<ul><li>Item 1"
                        + "<ul><li>Item 1.1</li></ul>"
                        + "<ol><li>Item 1.2</li></ol>"
                        + "<ul><li>Item 1.3</li></ul>"
                    + "</li>"
                    + "<li>Item 2"
                        + "<ol><li>Item 2.1</li>"
                        + "<li>Item 2.2</li>"
                        + "<li>Item 2.3</li></ol>"
                        + "<ul><li>Item 2.4</li>"
                        + "<li>Item 2.5</li>"
                        + "<li>Item 2.6</li></ul>"
                    + "</li>"
                    + "<li>Item 3</li></ul>"
        ],

        SETCARET_RESULT_LIST: [
            "<ul><li>|A| |s|i|m|p|l|e|</li><li>|l|i|s|t|</li></ul>",
            "<p>|B|e|f|o|r|e| |l|i|s|t|</p>"
                    + "<ul><li>|A| |s|i|m|p|l|e|</li><li>|l|i|s|t|</li></ul>"
                    + "<p>|A|f|t|e|r| |l|i|s|t|</p>",
            "<ul><li>|I|t|e|m| |1|<br>|w|i|t|h| |l|i|n|e|f|e|e|d|</li>"
                    + "<li>|<br>|I|t|e|m| |2| |w|i|t|h| |l|i|n|e|f|e|e|d|</li>"
                    + "<li>|I|t|e|m| |3|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e| |l|i|s|t|</p>"
                    + "<ul><li>|I|t|e|m| |1|<br>|w|i|t|h| |l|i|n|e|f|e|e|d|</li>"
                    + "<li>|<br>|I|t|e|m| |2| |w|i|t|h| |l|i|n|e|f|e|e|d|</li>"
                    + "<li>|I|t|e|m| |3|</li>"
                    + "</ul>"
                    + "<p>|B|e|h|i|n|d| |l|i|s|t|</p>",
            // anchors
            "<ul><li>|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |w|i|t|h|" + anchorResult + "|a|n|c|h|o|r|</li>"
                    + "<li>|" + anchor1Result + "|B|O|L| |a|n|c|h|o|r|</li>"
                    + "<li>|E|O|L| |a|n|c|h|o|r|" + anchor2Result + "|</li>"
                    + "<li>|F|i|n|a|l| |i|t|e|m|</li>"
                    + "</ul>",
            "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "<li>|" + anchor2Result + "|I|t|e|m| |3|</li>"
                    + "</ul>",
            "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "<li>|I|t|e|m| |3|" + anchor2Result + "|</li>"
                    + "</ul>",
            "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "</ul>",
            "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "<li>|" + anchor2Result + "|I|t|e|m| |3|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "<li>|I|t|e|m| |3|" + anchor2Result + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            // images
            "<ul><li>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| |i|m|a|g|e|s| "
                    + "|i|n| |a| |r|o|w|</li>"
                    + "<li>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| "
                    + "|i|m|a|g|e|s| |i|n| |a| |r|o|w|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|" + imgSmallResult
                    + "|T|w|o| |i|m|a|g|e|s| |i|n| |a| |r|o|w|</li>"
                    + "<li>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| "
                    + "|i|m|a|g|e|s| |i|n| |a| |r|o|w|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |" + imgSmallResult
                    + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</li>"
                    + "<li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>"
        ],

        // Gecko works as expected, but we'll have to provide a IE-specific result due to
        // IE bugs; hence this should considered to be the default "expected result"
        SETCARET_RESULT_LIST_GECKO: [
            "<ul><li>|I|t|e|m| |1|<ul>"
                    + "<li>|I|t|e|m| |1|.|1|</li>"
                    + "<li>|I|t|e|m| |1|.|2|</li>"
                    + "<li>|I|t|e|m| |1|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2|<ul>"
                    + "<li>|I|t|e|m| |2|.|1|</li>"
                    + "<li>|I|t|e|m| |2|.|2|</li>"
                    + "<li>|I|t|e|m| |2|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3|<ul>"
                    + "<li>|I|t|e|m| |3|.|1|</li>"
                    + "<li>|I|t|e|m| |3|.|2|</li>"
                    + "<li>|I|t|e|m| |3|.|3|</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e| |l|i|s|t|</p>"
                    + "<ul><li>|I|t|e|m| |A|<ul>"
                    + "<li>|I|t|e|m| |B|</li>"
                    + "<li>|I|t|e|m| |C|</li>"
                    + "<li>|I|t|e|m| |D|</li>"
                    + "</ul></li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r| |l|i|s|t|</p>",
            "<ul><li>|I|t|e|m| |1|<ul>"
                    + "<li><b>|I|t|e|m|</b> |1|.|1|</li>"
                    + "<li>|I|t|<b>e|m|</b> |1|.|2|</li>"
                    + "<li>|I|t|e|m| |<b>1|.|3|</b></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2|<ul>"
                    + "<li>|I|t|<b>e|m|</b> |2|.|1|</li>"
                    + "<li>|I|t|e|m| |<b>2|.|2|</b></li>"
                    + "<li><b>|I|t|e|m|</b> |2|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3|<ul>"
                    + "<li>|I|t|e|m| |<b>3|.|1|</b></li>"
                    + "<li><b>|I|t|e|m|</b> |3|.|2|</li>"
                    + "<li>|I|t|<b>e|m|</b> |3|.|3|</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<ul><li>|I|t|e|m| |1|<ul>"
                        + "<li>|I|t|e|m| |1|.|1|<ul>"
                            + "<li>|I|t|e|m| |1|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |1|.|2|<ul>"
                            + "<li>|I|t|e|m| |1|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |1|.|3|<ul>"
                            + "<li>|I|t|e|m| |1|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2|<ul>"
                        + "<li>|I|t|e|m| |2|.|1|<ul>"
                            + "<li>|I|t|e|m| |2|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |2|.|2|<ul>"
                            + "<li>|I|t|e|m| |2|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |2|.|3|<ul>"
                            + "<li>|I|t|e|m| |2|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3|<ul>"
                        + "<li>|I|t|e|m| |3|.|1|<ul>"
                            + "<li>|I|t|e|m| |3|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |3|.|2|<ul>"
                            + "<li>|I|t|e|m| |3|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |3|.|3|<ul>"
                            + "<li>|I|t|e|m| |3|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                + "</ul>",
            "<ul><li>|I|t|e|m| |1|"
                        + "<ul><li>|I|t|e|m| |1|.|1|</li></ul>"
                        + "<ol><li>|I|t|e|m| |1|.|2|</li></ol>"
                        + "<ul><li>|I|t|e|m| |1|.|3|</li></ul>"
                    + "</li>"
                    + "<li>|I|t|e|m| |2|"
                        + "<ol><li>|I|t|e|m| |2|.|1|</li>"
                        + "<li>|I|t|e|m| |2|.|2|</li>"
                        + "<li>|I|t|e|m| |2|.|3|</li></ol>"
                        + "<ul><li>|I|t|e|m| |2|.|4|</li>"
                        + "<li>|I|t|e|m| |2|.|5|</li>"
                        + "<li>|I|t|e|m| |2|.|6|</li></ul>"
                    + "</li>"
                    + "<li>|I|t|e|m| |3|</li></ul>"
        ],

        // IE has major problems with the last character of a list item that contains a
        // nested list (it cannot be selected with a collapsed range and no workaround
        // has been found yet), so we'll provide IE specific results for result lists.
        SETCARET_RESULT_LIST_IE: [
            "<ul><li>|I|t|e|m| |1<ul>"
                    + "<li>||I|t|e|m| |1|.|1|</li>"
                    + "<li>|I|t|e|m| |1|.|2|</li>"
                    + "<li>|I|t|e|m| |1|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2<ul>"
                    + "<li>||I|t|e|m| |2|.|1|</li>"
                    + "<li>|I|t|e|m| |2|.|2|</li>"
                    + "<li>|I|t|e|m| |2|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3<ul>"
                    + "<li>||I|t|e|m| |3|.|1|</li>"
                    + "<li>|I|t|e|m| |3|.|2|</li>"
                    + "<li>|I|t|e|m| |3|.|3|</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e| |l|i|s|t|</p>"
                    + "<ul><li>|I|t|e|m| |A<ul>"
                    + "<li>||I|t|e|m| |B|</li>"
                    + "<li>|I|t|e|m| |C|</li>"
                    + "<li>|I|t|e|m| |D|</li>"
                    + "</ul></li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r| |l|i|s|t|</p>",
            "<ul><li>|I|t|e|m| |1<ul>"
                    + "<li><b>||I|t|e|m|</b> |1|.|1|</li>"
                    + "<li>|I|t|<b>e|m|</b> |1|.|2|</li>"
                    + "<li>|I|t|e|m| |<b>1|.|3|</b></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2<ul>"
                    + "<li>||I|t|<b>e|m|</b> |2|.|1|</li>"
                    + "<li>|I|t|e|m| |<b>2|.|2|</b></li>"
                    + "<li><b>|I|t|e|m|</b> |2|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3<ul>"
                    + "<li>||I|t|e|m| |<b>3|.|1|</b></li>"
                    + "<li><b>|I|t|e|m|</b> |3|.|2|</li>"
                    + "<li>|I|t|<b>e|m|</b> |3|.|3|</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<ul><li>|I|t|e|m| |1<ul>"
                        + "<li>||I|t|e|m| |1|.|1<ul>"
                            + "<li>||I|t|e|m| |1|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |1|.|2<ul>"
                            + "<li>||I|t|e|m| |1|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |1|.|3<ul>"
                            + "<li>||I|t|e|m| |1|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2<ul>"
                        + "<li>||I|t|e|m| |2|.|1<ul>"
                            + "<li>||I|t|e|m| |2|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |2|.|2<ul>"
                            + "<li>||I|t|e|m| |2|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |2|.|3<ul>"
                            + "<li>||I|t|e|m| |2|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3<ul>"
                        + "<li>||I|t|e|m| |3|.|1<ul>"
                            + "<li>||I|t|e|m| |3|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |3|.|2<ul>"
                            + "<li>||I|t|e|m| |3|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |3|.|3<ul>"
                            + "<li>||I|t|e|m| |3|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                + "</ul>",
            "<ul><li>|I|t|e|m| |1"
                        + "<ul><li>||I|t|e|m| |1|.|1|</li></ul>"
                        + "<ol><li>|I|t|e|m| |1|.|2|</li></ol>"
                        + "<ul><li>|I|t|e|m| |1|.|3|</li></ul>"
                    + "</li>"
                    + "<li>|I|t|e|m| |2"
                        + "<ol><li>||I|t|e|m| |2|.|1|</li>"
                        + "<li>|I|t|e|m| |2|.|2|</li>"
                        + "<li>|I|t|e|m| |2|.|3|</li></ol>"
                        + "<ul><li>|I|t|e|m| |2|.|4|</li>"
                        + "<li>|I|t|e|m| |2|.|5|</li>"
                        + "<li>|I|t|e|m| |2|.|6|</li></ul>"
                    + "</li>"
                    + "<li>|I|t|e|m| |3|</li></ul>"
        ],

        // Table of exceptions where getCaretPos reports a different position than
        // set by setCaretPos correctly (due to browser bugs or unnecessary complexity)
        GETCARET_EXCEPTIONS_LIST_IE: [ {
                "index": 25,
                "charPos": 6,
                "reportedPos": 7
            }, {
                "index": 25,
                "charPos": 40,
                "reportedPos": 41
            }, {
                "index": 25,
                "charPos": 74,
                "reportedPos": 75
            }, {
                "index": 26,
                "charPos": 18,
                "reportedPos": 19
            }, {
                "index": 27,
                "charPos": 6,
                "reportedPos": 7
            }, {
                "index": 27,
                "charPos": 40,
                "reportedPos": 41
            }, {
                "index": 27,
                "charPos": 74,
                "reportedPos": 75
            }, {
                "index": 28,
                "charPos": 6,
                "reportedPos": 7
            }, {
                "index": 28,
                "charPos": 15,
                "reportedPos": 16
            }, {
                "index": 28,
                "charPos": 57,
                "reportedPos": 58
            }, {
                "index": 28,
                "charPos": 99,
                "reportedPos": 100
            }, {
                "index": 28,
                "charPos": 139,
                "reportedPos": 140
            }, {
                "index": 28,
                "charPos": 148,
                "reportedPos": 149
            }, {
                "index": 28,
                "charPos": 190,
                "reportedPos": 191
            }, {
                "index": 28,
                "charPos": 232,
                "reportedPos": 233
            }, {
                "index": 28,
                "charPos": 272,
                "reportedPos": 273
            }, {
                "index": 28,
                "charPos": 281,
                "reportedPos": 282
            }, {
                "index": 28,
                "charPos": 323,
                "reportedPos": 324
            }, {
                "index": 28,
                "charPos": 365,
                "reportedPos": 366
            }, {
                "index": 29,
                "charPos": 6,
                "reportedPos": 7
            }, {
                "index": 29,
                "charPos": 40,
                "reportedPos": 41
            }
        ],

        /**
         * Table-related tests for setting the caret.
         */
        testSetCaretTable: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var results = com.arrayCopy(tst.SETCARET_RESULT_TABLE);
            if (com.ua.isOldIE) {
                com.arrayAdd(results, tst.SETCARET_RESULT_TABLE_IE);
            } else {
                com.arrayAdd(results, tst.SETCARET_RESULT_TABLE_GECKO);
            }
            if (testRun == null) {
                return deferredSetCaretTestSet(tst.SETCARET_TEST_TABLE, results, testIndex);
            }
            return testSetCaretTest(tst.SETCARET_TEST_TABLE, results, testIndex, testRun);
        },

        /**
         * Table-related tests for getting the caret position.
         */
        testGetCaretTable: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var results = com.arrayCopy(tst.SETCARET_RESULT_TABLE);
            if (com.ua.isOldIE) {
                com.arrayAdd(results, tst.SETCARET_RESULT_TABLE_IE);
            } else {
                com.arrayAdd(results, tst.SETCARET_RESULT_TABLE_GECKO);
            }
            var maxCharPos = calcMaxCaretPos(results);
            var exceptions = com.arrayCopy(tst.GETCARET_EXCEPTIONS_TABLE);
            if (com.ua.isOldIE) {
                com.arrayAdd(exceptions, tst.GETCARET_EXCEPTIONS_TABLE_IE);
            }
            if (testRun == null) {
                return deferredGetCaretTestSet(tst.SETCARET_TEST_TABLE, maxCharPos,
                        exceptions, testIndex);
            }
            return testGetCaretTest(tst.SETCARET_TEST_TABLE, maxCharPos, exceptions,
                    testIndex, testRun);
        },

        SETCARET_TEST_TABLE: [
            // "simple" tables
            "<table border=\"1\"><tr><td>Cell 1</td><td>Cell 2</td></tr><tr><td>Cell 3</td>"
                    + "<td>Cell 4</td></tr></table>",
            "<table border=\"1\"><tr><td><p>Cell 1</p><p>Para 2</p></td><td><p>Cell 2</p>"
                    + "<p>Para 2</p></td></tr><tr><td><p>Cell 3</p><p>Para 2</p></td>"
                    + "<td><p>Cell 4</p><p>Para 2</p></td></tr></table>",
            "<p>Before table</p>"
                    + "<table border=\"1\"><tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr></table>"
                    + "<p>After table</p>",
            "<table border=\"1\">"
                    + "<tr><td>Cell 1<br>Line 2</td><td>Cell 2<br>Line 2</td></tr>"
                    + "<tr><td>Cell 3<br>Line 2</td><td>Cell 4<br>Line 2</td></tr>"
                    + "</table>",
            /*
            "<table border=\"1\">"
                    + "<caption>A caption</caption>"
                    + "<tr><td>Cell 1<br>Line 2</td><td>Cell 2<br>Line 2</td></tr>"
                    + "<tr><td>Cell 3<br>Line 2</td><td>Cell 4<br>Line 2</td></tr>"
                    + "</table>",
            "<p>Before table</p>"
                    + "<table border=\"1\">"
                    + "<caption>A caption</caption>"
                    + "<tr><td>Cell 1<br>Line 2</td><td>Cell 2<br>Line 2</td></tr>"
                    + "<tr><td>Cell 3<br>Line 2</td><td>Cell 4<br>Line 2</td></tr>"
                    + "</table>",
            */
            // nested tables
            "<table border=\"1\"><tr><td>"
                    + "<table border=\"1\"><tr><td>1.1</td><td>1.2</td></tr>"
                    + "<tr><td>1.3</td><td>1.4</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>2.1</td><td>2.2</td></tr>"
                    + "<tr><td>2.3</td><td>2.4</td></tr></table>"
                    + "</td></tr><tr><td>"
                    + "<table border=\"1\"><tr><td>3.1</td><td>3.2</td></tr>"
                    + "<tr><td>3.3</td><td>3.4</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>4.1</td><td>4.2</td></tr>"
                    + "<tr><td>4.3</td><td>4.4</td></tr></table>"
                    + "</td></tr></table>",
            "<p>Before</p>"
                    + "<table border=\"1\"><tr><td>"
                    + "<table border=\"1\"><tr><td>1.1</td><td>1.2</td></tr>"
                    + "<tr><td>1.3</td><td>1.4</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>2.1</td><td>2.2</td></tr>"
                    + "<tr><td>2.3</td><td>2.4</td></tr></table>"
                    + "</td></tr><tr><td>"
                    + "<table border=\"1\"><tr><td>3.1</td><td>3.2</td></tr>"
                    + "<tr><td>3.3</td><td>3.4</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>4.1</td><td>4.2</td></tr>"
                    + "<tr><td>4.3</td><td>4.4</td></tr></table>"
                    + "</td></tr></table>"
                    + "<p>After</p>",
            // mixed structures
            "<table border=\"1\"><tr><td><ul>"
                    + "<li>Item 1</li>"
                    + "<li>Item 2</li>"
                    + "<li>Item 3</li>"
                    + "</ul></td></tr></table>",
            "<p>Before</p>"
                    + "<table border=\"1\"><tr><td><ul>"
                    + "<li>Item 1</li>"
                    + "<li>Item 2</li>"
                    + "<li>Item 3</li>"
                    + "</ul></td></tr></table>"
                    + "<p>After</p>",
            // more complex testcases
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
                    + "</table>",
            // (browser-specific test cases start here)
            "<p>Before</p>"
                    + "<table border=\"1\"><tr><td><ul>"
                    + "<li>Item 1</li>"
                    + "<li>Item 2</li>"
                    + "<li>Item 3<ul>"
                    + "<li>Item 3.1</li>"
                    + "<li>Item 3.2</li>"
                    + "</ul></li>"
                    + "</ul></td></tr></table>"
                    + "<p>After</p>"
        ],

        SETCARET_RESULT_TABLE: [
            // "simple" tables
            "<table border=\"1\"><tr><td>|C|e|l|l| |1|</td><td>|C|e|l|l| |2|</td></tr><tr>"
                    + "<td>|C|e|l|l| |3|</td><td>|C|e|l|l| |4|</td></tr></table>",
            "<table border=\"1\">"
                    + "<tr><td><p>|C|e|l|l| |1|</p><p>|P|a|r|a| |2||</p></td>"
                    + "<td><p>|C|e|l|l| |2|</p><p>|P|a|r|a| |2||</p></td></tr>"
                    + "<tr><td><p>|C|e|l|l| |3|</p><p>|P|a|r|a| |2||</p></td>"
                    + "<td><p>|C|e|l|l| |4|</p><p>|P|a|r|a| |2||</p></td></tr></table>",
            "<p>|B|e|f|o|r|e| |t|a|b|l|e|</p>"
                    + "<table border=\"1\"><tr><td>|C|e|l|l| |1|</td>"
                    + "<td>|C|e|l|l| |2|</td></tr><tr><td>|C|e|l|l| |3|</td>"
                    + "<td>|C|e|l|l| |4|</td></tr></table>"
                    + "<p>|A|f|t|e|r| |t|a|b|l|e|</p>",
            "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|<br>|L|i|n|e| |2|</td>"
                    + "<td>|C|e|l|l| |2|<br>|L|i|n|e| |2|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|<br>|L|i|n|e| |2|</td>"
                    + "<td>|C|e|l|l| |4|<br>|L|i|n|e| |2|</td></tr>"
                    + "</table>",
            /*
            "<table border=\"1\">"
                    + "<caption>|A| |c|a|p|t|i|o|n|</caption>"
                    + "<tr><td>|C|e|l|l| |1|<br>|L|i|n|e| |2|</td>"
                    + "<td>|C|e|l|l| |2|<br>|L|i|n|e| |2|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|<br>|L|i|n|e| |2|</td>"
                    + "<td>|C|e|l|l| |4|<br>|L|i|n|e| |2|</td></tr>"
                    + "</table>",
            "<p>|B|e|f|o|r|e| |t|a|b|l|e|</p>"
                    + "<table border=\"1\">"
                    + "<caption>|A| |c|a|p|t|i|o|n|</caption>"
                    + "<tr><td>|C|e|l|l| |1|<br>|L|i|n|e| |2|</td>"
                    + "<td>|C|e|l|l| |2|<br>|L|i|n|e| |2|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|<br>|L|i|n|e| |2|</td>"
                    + "<td>|C|e|l|l| |4|<br>|L|i|n|e| |2|</td></tr>"
                    + "</table>",
            */
            // nested tables
            "<table border=\"1\"><tr><td>"
                    + "<table border=\"1\"><tr><td>|1|.|1|</td><td>|1|.|2|</td></tr>"
                    + "<tr><td>|1|.|3|</td><td>|1|.|4|</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>|2|.|1|</td><td>|2|.|2|</td></tr>"
                    + "<tr><td>|2|.|3|</td><td>|2|.|4|</td></tr></table>"
                    + "</td></tr><tr><td>"
                    + "<table border=\"1\"><tr><td>|3|.|1|</td><td>|3|.|2|</td></tr>"
                    + "<tr><td>|3|.|3|</td><td>|3|.|4|</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>|4|.|1|</td><td>|4|.|2|</td></tr>"
                    + "<tr><td>|4|.|3|</td><td>|4|.|4|</td></tr></table>"
                    + "</td></tr></table>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<table border=\"1\"><tr><td>"
                    + "<table border=\"1\"><tr><td>|1|.|1|</td><td>|1|.|2|</td></tr>"
                    + "<tr><td>|1|.|3|</td><td>|1|.|4|</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>|2|.|1|</td><td>|2|.|2|</td></tr>"
                    + "<tr><td>|2|.|3|</td><td>|2|.|4|</td></tr></table>"
                    + "</td></tr><tr><td>"
                    + "<table border=\"1\"><tr><td>|3|.|1|</td><td>|3|.|2|</td></tr>"
                    + "<tr><td>|3|.|3|</td><td>|3|.|4|</td></tr></table>"
                    + "</td><td>"
                    + "<table border=\"1\"><tr><td>|4|.|1|</td><td>|4|.|2|</td></tr>"
                    + "<tr><td>|4|.|3|</td><td>|4|.|4|</td></tr></table>"
                    + "</td></tr></table>"
                    + "<p>|A|f|t|e|r|</p>",
            // mixed structures
            "<table border=\"1\"><tr><td><ul>"
                    + "<li>|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|</li>"
                    + "<li>|I|t|e|m| |3|</li>"
                    + "</ul></td></tr></table>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<table border=\"1\"><tr><td><ul>"
                    + "<li>|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|</li>"
                    + "<li>|I|t|e|m| |3||</li>"
                    + "</ul></td></tr></table>"
                    + "<p>|A|f|t|e|r|</p>",
            // more complex situations
            "<table border=\"1\">"
                    + "<tr><td>|" + anchorResult + "|A|n|c|h|o|r|s| |i|n|" + anchor1Result
                    + "|a| |t|a|b|l|e| |c|e|l|l|" + anchor2Result + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + anchorResult + "|C|e|l|l| |1|</td></tr>"
                    + "<tr><td>|" + anchor1Result + "|C|e|l|l| |2|</td></tr>"
                    + "<tr><td>|" + anchor2Result + "|C|e|l|l| |3|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|" + anchorResult + "|</td></tr>"
                    + "<tr><td>|C|e|l|l| |2|" + anchor1Result + "|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|" + anchor2Result + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|" + anchorResult + "|</td></tr>"
                    + "<tr><td>|" + anchor1Result + "|C|e|l|l| |2|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + anchorResult + "|C|e|l|l| |1|</td></tr>"
                    + "<tr><td>|C|e|l|l| |2|" + anchor1Result + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td><p>|P|a|r|a| |1|</p>"
                    + "<p>|P|a|r|a|" + anchorResult + "|2|<br>|L|i|n|e| |2|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td><p>|" + anchorResult + "|C|e|l|l| |1|</p>"
                    + "<p>|P|a|r|a| |2|" + anchor1Result + "|</p></td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| "
                    + "|i|m|a|g|e|s| |i|n| |a| |r|o|w|</td>"
                    + "<td>|T|w|o| |i|m|a|g|e|s| |i|n| |a| |r|o|w|" + imgSmallResult + "|"
                    + imgSmallResult + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</td>"
                    + "<td>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + imgSmallResult + "|</td>"
                    + "<td>|" + imgSmallResult + "|" + imgSmallResult + "|</td></tr>"
                    + "<tr><td><p>|" + imgSmallResult + "||</p></td>"
                    + "<td>|" + imgSmallResult + "|<br>|" + imgSmallResult + "|</td></tr>"
                    + "<tr><td><p>|" + imgSmallResult + "|</p><p>|" + imgSmallResult
                    + "||</p></td>"
                    + "<td><p>|B|e|f|o|r|e|</p><p>|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r||</p></td></tr>"
                    + "</table>"
        ],

        SETCARET_RESULT_TABLE_GECKO: [
            "<p>|B|e|f|o|r|e|</p>"
                    + "<table border=\"1\"><tr><td><ul>"
                    + "<li>|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|</li>"
                    + "<li>|I|t|e|m| |3|<ul>"
                    + "<li>|I|t|e|m| |3|.|1|</li>"
                    + "<li>|I|t|e|m| |3|.|2||</li>"
                    + "</ul></li>"
                    + "</ul></td></tr></table>"
                    + "<p>|A|f|t|e|r|</p>"
        ],

        SETCARET_RESULT_TABLE_IE: [
            "<p>|B|e|f|o|r|e|</p>"
                    + "<table border=\"1\"><tr><td><ul>"
                    + "<li>|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|</li>"
                    + "<li>|I|t|e|m| |3<ul>"
                    + "<li>||I|t|e|m| |3|.|1|</li>"
                    + "<li>|I|t|e|m| |3|.|2||</li>"
                    + "</ul></li>"
                    + "</ul></td></tr></table>"
                    + "<p>|A|f|t|e|r|</p>"
        ],

        // Table of exceptions where getCaretPos reports a different position than
        // set by setCaretPos correctly (due to browser bugs or unnecessary complexity)
        GETCARET_EXCEPTIONS_TABLE: [ {
                "index": 1,
                "charPos": 14,
                "reportedPos": 13
            }, {
                "index": 1,
                "charPos": 29,
                "reportedPos": 28
            }, {
                "index": 1,
                "charPos": 44,
                "reportedPos": 43
            }, {
                "index": 1,
                "charPos": 59,
                "reportedPos": 58
            }, {
                "index": 7,
                "charPos": 28,
                "reportedPos": 27
            }, {
                "index": 17,
                "charPos": 7,
                "reportedPos": 6
            }, {
                "index": 17,
                "charPos": 16,
                "reportedPos": 15
            }, {
                "index": 17,
                "charPos": 32,
                "reportedPos": 31
            }, {
                "index": 18,
                "charPos": 46,
                "reportedPos": 45
            }
        ],

        // additional exceptions for buggy IE
        GETCARET_EXCEPTIONS_TABLE_IE: [
            {
                "index": 18,
                "charPos": 27,
                "reportedPos": 28
            }
        ],

        /**
         * Browser-specific tests for setting the caret.
         */
        testSetCaretBrowserSpecific: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var htmls = (com.ua.isIE ? tst.SETCARET_TEST_IE
                    : (com.ua.isWebKit ? tst.SETCARET_TEST_WEBKIT
                        : tst.SETCARET_TEST_GECKO));
            var results = (com.ua.isIE ? tst.SETCARET_RESULT_IE
                    : (com.ua.isWebKit ? tst.SETCARET_RESULT_WEBKIT
                        : tst.SETCARET_RESULT_GECKO));
            if (testRun == null) {
                return deferredSetCaretTestSet(htmls, results, testIndex);
            }
            return testSetCaretTest(htmls, results, testIndex, testRun);
        },

        /**
         * Browser-specific tests for getting the caret.
         */
        testGetCaretBrowserSpecific: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var htmls = (com.ua.isIE ? tst.SETCARET_TEST_IE
                    : (com.ua.isWebKit ? tst.SETCARET_TEST_WEBKIT
                        : tst.SETCARET_TEST_GECKO));
            var results = (com.ua.isIE ? tst.SETCARET_RESULT_IE
                    : (com.ua.isWebKit ? tst.SETCARET_RESULT_WEBKIT
                        : tst.SETCARET_RESULT_GECKO));
            var exceptions = (com.ua.isWebKit || com.ua.isGecko
                    ? tst.GETCARET_EXCEPTIONS_BR_BROWSERS : null);
            var maxCaretPos = calcMaxCaretPos(results);
            if (testRun == null) {
                return deferredGetCaretTestSet(htmls, maxCaretPos, exceptions, testIndex);
            }
            return testGetCaretTest(htmls, maxCaretPos, exceptions, testIndex, testRun);
        },

        SETCARET_TEST_IE: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Testing empty</p><p>&nbsp;</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>&nbsp;</p>",
            "<p>&nbsp;</p><p>&nbsp;</p><p>&nbsp;</p>",
            "<p>Text with " + anchor + "&nbsp;an anchor.</p>",
            "<p>" + anchor + "&nbsp;BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>EOL anchor " + anchor1 + "</p>"
                    + "<p>EOL anchor " + anchor2 + "</p>",
            "<p>Multiple " + anchor + "&nbsp;anchors " + anchor1 + "&nbsp;in one "
                    + anchor2 + "&nbsp;para.</p>",
            "<p>Multiple anchors " + anchor + anchor1 + anchor2 + "&nbsp;directly</p>",
            "<table border=\"1\"><tr><td>&nbsp;</td><td>&nbsp;</td></tr>"
                    + "<tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>",
            "<p>complex linefeed 2<br>&nbsp;</p>",
            "<p>complex linefeed 4<br><br>&nbsp;</p>"
        ],

        SETCARET_RESULT_IE: [
            // IE does crazy things here: In the DOM there are actually no &nbsp; nodes
            // defined, but the innerHTML (that is used for checking against the expected
            // result) adds them automatically, so we'll have to put them into our
            // expected results as well
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|&nbsp;</p><p>|p|a|r|a|g|r|a|p|h|s|.|"
                    + "</p>",
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|&nbsp;</p><p>|&nbsp;</p>"
                    + "<p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|&nbsp;</p>",
            "<p>|&nbsp;</p><p>|&nbsp;</p><p>|&nbsp;</p>",
            "<p>|T|e|x|t| |w|i|t|h| |" + anchorResult + "|&nbsp;|a|n| |a|n|c|h|o|r|.|</p>",
            "<p>|" + anchorResult + "|&nbsp;|B|O|L| |a|n|c|h|o|r|</p>",
            "<p>|E|O|L| |a|n|c|h|o|r| |" + anchorResult + "|</p>",
            "<p>|E|O|L| |a|n|c|h|o|r| |" + anchor1Result + "|</p>"
                    + "<p>|E|O|L| |a|n|c|h|o|r| |" + anchor2Result + "|</p>",
            "<p>|M|u|l|t|i|p|l|e| |" + anchorResult + "|&nbsp;|a|n|c|h|o|r|s| |"
                    + anchor1Result + "|&nbsp;|i|n| |o|n|e| |" + anchor2Result
                    + "|&nbsp;|p|a|r|a|.|</p>",
            "<p>|M|u|l|t|i|p|l|e| |a|n|c|h|o|r|s| |" + anchorResult + "|" + anchor1Result
                    + "|" + anchor2Result + "|&nbsp;|d|i|r|e|c|t|l|y|</p>",
            "<table border=\"1\"><tr><td>|</td><td>|</td></tr>"
                    + "<tr><td>|</td><td>|</td></tr></table>",
            "<p>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |2|<br>|</p>",
            "<p>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |4|<br>|<br>|</p>"
        ],

        SETCARET_TEST_GECKO: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>", {
                "html": "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><br>",
                // required by workaround that converts the trailing <br> into a <p><br></p>
                "setDirectly": true
            },
            "<p>Multiple anchors " + anchor + anchor1 + anchor2 + " directly</p>",
            "<table border=\"1\"><tr><td>&nbsp;</td><td>&nbsp;</td></tr>"
                    + "<tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>",
            "<p>complex linefeed 2<br>&nbsp;</p>",
            "<p>complex linefeed 4<br><br>&nbsp;</p>"
        ],

        SETCARET_RESULT_GECKO: [
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>||" + tempBR + "</p>"
                    + "<p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|T|e|x|t| |w|i|t|h| |" + anchorResult + "| |a|n| |a|n|c|h|o|r|.|</p>",
            "<p>|" + anchorResult + "| |B|O|L| |a|n|c|h|o|r|</p>",
            "<p>|E|O|L| |a|n|c|h|o|r| |" + anchorResult + "|</p>",
            "<p>|M|u|l|t|i|p|l|e| |" + anchorResult + "| |a|n|c|h|o|r|s| |" + anchor1Result
                    + "| |i|n| |o|n|e| |" + anchor2Result + "| |p|a|r|a|.|</p>",
            "<ul><li>|I|t|e|m| |1|</li><li>|I|t|e|m| |2|</li><li>|I|t|e|m| |3|</li></ul>"
                    + "|<br>",
            "<p>|M|u|l|t|i|p|l|e| |a|n|c|h|o|r|s| |" + anchorResult + "|" + anchor1Result
                    + "|" + anchor2Result + "| |d|i|r|e|c|t|l|y|</p>",
            "<table border=\"1\"><tr><td>||" + tempBR + "</td>"
                    + "<td>||" + tempBR + "</td></tr>"
                    + "<tr><td>||" + tempBR + "</td>"
                    + "<td>||" + tempBR + "</td></tr></table>",
            "<p>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |2|<br>|" + tempBR + "</p>",
            "<p>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |4|<br>|<br>|" + tempBR + "</p>"
        ],

        SETCARET_TEST_WEBKIT: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>", {
                "html": "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul><br>",
                // required by workaround that converts the trailing <br> into a <p><br></p>
                "setDirectly": true
            },
            "<p>Multiple anchors " + anchor + anchor1 + anchor2 + " directly</p>",
            "<table border=\"1\"><tr><td>&nbsp;</td><td>&nbsp;</td></tr>"
                    + "<tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>",
            "<p>complex linefeed 2<br>&nbsp;</p>",
            "<p>complex linefeed 4<br><br>&nbsp;</p>"
        ],

        // note that empty block placeholder br's get removed by the test library,
        // so empty blocks/cells are expressed as || for Webkit
        SETCARET_RESULT_WEBKIT: [
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>||" + tempBR + "</p>"
                    + "<p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|T|e|x|t| |w|i|t|h| |" + anchorResult + "| |a|n| |a|n|c|h|o|r|.|</p>",
            "<p>|" + anchorResult + "| |B|O|L| |a|n|c|h|o|r|</p>",
            "<p>|E|O|L| |a|n|c|h|o|r| |" + anchorResult + "|</p>",
            "<p>|M|u|l|t|i|p|l|e| |" + anchorResult + "| |a|n|c|h|o|r|s| |" + anchor1Result
                    + "| |i|n| |o|n|e| |" + anchor2Result + "| |p|a|r|a|.|</p>",
            "<ul><li>|I|t|e|m| |1|</li><li>|I|t|e|m| |2|</li><li>|I|t|e|m| |3|</li></ul>"
                    + "|<br>",
            "<p>|M|u|l|t|i|p|l|e| |a|n|c|h|o|r|s| |" + anchorResult + "|" + anchor1Result
                    + "|" + anchor2Result + "| |d|i|r|e|c|t|l|y|</p>",
            "<table border=\"1\"><tr><td>||" + tempBR + "</td>"
                    + "<td>||" + tempBR + "</td></tr>"
                    + "<tr><td>||" + tempBR + "</td>"
                    + "<td>||" + tempBR + "</td></tr></table>",
            "<p>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |2|<br>|" + tempBR + "</p>",
            "<p>|c|o|m|p|l|e|x| |l|i|n|e|f|e|e|d| |4|<br>|<br>|" + tempBR + "</p>"
        ],

        // Table of exceptions where getCaretPos reports a different position than
        // set by setCaretPos correctly (due to browser bugs or unnecessary complexity)
        GETCARET_EXCEPTIONS_BR_BROWSERS: [ {
                "index": 0,
                "charPos": 15,
                "reportedPos": 14
            }, {
                "index": 7,
                "charPos": 1,
                "reportedPos": 0
            }, {
                "index": 7,
                "charPos": 3,
                "reportedPos": 2
            }, {
                "index": 7,
                "charPos": 5,
                "reportedPos": 4
            }, {
                "index": 7,
                "charPos": 7,
                "reportedPos": 6
            }
        ],


        // Testing bookmarking -------------------------------------------------------------

        testSelectBookmarkBasics: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            if ((testIndex == null) || (testRun == null)) {
                return deferredSelectBookmarkTestSet(tst.BOOKMARK_BASICS_HTMLS,
                        tst.BOOKMARK_BASICS_RESULTS, null, testIndex);
            }
            return testSelectBookmarkTest(tst.BOOKMARK_BASICS_HTMLS,
                    tst.BOOKMARK_BASICS_RESULTS, null, testIndex, testRun);
        },

        BOOKMARK_BASICS_HTMLS: [
            "<p>Hello, world!</p>",
            "<p>Test with <b>bold</b> content.</p>",
            "<p>Testing a <a href=\"http://pointing.to\">link</a>.</p>",
            "<p>Multiple</p><p>Paragraphs</p>",
            "<p>Linefeed<br>Test 1</p>",
            "<p>Before</p><p>Linefeed<br>Test 2</p><p>After</p>",
            "<p>Before</p><p><br>Linefeed 3</p><p>After</p>",
            "<p>Before</p><p>Linefeed<br><br>Test 4</p><p>After</p>",
            // anchors
            "<p>" + anchor + "Anchors" + anchor1 + "at different positions." + anchor2
                    + "</p>",
            "<p>Before</p>"
                    + "<p>" + anchor + "Anchors" + anchor1 + "at different positions."
                    + anchor2 + "</p>"
                    + "<p>After</p>",
            "<p>" + anchor + "Para 1</p>"
                    + "<p>" + anchor1 + "Para 2</p>"
                    + "<p>" + anchor2 + "Para 3</p>",
            "<p>Para 1" + anchor + "</p>"
                    + "<p>Para 2" + anchor1 + "</p>"
                    + "<p>Para 3" + anchor2 + "</p>",
            "<p>Para 1" + anchor + "</p>"
                    + "<p>" + anchor1 + "Para 2</p>",
            "<p>" + anchor + "Para 1</p>"
                    + "<p>Para 2" + anchor1 + "</p>",
            "<p>Before</p>"
                    + "<p>" + anchor + "Para 1</p><p>Para 2" + anchor1 + "</p>"
                    + "<p>After</p>",
            "<p>Before</p>"
                    + "<p>Para 1" + anchor + "</p><p>" + anchor1 + "Para 2</p>"
                    + "<p>After</p>",
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

        BOOKMARK_BASICS_RESULTS: [
            "<p>|H|e|l|l|o|,| |w|o|r|l|d|!|</p>",
            "<p>|T|e|s|t| |w|i|t|h| |<b>b|o|l|d|</b> |c|o|n|t|e|n|t|.|</p>",
            "<p>|T|e|s|t|i|n|g| |a| |<a href=\"http://pointing.to\">l|i|n|k|</a>.|</p>",
            "<p>|M|u|l|t|i|p|l|e|</p><p>|P|a|r|a|g|r|a|p|h|s|</p>",
            "<p>|L|i|n|e|f|e|e|d|<br>|T|e|s|t| |1|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|L|i|n|e|f|e|e|d|<br>|T|e|s|t| |2|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|<br>|L|i|n|e|f|e|e|d| |3|</p><p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|L|i|n|e|f|e|e|d|<br>|<br>|T|e|s|t| |4|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            // anchors
            "<p>|" + anchorResult + "|A|n|c|h|o|r|s|" + anchor1Result + "|a|t| |d|i|f|f|"
                    + "e|r|e|n|t| |p|o|s|i|t|i|o|n|s|.|"
                    + anchor2Result + "|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|A|n|c|h|o|r|s|" + anchor1Result
                    + "|a|t| |d|i|f|f|e|r|e|n|t| |p|o|s|i|t|i|o|n|s|.|" + anchor2Result
                    + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + anchorResult + "|P|a|r|a| |1|</p>"
                    + "<p>|" + anchor1Result + "|P|a|r|a| |2|</p>"
                    + "<p>|" + anchor2Result + "|P|a|r|a| |3|</p>",
            "<p>|P|a|r|a| |1|" + anchorResult + "|</p>"
                    + "<p>|P|a|r|a| |2|" + anchor1Result + "|</p>"
                    + "<p>|P|a|r|a| |3|" + anchor2Result + "|</p>",
            "<p>|P|a|r|a| |1|" + anchorResult + "|</p>"
                    + "<p>|" + anchor1Result + "|P|a|r|a| |2|</p>",
            "<p>|" + anchorResult + "|P|a|r|a| |1|</p>"
                    + "<p>|P|a|r|a| |2|" + anchor1Result + "|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|P|a|r|a| |1|</p>"
                    + "<p>|P|a|r|a| |2|" + anchor1Result + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|P|a|r|a| |1|" + anchorResult + "|</p>"
                    + "<p>|" + anchor1Result + "|P|a|r|a| |2|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            // images
            "<p>|" + imgResult + "|A| |n|i|c|e| |i|m|a|g|e| |w|i|t|h| |n|o| "
                    + "|a|l|i|g|n|m|e|n|t|</p>",
            "<p>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| |i|m|a|g|e|s| "
                    + "|i|n| |a| |r|o|w|</p>",
            "<p>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |" + imgSmallResult + "| "
                    + "|p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |" + imgSmallResult + "| "
                    + "|p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</p>"
                    + "<p>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + imgLeftResult + "|A| |n|i|c|e| |i|m|a|g|e| |w|i|t|h| "
                    + "|a|l|i|g|n|m|e|n|t| |t|o| |t|h|e| |l|e|f|t|</p>",
            "<p>|A| |n|i|c|e| |i|m|a|g|e| |w|i|t|h| |" + imgLeftResult
                    + "|a|l|i|g|n|m|e|n|t| |t|o| |t|h|e| |l|e|f|t|</p>",
            "<p>|" + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|</p><p>|" + imgSmallResult + "|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|" + imgSmallResult + "|</p><p>|A|f|t|e|r|</p>",
            "<p>|" + imgSmallResult + "|<br>|" + imgSmallResult + "|</p>",
            // combining problem childs ...
            "<p>|T|e|s|t|" + anchorResult + "|w|i|t|h|" + imgSmallResult + "|</p>",
            "<p>|T|e|s|t|" + anchorResult + "|" + imgSmallResult + "|t|o|g|e|t|h|e|r|.|"
                    + "</p>",
            "<p>|T|e|s|t|" + imgSmallResult + "|" + anchorResult + "|t|o|g|e|t|h|e|r|.|"
                    + "</p>",
            "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>",
            "<p>|E|O|L|" + anchorResult + "|" + imgSmallResult + "|</p>",
            "<p>|B|O|L|" + imgSmallResult + "|" + anchorResult + "|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|T|e|s|t|" + anchorResult + "|w|i|t|h|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|T|e|s|t|" + anchorResult + "|" + imgSmallResult
                    + "|t|o|g|e|t|h|e|r|.|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|T|e|s|t|" + imgSmallResult + "|" + anchorResult
                    + "|t|o|g|e|t|h|e|r|.|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|L|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|B|O|L|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>",
            "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>",
            "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>",
            "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>",
            "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|" + imgSmallResult + "|" + anchorResult + "|B|O|B|</p>"
                    + "<p>|E|O|B|" + anchorResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<p>|E|O|B|" + imgSmallResult + "|" + anchorResult + "|</p>"
                    + "<p>|" + anchorResult + "|" + imgSmallResult + "|B|O|B|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|" + imgSmallResult + "|" + anchorResult + "|" + imgSmallResult + "|"
                    + anchor1Result + "|" + imgSmallResult + "|" + anchor2Result + "|</p>",
            "<p>|" + anchorResult + "|" + anchor1Result + "|" + imgSmallResult + "|"
                    + imgSmallResult + "|</p>",
            "<p>|" + imgSmallResult + "|" + imgSmallResult + "|" + anchorResult + "|"
                    + anchor1Result + "|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|" + anchorResult + "|" + anchor1Result + "|"
                    + imgSmallResult + "|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p><p>|" + imgSmallResult + "|" + imgSmallResult + "|"
                    + anchorResult + "|" + anchor1Result + "|</p>"
                    + "<p>|A|f|t|e|r|</p>"
        ],

        testSelectBookmarkList: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            if ((testIndex == null) || (testRun == null)) {
                return deferredSelectBookmarkTestSet(tst.BOOKMARK_LIST_HTMLS,
                        tst.BOOKMARK_LIST_RESULTS, null, testIndex);
            }
            return testSelectBookmarkTest(tst.BOOKMARK_LIST_HTMLS,
                    tst.BOOKMARK_LIST_RESULTS, null, testIndex, testRun);
        },

        BOOKMARK_LIST_HTMLS: [
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
                    + "<li>Item 3.3</li>"
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
                    + "<li>Item 3.3</li>"
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
                    + "<p>After</p>",
            // "deeply nested" list
            "<ul><li>Item 1<ul>"
                        + "<li>Item 1.1<ul>"
                            + "<li>Item 1.1.1</li>"
                            + "<li>Item 1.1.2</li>"
                            + "<li>Item 1.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 1.2<ul>"
                            + "<li>Item 1.2.1</li>"
                            + "<li>Item 1.2.2</li>"
                            + "<li>Item 1.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 1.3<ul>"
                            + "<li>Item 1.3.1</li>"
                            + "<li>Item 1.3.2</li>"
                            + "<li>Item 1.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>Item 2<ul>"
                        + "<li>Item 2.1<ul>"
                            + "<li>Item 2.1.1</li>"
                            + "<li>Item 2.1.2</li>"
                            + "<li>Item 2.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 2.2<ul>"
                            + "<li>Item 2.2.1</li>"
                            + "<li>Item 2.2.2</li>"
                            + "<li>Item 2.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 2.3<ul>"
                            + "<li>Item 2.3.1</li>"
                            + "<li>Item 2.3.2</li>"
                            + "<li>Item 2.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>Item 3<ul>"
                        + "<li>Item 3.1<ul>"
                            + "<li>Item 3.1.1</li>"
                            + "<li>Item 3.1.2</li>"
                            + "<li>Item 3.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 3.2<ul>"
                            + "<li>Item 3.2.1</li>"
                            + "<li>Item 3.2.2</li>"
                            + "<li>Item 3.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 3.3<ul>"
                            + "<li>Item 3.3.1</li>"
                            + "<li>Item 3.3.2</li>"
                            + "<li>Item 3.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                + "</ul>",
            "<ul><li>Item 1"
                        + "<ul><li>Item 1.1</li></ul>"
                        + "<ol><li>Item 1.2</li></ol>"
                        + "<ul><li>Item 1.3</li></ul>"
                    + "</li>"
                    + "<li>Item 2"
                        + "<ol><li>Item 2.1</li>"
                        + "<li>Item 2.2</li>"
                        + "<li>Item 2.3</li></ol>"
                        + "<ul><li>Item 2.4</li>"
                        + "<li>Item 2.5</li>"
                        + "<li>Item 2.6</li></ul>"
                    + "</li>"
                    + "<li>Item 3</li></ul>"
        ],


        BOOKMARK_LIST_RESULTS: [
            "<ul><li>|I|t|e|m| |1|</li><li>|I|t|e|m| |2|</li><li>|I|t|e|m| |3|</li></ul>",
            "<p>|B|e|f|o|r|e|</p><ul><li>|I|t|e|m| |1|</li><li>|I|t|e|m| |2|</li>"
                    + "<li>|I|t|e|m| |3|</li></ul><p>|A|f|t|e|r|</p>",
            "<ul><li>|I|t|e|m| |1|<ul>"
                    + "<li>|I|t|e|m| |1|.|1|</li>"
                    + "<li>|I|t|e|m| |1|.|2|</li>"
                    + "<li>|I|t|e|m| |1|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2|<ul>"
                    + "<li>|I|t|e|m| |2|.|1|</li>"
                    + "<li>|I|t|e|m| |2|.|2|</li>"
                    + "<li>|I|t|e|m| |2|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3|<ul>"
                    + "<li>|I|t|e|m| |3|.|1|</li>"
                    + "<li>|I|t|e|m| |3|.|2|</li>"
                    + "<li>|I|t|e|m| |3|.|3|</li>"
                    + "</ul></li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m| |1|<ul>"
                    + "<li>|I|t|e|m| |1|.|1|</li>"
                    + "<li>|I|t|e|m| |1|.|2|</li>"
                    + "<li>|I|t|e|m| |1|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2|<ul>"
                    + "<li>|I|t|e|m| |2|.|1|</li>"
                    + "<li>|I|t|e|m| |2|.|2|</li>"
                    + "<li>|I|t|e|m| |2|.|3|</li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3|<ul>"
                    + "<li>|I|t|e|m| |3|.|1|</li>"
                    + "<li>|I|t|e|m| |3|.|2|</li>"
                    + "<li>|I|t|e|m| |3|.|3|</li>"
                    + "</ul></li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |w|i|t|h|" + anchorResult + "|a|n|c|h|o|r|</li>"
                    + "<li>|" + anchor1Result + "|B|O|L| |a|n|c|h|o|r|</li>"
                    + "<li>|E|O|L| |a|n|c|h|o|r|" + anchor2Result + "|</li>"
                    + "<li>|F|i|n|a|l| |i|t|e|m|</li>"
                    + "</ul>",
            "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "<li>|" + anchor2Result + "|I|t|e|m| |3|</li>"
                    + "</ul>",
            "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "<li>|I|t|e|m| |3|" + anchor2Result + "|</li>"
                    + "</ul>",
            "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "</ul>",
            "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "<li>|" + anchor2Result + "|I|t|e|m| |3|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "<li>|I|t|e|m| |3|" + anchor2Result + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m| |1|" + anchorResult + "|</li>"
                    + "<li>|" + anchor1Result + "|I|t|e|m| |2|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + anchorResult + "|I|t|e|m| |1|</li>"
                    + "<li>|I|t|e|m| |2|" + anchor1Result + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| |i|m|a|g|e|s| "
                    + "|i|n| |a| |r|o|w|</li>"
                    + "<li>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| "
                    + "|i|m|a|g|e|s| |i|n| |a| |r|o|w|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|" + imgSmallResult
                    + "|T|w|o| |i|m|a|g|e|s| |i|n| |a| |r|o|w|</li>"
                    + "<li>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| "
                    + "|i|m|a|g|e|s| |i|n| |a| |r|o|w|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |" + imgSmallResult
                    + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</li>"
                    + "<li>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
            "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<ul><li>|I|t|e|m|</li>"
                    + "<li>|" + imgSmallResult + "|</li>"
                    + "<li>|I|t|e|m|</li>"
                    + "</ul>"
                    + "<p>|A|f|t|e|r|</p>",
                        "<ul><li>|I|t|e|m| |1|<ul>"
                        + "<li>|I|t|e|m| |1|.|1|<ul>"
                            + "<li>|I|t|e|m| |1|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |1|.|2|<ul>"
                            + "<li>|I|t|e|m| |1|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |1|.|3|<ul>"
                            + "<li>|I|t|e|m| |1|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |1|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |1|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |2|<ul>"
                        + "<li>|I|t|e|m| |2|.|1|<ul>"
                            + "<li>|I|t|e|m| |2|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |2|.|2|<ul>"
                            + "<li>|I|t|e|m| |2|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |2|.|3|<ul>"
                            + "<li>|I|t|e|m| |2|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>|I|t|e|m| |3|<ul>"
                        + "<li>|I|t|e|m| |3|.|1|<ul>"
                            + "<li>|I|t|e|m| |3|.|1|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|1|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|1|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |3|.|2|<ul>"
                            + "<li>|I|t|e|m| |3|.|2|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|2|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|2|.|3|</li>"
                        + "</ul></li>"
                        + "<li>|I|t|e|m| |3|.|3|<ul>"
                            + "<li>|I|t|e|m| |3|.|3|.|1|</li>"
                            + "<li>|I|t|e|m| |3|.|3|.|2|</li>"
                            + "<li>|I|t|e|m| |3|.|3|.|3|</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                + "</ul>",
            "<ul><li>|I|t|e|m| |1|"
                            + "<ul><li>|I|t|e|m| |1|.|1|</li></ul>"
                            + "<ol><li>|I|t|e|m| |1|.|2|</li></ol>"
                            + "<ul><li>|I|t|e|m| |1|.|3|</li></ul>"
                        + "</li>"
                        + "<li>|I|t|e|m| |2|"
                            + "<ol><li>|I|t|e|m| |2|.|1|</li>"
                            + "<li>|I|t|e|m| |2|.|2|</li>"
                            + "<li>|I|t|e|m| |2|.|3|</li></ol>"
                            + "<ul><li>|I|t|e|m| |2|.|4|</li>"
                            + "<li>|I|t|e|m| |2|.|5|</li>"
                            + "<li>|I|t|e|m| |2|.|6|</li></ul>"
                        + "</li>"
                        + "<li>|I|t|e|m| |3|</li></ul>"
        ],

        testSelectBookmarkTable: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            if ((testIndex == null) || (testRun == null)) {
                return deferredSelectBookmarkTestSet(tst.BOOKMARK_TABLE_HTMLS,
                        tst.BOOKMARK_TABLE_RESULTS, null, testIndex);
            }
            return testSelectBookmarkTest(tst.BOOKMARK_TABLE_HTMLS,
                    tst.BOOKMARK_TABLE_RESULTS, null, testIndex, testRun);
        },

        BOOKMARK_TABLE_HTMLS: [
            "<table border=\"1\">"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr>"
                    + "</table>",
            "<p>Before</p>"
                    + "<table border=\"1\">"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr>"
                    + "</table>"
                    + "<p>After</p>",
            "<table border=\"1\">"
                    + "<tr><td><p>Cell 1a</p><p>Cell 1b</p></td><td><p>Cell 2</p></td></tr>"
                    + "<tr><td><p>Cell 3</p></td><td><p>Cell 4a</p><p>Cell 4b</p></td></tr>"
                    + "</table>",
            "<p>Before</p>"
                    + "<table border=\"1\">"
                    + "<tr><td><p>Cell 1a</p><p>Cell 1b</p></td><td><p>Cell 2</p></td></tr>"
                    + "<tr><td><p>Cell 3</p></td><td><p>Cell 4a</p><p>Cell 4b</p></td></tr>"
                    + "</table>"
                    + "<p>After</p>",
            "<table border=\"1\">"
                    + "<tr><td>Cell 1<br>Line 2</td><td>Cell 2<br>Line 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4<br>Line 2</td></tr>"
                    + "</table>",
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
                    + "</table>"
                    + "<p>After</p>",
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

        BOOKMARK_TABLE_RESULTS: [
            "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|</td><td>|C|e|l|l| |2|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|</td><td>|C|e|l|l| |4|</td></tr>"
                    + "</table>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|</td><td>|C|e|l|l| |2|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|</td><td>|C|e|l|l| |4|</td></tr>"
                    + "</table>"
                    + "<p>|A|f|t|e|r|</p>",
            "<table border=\"1\">"
                    + "<tr><td><p>|C|e|l|l| |1|a|</p><p>|C|e|l|l| |1|b||</p></td>"
                    + "<td><p>|C|e|l|l| |2||</p></td></tr>"
                    + "<tr><td><p>|C|e|l|l| |3||</p></td>"
                    + "<td><p>|C|e|l|l| |4|a|</p><p>|C|e|l|l| |4|b||</p></td></tr>"
                    + "</table>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<table border=\"1\">"
                    + "<tr><td><p>|C|e|l|l| |1|a|</p><p>|C|e|l|l| |1|b||</p></td>"
                    + "<td><p>|C|e|l|l| |2||</p></td></tr>"
                    + "<tr><td><p>|C|e|l|l| |3||</p></td>"
                    + "<td><p>|C|e|l|l| |4|a|</p><p>|C|e|l|l| |4|b||</p></td></tr>"
                    + "</table>"
                    + "<p>|A|f|t|e|r|</p>",
            "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|<br>|L|i|n|e| |2|</td>"
                    + "<td>|C|e|l|l| |2|<br>|L|i|n|e| |2|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|</td>"
                    + "<td>|C|e|l|l| |4|<br>|L|i|n|e| |2|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|1|.|1|</td>"
                    + "<td>|1|.|2|</td>"
                    + "<td>|1|.|3|</td></tr>"
                    + "<tr><td>|1|.|4|</td>"
                    + "<td>|1|.|5|</td>"
                    + "<td>|1|.|6|</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|2|.|1|</td>"
                    + "<td>|2|.|2|</td>"
                    + "<td>|2|.|3|</td></tr>"
                    + "<tr><td>|2|.|4|</td>"
                    + "<td>|2|.|5|</td>"
                    + "<td>|2|.|6|</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|3|.|1|</td>"
                    + "<td>|3|.|2|</td>"
                    + "<td>|3|.|3|</td></tr>"
                    + "<tr><td>|3|.|4|</td>"
                    + "<td>|3|.|5|</td>"
                    + "<td>|3|.|6|</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|4|.|1|</td>"
                    + "<td>|4|.|2|</td>"
                    + "<td>|4|.|3|</td></tr>"
                    + "<tr><td>|4|.|4|</td>"
                    + "<td>|4|.|5|</td>"
                    + "<td>|4|.|6|</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "</table>",
            "<p>|B|e|f|o|r|e|</p>"
                    + "<table border=\"1\">"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|1|.|1|</td>"
                    + "<td>|1|.|2|</td>"
                    + "<td>|1|.|3|</td></tr>"
                    + "<tr><td>|1|.|4|</td>"
                    + "<td>|1|.|5|</td>"
                    + "<td>|1|.|6|</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|2|.|1|</td>"
                    + "<td>|2|.|2|</td>"
                    + "<td>|2|.|3|</td></tr>"
                    + "<tr><td>|2|.|4|</td>"
                    + "<td>|2|.|5|</td>"
                    + "<td>|2|.|6|</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "<tr><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|3|.|1|</td>"
                    + "<td>|3|.|2|</td>"
                    + "<td>|3|.|3|</td></tr>"
                    + "<tr><td>|3|.|4|</td>"
                    + "<td>|3|.|5|</td>"
                    + "<td>|3|.|6|</td></tr>"
                    + "</table>"
                    + "</td><td>"
                    + "<table border=\"1\">"
                    + "<tr><td>|4|.|1|</td>"
                    + "<td>|4|.|2|</td>"
                    + "<td>|4|.|3|</td></tr>"
                    + "<tr><td>|4|.|4|</td>"
                    + "<td>|4|.|5|</td>"
                    + "<td>|4|.|6|</td></tr>"
                    + "</table>"
                    + "</td></tr>"
                    + "</table>"
                    + "<p>|A|f|t|e|r|</p>",
            "<table border=\"1\">"
                    + "<tr><td>|" + anchorResult + "|A|n|c|h|o|r|s| |i|n|" + anchor1Result
                    + "|a| |t|a|b|l|e| |c|e|l|l|" + anchor2Result + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + anchorResult + "|C|e|l|l| |1|</td></tr>"
                    + "<tr><td>|" + anchor1Result + "|C|e|l|l| |2|</td></tr>"
                    + "<tr><td>|" + anchor2Result + "|C|e|l|l| |3|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|" + anchorResult + "|</td></tr>"
                    + "<tr><td>|C|e|l|l| |2|" + anchor1Result + "|</td></tr>"
                    + "<tr><td>|C|e|l|l| |3|" + anchor2Result + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|C|e|l|l| |1|" + anchorResult + "|</td></tr>"
                    + "<tr><td>|" + anchor1Result + "|C|e|l|l| |2|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + anchorResult + "|C|e|l|l| |1|</td></tr>"
                    + "<tr><td>|C|e|l|l| |2|" + anchor1Result + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td><p>|P|a|r|a| |1|</p>"
                    + "<p>|P|a|r|a|" + anchorResult + "|2|<br>|L|i|n|e| |2|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td><p>|" + anchorResult + "|C|e|l|l| |1|</p>"
                    + "<p>|P|a|r|a| |2|" + anchor1Result + "|</p></td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + imgSmallResult + "|" + imgSmallResult + "|T|w|o| "
                    + "|i|m|a|g|e|s| |i|n| |a| |r|o|w|</td>"
                    + "<td>|T|w|o| |i|m|a|g|e|s| |i|n| |a| |r|o|w|" + imgSmallResult + "|"
                    + imgSmallResult + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</td>"
                    + "<td>|" + imgSmallResult + "|a|t| |d|i|f|f|e|r|e|n|t| |"
                    + imgSmallResult + "| |p|o|s|i|t|i|o|n|s| |" + imgSmallResult
                    + "|</td></tr>"
                    + "</table>",
            "<table border=\"1\">"
                    + "<tr><td>|" + imgSmallResult + "|</td>"
                    + "<td>|" + imgSmallResult + "|" + imgSmallResult + "|</td></tr>"
                    + "<tr><td><p>|" + imgSmallResult + "||</p></td>"
                    + "<td>|" + imgSmallResult + "|<br>|" + imgSmallResult + "|</td></tr>"
                    + "<tr><td><p>|" + imgSmallResult + "|</p><p>|" + imgSmallResult
                    + "||</p></td>"
                    + "<td><p>|B|e|f|o|r|e|</p><p>|" + imgSmallResult + "|</p>"
                    + "<p>|A|f|t|e|r||</p></td></tr>"
                    + "</table>"
        ],

        testSelectBookmarkBrowserSpecific: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var htmls = (com.ua.isGecko ? tst.BOOKMARK_GECKO_HTMLS
                    : (com.ua.isWebKit ? tst.BOOKMARK_WEBKIT_HTMLS
                        : tst.BOOKMARK_IE_HTMLS));
            var results = (com.ua.isGecko ? tst.BOOKMARK_GECKO_RESULTS
                    : (com.ua.isWebKit ? tst.BOOKMARK_WEBKIT_RESULTS
                        : tst.BOOKMARK_IE_RESULTS));
            var exceptions = (com.ua.isWebKit || com.ua.isGecko
                    ? tst.BOOKMARK_BR_BROWSERS_EXCEPTIONS : null);
            if ((testIndex == null) || (testRun == null)) {
                return deferredSelectBookmarkTestSet(htmls, results, exceptions, testIndex);
            }
            return testSelectBookmarkTest(htmls, results, exceptions, testIndex, testRun);
        },

        BOOKMARK_GECKO_HTMLS: [
            "<p>Testing empty</p><p><br></p><p>paragraphs.</p>",
            "<p>Testing empty</p><p><br></p><p><br></p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>",
            "<table border=\"1\"><tr><td>&nbsp;</td><td>&nbsp;</td></tr>"
                    + "<tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>",
            "<p>&nbsp;</p><p>&nbsp;</p>"
        ],

        BOOKMARK_GECKO_RESULTS: [
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|<br>|</p><p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|<br>|</p><p>|<br>|</p>"
                    + "<p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|T|e|x|t| |w|i|t|h| |" + anchorResult + "| |a|n| |a|n|c|h|o|r|.|</p>",
            "<p>|" + anchorResult + "| |B|O|L| |a|n|c|h|o|r|</p>",
            "<p>|E|O|L| |a|n|c|h|o|r| |" + anchorResult + "|</p>",
            "<p>|M|u|l|t|i|p|l|e| |" + anchorResult + "| |a|n|c|h|o|r|s| |" + anchor1Result
                    + "| |i|n| |o|n|e| |" + anchor2Result + "| |p|a|r|a|.|</p>",
            "<table border=\"1\"><tr><td>|<br>|</td><td>|<br>|</td></tr>"
                    + "<tr><td>|<br>|</td><td>|<br>|</td></tr></table>",
            "<p>|<br>|</p><p>|<br>|</p>"
        ],

        BOOKMARK_WEBKIT_HTMLS: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Testing empty</p><p>&nbsp;</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>"
            // current approach does not work with some WebKit anomalies, so it's currently
            // commented out
            /*
            "<table border=\"1\"><tr><td>&nbsp;</td><td>&nbsp;</td></tr>"
                    + "<tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>",
            "<p>&nbsp;</p><p>&nbsp;</p>"
            */
        ],

        BOOKMARK_WEBKIT_RESULTS: [
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|<br>|</p><p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|<br>|</p><p>|<br>|</p>"
                    + "<p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|T|e|x|t| |w|i|t|h| |" + anchorResult + "| |a|n| |a|n|c|h|o|r|.|</p>",
            "<p>|" + anchorResult + "| |B|O|L| |a|n|c|h|o|r|</p>",
            "<p>|E|O|L| |a|n|c|h|o|r| |" + anchorResult + "|</p>",
            "<p>|M|u|l|t|i|p|l|e| |" + anchorResult + "| |a|n|c|h|o|r|s| |" + anchor1Result
                    + "| |i|n| |o|n|e| |" + anchor2Result + "| |p|a|r|a|.|</p>"
            // next two cases: WebKit cannot select the final placeholder explicitly;
            // current approach doesn't work
            /*
            "<table border=\"1\"><tr><td>|<br>|</td><td>|<br>|</td></tr>"
                    + "<tr><td>|<br>|</td><td>|<br></td></tr></table>",
            "<p>|<br></p><p>|<br></p>"
            */

        ],

        BOOKMARK_BR_BROWSERS_EXCEPTIONS: [ {
                "index": 0,
                "startPos": 15,
                "removePrecedingLF": true
            }, {
                "index": 1,
                "startPos": 15,
                "removePrecedingLF": true
            }, {
                "index": 1,
                "startPos": 17,
                "removePrecedingLF": true
            }, {
                "index": 6,
                "startPos": 1,
                "removePrecedingLF": true
            }, {
                "index": 6,
                "startPos": 3,
                "removePrecedingLF": true
            }, {
                "index": 6,
                "startPos": 5,
                "removePrecedingLF": true
            }, {
                "index": 6,
                "startPos": 7,
                "removePrecedingLF": true
            }, {
                "index": 7,
                "startPos": 1,
                "removePrecedingLF": true
            }, {
                "index": 7,
                "startPos": 3,
                "removePrecedingLF": true
            }
        ],

        BOOKMARK_IE_HTMLS: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Testing empty</p><p>&nbsp;</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + "&nbsp;an anchor.</p>",
            "<p>" + anchor + "&nbsp;BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + "&nbsp;anchors " + anchor1 + "&nbsp;in one "
                    + anchor2 + "&nbsp;para.</p>",
            // the following two test cases pass, but the current testing approach does not
            // ensure that the results are correct
            "<table border=\"1\"><tr><td>&nbsp;</td><td>&nbsp;</td></tr>"
                    + "<tr><td>&nbsp;</td><td>&nbsp;</td></tr></table>",
            "<p>&nbsp;</p><p>&nbsp;</p>"
        ],

        BOOKMARK_IE_RESULTS: [
            // IE bug: The &nbsp; are actually not in the DOM, but reported by IE if
            // the innerHTML property is used
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|&nbsp;</p><p>|p|a|r|a|g|r|a|p|h|s|.|"
                    + "</p>",
            "<p>|T|e|s|t|i|n|g| |e|m|p|t|y|</p><p>|&nbsp;</p><p>|&nbsp;</p>"
                    + "<p>|p|a|r|a|g|r|a|p|h|s|.|</p>",
            "<p>|T|e|x|t| |w|i|t|h| |" + anchorResult + "|&nbsp;|a|n| |a|n|c|h|o|r|.|</p>",
            "<p>|" + anchorResult + "|&nbsp;|B|O|L| |a|n|c|h|o|r|</p>",
            "<p>|E|O|L| |a|n|c|h|o|r| |" + anchorResult + "|</p>",
            "<p>|M|u|l|t|i|p|l|e| |" + anchorResult + "|&nbsp;|a|n|c|h|o|r|s| |"
                    + anchor1Result + "|&nbsp;|i|n| |o|n|e| |" + anchor2Result
                    + "|&nbsp;|p|a|r|a|.|</p>",
            // the following two test cases pass, but the current testing approach does not
            // ensure that the results are correct
            "<table border=\"1\"><tr><td>|</td><td>|</td></tr>"
                    + "<tr><td>|</td><td>|</td></tr></table>",
            "<p>|&nbsp;</p><p>|&nbsp;</p>"
        ],


        // Testing the processing selection ------------------------------------------------

        // The processing selection is used to determine on which text fragment to operate.
        // It usually consists of a pair of node references specifiying start and end of
        // the selection. As the processing selection is inherently browser-specific, we
        // can be a bit more relaxed about the results than in the caret/bookmark section

        testProcessingSelectionBasics: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            if (testRun == null) {
                return deferredCreatePSelTestSet(tst.PSEL_HTMLS, tst.PSEL_EXCEPTIONS,
                        testIndex);
            }
            return testCreatePSelTest(tst.PSEL_HTMLS, tst.PSEL_EXCEPTIONS, testIndex,
                    testRun);
        },

        PSEL_HTMLS: [
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

        PSEL_EXCEPTIONS: [
            // not yet required
        ],

        testProcessingSelectionList: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            if (testRun == null) {
                return deferredCreatePSelTestSet(tst.PSEL_HTMLS_LIST,
                        tst.PSEL_EXCEPTIONS_LIST, testIndex);
            }
            return testCreatePSelTest(tst.PSEL_HTMLS_LIST, tst.PSEL_EXCEPTIONS_LIST,
                    testIndex, testRun);
        },

        PSEL_HTMLS_LIST: [
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
                    + "<p>After</p>",
            // "deeply nested" list
            "<ul><li>Item 1<ul>"
                        + "<li>Item 1.1<ul>"
                            + "<li>Item 1.1.1</li>"
                            + "<li>Item 1.1.2</li>"
                            + "<li>Item 1.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 1.2<ul>"
                            + "<li>Item 1.2.1</li>"
                            + "<li>Item 1.2.2</li>"
                            + "<li>Item 1.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 1.3<ul>"
                            + "<li>Item 1.3.1</li>"
                            + "<li>Item 1.3.2</li>"
                            + "<li>Item 1.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>Item 2<ul>"
                        + "<li>Item 2.1<ul>"
                            + "<li>Item 2.1.1</li>"
                            + "<li>Item 2.1.2</li>"
                            + "<li>Item 2.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 2.2<ul>"
                            + "<li>Item 2.2.1</li>"
                            + "<li>Item 2.2.2</li>"
                            + "<li>Item 2.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 2.3<ul>"
                            + "<li>Item 2.3.1</li>"
                            + "<li>Item 2.3.2</li>"
                            + "<li>Item 2.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                    + "<li>Item 3<ul>"
                        + "<li>Item 3.1<ul>"
                            + "<li>Item 3.1.1</li>"
                            + "<li>Item 3.1.2</li>"
                            + "<li>Item 3.1.3</li>"
                        + "</ul></li>"
                        + "<li>Item 3.2<ul>"
                            + "<li>Item 3.2.1</li>"
                            + "<li>Item 3.2.2</li>"
                            + "<li>Item 3.2.3</li>"
                        + "</ul></li>"
                        + "<li>Item 3.3<ul>"
                            + "<li>Item 3.3.1</li>"
                            + "<li>Item 3.3.2</li>"
                            + "<li>Item 3.3.3</li>"
                        + "</ul></li>"
                    + "</ul></li>"
                + "</ul>",
            "<ul><li>Item 1"
                        + "<ul><li>Item 1.1</li></ul>"
                        + "<ol><li>Item 1.2</li></ol>"
                        + "<ul><li>Item 1.3</li></ul>"
                    + "</li>"
                    + "<li>Item 2"
                        + "<ol><li>Item 2.1</li>"
                        + "<li>Item 2.2</li>"
                        + "<li>Item 2.3</li></ol>"
                        + "<ul><li>Item 2.4</li>"
                        + "<li>Item 2.5</li>"
                        + "<li>Item 2.6</li></ul>"
                    + "</li>"
                    + "<li>Item 3</li></ul>"
        ],

        PSEL_EXCEPTIONS_LIST: [
            {
                "index": 2,
                "startPos": 6,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 2,
                "startPos": 40,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 2,
                "startPos": 74,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 3,
                "startPos": 13,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 3,
                "startPos": 47,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 3,
                "startPos": 81,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 6,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 15,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 57,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 99,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 139,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 148,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 190,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 232,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 272,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 281,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 323,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 25,
                "startPos": 365,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 26,
                "startPos": 6,
                "charCnt": 1,
                "correctedCharCnt": 0
            }, {
                "index": 26,
                "startPos": 40,
                "charCnt": 1,
                "correctedCharCnt": 0
            }
        ],

        testProcessingSelectionTable: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            if (testRun == null) {
                return deferredCreatePSelTestSet(tst.PSEL_HTMLS_TABLE,
                        tst.PSEL_EXCEPTIONS_TABLE, testIndex);
            }
            return testCreatePSelTest(tst.PSEL_HTMLS_TABLE, tst.PSEL_EXCEPTIONS_TABLE,
                    testIndex, testRun);
        },

        PSEL_HTMLS_TABLE: [
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

        PSEL_EXCEPTIONS_TABLE: [
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

        testProcessingSelectionBrowserSpecific: function(testIndex, testRun) {
            var tst = CUI.rte.testing.SelectionTests;
            var htmls = (com.ua.isOldIE ? tst.PSEL_HTMLS_IE
                    : (com.ua.isGecko ? tst.PSEL_HTMLS_GECKO : tst.PSEL_HTMLS_WEBKIT));
            var exceptions = (com.ua.isOldIE ? tst.PSEL_EXCEPTIONS_IE
                    : (com.ua.isGecko ? tst.PSEL_EXCEPTIONS_GECKO
                        : tst.PSEL_EXCEPTIONS_WEBKIT));
            if (testRun == null) {
                return deferredCreatePSelTestSet(htmls, exceptions, testIndex);
            }
            return testCreatePSelTest(htmls, exceptions, testIndex, testRun);
        },

        PSEL_HTMLS_IE: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Testing empty</p><p>&nbsp;</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + "&nbsp;an anchor.</p>",
            "<p>" + anchor + "&nbsp;BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + "&nbsp;anchors " + anchor1 + "&nbsp;in one "
                    + anchor2 + "&nbsp;para.</p>"
        ],

        PSEL_HTMLS_GECKO: [
            "<p>Testing empty</p><p><br></p><p>paragraphs.</p>",
            "<p>Testing empty</p><p><br></p><p><br></p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>"
        ],

        PSEL_HTMLS_WEBKIT: [
            "<p>Testing empty</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Testing empty</p><p>&nbsp;</p><p>&nbsp;</p><p>paragraphs.</p>",
            "<p>Text with " + anchor + " an anchor.</p>",
            "<p>" + anchor + " BOL anchor</p>",
            "<p>EOL anchor " + anchor + "</p>",
            "<p>Multiple " + anchor + " anchors " + anchor1 + " in one "
                    + anchor2 + " para.</p>"
        ],

        PSEL_EXCEPTIONS_IE: [
            // not yet required
        ],

        PSEL_EXCEPTIONS_GECKO: [
            // not yet required
        ],

        PSEL_EXCEPTIONS_WEBKIT: [
            // not yet required
        ],


        // Testing the testing lib ... -----------------------------------------------------

        /**
         * Tests the selection library that is used for testing RTE's selection handling.
         */
        testSelectionLib: function() {
            var result = testSelectEOT();
            if (result != "success") {
                return result;
            }
            result = testIsExchangeable();
            if (result != "success") {
                return result;
            }
            result = testToPlainText();
            if (result != "success") {
                return result;
            }
            return "success";
        },

        TEST_HTMLS: [
            "<p>Hello world!</p>",
            "<p>Hello world!<br>Second line</p>\n<p>New paragraph</p>",
            "<p><b>Hello</b> <i>world!</i></p>",
            "<p>Hello world!</p><p>&nbsp;</p>",
            "<p>Empty</p><p>" + (!com.ua.isOldIE ? "<br>" : "&nbsp;") + "</p>"
                    + "<p>par</p>",
            "<table border=\"1\">"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr>"
                    + "</table>",
            "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>"
        ],

        EOT_HTMLS: [
            "<p>Hello world!" + marker + "</p>",
            "<p>Hello world!<br>Second line</p>\n<p>New paragraph" + marker + "</p>",
            "<p><b>Hello</b> <i>world!" + marker + "</i></p>",
            (com.ua.isIE ? "<p>Hello world!</p><p>" + marker + "&nbsp;</p>"
                    : com.ua.isGecko ? "<p>Hello world!</p><p>" + tempBR + marker + "</p>"
                        : "<p>Hello world!</p><p>" + marker + tempBR + "</p>"),
            "<p>Empty</p><p>" + (!com.ua.isOldIE ? "<br>" : "&nbsp;") + "</p><p>par"
                    + marker + "</p>",
            "<table border=\"1\">"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4" + marker + "</td></tr>"
                    + "</table>",
            "<ul><li>Item 1</li><li>Item 2</li><li>Item 3" + marker + "</li></ul>"
        ],

        PLAINTEXT_HTMLS: [
            "<p>Hello world!</p>",
            "<p>Hello world!<br>Second line</p>\n<p>New paragraph</p>",
            "<p><b>Hello</b> <i>world!</i></p>",
            "<p>Hello world!</p><p><br></p>",
            "<p>Empty</p><p>" + (com.ua.isGecko ? "<br>" : "&nbsp;") + "</p>"
                    + "<p>par</p>",
            "<p>Testing <img src=\"something.png\"> images.</p>",
            "<p>Testing <a name=\"anchor\"></a> anchors.</p>",
            "<p>Testing <a href=\"http://host.com\">links</a>.</p>"
        ],

        PLAINTEXT_RESULTS: [
            "Hello world!",
            "Hello world!\nSecond lineNew paragraph",
            "Hello world!",
            "Hello world!\n",
            "Empty" + (com.ua.isGecko ? "\n" : "&nbsp;") + "par",
            "Testing $ images.",
            "Testing # anchors.",
            "Testing links."
        ]

    };

}();

CUI.rte.testing.Commons.registerSection("selection", "Selection processing");
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSelectionLib",
        CUI.rte.testing.SelectionTests.testSelectionLib);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSetCaretBasics",
        CUI.rte.testing.SelectionTests.testSetCaretBasics);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSetCaretList",
        CUI.rte.testing.SelectionTests.testSetCaretList);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSetCaretTable",
        CUI.rte.testing.SelectionTests.testSetCaretTable);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSetCaretBrowserSpecific",
        CUI.rte.testing.SelectionTests.testSetCaretBrowserSpecific);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testGetCaretBasics",
        CUI.rte.testing.SelectionTests.testGetCaretBasics);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testGetCaretList",
        CUI.rte.testing.SelectionTests.testGetCaretList);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testGetCaretTable",
        CUI.rte.testing.SelectionTests.testGetCaretTable);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testGetCaretBrowserSpecific",
        CUI.rte.testing.SelectionTests.testGetCaretBrowserSpecific);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSelectBookmarkBasics",
        CUI.rte.testing.SelectionTests.testSelectBookmarkBasics);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSelectBookmarkList",
        CUI.rte.testing.SelectionTests.testSelectBookmarkList);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSelectBookmarkTable",
        CUI.rte.testing.SelectionTests.testSelectBookmarkTable);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testSelectBookmarkBrowserSpecific",
        CUI.rte.testing.SelectionTests.testSelectBookmarkBrowserSpecific);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testProcessingSelectionBasics",
        CUI.rte.testing.SelectionTests.testProcessingSelectionBasics);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testProcessingSelectionList",
        CUI.rte.testing.SelectionTests.testProcessingSelectionList);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testProcessingSelectionTable",
        CUI.rte.testing.SelectionTests.testProcessingSelectionTable);
CUI.rte.testing.Commons.registerTest(
        "selection", "Selection.testProcessingSelectionBrowserSpecific",
        CUI.rte.testing.SelectionTests.testProcessingSelectionBrowserSpecific);