(function($) {
  CUI.Tour = new Class(/** @lends CUI.Tour# */{
    toString: 'Tour',

    extend: CUI.Widget,
    /**
      @extends CUI.Widget
      @classdesc A tour which allows to explain the application

      <div class="tour" data-init="tour">
        <div class="tour-slide active">
            <section>
                <h1>Technology Preview</h1>
                <p>
                    Welcome to the new Touch optimized page editor !<br/>
                    Your feedback is important
                </p>
            </section>
            <img src="http://lorempixel.com/output/technics-q-c-852-396-5.jpg">
        </div>
        <div class="tour-slide">
            <section>
                <h1>Technology Preview</h1>
                <p>
                    Welcome to the new Touch optimized page editor !<br/>
                    Your feedback is important
                </p>
            </section>
            <img src="http://lorempixel.com/output/technics-q-c-852-396-5.jpg">
        </div>
        <div class="tour-slide">
            <section>
                <h1>Technology Preview</h1>
                <p>
                    Welcome to the new Touch optimized page editor !<br/>
                    Your feedback is important
                </p>
            </section>
            <img src="http://lorempixel.com/output/technics-q-c-852-396-5.jpg">
        </div>
        <nav>
            <button>Skip into</button>
            <a href="#" class="prev icon-chevronleft medium">Previous</a>
            <a href="#" class="next icon-chevronright medium">Next</a> 
            <div class="control">
                <a href="#" class="active"></a>
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
      $('#myTour').tour({
        
      });

      @desc Creates a new tour
      @constructs

      @param {Object} options Component options
     */
    construct: function (options) {
      this.applyOptions();

      this.$navigation = this.$element.find('nav');
      this.$skip = this.$navigation.find('button');
      this.$prev = this.$navigation.find('a.prev');
      this.$next = this.$navigation.find('a.next');
      this.$control = this.$navigation.find('.control');

      // set if !.active slide, set first as active


      this._bindControls();
    },

    defaults: {

    },

    applyOptions: function () {

    },

    slideToNext: function () {

    },

    slideToPrev: function () {

    },

    slideTo: function (no) {

    },

    /** @ignore */
    _bindControls: function () {
      this.$skip.fipo('tap', 'click', this._hide.bind(this));
      this.$prev.fipo('tap', 'click', this.slideToPrev.bind(this));
      this.$next.fipo('tap', 'click', this.slideToNext.bind(this));
      this.$control.fipo('tap', 'click', 'a', function (event) {
        alert($(event.currentTarget).index());  
      });
    },

    /** @ignore */
    _show: function () {
      this.$element.trigger($.Event("beforeshow"));
        
    },

    /** @ignore */
    _hide: function () {
      
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
          }).appendTo(document.body).fadeIn();

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
