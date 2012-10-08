(function($) {
  CUI.Filters = new Class(/** @lends CUI.Filters# */{
    toString: 'Filters',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc An autocompletable filters&tags widget
      
      <div class="alert error">
        <button class="close" data-dismiss="alert">&times;</button>
        <strong>ERROR</strong><div>Uh oh, something went wrong with the whozit!</div>
      </div>
      
      @example
<caption>Instantiate with Class</caption>
var filters = new CUI.Filters({
  element: '#myFilter',
  options: ["Apples", "Pears", "Oranges"]
});

// Set the selected option
filters.setSelectedIndex(1);
        
      @example
<caption>Instantiate with jQuery</caption>
$('#myFilters').alert({
  options: ["Apples", "Pears", "Oranges"]
});

// A reference to the element's filters instance is stored as data-filters
var filters = $('#myFilters').data('filters');
var index = filters.getSelectedIndex();

      @desc Creates a filters field
      @constructs
      
      @param {Object} options                               Component options
      @param {Function} [options.autocompleteCallback=use options]      Callback for autocompletion
      @param {Array} [options.options=example array]                     Array of available options if no autocomplete callback is used
      @param {boolean} [options.multiple=false]                     Can the user select more than one option?
      @param {int} [options.delay=200]                     Delay before starting autocomplete when typing
      @param {boolean} [options.highlight=true]                     Highlight search string in results
    */
    construct: function(options) {
        this.$element.addClass("filters");
        
        // Set callback to default if there is none
        if (!this.options.autocompleteCallback) this.options.autocompleteCallback = this._defaultAutocompleteCallback.bind(this);


        // Listen to events
        this.$element.on("input", "", function() {
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = setTimeout(this._inputChanged.bind(this), this.options.delay);
        }.bind(this));
        
        this.$element.on("blur", "", function() {
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = null;
            setTimeout(this._hideAutocompleter.bind(this), 200); // Use timeout to have a chance to select from list
        }.bind(this));
        
        this.$element.on("keydown", "", this._keyPressed.bind(this));
       
    },
    
    defaults: {
        autocompleteCallback: null,
        options: ["Apples", "Pears", "Bananas", "Strawberries"],
        multiple: false,
        delay: 200,
        highlight: true
    },
    
    /**
     * @param {int} index     Sets the currently selected option by its index
     */
    setSelectedIndex: function(index) {
        if (index < 0 || index >= this.options.options.length) return;
        this.selectedIndex = index;
        var option = this.options.options[index];
        this.$element.attr("value", option);
    },
    
    /**
     * @return {int} The currently selected options by index or -1 if none is selected
     */
    getSelectedIndex: function() {
        return this.selectedIndex;
    },

    autocompleteElement: null,
    typeTimeout: null,
    selectedIndex: -1, // For single term only
    
    _keyPressed: function(event) {        
        var key = event.keyCode;
                
        // Only listen to keys if there is an autocomplete box right now
        if (!this.autocompleteElement) return;

        var currentIndex = this.autocompleteElement.find("li.selected").index();
        
        if (key === 38) { // up
            event.preventDefault();
            if (currentIndex > 0) currentIndex--;
        }
        
        if (key === 40) { // down
            event.preventDefault();
            if (currentIndex < (this.autocompleteElement.children().length - 1)) currentIndex++;
        }
        
        if (key === 27) { // escape
            event.preventDefault();
            this._hideAutocompleter();
            return;
        }
        
        if (key === 13) { // return
           event.preventDefault();
           if (currentIndex >= 0) {
                this.setSelectedIndex($(this.autocompleteElement.children().get(currentIndex)).attr("data-id"));
                this._hideAutocompleter();
                this.$element.focus();
                return;
           }
        }
        
        // Set new css classes
        this.autocompleteElement.children().removeClass("selected");
        if (currentIndex >= 0) $(this.autocompleteElement.children().get(currentIndex)).addClass("selected");
        
        return;
    },

    _inputChanged: function() {
        var searchFor = this.$element.attr("value");
        
        var results = this.options.autocompleteCallback(searchFor);
        this._showAutocompleter(results, searchFor);

    },
    
    _showAutocompleter: function(results, searchFor) {
        // Hide old list (if any!)
        this._hideAutocompleter();
        if (results.length === 0) return;
        
        var that = this;
        var list = $("<ul class=\"autocomplete-results\">");
        list.width(this.$element.outerWidth());
        $.each(results, function(key, index) {
            var value = this.options.options[index];
            
            if (this.options.highlight) {
                var i = value.toLowerCase().indexOf(searchFor.toLowerCase());
                if (i >= 0) {
                    value = value.substr(0, i) + "<em>" + value.substr(i, searchFor.length) + "</em>" + value.substr(i + searchFor.length);
                }
            }
            list.append("<li data-id=\"" + index + "\">" + value + "</li>");
        }.bind(this));
        
        list.find("li").click(function() {
           that.setSelectedIndex($(this).attr("data-id"));
           that._hideAutocompleter();
           that.$element.focus();
        });
        
        // Calculate correct position and size on screen
        var left = this.$element.position().left + parseFloat(this.$element.css("margin-left"));
        var top = this.$element.position().top + this.$element.outerHeight(true) - parseFloat(this.$element.css("margin-bottom"));
        var width = this.$element.outerWidth(false);
        
        list.css({position: "absolute",
                  left: left + "px", 
                  top: top + "px", 
                  width: width + "px"});

        this.autocompleteElement = list;
        this.$element.after(list);
    },
    
    _hideAutocompleter: function() {
        if (this.autocompleteElement) {
            this.autocompleteElement.detach();
            this.autocompleteElement = null;
        }    
    },
    
    _defaultAutocompleteCallback: function(searchFor) {
        var result = [];
        
        $.each(this.options.options, function(key, value) {
            if (value.toLowerCase().indexOf(searchFor.toLowerCase(), 0) >= 0 ) result.push(key);
        });
        
        return result;
    }
    
  });

  CUI.util.plugClass(CUI.Filters);
  
  // Data API
  //$(function() {
  //  $('body').on('click.alert.data-api', '[data-dismiss="alert"]', function(evt) {
  //    $(evt.target).parent().hide();
  //  });
  //});
}(window.jQuery));
