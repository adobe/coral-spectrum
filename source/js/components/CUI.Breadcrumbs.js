(function($) {
  CUI.Breadcrumbs = new Class(/** @lends CUI.Breadcrumbs# */{
    toString: 'Breadcrumbs',
    extend: CUI.Widget,
    
    defaults: {
    },
    
    timeout: null,
    popoverShown: false,
    
    /**
      @extends CUI.Widget
      @classdesc A breadcrumbs widget
        
      @param {Object}   options                               Component options
      
    */
    construct: function(options) {
        var $link = this.$element.find('a').first();
        var $popover = this.$element.find('.popover').first();

        $link.on("click", function() {
            this.togglePopover();
            this._keepFocus();
        }.bind(this));

        $popover.on("click", function() {
            this._keepFocus();
        }.bind(this));

        $link.on("blur", function() {
            this.timeout = setTimeout(function() {
                this.timeout = null;
                this.hidePopover();
            }.bind(this), 200);
        }.bind(this));
    },

    _keepFocus: function() {
        var $link = this.$element.find('a').first();

        clearTimeout(this.timeout);
        this.timeout = null;
        $link.focus();
    },

    togglePopover: function() {
        if (this.popoverShown) {
            this.hidePopover();
        } else {
            this.showPopover();
        }
    },

    showPopover: function() {
        this._placePopover();
        this.$element.find('.popover').show();
        this.popoverShown = true;
    },

    hidePopover: function() {
        this.$element.find('.popover').hide();
        this.popoverShown = false;
    },

    _placePopover: function() {
        var $link = this.$element.find('a').first();
        var $popover = this.$element.find('.popover');
        
        var position = $link.position();
        var size = {
            width: $link.width(),
            height: $link.height()
        };

        var top = position.top + size.height + 15;
        var left = position.left;
        var marginLeft = size.width - 30;

        $popover.css({
            top: top,
            left: left,
            width: size.width
        });
        
        $('.popover.arrow-top::before').css({
            marginLeft: marginLeft
        });
    }
    
  });
  
  CUI.util.plugClass(CUI.Breadcrumbs);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).ready(function() {
        $("[data-init=breadcrumbs]").breadcrumbs();
    });
  }  

}(window.jQuery));
