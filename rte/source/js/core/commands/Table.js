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
 * @class CUI.rte.commands.Table
 * @extends CUI.rte.commands.Command
 * @private
 * <p>This class implements the RichText commands for creating and editing a table.</p>
 * <p>The following commands are supported (in parantheses: valid command values)</p>
 * <ul>
 *   <li>createtable</li>
 *   <li>modifytable</li>
 *   <li>removetable</li>
 *   <li>insertrow (before, after)</li>
 *   <li>removerow</li>
 *   <li>insertcolumn (before, after)</li>
 *   <li>removecolumn</li>
 *   <li>modifycell</li>
 *   <li>mergecells</li>
 *   <li>splitcell</li>
 *   <li>ensureparagraph (before, after)</li>
 * </ul>
 */
CUI.rte.commands.Table = new Class({

    toString: "Table",

    extend: CUI.rte.commands.Command,

    /**
     * @private
     */
    getTable: function(execDef) {
        var com = CUI.rte.Common;
        var context = execDef.editContext;
        return com.getTagInPath(context, execDef.nodeList.commonAncestor, "table");
    },

    /**
     * @private
     */
    createEmptyCell: function(execDef, refNode) {
       return CUI.rte.TableMatrix.createEmptyCell(execDef.editContext, refNode);
    },

    /**
     * @private
     */
    transferConfigToTable: function(dom, config) {
        var com = CUI.rte.Common;
        var noneConfig = CUI.rte.commands.Table.CONFIG_NONE;
        if (config.cellpadding) {
            com.setAttribute(dom, "cellpadding", config.cellpadding);
        } else {
            com.removeAttribute(dom, "cellpadding");
        }
        if (config.cellspacing) {
            com.setAttribute(dom, "cellspacing", config.cellspacing);
        } else {
            com.removeAttribute(dom, "cellspacing");
        }
        if (config.border) {
            dom.border = config.border;
            if (config.border == 0) {
                com.addClass(dom, CUI.rte.Theme.TABLE_NOBORDER_CLASS);
            } else {
                com.removeClass(dom, CUI.rte.Theme.TABLE_NOBORDER_CLASS);
            }
        } else {
            com.removeAttribute(dom, "border");
            com.addClass(dom, CUI.rte.Theme.TABLE_NOBORDER_CLASS);
        }
        if (config.width) {
            com.setAttribute(dom, "width", config.width);
        } else {
            com.removeAttribute(dom, "width");
        }
        if (config.height) {
            com.setAttribute(dom, "height", config.height);
        } else {
            com.removeAttribute(dom, "height");
        }
        var classNames = com.parseCSS(dom);
        for (var i = 0; i < classNames.length; i++) {
            if (classNames[i] != CUI.rte.Theme.TABLE_NOBORDER_CLASS) {
                com.removeClass(dom, classNames[i]);
            }
        }
        if (config.tableStyle && (config.tableStyle != noneConfig)) {
            com.addClass(dom, config.tableStyle);
        }
    },

    /**
     * @private
     */
    createTable: function(execDef) {
        var dpr = CUI.rte.DomProcessor;
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;
        var context = execDef.editContext;
        var selection = execDef.selection;
        var insertNode = selection.startNode;
        var insertOffset = selection.startOffset;
        var insertBlock = dpr.getScopedBlockNode(context, insertNode);
        if (!insertBlock) {
            return;
        }
        var isAuxRoot = insertBlock.isAuxiliaryRoot;
        insertBlock = insertBlock.dom;
        var insertAsChild = false;
        var removeDom = null;
        if (dpr.isEmptyLineBlock(insertBlock) && !isAuxRoot) {
            removeDom = insertBlock;
            insertNode = insertBlock;
        } else if (com.isTag(insertBlock, com.TABLE_CELLS)) {
            // nested table
            insertNode = insertBlock;
            insertAsChild = true;
            // currently we'll remove all existing child nodes of the existing cell to
            // reduce complexity a bit, but that restriction may be removed later
            com.removeAllChildren(insertNode);
        } else if (dpr.isBlockStart(context, insertNode, insertOffset)) {
            insertNode = insertBlock;
        } else if (dpr.isBlockEnd(context, insertNode, insertOffset)) {
            if (insertBlock.nextSibling) {
                insertNode = insertBlock.nextSibling;
            } else {
                // end of text situation
                insertNode = insertBlock.parentNode;
                insertAsChild = true;
            }
        } else {
            insertNode = dpr.insertParagraph(context, insertNode, insertOffset);
            if (!insertNode) {
                return;
            }
        }
        var config = execDef.value;
        var nodeToInsert;
        var tableDom = null;
        var spanHelperDom = null;
        if (config.html) {
            spanHelperDom = context.createElement("span");
            spanHelperDom.innerHTML = config.html;
            nodeToInsert = spanHelperDom;
        } else {
            tableDom = context.createElement("table");
            nodeToInsert = tableDom;
        }
        if (!insertAsChild) {
            insertNode.parentNode.insertBefore(nodeToInsert, insertNode);
        } else {
            insertNode.appendChild(nodeToInsert);
        }
        if (removeDom) {
            removeDom.parentNode.removeChild(removeDom);
        }
        if (config.html) {
            var tables = CUI.rte.Query.select("table", spanHelperDom);
            for (var t = 0; t < tables.length; t++) {
                if (tables[t].border == 0) {
                    com.addClass(tables[t], CUI.rte.Theme.TABLE_NOBORDER_CLASS);
                }
            }
            dpr.removeWithoutChildren(spanHelperDom);
            return;
        }
        var headerConfig = config.header;
        var hasTopHeader = (headerConfig.indexOf("top") >= 0);
        var hasLeftHeader = (headerConfig.indexOf("left") >= 0);
        this.transferConfigToTable(tableDom, config);
        var tbody = context.createElement("tbody");
        tableDom.appendChild(tbody);
        var firstCell = null;
        for (var i = 0; i < config.rows; i++) {
            var tr = context.createElement("tr");
            tbody.appendChild(tr);
            for (var j = 0; j < config.columns; j++) {
                var tagName = "td";
                if (((i == 0) && hasTopHeader) || ((j == 0) && hasLeftHeader)) {
                    tagName = "th";
                }
                var cell = context.createElement(tagName);
                if (!firstCell) {
                    firstCell = cell;
                }
                tr.appendChild(cell);
                var placeholder = dpr.createEmptyLinePlaceholder(context);
                if (placeholder) {
                    cell.appendChild(placeholder);
                }
            }
        }
        execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
            "startNode": firstCell,
            "startOffset": null
        });
    },

    /**
     * @private
     */
    modifyTable: function(execDef) {
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;
        var table = this.getTable(execDef);
        var config = execDef.value;
        if (table && config) {
            this.transferConfigToTable(table, config);
        }
        if (com.ua.isGecko) {
            sel.flushSelection(execDef.editContext);
        } else {
            execDef.bookmark = null;
        }
    },

    /**
     * @private
     */
    removeTable: function(execDef) {
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;
        var dpr = CUI.rte.DomProcessor;
        var context = execDef.editContext;
        var table = this.getTable(execDef);
        if (table) {
            var bookmark = sel.bookmarkFromProcessingSelection(context, {
                "startNode": table,
                "startOffset": 0
            });
            var tableParent = table.parentNode;
            tableParent.removeChild(table);
            var cellParent = com.getTagInPath(context, tableParent, [ "td", "th" ]);
            if (cellParent) {
                dpr.ensureEmptyLinePlaceholders(context, cellParent);
            }
            // prevent completely empty document
            if ((tableParent == context.root) && (tableParent.childNodes.length == 0)) {
                context.root.appendChild(dpr.createEmptyLinePlaceholder(context, true));
            }
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            execDef.bookmark = bookmark;
        }
    },

    /**
     * @private
     */
    getTableBody: function(execDef) {
        var com = CUI.rte.Common;
        var table = this.getTable(execDef);
        var rows = com.getChildNodesByType(table, "tr", true);
        if (rows.length > 0) {
            table = rows[0].parentNode;
        }
        return table;
    },

    /**
     * <p>Checks if the specified cell is empty.</p>
     * <p>As most browsers use placeholders in such cases, a cell is empty if it either
     * has bo child not or only a placeholder
     * @param {HTMLElement} cellDom The cell DOM element to check
     * @private
     */
    isEmptyCell: function(cellDom) {
        return CUI.rte.DomProcessor.isEmptyLineBlock(cellDom);
    },

    /**
     * @private
     */
    getSelectedRows: function(execDef) {
        var com = CUI.rte.Common;
        var context = execDef.editContext;
        return execDef.nodeList.getTags(context, [{
                "matcher": function(dom) {
                    return com.isTag(dom, "tr");
                }
            }], true, true);
    },

    /**
     * Get all cells that occupy the same row as the specified cell.
     * @param {Object} execDef Execution definition
     * @param {HTMLElement} cell Reference cell
     * @return {HTMLElement[]} Array containing all cells that occupy the same row
     */
    getEntireRowForCell: function(execDef, cell) {
        var tableDom = this.getTable(execDef);
        var tableMatrix = new CUI.rte.TableMatrix();
        tableMatrix.createTableMatrix(tableDom);
        var cellDef = tableMatrix.getCellDef(cell);
        var baseRow = cellDef.row;
        var rowCells = [ ];
        if (cellDef) {
            var row = tableMatrix.getRow(baseRow);
            if (row) {
                for (var c = 0; c < row.length; c++) {
                    var cellToProcess = row[c];
                    // use only cells that actually *start* at the same row (not the ones
                    // that intersect by rowspan settings)
                    if (cellToProcess.row == baseRow) {
                        rowCells.push(cellToProcess.cellDom);
                    }
                }
            }
        }
        return rowCells
    },

    /**
     * Get all cells that occupy the same column as the specified cell.
     * @param {Object} execDef Execution definition
     * @param {HTMLElement} cell Reference cell
     * @return {HTMLElement[]} Array containing all cells that occupy the same column
     */
    getEntireColumnForCell: function(execDef, cell) {
        var tableDom = this.getTable(execDef);
        var tableMatrix = new CUI.rte.TableMatrix();
        tableMatrix.createTableMatrix(tableDom);
        var cellDef = tableMatrix.getCellDef(cell);
        var baseColumn = cellDef.col;
        var colCells = [ ];
        if (cellDef) {
            var column = tableMatrix.getColumn(baseColumn);
            if (column) {
                for (var c = 0; c < column.length; c++) {
                    var cellToProcess = column[c];
                    // use only cells that actually *start* at the same column (not the ones
                    // that intersect by colspan settings)
                    if (cellToProcess.col == baseColumn) {
                        colCells.push(cellToProcess.cellDom);
                    }
                }
            }
        }
        return colCells
    },

    /**
     * @private
     */
    insertRow: function(execDef, insertBefore, caretPosition) {
        var sel = CUI.rte.Selection;
        var context = execDef.editContext;
        var rows = this.getSelectedRows(execDef);
        if (rows.length == 1) {
            if (!caretPosition) {
                caretPosition = "default";
            }
            var cells = this.getSelectedCells(execDef);
            var tableDom = this.getTable(execDef);
            var tableMatrix = new CUI.rte.TableMatrix();
            tableMatrix.createTableMatrix(tableDom);
            var refCellDef = tableMatrix.getCellDef(cells[0].dom);
            var refRow = (insertBefore ? refCellDef.row
                : refCellDef.row + refCellDef.rowSpan - 1);
            var cols = tableMatrix.getRow(refRow);
            var row = context.createElement("tr");
            var refRowDom = tableMatrix.getRowDom(refRow);
            var insertRef = (insertBefore ? refRowDom : refRowDom.nextSibling);
            refRowDom.parentNode.insertBefore(row, insertRef);
            var cellToSelect;
            for (var c = 0; c < cols.length; c++) {
                var cell = cols[c];
                var cellDom = cell.cellDom;
                var newCell = this.createEmptyCell(execDef, cellDom);
                if (cellDom.colSpan > 1) {
                    newCell.colSpan = cellDom.colSpan;
                }
                if (caretPosition == "default") {
                    if (cell == refCellDef) {
                        cellToSelect = newCell;
                    }
                } else if (caretPosition == "firstCell") {
                    if (c == 0) {
                        cellToSelect = newCell;
                    }
                }
                if (cell.rowSpan == 1) {
                    row.appendChild(newCell);
                } else {
                    var extendExistingCell = (insertBefore ? (cell.row != refCellDef.row)
                            : ((cell.row + cell.rowSpan - 1) > refRow));
                    if  (!extendExistingCell) {
                        row.appendChild(newCell);
                    } else {
                        if (caretPosition == "default") {
                            if (cell == refCellDef) {
                                cellToSelect = cellDom;
                            }
                        } else if (caretPosition == "firstCell") {
                            if (c == 0) {
                                cellToSelect = cellDom;
                            }
                        }
                        cellDom.rowSpan++;
                    }
                }
            }
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            if (cellToSelect) {
                execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
                    startNode: cellToSelect,
                    startOffset: null
                });
            } else {
                execDef.bookmark = null;
            }
        }
    },

    /**
     * @private
     */
    removeRow: function(execDef) {
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        var context = execDef.editContext;
        var table = this.getTable(execDef);
        var rows = this.getSelectedRows(execDef);
        if (rows.length == 1) {
            var tableMatrix = new CUI.rte.TableMatrix();
            tableMatrix.createTableMatrix(table);
            var tableSize = tableMatrix.getTableSize();
            if (tableSize.rows == 1) {
                this.removeTable(execDef);
                return;
            }
            var cells = this.getSelectedCells(execDef);
            var cellDef = tableMatrix.getCellDef(cells[0].dom);
            var rowToRemove = tableMatrix.getRow(cellDef.row);
            var cellToSelect;
            if (cellDef.rowSpan > 1) {
                cellToSelect = cellDef.cellDom;
            } else {
                if (cellDef.row < (tableSize.rows - 1)) {
                    cellToSelect = tableMatrix.getCellForCoords(cellDef.col,
                            cellDef.row + 1);
                } else {
                    cellToSelect =
                        tableMatrix.getCellForCoords(cellDef.col, cellDef.row - 1);
                }
                if (cellToSelect) {
                    cellToSelect = cellToSelect.cellDom;
                } else {
                    cellToSelect = table;
                }
            }
            var cellDom;
            for (var c = 0; c < rowToRemove.length; c++) {
                var cellToRemove = rowToRemove[c];
                cellDom = cellToRemove.cellDom;
                if (cellToRemove.rowSpan == 1) {
                    // remove
                    cellDom.parentNode.removeChild(cellDom);
                } else {
                    // decrease rowspan and remove content if necessary
                    if (cellToRemove.row == cellDef.row) {
                        while (cellDom.childNodes.length > 0) {
                            cellDom.removeChild(cellDom.childNodes[0]);
                        }
                        cellDom.appendChild(context.createTextNode(dpr.NBSP));
                        // move cell to next row
                        cellDom.parentNode.removeChild(cellDom);
                        var insertCellDef = tableMatrix.getRowCellForCoords(c,
                                cellDef.row + 1);
                        var insertCell = (insertCellDef ? insertCellDef.cellDom : null);
                        var parentNode = (insertCell ? insertCell.parentNode
                            : tableMatrix.getRowDom(cellDef.row + 1));
                        parentNode.insertBefore(cellDom, insertCell);
                    }
                    cellDom.rowSpan--;
                }
            }
            // remove tr element itself if necessary
            var rowDom = rows[0].dom;
            rowDom.parentNode.removeChild(rowDom);
            // optimize spans if possible
            tableMatrix.createTableMatrix(table);
            tableMatrix.optimizeSpans();
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            if (cellToSelect) {
                execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
                    startNode: cellToSelect,
                    startOffset: null
                });
            } else {
                execDef.bookmark = null;
            }
        }
    },

    /**
     * @private
     */
    getSelectedCells: function(execDef) {
        var context = execDef.editContext;
        var cellSelection = execDef.selection.cellSelection;
        if (cellSelection) {
            var cellsSelected = [ ];
            for (var c = 0; c < cellSelection.cells.length; c++) {
                cellsSelected.push({
                    "dom": cellSelection.cells[c]
                });
            }
            return cellsSelected;
        }
        var nodeList = execDef.nodeList;
        var com = CUI.rte.Common;
        var isTableFound = false;
        return nodeList.getTags(context, [{
                "matcher": function(dom) {
                    if (isTableFound) {
                        return false;
                    }
                    if (com.isTag(dom, [ "td", "th" ])) {
                        isTableFound = true;
                        return true;
                    }
                    return false;
                }
            }], true, true);
    },

    /**
     * @private
     */
    insertCol: function(execDef, insertBefore) {
        var sel = CUI.rte.Selection;
        var context = execDef.editContext;
        var cells = this.getSelectedCells(execDef);
        if (cells.length == 1) {
            var tableDom = this.getTable(execDef);
            var tableMatrix = new CUI.rte.TableMatrix();
            tableMatrix.createTableMatrix(tableDom);
            var refCellDef = tableMatrix.getCellDef(cells[0].dom);
            var refCol = (insertBefore ? refCellDef.col
                    : refCellDef.col + refCellDef.colSpan - 1);
            var rows = tableMatrix.getColumn(refCol);
            var cellToSelect;
            for (var r = 0; r < rows.length; r++) {
                var cell = rows[r];
                var cellDom = cell.cellDom;
                var newCell = this.createEmptyCell(execDef, cellDom);
                if (cellDom.rowSpan > 1) {
                    newCell.rowSpan = cellDom.rowSpan;
                }
                var insertRef = (insertBefore ? cellDom : cellDom.nextSibling);
                if (cell == refCellDef) {
                    cellToSelect = newCell;
                }
                if (cell.colSpan == 1) {
                    cellDom.parentNode.insertBefore(newCell, insertRef);
                } else {
                    var extendExistingCell = (insertBefore ? (cell.col != refCellDef.col)
                            : ((cell.col + cell.colSpan - 1) > refCol));
                    if  (!extendExistingCell) {
                        cellDom.parentNode.insertBefore(newCell, insertRef);
                    } else {
                        if (cell == refCellDef) {
                            cellToSelect = cellDom;
                        }
                        cellDom.colSpan++;
                    }
                }
            }
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            if (cellToSelect) {
                execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
                    startNode: cellToSelect,
                    startOffset: null
                });
            } else {
                execDef.bookmark = null;
            }
        }
    },

    /**
     * @private
     */
    removeCol: function(execDef) {
        var sel = CUI.rte.Selection;
        var dpr = CUI.rte.DomProcessor;
        var context = execDef.editContext;
        var table = this.getTable(execDef);
        var cells = this.getSelectedCells(execDef);
        if (cells.length == 1) {
            var tableMatrix = new CUI.rte.TableMatrix();
            tableMatrix.createTableMatrix(table);
            var tableSize = tableMatrix.getTableSize();
            if (tableSize.cols == 1) {
                this.removeTable(execDef);
                return;
            }
            var cellDef = tableMatrix.getCellDef(cells[0].dom);
            var colToRemove = tableMatrix.getColumn(cellDef.col);
            var cellToSelect;
            if (cellDef.colSpan > 1) {
                cellToSelect = cellDef.cellDom;
            } else {
                cellToSelect = tableMatrix.getFollowUpCell(cellDef.col, cellDef.row);
                if (!cellToSelect && (cellDef.col > 0)) {
                    cellToSelect = tableMatrix.getCellForCoords(cellDef.col - 1,
                            cellDef.row);
                }
                if (cellToSelect) {
                    cellToSelect = cellToSelect.cellDom;
                } else {
                    cellToSelect = table;
                }
            }
            var cellDom;
            for (var r = 0; r < colToRemove.length; r++) {
                var cellToRemove = colToRemove[r];
                cellDom = cellToRemove.cellDom;
                if (cellToRemove.colSpan == 1) {
                    // remove
                    cellDom.parentNode.removeChild(cellDom);
                } else {
                    // decrease colspan and remove content if necessary
                    if (cellToRemove.col == cellDef.col) {
                        while (cellDom.childNodes.length > 0) {
                            cellDom.removeChild(cellDom.childNodes[0]);
                        }
                        cellDom.appendChild(context.createTextNode(dpr.NBSP));
                    }
                    cellDom.colSpan--;
                }
            }
            // optimize spans if possible
            tableMatrix.createTableMatrix(table);
            tableMatrix.optimizeSpans();
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            if (cellToSelect) {
                execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
                    startNode: cellToSelect,
                    startOffset: null
                });
            } else {
                execDef.bookmark = null;
            }
        }
    },

    /**
     * @private
     */
    transferConfigToCell: function(context, dom, config) {
        var com = CUI.rte.Common;
        var noneConfig = CUI.rte.commands.Table.CONFIG_NONE;
        if (config.cellType && (config.cellType != noneConfig)) {
            if (!com.isTag(dom, config.cellType)) {
                var changedDom = context.createElement(config.cellType);
                com.copyAttributes(dom, changedDom);
                com.replaceNode(dom, changedDom);
                dom = changedDom;
            }
        }
        if (config.width) {
            com.setAttribute(dom, "width", config.width);
        } else {
            com.removeAttribute(dom, "width", config.height);
        }
        if (config.height) {
            com.setAttribute(dom, "height", config.height);
        } else {
            com.removeAttribute(dom, "height");
        }
        if (config.align) {
            if (config.align != noneConfig) {
                dom.style.textAlign = config.align;
            } else {
                dom.style.textAlign = "";
            }
        }
        if (config.valign) {
            if (config.valign != noneConfig) {
                com.setAttribute(dom, "valign", config.valign);
            } else {
                com.removeAttribute(dom, "valign");
            }
        }
        com.removeAttribute(dom, "class");
        if (config.cellStyle && (config.cellStyle != noneConfig)) {
            com.addClass(dom, config.cellStyle);
        }
    },

    /**
     * @private
     */
    modifyCell: function(execDef) {
        var sel = CUI.rte.Selection;
        var com = CUI.rte.Common;
        var context = execDef.editContext;
        var cell = this.getSelectedCells(execDef);
        if (cell.length != 1) {
            return;
        }
        cell = cell[0].dom;
        var config = execDef.value;
        if (cell && config) {
            var applyTo = config._applyTo;
            var cellsToApply;
            switch (applyTo) {
                case "cell":
                    cellsToApply = [ cell ];
                    break;
                case "row":
                    cellsToApply = this.getEntireRowForCell(execDef, cell);
                    break;
                case "column":
                    cellsToApply = this.getEntireColumnForCell(execDef, cell);
                    break;
            }
            for (var i = 0; i < cellsToApply.length; i++) {
                this.transferConfigToCell(context, cellsToApply[i], config);
            }
        }
        // Gecko keeps the table handles drawn, so play around with the
        // selection to get rid of it
        if (com.ua.isGecko) {
            sel.flushSelection(context);
        } else {
            execDef.bookmark = null;
        }
    },

    /**
     * @private
     */
    mergeCells: function(execDef) {
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var context = execDef.editContext;
        var selProps = execDef.value.selectionProps;
        var anchorCell = (selProps ? selProps.anchorCell : null);
        if (anchorCell) {
            var table = this.getTable(execDef);
            var anchorDom = anchorCell.cellDom;
            var colSpan = selProps.cols;
            var rowSpan = selProps.rows;
            var cells = execDef.value.cells;
            var contentNodes = [ ];
            for (var c = 0; c < cells.length; c++) {
                var cellDom = cells[c].cellDom;
                if (cellDom != anchorDom) {
                    if (!this.isEmptyCell(cellDom)) {
                        // add space
                        contentNodes.push(context.createTextNode(" "));
                        var children = cellDom.childNodes;
                        for (var i = 0; i < children.length; i++) {
                            contentNodes.push(children[i]);
                        }
                    }
                    cellDom.parentNode.removeChild(cellDom);
                }
            }
            if (colSpan > 1) {
                com.setAttribute(anchorDom, "colspan", colSpan);
            } else {
                com.removeAttribute(anchorDom, "colspan");
            }
            if (rowSpan > 1) {
                com.setAttribute(anchorDom, "rowspan", rowSpan);
            } else {
                com.removeAttribute(anchorDom, "rowspan");
            }
            for (i = 0; i < contentNodes.length; i++) {
                anchorDom.appendChild(contentNodes[i]);
            }
            // optimize spans & table structure
            var tableMatrix = new CUI.rte.TableMatrix();
            tableMatrix.createTableMatrix(table);
            tableMatrix.optimizeSpans();
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
                startNode: anchorDom,
                startOffset: null
            });
        }
    },

    /**
     * @private
     */
    splitCellHorizontally: function(execDef) {
        var sel = CUI.rte.Selection;
        var context = execDef.editContext;
        var table = this.getTable(execDef);
        var cells = this.getSelectedCells(execDef);
        if (table && cells.length == 1) {
            var cell = cells[0].dom;
            var newCell = this.createEmptyCell(execDef);
            if (cell.rowSpan && cell.rowSpan > 1) {
                newCell.rowSpan = cell.rowSpan;
            }
            if (cell.colSpan && cell.colSpan > 1) {
                // if the current cell already has some colspan, decrease by 1
                cell.colSpan = cell.colSpan - 1;
                cell.parentNode.insertBefore(newCell, cell.nextSibling);
            } else {
                // if the cell to be split has no colspan, increase colspan of all
                // cells in this cell's column by 1
                var tableMatrix = new CUI.rte.TableMatrix();
                tableMatrix.createTableMatrix(table);
                tableMatrix.createFullMatrix();
                var cellDef = tableMatrix.getCellDef(cell);
                var col = tableMatrix.getColumn(cellDef.col);
                cell.parentNode.insertBefore(newCell, cell.nextSibling);
                for (var c = 0; c < col.length; c++) {
                    if (col[c] != cellDef) {
                        var colSpan = col[c].cellDom.colSpan;
                        colSpan = colSpan || 1;
                        col[c].cellDom.colSpan = ++colSpan;
                    }
                }
            }
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
                startNode: newCell,
                startOffset: null
            });
        }
    },

    /**
     * @private
     */
    splitCellVertically: function(execDef) {
        var sel = CUI.rte.Selection;
        var context = execDef.editContext;
        var table = this.getTable(execDef);
        var cells = this.getSelectedCells(execDef);
        if (table && cells.length == 1) {
            var cell = cells[0].dom;
            var newCell = this.createEmptyCell(execDef);
            if (cell.colSpan && cell.colSpan > 1) {
                newCell.colSpan = cell.colSpan;
            }
            var tableMatrix = new CUI.rte.TableMatrix();
            tableMatrix.createTableMatrix(table);
            tableMatrix.createFullMatrix();
            var cellDef = tableMatrix.getCellDef(cell);
            if (cell.rowSpan && cell.rowSpan > 1) {
                // if the current cell already has some rowspan, decrease by 1
                var lastCellRow = cellDef.row + cellDef.rowSpan - 1;
                var insertCellDef = tableMatrix.getRowCellForCoords(cellDef.col + 1,
                        lastCellRow);
                var insertCell = (insertCellDef ? insertCellDef.cellDom : null);
                var parentNode = (insertCell ? insertCell.parentNode
                        : tableMatrix.getRowDom(lastCellRow));
                parentNode.insertBefore(newCell, insertCell);
                cell.rowSpan = cell.rowSpan - 1;
            } else {
                // if the cell to be split has no rowspan, increase rowspan of all
                // cells in this cell's row by 1 and insert a new row
                var row = tableMatrix.getRow(cellDef.row);
                var cellRow = cell.parentNode;
                var newRow = context.createElement("tr");
                newRow.appendChild(newCell);
                cellRow.parentNode.insertBefore(newRow, cellRow.nextSibling);
                for (var c = 0; c < row.length; c++) {
                    if (row[c] != cellDef) {
                        var rowSpan = row[c].cellDom.rowSpan;
                        rowSpan = rowSpan || 1;
                        row[c].cellDom.rowSpan = ++rowSpan;
                    }
                }
            }
            // Gecko keeps the table handles drawn, so play around with the
            // selection to get rid of it
            sel.flushSelection(context);
            execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
                startNode: newCell,
                startOffset: null
            });
        }
    },

    ensureParagraph: function(execDef, ensureBefore) {
        var dpr = CUI.rte.DomProcessor;
        var com = CUI.rte.Common;
        var sel = CUI.rte.Selection;
        var context = execDef.editContext;
        var insertNode = null;
        var tableDom = this.getTable(execDef);
        if (!tableDom) {
            return;
        }
        var bodyNode = tableDom.parentNode;
        if (!com.isRootNode(context, bodyNode)) {
            return;
        }
        if (ensureBefore) {
            insertNode = tableDom;
        } else {
            insertNode = tableDom.nextSibling;
        }
        var paraNode = dpr.createEmptyLinePlaceholder(context, true);
        bodyNode.insertBefore(paraNode, insertNode);
        dpr.fixEmptyEditingBlockIE(context, paraNode);
        // Gecko keeps the table handles drawn, so play around with the selection to get
        // rid of it
        sel.flushSelection(context);
        execDef.bookmark = sel.bookmarkFromProcessingSelection(context, {
            startNode: paraNode,
            startOffset: 0
        });
    },

    /**
     * @private
     */
    isCommand: function(cmdStr) {
        var com = CUI.rte.Common;
        var cmdLC = cmdStr.toLowerCase();
        return com.strEndsWith(cmdLC, "table") || com.strEndsWith(cmdLC, "column")
                || com.strEndsWith(cmdLC, "row") || com.strEndsWith(cmdLC, "cell")
                || com.strEndsWith(cmdLC, "cells") || cmdLC == "ensureparagraph";
    },

    /**
     * @private
     */
    getProcessingOptions: function() {
        var cmd = CUI.rte.commands.Command;
        return cmd.PO_BOOKMARK | cmd.PO_SELECTION | cmd.PO_NODELIST;
    },

    /**
     * @private
     */
    execute: function(execDef) {
        var ret = undefined;
        var position;
        switch (execDef.command.toLowerCase()) {
            case "createtable":
                this.createTable(execDef);
                break;
            case "modifytable":
                this.modifyTable(execDef);
                break;
            case "removetable":
                this.removeTable(execDef);
                break;
            case "insertrow":
                var caretPosition = "default";
                if (typeof(execDef.value) == "string") {
                    position = execDef.value;
                } else {
                    position = execDef.value.position;
                    caretPosition = execDef.value.caret;
                }
                this.insertRow(execDef, !position || (position == "before"), caretPosition);
                ret = {
                    "calleeRet": {
                        "geckoEnsureCaretVisibility": true
                    }
                };
                break;
            case "removerow":
                this.removeRow(execDef);
                break;
            case "insertcolumn":
                position = execDef.value;
                this.insertCol(execDef, !position || (position == "before"));
                break;
            case "removecolumn":
                this.removeCol(execDef);
                break;
            case "modifycell":
                this.modifyCell(execDef);
                break;
            case "mergecells":
                this.mergeCells(execDef);
                break;
            case "splitcell":
                if (execDef.value == "horizontal") {
                    this.splitCellHorizontally(execDef);
                } else if (execDef.value == "vertical") {
                    this.splitCellVertically(execDef);
                }
                break;
            case "ensureparagraph":
                position = execDef.value;
                this.ensureParagraph(execDef, !position || (position == "before"));
                ret = {
                    "calleeRet": {
                        "geckoEnsureCaretVisibility": true
                    }
                };
                break;
        }
        return ret;
    },

    /**
     * @private
     */
    queryState: function(selectionDef, cmd) {
        var com = CUI.rte.Common;
        var context = selectionDef.editContext;
        if (cmd == "table") {
            return com.getTagInPath(context, selectionDef.nodeList.commonAncestor, "table");
        } else if (cmd == "modifycell") {
            return CUI.rte.commands.Table.getCellFromNodeList(context,
                    selectionDef.nodeList);
        }
        // todo find a meaningful implementation for other commands
        return false;
    }

});

/**
 * Gets the table cell where the current selection resides from the specified processing
 * selection.
 * @param {CUI.rte.EditContext} context The edit context
 * @param {Object} selection The processing selection to get the cell from
 * @return {HTMLElement} The cell corresponding to the processing selection; null if the
 *         selection is not cell-related or spans more than one table cell
 */
CUI.rte.commands.Table.getCellFromSelection = function(context, selection) {
    var com = CUI.rte.Common;
    if (selection.cellSelection && selection.cellSelection.cells) {
        if (selection.cellSelection.cells.length == 1) {
            return selection.cellSelection.cells[0];
        }
        return null;
    }
    var cell = com.getTagInPath(context, selection.startNode, com.TABLE_CELLS);
    if (cell && selection.endNode) {
        var endCell = com.getTagInPath(context, selection.endNode, com.TABLE_CELLS);
        if (endCell != cell) {
            cell = null;
        }
    }
    return cell;
};

/**
 * Gets the table cell that is represented by the specified node list.
 * @param {CUI.rte.EditContext} context The edit context
 * @param {CUI.rte.NodeList} nodeList The node list to get the cell from
 * @return {HTMLElement} The cell corresponding to the node list; null if the
 *         node.list is not cell-related or contains more than one table cell
 */
CUI.rte.commands.Table.getCellFromNodeList = function(context, nodeList) {
    var com = CUI.rte.Common;
    var cell = com.getTagInPath(context, nodeList.commonAncestor, com.TABLE_CELLS);
    // on IE, we might also have a single empty cell node in the list
    if (cell == null) {
        if (nodeList.nodes.length == 1) {
            var dom = nodeList.nodes[0].dom;
            if (com.isTag(dom, com.TABLE_CELLS)) {
                cell = dom;
            }
        }
    }
    return cell;
};

/**
 * Property placeholder for config value "none"
 * @private
 * @static
 * @final
 * @type Object
 */
CUI.rte.commands.Table.CONFIG_NONE = new Object();


// register command
CUI.rte.commands.CommandRegistry.register("table", CUI.rte.commands.Table);