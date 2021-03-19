/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import '../coral-theme-spectrum';

import '../coral-externals';
import '../coral-compat';

import helpTranslations from './i18n/coral-component-shell-help/translations';
import orgSwitcherTranslations from './i18n/coral-component-shell-orgswitcher/translations';
import {strings, commons} from '../coral-utils';

import Shell from './src/scripts/Shell';
import ShellContent from './src/scripts/ShellContent';

import ShellHeader from './src/scripts/ShellHeader';
import ShellHomeAnchor from './src/scripts/ShellHomeAnchor';
import ShellHomeAnchorLabel from './src/scripts/ShellHomeAnchorLabel';

import ShellHelp from './src/scripts/ShellHelp';
import ShellHelpItem from './src/scripts/ShellHelpItem';
import ShellHelpSeparator from './src/scripts/ShellHelpSeparator';

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
import ShellSelectListSwitcher from './src/scripts/ShellSelectListSwitcher';
import ShellSwitcherList from './src/scripts/ShellSwitcherList';

import ShellOrgSwitcher from './src/scripts/ShellOrgSwitcher';
import ShellOrgSwitcherFooter from './src/scripts/ShellOrgSwitcherFooter';
import ShellOrganization from './src/scripts/ShellOrganization';
import ShellSuborganization from './src/scripts/ShellSuborganization';

import './src/styles/index.css';

// i18n
commons.extend(strings, {
  'coral-component-shell-help': helpTranslations,
  'coral-component-shell-orgswitcher': orgSwitcherTranslations
});

// Expose component on the Coral namespace
commons._define('coral-shell-header', ShellHeader);
commons._define('coral-shell-homeanchor', ShellHomeAnchor, {extends: 'a'});
commons._define('coral-shell-help-item', ShellHelpItem, {extends: 'a'});
commons._define('coral-shell-help', ShellHelp);
commons._define('coral-shell-menubar-item', ShellMenuBarItem);
commons._define('coral-shell-menubar', ShellMenuBar);
commons._define('coral-shell-menu', ShellMenu);
commons._define('coral-shell-user', ShellUser);
commons._define('coral-shell-workspace', ShellWorkspace, {extends: 'a'});
commons._define('coral-shell-workspaces', ShellWorkspaces);
commons._define('coral-shell-solution', ShellSolution, {extends: 'a'});
commons._define('coral-shell-solutions', ShellSolutions);
commons._define('coral-shell-solutionswitcher', ShellSolutionSwitcher);
commons._define('coral-shell-suborganization', ShellSuborganization);
commons._define('coral-shell-organization', ShellOrganization);
commons._define('coral-shell-orgswitcher', ShellOrgSwitcher);
commons._define('coral-shell', Shell);
commons._define('coral-shell-selectlistswitcher', ShellSelectListSwitcher);
commons._define('coral-shell-switcherlist', ShellSwitcherList);

Shell.Content = ShellContent;
Shell.Header = ShellHeader;
Shell.HomeAnchor = ShellHomeAnchor;
Shell.HomeAnchor.Label = ShellHomeAnchorLabel;
Shell.Help = ShellHelp;
Shell.Help.Item = ShellHelpItem;
Shell.Help.Separator = ShellHelpSeparator;
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
Shell.SelectListSwitcher = ShellSelectListSwitcher;
Shell.SwitcherList = ShellSwitcherList;

export {Shell};
