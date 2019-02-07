import {helpers} from '../../../coral-utils/src/tests/helpers';
describe('FileUpload', function() {
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
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible to clone the element using markup',
      window.__html__['FileUpload.base.html']
    );
    
    helpers.cloneComponent(
      'should be possible to clone the element with special attributes',
      window.__html__['FileUpload.specialAttributes.html']
    );
  });

  describe('Markup', function() {
    
    describe('#parameters', function() {
      it('should retrieve and set additional parameters', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.additionalParams.html']);
        expect(fileUpload.parameters.length).to.equal(1);
        fileUpload.parameters.forEach(function(item) {
          expect(item.name).to.equal('name');
          expect(item.value).to.equal('value');
        });
      });
    });
  });
  
  describe('API', function() {
    
    describe('#parameters', function() {
      it('should set additional parameters that have name and value property', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.parameters = [
          {
            name: 'name',
            value: 'value'
          }
        ];
    
        expect(fileUpload.parameters.length).to.equal(1);
    
        fileUpload.parameters.forEach(function(item) {
          expect(item.name).to.equal('name');
          expect(item.value).to.equal('value');
        });
      });
  
      it('should add hidden inputs mapped to parameters on synchronous mode', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.parameters = [
          {
            name: 'name',
            value: 'value'
          }
        ];
        fileUpload.async = false;
    
        var param = fileUpload.parameters[0];
    
        Array.prototype.forEach.call(fileUpload.querySelectorAll('input[type="hidden"]'), function(input) {
          expect(input.name).to.equal(param.name);
          expect(input.value).to.equal(param.value);
        });
      });
  
      it('should not allow additional parameters without name and value or not an array', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.additionalParams.html']);
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
    
        expect(fileUpload.parameters.length).to.equal(1);
      });
    });
    
    describe('#disabled', function() {
      it('should disable the file input', function() {
        var eventSpy = sinon.spy();
    
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.disabled = true;
        fileUpload.on('coral-fileupload:drop', eventSpy);
        fileUpload.on('coral-fileupload:dragover', eventSpy);
        fileUpload.on('coral-fileupload:dragleave', eventSpy);
        fileUpload.on('coral-fileupload:dragenter', eventSpy);
        
        expect(fileUpload.querySelector('input[type="file"]').hasAttribute('disabled')).to.be.true;
        fileUpload.trigger('drop');
        
        expect(eventSpy.callCount).to.equal(0);
      });
    });
    
    describe('#invalid', function() {
      it('should invalid the file input', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.invalid = true;
        
        expect(fileUpload.classList.contains('is-invalid')).to.be.true;
        expect(fileUpload.querySelector('input[type="file"]').getAttribute('aria-invalid')).to.equal('true');
      });
  
      it('should set file input to required', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.required = true;
        
        expect(fileUpload.querySelector('input[type="file"]').hasAttribute('required')).to.be.true;
      });
    });
    
    describe('#readOnly', function() {
      it('should set the file input to readonly', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.readOnly = true;
        
        expect(fileUpload.querySelector('input[type="file"]').hasAttribute('disabled')).to.be.true;
      });
    });
    
    describe('#multiple', function() {
      it('should set multiple attribute to the input file', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        expect(fileUpload.querySelector('input[type="file"]').hasAttribute('multiple')).to.be.false;
        fileUpload.multiple = true;
        
        expect(fileUpload.querySelector('input[type="file"]').hasAttribute('multiple')).to.be.true;
      });
  
      it('should not be possible to select multiple files if multiple is false', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        expect(fileUpload.multiple).to.be.false;
        fileUpload._onInputChange(eventMultipleFiles);
        
        expect(fileUpload.uploadQueue.length).to.equal(1);
        expect(fileUpload.uploadQueue[0].file.name).to.equal(eventMultipleFiles.target.files[0].name);
        expect(fileUpload.uploadQueue[0].file.size).to.equal(eventMultipleFiles.target.files[0].size);
        expect(fileUpload.uploadQueue[0].file.type).to.equal(eventMultipleFiles.target.files[0].type);
      });
    });
    
    describe('#uploadQueue', function() {
      it('should not be possible to set uploadQueue', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        expect(fileUpload.multiple).to.be.false;
        fileUpload._onInputChange(eventMultipleFiles);
        
        try {
          fileUpload.uploadQueue = [];
        }
        catch (e) {
          expect(fileUpload.uploadQueue.length).to.equal(1);
        }
      });
    });

    describe('#value', function() {
      it('should throw an exception if setting a value different than empty string', function() {
        var input = helpers.build(window.__html__['FileUpload.base.html']);
        try {
          input.value = 'value';
        }
        catch (e) {
          expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
        }
      });
      
      describe('#values', function() {
        it('should clear all selected files if setting values to empty array or [""] or [null]', function() {
          var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
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
        });
      });
  
      it('should throw an exception if setting values different than empty string', function() {
        var input = helpers.build(window.__html__['FileUpload.base.html']);
        try {
          input.values = ['value'];
        }
        catch (e) {
          expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
        }
      });
  
      it('should retrieve filename values for all selected items if multiple is true', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        
        expect(fileUpload.values.length).to.equal(eventMultipleFiles.target.files.length);
        for (var i = 0; i < eventMultipleFiles.target.files.length; i++) {
          expect(fileUpload.values[i]).to.equal('C:\\fakepath\\' + eventMultipleFiles.target.files[i].name);
        }
      });
  
      it('should retrieve single filename from values for selected item if multiple is false', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        expect(fileUpload.multiple).to.be.false;
        fileUpload._onInputChange(eventMultipleFiles);
        
        expect(fileUpload.values.length).to.equal(1);
        expect(fileUpload.values[0]).to.equal('C:\\fakepath\\' + eventMultipleFiles.target.files[0].name);
      });
    });
    
    describe('#name', function() {
      it('should set the name of the file input', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.name = 'name';
        
        expect(fileUpload.querySelector('input[type="file"]').hasAttribute('name')).to.be.true;
      });
  
      it('should set the default name "file" to the files uploading', function() {
        var eventSpy = sinon.spy();
    
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.autoStart = true;
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
        fileUpload._onInputChange(event);
        
        expect(eventSpy.callCount).to.equal(1, 'spy was called');
        
        var item = eventSpy.args[0][0].detail.item;
        expect(item.file.name).to.equal('file');
      });
    });
    
    describe('#accept', function() {
      it('should set mimetype restrictions to the file input', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.accept = '.txt';
        
        expect(fileUpload.querySelector('input[type="file"]').getAttribute('accept')).to.equal('.txt');
      });
    });
    
    describe('#autoStart', function() {
      it('should set autoStart to false by default', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        expect(fileUpload.autoStart).to.equal(false);
        fileUpload.autoStart = true;
        
        expect(fileUpload.autoStart).to.equal(true);
      });
    });

    describe('#clear()', function() {
      it('should clear the file selection if calling clear() whether async or not', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        fileUpload.clear();
        expect(fileUpload.uploadQueue.length).to.equal(0);
      
        fileUpload.async = false;
        fileUpload._onInputChange(eventMultipleFiles);
        fileUpload.clear();
        expect(fileUpload.uploadQueue.length).to.equal(0);
      });
    });

    describe('#async', function() {
      it('should remove all selected files if setting async to a new value', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
        fileUpload.async = false;
        
        expect(fileUpload._elements.input.value).to.equal('');
        expect(fileUpload.uploadQueue.length).to.equal(0);
      });
  
      it('should throw an error if trying to remove a file from the upload queue on synchronous mode', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.async = false;
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
  
        try {
          fileUpload.clear(fileUpload.uploadQueue[0].file.name);
        }
        catch (e) {
          expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
        }
  
        try {
          fileUpload._onRemoveFileClick();
        }
        catch (e) {
          expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
        }
      });
  
      it('should throw an error if trying to upload a file on synchronous mode', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
        fileUpload.async = false;
        fileUpload.multiple = true;
        fileUpload._onInputChange(eventMultipleFiles);
  
        try {
          fileUpload.upload(fileUpload.uploadQueue[0].file.name);
        }
        catch (e) {
          expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
        }
        
        try {
          fileUpload._onUploadFileClick();
        }
        catch (e) {
          expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
        }
      });
    });

    it('should throw an error if trying to abort a file upload on synchronous mode', function() {
      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.async = false;
      fileUpload.multiple = true;
      fileUpload._onInputChange(eventMultipleFiles);
      
      try {
        fileUpload.abort(fileUpload.uploadQueue[0].file.name);
      }
      catch (e) {
        expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
      }
      
      try {
        fileUpload._onAbortFileClick();
      }
      catch (e) {
        expect(e.message.indexOf('FileUpload') !== -1).to.be.true;
      }
    });

    describe('#labelledBy' , function() {
      it('should set aria-labelledby on input', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.inputs.html']);
        fileUpload.labelledBy = 'label-id';
        
        expect(fileUpload._elements.input.getAttribute('aria-labelledby'))
          .to.equal('label-id ' + fileUpload.querySelector('[coral-fileupload-select]').id);

        fileUpload.labelledBy = undefined;
        
        expect(fileUpload._elements.input.getAttribute('aria-labelledby'))
          .to.equal(fileUpload.querySelector('[coral-fileupload-select]').id);
      });
    });
    
    describe('#[coral-fileupload-submit]', function() {
      it('should trigger upload when a [coral-fileupload-submit] element is clicked', function() {
        var eventSpy = sinon.spy();
    
        var fileUpload = helpers.build(window.__html__['FileUpload.submit.html']);
        fileUpload._onInputChange(event);
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
    
        fileUpload.querySelector('[coral-fileupload-submit]').click();
    
        expect(eventSpy.callCount).to.equal(1);
        expect(eventSpy.args[0][0].detail.action).to.equal('#fake');
      });
  
      it('should set the upload URL when a [coral-fileupload-submit][formaction] element is clicked', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.formAction.html']);
        fileUpload._onInputChange(event);
    
        var eventSpy = sinon.spy();
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
    
        fileUpload.querySelector('#uploadToMedia').click();
    
        expect(eventSpy.callCount).to.equal(1, 'spy was called');
        expect(eventSpy.args[0][0].detail.action).to.equal('#fake2');
    
        fileUpload.abort();
        eventSpy.reset();
    
        fileUpload.querySelector('#uploadToDefault').click();
    
        expect(eventSpy.callCount).to.equal(1, 'spy was called');
        expect(eventSpy.args[0][0].detail.action).to.equal('#fake1');
      });
  
      it('should set the upload method when a [coral-fileupload-submit][formmethod] element is clicked', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.formMethod.html']);
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
      });
    });
    
    describe('#[coral-fileupload-abortfile]', function() {
      it('should abort the file upload when a [coral-fileupload-abortfile][filename] element is clicked', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.specialAttributes.html']);
        fileUpload._onInputChange(event);
        fileUpload.querySelector('[coral-fileupload-abortfile]').click();
    
        expect(fileUpload.uploadQueue[0]._xhr).to.equal(null);
      });
    });
    
    describe('#[coral-fileupload-removefile]', function() {
      it('should remove the file from the queue when a [coral-fileupload-removefile][filename] element is clicked', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.specialAttributes.html']);
        fileUpload._onInputChange(event);
        fileUpload.querySelector('[coral-fileupload-removefile]').click();
    
        expect(fileUpload.uploadQueue.length).to.equal(0);
      });
    });
    
    describe('#[coral-fileupload-uploadfile]', function() {
      it('should state the file upload when a [coral-fileupload-uploadfile][filename] element is clicked', function() {
        var fileUpload = helpers.build(window.__html__['FileUpload.specialAttributes.html']);
        var eventSpy = sinon.spy();
        fileUpload.on('coral-fileupload:loadstart', eventSpy);
        fileUpload._onInputChange(event);
        fileUpload.querySelector('[coral-fileupload-uploadfile]').click();
    
        expect(eventSpy.callCount).to.equal(1);
      });
    });
  });

  describe('Events', function() {

    it('should trigger change event', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.on('change', eventSpy);
      fileUpload._onInputChange(event);

      var target = eventSpy.args[0][0].target;
      expect(fileUpload).to.equal(target);
    });

    it('should not be possible to select items if disabled', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.disabled = true;
      fileUpload.on('change', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(0);
    });

    it('should trigger coral-fileupload:fileadded event', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.on('coral-fileupload:fileadded', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });
    
    it('should trigger coral-fileupload:loadstart if calling upload()', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.on('coral-fileupload:loadstart', eventSpy);
      fileUpload._onInputChange(event);
      fileUpload.upload();
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
      expect(item._xhr).to.not.equal(null);
    });

    it('should trigger coral-fileupload:loadstart if autoStart is set to true', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.autoStart = true;
      fileUpload.on('coral-fileupload:loadstart', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });

    it('should trigger coral-fileupload:loadstart if calling upload(filename)', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.on('coral-fileupload:loadstart', eventSpy);
      fileUpload._onInputChange(event);
      fileUpload.upload(event.target.files[0].name);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');
      expect(eventSpy.args[0][0].detail.action).to.equal('#fake');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });

    it('should trigger coral-fileupload:abort if calling abort()', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.autoStart = true;
      fileUpload.on('coral-fileupload:abort', eventSpy);
      fileUpload._onInputChange(event);
      fileUpload.abort();
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      expect(eventSpy.args[0][0].detail.action).to.equal('#fake');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });

    it('should trigger coral-fileupload:abort if calling abort(filename)', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.autoStart = true;
      fileUpload.on('coral-fileupload:abort', eventSpy);
      fileUpload._onInputChange(event);
      fileUpload.abort(event.target.files[0].name);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');
      expect(eventSpy.args[0][0].detail.action).to.equal('#fake');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });

    it('should trigger coral-fileupload:fileremoved if calling clear(filename)', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.autoStart = true;
      fileUpload._onInputChange(event);
      fileUpload.on('coral-fileupload:fileremoved', eventSpy);
      fileUpload.clear(event.target.files[0].name);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });

    it('should trigger coral-fileupload:filesizeexceeded event', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.sizeLimit = 1000;
      fileUpload.on('coral-fileupload:filesizeexceeded', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });

    it('should detect if mime type is allowed or not and trigger accordingly', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.accept = 'text/plain, .jpg, application';
      fileUpload.on('coral-fileupload:filemimetyperejected', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(1);
    });

    it('should allow wildcard mime types', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.accept = '.*';
      fileUpload.on('coral-fileupload:filemimetyperejected', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(0);
    });

    it('should allow to add files with unrecognized browser mime types', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.accept = '.zureuwopwlkf';
      fileUpload.on('coral-fileupload:fileadded', eventSpy);

      var e = {
        stopPropagation: event.stopPropagation,
        target: event.target
      };
      e.target.files[0] = new window.File([], 'file.zureuwopwlkf');
      fileUpload._onInputChange(e);

     
      expect(eventSpy.callCount).to.equal(1, 'spy was called');
      expect(fileUpload.uploadQueue.length).to.equal(1);
    });

    it('should trigger coral-fileupload:[dragenter, dragover, dragleave, drop]', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.dropzone.html']);
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
      
      expect(eventSpy.callCount).to.equal(4);
    });

    // @todo find a way to simulate xhr progress
    it.skip('should trigger coral-fileupload:progress', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.autoStart = true;
      fileUpload.on('coral-fileupload:progress', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });
  
    // @todo find a way to simulate xhr error
    it.skip('should trigger coral-fileupload:error', function() {
      var eventSpy = sinon.spy();

      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      fileUpload.autoStart = true;
      fileUpload.on('coral-fileupload:error', eventSpy);
      fileUpload._onInputChange(event);
      
      expect(eventSpy.callCount).to.equal(1, 'spy was called');

      var item = eventSpy.args[0][0].detail.item;
      expect(item.file.name).to.equal(event.target.files[0].name);
      expect(item.file.size).to.equal(event.target.files[0].size);
      expect(item.file.type).to.equal(event.target.files[0].type);
      expect(item.file.type).to.equal(event.target.files[0].type);
    });
  });

  describe('Implementation Details', function() {
    it('should set classes and enable/disable when state changes', function() {
      var fileUpload = helpers.build(window.__html__['FileUpload.specialAttributes.html']);
      var attributes = ['select', 'clear', 'submit', 'abort', 'removefile', 'uploadfile', 'abortfile'];
      var items = [];
      attributes.forEach(function(name) {
        items.push(fileUpload.querySelector('[coral-fileupload-' + name + ']'));
      });
    
      fileUpload.disabled = true;
    
      items.forEach(function(item) {
        expect(item.classList.contains('is-disabled')).to.be.true;
        expect(item.hasAttribute('disabled')).to.be.true;
      });
    });
    
    describe('#formField', function() {
      // FileUpload does not support setting value other than empty string or null
      helpers.testFormField(window.__html__['FileUpload.base.html'], {
        value: ''
      });
    });

    it('should not stop propagation of inputs that are not controlled by the component', function() {
      const el = helpers.build(window.__html__['FileUpload.inputs.html']);
      var changeSpy = sinon.spy();

      el.on('change', 'input', changeSpy);

      var input = el.querySelector('input[type="text"]');
      input.value = 'test';

      // we simulate user interaction
      helpers.event('change', input);

      expect(changeSpy.callCount).to.equal(1, 'Propagation is not stopped on unrelated inputs.');
      expect(changeSpy.getCall(0).args[0].target).to.equal(input, 'Target should be the input and not the component');
    });
  
    it('should position the file input under the dropzone', function(done) {
      var fileUpload = helpers.build(window.__html__['FileUpload.base.html']);
      var dropZone = document.createElement('div');
      dropZone.style.margin = '10px';
      dropZone.setAttribute('coral-fileupload-dropzone', '');
      fileUpload.appendChild(dropZone);
      
      // Wait for MO
      helpers.next(() => {
        var input = fileUpload._elements.input;
        var size = dropZone.getBoundingClientRect();
        expect(input.style.top).to.equal(parseInt(dropZone.offsetTop, 10) + 'px');
        expect(input.style.left).to.equal(parseInt(dropZone.offsetLeft, 10) + 'px');
        expect(input.style.width).to.equal(parseInt(size.width, 10) + 'px');
        expect(input.style.height).to.equal(parseInt(size.height, 10) + 'px');
        done();
      });
    });
  });
});
