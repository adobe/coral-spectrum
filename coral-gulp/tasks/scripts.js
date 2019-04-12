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
  const rollup = require('rollup').rollup;
  const rollupConfig = require('../configs/rollup.conf.js')();
  
  gulp.task('scripts', async function(done) {
    const bundle = await rollup({
      input: 'index.js',
      plugins: rollupConfig
    });
  
    await bundle.write({
      file: './dist/js/coral.js',
      format: 'iife',
      name: 'Coral',
      sourcemap: true
    });
    
    done();
  });
};
