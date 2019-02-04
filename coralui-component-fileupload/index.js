import '../coralui-theme-spectrum';
import './src/styles/index.css';

import '../coralui-externals';
import '../coralui-compat';

import FileUpload from './src/scripts/FileUpload';
import FileUploadItem from './src/scripts/FileUploadItem';

// Expose component on the Coral namespace
window.customElements.define('coral-fileupload', FileUpload);

FileUpload.Item = FileUploadItem;

export {FileUpload};
