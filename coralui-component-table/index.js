import '/coralui-externals';
import Table from './src/scripts/Table';
import TableColumn from './src/scripts/TableColumn';
import TableCell from './src/scripts/TableCell';
import TableHeaderCell from './src/scripts/TableHeaderCell';
import TableHeaderCellContent from './src/scripts/TableHeaderCellContent';
import TableRow from './src/scripts/TableRow';
import TableHead from './src/scripts/TableHead';
import TableBody from './src/scripts/TableBody';
import TableFoot from './src/scripts/TableFoot';

window.customElements.define('coral-table-column', TableColumn, {extends: 'col'});
window.customElements.define('coral-table-cell', TableCell, {extends: 'td'});
window.customElements.define('coral-table-headercell', TableHeaderCell, {extends: 'th'});
window.customElements.define('coral-table-row', TableRow, {extends: 'tr'});
window.customElements.define('coral-table-head', TableHead, {extends: 'thead'});
window.customElements.define('coral-table-body', TableBody, {extends: 'tbody'});
window.customElements.define('coral-table-foot', TableFoot, {extends: 'tfoot'});
window.customElements.define('coral-table', Table, {extends: 'table'});

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.Table = Table;
window.Coral.Table.Column = TableColumn;
window.Coral.Table.Cell = TableCell;
window.Coral.Table.HeaderCell = TableHeaderCell;
window.Coral.Table.HeaderCell.Content = TableHeaderCellContent;
window.Coral.Table.Row = TableRow;
window.Coral.Table.Head = TableHead;
window.Coral.Table.Body = TableBody;
window.Coral.Table.Foot = TableFoot;

export {Table, TableColumn, TableCell, TableHeaderCell, TableRow, TableHead, TableBody, TableFoot};
