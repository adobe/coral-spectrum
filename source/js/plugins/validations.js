/*
  ADOBE CONFIDENTIAL

  Copyright 2013 Adobe Systems Incorporated
  All Rights Reserved.

  NOTICE:  All information contained herein is, and remains
  the property of Adobe Systems Incorporated and its suppliers,
  if any.  The intellectual and technical concepts contained
  herein are proprietary to Adobe Systems Incorporated and its
  suppliers and may be covered by U.S. and Foreign Patents,
  patents in process, and are protected by trade secret or copyright law.
  Dissemination of this information or reproduction of this material
  is strictly forbidden unless prior written permission is obtained
  from Adobe Systems Incorporated.
*/
(function($) {
    "use strict";

    $.validator.register({
        selector: "input",
        validate: function(el) {
            if (el.attr("aria-required") === "true" && el.val().length === 0) {
                return el.message("required");
            }
        }
    });

    $.validator.register({
        selector: "[role=listbox]",
        validate: function(el) {
            var required = el.attr("aria-required") === "true";

            if (required) {
                var selected = false;
                el.find("[role=option]").each(function() {
                    if ($(this).attr("aria-selected") === "true") {
                        selected = true;
                        return false;
                    }
                });

                if (!selected) {
                    return el.message("required");
                }
            }
        }
    });
})(jQuery);
