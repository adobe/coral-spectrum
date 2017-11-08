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
  const fs = require('fs');
  const del = require('del');
  const theme = require('../helpers/theme');
  const util = require('../helpers/util');
  
  gulp.task('clean', function() {
    del.sync('./build/**');
    // Prepare build folders
    fs.mkdirSync('./build');
    fs.mkdirSync('./build/css');
    fs.mkdirSync('./build/js');
  });
  
  gulp.task('cleanup', function() {
    if (!util.isTLB()) {
      del.sync('./README.md');
    }
    
    const index = theme.getIndex();
    if (index !== 'index') {
      del.sync(`./${index}.js`);
    }
  });
};
