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
