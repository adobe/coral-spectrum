/*! @source http://codegists.com/snippet/javascript/closest-polyfilljs_monochromer_javascript */
(function() {
  //closest polyfill
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(selector) {
      var node = this;
      
      while (node) {
        if (node.matches(selector)) return node;
        else node = node.parentElement;
      }
      return null;
    };
  }
})();
