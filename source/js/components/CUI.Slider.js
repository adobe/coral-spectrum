(function($) {
  CUI.Slider = new Class({
    toString: 'Slider',
    extend: CUI.Widget,

    construct: function(options) {
        var that = this;

        // setting default dom attributes if needed
        if (!this.$element.hasClass('vertical') && !this.$element.hasClass('horizontal')) this.$element.addClass(that.options.orientation);

        this.$element.find('input').each(function() {
            var $this = $(this);

            // setting default step
            if (!$this.is("[step]")) $this.attr('step', that.options.step);

            // setting default min
            if (!$this.is("[min]")) $this.attr('min', that.options.min);

            // setting default max
            if (!$this.is("[max]")) $this.attr('max', that.options.max);

            // setting default value
            if (!$this.is("[value]")) $this.attr('value', that.options.value);
        });

        // adjust dom to our needs
        this._render();
    },
    _render: function() {
        var that = this;

        // get maximum max value
        var maximums = this.$element.find('input').map(function() {return $(this).attr('max');});
        var max = Math.max.apply(Math, maximums);

        // get minimum min value
        var minimums = this.$element.find('input').map(function() {return $(this).attr('min');});
        var min = Math.min.apply(Math, minimums);

        // get minimum step value
        var steps = this.$element.find('input').map(function() {return $(this).attr('step');});
        var step = Math.min.apply(Math, steps);

        // is vertical slider?
        var isVertical = this.$element.hasClass('vertical');

        // Todo: do not add already existing elements or remove them before adding new elements
        // add ticks if needed
        if (this.$element.hasClass('ticked')) {
            var ticks = $("<div></div>")
                .addClass('ticks');
            this.$element.prepend(ticks);

            var numberOfTicks = Math.round((max - min) / step) - 1;

            for (var i = 0; i < numberOfTicks; i++) {
                var position = (i+1) * ((isVertical ? that.$element.height() : that.$element.width()) / (numberOfTicks+1));
                var tick = $("<div></div>")
                    .addClass('tick').css((isVertical ? 'bottom' : 'left'), position);
                ticks.append(tick);
            }
        }

        // add fill if needed
        if(this.$element.hasClass('filled')) {
            var fill = $("<div></div>")
                .addClass('fill');
            if (this.$element.find('input').length < 2) {
                var size = (this.$element.find('input').attr('value') - min) * (isVertical ? that.$element.height() : that.$element.width()) / (max - min);
                fill.css((isVertical ? 'height' : 'width'), size);
            } else {
                var values = this.$element.find('input').map(function() {return $(this).attr('value');});
                var maxValue = Math.max.apply(Math, values);
                var minValue = Math.min.apply(Math, values);
                fill.css((isVertical ? 'height' : 'width'), (maxValue - minValue) * (isVertical ? that.$element.height() : that.$element.width()) / (max - min))
                    .css((isVertical ? 'bottom' : 'left'), (minValue - min) * (isVertical ? that.$element.height() : that.$element.width()) / (max - min));
            }
            this.$element.prepend(fill);
        }

        // wrap each input field and add handles and tooltips (if needed)
        this.$element.find('input').each(function() {

            // wrap
            var wrap = $(this).wrap("<div></div>").parent().addClass("value");

            // add handle
            var position = ($(this).attr('value') - min) * (isVertical ? that.$element.height() : that.$element.width()) / (max - min);
            var handle = $("<div></div>")
                .addClass('handle').css((isVertical ? 'bottom' : 'left'), position);
            $(wrap).append(handle);

            // add tooltip if needed
            if ($(this).attr('type') === 'number') {
                var tooltip = $("<div>" + $(this).attr('value') + "</div>")
                    .addClass('tooltip').addClass(isVertical ? 'arrow-left' : 'arrow-bottom');
                $(handle).append(tooltip);
            }
        });
    },

    defaults: {
      step: '1',
      min: '1',
      max: '100',
      value: '1',
      orientation: 'horizontal'
    }
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