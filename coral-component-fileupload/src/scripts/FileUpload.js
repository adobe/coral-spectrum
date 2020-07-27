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

import {BaseComponent} from '../../../coral-base-component';
import {BaseFormField} from '../../../coral-base-formfield';
import FileUploadItem from './FileUploadItem';
import base from '../templates/base';
import {transform, commons, validate} from '../../../coral-utils';

const CLASSNAME = '_coral-FileUpload';

const XHR_EVENT_NAMES = ['loadstart', 'progress', 'load', 'error', 'loadend', 'readystatechange', 'abort', 'timeout'];

/**
 Enumeration for {@link FileUpload} HTTP methods that can be used to upload files.
 
 @typedef {Object} FileUploadMethodEnum
 
 @property {String} POST
 Send a POST request. Used when creating a resource.
 @property {String} PUT
 Send a PUT request. Used when replacing a resource.
 @property {String} PATCH
 Send a PATCH request. Used when partially updating a resource.
 */
const method = {
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH'
};

/**
 @class Coral.FileUpload
 @classdesc A FileUpload component that manages the upload process of multiple files. Child elements of FileUpload can
 be given special attributes to enable functionality:
 - <code>[coral-fileupload-select]</code>. Click to choose file(s), replacing existing files.
 - <code>[coral-fileupload-dropzone]</code>. Drag and drop files to choose file(s), replacing existing files.
 - <code>[coral-fileupload-clear]</code>. Click to remove all files from the queue.
 - <code>[coral-fileupload-submit]</code>. Click to start uploading.
 - <code>[coral-fileupload-abort]</code>. Click to abort all uploads.
 - <code>[coral-fileupload-abortfile="filename.txt"]</code>. Click to abort a specific file, leaving it in the queue.
 - <code>[coral-fileupload-removefile="filename.txt"]</code>. Click to remove a specific file from the queue.
 - <code>[coral-fileupload-uploadfile="filename.txt"]</code>. Click to start uploading a specific file.
 
 @htmltag coral-fileupload
 @extends {HTMLElement}
 @extends {BaseComponent}
 @extends {BaseFormField}
 */
class FileUpload extends BaseFormField(BaseComponent(HTMLElement)) {
  /** @ignore */
  constructor() {
    super();
    
    // Events
    this._delegateEvents(commons.extend(this._events, {
      // Clickable hooks
      'click [coral-fileupload-submit]': '_onSubmitButtonClick',
      'click [coral-fileupload-clear]': 'clear',
      'click [coral-fileupload-select]': '_showFileDialog',
      'click [coral-fileupload-abort]': 'abort',
      'click [coral-fileupload-abortfile]': '_onAbortFileClick',
      'click [coral-fileupload-removefile]': '_onRemoveFileClick',
      'click [coral-fileupload-uploadfile]': '_onUploadFileClick',
  
      // Drag & Drop zones
      'dragenter [coral-fileupload-dropzone]': '_onDragAndDrop',
      'dragover [coral-fileupload-dropzone]': '_onDragAndDrop',
      'dragleave [handle="input"]': '_onDragAndDrop',
      'drop [handle="input"]': '_onDragAndDrop',
  
      // Accessibility
      'capture:focus [coral-fileupload-select]': '_onButtonFocusIn',
      'capture:focus [handle="input"]': '_onInputFocusIn',
      'capture:blur [handle="input"]': '_onInputFocusOut'
    }));
    
    // Prepare templates
    this._elements = {};
    base.call(this._elements, {commons});
  
    // Pre-define labellable element
    this._labellableElement = this._elements.input;
    
    // Used for items
    this._uploadQueue = [];
  
    // this should refer to the fileupload
    this._doAddDragClass = this._doAddDragClass.bind(this);
    this._doRemoveDragClass = this._doRemoveDragClass.bind(this);
    this._positionInputOnDropZone = this._positionInputOnDropZone.bind(this);
    
    // Reposition the input under the specified dropzone
    this._observer = new MutationObserver(this._positionInputOnDropZone);
    this._observer.observe(this, {
      childList: true,
      attributes: true,
      attributeFilter: ['coral-fileupload-dropzone'],
      subtree: true
    });
  }
  
  /**
   Name used to submit the data in a form.
   @type {String}
   @default ""
   @htmlattribute name
   @htmlattributereflected
   */
  get name() {
    return this._elements.input.name;
  }
  set name(value) {
    this._reflectAttribute('name', value);
    
    this._elements.input.name = value;
  }
  
  /**
   This field's current value.
   @type {String}
   @default ""
   @htmlattribute value
   */
  get value() {
    const item = this._uploadQueue ? this._getQueueItem(0) : null;
  
    // The first selected filename, or the empty string if no files are selected.
    return item ? `C:\\fakepath\\${item.file.name}` : '';
  }
  set value(value) {
    if (value === '' || value === null) {
      this._clearQueue();
      this._clearFileInputValue();
    }
    else {
      // Throws exception if value is different than an empty string or null
      throw new Error('Coral.FileUpload accepts a filename, which may only be programmatically set to empty string.');
    }
  }
  
  /**
   Whether this field is disabled or not.
   @type {Boolean}
   @default false
   @htmlattribute disabled
   @htmlattributereflected
   */
  get disabled() {
    return this._elements.input.disabled;
  }
  set disabled(value) {
    this._elements.input.disabled = transform.booleanAttr(value);
    this._reflectAttribute('disabled', this.disabled);
  
    this.classList.toggle('is-disabled', this.disabled);
    this._setElementState();
  }
  
  /**
   Inherited from {@link BaseFormField#invalid}.
   */
  get invalid() {
    return super.invalid;
  }
  set invalid(value) {
    super.invalid = value;
  
    this._elements.input.setAttribute('aria-invalid', this.invalid);
    this._setElementState();
  }
  
  /**
   Whether this field is required or not.
   @type {Boolean}
   @default false
   @htmlattribute required
   @htmlattributereflected
   */
  get required() {
    return this._elements.input.required;
  }
  set required(value) {
    this._elements.input.required = transform.booleanAttr(value);
    this._reflectAttribute('required', this.required);
    
    this.classList.toggle('is-required', this.required);
    this._setElementState();
  }
  
  /**
   Whether this field is readOnly or not. Indicating that the user cannot modify the value of the control.
   @type {Boolean}
   @default false
   @htmlattribute readonly
   @htmlattributereflected
   */
  get readOnly() {
    return this._readOnly || false;
  }
  set readOnly(value) {
    this._readOnly = transform.booleanAttr(value);
    this._reflectAttribute('readonly', this._readOnly);
    
    this._setElementState();
  }
  
  /**
   The names of the currently selected files.
   When {@link Coral.FileUpload#multiple} is <code>false</code>, this will be an array of length 1.
   
   @type {Array.<String>}
   */
  get values() {
    let values = this._uploadQueue.map((item) => `C:\\fakepath\\${item.file.name}`);
  
    if (values.length && !this.multiple) {
      values = [values[0]];
    }
  
    return values;
  }
  set values(values) {
    if (Array.isArray(values)) {
      if (values.length) {
        this.value = values[0];
      }
      else {
        this.value = '';
      }
    }
  }
  
  /**
   Inherited from {@link BaseFormField#labelledBy}.
   */
  get labelledBy() {
    return super.labelledBy;
  }
  set labelledBy(value) {
    super.labelledBy = value;
  
    // The specified labelledBy property.
    const labelledBy = this.labelledBy;
  
    // An array of element ids to label control, the last being the select button element id.
    const ids = [];
  
    const button = this.querySelector('[coral-fileupload-select]');
  
    if (button) {
      ids.push(button.id);
    }
  
    // If a labelledBy property exists,
    if (labelledBy) {
      // prepend the labelledBy value to the ids array
      ids.unshift(labelledBy);
    }
  
    // Set aria-labelledby attribute on the labellable element joining ids array into space-delimited list of ids.
    this._elements.input.setAttribute('aria-labelledby', ids.join(' '));
  
    if (labelledBy) {
      // Set label for attribute
      const labelElement = document.getElementById(labelledBy);
      if (labelElement && labelElement.tagName === 'LABEL') {
        labelElement.setAttribute('for', this._elements.input.id);
        this._labelElement = labelElement;
      }
    }
    // Remove label for attribute
    else if (this._labelElement) {
      this._labelElement.removeAttribute('for');
    }
  }
  
  /**
   Array of additional parameters as key:value to send in addition of files.
   A parameter must contain a <code>name</code> key:value and optionally a <code>value</code> key:value.
   
   @type {Array.<Object>}
   @default []
   */
  get parameters() {
    return this._parameters || [];
  }
  set parameters(values) {
    // Verify that every item has a name
    const isValid = Array.isArray(values) && values.every((el) => el && el.name);
    
    if (isValid) {
      this._parameters = values;
  
      if (!this.async) {
        Array.prototype.forEach.call(this.querySelectorAll('input[type="hidden"]'), (input) => {
          input.parentNode.removeChild(input);
        });
    
        // Add extra parameters
        this.parameters.forEach((param) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = param.name;
          input.value = param.value;
      
          this.appendChild(input);
        });
      }
    }
  }
  
  /**
   Whether files should be uploaded asynchronously via XHR or synchronously e.g. within a
   <code>&lt;form&gt;</code> tag. One option excludes the other. Setting a new <code>async</code> value removes all
   files from the queue.
   
   @type {Boolean}
   @default false
   @htmlattribute async
   @htmlattributereflected
   */
  get async() {
    return this._async || false;
  }
  set async(value) {
    this._async = transform.booleanAttr(value);
    this._reflectAttribute('async', this._async);
  
    // Sync extra parameters in case of form submission
    if (!this._async) {
      this.parameters = this.parameters;
    }
  
    // Clear file selection
    if (this._uploadQueue) {
      this._clearQueue();
      this._clearFileInputValue();
    }
  }
  
  /**
   The URL where the upload request should be sent. When used within a <code>&lt;form&gt;</code> tag to upload
   synchronously, the action of the form is used. If an element is clicked that has a
   <code>[coral-fileupload-submit]</code> attribute as well as a <code>[formaction]</code> attribute, the action of
   the clicked element will be used. Set this property before calling {@link Coral.FileUpload#upload} to reset the
   action set by a click.
   
   @type {String}
   @default ""
   @htmlattribute action
   @htmlattributereflected
   */
  get action() {
    return this._action || '';
  }
  set action(value) {
    this._action = transform.string(value);
    this._reflectAttribute('action', this._action);
  
    // Reset button action as action was set explicitly
    this._buttonAction = null;
  }
  
  /**
   The HTTP method to use when uploading files asynchronously. When used within a <code>&lt;form&gt;</code> tag to
   upload synchronously, the method of the form is used. If an element is clicked that has a
   <code>[coral-fileupload-submit]</code> attribute as well as a <code>[formmethod]</code> attribute, the method of
   the clicked element will be used. Set this property before calling {@link FileUpload#upload} to reset the
   method set by a click.
   See {@link FileUploadMethodEnum}.
   
   @type {String}
   @default FileUploadMethodEnum.POST
   @htmlattribute method
   @htmlattributereflected
   */
  get method() {
    return this._method || method.POST;
  }
  set method(value) {
    value = transform.string(value).toUpperCase();
    this._method = validate.enumeration(method)(value) && value || method.POST;
    this._reflectAttribute('method', this._method);
    
    // Reset button method as method was set explcitly
    this._buttonMethod = null;
  }
  
  /**
   Whether more than one file can be chosen at the same time to upload.
   
   @type {Boolean}
   @default false
   @htmlattribute multiple
   @htmlattributereflected
   */
  get multiple() {
    return this._elements.input.multiple;
  }
  set multiple(value) {
    this._elements.input.multiple = transform.booleanAttr(value);
    this._reflectAttribute('multiple', this.multiple);
  }
  
  /**
   File size limit in bytes for one file. The value of 0 indicates unlimited, which is also the default.
   
   @type {Number}
   @htmlattribute sizelimit
   @htmlattributereflected
   @default 0
   */
  get sizeLimit() {
    return this._sizeLimit || 0;
  }
  set sizeLimit(value) {
    this._sizeLimit = transform.number(value);
    this._reflectAttribute('sizelimit', this._sizeLimit);
  }
  
  /**
   MIME types allowed for uploading (proper MIME types, wildcard '*' and file extensions are supported). To specify
   more than one value, separate the values with a comma (e.g.
   <code>&lt;input accept="audio/*,video/*,image/*" /&gt;</code>.
   
   @type {String}
   @default ""
   @htmlattribute accept
   @htmlattributereflected
   */
  get accept() {
    return this._elements.input.accept;
  }
  set accept(value) {
    this._elements.input.accept = value;
    this._reflectAttribute('accept', this.accept);
  }
  
  /**
   Whether the upload should start immediately after file selection.
   
   @type {Boolean}
   @default false
   @htmlattribute autostart
   @htmlattributereflected
   */
  get autoStart() {
    return this._autoStart || false;
  }
  set autoStart(value) {
    this._autoStart = transform.booleanAttr(value);
    this._reflectAttribute('autostart', this._autoStart);
  }
  
  /**
   Files to be uploaded.
   
   @readonly
   @default []
   @type {Array.<Object>}
   */
  get uploadQueue() {
    return this._uploadQueue;
  }
  
  /** @private */
  _onButtonFocusIn(event) {
    // Get the input
    const input = this._elements.input;
    
    // Get the button
    const button = event.matchedTarget;
    
    // Move the input to after the button
    // This lets the next focused item be the correct one according to tab order
    button.parentNode.insertBefore(input, button.nextElementSibling);
    
    if (event.relatedTarget !== input) {
      // Make sure the input gets focused on FF
      window.setTimeout(() => {
        input.focus();
      }, 100);
    }
  }
  
  /** @private */
  _onInputFocusIn() {
    // Get the input
    const input = event.matchedTarget;

    const button = this.querySelector('[coral-fileupload-select]');
    if (button) {
      // Remove from the tab order so shift+tab works
      button.tabIndex = -1;
      
      // So shifting focus backwards with screen reader doesn't create a focus trap
      button.setAttribute('aria-hidden', true);
      
      // Mark the button as focused
      button.classList.add('is-focused');

      window.requestAnimationFrame(() => {
        if (input.classList.contains('focus-ring')) {
          button.classList.add('focus-ring');
        }
      });
    }
  }
  
  /** @private */
  _onInputFocusOut() {
    // Unmark all the focused buttons
    const button = this.querySelector('[coral-fileupload-select].is-focused');
    button.classList.remove('is-focused');
    button.classList.remove('focus-ring');
    
    // Wait a frame so that shifting focus backwards with screen reader doesn't create a focus trap
    window.requestAnimationFrame(() => {
      button.tabIndex = 0;
      // @a11y: aria-hidden is removed to prevent focus trap when navigating backwards using a screen reader's
      // virtual cursor
      button.removeAttribute('aria-hidden');
    });
  }
  
  /** @private */
  _onAbortFileClick(event) {
    if (!this.async) {
      throw new Error('Coral.FileUpload does not support aborting file(s) upload on synchronous mode.');
    }
    
    // Get file to abort
    const fileName = event.target.getAttribute('coral-fileupload-abortfile');
    if (fileName) {
      this._abortFile(fileName);
    }
  }
  
  /** @private */
  _onRemoveFileClick(event) {
    if (!this.async) {
      throw new Error('Coral.FileUpload does not support removing a file from the queue on synchronous mode.');
    }
    else {
      // Get file to remove
      const fileName = event.target.getAttribute('coral-fileupload-removefile');
      if (fileName) {
        this._clearFile(fileName);
      }
    }
  }
  
  /** @private */
  _onUploadFileClick(event) {
    if (!this.async) {
      throw new Error('Coral.FileUpload does not support uploading a file from the queue on synchronous mode.');
    }
    
    // Get file to upload
    const fileName = event.target.getAttribute('coral-fileupload-uploadfile');
    if (fileName) {
      this.upload(fileName);
    }
  }
  
  /** @private */
  _onDragAndDrop(event) {
    // Set dragging classes
    if (event.type === 'dragenter' || event.type === 'dragover') {
      this._addDragClass();
    }
    else if (event.type === 'dragleave' || event.type === 'drop') {
      this._removeDragClass();
    }
    
    this.trigger(`coral-fileupload:${event.type}`);
  }
  
  /** @private */
  _addDragClass() {
    window.clearTimeout(this._removeClassTimeout);
    this._removeClassTimeout = window.setTimeout(this._doAddDragClass, 10);
  }
  
  /** @private */
  _doAddDragClass() {
    this.classList.add('is-dragging');
    
    const dropZone = this.querySelector('[coral-fileupload-dropzone]');
    if (dropZone) {
      dropZone.classList.add('is-dragging');
    }
    
    // Put the input on top to enable file drop
    this._elements.input.classList.remove('is-unselectable');
  }
  
  /** @private */
  _removeDragClass() {
    window.clearTimeout(this._removeClassTimeout);
    this._removeClassTimeout = window.setTimeout(this._doRemoveDragClass, 10);
  }
  
  /** @private */
  _doRemoveDragClass() {
    this.classList.remove('is-dragging');
    
    const dropZone = this.querySelector('[coral-fileupload-dropzone]');
    if (dropZone) {
      dropZone.classList.remove('is-dragging');
    }
    
    // Disable user interaction with the input
    this._elements.input.classList.add('is-unselectable');
  }
  
  /**
   Handles clicks to submit buttons
   
   @private
   */
  _onSubmitButtonClick(event) {
    const target = event.matchedTarget;
    
    // Override or reset the action/method given the button's configuration
    this._buttonAction = target.getAttribute('formaction');
    
    // Make sure the method provided by the button is valid
    const buttonMethod = transform.string(target.getAttribute('formmethod')).toUpperCase();
    this._buttonMethod = validate.enumeration(method)(buttonMethod) && buttonMethod || null;
    
    // Start the file upload
    this.upload();
  }
  
  /**
   Handles changes to the input element.
   
   @private
   */
  _onInputChange(event) {
    // Stop the current event
    event.stopPropagation();
    
    if (this.disabled) {
      return;
    }
    
    let files = [];
    const items = [];
    
    // Retrieve files for select event
    if (event.target.files && event.target.files.length) {
      this._clearQueue();
      files = event.target.files;
      
      // Verify if multiple file upload is allowed
      if (!this.multiple) {
        files = [files[0]];
      }
    }
    // Retrieve files for drop event
    else if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length) {
      this._clearQueue();
      files = event.dataTransfer.files;
      
      // Verify if multiple file upload is allowed
      if (!this.multiple) {
        files = [files[0]];
      }
    }
    else {
      return;
    }
    
    // Initialize items
    for (let i = 0; i < files.length; i++) {
      items.push(new FileUploadItem(files[i]));
    }
    
    // Verify if file is allowed to be uploaded and trigger events accordingly
    items.forEach((item) => {
      // If file is not found in uploadQueue using filename
      if (!this._getQueueItemByFilename(item.file.name)) {
        // Check file size
        if (this.sizeLimit && item.file.size > this.sizeLimit) {
          this.trigger('coral-fileupload:filesizeexceeded', {item});
        }
        // Check mime type
        else if (this.accept && !item._isMimeTypeAllowed(this.accept)) {
          this.trigger('coral-fileupload:filemimetyperejected', {item});
        }
        else {
          // Add item to queue
          this._uploadQueue.push(item);
  
          this.trigger('coral-fileupload:fileadded', {item});
        }
      }
    });
    
    if (this.autoStart) {
      this.upload();
    }
    
    // Explicitly re-emit the change event
    if (this._triggerChangeEvent) {
      this.trigger('change');
    }
    
    // Clear file input once files are added to the queue to make sure next file selection will trigger a change event
    if (this.async) {
      this._clearFileInputValue();
    }
  }
  
  /**
   Sets the disabled/readonly state of elements with the associated special attributes
   
   @private
   */
  _setElementState() {
    Array.prototype.forEach.call(this.querySelectorAll(
      '[coral-fileupload-select],' +
      '[coral-fileupload-dropzone],' +
      '[coral-fileupload-submit],' +
      '[coral-fileupload-clear],' +
      '[coral-fileupload-abort],' +
      '[coral-fileupload-abortfile],' +
      '[coral-fileupload-removefile],' +
      '[coral-fileupload-uploadfile]'
    ), (item) => {
      item.classList.toggle('is-invalid', this.invalid);
      item.classList.toggle('is-disabled', this.disabled);
      item.classList.toggle('is-required', this.required);
      item.classList.toggle('is-readOnly', this.readOnly);
      item[this.disabled || this.readOnly ? 'setAttribute' : 'removeAttribute']('disabled', '');
    });
  }
  
  /** @private */
  _clearQueue() {
    this._uploadQueue.slice().forEach((item) => {
      this._clearFile(item.file.name);
    });
  }
  
  /**
   Clear file selection on the file input
   
   @private
   */
  _clearFileInputValue() {
    this._elements.input.value = '';
  }
  
  /**
   Remove a file from the upload queue.
   
   @param {String} filename
   The filename of the file to remove.
   
   @private
   */
  _clearFile(filename) {
    const item = this._getQueueItemByFilename(filename);
    if (item) {
      // Abort file upload
      this._abortFile(filename);
      
      // Remove file from queue
      this._uploadQueue.splice(this._getQueueIndex(filename), 1);
      
      this.trigger('coral-fileupload:fileremoved', {item});
    }
  }
  
  /**
   Uploads a file in the queue. If an array is provided as the first argument, it is used as the parameters.
   
   @param filename {String}
   The name of the file to upload.
   
   @private
   */
  _uploadFile(filename) {
    const item = this._getQueueItemByFilename(filename);
    if (item) {
      this._abortFile(filename);
      this._ajaxUpload(item);
    }
  }
  
  /** @private */
  _showFileDialog() {
    // Show the dialog
    // This ONLY works when the call stack traces back to another click event!
    this._elements.input.click();
  }
  
  /**
   Abort specific file upload.
   
   @param {String} filename
   The filename identifies the file to abort.
   
   @private
   */
  _abortFile(filename) {
    const item = this._getQueueItemByFilename(filename);
    if (item && item._xhr) {
      item._xhr.abort();
      item._xhr = null;
    }
  }
  
  /**
   Handles the ajax upload.
   
   @private
   */
  _ajaxUpload(item) {
    // Use the action/method provided by the last button click, if provided
    const action = this._buttonAction || this.action;
    const requestMethod = this._buttonMethod ? this._buttonMethod.toUpperCase() : this.method;
    
    // We merge the global parameters with the specific file parameters and send them all together
    const parameters = this.parameters.concat(item.parameters);
    
    const formData = new FormData();
    
    parameters.forEach((additionalParameter) => {
      formData.append(additionalParameter.name, additionalParameter.value);
    });
    
    formData.append('_charset_', 'utf-8');
    formData.append(this.name, item._originalFile);
    
    // Store the XHR on the item itself
    item._xhr = new XMLHttpRequest();
    
    // Opening before being able to set response type to avoid IE11 InvalidStateError
    item._xhr.open(requestMethod, action);
    
    // Reflect specific xhr properties
    item._xhr.timeout = item.timeout;
    item._xhr.responseType = item.responseType;
    item._xhr.withCredentials = item.withCredentials;
    
    XHR_EVENT_NAMES.forEach((name) => {
      // Progress event is the only event among other ProgressEvents that can trigger multiple times.
      // Hence it's the only one that gives away usable progress information.
      const isProgressEvent = name === 'progress';
      (isProgressEvent ? item._xhr.upload : item._xhr).addEventListener(name, (event) => {
        const detail = {
          item: item,
          action: action,
          method: requestMethod
        };
        
        if (isProgressEvent) {
          detail.lengthComputable = event.lengthComputable;
          detail.loaded = event.loaded;
          detail.total = event.total;
        }
  
        this.trigger(`coral-fileupload:${name}`, detail);
      });
    });
    
    item._xhr.send(formData);
  }
  
  /** @private */
  _getLabellableElement() {
    return this;
  }
  
  /** @private */
  _getQueueItemByFilename(filename) {
    return this._getQueueItem(this._getQueueIndex(filename));
  }
  
  /** @private */
  _getQueueItem(index) {
    return index > -1 ? this._uploadQueue[index] : null;
  }
  
  /** @private */
  _getQueueIndex(filename) {
    let index = -1;
    this._uploadQueue.some((item, i) => {
      if (item.file.name === filename) {
        index = i;
        return true;
      }
      
      return false;
    });
    return index;
  }
  
  /** @private */
  _getTargetChangeInput() {
    return this._elements.input;
  }
  
  /** @ignore */
  _positionInputOnDropZone() {
    const input = this._elements.input;
    const dropZone = this.querySelector('[coral-fileupload-dropzone]');
    
    if (dropZone) {
      const size = dropZone.getBoundingClientRect();
      
      input.style.top = `${parseInt(dropZone.offsetTop, 10)}px`;
      input.style.left = `${parseInt(dropZone.offsetLeft, 10)}px`;
      input.style.width = `${parseInt(size.width, 10)}px`;
      input.style.height = `${parseInt(size.height, 10)}px`;
    }
    else {
      input.style.width = '0';
      input.style.height = '0';
    }
  }
  
  /**
   Uploads the given filename, or all the files into the queue. It accepts extra parameters that are sent with the
   file.
   
   @param {String} [filename]
   The name of the file to upload.
   */
  upload(filename) {
    if (!this.async) {
      if (typeof filename === 'string') {
        throw new Error('Coral.FileUpload does not support uploading a file from the queue on synchronous mode.');
      }
      
      let form = this.closest('form');
      if (!form) {
        form = document.createElement('form');
        form.method = this.method.toLowerCase();
        form.enctype = 'multipart/form-data';
        form.action = this.action;
        form.hidden = true;
        
        form.appendChild(this._elements.input);
        
        Array.prototype.forEach.call(this.querySelectorAll('input[type="hidden"]'), (hiddenInput) => {
          form.appendChild(hiddenInput);
        });
        
        // Make sure the form is connected before submission
        this.appendChild(form);
      }
      
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = '_charset_';
      input.value = 'utf-8';
      
      form.submit();
    }
    else if (typeof filename === 'string') {
      this._uploadFile(filename);
    }
    else {
      this._uploadQueue.forEach((item) => {
        this._abortFile(item.file.name);
        this._ajaxUpload(item);
      });
    }
  }
  
  /**
   Remove a file or all files from the upload queue.
   
   @param {String} [filename]
   The filename of the file to remove. If a filename is not provided, all files will be removed.
   */
  clear(filename) {
    if (!this.async) {
      if (typeof filename === 'string') {
        throw new Error('Coral.FileUpload does not support removing a file from the queue on synchronous mode.');
      }
      this._clearQueue();
      this._clearFileInputValue();
    }
    else if (typeof filename === 'string') {
      this._clearFile(filename);
    }
    else {
      this._clearQueue();
    }
  }
  
  /**
   Abort upload of a given file or all files in the queue.
   
   @param {String} [filename]
   The filename of the file to abort. If a filename is not provided, all files will be aborted.
   */
  abort(filename) {
    if (!this.async) {
      throw new Error('Coral.FileUpload does not support aborting file(s) upload on synchronous mode.');
    }
    
    if (typeof filename === 'string') {
      // Abort a single file
      this._abortFile(filename);
    }
    else {
      // Abort all files
      this._uploadQueue.forEach((item) => {
        this._abortFile(item.file.name);
      });
    }
  }
  
  static get _attributePropertyMap() {
    return commons.extend(super._attributePropertyMap, {
      sizelimit: 'sizeLimit',
      autostart: 'autoStart'
    });
  }
  
  /** @ignore */
  static get observedAttributes() {
    return super.observedAttributes.concat([
      'async',
      'action',
      'method',
      'multiple',
      'sizelimit',
      'accept',
      'autostart'
    ]);
  }
  
  /** @ignore */
  render() {
    super.render();
    
    this.classList.add(CLASSNAME);
  
    const button = this.querySelector('[coral-fileupload-select]');
    if (button) {
      button.id = button.id || commons.getUID();
    }
    // If no labelledby is specified, ensure input is at labelledby the select button
    this.labelledBy = this.labelledBy;
    
    // Fetch additional parameters if any
    const parameters = [];
    Array.prototype.forEach.call(this.querySelectorAll('input[type="hidden"]'), (input) => {
      parameters.push({
        name: input.name,
        value: input.value
      });
    });
    this.parameters = parameters;
  
    // Remove the input if it's already there
    // A fresh input is preferred to value = '' as it may not work in all browsers
    const inputElement = this.querySelector('[handle="input"]');
    if (inputElement) {
      inputElement.parentNode.removeChild(inputElement);
    }
    
    // Add the input to the component
    this.appendChild(this._elements.input);
    
    // IE11 requires one more frame or the resize listener <object> will appear as an overlaying white box
    window.requestAnimationFrame(() => {
      // Handles the repositioning of the input to allow dropping files
      commons.addResizeListener(this, this._positionInputOnDropZone);
    });
  }
}

export default FileUpload;
