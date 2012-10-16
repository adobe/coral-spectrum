(function($) {
  CUI.Slider = new Class({
    toString: 'Slider',
    extend: CUI.Widget,

    construct: function(options) {
        //if (!this.options.autocompleteCallback) this.options.autocompleteCallback = this._defaultAutocompleteCallback.bind(this);



        // Adjust DOM to our needs
        this._render();


    },
    _render: function() {
        // if current element is input field -> wrap it into DIV
        if (this.$element.get(0).tagName === "INPUT") {
            var div = $("<div></div>");
            div.append(this.$element);
            this.$element = div;
        }

        // add handle
        var handle = $("<div></div>")
            .addClass('handle');
        this.$element.append(handle);

        // add range
        var range = $("<div></div>")
            .addClass('range');
        this.$element.append(range);

        // add ticks
        var tick = $("<span></span>")
            .addClass('tick');
        this.$element.append(tick);

        // add tooltip
        var tooltip = $("<div></div>")
            .addClass('tooltip');
        this.$element.append(tooltip);


    },

    defaults: {
      step: '1',
      min: '1',
      max: '100',
      value: '1',
      type: 'range'
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