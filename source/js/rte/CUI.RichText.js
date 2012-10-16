(function ($) {

    CUI.RichText = new Class(/** @lends CUI.RichText# */ {

        toString:'RichText',

        extend:CUI.Widget,

        construct:function (options) {
            this.options = options || { }
            // TODO ...
        }
    });

    // Register ...
    CUI.util.plugClass(CUI.RichText); // TODO check that it works as expected ...

    // Data API
    if (CUI.options.dataAPI) {
        $(function () {
            $('body').on('click.rte.data-api', '.editable', function (e) {

                alert("Start editing ...");
                /*
                var $trigger = $(this);

                // Get the target from data attributes
                var $target = CUI.util.getDataTarget($trigger);

                // Pass configuration based on data attributes in the triggering link
                var href = $trigger.attr('href');
                var options = $.extend({ remote:!/#/.test(href) && href }, $target.data(), $trigger.data());

                // Parse buttons
                if (typeof options.buttons === 'string') {
                    options.buttons = JSON.parse(options.buttons);
                }

                // If a modal already exists, show it
                var instance = $target.data('modal');
                var show = true;
                if (instance && instance.get('visible'))
                    show = false;

                // Apply the options from the data attributes of the trigger
                // When the dialog is closed, focus on the button that triggered its display
                $target.modal(options).one('hide', function () {
                    $trigger.focus();
                });

                // Perform visibility toggle if we're not creating a new instance
                if (instance)
                    $target.data('modal').set({ visible:show });
                */

                // Stop links from navigating
                e.preventDefault();
            });
        });
    }

})(window.jQuery);


