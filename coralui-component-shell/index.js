import 'coralui-externals';
import Shell from './src/scripts/Shell';

window.customElements.define('coral-shell', Shell);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Shell = Shell;
window.Coral.Shell.Content = function() {
  return document.createElement('coral-shell-content');
};

export {
  Shell
};
