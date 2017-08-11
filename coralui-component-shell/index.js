import 'coralui-externals';
import Shell from './src/scripts/Shell';
import ShellHeader from './src/scripts/ShellHeader';
import ShellHomeAnchor from './src/scripts/ShellHomeAnchor';

window.customElements.define('coral-shell', Shell);
window.customElements.define('coral-shell-header', ShellHeader);
window.customElements.define('coral-shell-homeanchor', ShellHomeAnchor, {extends: 'a'});

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Shell = Shell;
window.Coral.Shell.Content = function() {
  return document.createElement('coral-shell-content');
};

window.Coral.Shell.Header = ShellHeader;
window.Coral.Shell.HomeAnchor = ShellHomeAnchor;
window.Coral.Shell.HomeAnchor.Label = function() {
  return document.createElement('coral-shell-homeanchor-label');
};

export {
  Shell,
  ShellHeader,
  ShellHomeAnchor
};
