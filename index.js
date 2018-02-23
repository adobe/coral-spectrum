import {Accordion, AccordionItem, AccordionItemContent, AccordionItemLabel} from '/coralui-component-accordion';
import {ActionBar, ActionBarItem, ActionBarPrimary, ActionBarSecondary, ActionBarContainer} from '/coralui-component-actionbar';
import {Alert, AlertHeader, AlertContent, AlertFooter} from '/coralui-component-alert';
import {AnchorButton, AnchorButtonLabel} from '/coralui-component-anchorbutton';
import {Autocomplete, AutocompleteItem} from '/coralui-component-autocomplete';
import {Button, ButtonLabel} from '/coralui-component-button';
import {ButtonGroup} from '/coralui-component-buttongroup';
import {Calendar} from '/coralui-component-calendar';
import {Card, CardBanner, CardBannerHeader, CardBannerContent, CardProperty, CardTitle, CardSubtitle, CardContext, CardDescription, CardAsset, CardContent, CardOverlay, CardPropertyContent, CardPropertyList} from '/coralui-component-card';
import {CharacterCount} from '/coralui-component-charactercount';
import {Checkbox, CheckboxLabel} from '/coralui-component-checkbox';
import {Clock} from '/coralui-component-clock';
import {Color, ColorInput, ColorInputItem, ColorInputSwatches, ColorInputSwatch, ColorInputSlider, ColorInputColorProperties} from '/coralui-component-colorinput';
import {ColumnView, ColumnViewColumn, ColumnViewColumnContent, ColumnViewItem, ColumnViewItemContent, ColumnViewItemThumbnail, ColumnViewPreview, ColumnViewPreviewAsset, ColumnViewPreviewContent, ColumnViewPreviewLabel, ColumnViewPreviewSeparator, ColumnViewPreviewValue} from '/coralui-component-columnview';
import {CycleButton, CycleButtonItem, CycleButtonAction} from '/coralui-component-cyclebutton';
import {Datepicker} from '/coralui-component-datepicker';
import {Dialog, DialogHeader, DialogContent, DialogFooter} from '/coralui-component-dialog';
import {DragAction} from '/coralui-dragaction';
import {Drawer, DrawerContent} from '/coralui-component-drawer';
import {FileUpload, FileUploadItem} from '/coralui-component-fileupload';
import {Icon} from '/coralui-component-icon';
import {List, ListItem, ListItemContent, ListDivider, AnchorList, AnchorListItem, ButtonList, ButtonListItem, SelectList, SelectListGroup, SelectListItem, SelectListItemContent} from '/coralui-component-list';
import {Masonry, MasonryItem, MasonryLayout} from '/coralui-component-masonry';
import {Multifield, MultifieldItem, MultifieldItemContent} from '/coralui-component-multifield';
import {NumberInput} from '/coralui-component-numberinput';
import {Overlay} from '/coralui-component-overlay';
import {Panel, PanelStack, PanelContent} from '/coralui-component-panelstack';
import {Popover, PopoverHeader, PopoverContent, PopoverFooter, PopoverSeparator} from '/coralui-component-popover';
import {Progress, ProgressLabel} from '/coralui-component-progress';
import {QuickActions, QuickActionsItem} from '/coralui-component-quickactions';
import {Radio, RadioLabel} from '/coralui-component-radio';
import {Shell, ShellContent, ShellHeader, ShellHomeAnchor, ShellHomeAnchorLabel, ShellHelp, ShellHelpItem, ShellMenu, ShellMenuBar, ShellMenuBarItem, ShellUser, ShellUserContent, ShellUserFooter, ShellUserHeading, ShellUserName, ShellUserSubheading, ShellWorkspaces, ShellWorkspace, ShellSolutionSwitcher, ShellSolutions, ShellSolutionsHeader, ShellSolution, ShellSolutionLabel, ShellOrgSwitcher, ShellOrganization, ShellSuborganization, ShellOrgSwitcherFooter} from '/coralui-component-shell';
import {Select, SelectItem} from '/coralui-component-select';
import {Search} from '/coralui-component-search';
import {Slider, SliderItem, SliderContent, RangedSlider} from '/coralui-component-slider';
import {StepList, Step, StepLabel} from '/coralui-component-steplist';
import {Switch, SwitchLabel} from '/coralui-component-switch';
import {Table, TableColumn, TableCell, TableHeaderCell, TableRow, TableHead, TableBody, TableFoot} from '/coralui-component-table';
import {Tab, TabLabel, TabList} from '/coralui-component-tablist';
import {TabView} from '/coralui-component-tabview';
import {Tag, TagLabel, TagList} from '/coralui-component-taglist';
import {Textarea} from '/coralui-component-textarea';
import {Textfield} from '/coralui-component-textfield';
import {Tooltip, TooltipContent} from '/coralui-component-tooltip';
import {Tree, TreeItem, TreeItemContent} from '/coralui-component-tree';
import {Wait} from '/coralui-component-wait';
import {WizardView} from '/coralui-component-wizardview';

// For Coral3 custom elements registration support
import '/coralui-compat';

export {
  Accordion,
  AccordionItem,
  AccordionItemContent,
  AccordionItemLabel,
  ActionBar,
  ActionBarItem,
  ActionBarPrimary,
  ActionBarSecondary,
  ActionBarContainer,
  Alert,
  AlertHeader,
  AlertContent,
  AlertFooter,
  AnchorButton,
  AnchorButtonLabel,
  AnchorList,
  AnchorListItem,
  Autocomplete,
  AutocompleteItem,
  Button,
  ButtonLabel,
  ButtonGroup,
  ButtonList,
  ButtonListItem,
  Calendar,
  Card,
  CardBanner,
  CardBannerHeader,
  CardBannerContent,
  CardProperty,
  CardTitle,
  CardSubtitle,
  CardContext,
  CardDescription,
  CardAsset,
  CardContent,
  CardOverlay,
  CardPropertyContent,
  CardPropertyList,
  CharacterCount,
  Checkbox,
  CheckboxLabel,
  Clock,
  Color,
  ColorInput,
  ColorInputItem,
  ColorInputSwatches,
  ColorInputSwatch,
  ColorInputSlider,
  ColorInputColorProperties,
  ColumnView,
  ColumnViewColumn,
  ColumnViewColumnContent,
  ColumnViewItem,
  ColumnViewItemContent,
  ColumnViewItemThumbnail,
  ColumnViewPreview,
  ColumnViewPreviewAsset,
  ColumnViewPreviewContent,
  ColumnViewPreviewLabel,
  ColumnViewPreviewSeparator,
  ColumnViewPreviewValue,
  CycleButton,
  CycleButtonItem,
  CycleButtonAction,
  Datepicker,
  Dialog,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DragAction,
  Drawer,
  DrawerContent,
  FileUpload,
  FileUploadItem,
  Icon,
  List,
  ListItem,
  ListItemContent,
  ListDivider,
  Masonry,
  MasonryItem,
  MasonryLayout,
  Multifield,
  MultifieldItem,
  MultifieldItemContent,
  NumberInput,
  Overlay,
  Panel,
  PanelStack,
  PanelContent,
  Popover,
  PopoverHeader,
  PopoverContent,
  PopoverFooter,
  PopoverSeparator,
  Progress,
  ProgressLabel,
  QuickActions,
  QuickActionsItem,
  Radio,
  RadioLabel,
  Search,
  Select,
  SelectItem,
  SelectList,
  SelectListGroup,
  SelectListItem,
  SelectListItemContent,
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
  ShellUserSubheading,
  ShellWorkspaces,
  ShellWorkspace,
  ShellSolutionSwitcher,
  ShellSolutions,
  ShellSolutionsHeader,
  ShellSolution,
  ShellSolutionLabel,
  ShellOrgSwitcher,
  ShellOrganization,
  ShellSuborganization,
  ShellOrgSwitcherFooter,
  Slider,
  SliderContent,
  SliderItem,
  RangedSlider,
  StepList,
  Step,
  StepLabel,
  Switch,
  SwitchLabel,
  Table,
  TableColumn,
  TableCell,
  TableHeaderCell,
  TableRow,
  TableHead,
  TableBody,
  TableFoot,
  Tab,
  TabLabel,
  TabList,
  TabView,
  Tag,
  TagLabel,
  TagList,
  Textarea,
  Textfield,
  Tooltip,
  TooltipContent,
  Tree,
  TreeItem,
  TreeItemContent,
  Wait,
  WizardView
}
