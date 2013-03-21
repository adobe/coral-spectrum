CUI.rte.DebugRegistry = function() {

    var resultDom;

    var registeredTests = [ ];

    var successHandler = null;


    var getUrlPrm = function(prmName, defaultValue) {
        var value = defaultValue;
        var searchStr = document.location.search;
        if (searchStr.length > 0) {
            searchStr = searchStr.substring(1, searchStr.length);
        }
        if (searchStr.length > 0) {
            var searchParts = searchStr.split("&");
            var configPrm = prmName + "=";
            for (var p = 0; p < searchParts.length; p++) {
                var partToCheck = searchParts[p];
                if (CUI.rte.Common.strStartsWith(partToCheck, configPrm)) {
                    value = partToCheck.substring(configPrm.length,
                            partToCheck.length);
                    break;
                }
            }
        }
        return value;
    };

    var log = function() {
        if (window.console) {
            if (window.console.log.apply) {
                window.console.log.apply(window.console, arguments);
            } else {
                var msg = "";
                for (var a = 0; a < arguments.length; a ++) {
                    if (a > 0) {
                        msg += "\r\n";
                    }
                    msg += arguments[a];
                }
                window.console.log(msg);
            }
        }
    };

    var execTest = function(test, parameter, excBoxDom) {
        var resText;
        if (excBoxDom.checked) {
            try {
                resText = test.testFn(parameter);
                resultDom.value = resText;
                log(resText);
            } catch (e) {
                resultDom.value = "Exception: " + (e.message ? e.message : e);
                log(e);
            }
        } else {
            resText = test.testFn(parameter);
            resultDom.value = resText;
            log(resText);
        }
        if ((resText === "success") && successHandler) {
            successHandler();
        }
    };

    var startTest = function(selDom, parameterDom, excBoxDom) {
        successHandler = undefined;
        var selIndex = selDom.selectedIndex;
        var tests = getTestsForSection(currentSection || "all");
        if (tests.length > selIndex) {
            var parameter = parameterDom.value;
            if (parameter.length == 0) {
                parameter = undefined;
            }
            execTest(tests[selIndex], parameter, excBoxDom);
        }
    };

    var _toExecute = null;

    var startAllTests = function(excBoxDom) {

        function startSingleTest() {
            if (_toExecute.length > 0) {
                successHandler = startSingleTest;
                var test = _toExecute[0];
                _toExecute.splice(0, 1);
                log("Starting test '" + test.name + "'.");
                execTest(test, undefined, excBoxDom);
            } else {
                successHandler = null;
                log("All tests finished successfully.")
            }
        }

        _toExecute = getTestsForSection(currentSection || "all");
        if (_toExecute.length > 0) {
            startSingleTest();
        } else {
            log("No tests available");
        }
    };

    var getTestsForSection = function(section) {
        var tests = [ ];
        var testCnt = registeredTests.length;
        for (var t = 0; t < testCnt; t++) {
            var test = registeredTests[t];
            if ((section === "all") || (section === test.section)) {
                tests.push(test);
            }
        }
        return tests;
    };

    var sections = [
        {
            "id": "all",
            "text": "All sections"
        }
    ];

    var currentSection = null;

    var getSections = function() {
        return sections;
    };

    var selectSection = function(selDom) {
        var selIndex = selDom.selectedIndex;
        var _sections = getSections();
        if (selIndex < _sections.length) {
            var section = _sections[selIndex];
            var href = window.location.href;
            var searchPos = href.indexOf("?");
            if (searchPos > 0) {
                href = href.substring(0, searchPos);
            }
            href += "?config=" + getUrlPrm("config", "dflt")
                + "&debug=true&section=" + section.id
                + "&iframe=" + getUrlPrm("iframe", "false");
            document.location.href = href;
        }
    };

    var changeIFrameMode = function(iframeBoxDom) {
        var isIFrame = iframeBoxDom.checked;
        var href = window.location.href;
        var searchPos = href.indexOf("?");
        if (searchPos > 0) {
            href = href.substring(0, searchPos);
        }
        var sectionParam = getUrlPrm("section", "");
        if (sectionParam.length > 0) {
            sectionParam = "&section=" + sectionParam;
        }
        href += "?config=" + getUrlPrm("config", "dflt")
                + "&debug=true" + sectionParam + "&iframe=" + String(isIFrame);
        document.location.href = href;
    };

    var isIE = CUI.rte.Common.ua.isIE;

    return {

        registerSection: function(id, text) {
            sections.push({
                "id": id,
                "text": text
            });
        },

        registerTest: function(section, name, testFn) {
            registeredTests.push({
                "section": section,
                "name": name,
                "testFn": testFn
            });
        },

        createTestSelector: function(docRef, selectorDiv, preselSection) {
            currentSection = preselSection;
            var optionDom;
            selectorDiv.appendChild(docRef.createTextNode("Section: "));
            var sectionDom = docRef.createElement("select");
            sectionDom.setAttribute("size", "1");
            sectionDom.onchange = function() {
                selectSection(sectionDom);
            };
            selectorDiv.appendChild(sectionDom);
            var startAllButtonDom = docRef.createElement("button");
            startAllButtonDom.appendChild(docRef.createTextNode("Start all"));
            startAllButtonDom.onclick = function() {
                startAllTests(excBoxDom);
            };
            selectorDiv.appendChild(startAllButtonDom);
            var _sections = getSections();
            var sectionCnt = _sections.length;
            var preselIndex = -1;
            for (var s = 0; s < sectionCnt; s++) {
                var section = _sections[s];
                if (section.id == preselSection) {
                    preselIndex = s;
                }
                optionDom = docRef.createElement("option");
                sectionDom.appendChild(optionDom);
                optionDom.setAttribute("value", section.id);
                optionDom.appendChild(docRef.createTextNode(section.text));
            }
            if (preselIndex >= 0) {
                sectionDom.selectedIndex = preselIndex;
            }
            selectorDiv.appendChild(docRef.createElement("br"));
            var selDom = docRef.createElement("select");
            selDom.setAttribute("size", "1");
            selectorDiv.appendChild(selDom);
            var tests = getTestsForSection(preselSection);
            var testCnt = tests.length;
            if (testCnt == 0) {
                optionDom = docRef.createElement("option");
                selDom.appendChild(optionDom);
                optionDom.setAttribute("value", "");
                optionDom.appendChild(docRef.createTextNode("- no tests available -"));
            } else {
                for (var t = 0; t < testCnt; t++) {
                    optionDom = docRef.createElement("option");
                    selDom.appendChild(optionDom);
                    optionDom.setAttribute("value", String(t));
                    optionDom.appendChild(docRef.createTextNode(tests[t].name));
                }
            }
            selectorDiv.appendChild(docRef.createTextNode(" "));
            var parameterDom = docRef.createElement("input");
            parameterDom.setAttribute("type", "text");
            parameterDom.setAttribute("value", "");
            parameterDom.setAttribute("size", "10");
            selectorDiv.appendChild(parameterDom);
            resultDom = docRef.createElement("input");
            resultDom.setAttribute("type", "text");
            resultDom.setAttribute("value", "");
            resultDom.setAttribute("size", "80");
            resultDom.setAttribute("disabled", "true");
            selectorDiv.appendChild(docRef.createTextNode(" "));
            var startButtonDom = docRef.createElement("button");
            startButtonDom.appendChild(docRef.createTextNode("Start"));
            startButtonDom.onclick = function() {
                startTest(selDom, parameterDom, excBoxDom);
            };
            selectorDiv.appendChild(startButtonDom);
            selectorDiv.appendChild(docRef.createElement("br"));
            selectorDiv.appendChild(docRef.createTextNode("Result: "));
            selectorDiv.appendChild(resultDom);
            selectorDiv.appendChild(docRef.createElement("br"));
            var excBoxDom = docRef.createElement("input");
            excBoxDom.setAttribute("type", "checkbox");
            excBoxDom.setAttribute("value", "exc");
            if (isIE) {
                excBoxDom.defaultChecked = true;
            } else {
                excBoxDom.setAttribute("checked", "checked");
            }
            selectorDiv.appendChild(excBoxDom);
            selectorDiv.appendChild(docRef.createTextNode(" "));
            selectorDiv.appendChild(docRef.createTextNode(" Catch exceptions thrown"));
            var iframeBoxDom = docRef.createElement("input");
            iframeBoxDom.setAttribute("type", "checkbox");
            iframeBoxDom.setAttribute("value", "iframe");
            if (isIE) {
                iframeBoxDom.defaultChecked = getUrlPrm("iframe", "false") === "true";
            } else {
                if (getUrlPrm("iframe", "false") === "true") {
                    iframeBoxDom.setAttribute("checked", "checked");
                }
            }
            iframeBoxDom.onclick = function() {
                changeIFrameMode(iframeBoxDom);
            };
            selectorDiv.appendChild(iframeBoxDom);
            selectorDiv.appendChild(docRef.createTextNode(" iframe environment"));
            selectorDiv.appendChild(docRef.createElement("br"));
            selectorDiv.appendChild(docRef.createElement("br"));
        },

        notifyDeferredSuccess: function() {
            resultDom.value = "success";
            log("success");
            if (successHandler) {
                successHandler();
            }
        },

        notifyDeferredError: function(error) {
            resultDom.value = error;
            log(error);
        }

    };

}();