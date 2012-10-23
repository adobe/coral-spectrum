(function($) {
  CUI.Popover = new Class(/** @lends CUI.Popover# */{
    toString: 'Popover',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc A box which points at an element

      @desc Creates a new popover
      @constructs

      @param {Object} options                               Component options
      @param {String} options.content                       Content of the popover (HTML)
    */
    construct: function(options) {
      // Add CSS class to give styling
      this.$element.addClass('popover');

      // Listen to changes to configuration
      this.$element.on('change:content', this._setContent.bind(this));
      this.$element.on('change:position', this._setPosition.bind(this));
      this.$element.on('change:pointAt', this._setPointAt.bind(this));
      this.$element.on('change:pointFrom', this._setPointFrom.bind(this));

      // Render template, if necessary
      if (this.$element.html() === '') {
        this.applyOptions();
      }
      else {
        this.applyOptions(true);
      }
    },

    defaults: {
      pointFrom: 'bottom',
      position: [0,0],
      visible: true
    },

    _directions: [
      'top',
      'bottom'
      //'right',
      //'left'
    ],

    applyOptions: function(partial) {
      if (!partial) {
        this._setContent();
      }
      this._setPosition();
      this._setPointAt();
      this._setPointFrom();
    },

    /** @ignore */
    _setContent: function() {
      if (typeof this.options.content !== 'string') return;

      this.$element.html(this.options.content);
    },


    /** @ignore */
    _setPosition: function() {
      var position = this.options.position;
      if (!$.isArray(position) || position.length !== 2 || typeof position[0] !== 'number' || typeof position[1] !== 'number') return;
      
      // Reset point from
      this._doSetPointFrom(this.options.pointFrom);
      
      var screenWidth = $(window).width();
      var screenHeight = $(window).height();

      var pointFrom = this.options.pointFrom;
      var top = position[1];
      var left = position[0];

      var width = this.$element.outerWidth();
      var height = this.$element.outerHeight();

      var arrowHeight = 10;
      
      // Switch direction if we fall off screen
      if (pointFrom === 'top' && top - height - arrowHeight < 0) {
        pointFrom = 'bottom';
        this._doSetPointFrom('bottom');
      }
      if (pointFrom === 'bottom' && top + height + arrowHeight > screenHeight) {
          pointFrom = 'top';
          this._doSetPointFrom('top');
      }

      // Base on pointFrom
      if (pointFrom === 'bottom' || pointFrom === 'top') {
        left -= width/2;
      }
      if (pointFrom === 'bottom') {
        top += arrowHeight; // TBD find out the size of 1rem
      }
      else if (pointFrom === 'top') {
        top -= height + arrowHeight; // TBD find out the size of 1rem
      }
      
      // Offset if we collide with the right side of the window
      var offset = 0;
      var leftOffset = screenWidth - (left + width);
      if (leftOffset < 0)
        offset = leftOffset;
      
      // Offset if we collide with the left side of the window
      if (left < 0)
        offset = -left;

      // Apple offset
      left += offset;
      
      // Position arrow
      if (offset < 0) {
        this.$element.addClass('arrow-pos-right');
      }
      else if (offset > 0) {
        this.$element.addClass('arrow-pos-left');
      }
      else {
        this.$element.removeClass('arrow-pos-left arrow-pos-right');
      }
      
      // Position body
      this.$element.css({
        top: top,
        left: left
      });
    },

    /*
    _addArrowPositionStyle: function(position) {
      var style = $('.cuiDynamicStyles');
      if (!style.length)
        style $(document.head).append('<style>');
        
        
      var pct = (position+'').replace('.', '_');
      
      var addRule = function(style) {
          var sheet = document.head.appendChild(style).sheet;
          return function(selector, css){
              var propText = Object.keys(css).map(function(p){
                  return p+":"+css[p]
              }).join(";");
              sheet.insertRule(selector + "{" + propText + "}", sheet.cssRules.length);
          }
      };

      addRule('.popover.arrow-tb-pos-'+pct+':before', {
        left: position+'%'
      });
      
      addRule('.popover.arrow-tb-pos-'+pct+':after', {
        left: position+'%'
      });
    }
    */

    /** @ignore */
    _setPointAt: function() {
      var $el = $(this.options.pointAt);
      
      if ($el.length !== 1) return;
      
      var pos = $el.offset();
      this.set('position', [pos.top, pos.left]);
    },

    _doSetPointFrom: function(pointFrom) {
      // Remove old direction
      this.$element.removeClass('arrow-'+this._directions.join(' arrow-'));
      
      if (pointFrom === 'bottom')
        this.$element.addClass('arrow-top');
      else if (pointFrom === 'top')
        this.$element.addClass('arrow-bottom');
      else if (pointFrom === 'left')
        this.$element.addClass('arrow-right');
      else if (pointFrom === 'right')
        this.$element.addClass('arrow-left');
    },

    /** @ignore */
    _setPointFrom: function() {
      var pointFrom = this.options.pointFrom;
      if (this._directions.indexOf(pointFrom) === -1)
        return;
      
      this._doSetPointFrom(pointFrom);
    }
  });

  CUI.util.plugClass(CUI.Popover);
}(window.jQuery));
