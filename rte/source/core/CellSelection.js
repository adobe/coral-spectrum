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
 * @class CUI.rte.CellSelection
 * @private
 * This class represents a cell-based table selection as used internally by the table
 * plugin.
 * @constructor
 * @param {CUI.rte.TableMatrix} tableMatrix Table matrix that underlies the
 *        selection
 */
CUI.rte.CellSelection = new Class({

    toString: "CellSelection",

    /**
     * The table matrix the selection has been created from
     * @private
     * @type CUI.rte.TableMatrix
     */
    tableMatrix: null,

    /**
     * Array of cell definitions that represent the currently selected cells
     * @private
     * @type Array
     */
    cells: null,

    /**
     * Object that holds comprehensive information about the current selection; properties
     * are: minRow, minCol, maxRowExcl, maxColExcl, cols, rows, isRect, anchorCell;
     * isRect defines if the selection forms a rectangle; anchorCell specifies the cell at
     * the top/left corner of the selection
     * @property selectionProps
     * @type Object
     */
    selectionProps: null,

    construct: function(tableMatrix) {
        this.cells = [ ];
        this.tableMatrix = tableMatrix;
    },

    /**
     * Adds the cell specified by its cell definition to the current selection.
     * @param {Object} cellDef cell definition (as used/created by various mathods of
     *        {@link CUI.rte.TableMatrix})
     */
    addCell: function(cellDef) {
        this.cells.push(cellDef);
    },

    /**
     * <p>Expand the current selection by the specified number of columns to the
     * bottom/right.</p>
     * <p>The method ensures that the selection is rectangular again after expanding it by
     * adding additional cells as required. It also reprocesses the {@link #selectionProps}
     * property to fit the expanded selection.</p>
     * @param {Number} cols Number of columns to expand the selection by
     * @param {Number} rows Number of rows to expand the selection by
     */
    expand: function(cols, rows) {
        if (this.selectionProps == null) {
            this.process();
        }
        if (this.selectionProps == null) {
            return;
        }
        if (this.tableMatrix.fullMatrix == null) {
            this.tableMatrix.createFullMatrix();
        }
        var com = CUI.rte.Common;
        // first, add all cells that are really required to expand the selection
        var cellsToAdd = [ ];
        var baseCol = this.selectionProps.minCol;
        var baseRow = this.selectionProps.minRow;
        var expandCol = this.selectionProps.maxColExcl;
        var expandRow = this.selectionProps.maxRowExcl;
        var r, c, expR, expC, cellToAdd;
        if (cols > 0) {
            for (r = 0; r < this.selectionProps.rows; r++) {
                for (expC = 0; expC < cols; expC++) {
                    cellToAdd = this.tableMatrix.fullMatrix[baseRow + r][expandCol+ expC];
                    if (cellToAdd) {
                        cellToAdd = cellToAdd.cellRef;
                        if (!com.arrayContains(cellsToAdd, cellToAdd)) {
                            cellsToAdd.push(cellToAdd);
                        }
                    }
                }
            }
        }
        if (rows > 0) {
            for (c = 0; c < this.selectionProps.cols; c++) {
                for (expR = 0; expR < rows; expR++) {
                    cellToAdd = this.tableMatrix.fullMatrix[expandRow + expR][baseCol+ c];
                    if (cellToAdd) {
                        cellToAdd = cellToAdd.cellRef;
                        if (!com.arrayContains(cellsToAdd, cellToAdd)) {
                            cellsToAdd.push(cellToAdd);
                        }
                    }
                }
            }
        }
        // second, add additional cells that are required to make the selection rectangular
        // again
        var minCol = baseCol;
        var minRow = baseRow;
        var maxCol = expandCol + cols;
        var maxRow = expandRow + rows;
        var itMinCol = minCol;
        var itMinRow = minRow;
        var itMaxCol = maxCol;
        var itMaxRow = maxRow;
        var isProcessed = false;
        while (!isProcessed) {
            var cellCnt = cellsToAdd.length;
            for (c = 0; c < cellCnt; c++) {
                var cell = cellsToAdd[c];
                var cellMaxCol = cell.col + cell.colSpan;
                var cellMaxRow = cell.row + cell.rowSpan;
                if (cell.col < itMinCol) {
                    itMinCol = cell.col;
                }
                if (cellMaxCol > itMaxCol) {
                    itMaxCol = cellMaxCol;
                }
                if (cell.row < itMinRow) {
                    itMinRow = cell.row;
                }
                if (cellMaxRow > itMaxRow) {
                    itMaxRow = cellMaxRow;
                }
            }
            if ((itMinCol != minCol) || (itMinRow != minRow) || (itMaxCol != maxCol)
                    || (itMaxRow != maxRow)) {
                for (r = itMinRow; r < itMaxRow; r++) {
                    for (c = itMinCol; c < itMaxCol; c++) {
                        var cellToCheck = this.tableMatrix.matrix[r][c];
                        if (cellToCheck) {
                            if (!com.arrayContains(cellsToAdd, cellToCheck)) {
                                cellsToAdd.push(cellToCheck);
                            }
                        }
                    }
                }
                minRow = itMinRow;
                minCol = itMinCol;
                maxRow = itMaxRow;
                maxCol = itMaxCol;
            } else {
                isProcessed = true;
            }
        }
        for (c = 0; c < cellsToAdd.length; c++) {
            this.cells.push(cellsToAdd[c]);
        }
        this.process();
    },

    /**
     * <p>Processes the current selection to provide comprehensive selection information
     * through the {@link #selectionProps} property.</p>
     * @private
     */
    process: function() {
        if (!this.cells || (this.cells.length == 0)) {
            return;
        }
        var min = {
            "row": -1,
            "col": -1
        };
        var max = {
            "row": -1,
            "col": -1
        };
        var anchorCell = null;
        var cellArea = 0;
        for (var c = 0; c < this.cells.length; c++) {
            var cellToProcess = this.cells[c];
            if ((cellToProcess.col < min.col) || (min.col < 0)) {
                min.col = cellToProcess.col;
            }
            if ((cellToProcess.row < min.row) || (min.row < 0)) {
                min.row = cellToProcess.row;
            }
            var lastColExcl = cellToProcess.col + cellToProcess.colSpan;
            var lastRowExcl = cellToProcess.row + cellToProcess.rowSpan;
            if (lastColExcl > max.col) {
                max.col = lastColExcl;
            }
            if (lastRowExcl > max.row) {
                max.row = lastRowExcl;
            }
            if ((cellToProcess.col == min.col) && (cellToProcess.row == min.row)) {
                anchorCell = cellToProcess;
            }
            cellArea += cellToProcess.colSpan * cellToProcess.rowSpan;
        }
        var cols = max.col - min.col;
        var rows = max.row - min.row;
        var selectionArea = cols * rows;
        this.selectionProps = {
            "minRow": min.row,
            "minCol": min.col,
            "maxRowExcl": max.row,
            "maxColExcl": max.col,
            "cols": cols,
            "rows": rows,
            "isRect": (selectionArea == cellArea),
            "anchorCell": anchorCell
        };
    }

});