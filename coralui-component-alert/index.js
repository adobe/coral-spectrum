import '/coralui-theme-spectrum';
import '/coralui-externals';

import Alert from './src/scripts/Alert';
import AlertHeader from './src/scripts/AlertHeader';
import AlertContent from './src/scripts/AlertContent';
import AlertFooter from './src/scripts/AlertFooter';

// Expose component on the Coral namespace
window.customElements.define('coral-alert', Alert);
window.customElements.define('coral-alert-header', AlertHeader);
window.customElements.define('coral-alert-content', AlertContent);
window.customElements.define('coral-alert-footer', AlertFooter);

Alert.Header = AlertHeader;
Alert.Content = AlertContent;
Alert.Footer = AlertFooter;

export {Alert};
