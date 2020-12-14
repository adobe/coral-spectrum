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

/** @ignore */
const isTableHeaderCell = node => node.nodeName === 'TH' && node.getAttribute('is') === 'coral-table-headercell';

/** @ignore */
const isTableCell = node => node.nodeName === 'TD' && node.getAttribute('is') === 'coral-table-cell';

/** @ignore */
const isTableRow = node => node.nodeName === 'TR' && node.getAttribute('is') === 'coral-table-row';

/** @ignore */
const isTableBody = node => node.nodeName === 'TBODY' && node.getAttribute('is') === 'coral-table-body';

/** @ignore */
const getIndexOf = (el) => {
  const parent = el.parentNode;
  if (!parent) {
    return -1;
  }

  return Array.prototype.indexOf.call(parent.children, el);
};

/** @ignore */
const getSiblingsOf = (el, selector, type) => {
  const stack = [];

  // Returns siblings of el
  if (!type) {
    ['previousElementSibling', 'nextElementSibling'].forEach((direction) => {
      let sibling = el;
      while (sibling[direction]) {
        sibling = sibling[direction];
        if (sibling.matches(selector)) {
          stack.push(sibling);
        }
      }
    });
  } else {
    const direction = type.indexOf('next') === 0 ? 'nextElementSibling' : 'previousElementSibling';

    // All following siblings of el up to but not including the element matched by the selector
    if (type.indexOf('Until') !== -1) {
      const matches = function () {
        if (typeof selector === 'string') {
          return el[direction].matches(selector);
        }

        return el[direction] === selector;
      };

      while (el[direction] && !matches()) {
        stack.push(el = el[direction]);
      }
    }
    // All following siblings of el filtered by a selector.
    else if (type.indexOf('All') !== -1) {
      while (el[direction]) {
        el = el[direction];
        if (el.matches(selector)) {
          stack.push(el);
        }
      }
    }
    // Returns the sibling only if it matches that selector.
    else {
      const sibling = el[direction];
      return sibling && sibling.matches(selector) ? sibling : null;
    }
  }

  return stack;
};

/** @ignore */
const listToArray = (list) => {
  const res = [];
  for (let i = 0, listCount = res.length = list.length ; i < listCount ; i++) {
    res[i] = list[i];
  }
  return res;
};

/** @ignore */
const getColumns = (colgroup) => listToArray(colgroup.querySelectorAll('col[is="coral-table-column"]'));

/** @ignore */
const getRows = (sections) => {
  let rows = [];

  sections.forEach((section) => {
    if (section) {
      rows = rows.concat(listToArray(section.querySelectorAll('tr[is="coral-table-row"]')));
    }
  });

  return rows;
};

/** @ignore */
const getCells = (row) => listToArray(row.querySelectorAll('td[is="coral-table-cell"], th[is="coral-table-headercell"]'));

/** @ignore */
const getContentCells = (row) => listToArray(row.querySelectorAll('td[is="coral-table-cell"]'));

/** @ignore */
const getHeaderCells = (row) => listToArray(row.querySelectorAll('th[is="coral-table-headercell"]'));

/** @ignore */
const getCellByIndex = (row, index) => getCells(row).filter(cell => getIndexOf(cell) === index)[0] || null;

/**
 Enumeration for {@link TableHead}, {@link TableBody} and {@link TableFoot} divider values.

 @typedef {Object} TableSectionDividerEnum

 @property {String} NONE
 No divider.
 @property {String} ROW
 Row divider.
 @property {String} COLUMN
 Column divider.
 @property {String} CELL
 Row and Column divider.
 */
const divider = {
  NONE: 'none',
  ROW: 'row',
  COLUMN: 'column',
  CELL: 'cell'
};

/**
 Enumeration for {@link TableColumn} alignment options.

 @typedef {Object} TableColumnAlignmentEnum

 @property {String} LEFT
 Left alignment.
 @property {String} CENTER
 Center alignment.
 @property {String} RIGHT
 Right alignment.
 */
const alignment = {
  LEFT: 'left',
  CENTER: 'center',
  RIGHT: 'right'
};

export {
  divider,
  alignment,
  getColumns,
  getCells,
  getContentCells,
  getHeaderCells,
  getCellByIndex,
  getIndexOf,
  getSiblingsOf,
  getRows,
  isTableHeaderCell,
  isTableCell,
  isTableRow,
  isTableBody
};
