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
        if (this.$element.get(0).tagName === "SELECT") {
            if (this.$element.attr("disabled")) this.options.disabled = true;
            if (this.$element.attr("multiple")) this.options.multiple = true;
            if (this.$element.attr("data-placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
            if (this.$element.attr("data-editable")) this.options.editable = true;
            if (this.$element.hasClass("error")) this.options.hasError = true;
            
            this.options.options = [];
            this.$element.find("option").each(function(i, e) {
                this.options.options.push($(e).html());
            }.bind(this));
            
            var button = $("<button>" + this.options.placeholder + "</button>");
            button.addClass("dropdown");
            this.buttonElement = button;
            this.positioningElement = button;
            
            this.$element.after(button);
            this.syncSelectElement = this.$element;
            this.$element = button;
            this.syncSelectElement.hide();            
        }
        
        if (this.options.editable) {
            var div = $("<div></div>");
            div.addClass("dropdown-editable");
            var input = $("<input type=\"text\">");
            div.append(input);
            if (this.syncSelectElement) input.attr("name", this.syncSelectElement.attr("name") + "-edit");
            this.$element.after(div);
            div.append(this.$element);
            this.$element = div;
            this.positioningElement = div;
            this.inputElement = input;
        }

        this._update(true);
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
            this.$element.attr("disabled", "disabled");
        } else {
            this.$element.removeAttr("disabled");            
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
        $("select[data-init=dropdown]").dropdown();
    });
  }  
}(window.jQuery));
