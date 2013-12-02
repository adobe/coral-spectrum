(function ($) {
  "use strict";

  var ns = ".cui-dragaction";

  /**
   * Find for the first parent that has an overflow of hidden, auto or scroll.
   * @ignore
   */
  function getViewContainer(element) {
    while (true) {
      var p = element.parent();

      if (p.length === 0) return p;
      if (p.is("body")) return p;

      var flow = p.css("overflow");
      if (flow === "hidden" || flow === "auto" || flow === "scroll") return p;

      element = p;
    }
  }

  function pagePosition(event) {
    var touch = {};
    if (event.originalEvent) {
      var o = event.originalEvent;
      if (o.changedTouches && o.changedTouches.length > 0) {
        touch = o.changedTouches[0];
      }
      if (o.touches && o.touches.length > 0) {
        touch = o.touches[0];
      }
    }

    return {
      x: touch.pageX || event.pageX,
      y: touch.pageY || event.pageY
    };
  }

  function within(x, y, element) {
    var offset = element.offset();
    return x >= offset.left && x < (offset.left + element.outerWidth()) &&
      y >= offset.top && y < offset.top + element.outerHeight();
  }


  CUI.DragAction = new Class(/** @lends CUI.DragAction# */{
    /**
     Constructs a new Drag Action. After the initialization the drag is performed immediatly.

     @param {Event} event The event that triggered the drag
     @param {jQuery} source The element that is the source of this drag
     @param {jQuery} dragElement The element that will be dragged
     @param {Array} dropZones An Array of elements that can be destinations for this drag
     @param {String} [restrictAxis] Restricts the drag movement to a particular axis. Value: ("horizontal" | "vertical")
     */
    construct: function (event, source, dragElement, dropZones, restrictAxis) {
      this.sourceElement = source;
      this.dragElement = dragElement;
      this.container = getViewContainer(dragElement);
      this.containerHeight = this.container.get(0).scrollHeight; // Save current container height before we start dragging
      this.dropZones = dropZones;
      this.axis = restrictAxis;
      this.scrollZone = 20; // Use 20px as scrolling zone, static for now

      this.dragStart(event);
    },

    currentDragOver: null,

    dragStart: function (event) {
      event.preventDefault();

      var p = this.dragElement.position();
      var pp = pagePosition(event);

      this.dragElement.css({
        "left": p.left,
        "top": p.top,
        "width": this.dragElement.width() + "px"
      }).addClass("dragging");

      this.dragStart = {x: pp.x - p.left, y: pp.y - p.top};

      $(document).fipo("touchmove" + ns, "mousemove" + ns, this.drag.bind(this));
      $(document).fipo("touchend" + ns, "mouseup" + ns, this.dragEnd.bind(this));

      this.sourceElement.trigger(this._createEvent("dragstart", event));

      this.drag(event);
    },

    drag: function (event) {
      event.preventDefault();

      var pos = pagePosition(event);

      // Need to scroll?
      if (this.container.is("body")) {
        if (pos.y - this.container.scrollTop() < this.scrollZone) {
          this.container.scrollTop(pos.y - this.scrollZone);
        }
        if (pos.y - this.container.scrollTop() > this.container.height() - this.scrollZone) {
          this.container.scrollTop(pos.y - this.container.height() - this.scrollZone);
        }
      } else {
        var oldTop = this.container.scrollTop();
        var t = this.container.offset().top + this.scrollZone;

        if (pos.y < t) {
          this.container.scrollTop(this.container.scrollTop() - (t - pos.y));
        }

        var h = this.container.offset().top + this.container.height() - this.scrollZone;

        if (pos.y > h) {
          var s = Math.min(this.container.scrollTop() + (pos.y - h), Math.max(this.containerHeight - this.container.height(), 0));
          this.container.scrollTop(s);
        }

        var newTop = this.container.scrollTop();
        this.dragStart.y += oldTop - newTop; // Correct drag start position after element scrolling
      }

      var newCss = {};
      if (this.axis !== "horizontal") {
        newCss.top = pos.y - this.dragStart.y;
      }
      if (this.axis !== "vertical") {
        newCss.left = pos.x - this.dragStart.x;
      }

      this.dragElement.css(newCss);

      this.triggerDrag(event);
    },

    dragEnd: function (event) {
      event.preventDefault();

      this.dragElement.removeClass("dragging");
      this.dragElement.css({top: "", left: "", width: ""});

      $(document).off(ns);

      this.triggerDrop(event);

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragleave", event));
      }

      this.sourceElement.trigger(this._createEvent("dragend", event));
    },

    triggerDrag: function (event) {
      var dropElement = this._getCurrentDropZone(event);

      if (dropElement === this.currentDragOver) {
        if (this.currentDragOver) {
          $(this.currentDragOver).trigger(this._createEvent("dragover", event));
        }
        return;
      }

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragleave", event));
      }

      this.currentDragOver = dropElement;

      if (this.currentDragOver) {
        $(this.currentDragOver).trigger(this._createEvent("dragenter", event));
      }
    },

    triggerDrop: function (event) {
      var dropElement = this._getCurrentDropZone(event);

      if (!dropElement) return;

      dropElement.trigger(this._createEvent("drop", event));
    },

    _getCurrentDropZone: function (event) {
      var pos = pagePosition(event);

      var dropElement = null;

      $.each(this.dropZones, function (index, value) {
        if (within(pos.x, pos.y, value)) {
          dropElement = value;
          return false;
        }
      });

      return dropElement;
    },

    _createEvent: function (name, fromEvent) {
      var pos = pagePosition(fromEvent);

      var event = jQuery.Event(name);
      event.pageX = pos.x;
      event.pageY = pos.y;
      event.sourceElement = this.sourceElement;
      event.item = this.dragElement;

      return event;
    }
  });
})(jQuery);
