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
      
      @param {Object}   options                               Component options
      @param {Function} [options.autocompleteCallback=use options]      Callback for autocompletion
      @param {Array}    [options.options=example array]                     Array of available options if no autocomplete callback is used
      @param {boolean}  [options.multiple=false]                     Can the user select more than one option?
      @param {boolean}  [options.stacking=false]                     Uses a slightly different style, implies multiple
      @param {boolean}  [options.placeholder=null]                     Define a placeholder for the input field
      @param {int}      [options.delay=200]                     Delay before starting autocomplete when typing
      @param {int}      [options.disabled=false]                     Is this component disabled?
      @param {boolean}  [options.highlight=true]                     Highlight search string in results
    */
    construct: function(options) {
        this.selectedIndices = []; // Initialise fresh array
        
        // Set callback to default if there is none
        if (!this.options.autocompleteCallback) this.options.autocompleteCallback = this._defaultAutocompleteCallback.bind(this);
        if (this.options.stacking) this.options.multiple = true;

        // Adjust DOM to our needs
        this._render();
 
        // Listen to proprty changes
        this.$element.on('change:disabled', this._render.bind(this));
        this.$element.on('change:placeholder', this._render.bind(this));
        this.$element.on('change:options', this._changeOptions.bind(this));

 
        // Listen to events
        this.$element.on("input", "input", function() {
            if (this.options.disabled) return;
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = setTimeout(this._inputChanged.bind(this), this.options.delay);
        }.bind(this));
        
        this.$element.on("blur", "input", function() {
            if (this.options.disabled) return;
            if (this.typeTimeout) clearTimeout(this.typeTimeout);
            this.typeTimeout = null;
            setTimeout(this._hideAutocompleter.bind(this), 200); // Use timeout to have a chance to select from list
        }.bind(this));
       
        this.$element.on("keydown", "input", this._keyPressed.bind(this));
        this.$element.on("keyup", "input", this._keyUp.bind(this));
        
        this.$element.on("click", "input", function() {
            if (this.options.disabled) return;
            this._inputChanged();
        }.bind(this));
        
        this.$element.on("click", "[data-dismiss=filter]", function(event) {
            if (this.options.disabled) return;
            var e = $(event.target).closest("[data-id]");
            this.removeSelectedIndex(e.attr("data-id"));
            return false;
        }.bind(this));
        
        // .. and some more event handlers to style our widget
        this.$element.on("input", "input", function() {
            if (this.options.disabled) return;
            this._correctInputFieldWidth();
        }.bind(this));
        
        this.$element.on("focus", "input", function() {
            if (this.options.disabled) return;
            this.$element.addClass("focus");
        }.bind(this));
        
        this.$element.on("blur", "input", function() {
            if (this.options.disabled) return;
            this.$element.removeClass("focus");
        }.bind(this));
        
        this.$element.on("click", "", function() {
            if (this.options.disabled) return;
            this.$element.find("input").focus();
            this._inputChanged();
        }.bind(this));
       
    },
    
    defaults: {
        autocompleteCallback: null,
        options: ["Apples", "Pears", "Bananas", "Strawberries"],
        multiple: false,
        delay: 200,
        highlight: true,
        stacking: false,
        placeholder: null
    },
    

    autocompleteElement: null,
    typeTimeout: null,
    selectedIndex: -1, // For single term only
    selectedIndices: null, // For multiple terms
    syncSelectElement: null,
    triggeredBackspace: false,
 
    /**
     * @param {int} index     Sets the currently selected option by its index or, if options.multiple ist set,
     *                          adds it to the list of selected indices
     */
    setSelectedIndex: function(index) {
        if (index < 0 || index >= this.options.options.length) return;
        this.$element.find("input").attr("value", "");
        this.selectedIndex = index;
        if (this.options.multiple && this.selectedIndices.indexOf(index * 1) < 0) {
            this.selectedIndices.push(index * 1); // force numeric
        }
        this._update();
    },
    
    removeSelectedIndex: function(index) {
        var i = this.selectedIndices.indexOf(index * 1);
        if (i < 0) return;
        this.selectedIndices.splice(i, 1);
        this._update();
    },
    
    /**
     * @return {int} The currently selected options by index or -1 if none is selected
     */
    getSelectedIndex: function() {
        return this.selectedIndex;
    },
    
    setSelectedIndices: function(indices) {
        this.selectedIndices = indices;
    },
    
    getSelectedIndices: function() {
        return this.selectedIndices;
    },
    
    _changeOptions: function() {
        this.selectedIndex = -1;
        this.selectedIndices = [];
        this._render();
    },
    
    _render: function() {
        // if current element is select field -> turn into input field, but hold reference to select to update it on change
        if (this.$element.get(0).tagName === "SELECT") {
            this.options.multiple = this.$element.attr("multiple") ? true : false;
            this.options.options = [];
            this.$element.find("option").each(function(i, e) {
                this.options.options.push($(e).text());
            }.bind(this));
            
            var input = $("<input type=\"text\">");
            this.$element.after(input);
            this.syncSelectField = this.$element;
            this.$element = input;
            this.syncSelectField.hide();
        }
        
        // if current element is input field -> wrap it into DIV
        if (this.$element.get(0).tagName === "INPUT") {
            var div = $("<div></div>");
            this.$element.after(div);
            this.$element.detach();
            div.append(this.$element);
            this.$element = div;
        }
        
        this.$element.addClass("filters");
        this.$element.removeClass("focus");

        if (this.options.stacking) this.$element.addClass("stacking"); else this.$element.removeClass("stacking");
        if (this.options.placeholder) this.$element.find("input").attr("placeholder", this.options.placeholder);
        if (this.options.disabled) {
            this.$element.addClass("disabled");
            this.$element.find("input").attr("disabled", "disabled");
        } else {
           this.$element.removeClass("disabled");
           this.$element.find("input").removeAttr("disabled");
            
        }
        
        this._update();
    },
    
    _update: function() {
        if (!this.options.multiple) {
            var option = this.options.options[this.selectedIndex];
            this.$element.find("input").attr("value", option);
            return;
        }
        
        var ul = $("<ul></ul>");
        
        $.each(this.selectedIndices, function(k, index) {
            var option = this.options.options[index];
            ul.append("<li data-id=\"" + index + "\"><button data-dismiss=\"filter\">&times;</button> " + option + "</li>");
        
        }.bind(this));
        
        this.$element.find("ul").remove();
        if (ul.children().length > 0) {
            if (this.options.stacking) {
                this.$element.prepend(ul);        
            } else {
                this.$element.append(ul);
            }
        }
        this._correctInputFieldWidth();

    },

    _keyUp: function(event) {
        var key = event.keyCode;
        if (key === 8) {  
            this.triggeredBackspace = false; // Release the key event
        }
    },
    
    _keyPressed: function(event) {        
        var key = event.keyCode;
        if (key === 8) { 
            if (this.triggeredBackspace === false && this.options.multiple && this.selectedIndices.length > 0 &&
                this.$element.find("input").attr("value").length === 0) {
                event.preventDefault();
                this.removeSelectedIndex(this.selectedIndices[this.selectedIndices.length - 1]);    
            }
            this.triggeredBackspace = true; // Remember this key down event
        }
        
        // Only listen to keys if there is an autocomplete box right now
        if (!this.autocompleteElement) {
            if (key === 40) {
                this._inputChanged(); // Show box now!
                event.preventDefault();
            }
            return;
        }

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
                this.$element.find("input").focus();
                return;
           }
        }
        
        // Set new css classes
        this.autocompleteElement.children().removeClass("selected");
        if (currentIndex >= 0) $(this.autocompleteElement.children().get(currentIndex)).addClass("selected");
        
        return;
    },

    _inputChanged: function() {
        var searchFor = this.$element.find("input").attr("value");
        
        var results = this.options.autocompleteCallback(searchFor);
        this._showAutocompleter(results, searchFor);
    },
    
    _correctInputFieldWidth: function() {
        if (!this.options.stacking) return;
        
        var i = this.$element.find("input");
        var text = i.attr("value");
        if (text.length === 0) text = i.attr("placeholder");
        var styles = ["font-family", "font-weight", "font-style", "font-size", "letter-spacing", "line-height", "text-transform"];
        var div = $("<div style=\"position: absolute; display: none;\"></div>");
        $.each(styles, function(x, style) {
            div.css(style, i.css(style));
        });
        div.text(text);
        $("body").append(div);
        var w = div.width() + 25;
        div.remove();
        var border = parseFloat(i.css("margin-left")) + parseFloat(i.css("margin-right"));        
        var isEmpty = (this.selectedIndices.length === 0);
        if (isEmpty || w > (this.$element.width() - border)) {
            w = (this.$element.width() - border);
        }
        i.width(w);
    },
    
    _showAutocompleter: function(results, searchFor) {
        // Hide old list (if any!)
        this._hideAutocompleter();
        if (results.length === 0) return;
        
        var that = this;
        var list = $("<ul class=\"autocomplete-results\">");
        list.width(this.$element.outerWidth());
        $.each(results, function(key, index) {
            
            // Do not show already selected indices
            if (this.options.multiple && this.selectedIndices.indexOf(index) >= 0) return;
            
            var value = this.options.options[index];
            
            if (this.options.highlight) {
                var i = value.toLowerCase().indexOf(searchFor.toLowerCase());
                if (i >= 0) {
                    value = value.substr(0, i) + "<em>" + value.substr(i, searchFor.length) + "</em>" + value.substr(i + searchFor.length);
                }
            }
            list.append("<li data-id=\"" + index + "\">" + value + "</li>");
        }.bind(this));
        
        list.on("click", "li", function(event) {
           that.setSelectedIndex($(event.target).attr("data-id"));
           that._hideAutocompleter();
           that.$element.focus();
        });
        
        // Calculate correct position and size on screen
        var el = this.$element;
        var left = el.position().left + parseFloat(el.css("margin-left"));
        var top = 0;
        if (this.options.stacking) {
            top = el.position().top + el.outerHeight(true) - parseFloat(el.css("margin-bottom"));
        } else {
            top = el.position().top + parseFloat(el.css("margin-top")) + parseFloat(el.css("padding-top")) +
                el.find("input").outerHeight(false) + parseFloat(el.find("input").css("margin-top"));
        }
        var width = el.outerWidth(false);
        
        list.css({position: "absolute",
                  left: left + "px", 
                  top: top + "px", 
                  width: width + "px"});

        this.autocompleteElement = list;
        this.$element.after(list);
    },
    
    _hideAutocompleter: function() {
        if (this.autocompleteElement) {
            this.autocompleteElement.remove();
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
