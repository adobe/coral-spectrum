module.exports = {
  coralModules: '<%= package.devDependencies %>',
  moduleDataPath: '<%= dirs.modules %>/{{coralModule}}/package.json',
  outputFile: '<%= dirs.build %>/<%= dirs.documentation %>/documentation-mapping.json'
};
