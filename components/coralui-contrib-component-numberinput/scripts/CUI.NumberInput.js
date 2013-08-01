(function($) {
  CUI.NumberInput = new Class(/** @lends CUI.NumberInput# */{
    toString: 'NumberInput',
    extend: CUI.Widget,

    /**
      @extends CUI.Widget
      @classdesc A number input widget with increment and decrement buttons.
    */

    construct: function(options) {

      this.setStep(this.options.step || CUI.Datepicker.step);
      
      this.$input = this.$element.find('input').not("[type=hidden]");
      
      if (this.$input.attr('max')) {
        this.setMax(this.$input.attr('max'));
      }

      if (this.$input.attr('min')) {
        this.setMin(this.$input.attr('min'));
      }

      if (this.$input.attr('step')) {
        this.setStep(this.$input.attr('step'));
      }

      var minusIcon = $("<span>").addClass("icon-minus xsmall").html("decrement");
      var plusIcon = $("<span>").addClass("icon-add xsmall").html("increment");
      this.$decrementElement = $("<button>").addClass("number-input-button number-input-decrement");
      this.$incrementElement = $("<button>").addClass("number-input-button number-input-increment");
      this.$decrementElement.html(minusIcon);
      this.$incrementElement.html(plusIcon);

      if(!this.useNativeControls) {
        this._switchInputTypeToText(this.$input);
      }
            
      this.$input.before(this.$decrementElement);
      this.$input.after(this.$incrementElement);

      this.setValue(this.$input.val() || 0);

      this.$input.on('change', function() {
        this._checkMinMaxViolation();
        this._adjustValueLimitedToRange();
      }.bind(this));

      this.on('beforeChange:step', function(event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('beforeChange:min', function(event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.on('beforeChange:max', function(event) {
        this._optionBeforeChangeHandler(event);
      }.bind(this));

      this.$incrementElement.on("click", function () {
        this.increment();
      }.bind(this));

      this.$decrementElement.on("click", function () {
        this.decrement();
      }.bind(this));
      
    },
    
    defaults: {
      max: null,
      min: null,
      step: 1,
      useNativeControls: false
    },

    increment: function () {
      if (this._isNumber()) {
        var value = this.getValue();
        value += this.getStep();
        value = value > this.getMax() ? this.getMax() : value;
        this.setValue(value);
      }
    },

    decrement: function (event) {
      var value =  this.getValue();
      value -= this.getStep();
      value = value < this.getMin() ? this.getMin() : value;
      this.setValue(value);
    },

    setValue: function(value) {
      this.$input.val(value);
      this.$input.trigger('change');
    },

    setMin: function(value) {
      this.set('min', value);
    },

    setMax: function(value) {
      this.set('max', value);
    },

    setStep: function(value) {
      this.set('step', value);
    },

    getValue: function() {
      return parseFloat(this.$input.val());
    },

    getMin: function() {
      return parseFloat(this.options.min);
    },

    getMax: function() {
      return parseFloat(this.options.max);
    },

    getStep: function() {
      return parseFloat(this.options.step);
    }, 

    _adjustValueLimitedToRange: function() {
      var value = this.getValue();
      if (isNaN(value)) {
        // console.error("CUI.NumberInput value set to NaN");
      } else {
        if (value > this.getMax()) {
          value = this.getMax();
        } else if (value < this.getMin()) {
          value = this.getMin();
        }
      }
      this.$input.val(value);
    },

    _checkMinMaxViolation: function() {
      
      if (this._isNumber()) {
        this.$incrementElement.removeAttr('disabled');
        this.$decrementElement.removeAttr('disabled');

        if (this.options.max && this.getValue() >= this.getMax()) {
          this.$incrementElement.attr('disabled', 'disabled');
        } else if (this.options.min && this.getValue() <= this.getMin()) {
          this.$decrementElement.attr('disabled', 'disabled');
        }
      }
    },

    _switchInputTypeToText: function($input) {
        var convertedInput = $input.detach().attr('type', 'text');
        this.$element.prepend(convertedInput);
    },

    _isNumber: function () {
      return !isNaN(this.$input.val());
    },

    _optionBeforeChangeHandler: function(event) {
      if (isNaN(parseFloat(event.value))) {
        // console.error('CUI.NumberInput cannot set option \'' + event.option + '\' to NaN value');
        event.preventDefault();
      }
    }

  });

  CUI.util.plugClass(CUI.NumberInput);
  
  // Data API
  $(document).on("cui-contentloaded.data-api", function(e) {
    $("[data-init~=numberinput]", e.target).numberInput();
  });

}(window.jQuery));