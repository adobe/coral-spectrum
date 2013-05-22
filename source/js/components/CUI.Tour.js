(function($) {
  CUI.Tour = new Class(/** @lends CUI.Tour# */{
    toString: 'Tour',

    extend: CUI.Widget,
    /**
      @extends CUI.Widget
      @classdesc A tour which allows to explain the application

      <h2 class="line">Example</h2>
      <button onclick="$('#myTour').tour('show')" class="primary">Test the tour</button>
      
      <div id="myTour" class="tour" data-init="tour">
        <div class="tour-slide active">
            <section>
                <h1>Technology Preview</h1>
                <p>
                    Welcome to the new Touch optimized page editor !<br/>
                    Your feedback is important
                </p>
            </section>
            <img src="http://lorempixel.com/852/396/?img=1">
        </div>
        <div class="tour-slide">
            <section>
                <h1>Technology Preview</h1>
                <p>
                    Welcome to the new Touch optimized page editor !<br/>
                    Your feedback is important
                </p>
            </section>
            <img src="http://lorempixel.com/852/396/?img=2">
        </div>
        <div class="tour-slide">
            <section>
                <h1>Technology Preview</h1>
                <p>
                    Welcome to the new Touch optimized page editor !<br/>
                    Your feedback is important
                </p>
            </section>
            <img src="http://lorempixel.com/852/396/?img=3">
        </div>
        <nav>
            <button class="skip">Skip into</button>
            <button class="done primary">OK</button>
            <a href="#" class="prev icon-chevronleft medium">Previous</a>
            <a href="#" class="next icon-chevronright medium">Next</a> 
            <div class="control">
                <a href="#"></a>
                <a href="#"></a>
                <a href="#"></a>
            </div>
        </nav>
      </div>

      @example
      <caption>Instantiate with Class</caption>
      var modal = new CUI.Tour({
        element: '#myTour'
      });

      @example
      <caption>Instantiate with jQuery</caption>
      $('#myTour').tour();

      // open the tour
      $('#myTour').tour('show');

      @desc Creates a new tour
      @constructs

      @param {Object} options Component options
      @param {Boolean} [options.autoshow=false]   True to open the dialog immediately after initialization
      @param {Mixed} [options.backdrop=static]    False to not display transparent underlay, True to display and close when clicked, 'static' to display and not close when clicked
     */
    construct: function (options) {
      var idx;

      this.$slides = this.$element.find('.tour-slide');
      this.$navigation = this.$element.find('nav');
      this.$skip = this.$navigation.find('button.skip');
      this.$done = this.$navigation.find('button.done');
      this.$prev = this.$navigation.find('a.prev');
      this.$next = this.$navigation.find('a.next');
      this.$control = this.$navigation.find('.control');

      // set current slide
      this.$current = this.$element.find('.tour-slide.active');
      this.$current = this.$current.length > 0 ? this.$current : this.$element.find('.tour-slide:eq(0)').addClass('active'); // if no slide is selected set first

      // set current state in nav
      idx = this.$current.index();
      this._setCircleNav(idx);
      this._toggleButtons(idx);

      // bind the handlers
      this._bindControls();

      if (this.$element.hasClass('show')) {
        this.options.autoshow = true;
      }

      if (this.options.autoshow) {
        this.show();
      }
    },

    defaults: {
      autoshow: false,
      backdrop: 'static'
    },

    /** @ignore */
    _toggleButtons: function (idx) {
      //reset
      this.$skip.removeClass('show');
      this.$done.removeClass('show');
      this.$prev.removeClass('hide');
      this.$next.removeClass('hide');

      if (idx === 0) {
        this.$skip.addClass('show');
        this.$prev.addClass('hide');  
      } else if (idx === this.$slides.length - 1 ) {
        this.$done.addClass('show');
        this.$next.addClass('hide');  
      }
    },

    /** @ignore */
    _setCircleNav: function (idx) {
      this.$control.find('a')
        .removeClass('active')
        .filter(':eq('+ idx +')')
        .addClass('active');
    },

    /** @ignore */
    _slideTo: function (sl) {
      var slide = $(sl), 
        idx = slide.index();

      if (slide.length > 0) {
        this.$current.removeClass('active');
        this.$current = slide.addClass('active'); 

        this._setCircleNav(idx);  
        this._toggleButtons(idx);
      }
    },

    /**
     * slides to the next slide
     * @return {this}
     */
    slideToNext: function () {
      var next = this.$current.next('.tour-slide');
      this._slideTo(next);

      return this;
    },

    /**
     * slides to the previous slide
     * @return {this}
     */
    slideToPrev: function () {
      var prev = this.$current.prev('.tour-slide');
      this._slideTo(prev);

      return this;
    },

    /**
     * slides to the last slide
     * @return {this}
     */
    slideToLast: function () {
      var last = this.$element.find('.tour-slide:last');
      this._slideTo(last);

      return this;
    },

    /**
     * slides to the given index of a slide
     * @param  {integer} no
     * @return {this}
     */
    slideTo: function (no) {
      this._slideTo(this.$slides[no]);

      return this;
    },

    /** @ignore */
    _bindControls: function () {
      // disable all anchors
      this.$navigation.on('click', 'a', function (event) {
        event.preventDefault();
      });

      this.$skip.fipo('tap', 'click', this.slideToLast.bind(this));
      this.$done.fipo('tap', 'click', this.hide.bind(this));
      this.$prev.fipo('tap', 'click', this.slideToPrev.bind(this));
      this.$next.fipo('tap', 'click', this.slideToNext.bind(this));
      this.$control.fipo('tap', 'click', 'a', function (event) {
        this.slideTo($(event.currentTarget).index());
      }.bind(this));

      this.$element.finger('swipe', '.tour-slide', function (event) {
        if (event.finger === 1) {
          if (event.direction === 'left') {
            this.slideToNext();
          } else if (event.direction === 'right') {
            this.slideToPrev();
          }
        }
      }.bind(this));
    },

    /** @ignore */
    _startImageTransitions: function () {
      var $fadableImages = this.$element.find('.fadable');
      this._imageTransitionsTimer = setInterval(function () {
          $fadableImages.toggleClass('faded');
      }, 3000);
    },

    /** @ignore */
    _stopImageTransitions: function () {
      clearInterval(this._imageTransitionsTimer);
    },

    /** @ignore */
    _show: function () {
      this.$element.addClass('show');  
      this._toggleBackdrop(true);
      this._startImageTransitions();
    },

    /** @ignore */
    _hide: function () {
      this.$element.removeClass('show');
      this._toggleBackdrop();
      this._stopImageTransitions();
    },

    /** @ignore */
    _removeBackdrop: function () {
        if (this.$backdrop && !this.get('visible')) {
          // Remove from the DOM
          this.$backdrop.remove();
          this.$backdrop = null;
        }
    },

    /** @ignore */
    _toggleBackdrop: function (show) {
      if (show && this.options.backdrop) {
        if (this.$backdrop)
          this.$backdrop.fadeIn();
        else {
          this.$backdrop = $('<div/>', {
            class: 'tour-backdrop',
            css: {
              display: 'none'
            }
          }).appendTo(document.body);

          // start async to have a fadein effect
          setTimeout(function () {
            this.$backdrop.fadeIn()
          }.bind(this), 50);

          // Note: If this option is changed before the fade completes, it won't apply
          if (this.options.backdrop !== 'static') {
            this.$backdrop.click(this.hide);
          }
        }
      }
      else if (!show && this.$backdrop) {
        this.$backdrop.fadeOut(function () {
          this._removeBackdrop();
        }.bind(this));
      }
    }

  });

  CUI.util.plugClass(CUI.Tour);

  // Data API
  if (CUI.options.dataAPI) {

    $(document).on("cui-contentloaded.data-api", function (event) {
      $("[data-init=tour]", event.target).tour();
    });

  }
}(window.jQuery));
