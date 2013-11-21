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
    function cloneLeft(buttons) {
        return buttons.filter("[data-action=prev], [data-action=cancel]").first().addClass("hidden")
            .clone().addClass("left").each(processButton);
    }

    function cloneRight(buttons) {
        return buttons.filter("[data-action=next]").first().addClass("hidden")
            .clone().addClass("primary right").each(processButton);
    }

    function cloneCancel(buttons) {
        return buttons.filter("[data-action=cancel]").first()
            .clone().addClass("quiet right").each(processButton);
    }

    function processButton(i, el) {
        $(el).removeClass("hidden").not("button").toggleClass("button", true);
    }

    function buildNav(wizard) {
        var sections = wizard.children(".step");
        var nav = wizard.children(".toolbar");

        if (nav.length === 0) {
            wizard.prepend(function() {
                nav = $('<nav class="toolbar"><ol class="center"></ol></nav>');
                var ol = nav.children("ol");

                sections.map(function() {
                    return $("<li />").text($(this).data("stepTitle") || this.title).get(0);
                }).appendTo(ol);

                return nav;
            });
        }

        nav.toggleClass("theme-dark", true);

        nav.find("> ol > li").first().addClass("active");

        var buttons = sections.first().find(".flexwizard-control");

        nav.prepend(function() {
            return cloneLeft(buttons);
        }).append(function() {
            return cloneRight(buttons).add(cloneCancel(buttons).toggleClass("hidden", true));
        });
    }

    function insertAfter(wizard, step, refStep) {
        var navStep = $("<li />").text(step.data("stepTitle") || step.attr("title"));

        var index = wizard.children(".step").index(refStep);
        wizard.find("> .toolbar > ol > li").eq(index).after(navStep);
        refStep.after(step);
    }

    function showNav(to) {
        if (to.length === 0) return;

        to.addClass("active").removeClass("stepped");
        to.prevAll("li").addClass("stepped").removeClass("active");
        to.nextAll("li").removeClass("active stepped");
    }

    function showStep(wizard, to, from) {
        if (to.length === 0) return;

        if (from) {
            from.removeClass("active");
        }

        to.toggleClass("active", true);

        wizard.trigger("flexwizard-stepchange", [to, from]);
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
            case "cancel":
                return;
        }

        if (to.length === 0) return;

        var buttons = to.find(".flexwizard-control");

        cloneLeft(buttons).replaceAll(nav.children(".left"));
        cloneRight(buttons).replaceAll(nav.children(".right:not([data-action=cancel])"));

        nav.children(".right[data-action=cancel]").toggleClass("hidden", to.prev(".step").length === 0);

        showNav(toNav);
        showStep(wizard, to, from);
    }

    CUI.FlexWizard = new Class(/** @lends CUI.FlexWizard# */{
        toString: "FlexWizard",

        extend: CUI.Widget,

        /**
            @extends CUI.Widget
            @classdesc Wizard component

            @example
            <caption>Instantiate FlexWizard with data API</caption>
&lt;form class="flexwizard" data-init="flexwizard" action="test" method="post">
    &lt;div class="step" data-step-title="Step1">
        &lt;a class="flexwizard-control button" href="cancel.html" data-action="cancel">Cancel&lt;/a>
        &lt;button class="flexwizard-control" type="button" data-action="next">Next&lt;/button>

        &lt;h2>Simple Step&lt;/h2>
        &lt;p>Content.&lt;/p>
    &lt;/div>

    &lt;div class="step" title="Step2">
        &lt;button class="flexwizard-control" type="button" data-action="prev">Back&lt;/button>
        &lt;button class="flexwizard-control" type="button" data-action="next">Next&lt;/button>

        &lt;h2>Custom Nav Buttons&lt;/h2>
        &lt;p>Word on a future state of a page or site section without impacting the production state.&lt;/p>
    &lt;/div>
&lt;/form>

            @example
            <caption>Instantiate Flexwizard with jQuery plugin</caption>
$("#flexwizard").flexWizard();
      
            @desc Creates a new wizard
            @constructs
         */
        construct: function(options) {
            var wizard = this.$element;

            buildNav(wizard);

            wizard.on("click", ".flexwizard-control", function(e) {
                controlWizard(wizard, $(this).data("action"));
            });

            showStep(wizard, wizard.children(".step").first());
        },

        /**
            Add the given step to the wizard.

            @param {HTMLElement|jQuery|String} step The step to be added
            @param {Number} [index] The index the step is added. If not passed, the step is added as the last one
         */
        add: function(step, index) {
            var wizard = this.$element;

            if (index === undefined) {
                this.addAfter(step, wizard.children(".step").last());
                return;
            }

            if (!step.jquery) {
                step = $(step);
            }

            step.toggleClass("step", true);
            insertAfter(wizard, step, wizard.children(".step").eq(index));
        },

        /**
            Add the given step after the given reference step.

            @param {HTMLElement|jQuery|String} step The step to be added
            @param {HTMLElement|jQuery} refStep The reference step
         */
        addAfter: function(step, refStep) {
            var wizard = this.$element;

            if (!step.jquery) {
                step = $(step);
            }

            if (!refStep.jquery) {
                refStep = $(refStep);
            }

            step.toggleClass("step", true);
            insertAfter(wizard, step, refStep);
        }
    });

    CUI.Widget.registry.register("flexwizard", CUI.FlexWizard);

    CUI.util.plugClass(CUI.FlexWizard);

    if (CUI.options.dataAPI) {
        $(document).on("cui-contentloaded.data-api", function(e) {
            CUI.FlexWizard.init($("[data-init~=flexwizard]", e.target));
        });
    }
}(window.jQuery));
