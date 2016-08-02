/*global Vent:true */
describe('Coral.FileUpload', function() {
  'use strict';

  //Fake event to be used on a change event of the file input: _onInputChange(event)
  var event = {
    stopPropagation: function() {},
    target: {
      files: [
        {
          name: 'file',
          size: 10000000,
          type: 'image/png'
        }
      ]
    }
  };
  var eventMultipleFiles = {
    stopPropagation: function() {},
    target: {
      files: [
        {
          name: 'file1',
          size: 100000,
          type: 'application/pdf'
        },
        {
          name: 'file2',
          size: 10000,
          type: 'image/png'
        },
        {
          name: 'file3',
          size: 1000,
          type: 'image/jpg'
        }
      ]
    }
  };

  describe('namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('FileUpload');
    });
  });

  describe('attributes', function() {

    it('should retrieve and set additional parameters', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.additionalParams.html'], function() {
        expect(fileUpload.parameters.length).to.equal(1);
        fileUpload.parameters.forEach(function(item) {
          expect(item.name).to.equal('name');
          expect(item.value).to.equal('value');
          done();
        });
      });
    });

    it('should set additional parameters that have name and value property', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.parameters = [
          {
            name: 'name',
            value: 'value'
          }
        ];
        helpers.next(function() {
          expect(fileUpload.parameters.length).to.equal(1);
          fileUpload.parameters.forEach(function(item) {
            expect(item.name).to.equal('name');
            expect(item.value).to.equal('value');
            done();
          });
        });
      });
    });

    it('should add hidden inputs mapped to parameters on synchronous mode', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.parameters = [
          {
            name: 'name',
            value: 'value'
          }
        ];
        fileUpload.async = false;
        helpers.next(function() {
          var param = fileUpload.parameters[0];
          Array.prototype.forEach.call(fileUpload.querySelectorAll('input[type="hidden"]'), function(input) {
            expect(input.name).to.equal(param.name);
            expect(input.value).to.equal(param.value);
            done();
          });

        });
      });
    });

    it('should not allow additional parameters without name and value or not an array', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.additionalParams.html'], function() {
        fileUpload.parameters = [
          {
            x: 'name',
            y: 'value'
          }
        ];
        fileUpload.parameters = {
          x: 'name',
          y: 'value'
        };
        helpers.next(function() {
          expect(fileUpload.parameters.length).to.equal(1);
          done();
        });
      });
    });

    it.skip('should disable the file input', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.disabled = true;
        fileUpload.on('coral-fileupload:drop', eventSpy);
        fileUpload.on('coral-fileupload:dragover', eventSpy);
        fileUpload.on('coral-fileupload:dragleave', eventSpy);
        fileUpload.on('coral-fileupload:dragenter', eventSpy);

        helpers.next(function() {
          expect(fileUpload.$.find('input[type="file"]')).to.have.attr('disabled', 'disabled');
          fileUpload.trigger('drop');

          helpers.next(function() {
            expect(eventSpy.callCount).to.equal(0);
            done();
          });
        });
      });
    });

    it('should invalid the file input', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.invalid = true;
        helpers.next(function() {
          expect(fileUpload.$).to.have.class('is-invalid');
          expect(fileUpload.$.find('input[type="file"]')).to.have.attr('aria-invalid', 'true');
          done();
        });
      });
    });

    it('should set file input to required', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.required = true;
        helpers.next(function() {
          expect(fileUpload.$.find('input[type="file"]')).to.have.attr('required');
          done();
        });
      });
    });

    it('should set the file input to readonly', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.readOnly = true;
        helpers.next(function() {
          expect(fileUpload.$.find('input[type="file"]')).to.have.attr('disabled');
          done();
        });
      });
    });

    it.skip('should set dropZone to fileupload by default and attach events accordingly', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        //Default dropZone is set to fileupload
        expect(fileUpload.dropZone).to.equal(fileUpload);

        fileUpload.on('coral-fileupload:drop', eventSpy);
        fileUpload.on('coral-fileupload:dragover', eventSpy);
        fileUpload.on('coral-fileupload:dragleave', eventSpy);
        fileUpload.on('coral-fileupload:dragenter', eventSpy);
        fileUpload.trigger('drop');
        fileUpload.trigger('dragover');
        fileUpload.trigger('dragleave');
        fileUpload.trigger('dragenter');

        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(4);
          done();
        });
      });
    });

    it('should set multiple attribute to the input file', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        expect(fileUpload.$.find('input[type="file"]')).to.not.have.attr('multiple');
        fileUpload.multiple = true;
        helpers.next(function() {
          expect(fileUpload.$.find('input[type="file"]')).to.have.attr('multiple', 'multiple');
          done();
        });
      });
    });

    it('should not be possible to select multiple files if multiple is false', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        expect(fileUpload.multiple).to.be.false;
        fileUpload._onInputChange(eventMultipleFiles);
        helpers.next(function() {
          expect(fileUpload.uploadQueue.length).to.equal(1);
          expect(fileUpload.uploadQueue[0].file.name).to.equal(eventMultipleFiles.target.files[0].name);
          expect(fileUpload.uploadQueue[0].file.size).to.equal(eventMultipleFiles.target.files[0].size);
          expect(fileUpload.uploadQueue[0].file.type).to.equal(eventMultipleFiles.target.files[0].type);
          done();
        });
      });
    });

    it('should not be possible to set uploadQueue', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        expect(fileUpload.multiple).to.be.false;
        fileUpload._onInputChange(eventMultipleFiles);
        helpers.next(function() {
          fileUpload.uploadQueue = [];
          expect(fileUpload.uploadQueue.length).to.equal(1);
          done();
        });
      });
    });

    it('should throw an exception if setting a value different than empty string', function(done) {
      var input = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        try {
          input.value = 'value';
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
      });
      done();
    });

    it('should clear all selected files if setting values to empty array or [""] or [null]', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        expect(fileUpload.values.length).to.equal(eventMultipleFiles.target.files.length);
        fileUpload.values = [];
        expect(fileUpload.values.length).to.equal(0);

        fileUpload._onInputChange(eventMultipleFiles);
        expect(fileUpload.values.length).to.equal(eventMultipleFiles.target.files.length);
        fileUpload.values = [null];
        expect(fileUpload.values.length).to.equal(0);

        fileUpload._onInputChange(eventMultipleFiles);
        expect(fileUpload.values.length).to.equal(eventMultipleFiles.target.files.length);
        fileUpload.values = [''];
        expect(fileUpload.values.length).to.equal(0);
        done();
      });
    });

    it('should throw an exception if setting values different than empty string', function(done) {
      var input = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        try {
          input.values = ['value'];
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
      });
      done();
    });

    it('should retrieve filename values for all selected items if multiple is true', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        expect(fileUpload.values.length).to.equal(eventMultipleFiles.target.files.length);
        for (var i = 0; i < eventMultipleFiles.target.files.length; i++) {
          expect(fileUpload.values[i]).to.equal('C:\\fakepath\\' + eventMultipleFiles.target.files[i].name);
        }
        done();
      });
    });

    it('should retrieve single filename from values for selected item if multiple is false', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        expect(fileUpload.multiple).to.be.false;
        fileUpload._onInputChange(eventMultipleFiles);
        expect(fileUpload.values.length).to.equal(1);
        expect(fileUpload.values[0]).to.equal('C:\\fakepath\\' + eventMultipleFiles.target.files[0].name);
        done();
      });
    });

    it('should set the name of the file input', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.name = 'name';
        helpers.next(function() {
          expect(fileUpload.$.find('input[type="file"]')).to.attr('name', 'name');
          done();
        });
      });
    });

    it('should set the default name "file" to the files uploading', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.autoStart = true;
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal('file');
          done();
        });
      });
    });

    it('should set mimetype restrictions to the file input', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.accept = '.txt';
        helpers.next(function() {
          expect(fileUpload.$.find('input[type="file"]').attr('accept')).to.equal('.txt');
          done();
        });
      });
    });

    it('should set autoStart to false by default', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        expect(fileUpload.autoStart).to.equal(false);
        fileUpload.autoStart = true;
        helpers.next(function() {
          expect(fileUpload.autoStart).to.equal(true);
          done();
        });
      });
    });

    it('should set useXHR2 to true if HTML5 browser support', function(done) {
      var xhr = new XMLHttpRequest();
      var html5UploadSupported = !!(xhr && ('upload' in xhr) && ('onprogress' in xhr.upload));

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        expect(fileUpload._useXHR2).to.equal(html5UploadSupported);
        done();
      });
    });

    it('should clear the file selection if calling clear() whether async or not', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        fileUpload.clear();
        expect(fileUpload.uploadQueue.length).to.equal(0);

        fileUpload.async = false;
        fileUpload._onInputChange(eventMultipleFiles);
        fileUpload.clear();
        expect(fileUpload.uploadQueue.length).to.equal(0);
        done();
      });
    });

    it('should remove all selected files if setting async to a new value', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        fileUpload.async = false;
        expect(fileUpload._elements.input.value).to.equal('');
        expect(fileUpload.uploadQueue.length).to.equal(0);
        done();
      });
    });

    it('should throw an error if trying to remove a file from the upload queue on synchronous mode', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.async = false;
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        try {
          fileUpload.clear(fileUpload.uploadQueue[0].file.name);
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
        try {
          fileUpload._onRemoveFileClick();
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
        done();
      });
    });

    it('should throw an error if trying to upload a file on synchronous mode', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.async = false;
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        try {
          fileUpload.upload(fileUpload.uploadQueue[0].file.name);
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
        try {
          fileUpload._onUploadFileClick();
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
        done();
      });
    });

    it('should throw an error if trying to abort a file upload on synchronous mode', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.async = false;
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        try {
          fileUpload.abort(fileUpload.uploadQueue[0].file.name);
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
        try {
          fileUpload._onAbortFileClick();
        } catch (e) {
          expect(e.message.indexOf('Coral.FileUpload')).to.equal(0);
        }
        done();
      });
    });
  });

  describe('Special attributes', function() {
    it('should set classes and enable/disable when state changes', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.specialAttributes.html'], function() {
        var $select = fileUpload.$.find('[coral-fileupload-select]');
        var $clear = fileUpload.$.find('[coral-fileupload-clear]');
        var $submit = fileUpload.$.find('[coral-fileupload-submit]');
        var $abort = fileUpload.$.find('[coral-fileupload-abort]');
        var $removeFile = fileUpload.$.find('[coral-fileupload-removefile]');
        var $uploadFile = fileUpload.$.find('[coral-fileupload-uploadfile]');
        var $abortFile = fileUpload.$.find('[coral-fileupload-abortfile]');

        fileUpload.disabled = true;

        helpers.next(function() {
          expect($select).to.have.class('is-disabled');
          expect($clear).to.have.class('is-disabled');
          expect($submit).to.have.class('is-disabled');
          expect($abort).to.have.class('is-disabled');
          expect($removeFile).to.have.class('is-disabled');
          expect($uploadFile).to.have.class('is-disabled');
          expect($abortFile).to.have.class('is-disabled');

          expect($select).to.have.attr('disabled');
          expect($clear).to.have.attr('disabled');
          expect($submit).to.have.attr('disabled');
          expect($abort).to.have.attr('disabled');
          expect($removeFile).to.have.attr('disabled');
          expect($uploadFile).to.have.attr('disabled');
          expect($abortFile).to.have.attr('disabled');
          done();
        });
      });
    });

    it('should trigger upload when a [coral-fileupload-submit] element is clicked', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.submit.html'], function() {
        fileUpload._onInputChange(event);
        fileUpload.on('coral-fileupload:loadstart', eventSpy);

        fileUpload.querySelector('[coral-fileupload-submit]').click();

        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);

          expect(eventSpy.args[0][0].detail.action).to.equal('/upload');

          done();
        });
      });
    });

    it('should set the upload URL when a [coral-fileupload-submit][formaction] element is clicked', function(done) {

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.formAction.html'], function() {
        fileUpload._onInputChange(event);

        var eventSpy = sinon.spy();
        fileUpload.on('coral-fileupload:loadstart', eventSpy);

        fileUpload.querySelector('#uploadToMedia').click();

        expect(eventSpy.callCount).to.equal(1, 'spy was called');
        expect(eventSpy.args[0][0].detail.action).to.equal('/media');

        fileUpload.abort();
        eventSpy.reset();

        fileUpload.querySelector('#uploadToDefault').click();

        expect(eventSpy.callCount).to.equal(1, 'spy was called');
        expect(eventSpy.args[0][0].detail.action).to.equal('/files');

        done();
      });
    });

    it('should set the upload method when a [coral-fileupload-submit][formmethod] element is clicked', function(done) {

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.formMethod.html'], function() {
        fileUpload._onInputChange(event);

        var eventSpy = sinon.spy();
        fileUpload.on('coral-fileupload:loadstart', eventSpy);

        fileUpload.querySelector('#uploadAsPUT').click();

        expect(eventSpy.callCount).to.equal(1, 'spy was called');
        expect(eventSpy.args[0][0].detail.method).to.equal('PUT');

        fileUpload.abort();
        eventSpy.reset();

        fileUpload.querySelector('#uploadAsDefault').click();

        expect(eventSpy.callCount).to.equal(1, 'spy was called');
        expect(eventSpy.args[0][0].detail.method).to.equal('POST');

        done();
      });
    });

    it('should abort the file upload when a [coral-fileupload-abortfile][filename] element is clicked', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.specialAttributes.html'], function() {
        fileUpload._onInputChange(event);
        fileUpload.querySelector('[coral-fileupload-abortfile]').click();
        helpers.next(function() {
          expect(fileUpload.uploadQueue[0]._xhr).to.equal(null);
          done();
        });
      });
    });

    it('should remove the file from the queue when a [coral-fileupload-removefile][filename] element is clicked', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.specialAttributes.html'], function() {
        fileUpload._onInputChange(event);
        fileUpload.querySelector('[coral-fileupload-removefile]').click();
        helpers.next(function() {
          expect(fileUpload.uploadQueue.length).to.equal(0);
          done();
        });
      });
    });

    it('should state the file upload when a [coral-fileupload-uploadfile][filename] element is clicked', function(done) {
      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.specialAttributes.html'], function() {
        var eventSpy = sinon.spy();
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
        fileUpload._onInputChange(event);
        fileUpload.querySelector('[coral-fileupload-uploadfile]').click();
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });
  });

  describe('Events', function() {

    it('should trigger change event', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.on('change', eventSpy);
        fileUpload._onInputChange(event);

        var target = eventSpy.args[0][0].target;
        expect(fileUpload).to.equal(target);
        done();
      });
    });

    it('should not be possible to select items if disabled', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.disabled = true;
        fileUpload.on('change', eventSpy);
        fileUpload._onInputChange(event);

        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(0);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:fileadded event', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.on('coral-fileupload:fileadded', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:loadstart if calling upload()', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
        fileUpload._onInputChange(event);
        fileUpload.upload();
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          expect(item._xhr).to.not.equal(null);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:loadstart if autoStart is set to true', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.autoStart = true;
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:loadstart if calling upload(filename)', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
        fileUpload._onInputChange(event);
        fileUpload.upload(event.target.files[0].name);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          expect(eventSpy.args[0][0].detail.action).to.equal('test.php');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:abort if calling abort()', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.autoStart = true;
        fileUpload.on('coral-fileupload:abort', eventSpy);
        fileUpload._onInputChange(event);
        fileUpload.abort();
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          expect(eventSpy.args[0][0].detail.action).to.equal('test.php');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:abort if calling abort(filename)', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.autoStart = true;
        fileUpload.on('coral-fileupload:abort', eventSpy);
        fileUpload._onInputChange(event);
        fileUpload.abort(event.target.files[0].name);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          expect(eventSpy.args[0][0].detail.action).to.equal('test.php');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:fileremoved if calling clear(filename)', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.autoStart = true;
        fileUpload._onInputChange(event);
        fileUpload.on('coral-fileupload:fileremoved', eventSpy);
        fileUpload.clear(event.target.files[0].name);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:filesizeexceeded event', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.sizeLimit = 1000;
        fileUpload.on('coral-fileupload:filesizeexceeded', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it('should detect if mime type is allowed or not and trigger accordingly', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.accept = 'text/plain, .jpg, application';
        fileUpload.on('coral-fileupload:filemimetyperejected', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1);
          done();
        });
      });
    });

    it('should allow wildcard mime types', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.accept = '.*';
        fileUpload.on('coral-fileupload:filemimetyperejected', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(0);
          done();
        });
      });
    });

    it('should allow to add files with unrecognized browser mime types', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.accept = '.zureuwopwlkf';
        fileUpload.on('coral-fileupload:fileadded', eventSpy);

        var e = {
          stopPropagation: event.stopPropagation,
          target: event.target
        };
        e.target.files[0] = new window.File([], 'file.zureuwopwlkf');
        fileUpload._onInputChange(e);

        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');
          expect(fileUpload.uploadQueue.length).to.equal(1);
          done();
        });
      });
    });

    it('should trigger coral-fileupload:[dragenter, dragover, dragleave, drop]', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.dropzone.html'], function() {
        fileUpload.on('coral-fileupload:dragenter', eventSpy);
        fileUpload.on('coral-fileupload:dragover', eventSpy);
        fileUpload.on('coral-fileupload:dragleave', eventSpy);
        fileUpload.on('coral-fileupload:drop', eventSpy);

        var vent1 = new Vent(fileUpload.querySelector('[coral-fileupload-dropzone]'));
        var vent2 = new Vent(fileUpload.querySelector('[handle="input"]'));
        vent1.dispatch('dragenter');
        vent1.dispatch('dragover');
        vent2.dispatch('dragleave');
        vent2.dispatch('drop');

        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(4);
          done();
        });
      });
    });

    it.skip('should trigger coral-fileupload:progress', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.autoStart = true;
        fileUpload.on('coral-fileupload:progress', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });

    it.skip('should trigger coral-fileupload:error', function(done) {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['Coral.FileUpload.base.html'], function() {
        fileUpload.autoStart = true;
        fileUpload.on('coral-fileupload:error', eventSpy);
        fileUpload._onInputChange(event);
        helpers.next(function() {
          expect(eventSpy.callCount).to.equal(1, 'spy was called');

          var item = eventSpy.args[0][0].detail.item;
          expect(item.file.name).to.equal(event.target.files[0].name);
          expect(item.file.size).to.equal(event.target.files[0].size);
          expect(item.file.type).to.equal(event.target.files[0].type);
          expect(item.file.type).to.equal(event.target.files[0].type);
          done();
        });
      });
    });
  });

  describe('Implementation Details', function() {
    describe('#formField', function() {
      // FileUpload does not support setting value other than empty string or null
      helpers.testFormField(window.__html__['Coral.FileUpload.base.html'], {
        value: ''
      });
    });
  });
});
