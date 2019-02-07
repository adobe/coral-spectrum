import '../coral-theme-spectrum';
import './src/styles/index.css';

import '../coral-externals';
import '../coral-compat';

import Progress from './src/scripts/Progress';
import ProgressLabel from './src/scripts/ProgressLabel';

// Expose component on the Coral namespace
window.customElements.define('coral-progress', Progress);
window.customElements.define('coral-progress-label', ProgressLabel);

Progress.Label = ProgressLabel;

export {Progress};
