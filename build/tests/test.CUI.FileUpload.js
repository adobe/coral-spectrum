describe('CUI.FileUpload', function () {

  var defaultFileUploadSelector = '.coral-FileUpload--dropSupport',
      defaultInputName = 'file',
      fileUploadHtmlIcon = '' +
          '<span class="coral-FileUpload coral-FileUpload--dropSupport" data-init="fileupload">' +
          '<span class="coral-Button coral-Button--quiet coral-Button--square">' +
          '<i class="coral-FileUpload-trigger coral-Icon coral-Icon--upload">' +
          '</i>' +
          '</span>' +
          '</span>',
      inputHtml = '<input type="file" class="coral-FileUpload-input" name="' + defaultInputName + '">',
      $el = null, // file upload element
      $inputContainer = null, // container of input fielde
      customEvent1, customEvent2; // test variables for custom events

  beforeEach(function () {
    // create fileUpload
    $el = $(fileUploadHtmlIcon).appendTo('body');
    $inputContainer = $el.find('.coral-FileUpload-trigger');
    customEvent1 = customEvent2 = null;
  });

  afterEach(function () {
    $el.remove();
    $el = $inputContainer = null;
    customEvent1 = customEvent2 = null;
  });

  describe('definition', function () {
    it('should be defined in CUI namespace', function () {
      expect(CUI).to.have.property('FileUpload');
    });
  });

  describe('generation', function () {

    it("'useHTML5' option should generate input field", function () {
      // generate an input field
      var fileUpload = generateInputField({
        useHTML5: true
      });

      // verify input field got generated
      expect(getInputField()).to.exist;

      // verify CUI.FileUpload options
      expect(fileUpload.options.name).to.equal(defaultInputName);
      expect(fileUpload.options.useHTML5).to.equal(true);
    });

    it("'useHTML5' option should generate input field in '.coral-FileUpload-trigger' container", function () {
      // generate an input field
      var fileUpload = generateInputField({
        useHTML5: true
      });

      // verify input field got generated
      expect($inputContainer.find('.coral-FileUpload-input')).have.to.exist;

      // verify CUI.FileUpload options
      expect(fileUpload.options.name).to.equal(defaultInputName);
      expect(fileUpload.options.useHTML5).to.equal(true);
    });

    it("'name' option should generate input field with custom file name", function () {
      // generate an input field with custom name property
      var fileName = 'file2';
      var fileUpload = generateInputField({
        useHTML5: true,
        name: fileName
      });

      // verify attribute in input field
      expect(getInputField().attr('name')).to.equals(fileName);

      // verify CUI.FileUpload options
      expect(fileUpload.options.name).to.equal(fileName);
    });

    it("'multiple' option should generate 'multiple' attribute in generated input field", function () {
      var fileUpload = generateInputField({
        useHTML5: true,
        multiple: true
      });

      // verify attribute in input field
      expect(getInputField().attr('multiple')).to.equal('multiple');
    });

    it("'multiple' option should generate 'multiple' attribute in input field", function () {
      var $inputEl = addInputField();

      var fileUpload = getCUIFileUpload({
        multiple: true
      });

      // verify attribute in input field
      expect(getInputField().attr('multiple')).to.equal('multiple');
    });

  });

  describe('options', function () {

    // name
    it("read data from markup - attribute 'name'", function () {
      var $inputEl = addInputField();

      var fileUpload = getCUIFileUpload();
      expect(fileUpload.options.name).to.equal(defaultInputName);
    });

    // placeholder
    it("read data from markup - attribute 'placeholder'", function () {
      var $inputEl = addInputField();
      $inputEl.attr("placeholder", "anyplaceholder");

      var fileUpload = getCUIFileUpload();
      expect(fileUpload.options.placeholder).to.equal('anyplaceholder');
    });

    it("read data from markup - attribute 'data-placeholder'", function () {
      readDataFromMarkup("placeholder", '<div class="placeholder"></div>');
    });

    // disabled
    it("read data from markup - attribute 'disabled'", function () {
      var $inputEl = addInputField();
      $inputEl.attr("disabled", true);

      var fileUpload = getCUIFileUpload();
      expect(fileUpload.options.disabled).to.equal(true);
    });

    it("read data from markup - attribute 'data-disabled'", function () {
      readDataFromMarkup("disabled", true);
    });

    // multiple
    it("read data from markup - attribute 'multiple'", function () {
      var $inputEl = addInputField();
      $inputEl.attr("multiple", "multiple");

      var fileUpload = getCUIFileUpload();

      //var fileUpload = new CUI.FileUpload();
      expect(fileUpload.options.multiple).to.equal(true);
    });

    it("read data from markup - attribute 'data-multiple'", function () {
      readDataFromMarkup("multiple", true);
    });

    // uploadUrl
    it("read data from markup - attribute 'data-uploadUrl'", function () {
      readDataFromMarkup("uploadUrl", "/anyurl");
    });

    // uploadUrlBuilder
    it("read data from markup - attribute 'data-uploadUrlBuilder'", function () {
      var $inputEl = addInputField();
      $inputEl.data('uploadUrlBuilder', 'function (fileUpload) { return false; }');

      var fileUpload = getCUIFileUpload({
        element: defaultFileUploadSelector
      });

      // verify uploadUrlBuilder is registered as a function
      expect(fileUpload.options['uploadUrlBuilder']).to.be.instanceof(Function);
    });

    // mimeTypes
    it("read data from markup - attribute 'data-mimeTypes'", function () {
      readDataFromMarkup("mimeTypes", "[video/.*]");
    });

    // sizeLimit
    it("read data from markup - attribute 'data-sizeLimit'", function () {
      readDataFromMarkup("sizeLimit", 1000);
    });

    // autoStart
    it("read data from markup - attribute 'data-autoStart'", function () {
      readDataFromMarkup("autoStart", true);
    });

    // usehtml5
    it("read data from markup - attribute 'data-usehtml5'", function () {
      readDataFromMarkup("usehtml5", true, "useHTML5");
    });

    // fileNameParameter
    it("read data from markup - attribute 'data-fileNameParameter'", function () {
      readDataFromMarkup("fileNameParameter", "file2");
    });

    /*
     Read attributes from markup
     */
    var readDataFromMarkup = function (attribute, value, optionName, inputName) {
      var $inputEl = addInputField(inputName);
      $inputEl.data(attribute, value);

      optionName = optionName || attribute;

      var fileUpload = getCUIFileUpload({
        element: defaultFileUploadSelector
      });

      expect(fileUpload.options[optionName]).to.equal(value);
    };

  });

  describe('api', function () {

    it("uploadFile() should generate the expected eventListeners", function () {
      // generate input field
      var uploadUrl = '/anyurl';
      var fileUpload = generateInputField({
        element: defaultFileUploadSelector,
        uploadUrl: uploadUrl, // add uploadUrl so the input field does not get disabled
        useHTML5: true
      });

      // file
      var item = {
        file: [
          {
            name: "senordeveloper.jpg",
            type: "image/jpg"
          }
        ],
        fileName: "senordeveloper.jpg"
      };

      var xhr = sinon.useFakeXMLHttpRequest();
      var requests = sinon.requests = [];

      xhr.onCreate = function (request) {
        requests.push(request);
      };

      fileUpload.uploadFile(item);

      // verify only one ajax call
      expect(sinon.requests.length).to.be.equal(1);

      // check if expected event listeners got registered
      expect(sinon.requests[0].eventListeners["loadstart"]).to.exist;
      expect(sinon.requests[0].eventListeners["load"]).to.exist;
      expect(sinon.requests[0].eventListeners["error"]).to.exist;
      expect(sinon.requests[0].eventListeners["abort"]).to.exist;

      xhr.restore();
    });

  });

  describe('events', function () {

    it("register custom event handlers as options", function () {
      // add input field
      var $inputEl = addInputField();

      // set custom events
      var fileUpload = getCUIFileUpload({
        events: {
          'customevent1': customEvent1Handler,
          'customevent2': customEvent2Handler
        }
      });

      // verify the events got registered
      expect(fileUpload.options.events['customevent1']).to.be.instanceof(Function);
      expect(fileUpload.options.events['customevent2']).to.be.instanceof(Function);

      // verify that the events get triggered by changing some variables
      expect(customEvent1).to.equal(null);
      $inputEl.trigger('customevent1');
      expect(customEvent1).to.equal("init-customEvent1");

      expect(customEvent2).to.equal(null);
      $inputEl.trigger('customevent2');
      expect(customEvent2).to.equal("init-customEvent2");
    });

    it("register custom event handlers as data attributes", function () {
      // add input field
      var $inputEl = addInputField();

      // set some test data
      $inputEl.data('customevent', 'init');

      // define the custom function
      $inputEl.attr('data-event-customevent1', 'function (event) { $(event.currentTarget).find(".coral-FileUpload-input").data("customevent", "changed"); return false;}');

      // initialize the CUI.FileUpload
      var fileUpload = getCUIFileUpload({
        element: defaultFileUploadSelector,
        uploadUrl: '/anyurl' // add uploadUrl so the input field does not get disabled
      });

      // verify the event got registered
      expect(fileUpload.options.events['customevent1']).to.be.instanceof(Function);

      // verify test data has been updated by custom event
      $inputEl.trigger('customevent1');
      expect($inputEl.data('customevent')).to.equal('changed');
    });

    /*
     Custom event 1
     */
    var customEvent1Handler = function (event) {
      customEvent1 = "init-customEvent1";
    };

    /*
     Custom event 2
     */
    var customEvent2Handler = function (event) {
      customEvent2 = "init-customEvent2";
    };

  });

  /*
   Get file upload jquery element
   */
  var getFileUploadElement = function () {
    return $(defaultFileUploadSelector);
  };

  /*
   Get input field
   */
  var getInputField = function (fileUploadSelector) {
    return $(fileUploadSelector || defaultFileUploadSelector).find('.coral-FileUpload-input');
  };

  /*
   Add the input field using predefined html
   */
  var addInputField = function (inputName) {
    var name = inputName || defaultInputName;
    var inputHtml = '<input type="file" class="coral-FileUpload-input" name="' + name + '">';
    return $(inputHtml).appendTo($inputContainer);
  };

  /*
   Add the input field by generating it
   */
  var generateInputField = function (fileUploadOptions) {
    var options = fileUploadOptions || {};
    if (!options.useHTML5) {
      options.useHTML5 = true;
    }

    return getCUIFileUpload(options);
  };

  /*
   Initiate the file upload using the CUI.FileUpload object
   */
  var getCUIFileUpload = function (fileUploadOptions, fileUploadSelector) {
    var options = fileUploadOptions || {};
    var element = fileUploadSelector || defaultFileUploadSelector;
    if (!options.element) {
      options.element = element;
    }
    return new CUI.FileUpload(options);
  };

});
