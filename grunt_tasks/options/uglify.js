// uglify grunt task config
module.exports = {
  coralui: {
    files: {
      '<%= dirs.build%>/<%= dirs.js %>/<%= package.coral.jsNamespace %>.min.js':
      ['<%= dirs.build%>/<%= dirs.js %>/<%= package.coral.jsNamespace %>.js']
    }
  }
}
