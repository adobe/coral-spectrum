(function($) {
    CUI.FileUpload = new Class(/** @lends CUI.FileUpload# */{
        toString: 'FileUpload',
        extend: CUI.Widget,

        /**
         @extends CUI.Widget
         @classdesc A file upload widget

         <p>
         <input data-init="fileupload" data-placeholder="Select file(s)">
         <option>/apps</option>
         <option>/content</option>
         <option>/etc</option>
         <option>/libs</option>
         <option>/tmp</option>
         <option>/var</option>
         </select>
         </p>

         @desc Creates a file upload field
         @constructs

         @param {Object}   options                                    Component options
         @param {String}   [options.placeholder=null]                 Define a placeholder for the input field
         @param {String}   [options.uploadUrl=null]                   URL where to upload the file
         @param {boolean}  [options.disabled=false]                   Is this component disabled?
         @param {boolean}  [options.multiple=false]                   Can the user upload more than one file?
         @param {Object}   [options.mimeTypes=null]                   Restrict upload to mime types
         @param {int}      [options.sizeLimit=null]                   File size limit
         @param {boolean}  [options.autoStart=false]                  Should upload start automatically once the file is selected?
         @param {String}   [options.fileParameter=null]               Name of File's parameter
         @param {String}   [options.fileNameParameter=null]           Name of File name's parameter
         @param {Object}   [options.events={}]                        (Optional) Event handlers
         @param {String}   [options.name=null]                        (Optional) name for an underlying form field.
         */
        construct: function(options) {
            // Adjust DOM to our needs
            this._render();

            this.$element.on("change", "input", function(event) {
                if (this.options.disabled) {
                    return;
                }
                this._onFileSelectionChange(event);
            }.bind(this));
        },

        defaults: {
            placeholder: null,
            uploadUrl: null,
            disabled: false,
            multiple: false,
            mimeTypes: null,
            sizeLimit: null,
            autoStart: false,
            fileParameter: null,
            fileNameParameter: null,
            events: {}
        },

        inputElement: null,
        uploadQueue: [],

        /** @ignore */
        _render: function() {
            this._readDataFromMarkup();

            var span;
            // if current element is input field -> wrap it into DIV
            if (this.$element.get(0).tagName === "INPUT") {
                span = $("<span></span>");
                this.$element.after(span);
                this.$element.detach();
                span.prepend(this.$element);
                this.$element = span;
            }

            this._createMissingElements();

            this.inputElement = this.$element.find("input");

            this.$element.addClass("fileupload button icon-upload");
            this.$element.removeClass("focus");

            // Register event handlers
            if (this.options.events) {
                if (typeof this.options.events === "object") {
                    for (var name in this.options.events) {
                        this._registerEventHandler(name, this.options.events[name]);
                    }
                }
            }

            if (!this.options.placeholder) {
                this.options.placeholder = this.inputElement.attr("placeholder");
            }

            if (this.options.autoStart) {
                this._registerEventHandler("fileSelected", function(event) {
                    event.fileUpload.uploadFile(event.item);
                });
            }

            this._update();
        },

        _registerEventHandler: function(name, handler) {
            this.$element.on(name, handler);
        },

        _createMissingElements: function() {
            var self = this;

            if (this.$element.find("input").length === 0) {
                this.$element
                    .prepend($("<input/>", {
                            type: "file",
                            multiple: self.options.multiple
                        }
                    )
                );
            }
        },

        /** @ignore */
        _readDataFromMarkup: function() {
            if (this.$element.attr("placeholder")) {
                this.options.placeholder = this.$element.attr("placeholder");
            }
            if (this.$element.attr("data-placeholder")) {
                this.options.placeholder = this.$element.attr("data-placeholder");
            }
            if (this.$element.attr("disabled") || this.$element.attr("data-disabled")) {
                this.options.disabled = true;
            }
            if (this.$element.attr("multiple") || this.$element.attr("data-multiple")) {
                this.options.multiple = true;
            }
            if (this.$element.attr("data-upload-url")) {
                this.options.uploadUrl = this.$element.attr("data-upload-url");
            }
            if (this.$element.attr("data-size-limit")) {
                this.options.sizeLimit = this.$element.attr("data-size-limit");
            }
            if (this.$element.attr("data-auto-start")) {
                this.options.autoStart = this.$element.attr("data-auto-start") ? true : false;
            }
            if (this.$element.attr("data-file-parameter")) {
                this.options.fileParameter = this.$element.attr("data-file-parameter");
            }
            if (this.$element.attr("data-file-name-parameter")) {
                this.options.fileNameParameter = this.$element.attr("data-file-name-parameter");
            }
        },

        /** @ignore */
        _update: function() {
            if (this.options.placeholder) {
                this.inputElement.attr("placeholder", this.options.placeholder);
            }

            if (this.options.disabled) {
                this.$element.addClass("disabled");
                this.inputElement.attr("disabled", "disabled");
            } else {
                this.$element.removeClass("disabled");
                this.inputElement.removeAttr("disabled");
            }
        },

        /** @ignore */
        _onFileSelectionChange: function(event) {
            var files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                this._addFile(files[i]);
            }
        },

        /** @ignore */
        _addFile: function(file) {
            var self = this;

            var fileName = file.name ? file.name : file;
            if (!self._getQueueItemByFileName(fileName)) {
                // Add item to queue
                var item = {
                    file: file,
                    fileName: fileName,
                    fileSize: file.size
                };
                self.uploadQueue.push(item);
                self.$element.trigger({
                    type: "queueChanged",
                    queueLength: self.uploadQueue.length,
                    fileUpload: self
                });

                self.$element.trigger({
                    type: "fileSelected",
                    item: item,
                    fileUpload: self
                });
            }
        },

        /** @ignore */
        _getQueueIndex: function(fileName) {
            var index = -1;
            $.each(this.uploadQueue, function(i, item) {
                if (item.fileName === fileName) {
                    index = i;
                    return false;
                }
            });
            return index;
        },

        /** @ignore */
        _getQueueItem: function(index) {
            return index > -1 ? this.uploadQueue[index] : null;
        },

        /** @ignore */
        _getQueueItemByFileName: function(fileName) {
            return this._getQueueItem(this._getQueueIndex(fileName));
        },

        // TODO: document
        uploadFile: function(item) {
            var self = this;

            var xhr = new XMLHttpRequest();
            xhr.addEventListener("loadstart", function(e) { self._onUploadStart(e, item); }, false);
            xhr.addEventListener("load", function(e) { self._onUploadLoad(e, item); }, false);
            xhr.addEventListener("error", function(e) { self._onUploadError(e, item); }, false);
            xhr.addEventListener("abort", function(e) { self._onUploadCanceled(e, item); }, false);

            var upload = xhr.upload;
            upload.addEventListener("progress", function(e) { self._onUploadProgress(e, item); }, false);

            // TODO: encoding of special characters in file names
            var file = item.file;
            var fileName = item.fileName;
            if (window.FormData) {
                var f = new FormData();
                if (self.options.fileParameter || self.options.fileNameParameter) {
                    // Custom file and file name parameter
                    f.append(self.options.fileParameter || "file", file);
                    f.append(self.options.fileNameParameter || "fileName", fileName);
                } else {
                    f.append(fileName, file);
                }
                f.append("_charset_", "utf-8");

                xhr.open("POST", self.options.uploadUrl, true);
                xhr.send(f);
            } else {
                xhr.open("PUT", self.options.uploadUrl + "/" + fileName, true);
                xhr.send(file);
            }
        },

        /** @ignore */
        _onUploadStart: function(e, item) {
            console.log("STARTING UPLOAD OF ", item.fileName, e);
            this.$element.trigger({
                type: "fileUploadStart",
                item: item,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadProgress: function(e, item) {
            // Update progress bar
            console.log("PROGRESS OF ", item.fileName, ": ", e.loaded / e.total * 100);
            this.$element.trigger({
                type: "fileUploadProgress",
                item: item,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadLoad: function(e, item) {
            var request = e.target;
            if (request.readyState === 4) {
                // Default action
                if (CUI.util.HTTP.isOkStatus(request.status)) {
                    console.log("UPLOAD OK ", item.fileName, ": ", e.loaded / e.total * 100);
                    this.$element.trigger({
                        type: "fileUploadSuccess",
                        item: item,
                        fileUpload: this
                    });
                } else {
                    console.log("UPLOAD ERROR ", item.fileName, ": ", request.responseText);
                    this.$element.trigger({
                        type: "fileUploadError",
                        item: item,
                        errorMessage: request.responseText,
                        fileUpload: this
                    });
                }

                // Remove queue item
                this.uploadQueue.splice(this._getQueueIndex(item.fileName), 1);
                this.$element.trigger({
                    type: "queueChanged",
                    queueLength: this.uploadQueue.length,
                    fileUpload: this
                });

                // Check queue length
                if (this.uploadQueue.length === 0) {
                    this.$element.trigger({
                        type: "queueProcessed",
                        fileUpload: this
                    });
                }
            }
        },

        /** @ignore */
        _onUploadError: function(item, message) {
            console.log("ERROR WHILE UPLOADING FILE ", item.fileName);
            this.$element.trigger({
                type: "fileUploadError",
                item: item,
                errorMessage: message,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadCanceled: function(item) {
            console.log("CANCELED UPLOAD OF ", item.fileName);
            this.$element.trigger({
                type: "fileUploadCanceled",
                item: item,
                fileUpload: this
            });
        }

    });

    CUI.util.plugClass(CUI.FileUpload);

    // Data API
    if (CUI.options.dataAPI) {
        $(document).ready(function() {
            $("[data-init='fileupload']").fileUpload();
        });
    }

}(window.jQuery));
