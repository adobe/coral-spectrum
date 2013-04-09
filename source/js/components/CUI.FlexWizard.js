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
    function buildNav(wizard) {
        wizard.prepend(function() {
            var sections = wizard.children(".step");

            var nav = $('<nav class="toolbar"><ol class="center"></ol></nav>');
            var ol = nav.children("ol");

            sections.map(function() {
                return $("<li />").text(this.title);
            }).appendTo(ol);
            ol.children("li").first().addClass("active").append("<div class='lead-fill' />");

            var buttons = sections.first().find(".flexwizard-control");

            nav.prepend(function() {
                return buttons.filter("[data-action=prev], [data-action=cancel]").first().addClass("hidden")
                    .clone().addClass("back left").removeClass("hidden");
            });
            nav.append(function() {
                return buttons.filter("[data-action=next]").first().addClass("hidden")
                    .clone().addClass("primary right").removeClass("hidden");
            });

            return nav;
        });
    }

    function controlWizard(wizard, action) {
        var nav = wizard.children("nav");
        var from = wizard.children(".step.active");
        var fromNav = nav.children("ol").children("li.active");

        var to, toNav;
        switch (action) {
            case "prev":
                to = from.prev(".step");
                toNav = fromNav.prev("li");
                break;
            case "next":
                to = from.next(".step");
                toNav = fromNav.next("li");
                break;
        }

        if (to.length === 0) return;

        var buttons = to.find(".flexwizard-control");

        from.removeClass("active");
        to.addClass("active");

        buttons.filter("[data-action=prev], [data-action=cancel]").first().addClass("hidden")
            .clone().addClass("back left").removeClass("hidden").replaceAll(nav.children(".left"));

        var right = buttons.filter("[data-action=next]").first().addClass("hidden")
            .clone().addClass("primary right").removeClass("hidden").replaceAll(nav.children(".right"));

        toNav.addClass("active").removeClass("stepped");
        toNav.prevAll("li").addClass("stepped").removeClass("active");
        toNav.nextAll("li").removeClass("active stepped");
    }

    CUI.FlexWizard = new Class({
        toString: "FlexWizard",

        extend: CUI.Widget,

        construct: function(options) {
            var wizard = this.$element;

            buildNav(wizard);
            wizard.children(".step").first().toggleClass("active", true);

            wizard.on("click", ".flexwizard-control", function(e) {
                controlWizard(wizard, $(this).data("action"));
            });
        }
    });

    CUI.util.plugClass(CUI.FlexWizard);

    if (CUI.options.dataAPI) {
        $(document).on("cui-contentloaded.data-api", function(e) {
            $("[data-init=flexwizard]", e.target).flexWizard();
        });
    }
}(window.jQuery));
