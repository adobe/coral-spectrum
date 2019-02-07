/*! @source https://github.com/valor-software/ng2-charts/issues/88 */
(function() {
  if (!('remove' in Element.prototype)) {
    Element.prototype.remove = function() {
      if (this.parentNode) {
        this.parentNode.removeChild(this);
      }
    };
  }
})();
