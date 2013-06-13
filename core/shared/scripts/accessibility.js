(function ($, window, undefined) {

    /**
     * initializes role=button
     * @param  {jQuery} parent container within the buttons may be located
     */
    function initButton(parent) {
        parent.on('keydown', '[role="button"]:not(button)', function (event) {
            var elem = $(event.currentTarget);

            if (event.which === 32 || event.which === 13) {

                // button is not allowed to be disabled
                if (elem.attr('aria-disabled')) {
                    return;
                }

                // simple click
                elem.trigger('click');
            }
        });
    }

    /**
     * initializes role=tablist
     * @param  {jQuery} parent container within the tablists may be located
     */
    function initTablist(parent) {

        var tablists = parent.find('[role="tablist"]'),
            tabSelector = '[role="tab"]';

        tablists.on('keydown', tabSelector, function (event) {
            // enables keyboard support

            var elem = $(event.currentTarget),
                tabs = $(event.delegateTarget).find(tabSelector),
                focusElem = elem,
                keymatch = true,
                idx = tabs.index(elem);

            switch (event.which) {
                case 33: //page up
                case 37: //left arrow
                case 38: //up arrow
                    focusElem = idx-1 > -1 ? tabs[idx-1] : tabs[0];
                    break;
                case 34: //page down
                case 39: //right arrow 
                case 40: //down arrow
                    focusElem = idx+1 < tabs.length ? tabs[idx+1] : tabs[tabs.length-1];
                    break;
                case 36: //home
                    focusElem = tabs[0];
                    break;
                case 35: //end
                    focusElem = tabs[tabs.length-1];
                    break;
                default:
                    keymatch = false;
                    break;
            }

            if (keymatch) { // if a key matched then we set the currently focused element
                event.preventDefault();
                 // set focus class here to avoid having the focus glow with mouse click
                focusElem = $(focusElem);
                focusElem.addClass(focusClass)
                    .trigger('focus')
                    .trigger('click');
            }
        });
    }

    /**
     * initializes role=tablist
     * @param  {jQuery} parent container within the tablists may be located
     */
    function initAccordion(parent) {

        var tablists = parent.find('[role="tablist"]'),
            tabSelector = '[role="tab"]';

        tablists.on('keydown', tabSelector, function (event) {
            // enables keyboard support

            var elem = $(event.currentTarget),
                tabs = $(event.delegateTarget).find(tabSelector),
                focusElem = elem,
                keymatch = true,
                idx = tabs.index(elem);

            switch (event.which) {
                case 33: //page up
                case 37: //left arrow
                case 38: //up arrow
                    focusElem = idx-1 > -1 ? tabs[idx-1] : tabs[0];
                    break;
                case 34: //page down
                case 39: //right arrow 
                case 40: //down arrow
                    focusElem = idx+1 < tabs.length ? tabs[idx+1] : tabs[tabs.length-1];
                    break;
                case 36: //home
                    focusElem = tabs[0];
                    break;
                case 35: //end
                    focusElem = tabs[tabs.length-1];
                    break;
                default:
                    keymatch = false;
                    break;
            }

            if (keymatch) { // if a key matched then we set the currently focused element
                event.preventDefault();
                 // set focus class here to avoid having the focus glow with mouse click
                focusElem = $(focusElem);
                focusElem.addClass(focusClass)
                    .trigger('focus')
                    .trigger('click');
            }
        });
    }

    $(function () {
        var doc = $(document);

        initButton(doc);
    });

}(jQuery, this));
