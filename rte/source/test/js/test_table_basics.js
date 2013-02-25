CUI.rte.testing.TableBasicsTests = function() {

    var tcm = CUI.rte.testing.Commons;

    var com = CUI.rte.Common;

    var NBSP = String.fromCharCode(160);

    var EMPTY_CELL = "<td>" + (com.ua.isGecko ? "<br>" : "") + "</td>";

    return {

        /**
         * Tests setting the RichText's setValue method (incl. HTML conversion)
         * @param {Number} testNo Number of testcase
         * @return {String} "success" if the value has been set successfully; "finished" if
         *         an invalid test number was specified; else a suitable error message
         */
        testSetValue: function(testNo) {
            var tcm = CUI.rte.testing.Commons;
            var tst = CUI.rte.testing.TableBasicsTests;
            if (testNo == null) {
                testNo = 0;
            }
            if (testNo >= tst.SETVALUE_TEST_HTML.length) {
                return "finished";
            }
            var rte = tcm.getRteInstance();
            rte.setValue(tst.SETVALUE_TEST_HTML[testNo]);
            var rteHtml = tcm.getRawEditorContent();
            var expectedHtml = tcm.recreateThroughDom(tst.SETVALUE_RESULT_HTML[testNo]);
            return (tcm.compareHTML(expectedHtml, rteHtml, true) ? "success"
                    : "Invalid HTML; is: "+ rteHtml + "; expected: " + expectedHtml);
        },

        SETVALUE_TEST_HTML: [
            "<table cellspacing=\"2\" cellpadding=\"2\" border=\"2\"><tbody>"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr>"
                    + "</tbody></table>",
            ""
        ],

        SETVALUE_RESULT_HTML: [
            "<table cellspacing=\"2\" cellpadding=\"2\" border=\"2\"><tbody>"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr>"
                    + "</tbody></table>",
            "<table cellspacing=\"0\" cellpadding=\"1\" border=\"1\" width=\"100%\"><tbody>"
                    + "<tr>" + EMPTY_CELL + EMPTY_CELL + EMPTY_CELL + "</tr>"
                    + "<tr>" + EMPTY_CELL + EMPTY_CELL + EMPTY_CELL + "</tr>"
                    + "</tbody></table>"
        ],


        /**
         * Tests setting the RichText's setValue method (incl. HTML conversion)
         * @param {Number} testNo Number of testcase
         * @return {String} "success" if the value has been set successfully; "finished" if
         *         an invalid test number was specified; else a suitable error message
         */
        testGetValue: function(testNo) {
            var tcm = CUI.rte.testing.Commons;
            var tst = CUI.rte.testing.TableBasicsTests;
            if (testNo == null) {
                testNo = 0;
            }
            if (testNo >= tst.GETVALUE_TEST_HTML.length) {
                return "finished";
            }
            var rte = tcm.getRteInstance();
            var testDef = tst.GETVALUE_TEST_HTML[testNo];
            var testHtml = testDef;
            var bth = null;
            if (typeof(testDef) != "string") {
                testHtml = testDef.html;
                bth = testDef.blockHandling;
            }
            tcm.getEditorKernel().htmlRules.blockHandling =
                new CUI.rte.HtmlRules.BlockHandling(bth);
            rte.setValue(testHtml);
            var rteHtml = rte.getValue();
            var expectedHtml = tst.GETVALUE_RESULT_HTML[testNo];
            return (tcm.compareHTML(expectedHtml, rteHtml, true) ? "success"
                    : "Invalid HTML; is: "+ rteHtml + "; expected: " + expectedHtml);
        },

        GETVALUE_TEST_HTML: [
            "<table cellspacing=\"2\" cellpadding=\"2\" border=\"2\"><tbody>"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr>"
                    + "</tbody></table>",
            ""
        ],

        GETVALUE_RESULT_HTML: [
            "<table cellspacing=\"2\" cellpadding=\"2\" border=\"2\"><tbody>"
                    + "<tr><td>Cell 1</td><td>Cell 2</td></tr>"
                    + "<tr><td>Cell 3</td><td>Cell 4</td></tr>"
                    + "</tbody></table>",
            ""
        ]

    };

}();

CUI.rte.testing.Commons.registerSection("tableBasics", "Table basic processing");
CUI.rte.testing.Commons.registerTest(
        "tableBasics", "TableBasics.testSetValue",
        CUI.rte.testing.TableBasicsTests.testSetValue);
CUI.rte.testing.Commons.registerTest(
        "tableBasics", "TableBasics.testGetValue",
        CUI.rte.testing.TableBasicsTests.testGetValue);
