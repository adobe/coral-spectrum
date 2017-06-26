import Wait from './src/scripts/Wait';

window.customElements.define('coral-wait', Wait);

// Expose Wait on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Wait = Wait;

export default Wait;
