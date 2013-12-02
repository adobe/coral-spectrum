// Patch for jQueryUI's Position utility. Please remove this patch once the fix makes its way into an official
// jQueryUI release.
// Bug logged against jQueryUI: http://bugs.jqueryui.com/ticket/8710
// Pull request logged against jQueryUI: https://github.com/jquery/jquery-ui/pull/1071
// Bug logged against CoralUI for removal of this patch: https://issues.adobe.com/browse/CUI-1046
(function ($) {
  var abs = Math.abs;
  $.ui.position.flip.top = function (position, data) {
    var within = data.within,
      withinOffset = within.offset.top + within.scrollTop,
      outerHeight = within.height,
      offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
      collisionPosTop = position.top - data.collisionPosition.marginTop,
      overTop = collisionPosTop - offsetTop,
      overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
      top = data.my[ 1 ] === "top",
      myOffset = top ?
        -data.elemHeight :
        data.my[ 1 ] === "bottom" ?
          data.elemHeight :
          0,
      atOffset = data.at[ 1 ] === "top" ?
        data.targetHeight :
        data.at[ 1 ] === "bottom" ?
          -data.targetHeight :
          0,
      offset = -2 * data.offset[ 1 ],
      newOverTop,
      newOverBottom;
    if (overTop < 0) {
      newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
      // Patched code:
      if (newOverBottom < 0 || newOverBottom < abs(overTop)) {
        position.top += myOffset + atOffset + offset;
      }
    }
    else if (overBottom > 0) {
      newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
      // Patched code:
      if (newOverTop > 0 || abs(newOverTop) < overBottom) {
        position.top += myOffset + atOffset + offset;
      }
    }
  };
})(jQuery);