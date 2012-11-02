/*
 * Fingerpointer jQuery plugin
 * version 1.1
 * author: Damien Antipa
 * http://github.com/dantipa/jquery.fingerpointer
 */
(function ($, window, undefined) {
    var isTouch = 'ontouchstart' in window;

    $.fn.finger = function () {
        if (isTouch) {
            this.on.apply(this, arguments);
        }
        return this;
    };

    $.fn.pointer = function () {
        if (!isTouch) {
            this.on.apply(this, arguments);
        }
        return this;
    };

    $.fn.fipo = function () {
        var args = Array.prototype.slice.call(arguments, 1, arguments.length);

        this.pointer.apply(this, args);

        args[0] = arguments[0];
        this.finger.apply(this, args);

        return this;
    };
}(jQuery, this));