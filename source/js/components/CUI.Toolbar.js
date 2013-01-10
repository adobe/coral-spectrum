(function($) {
  CUI.Toolbar = new Class(/** @lends CUI.Toolbar# */{
    toString: 'Toolbar',

    extend: CUI.Widget,
    /**
     * @extends CUI.Widget
     * @classdesc 
     *    
     *  
     *     
     *  <h2>Data Attributes</h2>
     *  <h4>Currently there are the following data options:</h4>
     *  <pre>
     *    data-init="toolbar"
     *  </pre>
     */
    construct: function(options) {
      var $elem     = this.$element,
          $parent   = $elem.closest(".content-header"),
          $icons    = $elem.find(".left"),
          iconWidth = $icons.width();

      $parent.reflow({
        "break-lines": function (elem, size) {
          return $elem.width()-2*iconWidth < 20*size.rem();
        },
        "long-title":  function (elem, size) {
          return $elem.width()-2*iconWidth > 40*size.rem();
        }
      });
    }
  });

  CUI.util.plugClass(CUI.Toolbar);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
      $("[data-init=toolbar]", e.target).toolbar();
    });
  }
}(window.jQuery));
