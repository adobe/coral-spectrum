
jQuery(function($) {

    // Initialize grid & attach widget
    var $grid = $(".grid");
    $grid.gridList();

    $("#main-rail").on("open close", function() {
        $grid.gridList().relayout();
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
