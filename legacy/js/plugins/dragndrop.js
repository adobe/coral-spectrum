(function ($, window, undefined) {


    // events: dragstart, drag, dragenter, dragleave, dragover, drop, dragend, 
    var $doc = $(document),
        isEnabled = 'ontouchstart' in window, // right now I'm testing if touch events are available. I'd prefer a more reliable test with real feature detection
        DataTransfer = function (event) {
            var storage = {},
                $body = $('body'),
                ghost = {
                    setPos: function (x, y) {
                        return ghost.dom.css({
                            position: 'absolute',
                            top: y - ghost.offset.y,
                            left: x - ghost.offset.x
                        });
                    },
                    show: function () {
                        ghost.dom.show();
                    },
                    hide: function () {
                        ghost.dom.hide();
                    },
                    create: function (img, x, y) {
                        ghost.dom = $(img);
                        ghost.offset = {
                            x: x || 0,
                            y: y || 0
                        };
                        ghost.setPos(event.pageX, event.pageY).appendTo($body); 
                    },
                    destroy: function () {
                        ghost.dom.remove();
                    }
                };

            return {
                _ghost: ghost,
                setDragImage: ghost.create,
                setData: function () {

                }
            }
        };

    function getDOMElement(pos) {
        return document.elementFromPoint(pos.clientX , pos.clientY);
    }

    function getPosition(event) {
        var e = event.originalEvent || event,
            ev = e.changedTouches || 
            e.touches || 
            e;

        ev = ev[0] || ev;

        return {
            pageX: ev.pageX,
            pageY: ev.pageY,
            clientX: ev.clientX,
            clientY: ev.clientY,
            screenX: ev.screenX,
            screenY: ev.screenY
        };
    }

    function handleDragStart (event) {
        var target = event.target,
            $target = $(target),
            dataTransfer = DataTransfer(event),
            lastHoverElem,
            handleTouchMove = function (event) {
                var pos = getPosition(event),
                    hoverElem,
                    $hoverElem;

                // DataTransfer
                pos.dataTransfer = dataTransfer;

                dataTransfer._ghost.hide();
                hoverElem = getDOMElement(pos);
                $hoverElem = $(hoverElem);
                dataTransfer._ghost.show();
                
                $target.trigger($.Event('drag', pos));
                
                if (hoverElem !== lastHoverElem) { // new element entered
                    // send to the old one that we left it
                    if (lastHoverElem) {
                        $(lastHoverElem).trigger($.Event('dragleave', pos));    
                    }

                    // tell the new one that we entered its space
                    $hoverElem.trigger($.Event('dragenter', pos));
                } else { // still on the same element
                    $hoverElem.trigger($.Event('dragover', pos));
                }

                lastHoverElem = hoverElem;

                dataTransfer._ghost.setPos(pos.pageX, pos.pageY);

                $target.trigger($.Event('drag', pos));
            };
        
        $doc.on('touchmove', handleTouchMove);

        $target.one('touchend touchcancel', function (event) {
            var pos = getPosition(event),
                hoverElem;

            dataTransfer._ghost.hide();
            hoverElem = getDOMElement(pos);
            dataTransfer._ghost.show();

            $doc.off('touchmove', handleTouchMove);   

            $(hoverElem).trigger($.Event('drop'));
            $target.trigger($.Event('dragend'));

            dataTransfer._ghost.destroy();
        });

        event.type = 'dragstart';
        event.attachGhost = $.event.fixHooks.dragstart.attachGhost;
        event.dataTransfer = dataTransfer;
        event = $.extend(event, getPosition(event));

        return event.handleObj.handler.apply(this, arguments);
    }

    if (isEnabled) {
        $.event.special.dragstart = {
            delegateType: 'taphold',
            bindType: 'taphold',
            handle: handleDragStart
        };
    }

}(jQuery, this));