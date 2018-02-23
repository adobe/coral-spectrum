import '/coralui-externals';
import WizardView from './src/scripts/WizardView';

window.customElements.define('coral-wizardview', WizardView);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.WizardView = WizardView;

export {WizardView};
