// Any copyright is dedicated to the Public Domain. http://creativecommons.org/publicdomain/zero/1.0/
// Source https://developer.mozilla.org/en/docs/Web/API/Element/matches
(function () {
  if (!Element.prototype.matches) {
    Element.prototype.matches = Element.prototype.msMatchesSelector;
  }
})();
