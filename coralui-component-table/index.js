import '../coralui-theme-spectrum';
import '../coralui-externals';
import '../coralui-compat';

import Table from './src/scripts/Table';
import TableColumn from './src/scripts/TableColumn';
import TableCell from './src/scripts/TableCell';
import TableHeaderCell from './src/scripts/TableHeaderCell';
import TableHeaderCellContent from './src/scripts/TableHeaderCellContent';
import TableRow from './src/scripts/TableRow';
import TableHead from './src/scripts/TableHead';
import TableBody from './src/scripts/TableBody';
import TableFoot from './src/scripts/TableFoot';

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
