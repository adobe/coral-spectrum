(function ($) {
  CUI.Rail = new Class(/** @lends CUI.Rail# */{
    toString: 'Rail',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc TEMP: constructs a rail with a refreshable feature, [DOCS will follow the next days]
    */
    construct: function(options) {
      var e = this.$element;
      
      // TODO: option for enabling/disabling pull to refresh
      // TODO: programmatically add the necessary divs when pull to refresh is enabled?
      // TODO: render handlebars for rail template if no children

      // Accessibility
      _makeAccessible(this.$element);
      
      var _ = { // fill all locals
            rail: e,
            content: e.find('.wrap'),
            ptr: e.find('.pull-to-refresh') 
          };

      _ = $.extend(_, {
        arrow: _.ptr.find('.arrow'),
        spinner: _.ptr.find('.spinner'),
        pull: _.ptr.find('.pull'),
        release: _.ptr.find('.release'),
        loading: _.ptr.find('.loading'),
        h: _.ptr.height(),
        active: false,
        waiting: false
      });

      // add locals to the object
      this._ = _;
      // add callback
      this.callback = options.callback;

      // add pullable class to apply styling
      _.rail.addClass('pullable');

      // enable scrolling to top from point 0
      _.content.on('touchstart', $.proxy(this._handleTouchstart, this))
              .on('touchmove', $.proxy(this._handleTouchmove, this))
              .on('touchend', $.proxy(this._handleTouchend, this));    
    },

    _handleTouchstart: function (ev) {
      var _ = this._;

      if (_.waiting) {
        return true;
      }

      if (_.rail.scrollTop() === 0) {
        _.rail.scrollTop(1);
      } 
    },

    _handleTouchmove: function (ev) {
      var _ = this._,
          delay = _.h / 2, // spacing where the arrow is not moved
          top = _.rail.scrollTop(), // current scrollTop
          deg = 180 - (top < -_.h ? 180 : // degrees to move for the arrow (starts at 180° and decreases)
                      (top < -delay ? Math.round(180 / (_.h - delay) * (-top - delay)) 
                      : 0));

      if (_.waiting) {
        return true;
      }

      // handle arrow UI
      _.arrow.show();
      _.arrow.css('transform', 'rotate('+ deg + 'deg)');

      // hide spinner while showing the error
      _.spinner.hide();


      if (-top > _.h) { // release state
        _.pull.css('opacity', 0);
        _.loading.css('opacity', 0);
        _.release.css('opacity', 1);

        _.active = true;
      } else if (top > -_.h) { // pull state
        _.release.css('opacity', 0);
        _.loading.css('opacity', 0);
        _.pull.css('opacity', 1);

        _.active = false;
      } 
    },

    _handleTouchend: function (ev) {
      var _ = this._,
          top = _.rail.scrollTop();

      if (_.active) { // loading state
        ev.preventDefault();

        _.waiting = true;

        _.release.css('opacity', 0);
        _.pull.css('opacity', 0);
        _.loading.css('opacity', 1);

        // show spinner
        _.arrow.hide();
        _.spinner.show();

        // fix bar
        _.rail.scrollTop(top - _.h);
        _.ptr.css('position', 'static');
        _.active = false;

        // execute callback
        this.callback().done(function() {
          _.ptr.animate({
            height: 0
          }, 'fast', 'linear', function () {
            _.ptr.css('position', 'absolute');
            _.ptr.height(_.h);
            _.waiting = false;
          });  
        });
      }
    }
    
  });

  var _makeAccessible = function($element) {
    // The rail is complementary content
    // See: http://www.w3.org/TR/wai-aria/roles#complementary
    $element.attr('role', 'complementary');
  };
  
  CUI.util.plugClass(CUI.Rail);

}(window.jQuery));
