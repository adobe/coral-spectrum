import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import StepList from './src/scripts/StepList';
import Step from './src/scripts/Step';
import StepLabel from './src/scripts/StepLabel';

// Expose component on the Coral namespace
window.customElements.define('coral-steplist', StepList);
window.customElements.define('coral-step', Step);
window.customElements.define('coral-step-label', StepLabel);

Step.Label = StepLabel;

export {StepList, Step};
