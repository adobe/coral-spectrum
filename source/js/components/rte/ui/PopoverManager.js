/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2013 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

(function($) {

    CUI.rte.ui.cui.PopoverManager = new Class({

        toString: "ToolbarImpl",

        $container: null,

        $popover: null,

        $popoverTrigger: null,

        triggerToElements: null,

        tbType: null,


        construct: function($container, tbType) {
            this.$popover = null;
            this.$popoverTrigger = null;
            this.$container = $container;
            this.triggerToElements = [ ];
            this.tbType = tbType;
        },

        /**
         * Calculates the height of the "arrow" of a popup.
         * @return {Number} The height of the "arrow"
         * @private
         */
        getArrowHeight: function() {
            var $p = this.$popover;
            if (!$p) {
                return 0;
            }
            // arrow height calculation taken from CUI.Popover
            return Math.round(($p.outerWidth() - $p.width()) / 1.5);
        },

        /**
         * Sets the position of the popover and its arrow.
         * @param {{top:Number}, {left:Number}, {arrow:String}} pos The popover position;
         *        valid values for arrow: bottom, top
         */
        setPosition: function(pos) {
            if (this.$popover) {
                this.$popover.removeClass("arrow-bottom  arrow-top");
                this.$popover.addClass("arrow-" + pos["arrow"]);
                this.$popover.offset(pos);
            }
        },

        /**
         * Calculates the height of the current popover.
         * @return {{height: Number, arrowHeight: Number}} The total height height and the
         *         height of the "arrow" of the popover; both values are 0 if no popover is
         *         currently shown
         */
        calc: function() {
            var $p = this.$popover;
            if (!$p) {
                return {
                    "height": 0,
                    "arrowHeight": 0
                };
            }
            // arrow height calculation taken from CUI.Popover
            var arrowHeight = this.getArrowHeight();
            return {
                "height": $p.outerHeight() + arrowHeight,
                "arrowHeight": arrowHeight
            };
        },

        addTriggerToElement: function($trigger, $element) {
            var trigger = $trigger[0];
            var element = $element[0];
            var triggerElements = this.getElementsForTrigger($trigger);
            if (!triggerElements) {
                triggerElements = {
                    "trigger": trigger,
                    "elements": [ ]
                };
                this.triggerToElements.push(triggerElements);
            }
            var elements = triggerElements.elements;
            if (!CUI.rte.Common.arrayContains(elements, element)) {
                elements.push(element);
            }
        },

        getElementsForTrigger: function($trigger) {
            var trigger = $trigger[0];
            var triggerCnt = this.triggerToElements.length;
            for (var t = 0; t < triggerCnt; t++) {
                if (this.triggerToElements[t].trigger === trigger) {
                    return this.triggerToElements[t];
                }
            }
            return undefined;
        },

        getTriggerForElement: function($element) {
            var element = $element[0];
            var triggerCnt = this.triggerToElements.length;
            for (var t = 0; t < triggerCnt; t++) {
                var triggerElements = this.triggerToElements[t];
                var elements = triggerElements.elements;
                var elementCnt = elements.length;
                for (var e = 0; e < elementCnt; e++) {
                    if (elements[e] === element) {
                        return $(triggerElements.trigger);
                    }
                }
            }
            return undefined;
        },

        isShown: function() {
            return !!this.$popover;
        },

        isTriggeredBy: function($trigger) {
            return this.$popoverTrigger && ($trigger[0] === this.$popoverTrigger[0]);
        },

        use: function(ref, $trigger, $toolbar) {
            this.$popoverTrigger = $trigger;
            this.$popoverTrigger.addClass("triggered");
            if (ref.jquery) {
                this.$popover = ref;
            } else {
                this.$popover = CUI.rte.UIUtils.getPopover(ref, this.tbType,
                        this.$container);
            }
            if (this.$popover.length) {
                // calculate & set "arrow" position, using a temporary styleheet to override
                // :before pseudo class
                var triggerOffs = $trigger.offset();
                var toolbarOffs = $toolbar.offset();
                var triggerDX = triggerOffs.left - toolbarOffs.left;
                var arrowSize = this.getArrowHeight();
                var arrowOffs = Math.round(($trigger.width() / 2) + triggerDX - arrowSize) +
                        2;
                this._popoverStyleSheet = CUI.rte.UIUtils.addStyleSheet({
                    ".name": ".temp-arrow-position:before",
                    "left": arrowOffs + "px !important"
                });
                this.$popover.addClass("temp-arrow-position");
                // must be shown before calculating positions, as jQuery will miscalculate
                // position:absolute otherwise
                this.$popover.popover().show();
            } else {
                this.$popover = null;
            }
        },

        hide: function() {
            if (this.$popoverTrigger) {
                this.$popoverTrigger.removeClass("triggered");
                this.$popoverTrigger = null;
            }
            var mustHide = !!this.$popover;
            if (mustHide) {
                this.$popover.removeClass("temp-arrow-position");
                CUI.rte.UIUtils.removeStyleSheet(this._popoverStyleSheet);
                this._popoverStyleSheet = null;
                this.$popover.popover().hide();
                this.$popover = null;
            }
            return mustHide;
        }

    });

})(window.jQuery);