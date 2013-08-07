(function($) {
  CUI.Accordion = new Class(/** @lends CUI.Accordion# */{
    toString: 'Accordion',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A widget for both accordions and collapsibles
      
            <ul data-init="accordion">
              <li>
                <h3>
                  <em>Tab 1</em> of the accordion
                </h3>
                Chocolate cake jelly cupcake dessert. Chocolate bar lemon drops croissant candy canes caramels jelly beans lemon drops pie wypas. Faworki donut macaroon jujubes brownie cupcake topping macaroon gummies. Halvah gummi bears brownie chupa chups. Fruitcake lemon drops gingerbread cake apple pie. Pastry carrot cake pie. Brownie oat cake gummies. Bonbon soufflé jujubes soufflé biscuit. Chocolate cake halvah chocolate cake candy canes powder chocolate croissant. Lollipop fruitcake muffin chocolate cake apple pie bear claw cookie tootsie roll. Chupa chups dessert icing gummies cake jelly pie sesame snaps. Wafer halvah cake sweet.
              </li>
              <li class="active">
                <h3>
                  <em>Tab 2</em> of the accordion
                </h3>
                Chocolate cake jelly cupcake dessert. Chocolate bar lemon drops croissant candy canes caramels jelly beans lemon drops pie wypas. Faworki donut macaroon jujubes brownie cupcake topping macaroon gummies. Halvah gummi bears brownie chupa chups. Fruitcake lemon drops gingerbread cake apple pie. Pastry carrot cake pie. Brownie oat cake gummies. Bonbon soufflé jujubes soufflé biscuit. Chocolate cake halvah chocolate cake candy canes powder chocolate croissant. Lollipop fruitcake muffin chocolate cake apple pie bear claw cookie tootsie roll. Chupa chups dessert icing gummies cake jelly pie sesame snaps. Wafer halvah cake sweet.
              </li>
              <li>
                <h3>
                  <em>Tab 3</em> of the accordion
                </h3>
                Chocolate cake jelly cupcake dessert. Chocolate bar lemon drops croissant candy canes caramels jelly beans lemon drops pie wypas. Faworki donut macaroon jujubes brownie cupcake topping macaroon gummies. Halvah gummi bears brownie chupa chups. Fruitcake lemon drops gingerbread cake apple pie. Pastry carrot cake pie. Brownie oat cake gummies. Bonbon soufflé jujubes soufflé biscuit. Chocolate cake halvah chocolate cake candy canes powder chocolate croissant. Lollipop fruitcake muffin chocolate cake apple pie bear claw cookie tootsie roll. Chupa chups dessert icing gummies cake jelly pie sesame snaps. Wafer halvah cake sweet.
              </li>                             
            </ul>
            
            <div data-init="collapsible">
                <h3>
                  <em>Headline</em> of the collapsible
                </h3>
                Chocolate cake jelly cupcake dessert. Chocolate bar lemon drops croissant candy canes caramels jelly beans lemon drops pie wypas. Faworki donut macaroon jujubes brownie cupcake topping macaroon gummies. Halvah gummi bears brownie chupa chups. Fruitcake lemon drops gingerbread cake apple pie. Pastry carrot cake pie. Brownie oat cake gummies. Bonbon soufflé jujubes soufflé biscuit. Chocolate cake halvah chocolate cake candy canes powder chocolate croissant. Lollipop fruitcake muffin chocolate cake apple pie bear claw cookie tootsie roll. Chupa chups dessert icing gummies cake jelly pie sesame snaps. Wafer halvah cake sweet.
            </div>
                  
      @example
      <caption>Instantiate Accordion with data API</caption>
      <description>This is the most convenient way to instantiate an accordion, as an accordion in any case needs some markup to be initialized. Give the "active" class to the element that should be opened by default.</description>
&lt;ul data-init="accordion"&gt;
  &lt;li&gt;
    &lt;h3&gt;
      &lt;em&gt;Tab 1&lt;/em&gt; of the accordion
    &lt;/h3&gt;
    ...
  &lt;/li&gt;
  &lt;li class="active"&gt;
    &lt;h3&gt;
      &lt;em&gt;Tab 2&lt;/em&gt; of the accordion
    &lt;/h3&gt;
    ...
  &lt;/li&gt;
&lt;/ul&gt;

      @example
      <caption>Instantiate Collapsible with data API</caption>
      <description>Add the "active" class to open the collapsible by default.</description>
&lt;div data-init="collapsible"&gt;
  &lt;h3&gt;
    &lt;em&gt;Headline&lt;/em&gt; of the collapsible
  &lt;/h3&gt;
  ...
&lt;/div&gt;

      @example
      <caption>Instantiate Accordion with jQuery plugin</caption>
      <description>The widget will try to guess if it is a collapsible instead of accordion by testing if the CSS class "collapsible" is present.</description>
  $("#accordion").accordion({active: 2}); // Set active tab
  $("#collapsible").accordion({active: true}); // Set collapsible to "opened" (=active)
          
      @desc Creates a new accordion or collapsible
      @constructs

      @param {Object} options                               Widget options.
      @param {Mixed}  [options.active=false]                Index of the initial active tab of the accordion or one of true/false for collapsibles
            
    */
    construct: function(options) {
      this.isAccordion = (!this.$element.hasClass("collapsible")) && (this.$element.data("init") !== "collapsible");
    
      if (this.isAccordion) this.$element.addClass("accordion");
    
      if (this.isAccordion) {
        var activeIndex = this.$element.children(".active").index();
        if (this.options.active !== false) activeIndex = this.options.active;
        this.$element.children().each(function(index, element) {
          this._initElement(element, index != activeIndex);
        }.bind(this));
      } else {
        this._initElement(this.$element, !(this.options.active || this.$element.hasClass("active")));
      }
      
      this.$element.on("click", "h3", this._toggle.bind(this));
      
      this.$element.on("change:active", this._changeActive.bind(this));
      
      // Prevent text selection on header
      this.$element.on("selectstart", "h3", function(event) {
        event.preventDefault();
      });
    },
    
    defaults: {
      active: false
    },
    
    isAccordion: false,
    
    _toggle: function(event) {
      var el = $(event.target).closest(".collapsible");
      var isCurrentlyActive = el.hasClass("active");
      var active = (isCurrentlyActive) ? false : ((this.isAccordion) ? el.index() : true); 
      this.setActive(active);
    },
    _changeActive: function() {
      if (this.isAccordion) {
        this._collapse(this.$element.children(".active"));
        if (this.options.active !== false) {
          var activeElement = this.$element.children().eq(this.options.active);
          this._expand(activeElement);
        }
      } else {
        if (this.options.active) {
          this._expand(this.$element);
        } else {
          this._collapse(this.$element);
        }
      }      
    },
    setActive: function(active) {
      this.options.active = active;
      this._changeActive();    
    },
    _initElement: function(element, collapse) {
        // Add correct header
        if ($(element).find("h3").length === 0) $(element).prepend("<h3>&nbsp;</h3>");
        if ($(element).find("h3 i").length === 0) $(element).find("h3").prepend("<i></i>&nbsp;");
        
        $(element).addClass("collapsible");
        // Set correct initial state
        if (collapse) {
          $(element).removeClass("active");
          $(element).height($(element).find("h3").height());
          $(element).find("h3 i").removeClass("icon-accordiondown").addClass("icon-accordionup");
        } else {
          $(element).addClass("active");
          $(element).css("height", "auto");
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
           el.css("height", "auto"); // After animation we want the element to adjust its height automatically
         });
    },
    /** @ignore */
    _calcHeight: function(el) {
      // Dimension calculation of invisible elements is not trivial.
      // "Best practice": Clone it, put it somwhere on the page, but not in the viewport,
      // and make it visible. 
      var el2 = $(el).clone();
      el2.css({display: "block",
               position: "absolute",
               top: "-10000px",
               width: el.width(), // Ensure we calculate with the same width as before
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
    $("[data-init~=accordion],[data-init~=collapsible]").accordion();
  });
}(window.jQuery));


