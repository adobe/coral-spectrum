import '/coralui-externals';
import helpTranslations from './i18n/coralui-component-shell-help/translations.json';
import orgSwitcherTranslations from './i18n/coralui-component-shell-orgswitcher/translations.json';
import {strings, commons} from '/coralui-util';
// i18n
commons.extend(strings, {
  'coralui-component-shell-help': helpTranslations,
  'coralui-component-shell-orgswitcher': orgSwitcherTranslations
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

import ShellWorkspaces from './src/scripts/ShellWorkspaces';
import ShellWorkspace from './src/scripts/ShellWorkspace';

import ShellSolutionSwitcher from './src/scripts/ShellSolutionSwitcher';
import ShellSolutions from './src/scripts/ShellSolutions';
import ShellSolutionsHeader from './src/scripts/ShellSolutionsHeader';
import ShellSolution from './src/scripts/ShellSolution';
import ShellSolutionLabel from './src/scripts/ShellSolutionLabel';

import ShellOrgSwitcher from './src/scripts/ShellOrgSwitcher';
import ShellOrgSwitcherFooter from './src/scripts/ShellOrgSwitcherFooter';
import ShellOrganization from './src/scripts/ShellOrganization';
import ShellSuborganization from './src/scripts/ShellSuborganization';

// Expose component on the Coral namespace
window.customElements.define('coral-shell', Shell);
window.customElements.define('coral-shell-header', ShellHeader);
window.customElements.define('coral-shell-homeanchor', ShellHomeAnchor, {extends: 'a'});
window.customElements.define('coral-shell-help', ShellHelp);
window.customElements.define('coral-shell-help-item', ShellHelpItem, {extends: 'a'});
window.customElements.define('coral-shell-menu', ShellMenu);
window.customElements.define('coral-shell-menubar', ShellMenuBar);
window.customElements.define('coral-shell-menubar-item', ShellMenuBarItem);
window.customElements.define('coral-shell-user', ShellUser);
window.customElements.define('coral-shell-workspaces', ShellWorkspaces);
window.customElements.define('coral-shell-workspace', ShellWorkspace, {extends: 'a'});
window.customElements.define('coral-shell-solutionswitcher', ShellSolutionSwitcher);
window.customElements.define('coral-shell-solutions', ShellSolutions);
window.customElements.define('coral-shell-solution', ShellSolution, {extends: 'a'});
window.customElements.define('coral-shell-orgswitcher', ShellOrgSwitcher);
window.customElements.define('coral-shell-organization', ShellOrganization);
window.customElements.define('coral-shell-suborganization', ShellSuborganization);

Shell.Content = ShellContent;
Shell.Header = ShellHeader;
Shell.HomeAnchor = ShellHomeAnchor;
Shell.HomeAnchor.Label = ShellHomeAnchorLabel;
Shell.Help = ShellHelp;
Shell.Help.Item = ShellHelpItem;
Shell.Menu = ShellMenu;
Shell.MenuBar = ShellMenuBar;
Shell.MenuBar.Item = ShellMenuBarItem;
Shell.User = ShellUser;
Shell.User.Content = ShellUserContent;
Shell.User.Footer = ShellUserFooter;
Shell.User.Heading = ShellUserHeading;
Shell.User.Name = ShellUserName;
Shell.User.Subheading = ShellUserSubheading;
Shell.Workspaces = ShellWorkspaces;
Shell.Workspace = ShellWorkspace;
Shell.SolutionSwitcher = ShellSolutionSwitcher;
Shell.Solutions = ShellSolutions;
Shell.Solutions.Header = ShellSolutionsHeader;
Shell.Solution = ShellSolution;
Shell.Solution.Label = ShellSolutionLabel;
Shell.OrgSwitcher = ShellOrgSwitcher;
Shell.OrgSwitcher.Footer = ShellOrgSwitcherFooter;
Shell.Organization = ShellOrganization;
Shell.Suborganization = ShellSuborganization;

export {Shell};
