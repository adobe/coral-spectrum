(function($) {
  CUI.Slider = new Class({
    toString: 'Slider',
    extend: CUI.Widget,

    construct: function(options) {
        var that = this;

        // sane defaults for the options
        that.options = $.extend({}, this.defaults, options);

        // setting default dom attributes if needed
        if (this.$element.hasClass('vertical')) {
            that.options.orientation = 'vertical';
            that.isVertical = true;
        }

        if(that.$element.hasClass('tooltips')) {
            that.options.tooltips = true;
        }

        if(that.$element.hasClass('ticked')) {
            that.options.ticks = true;
        }

        if(this.$element.hasClass('filled')) {
            that.options.filled = true;
        }

        that.$inputs = this.$element.find('input');

        var values = [];

        that.$inputs.each(function(index) {
            var $this = $(this);

            // setting default step
            if (!$this.is("[step]")) $this.attr('step', that.options.step);

            // setting default min
            if (!$this.is("[min]")) $this.attr('min', that.options.min);

            // setting default max
            if (!$this.is("[max]")) $this.attr('max', that.options.max);

            // setting default value
            if (!$this.is("[value]")) {
                $this.attr('value', that.options.value);
                values.push(that.options.value);
            } else {
                values.push($this.attr('value'));
            }

            if(index === 0) {
                if($this.is(":disabled")) {
                    that.options.disabled = true;
                    that.$element.addClass("disabled");
                } else {
                    if(that.options.disabled) {
                        $this.attr("disabled","disabled");
                        that.$element.addClass("disabled");
                    }
                }
            }
        });

        that.values = values;

        // Set up event handling
        // TODO: Support handle drag (mobile: touchstart, touchmove, touchend; click: mousedown, mouseup)
        this.$element.on("mouseup", function(event) {
            this._mouseUp(event);
        }.bind(this));

        this.$element.on("mousedown", function(event) {
            this._mouseDown(event);
        }.bind(this));

        // Adjust dom to our needs
        this._render();
    },

    defaults: {
      step: '1',
      min: '1',
      max: '100',
      value: '1',
      orientation: 'horizontal',
      slide: false,
      disabled: false
    },

    values: [],
    $inputs: null,
    $ticks: null,
    $fill: null,
    $handles: null,
    $tooltips: null,
    isVertical: false,
    isDragging: false,
    
    _render: function() {
        var that = this;

        // get maximum max value
        var maximums = that.$inputs.map(function() {return $(this).attr('max');});
        that.options.max = Math.max.apply(Math, maximums.toArray());

        // get minimum min value
        var minimums = that.$inputs.map(function() {return $(this).attr('min');});
        that.options.min = Math.min.apply(Math, minimums.toArray());

        // get minimum step value
        var steps = that.$inputs.map(function() {return $(this).attr('step');});
        that.options.step = Math.min.apply(Math, steps.toArray());

        // Todo: do not add already existing elements or remove them before adding new elements
        // build ticks if needed
        if(that.options.ticks) {
            that._buildTicks();
        }

        // build fill if needed
        if(that.options.filled) {
            that._buildFill();
        }

        that._buildHandles();
    },

    _buildTicks: function() {
        var that = this;

        // The ticks holder
        var $ticks = $("<div></div>").addClass('ticks');
        this.$element.prepend($ticks);

        var numberOfTicks = Math.round((that.options.max - that.options.min) / that.options.step) - 1;

        for (var i = 0; i < numberOfTicks; i++) {
            var position = (i+1) * ((that.isVertical ? that.$element.height() : that.$element.width()) / (numberOfTicks+1));
            var tick = $("<div></div>").addClass('tick').css((that.isVertical ? 'bottom' : 'left'), position);
            $ticks.append(tick);
        }
        that.$ticks = $ticks.find('.tick');
        if(that.options.filled) {
            that._coverTicks();
        }
    },

    _buildFill: function() {
        var that = this;

        this.$fill = $("<div></div>").addClass('fill');

        if(that.values.length !== 0) {
            if(that.values.length < 2) {
                var size = (that.values[0] - that.options.min) * (that.isVertical ? that.$element.height() : that.$element.width()) / (that.options.max - that.options.min);
                this.$fill.css((that.isVertical ? 'height' : 'width'), size);
            } else {
                var percent = (this._getLowestValue() - that.options.min) / (that.options.max - that.options.min) * 100;
                this.$fill.css((that.isVertical ? 'height' : 'width'), (this._getHighestValue() - this._getLowestValue()) * (that.isVertical ? that.$element.height() : that.$element.width()) / (that.options.max - that.options.min))
                    .css((that.isVertical ? 'bottom' : 'left'), percent + "%");
            }
        }
        this.$element.prepend(this.$fill);
        that.options.filled = true;
    },

    _buildHandles: function() {
        var that = this;

        // Wrap each input field and add handles and tooltips (if required)
        that.$inputs.each(function(index) {

            var wrap = $(this).wrap("<div></div>").parent().addClass("value");

            // Add handle for input field
            var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;
            var handle = $('<div></div>').addClass('handle').css((that.isVertical ? 'bottom' : 'left'), percent + "%");
            $(wrap).append(handle);

            // Add tooltip to handle if required
            if(that.options.tooltips) {
                var tooltip = $("<div>" + $(this).attr('value') + "</div>").addClass('tooltip').addClass(that.isVertical ? 'arrow-left' : 'arrow-bottom');
                $(handle).append(tooltip);
            }
        });

        that.$handles = that.$element.find('.handle');
        that.$tooltips = that.$element.find('.tooltip');
    },

    _mouseDown: function(event) {
        var that = this;

        // TODO: implement slider drag and drop
        //$(window).mousemove(function() {
        //    that.isDragging = true;
        //    $(window).unbind("mousemove");
        //});

        if(that.options.disabled) return false;

        // Find the nearest handle and move it the clicked position
        var $nearestHandle;

        // Mouse page position
        var mouseX = event.pageX;
        var mouseY = event.pageY;

        // Slider dimensions
        var sliderWidth = this.$element.outerWidth();
        var sliderHeight = this.$element.outerHeight();

        var closestDistance = sliderWidth;
        if(that.options.orientation === "vertical") {
            closestDistance = sliderHeight;
        }

        // Find the nearest handle
        var pos = 0;
        that.$handles.each(function(index) {

            // Handle position
            var handleX = $(this).offset().left;
            var handleY = $(this).offset().top;

            // Handle Dimensions
            var handleWidth = $(this).width();
            var handleHeight = $(this).height();

            // Distance to handle
            var distance = Math.abs(mouseX - (handleX+(handleWidth/2)));
            if(that.options.orientation === "vertical") {
                distance = Math.abs(mouseY - (handleY+(handleHeight/2)));
            }

            if(distance < closestDistance) {
                closestDistance = distance;
                $nearestHandle = $(this);
                pos = index;
            }
        });

        that._updateValue(pos, that._getValueFromCoord(mouseX, mouseY));
        that._moveHandles();
        if(that.options.filled) {
            that._updateFill();
        }
        //update();
    },

    _mouseUp: function() {
        var that = this;

        if(that.options.disabled) return false;

        // TODO: Implement handle drag and drop
        //var wasDragging = that.isDragging;
        //that.isDragging = false;
        //$(window).unbind("mousemove");
        //if (wasDragging) {
        //    console.log("we were dragging");
        //}
    },

    _updateValue: function(pos, value) {
        var that = this;

        if(pos === 0 || pos === 1) {
            that.values[pos] = value.toString();
            that.$inputs.eq(pos).attr("value", value); // Keep input element value updated too
        }
    },

    _moveHandles: function() {
        var that = this;

        // Set the handle position as a percentage based on the stored values
        this.$handles.each(function(index) {
            var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100;

            if(that.options.orientation === "vertical") {
                if(that.options.slide) {
                    $(this).animate({bottom: percent + "%"});
                } else {
                    $(this).css("bottom", percent + "%");
                }
            } else { // Horizontal
                if(that.options.slide) {
                    $(this).animate({left: percent + "%"});
                } else {
                    $(this).css("left", percent + "%");
                }
            }

            // Update tooltip value (if required)
            if(that.options.tooltips) {
                that.$tooltips.eq(index).html(that.values[index]);
            }
        });
    },

    _updateFill: function() {
        var that = this;
        var percent;

        if(that.values.length !== 0) {
            if(that.values.length === 2) { // Double value/handle
                percent = ((that.values[0] - that.options.min) / (that.options.max - that.options.min)) * 100;
                var secondPercent = ((that.values[1] - that.options.min) / (that.options.max - that.options.min)) * 100;
                var percentDiff = secondPercent - percent;
                if(that.options.orientation === "vertical") {
                    if(that.options.slide) {
                        that.$fill.animate({bottom: percent + "%", height: percentDiff + "%"});
                    } else {
                        that.$fill.css("bottom", percent + "%").css("height", percentDiff + "%");
                    }
                } else { // Horizontal
                    if(that.options.slide) {
                        that.$fill.animate({left: percent + "%", width: percentDiff + "%"});
                    } else {
                        that.$fill.css("left", percent + "%").css("width", percentDiff + "%");
                    }
                }
            } else { // Single value/handle
                percent = ((that.values[0] - that.options.min) / (that.options.max - that.options.min)) * 100;
                if(that.options.orientation === "vertical") {
                    if(that.options.slide) {
                        that.$fill.animate({height: percent + "%"});
                    } else {
                        that.$fill.css("height", percent + "%");
                    }
                } else {
                    if(that.options.slide) {
                        that.$fill.animate({width: percent + "%"});
                    } else {
                        that.$fill.css("width", percent + "%");
                    }
                }
            }
        }
        if(that.options.ticks) {
            that._coverTicks();
        }
    },

    _coverTicks: function() {
        var that = this;

        // Ticks covered by the fill are given 'covered' class
        that.$ticks.each(function(index) {
            var value = that._getValueFromCoord($(this).offset().left, $(this).offset().top);
            if(that.values.length === 2) { // TODO add a parameter to indicate multi values/handles
                if((value > that._getLowestValue()) && (value < that._getHighestValue())) {
                    if(!$(this).hasClass('covered')) $(this).addClass('covered');
                } else {
                    $(this).removeClass('covered');
                }
            } else {
                if(value < that._getHighestValue()) {
                    if(!$(this).hasClass('covered')) $(this).addClass('covered');
                } else {
                    $(this).removeClass('covered');
                }
            }
        });
    },

    _getValueFromCoord: function(posX, posY) {
      var that = this;
      var percent, snappedValue, remainder;
      var elementOffset = that.$element.offset();

      if(that.options.orientation === "vertical") {
          var elementHeight = that.$element.height();
          percent = ((elementOffset.top + elementHeight) - posY) / elementHeight;
      } else {
          var elementWidth = that.$element.width();
          percent = ((posX - elementOffset.left) / elementWidth);
      }
      var rawValue = that.options.min + ((that.options.max - that.options.min) * percent);

      // Snap value to nearest step
      if(rawValue >= that.options.max) return that.options.max;
      if(rawValue <= that.options.min) return that.options.min;

      remainder = ((rawValue - that.options.min) % that.options.step);
      if(Math.abs(remainder) * 2 >= that.options.step) {
          snappedValue = rawValue - remainder + that.options.step;
      } else {
          snappedValue = rawValue - remainder;
      }
      return snappedValue;
    },

    _getHighestValue: function() {
      return Math.max.apply(Math, this.values);
      //return 30;
    },

    _getLowestValue: function() {
      return Math.min.apply(Math, this.values);
      //return 10;
    }

    /*update: function() {
        // TODO: Single update method
    }*/
  });

  CUI.util.plugClass(CUI.Slider);

  // Data API
  if (CUI.options.dataAPI) {
    $(function() {
        $(".slider[data-init='slider']").slider();
    });
  }
}(window.jQuery));


/*


 <!--section id="Slider">
 <h2 class="line">Slider</h2>
 <p>Different types of sliders.</p>

 <div class="componentSample">
 <div class="example">
 <div class="filterSample">
 <div class="sampleTitle left">Standard</div>
 <div class="slider horizontal">
 <div class="range" style="width: 20%"></div>
 <span class="tick" style="left: 20%"></span>
 <div class="handle" style="left: 45%"></div>
 <div class="tooltip info arrow-left">
 <span>45%</span>
 </div>
 </div>

 </div>
 </div>

 </section-->

    */