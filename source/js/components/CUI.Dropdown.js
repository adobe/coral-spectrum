(function($) {
  CUI.Dropdown = new Class(/** @lends CUI.Dropdown# */{
    toString: 'Dropdown',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A dropdown widget
      
        <p>
            <select name="foo" data-init="dropdown" multiple data-placeholder="Please Select items">
                <option>One</option>
                <option>Two</option>
                <option>Three</option>
            </select>
        </p>
        <p>
        Currently this widget does only support creation from an existing &lt;select&gt;&lt;/select&gt; field.
        </p>
    @example
    <caption>Instantiate by data API</caption>
    &lt;select name="foo" data-init="dropdown" multiple data-placeholder="Please Select items"&gt;
        &lt;option&gt;One&lt;/option&gt;
        &lt;option&gt;Two&lt;/option&gt;
        &lt;option&gt;Three&lt;/option&gt;
    &lt;/select&gt;

    @example
    <caption>Instantiate with Class</caption>
    var dropdown = new CUI.Dropdown({
      element: '#myOrdinarySelectBox'
    });

    // Changes the select box into a beautiful widget.

    @example
    <caption>Instantiate by jQuery plugin</caption>
    $("select").dropdown();

    // Changes all select boxes into beautiful widgets.
       
       
      @desc Creates a dropdown from any select element
      @constructs
      
      @param {Object}   options                               Component options
      @param {Array} [options.options=empty array]      Selectable options
      @param {boolean} [options.multiple=false]      Is this a multiselect widget?
      @param {boolean} [options.editable=false]      May the user edit the option text?
      @param {String} [options.placeholder="Select"]      Placeholder string to display in empty widget
      @param {boolean} [options.disabled=false]      Is this widget disabled?
      @param {boolean} [options.hasError=false]      Does this widget contain an error?
      
    */
    construct: function(options) {
        
        this._render();
        
        this.dropdownList = new CUI.DropdownList({
            element: this.buttonElement,
            positioningElement: this.positioningElement,
            options: this.options.options,
            optionRenderer: this._optionRenderer.bind(this)
        });
        
        this.buttonElement.on("dropdown-list:select", "", this._processSelect.bind(this));
        
        this.buttonElement.on("click", "", function() {
            this.dropdownList.show();
        }.bind(this));
        
        this.$element.children().on("focus", "", function() {
            this.hasFocus = true;
            this._update();
        }.bind(this));
        this.$element.children().on("blur", "", function() {
            this.hasFocus = false;
            this._update();
        }.bind(this));              

    },
    
    defaults: {
        options: [],
        multiple: false,
        placeholder: "Select",
        disabled: false,
        editable: false,
        hasError: false
    },
    
    dropdownList: null,
    syncSelectElement: null,
    buttonElement: null,
    positioningElement: null,
    inputElement: null,
    hasFocus: false,

    /** @ignore */    
    _optionRenderer: function(index, option) {
        var el = $("<span>" + option + "</span>");
        if (this.options.multiple) {
            var checkbox = $("<div class=\"checkbox\">");
            if (this.syncSelectElement && $(this.syncSelectElement.find("option").get(index)).attr("selected")) {
                checkbox.addClass("checked");
            }
            el.prepend(checkbox);
        }
        return el;
    },
    /** @ignore */    
    _processSelect: function(event) {
        if (this.syncSelectElement) {
            var current = $(this.syncSelectElement.find("option").get(event.selectedIndex));
            if (this.options.multiple) {
                if (current.attr("selected")) {
                    current.removeAttr("selected");
                } else {
                    current.attr("selected", "selected");
                }
                this.dropdownList.update();
            } else {                    
                this.syncSelectElement.find("option").removeAttr("selected");
                current.attr("selected", "selected");
                this.dropdownList.hide();        
            }
        }
        this._update(true);
    },
    
    /** @ignore */
    _render: function() {
        this._readDataFromMarkup();
        
        if (this.$element.get(0).tagName !== "DIV") {
            var div = $("<div></div>");
            this.$element.after(div);
            this.$element.detach();
            div.append(this.$element);
            this.$element = div;
        }

        this._createMissingElements();
        this.buttonElement = this.$element.find("button");
        this.syncSelectElement = this.$element.find("select");
        this.inputElement = this.$element.find("input");
        this.positioningElement = (this.options.editable) ? this.$element : this.buttonElement;
        
        if (!this.inputElement.attr("name")) this.inputElement.attr("name", this.syncSelectElement.attr("name") + ".edit");
        if (this.syncSelectElement.attr("multiple")) this.options.multiple = true;
        
        this.$element.addClass("dropdown");
        if (this.options.editable) this.$element.addClass("dropdown-editable");
        

        if (this.$element.find("select option").length > 0 && this.options.options.length == 0) {
            this.options.options = [];
            this.$element.find("select option").each(function(i, e) {
                this.options.options.push($(e).html());
            }.bind(this));            
        }

        this._update(true);
    },
    
    /** @ignore */
    _readDataFromMarkup: function() {
        if (this.$element.attr("disabled")) this.options.disabled = true;
        if (this.$element.attr("data-disabled")) this.options.disabled = true;
        if (this.$element.attr("multiple")) this.options.multiple = true;
        if (this.$element.attr("data-multiple")) this.options.multiple = true;
        if (this.$element.attr("placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
        if (this.$element.attr("data-placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
        if (this.$element.attr("data-editable")) this.options.editable = true;
        if (this.$element.attr("data-error")) this.options.hasError = true;
        if (this.$element.hasClass("error")) this.options.hasError = true;        
    },
    
    /** @ignore */
    _createMissingElements: function() {
        if (this.$element.find("button").length == 0) {
            var button = $("<button>" + this.options.placeholder + "</button>");
            button.addClass("dropdown");        
            this.$element.append(button);
        }
        if (this.options.editable && this.$element.find("input").length == 0) {
            var input = $("<input type=\"text\">");
            this.$element.prepend(input);
        }
        if (this.$element.find("select").length == 0) {
            var select = $("<select>");
            this.$element.append(select);
        }
    },
    
    /** @ignore */
    _update: function(updateContent) {
        if (updateContent) {
            if (this.syncSelectElement && !this.options.multiple) {
                var selectedIndex = this.syncSelectElement.find("option:selected").index();
                var html = this.options.options[selectedIndex];
                if (selectedIndex >=0) {
                    if (this.inputElement) {
                        this.inputElement.val($("<span>" + html + "</span>").text());
                    } else {
                        this.buttonElement.html(html);
                    }
                }
            }            
        }
        
        if (this.options.disabled) {
            this.buttonElement.attr("disabled", "disabled");
            this.inputElement.attr("disabled", "disabled");
        } else {
            this.buttonElement.removeAttr("disabled");            
            this.inputElement.removeAttr("disabled");            
        }
        if (this.hasFocus) {
            this.$element.addClass("focus");
        } else {
            this.$element.removeClass("focus");
        }
        if (this.options.hasError) {
            this.$element.addClass("error");
        } else {
            this.$element.removeClass("error");
        }
    }
    
    
    
  });

  CUI.util.plugClass(CUI.Dropdown);
  
  // Data API
  if (CUI.options.dataAPI) {
    $(document).ready(function() {
        $("[data-init=dropdown]").dropdown();
    });
  }  
}(window.jQuery));
