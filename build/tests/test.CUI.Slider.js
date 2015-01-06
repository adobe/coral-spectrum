/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2014 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

;(function () {

  var $sliderSingle, $sliderRange, $sliderFromOptions,
    origIsTouch = CUI.util.isTouch;

  var SLIDER_OPTIONS_MINIMAL = {
    min: 0,
    max: 100,
    step: 10,
    value: 50
  };

  var SLIDER_BARE = {
    "name" : 'slider bare',
    "html" : '' +
      '<div class="coral-Slider" data-init="slider">' +
      '<label>' +
      'Basic Horizontal Slider, no minimal options<br>' +
      '<input type="range">' +
      '</label>' +
      '</div>'
  };

  var SLIDER_SINGLE = {
    "name" : 'slider single',
    "html" : '' +
      '<div class="coral-Slider" data-init="slider">' +
      '<label>' +
      'Basic Horizontal Slider<br>' +
      '<input type="range" min="' + SLIDER_OPTIONS_MINIMAL.min + '" max="' + SLIDER_OPTIONS_MINIMAL.max +
      '" step="' + SLIDER_OPTIONS_MINIMAL.step + '" value="' + SLIDER_OPTIONS_MINIMAL.value + '">' +
      '</label>' +
      '</div>'
  };

  var SLIDER_RANGE = {
    "name" : 'slider range',
    "html" : '' +
      '<div class="coral-Slider" data-init="slider">' +
      '<fieldset>' +
      '<!-- Note if you remove the legend, rendering errors occur. It can be empty, apparently. -->' +
      '<legend>Range Slider</legend>' +
      '<label>Minimum <input type="range" min="' + SLIDER_OPTIONS_MINIMAL.min + '" max="' + SLIDER_OPTIONS_MINIMAL.max +
      '" step="' + SLIDER_OPTIONS_MINIMAL.step + '" value="' + SLIDER_OPTIONS_MINIMAL.value + '"></label>' +
      '<label>Maximum <input type="range" min="' + SLIDER_OPTIONS_MINIMAL.min + '" max="' + SLIDER_OPTIONS_MINIMAL.max +
      '" step="' + SLIDER_OPTIONS_MINIMAL.step + '" value="' + SLIDER_OPTIONS_MINIMAL.value + '"></label>' +
      '</fieldset>' +
      '</div>'
  };

  var SLIDER_LABELED = {
    "name" : 'slider labeled',
    "html" : '' +
      '<div class="coral-Slider coral-Slider--ticked" data-init="labeled-slider" data-alternating="true">' +
      '<label>' +
      'Basic Horizontal Slider<br>' +
      '<input type="range" min="' + SLIDER_OPTIONS_MINIMAL.min + '" max="' + SLIDER_OPTIONS_MINIMAL.max +
      '" step="' + SLIDER_OPTIONS_MINIMAL.step + '" value="' + SLIDER_OPTIONS_MINIMAL.value + '">' +
      '</label>' +
      '<ul class="coral-Slider-tickLabels">' +
        '<li>First label</li>' +
        '<li>Second label</li>' +
        '<li>Third label</li>' +
        '<li>Fourth label</li>' +
        '<li>Fifth label</li>' +
      '</ul>' +
      '</div>'
  };

  var TEST_ATTRIBUTES = {
    "classes" : {
      "modifiers" : {
        "bound"             : "coral-Slider--bound",
        "filled"            : "coral-Slider--filled",
        "ticked"            : "coral-Slider--ticked",
        "tooltips"          : "coral-Slider--tooltips",
        "vertical"          : "coral-Slider--vertical",
        "labeled"           : "coral-Slider--labeled",
        "alternatinglabels" : "coral-Slider--alternatingLabels",
        "tick_covered"      : "coral-Slider-tick--covered",
        "tooltip_info"      : "coral-Tooltip--inspect"
      },
      "components" : {
        "clickarea"  : "coral-Slider-clickarea",
        "fill"       : "coral-Slider-fill",
        "handle"     : "coral-Slider-handle",
        "ticks"      : "coral-Slider-ticks",
        "tick"       : "coral-Slider-tick",
        "ticklabels" : "coral-Slider-tickLabels",
        "ticklabel"  : "coral-Slider-tickLabel",
        "value"      : "coral-Slider-value",
        "tooltip"    : "coral-Tooltip"
      }
    }
  };

  describe('CUI.Slider', function() {

    beforeEach(function () {
      $sliderSingle = $(SLIDER_SINGLE.html).slider().appendTo(document.body);
      $sliderRange = $(SLIDER_RANGE.html).slider().appendTo(document.body);
      $sliderFromOptions = $("<div>").slider(SLIDER_OPTIONS_MINIMAL).appendTo(document.body);
    });

    afterEach(function () {
      $sliderSingle
        .add($sliderRange)
        .add($sliderFromOptions)
        .remove();

      $sliderSingle = $sliderRange = $sliderFromOptions = null;
      CUI.util.isTouch = origIsTouch;
    });

    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('Slider');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('slider');
    });

    describe("from markup", function() {

      it ('should be a slider', function() {
        expect($sliderSingle).to.have.class("coral-Slider");
      });

      it('should have attributes set for min, max, step and value if any are missing', function() {
        var $sliderBare = $(SLIDER_BARE.html).slider().appendTo(document.body),
            $input = $sliderBare.find('input');

        expect($input.is("[min]")).to.be.true;
        expect($input.is("[max]")).to.be.true;
        expect($input.is("[step]")).to.be.true;
        expect($input.is("[value]")).to.be.true;
        $sliderBare.remove();
      });
    });

    describe("from options", function() {

      it('should create an input field', function() {
        expect($sliderFromOptions.find("input").length).to.equal(1);
      });

      it('should correctly set the initial input value', function() {
        expect(parseFloat($sliderFromOptions.find("input").val())).to.equal(SLIDER_OPTIONS_MINIMAL.value);
      });
    });

    describe('with option tooltips="true"', function() {
      var $sliderSingleTooltips, $sliderRangeTooltips, $handlesSingle, $handlesRange, $tooltipsSingle, $tooltipsRange;

      beforeEach(function () {
        $sliderSingleTooltips = $(SLIDER_SINGLE.html).slider($.extend(SLIDER_OPTIONS_MINIMAL, {"tooltips":true})).appendTo(document.body);
        $sliderRangeTooltips = $(SLIDER_RANGE.html).slider($.extend(SLIDER_OPTIONS_MINIMAL, {"tooltips":true})).appendTo(document.body);
        $tooltipsSingle = $sliderSingleTooltips.find('.'+TEST_ATTRIBUTES.classes.components.tooltip);
        $tooltipsRange = $sliderRangeTooltips.find('.'+TEST_ATTRIBUTES.classes.components.tooltip);
        $handlesSingle = $sliderSingleTooltips.find('.'+TEST_ATTRIBUTES.classes.components.handle);
        $handlesRange = $sliderRangeTooltips.find('.'+TEST_ATTRIBUTES.classes.components.handle);
      });

      afterEach(function () {
        $sliderSingleTooltips
          .add($sliderRangeTooltips)
          .add($handlesSingle)
          .add($handlesRange)
          .add($tooltipsSingle)
          .add($tooltipsRange)
          .remove();

        $sliderSingleTooltips = $sliderRangeTooltips = $handlesSingle = $handlesRange = $tooltipsSingle = $tooltipsRange = null;
      });

      it('should be modified as having tooltips', function() {
        expect($sliderSingleTooltips).to.have.class(TEST_ATTRIBUTES.classes.modifiers.tooltips);
      });

      it('should add a tooltip element for the handle (single)', function() {
        expect($tooltipsSingle.length).to.equal($handlesSingle.length);
      });

      it('should add a tooltip element for each handle (range)', function() {
        expect($tooltipsRange.length).to.equal($handlesRange.length);
      });

      it('should modify tooltips as type "info"', function() {
        expect($tooltipsRange).to.have.class(TEST_ATTRIBUTES.classes.modifiers.tooltip_info);
      });

      it('should match the tooltip text to the input value on value change (default tooltip formatter)', function() {
        var $input = $sliderSingleTooltips.find('input').first(),
            $tooltip = $tooltipsSingle.first(),
            newVal = 60;

        $sliderSingleTooltips.data('slider').setValue(newVal, 0);
        expect($input.val() == $tooltip.text()).to.be.true;
      });
    });

    describe('with option filled="true"', function() {
      var $sliderFilled, $fill;

      beforeEach(function () {
        $sliderFilled = $("<div>").slider($.extend(SLIDER_OPTIONS_MINIMAL, {"filled":true})).appendTo(document.body);
        $fill = $sliderFilled.find('.' + TEST_ATTRIBUTES.classes.components.fill);
      });

      afterEach(function () {
        $sliderFilled.remove();
        $sliderFilled = $fill = null;
      });

      it('should be modified to filled', function() {
        expect($sliderFilled).to.have.class(TEST_ATTRIBUTES.classes.modifiers.filled);
      });

      it('should add a single fill element', function() {
        expect($fill.length).to.equal(1);
      });
    });

    describe('with option orientation="vertical"', function() {
      var $sliderVertical = $("<div>").slider($.extend(SLIDER_OPTIONS_MINIMAL, {"orientation":"vertical"})).appendTo(document.body);

      it('should mark the slider as vertical', function() {
        expect($sliderVertical).to.have.class(TEST_ATTRIBUTES.classes.modifiers.vertical);
      });

      $sliderVertical.remove();
    });

    describe('with option ticks="true"', function() {
      var $sliderTicked, $tickContainer, $ticks;

      beforeEach(function () {
        $sliderTicked = $("<div>").slider($.extend(SLIDER_OPTIONS_MINIMAL, {"ticks":true})).appendTo(document.body);
        $tickContainer = $sliderTicked.find('.' + TEST_ATTRIBUTES.classes.components.ticks);
        $ticks = $sliderTicked.find('.' + TEST_ATTRIBUTES.classes.components.tick);
      });

      afterEach(function () {
        $sliderTicked.remove();
        $sliderTicked = $tickContainer = $ticks = null;
      });

      it('should be modified to ticked', function() {
        expect($sliderTicked).to.have.class(TEST_ATTRIBUTES.classes.modifiers.ticked);
      });

      it('should add tick related DOM elements', function() {
        expect($tickContainer.length).to.equal(1);
        expect($ticks.length <= 0).to.be.false;
      });
    });

    describe('with option bound="true"', function() {
      var $sliderBound;

      beforeEach(function () {
        $sliderBound = $(SLIDER_RANGE.html).slider($.extend(SLIDER_OPTIONS_MINIMAL, {"bound":true})).appendTo(document.body);
      });

      afterEach(function () {
        $sliderBound.remove();
      });

      it('should not be able to "slide" handles past one another when using setValue() api', function() {
        var $inputs = $sliderBound.find('input');

        $sliderBound.data('slider').setValue(40,0);
        $sliderBound.data('slider').setValue(60,0); // try handle0 > handle1 (handle0 = 60, handle1 = 50)
        expect(parseInt($inputs.eq(0).val(), 10)).to.equal(SLIDER_OPTIONS_MINIMAL.value);

        $sliderBound.data('slider').setValue(40,1); // try handle1 < handle0 (handle0 = 50, handle1 = 40)
        expect(parseInt($inputs.eq(1).val(), 10)).to.equal(SLIDER_OPTIONS_MINIMAL.value);
      });
    });

    describe('api', function() {

      describe('setValue(value)', function() {

        it('should correctly set the input value', function() {
          var value = 20; // Choose step point, otherwise it would be adjusted
          $sliderSingle.data('slider').setValue(value);
          expect(parseInt($sliderSingle.find('input').val(), 10)).to.equal(value);
        });

        it('should correctly snap input values to the nearest step', function() {
          var setValue = 27, expectedSnap = 30;

          $sliderSingle.data('slider').setValue(setValue);
          expect(parseInt($sliderSingle.find('input').eq(0).val(), 10)).to.equal(expectedSnap);
        });

        it('should not trigger a change event on the input field', function(done) {
          var $input = $sliderSingle.find('input'), changeFired = false;

          $input.on('change', function() {
            changeFired = true;
          });

          setTimeout(function() {
            expect(changeFired).to.equal(false);
            done();
          }, 200);

          $sliderSingle.data('slider').setValue(20);
        });
      });

      describe('setValue(value, handleNumber)', function() {

        it('should correctly set declared input value of a range input', function() {
          var firstValue = 30, secondValue = 80; // Choose step points, otherwise they would be adjusted

          $sliderRange.data('slider').setValue(firstValue, 0);
          $sliderRange.data('slider').setValue(secondValue, 1);
          expect(parseInt($sliderRange.find('input').eq(0).val(), 10)).to.equal(firstValue);
          expect(parseInt($sliderRange.find('input').eq(1).val(), 10)).to.equal(secondValue);
        });
      });
    });

    describe('accessibility', function() {
      var $sliderAccessibility,
          cached_supportsRangeInput,
          keysNext = [
            38, // up
            39  // right
          ],
          keysPrev = [
            37, // down
            40  // left
          ],
          keyPageUp = 33,
          keyPageDown = 34,
          keyEnd = 35,
          keyHome = 36;
      describe('in browsers that support input[type=range]', function() {
        beforeEach(function() {
          $sliderAccessibility = $("<div>").slider(SLIDER_OPTIONS_MINIMAL).appendTo(document.body);
        });

        afterEach(function() {
          $sliderAccessibility.remove();
          $sliderAccessibility = null;
        });

        it('moves the value to the next step using the native input.stepUp method', function() {
          var prevVal, currVal, step = 10,
            input = $sliderAccessibility.find('input')[0];

          prevVal = input.valueAsNumber;
          input.stepUp();
          currVal = input.valueAsNumber;
          expect(currVal === (prevVal + step)).to.be.true;
        });

        it('moves the value to the previous step using the native input.stepDown method', function() {
          var prevVal, currVal, step = 10,
            input = $sliderAccessibility.find('input')[0];

          prevVal = input.valueAsNumber;
          input.stepDown();
          currVal = input.valueAsNumber;
          expect(currVal === (prevVal - step)).to.be.true;
        });
      });
      describe('in browsers that do not support input[type=range]', function() {
        beforeEach(function() {
          cached_supportsRangeInput = CUI.Slider.prototype._supportsRangeInput;
          CUI.Slider.prototype._supportsRangeInput = false;
          $sliderAccessibility = $("<div>").slider(SLIDER_OPTIONS_MINIMAL).appendTo(document.body);
        });

        afterEach(function() {
          $sliderAccessibility.remove();
          $sliderAccessibility = null;
          CUI.Slider.prototype._supportsRangeInput = cached_supportsRangeInput;
        });

        it('expects the handle to have role=slider', function() {
          var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
          expect($handle.attr('role')).to.equal('slider');
        });

        it('expects the handle to have tabindex=0', function() {
          var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
          expect($handle.attr('tabindex')).to.equal('0');
        });

        describe('expects the handle to have correct', function() {
          it('aria-valuemin', function() {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
            expect(Number($handle.attr('aria-valuemin'))).to.equal(SLIDER_OPTIONS_MINIMAL.min);
          });
          it('aria-valuemax', function() {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
            expect(Number($handle.attr('aria-valuemax'))).to.equal(SLIDER_OPTIONS_MINIMAL.max);
          });
          it('aria-valuestep', function() {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
            expect(Number($handle.attr('aria-valuestep'))).to.equal(SLIDER_OPTIONS_MINIMAL.step);
          });
          it('aria-valuenow', function() {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
            expect(Number($handle.attr('aria-valuenow'))).to.equal(SLIDER_OPTIONS_MINIMAL.value);
          });
          it('aria-valuetext', function() {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle);
            expect(Number($handle.attr('aria-valuetext'))).to.equal(SLIDER_OPTIONS_MINIMAL.value);
          });
        });

        describe('setValue(value)', function() {
          it('should set aria-valuenow and aria-valuetext', function() {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
                value = 20; // Choose step point, otherwise it would be adjusted
            $sliderAccessibility.data('slider').setValue(value);
            expect(Number($handle.attr('aria-valuenow'))).to.equal(value);
          });

          it('should correctly snap aria-valuenow to the nearest step', function() {
            var $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
                setValue = 27, expectedSnap = 30;
            $sliderAccessibility.data('slider').setValue(setValue);
            expect(Number($handle.attr('aria-valuenow'))).to.equal(expectedSnap);
          });
        });

        it('expects the input to have aria-hidden=true', function() {
          var $input = $sliderAccessibility.find('input');
          expect($input.attr('aria-hidden')).to.equal('true');
        });

        it('moves the value to the next step using keys', function() {
          var prevVal, currVal, step = 10, e = $.Event('keydown'),
            $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
            $input = $sliderAccessibility.find('input');

          $.each(keysNext, function(i, keycode) {
            prevVal = parseInt($input.val(), 10);
            e.which = e.keyCode = keycode;
            $handle.trigger(e);
            currVal = parseInt($input.val(), 10);
            expect(currVal === (prevVal + step)).to.be.true;
          });
        });

        it('move the value to the previous step using keys', function() {
          var prevVal, currVal, step = 10,
            e = $.Event('keydown'),
            $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
            $input = $sliderAccessibility.find('input');

          $.each(keysPrev, function(i, keycode) {
            prevVal = parseInt($input.val(), 10);
            e.which = e.keyCode = keycode;
            $handle.trigger(e);
            currVal = parseInt($input.val(), 10);
            expect(currVal === (prevVal - step)).to.be.true;
          });
        });

        it('pages up on "page up" keypress', function() {
          var prevVal, currVal, page = 10,
            e = $.Event('keydown'),
            $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
            $input = $sliderAccessibility.find('input');

          prevVal = parseInt($input.val(), 10);
          e.which = e.keyCode = keyPageUp;
          $handle.trigger(e);
          currVal = parseInt($input.val(), 10);
          expect(currVal === (prevVal + page)).to.be.true;
        });

        it('page down on "page down" keypress', function() {
          var prevVal, currVal, page = 10,
            e = $.Event('keydown'),
            $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
            $input = $sliderAccessibility.find('input');

          prevVal = parseInt($input.val(), 10);
          e.which = e.keyCode = keyPageDown;
          $handle.trigger(e);
          currVal = parseInt($input.val(), 10);
          expect(currVal === (prevVal - page)).to.be.true;
        });

        it('moves to min on "home" keypress', function() {
          var e = $.Event('keydown'),
              $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
              $input = $sliderAccessibility.find('input');

          e.which = e.keyCode = keyHome;
          $handle.trigger(e);
          expect(parseInt($input.val(), 10)).to.equal(SLIDER_OPTIONS_MINIMAL.min);
        });

        it('moves to max on "end" keypress', function() {
          var e = $.Event('keydown'),
              $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
              $input = $sliderAccessibility.find('input');

          e.which = e.keyCode = keyEnd;
          $handle.trigger(e);
          expect(parseInt($input.val(), 10)).to.equal(SLIDER_OPTIONS_MINIMAL.max);
        });

        it('does not precede or exceed min/max limits when moving to prev/next step via keys', function() {
          var min = 0, max = 100,
            e = $.Event('keydown'),
            $handle = $sliderAccessibility.find('.' + TEST_ATTRIBUTES.classes.components.handle),
            $input = $sliderAccessibility.find('input');

          $sliderAccessibility.data('slider').setValue(min);
          e.which = e.keyCode = keysPrev[0];
          $handle.trigger(e);
          expect(parseInt($input.val(), 10)).to.equal(min);

          $sliderAccessibility.data('slider').setValue(max);
          e.which = e.keyCode = keysNext[0];
          $handle.trigger(e);
          expect(parseInt($input.val(), 10)).to.equal(max);
        });
      });
    });
  });

  describe('CUI.LabeledSlider', function() {

    var $sliderLabeled;

    beforeEach(function() {
      $sliderLabeled = $(SLIDER_LABELED.html).labeledSlider().appendTo(document.body);
    });

    afterEach(function() {
      $sliderLabeled.remove();
      $sliderLabeled = null;
    });

    it('should be defined in CUI namespace', function() {
      expect(CUI).to.have.property('LabeledSlider');
    });

    it('should be defined on jQuery object', function() {
      var div = $('<div/>');
      expect(div).to.have.property('labeledSlider');
    });

    it('should be modified as labeled', function() {
      expect($sliderLabeled).to.have.class(TEST_ATTRIBUTES.classes.modifiers.labeled);
    });

    it('should build ticks and tick labels', function() {
      var $ticks = $sliderLabeled.find('.' + TEST_ATTRIBUTES.classes.components.tick),
          $tickLabels = $sliderLabeled.find('.' + TEST_ATTRIBUTES.classes.components.ticklabel);

      expect($ticks.length === $tickLabels.length).to.be.true;
    });

    describe('with class modifier alternatingLabels="true"', function() {

      it('should have an "alternating" property set', function() {
        var $sliderLabeledAlternatingLabels = $(SLIDER_LABELED.html).addClass(TEST_ATTRIBUTES.classes.modifiers.alternatinglabels).labeledSlider().appendTo(document.body);
        expect($sliderLabeledAlternatingLabels.data('labeledSlider').get('alternating')).to.be.true;
        $sliderLabeledAlternatingLabels.remove();
      });
    });
  });

}());
