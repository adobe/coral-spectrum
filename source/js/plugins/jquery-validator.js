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
(function(document, $) {
    /*jshint es5:true */
    "use strict";

    var registry = (function() {
        // Currently these selectors are designed to be fixed. i.e. in order to be validated, the field MUST either use standard element or leverage ARIA.

        // http://www.w3.org/TR/html5/forms.html#category-submit
        var submittableSelector = "input, textarea, select, button, keygen, object, [role=checkbox], [role=radio], [role=combobox], [role=listbox], [role=radiogroup], [role=tree], [role=slider], [role=spinbutton], [role=textbox]";

        // http://www.w3.org/TR/html5/forms.html#candidate-for-constraint-validation
        // It makes sense to create a pseudo selector ":validable" for this
        var candidateSelector = "input:not([readonly],[disabled],[type=hidden],[type=reset],[type=button]), select, textarea:not([readonly]), button[type=submit], [role=checkbox]:not([aria-disabled=true]), [role=radio]:not([aria-disabled=true]), [role=combobox]:not([aria-disabled=true]), [role=listbox]:not([aria-disabled=true]), [role=radiogroup]:not([aria-disabled=true]), [role=tree]:not([aria-disabled=true]), [role=slider]:not([aria-disabled=true]), [role=spinbutton]:not([aria-disabled=true]), [role=textbox]:not([aria-disabled=true],[aria-readonly=true])";

        var validators = [];

        return {
            get submittableSelector() {
                return submittableSelector;
            },

            isSummittable: function(el) {
                return el.is(this.submittableSelector);
            },

            submittables: function(form) {
                return form.find(this.submittableSelector);
            },

            isCandidate: function(el) {
                return el.is(candidateSelector);
            },

            api: function(el) {
                if (!this.isSummittable(el)) return;

                return el.data("validator") || (function(el, registry) {
                    var api = createValidationAPI(el, registry);
                    el.data("validator", api);
                    return api;
                })(el, this);
            },

            register: function(validator) {
                validators.push(validator);
            },

            validators: function(el) {
                return validators.filter(function(v) {
                    return el.is(v.selector);
                });
            }
        };
    })();

    function createValidationAPI(el, registry) {
        return new HTMLValidation(el, registry);
    }

    /**
     * @see http://www.w3.org/TR/html5/forms.html#the-constraint-validation-api
     */
    function HTMLValidation(el, registry) {
        this.el = el;
        this.registry = registry;
        this.message = null;
        this.customMessage = null;

        this.state = (function(outer) {
            return {
                get customError() {
                    return !!outer.customMessage;
                },
                get valid() {
                    return !outer.customMessage && !outer.message;
                }
            };
        })(this);
    }

    function everyReverse(array, callback, thisArg) {
        for (var i = array.length - 1; i >= 0; i--) {
            if (!callback.call(thisArg, array[i], i, array)) {
                return false;
            }
        }
        return true;
    }

    function createInvalidEvent() {
        return $.Event("invalid", {
            _jqueryValidator: true
        });
    }

    HTMLValidation.prototype = {
        get willValidate() {
            return this.registry.isCandidate(this.el);
        },

        setCustomValidity: function(message) {
            this.customMessage = message;
        },

        get validity() {
            return this.state;
        },

        checkValidity: function(options) {
            options = options || {};

            if (!this.willValidate) {
                return true;
            }

            if (this.customMessage) {
                if (!options.suppressEvent) this.el.trigger(createInvalidEvent());
                return false;
            }

            this.message = null;
            everyReverse(this.registry.validators(this.el), function(v) {
                if (!v.validate) return true;

                var m = v.validate(this.el);
                if (m) {
                    this.message = m;
                    return false;
                } else {
                    return true;
                }
            }, this);

            if (this.message) {
                if (!options.suppressEvent) this.el.trigger(createInvalidEvent());
                return false;
            }

            return true;
        },

        get validationMessage() {
            if (!this.willValidate) return "";

            return this.customMessage || this.message || "";
        },

        updateUI: function() {
            if (this.validity.valid) {
                everyReverse(this.registry.validators(this.el), function(v) {
                    if (!v.clear) return true;

                    v.clear(this.el);
                    return false; // i.e. only run the first one
                }, this);
            } else {
                everyReverse(this.registry.validators(this.el), function(v) {
                    if (!v.show) return true;

                    v.show(this.el, this.validationMessage);
                    return false; // i.e. only run the first one
                }, this);
            }
        }
    };

    $.extend($.expr[":"], {
        /**
         * Exposes :submittable selector. Returns the element that can be used during form submission.
         */
        submittable: function (element, index, meta, stack) {
            return registry.isSummittable($(element));
        }
    });

    /**
     * @namespace jQuery
     */
    /**
     * @namespace jQuery.fn
     */

    /**
     * @memberof jQuery.fn
     */
    $.fn.willValidate = function() {
        var api = registry.api(this.first());
        if (api) {
            return api.willValidate;
        } else {
            return false;
        }
    };

    /**
     * @memberof jQuery.fn
     */
    $.fn.validationMessage = function() {
        var api = registry.api(this.first());
        if (api) {
            return api.validationMessage;
        } else {
            return "";
        }
    };

    /**
     * @memberof jQuery.fn
     */
    $.fn.checkValidity = function() {
        var api = registry.api(this.first());
        if (api) {
            return api.checkValidity();
        } else {
            return true;
        }
    };

    /**
     * @memberof jQuery.fn
     */
    $.fn.setCustomValidity = function(message) {
        return this.each(function() {
            var api = registry.api($(this));
            if (api) {
                api.setCustomValidity(message);
            }
        });
    };

    /**
     * @memberof jQuery.fn
     */
    $.fn.updateErrorUI = function() {
        return this.each(function() {
            var api = registry.api($(this));
            if (api) {
                api.updateUI();
            }
        });
    };

    /**
     * Provides a hook for customization of validator plugin.
     *
     * @namespace jQuery.validator
     */
    $.validator = (function() {
        return {
            /**
             * Registers the given validator.
             *
             * @memberof jQuery.validator
             *
             * @param {Object} validator
             * @param {String|Function} validator.selector Only the element satisfying the selector will be validated using this validator. It will be passed to <code>jQuery.fn.is</code>.
             * @param {Function} validator.validate The actual validation function. It must return a string of error message if the element fails.
             * @param {Function} validator.show The function to show the error.
             * @param {Function} validator.clear The function to clear the error.
             *
             * @example
jQuery.validator.register({
    selector: "input",
    validate: function(el) {
        if (el.attr("aria-required") === "true" && el.val().length === 0) {
            return "This field is required";
        }
    },
    show: function(el, message) {
    },
    clear: function(el) {
    }
});
             */
            register: function(validator) {
                $.each(arguments, function() {
                    registry.register(this);
                });
            }
        };
    })();


    /**
     * Statically validate the constraints of form.
     * @see http://www.w3.org/TR/html5/forms.html#statically-validate-the-constraints
     */
    function staticallyValidate(form, registry) {
        return registry.submittables(form)
            .map(function() {
                var api = registry.api($(this));
                if (!api || !api.willValidate || api.checkValidity({
                    suppressEvent: true
                })) return;
                return this;
            }).map(function() {
                var e = createInvalidEvent();
                $(this).trigger(e);

                if (!e.isDefaultPrevented()) {
                    return this;
                }
            });
    }

    /**
     * Interactively validate the constraints of form.
     * @see http://www.w3.org/TR/html5/forms.html#interactively-validate-the-constraints
     */
    function interactivelyValidate(form, registry) {
        var unhandleds = staticallyValidate(form, registry);

        if (unhandleds.length > 0) {
            unhandleds.each(function() {
                var api = registry.api($(this));
                if (api) {
                    api.updateUI();
                }
            });
            return false;
        }

        return true;
    }

    // Use event capturing to cancel and stop propagating the event when form is invalid
    // This way no other event handlers are executed
    document.addEventListener("submit", function(e) {
        var form = $(e.target);

        // TODO TBD if we want to do validation only when there is a certain class or based on config of $.validator

        if (!form.is("form") ||
            form.prop("noValidate") === true ||
            (form.prop("noValidate") === undefined && form.attr("novalidate") !== undefined)) {
            return;
        }

        if (!interactivelyValidate(form, registry)) {
            e.stopPropagation();
            e.preventDefault();
        }
    }, true);

    // Cancel the native invalid event (which is triggered by the browser supporting native validation)
    // to show our own UI instead
    $(document).on("cui-contentloaded", function(e) {
        $(registry.submittableSelector, e.target).on("invalid", function(e) {
            if (e._jqueryValidator) return;

            e.preventDefault();

            var el = $(this);
            el.checkValidity();
            el.updateErrorUI();
        });
    });
})(document, jQuery);
