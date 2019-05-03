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

import Table from './src/scripts/Table';
import TableColumn from './src/scripts/TableColumn';
import TableCell from './src/scripts/TableCell';
import TableHeaderCell from './src/scripts/TableHeaderCell';
import TableHeaderCellContent from './src/scripts/TableHeaderCellContent';
import TableRow from './src/scripts/TableRow';
import TableHead from './src/scripts/TableHead';
import TableBody from './src/scripts/TableBody';
import TableFoot from './src/scripts/TableFoot';

import './src/styles/index.css';

// Expose component on the Coral namespace
window.customElements.define('coral-table-column', TableColumn, {extends: 'col'});
window.customElements.define('coral-table-cell', TableCell, {extends: 'td'});
window.customElements.define('coral-table-headercell', TableHeaderCell, {extends: 'th'});
window.customElements.define('coral-table-row', TableRow, {extends: 'tr'});
window.customElements.define('coral-table-head', TableHead, {extends: 'thead'});
window.customElements.define('coral-table-body', TableBody, {extends: 'tbody'});
window.customElements.define('coral-table-foot', TableFoot, {extends: 'tfoot'});
window.customElements.define('coral-table', Table, {extends: 'table'});

Table.Column = TableColumn;
Table.Cell = TableCell;
Table.HeaderCell = TableHeaderCell;
Table.HeaderCell.Content = TableHeaderCellContent;
Table.Row = TableRow;
Table.Head = TableHead;
Table.Body = TableBody;
Table.Foot = TableFoot;

export {Table};
