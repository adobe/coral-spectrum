
jQuery(function($) {

    // Initialize grid & attach widget
    var $grid = $(".grid");
    $grid.cardView();
    $grid.on("change:selection", function(e) {
        var gl = e.widget;
        /*
        console.log(gl.getSelection());
        console.log(gl.getSelection(true));
        */
    });

    $("#main-rail").on("open close", function() {
        CUI.CardView.get($grid).relayout();
    });

    $("#selection-mode").fipo("tap", "click", function(e) {
        // use API
        CUI.CardView.get($grid).toggleGridSelectionMode();
        // use CSS contract
        // $grid.toggleClass("selection-mode");
        // $grid.find("article").removeClass("selected");
    });

    $("#display-mode").fipo("tap", "click", function(e) {
        var gl = CUI.CardView.get($grid);
        var dispMode = gl.getDisplayMode();
        switch (dispMode) {
            case CUI.CardView.DISPLAY_GRID:
                gl.setDisplayMode(CUI.CardView.DISPLAY_LIST);
                break;
            case CUI.CardView.DISPLAY_LIST:
                gl.setDisplayMode(CUI.CardView.DISPLAY_GRID);
                break;
        }
    });

    $('.tagpicker').filters({
        multiple: true
    });

    // make rail pullable
    var rail = $('#main-rail');
    rail.removeClass('with-toolbar-bottom');
    rail.rail({
        refreshCallback: function() {
            var def = $.Deferred();
            setTimeout(function() {
                def.resolve();
            }, 3000);

            return def.promise();
        }
    });

    // closable rail
    $('#close-rail').fipo('tap', 'click', function () {
        if (rail.hasClass("closed")) {
            rail.removeClass("closed");
            rail.trigger("open");
//          $(this).removeClass("icon-rightrailclose");
//          $(this).addClass("icon-rightrailopen");
        } else {
            rail.addClass("closed");
            rail.trigger("close");
//          $(this).addClass("icon-rightrailclose");
//          $(this).removeClass("icon-rightrailopen");
        }
    });

    // closable bottom toolbar in rail
    var quickform = $('.quickform');

    quickform.find('.trigger').fipo('tap', 'click', function () {
        quickform.toggleClass('open');
    });
});
