import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import CycleButton from './src/scripts/CycleButton';
import CycleButtonItem from './src/scripts/CycleButtonItem';
import CycleButtonAction from './src/scripts/CycleButtonAction';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-cyclebutton', CycleButton);
window.customElements.define('coral-cyclebutton-item', CycleButtonItem);
window.customElements.define('coral-cyclebutton-action', CycleButtonAction);

CycleButton.Item = CycleButtonItem;
CycleButton.Action = CycleButtonAction;

export {CycleButton};
