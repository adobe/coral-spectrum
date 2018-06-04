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
  const KarmaServer = require('karma').Server;
  const configFile = `${__dirname}/../configs/karma.conf.js`;
  const spawn = require('child_process').spawn;
  
  gulp.task('karma', function(done) {
    KarmaServer.start({
      configFile: configFile,
      singleRun: true
    }, (err) => {
      if (err) {
        process.exit(err);
      }
      done();
    });
  });
  
  gulp.task('karma-watch', function(done) {
    new KarmaServer({
      configFile: configFile
    }, done).start();
  });
  
  gulp.task('test', function() {
    spawn('gulp build && gulp karma', [], {shell: true, stdio: 'inherit'});
  });
};
