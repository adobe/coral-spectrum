# Coral Spectrum [![Build Status](https://travis-ci.org/adobe/coral-spectrum.svg?branch=master)](https://travis-ci.org/adobe/coral-spectrum)

A JavaScript library of Web Components following Spectrum design patterns.

## Spectrum

The current default theme is is an implementation of the [Spectrum](https://spectrum.adobe.com) design 
specifications, Adobe’s design system. Spectrum provides elements and tools to help product teams work more 
efficiently, and to make Adobe’s applications more cohesive.
 
Coral Spectrum leverages the [Spectrum CSS](https://github.com/adobe/spectrum-css) framework to style 
components including the [Spectrum SVG icons](https://spectrum.adobe.com/page/icons). 

## Angular, React, Vue.js compatibility

Our vision is to create consistent Adobe experiences by providing a complete, easy to use library of HTML components 
compatible with [major frameworks](https://custom-elements-everywhere.com/).

To reach the goal, Coral Spectrum derives from [Custom Elements v1](https://html.spec.whatwg.org/multipage/custom-elements.html) with 
[native support](https://caniuse.com/#feat=custom-elementsv1) thanks to broad collaboration between browser vendors. 
The use of custom elements gives us the ability to hide many implementation details from the consumer, allowing much 
more freedom to change the underlying markup that supports those elements. 
This makes the exposed API smaller and more explicit, resulting in a lower risk of updates to Coral Spectrum needing to 
introduce breaking changes.

### Showcase

All components can be seen in action [here](http://opensource.adobe.com/coral-spectrum/dist/examples). These are only examples and 
don't cover all scenarios. The API documentation can be found in the [references](http://opensource.adobe.com/coral-spectrum/dist/documentation/identifiers.html).    
A playground is available [here](http://opensource.adobe.com/coral-spectrum/dist/playground) to experiment and preview code with the latest Coral Spectrum version.
Code can be shared by copy pasting the URL. The playground is sandboxed to prevent security risks. 

## Getting started

### Consuming

The easiest way to consume Coral Spectrum is to download the distribution package of the 
latest release by running `npm i @adobe/coral-spectrum`. It includes all components and styles.
 
After you've unzipped the package, look for the `dist` folder and :
* Copy the files from `dist/css`, `dist/js` and `dist/resources` in your project.
* Reference the files in your page with :
```
<link rel="stylesheet" href="css/coral.min.css">
<script src="js/coral.min.js" data-coral-icons="PATH_TO_RESOURCES_FOLDER"></script>
```
* That's it. Now you're ready to use Coral Spectrum.
* **Note:** Calendar, Clock and Datepicker components will leverage [moment.js](http://momentjs.com/) if loaded on the page

If your project only requires a few components, you can use a module bundler like [Webpack](https://webpack.js.org/) to only import the components needed. 
Below is an example of a Webpack config:

```
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = {
  mode: 'production',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    filename: 'bundle.min.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'icons/[name].[ext]'
            },
          },
        ]
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      }
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'style.min.css'
    }),
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /style\.min\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorPluginOptions: {
        preset: ['default', { discardComments: { removeAll: true } }],
      }
    })
  ]
};  
```

Then in your `index.js` file, you can import and use single components :
 
```
// Import Component
import {Button} from '@adobe/coral-spectrum/coral-component-button';

const button = new Button();
```

If icons are not displayed, ensure the path to the styles and icons are set e.g. :

```
<link rel="stylesheet" href="dist/style.min.css">
<script data-coral-icons="dist/icons/" src="dist/bundle.min.js"></script>
```


## Building and Testing

Run the following commands first :
```
npm install -g gulp-cli
npm install
```   
 
You can use below tasks to get started:
* `gulp` to generate the build in the `dist` folder and run the dev server on `localhost:9001` by default.
* `gulp build` to generate the build in the `dist` folder.
* `gulp dev` to run the dev server on `localhost:9001` by default. 
* `gulp test` to run the tests. Test reports are in `dist/coverage`.
* `gulp docs` to build the documentation in `dist/documentation`. 

Each component can be built independently e.g. `cd coral-component-button && gulp`.

### Contributing

Check out the [contributing guidelines](https://github.com/adobe/coral-spectrum/blob/master/.github/CONTRIBUTING.md).

### Releasing

We are currently releasing this package on `npm`.

Before we get started, clean up your dependencies with the following command :

```
git checkout master
rm -rf node_modules && npm install
```

Then run `gulp release`. You'll be asked to bump the version (minor version bump by default). Coral Spectrum is following
[semantic versioning](https://docs.npmjs.com/about-semantic-versioning) (either patch, minor or major).

The command will take care of increasing, tagging the version and publishing the package to `npm`.     

If everything went well, run `gulp deploy` to publish the documentation on the `gh-pages` branch else revert the version bump. 
