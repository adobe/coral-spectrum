/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2017 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */
module.exports = function(gulp) {
  const KarmaServer = require('karma').Server;
  const configFile = `${__dirname}/../configs/karma.conf.js`;
  
  gulp.task('karma', function(done) {
    new KarmaServer({
      configFile: configFile,
      singleRun: true
    }, (err) => {
      if (err) {
        process.exit(err);
      }
      done();
    }).start();
  });
  
  gulp.task('karma-watch', function(done) {
    new KarmaServer({
      configFile: configFile
    }, done).start();
  });
};
