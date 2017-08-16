import 'coralui-externals';
import helpTranslations from './i18n/Coral.Shell.Help/translations.json';
import {strings, commons} from 'coralui-util';
// i18n
commons.extend(strings, {
  'coralui-component-shell-help': helpTranslations
});

import Shell from './src/scripts/Shell';
import ShellContent from './src/scripts/ShellContent';

import ShellHeader from './src/scripts/ShellHeader';
import ShellHomeAnchor from './src/scripts/ShellHomeAnchor';
import ShellHomeAnchorLabel from './src/scripts/ShellHomeAnchorLabel';

import ShellHelp from './src/scripts/ShellHelp';
import ShellHelpItem from './src/scripts/ShellHelpItem';

import ShellMenu from './src/scripts/ShellMenu';
import ShellMenuBar from './src/scripts/ShellMenuBar';
import ShellMenuBarItem from './src/scripts/ShellMenuBarItem';

import ShellUser from './src/scripts/ShellUser';
import ShellUserContent from './src/scripts/ShellUserContent';
import ShellUserFooter from './src/scripts/ShellUserFooter';
import ShellUserHeading from './src/scripts/ShellUserHeading';
import ShellUserName from './src/scripts/ShellUserName';
import ShellUserSubheading from './src/scripts/ShellUserSubheading';

window.customElements.define('coral-shell', Shell);

window.customElements.define('coral-shell-header', ShellHeader);
window.customElements.define('coral-shell-homeanchor', ShellHomeAnchor, {extends: 'a'});

window.customElements.define('coral-shell-help', ShellHelp);
window.customElements.define('coral-shell-help-item', ShellHelpItem, {extends: 'a'});

window.customElements.define('coral-shell-menu', ShellMenu);
window.customElements.define('coral-shell-menubar', ShellMenuBar);
window.customElements.define('coral-shell-menubar-item', ShellMenuBarItem);

window.customElements.define('coral-shell-user', ShellUser);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Shell = Shell;
window.Coral.Shell.Content = ShellContent;

window.Coral.Shell.Header = ShellHeader;
window.Coral.Shell.HomeAnchor = ShellHomeAnchor;
window.Coral.Shell.HomeAnchor.Label = ShellHomeAnchorLabel;

window.Coral.Shell.Help = ShellHelp;
window.Coral.Shell.Help.Item = ShellHelpItem;

window.Coral.Shell.Menu = ShellMenu;
window.Coral.Shell.MenuBar = ShellMenuBar;
window.Coral.Shell.MenuBar.Item = ShellMenuBarItem;

window.Coral.Shell.User = ShellUser;
window.Coral.Shell.User.Content = ShellUserContent;
window.Coral.Shell.User.Footer = ShellUserFooter;
window.Coral.Shell.User.Heading = ShellUserHeading;
window.Coral.Shell.User.Name = ShellUserName;
window.Coral.Shell.User.Subheading = ShellUserSubheading;

export {
  Shell,
  ShellContent,
  ShellHeader,
  ShellHomeAnchor,
  ShellHomeAnchorLabel,
  ShellHelp,
  ShellHelpItem,
  ShellMenu,
  ShellMenuBar,
  ShellMenuBarItem,
  ShellUser,
  ShellUserContent,
  ShellUserFooter,
  ShellUserHeading,
  ShellUserName,
  ShellUserSubheading
};
