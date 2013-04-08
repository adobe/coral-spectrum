(function($) {

  // Currently no widget "on its own", but just a event listener on content load to
  // initialize the tooltips.
  $(document).on("cui-contentloaded.data-api", function(e) {
    $(".form-error", e.target).each(function() {
       var target = $(this);
       var isRight = target.hasClass("tooltip-right");
       new CUI.Tooltip({
             target: target,
             content: target.text(),
             interactive: true,
             arrow: (isRight) ? "left" : "top",
             type: "error",
             distance: (isRight) ? 0 : 10
       });
     });
  });

}(window.jQuery));
