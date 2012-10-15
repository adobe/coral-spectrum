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
 * @class CUI.rte.TableMatrix
 * @private
 * <p>This class implements an abstract representation of a table for easier processing
 * &amp; editing (especially regarding colspan/rowspan settings).</p>
 * <p>A table matrix basically consists of a two dimensional array which represents the
 * actual cells of the table. In contrast to the DOM representation of a table, cells are
 * actually adressable via their linear row/column numbers, even with
 * complex rowspan/colspan settings.</p>
 */
CUI.rte.TableMatrix = new Class({

    toString: "TableMatrix",

    /**
     * The table matrix
     * @private
     */
    matrix: null,

    /**
     * Row definitions
     * @private
     */
    rows: null,

    /**
     * The full table matrix
     * @private
     */
    fullMatrix: null,

    /**
     * The table
     * @private
     */
    tableDom: null,

    /**
     * @private
     */
    getPreviousRowCellDef: function(row, cellPos) {
        while (row > 0) {
            row--;
            var cellDefToCheck = this.matrix[row][cellPos];
            if (cellDefToCheck != null) {
                return {
                    "row": row,
                    "col": cellPos,
                    "cell": cellDefToCheck
                };
            }
            var prevCellPos = cellPos - 1;
            while (prevCellPos >= 0) {
                var cellDef = this.matrix[row][prevCellPos];
                if (cellDef) {
                    if ((prevCellPos + cellDef.colSpan) > cellPos) {
                        return {
                            "row": row,
                            "col": prevCellPos,
                            "cell": cellDef
                        };
                    }
                    break;
                }
                prevCellPos--;
            }
        }
        return null;
    },

    /**
     * Creates a table matrix for easier calculation of merged cells.
     * @param {HTMLElement} tableDom DOM node that represents the table
     */
    createTableMatrix: function(tableDom) {
        var com = CUI.rte.Common;
        this.tableDom = tableDom;
        this.matrix = [ ];
        this.fullMatrix = null;
        this.rows = com.getChildNodesByType(tableDom, "tr", true, "table");
        for (var r = 0; r < this.rows.length; r++) {
            var rowDefs = [ ];
            this.matrix.push(rowDefs);
            var cells = com.getChildNodesByType(this.rows[r], [ "th", "td" ], false);
            var cellPos = 0;
            for (var c = 0; c < cells.length; c++) {
                var cell = cells[c];
                var colSpanAttr = com.getAttribute(cell, "colspan");
                var rowSpanAttr = com.getAttribute(cell, "rowspan");
                var colSpan = (colSpanAttr ? parseInt(colSpanAttr) : 1);
                var rowSpan = (rowSpanAttr ? parseInt(rowSpanAttr) : 1);
                while (true) {
                    var prevRowCell = this.getPreviousRowCellDef(r, cellPos);
                    if (prevRowCell) {
                        var prevRow = prevRowCell.row;
                        var prevRowSpan = prevRowCell.cell.rowSpan;
                        if ((prevRow + prevRowSpan) <= r) {
                            rowDefs[cellPos] = {
                                "col": cellPos,
                                "row": r,
                                "colSpan": colSpan,
                                "rowSpan": rowSpan,
                                "cellDom": cell
                            };
                            cellPos += colSpan;
                            break;
                        }
                    } else {
                        rowDefs[cellPos] = {
                            "col": cellPos,
                            "row": r,
                            "colSpan": colSpan,
                            "rowSpan": rowSpan,
                            "cellDom": cell
                        };
                        cellPos += colSpan;
                        break;
                    }
                    cellPos++;
                }
            }
        }
    },

    /**
     * <p>Creates a "full" matrix from the (basic) matrix previously created by
     * {@link CUI.rte.TableMatrix#createTableMatrix}.</p>
     * <p>The "full matrix" is a different representation of the table. You usually don't
     * have to call this method explicitly, as all methods requiring the full matrix will
     * invoke it implicitly if necessary.</p>
     * @private
     */
    createFullMatrix: function() {
        if (this.matrix == null) {
            throw new Error("No basic matrix calculated; use createTableMatrix() before.");
        }
        this.fullMatrix = [ ];
        for (var i = 0; i < this.matrix.length; i++) {
            for (var j = 0; j < this.matrix[i].length; j++) {
                if (this.matrix[i][j] != null) {
                    var cell = this.matrix[i][j];
                    for (var c = 0; c < cell.colSpan; c++) {
                        for (var r = 0; r < cell.rowSpan; r++) {
                            var row;
                            if (this.fullMatrix[r + i]) {
                                row = this.fullMatrix[r + i];
                            } else {
                                row = [ ];
                                this.fullMatrix[r + i] = row;
                            }
                            row[c + j] = {
                                "isOrigin": (c == 0) && (r == 0),
                                "cellRef": cell
                            };
                        }
                    }
                }
            }
        }
    },

    /**
     * Get the actual table size (considering all colspan/rowspan settings).
     * @return {Object} The table site (properties: cols, rows)
     */
    getTableSize: function() {
        if (this.matrix == null) {
            throw new Error("No basic matrix calculated; use createTableMatrix() before.");
        }
        var rows = this.rows.length;
        var cols = 0;
        for (var c = 0; c < this.matrix[0].length; c++) {
            if (this.matrix[0][c]) {
                cols += this.matrix[0][c].colSpan;
            }
        }
        return {
            "cols": cols,
            "rows": rows
        };
    },

    /**
     * Get the cell definition for the specified row/column.
     * @param {Number} col column (0-based)
     * @param {Number} row row (0-based)
     * @return {Object} cell definition (properties: col, row, colSpan, rowSpan, cellDom;
     *         note that the column/row specified here might be different to the col/row
     *         specified by the caller as it always specifies the first col/row a cell
     *         occupies)
     */
    getCellForCoords: function(col, row) {
        if (this.fullMatrix == null) {
            this.createFullMatrix();
        }
        if (row >= this.fullMatrix.length) {
            return null;
        }
        var cells = this.fullMatrix[row];
        if (col >= cells.length) {
            return null;
        }
        return cells[col].cellRef;
    },

    /**
     * Get the cell definition for the specified DOM cell object.
     * @param {HTMLTableCellElement} cellDom The cell
     * @return {Object} cell definition (properties: col, row, colSpan, rowSpan, cellDom)
     */
    getCellDef: function(cellDom) {
        if (this.matrix == null) {
            throw new Error("No basic matrix calculated; use createTableMatrix() before.");
        }
        for (var r = 0; r < this.matrix.length; r++) {
            for (var c = 0; c < this.matrix[r].length; c++) {
                var cellDef = this.matrix[r][c];
                if (cellDef && (cellDef.cellDom == cellDom)) {
                    return cellDef;
                }
            }
        }
        return null;
    },

    /**
     * Calculate some additional information about the specified table cell.
     * @param {HTMLTableCellElement} cellDom The cell
     * @return {Object} cell definition (properties: isFirstCol, isFirstRow, isLastCol,
     *         isLastRow, cellDef)
     */
    getCellInfo: function(cellDom) {
        if (this.matrix == null) {
            throw new Error("No basic matrix calculated; use createTableMatrix() before.");
        }
        for (var r = 0; r < this.matrix.length; r++) {
            for (var c = 0; c < this.matrix[r].length; c++) {
                var cellDef = this.matrix[r][c];
                if (cellDef && (cellDef.cellDom == cellDom)) {
                    var maxRowExcl = r + cellDef.rowSpan;
                    var maxColExcl = c + cellDef.colSpan;
                    return {
                        "isFirstCol": (c == 0),
                        "isFirstRow": (r == 0),
                        "isLastCol": (maxColExcl >= this.matrix[r].length),
                        "isLastRow": (maxRowExcl >= this.matrix.length),
                        "cellDef": cellDef
                    };
                }
            }
        }
        return null;
    },

    /**
     * Creates a cell selection object ({@link CUI.rte.CellSelection}) from the
     * specified array of table cells.
     * @param {Array} selectedDomCells Array of table cells to create the selection from;
     *        elements of type HTMLTableCellElement
     * @return {CUI.rte.CellSelection} The cell selection object
     */
    createSelection: function(selectedDomCells) {
        if (!CUI.rte.Utils.isArray(selectedDomCells)) {
            selectedDomCells = [ selectedDomCells ];
        }
        var cellSelection = new CUI.rte.CellSelection(this);
        for (var i = 0; i < selectedDomCells.length; i++) {
            var cellDef = this.getCellDef(selectedDomCells[i]);
            if (!cellDef) {
                throw new Error("Invalid cell");
            }
            cellSelection.addCell(cellDef);
        }
        cellSelection.process();
        return cellSelection;
    },

    /**
     * Get the DOM object for the specified table row.
     * @param {Number} rowIndex number of the row (0-based)
     * @return {HTMLTableRowElement} the table row DOM object
     */
    getRowDom: function(rowIndex) {
        return this.rows[rowIndex];
    },

    /**
     * <p>Get an array of all table cells that intersect the specified table column.</p>
     * <p>Note that even cells that do not start at the given column, but intersect it by
     * their colspan setting, are returned by this method.</p>
     * @param {Number} colIndex number of the column (0-based)
     * @return {Array} all columns intersecting the specified column; element properties
     *         are: col, row, colSpan, rowSpan, cellDom)
     */
    getColumn: function(colIndex) {
        var com = CUI.rte.Common;
        if (this.fullMatrix == null) {
            this.createFullMatrix();
        }
        var columnCells = [ ];
        for (var r = 0; r < this.fullMatrix.length; r++) {
            var row = this.fullMatrix[r];
            if (row) {
                var cell = row[colIndex];
                if (cell && !com.arrayContains(columnCells, cell.cellRef)) {
                    columnCells.push(cell.cellRef);
                }
            }
        }
        return columnCells;
    },

    /**
     * <p>Get an array of all table cells that intersect the specified table row.</p>
     * <p>Note that even cells that do not start at the given row, but intersect it by
     * their rowspan setting, are returned by this method.</p>
     * @param {Number} rowIndex number of the row (0-based)
     * @return {Array} all rows intersecting the specified column; element properties
     *         are: col, row, colSpan, rowSpan, cellDom)
     */
    getRow: function(rowIndex) {
        var com = CUI.rte.Common;
        if (this.fullMatrix == null) {
            this.createFullMatrix();
        }
        var rowCells = [ ];
        var row = this.fullMatrix[rowIndex];
        if (row) {
            for (var c = 0; c < row.length; c++) {
                var cell = row[c];
                if (cell && !com.arrayContains(rowCells, cell.cellRef)) {
                    rowCells.push(cell.cellRef);
                }
            }
        }
        return rowCells;
    },

    /**
     * Get the next cell that actually starts in the specified row. If a cell starts at
     * the specified row/col, this cell is return.
     * @param {Number} colIndex column position (0-based)
     * @param {Number} rowIndex row position (0-based)
     */
    getRowCellForCoords: function(colIndex, rowIndex) {
        if (this.matrix == null) {
            throw new Error("No basic matrix calculated; use createTableMatrix() before.");
        }
        var row = this.matrix[rowIndex];
        if (!row) {
            return null;
        }
        for (var c = colIndex; c < row.length; c++) {
            if (row[c] != null) {
                return row[c];
            }
        }
        return null;
    },

    /**
     * Get the next cell "on the right" for the specified table coordinates.
     * @param {Number} colIndex column position (0-based)
     * @param {Number} rowIndex row position (0-based)
     */
    getFollowUpCell: function(colIndex, rowIndex) {
        if (this.fullMatrix == null) {
            this.createFullMatrix();
        }
        var row = this.fullMatrix[rowIndex];
        if (!row) {
            return null;
        }
        var baseCell = row[colIndex];
        if (!baseCell) {
            return null;
        }
        baseCell = baseCell.cellRef;
        for (var c = colIndex + 1; c < row.length; c++) {
            if (row[c] && (row[c].cellRef != baseCell)) {
                return row[c].cellRef;
            }
        }
        return null;
    },

    /**
     * <p>Extends the represented table (DOM and matrix representation) by the specified
     * amount of rows and columns.</p>
     * <p>Note that all cells are added with a colspan/rowspan of 1, so this is probably
     * not what the user expects when extending the table via "add column/row" commands.
     * </p>
     * @param {CUI.rte.EditContext} context The edit context
     * @param {Number} cols Number of columns to add
     * @param {Number} rows Number of rows to add
     */
    extendBy: function(context, cols, rows) {
        var tm = CUI.rte.TableMatrix;
        var cellToAdd, cellDef, rowDef, fmRowDef, c, r;
        // first, add missing rows
        var size = this.getTableSize();
        var tBody = this.rows[this.rows.length - 1].parentNode;
        for (r = 0; r < rows; r++) {
            var rowToAdd = context.createElement("tr");
            var row = this.rows.length;
            this.rows.push(rowToAdd);
            tBody.appendChild(rowToAdd);
            rowDef = [ ];
            this.matrix.push(rowDef);
            fmRowDef = null;
            if (this.fullMatrix) {
                fmRowDef = [ ];
                this.fullMatrix.push(fmRowDef);
            }
            for (c = 0; c < size.cols; c++) {
                cellToAdd = tm.createEmptyCell(context);
                rowToAdd.appendChild(cellToAdd);
                cellDef = {
                    "col": c,
                    "row": row,
                    "colSpan": 1,
                    "rowSpan": 1,
                    "cellDom": cellToAdd
                };
                rowDef.push(cellDef);
                if (fmRowDef) {
                    fmRowDef.push({
                        "isOrigin": true,
                        "cellRef": cellDef
                    });
                }
            }
        }
        // add columns
        var rowCnt = this.matrix.length;
        for (r = 0; r < rowCnt; r++) {
            rowDef = this.matrix[r];
            fmRowDef = (this.fullMatrix ? this.fullMatrix[r] : null);
            var rowDom = this.rows[r];
            for (c = 0; c < cols; c++) {
                cellToAdd = tm.createEmptyCell(context, rowDom.lastChild);
                rowDom.appendChild(cellToAdd);
                cellDef = {
                    "col": c + size.cols,
                    "row": row,
                    "colSpan": 1,
                    "rowSpan": 1,
                    "cellDom": cellToAdd
                };
                rowDef[c + size.cols] = cellDef;
                if (fmRowDef) {
                    fmRowDef[c + size.cols] = {
                        "isOrigin": true,
                        "cellRef": cellDef
                    };
                }
            }
        }
    },

    /**
     * <p>Merges the given cell area to a single cell.</p>
     * <p>If the cell area is not mergeable, an Exception is thrown. Also note that the
     * matrix itself is not adjusted accordingly; this operation processes DOM only.</p>
     */
    mergeToSingleCell: function(context, startCol, startRow, cols, rows) {
        var tm = CUI.rte.TableMatrix;
        var com = CUI.rte.Common;
        if (!this.fullMatrix) {
            this.createFullMatrix();
        }
        var endColExcl = startCol + cols;
        var endRowExcl = startRow + rows;
        var endColIncl = endColExcl - 1;
        var endRowIncl = endRowExcl- 1;
        // check corner cases
        var baseCell = this.matrix[startRow][startCol];
        if (!baseCell) {
            throw new Error("Invalid table structure.");
        }
        var topRight = this.fullMatrix[startRow][endColIncl];
        if (!topRight.isOrigin) {
            var topRightDef = topRight.cellRef;
            if ((topRightDef.row < startRow)
                    && ((topRightDef.col + topRightDef.colSpan) > endColExcl)) {
                throw new Error("Invalid table structure.");
            }
        }
        var bottomLeft = this.fullMatrix[endRowIncl][startCol];
        if (!bottomLeft.isOrigin) {
            var bottomLeftDef = bottomLeft.cellRef;
            if ((bottomLeftDef.col < startCol)
                    && ((bottomLeftDef.row + bottomLeftDef.rowSpan) > endRowExcl)) {
                throw new Error("Invalid table structure.");
            }
        }
        var bottomRight = this.fullMatrix[endRowIncl][endColIncl];
        if (!bottomRight.isOrigin) {
            var bottomRightDef = bottomRight.cellRef;
            if (((bottomRightDef.col + bottomRightDef.colSpan) > endColExcl)
                    && (bottomRightDef.row + bottomRightDef.rowSpan > endRowExcl)) {
                throw new Error("Invalid table structure.");
            }
        }
        for (var r = 0; r < rows; r++) {
            var row = r + startRow;
            var rowToProcess = this.fullMatrix[row];
            for (var c = 0; c < cols; c++) {
                var col = c + startCol;
                var cell = rowToProcess[col];
                var cellDef = cell.cellRef;
                var cellDom = cellDef.cellDom;
                var removeChild = false;
                if (!cell.isOrigin) {
                    if ((c == 0) && (cellDef.col < col)) {
                        com.setAttribute(cellDom, "colspan",
                                cellDef.col + cellDef.colSpan - col);
                    }
                    if ((r == 0) && (cellDef.row < row)) {
                        com.setAttribute(cellDom, "rowSpan",
                                cellDef.row + cellDef.rowSpan - row);
                    }
                } else {
                    removeChild = (c != 0) || (r != 0);
                    if ((cellDef.col + cellDef.colSpan) > endColExcl) {
                        removeChild = false;
                        com.setAttribute(cellDom, "colspan",
                                cellDef.col + cellDef.colSpan - endColExcl);
                        com.removeAllChildren(cellDom);
                        tm.addCellPlaceholder(context, cellDom);
                    }
                    if ((cellDef.row + cellDef.rowSpan) > endRowExcl) {
                        removeChild = false;
                        var newRowSpan = cellDef.row + cellDef.rowSpan - endRowExcl;
                        var rowDelta = cellDef.rowSpan - newRowSpan;
                        com.setAttribute(cellDom, "rowspan", newRowSpan);
                        cellDom.parentNode.removeChild(cellDom);
                        com.removeAllChildren(cellDom);
                        tm.addCellPlaceholder(context, cellDom);
                        var insertCellDef = this.getFollowUpCell(col, row + rowDelta);
                        var rowDom = this.rows[row + rowDelta];
                        if (insertCellDef) {
                            rowDom.insertBefore(cellDom, insertCellDef.cellDom);
                        } else {
                            rowDom.appendChild(cellDom);
                        }
                    }
                }
                if (removeChild) {
                    cellDom.parentNode.removeChild(cellDom);
                }
            }
        }
        var baseDom = baseCell.cellDom;
        com.setAttribute(baseDom, "colspan", cols);
        com.setAttribute(baseDom, "rowspan", rows);
        return baseDom;
    },

    /**
     * <p>Optimizes the column and row spans of the table.</p>
     * <p>Both the abstraction and the DOM get optimized.</p>
     */
    optimizeSpans: function() {
        if (this.matrix == null) {
            throw new Error("No basic matrix calculated; use createTableMatrix() before.");
        }
        var com = CUI.rte.Common;
        var tableSize = this.getTableSize();
        var rows = tableSize.rows;
        var cols = tableSize.cols;
        var c, col, r, row, spansToMerge;

        // optimize column spans - we're marking each column where a cell begins. If there
        // are columns where no cell begins, the colspans of the preceding cells can be
        // adjusted and the column therefore implicitly deleted
        var colStarts = [ ];
        for (r = 0; r < rows; r++) {
            row = this.matrix[r];
            for (c = 0; c < cols; c++) {
                if (row[c]) {
                    colStarts[c] = true;
                }
            }
        }
        c = 0;
        while (c < cols) {
            var baseCol = c;
            spansToMerge = 0;
            while ((c < cols) && !colStarts[c++]) {
                spansToMerge++;
            }
            if (spansToMerge > 0) {
                var colsToAdjust = this.getColumn(baseCol);
                for (r = 0; r < colsToAdjust.length; r++) {
                    var colToMerge = colsToAdjust[r];
                    colToMerge.colSpan -= spansToMerge;
                    if (colToMerge.colSpan > 1) {
                        com.setAttribute(colToMerge.cellDom, "colspan", colToMerge.colSpan);
                    } else {
                        com.removeAttribute(colToMerge.cellDom, "colspan");
                    }
                }
            }
        }

        // optimize row spans - works basically the same as optimizing column spans
        // (we could also use empty DOM rows for determining optimizable row spans, but
        // we stay in the TableMatrix system for now)
        var rowStarts = [ ];
        for (c = 0; c < cols; c++) {
            col = this.getColumn(c);
            for (r = 0; r < col.length; r++) {
                rowStarts[col[r].row] = true;
            }
        }
        r = 0;
        while (r < rows) {
            var baseRow = r;
            spansToMerge = 0;
            while ((r < rows) && !rowStarts[r++]) {
                spansToMerge++;
            }
            if (spansToMerge > 0) {
                var rowsToAdjust = this.getRow(baseRow);
                for (c = 0; c < rowsToAdjust.length; c++) {
                    var rowToMerge = rowsToAdjust[c];
                    rowToMerge.rowSpan -= spansToMerge;
                    if (rowToMerge.rowSpan > 1) {
                        com.setAttribute(rowToMerge.cellDom, "rowspan", rowToMerge.rowSpan);
                    } else {
                        com.removeAttribute(rowToMerge.cellDom, "rowspan");
                    }
                }
            }
        }

        // finally, remove empty rows - by adjusting the rowspan settings, those can
        // finally be removed
        for (r = this.rows.length - 1; r >= 0; r--) {
            var rowToCheck = this.rows[r];
            if (rowToCheck.childNodes.length == 0) {
                rowToCheck.parentNode.removeChild(rowToCheck);
                this.rows.splice(r, 1);
                this.matrix.splice(r, 1);
                var mr, mc, rowToAdjust;
                for (mr = r; mr < this.matrix.length; mr++) {
                    rowToAdjust = this.matrix[mr];
                    for (mc = 0; mc < rowToAdjust.length; mc++) {
                        if (rowToAdjust[mc]) {
                            rowToAdjust[mc].row--;
                        }
                    }
                }
                if (this.fullMatrix) {
                    this.fullMatrix.splice(r, 1);
                }
            }
        }
    }

});

/**
 * @private
 * @static
 */
CUI.rte.TableMatrix.createEmptyCell = function(context, refNode) {
    var tagName = "td";
    if (typeof(refNode) == "string") {
        tagName = refNode;
    } else if (refNode) {
        tagName = refNode.tagName;
    }
    var tdDom = context.createElement(tagName);
    var placeholder = CUI.rte.DomProcessor.createEmptyLinePlaceholder(context, false);
    if (placeholder) {
        tdDom.appendChild(placeholder);
    }
    return tdDom;
};

/**
 * @private
 * @static
 */
CUI.rte.TableMatrix.addCellPlaceholder = function(context, cellDom) {
    cellDom.appendChild(context.createTextNode(CUI.rte.DomProcessor.NBSP));
};

/**
 * @private
 * @static
 */
CUI.rte.TableMatrix.createEmptyCellMarkup = function() {
    var com = CUI.rte.Common;
    if (com.ua.isIE) {
        return "<td></td>";
    }
    return "<td><br " + com.BR_TEMP_ATTRIB + "=\"brEOB\"></td>";
};
