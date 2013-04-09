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
    // This is the place where the validation rules and messages are defined

    "use strict";


    // Register all the messages for validation
    // IMPORTANT: the order is important, where the first one will be used; when in doubt check the source of jquery-message

    $.message.register({
        selector: ":lang(en)",
        message: {
            "validation.required": "Please fill out this field."
        }
    });


    // Register all the validation rules
    // IMPORTANT: the order is important, where the first one will be used; when in doubt check the source of jquery-validator

    // TODO TBD if we want to do validation only when then form is having a certain class
    // e.g. using selector "form.cui-validate input" instead of just "input"


    $.validator.register({
        selector: "input",
        validate: function(el) {
            if (el.attr("aria-required") === "true" && el.val().length === 0) {
                return el.message("validation.required");
            }
        },
        show: function(el, message) {
            var error = el.next(".form-error");

            el.attr("aria-invalid", "true").toggleClass("error", true);

            if (error.length === 0) {
                el.after(function() {
                    // TODO there is a need to better manage tooltip

                    var error = $("<span class='form-error' />").text(message);

                    new CUI.Tooltip({
                        target: error,
                        content: message,
                        interactive: true,
                        arrow: "top",
                        type: "error",
                        distance: 10
                    });

                    return error;
                });
            } else {
                error.text(message);

                // TODO this doesn't work
                error.next(".tooltip").tooltip("set", "content", "aaaa");
            }
        },
        clear: function(el) {
            el.removeAttr("aria-invalid").removeClass("error");
            el.next(".form-error").remove();

            // TODO illegal knowlegde of tooltip mechanism (i.e. the class name used)
            el.next(".tooltip").remove();
        }
    });

    $(document).on("input", "input", function(e) {
        var el = $(this);
        el.checkValidity();
        el.updateErrorUI();
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
                    return el.message("validation.required");
                }
            }
        },
        show: function(el, message) {
            el.attr("aria-invalid", "true");
        },
        clear: function(el) {
            el.removeAttr("aria-invalid");
        }
    });
})(jQuery);
