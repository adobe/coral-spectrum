(function($) {
  var dropZoneClassName = "dropzone";

  /* Define some private helpers */
  function boundingBox(element) {
    return {l: element.offset().left,
            t: element.offset().top,
            w: element.outerWidth(),
            h: element.outerHeight()};
  }

  function currentPagePosition(event) {
      var touch = {};
      if (event.originalEvent) {
        var o = event.originalEvent;
        if (o.changedTouches && o.changedTouches.length > 0) touch = event.originalEvent.changedTouches[0];
        if (o.touches && o.touches.length > 0) touch = event.originalEvent.touches[0];
      }
      var x = touch.pageX || event.pageX;
      var y = touch.pageY || event.pageY;
      return {x: x, y: y};
  }


  /* Global array of drop zones */
  var dropZones = [];

  CUI.DraggableList = new Class(/** @lends CUI.DraggableList# */{
    toString: 'DraggableList',

    extend: CUI.Widget,

    /**
     Triggered when a the position of an item in the list has been changed due to user sorting

     @name CUI.Sortable#reordered
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.sourceElement      The DOM list element this event occured on
     @param {Object} evt.item               Object representing the moved item
     @param {Object} evt.oldIndex           The old position of the item in the list
     @param {Object} evt.newIndex           The new position of the item in the list
    */
    /**
     Triggered when an item has ben inserted from another list

     @name CUI.Sortable#inserted
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.sourceElement      The DOM list element where the item came from
     @param {Object} evt.item               Object representing the inserted item
     @param {Object} evt.oldIndex           The old position of the item in the former list
     @param {Object} evt.newIndex           The new position of the item in the current list
    */
    /**
     Triggered when an items has been removed from the list by the user

     @name CUI.Sortable#removed
     @event

     @param {Object} evt                    Event object
     @param {Object} evt.item               Object representing the removed item
     @param {Object} evt.index              The former position of the item
    */
    /**
      @extends CUI.Widget
      @classdesc Makes a list draggable. This also implies re-ordering of the list items on behalf of the user. This widget also
      defines some high-level events for inserting, reordering and removing items. The underlying drag/drop events should not be used outside this widget,
      as they are subject to change in the future.

      <h2 class="line">Examples</h2>

      @example
      <caption>A fully configured list</caption>
      &lt;div class="dropzone"&gt;
        &lt;ul class="draggable" data-init="draggable-list" data-allow="drag drop reorder" data-closeable="true"&gt;
        &lt;li&gt;Item 1&lt;/li&gt;
        &lt;li&gt;Item 2&lt;/li&gt;
        &lt;/ul&gt;
        &lt;p&gt;Drop here!&lt;/p&gt;
      &lt;/div&gt;
          
      
      @desc Creates a draggable/sortable list
      @constructs

      @param {Object} options                          Component options
      @param {Mixed} options.element                   jQuery selector or DOM element to use for sortable list. Has to be an <ul>
      @param {boolean} [options.allowReorder=false]    May the user reorder the list by drag&drop?     
      @param {boolean} [options.allowDrag=false]       May the user drag elements of the list to other lists?
      @param {boolean} [options.allowDrop=false]       May the user drop elements into this list?
      @param {boolean} [options.closeable=false]        Can the user remove items from this list?                             
    */
    construct: function(options) {
      this.$element.addClass("draggable");

      if (this.$element.data("allow")) {
        var allow = this.$element.data("allow").split(" ");
        if (jQuery.inArray("reorder", allow) >= 0) this.options.allowReorder = true;
        if (jQuery.inArray("drag", allow) >= 0) this.options.allowDrag = true;
        if (jQuery.inArray("drop", allow) >= 0) this.options.allowDrop = true;
      }
      if (this.$element.data("closeable")) this.options.closeable = true;

      this.$element.on("click", ".close", this.close.bind(this));
      this.$element.fipo("taphold", "mousedown", "li", this.dragStart.bind(this));

      this.dropZone = (this.$element.parent().is("." + dropZoneClassName)) ? this.$element.parent() : this.$element;

      this.$element.on("dragend", this.dragEnd.bind(this));

      // Register drop event handlers if dropping is allowed or reordering is allowed
      if (this.options.allowDrop || this.options.allowReorder) {
          this.dropZone.on("dragenter", this.dragEnter.bind(this));
          this.dropZone.on("dragover", this.dragOver.bind(this));
          this.dropZone.on("dragleave", this.dragLeave.bind(this));
          this.dropZone.on("drop", this.drop.bind(this));
      }

      // But out dropZone into the global array ONLY if dropping is allowed!    
      if (this.options.allowDrop) {
          dropZones.push(this.dropZone);
      }

      // Prevent browser from starting his own drag&drop chain
      this.$element.on("dragstart", function(event) {
        event.preventDefault();
      });
    },

    defaults: {
      allowReorder: false,
      allowDrag: false,
      allowDrop: false,
      closeable: false
    },

    dropZone: null,

    dragStart: function(event) {
      if ($(event.target).hasClass("close")) return; // Don't drag on close button!
      event.preventDefault();

      //this.dragging = $(event.target).closest("li");

      var el = $(event.target).closest("li");
      el.prevAll().addClass("drag-before");
      el.nextAll().addClass("drag-after");

      // Fix height of list element to avoid flickering of page
      this.$element.css({height: this.$element.height() + $(event.item).height() + "px"});
      if (this.options.allowDrag) {
        new CUI.DragAction(event, this.$element, el, dropZones);
      } else {
        new CUI.DragAction(event, this.$element, el, [this.dropZone], "vertical");
      }

    },
    dragEnd: function(event) {
      this.$element.css({height: ""});
    },
    dragEnter: function(event) {
      this.dropZone.addClass("drag-over");
      if (this.options.allowReorder) {
        this.reorderPreview(event);
      }
    },
    dragOver: function(event) {
      if (this.options.allowReorder) {
        this.reorderPreview(event);
      }
    },
    dragLeave: function(event) {
      this.dropZone.removeClass("drag-over");
      this.$element.children().removeClass("drag-before drag-after");
    },
    drop: function(event) {
      this.$element.css({height: ""});
      if (this.$element.is(event.sourceElement) && this.options.allowReorder) {
        this.reorder(event, false);
      }
      if (!this.$element.is(event.sourceElement) && this.options.allowDrop) {
        var e = $(event.item);

        if (this.options.closeable && e.find(".close").length === 0) {
          e.append("<button class=\"close\">&times;</button>");
        } else if (!this.options.closeable) {
          e.find(".close").remove();
        }

        if (this.options.allowReorder) {
          this.reorder(event, e);
        } else {
          this.$element.append(e);
        }
      }
      this.$element.children().removeClass("drag-before drag-after");
    },

    reorderPreview: function(event) {
      var p = currentPagePosition(event);
      var x = p.x;
      var y = p.y;
      var bb = boundingBox(this.$element);
      var that = this;

      if (x < bb.l || y < bb.t || x > bb.l + bb.w || y > bb.t + bb.h) {
        this.$element.children().removeClass("drag-after drag-before");
      } else {
        this.$element.children().each(function() {
          if ($(this).is(".dragging")) return;
          var bb = boundingBox($(this));
          var isAfter = (y < (bb.t + bb.h / 2));
          $(this).toggleClass("drag-after", isAfter);
          $(this).toggleClass("drag-before", !isAfter);
        });
      }
    },

    reorder: function(event, newItem) {
        var from = (newItem) ? newItem : $(event.item);
        var before = this.$element.children(".drag-after:first");
        var after = this.$element.children(".drag-before:last");

        var oldPosition = from.index();
        if (before.length > 0) from.insertBefore(before);
        if (after.length > 0) from.insertAfter(after);
        if (before.length === 0 && after.length === 0 && newItem) {
          this.$element.append(from);
        }
        var newPosition = from.index();

        if (oldPosition != newPosition || newItem) {
          var e = jQuery.Event((newItem) ? "inserted" : "reordered");
          e.sourceElement = event.sourceElement;
          e.oldIndex = oldPosition;
          e.newIndex = newPosition;
          e.item = from.get(0);
          this.$element.trigger(e);
          return true;
        }
        return false;
    },
    close: function(event) {
      if (!this.options.closeable) return;
      event.preventDefault();
      var e = $(event.target).closest("li");
      var index = e.index();
      e.remove();
      var ev = jQuery.Event("removed");
      ev.sourceElement = this.$element.get(0);
      ev.index = index;
      ev.item = e.get(0);
      this.$element.trigger(ev);
    }
  });

  CUI.Widget.registry.register("draggable-list", CUI.DraggableList);

  if (CUI.options.dataAPI) {
      $(document).on('cui-contentloaded.data-api', function() {
        CUI.DraggableList.init($("[data-init~=draggable-list]"));
      });
  }
}(window.jQuery));
