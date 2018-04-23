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
  
  const fs = require('fs');
  const path = require('path');
  const util = require('gulp-util');
  const sftp = require('gulp-sftp');
  
  // Configuration parameters, defaults to empty string
  let host = '';
  let username = '';
  let password = '';
  let folder = '';
  
  try {
    const configFile = fs.readFileSync('deploy-config.json');
    const config = JSON.parse(configFile);
    
    host = config.host;
    username = config.username;
    password = config.password;
    folder = config.folder;
  }
  catch (e) {}
  
  // Override config with parameters
  // e.g gulp deploy --host XXX --username XXX --password XXX --folder XXX
  host = util.env.host || host;
  username = util.env.username || username;
  password = util.env.password || password;
  folder = util.env.folder || folder;
  
  gulp.task('deploy', function() {
    // Copy all files
    gulp.src(['build/**/*'])
      .pipe(sftp({
        host: host,
        user: username,
        pass: password,
        remotePath: path.join('/var/www/html/', folder)
      }));
  });
};
