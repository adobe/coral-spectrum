/*************************************************************************
*
* ADOBE CONFIDENTIAL
* ___________________
*
*  Copyright 2012 Adobe Systems Incorporated
*  All Rights Reserved.
*
* NOTICE:  All information contained herein is, and remains
* the property of Adobe Systems Incorporated and its suppliers,
* if any.  The intellectual and technical concepts contained
* herein are proprietary to Adobe Systems Incorporated and its
* suppliers and are protected by trade secret or copyright law.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Adobe Systems Incorporated.
**************************************************************************/

/**
 * @class CUI.rte.plugins.TablePlugin
 * @extends CUI.rte.plugins.Plugin
 * <p>This class implements table functionality as a plugin.</p>
 * <p>The plugin ID is "<b>table</b>".</p>
 * <p><b>Features</b></p>
 * <ul>
 *   <li><b>table</b> - adds a button/context menu entry for creating new tables and editing
 *     the properties of existing tables</li>
 *   <li><b>removetable</b> - adds a context menu entry for removing a table</li>
 *   <li><b>insertrow</b> - adds a context menu entry for inserting a table row</li>
 *   <li><b>removerow</b> - adds a context menu entry for removing an existing table row
 *     </li>
 *   <li><b>insertcolumn</b> - adds a context menu entry for inserting a table column</li>
 *   <li><b>removecolumn</b> - adds a context menu entry for removing a table column</li>
 *   <li><b>cellprops</b> - adds a context menu entry for editing cell properties</li>
 *   <li><b>mergecells</b> - adds a context menu entry for merging selected cells (added in
 *     5.3)</li>
 *   <li><b>splitcell</b> - adds a context menu entry for splitting an existing cell (added
 *     in 5.3)</li>
 *   <li><b>selectrow</b> - adds a context menu entry for selecting an entire row (added in
 *     5.3)</li>
 *   <li><b>selectcolumn</b> - adds a context menu entry for selecting an entire column
 *     (added in 5.3)</li>
 * </ul>
 */
CUI.rte.plugins.TablePlugin = new Class({

    toString: "TablePlugin",

    extend: CUI.rte.plugins.Plugin,

    /**
     * @cfg {String} editMode
     * <p>Specifies the edit mode the RichText component is running (defaults to "default").
     * "table" represents the table mode which is used to allow editing a single table
     * only.<p>
     * <p>In table mode, the following restrictions apply:</p>
     * <ul>
     *   <li>The user can not enter text outside the table boundaries.</li>
     *   <li>The "Create table" context menu item is not available.</li>
     *   <li>The "Remove table" context menu item is not available.</li>
     * </ul>
     * <p>Note that there might be additional differences on the plugin-level; for
     * example the "table" plugin will add several icons to the toolbar in table mode,
     * which won't appear in default mode. Also note that in table mode, the "table" plugin
     * is automatically enabled with all features if you don't specify a specific
     * configuration for the table plugin (see {@link #rtePlugins}).</p>
     * @since 5.3
     */

    /**
     * @cfg {Object} defaultValues
     * <p>The default values for for newly created tables. May have the following
     * properties:</p>
     * <ul>
     *   <li><code>columns</code> : String<br>
     *     The initial number of columns of the table</li>
     *   <li><code>rows</code> : String<br>
     *     The initial number of rows of the table</li>
     *   <li><code>header</code> : String<br>
     *     Defines if the table should contain headers; valid values are: "none" for no
     *     headers, "top" for creating header cells for the first row, "left" for
     *     creating header cells for the first column, "topleft" for creating header
     *     cells for the first row and the first column</li>
     *   <li><code>width</code> : String (optional)<br>
     *     The initial table width</li>
     *   <li><code>height</code> : String (optional)<br>
     *     The initial table height</li>
     *   <li><code>cellspacing</code> : String (optional)<br>
     *     The initial cell spacing value of the table</li>
     *   <li><code>cellpadding</code> : String (optional)<br>
     *     The initial cell padding value of the table</li>
     *   <li><code>border</code> : String (optional)<br>
     *     The initial border value of the table</li>
     *   <li><code>tableTemplate</code> : String<br>
     *     A HTML template for creating the table</li>
     * </ul>
     * <p>Note that all properties should be provided as Strings.</p>
     * <p>Notes on using templates for creating a new table:</p>
     * <ul>
     *   <li>If you are specifying a table template (using the tableTemplate property), all
     *     other table properties are ignored. Templates take precedence over all other
     *     properties.</li>
     *   <li>The template must contain plain HTML code only. Currently no placeholders are
     *     supported.</li>
     * </ul>
     * <p>Defaults to: { "cellspacing": "0", "cellpadding": "1", "border": "1", "columns":
     * "3", "rows": "2", "header": "none", "tableTemplate": null }</p>
     * @since 5.3
     */

    /**
     * @cfg {Object/Object[]} tableStyles
     * <p>Defines CSS classes that are available to the user for styling a table. There are
     * two ways of specifying each table style:</p>
     * <ol>
     *   <li>Providing tableStyles as an Object: Use the CSS class name as property name.
     *   Specify the text that should appear in the style selector as property value
     *   (String).</li>
     *   <li>Providing tableStyles as an Object[]: Each element has to provide "cssName"
     *   (the CSS class name) and "text" (the text that appears in the style selector)
     *   properties.</li>
     * </ol>
     * <p>Styling is applied by adding a corresponding "class" attribute to the table
     * element appropriately.</p>
     * <p>Defaults to null.</p>
     * @since 5.3
     */

    /**
     * @cfg {Object} tablePropConfig
     * <p>This object configures the table properties dialog. It consists of the following
     * properties:</p>
     * <ul>
     *   <li><code>tableStyles</code> : Object<br>
     *     Object that defines the styles that are available for styling a table. This was
     *     the way of defining table styles for CQ 5.2. This is deprecated now; use
     *     {@link #tableStyles} as of CQ 5.3.</li>
     *   <li><code>defaultValues</code> : Object<br>
     *     Object that defines the default values for newly created tables. This was the
     *     way of defining default values for CQ 5.2. This is deprecated now; use
     *     {@link #defaultValues} as of CQ 5.3.</li>
     * </ul>
     * <p>Defaults to null (as of CQ 5.3) or (CQ 5.2):
<pre>
{
    "tableStyles": null,
    "defaultValues": {
        "cellspacing": "0",
        "cellpadding": "1",
        "border": "1",
        "columns": "3",
        "rows": "2",
        "header": "none"
    }
}
</pre>
     */

    /**
     * @cfg {Object|Object[]} cellStyles
     * <p>Defines CSS classes that are available to the user for styling a table cell. There
     * are two ways of specifying the CSS classes:</p>
     * <ol>
     *   <li>Providing cellStyles as an Object: Use the CSS class name as property name.
     *   Specify the text that should appear in the style selector as property value
     *   (String).</li>
     *   <li>Providing cellStyles as an Object[]: Each element has to provide "cssName" (the
     *   CSS class name) and "text" (the text that appears in the style selector)
     *   properties.</li>
     * </ol>
     * <p>Defaults to null</p>
     * @since 5.3
     */

    /**
     * @cfg {Object} cellPropConfig
     * <p>This object configures the cell properties dialog. It consists of the following
     * properties:</p>
     * <ul>
     *   <li><code>cellStyles</code> : Object<br>
     *     Object that defines the styles that are available for styling a table cell. This
     *     was the way of defining cell styles for CQ 5.2. This is deprecated now; use
     *     {@link #cellStyles} as of CQ 5.3.</li>
     *     </li>
     * </ul>
     * <p>Defaults to null (as of CQ 5.3) resp. { "cellStyles": null } (CQ 5.2)</p>
     */

    /**
     * @private
     */
    tableUI: null,

    /**
     * @private
     */
    insertRowBeforeUI: null,

    /**
     * @private
     */
    insertRowAfterUI: null,

    /**
     * @private
     */
    removeRowUI: null,

    /**
     * @private
     */
    insertColBeforeUI: null,

    /**
     * @private
     */
    insertColAfterUI: null,

    /**
     * @private
     */
    removeColUI: null,

    /**
     * @private
     */
    tableSelection: null,

    _init: function(editorKernel) {
        this.inherited(arguments);
        editorKernel.addPluginListener("mousedown", this.clearSelectionHandler, this,
                this, false);
        editorKernel.addPluginListener("mouseup", this.addSelectionHandler, this,
                this, false);
        editorKernel.addPluginListener("keydown", this.handleSelectionOnKey, this,
                this, false);
        editorKernel.addPluginListener("commandexecuted", this.clearSelectionHandler, this,
                this, false);
        editorKernel.addPluginListener("beforekeydown", this.handleTableKeys, this,
                this, false, 250);
    },

    isTableMode: function() {
        return (this.config.editMode == CUI.rte.plugins.TablePlugin.EDITMODE_TABLE);
    },

    handleTableKeys: function(e) {
        if (e.cancelKey) {
            return;
        }
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var context = e.editContext;
        var selection;

        // IE allows selections outside a table in table edit mode; ignore keystrokes there
        // if necessary
        if (this.isTableMode()) {
            if (com.ua.isIE) {
                selection = this.editorKernel.createQualifiedSelection(context);
                if (!selection || com.isRootNode(context, selection.startNode)) {
                    var cells = com.getChildNodesByType(context.root, [ "th", "td" ], true,
                            "table");
                    if (cells.length > 0) {
                        var cellToSelect;
                        if (selection && (selection.startOffset == 0)) {
                            cellToSelect = cells[0];
                        } else {
                            cellToSelect = cells[cells.length - 1];
                        }
                        sel.selectNode(context, cellToSelect, true);
                    }
                    e.cancelKey = true;
                }
            }
        }
        // handle Tab key
        if (e.isTab() && !e.cancelKey) {
            // handle Tab in Tables differently (jump to next cell, or insert a new row
            // at the end of the table)
            if (!selection) {
                selection = this.editorKernel.createQualifiedSelection(context);
            }
            if (!sel.isSelection(selection)) {
                this.editorKernel.execCmd("addundostep");
                var tableCell = CUI.rte.commands.Table.getCellFromSelection(
                        context, selection);
                if (tableCell) {
                    var nextCell;
                    var row = tableCell.parentNode;
                    cells = com.getChildNodesByType(row, com.TABLE_CELLS, false);
                    var cellIndex = com.arrayIndex(cells, tableCell) + 1;
                    if (cellIndex < cells.length) {
                        nextCell = cells[cellIndex];
                    } else {
                        var rowParent = row.parentNode;
                        var rows = com.getChildNodesByType(rowParent, "tr", false);
                        var rowIndex = com.arrayIndex(rows, row) + 1;
                        if (rowIndex < rows.length) {
                            row = rows[rowIndex];
                            cells = com.getChildNodesByType(row, com.TABLE_CELLS, false);
                            nextCell = cells[0];
                        }
                    }
                    if (nextCell == null) {
                        this.editorKernel.relayCmd("insertrow", {
                            "position": "after",
                            "caret": "firstCell"
                        });
                    }
                    if (nextCell != null) {
                        var preferredScrollOffset = (com.ua.isIE ? null
                                : sel.getPreferredScrollOffset(context));
                        sel.selectNode(context, nextCell, true);
                        if (com.ua.isGecko && context.iFrame) {
                            sel.ensureCaretVisibility(context, context.iFrame,
                                    preferredScrollOffset);
                        }
                    }
                    e.cancelKey = true;
                }
            }
        }
    },

    handleSelectionOnKey: function(e) {
        if (this.tableSelection) {
            if (e.isBackSpace() || e.isDelete()) {
                this.clearSelectionContent(e.editContext);
            }
        }
        this.clearSelectionHandler(e);
    },

    /**
     * @private
     */
    addSelectionHandler: function(e) {
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var cancelEvent = false;
        var addToSelection = (e.getType() == "mouseup") && (e.getButton() == 0)
                && e.isCtrl();
        if (addToSelection && (com.ua.isIE || com.ua.isWebKit)) {
            var context = e.editContext;
            var pSelection = sel.createProcessingSelection(context);
            var cell = CUI.rte.commands.Table.getCellFromSelection(context, pSelection);
            if (cell) {
                if (cell) {
                    this.addCellToSelection(cell);
                    e.preventDefault();
                }
                cancelEvent = true;
            }
        }
        return cancelEvent;
    },

    /**
     * @private
     */
    clearSelectionHandler: function(e) {
        var com = CUI.rte.Common;
        var context = e.editContext;
        var type = e.getType();
        var addToSelection = (type == "mousedown") && (e.getButton() == 0)
                && e.isCtrl();
        if (this.tableSelection) {
            var removeSelection = false;
            if (type == "keydown") {
                var key = e.getKey();
                if (key >= 32) {
                    // additionaly filter Cmd key on Mac - otherwise the selection would
                    // get removed if the user releases Cmd and presses it again to add
                    // further cells to the selection
                    if (!com.ua.isMac || (key != 91)) {
                        removeSelection = true;
                    }
                }
            } else if (type == "mousedown") {
                removeSelection = !addToSelection && (e.getButton() != 2);
            } else if (type == "commandexecuted") {
                switch (e.cmd) {
                    case "removetable":
                        this.tableSelection = null;
                        break;
                    case "addundostep":
                    case "clearredohistory":
                        break;
                    default:
                        removeSelection = true;
                        break;
                }
            }
            if (removeSelection) {
                this.removeTableSelection();
            }
        }
        if (type == "commandexecuted") {
            if (com.ua.isGecko) {
                var flushSelection = false;
                // this should be sufficient to detect table selections in an easy way
                var selection = e.editContext.win.getSelection();
                if (selection.rangeCount > 1) {
                    flushSelection = true;
                } else if (selection.rangeCount == 1) {
                    var rangeToCheck = selection.getRangeAt(0);
                    var parentDom = rangeToCheck.commonAncestorContainer;
                    if (parentDom && (com.getTagInPath(context, parentDom, "table"))) {
                        flushSelection = true;
                    }
                }
                if (flushSelection) {
                    CUI.rte.Selection.flushSelection(e.editContext, true);
                }
            }
        }
    },

    /**
     * @private
     */
    addTableSelection: function(selectionDef) {
        var com = CUI.rte.Common;
        if (this.tableSelection) {
            this.removeTableSelection();
        }
        var cellCnt = selectionDef.length;
        for (var c = 0; c < cellCnt; c++) {
            var cell = selectionDef[c];
            com.addClass(cell, CUI.rte.Theme.TABLESELECTION_CLASS);
        }
        this.tableSelection = selectionDef;
    },

    /**
     * @private
     */
    addCellToSelection: function(cellToAdd) {
        var com = CUI.rte.Common;
        if (!this.tableSelection) {
            this.tableSelection = [ ];
        }
        com.addClass(cellToAdd, CUI.rte.Theme.TABLESELECTION_CLASS);
        this.tableSelection.push(cellToAdd);
    },

    /**
     * @private
     */
    removeTableSelection: function() {
        var com = CUI.rte.Common;
        var cellCnt = this.tableSelection.length;
        for (var c = 0; c < cellCnt; c++) {
            var cell = this.tableSelection[c];
            com.removeClass(cell, CUI.rte.Theme.TABLESELECTION_CLASS);
        }
        this.tableSelection = null;
    },

    /**
     * @private
     */
    clearSelectionContent: function(context) {
        var dpr = CUI.rte.DomProcessor;
        var cellCnt = this.tableSelection.length;
        for (var c = 0; c < cellCnt; c++) {
            var cell = this.tableSelection[c];
            var nodeCnt = cell.childNodes.length;
            for (var n = nodeCnt - 1; n >= 0; n--) {
                cell.removeChild(cell.childNodes[0]);
            }
            var placeholder = dpr.createEmptyLinePlaceholder(context, false);
            if (placeholder) {
                cell.appendChild();
            }
        }
    },

    /**
     * @private
     */
    createOrEditTable: function(options, enforceNewTable) {
        var context = options.editContext;
        this.savedRange = options.savedRange;
        this.editorKernel.selectQualifiedRangeBookmark(context, this.savedRange);
        var table = this.editorKernel.queryState("table");
        var propConfig;
        var tableTemplate = null;
        if (table && !enforceNewTable) {
            // change properties
            propConfig = {
                "editContext": context,
                "cmd": "modifytable",
                "table": table
            };
        } else {
            // create new table
            tableTemplate = CUI.rte.Compatibility.getConfigValue(this.config,
                    "defaultValues.tableTemplate");
            if (!tableTemplate) {
                propConfig = {
                    "cmd": "createtable",
                    "table": null
                };
            }
        }
        var editorKernel = this.editorKernel;
        if (!tableTemplate && propConfig) {
            propConfig.listeners = {
                "show": function() {
                    editorKernel.fireUIEvent("dialogshow");
                },
                "hide": function() {
                    editorKernel.fireUIEvent("dialoghide");
                }
            };
        }
        if (tableTemplate) {
            // create new table directly through template
            this.editorKernel.selectQualifiedRangeBookmark(context, this.savedRange);
            this.editorKernel.relayCmd("createtable", {
                "html": tableTemplate
            });
        } else {
            // display table properties dialog
            propConfig.editContext = context;
            propConfig.pluginConfig = this.config;
            propConfig.execFn = CUI.rte.Utils.scope(this.execCreateOrEditTable, this);
            var dm = this.editorKernel.getDialogManager();
            var dialog = dm.create(CUI.rte.ui.DialogManager.DLG_TABLEPROPS, propConfig);
            dm.show(dialog);
        }
    },

    /**
     * @private
     */
    execCreateOrEditTable: function(cmd, tableConfig, context) {
        this.editorKernel.selectQualifiedRangeBookmark(context, this.savedRange);
        if (cmd && tableConfig) {
            this.editorKernel.relayCmd(cmd, tableConfig);
        }
    },

    /**
     * @private
     */
    editCellProps: function(options) {
        var context = options.editContext;
        this.savedRange = options.savedRange;
        this.editorKernel.selectQualifiedRangeBookmark(context, this.savedRange);
        var cell;
        if (options && options.selectionContext) {
            // should not use queryState("modifycell") for context menu invoking, as IE's
            // selection handling is way too buggy to get/set a valid range/selection at
            // this point, so prefer selection if provided on plugin call
            var selectionContext = options.selectionContext;
            cell = CUI.rte.commands.Table.getCellFromNodeList(context,
                    selectionContext.nodeList);
        } else {
            // it is safe to use queryState for toolbar-invoked plugin calls
            cell = this.editorKernel.queryState("modifycell");
        }
        if (!cell) {
            return;
        }
        var cfg = {
            "editContext": context,
            "pluginConfig": this.config,
            "cell": cell,
            "execFn": CUI.rte.Utils.scope(this.execEditCellProps, this)
        };
        var dm = this.editorKernel.getDialogManager();
        var dialog = dm.create(CUI.rte.ui.DialogManager.DLG_CELLPROPS, cfg);
        dm.show(dialog);
    },

    /**
     * @private
     */
    execEditCellProps: function(cellConfig, context) {
        this.editorKernel.selectQualifiedRangeBookmark(context, this.savedRange);
        if (cellConfig) {
            this.editorKernel.relayCmd("modifyCell", cellConfig);
        }
    },

    /**
     * @private
     */
    selectRow: function(def) {
        var tableMatrix = def.tableMatrix;
        var cell = def.cell;
        var cellDef = tableMatrix.getCellDef(cell);
        var row = tableMatrix.getRow(cellDef.row);
        var cells = [ ];
        for (var c = 0; c < row.length; c++) {
            cells[c] = row[c].cellDom;
        }
        this.addTableSelection(cells);
    },

    /**
     * @private
     */
    selectColumn: function(def) {
        var tableMatrix = def.tableMatrix;
        var cell = def.cell;
        var cellDef = tableMatrix.getCellDef(cell);
        var column = tableMatrix.getColumn(cellDef.col);
        var cells = [ ];
        for (var c = 0; c < column.length; c++) {
            cells[c] = column[c].cellDom;
        }
        this.addTableSelection(cells);
    },

    /**
     * @private
     */
    getFeatures: function() {
        // must be overridden by implementing plugins
        return [
            "table", "removetable", "insertrow", "removerow", "insertcolumn",
            "removecolumn", "cellprops", "mergecells", "splitcell",
            "selectrow", "selectcolumn"
        ];
    },

    reportStyles: function() {
        var compat = CUI.rte.Compatibility;
        var styles = [ ];
        var tableStyles = this.config.tableStyles;
        if (tableStyles != null) {
            tableStyles = compat.convertToArray(tableStyles, "cssName", "text");
            compat.changeDeprecatedPropertyName(tableStyles, "className", "cssName");
            styles.push({
                "type": "table",
                "styles": tableStyles
            });
        }
        var cellStyles = this.config.cellStyles;
        if (cellStyles != null) {
            cellStyles = compat.convertToArray(cellStyles, "cssName", "text");
            compat.changeDeprecatedPropertyName(cellStyles, "className", "cssName");
            styles.push({
                "type": "cell",
                "styles": cellStyles
            });
        }
        return (styles.length > 0 ? styles : null);
    },

    notifyPluginConfig: function(pluginConfig) {
        pluginConfig = pluginConfig || { };
        CUI.rte.Utils.applyDefaults(pluginConfig, {
            "tableStyles": null,
            "cellStyles": null,
            "defaultValues": {
                "cellspacing": "0",
                "cellpadding": "1",
                "border": "1",
                "columns": "3",
                "rows": "2",
                "header": "none"
            },
            "tablePropConfig": {
                "basicDefs": true,
                "basicStyling": true
            },
            "cellPropConfig": {
                "basicDefs": true
            },
            "tooltips": {
                "table": {
                    "title": CUI.rte.Utils.i18n("Table"),
                    "text": CUI.rte.Utils.i18n("Creates a new table or edits the properties of an existing table.")
                },
                "cellprops": {
                    "title": CUI.rte.Utils.i18n("Cell"),
                    "text": CUI.rte.Utils.i18n("Edit the properties of a selected cell.")
                },
                "insertrow-before": {
                    "title": CUI.rte.Utils.i18n("Insert Above"),
                    "text": CUI.rte.Utils.i18n("Insert a new row above the current row.")
                },
                "insertrow-after": {
                    "title": CUI.rte.Utils.i18n("Insert Below"),
                    "text": CUI.rte.Utils.i18n("Insert a new row below the current row.")
                },
                "removerow":  {
                    "title": CUI.rte.Utils.i18n("Delete Row"),
                    "text": CUI.rte.Utils.i18n("Delete the current row.")
                },
                "insertcolumn-before": {
                    "title": CUI.rte.Utils.i18n("Insert Left"),
                    "text": CUI.rte.Utils.i18n("Insert a new column to the left of the current column.")
                },
                "insertcolumn-after": {
                    "title": CUI.rte.Utils.i18n("Insert Right"),
                    "text": CUI.rte.Utils.i18n("Insert a new column to the right of the current column.")
                },
                "removecolumn":  {
                    "title": CUI.rte.Utils.i18n("Delete Column"),
                    "text": CUI.rte.Utils.i18n("Delete the current column.")
                }
            }
        });
        this.config = pluginConfig;
    },

    /**
     * @private
     */
    initializeUI: function(tbGenerator) {
        var plg = CUI.rte.plugins;
        var ui = CUI.rte.ui;
        // todo use correct tooltips for table mode buttons
        if (!this.isTableMode()) {
            if (this.isFeatureEnabled("table")) {
                this.tableUI = tbGenerator.createElement("table", this, false,
                        this.getTooltip("table"));
                tbGenerator.addElement("table", plg.Plugin.SORT_TABLE, this.tableUI, 10);
            }
        } else {
            // use a more detailed toolbar in table mode
            if (this.isFeatureEnabled("table")) {
                this.tableUI = tbGenerator.createElement("table", this, false,
                        this.getTooltip("table"), "x-edit-table-properties");
                tbGenerator.addElement("table", plg.Plugin.SORT_TABLE_TABLEMODE,
                        this.tableUI, 10);
            }
            if (this.isFeatureEnabled("cellprops")) {
                this.cellPropsUI = tbGenerator.createElement("cellprops", this, false,
                        this.getTooltip("cellprops"));
                tbGenerator.addElement("table", plg.Plugin.SORT_TABLE_TABLEMODE,
                        this.cellPropsUI, 20);
            }
            if (this.isFeatureEnabled("insertrow")) {
                this.insertRowBeforeUI = tbGenerator.createElement("insertrow-before", this,
                        false, this.getTooltip("insertrow-before"), null, {
                            "cmd": "insertrow",
                            "cmdValue": "before"
                        });
                tbGenerator.addElement("table.row", plg.Plugin.SORT_TABLE_TABLEMODE + 1,
                        this.insertRowBeforeUI, 10);
                this.insertRowAfterUI = tbGenerator.createElement("insertrow-after", this,
                        false, this.getTooltip("insertrow-after"), null, {
                            "cmd": "insertrow",
                            "cmdValue": "after"
                        });
                tbGenerator.addElement("table.row", plg.Plugin.SORT_TABLE_TABLEMODE + 1,
                        this.insertRowAfterUI, 20);
            }
            if (this.isFeatureEnabled("removerow")) {
                this.removeRowUI = tbGenerator.createElement("removerow", this, false,
                    this.getTooltip("removerow"));
                tbGenerator.addElement("table.row", plg.Plugin.SORT_TABLE_TABLEMODE + 1,
                        this.removeRowUI, 30);
            }
            if (this.isFeatureEnabled("insertcolumn")) {
                this.insertColBeforeUI = tbGenerator.createElement("insertcolumn-before",
                        this, false, this.getTooltip("insertcolumn-before"), null, {
                            "cmd": "insertcolumn",
                            "cmdValue": "before"
                        });
                tbGenerator.addElement("table.col", plg.Plugin.SORT_TABLE_TABLEMODE + 2,
                        this.insertColBeforeUI, 10);
                this.insertColAfterUI = tbGenerator.createElement("insertcolumn-after",
                        this, false, this.getTooltip("insertcolumn-after"), null, {
                            "cmd": "insertcolumn",
                            "cmdValue": "after"
                        });
                tbGenerator.addElement("table.col", plg.Plugin.SORT_TABLE_TABLEMODE + 2,
                        this.insertColAfterUI, 20);
            }
            if (this.isFeatureEnabled("removecolumn")) {
                this.removeColUI = tbGenerator.createElement("removecolumn", this, false,
                        this.getTooltip("removecolumn"));
                tbGenerator.addElement("table.col", plg.Plugin.SORT_TABLE_TABLEMODE + 2,
                        this.removeColUI, 30);
            }
        }
    },

    /**
     * @private
     */
    execute: function(cmdId, value, options) {
        var context = options.editContext;
        if (!options.savedRange) {
            options.savedRange = this.editorKernel.createQualifiedRangeBookmark(context);
        }
        var cmd = cmdId;
        var sepPos = cmdId.indexOf(".", cmdId);
        if (sepPos > 0) {
            cmd = cmdId.substring(0, sepPos);
            value = cmdId.substring(sepPos + 1, cmdId.length);
        }
        if (cmd == "table") {
            this.createOrEditTable(options, false);
        } else if (cmd == "createtable") {
            this.createOrEditTable(options, true);
        } else if (cmd == "cellprops") {
            this.editCellProps(options);
        } else if (cmd == "selectrow") {
            this.selectRow(value);
            this.editorKernel.deferFocus();
        } else if (cmd == "selectcolumn") {
            this.selectColumn(value);
            this.editorKernel.deferFocus();
        } else {
            this.editorKernel.relayCmd(cmd, value);
        }
    },

    /**
     * @private
     */
    updateState: function(selDef) {
        if (this.isTableMode()) {
            var context = selDef.editContext;
            var com = CUI.rte.Common;
            var nodeList = selDef.nodeList;
            var singleCell = CUI.rte.commands.Table.getCellFromNodeList(context,
                    nodeList);
            var isSingleCell = (singleCell != null);
            var tableDom = com.getTagInPath(context, nodeList.commonAncestor, "table");
            if (tableDom) {
                var tableMatrix = new CUI.rte.TableMatrix();
                tableMatrix.createTableMatrix(tableDom);
                var size = tableMatrix.getTableSize();
                this.removeRowUI.setDisabled((size.rows == 1) || !isSingleCell);
                this.removeColUI.setDisabled((size.cols == 1) || !isSingleCell);
                this.insertColBeforeUI.setDisabled(!isSingleCell);
                this.insertColAfterUI.setDisabled(!isSingleCell);
                this.insertRowBeforeUI.setDisabled(!isSingleCell);
                this.insertRowAfterUI.setDisabled(!isSingleCell);
            }
        }
    },

    /**
     * @private
     */
    handleContextMenu: function(menuBuilder, selDef, context) {
        var isTableMode = this.isTableMode();
        var com = CUI.rte.Common;
        var nodeList = selDef.nodeList;
        var selection = selDef.selection;
        var singleCell = CUI.rte.commands.Table.getCellFromNodeList(context, nodeList);
        var isSingleCell = (singleCell != null);
        var tableDom = com.getTagInPath(context, nodeList.commonAncestor, "table");
        var isTable = isSingleCell || (tableDom != null);
        var cellSel = null;
        var tableMatrix;
        var canRemoveCol = true;
        var canRemoveRow = true;
        if (isTable) {
            tableMatrix = new CUI.rte.TableMatrix();
            tableMatrix.createTableMatrix(tableDom);
            if (isTableMode) {
                var size = tableMatrix.getTableSize();
                canRemoveCol = (size.cols > 1);
                canRemoveRow = (size.rows > 1);
            }
        }
        if (isTable && !isSingleCell) {
            if (selection.cellSelection) {
                cellSel = tableMatrix.createSelection(selection.cellSelection.cells);
            }
        }
        var cellSubItems = [ ];
        if (isSingleCell) {
            if (this.isFeatureEnabled("cellprops")) {
                cellSubItems.push({
                    "text": CUI.rte.Utils.i18n("Cell properties"),
                    "plugin": this,
                    "cmd": "cellprops",
                    "iconCls": "rte-cellprops"
                });
            }
        }
        if (cellSel != null) {
            if (this.isFeatureEnabled("mergecells")) {
                if (cellSel.selectionProps.isRect) {
                    cellSubItems.push({
                        "text": CUI.rte.Utils.i18n("Merge cells"),
                        "plugin": this,
                        "cmd": "mergecells",
                        "cmdValue": cellSel,
                        "iconCls": "rte-cellmerge"
                    });
                }
            }
        } else if (isSingleCell) {
            if (this.isFeatureEnabled("mergecells")) {
                var cellInfo = tableMatrix.getCellInfo(singleCell);
                if (!cellInfo.isLastCol) {
                    cellSel = tableMatrix.createSelection(singleCell);
                    cellSel.expand(1, 0);
                    cellSubItems.push({
                        "text": CUI.rte.Utils.i18n("Merge right"),
                        "plugin": this,
                        "cmd": "mergecells",
                        "cmdValue": cellSel,
                        "iconCls": "rte-cellmerge"
                    });
                }
                if (!cellInfo.isLastRow) {
                    cellSel = tableMatrix.createSelection(singleCell);
                    cellSel.expand(0, 1);
                    cellSubItems.push({
                        "text": CUI.rte.Utils.i18n("Merge down"),
                        "plugin": this,
                        "cmd": "mergecells",
                        "cmdValue": cellSel,
                        "iconCls": "rte-cellmerge"
                    });
                }
            }
        }
        if (isSingleCell) {
            if (this.isFeatureEnabled("splitcell")) {
                cellSubItems.push({
                    "text": CUI.rte.Utils.i18n("Split cell horizontally"),
                    "plugin": this,
                    "cmd": "splitcell",
                    "cmdValue": "horizontal",
                    "iconCls": "rte-cellsplit-horizontal"
                });
                cellSubItems.push({
                    "text": CUI.rte.Utils.i18n("Split cell vertically"),
                    "plugin": this,
                    "cmd": "splitcell",
                    "cmdValue": "vertical",
                    "iconCls": "rte-cellsplit-vertical"
                });
            }
        }
        if (cellSubItems.length > 0) {
            menuBuilder.addItem(menuBuilder.createItem({
                "text": CUI.rte.Utils.i18n("Cell"),
                "subItems": cellSubItems,
                "iconCls": "rte-cell"
            }));
        }

        if (isSingleCell) {
            var colSubItems = [ ];
            if (this.isFeatureEnabled("insertcolumn")) {
                colSubItems.push({
                    "text": CUI.rte.Utils.i18n("Insert before"),
                    "plugin": this,
                    "cmd": "insertcolumn",
                    "cmdValue": "before",
                    "iconCls": "rte-insertcolumn-before"
                });
                colSubItems.push({
                    "text": CUI.rte.Utils.i18n("Insert after"),
                    "plugin": this,
                    "cmd": "insertcolumn",
                    "cmdValue": "after",
                    "iconCls": "rte-insertcolumn-after"
                });
            }
            if (this.isFeatureEnabled("removecolumn") && canRemoveCol) {
                colSubItems.push({
                    "text": CUI.rte.Utils.i18n("Remove"),
                    "plugin": this,
                    "cmd": "removecolumn",
                    "iconCls": "rte-removecolumn"
                });
            }
            if (colSubItems.length > 0) {
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Column"),
                    "subItems": colSubItems,
                    "iconCls": "rte-column"
                }));
            }
        }
        if (isSingleCell) {
            var rowSubItems = [ ];
            if (this.isFeatureEnabled("insertrow")) {
                rowSubItems.push({
                    "text": CUI.rte.Utils.i18n("Insert before"),
                    "plugin": this,
                    "cmd": "insertrow",
                    "cmdValue": "before",
                    "iconCls": "rte-insertrow-before"
                });
                rowSubItems.push({
                    "text": CUI.rte.Utils.i18n("Insert after"),
                    "plugin": this,
                    "cmd": "insertrow",
                    "cmdValue": "after",
                    "iconCls": "rte-insertrow-after"
                });
            }
            if (this.isFeatureEnabled("removerow") && canRemoveRow) {
                rowSubItems.push({
                    "text": CUI.rte.Utils.i18n("Remove"),
                    "plugin": this,
                    "cmd": "removerow",
                    "iconCls": "rte-removerow"
                });
            }
            if (rowSubItems.length > 0) {
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Row"),
                    "subItems": rowSubItems,
                    "iconCls": "rte-row"
                }));
            }
            if (this.isFeatureEnabled("table")) {
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Table properties"),
                    "plugin": this,
                    "cmd": "table",
                    "iconCls": "rte-tableprops"
                }));
            }
            if (this.isFeatureEnabled("removetable") && !isTableMode) {
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Remove table"),
                    "plugin": this,
                    "cmd": "removetable",
                    "iconCls": "rte-removetable"
                }));
            }
            if (this.isFeatureEnabled("table")) {
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Create nested table"),
                    "plugin": this,
                    "cmd": "createtable",
                    "iconCls": "rte-createtable"
                }));
            }
            var hasSeparator = false;
            if (this.isFeatureEnabled("selectrow") && isSingleCell) {
                if (!hasSeparator) {
                    menuBuilder.addItem(menuBuilder.createSeparator());
                    hasSeparator = true;
                }
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Select entire row"),
                    "plugin": this,
                    "cmd": "selectrow",
                    "cmdValue": {
                        "tableMatrix": tableMatrix,
                        "cell": singleCell
                    }
                }));
            }
            if (this.isFeatureEnabled("selectcolumn") && isSingleCell) {
                if (!hasSeparator) {
                    menuBuilder.addItem(menuBuilder.createSeparator());
                    hasSeparator = true;
                }
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Select entire column"),
                    "plugin": this,
                    "cmd": "selectcolumn",
                    "cmdValue": {
                        "tableMatrix": tableMatrix,
                        "cell": singleCell
                    }
                }));
            }
            if (!isTableMode) {
                var pNode = tableDom.parentNode;
                if (com.isRootNode(context, pNode)) {
                    var tableIndex = com.getChildIndex(tableDom);
                    if ((tableIndex == 0)
                            || com.isTag(pNode.childNodes[tableIndex - 1], "table")) {
                        menuBuilder.addItem(menuBuilder.createItem({
                            "text": CUI.rte.Utils.i18n("Insert paragraph before table"),
                            "plugin": this,
                            "cmd": "ensureparagraph",
                            "cmdValue": "before"
                        }));
                    }
                    if ((tableIndex == (pNode.childNodes.length - 1))
                            || com.isTag(pNode.childNodes[tableIndex + 1], "table")) {
                        menuBuilder.addItem(menuBuilder.createItem({
                            "text": CUI.rte.Utils.i18n("Insert paragraph after table"),
                            "plugin": this,
                            "cmd": "ensureparagraph",
                            "cmdValue": "after"
                        }));
                    }
                }
            }
        }
        var isObject = (selection.startNode.nodeType == 1) && !selection.endNode
                && (selection.startOffset == null);
        if (!isTable && !isObject) {
            if (this.isFeatureEnabled("table") && !isTableMode) {
                menuBuilder.addItem(menuBuilder.createItem({
                    "text": CUI.rte.Utils.i18n("Create table"),
                    "plugin": this,
                    "cmd": "table",
                    "iconCls": "rte-createtable"
                }));
            }
        }
    },

    /**
     * @private
     */
    manipulateSelection: function(selectionDef) {
        if (this.tableSelection) {
            selectionDef.cellSelection = {
                "cells": this.tableSelection,
                "otherContent": false
            };
        }
    },

    /**
     * @private
     */
    saveRangeBookmark: function(rangeBookmark) {
        if (this.tableSelection) {
            rangeBookmark.cells = this.tableSelection;
        }
    },

    /**
     * @private
     */
    restoreRangeBookmark: function(rangeBookmark) {
        if (rangeBookmark.cells) {
            this.addTableSelection(rangeBookmark.cells);
        }
    },

    /**
     * Creates HTML for a new table according to the plugin's configuration.
     * @private
     */
    createEmptyTableHTML: function() {
        var tableInit = this.config.defaultValues || { };
        if (tableInit.tableTemplate) {
            return tableInit.tableTemplate;
        }

        var colCnt = tableInit.columns || 1;
        var rowCnt = tableInit.rows || 1;
        var tableHtml = "<table";
        for (var attrib in tableInit) {
            if (tableInit.hasOwnProperty(attrib)) {
                var prefixPos = attrib.indexOf(":");
                var hasInvalidPrefix = false;
                if (prefixPos >= 0) {
                    var prefix = attrib.substring(0, prefixPos);
                    hasInvalidPrefix = (prefix == "jcr");
                }
                if ((attrib != "columns") && (attrib != "rows") && (attrib != "header")
                        && !hasInvalidPrefix) {
                    tableHtml += " " + attrib + "=\""
                            + CUI.rte.Utils.htmlEncode(tableInit[attrib]) + "\"";
                }
            }
        }
        tableHtml += ">";
        for (var r = 0; r < rowCnt; r++) {
            tableHtml += "<tr>";
            for (var c = 0; c < colCnt; c++) {
                tableHtml += CUI.rte.TableMatrix.createEmptyCellMarkup();
            }
            tableHtml += "</tr>";
        }
        tableHtml += "</table>";
        return tableHtml;
    },

    interceptContent: function(contentType, defs) {
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        if (!this.isTableMode()) {
            return null;
        }
        var context = (defs ? defs.editContext : null);
        if (contentType == "emptyContent") {
            return this.createEmptyTableHTML();
        } else if (contentType == "postprocessDom") {
            CUI.rte.DomProcessor.removeNonTableBlocks(context);
        } else if (contentType == "cleanDom") {
            if (this.tableSelection) {
                this.removeTableSelection();
            }
            var body = defs.root;
            var table = CUI.rte.Query.select("table:first", body);
            if (table && (table.length == 1)) {
                var isEmpty = true;
                table = table[0];
                var cells = com.getChildNodesByType(table, [ "td", "th" ], true);
                for (var c = 0; c < cells.length; c++) {
                    var cellToCheck = cells[c];
                    if (cellToCheck.childNodes.length > 0) {
                        if (!dpr.isEmptyLinePlaceholder(cellToCheck)) {
                            isEmpty = false;
                            break;
                        }
                    }
                }
                if (isEmpty) {
                    table.parentNode.removeChild(table);
                }
            }
        }
        return null;
    }

});


/**
 * Constant that defines "default editing mode" (i.e. word processing)
 * @static
 * @final
 * @type String
 */
CUI.rte.plugins.TablePlugin.EDITMODE_DEFAULT = "default";

/**
 * Constant that defines "table editing mode" (will allow table content only; some other
 * restrictions apply)
 * @static
 * @final
 * @type String
 */
CUI.rte.plugins.TablePlugin.EDITMODE_TABLE = "table";


// register plugin
CUI.rte.plugins.PluginRegistry.register("table", CUI.rte.plugins.TablePlugin);