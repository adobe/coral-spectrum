module.exports = {

  compile: {
    options: {
      urlfunc: 'embedurl',
      use: [require('svg-stylus')],
      paths: [
        './<%= dirs.modules %>/'
      ],
      import: ['nib'],
      'include css': true
    },
    files: {
      '<%= dirs.build %>/<%= dirs.css %>/coral.css': '<%= dirs.temp %>/index.styl'
    }
  }

}
