(function($) {
  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    toString: 'Tabs',
    extend: CUI.Widget,
    construct: function(options) {
      // Add tabs class to give styling
      this.$element.addClass('tabs');
      
      // Accessibility
      this.$element.attr('role', 'tabpanel');

      // sane defaults for the options
      this.options = $.extend({}, {tabs: []}, this.options);

      if (this.options.tabs.length > 0) {
        var hasActive = false;

        this.options.tabs.forEach(function(t) { 
          if (t.active) {
            hasActive = true;
            return false;
          }
        });

        if (!hasActive) {
          this.options.tabs[0].active = true;
        }
      }

      // Render template, if necessary
      if (this.$element.children().length === 0) {
        this.$element.html(CUI.Templates['tabs'](this.options));
        this.applyOptions(true);
      } else {
        this.applyOptions();
      }
    },
    _types: [
      'white',
      'nav',
      'stacked'
    ],
    applyOptions: function(partial) {
      // Set all options
      if (!partial) {
        //this._setContent();
      }
      this._setType();
    },
    /** @ignore */
    _setType: function() {
      if (typeof this.options.type !== 'string' || this._types.indexOf(this.options.type) === -1) return;
      
      // Remove old type
      this.$element.removeClass(this._types.join(' '));

      // Add new type
      this.$element.addClass(this.options.type);
    },
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;
      
      this.$element.find('.modal-body').html(this.options.content);
    }
  });

  // jQuery plugin
  CUI.util.plugClass(CUI.Tabs);

  $(function() {
    //$('.tabs > ')
    // Data API
    $('body').on('click.tabs.data-api', '.tabs > nav > a[data-toggle="tab"]:not(".disabled")', function (e) {
      // Stop links from navigating
      e.preventDefault();

      // cache the clicked link
      var $trigger = $(this);
      
      // Get the target from data attributes
      var $target = CUI.util.getDataTarget($trigger);

      // allow for non-id'd section switching
      if ($target.selector === '#') {
        $target = $trigger.parents('.tabs').find('section:eq('+$trigger.index()+')');
      }

      // Pass configuration based on data attributes in the triggering link
      var href = $trigger.attr('href'),
          remote = !/#/.test(href) && href;

      // load remote link, if necessary
      if (remote && !$target.data('tabs-loaded-remote')) {
        $target.html('<div class="spinner large"></div>');

        $target.load(remote, function(response, status, xhr) {
          if (status === 'error') {
            $target.html('<div class="alert error"><div class="icon"></div> '+xhr.statusText+'</div>');
            $target.data('tabs-loaded-remote', false);
          }
        });

        $target.data('tabs-loaded-remote', true);
      }

      // and show/hide the relevant tabs
      $trigger.siblings('a[data-toggle="tab"]').removeClass('active');
      $trigger.addClass('active');
      $target.siblings('section').removeClass('active').attr('aria-hidden', true);
      $target.addClass('active');
    });
  });
}(window.jQuery));
