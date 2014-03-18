module.exports = {
  coralModules: '<%= package.dependencies %>',
  moduleDataPath: '<%= dirs.modules %>/{{coralModule}}/package.json',
  outputFile: '<%= dirs.build %>/<%= dirs.documentation %>/documentation-mapping.json'
}
