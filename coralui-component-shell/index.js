import 'coralui-externals';
import Shell from './src/scripts/Shell';
import ShellContent from './src/scripts/ShellContent';
import ShellHeader from './src/scripts/ShellHeader';
import ShellHomeAnchor from './src/scripts/ShellHomeAnchor';
import ShellHomeAnchorLabel from './src/scripts/ShellHomeAnchorLabel';

window.customElements.define('coral-shell', Shell);
window.customElements.define('coral-shell-header', ShellHeader);
window.customElements.define('coral-shell-homeanchor', ShellHomeAnchor, {extends: 'a'});

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Shell = Shell;
window.Coral.Shell.Content = ShellContent;

window.Coral.Shell.Header = ShellHeader;
window.Coral.Shell.HomeAnchor = ShellHomeAnchor;
window.Coral.Shell.HomeAnchor.Label = ShellHomeAnchorLabel;

export {
  Shell,
  ShellContent,
  ShellHeader,
  ShellHomeAnchor,
  ShellHomeAnchorLabel
};
