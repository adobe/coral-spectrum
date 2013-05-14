(function($) {
  CUI.Modal = new Class(/** @lends CUI.Tour# */{
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
    construct: function(options) {
      this.applyOptions();

      // set if !.active slide, set first as active
    },

    defaults: {

    },

    applyOptions: function() {

    },

    /** @ignore */
    _show: function() {
        
    },

    /** @ignore */
    _hide: function() {
      
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

    $(document).on("cui-contentloaded.data-api", function(e) {
      $("[data-init=tour]", e.target).tour();
    });

  }
}(window.jQuery));
