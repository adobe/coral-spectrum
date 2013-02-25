CUI.rte.DebugRegistry = function() {

    var resultDom;

    var registeredTests = [ ];

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

    var startTest = function(selDom, parameterDom, excBoxDom) {
        var selIndex = selDom.selectedIndex;
        if (registeredTests.length > selIndex) {
            var parameter = parameterDom.value;
            if (parameter.length == 0) {
                parameter = undefined;
            }
            var tests = getTestsForSection(currentSection || "all");
            var resText;
            if (excBoxDom.checked) {
                try {
                    resText = tests[selIndex].testFn(parameter);
                    resultDom.value = resText;
                    if (window.console) {
                        window.console.log(resText);
                    }
                } catch (e) {
                    resultDom.value = "Exception: " + (e.message ? e.message : e);
                    if (window.console) {
                        window.console.log(e);
                    }
                }
            } else {
                resText = tests[selIndex].testFn(parameter);
                resultDom.value = resText;
                if (window.console) {
                    window.console.log(resText);
                }
            }
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
                + "&debug=true&section=" + section.id;
            document.location.href = href;
        }
    };

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
            var excBoxDom = docRef.createElement("input");
            excBoxDom.setAttribute("type", "checkbox");
            excBoxDom.setAttribute("value", "exc");
            if (CUI.rte.Common.ua.isIE) {
                excBoxDom.defaultChecked = true;
            } else {
                excBoxDom.setAttribute("checked", "checked");
            }
            selectorDiv.appendChild(docRef.createTextNode(" "));
            var buttonDom = docRef.createElement("button");
            buttonDom.appendChild(docRef.createTextNode("Start"));
            buttonDom.onclick = function() {
                startTest(selDom, parameterDom, excBoxDom);
            };
            selectorDiv.appendChild(buttonDom);
            selectorDiv.appendChild(docRef.createElement("br"));
            selectorDiv.appendChild(docRef.createTextNode("Result: "));
            selectorDiv.appendChild(resultDom);
            selectorDiv.appendChild(docRef.createElement("br"));
            selectorDiv.appendChild(excBoxDom);
            selectorDiv.appendChild(docRef.createTextNode(" Catch exceptions thrown"));
            selectorDiv.appendChild(docRef.createElement("br"));
            selectorDiv.appendChild(docRef.createElement("br"));
        },

        notifyDeferredSuccess: function() {
            resultDom.value = "success";
            if (window.console) {
                window.console.log("success");
            }
        },

        notifyDeferredError: function(error) {
            resultDom.value = error;
            if (window.console) {
                window.console.log(error);
            }
        }

    };

}();