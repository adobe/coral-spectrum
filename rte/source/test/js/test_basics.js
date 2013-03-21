CUI.rte.testing.BasicsTests = function() {

    var tcm = CUI.rte.testing.Commons;

    var com = CUI.rte.Common;

    var NBSP = String.fromCharCode(160);

    var anchorSubstPre = "<img src=\"img/spacer.png\" " + com.A_NAME_REPLACEMENT_ATTRIB
                + "=\"";

    var anchorSubstPost = "\" class=\"" + CUI.rte.Theme.ANCHOR_CLASS + "\">";

    var createAnchorResult = function(anchorName) {
        if (com.ua.isWebKit) {
            return anchorSubstPre + anchorName + anchorSubstPost;
        }
        return "<a name=\"" + anchorName + "\" class=\"" + CUI.rte.Theme.ANCHOR_CLASS
                + "\"></a>";
    };

    var createEmptyParaResult = function() {
        if (com.ua.isIE) {
            // IE will implicitly add a &nbsp; when the empty paragraph is made editable
            // in its innerHTML representation
            return "<p>&nbsp;</p>";
        }
        if (com.ua.isWebKit || com.ua.isGecko) {
            return "<p><br " + com.BR_TEMP_ATTRIB + "=\"brEOB\"></p>";
        }
        throw new Error("Unsupported broser.");
    };

    return {

        TAGS: [
            "<p>",                                                      // #0
            "<span class=\"cssClass\">",                                // #1
            "<span class=cssClass>",                                    // #2
            "<span style=\"font-family: Arial\">",                      // #3
            "<span style='font-family: \"Arial\"'>",                    // #4
            "<img src=\"img.png\" ismap width=\"100\">",                // #5
            "<img src=\"img.png\" ismap>",                              // #6
            "<img    src =\"img.png\"   ismap   width = \"100\">",      // #7
            "<img src   =   \"img.png\"    ismap>",                     // #8
            "<img src   =   \"img.png\"    ismap >",                    // #9
            "<span     style =  '  font-family:  \"Arial\"  '    >",    // #10
            "<a href ='http://www.adobe.com/'  class=  \"cssClass\">",  // #11
            "<img src=img.png  width=100    height=50>",                // #12
            "<img src =   img.png  width= 100    height =50>",          // #13
            "<img src =   img.png  width= 100    height =50  >",        // #14
            "<img src =   img.png  width= 100  ismap  >"                // #15
        ],

        RESULT_TAGS: [
            "p",                                                        // #0
            "span",                                                     // #1
            "span",                                                     // #2
            "span",                                                     // #3
            "span",                                                     // #4
            "img",                                                      // #5
            "img",                                                      // #6
            "img",                                                      // #7
            "img",                                                      // #8
            "img",                                                      // #9
            "span",                                                     // #10
            "a",                                                        // #11
            "img",                                                      // #12
            "img",                                                      // #13
            "img",                                                      // #14
            "img"                                                       // #15
        ],

        RESULT_ATTRIBS: [
            [ ],                                        // #0
            [                                           // #1
                [ "class", "cssClass" ]
            ],
            [                                           // #2
                [ "class", "cssClass" ]
            ],
            [                                           // #3
                [ "style", "font-family: Arial" ]
            ],
            [                                           // #4
                [ "style", "font-family: \"Arial\"" ]
            ],
            [                                           // #5
                [ "src", "img.png" ],
                [ "ismap", null ],
                [ "width", "100"]
            ],
            [                                           // #6
                [ "src", "img.png" ],
                [ "ismap", null ]
            ],
            [                                           // #7
                [ "src", "img.png" ],
                [ "ismap", null ],
                [ "width", "100"]
            ],
            [                                           // #8
                [ "src", "img.png" ],
                [ "ismap", null ]
            ],
            [                                           // #9
                [ "src", "img.png" ],
                [ "ismap", null ]
            ],
            [                                           // #10
                [ "style", "  font-family:  \"Arial\"  " ]
            ],
            [                                           // #11
                [ "href", "http://www.adobe.com/" ],
                [ "class", "cssClass" ]
            ],
            [                                           // #12
                [ "src", "img.png" ],
                [ "width", "100"],
                [ "height", "50" ]
            ],
            [                                           // #13
                [ "src", "img.png" ],
                [ "width", "100"],
                [ "height", "50" ]
            ],
            [                                           // #14
                [ "src", "img.png" ],
                [ "width", "100"],
                [ "height", "50" ]
            ],
            [                                           // #15
                [ "src", "img.png" ],
                [ "width", "100"],
                [ "ismap", null ]
            ]
        ],

        /**
         * Tests parsing single HTML tags.
         */
        testTagParser: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var testCnt = tst.TAGS.length;
            for (var t = 0; t < testCnt; t++) {
                var testTag = tst.TAGS[t];
                var parseResult = CUI.rte.HtmlProcessor.parseTag(testTag);
                if (!parseResult) {
                    return "Parsing failed for testTagParser #" + t + "; tag is: "
                            + testTag;
                }
                if (parseResult.tagName != tst.RESULT_TAGS[t]) {
                    return "Invalid tag for testTagParser #" + t + "; is: "
                            + parseResult.tagName + "; expected: " + tst.RESULT_TAGS[t]
                            + "; parsed tag is: " + testTag;
                }
                var attribs = parseResult.attributes;
                var attrCnt = 0;
                for (var an in attribs) {
                    if (attribs.hasOwnProperty(an)) {
                        attrCnt++;
                    }
                }
                var expectedAttribs = tst.RESULT_ATTRIBS[t];
                if (attrCnt != expectedAttribs.length) {
                    return "Invalid number of attributes for testTagParser #" + t + "; is: "
                            + attrCnt + "; expected: " + expectedAttribs.length
                            + "; parsed tag is: " + testTag;
                }
                for (var a = 0; a < attrCnt; a++) {
                    var expectedAttrib = expectedAttribs[a];
                    var name = expectedAttrib[0];
                    var attrib = attribs[name];
                    if (!attrib) {
                        return "Missing expected attribute '" + name + "' "
                                + "for testTagParser #" + t + "; parsed tag is: " + testTag;
                    }
                    var value = attrib.value;
                    if (value != expectedAttrib[1]) {
                        return "Invalid attribute value for testTagParser #" + t + "; is: "
                                + value + "; expected: " + expectedAttrib[1]
                                + "; parsed tag is: " + testTag;
                    }
                }
            }
            return "success";
        },

        /**
         * Tests HTML parsing.
         */
        testParser: function() {
            var html = "<html><head>\n<title>Bla</title></head>\n\n"
                + "<body>fgjdf hs fsdh fsdhg<b>gghsagjhas</b>, <!-- Comment --><i></i>xyz "
                + "<span style=\"font-weight: bold;\">Bold</span> gsgjhdgjhd\n"
                + "<a href=\"blarg.html\" target=_blank>hdkhdkjdkj</a> dhgkdhdhjkdhkj "
                + "<free tag='hdsjkhdkjhkjd'>dhkdhdhjhdkj</free><shortform1/><shortform2 />"
                + "</body>\n\n</html>";
            var expectedResult = "<#<#***<#***#>#>***"
                + "<#***<#***#>***<?!><##>***"
                + "<#***#>***"
                + "<#***#>***"
                + "<#***#><##><##>"
                + "#>***#>";
            var callback = {
                onTagStart: function(tagName, attributes) {
                    return "<#";
                },
                onTagEnd: function(tagName) {
                    return "#>";
                },
                onProcessingTag: function(pTag) {
                    return "<?!>";
                },
                onHtmlText: function(text) {
                    return "***";
                }
            };
            var htmlResult = CUI.rte.HtmlProcessor.parseHtml(html, callback);
            return (htmlResult == expectedResult ? "success" : "Invalid result: "
                    + htmlResult + "; expected: " + expectedResult);
        },

        /**
         * @private
         */
        testSerializer: function(mode, config, dom) {
            var serializer = null;
            switch (mode) {
                case "html":
                    serializer = new CUI.rte.HtmlSerializer(config);
                    break;
                case "xhtml":
                    serializer = new CUI.rte.XhtmlSerializer(config);
                    break;
            }
            return serializer.serialize(tcm.createFakeEditContext(dom), dom);
        },

        /**
         * @private
         */
        createSerializerTestDom: function(testNo) {
            var testDom = document.createElement("span");
            testDom.innerHTML = CUI.rte.testing.BasicsTests.SERIALIZER_HTMLS[testNo];
            return testDom;
        },

        SERIALIZER_HTMLS: [
            "<p>Some &lt;test&gt; text<br>containing a line feed<br>and <b>bold text</b> "
                    + "and text containing a" + NBSP + "non" + NBSP + "breaking space.</p>",
            "<p style=\"text-align: right;\">Test containing a styled tag.</p>",
            "<p>Some test</p><p></p>"
                    + "<h1></h1>"
                    + "<p>With empty blocks</p>",
            "<p>Nested empty para</p><p><b></b></p>",
            "<p>Test <span class=\"source\">containing CSS classes</span></p>",
            "<p>Test containing a regular<br>linefeed.</p>",
            "<table cellspacing=\"0\" cellpadding=\"0\">"
                    + "<tr><td rowspan=\"2\">ABC</td><td>DEF</td></tr>"
                    + "<tr><td>GHI</td></tr>"
                    + "</table>"
        ],

        /**
         * Tests serializing DOM to HTML.
         */
        testSerializerHTML: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var testCnt = tst.SERIALIZER_HTMLS.length;
            for (var t = 0; t < testCnt; t++) {
                var expectedResult = tst.SERIALIZER_HTML_RESULTS[t];
                var result = tst.testSerializer("html", null,
                        tst.createSerializerTestDom(t));
                if (result != expectedResult) {
                    return "Invalid result: " + result + "; expected: " + expectedResult;
                }
            }
            return "success";
        },

        SERIALIZER_HTML_RESULTS: [
            "<p>Some &lt;test&gt; text<br>\ncontaining a line feed<br>\nand <b>bold "
                    + "text</b> and text containing a&nbsp;non&nbsp;breaking space.</p>\n",
            "<p style=\"text-align: right;\">Test containing a styled tag.</p>\n",
            "<p>Some test</p>\n<p>&nbsp;</p>\n"
                    + "<h1>&nbsp;</h1>\n"
                    + "<p>With empty blocks</p>\n",
            "<p>Nested empty para</p>\n<p><b>&nbsp;</b></p>\n",
            "<p>Test <span class=\"source\">containing CSS classes</span></p>\n",
            "<p>Test containing a regular<br>\nlinefeed.</p>\n",
            "<table cellspacing=\"0\" cellpadding=\"0\">\n"
                    + "<tbody><tr><td rowspan=\"2\">ABC</td>\n<td>DEF</td>\n</tr>"
                    + "<tr><td>GHI</td>\n</tr>"
                    + "</tbody></table>\n"
        ],

        /**
         * Tests serializing DOM to XHTML.
         */
        testSerializerXHTML: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var testCnt = tst.SERIALIZER_HTMLS.length;
            for (var t = 0; t < testCnt; t++) {
                var expectedResult = tst.SERIALIZER_XHTML_RESULTS[t];
                var result = tst.testSerializer("xhtml", null,
                        tst.createSerializerTestDom(t));
                if (result != expectedResult) {
                    return "Invalid result: " + result + "; expected: " + expectedResult;
                }
            }
            return "success";
        },

        SERIALIZER_XHTML_RESULTS: [
            "<p>Some &lt;test&gt; text<br></br>\ncontaining a line feed<br></br>\n"
                    + "and <b>bold text</b> and text containing a&nbsp;non&nbsp;breaking "
                    + "space.</p>\n",
            "<p style=\"text-align: right;\">Test containing a styled tag.</p>\n",
            "<p>Some test</p>\n<p>&nbsp;</p>\n"
                    + "<h1>&nbsp;</h1>\n"
                    + "<p>With empty blocks</p>\n",
            "<p>Nested empty para</p>\n<p><b>&nbsp;</b></p>\n",
            "<p>Test <span class=\"source\">containing CSS classes</span></p>\n",
            "<p>Test containing a regular<br></br>\nlinefeed.</p>\n",
            "<table cellspacing=\"0\" cellpadding=\"0\">\n"
                    + "<tbody><tr><td rowspan=\"2\">ABC</td>\n<td>DEF</td>\n</tr>"
                    + "<tr><td>GHI</td>\n</tr>"
                    + "</tbody></table>\n"
        ],

        /**
         * Tests serializing DOM to XHTML using short tags (&lt;br /&gt;).
         */
        testSerializerXHTML_ShortTags: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var testCnt = tst.SERIALIZER_HTMLS.length;
            for (var t = 0; t < testCnt; t++) {
                var expectedResult = tst.SERIALIZER_XHTML_SHORTTAGS_RESULTS[t];
                var result = tst.testSerializer("xhtml", { useShortTags: true },
                        tst.createSerializerTestDom(t));
                if (result != expectedResult) {
                    return "Invalid result: " + result + "; expected: " + expectedResult;
                }
            }
            return "success";
        },

        SERIALIZER_XHTML_SHORTTAGS_RESULTS: [
            "<p>Some &lt;test&gt; text<br />\ncontaining a line feed<br />\nand <b>bold "
                    + "text</b> and text containing a&nbsp;non&nbsp;breaking space.</p>\n",
            "<p style=\"text-align: right;\">Test containing a styled tag.</p>\n",
            "<p>Some test</p>\n<p>&nbsp;</p>\n"
                    + "<h1>&nbsp;</h1>\n"
                    + "<p>With empty blocks</p>\n",
            "<p>Nested empty para</p>\n<p><b>&nbsp;</b></p>\n",
            "<p>Test <span class=\"source\">containing CSS classes</span></p>\n",
            "<p>Test containing a regular<br />\nlinefeed.</p>\n",
            "<table cellspacing=\"0\" cellpadding=\"0\">\n"
                    + "<tbody><tr><td rowspan=\"2\">ABC</td>\n<td>DEF</td>\n</tr>"
                    + "<tr><td>GHI</td>\n</tr>"
                    + "</tbody></table>\n"
        ],

        testHtmlDeserializer: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var deserializer = new CUI.rte.HtmlDeserializer();
            var htmls = tst.DESERIALIZER_HTMLS;
            var expectedResults = tst.DESERIALIZER_HTML_RESULTS;
            var root = document.createElement("div");
            var context = tcm.createFakeEditContext(root);
            var testCnt = htmls.length;
            for (var t = 0; t < testCnt; t++) {
                var html = htmls[t];
                deserializer.deserialize(context, html, root);
                var result = root.innerHTML;
                result = (com.ua.isIE8 ? tcm.recreateThroughDom(result) : result);
                var expectedResult = tcm.recreateThroughDom(expectedResults[t]);
                if (result != expectedResult) {
                    return "HTML deserialization failed for testcase #" + t + "; is: "
                            + result + "; expected: " + expectedResult;
                }
            }
            return "success";
        },

        DESERIALIZER_HTMLS: [
            "Text",
            "Text with <b>some tags</b>.",
            "<a href=\"/content/geometrixx/services.html\">Internal link</a>",
            "<img src=\"/etc/dam/path/to/image.png\">",
            "<a href=\"test.html\" target=\"blank\"\ntitle=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\" target=\"blank\" title=\"Link\">Irregular link</a>",
            "<a href=\"test.html\"\ntarget=\"blank\" title=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\"\ntarget=\"blank\"\ntitle=\"Link\">Irregular link</a>",
            "<p>&nbsp;</p>",
            "<p><b>&nbsp;</b></p>"
        ],

        DESERIALIZER_HTML_RESULTS: [
            "Text",
            "Text with <b>some tags</b>.",
            "<a href=\"/content/geometrixx/services.html\" " + com.HREF_ATTRIB
                    + "=\"/content/geometrixx/services.html\">Internal link</a>",
            "<img src=\"/etc/dam/path/to/image.png\" " + com.SRC_ATTRIB
                    + "=\"/etc/dam/path/to/image.png\">",
            "<a href=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\" "
                    + "target=\"blank\"\ntitle=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\" "
                    + "target=\"blank\" title=\"Link\">Irregular link</a>",
            "<a href=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\"\n"
                    + "target=\"blank\" title=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\"\n"
                    + "target=\"blank\"\ntitle=\"Link\">Irregular link</a>",
            "<p>&nbsp;</p>",
            "<p><b>&nbsp;</b></p>"
        ],

        testXhtmlDeserializer: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var deserializer = new CUI.rte.XhtmlDeserializer();
            var htmls = tst.DESERIALIZER_XHTMLS;
            var expectedResults = tst.DESERIALIZER_XHTML_RESULTS;
            var root = document.createElement("div");
            var context = tcm.createFakeEditContext(root);
            var testCnt = htmls.length;
            for (var t = 0; t < testCnt; t++) {
                var html = htmls[t];
                deserializer.deserialize(context, html, root);
                var result = root.innerHTML;
                result = (com.ua.isIE8 ? tcm.recreateThroughDom(result) : result);
                var expectedResult = tcm.recreateThroughDom(expectedResults[t]);
                if (result != expectedResult) {
                    return "XHTML deserialization failed for testcase #" + t + "; is: "
                            + result + "; expected: " + expectedResult;
                }
            }
            return "success";
        },

        DESERIALIZER_XHTMLS: [
            "Text",
            "Text with <b>some tags</b>.",
            "<a href=\"/content/geometrixx/services.html\">Internal link</a>",
            "<img src=\"/etc/dam/path/to/image.png\" />",
            "Text with<br /><br />linefeeds.",
            "<a href=\"test.html\" target=\"blank\"\ntitle=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\" target=\"blank\" title=\"Link\">Irregular link</a>",
            "<a href=\"test.html\"\ntarget=\"blank\" title=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\"\ntarget=\"blank\"\ntitle=\"Link\">Irregular link</a>"
        ],

        DESERIALIZER_XHTML_RESULTS: [
            "Text",
            "Text with <b>some tags</b>.",
            "<a href=\"/content/geometrixx/services.html\" " + com.HREF_ATTRIB
                    + "=\"/content/geometrixx/services.html\">Internal link</a>",
            "<img src=\"/etc/dam/path/to/image.png\" " + com.SRC_ATTRIB
                    + "=\"/etc/dam/path/to/image.png\">",
            "Text with<br><br>linefeeds.",
            "<a href=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\" "
                    + "target=\"blank\"\ntitle=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\" "
                    + "target=\"blank\" title=\"Link\">Irregular link</a>",
            "<a href=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\"\n"
                    + "target=\"blank\" title=\"Link\">Irregular link</a>",
            "<a\nhref=\"test.html\" " + com.HREF_ATTRIB + "=\"test.html\"\n"
                    + "target=\"blank\"\ntitle=\"Link\">Irregular link</a>"
        ],

        /**
         * @private
         */
        createTableMockup: function() {
            return new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")  // #0
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 3 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2, "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                        ).appendChild(new tcm.DomMockup("tr")  // #1
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 6 }))
                            .appendChild(new tcm.DomMockup("td"))
                        ).appendChild(new tcm.DomMockup("tr")  // #2
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2, "colspan": 2 }))
                        ).appendChild(new tcm.DomMockup("tr")  // #3
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2, "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        ).appendChild(new tcm.DomMockup("tr")  // #4
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 3 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                        ).appendChild(new tcm.DomMockup("tr")  // #5
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 4 }))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 3 }))
                        ).appendChild(new tcm.DomMockup("tr")  // #6
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                        ).appendChild(new tcm.DomMockup("tr")  // #7
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        ).appendChild(new tcm.DomMockup("tr")  // #8
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                    );
        },

        /**
         * @private
         */
        createExpectedTableMatrixResult: function() {
            return [
                [ true,  true,  false, true,  false, true,  true  ],  // #0
                [ false, false, false, true,  true,  false, true  ],  // #1
                [ false, true,  true,  false, false, true,  false ],  // #2
                [ true,  false, false, true,  false, false, false ],  // #3
                [ false, false, true,  false, false, true,  true  ],  // #4
                [ true,  true,  false, true,  false, false, true  ],  // #5
                [ false, true,  false, true,  false, true,  false ],  // #6
                [ false, true,  false, true,  true,  true,  false ],  // #7
                [ false, true,  true,  false, true,  false, true  ]   // #8
            ];
        },

        /**
         * Tests the basic functionality of creating a table matrix.
         */
        testTableMatrixBasics: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var tableMockup = tst.createTableMockup();
            var result = tst.createExpectedTableMatrixResult();
            var matrixObj = new CUI.rte.TableMatrix();
            matrixObj.createTableMatrix(tableMockup);
            var matrix = matrixObj.matrix;
            var isError = false;
            var errMsg;
            if (matrix.length != result.length) {
                isError = true;
                errMsg = "Invalid number of rows; is: " + matrix.length + "/should be: "
                    + result.length;
            } else {
                for (var i = 0; i < result.length; i++) {
                    if (matrix[i].length > result[i].length) {
                        isError = true;
                        errMsg = "Row #" + i + " has too many cells.";
                        break;
                    }
                    for (var j = 0; j < result[i].length; j++) {
                        if (result[i][j]) {
                            if (matrix[i].length <= j) {
                                isError = true;
                                errMsg = "Cell r:" + i + "/c:" + j + " missing.";
                                break;
                            }
                            if (matrix[i][j] == null) {
                                isError = true;
                                errMsg = "Cell r:" + i + "/c:" + j + " missing.";
                                break;
                            }
                        } else {
                            if ((matrix[i].length > j) && (matrix[i][j] != null)) {
                                isError = true;
                                errMsg = "Cell r:" + i + "/c:" + j + " erroneously "
                                        + "defined.";
                                break;
                            }
                        }
                    }
                }
            }
            return (!isError ? "success" : "Basic matrix error: " + errMsg);
        },

        /**
         * Tests creating a full table matrix (containing additional info).
         */
        testFullTableMatrix: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var tableMockup = tst.createTableMockup();
            var result = tst.createExpectedTableMatrixResult();
            var matrixObj = new CUI.rte.TableMatrix();
            matrixObj.createTableMatrix(tableMockup);
            matrixObj.createFullMatrix();
            var matrix = matrixObj.fullMatrix;
            var isError = false;
            var errMsg;
            if (matrix.length != result.length) {
                isError = true;
                errMsg = "Invalid number of rows; is: " + matrix.length + "; should be: "
                    + result.length;
            } else {
                for (var r = 0; r < matrix.length; r++) {
                    if (matrix[r].length != result[r].length) {
                        isError = true;
                        errMsg = "Invalid number of cells in row #" + r + "; is: "
                                + matrix[r].length + "; should be: " + result[r].length;
                        break;
                    }
                    for (var c = 0; c < matrix[r].length; c++) {
                        var cell = matrix[r][c];
                        if (cell.isOrigin) {
                            try {
                                if (matrixObj.matrix[r][c] == null) {
                                    isError = true;
                                    errMsg = "Cell at r:" + r + "/c:" + c + " is marked as "
                                        + "origin, but no corresponding entry in the "
                                        + "original matrix could be found";
                                }
                                if (matrixObj.matrix[r][c] != cell.cellRef) {
                                    isError = true;
                                    errMsg = "Invalid cell reference @r:" + r + "/c:" + c
                                            + ".";
                                }
                            } catch (e) {
                                isError = true;
                                errMsg = "Error checking original matrix for r:" + r + "; "
                                        + "c:" + c;
                            }
                        } else {
                            var cellRef = cell.cellRef;
                            var col = cellRef.col;
                            var row = cellRef.row;
                            if ((col > c) || ((col + cellRef.colSpan) <= c)) {
                                isError = true;
                                errMsg = "Invalid cell assignment @r:" + r + "/c:" + c
                                    + " (c:" + col + " -> " + (col + cellRef.colSpan) + ")";
                            }
                            if ((row > r) || ((row + cellRef.rowSpan) <= r)) {
                                isError = true;
                                errMsg = "Invalid cell assignment @r:" + r + "/c:" + c
                                    + " (r:" + row + " -> " + (row + cellRef.rowSpan) + ")";
                            }
                        }
                    }
                }
            }
            return (!isError ? "success" : "Full matrix error: " + errMsg);
        },

        OPTIMIZABLE_TABLES: [
            // #0
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                        )
                    ),
            // #1
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                        )
                    ),
            // #2
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 6 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 4}))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                        )
                    ),
            // #3
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 3 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr"))
                    ),
            // #4
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 3 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                        )
                    ),
            // #5
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 4 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 4 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 4 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr"))
                    ),
            // #6
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 5 }))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 4 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 3, "colspan": 3 }))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 4 }))
                        )
                        .appendChild(new tcm.DomMockup("tr"))
                        .appendChild(new tcm.DomMockup("tr"))
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                        )
                    )
        ],

        OPTIMIZED_TABLES: [
            // #0
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                        )
                    ),
            // #1
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                        )
                    ),
            // #2
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                    ),
            // #3
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                        )
                    ),
            // #4
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "colspan": 3 }))
                        )
                    ),
            // #5
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td"))
                        )
                    ),
            // #6
            new tcm.DomMockup("table")
                    .appendChild(new tcm.DomMockup("tbody")
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 3 }))
                            .appendChild(new tcm.DomMockup("td", { "colspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                            .appendChild(new tcm.DomMockup("td", { "rowspan": 2 }))
                        )
                        .appendChild(new tcm.DomMockup("tr")
                            .appendChild(new tcm.DomMockup("td"))
                        )
                    )
        ],

        /**
         * Tests optimizing the colSpan/rowSpan settings of a table.
         * @return {String} "success" if all test tables could be optimized as expected
         */
        testTableOptimizing: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var tcm = CUI.rte.testing.Commons;
            var testCnt = tst.OPTIMIZABLE_TABLES.length;
            var excludes = tcm.DomMockup.CMP_EXCLUDE;
            for (var t = 0; t < testCnt; t++) {
                var tableMockup = tst.OPTIMIZABLE_TABLES[t];
                var expectedResult = tst.OPTIMIZED_TABLES[t];
                var matrixObj = new CUI.rte.TableMatrix();
                matrixObj.createTableMatrix(tableMockup);
                matrixObj.optimizeSpans();
                if (!tcm.compareObjects(tableMockup, expectedResult, excludes)) {
                    return "Invalid optimized table for test case #" + t;
                }
            }
            return "success";
        },

        /**
         * Tests setting the RichText's setValue method (incl. HTML conversion)
         * @param {Number} testNo Number of testcase
         * @return {String} "success" if the value has been set successfully; "finished" if
         *         an invalid test number was specified; else a suitable error message
         */
        testSetValue: function(testNo) {
            var tcm = CUI.rte.testing.Commons;
            var tst = CUI.rte.testing.BasicsTests;
            if (testNo == null) {
                var retValue = "success";
                for (var t = 0; t < tst.SETVALUE_TEST_HTML.length; t++) {
                    var result = tst.testSetValue(t);
                    if (result != "success") {
                        retValue = result;
                        break;
                    }
                }
                return retValue;
            }
            if (testNo >= tst.SETVALUE_TEST_HTML.length) {
                return "finished";
            }
            var rte = tcm.getRteInstance();
            rte.setValue(tst.SETVALUE_TEST_HTML[testNo]);
            var rteHtml = tcm.getRawEditorContent();
            var expectedHtml = tcm.recreateThroughDom(tst.SETVALUE_RESULT_HTML[testNo]);
            return (tcm.compareHTML(expectedHtml, rteHtml, true, true) ? "success"
                    : "Invalid HTML; is: "+ rteHtml + "; expected: " + expectedHtml);
        },

        SETVALUE_TEST_HTML: [
            "<p>Simple test.</p>",
            "A text without surrounding container,<br>but a linefeed inside.",
            "Testing <span style=\"font-weight:bold;\">style</span> replacements.",
            "Testing <span style=\"font-style:  italic;\">style</span> replacements.",
            "Named <a name=\"bla\"></a> anchors.",
            "    <p>   Content\nwith    a   lot of whitespace</p>  \n\r  \t <p>inside.</p>",
            "",
            "<p>First line<br><br>Second line</p>",
            "<p>&nbsp</p>",
            "<p>&nbsp;</p><p>&nbsp;</p>"
        ],

        SETVALUE_RESULT_HTML: [
            "<p>Simple test.</p>",
            "<p>A text without surrounding container,<br>but a linefeed inside.</p>",
            "<p>Testing <b>style</b> replacements.</p>",
            "<p>Testing <i>style</i> replacements.</p>",
            "<p>Named " + createAnchorResult("bla") + " anchors.</p>",
            "<p>Content with a lot of whitespace</p><p>inside.</p>",
            createEmptyParaResult(),
            "<p>First line<br><br>Second line</p>",
            createEmptyParaResult(),
            createEmptyParaResult() + createEmptyParaResult()
        ],


        /**
         * Tests setting the RichText's setValue method (incl. HTML conversion)
         * @param {Number} testNo Number of testcase
         * @return {String} "success" if the value has been set successfully; "finished" if
         *         an invalid test number was specified; else a suitable error message
         */
        testGetValue: function(testNo) {
            var tcm = CUI.rte.testing.Commons;
            var tst = CUI.rte.testing.BasicsTests;
            if (testNo == null) {
                var retValue = "success";
                for (var t = 0; t < tst.GETVALUE_TEST_HTML.length; t++) {
                    var result = tst.testGetValue(t);
                    if (result != "success") {
                        retValue = result;
                        break;
                    }
                }
                return retValue;
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
            return (tcm.compareHTML(expectedHtml, rteHtml, true, true) ? "success"
                    : "Invalid HTML; is: "+ rteHtml + "; expected: " + expectedHtml);
        },

        GETVALUE_TEST_HTML: [
            "<p>Simple test.</p>",
            "A text without surrounding container,<br>but a linefeed inside.", {
                "html": "A text without surrounding container,<br>but a linefeed inside.",
                "blockHandling": {
                    "removeSingleParagraphContainer": true
                }
            }, {
                "html": "<p style=\"text-align: center;\">Centered text</p>",
                "blockHandling": {
                    "removeSingleParagraphContainer": true
                }
            }, {
                "html": "<p class=\"test\">CSSed paragraph</p>",
                "blockHandling": {
                    "removeSingleParagraphContainer": true
                }
            },
            "    <p>   Content\nwith    a   lot of whitespace</p>  \n\r  \t <p>inside.</p>",
            "",
            "<p>First line<br><br>Second line</p>",
            "First line<br><br>Second line",
            "<p>&nbsp;</p>",
            "<p>&nbsp;</p><p>&nbsp;</p>"
        ],

        GETVALUE_RESULT_HTML: [
            "<p>Simple test.</p>\n",
            "<p>A text without surrounding container,<br>\nbut a linefeed inside.</p>\n",
            "A text without surrounding container,<br>\nbut a linefeed inside.",
            "<div style=\"text-align: center;\">Centered text</div>\n",
            "<div class=\"test\">CSSed paragraph</div>\n",
            "<p>Content with a lot of whitespace</p>\n<p>inside.</p>\n",
            "",
            "<p>First line<br><br>Second line</p>",
            "<p>First line<br><br>Second line</p>",
            "",
            "<p>&nbsp;</p>\n<p>&nbsp;</p>"
        ],


        // Testing commons testing lib ... -------------------------------------------------

        /**
         * Tests the commons testing library.
         */
        testCommonsLib: function() {
            var tst = CUI.rte.testing.BasicsTests;
            var t, c, testCnt, test;
            var resultLen = tcm.removeUnwantedWhitespace("\t\n\r\n\n\r").length;
            if (resultLen != 0) {
                return "removeUnwantedWhitespace does not work as expected; length is: "
                    + resultLen + "; should be: 0";
            }
            var result = tcm.removeUnwantedWhitespace("\t\n\r\n\r\n", true);
            if (result.length != 4) {
                return "removeUnwantedWhitespace, replace with spaces, does not work as "
                        + "expected; should return four spaces; is: '" + result
                        + "' (length: " + result.length + ")";
            }
            result = tcm.removeDoubleSpaces(
                    "Test  text    with   too many   spaces...");
            var expectedResult = "Test text with too many spaces...";
            if (result != expectedResult) {
                return "removeDoubleSpaces failed; is: " + result + "; expected: "
                        + expectedResult;
            }
            var context = tcm.createFakeEditContext(document.body);
            var root1 = context.createElement("span");
            tcm.createDom(context, root1, "<p>Test</p><p>Test</p><p>Test</p>");
            var childCnt = root1.childNodes.length;
            if (childCnt != 3) {
                return "Expected 3 child elements for createDom, #1";
            }
            for (c = 0; c < childCnt; c++) {
                var node = root1.childNodes[c];
                if (node.nodeType != 1) {
                    return "Unexpected node type for createDom, #1";
                }
                if (node.tagName.toLowerCase() != "p") {
                    return "Unexpected tag for createDom #1";
                }
                var pChildCnt = node.childNodes.length;
                if (pChildCnt != 1) {
                    return "Expected one text node per paragraph for createDom #1";
                }
                if (node.childNodes[0].nodeType != 3) {
                    return "Expected text nodes under paragraph node for createDom #1";
                }
                if (node.childNodes[0].nodeValue != "Test") {
                    return "Invalid text node content for createDom #1";
                }
            }
            testCnt = tst.COMPARE_HTMLS.length;
            for (t = 0; t < testCnt; t++) {
                test = tst.COMPARE_HTMLS[t];
                var basic = test[0];
                var cmpCnt = test.length;
                for (c = 1; c < cmpCnt; c += 2) {
                    var cmp = test[c];
                    if (tcm.compareUsingDom(context, basic, cmp) != test[c + 1]) {
                        return "Invalid compare through dom for #" + t + "/"
                                + ((c - 1) / 2);
                    }
                }
            }
            testCnt = tst.COMPARE_OBJS.length;
            for (t = 0; t < testCnt; t++) {
                test = tst.COMPARE_OBJS[t];
                if (tcm.compareObjects(test.obj1, test.obj2) !== test.result) {
                    return "Invalid comparison of objects for #" + t;
                }
            }
            return "success";
        },

        COMPARE_HTMLS: [
            [
                "<p>Test</p><p>Test</p><p>Test</p>",
                "<p>Test</p><p>Test</p><p>Test</p>", true,
                "<p>Test</p>\n<p>Test</p>\n<p>Test</p>", false,
                "<p>Test 1</p><p>Test</p><p>Test</p>", false,
                "<p>Test</p><h1>Test</h1><p>Test</p>", false,
                "<p align=\"center\">Test</p><p>Test</p><p>Test</p>", false
            ], [
                "<p>Test with <a href=\"/path/to/internal/link.html\">internal link</a>."
                        + "</p>",
                "<p>Test with <a href=\"/path/to/internal/link.html\">internal link</a>."
                        + "</p>", true
            ], [
                "<p>Test with an <img src=\"img/test_32.png\"> image.</p>",
                "<p>Test with an <img src=\"img/test_32.png\"> image.</p>", true
            ], [
                "<p align=\"center\">Test</p>",
                "<p align=\"center\">Test</p>", true,
                "<p align=\"left\">Test</p>", false,
                "<p>Test</p>", false,
                "<p class=\"cssClass\">Test</p>", false
            ], [
                "<p class=\"cssClass\">Test</p>",
                "<p class=\"cssClass\">Test</p>", true,
                "<p align=\"left\">Test</p>", false,
                "<p>Test</p>", false,
                "<p class=\"cssClass2\">Test</p>", false
            ], [
                "<p>Before</p><table><tr><td>Cell content</td></tr></table><p>After</p>",
                "<p>Before</p><table><tr><td>Cell content</td></tr></table><p>After</p>",
                        true
            ], [
                "<p>Test for</p><pre>pre\n  formatted\ntext</pre>",
                "<p>Test for</p><pre>pre\n  formatted\ntext</pre>", true
            ]
        ],

        COMPARE_OBJS: [
            {
                "obj1": {
                    "test1": false,
                    "test2": "A string",
                    "test3": 4,
                    "test4": {
                        "array1": [ 1, 2, 3, 4 ],
                        "array2": [
                            {
                                "name": "bla",
                                "value": 67
                            }, {
                                "name": "blubb",
                                "value": 42
                            }
                        ],
                        "obj": {
                            "name": "ok",
                            "value": "blargh"
                        }
                    }
                },
                "obj2": {
                    "test1": false,
                    "test2": "A string",
                    "test3": 4,
                    "test4": {
                        "array1": [ 1, 2, 3, 4 ],
                        "array2": [
                            {
                                "name": "bla",
                                "value": 67
                            }, {
                                "name": "blubb",
                                "value": 42
                            }
                        ],
                        "obj": {
                            "name": "ok",
                            "value": "blargh"
                        }
                    }
                },
                "result": true
            }, {
                "obj1": 1,
                "obj2": "1",
                "result": false
            }, {
                "obj1": 1,
                "obj2": 1,
                "result": true
            }, {
                "obj1": {
                    "val1": 1,
                    "val2": "2",
                    "val3": "x"
                },
                "obj2": {
                    "val1": 1,
                    "val2": "2"
                },
                "result": false
            }, {
                "obj1": {
                    "val1": 1,
                    "val2": "2"
                },
                "obj2": {
                    "val1": 1,
                    "val2": "2",
                    "val3": "x"
                },
                "result": false
            }, {
                "obj1": {
                    "obj2": {
                        "obj3": {
                            "obj4": {
                                "obj5": true
                            }
                        }
                    }
                },
                "obj2": {
                    "obj2": {
                        "obj3": {
                            "obj4": {
                                "obj5": true
                            }
                        }
                    }
                },
                "result": true
            }, {
                "obj1": {
                    "obj2": {
                        "obj3": {
                            "obj4": {
                                "obj5": true
                            }
                        }
                    }
                },
                "obj2": {
                    "obj2": {
                        "obj3": {
                            "obj4": {
                                "obj5": false
                            }
                        }
                    }
                },
                "result": false
            }
        ]
    };

}();

CUI.rte.testing.Commons.registerSection("basics", "Basic processing");
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testTagParser",
        CUI.rte.testing.BasicsTests.testTagParser);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testParser",
        CUI.rte.testing.BasicsTests.testParser);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testSerializerHTML",
        CUI.rte.testing.BasicsTests.testSerializerHTML);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testSerializerXHTML",
        CUI.rte.testing.BasicsTests.testSerializerXHTML);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testSerializerXHTML_ShortTags",
        CUI.rte.testing.BasicsTests.testSerializerXHTML_ShortTags);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testHtmlDeserializer",
        CUI.rte.testing.BasicsTests.testHtmlDeserializer);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testXhtmlDeserializer",
        CUI.rte.testing.BasicsTests.testXhtmlDeserializer);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testTableMatrixBasics",
        CUI.rte.testing.BasicsTests.testTableMatrixBasics);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testFullTableMatrix",
        CUI.rte.testing.BasicsTests.testFullTableMatrix);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testTableOptimizing",
        CUI.rte.testing.BasicsTests.testTableOptimizing);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testSetValue",
        CUI.rte.testing.BasicsTests.testSetValue);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testGetValue",
        CUI.rte.testing.BasicsTests.testGetValue);
CUI.rte.testing.Commons.registerTest(
        "basics", "Basics.testCommonsLib",
        CUI.rte.testing.BasicsTests.testCommonsLib);
