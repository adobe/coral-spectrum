CUI.rte.UIUtils = function() {

    return {

        addStyleSheet: function(cssToAdd, doc) {
            doc = doc || document;
            var com = CUI.rte.Common;
            if (!CUI.rte.Utils.isArray(cssToAdd)) {
                cssToAdd = [ cssToAdd ];
            }
            var headEl = doc.getElementsByTagName("head")[0];
            var styleSheet = doc.createElement("style");
            styleSheet.type = 'text/css';
            headEl.appendChild(styleSheet);
            var cssText = "";
            var cssCnt = cssToAdd.length;
            for (var c = 0; c < cssCnt; c++) {
                var css = cssToAdd[c];
                cssText += css[".name"] + " {\n";
                for (var key in css) {
                    if (css.hasOwnProperty(key) && (key !== ".name")) {
                        cssText += "    " + key + ": " + css[key] + ";\n";
                    }
                }
                cssText += "}\n\n";
            }
            styleSheet.innerHTML = cssText;
            return styleSheet;
        },

        removeStyleSheet: function(styleSheet) {
            styleSheet.parentNode.removeChild(styleSheet);
        }

    }

}();