(function($) {
  CUI.Modal = new Class(/** @lends CUI.Modal# */{
    extend: CUI.Widget,
    
    /**
     * Modal dialog
     *
     * @constructs
     * @extends CUI.Widget
     *
     * @param {Object} options  Component options
     * @param {String} options.heading    Title of the modal dialog (HTML)
     * @param {String} options.content    Content of the dialog (HTML)
     * @param {Array} options.buttons     Array of button descriptors
     * @param {Mixed} options.backdrop    False to not display transparent underlay, True to display and close when clicked, 'static' to display and not close when clicked
     */
    construct: function(options) {
      // Catch clicks to dismiss modal
      this.$element.delegate('[data-dismiss="modal"]', 'click.dismiss.modal', this.hide);

      // TODO: Uh, does this fetch content asynchronously?
      if (this.options.remote)
        this.$element.find('.modal-body').load(this.options.remote);
      
      // Add modal class to give styling
      this.$element.addClass('modal');
      
      // Make focusable
      this.$element.attr('tabIndex', -1);
      
      // Accessibility
      this.$element.attr('role', 'dialog'); // needed?
      this.$element.attr('aria-hidden', true);
      
      // Listen to changes to configuration
      this.$element.on('change:buttons', this._setButtons.bind(this));
      this.$element.on('change:heading', this._setHeading.bind(this));
      this.$element.on('change:content', this._setContent.bind(this));
      
      // Render template, if necessary
      if (this.$element.children().length === 0) {
        this.$element.html(CUI.Templates['modal']($.extend({}, this.options, { buttons: '' })));
        // Only set buttons, heading/content are applied when template is rendered
        this._setButtons();
      }
      else {
        // Set all options
        this._setContent();
        this._setHeading();
        this._setButtons();
      }
    },
    
    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;
      
      this.$element.find('.modal-body').html(this.options.content);
      
      // Re-center when content changes
      this.center();
    },
    
    /** @ignore */
    _setHeading: function() {
      if (typeof this.options.heading !== 'string') return;

      this.$element.find('.modal-header h2').html(this.options.heading);
      
      // Re-center when content changes
      this.center();
    },
    
    /** @ignore */
    _show: function() {
      $('body').addClass('modal-open');
      
      this._toggleBackdrop(true);
      this._setEscapeHandler(true);
      
      // Add to body if this element isn't in the DOM already
      if (!this.$element.parent().length) {
        this.$element.appendTo(document.body);
      }

      this.$element.addClass('in').attr('aria-hidden', false).fadeIn().focus();
      
      this.center();
    },
      
    /** @ignore */
    _hide: function() {
      $('body').removeClass('modal-open');

      this.$element.removeClass('in').attr('aria-hidden', true);
      
      this.$element.fadeOut().trigger('hidden');

      this._toggleBackdrop(false);
      this._setEscapeHandler(false);
        
      return this;
    },
    
      
    /** @ignore */
    _setEscapeHandler: function(show) {
      if (show && this.options.keyboard) {
        $('body').on('keyup', function (e) {
          if (e.which === 27)
            this.hide();
        }.bind(this));
      }
      else if (!show) {
        this.$element.off('keyup');
      }
    },
    
    /** @ignore */
    _removeBackdrop: function() {
        if (this.$backdrop && !this.get('visible')) {
          // Remove from the DOM
          this.$backdrop.remove();
          this.$backdrop = null;
        }
    },
    
    /** @ignore */
    _toggleBackdrop: function(show) {
      if (show && this.options.backdrop) {
        if (this.$backdrop)
          this.$backdrop.fadeIn();
        else {
          this.$backdrop = $('<div class="modal-backdrop" style="display: none;" />').appendTo(document.body).fadeIn();
          
          // Note: If this option is changed before the fade completes, it won't apply
          if (this.options.backdrop !== 'static') {
            this.$backdrop.click(this.hide);
          }
        }
      }
      else if (!show && this.$backdrop) {
        this.$backdrop.fadeOut(function() {
          this._removeBackdrop();
        }.bind(this));
      }
    },
      
    /**
     * Center the modal in the screen
     *
     * @returns {CUI.Modal} this, chainable
     */
    center: function() {
      var width = this.$element.outerWidth();
      var height = this.$element.outerHeight();
      
      this.$element.css('marginLeft', -width/2);
      this.$element.css('marginTop', -height/2);
      
      return this;
    },
      
    /** @ignore */
    _setButtons: function() {
      if (!$.isArray(this.options.buttons))  return;
      
      var $footer = this.$element.find('.modal-footer');
      
      // Remove existing children
      $footer.children().remove();
      
      $.each(this.options.buttons, function(index, button) {
        // Create an anchor if href is provided
        var el = $(button.href ? '<a class="button" />' : '<button type="button" />');

        // Add label
        el.html(button.label);
        
        if (button.click) {
          if (button.click === 'close')
            el.attr('data-dismiss', 'modal');
          else if (typeof button.click === 'function')
            el.on('click', button.click.bind(this, { dialog: this }));
        }
        
        if (button.href)
          el.attr('href', button.href);
        
        if (button.className)
          el.addClass(button.className);
        
        $footer.append(el);
      }.bind(this));
    }
  });

  // jQuery plugin
  $.fn.modal = function(optionsIn) {
    return this.each(function () {
      var $this = $(this);
      
      // Get instance, if present already
      var instance = $this.data('modal');
      
      // Combine defaults, data, options, and element config
      var options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof optionsIn === 'object' && optionsIn, { element: this });
    
      if (!instance)
        $this.data('modal', (instance = new CUI.Modal(options)));
      
      if (typeof optionsIn === 'string') // Call method
        instance[optionsIn]();
      else if ($.isPlainObject(optionsIn)) // Apply options
        instance.set(optionsIn);
    });
  };

  $.fn.modal.defaults = {
    backdrop: 'static',
    keyboard: true,
    visible: true
  };

  $.fn.modal.Constructor = CUI.Modal;

  // Data API
  $(function() {
    $('body').on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
      var $trigger = $(this);
      
      // Get the target from data attributes
      var $target = CUI.util.getDataTarget($trigger);

      var href = $trigger.attr('href');

      // If a modal already exists, toggle its visibility
      // Otherwise, pass configuration based on data attributes in the triggering link
      var option = $target.data('modal') ? 'toggleVisibility' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $trigger.data());

      // Stop links from navigating
      e.preventDefault();

      // When the dialog is closed, focus on the button that triggered its display
      $target.modal(option).one('hide', function() {
          $trigger.focus();
      });
    });
  });
}(window.jQuery));
