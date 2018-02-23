import '/coralui-externals';

import CycleButton from './src/scripts/CycleButton';
import CycleButtonItem from './src/scripts/CycleButtonItem';
import CycleButtonAction from './src/scripts/CycleButtonAction';

window.customElements.define('coral-cyclebutton', CycleButton);
window.customElements.define('coral-cyclebutton-item', CycleButtonItem);
window.customElements.define('coral-cyclebutton-action', CycleButtonAction);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.CycleButton = CycleButton;
window.Coral.CycleButton.Item = CycleButtonItem;
window.Coral.CycleButton.Action = CycleButtonAction;

export {CycleButton, CycleButtonItem, CycleButtonAction};
