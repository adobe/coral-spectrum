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
         @param {String}   [options.name="file"]                      (Optional) name for an underlying form field.
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
            name: "file",
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

            // If current element is input field -> wrap it into SPAN
            if (this.$element.get(0).tagName === "INPUT") {
                var span = $("<span></span>");
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
                this._registerEventHandler("fileselected", function(event) {
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
                            name: self.options.name,
                            multiple: self.options.multiple
                        }
                    )
                );
            }
        },

        /** @ignore */
        _readDataFromMarkup: function() {
            var self = this;
            if (this.$element.attr("name")) {
                this.options.name = this.$element.attr("name");
            }
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
                this.options.autoStart = true;
            }
            if (this.$element.attr("data-file-parameter")) {
                this.options.fileParameter = this.$element.attr("data-file-parameter");
            }
            if (this.$element.attr("data-file-name-parameter")) {
                this.options.fileNameParameter = this.$element.attr("data-file-name-parameter");
            }
            $.each(this.$element.get(0).attributes, function(i, attribute) {
                var match = /^data-event-(.*)$/.exec(attribute.name);
                if (match && match.length > 1) {
                    var eventHandler = CUI.util.buildFunction(attribute.value, ["event"]);
                    if (eventHandler) {
                        self.options.events[match[1]] = eventHandler.bind(self);
                    }
                }
            });
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
            var addedCount = 0, rejectedCount = 0;
            var files = event.target.files;
            for (var i = 0; i < files.length; i++) {
                if (this._addFile(files[i])) {
                    addedCount++;
                } else {
                    rejectedCount++;
                }
            }

            this.$element.trigger({
                type: "filelistprocessed",
                addedCount: addedCount,
                rejectedCount: rejectedCount,
                fileUpload: this
            });
        },

        /** @ignore */
        _addFile: function(file) {
            var self = this;

            var fileName = file.name ? file.name : file;
            if (!self._getQueueItemByFileName(fileName)) {
                var item = {
                    file: file,
                    fileName: fileName,
                    fileSize: file.size
                };

                // Check file size
                if (self.options.sizeLimit && file.size > self.options.sizeLimit) {
                    self.$element.trigger({
                        type: "filerejected",
                        item: item,
                        message: "File is too big",
                        fileUpload: self
                    });
                    return false;
                }

                // Add item to queue
                self.uploadQueue.push(item);
                self.$element.trigger({
                    type: "queuechanged",
                    item: item,
                    operation: "ADD",
                    queueLength: self.uploadQueue.length,
                    fileUpload: self
                });

                self.$element.trigger({
                    type: "fileselected",
                    item: item,
                    fileUpload: self
                });

                return true;
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
                    f.append(self.options.fileParameter || self.options.name, file);
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
            this.$element.trigger({
                type: "fileuploadstart",
                item: item,
                originalEvent: e,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadProgress: function(e, item) {
            // Update progress bar
            this.$element.trigger({
                type: "fileuploadprogress",
                item: item,
                originalEvent: e,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadLoad: function(e, item) {
            var request = e.target;
            if (request.readyState === 4) {
                // Default action
                if (CUI.util.HTTP.isOkStatus(request.status)) {
                    this.$element.trigger({
                        type: "fileuploadsuccess",
                        item: item,
                        originalEvent: e,
                        fileUpload: this
                    });
                } else {
                    this.$element.trigger({
                        type: "fileuploaderror",
                        item: item,
                        originalEvent: e,
                        message: request.responseText,
                        fileUpload: this
                    });
                }

                // Remove queue item
                this.uploadQueue.splice(this._getQueueIndex(item.fileName), 1);
                this.$element.trigger({
                    type: "queuechanged",
                    item: item,
                    operation: "REMOVE",
                    queueLength: this.uploadQueue.length,
                    fileUpload: this
                });
            }
        },

        /** @ignore */
        _onUploadError: function(e, item) {
            this.$element.trigger({
                type: "fileuploaderror",
                item: item,
                originalEvent: e,
                fileUpload: this
            });
        },

        /** @ignore */
        _onUploadCanceled: function(e, item) {
            this.$element.trigger({
                type: "fileuploadcanceled",
                item: item,
                originalEvent: e,
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
