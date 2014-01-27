module.exports = {

  compile: {
    options: {
      urlfunc: 'embedurl',
      paths: [
        './<%= dirs.modules %>/'
      ]
    },
    files: {
      '<%= dirs.build %>/<%= dirs.css %>/coral.css': './<%= dirs.temp %>/index.styl'
    }
  }

}