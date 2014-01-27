// uglify grunt task config
module.exports = {
  coralui: {
    files: {
      '<%= dirs.build %>/<%= dirs.js %>/coral.min.js':
      ['<%= dirs.build %>/<%= dirs.js %>/coral.js']
    }
  }
}
