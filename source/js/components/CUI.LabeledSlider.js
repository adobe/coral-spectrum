(function($) {
  CUI.LabeledSlider = new Class(/** @lends CUI.LabeledSlider# */{
    toString: 'LabeledSlider',
    extend: CUI.Slider,
    
    alternating: false,
    
    construct: function() {
      this.$element.addClass("labeled-slider");
    },
    
    _getTickLabel: function(index) {
      var el = this.$element.find("ul.tick-labels li").eq(index);
      return el.html();
    },
           
    _buildTicks: function() {
        var that = this;
        
        if (this.$element.hasClass("label-alternating")) this.alternating = true;
      
        // The ticks holder
        var $ticks = $("<div></div>").addClass('ticks');
        this.$element.prepend($ticks);

        var numberOfTicks = Math.round((that.options.max - that.options.min) / that.options.step) - 1;
        var trackDimensions = that.isVertical ? that.$element.height() : that.$element.width();
        var maxSize = trackDimensions / (numberOfTicks + 1);
        if (this.alternating) maxSize *= 2;
        for (var i = 0; i < numberOfTicks; i++) {
            var position = (i+1) * trackDimensions / (numberOfTicks+1);
            var tick = $("<div></div>").addClass('tick').css((that.isVertical ? 'bottom' : 'left'), position + "px");
            $ticks.append(tick);
            var className = "tick-label-" + i;
            var ticklabel = $("<div></div").addClass('tick-label ' + className);
            if (!that.isVertical) position -= maxSize / 2;
            ticklabel.css((that.isVertical ? 'bottom' : 'left'), position + "px");
            if (!that.isVertical) ticklabel.css('width', maxSize + "px");
            if (that.alternating && !that.isVertical && i % 2 === 1) {
              ticklabel.addClass('alternate');
              tick.addClass('alternate');
            }
            ticklabel.append(that._getTickLabel(i));
            $ticks.append(ticklabel);
        }
        that.$ticks = $ticks.find('.tick');
        if(that.options.filled) {
            that._coverTicks();
        }
    }
    
  });



  CUI.util.plugClass(CUI.LabeledSlider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $(".slider[data-init='labeled-slider']", e.target).labeledSlider();
    });
  }
}(window.jQuery));



