(function($) {
  CUI.Filters = new Class(/** @lends CUI.Filters# */{
    toString: 'Filters', // Plural here as jQuery already has a method "filter"
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc An autocompletable filters&tags widget
      
      <p>
      <select data-init="filters" data-placeholder="Add filter" multiple data-stacking="true">
            <option>red</option>
            <option>green</option>
            <option>blue</option>
            <option>yellow</option>
            <option>orange</option>
      </select>
      </p>

        <h2>Hints &amp; Tricks</h2>
      <p>
       <ul>
            <li>
               If you change the <code>options</code> with the <code>set</code>-Method after initialising the element,
                don't forgt to also set the <code>optionDisplayStrings</code>.
            </li>
        </ul>
      
    </p>
      
    @example
    <caption>Instantiate with Data API</caption>
&lt;select data-init="filters" data-placeholder="Add filter" multiple data-stacking="true"&gt;
      &lt;option&gt;red&lt;/option&gt;
      &lt;option&gt;green&lt;/option&gt;
      &lt;option&gt;blue&lt;/option&gt;
      &lt;option&gt;yellow&lt;/option&gt;
      &lt;option&gt;orange&lt;/option&gt;
&lt;/select&gt;

Currently there are the following data options:
  data-init="filters"         Inits the filter widget after page load
  data-placeholder            Same as option "placeholder"
  data-multiple               Sets field to "multiple" if given (with any non-empty value)
  data-stacking               Sets field to "stacking" if given (with any non-empty value)
  data-disabled               Sets field to "disabled" if given (with any non-empty value)
  data-allow="create"         If given the user is allowed to add new entries to the option list
  data-option-renderer        Either "default" for default behavior or "cqTag" for correct display of CQ5 Tags.

  "data-multiple", "data-disabled" and "data-placeholder" can be replaced by the native HTML attributes "multiple", "disabled" and
  "placeholder" if the current element allows them.
      
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
      
      @param {Object}   options                                    Component options
      @param {Array}    [options.options=empty array]              Array of available options (will be read from &lt;select&gt; by default)
      @param {Array}    [options.optionDisplayStrings=empty array] Array of alternate strings for display (will be read from &lt;select&gt; by default)
      @param {boolean}  [options.multiple=false]                   Can the user select more than one option?
      @param {boolean}  [options.stacking=false]                   Uses a slightly different style, implies multiple
      @param {boolean}  [options.allowCreate=false]                Allow the creation of new tags.
      @param {boolean}  [options.placeholder=null]                 Define a placeholder for the input field
      @param {int}      [options.delay=200]                        Delay before starting autocomplete when typing
      @param {int}      [options.disabled=false]                   Is this component disabled?
      @param {boolean}  [options.highlight=true]                   Highlight search string in results
      @param {String}   [options.name=null]                        (Optional) name for an underlying form field.
      @param {Object}   [options.icons=empty object]               Icons to display. Option key paired with either Coral icon css class or image url.
      @param {String}   [options.iconSize=small]                   Icon size from: xsmall (12x12), small (16x16), medium (24x24), large (32x32).
      @param {Function} [options.autocompleteCallback=use options] Callback for autocompletion
      @param {Function} [options.optionRenderer=default renderer]  (Optional) Renderer for the autocompleter and the tag badges
    */
    construct: function(options) {
        this.selectedIndices = []; // Initialise fresh array
        this.createdIndices = []; // Initialise fresh array
        
        // Set callbacks to default if there are none
        if (!this.options.autocompleteCallback) {
            this.options.autocompleteCallback = this._defaultAutocompleteCallback.bind(this);
        } else {
            this.usingExternalData = true;
        }
        if (!this.options.optionRenderer) this.options.optionRenderer = CUI.Filters.defaultOptionRenderer;
        
        // Read options from markup
        this._readDataFromMarkup();
        
        // Stacking forces multiple
        if (this.options.stacking) this.options.multiple = true;
        
        // Adjust DOM to our needs
        this._render();
        
        // Populate alternative display strings if necessary
        while (this.options.optionDisplayStrings.length < this.options.options.length) {
            this.options.optionDisplayStrings.push(this.options.options[this.options.optionDisplayStrings.length]);
        }
        
        // Generate Dropdown List widget
        this.dropdownList = new CUI.DropdownList({
            element: this.inputElement,
            positioningElement: (this.options.stacking) ? this.$element : this.inputElement,
            cssClass: "autocomplete-results"
        });
        
        // Listen to property changes
        this.$element.on('change:disabled', this._update.bind(this));
        this.$element.on('change:placeholder', this._update.bind(this));
        
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

            if(this.usingExternalData) {
                this._createNewOption(event.selectedValue.toString(), event.selectedValue.toString(), true);
                this._update();
            }
            
            var pos = $.inArray(event.selectedValue.toString(), this.options.options);
            this.setSelectedIndex(pos * 1);
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
        
        this.$element.on("click touchend", "input", function() {
            if (this.options.disabled) return;
            this.inputElement.focus();
            this._inputChanged();
        }.bind(this));
       
    },
    
    defaults: {
        autocompleteCallback: null,
        options: [],
        optionDisplayStrings: [],
        multiple: false,
        delay: 200,
        highlight: true,
        stacking: false,
        placeholder: null,
        optionRenderer: null,
        allowCreate: false,
        icons: null,
        iconSize: "small"
    },

    dropdownList: null, // Reference to instance of CUI.DropdownList
    syncSelectElement: null,
    inputElement: null,
    typeTimeout: null,
    
    selectedIndex: -1, // For single term only
    selectedIndices: null, // For multiple terms
    createdIndices: null, // Newly created indices
    triggeredBackspace: false,
    usingExternalData: false, // Using autocomplete callback for loading external data?
    selectedValue: null, // Used to store returned value when data is loaded externally

    // TODO switch selectedIndex/selectedIndices to store keys rather than indexes so that they
    // can be used with external data. Remove selectedValue variable on completion.

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
        if (event.widget !== this) return;
        this.selectedIndex = -1;
        this.selectedIndices = [];
        this.createdIndices = [];
        this._update();
    },

    /** @ignore */
    _render: function() {
        var div;
        // if current element is select field -> turn into input field, but hold reference to select to update it on change
        if (this.$element.get(0).tagName === "SELECT") {        
            div = $("<div></div>");
            this.$element.after(div);
            this.$element.detach();
            div.append(this.$element);
            this.$element = div;
        }
        
        // if current element is input field -> wrap it into DIV
        if (this.$element.get(0).tagName === "INPUT") {
            div = $("<div></div>");
            this.$element.after(div);
            this.$element.detach();
            div.prepend(this.$element);
            this.$element = div;
        }

        // If there was an select in markup: use it for generating options
        if (this.$element.find("select option").length > 0 && this.options.options.length === 0) {
            this.options.options = [];
            this.options.optionDisplayStrings = [];
            this.$element.find("select option").each(function(i, e) {
            this.options.options.push($(e).val());
            this.options.optionDisplayStrings.push($.trim($(e).text()));
            
            // Save selected state
            if ($(e).attr("selected")) {
	            this.selectedIndices.push(i);		
	            this.selectedIndex = i;		
            }

            }.bind(this));
        }

        this._createMissingElements();
        
        this.syncSelectElement = this.$element.find("select");
        this.inputElement = this.$element.find("input");
        
        this.$element.addClass("filters");
        this.$element.removeClass("focus");

        if (!this.options.placeholder) this.options.placeholder = this.inputElement.attr("placeholder");
        if (this.options.name) this.syncSelectElement.attr("name", this.options.name);
        if (this.options.stacking) this.$element.addClass("stacking"); else this.$element.removeClass("stacking");

       
        this._update();
    },
    
    _createMissingElements: function() {
        if (this.$element.find("select").length === 0) {
            this.$element.append($("<select " + (this.options.multiple ? "multiple" : "") + "></select>"));
        }
        if (this.$element.find("input").length === 0) {
            this.$element.prepend($("<input type=\"text\">"));
        }
        
        // Create all options where neccessary
        if (this.$element.find("select option").length < this.options.options.length) {
            for(var i = this.$element.find("select option").length; i < this.options.options.length; i++) {
                var value = this.options.options[i];
                var name = this.options.optionDisplayStrings[i] || this.options.options[i];
                var opt = $("<option></option>");
                opt.text(name);
                opt.attr("value", value);
                this.$element.find("select").append(opt);
            }
        }
        
    },

    /** @ignore */
    _readDataFromMarkup: function() {
            if (this.$element.attr("multiple")) this.options.multiple = true;
            if (this.$element.attr("data-multiple")) this.options.multiple = true;
            if (this.$element.attr("data-stacking")) this.options.stacking = true;
            if (this.$element.attr("placeholder")) this.options.placeholder = this.$element.attr("placeholder");
            if (this.$element.attr("data-placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
            if (this.$element.attr("disabled")) this.options.disabled = true;
            if (this.$element.attr("data-disabled")) this.options.disabled = true;
            if (this.$element.attr("data-allow") === "create") this.options.allowCreate = true;
            if (this.$element.attr("data-option-renderer")) {
                // Allow to choose from default option Renderers
                this.options.optionRenderer = CUI.Filters[this.$element.attr("data-option-renderer") + "OptionRenderer"];
                if (!this.options.optionRenderer) this.options.optionRenderer = CUI.Filters.defaultOptionRenderer;
            }
   },
   
    /** @ignore */
    _update: function() {
        
        if (this.options.placeholder) this.inputElement.attr("placeholder", this.options.placeholder);
                
        if (this.options.disabled) {
            this.$element.addClass("disabled");
            this.inputElement.attr("disabled", "disabled");
        } else {
           this.$element.removeClass("disabled");
           this.inputElement.removeAttr("disabled");
        }
        
        // Update single term fields
        if (!this.options.multiple) {
            if (this.syncSelectElement) this.syncSelectElement.find("option:selected").removeAttr("selected");

            if (this.selectedIndex >= 0) {
                if (this.syncSelectElement) $(this.syncSelectElement.find("option").get(this.selectedIndex)).attr("selected", "selected");
                var option = this.options.options[this.selectedIndex];
                if (this.options.optionDisplayStrings[this.selectedIndex]) { // Use alternative display strings
                    option = this.options.optionDisplayStrings[this.selectedIndex];
                }
                this.inputElement.attr("value", option);
            } else {
                this.inputElement.attr("value", "");
            }
            return;
        }

        // Update multiple term fields
        if (this.syncSelectElement) {
            this.syncSelectElement.find("option:selected").removeAttr("selected");
            
            for(var i = 0; i < this.selectedIndices.length; i++) {
                var index = this.selectedIndices[i];
                $(this.syncSelectElement.find("option").get(index)).attr("selected", "selected");
                
            }
        }
        
        // Create selected tag list
        var ul = $("<ul class=\"tags\"></ul>");
        
        $.each(this.selectedIndices, function(iterator, index) {
            var option = this.options.options[index];
            var el = (this.options.optionRenderer.bind(this))(index, option, false, false);
            var li = $("<li data-id=\"" + index + "\"><button data-dismiss=\"filter\">&times;</button></li>");
            ul.append(li);
            li.append(el);
            
        }.bind(this));
        
        // Add new list to widget
        this.$element.find("ul").remove();
        if (ul.children().length > 0) {
            if (this.options.stacking) {
                this.$element.prepend(ul);        
            } else {
                this.$element.append(ul);
            }
        }
        
        // Correct input field length of stacking fields
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
                this._inputChanged();
            }
            this.triggeredBackspace = true; // Remember this key down event
        }
        
        if (!this.dropdownList.isVisible()) {
            if (key === 40) {
                this._inputChanged(); // Show box now!
                event.preventDefault();
            }
            if (key === 13) { // Create new item
                var val = this.inputElement.val();
                if (val.length > 0) this._createNewOption(val, val, false);
            }
        }
    },
    
    _createNewOption: function(name, displayName, fromInternal) {
        
        var existingIndex = -1;
        
        // First check if there really is no option with this name
        $.each(this.options.options, function(index, optionName) {
           if (this.options.optionDisplayStrings[index] === name) existingIndex = index;
           if (optionName === name) existingIndex = index;           
        }.bind(this));
        
        if (existingIndex >=0) {
            this.setSelectedIndex(existingIndex);
            return;
        }
        
        // Is it allowed to add new options?
        if (!this.options.allowCreate && !fromInternal) return;
        
        var index = this.options.options.length;

        this.options.options.push(name);
        this.options.optionDisplayStrings.push(displayName);
        if (this.syncSelectElement) {
            var el = $("<option></option>");
            el.text(displayName);
            el.attr("value", name);
            this.syncSelectElement.append(el);
            //console.log("Compare indices", el.index(), index);
        }
        if (!fromInternal) this.createdIndices.push(index);
        this.setSelectedIndex(index);
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
        this.options.autocompleteCallback($.proxy(this._showAutocompleter, this), searchFor);
    },
    
    /** @ignore */
    _showAutocompleter: function(results) {

        this.dropdownList.hide();
        
        if (this.options.multiple) {
            // Do not show already selected indices
            var l = [];
            $.each(results, function(iterator, key) {
                // TODO: can't call this.options.options when we are using external data source
                var pos = $.inArray(key, this.options.options);
                if (this.selectedIndices.indexOf(pos) >= 0) return;
                l.push(key);
            }.bind(this));
            results = l;
        }        
        if (results.length === 0) return;

        var optionRenderer = function(index, key) {
            return (this.options.optionRenderer.bind(this))(index, key, this.options.highlight, !$.isEmptyObject(this.options.icons));
        };

        this.dropdownList.set("optionRenderer", optionRenderer.bind(this));
        this.dropdownList.set("options", results);
        
        this.dropdownList.show();
        
    },
    
    /** @ignore */
    _defaultAutocompleteCallback: function(handler, searchFor) {
        var result = [];

        $.each(this.options.options, function(index, key) {
            var name = key;
            
            if (this.options.optionDisplayStrings[index]) { // Use alternate display names for autocomplete (if possible)
                name = this.options.optionDisplayStrings[index];
            }

            if (name.toLowerCase().indexOf(searchFor.toLowerCase(), 0) >= 0 ) result.push(key);

        }.bind(this));

        handler(result, searchFor);
    },

    /** @ignore */
    _buildIcon: function(type, attr, size) {
        if(type === "url") {
            return '<i class="' + size + ' icon-inline-bg-image" style="background-image: url(' + attr + ')">' + 'icon' + '</i>';
        } else if(type === "cuiIcon") {
            return '<i class="' + attr + ' ' + size + '">' + attr.split('icon-')[1] + '</i>';
        }
    }
  });

  CUI.util.plugClass(CUI.Filters);
  
  // Data API
  $(document).ready(function() {
    $('[data-init=filters]').filters();
  });
}(window.jQuery));


CUI.Filters.defaultOptionRenderer = function(index, key, highlight, icon) {

    var pos = $.inArray(key, this.options.options);
    var value = key;

    if (this.options.optionDisplayStrings[pos]) { // Use alternate display strings if possible
        value = this.options.optionDisplayStrings[pos];
    }

    var searchFor = this.inputElement.val();

    if (highlight) {
        var i = value.toLowerCase().indexOf(searchFor.toLowerCase());
        if (i >= 0) {
            value = value.substr(0, i) + "<em>" + value.substr(i, searchFor.length) + "</em>" + value.substr(i + searchFor.length);
        }
    }
    
    // Check if this tag is new
    if (this.createdIndices.indexOf(pos) >= 0) {
        value = value + "&nbsp;*";
    }

    // If we allow icons here, build icon if provided for option depending on type (image url or cui icon class)
    if(icon) {
        var attr;
        if(typeof(attr = this.options.icons[this.options.options[pos]]) !== "undefined") {
            var type = (/^icon-/i.test(attr)) ? "cuiIcon" : "url";
            value = this._buildIcon(type,attr,this.options.iconSize) + value;
        }
    }

    return $("<span>" + value + "</span>");
};

// TODO: update this function work off key rather than index as in CUI.Filters.defaultOptionRenderer
CUI.Filters.cqTagOptionRenderer = function(iterator, key, highlight) {
    var index = $.inArray(key, this.options.options);
    var value = key;
    
    if (this.options.optionDisplayStrings[index]) { // Use alternate display strings if possible
        value = this.options.optionDisplayStrings[index];
    }
    var searchFor = this.inputElement.val();
    
    var pathParts = value.split("/");
    value = "";
    
    // html encode fn
    function e(text) {
        return $("<div>").text(text).html();
    }
    
    for(var q = 0; q < pathParts.length; q++) {
        var part = pathParts[q];

        if (highlight) {
            var i = part.toLowerCase().indexOf(searchFor.toLowerCase());
            if (i >= 0) {
                part = e(part.substr(0, i)) + "<em>" + e(part.substr(i, searchFor.length)) + "</em>" + e(part.substr(i + searchFor.length));
            } else {
                part = e(part);
            }
        } else {
            part = e(part);
        }
        
        if (value !== "") value += " / ";
        if (q === pathParts.length - 1) part = "<b>" + part + "</b>";
        value = value + part;
    }
        
    // Check if this tag is new
    if (this.createdIndices.indexOf(index) >= 0) {
        value = value + "&nbsp;*";
    }

    
    return $("<span>" + value + "</span>");
};
