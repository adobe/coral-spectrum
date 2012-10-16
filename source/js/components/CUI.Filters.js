(function($) {
  CUI.Filters = new Class(/** @lends CUI.Filters# */{
    toString: 'Filters', // Plural here as jQuery already has a method "filter"
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

// Set the currently selected option
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
        
        // Generate Dropdown List widget
        this.dropdownList = new CUI.DropdownList({
            element: this.inputElement,
            positioningElement: (this.options.stacking) ? this.$element : this.inputElement,
            cssClass: "autocomplete-results"
        });
        
        // Listen to property changes
        this.$element.on('change:disabled', this._render.bind(this));
        this.$element.on('change:placeholder', this._render.bind(this));
        //this.$element.on('change:options', this._changeOptions.bind(this));
        // Bug by design: How can we distinguish events from different widgets on the same element?
        
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
            // Set to existing selection for single term use
            if (!this.options.multiple && this.selectedIndex >=0) {
                if (this.inputElement.attr("value") === "") {
                    this.setSelectedIndex(-1);
                } else {
                    this._update();
                }
            }
        }.bind(this));
       
        this.$element.on("keydown", "input", this._keyPressed.bind(this));
        this.$element.on("keyup", "input", this._keyUp.bind(this));
        
        /*this.$element.on("click", "input", function() {
            if (this.options.disabled) return;
            this._inputChanged();
        }.bind(this));*/
        
        this.dropdownList.on("dropdown-list:select", "", function(event) {
            this.dropdownList.hide(200);
            this.setSelectedIndex(event.selectedValue * 1);
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
            this.inputElement.focus();
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
    

    dropdownList: null, // Reference to instance of CUI.DropdownList
    syncSelectElement: null,
    inputElement: null,
    typeTimeout: null,
    selectedIndex: -1, // For single term only
    selectedIndices: null, // For multiple terms
    triggeredBackspace: false,
 
    /**
     * @param {int} index     Sets the currently selected option by its index or, if options.multiple ist set,
     *                          adds it to the list of selected indices. -1 is valid for single term use and removes any
     *                          selected index.
     */
    setSelectedIndex: function(index) {
        if (index < -1 || index >= this.options.options.length) return;
        this.inputElement.attr("value", "");
        this.selectedIndex = index;
        if (this.options.multiple && index >=0 && this.selectedIndices.indexOf(index * 1) < 0) {
            this.selectedIndices.push(index * 1); // force numeric
        }
        this._update();
    },
    
    /**
     *  Removes the given index from the list of selected indices. Only applies to multi term use.
     **/
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
    

    /**
     * @param {array} Replace the list of currently selected indices. Only applies to multi term use.
     */
    setSelectedIndices: function(indices) {
        this.selectedIndices = indices.slice(0); // Make copy of parameter!
        this._update();
    },
    
    /**
     * @return {array} The currently selected options by index or an empty array if none is selected
     */
    getSelectedIndices: function() {
        return this.selectedIndices.slice(0); // Make copy before returning!
    },
    
    /** @ignore */
    _changeOptions: function(event) {
        console.log(event);
        this.selectedIndex = -1;
        this.selectedIndices = [];
        this._render();
    },

    /** @ignore */
    _render: function() {
        // if current element is select field -> turn into input field, but hold reference to select to update it on change
        if (this.$element.get(0).tagName === "SELECT") {
            this.options.multiple = this.$element.attr("multiple") ? true : false;
            if (this.$element.attr("data-stacking")) this.options.stacking = true;
            if (this.$element.attr("data-placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
            if (this.$element.attr("disabled")) this.options.disabled = true;
            
            this.options.options = [];
            this.$element.find("option").each(function(i, e) {
                this.options.options.push($(e).text());
            }.bind(this));
            
            var input = $("<input type=\"text\">");
            this.$element.after(input);
            this.syncSelectElement = this.$element;
            this.$element = input;
            this.syncSelectElement.hide();
        }
        
        // if current element is input field -> wrap it into DIV
        if (this.$element.get(0).tagName === "INPUT") {
            var div = $("<div></div>");
            if (this.$element.attr("data-stacking")) this.options.stacking = true;
            if (this.$element.attr("disabled")) this.options.disabled = true;
            this.$element.after(div);
            this.$element.detach();
            div.append(this.$element);
            this.$element = div;
        }
        
        this.$element.addClass("filters");
        this.$element.removeClass("focus");
        
        this.inputElement = this.$element.find("input");


        if (this.options.stacking) this.$element.addClass("stacking"); else this.$element.removeClass("stacking");
        if (this.options.placeholder) this.inputElement.attr("placeholder", this.options.placeholder);
        if (this.options.disabled) {
            this.$element.addClass("disabled");
            this.inputElement.attr("disabled", "disabled");
        } else {
           this.$element.removeClass("disabled");
           this.inputElement.removeAttr("disabled");
            
        }
        
       
        this._update();
    },
    
    /** @ignore */
    _update: function() {
        
        
        if (!this.options.multiple) {
            if (this.syncSelectElement) this.syncSelectElement.find("option:selected").removeAttr("selected");
            if (this.selectedIndex >= 0) {
                if (this.syncSelectElement) $(this.syncSelectElement.find("option").get(this.selectedIndex)).attr("selected", "selected");
                var option = this.options.options[this.selectedIndex];
                this.inputElement.attr("value", option);
            } else {
                this.inputElement.attr("value", "");
            }
            return;
        }

        if (this.syncSelectElement) {
            this.syncSelectElement.find("option:selected").removeAttr("selected");
            
            for(var i = 0; i < this.selectedIndices.length; i++) {
                var index = this.selectedIndices[i];
                $(this.syncSelectElement.find("option").get(index)).attr("selected", "selected");
                
            }
        }
        
        var ul = $("<ul class=\"tags\"></ul>");
        
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

    /** @ignore */
    _keyUp: function(event) {
        var key = event.keyCode;
        if (key === 8) {  
            this.triggeredBackspace = false; // Release the key event
        }
    },
    
    /** @ignore */
    _keyPressed: function(event) {        
        var key = event.keyCode;
        if (key === 8) { 
            if (this.triggeredBackspace === false && this.options.multiple && this.selectedIndices.length > 0 &&
                this.inputElement.attr("value").length === 0) {
                event.preventDefault();
                this.removeSelectedIndex(this.selectedIndices[this.selectedIndices.length - 1]);    
            }
            this.triggeredBackspace = true; // Remember this key down event
        }
        
        if (!this.dropdownList.isVisible()) {
            if (key === 40) {
                this._inputChanged(); // Show box now!
                event.preventDefault();
            }
        }
    },
    
    /** @ignore */
    _correctInputFieldWidth: function() {
        if (!this.options.stacking) return;
        
        var i = this.inputElement;
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
    
    /** @ignore */
    _inputChanged: function() {
        var searchFor = this.inputElement.attr("value");
        
        var results = this.options.autocompleteCallback(searchFor);
        this._showAutocompleter(results, searchFor);
    },
    
    /** @ignore */
    _showAutocompleter: function(results, searchFor) {
        
        this.dropdownList.hide();
        
        if (this.options.multiple) {
            // Do not show already selected indices
            var l = [];            
            $.each(results, function(key, index) {
                if (this.selectedIndices.indexOf(index) >= 0) return;
                l.push(index);
            }.bind(this));  
            results = l;
        }        
        if (results.length === 0) return;

        var optionRenderer = function(key, index) {            
            var value = this.options.options[index];
            
            if (this.options.highlight) {
                var i = value.toLowerCase().indexOf(searchFor.toLowerCase());
                if (i >= 0) {
                    value = value.substr(0, i) + "<em>" + value.substr(i, searchFor.length) + "</em>" + value.substr(i + searchFor.length);
                }
            }
            return $("<span>" + value + "</span>");
        };
        
        // Due to a current bug (in CUI.Widget?) it seems to be impossible to use the "set"-method inherited from the widget class
        this.dropdownList.set("optionRenderer", optionRenderer.bind(this));
        this.dropdownList.set("options", results);
        console.log(new Error("dummy").stack, this.dropdownList.options, optionRenderer);
        this.dropdownList.options.optionRenderer = optionRenderer.bind(this);
        this.dropdownList.options.options = results;
        
        this.dropdownList.show();
        
    },
    
    /** @ignore */
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
  $(document).ready(function() {
    $('[data-init=filters]').filters();
  });
}(window.jQuery));
