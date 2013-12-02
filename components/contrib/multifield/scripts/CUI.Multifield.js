(function ($, console) {
  "use strict";

  var addButton = "<button type='button' class='multifield-add icon-add-circle medium'/>";
  var removeButton = "<button type='button' class='multifield-remove icon-minus-circle medium'/>";
  var moveButton = "<button type='button' class='multifield-move icon-navigation medium'/>";
  var fieldTemplate = "<li><div class='multifield-placeholder'></div>" + removeButton + moveButton + "</li>";


  CUI.Multifield = new Class(/** @lends CUI.Multifield# */{
    toString: "Multifield",
    extend: CUI.Widget,

    /**
     @extends CUI.Widget

     @classdesc A composite field that allows you to add/reorder/remove multiple instances of a component.
     The component is added based on a template defined in a <code>&lt;script type=&quot;text/html&quot;&gt;</code> tag.
     The current added components are managed inside a <code>ol</code> element.

     <p>
     <div class="multifield" data-init="multifield">
     <ol>
     <li><input type="text" value="some value" /></li>
     <li><input type="text" value="some other value" /></li>
     </ol>
     <script type="text/html">
     <input type="text" />
     </script>
     </div>
     </p>

     @example
     <caption>Instantiate with Class</caption>
     &lt;div id=&quot;apiMultifield&quot;&gt;
     &lt;ol&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some value&quot; /&gt;&lt;/li&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some other value&quot; /&gt;&lt;/li&gt;
     &lt;/ol&gt;
     &lt;script type=&quot;text/html&quot;&gt;
     &lt;input type=&quot;text&quot;&gt;
     &lt;/script&gt;
     &lt;/div&gt;

     var multifield = new CUI.Multifield({
                element: '#apiMultifield'
            });

     @example
     <caption>Instantiate with jQuery</caption>
     &lt;div id=&quot;apiMultifield&quot;&gt;
     &lt;ol&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some value&quot; /&gt;&lt;/li&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some other value&quot; /&gt;&lt;/li&gt;
     &lt;/ol&gt;
     &lt;script type=&quot;text/html&quot;&gt;
     &lt;input type=&quot;text&quot;&gt;
     &lt;/script&gt;
     &lt;/div&gt;

     $('#apiMultifield').multifield();

     @example
     <caption>Markup</caption>
     &lt;div class=&quot;multifield&quot; data-init=&quot;multifield&quot;&gt;
     &lt;ol&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some value&quot; /&gt;&lt;/li&gt;
     &lt;li&gt;&lt;input type=&quot;text&quot; value=&quot;some other value&quot; /&gt;&lt;/li&gt;
     &lt;/ol&gt;
     &lt;script type=&quot;text/html&quot;&gt;
     &lt;input type=&quot;text&quot; /&gt;
     &lt;/script&gt;
     &lt;/div&gt;

     @desc Creates a Multifield component.
     @constructs
     */
    construct: function (options) {
      this.script = this.$element.find("script[type='text/html']");
      this.ol = this.$element.children("ol");

      if (this.ol.length === 0) {
        this.ol = $("<ol>").prependTo(this.$element);
      }

      this._adjustMarkup();
      this._addListeners();
    },

    /**
     * Enhances the markup required for multifield.
     * @private
     */
    _adjustMarkup: function () {
      this.$element.toggleClass("multifield", true);
      this.ol.children("li").append(removeButton).append(moveButton);
      this.ol.after(addButton);
    },

    /**
     * Initializes listeners.
     * @private
     */
    _addListeners: function () {
      var self = this;

      this.$element.on("click", ".multifield-add", function (e) {
        var item = $(fieldTemplate);
        item.find(".multifield-placeholder").replaceWith(self.script.html().trim());
        item.appendTo(self.ol);
        $(self.ol).trigger("cui-contentloaded");
      });

      this.$element.on("click", ".multifield-remove", function (e) {
        $(this).closest("li").remove();
      });

      this.$element
        .fipo("taphold", "mousedown", ".multifield-move", function (e) {
          e.preventDefault();

          var item = $(this).closest("li");
          item.prevAll().addClass("drag-before");
          item.nextAll().addClass("drag-after");

          // Fix height of list element to avoid flickering of page
          self.ol.css({height: self.ol.height() + $(e.item).height() + "px"});
          new CUI.DragAction(e, self.$element, item, [self.ol], "vertical");
        })
        .on("dragenter", function (e) {
          self.ol.addClass("drag-over");
          self._reorderPreview(e);
        })
        .on("dragover", function (e) {
          self._reorderPreview(e);
        })
        .on("dragleave", function (e) {
          self.ol.removeClass("drag-over").children().removeClass("drag-before drag-after");
        })
        .on("drop", function (e) {
          self._reorder($(e.item));
          self.ol.children().removeClass("drag-before drag-after");
        })
        .on("dragend", function (e) {
          self.ol.css({height: ""});
        });
    },

    _reorder: function (item) {
      var before = this.ol.children(".drag-after").first();
      var after = this.ol.children(".drag-before").last();

      if (before.length > 0) item.insertBefore(before);
      if (after.length > 0) item.insertAfter(after);
    },

    _reorderPreview: function (e) {
      var pos = this._pagePosition(e);

      this.ol.children(":not(.dragging)").each(function () {
        var el = $(this);
        var isAfter = pos.y < (el.offset().top + el.outerHeight() / 2);
        el.toggleClass("drag-after", isAfter);
        el.toggleClass("drag-before", !isAfter);
      });
    },

    _pagePosition: function (e) {
      var touch = {};
      if (e.originalEvent) {
        var o = e.originalEvent;
        if (o.changedTouches && o.changedTouches.length > 0) {
          touch = o.changedTouches[0];
        }
        if (o.touches && o.touches.length > 0) {
          touch = o.touches[0];
        }
      }

      return {
        x: touch.pageX || e.pageX,
        y: touch.pageY || e.pageY
      };
    }
  });

  CUI.Widget.registry.register("multifield", CUI.Multifield);

  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function (e) {
      CUI.Multifield.init($("[data-init~=multifield]", e.target));
    });
  }
})(jQuery, window.console);
