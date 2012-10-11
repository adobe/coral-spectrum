(function ($) {
  CUI.Rail = new Class(/** @lends CUI.Rail# */{
    toString: 'Rail',
    extend: CUI.Widget,
    
    /**
      @extends CUI.Widget
      @classdesc this widget extends the rail to the following features
        - enables foldable sections
        - optionally pull-to-refresh functionality for the rail

      <div id="myRail" class="rail">
        <div class="pull-to-refresh">
              <div class="icon"></div>
              <div class="message">
                <i class="arrow"></i>
                <i class="spinner large"></i>
                <span class="pull">Pull to refresh</span>
                <span class="release">Release to refresh</span>
                <span class="loading">Loading</span>
              </div>
            </div>
            <div class="wrap">
              Place your content here.
            </div>
      </div>
      @example
<caption>Instantiate with Class</caption>
var alert = new CUI.Rail({
  element: '#myRail',
  refreshCallback: function () { // if the callback is set then the pull-to-refresh feature is getting enabled
    var def = $.Deferred(); 
    setTimeout(function() {
      def.resolve();      
    }, 3000); 

    return def.promise(); // it is expected that the callback returns a promise
  }
});
// Within the callback function execute your ajax call to get the necessary data
// reminder jQuery.ajax returns a promise by default

      @example
<caption>Instantiate with jQuery</caption>
$('#myRail').rail({
  refreshCallback: function () {
    var def = $.Deferred();
    setTimeout(function() {
      def.resolve();      
    }, 3000); 

    return def.promise();
  }
});

      @example
<caption>Markup</caption>
&lt;div class=&quot;rail right&quot; role=&quot;complementary&quot;&gt;
  &lt;div class=&quot;pull-to-refresh&quot;&gt;
    &lt;div class=&quot;message&quot;;&gt;
      &lt;i class=&quot;arrow&quot;;&gt;&lt;/i;&gt;
      &lt;i class=&quot;spinner large&quot;;&gt;&lt;/i;&gt;
      &lt;span class=&quot;pull&quot;;&gt;Pull to refresh&lt;/span;&gt;
      &lt;span class=&quot;release&quot;;&gt;Release to refresh&lt;/span;&gt;
      &lt;span class=&quot;loading&quot;;&gt;Loading&lt;/span;&gt;
    &lt;/div;&gt;
  &lt;/div&gt;
  &lt;div class=&quot;wrap&quot;&gt;
    &lt;section&gt;
        &lt;h4&gt;Update Feed&lt;/h4&gt;
    &lt;/section&gt;
    &lt;section class=&quot;foldable&quot;&gt;
        &lt;h4 class=&quot;heading&quot;&gt;Revised asset ready for review&lt;/h4&gt;
        &lt;div class=&quot;fold small grey light&quot;&gt;Modified yesterday by Rob Cobourn&lt;/div&gt;
        &lt;p class=&quot;small&quot;&gt;I created a new segment thing for the...&lt;/p&gt;
    &lt;/section&gt;
  &lt;/div&gt;
&lt;/div&gt;
&lt;div class=&quot;content&quot;&gt;
  &lt;p&gt;Content.&lt;/p&gt;
&lt;/div&gt;

      @desc extends the functionality of a rail
      @constructs

      @param {Object} options                               Component options
      @param {Function} options.refreshCallback             Callback to be called after a refresh is triggered
    */
    construct: function(options) {
      var e = this.$element;
      
      // TODO: programmatically add the necessary divs when pull to refresh is enabled?
      // TODO: render handlebars for rail template if no children

      // Accessibility
      _makeAccessible(this.$element);
      
      var _ = { // fill all locals
            rail: e,
            content: e.find('.wrap'),
            ptr: e.find('.pull-to-refresh') 
          }, foldable = _.content.find('section.foldable');
          
      if (options.refreshCallback) { // the refreshable option will be activated of the refreshCallback is set
        //if (!_.ptr) { // add markup if there is non

        //}

        // enable foldable section
        foldable.each(function (i, e) {
          var f = $(e),
              trigger = f.find('.heading');

          trigger.on('click', function (ev) { // TODO make that for touch
            f.toggleClass('open');
          });
        });


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
        this.callback = options.refreshCallback;

        // add pullable class to apply styling
        _.rail.addClass('pullable');

        // enable scrolling to top from point 0
        _.content.on('touchstart', $.proxy(this._handleTouchstart, this))
                .on('touchmove', $.proxy(this._handleTouchmove, this))
                .on('touchend', $.proxy(this._handleTouchend, this));    
      }
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
