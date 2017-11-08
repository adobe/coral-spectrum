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
module.exports = function(gulp) {
  const plumber = require('gulp-plumber');
  const stylus = require('gulp-stylus');
  const modifyFile = require('gulp-modify-file');
  const theme = require('../helpers/theme');
  
  gulp.task('styles', function() {
    return gulp.src(['src/styles/index.styl', 'node_modules/coralui-*/src/styles/index.styl'])
      .pipe(plumber())
      .pipe(stylus({
        'include css': true,
        include: [
          './node_modules'
        ]
      }))
      .pipe(modifyFile((content) => {
        if (theme.getTheme() === 'coralui-theme-spectrum') {
          const spectrumConfig = require(`../configs/spectrum.conf.js`);
          
          // Map Spectrum selectors with Coral ones
          spectrumConfig.forEach((selectors) => {
            content = content.replace(selectors.spectrum, selectors.coral);
          });
        }
        
        return content;
      }))
      .pipe(gulp.dest(function (file) {
        return file.base;
      }));
  });
};
