import '/coralui-externals';
import StepList from './src/scripts/StepList';
import Step from './src/scripts/Step';
import StepLabel from './src/scripts/StepLabel';

window.customElements.define('coral-steplist', StepList);
window.customElements.define('coral-step', Step);
window.customElements.define('coral-step-label', StepLabel);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.StepList = StepList;
window.Coral.Step = Step;
window.Coral.Step.Label = StepLabel;

export {StepList, Step, StepLabel};
