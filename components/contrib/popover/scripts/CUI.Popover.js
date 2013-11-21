(function($) {
  var uuid = 0;

  CUI.Popover = new Class(/** @lends CUI.Popover# */{
    toString: 'Popover',
    extend: CUI.Widget,
    /**
     @extends CUI.Widget
     @classdesc A box which points at an element or point.

     @desc Creates a new popover
     @constructs

     @param {Object} options                               Component options
     @param {Object} options.pointAt                       The element or coordinate to which the popover should point.
                                                           A coordinate should be provided as an array where the first
                                                           item is the X coordinate and the second item is a Y
                                                           coordinate. The coordinate should be in the document
                                                           coordinate space.
     @param {String} [options.content]                     Content of the popover (HTML).
     @param {String} [options.pointFrom=bottom]            The side of the target element or coordinate the popover
                                                           should be pointing from. Possible values include
                                                           <code>top</code>, <code>right</code>, <code>bottom</code>,
                                                           or <code>left</code>.
     @param {boolean} [options.preventAutoHide=false]      When set to <code>false</code>, the popover will close when
                                                           the user clicks/taps outside the popover. When set to
                                                           <code>true</code>, the popover will only close when the
                                                           target element is clicked/tapped or <code>hide()</code> is
                                                           manually called.
     @param {String} [options.alignFrom=left]              When set to left, the popover will be anchored to the left
                                                           side of its offset parent (in other words, it will use the
                                                           <code>left</code> CSS property). When set to right, the
                                                           popover will be anchored to the right side of its offset
                                                           parent (in other words, it will use the <code>right</code>
                                                           CSS property). When the element the popover is pointing at
                                                           is right-aligned, it can be useful to set the value to
                                                           <code>right</code> so the popover will appear to stay
                                                           attached to the element when the user resizes the window
                                                           horizontally.

     */
    construct: function(options) {
      // Add CSS class to give styling
      this.$element.addClass('popover');

      // Listen to changes to configuration
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:pointAt', this._position.bind(this));
      this.$element.on('change:pointFrom', this._position.bind(this));
      this.$element.on('change:alignFrom', this._position.bind(this));

      // Render template, if necessary
      if (this.$element.html() === '') {
        this._setContent();
      }

      this._createTail();

      this.uuid = (uuid += 1);
    },

    defaults: {
      pointFrom: 'bottom',
      preventAutoHide: false,
      alignFrom: 'left',
      visible: false
    },

    _directions: [
      'top',
      'bottom',
      'right',
      'left'
    ],

    /**
     * Creates the popover tail (i.e., tip, arrow, triangle) and adds it as a child.
     * @private
     */
    _createTail: function() {
      this._$tail = $('<div class="popover-arrow arrow-left"/>').appendTo(this.$element);

      this._cachedTailDimensions = {};

      // Cache the tail dimensions when the popover is on the left or right of the target.
      this._cachedTailDimensions.leftRight = {
        width: this._$tail.outerWidth(),
        height: this._$tail.outerHeight()
      };

      // While it's possible that the dimensions are different depending on whether it's left/right vs top/bottom,
      // it likely (and is currently) just a rotated version of the arrow. To reduce the cost of measuring, we'll
      // just invert the dimensions until more complex tails are introduced.
      this._cachedTailDimensions.topBottom = {
        width: this._cachedTailDimensions.leftRight.height,
        height: this._cachedTailDimensions.leftRight.width
      };

      // The correct arrow class will be applied when the popover is positioned.
      this._$tail.removeClass('arrow-left');
    },

    /**
     * Positions the popover (if visible). Leverages [jQueryUI's Position utility]{@link http://jqueryui.com/position}.
     *
     * @private
     */
    _position: function() {
      // Let's not use the cycles to position if the popover is not visible. When show() is called, the element will
      // run through positioning again.
      if (!this.options.visible || !this.options.pointAt) {
        return;
      }

      var $popover = this.$element,
          target = this.options.pointAt,
          pointFrom = this.options.pointFrom,
          tailDimensions = this._cachedTailDimensions,
          instructions;

      if ($.isArray(target)) {
        if (target.length !== 2) {
          return;
        }
        target = this._convertCoordsToEvent(target);
      }

      // Using the 'flip' collision option, jQueryUI's positioning logic will flip the position of the popover to
      // whichever side will expose most of the popover within the window viewport. However, this can sometimes place
      // the popover so that it is cropped by the top or left of the document. While it's great that the user would
      // be able to initially see more of the popover than if it had been placed in the opposite position, the user
      // would not be able to even scroll to see the cropped portion. We would rather show less of the popover and
      // still allow the user to scroll to see the rest of the popover. Here we detect if such cropping is taking
      // place and, if so, we re-run the positioning algorithm while forcing the position to the bottom or right
      // directions.
      // Fixes https://issues.adobe.com/browse/CUI-794
      var validateFinalPosition = function(position, feedback) {
        var offsetParentOffset = $popover.offsetParent().offset(),
            forcePointFrom;

        if ((pointFrom == 'top' || pointFrom == 'bottom') && offsetParentOffset.top + position.top < 0) {
          forcePointFrom = 'bottom';
        } else if ((pointFrom == 'left' || pointFrom == 'right') && offsetParentOffset.left + position.left < 0) {
          forcePointFrom = 'right';
        }

        if (forcePointFrom) {
          instructions = this._instructionFactory[forcePointFrom]({
            target: target,
            tailDimensions: tailDimensions,
            allowFlip: false,
            callback: this._applyFinalPosition.bind(this)
          });
          $popover.position(instructions);
        } else {
          this._applyFinalPosition(position, feedback);
        }
      }.bind(this);

      instructions = this._instructionFactory[pointFrom]({
        target: target,
        tailDimensions: tailDimensions,
        allowFlip: true,
        callback: validateFinalPosition
      });

      $popover.position(instructions);
    },

    /**
     * Converts an array containing a coordinate into an event (needed for jQueryUI's Position utility)..
     * @param {Array} pointAt An array where the first item is the x coordinate and the second item is the y coordinate.
     * @returns {Object} A jquery event object with the pageX and pageY properties set.
     * @private
     */
    _convertCoordsToEvent: function(pointAt) {
      // If target is an array, it should contain x and y coords for absolute positioning.
      // Transform coords for jQueryUI Position which requires an event object with pageX and pageY.
      var event = $.Event();
      event.pageX = pointAt[0];
      event.pageY = pointAt[1];
      return event;
    },

    /**
     * Applies the final position to the popover (both bubble and tail).
     * @param position The position to be applied to the bubble.
     * @param feedback Additional information useful for positioning the tail.
     * @private
     */
    _applyFinalPosition: function(position, feedback) {
      var css = {
        top: position.top
      };

      if (this.options.alignFrom === 'right') {
        // Convert the "left" position to a "right" position.

        var offsetParent = this.$element.offsetParent();
        var offsetParentWidth;

        // If the offset parent is the root HTML element, we need to do some finagling. We really need to get the width
        // of the viewpane minus the scrollbar width since the "right" position will be relative to the left of the
        // scrollbar. We do this by getting the outerWidth(true) of body (so it includes any margin, border, and padding).
        if (offsetParent.prop('tagName').toLowerCase() == 'html') {
          offsetParent = $('body');
          offsetParentWidth = offsetParent.outerWidth(true);
        } else {
          offsetParentWidth = offsetParent.innerWidth();
        }

        css.left = 'auto';
        css.right = offsetParentWidth - position.left - this.$element.outerWidth(true);
      } else {
        css.left = position.left;
        css.right = 'auto';
      }

      this.$element.css(css);

      // For more information about the feedback object, see:
      // http://jqueryui.com/upgrade-guide/1.9/#added-positioning-feedback-to-the-using-callback
      this._positionTail(feedback);
    },

    /**
     * Factory for creating instruction objects to be used by jQuery's Position utility.
     * @private
     */
    _instructionFactory: {
      top: function(options) {
        return {
          my: 'center bottom-' + options.tailDimensions.topBottom.height,
          at: 'center top',
          of: options.target,
          collision: 'fit ' + (options.allowFlip ? 'flip' : 'none'),
          using: options.callback
        };
      },
      right: function(options) {
        return {
          my: 'left+' + options.tailDimensions.leftRight.width + ' center',
          at: 'right center',
          of: options.target,
          collision: (options.allowFlip ? 'flip' : 'none') + ' fit',
          using: options.callback
        };
      },
      bottom: function(options) {
        return {
          my: 'center top+' + options.tailDimensions.topBottom.height,
          at: 'center bottom',
          of: options.target,
          collision: 'fit ' + (options.allowFlip ? 'flip' : 'none'),
          using: options.callback
        };
      },
      left: function(options) {
        return {
          my: 'right-' + options.tailDimensions.leftRight.width + ' center',
          at: 'left center',
          of: options.target,
          collision: (options.allowFlip ? 'flip' : 'none') + ' fit',
          using: options.callback
        };
      }
    },

    /**
     * Positions the tail of the popover.
     * @param positionFeedback Positioning feedback object returned from jQuery's Position utility. This contains
     * information regarding how the popover bubble was positioned.
     * @private
     */
    _positionTail: function(positionFeedback) {
      // For more information about the feedback object, see:
      // http://jqueryui.com/upgrade-guide/1.9/#added-positioning-feedback-to-the-using-callback
      var targetRect,
          offset = this.$element.offset();

      if ($.isArray(this.options.pointAt)) {
        targetRect = {
          top: this.options.pointAt[1],
          left: this.options.pointAt[0],
          width: 0,
          height: 0
        };
      } else {
        var targetOffset = $(positionFeedback.target.element).offset();
        targetRect = {
          top: targetOffset.top,
          left: targetOffset.left,
          width: positionFeedback.target.width,
          height: positionFeedback.target.height
        };
      }

      // Convert from doc coordinate space to this.$element coordinate space.
      targetRect.top -= (offset.top + parseFloat(this.$element.css('borderTopWidth')));
      targetRect.left -= (offset.left + parseFloat(this.$element.css('borderLeftWidth')));

      var tailClass, tailLeft, tailTop, tailWidth;
      switch (this.options.pointFrom) {
        case 'top': // Consumer wanted popover above target
        case 'bottom': // Consumer wanted popover below target
          tailWidth = this._cachedTailDimensions.topBottom.width;
          tailLeft = targetRect.left + targetRect.width / 2 - tailWidth / 2;
          if (positionFeedback.vertical == 'bottom') { // Popover ended up above the target
            tailClass = 'arrow-down';
            tailTop = targetRect.top - this._cachedTailDimensions.topBottom.height;
          } else { // Popover ended up below the target
            tailClass = 'arrow-up';
            tailTop = targetRect.top + targetRect.height;
          }
          break;
        case 'left': // Consumer wanted popover to the left of the target
        case 'right': // Consumer wanted popover to the right of the target
          tailWidth = this._cachedTailDimensions.leftRight.width;
          tailTop = targetRect.top + targetRect.height / 2 -
              this._cachedTailDimensions.leftRight.height / 2;
          if (positionFeedback.horizontal == 'left') { // Popover ended up on the right side of the target
            tailClass = 'arrow-left';
            tailLeft = targetRect.left + targetRect.width;
          } else { // Popover ended up on the left side of the target
            tailClass = 'arrow-right';
            tailLeft = targetRect.left - tailWidth;
          }
          break;
      }

      this._$tail.css({ top: tailTop, left: tailLeft })
        .removeClass('arrow-up arrow-down arrow-left arrow-right')
        .addClass(tailClass);
    },

    /** @ignore */
    _show: function() {
      this.$element.show().prop('aria-hidden', false);
      this._position();

      if (!this.options.preventAutoHide) {
        $('body').fipo('tap.popover-hide-'+this.uuid, 'click.popover-hide-'+this.uuid, function(e) {
          var el = this.$element.get(0);

          if (e.target !== el && !$.contains(el, e.target)) {
            this.hide();
            $('body').off('.popover-hide-'+this.uuid);
          }
        }.bind(this));
      }
    },

    /** @ignore */
    _hide: function() {
      this.$element.hide().prop('aria-hidden', true);
      $('body').off('.popover-hide-'+this.uuid);
    },

    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;

      this.$element.html(this.options.content);

      // We just wiped out the content which includes our tail. Re-add the tail.
      if (this._$tail) {
        this.$element.append(this._$tail);
      }

      this._position();
    },

    /**
     * Deprecated.
     * @param position
     * @deprecated Please use set('pointAt', [x, y]) instead.
     */
    setPosition: function(position) {
      this.set('pointAt', position);
    }
  });

  CUI.Widget.registry.register("popover", CUI.Popover);

  $(function() {
    $('body').fipo('tap.popover.data-api', 'click.popover.data-api', '[data-toggle="popover"]', function (e) {
      var $trigger = $(this),
          $target = CUI.util.getDataTarget($trigger);

      // if data target is not defined try to find the popover as a sibling
      $target = $target && $target.length > 0 ? $target : $trigger.next('.popover');

      var popover = $target.popover($.extend({pointAt: $trigger}, $target.data(), $trigger.data())).data('popover');

      popover.toggleVisibility();
    }).on('click.popover.data-api', '[data-toggle="popover"]', false);
  });
}(window.jQuery));
