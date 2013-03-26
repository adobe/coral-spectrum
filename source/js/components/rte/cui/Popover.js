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

CUI.rte.ui.cui.Popover = new Class({

    toString: "ToolbarImpl",

    $container: null,

    $popover: null,

    $popoverTrigger: null,


    construct: function($container) {
        this.$popover = null;
        this.$popoverTrigger = null;
        this.$container = $container;
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

    isShown: function() {
        return !!this.$popover;
    },

    isTriggeredBy: function($trigger) {
        return this.$popoverTrigger && ($trigger[0] === this.$popoverTrigger[0]);
    },

    use: function(ref, $trigger, $toolbar) {
        this.$popoverTrigger = $trigger;
        this.$popoverTrigger.addClass("triggered");
        this.$popoverTrigger.removeClass("white");
        this.$popoverTrigger.addClass("black");
        this.$popover = CUI.rte.UIUtils.getPopover(ref, undefined, this.$container);
        if (this.$popover.length) {
            // calculate & set "arrow" position, using a temporary styleheet to override
            // :before pseudo class
            var triggerOffs = $trigger.offset();
            var toolbarOffs = $toolbar.offset();
            var triggerDX = triggerOffs.left - toolbarOffs.left;
            var arrowSize = this.getArrowHeight();
            var arrowOffs = Math.round(($trigger.width() / 2) + triggerDX - arrowSize) + 2;
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
            this.$popoverTrigger.addClass("white");
            this.$popoverTrigger.removeClass("black");
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