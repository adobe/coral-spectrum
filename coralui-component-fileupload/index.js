import '/coralui-externals';
import FileUpload from './src/scripts/FileUpload';
import FileUploadItem from './src/scripts/FileUploadItem';

window.customElements.define('coral-fileupload', FileUpload);

// Expose component on the Coral namespace
window.Coral = window.Coral || {};
window.Coral.FileUpload = FileUpload;
window.Coral.FileUpload.Item = FileUploadItem;

export {FileUpload, FileUploadItem};
