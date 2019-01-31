/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe Systems Incorporated
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe Systems Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe Systems Incorporated and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe Systems Incorporated.
 */

import MIME_TYPES from '../data/mimetypes.json';
import {transform, validate} from '../../../coralui-utils';

/**
 Enumeration for {@link FileUploadItem} response types.
 
 @typedef {Object} FileUploadItemResponseTypeEnum
 
 @property {String} TEXT
 String type.
 @property {String} ARRAY_BUFFER
 Array buffer type.
 @property {String} BLOB
 Blob type.
 @property {String} DOCUMENT
 Document type.
 @property {String} JSON
 JavaScript object, parsed from a JSON string returned by the server.
 */
const responseType = {
  TEXT: 'text',
  ARRAY_BUFFER: 'arraybuffer',
  BLOB: 'blob',
  DOCUMENT: 'document',
  JSON: 'json'
};

// eg text/plain
const MIME_TYPE_REGEXP = /(.+)\/(.+)$/;
// eg .txt
const FILE_EXTENSION_REGEXP = /\.(.+)$/;
// eg text
const SHORTCUT_REGEXP = /.*/;
const MIME_TYPE_AUDIO = 'audio/*';
const MIME_TYPE_IMAGE = 'image/*';
const MIME_TYPE_VIDEO = 'video/*';

/**
 @class Coral.FileUpload.Item
 @classdesc A FileUpload item encapsulating file meta-data
 @param {File|HTMLElement} file
 The file element.
 */
class FileUploadItem {
  /**
   Takes a {File} as argument.
   
   @param {File} file
   */
  constructor(file) {
    this._originalFile = file;
    this._xhr = null;
  }
  
  /**
   The File.
   
   @name file
   @readonly
   @type {File}
   */
  get file() {
    return this._originalFile;
  }
  
  /**
   Array of additional parameters as key:value to be uploaded with the file.
   A parameter must contain a <code>name</code> key:value and optionally a <code>value</code> key:value.
   
   @name parameters
   @type {Array.<Object>}
   @default []
   */
  get parameters() {
    return this._parameters || [];
  }
  set parameters(value) {
    const isValid = Array.isArray(value) && value.every((el) => el && el.name);
  
    if (isValid) {
      this._parameters = value;
    }
  }
  
  /**
   The item xhr <code>withCredentials</code> property.
   
   @name withCredentials
   @type {Boolean}
   @default false
   */
  get withCredentials() {
    return this._withCredentials || false;
  }
  set withCredentials(value) {
    this._withCredentials = transform.boolean(value);
  }
  
  /**
   The item xhr <code>timeout</code> property.
   
   @name timeout
   @type {Number}
   @default 0
   */
  get timeout() {
    return this._timeout || 0;
  }
  set timeout(value) {
    const timeout = transform.number(value);
    if (timeout !== null) {
      this._timeout = timeout;
      if (this._xhr) {
        this._xhr.timeout = timeout;
      }
    }
  }
  
  /**
   The item xhr <code>responseType</code> property. See {@link FileUploadItemResponseTypeEnum}.
   
   @name responseType
   @default {FileUploadItemResponseTypeEnum.TEXT}
   @type {String}
   */
  get responseType() {
    return this._responseType || responseType.TEXT;
  }
  set responseType(value) {
    value = transform.string(value).toLowerCase();
    this._responseType = validate.enumeration(responseType)(value) && value || responseType.TEXT;
    if (this._xhr) {
      this._xhr.responseType = value;
    }
  }
  
  /**
   The item xhr <code>readyState</code> property.
   
   @name readyState
   @readonly
   @default 0
   @type {Number}
   */
  get readyState() {
    return this._xhr ? this._xhr.readyState : this._readyState || 0;
  }
  
  /**
   The item xhr <code>responseType</code> property. Depends on {@link Coral.FileUpload.Item#responseType}.
   
   @name response
   @readonly
   @default ""
   @type {String|ArrayBuffer|Blob|Document}
   */
  get response() {
    return this._xhr ? this._xhr.response : this._response || '';
  }
  
  /**
   The item xhr <code>responseText</code> property.
   
   @name responseText
   @readonly
   @default ""
   @type {String}
   */
  get responseText() {
    return this._xhr ? this._xhr.responseText : this._responseText || '';
  }
  
  /**
   The item xhr <code>responseXML</code> property.
   
   @name responseXML
   @readonly
   @default null
   @type {HTMLElement}
   */
  get responseXML() {
    return this._xhr ? this._xhr.responseXML : this._responseXML || null;
  }
  
  /**
   The item xhr <code>status</code> property.
   
   @name status
   @readonly
   @default 0
   @type {Number}
   */
  get status() {
    return this._xhr ? this._xhr.status : this._status || 0;
  }
  
  /**
   The item xhr <code>statusText</code> property.
   
   @name statusText
   @readonly
   @default ""
   @type {String}
   */
  get statusText() {
    return this._xhr ? this._xhr.statusText : this._statusText || '';
  }
  
  /** @private */
  _isMimeTypeAllowed(acceptedMimeTypes) {
    let isAllowed = false;
    
    // Unrecognized browser mime types have a file type of ''.
    const fileType = this.file.type || 'application/unknown';
    
    if (!fileType.match(MIME_TYPE_REGEXP)) {
      // File mime type is erroneous
      return false;
    }
    
    return acceptedMimeTypes.split(',').some((allowedMimeType) => {
      allowedMimeType = allowedMimeType.trim();
      
      if (allowedMimeType === '*' ||
        allowedMimeType === '.*' ||
        allowedMimeType === '*/*' ||
        fileType === 'application/unknown') {
        // Explicit wildcard case: allow any file
        // Allow unknown mime types
        isAllowed = true;
      }
      else if (allowedMimeType.match(MIME_TYPE_REGEXP)) {
        if (allowedMimeType === MIME_TYPE_AUDIO) {
          isAllowed = fileType.indexOf(MIME_TYPE_AUDIO.slice(0, -1)) === 0;
        }
        else if (allowedMimeType === MIME_TYPE_IMAGE) {
          isAllowed = fileType.indexOf(MIME_TYPE_IMAGE.slice(0, -1)) === 0;
        }
        else if (allowedMimeType === MIME_TYPE_VIDEO) {
          isAllowed = fileType.indexOf(MIME_TYPE_VIDEO.slice(0, -1)) === 0;
        }
        else {
          // Proper mime type case: directly compare with file mime type
          isAllowed = fileType === allowedMimeType;
        }
      }
      else if (allowedMimeType.match(FILE_EXTENSION_REGEXP)) {
        // File extension case
        const allowedMimeTypes = MIME_TYPES[allowedMimeType];
  
        // Depending on OS and browser, a file extension can map to different mime types
        // e.g .csv maps to "text/csv" on Mac OS and to "application/vnd.ms-excel" on Windows
        if (Array.isArray(allowedMimeTypes)) {
          isAllowed = allowedMimeTypes.some((mimeType) => fileType === mimeType);
        }
        else {
          isAllowed = fileType === MIME_TYPES[allowedMimeType];
        }
      }
      else if (allowedMimeType.match(SHORTCUT_REGEXP)) {
        // "Shortcut" case: only compare first part of the file mime type with the shortcut
        isAllowed = fileType.split('/')[0] === allowedMimeType;
      }
      
      // Break the loop if file mime type is allowed
      return isAllowed;
    });
  }
  
  /**
   Returns {@link FileUploadItem} response types.
   
   @return {FileUploadItemResponseTypeEnum}
   */
  static get responseType() { return responseType; }
}

export default FileUploadItem;
