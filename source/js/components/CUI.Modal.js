(function($) {
  CUI.Modal = new Class(/** @lends CUI.Modal# */{
    /**
     * Modal dialog
     *
     * @constructs
     *
     * @param {Object} options  Component options
     * @param {String} options.heading   Title of the modal dialog (HTML)
     * @param {String} options.content   Content of the dialog (HTML)
     * @param {Array} options.buttons   Array of button descriptors
     */
    construct: function(options) {
      // Store options
      this.options = options;
      
      // Store jQuery object
      this.$element = $(options.element);
      
      // Always execute hide in proper scope
      this.bind(this.hide);
      
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
      
      // Render template, if necessary
      if (this.$element.children().length === 0) {
        this.$element.html(CUI.Templates['modal']($.extend({}, this.options, { buttons: '' })));
        
        this.setButtons(this.options.buttons);
      }
      else {
        // Apply options otherwise
        if (this.options.content)
          this.$element.find('.modal-body').html(this.options.content);
        if (this.options.heading)
          this.$element.find('.modal-header h2').html(this.options.heading);
        if (this.options.buttons)
          this.setButtons(this.options.buttons);
      }
      
      this.isShown = false;
    },
  
    /**
     * Show the modal
     *
     * @returns {CUI.Modal} this, chainable
     */
    show: function() {
      // Handle jQuery eventing
      var e = $.Event('show');
      this.$element.trigger(e);
      
      // Do nothing if event is prevented or we're already visible
      if (this.isShown || e.isDefaultPrevented()) return this;
      
      $('body').addClass('modal-open');

      this.isShown = true;
      
      this.toggleBackdrop();
      this.handleEscape();
      this.center();
      
      // Add to body if this element isn't in the DOM already
      if (!this.$element.parent().length) {
        this.$element.appendTo(document.body);
      }

      this.$element.addClass('in').attr('aria-hidden', false).fadeIn().focus();
      
      return this;
    },
      
    /**
     * Hide the modal
     *
     * @returns {CUI.Modal} this, chainable
     */
    hide: function(e) {
      if (e)
        e.preventDefault(); // Stop submit buttons from doing their thing
      
      // Handle jQuery eventing
      e = $.Event('hide');
      this.$element.trigger(e);

      if (!this.isShown || e.isDefaultPrevented()) return this;

      this.isShown = false;

      $('body').removeClass('modal-open');

      this.$element.removeClass('in').attr('aria-hidden', true);
      
      this.$element.fadeOut().trigger('hidden');

      this.toggleBackdrop();
      this.handleEscape();
        
      return this;
    },
      
    /**
     * Toggle the visibility of the modal
     *
     * @returns {CUI.Modal} this, chainable
     */
    toggle: function() {
      return this[!this.isShown ? 'show' : 'hide']();
    },
    
      
    /** @ignore */
    handleEscape: function () {
      if (this.isShown && this.options.keyboard) {
        $('body').on('keyup', function (e) {
          if (e.which === 27)
            this.hide();
        }.bind(this));
      }
      else if (!this.isShown) {
        this.$element.off('keyup');
      }
    },
    toggleBackdrop: function () {
      if (this.isShown && this.options.backdrop) {
        this.$backdrop = $('<div class="modal-backdrop" style="display: none;" />').appendTo(document.body).fadeIn();

        if (this.options.backdrop !== 'static') {
          this.$backdrop.click(this.hide);
        }
      }
      else if (!this.isShown && this.$backdrop) {
        this.$backdrop.fadeOut(function() {
          this.$backdrop.remove();
          this.$backdrop = null;
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
      
    /**
     * Change the modal's buttons
     *
     * @param {Array} buttons   Array of button descriptors
     *
     * @returns {CUI.Modal} this, chainable
     */
    setButtons: function(buttons) {
      var $footer = this.$element.find('.modal-footer');
      
      // Remove existing children
      $footer.children().remove();
      
      $.each(buttons, function(index, button) {
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
      else if (options.visible) // show immediately
        instance.show();
    });
  };

  $.fn.modal.defaults = {
    backdrop: true,
    keyboard: true,
    visible: true
  };

  $.fn.modal.Constructor = CUI.Modal;

  // Data API
  $(function() {
    $('body').on('click.modal.data-api', '[data-toggle="modal"]', function (e) {
      var $this = $(this);
      var href = $this.attr('href');
      var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, ''))); //strip for ie7
      var option = $target.data('modal') ? 'toggle' : $.extend({ remote: !/#/.test(href) && href }, $target.data(), $this.data());

      e.preventDefault();

      $target.modal(option).one('hide', function () {
          $this.focus();
      });
    });
  });
  
}(window.jQuery));
