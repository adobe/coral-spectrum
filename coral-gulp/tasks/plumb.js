const plumber = require('gulp-plumber');

function handleError(err) {
  console.error(err.toString());
  process.exit();
};

module.exports = function() {
  return plumber({errorHandler: handleError});
};
