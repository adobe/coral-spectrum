;(function($) {
  "use strict";

  CUI.Autocomplete = new Class(/** @lends CUI.Autocomplete# */{
    toString: "Autocomplete",
    extend: CUI.Widget,

    defaults: {
    },

    construct: function() {
      this._input = this.$element.children("input");
      this._setupValues();
      this._setupClear();
    },

    _setupValues: function() {
      var name = this._input.prop("name");

      this.$element.children("ol.autocomplete-values")
        .on("click tap", ".autocomplete-remove", function(e) {
          e.preventDefault();
          $(this).closest("li").remove();
        })
        .children("li").each(function() {
          var el = $(this);
          el.prepend("<button class='autocomplete-remove icon-close xsmall' />");

          var hidden = $("<input type='hidden'>")
            .val(el.data("value"));

          if (name) {
            hidden.prop("name", name);
          }

          el.append(hidden);
        });
    },

    _setupClear: function() {
      var self = this;

      this._clear = $("<button class='autocomplete-clear icon-close xsmall' />")
        .on("click tap", function(e) {
          e.preventDefault();
          self.clear();
          self._input.focus();
        });

      this._refreshClear();
      this._clear.appendTo(this.$element);

      this._input.on("input", function() {
        self._refreshClear();
      });
    },

    _refreshClear: function() {
      this._clear.toggleClass("hide", this._input.val().length === 0);
    },

    clear: function() {
      this._input.val("");
      this._refreshClear();
    }
  });

  CUI.util.plugClass(CUI.Autocomplete);

  // Data API
  $(document).on("cui-contentloaded.data-api", function(e) {
    $("[data-init~='autocomplete']", e.target).autocomplete();
  });
}(window.jQuery));
