module.exports = {

  compile: {
    options: {
      urlfunc: 'embedurl',
      paths: [
        './<%= dirs.modules %>/'
      ]
    },
    files: {
      'build/css/coral.css': './temp/index.styl'
    }
  }

}