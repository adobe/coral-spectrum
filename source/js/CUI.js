/** 
  @classdesc The main CUI namespace.
  @namespace

  @property {Object} options            Main options for CloudUI components.
  @property {Boolean} options.debug     If true, show debug messages for all components.
  @property {Boolean} options.dataAPI   If true, add listeners for widget data APIs.
  @property {Object} Templates          Contains templates used by CUI widgets

  @example
<caption>Change CUI options</caption>
<description>You can change CUI options by defining <code>CUI.options</code> before you load CUI.js</description>
&lt;script type=&quot;text/javascript&quot;&gt;
  var CUI = {
    options: {
      debug: false,
      dataAPI: true
    }
  };
&lt;/script&gt;
&lt;script src=&quot;js/CUI.js&quot;&gt;&lt;/script&gt;

*/
var CUI = CUI || {};

CUI.options = $.extend({
  debug: false,
  dataAPI: true
}, CUI.options);

(function() {
  // Register partials for all templates
  // Note: this requires the templates to be included BEFORE CUI.js
  for (var template in CUI.Templates) {
    Handlebars.registerPartial(template, CUI.Templates[template]);
  }

  $(function() {
    $(document).trigger("cui-contentloaded");
  });
}());
