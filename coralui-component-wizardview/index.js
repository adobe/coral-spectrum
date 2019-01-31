import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import WizardView from './src/scripts/WizardView';

// Expose component on the Coral namespace
window.customElements.define('coral-wizardview', WizardView);

export {WizardView};
