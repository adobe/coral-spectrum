/*
    Sample usage:

    $(".toolbar").responsive({
        "narrow": function($toolbar, size) {
            return $toolbar.width() < 36*size.rem();
        },
        "wide": function($toolbar, size) {
            return $toolbar.width() > 64*size.rem();
        }
    });

    This will add the "narrow" class if the toolbar element is less than 36rem wide
    and it will add the "wide" class if it is wider than 64rem. For a width that is
    between 36rem and 64rem the toolbar element won't have any additional class.

    Note that the classes to set on the element are re-evaluated on (debounced) resize
    events as well as on the custom responsive event. The custom responsive event
    can be triggered manually as follows:

    $(".toolbar").responsive();
*/
(function($, window, undefined) {

    var defaults = {
        "threshold": 200, // How often the resize and responsive events should be considered
        "applyClassToElement": undefined
    };

    // Utility functions to help calculating sizes
    var size = {
        "rem": function () {
            // This caches the rem value to calculate it only once, but might lead to wrong results if the font size gets changed
            if (size._rem === undefined) {
                size._rem = parseInt($("body").css("font-size"));
            }
            return size._rem;
        },
        "em": function (elem) {
            return parseFloat(elem.css("font-size"));
        }
    };

    // Adds and removes classes to the given element depending on the result of the associated functions.
    // Can be called with or without parameters:
    // When a breakpoints object is provided, the responsive listener gets setup to the given element.
    // The options parameter is optional, it allows to change the default settings.
    // When no parameters are provided it triggers a responsive event on the provided object.
    $.fn.responsive = function responsive(breakpoints, options) {
        return this.each(function responsiveEach() {
            var elem = $(this),
                didApplyClassNames = false,
                scheduledresponsiveCheck = false,
                settings;

            if (breakpoints) {
                settings = $.extend({}, defaults, options);
                settings.applyClassToElement = settings.applyClassToElement || elem;

                function responsiveEventHandler() {
                    if (elem.is(":visible")) {
                        if (!scheduledresponsiveCheck) {
                            applyClassNames();
                            scheduledresponsiveCheck = setTimeout(function responsiveCheck() {
                                scheduledresponsiveCheck = false;
                                if (!didApplyClassNames) {
                                    applyClassNames();
                                }
                            }, settings.threshold);
                        } else {
                            didApplyClassNames = false;
                        }
                    }
                }

                function applyClassNames() {
                    didApplyClassNames = true;
                    for (var className in breakpoints) {
                        settings.applyClassToElement.toggleClass(className, breakpoints[className](elem, size));
                    }
                }

                elem.on("responsive", responsiveEventHandler);
                $(window).on("resize.responsive", responsiveEventHandler);
            }

            elem.trigger("responsive");

        });
    }

}(jQuery, this));
