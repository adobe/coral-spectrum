/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe Systems Incorporated
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
  
  const path = require('path');
  const util = require('gulp-util');
  const sftp = require('gulp-sftp');
  
  const host = 'coral-spectrum.corp.adobe.com';
  const username = util.env.username;
  const password = util.env.password;
  
  gulp.task('deploy', function() {
  
    // Copy all files
    // gulp deploy --username XXX --password XXX
    gulp.src(['build/**/*'])
      .pipe(sftp({
        host: host,
        user: username,
        pass: password,
        remotePath: '/var/www/html/'
      }));
  });
};
