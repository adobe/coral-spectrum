
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

    /**
      * Multiplies the image with the provided color, this will insert a canvas element before the img element.
      * image: jQuery object of the image to multiply
      * color: RGB array of values between 0 and 1
      */
    function multiplyImage(image, color) {
        var img     = image[0];
        var canvas  = $("<canvas class='"+img.className+"' width='"+img.naturalWidth+"' height='"+img.naturalHeight+"'></canvas>").insertBefore(img)[0];
        var context = canvas.getContext("2d");

        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
        
        var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        var data    = imgData.data;
        
        for (var i = 0, l = data.length; i < l; i += 4) {
            data[i]   *= color[0]; // red
            data[i+1] *= color[1]; // green
            data[i+2] *= color[2]; // blue
        }
        
        context.putImageData(imgData, 0, 0);

    }

    /* Temporary static way of invoking the multiplyImage effect over selected items */
    $(".grid article.selected img:visible").load(function () {
        var image    = $(this);
        var colorHex = image.closest("a").css("background-color"); // Let's grab the color form the card background
        var colorRgb = $.map(colorHex.match(/(\d+)/g), function (val) { return val/255; }); // RGB values between 0 and 1
        multiplyImage(image, colorRgb);
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
