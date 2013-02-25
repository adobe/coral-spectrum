CUI.rte.testing.ComponentTesting = function() {

    var com = CUI.rte.Common;

    var sel = CUI.rte.Selection;

    var tcm = CUI.rte.testing.Commons;

    var tdr = CUI.rte.DebugRegistry;

    // "Continue"-Methods ------------------------------------------------------------------

    var TIMEOUT = 5000;

    var continueInformation = null;

    var startTest = function() {
        var timeoutTc = (new Date().getTime()) + TIMEOUT;
        if (continueInformation == null) {
            continueInformation = {
                "timeoutTc": timeoutTc
            };
            return null;
        }
        continueInformation.timeoutTc = timeoutTc;
        return continueInformation;
    };

    var setCurrentData = function(charPos, charCnt) {
        continueInformation.charPos = charPos;
        continueInformation.charCnt = charCnt;
    };

    var checkContinue = function() {
        return (new Date().getTime() >= continueInformation.timeoutTc);
    };

    var endTest = function() {
        continueInformation = null;
    };


    return {

        // --- Basic stuff -----------------------------------------------------------------

        /**
         * Initializes the RTE component and sets the specified HTML content.
         * @param {String} html (optional) HTML content to be set initially
         */
        initializeComponent: function(html) {
            var comp = tcm.getRteInstance();
            comp.focus();
            var kernel = tcm.getEditorKernel();
            kernel.htmlRules.serializer.serializer = new CUI.rte.HtmlSerializer({
                "beautifier": function() {
                    return null;
                }
            });
            if (html != null) {
                comp.setValue(html);
            }
        },

        /**
         * Gets the current content of the RTE component (retrieved through the serializing
         * methods; hence the result is considered to be browser-independant).
         * @return {String} HTML content of the RTE component
         */
        getValue: function() {
            return tcm.getRteInstance().getValue();
        },

        /**
         * Gets the current content of the RTE component (using the deserializing
         * mechanisms).
         * @param {String} html HTML content of the RTE component
         */
        setValue: function(html) {
            var comp = tcm.getRteInstance();
            comp.focus();
            comp.setValue(html);
        },

        /**
         * Selects the specified characters.
         * @param {Number} startPos First character to select
         * @param {Number} charCnt Number of characters to select; 0 to set the caret's
         *        position
         */
        select: function(startPos, charCnt) {
            sel.selectBookmark(tcm.getEditContext(), {
                "startPos": startPos,
                "charCnt": charCnt
            });
        },

        /**
         * Executes the specified command on the RTE component.
         * @param {String} command The command to execute
         * @param {Object} value (optional) Parameter value for the command to execute
         */
        executeCommand: function(command, value) {
            var kernel = tcm.getEditorKernel();
            kernel.execCmd(command, value);
        },


        // --- Test case execution ---------------------------------------------------------

        /**
         * <p>Executes a single test case iteration.</p>
         * <p>A test case must have the following structure:</p>
         * <ul>
         *   <li>A <code>html</code>/String property that defines the HTML the test operates
         *     on</li>
         *   <li>A <code>iteration</code>/Object[] property that defines the iterations
         *     of the test case.</li>
         * </ul>
         * <p>An iteration is defined as a sequence of operations with different selections
         * that lead to the same resulting HTML code. Each iteration must be defined as
         * follows:</p>
         * <ul>
         *   <li>A <code>result</code>/String property that defines the expected HTML
         *     result of the iteration.</li>
         *   <li>A <code>bookmarkDef</code>/Object property that defines the bookmark(s) to
         *     be used for the iteration.</li>
         * </ul>
         * <p>The selection(s) for each iterations may be defined as follows:</p>
         * <ul>
         *   <li><code>startPos</code>/Number property that defines the (initial) first
         *     character of the selection.</li>
         *   <li><code>charCnt</code>/Number property that defines the (initial) number
         *     of characters of the selection.</li>
         *   <li><code>finalPos</code>/Number (optional) property that defines the final
         *     (initial) character of the selection. If finalPos is specified, all possible
         *     selection combinations from startPos to finalPos are tested.</li>
         * </ul>
         * @param {Function} testFn The function that contains the actual test case
         * @param {Object} testDescription The description of the test case
         * @param {Number} it The iteration to execute
         * @return {String} The result of the iteration; "testrun finished" if an invalid
         *         iteration has been specified
         */
        executeTestCaseIteration: function(testFn, testDescription, it) {
            var continueInfo = startTest();
            var tcc = CUI.rte.testing.ComponentTesting;
            tcc.initializeComponent();
            var html = testDescription.html;
            var iterations = testDescription.iterations;
            if (it >= iterations.length) {
                endTest();
                return "testrun finished";
            }
            // Function that executes a single test iteration step
            var executeIterationStep = function(expectedResult, startPos, charCnt) {
                tcc.setValue(html);
                tcc.select(startPos, charCnt);
                testFn(testDescription, iteration);
                var result = tcc.getValue();
                if (result != expectedResult) {
                    return "Test step failed (startPos: " + startPos + "; charCnt: "
                            + charCnt + "); is: " + result + "; expected: "
                            + expectedResult;
                }
                return "success";
            };
            var iteration = iterations[it];
            if (iteration.ignore === true) {
                endTest();
                return "success";
            }
            var expectedResult = iteration.result;
            var bookmarkDef = iteration.bookmarkDef;
            var startPos = bookmarkDef.startPos;
            if (continueInfo) {
                startPos = continueInfo.charPos;
            }
            var charCnt = bookmarkDef.charCnt;
            var finalPos = bookmarkDef.finalPos;
            var finalStartPos = bookmarkDef.finalStartPos;
            if (finalPos === undefined) {
                finalPos = startPos;
            }
            if (finalStartPos === undefined) {
                finalStartPos = finalPos;
            }
            var isInitialLoop = true;
            for (var charPos = startPos; charPos <= finalStartPos; charPos++) {
                var totalCharCnt = finalPos - charPos;
                var startCharCnt = charCnt - (charPos - startPos);
                if (startCharCnt < 0) {
                    startCharCnt = 0;
                }
                if (isInitialLoop) {
                    if (continueInfo) {
                        startCharCnt = continueInfo.charCnt;
                    }
                    isInitialLoop = false;
                }
                for (var stepCharCnt = startCharCnt; stepCharCnt <= totalCharCnt;
                        stepCharCnt++) {
                    setCurrentData(charPos, stepCharCnt);
                    if (checkContinue()) {
                        return "continue";
                    }
                    var result = executeIterationStep(expectedResult, charPos, stepCharCnt);
                    if (result != "success") {
                        endTest();
                        return "iteration #" + it + ": " + result;
                    }
                }
            }
            endTest();
            return result;
        },

        /**
         * <p>Executes a single test case.</p>
         * <p>A test case must have the following structure:</p>
         * <ul>
         *   <li>A <code>html</code>/String property that defines the HTML the test operates
         *     on</li>
         *   <li>A <code>iteration</code>/Object[] property that defines the iterations
         *     of the test case.</li>
         * </ul>
         * <p>An iteration is defined as a sequence of operations with different selections
         * that lead to the same resulting HTML code. Each iteration must be defined as
         * follows:</p>
         * <ul>
         *   <li>A <code>result</code>/String property that defines the expected HTML
         *     result of the iteration.</li>
         *   <li>A <code>bookmarkDef</code>/Object property that defines the bookmark(s) to
         *     be used for the iteration.</li>
         * </ul>
         * <p>The selection(s) for each iterations may be defined as follows:</p>
         * <ul>
         *   <li><code>startPos</code>/Number property that defines the (initial) first
         *     character of the selection.</li>
         *   <li><code>charCnt</code>/Number property that defines the (initial) number
         *     of characters of the selection.</li>
         *   <li><code>finalPos</code>/Number (optional) property that defines the final
         *     (initial) character of the selection. If finalPos is specified, all possible
         *     selection combinations from startPos to finalPos are tested.</li>
         * </ul>
         * @param {Function} testFn The function that contains the actual test case
         * @param {Object} testDescription The description of the test case
         * @param {Number} it (optional) The test iteration to be executed. If none is
         *        specified, all test iterations are executed asynchroneously.
         * @return {String} The result of the iteration; "finished" if an invalid test case
         *         has been specified
         */
        executeTestCase: function(testFn, testDescription, it, finishFn) {
            var tst = CUI.rte.testing.ComponentTesting;
            if (it !== undefined) {
                return tst.executeTestCaseIteration(testFn, testDescription, it);
            }
            it = 0;
            var asyncFn = function() {
                if (it < testDescription.iterations.length) {
                    var result = tst.executeTestCaseIteration(testFn, testDescription, it);
                    if (result == "continue") {
                        CUI.rte.Utils.defer(asyncFn, 1);
                    } else if (result == "success") {
                        it++;
                        CUI.rte.Utils.defer(asyncFn, 1);
                    } else {
                        if (finishFn) {
                            finishFn(false, result);
                        } else {
                            tdr.notifyDeferredError(result);
                        }
                    }
                } else {
                    if (finishFn) {
                        finishFn(true);
                    } else {
                        tdr.notifyDeferredSuccess();
                    }
                }
            };
            CUI.rte.Utils.defer(asyncFn, 1);
            return "deferred";
        },

        /**
         * <p>Executes an entire test suite.</p>
         * <p>The tests are specified as an array of test cases. Each of the test cases
         * must have the following structure:</p>
         * <ul>
         *   <li>A <code>html</code>/String property that defines the HTML the test operates
         *     on</li>
         *   <li>A <code>iteration</code>/Object[] property that defines the iterations
         *     of the test case.</li>
         * </ul>
         * <p>An iteration is defined as a sequence of operations with different selections
         * that lead to the same resulting HTML code. Each iteration must be defined as
         * follows:</p>
         * <ul>
         *   <li>A <code>result</code>/String property that defines the expected HTML
         *     result of the iteration.</li>
         *   <li>A <code>bookmarkDef</code>/Object property that defines the bookmark(s) to
         *     be used for the iteration.</li>
         * </ul>
         * <p>The selection(s) for each iterations may be defined as follows:</p>
         * <ul>
         *   <li><code>startPos</code>/Number property that defines the (initial) first
         *     character of the selection.</li>
         *   <li><code>charCnt</code>/Number property that defines the (initial) number
         *     of characters of the selection.</li>
         *   <li><code>finalPos</code>/Number (optional) property that defines the final
         *     (initial) character of the selection. If finalPos is specified, all possible
         *     selection combinations from startPos to finalPos are tested.</li>
         * </ul>
         * @param {Function} testFn The function that contains the actual test case
         * @param {Object} testDescriptions Array with test cases
         * @param {Number} test (optional) The number of the test case to be executed; if
         *        none is specified, all test cases of the suite are being executed
         * @return {String} The result of the iteration; "finished" if an invalid test
         *         number has been specified
         */
        executeTestSuite: function(testFn, testDescriptions, test, it) {
            var tst = CUI.rte.testing.ComponentTesting;
            var testCnt = testDescriptions.length;
            if (test !== undefined) {
                if (test >= testCnt) {
                   return "finished";
                }
                var result = tst.executeTestCase(testFn, testDescriptions[test], it);
                if ((result != "success")
                        && (result != "continue")
                        && (result != "deferred")
                        && (result != "finished")
                        && (result != "testrun finished")) {
                    result = "test case #" + test + ", " + result;
                }
                return result;
            }
            test = 0;
            var continueFn = function(isSuccess, result) {
                if (isSuccess) {
                    test++;
                    if (test < testCnt) {
                        CUI.rte.Utils.defer(asyncSuiteFn, 1);
                    } else {
                        tdr.notifyDeferredSuccess();
                    }
                } else {
                    tdr.notifyDeferredError("test case #" + test + ", " + result);
                }
            };
            var asyncSuiteFn = function() {
                tst.executeTestCase(testFn, testDescriptions[test], undefined, continueFn);
            };
            CUI.rte.Utils.defer(asyncSuiteFn, 1);
            return "deferred";
        }

    };

}();
