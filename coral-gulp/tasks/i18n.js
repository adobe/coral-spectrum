// @todo fix i18n task

module.exports = function(gulp) {
  
  var path =  require('path');
  var fs = require('fs');
  var request = require('request');
  var config = require(`${__dirname}/../configs/i18n.conf.json`);
  var through = require('through2');
  var merge = require('gulp-merge-json');
  
  gulp.task('download-localized-strings', function(cb) {
    var rootPath = path.join(process.cwd(), 'i18n');
    var rawTranslationData = path.join(rootPath, 'raw-translation-data.json'); // raw JSON data dump from Aladdin - includes a lot of information we don't need
    var translationFile = path.join(rootPath, 'translations.json'); // clean translation file for use by Coral.i18n
    var pkgPath = path.join(process.cwd(), 'package.json');
    var pkg = require(pkgPath);
    // aladdin doesn't know about the coralui namespace
    var componentName = pkg.name.replace('@coralui/', '');
    
    console.log('[i18n]','initialized download-localized-strings for', componentName);
    
    if (!componentName) {
      console.warn('[i18n] download-localized-strings: Component name not found in package.json.');
    }
    else if (componentName === 'coralui') {
      console.warn('[i18n] download-localized-strings: strings should only be retrieved for individual components.');
    }
    else {
      console.log('[i18n] Retrieving localized strings from Aladdin...');
      requestStringsViaHttp(componentName);
    }
  });
  
  function requestStringsViaHttp(componentName) {
    var serviceUrl = config.service.url + componentName;
    console.log('[i18n] requestStringsViaHttp trying', serviceUrl);
    request.get(serviceUrl)
      .on('error', _handleServiceError)
      .on('response', _handleServiceResponse)
      .pipe(getFileWriteStream(translationFile));
  }
  
  function _handleServiceError(error) {
    console.error('[i18n] aladdin.corp error: ' + error);
  }
  
  function _handleWriteStreamError(error) {
    console.error('[i18n] Problem writing data to file stream; error: ' + error);
  }
  
  function _handleServiceResponse(message) {
    console.log('[i18n] HTTP code from aladdin.corp: ' + message.statusCode);
    console.log('[i18n] HTTP response from aladdin.corp: ' + message.statusMessage);
  }
  
  function _handleServiceData(data) {
    console.log('[i18n] service data: ' + data);
  }
  
  function getFileWriteStream(filePath) {
    var result = fs.createWriteStream(filePath);
    result.on('error', _handleWriteStreamError);
    return result;
  }
  
  
  gulp.task('extract-localizable-strings', function(cb) {
    var pkgPath = path.join(process.cwd(), 'package.json');
    var pkg = require(pkgPath);
    // aladdin doesn't know about the coralui namespace
    var componentName = pkg.name.replace('@coralui/', '');
    var aladdinDocument = {};
    var documentProperties = {};
    
    console.log('[i18n]','initialized extract-localizable-strings for', componentName);
    
    if (!componentName) {
      console.warn('[i18n] extract-localizable-strings: Component name not found in package.json.');
    }
    else if (componentName === 'coralui') {
      console.warn('[i18n] extract-localizable-strings: strings should only be retrieved for individual components.');
    }
    else {
      console.log('[i18n] extracting localizable strings to Aladdin...');
      return pushStringsToService(componentName);
    }
  });
  
  function pushStringsToService(componentName, cb) {
    console.log('config', config);
    var extractDirs = config.localizableExtractDirs;
    
    if (extractDirs) {
      console.log('[i18n] finding directories to extract...');
      var documentPropertiesAdded = false;
      
      for (var i=0; i < extractDirs.length; i++) {
        extractDirs[i] += `src/${extractDirs[i]}/**/*.*`;
      }
      
      console.log('extract', extractDirs);
      
      return gulp.src(extractDirs)
        .pipe(getAladdinDocument(componentName))
        .pipe(merge(config.document.filename))
        .pipe(pushDocumentToAladdin())
        .pipe(gulp.dest(config.dest));
    }
  }
  
  function getAladdinDocument(componentName) {
    var aladdinDocument;
    return through.obj(function (file, encoding, done) {
      try {
        var fileContents = file.contents.toString();
        var contentsArray = fileContents.split(require('os').EOL);
        
        for (var line = 0; line < contentsArray.length; line++){
          var translationHints = '';
          var currentLine = contentsArray[line];
          var localizableStrings = _findLocalizerCalls(currentLine);
          
          if (localizableStrings) {
            
            localizableStrings[1] = _replaceHtmlEntities(localizableStrings[1]);
            var localizationValue = localizableStrings[1];
            // Aladdin does not support use of periods in keys so they are stored as HTML entities
            localizationKey = localizationValue.replace(/\./g, '&period;')
            translationHints = localizableStrings[2];
            
            if (translationHints && translationHints !== 'null') {
              localizationKey = localizationKey + '/[translation hint:' + translationHints.replace(/\./g, '&period;') + ']';
            }
            
            if (localizationKey) {
              console.log('[i18n-extract] parsed:', componentName, path.basename(file.path));
              console.log('[i18n-extract] got result: "' + localizationKey + '"');
              if (translationHints) {
                console.log('  [i18n-extract] got translation hint: "' + translationHints + '"');
              }
              
              if (!aladdinDocument) {
                aladdinDocument = _initDocument(componentName);
              }
              aladdinDocument[localizationKey] = localizationValue;
            }
          }
          
        }
        file.contents = new Buffer(JSON.stringify(aladdinDocument));
        file.path = file.path.replace(path.extname(file.path), '.json');
        file.contents = new Buffer(JSON.stringify(aladdinDocument));
        this.push(file);
      } catch (err) {
        this.emit('error', console.error('[i18n-extract] #getAladdinDocument Error:' + err));
      }
      done();
    });
  }
  
  function pushDocumentToAladdin() {
    return through.obj(function (file, encoding, done) {
      try {
        var aladdinDocument = JSON.parse(file.contents.toString());
        // If localizable strings are found, upload them to Aladdin
        if (_hasLocalizeableStrings(aladdinDocument)) {
          var componentPath = aladdinDocument._properties.path
          var serviceUrl = config.service.url + config.service.locale + componentPath;
          var authToken = config.service.auth;
          var options = {
            url: serviceUrl,
            headers: {
              'Authorization': authToken
            },
            body: aladdinDocument,
            json: true,
            method: 'put'
          };
          console.log('[i18n-extract] #pushDocumentToAladdin trying', serviceUrl);
          request(options)
            .on('error', _handleServiceError)
            .on('response', _handleServiceResponse);
        } else {
          console.log('[i18n-extract] No localizable strings were found for push.');
        }
        this.push(file);
      } catch (err) {
        this.emit('error', console.error('[i18n-extract] #pushDocumentToAladdin Error:'+ err));
      }
      done();
    });
  }
  
  function _initDocument(componentName) {
    var result = {};
    result._properties = {};
    result._properties.path = '/' + componentName;
    result._properties.type = config.document.type;
    result._properties.locale = config.document.locale;
    return result;
  }
  
  function _replaceHtmlEntities(value) {
    var entityReplaceMap = config.document.entitymap;
    var entityPattern = /.*&.*;.*/g;
    if (value && value.match(entityPattern)) {
      for (var entity in entityReplaceMap) { // convert them to regular characters;
        value = value.replace(entity, entityReplaceMap[entity]);
      }
    }
    return value;
  }
  
  function _hasLocalizeableStrings(target) {
    return Object.getOwnPropertyNames(target).length > 0
  }
  
  /* LocalizableStrings can have the following signature in a line of code
   Extract all possible calls to Coral.i18n.get:
   Coral.i18n.get('English string');
   Coral.i18n.get('English string: {0}', arg);
   Coral.i18n.get('English string: {0}, {1}, and {2}', arg1, arg2, arg3);
   Coral.i18n.get('English string: {name}', { name: 'foo' });
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' });
   Coral.i18n.get('English string', 'Translation hint 1');
   Coral.i18n.get('English string: {0}', arg, 'Translation hint 1'));
   Coral.i18n.get('English string: {0}, {1}, and {2}', arg1, arg2, arg3, 'Translation hint 1'));
   Coral.i18n.get('English string: {name}', { name: 'foo' }, 'Translation hint 1'));
   Coral.i18n.get('English string: {name1}, {name2}, and {name3}', { name1: 'foo', name2: 'bar', name3: 'qux' }, 'Translation hint 1');
   */
  function _findLocalizerCalls(value) {
    var localizerCallPattern = /Coral.i18n.get\(['|"](.*?)['|"].*?(?:\s*,\s*['|"](.*?)['|"])*\)/;
    return value.match(localizerCallPattern);
  }
  
  function _handleServiceError(error) {
    console.error('[i18n] aladdin.corp error: ' + error);
  }
  
  function _handleWriteStreamError(error) {
    console.error('[i18n] Problem writing data to file stream; error: ' + error);
  }
  
  function _handleServiceResponse(message) {
    console.log('[i18n] HTTP code from aladdin.corp: ' + message.statusCode);
    console.log('[i18n] HTTP response from aladdin.corp: ' + message.statusMessage);
  }
  
  function _handleServiceData(data) {
    console.log('[i18n] service data: ' + data);
  }
};
