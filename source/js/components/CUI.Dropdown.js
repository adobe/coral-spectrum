(function($) {
  CUI.Dropdown = new Class(/** @lends CUI.Dropdown# */{
    toString: 'Dropdown',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc A dropdown list widget
      
      
      @desc Creates a dropdown from any select element
      @constructs
      
      @param {Object}   options                               Component options
      
    */
    construct: function(options) {
        
        this._render();
        
        this.dropdownList = new CUI.DropdownList({
            element: this.$element,
            options: this.options.options,
            optionRenderer: this._optionRenderer.bind(this)
        });
        
        this.$element.on("dropdown-list:select", "", function(event) {
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
                    this.$element.html(this.options.options[event.selectedIndex]);
                }
            }
        }.bind(this));
        
        this.$element.on("click", "", function() {
            this.dropdownList.show();
        }.bind(this));
              
    },
    
    defaults: {
        multiple: false,
        placeholder: "Select",
        disabled: false
    },
    
    dropdownList: null,
    syncSelectElement: null,
    
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
    
    _render: function() {
        if (this.$element.get(0).tagName === "SELECT") {

            if (this.$element.attr("disabled")) this.options.disabled = true;
            if (this.$element.attr("multiple")) this.options.multiple = true;
            if (this.$element.attr("data-placeholder")) this.options.placeholder = this.$element.attr("data-placeholder");
            
            this.options.options = [];
            this.$element.find("option").each(function(i, e) {
                this.options.options.push($(e).html());
            }.bind(this));
            
            var button = $("<button>" + this.options.placeholder + "</button>");
            button.addClass("dropdown");

            this.$element.after(button);
            this.syncSelectElement = this.$element;
            this.$element = button;
            this.syncSelectElement.hide();            
        }
        this._update();
    },
    _update: function() {
        if (this.options.disabled) {
            this.$element.attr("disabled", "disabled");
        } else {
            this.$element.removeAttr("disabled");            
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
