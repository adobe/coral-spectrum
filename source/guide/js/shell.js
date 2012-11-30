
jQuery(function($) {

    // Initialize grid & attach widget
    var $grid = $(".grid");
    $grid.gridList();
    $grid.on("change:selection", function(e) {
        var gl = e.widget;
        /*
        console.log(gl.getSelection());
        console.log(gl.getSelection(true));
        */
    });

    $("#main-rail").on("open close", function() {
        CUI.GridList.get($grid).relayout();
    });

    $("#selection-mode").fipo("tap", "click", function(e) {
        CUI.GridList.get($grid).toggleGridSelectionMode();
    });

    $("#display-mode").fipo("tap", "click", function(e) {
        var gl = CUI.GridList.get($grid);
        var dispMode = gl.getDisplayMode();
        switch (dispMode) {
            case CUI.GridList.DISPLAY_GRID:
                gl.setDisplayMode(CUI.GridList.DISPLAY_LIST);
                break;
            case CUI.GridList.DISPLAY_LIST:
                gl.setDisplayMode(CUI.GridList.DISPLAY_GRID);
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
