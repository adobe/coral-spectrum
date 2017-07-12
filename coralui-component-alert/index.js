import 'coralui-externals';
import Alert from './src/scripts/Alert';
import AlertHeader from './src/scripts/AlertHeader';
import AlertContent from './src/scripts/AlertContent';
import AlertFooter from './src/scripts/AlertFooter';

window.customElements.define('coral-alert', Alert);
window.customElements.define('coral-alert-header', AlertHeader);
window.customElements.define('coral-alert-content', AlertContent);
window.customElements.define('coral-alert-footer', AlertFooter);

// Expose Button on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Alert = Alert;
window.Coral.AlertHeader = AlertHeader;
window.Coral.AlertContent = AlertContent;
window.Coral.AlertFooter = AlertFooter;

export default Alert;
