//todo We force the polyfill but ideally we should not load it if not required
if (window.customElements) {
  window.customElements.forcePolyfill = true;
}
