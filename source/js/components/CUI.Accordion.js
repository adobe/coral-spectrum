(function($) {
  CUI.Accordion = new Class(/** @lends CUI.Accordion# */{
    toString: 'Accordion',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      <em>Work in progress. Not for production use.</em>
      
      This widget currently has no options
      
      @classdesc 
    */
    construct: function(options) {
      this.isAccordion = !this.$element.hasClass("collapsible");
    
      if (this.isAccordion) this.$element.addClass("accordion");
    
      if (this.isAccordion) {
        this.$element.children().each(function(index, element) {
          this._initElement(element, index > 0);
        }.bind(this));
      } else {
        this._initElement(this.$element, !this.$element.hasClass("active"));
      }
      
      this.$element.on("click", "h3", this.toggle.bind(this));
      
      // Prevent text selection on header
      this.$element.on("selectstart", "h3", function(event) {
        event.preventDefault();
      });
    },
    
    isAccordion: false,
    
    toggle: function(event) {
      var el = $(event.target).closest(".collapsible");
      var isCollapsed = !el.hasClass("active");
      if (isCollapsed) {
        var el2 = this.$element.find(".active");
        this._collapse(el2);
        this._expand(el);
      } else {
        this._collapse(el);
      }
    },
    _initElement: function(element, collapse) {
        if ($(element).find("h3").length == 0) $(element).prepend("<h3>&nbsp;</h3>");
        if ($(element).find("h3 i").length == 0) $(element).find("h3").prepend("<i>");
        
        $(element).addClass("collapsible");
        $(element).data("accordion-full-height", $(element).height());
        if (collapse) {
          $(element).height($(element).find("h3").height());
          $(element).find("h3 i").removeClass("icon-accordiondown").addClass("icon-accordionup");
        } else {
          $(element).addClass("active");
          $(element).find("h3 i").removeClass("icon-accordionup").addClass("icon-accordiondown");
        }    
    },
    _collapse: function(el) {
         el.removeClass("active");
         el.find("h3 i").removeClass("icon-accordiondown").addClass("icon-accordionup");
         el.animate({height: el.find("h3").height()}, "fast");
    },
    _expand: function(el) {
         el.addClass("active");
         el.find("h3 i").removeClass("icon-accordionup").addClass("icon-accordiondown");
         var h = this._calcHeight(el);
         el.animate({height: h}, "fast", function() {
           el.css("height", "auto");
         });
    },
    _calcHeight: function(el) {
      var el2 = $(el).clone();
      el2.css({display: "block",
               position: "absolute",
               top: "-10000px",
               width: el.width(),
               height: "auto"});
      $("body").append(el2);
      var h = el2.height();
      el2.remove();
      return h;
    }
  });

  CUI.util.plugClass(CUI.Accordion);
  
  // Data API
  $(document).on("cui-contentloaded.data-api", function(e) {
    $(".accordion,.collapsible").accordion();
  });
}(window.jQuery));


