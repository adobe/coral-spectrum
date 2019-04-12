import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import WizardView from './src/scripts/WizardView';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-wizardview', WizardView);

export {WizardView};
