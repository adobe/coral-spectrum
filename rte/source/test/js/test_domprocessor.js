CUI.rte.testing.DomProcessing = function() {

    var tcm = CUI.rte.testing.Commons;

    var com = CUI.rte.Common;

    var dpr = CUI.rte.DomProcessor;

    var pasteRulesAllowedAttribs = {
        "*": [
            "class"
        ],
        "table": [
            "width", "height", "cellspacing", "cellpadding", "border"
        ],
        "td": [
            "width", "height", "colspan", "rowspan", "valign"
        ],
        "a": [
            "href", "name", "title", "alt"
        ],
        "img": [
            "src", "title", "alt", "width", "height"
        ],
        "ul": [
            "type"
        ],
        "ol": [
            "type"
        ]
    };

    var anchorSubstPre = "<img src=\"img/spacer.png\" " + com.A_NAME_REPLACEMENT_ATTRIB
            + "=\"";

    var anchorSubstPost = "\" class=\"" + CUI.rte.Theme.ANCHOR_CLASS + "\">";

    var createPlaceholderBr = function() {
        if (com.ua.isIE) {
            return "";
        }
        return "<br " + com.BR_TEMP_ATTRIB + "=\"brEOB\">";
    };

    var createEmptyParaResult = function() {
        if (com.ua.isIE) {
            return "<p></p>";
        }
        if (com.ua.isWebKit || com.ua.isGecko) {
            return "<p>" + createPlaceholderBr() + "</p>";
        }
        return "<p>&nbsp;</p>";
    };

    var addToStats = function(node, tagStats) {
        if (node.nodeType == 3) {
            return;
        }
        var tagName = node.tagName.toLowerCase();
        if (tagStats[tagName] == null) {
            tagStats[tagName] = [ ];
        }
        tagStats[tagName].push(node);
    };

    var createNodeDef = function(node, tagStats) {
        if (node.nodeType == 3) {
            return node.nodeValue;
        }
        var tagName = node.tagName.toLowerCase();
        if (tagStats[tagName] == null) {
            return "<" + tagName + "[]";
        }
        var tagIndex = com.arrayIndex(tagStats[tagName], node);
        if (tagIndex < 0) {
            return "<" + tagName + "[]";
        }
        return "<" + tagName + "[" + tagIndex + "]";
    };

    return {

        testBlockDetection: function() {
            var span = document.createElement("span");
            var context = tcm.createFakeEditContext(span);
            var tst = CUI.rte.testing.DomProcessing;
            var testCnt = tst.BLOCKDET_TEST_HTML.length;
            for (var t = 0; t < testCnt; t++) {
                var testHtml = tst.BLOCKDET_TEST_HTML[t];
                var expectedStarts = tst.BLOCKDET_TEST_BLOCKSTARTS[t];
                var expectedEnds = tst.BLOCKDET_TEST_BLOCKENDS[t];
                span.innerHTML = testHtml;
                var tagStats = { };
                var node = span;
                while (node != null) {
                    node = com.getNextNode(context, node);
                    if (node == null) {
                        break;
                    }
                    addToStats(node, tagStats);
                    var nodeDef = createNodeDef(node, tagStats);
                    var isExpectedBlockStart = com.arrayContains(expectedStarts, nodeDef);
                    var offs = (node.nodeType == 1 ? null : 0);
                    var isBlockStart = dpr.isBlockStart(context, node, 0);
                    if (isBlockStart !== isExpectedBlockStart) {
                        return "Invalid block start state: is: " + isBlockStart
                                + "; expected: " + isExpectedBlockStart + "; node: "
                                + com.dumpNodeRecursively(node) + "; HTML: " + testHtml;
                    }
                    var isExpectedBlockEnd = com.arrayContains(expectedEnds, nodeDef);
                    offs = (node.nodeType == 1 ? null : node.nodeValue.length);
                    var isBlockEnd = dpr.isBlockEnd(context, node, offs);
                    if (isBlockEnd !== isExpectedBlockEnd) {
                        return "Invalid block end state: is: " + isBlockEnd
                                + "; expected: " + isExpectedBlockEnd+ "; node: "
                                + com.dumpNodeRecursively(node) + "; HTML: " + testHtml;
                    }
                }
            }
            return "success";
        },

        BLOCKDET_TEST_HTML: [
            "<p>Hello <i>dear</i> world</p>",
            "<p><b>Hello <i>dear</i></b> <u>world</u></p>",
            "<p>Hello <i>dear</i> world</p>"
                    + "<p>Nice place to stay</p>",
            "<p>Line 1<br>Line 2</p><p><br></p>",
            "<p><b>Line 1<br>Line 2</b></p>"
        ],

        BLOCKDET_TEST_BLOCKSTARTS: [
            [
                "Hello "
            ], [
                "<b[0]",
                "Hello "
            ], [
                "Hello ",
                "Nice place to stay"
            ], [
                "Line 1",
                "<br[1]"
            ], [
                "<b[0]",
                "Line 1"
            ]
        ],

        BLOCKDET_TEST_BLOCKENDS: [
            [
                " world"
            ], [
                "world",
                "<u[0]"
            ], [
                " world",
                "Nice place to stay"
            ], [
                "Line 2",
                "<br[1]"
            ], [
                "Line 2",
                "<b[0]"
            ]
        ],

        testWhitespaceProcessor: function(testIndex) {
            var wsp = CUI.rte.WhitespaceProcessor;
            var tst = CUI.rte.testing.DomProcessing;
            var root = document.createElement("span");
            var expectedRoot = document.createElement("span");
            var context = tcm.createFakeEditContext(root);
            var testCnt = tst.WHITESPACE_HTMLS.length;
            var s = 0;
            var e = testCnt;
            if (testIndex != null) {
                s = parseInt(testIndex);
                if (s >= testCnt) {
                    return "invalid";
                }
                e = parseInt(testIndex) + 1;
            }
            for (var t = s; t < e; t++) {
                // window.console.log("#" + t + " -------");
                com.removeAllChildren(root);
                com.removeAllChildren(expectedRoot);
                var html = tst.WHITESPACE_HTMLS[t];
                if (html.indexOf("<!--") >= 0) {
                    root.innerHTML = html;
                } else {
                    tcm.createDom(context, root, html);
                }
                // com.ieLog(root.innerHTML, true);  // -- use this to check if IE does some preprocessing on the provided HTML if a test fails in IE, but passes on Gecko
                wsp.process(context, root);
                var expectedResult = tst.WHITESPACE_RESULTS[t];
                tcm.createDom(context, expectedRoot, expectedResult);
                expectedResult = tcm.recreateThroughDom(expectedResult);
                if (!tcm.compareSubTree(expectedRoot, root)) {
                    /*
                    if (console.log) {
                        console.log(CQ.Ext.isGecko ? root : com.dumpNodeRecursively(root));
                        console.log(CQ.Ext.isGecko ? expectedRoot
                                : com.dumpNodeRecursively(expectedRoot));
                    }
                    */
                    return "Error in whitespace processing test #" + t + "; is: "
                        + root.innerHTML + "; expected: " + expectedResult;
                }
            }
            return "success";
        },

        WHITESPACE_HTMLS: [
            // basic test cases
            "<p>Hello world!</p>",
            "<p>Hello   world!</p>",
            "<p> Hello  world!   </p>",
            "<p>\t\n\rHello\n\nworld!\r\r\r</p>",
            "<p>Hello <b>dear</b>  world!</p>",
            "<p>Hello <b> dear </b> world!</p>",
            "<p>Hello   <b>    dear   </b>    world!</p>",
            "<p>  Hello, <b>  <i>  dear</i>  </b><i>  world</i>!</p>",
            "<p>Hello <img src=\"something.png\"> world!</p>",
            "<p>Hello   <img src=\"something.png\">    world!</p>",
            "<p>  Test for</p><pre>pre\n  formatted\ntext</pre>",
            "<p>1</p><p>  2 </p><p>    </p>",
            // more complex test cases
            "<p>  Before </p><table>  <tbody>  <tr>  <td>   Cell  content   </td>   </tr> "
                    + "</tbody>  </table>"
                    + "<p>   After   </p>",
            "<ul>\n\n<li> Item 1  </li>\n<li>Item  2</li>\n\n</ul>\n\n\n",
            "<p>  Before </p>\n\n"
                    + "<table> <tbody>   <tr>  <td>   <p>   Cell  content </p>  "
                    + "<p>   Para 2</p>  </td> \n</tr>\n\n</tbody>\n</table>"
                    + "<p>   After   </p>",
            "<p>Mixed</p>mode<p>testing</p>",
            "<p>Mixed</p>  mode  <p>testing</p>",
            "<p> Mixed  </p>  mode  <p>testing</p>",
            "<p>Mixed</p>  mode  <p>   testing </p>",
            "<p>Mixed</p>  m<b>od</b>e  <p>   testing </p>",
            "<p>Mixed</p>  m <b>od</b> e  <p>   testing </p>",
            "<p>Test with <!-- a comment --> inside</p>",
            "  no block at all  ",
            "  <!-- a comment only -->  ",
            "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">"
                    + "<meta name=\"ProgId\" content=\"Word.Document\">"
                    + "<meta name=\"Generator\" content=\"Microsoft Word 12\">"
                    + "<meta name=\"Originator\" content=\"Microsoft Word 12\">"
                    + "<link rel=\"File-List\" href=\"file:///clip_filelist.xml\">"
                    + "<link rel=\"Edit-Time-Data\" href=\"file:///clip_editdata.mso\">"
                    + "<link rel=\"themeData\" href=\"file:///clip_themedata.thmx\">"
                    + "<link rel=\"colorSchemeMapping\" href=\"file:///clip_colorschememapping.xml\">"
                    + "<style><!-- /* Font Definitions */ @font-face {"
                        + "font-family:Wingdings; panose-1:5 0 0 0 0 0 0 0 0 0; "
                        + "mso-font-charset:2; mso-generic-font-family:auto; "
                        + "mso-font-pitch:variable; mso-font-signature:0 268435456 0 0 -2147483648 0;} "
                        + "@font-face {font-family:\"Cambria Math\"; panose-1:2 4 5 3 5 4 6 3 2 4; "
                        + "mso-font-charset:0; mso-generic-font-family:roman; mso-font-pitch:variable; "
                        + "mso-font-signature:-1610611985 1107304683 0 0 159 0;} "
                        + "@font-face {font-family:Verdana; panose-1:2 11 6 4 3 5 4 4 2 4; "
                        + "mso-font-charset:0; mso-generic-font-family:swiss; mso-font-pitch:variable; "
                        + "mso-font-signature:536871559 0 0 0 415 0;} /* Style Definitions */ "
                        + "p.MsoNormal, li.MsoNormal, div.MsoNormal {mso-style-unhide:no; "
                        + "mso-style-qformat:yes; mso-style-parent:\"\"; margin:0in; "
                        + "margin-bottom:.0001pt; mso-pagination:widow-orphan; font-size:12.0pt; "
                        + "font-family:\"Times New Roman\",\"serif\"; "
                        + "mso-fareast-font-family:\"Times New Roman\"; "
                        + "mso-ansi-language:EN-GB; mso-fareast-language:EN-GB;} a:link, "
                        + "span.MsoHyperlink {mso-style-unhide:no; color:blue; "
                        + "text-decoration:underline; text-underline:single;} a:visited, "
                        + "span.MsoHyperlinkFollowed {mso-style-noshow:yes; "
                        + "mso-style-priority:99; color:purple; mso-themecolor:followedhyperlink; "
                        + "text-decoration:underline; text-underline:single;} "
                        + ".MsoChpDefault {mso-style-type:export-only; mso-default-props:yes; "
                        + "font-size:10.0pt; mso-ansi-font-size:10.0pt; mso-bidi-font-size:10.0pt;} "
                        + "@page Section1 {size:595.3pt 841.9pt; margin:43.65pt 43.65pt 43.65pt 43.65pt; "
                        + "mso-header-margin:35.45pt; mso-footer-margin:35.45pt; mso-paper-source:15;} "
                        + "div.Section1 {page:Section1;} /* List Definitions */ @list l0 {mso-list-id:771701526; "
                        + "mso-list-template-ids:-703307310;} @list l0:level1 {mso-level-number-format:bullet; "
                        + "mso-level-text:?; mso-level-tab-stop:.5in; mso-level-number-position:left; "
                        + "text-indent:-.25in; mso-ansi-font-size:10.0pt; font-family:Symbol;} "
                        + "ol {margin-bottom:0in;} ul {margin-bottom:0in;} --></style>"
                        + "<p><b>Partnership Swimming Club - Future Event</b></p>",
                    "<p>Text with<br>\n<br>\nlinefeeds</p>",
            "<ul id=\"anchorButtons\">\n"
                    + "<li><a\n"
                    + "class=\"contentButton\" href=\"#why\" title=\"Why do I need it?\">Why do I need\n"
                    + "it?</a></li>\n"
                    + "<li><a\n"
                    + "class=\"contentButton\"\n"
                    + "href=\"#how\" title=\"How do I do it?\">How do I do it?</a></li>\n"
                    + "<li><a class=\"contentButton\" href=\"#what\" title=\"What do I need?\">What do I\n"
                    + "need?</a></li>\n"
                    + "</ul>\n"
        ],

        WHITESPACE_RESULTS: [
            // basic test cases
            "<p>Hello world!</p>",
            "<p>Hello world!</p>",
            "<p>Hello world!</p>",
            "<p>Hello world!</p>",
            "<p>Hello <b>dear</b> world!</p>",
            "<p>Hello <b>dear</b> world!</p>",
            "<p>Hello <b>dear</b> world!</p>",
            "<p>Hello, <b><i>dear</i> </b><i>world</i>!</p>",
            "<p>Hello <img src=\"something.png\"> world!</p>",
            "<p>Hello <img src=\"something.png\"> world!</p>",
            "<p>Test for</p><pre>pre\n  formatted\ntext</pre>",
            "<p>1</p><p>2</p><p></p>",
            // more complex test cases
            "<p>Before</p><table><tbody><tr><td>Cell content</td></tr></tbody></table>"
                    + "<p>After</p>",
            "<ul><li>Item 1</li><li>Item 2</li></ul>",
            "<p>Before</p>"
                    + "<table><tbody><tr><td><p>Cell content</p><p>Para 2</p></td></tr>"
                        + "</tbody></table>"
                    + "<p>After</p>",
            "<p>Mixed</p>mode<p>testing</p>",
            "<p>Mixed</p>mode<p>testing</p>",
            "<p>Mixed</p>mode<p>testing</p>",
            "<p>Mixed</p>mode<p>testing</p>",
            "<p>Mixed</p>m<b>od</b>e<p>testing</p>",
            "<p>Mixed</p>m <b>od</b> e<p>testing</p>",
            "<p>Test with inside</p>",
            "no block at all",
            "",
            "<p><b>Partnership Swimming Club - Future Event</b></p>",
            "<p>Text with<br><br>linefeeds",
            "<ul id=\"anchorButtons\">"
                    + "<li><a "
                    + "class=\"contentButton\" href=\"#why\" title=\"Why do I need it?\">Why do I need "
                    + "it?</a></li>"
                    + "<li><a "
                    + "class=\"contentButton\" "
                    + "href=\"#how\" title=\"How do I do it?\">How do I do it?</a></li>"
                    + "<li><a class=\"contentButton\" href=\"#what\" title=\"What do I need?\">What do I "
                    + "need?</a></li>"
                    + "</ul>"
        ],

        testDomCleanupPreprocess: function() {
            var tst = CUI.rte.testing.DomProcessing;
            var htmls = tst.DOM_CLEANUP_PREPROCESS;
            var results = tst.DOM_CLEANUP_PREPROCESS_RESULTS;
            var testCnt = htmls.length;
            var kernel = tcm.getEditorKernel();
            var context = kernel.getEditContext();
            var root = context.root;
            // simple testcases
            var cleanupInstance = new CUI.rte.DomCleanup({
                "tagsToRemove": [
                    "font"
                ]
            });
            for (var t = 0; t < testCnt; t++) {
                var html = htmls[t];
                var expectedResult = tcm.recreateThroughDom(results[t]);
                root.innerHTML = html;
                cleanupInstance.preprocess(kernel, root);
                var result = tcm.postProcessInnerHTML(root.innerHTML);
                if (result != expectedResult) {
                    return "Error in DOM cleanup preprocessing test #" + t + "; is: "
                            + result + "; expected: " + expectedResult;
                }
            }
            // testcases dependant on specific HTML rules
            htmls = tst.DOM_CLEANUP_PREPROCESS_RULEBASED;
            results = tst.DOM_CLEANUP_PREPROCESS_RULEBASED_RESULTS;
            var rules = tst.DOM_CLEANUP_LINK_RULES;
            var ruleCnt = rules.length;
            testCnt = htmls.length;
            for (t = 0; t < testCnt; t++) {
                html = htmls[t];
                for (var r = 0; r < ruleCnt; r++) {
                    var rule = rules[r];
                    expectedResult = tcm.recreateThroughDom(results[t][r]);
                    kernel.htmlRules = rule;
                    root.innerHTML = html;
                    cleanupInstance.preprocess(kernel, root);
                    result = tcm.postProcessInnerHTML(root.innerHTML);
                    if (result != expectedResult) {
                        return "Error in DOM cleanup preprocessing test #" + t + " for "
                                + "rule set #" + r + "; is: " + result + "; expected: "
                                + expectedResult;
                    }
                }
            }
            return "success";
        },

        DOM_CLEANUP_PREPROCESS: [
            "<font face=\"sans-serif\">Font tag</font>",
            "<p align=\"center\">Centered paragraph</p>",
            "<table border=\"0\"><tbody><tr><td>Table cell</td></tr></tbody></table>",
            "<a name=\"test\"></a>Anchored text",
            "<a name=\"test\">Nested anchored text</a>",
            "<span style=\"font-weight: bold;\">Bold text</span>",
            "<span style=\"font-weight: bold; font-style: italic;\">Bolditalic text</span>",
            "",
            "<p>Pre text</p><pre>Preformatted text</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text\nwith lf</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text\n\nwith blank line</pre>"
                        + "<p>Post text</p>",
            "<p>Pre text</p><pre>Indent\n  2 chars\n    4 chars</pre><p>Post text</p>",
            "<pre>\nPreformatted\n  text\n</pre>",
            "<pre>\nPreformatted\n  text\n\n</pre>"
        ],

        DOM_CLEANUP_PREPROCESS_RESULTS: [
            "<p>Font tag</p>",
            "<p style=\"text-align: center;\">Centered paragraph</p>",
            "<table border=\"0\" class=\"" + CUI.rte.Theme.TABLE_NOBORDER_CLASS + "\">"
                    + "<tbody><tr><td>Table cell</td></tr></tbody></table>",
            (!com.ua.isWebKit ? "<p><a class=\"" + CUI.rte.Theme.ANCHOR_CLASS
                        + "\" name=\"test\"></a>Anchored text</p>"
                    : "<p>" + anchorSubstPre + "test" + anchorSubstPost
                        + "Anchored text</p>"),
            (!com.ua.isWebKit ? "<p><a class=\"" + CUI.rte.Theme.ANCHOR_CLASS
                        + "\" name=\"test\"></a>Nested anchored text</p>"
                    : "<p>" + anchorSubstPre + "test" + anchorSubstPost
                        + "Nested anchored text</p>"),
            "<p><b>Bold text</b></p>",
            "<p><b><i>Bolditalic text</i></b></p>",
            createEmptyParaResult(),
            "<p>Pre text</p><pre>Preformatted text</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text<br>with lf</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text<br><br>with blank line</pre>"
                    + "<p>Post text</p>",
            "<p>Pre text</p><pre>Indent<br>  2 chars<br>    4 chars</pre><p>Post text</p>",
            "<pre>Preformatted<br>  text</pre>",
            "<pre>Preformatted<br>  text<br>" + createPlaceholderBr() + "</pre>"
        ],

        DOM_CLEANUP_LINK_RULES: [
            new CUI.rte.HtmlRules({
                "links": {
                    "cssMode": "auto",
                    "cssInternal": "internal",
                    "cssExternal": "external",
                    "protocols": [ "http://" ],
                    "defaultProtocol": "http://"
                }
            }),
            new CUI.rte.HtmlRules({
                "links": {
                    "cssMode": "keep",
                    "protocols": [ "http://" ],
                    "defaultProtocol": "http://",
                    "targetConfig": {
                        "mode": "auto",
                        "targetInternal": null,
                        "targetExternal": "_blank"
                    }
                }
            }),
            new CUI.rte.HtmlRules({
                "links": {
                    "cssMode": "auto",
                    "protocols": [ "http://", "ftp://", "mailto:" ],
                    "defaultProtocol": "http://"
                }
            })
        ],

        DOM_CLEANUP_PREPROCESS_RULEBASED: [
            "<a href=\"http://www.external.com\">External link</a>",
            "<a href=\"/content/geo/en/services.html\" " + com.HREF_ATTRIB
                    + "=\"/content/geo/en/services.html\">Internal link</a>",
            "<a href=\"/content/geo/en/services.html\">Internal link</a>",
            "<a href=\"ftp://ftp.company.com/path/to/file.pdf\">Protocol</a>",
            "<a href=\"mailto:user@company.com\">Protocol</a>"
        ],

        DOM_CLEANUP_PREPROCESS_RULEBASED_RESULTS: (!com.ua.isWebKit ? [
                    [
                        "<p><a class=\"external\" href=\"http://www.external.com\">"
                            + "External link</a></p>",
                        "<p><a target=\"_blank\" href=\"http://www.external.com\">"
                            + "External link</a></p>",
                        "<p><a href=\"http://www.external.com\">External link</a></p>"
                    ], [
                        "<p><a class=\"internal\" href=\"/content/geo/en/services.html\" "
                            + com.HREF_ATTRIB + "=\"/content/geo/en/services.html\">"
                            + "Internal link</a></p>",
                        "<p><a href=\"/content/geo/en/services.html\" "
                            + com.HREF_ATTRIB + "=\"/content/geo/en/services.html\">"
                            + "Internal link</a></p>",
                        "<p><a href=\"/content/geo/en/services.html\" "
                            + com.HREF_ATTRIB + "=\"/content/geo/en/services.html\">"
                            + "Internal link</a></p>"
                    ], [
                        "<p><a class=\"internal\" href=\"/content/geo/en/services.html\">"
                            + "Internal link</a></p>",
                        "<p><a href=\"/content/geo/en/services.html\">Internal link</a>"
                            + "</p>",
                        "<p><a href=\"/content/geo/en/services.html\">Internal link</a></p>"
                    ], [
                        "<p>Protocol</p>",
                        "<p>Protocol</p>",
                        "<p><a href=\"ftp://ftp.company.com/path/to/file.pdf\">Protocol"
                            + "</a></p>"
                    ], [
                        "<p>Protocol</p>",
                        "<p>Protocol</p>",
                        "<p><a href=\"mailto:user@company.com\">Protocol</a></p>"
                    ]
                ] : [
                    // Webkit sorts attributes differently on links, so provide the
                    // correct results for Webkit separately
                    [
                        "<p><a href=\"http://www.external.com\" class=\"external\">"
                            + "External link</a></p>",
                        "<p><a href=\"http://www.external.com\" target=\"_blank\">"
                            + "External link</a></p>",
                        "<p><a href=\"http://www.external.com\">External link</a></p>"
                    ], [
                        "<p><a href=\"/content/geo/en/services.html\" "
                            + com.HREF_ATTRIB + "=\"/content/geo/en/services.html\" "
                            + "class=\"internal\">Internal link</a></p>",
                        "<p><a href=\"/content/geo/en/services.html\" "
                            + com.HREF_ATTRIB + "=\"/content/geo/en/services.html\">"
                            + "Internal link</a></p>",
                        "<p><a href=\"/content/geo/en/services.html\" "
                            + com.HREF_ATTRIB + "=\"/content/geo/en/services.html\">"
                            + "Internal link</a></p>"
                    ], [
                        "<p><a href=\"/content/geo/en/services.html\" class=\"internal\">"
                            + "Internal link</a></p>",
                        "<p><a href=\"/content/geo/en/services.html\">Internal link</a>"
                            + "</p>",
                        "<p><a href=\"/content/geo/en/services.html\">Internal link</a></p>"
                    ], [
                        "<p>Protocol</p>",
                        "<p>Protocol</p>",
                        "<p><a href=\"ftp://ftp.company.com/path/to/file.pdf\">Protocol"
                            + "</a></p>"
                    ], [
                        "<p>Protocol</p>",
                        "<p>Protocol</p>",
                        "<p><a href=\"mailto:user@company.com\">Protocol</a></p>"
                    ]
                ]),

        testDomCleanupPostprocess: function() {
            var tst = CUI.rte.testing.DomProcessing;
            var htmls = tst.DOM_CLEANUP_POSTPROCESS;
            var results = tst.DOM_CLEANUP_POSTPROCESS_RESULTS;
            var testCnt = htmls.length;
            var kernel = tcm.getEditorKernel();
            var context = kernel.getEditContext();
            var root = context.root;
            // simple testcases
            var cleanupInstance = new CUI.rte.DomCleanup({
                "tagsToRemove": [
                    "font"
                ]
            });
            for (var t = 0; t < testCnt; t++) {
                var html = htmls[t];
                var expectedResult = results[t];
                expectedResult = tcm.recreateThroughDom(expectedResult);
                root.innerHTML = html;
                // need to clone here, as FF >= 6 is stubbornly adding <br>'s instantly
                // after the empty block is removed; in production code, the method is
                // always executed on a cloned structure, so the testcase remains valid
                // (or is more valid than before ...)
                var clonedRoot = root.cloneNode(true);
                cleanupInstance.postprocess(kernel, clonedRoot);
                var result = tcm.recreateThroughDom(clonedRoot.innerHTML);
                if (result != expectedResult) {
                    return "Error in DOM cleanup postprocessing test #" + t + "; is: "
                        + result + "; expected: " + expectedResult;
                }
            }
            // testcases dependant on specific HTML rules
            htmls = tst.DOM_CLEANUP_POSTPROCESS_RULEBASED;
            results = tst.DOM_CLEANUP_POSTPROCESS_RULEBASED_RESULTS;
            var rules = tst.DOM_CLEANUP_SERIALIZER_RULES;
            var ruleCnt = rules.length;
            testCnt = htmls.length;
            for (t = 0; t < testCnt; t++) {
                html = htmls[t];
                for (var r = 0; r < ruleCnt; r++) {
                    var rule = rules[r];
                    expectedResult = tcm.recreateThroughDom(results[t][r]);
                    kernel.htmlRules = rule;
                    root.innerHTML = html;
                    clonedRoot = root.cloneNode(true);
                    cleanupInstance.postprocess(kernel, clonedRoot);
                    result = clonedRoot.innerHTML;
                    if (result != expectedResult) {
                        return "Error in DOM cleanup preprocessing test #" + t + " for "
                                + "rule set #" + r + "; is: " + result + "; expected: "
                                + expectedResult;
                    }
                }
            }
            return "success";
        },

        DOM_CLEANUP_POSTPROCESS: [
            "<table border=\"0\" class=\"" + CUI.rte.Theme.TABLE_NOBORDER_CLASS + "\">"
                    + "<tbody><tr><td>Table cell</td></tr></tbody></table>",
            (!com.ua.isWebKit
                    ? "<a class=\"" + CUI.rte.Theme.ANCHOR_CLASS + "\" name=\"test\">"
                        + "</a>Anchored text"
                    : anchorSubstPre + "test" + anchorSubstPost + "Anchored text"),
            (com.ua.isIE ? "<p></p>" : "<p><br></p>"),
            "<p>Pre text</p><pre>Preformatted text</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text<br>with lf</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text<br><br>with blank line</pre>"
                    + "<p>Post text</p>",
            "<p>Pre text</p><pre>Indent<br>  2 chars<br>    4 chars</pre><p>Post text</p>"
        ],

        DOM_CLEANUP_POSTPROCESS_RESULTS: [
            "<table border=\"0\"><tbody><tr><td>Table cell</td></tr></tbody></table>",
            "<a name=\"test\"></a>Anchored text",
            "",
            "<p>Pre text</p><pre>Preformatted text</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text\nwith lf</pre><p>Post text</p>",
            "<p>Pre text</p><pre>Preformatted text\n\nwith blank line</pre>"
                        + "<p>Post text</p>",
            "<p>Pre text</p><pre>Indent\n  2 chars\n    4 chars</pre><p>Post text</p>"
        ],

        DOM_CLEANUP_SERIALIZER_RULES: [
            new CUI.rte.HtmlRules({
                "docType": {
                    "baseType": "xhtml",
                    "version": "1.0",
                    "typeConfig": {
                        "useSemanticMarkup": true,
                        "semanticMarkupMap": {
                            "b": "strong",
                            "i": "em"
                        },
                        "isXhtmlStrict": true
                    }
                }
            })
        ],

        DOM_CLEANUP_POSTPROCESS_RULEBASED: [
            "<p>Text with <b>bold</b> parts.",
            "<p>Text with <i>italic</i> parts."
        ],

        DOM_CLEANUP_POSTPROCESS_RULEBASED_RESULTS: [
            [
                "<p>Text with <strong>bold</strong> parts.</p>"
            ], [
                "<p>Text with <em>italic</em> parts.</p>"
            ]
        ],

        testDomCleanupPrepareHtmlPaste: function() {
            var tst = CUI.rte.testing.DomProcessing;
            var htmls = tst.DOM_CLEANUP_PASTEPREPARE;
            var results = tst.DOM_CLEANUP_PASTEPREPARE_RESULTS;
            var testCnt = htmls.length;
            var kernel = tcm.getEditorKernel();
            var context = kernel.getEditContext();
            var root = context.root;
            var cleanupInstance = new CUI.rte.DomCleanup({
                "tagsToRemove": [
                    "font"
                ]
            });
            for (var t = 0; t < testCnt; t++) {
                var html = htmls[t];
                var expectedResult = results[t];
                expectedResult = tcm.recreateThroughDom(expectedResult);
                root.innerHTML = html;
                var clonedRoot = root.cloneNode(true);
                cleanupInstance.prepareHtmlPaste(kernel, clonedRoot,
                        tst.DOM_CLEANUP_DEFAULT_PASTERULES);
                var result = clonedRoot.innerHTML;
                if (result != expectedResult) {
                    return "Error in DOM cleanup paste-preparing test #" + t + "; is: "
                        + result + "; expected: " + expectedResult;
                }
            }
            // testcases dependant on specific paste rules
            htmls = tst.DOM_CLEANUP_PASTEPREPARE_RULEBASED;
            results = tst.DOM_CLEANUP_PASTEPREPARE_RULEBASED_RESULTS;
            var rules = tst.DOM_CLEANUP_PASTEPREPARE_RULES;
            var ruleCnt = rules.length;
            testCnt = htmls.length;
            for (t = 0; t < testCnt; t++) {
                html = htmls[t];
                for (var r = 0; r < ruleCnt; r++) {
                    var rule = rules[r];
                    expectedResult = tcm.recreateThroughDom(results[t][r]);
                    root.innerHTML = html;
                    clonedRoot = root.cloneNode(true);
                    cleanupInstance.prepareHtmlPaste(kernel, clonedRoot, rule);
                    result = clonedRoot.innerHTML;
                    if (result != expectedResult) {
                        return "Error in DOM cleanup paste-preparing test #" + t + " for "
                                + "rule set #" + r + "; is: " + result + "; expected: "
                                + expectedResult;
                    }
                }
            }
            return "success";
        },

        DOM_CLEANUP_DEFAULT_PASTERULES: {
            "allowBlockTags": [ "p", "div" ],
            "fallbackBlockTag": "p",
            "allowedAttributes": pasteRulesAllowedAttribs
        },

        DOM_CLEANUP_PASTEPREPARE: [
            "<blockquote>Invalid block content</blockquote>"
        ],

        DOM_CLEANUP_PASTEPREPARE_RESULTS: [
            "<p>Invalid block content</p>"
        ],

        DOM_CLEANUP_PASTEPREPARE_RULES: [
            {
                "allowBasics": {
                    // nothing allowed
                },
                "allowBlockTags": [ "p" ],
                "fallbackBlockTag": "p",
                "table": {
                    "allow": false,
                    "ignoreMode": "paragraph"
                },
                "list": {
                    "allow": false,
                    "ignoreMode": "paragraph"
                },
                "allowedAttributes": pasteRulesAllowedAttribs
            }, {
                "allowBasics": {
                    "bold": true,
                    "italic": true,
                    "underline": true
                },
                "allowBlockTags": [ "p" ],
                "fallbackBlockTag": "p",
                "table": {
                    "allow": false,
                    "ignoreMode": "paragraph"
                },
                "list": {
                    "allow": false,
                    "ignoreMode": "paragraph"
                },
                "allowedAttributes": pasteRulesAllowedAttribs
            }, {
                "allowBasics": {
                    "bold": true,
                    "italic": true,
                    "underline": true,
                    "anchor": true
                },
                "allowBlockTags": [ "p", "h1" ],
                "fallbackBlockTag": "p",
                "table": {
                    "allow": false,
                    "ignoreMode": "paragraph"
                },
                "list": {
                    "allow": false,
                    "ignoreMode": "paragraph"
                },
                "allowedAttributes": pasteRulesAllowedAttribs
            }, {
                "allowBasics": {
                    "bold": true,
                    "italic": true,
                    "underline": true,
                    "anchor": true
                },
                "allowBlockTags": [ "p", "h1" ],
                "fallbackBlockTag": "p",
                "table": {
                    "allow": false,
                    "ignoreMode": "remove"
                },
                "list": {
                    "allow": false,
                    "ignoreMode": "remove"
                },
                "allowedAttributes": pasteRulesAllowedAttribs
            }, {
                "allowBasics": {
                    "bold": true,
                    "italic": true,
                    "underline": true,
                    "anchor": true
                },
                "allowBlockTags": [ "p", "h1" ],
                "fallbackBlockTag": "p",
                "table": {
                    "allow": true
                },
                "list": {
                    "allow": true
                },
                "allowedAttributes": pasteRulesAllowedAttribs
            }
        ],

        DOM_CLEANUP_PASTEPREPARE_RULEBASED: [
            "<p>Simple test content.</p>",
            "<p>Content <b>with</b> <u>some <i>styling</i> tags</u></p>",
            "<h1>Content with unsupported</h1><p>block tags.</p>",
            "<table><tbody><td>A simple table</td>"
                    + "<td>containing two cells</td></tr></tbody></table>",
            "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>",
            "<p>Before</p><table><tbody><td>A simple table</td>"
                    + "<td>containing <b>two cells</b></td></tr></tbody></table>"
                    + "<p>After</p>",
            "<p>Before</p>"
                    + "<ul><li>Item 1</li><li><i>Item 2</i></li><li>Item 3</li></ul>"
                    + "<p>After</p>",
            "<p>Paragraph <a href=\"/content/en/services.html\">containing a link</a>.</p>",
            "<h1><a href=\"http://www.company.com/\">Link</a> in a heading</h1>",
            "<p onclick=\"alert('Leak');\">Some <a href=\"#\" onclick=\"alert('Leak');\">"
                    + "Security</a> issues to <a href=\"javascript:alert('Leak');\">be "
                    + "checked</a>.</p>"
        ],

        DOM_CLEANUP_PASTEPREPARE_RULEBASED_RESULTS: [
            [
                "<p>Simple test content.</p>",
                "<p>Simple test content.</p>",
                "<p>Simple test content.</p>",
                "<p>Simple test content.</p>",
                "<p>Simple test content.</p>"
            ], [
                "<p>Content with some styling tags</p>",
                "<p>Content <b>with</b> <u>some <i>styling</i> tags</u></p>",
                "<p>Content <b>with</b> <u>some <i>styling</i> tags</u></p>",
                "<p>Content <b>with</b> <u>some <i>styling</i> tags</u></p>",
                "<p>Content <b>with</b> <u>some <i>styling</i> tags</u></p>"
            ], [
                "<p>Content with unsupported</p><p>block tags.</p>",
                "<p>Content with unsupported</p><p>block tags.</p>",
                "<h1>Content with unsupported</h1><p>block tags.</p>",
                "<h1>Content with unsupported</h1><p>block tags.</p>",
                "<h1>Content with unsupported</h1><p>block tags.</p>"
            ], [
                "<p>A simple table</p><p>containing two cells</p>",
                "<p>A simple table</p><p>containing two cells</p>",
                "<p>A simple table</p><p>containing two cells</p>",
                "",
                "<table class=\"" + CUI.rte.Theme.TABLE_NOBORDER_CLASS + "\">"
                        + "<tbody><td>A simple table</td>"
                        + "<td>containing two cells</td></tr></tbody></table>"
            ], [
                "<p>Item 1</p><p>Item 2</p><p>Item 3</p>",
                "<p>Item 1</p><p>Item 2</p><p>Item 3</p>",
                "<p>Item 1</p><p>Item 2</p><p>Item 3</p>",
                "",
                "<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>"
            ], [
                "<p>Before</p><p>A simple table</p><p>containing two cells</p><p>After</p>",
                "<p>Before</p><p>A simple table</p><p>containing <b>two cells</b></p>"
                        + "<p>After</p>",
                "<p>Before</p><p>A simple table</p><p>containing <b>two cells</b></p>"
                        + "<p>After</p>",
                "<p>Before</p><p>After</p>",
                "<p>Before</p><table class=\"" + CUI.rte.Theme.TABLE_NOBORDER_CLASS
                        + "\"><tbody><td>A simple table</td>"
                        + "<td>containing <b>two cells</b></td></tr></tbody></table>"
                        + "<p>After</p>"

            ], [
                "<p>Before</p><p>Item 1</p><p>Item 2</p><p>Item 3</p><p>After</p>",
                "<p>Before</p><p>Item 1</p><p><i>Item 2</i></p><p>Item 3</p><p>After</p>",
                "<p>Before</p><p>Item 1</p><p><i>Item 2</i></p><p>Item 3</p><p>After</p>",
                "<p>Before</p><p>After</p>",
                "<p>Before</p><ul><li>Item 1</li><li><i>Item 2</i></li><li>Item 3</li></ul>"
                        + "<p>After</p>"
            ], [
                "<p>Paragraph containing a link.</p>",
                "<p>Paragraph containing a link.</p>",
                (com.ua.isIE || com.ua.isWebKit
                    ? "<p>Paragraph <a href=\"/content/en/services.html\" "
                        + com.HREF_ATTRIB + "=\"/content/en/services.html\">containing "
                        + "a link</a>.</p>"
                    : "<p>Paragraph <a " + com.HREF_ATTRIB + "=\"/content/en/services.html"
                        + "\" href=\"/content/en/services.html\">containing "
                        + "a link</a>.</p>"),
                (com.ua.isIE || com.ua.isWebKit
                    ? "<p>Paragraph <a href=\"/content/en/services.html\" "
                        + com.HREF_ATTRIB + "=\"/content/en/services.html\">containing "
                        + "a link</a>.</p>"
                    : "<p>Paragraph <a " + com.HREF_ATTRIB + "=\"/content/en/services.html"
                        + "\" href=\"/content/en/services.html\">containing "
                        + "a link</a>.</p>"),
                (com.ua.isIE || com.ua.isWebKit
                    ? "<p>Paragraph <a href=\"/content/en/services.html\" "
                        + com.HREF_ATTRIB + "=\"/content/en/services.html\">containing "
                        + "a link</a>.</p>"
                    : "<p>Paragraph <a " + com.HREF_ATTRIB + "=\"/content/en/services.html"
                        + "\" href=\"/content/en/services.html\">containing "
                        + "a link</a>.</p>")
            ], [
                "<p>Link in a heading</p>",
                "<p>Link in a heading</p>",
                (com.ua.isIE || com.ua.isWebKit
                        ? "<h1><a href=\"http://www.company.com/\" " + com.HREF_ATTRIB
                            + "=\"http://www.company.com/\">Link</a> in a heading</h1>"
                        : "<h1><a " + com.HREF_ATTRIB + "=\"http://www.company.com/\" "
                            + "href=\"http://www.company.com/\">Link</a> in a heading</h1>"
                        ),
                (com.ua.isIE || com.ua.isWebKit
                        ? "<h1><a href=\"http://www.company.com/\" " + com.HREF_ATTRIB
                            + "=\"http://www.company.com/\">Link</a> in a heading</h1>"
                        : "<h1><a " + com.HREF_ATTRIB + "=\"http://www.company.com/\" "
                            + "href=\"http://www.company.com/\">Link</a> in a heading</h1>"
                        ),
                (com.ua.isIE || com.ua.isWebKit
                        ? "<h1><a href=\"http://www.company.com/\" " + com.HREF_ATTRIB
                            + "=\"http://www.company.com/\">Link</a> in a heading</h1>"
                        : "<h1><a " + com.HREF_ATTRIB + "=\"http://www.company.com/\" "
                            + "href=\"http://www.company.com/\">Link</a> in a heading</h1>")
            ], [
                "<p>Some Security issues to be checked.</p>",
                "<p>Some Security issues to be checked.</p>",
                (com.ua.isIE || com.ua.isWebKit
                        ? "<p>Some <a href=\"#\" " + com.HREF_ATTRIB + "=\"#\">Security"
                            + "</a> issues to be checked.</p>"
                        : "<p>Some <a " + com.HREF_ATTRIB + "=\"#\" href=\"#\">Security"
                            + "</a> issues to be checked.</p>"),
                (com.ua.isIE || com.ua.isWebKit
                        ? "<p>Some <a href=\"#\" " + com.HREF_ATTRIB + "=\"#\">Security"
                            + "</a> issues to be checked.</p>"
                        : "<p>Some <a " + com.HREF_ATTRIB + "=\"#\" href=\"#\">Security"
                            + "</a> issues to be checked.</p>"),
                (com.ua.isIE || com.ua.isWebKit
                        ? "<p>Some <a href=\"#\" " + com.HREF_ATTRIB + "=\"#\">Security"
                            + "</a> issues to be checked.</p>"
                        : "<p>Some <a " + com.HREF_ATTRIB + "=\"#\" href=\"#\">Security"
                            + "</a> issues to be checked.</p>")
            ]
        ]

    };

}();


CUI.rte.testing.Commons.registerSection("domprocessor", "Advanced DOM processing");
CUI.rte.testing.Commons.registerTest(
        "domprocessor", "DomProcessing.testBlockDetection",
        CUI.rte.testing.DomProcessing.testBlockDetection);
CUI.rte.testing.Commons.registerTest(
        "domprocessor", "DomProcessing.testWhitespaceProcessor",
        CUI.rte.testing.DomProcessing.testWhitespaceProcessor);
CUI.rte.testing.Commons.registerTest(
        "domprocessor", "DomProcessing.testDomCleanupPreprocess",
        CUI.rte.testing.DomProcessing.testDomCleanupPreprocess);
CUI.rte.testing.Commons.registerTest(
        "domprocessor", "DomProcessing.testDomCleanupPostprocess",
        CUI.rte.testing.DomProcessing.testDomCleanupPostprocess);
CUI.rte.testing.Commons.registerTest(
        "domprocessor", "DomProcessing.testDomCleanupPrepareHtmlPaste",
        CUI.rte.testing.DomProcessing.testDomCleanupPrepareHtmlPaste);
