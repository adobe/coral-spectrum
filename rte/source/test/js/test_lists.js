CUI.rte.testing.ListCommand = function() {

    var com = CUI.rte.Common;
    var tcc = CUI.rte.testing.ComponentTesting;

    var UL_DETECT = /(<\/?)u(l>)/gi;

    var OL_REPLACEMENT = "$1o$2";

    /**
     * Adapts a test suite to use ordered lists instead of unordered lists.
     * @param {Object[]} testSuite The test suite to convert
     * @return {Object[]} The adapted test suite
     */
    var adaptTestSuiteToOrderedList = function(testSuite) {
        var copiedSuite = [ ];
        var caseCnt = testSuite.length;
        for (var c = 0; c < caseCnt; c++) {
            var testCase = testSuite[c];
            if (testCase.ignoreForOrderedListRun !== true) {
                var copiedCase = { };
                copiedSuite.push(copiedCase);
                copiedCase.html = testCase.html.replace(UL_DETECT, OL_REPLACEMENT);
                if (testCase.cmd) {
                    if (testCase.cmd == "insertunorderedlist") {
                        copiedCase.cmd = "insertorderedlist";
                    } else {
                        copiedCase.cmd = testCase.cmd;
                    }
                }
                if (testCase.cmdValue !== undefined) {
                    copiedCase.cmdValue = testCase.cmdValue;
                }
                if (testCase.ignoreForTableRun !== undefined) {
                    copiedCase.ignoreForTableRun = testCase.ignoreForTableRun;
                }
                copiedCase.iterations = [ ];
                var iterations = testCase.iterations;
                var iterCnt = iterations.length;
                for (var i = 0; i < iterCnt; i++) {
                    var iter = iterations[i];
                    var copiedIter = { };
                    if (iter.cmd) {
                        copiedIter.cmd = iter.cmd;
                    }
                    if (iter.cmdValue !== undefined) {
                        copiedIter.cmdValue = iter.cmdValue;
                    }
                    if (iter.ignore !== undefined) {
                        copiedIter.ignore = iter.ignore;
                    }
                    copiedCase.iterations.push(copiedIter);
                    copiedIter.result = iter.result.replace(UL_DETECT, OL_REPLACEMENT);
                    copiedIter.bookmarkDef = iter.bookmarkDef;     // may be shared
                }
            }
        }
        return copiedSuite;
    };

    /**
     * Adapts a test suite to be "wrapped" into a table. This allows a test suite to be
     * executed in a "table context".
     * @param {Object[]} testSuite The test suite to convert
     * @return {Object[]} The adapted test suite
     */
    var adaptTestSuiteForTable = function(testSuite) {
        var copiedSuite = [ ];
        var htmlPrefix = "<table><tbody><tr><td>";
        var htmlSuffix = "</td></tr></tbody></table>";
        var caseCnt = testSuite.length;
        for (var c = 0; c < caseCnt; c++) {
            var testCase = testSuite[c];
            if (testCase.ignoreForTableRun !== true) {
                var copiedCase = { };
                copiedSuite.push(copiedCase);
                copiedCase.html = htmlPrefix + testCase.html + htmlSuffix;
                if (testCase.cmd) {
                    copiedCase.cmd = testCase.cmd;
                }
                if (testCase.cmdValue !== undefined) {
                    copiedCase.cmdValue = testCase.cmdValue;
                }
                copiedCase.iterations = [ ];
                var iterations = testCase.iterations;
                var iterCnt = iterations.length;
                for (var i = 0; i < iterCnt; i++) {
                    var iter = iterations[i];
                    var copiedIter = { };
                    if (iter.cmd) {
                        copiedIter.cmd = iter.cmd;
                    }
                    if (iter.cmdValue !== undefined) {
                        copiedIter.cmdValue = iter.cmdValue;
                    }
                    if (iter.ignore !== undefined) {
                        copiedIter.ignore = iter.ignore;
                    }
                    copiedCase.iterations.push(copiedIter);
                    copiedIter.result = htmlPrefix + iter.result + htmlSuffix;
                    copiedIter.bookmarkDef = iter.bookmarkDef;  // may be shared, as no adjustments are required
                }
            }
        }
        return copiedSuite;
    };

    return {

        testSimpleLists: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase, iteration) {
                var cmdValue = null;
                if (iteration.cmdValue !== undefined) {
                    cmdValue = iteration.cmdValue;
                } else if (testCase.cmdValue !== undefined) {
                    cmdValue = testCase.cmdValue;
                }
                if (iteration.cmd) {
                    tcc.executeCommand(iteration.cmd, cmdValue);
                } else if (testCase.cmd) {
                    tcc.executeCommand(testCase.cmd, cmdValue);
                } else {
                    tcc.executeCommand("insertunorderedlist", cmdValue);
                }
            };
            return tcc.executeTestSuite(testFn, tst.SIMPLE_TESTS, testNo, testIteration);
        },

        testSimpleOrderedLists: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                if (!testCase.cmd) {
                    tcc.executeCommand("insertorderedlist", testCase.cmdValue);
                }
            };
            var convertedSuite = adaptTestSuiteToOrderedList(tst.SIMPLE_TESTS);
            return tcc.executeTestSuite(testFn, convertedSuite, testNo, testIteration);
        },

        SIMPLE_TESTS: [
            {
                // #0
                "html": "<p>Paragraph</p>",
                "iterations": [
                    {
                        "result": "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }
                ]
            }, {
                // #1
                "html": "<ul><li>List item</li></ul>",
                "iterations": [
                    {
                        "result": "<p>List item</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }
                ]
            }, {
                // #2
                "html": "<p>Paragraph</p><p>Paragraph</p>",
                "iterations": [
                    {
                        "result": "<ul><li>Paragraph</li></ul><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<p>Paragraph</p><ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 19
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": 9,
                            "finalPos": 19
                        }
                    }
                ]
            }, {
                // #3
                "html": "<ul><li>List item</li><li>List item</li></ul>",
                "iterations": [
                    {
                        "result": "<p>List item</p><ul><li>List item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ul><li>List item</li></ul><p>List item</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 19
                        }
                    }, {
                        "result": "<p>List item</p><p>List item</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": 9,
                            "finalPos": 19
                        }
                    }
                ]
            }, {
                // #4
                "html": "<ul><li>Item 1</li><li>Item 2</li></ul><p>Paragraph</p>",
                "iterations": [
                    {
                        "result": "<ul><li>Item 1</li><li>Item 2</li><li>Paragraph</li>"
                                + "</ul>",
                        "bookmarkDef": {
                            "startPos": 14,
                            "charCnt": 0,
                            "finalPos": 23
                        }
                    }, {
                        "result": "<ul><li>Item 1</li></ul><p>Item 2</p><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalStartPos": 13,
                            "finalPos": 23
                        }
                    }, {
                        "result": "<p>Item 1</p><p>Item 2</p><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": 6,
                            "finalPos": 23
                        }
                    }
                ]
            }, {
                // #5
                "html": "<p>Paragraph</p>"
                        + "<table><tbody><tr><td>Cell</td></tr></tbody></table>"
                        + "<p>Paragraph</p>",
                "iterations": [
                    {
                        "result": "<ul><li>Paragraph</li></ul>"
                                + "<table><tbody><tr><td>Cell</td></tr>"
                                    + "</tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li></ul>"
                                + "<table><tbody><tr><td><ul><li>Cell</li></ul></td></tr>"
                                    + "</tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": 9,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li></ul>"
                                + "<table><tbody><tr><td><ul><li>Cell</li></ul></td></tr>"
                                    + "</tbody></table>"
                                + "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 16,
                            "finalStartPos": 9,
                            "finalPos": 24
                        }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><ul><li>Cell</li></ul></td></tr>"
                                    + "</tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><ul><li>Cell</li></ul></td></tr>"
                                    + "</tbody></table>"
                                + "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 6,
                            "finalStartPos": 14,
                            "finalPos": 24
                        }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td>Cell</td></tr>"
                                    + "</tbody></table>"
                                + "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 15,
                            "charCnt": 0,
                            "finalPos": 24
                        }
                    }
                ]
            }, {
                // #6
                "html": "<p>Paragraph</p>"
                        + "<table><tbody><tr><td><p>Cell</p><p>Cell</p></td></tr></tbody>"
                            + "</table>"
                        + "<p>Paragraph</p>",
                // "ignoreForTableRun": true,
                "iterations": [
                    {
                        "result": "<ul><li>Paragraph</li></ul>"
                                + "<table><tbody><tr><td><p>Cell</p><p>Cell</p>"
                                    + "</td></tr></tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li></ul>"
                                + "<table><tbody><tr><td><ul><li>Cell</li></ul><p>Cell</p>"
                                    + "</td></tr></tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": 9,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li></ul>"
                                + "<table><tbody><tr><td><ul><li>Cell</li><li>Cell</li>"
                                    + "</ul></td></tr></tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 16,
                            "finalStartPos": 9,
                            "finalPos": 19
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li></ul>"
                                + "<table><tbody><tr><td><ul><li>Cell</li><li>Cell</li>"
                                    + "</ul></td></tr></tbody></table>"
                                + "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 22,
                            "finalStartPos": 9,
                            "finalPos": 30
                        }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><ul><li>Cell</li></ul><p>Cell</p>"
                                    + "</td></tr></tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><ul><li>Cell</li><li>Cell</li>"
                                    + "</ul></td></tr></tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 6,
                            "finalStartPos": 14,
                            "finalPos": 19
                        }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><ul><li>Cell</li><li>Cell</li>"
                                    + "</ul></td></tr></tbody></table>"
                                + "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 12,
                            "finalStartPos": 14,
                            "finalPos": 30
                         }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><p>Cell</p><ul><li>Cell</li>"
                                    + "</ul></td></tr></tbody></table>"
                                + "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 15,
                            "charCnt": 0,
                            "finalPos": 19
                         }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><p>Cell</p><ul><li>Cell</li>"
                                    + "</ul></td></tr></tbody></table>"
                                + "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 15,
                            "charCnt": 7,
                            "finalStartPos": 19,
                            "finalPos": 30
                         }
                    }, {
                        "result": "<p>Paragraph</p>"
                                + "<table><tbody><tr><td><p>Cell</p><p>Cell</p>"
                                    + "</td></tr></tbody></table>"
                                + "<ul><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 21,
                            "charCnt": 0,
                            "finalPos": 30
                        }
                    }
                ]
            }, {
                // #7
                "html": "<ul><li>Item</li><li>Item</li><li>Item</li></ul>",
                "cmd": "insertorderedlist",
                "ignoreForOrderedListRun": true,
                "iterations": [
                    {
                        "result": "<ol><li>Item</li></ol>"
                                + "<ul><li>Item</li><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 4
                        }
                    }, {
                        "result": "<ul><li>Item</li></ul>"
                                + "<ol><li>Item</li></ol>"
                                + "<ul><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ul><li>Item</li><li>Item</li></ul>"
                                + "<ol><li>Item</li></ol>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ol><li>Item</li><li>Item</li></ol>"
                                + "<ul><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 6,
                            "finalStartPos": 4,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ul><li>Item</li></ul>"
                                + "<ol><li>Item</li><li>Item</li></ol>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 6,
                            "finalStartPos": 9,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ol><li>Item</li><li>Item</li><li>Item</li></ol>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": 4,
                            "finalPos": 14
                        }
                    }
                ]
            }, {
                // #8
                "html": "<ol><li>Item</li><li>Item</li><li>Item</li></ol>",
                "cmd": "insertunorderedlist",
                "ignoreForOrderedListRun": true,
                "iterations": [
                    {
                        "result": "<ul><li>Item</li></ul>"
                                + "<ol><li>Item</li><li>Item</li></ol>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 4
                        }
                    }, {
                        "result": "<ol><li>Item</li></ol>"
                                + "<ul><li>Item</li></ul>"
                                + "<ol><li>Item</li></ol>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ol><li>Item</li><li>Item</li></ol>"
                                + "<ul><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Item</li><li>Item</li></ul>"
                                + "<ol><li>Item</li></ol>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 6,
                            "finalStartPos": 4,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ol><li>Item</li></ol>"
                                + "<ul><li>Item</li><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 6,
                            "finalStartPos": 9,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Item</li><li>Item</li><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": 4,
                            "finalPos": 14
                        }
                    }
                ]
            }, {
                // #9
                "html": "<ul><li>Item</li></ul><p>Paragraph</p><ul><li>Item</li></ul>",
                "iterations": [
                    {
                        "result": "<ul><li>Item</li><li>Paragraph</li><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }
                ]
            }, {
                // #10
                "html": "<p>Paragraph</p><ul><li>Item</li><li>Item</li></ul>",
                "iterations": [
                    {
                        "result": "<ul><li>Paragraph</li><li>Item</li><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }
                ]
            }, {
                // #11
                "html": "<ul><li>Item</li><li>Item</li></ul><p>Paragraph</p>",
                "iterations": [
                    {
                        "result": "<ul><li>Item</li><li>Item</li><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 19
                        }
                    }
                ]
            }, {
                // #12
                "html": "<ul><li>Item<ul><li>Item</li></ul></ul>",
                "iterations": [
                    {
                        "result": "<ul><li>Item</li></ul><p>Item</p>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }
                ]
            }, {
                // #13
                "html": "<ul><li>Item 1</li></ul><ol><li>Item 2</li><li>Item 3</li></ol>",
                "cmd": "insertunorderedlist",
                "ignoreForOrderedListRun": true,
                "iterations": [
                    {
                        "result": "<ul><li>Item 1</li><li>Item 2</li></ul>"
                                + "<ol><li>Item 3</li></ol>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 13
                        }
                    }, {
                        "result": "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 8,
                            "finalStartPos": 13,
                            "finalPos": 20
                        }
                    }, {
                        "result": "<ul><li>Item 1</li></ul><ol><li>Item 2</li></ol>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 14,
                            "charCnt": 0,
                            "finalPos": 20
                        }
                    }
                ]
            }, {
                // #14
                "html": "<ul><li>Item<ul><li>Item</li><li>Item</li></ul></li></ul>",
                "cmd": "insertorderedlist",
                "ignoreForOrderedListRun": true,
                "iterations": [
                    {
                        "result": "<ol><li>Item<ul><li>Item</li><li>Item</li></ul>"
                                + "</li></ol>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 3 : 4),
                            "finalPos": 4
                        }
                    }, {
                        "result": "<ol><li>Item<ol><li>Item</li></ol>"
                                + "<ul><li>Item</li></ul></li></ol>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 6,
                            "finalStartPos": (com.ua.isIE ? 3 : 4),
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ol><li>Item<ol><li>Item</li><li>Item</li>"
                                + "</ol></li></ol>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": (com.ua.isIE ? 3 : 4),
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Item<ol><li>Item</li></ol>"
                                + "<ul><li>Item</li></ul></li></ul>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<ul><li>Item<ol><li>Item</li><li>Item</li>"
                                + "</ol></li></ul>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 6,
                            "finalStartPos": 9,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Item<ul><li>Item</li></ul><ol><li>Item</li>"
                                + "</ol></li></ul>",
                        "bookmarkDef": {
                            "startPos": 11,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }
                ]
            }, {
                // #15
                "html": "<p>Paragraph</p><ul><li>Item</li></ul><p>Paragraph</p>"
                            + "<ul><li>Item</li></ul><p>Paragraph</p>",
                "iterations": [
                    {
                        "result": "<ul><li>Paragraph</li><li>Item</li></ul><p>Paragraph</p>"
                                + "<ul><li>Item</li></ul><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": 9,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li><li>Item</li><li>Paragraph</li>"
                                + "<li>Item</li></ul><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 16,
                            "finalStartPos": 9,
                            "finalPos": 29
                        }
                    }, {
                        "result": "<ul><li>Paragraph</li><li>Item</li><li>Paragraph</li>"
                                + "<li>Item</li><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 31,
                            "finalStartPos": 9,
                            "finalPos": 39
                        }
                    }, {
                        "result": "<p>Paragraph</p><p>Item</p><p>Paragraph</p>"
                                + "<ul><li>Item</li></ul><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalStartPos": 14,
                            "finalPos": 24
                        }
                    }, {
                        "result": "<p>Paragraph</p><p>Item</p><p>Paragraph</p>"
                                + "<p>Item</p><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 16,
                            "finalStartPos": 14,
                            "finalPos": 39
                        }
                    }, {
                        "result": "<p>Paragraph</p><ul><li>Item</li><li>Paragraph</li>"
                                + "<li>Item</li></ul><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 15,
                            "charCnt": 0,
                            "finalStartPos": 24,
                            "finalPos": 29
                        }
                    }, {
                        "result": "<p>Paragraph</p><ul><li>Item</li><li>Paragraph</li>"
                                + "<li>Item</li><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 15,
                            "charCnt": 16,
                            "finalStartPos": 24,
                            "finalPos": 39
                        }
                    }, {
                        "result": "<p>Paragraph</p><ul><li>Item</li></ul><p>Paragraph</p>"
                                + "<p>Item</p><p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 0,
                            "finalStartPos": 29,
                            "finalPos": 39
                        }
                    }, {
                        "result": "<p>Paragraph</p><ul><li>Item</li></ul><p>Paragraph</p>"
                                + "<ul><li>Item</li><li>Paragraph</li></ul>",
                        "bookmarkDef": {
                            "startPos": 30,
                            "charCnt": 0,
                            "finalPos": 39
                        }
                    }
                ]
            }, {
                // #16
                "html": "<ul><li>Item</li><li>Item</li><li>Item</li></ul>",
                "cmdValue": true,
                "iterations": [
                    {
                        // #16.0
                        "result": "<p>Item</p><ul><li>Item</li><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 4
                        }
                    }, {
                        // #16.1
                        "result": "<ul><li>Item</li></ul><p>Item</p><ul><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }, {
                        // #16.2
                        "result": "<ul><li>Item</li><li>Item</li></ul><p>Item</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }, {
                        // #16.3
                        "result": "<p>Item</p><p>Item</p><ul><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 6,
                            "finalStartPos": 4,
                            "finalPos": 9
                        }
                    }, {
                        // #16.4
                        "result": "<p>Item</p><p>Item</p><p>Item</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 11,
                            "finalStartPos": 4,
                            "finalPos": 14
                        }
                    }, {
                        // #16.5
                        "result": "<ul><li>Item</li></ul><p>Item</p><p>Item</p>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 6,
                            "finalStartPos": 9,
                            "finalPos": 14
                        }
                    }
                ]
            }, {
                // #17
                "html": "<ul><li>Item 1"
                            + "<ul><li>Item 1.1</li><li>Item 1.2</li><li>Item 1.3</li></ul>"
                        + "</li><li>Item 2"
                            + "<ul><li>Item 2.1</li><li>Item 2.2</li><li>Item 2.3</li></ul>"
                        + "</li><li>Item 3"
                            + "<ul><li>Item 3.1</li><li>Item 3.2</li><li>Item 3.3</li></ul>"
                        + "</li></ul>",
                "cmdValue": true,
                "iterations": [
                    {
                        // #17.0
                        "result": "<p>Item 1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 6
                        }
                    }, {
                        // #17.1
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 15
                        }
                    }, {
                        // #17.2
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.3</li></ul>"
                                + "</li><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 24
                        }
                    }, {
                        // #17.3
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 33
                        }
                    }, {
                        // #17.4
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 35,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 40
                        }
                    }, {
                        // #17.5
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 42,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 49
                        }
                    }, {
                        // #17.6
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 51,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 58
                        }
                    }, {
                        // #17.7
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 60,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 67
                        }
                    }, {
                        // #17.8
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 69,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 74
                        }
                    }, {
                        // #17.9
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 76,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 83
                        }
                    }, {
                        // #17.10
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 85,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 92
                        }
                    }, {
                        // #17.11
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 94,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 101
                        }
                    }, {
                        // #17.12
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 15
                        }
                    }, {
                        // #17.13
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.3</li></ul>"
                                + "</li><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 10,
                            "finalStartPos": 15,
                            "finalPos": 24
                        }
                    }, {
                        // #17.14
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 19,
                            "finalStartPos": 15,
                            "finalPos": 33
                        }
                    }, {
                        // #17.15
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 28,
                            "finalStartPos": 15,
                            "finalPos": 40
                        }
                    }, {
                        // #17.16
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 35,
                            "finalStartPos": 15,
                            "finalPos": 49
                        }
                    }, {
                        // #17.17
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 44,
                            "finalStartPos": 15,
                            "finalPos": 58
                        }
                    }, {
                        // #17.18
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 53,
                            "finalStartPos": 15,
                            "finalPos": 67
                        }
                    }, {
                        // #17.19
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 62,
                            "finalStartPos": 15,
                            "finalPos": 74
                        }
                    }, {
                        // #17.20
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 69,
                            "finalStartPos": 15,
                            "finalPos": 83
                        }
                    }, {
                        // #17.21
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 78,
                            "finalStartPos": 15,
                            "finalPos": 92
                        }
                    }, {
                        // #17.22
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 87,
                            "finalStartPos": 15,
                            "finalPos": 101
                        }
                    }, {
                        // #17.23
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.3</li></ul>"
                                + "</li><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 0,
                            "finalPos": 24
                        }
                    }, {
                        // #17.24
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 10,
                            "finalStartPos": 24,
                            "finalPos": 33
                        }
                    }, {
                        // #17.25
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 19,
                            "finalStartPos": 24,
                            "finalPos": 40
                        }
                    }, {
                        // #17.26
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 26,
                            "finalStartPos": 24,
                            "finalPos": 49
                        }
                    }, {
                        // #17.27
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 35,
                            "finalStartPos": 24,
                            "finalPos": 58
                        }
                    }, {
                        // #17.28
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 44,
                            "finalStartPos": 24,
                            "finalPos": 67
                        }
                    }, {
                        // #17.29
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 53,
                            "finalStartPos": 24,
                            "finalPos": 74
                        }
                    }, {
                        // #17.30
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 60,
                            "finalStartPos": 24,
                            "finalPos": 83
                        }
                    }, {
                        // #17.31
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 69,
                            "finalStartPos": 24,
                            "finalPos": 92
                        }
                    }, {
                        // #17.32
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 78,
                            "finalStartPos": 24,
                            "finalPos": 101
                        }
                    }, {
                        // #17.33
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 0,
                            "finalPos": 33
                        }
                    }, {
                        // #17.34
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 10,
                            "finalStartPos": 33,
                            "finalPos": 40
                        }
                    }, {
                        // #17.35
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 17,
                            "finalStartPos": 33,
                            "finalPos": 49
                        }
                    }, {
                        // #17.36
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 26,
                            "finalStartPos": 33,
                            "finalPos": 58
                        }
                    }, {
                        // #17.37
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 35,
                            "finalStartPos": 33,
                            "finalPos": 67
                        }
                    }, {
                        // #17.38
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 44,
                            "finalStartPos": 33,
                            "finalPos": 74
                        }
                    }, {
                        // #17.39
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 51,
                            "finalStartPos": 33,
                            "finalPos": 83
                        }
                    }, {
                        // #17.40
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 60,
                            "finalStartPos": 33,
                            "finalPos": 92
                        }
                    }, {
                        // #17.41
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 69,
                            "finalStartPos": 33,
                            "finalPos": 101
                        }
                    }, {
                        // #17.42
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 40
                        }
                    }, {
                        // #17.43
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 49
                        }
                    }, {
                        // #17.44
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 58
                        }
                    }, {
                        // #17.45
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 67
                        }
                    }, {
                        // #17.46
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 35,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 74
                        }
                    }, {
                        // #17.47
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 42,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 83
                        }
                    }, {
                        // #17.48
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 51,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 92
                        }
                    }, {
                        // #17.49
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 60,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 101
                        }
                    }, {
                        // #17.50
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 0,
                            "finalPos": 49
                        }
                    }, {
                        // #17.51
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 10,
                            "finalStartPos": 49,
                            "finalPos": 58
                        }
                    }, {
                        // #17.52
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 19,
                            "finalStartPos": 49,
                            "finalPos": 67
                        }
                    }, {
                        // #17.53
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 28,
                            "finalStartPos": 49,
                            "finalPos": 74
                        }
                    }, {
                        // #17.54
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 35,
                            "finalStartPos": 49,
                            "finalPos": 83
                        }
                    }, {
                        // #17.55
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 44,
                            "finalStartPos": 49,
                            "finalPos": 92
                        }
                    }, {
                        // #17.56
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 53,
                            "finalStartPos": 49,
                            "finalPos": 101
                        }
                    }, {
                        // #17.57
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 0,
                            "finalPos": 58
                        }
                    }, {
                        // #17.58
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 10,
                            "finalStartPos": 58,
                            "finalPos": 67
                        }
                    }, {
                        // #17.59
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 19,
                            "finalStartPos": 58,
                            "finalPos": 74
                        }
                    }, {
                        // #17.60
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 26,
                            "finalStartPos": 58,
                            "finalPos": 83
                        }
                    }, {
                        // #17.61
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 35,
                            "finalStartPos": 58,
                            "finalPos": 92
                        }
                    }, {
                        // #17.62
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 44,
                            "finalStartPos": 58,
                            "finalPos": 101
                        }
                    }, {
                        // #17.63
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 0,
                            "finalPos": 67
                        }
                    }, {
                        // #17.64
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 10,
                            "finalStartPos": 67,
                            "finalPos": 74
                        }
                    }, {
                        // #17.65
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 17,
                            "finalStartPos": 67,
                            "finalPos": 83
                        }
                    }, {
                        // #17.66
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 26,
                            "finalStartPos": 67,
                            "finalPos": 92
                        }
                    }, {
                        // #17.67
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 35,
                            "finalStartPos": 67,
                            "finalPos": 101
                        }
                    }, {
                        // #17.68
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 74
                        }
                    }, {
                        // #17.69
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 83
                        }
                    }, {
                        // #17.70
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 92
                        }
                    }, {
                        // #17.71
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 101
                        }
                    }, {
                        // #17.72
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 0,
                            "finalPos": 83
                        }
                    }, {
                        // #17.73
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 10,
                            "finalStartPos": 83,
                            "finalPos": 92
                        }
                    }, {
                        // #17.74
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 19,
                            "finalStartPos": 83,
                            "finalPos": 101
                        }
                    }, {
                        // #17.75
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 84,
                            "charCnt": 0,
                            "finalPos": 92
                        }
                    }, {
                        // #17.76
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 84,
                            "charCnt": 10,
                            "finalStartPos": 92,
                            "finalPos": 101
                        }
                    }, {
                        // #17.77
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 93,
                            "charCnt": 0,
                            "finalPos": 101
                        }
                    }
                ]
            }, {
                // #18
                "html": "<ul><li>Item 1"
                            + "<ul><li>Item 1.1"
                                + "<ul><li>Item 1.1.1</li>"
                                + "<li>Item 1.1.2</li></ul>"
                            + "</li>"
                            + "<li>Item 1.2"
                                +  "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li></ul>"
                            + "</li></ul>"
                        + "</li>"
                        + "<li>Item 2</li>"
                        + "<li>Item 3</li></ul>",
                "cmdValue": true,
                "iterations": [
                    {
                        // #18.0
                        "result": "<p>Item 1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 6
                        }
                    }, {
                        // #18.1
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 15
                        }
                    }, {
                        // #18.2
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 26
                        }
                    }, {
                        // #18.3
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 28,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 37
                        }
                    }, {
                        // #18.4
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 39,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 46
                        }
                    }, {
                        // #18.5
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 48,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 57
                        }
                    }, {
                        // #18.6
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 59,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 68
                        }
                    }, {
                        // #18.7
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 70,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 75
                        }
                    }, {
                        // #18.8
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 77,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 82
                        }
                    }, {
                        // #18.9
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 15
                        }
                    }, {
                        // #18.10
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 10,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 26
                        }
                    }, {
                        // #18.11
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 21,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 37
                        }
                    }, {
                        // #18.12
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 32,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 46
                        }
                    }, {
                        // #18.13
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 41,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 57
                        }
                    }, {
                        // #18.14
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 52,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 68
                        }
                    }, {
                        // #18.15
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 63,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 75
                        }
                    }, {
                        // #18.16
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 70,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 82
                        }
                    }, {
                        // #18.17
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 0,
                            "finalPos": 26
                        }
                    }, {
                        // #18.18
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 12,
                            "finalStartPos": 26,
                            "finalPos": 37
                        }
                    }, {
                        // #18.19
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 23,
                            "finalStartPos": 26,
                            "finalPos": 46
                        }
                    }, {
                        // #18.20
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 32,
                            "finalStartPos": 26,
                            "finalPos": 57
                        }
                    }, {
                        // #18.21
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 43,
                            "finalStartPos": 26,
                            "finalPos": 68
                        }
                    }, {
                        // #18.22
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 54,
                            "finalStartPos": 26,
                            "finalPos": 75
                        }
                    }, {
                        // #18.23
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 61,
                            "finalStartPos": 26,
                            "finalPos": 82
                        }
                    }, {
                        // #18.24
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 0,
                            "finalPos": 37
                        }
                    }, {
                        // #18.25
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 12,
                            "finalStartPos": 37,
                            "finalPos": 46
                        }
                    }, {
                        // #18.26
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 21,
                            "finalStartPos": 37,
                            "finalPos": 57
                        }
                    }, {
                        // #18.27
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 32,
                            "finalStartPos": 37,
                            "finalPos": 68
                        }
                    }, {
                        // #18.28
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 43,
                            "finalStartPos": 37,
                            "finalPos": 75
                        }
                    }, {
                        // #18.29
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 50,
                            "finalStartPos": 37,
                            "finalPos": 82
                        }
                    }, {
                        // #18.30
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 46
                        }
                    }, {
                        // #18.31
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 10,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 57
                        }
                    }, {
                        // #18.32
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 21,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 68
                        }
                    }, {
                        // #18.33
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 32,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 75
                        }
                    }, {
                        // #18.34
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 39,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 82
                        }
                    }, {
                        // #18.35
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>&nbsp;"
                                    + "<ul><li>&nbsp;"
                                        + "<ul><li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 0,
                            "finalPos": 57
                        }
                    }, {
                        // #18.36
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 12,
                            "finalStartPos": 57,
                            "finalPos": 68
                        }
                    }, {
                        // #18.37
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 23,
                            "finalStartPos": 57,
                            "finalPos": 75
                        }
                    }, {
                        // #18.38
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 30,
                            "finalStartPos": 57,
                            "finalPos": 82
                        }
                    }, {
                        // #18.39
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 58,
                            "charCnt": 0,
                            "finalPos": 68
                        }
                    }, {
                        // #18.40
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 58,
                            "charCnt": 12,
                            "finalStartPos": 68,
                            "finalPos": 75
                        }
                    }, {
                        // #18.41
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 58,
                            "charCnt": 19,
                            "finalStartPos": 68,
                            "finalPos": 82
                        }
                    }, {
                        // #18.42
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 69,
                            "charCnt": 0,
                            "finalPos": 75
                        }
                    }, {
                        // #18.43
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 69,
                            "charCnt": 8,
                            "finalStartPos": 75,
                            "finalPos": 92
                        }
                    }, {
                        // #18.44
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 76,
                            "charCnt": 0,
                            "finalPos": 82
                        }
                    }
                ]
            }, {
                // #19
                "html": "<ul><li>Item 1"
                            + "<ul><li>Item 1.1</li><li>Item 1.2</li><li>Item 1.3</li></ul>"
                        + "</li><li>Item 2"
                            + "<ul><li>Item 2.1</li><li>Item 2.2</li><li>Item 2.3</li></ul>"
                        + "</li><li>Item 3"
                            + "<ul><li>Item 3.1</li><li>Item 3.2</li><li>Item 3.3</li></ul>"
                        + "</li></ul>",
                "cmdValue": false,
                "iterations": [
                    {
                        // #19.0
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 6
                        }
                    }, {
                        // #19.1
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>Item 1.2</li>"
                                + "<li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 15
                        }
                    }, {
                        // #19.2
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 24
                        }
                    }, {
                        // #19.3
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 33
                        }
                    }, {
                        // #19.4
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 35,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 40
                        }
                    }, {
                        // #19.5
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 42,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 49
                        }
                    }, {
                        // #19.6
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 51,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 58
                        }
                    }, {
                        // #19.7
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 60,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 67
                        }
                    }, {
                        // #19.8
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 69,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 74
                        }
                    }, {
                        // #19.9
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 76,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 83
                        }
                    }, {
                        // #19.10
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 85,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 92
                        }
                    }, {
                        // #19.11
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 94,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 101
                        }
                    }, {
                        // #19.12
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>Item 1.2</li>"
                                + "<li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 15
                        }
                    }, {
                        // #19.13
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 10,
                            "finalStartPos": 15,
                            "finalPos": 24
                        }
                    }, {
                        // #19.14
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 19,
                            "finalStartPos": 15,
                            "finalPos": 33
                        }
                    }, {
                        // #19.15
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 28,
                            "finalStartPos": 15,
                            "finalPos": 40
                        }
                    }, {
                        // #19.16
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 35,
                            "finalStartPos": 15,
                            "finalPos": 49
                        }
                    }, {
                        // #19.17
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 44,
                            "finalStartPos": 15,
                            "finalPos": 58
                        }
                    }, {
                        // #19.18
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 53,
                            "finalStartPos": 15,
                            "finalPos": 67
                        }
                    }, {
                        // #19.19
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 62,
                            "finalStartPos": 15,
                            "finalPos": 74
                        }
                    }, {
                        // #19.20
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 69,
                            "finalStartPos": 15,
                            "finalPos": 83
                        }
                    }, {
                        // #19.21
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 78,
                            "finalStartPos": 15,
                            "finalPos": 92
                        }
                    }, {
                        // #19.22
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 87,
                            "finalStartPos": 15,
                            "finalPos": 101
                        }
                    }, {
                        // #19.23
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 0,
                            "finalPos": 24
                        }
                    }, {
                        // #19.24
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 10,
                            "finalStartPos": 24,
                            "finalPos": 33
                        }
                    }, {
                        // #19.25
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 19,
                            "finalStartPos": 24,
                            "finalPos": 40
                        }
                    }, {
                        // #19.26
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 26,
                            "finalStartPos": 24,
                            "finalPos": 49
                        }
                    }, {
                        // #19.27
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 35,
                            "finalStartPos": 24,
                            "finalPos": 58
                        }
                    }, {
                        // #19.28
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 44,
                            "finalStartPos": 24,
                            "finalPos": 67
                        }
                    }, {
                        // #19.29
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 53,
                            "finalStartPos": 24,
                            "finalPos": 74
                        }
                    }, {
                        // #19.30
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 60,
                            "finalStartPos": 24,
                            "finalPos": 83
                        }
                    }, {
                        // #19.31
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 69,
                            "finalStartPos": 24,
                            "finalPos": 92
                        }
                    }, {
                        // #19.32
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 78,
                            "finalStartPos": 24,
                            "finalPos": 101
                        }
                    }, {
                        // #19.33
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 0,
                            "finalPos": 33
                        }
                    }, {
                        // #19.34
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 10,
                            "finalStartPos": 33,
                            "finalPos": 40
                        }
                    }, {
                        // #19.35
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 17,
                            "finalStartPos": 33,
                            "finalPos": 49
                        }
                    }, {
                        // #19.36
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 26,
                            "finalStartPos": 33,
                            "finalPos": 58
                        }
                    }, {
                        // #19.37
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 35,
                            "finalStartPos": 33,
                            "finalPos": 67
                        }
                    }, {
                        // #19.38
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 44,
                            "finalStartPos": 33,
                            "finalPos": 74
                        }
                    }, {
                        // #19.39
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 51,
                            "finalStartPos": 33,
                            "finalPos": 83
                        }
                    }, {
                        // #19.40
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 60,
                            "finalStartPos": 33,
                            "finalPos": 92
                        }
                    }, {
                        // #19.41
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 69,
                            "finalStartPos": 33,
                            "finalPos": 101
                        }
                    }, {
                        // #19.42
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 40
                        }
                    }, {
                        // #19.43
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 49
                        }
                    }, {
                        // #19.44
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 58
                        }
                    }, {
                        // #19.45
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 67
                        }
                    }, {
                        // #19.46
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 35,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 74
                        }
                    }, {
                        // #19.47
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 42,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 83
                        }
                    }, {
                        // #19.48
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 51,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 92
                        }
                    }, {
                        // #19.49
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 60,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 101
                        }
                    }, {
                        // #19.50
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 0,
                            "finalPos": 49
                        }
                    }, {
                        // #19.51
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 10,
                            "finalStartPos": 49,
                            "finalPos": 58
                        }
                    }, {
                        // #19.52
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 19,
                            "finalStartPos": 49,
                            "finalPos": 67
                        }
                    }, {
                        // #19.53
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 28,
                            "finalStartPos": 49,
                            "finalPos": 74
                        }
                    }, {
                        // #19.54
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 35,
                            "finalStartPos": 49,
                            "finalPos": 83
                        }
                    }, {
                        // #19.55
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 44,
                            "finalStartPos": 49,
                            "finalPos": 92
                        }
                    }, {
                        // #19.56
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 53,
                            "finalStartPos": 49,
                            "finalPos": 101
                        }
                    }, {
                        // #19.57
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 0,
                            "finalPos": 58
                        }
                    }, {
                        // #19.58
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 10,
                            "finalStartPos": 58,
                            "finalPos": 67
                        }
                    }, {
                        // #19.59
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 19,
                            "finalStartPos": 58,
                            "finalPos": 74
                        }
                    }, {
                        // #19.60
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 26,
                            "finalStartPos": 58,
                            "finalPos": 83
                        }
                    }, {
                        // #19.61
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 35,
                            "finalStartPos": 58,
                            "finalPos": 92
                        }
                    }, {
                        // #19.62
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 44,
                            "finalStartPos": 58,
                            "finalPos": 101
                        }
                    }, {
                        // #19.63
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 0,
                            "finalPos": 67
                        }
                    }, {
                        // #19.64
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 10,
                            "finalStartPos": 67,
                            "finalPos": 74
                        }
                    }, {
                        // #19.65
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 17,
                            "finalStartPos": 67,
                            "finalPos": 83
                        }
                    }, {
                        // #19.66
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 26,
                            "finalStartPos": 67,
                            "finalPos": 92
                        }
                    }, {
                        // #19.67
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 35,
                            "finalStartPos": 67,
                            "finalPos": 101
                        }
                    }, {
                        // #19.68
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 74
                        }
                    }, {
                        // #19.69
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 83
                        }
                    }, {
                        // #19.70
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 92
                        }
                    }, {
                        // #19.71
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 101
                        }
                    }, {
                        // #19.72
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 0,
                            "finalPos": 83
                        }
                    }, {
                        // #19.73
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 10,
                            "finalStartPos": 83,
                            "finalPos": 92
                        }
                    }, {
                        // #19.74
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 19,
                            "finalStartPos": 83,
                            "finalPos": 101
                        }
                    }, {
                        // #19.75
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 84,
                            "charCnt": 0,
                            "finalPos": 92
                        }
                    }, {
                        // #19.76
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2</p>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 84,
                            "charCnt": 10,
                            "finalStartPos": 92,
                            "finalPos": 101
                        }
                    }, {
                        // #19.77
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.3</p>",
                        "bookmarkDef": {
                            "startPos": 93,
                            "charCnt": 0,
                            "finalPos": 101
                        }
                    }
                ]
            }, {
                // #20
                "html": "<ul><li>Item 1"
                            + "<ul><li>Item 1.1"
                                + "<ul><li>Item 1.1.1</li>"
                                + "<li>Item 1.1.2</li></ul>"
                            + "</li>"
                            + "<li>Item 1.2"
                                +  "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li></ul>"
                            + "</li></ul>"
                        + "</li>"
                        + "<li>Item 2</li>"
                        + "<li>Item 3</li></ul>",
                "cmdValue": false,
                "iterations": [
                    {
                        // #20.0
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1"
                                    + "<ul><li>Item 1.1.1</li>"
                                    + "<li>Item 1.1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li>"
                                    + "<li>Item 1.2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 6
                        }
                    }, {
                        // #20.1
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>Item 1.1.1</li>"
                                + "<li>Item 1.1.2"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 15
                        }
                    }, {
                        // #20.2
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>Item 1.1.2"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 26
                        }
                    }, {
                        // #20.3
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li>"
                                    + "<li>Item 1.2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 28,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 37
                        }
                    }, {
                        // #20.4
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 39,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 46
                        }
                    }, {
                        // #20.5
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 48,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 57
                        }
                    }, {
                        // #20.6
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 59,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 68
                        }
                    }, {
                        // #20.7
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 70,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 75
                        }
                    }, {
                        // #20.8
                        "result": "<p>Item 1</p>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 77,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 82
                        }
                    }, {
                        // #20.9
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>Item 1.1.1</li>"
                                    + "<li>Item 1.1.2"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 15
                        }
                    }, {
                        // #20.10
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>Item 1.1.2"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 10,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 26
                        }
                    }, {
                        // #20.11
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li>"
                                    + "<li>Item 1.2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 21,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 37
                        }
                    }, {
                        // #20.12
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 32,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 46
                        }
                    }, {
                        // #20.13
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 41,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 57
                        }
                    }, {
                        // #20.14
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 52,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 68
                        }
                    }, {
                        // #20.15
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 63,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 75
                        }
                    }, {
                        // #20.16
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 70,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 82
                        }
                    }, {
                        // #20.17
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>Item 1.1.2"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 0,
                            "finalPos": 26
                        }
                    }, {
                        // #20.18
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li>"
                                    + "<li>Item 1.2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 12,
                            "finalStartPos": 26,
                            "finalPos": 37
                        }
                    }, {
                        // #20.19
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 23,
                            "finalStartPos": 26,
                            "finalPos": 46
                        }
                    }, {
                        // #20.20
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 32,
                            "finalStartPos": 26,
                            "finalPos": 57
                        }
                    }, {
                        // #20.21
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 43,
                            "finalStartPos": 26,
                            "finalPos": 68
                        }
                    }, {
                        // #20.22
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 54,
                            "finalStartPos": 26,
                            "finalPos": 75
                        }
                    }, {
                        // #20.23
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 61,
                            "finalStartPos": 26,
                            "finalPos": 82
                        }
                    }, {
                        // #20.24
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li>"
                                    + "<li>Item 1.2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 0,
                            "finalPos": 37
                        }
                    }, {
                        // #20.25
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 12,
                            "finalStartPos": 37,
                            "finalPos": 46
                        }
                    }, {
                        // #20.26
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 21,
                            "finalStartPos": 37,
                            "finalPos": 57
                        }
                    }, {
                        // #20.27
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 32,
                            "finalStartPos": 37,
                            "finalPos": 68
                        }
                    }, {
                        // #20.28
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 43,
                            "finalStartPos": 37,
                            "finalPos": 75
                        }
                    }, {
                        // #20.29
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 50,
                            "finalStartPos": 37,
                            "finalPos": 82
                        }
                    }, {
                        // #20.30
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 46
                        }
                    }, {
                        // #20.31
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 10,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 57
                        }
                    }, {
                        // #20.32
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 21,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 68
                        }
                    }, {
                        // #20.33
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 32,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 75
                        }
                    }, {
                        // #20.34
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 39,
                            "finalStartPos": (com.ua.isIE ? 45 : 46),
                            "finalPos": 82
                        }
                    }, {
                        // #20.35
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>Item 1.2.2</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 0,
                            "finalPos": 57
                        }
                    }, {
                        // #20.36
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 12,
                            "finalStartPos": 57,
                            "finalPos": 68
                        }
                    }, {
                        // #20.37
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 23,
                            "finalStartPos": 57,
                            "finalPos": 75
                        }
                    }, {
                        // #20.38
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 47,
                            "charCnt": 30,
                            "finalStartPos": 57,
                            "finalPos": 82
                        }
                    }, {
                        // #20.39
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 2</li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 58,
                            "charCnt": 0,
                            "finalPos": 68
                        }
                    }, {
                        // #20.40
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 58,
                            "charCnt": 12,
                            "finalStartPos": 68,
                            "finalPos": 75
                        }
                    }, {
                        // #20.41
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 58,
                            "charCnt": 19,
                            "finalStartPos": 68,
                            "finalPos": 82
                        }
                    }, {
                        // #20.42
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 69,
                            "charCnt": 0,
                            "finalPos": 75
                        }
                    }, {
                        // #20.43
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 69,
                            "charCnt": 8,
                            "finalStartPos": 75,
                            "finalPos": 92
                        }
                    }, {
                        // #20.44
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 3</p>",
                        "bookmarkDef": {
                            "startPos": 76,
                            "charCnt": 0,
                            "finalPos": 82
                        }
                    }
                ]
            }, {
                // #21
                "html": "<ul><li>Item 1"
                            + "<ul><li>Item 1.1"
                                + "<ul><li>Item 1.1.1</li>"
                                + "<li>Item 1.1.2</li>"
                                + "<li>Item 1.1.3</li></ul>"
                            + "</li>"
                            + "<li>Item 1.2"
                                +  "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li>"
                                + "<li>Item 1.2.3</li></ul>"
                            + "</li>"
                            + "<li>Item 1.3"
                                +  "<ul><li>Item 1.3.1</li>"
                                + "<li>Item 1.3.2</li>"
                                + "<li>Item 1.3.3</li></ul>"
                            + "</li></ul>"
                        + "</li>"
                        + "<li>Item 2"
                            + "<ul><li>Item 2.1"
                                + "<ul><li>Item 2.1.1</li>"
                                + "<li>Item 2.1.2</li>"
                                + "<li>Item 2.1.3</li></ul>"
                            + "</li>"
                            + "<li>Item 2.2"
                                + "<ul><li>Item 2.2.1</li>"
                                + "<li>Item 2.2.2</li>"
                                + "<li>Item 2.2.3</li></ul>"
                            + "</li>"
                            + "<li>Item 2.3"
                                + "<ul><li>Item 2.3.1</li>"
                                + "<li>Item 2.3.2</li>"
                                + "<li>Item 2.3.3</li></ul>"
                            + "</li></ul>"
                        + "<li>Item 3"
                            + "<ul><li>Item 3.1"
                                + "<ul><li>Item 3.1.1</li>"
                                + "<li>Item 3.1.2</li>"
                                + "<li>Item 3.1.3</li></ul>"
                            + "</li>"
                            + "<li>Item 3.2"
                                + "<ul><li>Item 3.2.1</li>"
                                + "<li>Item 3.2.2</li>"
                                + "<li>Item 3.2.3</li></ul>"
                            + "</li>"
                            + "<li>Item 3.3"
                                + "<ul><li>Item 3.3.1</li>"
                                + "<li>Item 3.3.2</li>"
                                + "<li>Item 3.3.3</li></ul>"
                            + "</li></ul>"
                        + "</li></ul>",
                "cmdValue": false,
                "iterations": [
                    {
                        // #21.0
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1"
                                    + "<ul><li>Item 1.1.1</li>"
                                    + "<li>Item 1.1.2</li>"
                                    + "<li>Item 1.1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li>"
                                    + "<li>Item 1.2.2</li>"
                                    + "<li>Item 1.2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3"
                                    + "<ul><li>Item 1.3.1</li>"
                                    + "<li>Item 1.3.2</li>"
                                    + "<li>Item 1.3.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 6
                        }
                    }, {
                        // #21.1
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>Item 1.1.1</li>"
                                + "<li>Item 1.1.2</li>"
                                + "<li>Item 1.1.3"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 15
                        }
                    }, {
                        // #21.2
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>Item 1.1.2</li>"
                                + "<li>Item 1.1.3"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 0,
                            "finalPos": 26
                        }
                    }, {
                        // #21.3
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<ul><li>Item 1.1.3"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 0,
                            "finalPos": 37
                        }
                    }, {
                        // #21.4
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.3</p>"
                                + "<ul><li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li>"
                                    + "<li>Item 1.2.2</li>"
                                    + "<li>Item 1.2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3"
                                    + "<ul><li>Item 1.3.1</li>"
                                    + "<li>Item 1.3.2</li>"
                                    + "<li>Item 1.3.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 0,
                            "finalPos": 48
                        }
                    }, {
                        // #21.5
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.2.1</li>"
                                + "<li>Item 1.2.2</li>"
                                + "<li>Item 1.2.3"
                                    + "<ul><li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 49,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 56 : 57),
                            "finalPos": 57
                        }
                    }, {
                        // #21.6
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<ul><li>Item 1.2.2</li>"
                                + "<li>Item 1.2.3"
                                    + "<ul><li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 58,
                            "charCnt": 0,
                            "finalPos": 68
                        }
                    }, {
                        // #21.7
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<ul><li>Item 1.2.3"
                                    + "<ul><li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 69,
                            "charCnt": 0,
                            "finalPos": 79
                        }
                    }, {
                        // #21.8
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.3</p>"
                                + "<ul><li>Item 1.3"
                                    + "<ul><li>Item 1.3.1</li>"
                                    + "<li>Item 1.3.2</li>"
                                    + "<li>Item 1.3.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 80,
                            "charCnt": 0,
                            "finalPos": 90
                        }
                    }, {
                        // #21.9
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3</p>"
                                + "<ul><li>Item 1.3.1</li>"
                                + "<li>Item 1.3.2</li>"
                                + "<li>Item 1.3.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 91,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 98 : 99),
                            "finalPos": 99
                        }
                    }, {
                        // #21.10
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3.1</p>"
                                + "<ul><li>Item 1.3.2</li>"
                                + "<li>Item 1.3.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 100,
                            "charCnt": 0,
                            "finalPos": 110
                        }
                    }, {
                        // #21.11
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3.2</p>"
                                + "<ul><li>Item 1.3.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 111,
                            "charCnt": 0,
                            "finalPos": 121
                        }
                    }, {
                        // #21.12
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.3.3</p>"
                                + "<ul><li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 122,
                            "charCnt": 0,
                            "finalPos": 132
                        }
                    }, {
                        // #21.13
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.1.1</li>"
                                    + "<li>Item 2.1.2</li>"
                                    + "<li>Item 2.1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.2.1</li>"
                                    + "<li>Item 2.2.2</li>"
                                    + "<li>Item 2.2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2.3"
                                    + "<ul><li>Item 2.3.1</li>"
                                    + "<li>Item 2.3.2</li>"
                                    + "<li>Item 2.3.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 133,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 138 : 139),
                            "finalPos": 139
                        }
                    }, {
                        // #21.14
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<ul><li>Item 2.1.1</li>"
                                + "<li>Item 2.1.2</li>"
                                + "<li>Item 2.1.3"
                                    + "<ul><li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 140,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 147 : 148),
                            "finalPos": 148
                        }
                    }, {
                        // #21.15
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.1.1</p>"
                                + "<ul><li>Item 2.1.2</li>"
                                + "<li>Item 2.1.3"
                                    + "<ul><li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 149,
                            "charCnt": 0,
                            "finalPos": 159
                        }
                    }, {
                        // #21.16
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.1.2</p>"
                                + "<ul><li>Item 2.1.3"
                                    + "<ul><li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 160,
                            "charCnt": 0,
                            "finalPos": 170
                        }
                    }, {
                        // #21.17
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.1.3</p>"
                                + "<ul><li>Item 2.2"
                                    + "<ul><li>Item 2.2.1</li>"
                                    + "<li>Item 2.2.2</li>"
                                    + "<li>Item 2.2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2.3"
                                    + "<ul><li>Item 2.3.1</li>"
                                    + "<li>Item 2.3.2</li>"
                                    + "<li>Item 2.3.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 171,
                            "charCnt": 0,
                            "finalPos": 181
                        }
                    }, {
                        // #21.18
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 2.2.1</li>"
                                + "<li>Item 2.2.2</li>"
                                + "<li>Item 2.2.3"
                                    + "<ul><li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 182,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 189 : 190),
                            "finalPos": 190
                        }
                    }, {
                        // #21.19
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2.1</p>"
                                + "<ul><li>Item 2.2.2</li>"
                                + "<li>Item 2.2.3"
                                    + "<ul><li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 191,
                            "charCnt": 0,
                            "finalPos": 201
                        }
                    }, {
                        // #21.20
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2.2</p>"
                                + "<ul><li>Item 2.2.3"
                                    + "<ul><li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 202,
                            "charCnt": 0,
                            "finalPos": 212
                        }
                    }, {
                        // #21.21
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.2.3</p>"
                                + "<ul><li>Item 2.3"
                                    + "<ul><li>Item 2.3.1</li>"
                                    + "<li>Item 2.3.2</li>"
                                    + "<li>Item 2.3.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 213,
                            "charCnt": 0,
                            "finalPos": 223
                        }
                    }, {
                        // #21.22
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3</p>"
                                + "<ul><li>Item 2.3.1</li>"
                                + "<li>Item 2.3.2</li>"
                                + "<li>Item 2.3.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 224,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 231 : 232),
                            "finalPos": 232
                        }
                    }, {
                        // #21.23
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3.1</p>"
                                + "<ul><li>Item 2.3.2</li>"
                                + "<li>Item 2.3.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 233,
                            "charCnt": 0,
                            "finalPos": 243
                        }
                    }, {
                        // #21.24
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3.2</p>"
                                + "<ul><li>Item 2.3.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 244,
                            "charCnt": 0,
                            "finalPos": 254
                        }
                    }, {
                        // #21.25
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2.3.3</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 255,
                            "charCnt": 0,
                            "finalPos": 265
                        }
                    }, {
                        // #21.26
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.1.1</li>"
                                    + "<li>Item 3.1.2</li>"
                                    + "<li>Item 3.1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.2.1</li>"
                                    + "<li>Item 3.2.2</li>"
                                    + "<li>Item 3.2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3.3"
                                    + "<ul><li>Item 3.3.1</li>"
                                    + "<li>Item 3.3.2</li>"
                                    + "<li>Item 3.3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 266,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 271 : 272),
                            "finalPos": 272
                        }
                    }, {
                        // #21.27
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.1.1</li>"
                                + "<li>Item 3.1.2</li>"
                                + "<li>Item 3.1.3"
                                    + "<ul><li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 273,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 280 : 281),
                            "finalPos": 281
                        }
                    }, {
                        // #21.28
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.1.1</p>"
                                + "<ul><li>Item 3.1.2</li>"
                                + "<li>Item 3.1.3"
                                    + "<ul><li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 282,
                            "charCnt": 0,
                            "finalPos": 292
                        }
                    }, {
                        // #21.29
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.1.2</p>"
                                + "<ul><li>Item 3.1.3"
                                    + "<ul><li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 293,
                            "charCnt": 0,
                            "finalPos": 303
                        }
                    }, {
                        // #21.30
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.1.3</p>"
                                + "<ul><li>Item 3.2"
                                    + "<ul><li>Item 3.2.1</li>"
                                    + "<li>Item 3.2.2</li>"
                                    + "<li>Item 3.2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3.3"
                                    + "<ul><li>Item 3.3.1</li>"
                                    + "<li>Item 3.3.2</li>"
                                    + "<li>Item 3.3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 304,
                            "charCnt": 0,
                            "finalPos": 314
                        }
                    }, {
                        // #21.31
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.2.1</li>"
                                + "<li>Item 3.2.2</li>"
                                + "<li>Item 3.2.3"
                                    + "<ul><li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 315,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 322 : 323),
                            "finalPos": 323
                        }
                    }, {
                        // #21.32
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2.1</p>"
                                + "<ul><li>Item 3.2.2</li>"
                                + "<li>Item 3.2.3"
                                    + "<ul><li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 324,
                            "charCnt": 0,
                            "finalPos": 334
                        }
                    }, {
                        // #21.33
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2.2</p>"
                                + "<ul><li>Item 3.2.3"
                                    + "<ul><li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li>"
                                        + "<li>Item 3.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 335,
                            "charCnt": 0,
                            "finalPos": 345
                        }
                    }, {
                        // #21.34
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2.3</p>"
                                + "<ul><li>Item 3.3"
                                    + "<ul><li>Item 3.3.1</li>"
                                    + "<li>Item 3.3.2</li>"
                                    + "<li>Item 3.3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 346,
                            "charCnt": 0,
                            "finalPos": 356
                        }
                    }, {
                        // #21.35
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.3</p>"
                                + "<ul><li>Item 3.3.1</li>"
                                + "<li>Item 3.3.2</li>"
                                + "<li>Item 3.3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 357,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 364 : 365),
                            "finalPos": 365
                        }
                    }, {
                        // #21.36
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.3.1</p>"
                                + "<ul><li>Item 3.3.2</li>"
                                + "<li>Item 3.3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 366,
                            "charCnt": 0,
                            "finalPos": 376
                        }
                    }, {
                        // #21.37
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.3.2</p>"
                                + "<ul><li>Item 3.3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 377,
                            "charCnt": 0,
                            "finalPos": 387
                        }
                    }, {
                        // #21.38
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li>"
                                        + "<li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.3"
                                        + "<ul><li>Item 1.3.1</li>"
                                        + "<li>Item 1.3.2</li>"
                                        + "<li>Item 1.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1"
                                        + "<ul><li>Item 2.1.1</li>"
                                        + "<li>Item 2.1.2</li>"
                                        + "<li>Item 2.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.2"
                                        + "<ul><li>Item 2.2.1</li>"
                                        + "<li>Item 2.2.2</li>"
                                        + "<li>Item 2.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 2.3"
                                        + "<ul><li>Item 2.3.1</li>"
                                        + "<li>Item 2.3.2</li>"
                                        + "<li>Item 2.3.3</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1"
                                        + "<ul><li>Item 3.1.1</li>"
                                        + "<li>Item 3.1.2</li>"
                                        + "<li>Item 3.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.2"
                                        + "<ul><li>Item 3.2.1</li>"
                                        + "<li>Item 3.2.2</li>"
                                        + "<li>Item 3.2.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 3.3"
                                        + "<ul><li>Item 3.3.1</li>"
                                        + "<li>Item 3.3.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.3.3</p>",
                        "bookmarkDef": {
                            "startPos": 388,
                            "charCnt": 0,
                            "finalPos": 398
                        }
                    }
                ]
            }, {
                "html": "<ul><li>Item 1"
                            + "<ul><li>Item 1.1"
                                + "<ul><li>Item 1.1.1</li>"
                                + "<li>Item 1.1.2"
                                    + "<ol><li>Item 1.1.2.1</li></ol>"
                                    + "<ul><li>Item 1.1.2.2</li></ul>"
                                    + "<ol><li>Item 1.1.2.3</li></ol>"
                                + "</li>"
                                + "<li>Item 1.1.3</li></ul>"
                            + "</li>"
                            + "<li>Item 1.2"
                                + "<ul><li>Item 1.2.1</li></ul>"
                                + "<ol><li>Item 1.2.2</li>"
                                + "<li>Item 1.2.3</li></ol>"
                                + "<ul><li>Item 1.2.4</li>"
                                + "<li>Item 1.2.5</li></ul>"
                            + "</li></ul>"
                        + "</li>"
                        + "<li>Item 2"
                            + "<ol><li>Item 2.1</li>"
                            + "<li>Item 2.2</li></ol>"
                        + "</li>"
                        + "<li>Item 3"
                            + "<ul><li>Item 3.1</li>"
                            + "<li>Item 3.2</li>"
                            + "<li>Item 3.3</li></ul>"
                            + "<ol><li>Item 3.4</li>"
                            + "<li>Item 3.5</li>"
                            + "<li>Item 3.6</li></ol>"
                        + "</li></ul>",
                "cmdValue": false,
                "ignoreForOrderedListRun": true,
                "iterations": [
                    {
                        // #22.0
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1"
                                    + "<ul><li>Item 1.1.1</li>"
                                    + "<li>Item 1.1.2"
                                        + "<ol><li>Item 1.1.2.1</li></ol>"
                                        + "<ul><li>Item 1.1.2.2</li></ul>"
                                        + "<ol><li>Item 1.1.2.3</li></ol>"
                                    + "</li>"
                                    + "<li>Item 1.1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li></ul>"
                                    + "<ol><li>Item 1.2.2</li>"
                                    + "<li>Item 1.2.3</li></ol>"
                                    + "<ul><li>Item 1.2.4</li>"
                                    + "<li>Item 1.2.5</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 6
                        }
                    }, {
                        // #22.1
                        "result": "<ul><li>Item 1</li></ul>"
                                + "<p>Item 1.1</p>"
                                + "<ul><li>Item 1.1.1</li>"
                                + "<li>Item 1.1.2"
                                    + "<ol><li>Item 1.1.2.1</li></ol>"
                                    + "<ul><li>Item 1.1.2.2</li></ul>"
                                    + "<ol><li>Item 1.1.2.3</li></ol>"
                                + "</li>"
                                + "<li>Item 1.1.3"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 14 : 15),
                            "finalPos": 15
                        }
                    }, {
                        // #22.2
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.1</p>"
                                + "<ul><li>Item 1.1.2"
                                    + "<ol><li>Item 1.1.2.1</li></ol>"
                                    + "<ul><li>Item 1.1.2.2</li></ul>"
                                    + "<ol><li>Item 1.1.2.3</li></ol>"
                                + "</li>"
                                + "<li>Item 1.1.3"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 0,
                            "finalPos": 26
                        }
                    }, {
                        // #22.3
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2</p>"
                                + "<ol><li>Item 1.1.2.1</li></ol>"
                                + "<ul><li>Item 1.1.2.2</li></ul>"
                                + "<ol><li>Item 1.1.2.3"
                                    + "<ul><li>Item 1.1.3</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li></ol>"
                                + "<ul><li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 27,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 36 : 37),
                            "finalPos": 37
                        }
                    }, {
                        // #22.4
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2.1</p>"
                                + "<ul><li>Item 1.1.2.2</li></ul>"
                                + "<ol><li>Item 1.1.2.3"
                                    + "<ul><li>Item 1.1.3</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li></ol>"
                                + "<ul><li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 38,
                            "charCnt": 0,
                            "finalPos": 50
                        }
                    }, {
                        // #22.5
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                        + "</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2.2</p>"
                                + "<ol><li>Item 1.1.2.3"
                                    + "<ul><li>Item 1.1.3</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li></ol>"
                                + "<ul><li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 51,
                            "charCnt": 0,
                            "finalPos": 63
                        }
                    }, {
                        // #22.6
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                        + "</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.2.3</p>"
                                + "<ul><li>Item 1.1.3"
                                    + "<ul><li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 64,
                            "charCnt": 0,
                            "finalPos": 76
                        }
                    }, {
                        // #22.7
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.1.3</p>"
                                + "<ul><li>Item 1.2"
                                    + "<ul><li>Item 1.2.1</li></ul>"
                                    + "<ol><li>Item 1.2.2</li>"
                                    + "<li>Item 1.2.3</li></ol>"
                                    + "<ul><li>Item 1.2.4</li>"
                                    + "<li>Item 1.2.5</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 77,
                            "charCnt": 0,
                            "finalPos": 87
                        }
                    }, {
                        // #22.8
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2</p>"
                                + "<ul><li>Item 1.2.1</li></ul>"
                                + "<ol><li>Item 1.2.2</li>"
                                + "<li>Item 1.2.3</li></ol>"
                                + "<ul><li>Item 1.2.4</li>"
                                + "<li>Item 1.2.5</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 88,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 95 : 96),
                            "finalPos": 96
                        }
                    }, {
                        // #22.9
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.1</p>"
                                + "<ol><li>Item 1.2.2</li>"
                                + "<li>Item 1.2.3</li></ol>"
                                + "<ul><li>Item 1.2.4</li>"
                                + "<li>Item 1.2.5</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 97,
                            "charCnt": 0,
                            "finalPos": 107
                        }
                    }, {
                        // #22.10
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.2</p>"
                                + "<ol><li>Item 1.2.3</li></ol>"
                                + "<ul><li>Item 1.2.4</li>"
                                + "<li>Item 1.2.5</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 108,
                            "charCnt": 0,
                            "finalPos": 118
                        }
                    }, {
                        // #22.11
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li></ol>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.3</p>"
                                + "<ul><li>Item 1.2.4</li>"
                                + "<li>Item 1.2.5</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 119,
                            "charCnt": 0,
                            "finalPos": 129
                        }
                    }, {
                        // #22.12
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.4</p>"
                                + "<ul><li>Item 1.2.5</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 130,
                            "charCnt": 0,
                            "finalPos": 140
                        }
                    }, {
                        // #22.13
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 1.2.5</p>"
                                + "<ul><li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 141,
                            "charCnt": 0,
                            "finalPos": 151
                        }
                    }, {
                        // #22.14
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ol><li>Item 2.1</li>"
                                + "<li>Item 2.2</li></ol>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 152,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 157 : 158),
                            "finalPos": 158
                        }
                    }, {
                        // #22.15
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li></ul>"
                                + "<p>Item 2.1</p>"
                                + "<ol><li>Item 2.2</li></ol>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 159,
                            "charCnt": 0,
                            "finalPos": 167
                        }
                    }, {
                        // #22.16
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li></ol>"
                                + "</li></ul>"
                                + "<p>Item 2.2</p>"
                                + "<ul><li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li>"
                                    + "<li>Item 3.6</li></ol>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 168,
                            "charCnt": 0,
                            "finalPos": 176
                        }
                    }, {
                        // #22.17
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>"
                                + "<ol><li>Item 3.4</li>"
                                + "<li>Item 3.5</li>"
                                + "<li>Item 3.6</li></ol>",
                        "bookmarkDef": {
                            "startPos": 177,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 182 : 183),
                            "finalPos": 183
                        }
                    }, {
                        // #22.18
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3</li></ul>"
                                + "<p>Item 3.1</p>"
                                + "<ul><li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>"
                                + "<ol><li>Item 3.4</li>"
                                + "<li>Item 3.5</li>"
                                + "<li>Item 3.6</li></ol>",
                        "bookmarkDef": {
                            "startPos": 184,
                            "charCnt": 0,
                            "finalPos": 192
                        }
                    }, {
                        // #22.19
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.2</p>"
                                + "<ul><li>Item 3.3</li></ul>"
                                + "<ol><li>Item 3.4</li>"
                                + "<li>Item 3.5</li>"
                                + "<li>Item 3.6</li></ol>",
                        "bookmarkDef": {
                            "startPos": 193,
                            "charCnt": 0,
                            "finalPos": 201
                        }
                    }, {
                        // #22.20
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.3</p>"
                                + "<ol><li>Item 3.4</li>"
                                + "<li>Item 3.5</li>"
                                + "<li>Item 3.6</li></ol>",
                        "bookmarkDef": {
                            "startPos": 202,
                            "charCnt": 0,
                            "finalPos": 210
                        }
                    }, {
                        // #22.21
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3.4</p>"
                                + "<ol><li>Item 3.5</li>"
                                + "<li>Item 3.6</li></ol>",
                        "bookmarkDef": {
                            "startPos": 211,
                            "charCnt": 0,
                            "finalPos": 219
                        }
                    }, {
                        // #22.22
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li></ol>"
                                + "</li></ul>"
                                + "<p>Item 3.5</p>"
                                + "<ol><li>Item 3.6</li></ol>",
                        "bookmarkDef": {
                            "startPos": 220,
                            "charCnt": 0,
                            "finalPos": 228
                        }
                    }, {
                        // #22.23
                        "cmd": "insertorderedlist",
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1"
                                        + "<ul><li>Item 1.1.1</li>"
                                        + "<li>Item 1.1.2"
                                            + "<ol><li>Item 1.1.2.1</li></ol>"
                                            + "<ul><li>Item 1.1.2.2</li></ul>"
                                            + "<ol><li>Item 1.1.2.3</li></ol>"
                                        + "</li>"
                                        + "<li>Item 1.1.3</li></ul>"
                                    + "</li>"
                                    + "<li>Item 1.2"
                                        + "<ul><li>Item 1.2.1</li></ul>"
                                        + "<ol><li>Item 1.2.2</li>"
                                        + "<li>Item 1.2.3</li></ol>"
                                        + "<ul><li>Item 1.2.4</li>"
                                        + "<li>Item 1.2.5</li></ul>"
                                    + "</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ol><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ol>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                    + "<ol><li>Item 3.4</li>"
                                    + "<li>Item 3.5</li></ol>"
                                + "</li></ul>"
                                + "<p>Item 3.6</p>",
                        "bookmarkDef": {
                            "startPos": 229,
                            "charCnt": 0,
                            "finalPos": 237
                        }
                    }
                ]
            }, {
                // #23
                "html": "<ul>"
                        + "<li>Item</li>"
                        + "<li>&nbsp;</li>"
                        + "</ul>",
                "iterations": [
                    {
                        "result": "<p>Item</p>"
                                + "<ul><li>&nbsp;</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 4
                        }
                    }, {
                        "result": "<ul><li>Item</li></ul>"
                                + "<p>&nbsp;</p>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 5
                        }
                    }, {
                        "result": "<p>Item</p>"
                                + "<p>&nbsp;</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 6,
                            "finalPos": 6,
                            "finalStartPos": 4
                        },
                        "ignore": com.ua.isWebKit   // WebKit cannot select empty list items
                    }
                ]
            }, {
                // #24
                "html": "<ul>"
                        + "<li>&nbsp;</li>"
                        + "<li>Item</li>"
                        + "</ul>",
                "iterations": [
                    {
                        "result": "<p>&nbsp;</p>"
                                + "<ul><li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": 0,
                            "finalPos": 1
                        }
                    }, {
                        "result": "<ul><li>&nbsp;</li></ul>"
                                + "<p>Item</p>",
                        "bookmarkDef": {
                            "startPos": 2,
                            "charCnt": 0,
                            "finalPos": 6
                        }
                    }, {
                        "result": "<p>&nbsp;</p>"
                                + "<p>Item</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 3,
                            "finalPos": 6,
                            "finalStartPos": (com.ua.isIE ? 0 : 1)
                        }
                    }
                ]
            }
        ],

        testListIndenting: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                tcc.executeCommand(testCase.cmd, testCase.cmdValue);
            };
            return tcc.executeTestSuite(testFn, tst.INDENTING_TESTS, testNo, testIteration);
        },

        testOrderedListIndenting: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                tcc.executeCommand(testCase.cmd, testCase.cmdValue);
            };
            var convertedSuite = adaptTestSuiteToOrderedList(tst.INDENTING_TESTS);
            return tcc.executeTestSuite(testFn, convertedSuite, testNo, testIteration);
        },

        INDENTING_TESTS: [
            {
                // #0
                "html": "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
                "cmd": "indent",
                "iterations": [
                    {
                        "result": "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 6
                        }
                    }, {
                        "result": "<ul><li>Item 1<ul><li>Item 2</li></ul></li>"
                                + "<li>Item 3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 13
                        }
                    }, {
                        "result": "<ul><li>Item 1</li><li>Item 2<ul><li>Item 3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 14,
                            "charCnt": 0,
                            "finalPos": 20
                        }
                    }, {
                        "result": "<ul><li>Item 1</li><li>Item 2<ul><li>Item 3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 14,
                            "charCnt": 0,
                            "finalPos": 20
                        }
                    }, {
                        "result": "<ul><li>Item 1<ul><li>Item 2</li><li>Item 3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 8,
                            "finalStartPos": 13,
                            "finalPos": 20
                        }
                    }
                ]
            }, {
                // #1
                "html": "<ul><li>Item 1<ul><li>Item 2</li></ul></li></ul>",
                "cmd": "outdent",
                "iterations": [
                    {
                        "result": "<ul><li>Item 1</li><li>Item 2</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 13
                        }
                    }, {
                        "result": "<p>Item 1</p><ul><li>Item 2</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": (com.ua.isIE ? 5 : 6)   // IE got problems with the last character before a nested list, so we'll have to ignore it for testing
                        }
                    }
                ]
            }, {
                // #2
                "html": "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
                "cmd": "outdent",
                "iterations": [
                    {
                        "result": "<ul><li>Item 1</li></ul><p>Item 2</p><ul><li>Item 3</li>"
                                + "</ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 13
                        }
                    }
                ]
            }, {
                // #3
                "html": "<p>Paragraph</p>",
                "cmd": "indent",
                "ignoreForOrderedListRun": true,
                "iterations": [
                    {
                        "result": "<p style=\"margin-left: 40px;\">Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }
                ]
            }, {
                // #4
                "html": "<p style=\"margin-left: 40px\">Paragraph</p>",
                "cmd": "outdent",
                "ignoreForOrderedListRun": true,
                "iterations": [
                    {
                        "result": "<p>Paragraph</p>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }
                ]
            }, {
                // #5
                "html": "<ul><li>Item<ul><li>Item</li><li>Item</li></ul></li><li>Item</li>"
                        + "</ul>",
                "cmd": "outdent",
                "iterations": [
                    {
                        "result": "<ul><li>Item<ul><li>Item</li></ul></li><li>Item</li>"
                                + "<li>Item</li></ul>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 0,
                            "finalPos": 14
                        }
                    }, {
                        "result": "<ul><li>Item<ul><li>Item</li></ul></li><li>Item</li>"
                                + "</ul><p>Item</p>",
                        "bookmarkDef": {
                            "startPos": 10,
                            "charCnt": 6,
                            "finalStartPos": 14,
                            "finalPos": 19
                        }
                    }
                ]
            }, {
                // #6
                "html": "<ul><li>Item 1"
                            + "<ul><li>Item 1.1</li><li>Item 1.2</li><li>Item 1.3</li></ul>"
                        + "</li>"
                        + "<li>Item 2"
                            + "<ul><li>Item 2.1</li><li>Item 2.2</li><li>Item 2.3</li></ul>"
                        + "</li>"
                        + "<li>Item 3"
                            + "<ul><li>Item 3.1</li><li>Item 3.2</li><li>Item 3.3</li></ul>"
                        + "</li></ul>",
                "cmd": "outdent",
                "iterations": [
                    {
                        // #6.0
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1"
                                    + "<ul><li>Item 1.2</li><li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 6
                        }
                    }, {
                        // #6.1
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1"
                                    + "<ul><li>Item 1.2</li><li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 15
                        }
                    }, {
                        // #6.2
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2"
                                    + "<ul><li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 24
                        }
                    }, {
                        // #6.3
                        "result": "<p>Item 1</p>"
                                + "<ul>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 33
                        }
                    }, {
                        // #6.4
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 35,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 40
                        }
                    }, {
                        // #6.5
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 42,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 49
                        }
                    }, {
                        // #6.6
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 51,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 58
                        }
                    }, {
                        // #6.7
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 60,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 67
                        }
                    }, {
                        // #6.8
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 69,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 74
                        }
                    }, {
                        // #6.9
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 76,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 83
                        }
                    }, {
                        // #6.10
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 85,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 92
                        }
                    }, {
                        // #6.11
                        "result": "<p>Item 1</p>"
                                + "<ul><li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 94,
                            "finalStartPos": (com.ua.isIE ? 5 : 6),
                            "finalPos": 101
                        }
                    }, {
                        // #6.12
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1"
                                    + "<ul><li>Item 1.2</li><li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalStartPos": 15,
                            "finalPos": 15
                        }
                    }, {
                        // #6.13
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2"
                                    + "<ul><li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 10,
                            "finalStartPos": 15,
                            "finalPos": 24
                        }
                    }, {
                        // #6.14
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 19,
                            "finalStartPos": 15,
                            "finalPos": 33
                        }
                    }, {
                        // #6.15
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 28,
                            "finalStartPos": 15,
                            "finalPos": 40
                        }
                    }, {
                        // #6.16
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 35,
                            "finalStartPos": 15,
                            "finalPos": 49
                        }
                    }, {
                        // #6.17
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 44,
                            "finalStartPos": 15,
                            "finalPos": 58
                        }
                    }, {
                        // #6.18
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 53,
                            "finalStartPos": 15,
                            "finalPos": 67
                        }
                    }, {
                        // #6.19
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 62,
                            "finalStartPos": 15,
                            "finalPos": 74
                        }
                    }, {
                        // #6.20
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 69,
                            "finalStartPos": 15,
                            "finalPos": 83
                        }
                    }, {
                        // #6.21
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 78,
                            "finalStartPos": 15,
                            "finalPos": 92
                        }
                    }, {
                        // #6.22
                        "result": "<ul><li>Item 1</li>"
                                + "<li>Item 1.1</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 87,
                            "finalStartPos": 15,
                            "finalPos": 101
                        }
                    }, {
                        // #6.23
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2"
                                    + "<ul><li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 0,
                            "finalStartPos": 24,
                            "finalPos": 24
                        }
                    }, {
                        // #6.24
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 10,
                            "finalStartPos": 24,
                            "finalPos": 33
                        }
                    }, {
                        // #6.25
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 19,
                            "finalStartPos": 24,
                            "finalPos": 40
                        }
                    }, {
                        // #6.26
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 26,
                            "finalStartPos": 24,
                            "finalPos": 49
                        }
                    }, {
                        // #6.27
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 35,
                            "finalStartPos": 24,
                            "finalPos": 58
                        }
                    }, {
                        // #6.28
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 44,
                            "finalStartPos": 24,
                            "finalPos": 67
                        }
                    }, {
                        // #6.29
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 53,
                            "finalStartPos": 24,
                            "finalPos": 74
                        }
                    }, {
                        // #6.30
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 60,
                            "finalStartPos": 24,
                            "finalPos": 83
                        }
                    }, {
                        // #6.31
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 69,
                            "finalStartPos": 24,
                            "finalPos": 92
                        }
                    }, {
                        // #6.32
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li></ul>"
                                + "</li>"
                                + "<li>Item 1.2</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 16,
                            "charCnt": 78,
                            "finalStartPos": 24,
                            "finalPos": 101
                        }
                    }, {
                        // #6.33
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 0,
                            "finalStartPos": 33,
                            "finalPos": 33
                        }
                    }, {
                        // #6.34
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 10,
                            "finalStartPos": 33,
                            "finalPos": 40
                        }
                    }, {
                        // #6.35
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 17,
                            "finalStartPos": 33,
                            "finalPos": 49
                        }
                    }, {
                        // #6.36
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 26,
                            "finalStartPos": 33,
                            "finalPos": 58
                        }
                    }, {
                        // #6.37
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 35,
                            "finalStartPos": 33,
                            "finalPos": 67
                        }
                    }, {
                        // #6.38
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 44,
                            "finalStartPos": 33,
                            "finalPos": 74
                        }
                    }, {
                        // #6.39
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 51,
                            "finalStartPos": 33,
                            "finalPos": 83
                        }
                    }, {
                        // #6.40
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 60,
                            "finalStartPos": 33,
                            "finalPos": 92
                        }
                    }, {
                        // #6.41
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li></ul>"
                                + "</li>"
                                + "<li>Item 1.3</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 25,
                            "charCnt": 69,
                            "finalStartPos": 33,
                            "finalPos": 101
                        }
                    }, {
                        // #6.42
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 40
                        }
                    }, {
                        // #6.43
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 49
                        }
                    }, {
                        // #6.44
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 58
                        }
                    }, {
                        // #6.45
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 67
                        }
                    }, {
                        // #6.46
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 35,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 74
                        }
                    }, {
                        // #6.47
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 42,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 83
                        }
                    }, {
                        // #6.48
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 51,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 92
                        }
                    }, {
                        // #6.49
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 2</p>"
                                + "<ul><li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 34,
                            "charCnt": 60,
                            "finalStartPos": (com.ua.isIE ? 39 : 40),
                            "finalPos": 101
                        }
                    }, {
                        // #6.50
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 2.1"
                                    + "<ul><li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 0,
                            "finalStartPos": 49,
                            "finalPos": 49
                        }
                    }, {
                        // #6.51
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 2.1</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 10,
                            "finalStartPos": 49,
                            "finalPos": 58
                        }
                      }, {
                        // #6.52
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 19,
                            "finalStartPos": 49,
                            "finalPos": 67
                        }
                      }, {
                        // #6.53
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 28,
                            "finalStartPos": 49,
                            "finalPos": 74
                        }
                      }, {
                        // #6.54
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 35,
                            "finalStartPos": 49,
                            "finalPos": 83
                        }
                      }, {
                        // #6.55
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 44,
                            "finalStartPos": 49,
                            "finalPos": 92
                        }
                      }, {
                        // #6.56
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2</li>"
                                + "<li>Item 2.1</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 41,
                            "charCnt": 53,
                            "finalStartPos": 49,
                            "finalPos": 101
                        }
                    }, {
                        // #6.57
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li>"
                                + "<li>Item 2.2"
                                    + "<ul><li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 0,
                            "finalStartPos": 58,
                            "finalPos": 58
                        }
                    }, {
                        // #6.58
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 10,
                            "finalStartPos": 58,
                            "finalPos": 67
                        }
                    }, {
                        // #6.59
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 19,
                            "finalStartPos": 58,
                            "finalPos": 74
                        }
                    }, {
                        // #6.60
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 26,
                            "finalStartPos": 58,
                            "finalPos": 83
                        }
                    }, {
                        // #6.61
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 35,
                            "finalStartPos": 58,
                            "finalPos": 92
                        }
                    }, {
                        // #6.62
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li></ul>"
                                + "</li>"
                                + "<li>Item 2.2</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 50,
                            "charCnt": 44,
                            "finalStartPos": 58,
                            "finalPos": 101
                        }
                    }, {
                        // #6.63
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2.3</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 0,
                            "finalStartPos": 67,
                            "finalPos": 67
                        }
                    }, {
                        // #6.64
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 10,
                            "finalStartPos": 67,
                            "finalPos": 74
                        }
                    }, {
                        // #6.65
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 17,
                            "finalStartPos": 67,
                            "finalPos": 83
                        }
                    }, {
                        // #6.66
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 26,
                            "finalStartPos": 67,
                            "finalPos": 92
                        }
                    }, {
                        // #6.67
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li></ul>"
                                + "</li>"
                                + "<li>Item 2.3</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 59,
                            "charCnt": 35,
                            "finalStartPos": 67,
                            "finalPos": 101
                        }
                    }, {
                        // #6.68
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 0,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 74
                        }
                    }, {
                        // #6.69
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 83
                        }
                    }, {
                        // #6.70
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 17,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 92
                        }
                    }, {
                        // #6.71
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li></ul>"
                                + "<p>Item 3</p>"
                                + "<ul><li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 68,
                            "charCnt": 26,
                            "finalStartPos": (com.ua.isIE ? 73 : 74),
                            "finalPos": 101
                        }
                    }, {
                        // #6.72
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li>"
                                + "<li>Item 3.1"
                                    + "<ul><li>Item 3.2</li>"
                                    + "<li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 0,
                            "finalStartPos": 83,
                            "finalPos": 83
                        }
                    }, {
                        // #6.73
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li>"
                                + "<li>Item 3.1</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 10,
                            "finalStartPos": 83,
                            "finalPos": 92
                        }
                    }, {
                        // #6.74
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3</li>"
                                + "<li>Item 3.1</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 75,
                            "charCnt": 19,
                            "finalStartPos": 83,
                            "finalPos": 101
                        }
                    }, {
                        // #6.75
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li>"
                                + "<li>Item 3.2"
                                    + "<ul><li>Item 3.3</li></ul>"
                                + "</li></ul>",
                        "bookmarkDef": {
                            "startPos": 84,
                            "charCnt": 0,
                            "finalStartPos": 92,
                            "finalPos": 92
                        }
                    }, {
                        // #6.76
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li></ul>"
                                + "</li>"
                                + "<li>Item 3.2</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 84,
                            "charCnt": 10,
                            "finalStartPos": 92,
                            "finalPos": 101
                        }
                    }, {
                        // #6.77
                        "result": "<ul><li>Item 1"
                                    + "<ul><li>Item 1.1</li>"
                                    + "<li>Item 1.2</li>"
                                    + "<li>Item 1.3</li></ul>"
                                + "</li>"
                                + "<li>Item 2"
                                    + "<ul><li>Item 2.1</li>"
                                    + "<li>Item 2.2</li>"
                                    + "<li>Item 2.3</li></ul>"
                                + "</li>"
                                + "<li>Item 3"
                                    + "<ul><li>Item 3.1</li>"
                                    + "<li>Item 3.2</li></ul>"
                                + "</li>"
                                + "<li>Item 3.3</li></ul>",
                        "bookmarkDef": {
                            "startPos": 93,
                            "charCnt": 0,
                            "finalStartPos": 101,
                            "finalPos": 101
                        }
                    }
                ]
            }
        ],

        testSimpleListsInTable: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase, iteration) {
                var cmdValue = null;
                if (iteration.cmdValue !== undefined) {
                    cmdValue = iteration.cmdValue;
                } else if (testCase.cmdValue !== undefined) {
                    cmdValue = testCase.cmdValue;
                }
                if (iteration.cmd) {
                    tcc.executeCommand(iteration.cmd, cmdValue);
                } else if (testCase.cmd) {
                    tcc.executeCommand(testCase.cmd, cmdValue);
                } else {
                    tcc.executeCommand("insertunorderedlist", cmdValue);
                }
            };
            var convertedSuite = adaptTestSuiteForTable(tst.SIMPLE_TESTS);
            return tcc.executeTestSuite(testFn, convertedSuite, testNo, testIteration);
        },

        testSimpleOrderedListsInTable: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                if (!testCase.cmd) {
                    tcc.executeCommand("insertorderedlist", testCase.cmdValue);
                }
            };
            var convertedSuite = adaptTestSuiteToOrderedList(tst.SIMPLE_TESTS);
            convertedSuite = adaptTestSuiteForTable(convertedSuite);
            return tcc.executeTestSuite(testFn, convertedSuite, testNo, testIteration);
        },

        testListIndentingInTable: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                tcc.executeCommand(testCase.cmd, testCase.cmdValue);
            };
            var convertedSuite = adaptTestSuiteForTable(tst.INDENTING_TESTS);
            return tcc.executeTestSuite(testFn, convertedSuite, testNo, testIteration);
        },

        testOrderedListIndentingInTable: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                tcc.executeCommand(testCase.cmd, testCase.cmdValue);
            };
            var convertedSuite = adaptTestSuiteToOrderedList(tst.INDENTING_TESTS);
            convertedSuite = adaptTestSuiteForTable(convertedSuite);
            return tcc.executeTestSuite(testFn, convertedSuite, testNo, testIteration);
        },

        testListsInTable: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                tcc.executeCommand(testCase.cmd, testCase.cmdValue);
            };
            return tcc.executeTestSuite(testFn, tst.LISTS_IN_TABLE_TESTS, testNo,
                    testIteration);
        },

        testOrderedListsInTable: function(testNo, testIteration) {
            var tst = CUI.rte.testing.ListCommand;
            var testFn = function(testCase) {
                tcc.executeCommand(testCase.cmd, testCase.cmdValue);
            };
            var convertedSuite = adaptTestSuiteToOrderedList(tst.LISTS_IN_TABLE_TESTS);
            return tcc.executeTestSuite(testFn, convertedSuite, testNo, testIteration);
        },

        LISTS_IN_TABLE_TESTS: [
            {
                // #0
                "html": "<table><tbody><tr><td>Cell</td></tr></tbody></table>",
                "cmd": "insertunorderedlist",
                "iterations": [
                    {
                        "result": "<table><tbody><tr><td><ul><li>Cell</li></ul></td></tr>"
                                + "</tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 4
                        }
                    }
                ]
            }, {
                // #1
                "html": "<table><tbody><tr><td>"
                        + "<p>Para 1</p><p>Para 2</p>"
                        + "</td></tr></tbody></table>",
                "cmd": "insertunorderedlist",
                "iterations": [
                    {
                        "result": "<table><tbody><tr><td>"
                                + "<ul><li>Para 1</li></ul><p>Para 2</p>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 6
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<ul><li>Para 1</li><li>Para 2</li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": 6,
                            "finalPos": 13
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<p>Para 1</p><ul><li>Para 2</li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 13
                        }
                    }
                ]
            }, {
                // #2
                "html": "<table><tbody><tr><td>"
                        + "<ul><li>Item</li></ul>"
                        + "</td></tr></tbody></table>",
                "cmd": "insertunorderedlist",
                "iterations": [
                    {
                        "result": "<table><tbody><tr><td><p>Item</p></td></tr>"
                                + "</tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 4
                        }
                    }
                ]
            }, {
                // #3
                "html": "<table><tbody><tr><td>"
                        + "<ul><li>Item</li><li>Item</li></ul>"
                        + "</td></tr></tbody></table>",
                "cmd": "insertunorderedlist",
                "iterations": [
                    {
                        "result": "<table><tbody><tr><td>"
                                + "<p>Item</p><ul><li>Item</li></ul>"
                                + "</td></tr>"
                                + "</tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 4
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<p>Item</p><p>Item</p>"
                                + "</td></tr>"
                                + "</tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 6,
                            "finalStartPos": 4,
                            "finalPos": 9
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<ul><li>Item</li></ul><p>Item</p>"
                                + "</td></tr>"
                                + "</tbody></table>",
                        "bookmarkDef": {
                            "startPos": 5,
                            "charCnt": 0,
                            "finalPos": 9
                        }
                    }
                ]
            }, {
                // #4
                "html": "<table><tbody><tr><td>"
                        + "<ul><li>Item 1</li><li>Item 2</li></ul>"
                        + "</td></tr></tbody></table>",
                "cmd": "indent",
                "iterations": [
                    {
                        "result": "<table><tbody><tr><td>"
                                + "<ul><li>Item 1</li><li>Item 2</li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": 6
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<ul><li>Item 1<ul><li>Item 2</li></ul></li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": 6,
                            "finalPos": 13
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<ul><li>Item 1<ul><li>Item 2</li></ul></li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 13
                        }
                    }
                ]
            }, {
                // #5
                "html": "<table><tbody><tr><td>"
                    + "<ul><li>Item 1<ul><li>Item 2</li></ul></li></ul>"
                    + "</td></tr></tbody></table>",
                "cmd": "outdent",
                "iterations": [
                    {
                        "result": "<table><tbody><tr><td>"
                                + "<p>Item 1</p><ul><li>Item 2</li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 0,
                            "finalPos": (com.ua.isIE ? 5 : 6)       // the well-known IE problem with nested lists ...
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<p>Item 1</p><ul><li>Item 2</li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 0,
                            "charCnt": 8,
                            "finalStartPos": (com.ua.isIE ? 5 : 6), // again, IE is special ...
                            "finalPos": 13
                        }
                    }, {
                        "result": "<table><tbody><tr><td>"
                                + "<ul><li>Item 1</li><li>Item 2</li></ul>"
                                + "</td></tr></tbody></table>",
                        "bookmarkDef": {
                            "startPos": 7,
                            "charCnt": 0,
                            "finalPos": 13
                        }
                    }
                ]
            }
        ]

    };

}();


CUI.rte.testing.Commons.registerSection("cmdLists", "Command: List");
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testSimpleLists",
        CUI.rte.testing.ListCommand.testSimpleLists);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testSimpleOrderedLists",
        CUI.rte.testing.ListCommand.testSimpleOrderedLists);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testListIndenting",
        CUI.rte.testing.ListCommand.testListIndenting);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testOrderedListIndenting",
        CUI.rte.testing.ListCommand.testOrderedListIndenting);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testSimpleListsInTable",
        CUI.rte.testing.ListCommand.testSimpleListsInTable);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testSimpleOrderedListsInTable",
        CUI.rte.testing.ListCommand.testSimpleOrderedListsInTable);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testListIndentingInTable",
        CUI.rte.testing.ListCommand.testListIndentingInTable);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testOrderedListIndentingInTable",
        CUI.rte.testing.ListCommand.testOrderedListIndentingInTable);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testListsInTable",
        CUI.rte.testing.ListCommand.testListsInTable);
CUI.rte.testing.Commons.registerTest(
        "cmdLists", "Commands.List.testOrderedListsInTable",
        CUI.rte.testing.ListCommand.testOrderedListsInTable);