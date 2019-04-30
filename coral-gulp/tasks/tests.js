module.exports = function(gulp) {
  const KarmaServer = require('karma').Server;
  const configFile = `${__dirname}/../configs/karma.conf.js`;
  const PluginError = require('plugin-error');
  
  gulp.task('karma', function(done) {
    new KarmaServer({
      configFile: configFile,
      singleRun: true
    }, (err) => {
      if (err) {
        done(new PluginError('karma', 'Test failures'));
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
