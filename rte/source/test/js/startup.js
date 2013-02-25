(function($) {

    function getUrlPrm(prmName, defaultValue) {
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
    }

    var isDebug = (getUrlPrm("debug", "false") === "true");

    $(function() {

        var $test = $("#test");
        var testDiv = $test[0];

        if (isDebug) {
            var section = getUrlPrm("section", "all");
            var debugDiv = $("<div id=\"CUI_Debug\"></div>")[0];
            testDiv.parentNode.insertBefore(debugDiv, testDiv);
            CUI.rte.DebugRegistry.createTestSelector(document, debugDiv, section);
        }

        window.CUI_rteInstance = new CUI.rte.testing.StubEditor({
            $el: $test
        });
        $test.focus();

    });

})(window.jQuery);