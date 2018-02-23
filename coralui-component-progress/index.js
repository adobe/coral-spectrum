import '/coralui-externals';
import Progress from './src/scripts/Progress';
import ProgressLabel from './src/scripts/ProgressLabel';

window.customElements.define('coral-progress', Progress);
window.customElements.define('coral-progress-label', ProgressLabel);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Progress = Progress;
window.Coral.Progress.Label = ProgressLabel;

export {Progress, ProgressLabel};
