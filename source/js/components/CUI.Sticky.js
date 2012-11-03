(function($) {
  CUI.Sticky = new Class(/** @lends CUI.Sticky# */{
    toString: 'Sticky',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc A sticky widget - can make every element sticky to screen
      
      @desc Makes element sticky, i.e. the element does not scroll out of screen.
    */
    construct: function(options) {
        this.$element.addClass("sticky");
        this.wrapper = $("<div>").addClass("sticky-wrapper");
        this.$element.wrapAll(this.wrapper);
       
        this.wrapper = this.$element.parent();
        this.wrapper.height(this.$element.outerHeight(true));
        this.scrollingElement = $(document);
        this.scrollingElement.on("scroll", this._fixElementPosition.bind(this));
        $(window).on("resize", this._fixElementPosition.bind(this));
    },

    _fixElementPosition: function() {
         var pos = this.wrapper.offset().top;
         var scroll = this.scrollingElement.scrollTop();
         var startAt = this._getStickPosition();
         var w = this.wrapper.width();
         if ((pos - startAt) < scroll) {

            this.$element.css({
                "position": "fixed",
                "top": startAt+"px",
                "width": w+"px"
            });
         } else {
            this.$element.css({
                "position": "",
                "top": "",
                "width": w+"px"
            });
         }

    },

    _getStickPosition: function() {
        var etop = this.wrapper.offset().top;
        var startAt = 0;
        $(".sticky-wrapper").each(function(index, element) {
            if ($(element).offset().top < etop) startAt += $(element).outerHeight(true);
        }.bind(this));
        return startAt;
    },
    
    scrollingElement: null,
    wrapper: null
  });

  CUI.util.plugClass(CUI.Sticky);

  // Data API
  if (CUI.options.dataAPI) {
    $(function() {
        $(".sticky,[data-init=sticky]").sticky();
    });
  }
}(window.jQuery));
