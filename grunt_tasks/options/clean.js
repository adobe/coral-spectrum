module.exports = {
  finalbuild: [
    // These files are used when building CSS and are not needed in final build output
    'build/embed',

    // Don't include tests in final build output
    'build/tests'
  ]
};