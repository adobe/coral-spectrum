/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2018 Adobe
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
  const axe = require('gulp-axe-webdriver');
  const glob = require('glob-all');
  const isTLB = require('../helpers/util').isTLB();
  const config = require(`../configs/a11y.conf.json`);

  gulp.task('a11y', function(done) {
    let i = 0;

    const files = isTLB ? glob.sync([
      'coral-component-*/examples/index.html',
      '!coral-component-playground/examples/index.html'
    ]) : ['examples/index.html'];

    const analyse = () => {
      const file = files[i];

      config.urls = [file];
      config.saveOutputIn = `${isTLB ? file.split('/')[0] : 'report'}.json`;

      i++;

      return axe(config, () => {
        if (i === files.length) {
          done();
        }
        else {
          return analyse();
        }
      });
    };

    return analyse();
  });
};
