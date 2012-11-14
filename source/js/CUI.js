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

    /**
      <h1>cui-contentloaded Event</h1>
      <p><code>cui-contentloaded</code> event is an event that is triggered when a new content is injected to the DOM.
This event is very similar to <a href="https://developer.mozilla.org/en-US/docs/DOM/DOM_event_reference/DOMContentLoaded">DOMContentLoaded</a> event.

This event is normally used so that a JavaScript code can be notified when new content needs to be enhanced (applying event handler, layout, etc).

The element where the new content is injected is available at event.target, like so:

<pre class="prettyprint linenums jsDocExample">
$(document).on("foundation-contentloaded", function(e) {
    var container = e.target;
    // the container is the element where new content is injected.
});
</pre>

This way the listener can limit the scope of the selector accordingly.

It will be triggered at DOMContentLoaded event as well, so component can just listen to this event instead of DOMContentLoaded for enhancement purpose. In that case, the value of event.target is <code>document</code>.
</p>
      @namespace cui-contentloaded
    */
    $(document).trigger("cui-contentloaded");
  });
}());
