(function($) {
  CUI.Tabs = new Class(/** @lends CUI.Tabs# */{
    extend: CUI.Widget,
    construct: function(options) {
      // TODO
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
      $target.siblings('section').removeClass('active');
      $target.addClass('active');
    });
  });
}(window.jQuery));
