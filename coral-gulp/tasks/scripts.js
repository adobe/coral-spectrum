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
