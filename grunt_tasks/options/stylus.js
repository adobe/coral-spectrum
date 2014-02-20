module.exports = {

  compile: {
    options: {
      urlfunc: 'embedurl',
      paths: [
        './<%= dirs.modules %>/'
      ],
      import: ['nib'],
    },
    files: {
      '<%= dirs.build %>/<%= dirs.css %>/coral.css': './<%= dirs.temp %>/index.styl'
    }
  }

}
