(function($) {
  CUI.DropdownList = new Class(/** @lends CUI.DropdownList# */{
    toString: 'DropdownList',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A dropdown list widget
      
      
      @desc Creates a dropdown list appended to any DOM element
      @constructs
      
      @param {Object}          options                               Component options
      @param {Array}           [options.options]                Array of options in the list
      @param {Function}        [options.optionRenderer=null]                Callback function to render one option
      @param {jQuery Object}   [options.positioningElement=null]     If this optional element is given, the dropdown list
                                                                     will be placed beyond it instead of the standard element
      @param {String}   [options.cssClass=null]     An optional CSS class string that will be added to the list.
      
    */
    construct: function(options) {
        this.$element.on('change:options change:optionRenderer', this.update.bind(this));

        // Listen to events 
        this.$element.on("keydown", "", this._keyPressed.bind(this));
        
        var hideTimeout = null; // Hacky: Remove hide timeout if element is focussed right after blur!
        this.$element.on("blur", "", function() {
            hideTimeout = this.hide(200);
        }.bind(this));
        this.$element.on("focus", "", function() {
            if (hideTimeout) {
                clearTimeout(hideTimeout);
                hideTimeout = null;
            }
        }.bind(this)); 
       
    },
    
    defaults: {
        positioningElement: null,
        optionRenderer: null,
        options: ["Apples", "Pears", "Bananas", "Strawberries"],
        cssClass: null
    },
    listElement: null,
    currentIndex: -1,
    
    /**
     * Show this list
     */
    show: function() {
        // Hide old list (if any!)
        this._unrender();
        this.currentIndex = -1;
        this.$element.focus();
        this._render();
    },
    
    /**
     * Hide this list with an optional delay in millis
     * @param int delay Delay before hiding element in milliseconds
     * @return void or timeout object if a delay was given
     */
    hide: function(delay) {
        if (delay > 0) {
            return setTimeout(this._unrender.bind(this), delay);
        } else {
            this._unrender();
        }
        return null;
    },
    
    /**
     * @return boolean true, if this list is currently visible
     */
    isVisible: function() {
        return (this.listElement !== null);
    },
    
    /**
     * Toggles this list from visible to hidden and vice versa.
     */
    toggle: function() {
      if (this.listElement) {
          this.hide();
      } else {
          this.show();
      }
    },
    
    /**
     * Updates the rendering of this widget.
     */
    update: function() {
        if (this.listElement) {
            this._unrender();
            this._render();
        }
    },
    
    /** @ignore */    
    _keyPressed: function(event) {        
        var key = event.keyCode;
        
        // Only listen to keys if there is an autocomplete box right now
        if (!this.listElement) {
            return;
        }

        var currentIndex = this.currentIndex;
        
        if (key === 38) { // up
            event.preventDefault();
            if (currentIndex > 0) currentIndex--;
        }
        
        if (key === 40) { // down
            event.preventDefault();
            if (currentIndex < (this.listElement.children().length - 1)) currentIndex++;
        }
        
        if (key === 27) { // escape
            event.preventDefault();
            this.hide();
            return;
        }
        
        if (key === 13 || key === 20) { // return or space
           event.preventDefault();
           if (currentIndex >= 0) {
                this._triggerSelect(currentIndex);
                return;
           }
        }
        
        this.currentIndex = currentIndex;

        // Set new css classes
        this.listElement.children().removeClass("selected");
        if (currentIndex >= 0) $(this.listElement.children().get(currentIndex)).addClass("selected");
        
        return;
    },
    /** @ignore */    
    _unrender: function() {
        if (this.listElement) {
            this.listElement.remove();
            this.listElement = null;        
        }
    },
    /** @ignore */    
    _render: function() {
        var options = this.options.options;
        if (options.length === 0) return;
               
        var list = $("<ul class=\"dropdown-list\">");
        list.width(this.$element.outerWidth());
        if (this.cssClass) list.addClass(this.cssClass);
        
        
        $.each(options, function(index, value) {
            var el = (this.options.optionRenderer) ? this.options.optionRenderer(index, value) : $("<span>" + value + "</span>");
            var li = $("<li data-id=\"" + index + "\">");
            if (index === this.currentIndex) li.addClass("selected");
            li.append(el);
            list.append(li);
        }.bind(this));
        
        list.on("click", "li", function(event) {
           this._triggerSelect($(event.target).closest("li").attr("data-id"));
        }.bind(this));
        
        // Calculate correct position and size on screen
        var el = (this.options.positioningElement) ? this.options.positioningElement : this.$element;
        var left = el.position().left + parseFloat(el.css("margin-left"));
        var top = el.position().top + el.outerHeight(true) - parseFloat(el.css("margin-bottom"));
        var width = el.outerWidth(false);
        
        list.css({position: "absolute",
                  left: left + "px", 
                  top: top + "px", 
                  width: width + "px"});

        this.listElement = list;
        el.after(list);

    },
    
    /** @ignore */    
    _triggerSelect: function(index) {
    // Trigger a change event
        this.$element.focus();
        var e = $.Event('dropdown-list:select', {
          selectedIndex: index,
          selectedValue: this.options.options[index]
        });
        this.$element.trigger(e);    
    }
    
  });

  CUI.util.plugClass(CUI.DropdownList);
}(window.jQuery));
