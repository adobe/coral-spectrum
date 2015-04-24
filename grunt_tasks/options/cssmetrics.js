module.exports = {
  coralui: {
    src: [
      '<%= dirs.build %>/css/coral.css',
      '<%= dirs.build %>/css/coral.min.css'
    ],
    options: {
      maxSelectors: 4096
    }
  }
};
