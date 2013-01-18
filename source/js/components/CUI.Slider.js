(function($) {
  CUI.Slider = new Class(/** @lends CUI.Slider# */{
    toString: 'Slider',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc A slider widget

        <p>
            <div class="slider ticked filled tooltips" data-init="slider">
              <input type="range" value="14" min="10" max="20" step="2">
            </div>
        </p>

        <p>
        Currently you have to supply the full markup to this widget. It does not render missing
        elements itself.
        </p>
    @example
    <caption>Simple horizontal slider</caption>
    &lt;div class="slider" data-init="slider"&gt;
        &lt;input type="range" value="14" min="10" max="20" step="2"&gt;
    &lt;/div&gt;

    @example
    <caption>Full-featured slider with two handles, tooltips, ticks and a filled bar</caption>
    &lt;div class="slider tooltips ticked filled" data-init="slider"&gt;
        &lt;input type="range" value="4" min="10" max="20" step="2"&gt;
        &lt;input type="range" value="14" min="10" max="20" step="2"&gt;
    &lt;/div&gt;

    @example
    <caption>Instantiate by jQuery plugin</caption>
    $("select").dropdown();

      @desc Creates a slider from a div
      @constructs

      @param {Object} options           Component options
      @param {number} [options.step=1]  The steps to snap in
      @param {number} [options.min=1]   Minimum value
      @param {number} [options.max=100] Maximum value
      @param {number} [options.value=1] Starting value
      @param {number} [options.tooltips=false] Show tooltips?
      @param {String} [options.orientation=horizontal]  Either 'horizontal' or 'vertical'
      @param {boolean} [options.slide=false]    True for smooth sliding animations 
      @param {boolean} [options.disabled=false] True for a disabled element* 
      @param {boolean} [options.bound=false] For multi-input sliders, indicates that the min value is bounded by the max value and the max value is bounded by the min
    */
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

        if(this.$element.hasClass('slide')) {
            that.options.slide = true;
        }

        if(this.$element.hasClass('bound')) {
            that.options.bound = true;
        }

        var elementId = that.$element.attr('id');
        // if the element doesn't have an id, build a unique id using the $.expando property
        if(!elementId) {
            that.$element.data("_tmp",0).attr("id","slider-"+$.expando+"-"+that.$element.get(0)[$.expando]).removeData("_tmp");
            elementId = that.$element.attr('id');
        }

        that._renderMissingElements();

        // sliders with two inputs should be contained within a fieldset to provide a label for the grouping
        var $fieldset = that.$element.find("fieldset");
        var $legend;
        if ($fieldset.length)
        {
            // move all fieldset children but than the legend to be children of the element.
            that.$element.append($fieldset.contents(":not(legend)"));
            // add a class definition so the fieldset appears inline
            var $newFieldset = $('<div role="fieldset" class="sliderfieldset" />');
            // insert the fieldset before the element and append the element to the fieldset
            that.$element.wrap($newFieldset);

            // get the first legend. there should only be one
            $legend = $fieldset.find("legend").first();
            if ($legend.length)
            {
                var $newLegend = $('<label role="legend"/>').append($legend.contents());

                // if there is a legend replace it with a label with the same content and attributes
                $.each($legend.prop("attributes"), function() {
                    $newLegend.attr(this.name, this.value);
                });

                $fieldset.replaceWith($newLegend);
                $legend = $newLegend;
                $legend.insertBefore(that.$element);

                // if the new label/legend has no id, assign one.
                if (!$legend.attr("id")) {
                    $legend.attr("id",elementId+"-legend");
                }

                $newFieldset.attr("aria-labelledby", $legend.attr("id"));
            }
        }

        that.$inputs = that.$element.find('input');

        var values = [];

        that.$inputs.each(function(index) {
            var $this = $(this);
            var thisId = $this.attr("id");
            // if the input doesn't have an id make one
            if (!thisId) {
                $this.attr("id",elementId+"-input"+index);
                thisId = $this.attr("id");
            }

            if (!$this.attr("aria-labelledby")) {
                $this.attr("aria-labelledby","");
            }

            // existing labels that use the for element
            var $label = that.$element.find("label[for='"+thisId+"']");
            if ($legend) {
                if($this.attr("aria-labelledby").indexOf($legend.attr("id"))===-1) {
                    $this.attr("aria-labelledby", $legend.attr("id")+($this.attr("aria-labelledby").length ? " ":"")+$this.attr("aria-labelledby"));
                }

                if (index===0)
                    $legend.attr("for",thisId);
            }

            if ($label.length)
            {
                $label.not($this.parent()).insertBefore(that.$element);
                $label.each(function(index) {
                    if (!$(this).attr("id")) {
                        $(this).attr("id",thisId+"-label"+index);
                    }
                    if($this.attr("aria-labelledby").indexOf(thisId+"-label"+index)===-1) {
                        $this.attr("aria-labelledby", ($this.attr("aria-labelledby").length ? " ":"")+thisId+"-label"+index);
                    }
                });
            }

            if ($this.parent().is("label")) {
                $label = $this.parent();

                if (!$label.attr("id")) {
                    $label.attr("id",thisId+"-label");
                }

                if (!$label.attr("for")) {
                    $label.attr("for",thisId);
                }

                $this.insertAfter($label);

                if ($legend) {
                    $label.addClass("hidden-accessible");
                }
                $label.insertBefore(that.$element);
            }

            if ($label && $this.attr("aria-labelledby").indexOf($label.attr("id"))===-1)
            {
                $this.attr("aria-labelledby", $this.attr("aria-labelledby")+($this.attr("aria-labelledby").length ? " ":"")+$label.attr("id"));
            }

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

            $this.on("change", function(event) {
                if (that.options.disabled) return;
                that.setValue($this.val(), index);
            }.bind(this));

            if (that._isMobile())
            {
                $this.on("focus", function(event) {
                    that._focus(event);
                }.bind(this));

                $this.on("blur", function(event) {
                    that._blur(event);
                }.bind(this));
            } else {
                $this.attr({"aria-hidden":true,"tabindex":-1,"hidden":"hidden"});
            }
        });

        that.values = values;
        if (this.options.orientation === 'vertical') this.isVertical = true;

        // Set up event handling
        this.$element.fipo("touchstart", "mousedown", function(event) {
            this._mouseDown(event);
        }.bind(this));

        // Listen to changes to configuration
        this.$element.on('change:value', this._processValueChanged.bind(this));
        this.$element.on('change:disabled', this._processDisabledChanged.bind(this));
        this.$element.on('change:min', this._processMinMaxStepChanged.bind(this));
        this.$element.on('change:max', this._processMinMaxStepChanged.bind(this));
        this.$element.on('change:step', this._processMinMaxStepChanged.bind(this));

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
      disabled: false,
      tooltips: false,
      tooltipFormatter: function(value) { return value.toString(); },
      bound: false
    },

    values: [],
    $inputs: null,
    $ticks: null,
    $fill: null,
    $handles: null,
    $tooltips: null,
    isVertical: false,
    draggingPosition: -1,

    /**
     * Set the current value of the slider
     * @param {int}   value   The new value for the slider
     * @param {int}   handleNumber   If the slider has 2 handles, you can specify which one to change, either 0 or 1
     */
    setValue: function(value, handleNumber) {
        handleNumber = handleNumber || 0;

        this._updateValue(handleNumber, value, true); // Do not trigger change event on programmatic value update!
        this._moveHandles();
        if(this.options.filled) {
            this._updateFill();
        }
    },

    _renderMissingElements: function() {
        if (!this.$element.find("input").length) {
            var el = $("<input>");
            el.attr({
                "type": "range",
                "min": this.options.min,
                "max": this.options.max,
                "step": this.options.step,
                "value": this.options.value
            });
            this.$element.append(el);
        }

        if (!this.$element.find("div.clickarea").length) {
            var el2 = $("<div class=\"clickarea\">");
            this.$element.prepend(el2); // Prepend: Must be first element to not hide handles!
        }

        this.$element.toggleClass("slider", true);
        this.$element.toggleClass("vertical", this.options.orientation === 'vertical' );
        this.$element.toggleClass("tooltips", this.options.tooltips);
        this.$element.toggleClass("ticked", this.options.ticks);
        this.$element.toggleClass("filled", this.options.filled);
    },

    _processValueChanged: function() {
        this._updateValue(0, this.options.value, true); // Do not trigger change event on programmatic value update!
        this._moveHandles();
        if(this.options.filled) {
            this._updateFill();
        }   
    },

    _processMinMaxStepChanged: function() {
        this.$element.find("input").attr("min", this.options.min);
        this.$element.find("input").attr("max", this.options.max);
        this.$element.find("input").attr("step", this.options.step);

        for(var i = 0; i < this.values.length; i++) {
            this._updateValue(i, this.values[i], true); // Ensure current values are between min and max
        }

        if(this.options.ticks) {
            this.$element.find(".ticks").remove();
            this._buildTicks();
        }

        if(this.options.filled) {
            this.$element.find(".fill").remove();
            this._buildFill();
        }

        this._moveHandles();
        if(this.options.filled) {
            this._updateFill();
        }
    },

    _processDisabledChanged: function() {
        if (this.options.disabled)
        {
            this.$inputs.attr("disabled","disabled");
            if (this._isMobile()) 
                this.$handles.attr("aria-disabled",true).removeAttr("tabindex");
        } else {
            this.$inputs.removeAttr("disabled");
            if (this._isMobile())
                this.$handles.removeAttr("aria-disabled").attr("tabindex",0);
        }
        this.$element.toggleClass("disabled", this.options.disabled);
    },

    _render: function() {
        var that = this;

        // get maximum max value
        var maximums = that.$inputs.map(function() {return $(this).attr('max');});
        that.options.max = Math.max.apply(null, maximums.toArray());

        // get minimum min value
        var minimums = that.$inputs.map(function() {return $(this).attr('min');});
        that.options.min = Math.min.apply(null, minimums.toArray());

        // get minimum step value
        var steps = that.$inputs.map(function() {return $(this).attr('step');});
        that.options.step = Math.min.apply(null, steps.toArray());

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
            var trackDimensions = that.isVertical ? that.$element.height() : that.$element.width(),
                position = (i+1) * (trackDimensions / (numberOfTicks+1)),
                percent = (position / trackDimensions) * 100,
                tick = $("<div></div>").addClass('tick').css((that.isVertical ? 'bottom' : 'left'), percent + "%");
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
            var percent, fillPercent;
            if(that.values.length < 2) {
                percent = (that.values[0] - that.options.min) / (that.options.max - that.options.min) * 100;
                this.$fill.css((that.isVertical ? 'height' : 'width'), percent + "%");
            } else {
                percent = (this._getLowestValue() - that.options.min) / (that.options.max - that.options.min) * 100;
                fillPercent = (this._getHighestValue() - this._getLowestValue()) / (that.options.max - that.options.min) * 100;
                this.$fill.css((that.isVertical ? 'height' : 'width'), fillPercent + "%")
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
            handle.attr({
                "role":"slider",
                "id":$(this).attr("id")+"-handle",
                "aria-valuemin":that.options.min,
                "aria-valuemax":that.options.max,
                "aria-valuenow":that.values[index],
                "aria-valuetext":that.values[index]
            });

            $(this).css((that.isVertical ? 'bottom' : 'left'), percent + "%");
            $(wrap).append(handle);

            // Add tooltip to handle if required
            if(that.options.tooltips) {
                var tooltip = $("<output>" + $(this).attr('value') + "</output>").addClass('tooltip').addClass(that.isVertical ? 'arrow-left' : 'arrow-bottom')
                .attr({'id':$(this).attr("id")+"-tooltip",'for':$(this).attr("id")});
                handle.append(tooltip);
            }

            if ($(this).attr("aria-labelledby"))
            {
                handle.attr("aria-labelledby",$(this).attr("aria-labelledby")); 
            }

            if (that.$inputs.length>1 && $(this).attr("aria-labelledby"))
            {
                var inputlabelids = $(this).attr("aria-labelledby").split(" "),
                    label;
                for(var i =0; i<inputlabelids.length; i++)
                {
                    label = $("#"+inputlabelids[i]);
                    if (i>0)
                    {
                        label.removeAttr("for");
                        handle.prepend(label);
                    }
                }
            }
            if (that._isMobile()) {
                handle.attr("aria-hidden", true);
                $(this).attr("tabindex", 0).removeAttr("aria-hidden").removeAttr("hidden");
            } else {
                handle.on("focus", function(event) {
                    that._focus(event);
                }.bind(this));

                handle.on("blur", function(event) {
                    that._blur(event);
                }.bind(this));

                handle.on("keydown", function(event) {
                    that._keyDown(event);
                }.bind(this));

                handle.attr("tabindex",0);
                $(this).attr({"aria-hidden":true,"tabindex":-1,"hidden":"hidden"});
            }

            if (that.options.disabled)
            {
                handle.attr("aria-disabled",true).removeAttr("tabindex");
            }
        });

        that.$handles = that.$element.find('.handle');
        that.$tooltips = that.$element.find('.tooltip');
    },

    _handleClick: function(event) {
        if(this.options.disabled) return false;
        var that = this;

        // Mouse page position
        var mouseX = event.pageX;
        var mouseY = event.pageY;

        if (event.type === "touchstart") {
            var touches = (event.originalEvent.touches.length > 0) ? event.originalEvent.touches : event.originalEvent.changedTouches;
            mouseX = touches[0].pageX;
            mouseY = touches[0].pageY;
        }

        if (mouseX === undefined || mouseY === undefined) return; // Do not use undefined values!

        // Find the nearest handle
        var pos = that._findNearestHandle(mouseX, mouseY);

        var val = that._getValueFromCoord(mouseX, mouseY, true);

        if (!isNaN(val))
        {
            that._updateValue(pos, val);
            that._moveHandles();
            if(that.options.filled) {
                that._updateFill();
            }
        }

        if (that._isMobile())
        {
            that.$inputs.eq(pos).focus();
        } else {
            that.$handles.eq(pos).focus();
        }
    },

    _findNearestHandle: function(mouseX, mouseY) {
        var that = this;

        var closestDistance = 999999; // Incredible large start value

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
                pos = index;
            }
        });

        return pos;
    },

    _focus: function(event) {
        if (this.options.disabled) return false;
        var that = this,
            $this = $(event.target);
        that.$element.addClass("focus");
        $this.closest(".value").addClass("focus").find(".handle").addClass("focus");
    },

    _blur: function(event) {
        if (this.options.disabled) return false;
        var that = this,
        $this = $(event.target);
        that.$element.removeClass("focus");
        $this.closest(".value").removeClass("focus").find(".handle").removeClass("focus");
    },

    _keyDown: function(event) {
        if (this.options.disabled) return;
        var that = this,
            $this = $(event.target),
            $input = $this.closest(".value").find("input"),
            index = that.$inputs.index($input),
            val = Number($input.val()),
            step = Number(that.options.step),
            minimum = Number(that.options.min),
            maximum = Number(that.options.max),
            page = Math.max(step,Math.round((maximum-minimum)/10));
        switch(event.keyCode) {
            case 40:
            case 37:
                // down/left
                val-=step;
                event.preventDefault();
                break;
            case 38:
            case 39:
                // up/right
                val+=step;
                event.preventDefault();
                break; 
            case 33:
                // page up
                val+=(page-(val%page));
                event.preventDefault();
                break;
            case 34:
                // page down
                val-=(page- (val%page===0 ? 0 : page-val%page));
                event.preventDefault();
                break;
            case 35:
                // end
                val = maximum;
                event.preventDefault();
                break;
            case 36:
                // home
                val = minimum;
                event.preventDefault();
                break;
        }
        if (val !== Number($input.val())) {
            that.setValue(val, index);
            $input.change();
        }
    },

    _mouseDown: function(event) {
        if(this.options.disabled) return false;
        event.preventDefault();

        var that = this;

        this.draggingPosition = -1;

        this.$handles.each(function(index, handle) {
            if (handle === event.target) that.draggingPosition = index;
        }.bind(this));

        that.$tooltips.each(function(index, tooltip) {
            if (tooltip === event.target) that.draggingPosition = index;
        }.bind(this));

        // Did not touch any handle? Emulate click instead!
        if (this.draggingPosition < 0) {
            this._handleClick(event);
            return;
        }

        if (that._isMobile())
        {
            this.$inputs.eq(this.draggingPosition).focus();
        } else {
            this.$handles.eq(this.draggingPosition).focus();
        }
        this.$handles.eq(this.draggingPosition).addClass("dragging");
        this.$element.closest("body").addClass("slider-dragging-cursorhack");

        $(window).fipo("touchmove.slider", "mousemove.slider", this._handleDragging.bind(this));
        $(window).fipo("touchend.slider", "mouseup.slider", this._mouseUp.bind(this));

        //update();
    },

    _handleDragging: function(event) {
        var mouseX = event.pageX;
        var mouseY = event.pageY;

        // Handle touch events
        if (event.originalEvent.targetTouches) {
            var touch = event.originalEvent.targetTouches.item(0);
            mouseX = touch.pageX;
            mouseY = touch.pageY;
        }

        this._updateValue(this.draggingPosition, this._getValueFromCoord(mouseX, mouseY));
        this._moveHandles();
        if(this.options.filled) {
            this._updateFill();
        }
        event.preventDefault();
    },

    _mouseUp: function() {
        this.$handles.eq(this.draggingPosition).removeClass("dragging");
        this.$element.closest("body").removeClass("slider-dragging-cursorhack");

        this.draggingPosition = -1;
        $(window).unbind("mousemove.slider touchmove.slider");
        $(window).unbind("mouseup.slider touchend.slider");
    },

    _updateValue: function(pos, value, doNotTriggerChange) {
        var that = this;
        if ((that.$inputs.eq(pos).attr("value") !== value.toString()) || (that.values[pos] !== value.toString())) {
            if (value > this.options.max) value = this.options.max;
            if (value < this.options.min) value = this.options.min;

            if(pos === 0 || pos === 1) {
                if (that.$inputs.length===2 && this.options.bound)
                {
                    if (pos===0) {
                        value = Math.min(value, Number(that.$inputs.eq(1).val()));
                        that.$inputs.eq(1).attr({"min":value});
                        that.$inputs.eq(pos).attr({"max":that.$inputs.eq(1).val()/*,"aria-valuemax":that.$inputs.eq(1).val()*/});
                        that.$handles.eq(1).attr({"aria-valuemin":value});
                        that.$handles.eq(pos).attr({"aria-valuemax":that.$inputs.eq(1).val()});
                    } else {
                        value = Math.max(value, Number(that.$inputs.eq(0).val()));
                        that.$inputs.eq(0).attr({"max":value});
                        that.$inputs.eq(pos).attr({"min":that.$inputs.eq(0).val()});
                        that.$handles.eq(0).attr({"aria-valuemax":value});
                        that.$handles.eq(pos).attr({"aria-valuemin":that.$inputs.eq(0).val()});
                    }
                }
                that.values[pos] = value.toString();
                that.$inputs.eq(pos).attr("value", value);
                that.$handles.eq(pos).attr({"aria-valuenow":value,"aria-valuetext":value});
                if (!doNotTriggerChange) {
                    setTimeout(function() {
                        that.$inputs.eq(pos).change(); // Keep input element value updated too and fire change event for any listeners
                    }, 1); // Not immediatly, but after our own work here
                }
            }
        }
    },

    _moveHandles: function() {
        var that = this;

        // Set the handle position as a percentage based on the stored values
        this.$handles.each(function(index) {
            var percent = (that.values[index] - that.options.min) / (that.options.max - that.options.min) * 100,
                $input = that.$inputs.eq(index);

            if(that.options.orientation === "vertical") {
                if(that.options.slide) {
                    $(this).stop().animate({bottom: percent + "%"});
                    $input.stop().animate({bottom: percent + "%"});
                } else {
                    $(this).css("bottom", percent + "%");
                    $input.css("bottom", percent + "%");
                }
            } else { // Horizontal
                if(that.options.slide) {
                    $(this).stop().animate({left: percent + "%"});
                    $input.stop().animate({left: percent + "%"});
                } else {
                    $(this).css("left", percent + "%");
                    $input.css("left", percent + "%");
                }
            }

            // Update tooltip value (if required)
            if(that.options.tooltips) {
                that.$tooltips.eq(index).html(that.options.tooltipFormatter(that.values[index]));
            }
        });
    },

    _updateFill: function() {
        var that = this;
        var percent;

        if(that.values.length !== 0) {
            if(that.values.length === 2) { // Double value/handle
                percent = ((that._getLowestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
                var secondPercent = ((that._getHighestValue() - that.options.min) / (that.options.max - that.options.min)) * 100;
                var percentDiff = secondPercent - percent;
                if(that.options.orientation === "vertical") {
                    if(that.options.slide) {
                        that.$fill.stop().animate({bottom: percent + "%", height: percentDiff + "%"});
                    } else {
                        that.$fill.css("bottom", percent + "%").css("height", percentDiff + "%");
                    }
                } else { // Horizontal
                    if(that.options.slide) {
                        that.$fill.stop().animate({left: percent + "%", width: percentDiff + "%"});
                    } else {
                        that.$fill.css("left", percent + "%").css("width", percentDiff + "%");
                    }
                }
            } else { // Single value/handle
                percent = ((that.values[0] - that.options.min) / (that.options.max - that.options.min)) * 100;
                if(that.options.orientation === "vertical") {
                    if(that.options.slide) {
                        that.$fill.stop().animate({height: percent + "%"});
                    } else {
                        that.$fill.css("height", percent + "%");
                    }
                } else {
                    if(that.options.slide) {
                        that.$fill.stop().animate({width: percent + "%"});
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

    _getValueFromCoord: function(posX, posY, restrictBounds) {
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

        // if the bounds are retricted, as with _handleClick, we souldn't change the value.
        if (restrictBounds && (percent<0 || percent>1)) return NaN;

        var rawValue = that.options.min * 1 + ((that.options.max - that.options.min) * percent);

        if(rawValue >= that.options.max) return that.options.max;
        if(rawValue <= that.options.min) return that.options.min;


        // Snap value to nearest step
        remainder = ((rawValue - that.options.min) % that.options.step);
        if(Math.abs(remainder) * 2 >= that.options.step) {
            snappedValue = (rawValue - remainder) + (that.options.step * 1); // *1 for IE bugfix: Interpretes expr. as string!
        } else {
            snappedValue = rawValue - remainder;
        }

        return snappedValue;
    },

    _getHighestValue: function() {
      return Math.max.apply(null, this.values);
    },

    _getLowestValue: function() {
      return Math.min.apply(null, this.values);
    },

    /** @ignore */
    _isMobile: function() {
        return typeof window.ontouchstart === 'object';
    }

    /*update: function() {
        // TODO: Single update method
    }*/
  });



  CUI.util.plugClass(CUI.Slider);

  // Data API
  if (CUI.options.dataAPI) {
    $(document).on("cui-contentloaded.data-api", function(e) {
        $(".slider[data-init='slider']", e.target).slider();
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
