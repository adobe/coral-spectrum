(function($) {
  CUI.Alert = new Class(/** @lends CUI.Alert# */{
    toString: 'Alert',
    extend: CUI.Widget,
    
    /**
      Alert dialog
      
      @constructs
      
      @param {Object} options                   Component options
      @param {String} options.heading           Title of the alert (HTML)
      @param {String} options.content           Content of the alert (HTML)
      @param {Boolean} options.closable         Array of button descriptors
      @param {String} [options.type=default]    Type of Alert to display. One of error, notice, success, help, or info
    */
    construct: function(options) {
      // Catch clicks to dismiss alert
      this.$element.delegate('[data-dismiss="alert"]', 'click.dismiss.alert', this.hide);

      // Add alert class to give styling
      this.$element.addClass('alert');
      
      // Listen to changes to configuration
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:type', this._setType.bind(this));
      this.$element.on('change:closable', this._setClosable.bind(this));
      
      // Render template, if necessary
      if (this.$element.children().length === 0) {
        // Set default heading
        this.options.heading = this.options.heading === undefined ? this.options.type.toUpperCase() : this.options.heading;
      
        this.$element.html(CUI.Templates['alert'](this.options));
        this.applyOptions(true);
      }
      else {
        this.applyOptions();
      }
    },
    
    defaults: {
      type: 'error',
      heading: undefined,
      visible: true,
      closable: true
    },
    
    _validTypes: [
      'error',
      'notice',
      'success',
      'help',
      'info'
    ],
    
    applyOptions: function(partial) {
      if (!partial) {
        this._setHeading();
        this._setContent();
      }
      this._setClosable();
      this._setType();
    },
    
    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;
      
      this.$element.find('div').html(this.options.content);
    },
    
    /** @ignore */
    _setHeading: function() {
      if (typeof this.options.content !== 'string') return;
    
      this.$element.find('strong').html(this.options.heading);
    },
    
    /** @ignore */
    _setType: function() {
      if (typeof this.options.type !== 'string' || this._validTypes.indexOf(this.options.type) === -1) return;
      
      // Remove old type
      this.$element.removeClass(this._validTypes.join(' '));

      // Add new type
      this.$element.addClass(this.options.type);
    },
    
    /** @ignore */
    _setClosable: function() {
      var el = this.$element.find('.close');
      if (!el.length) {
        // Add the close element if it's not present
        this.$element.prepend('<button class="close" data-dismiss="alert">&times;</button>');
      }
      else {
        el[this.options.closable ? 'show' : 'hide']();
      }
    }
  });

  CUI.util.plugClass(CUI.Alert);
  
  // Data API
  $(function() {
    $('body').on('click.alert.data-api', '[data-dismiss="alert"]', function(evt) {
      $(evt.target).parent().hide();
    });
  });
}(window.jQuery));
