(function($) {
  CUI.Modal = new Class(/** @lends CUI.Tour# */{
    toString: 'Tour',

    extend: CUI.Widget,
    /**
      @extends CUI.Widget
      @classdesc A tour which allows to explain the application


      @desc Creates a new tour
      @constructs

      @param {Object} options Component options
     */
    construct: function(options) {
      this.applyOptions();
    },

    // Todo: fetch content method?

    defaults: {

    },

    applyOptions: function(partial) {

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
