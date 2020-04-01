# Coral Spectrum [![Build Status](https://travis-ci.org/adobe/coral-spectrum.svg?branch=master)](https://travis-ci.org/adobe/coral-spectrum)

A JavaScript library of Web Components following Spectrum design patterns.

## Showcase

All components can be seen in action [here](http://opensource.adobe.com/coral-spectrum/dist/examples). These are only examples and 
don't cover all scenarios. The API documentation can be found in the [references](http://opensource.adobe.com/coral-spectrum/dist/documentation/identifiers.html).    
A playground is available [here](http://opensource.adobe.com/coral-spectrum/dist/playground) to experiment and preview code with the latest Coral Spectrum version.
Code can be shared by copy pasting the URL. The playground is sandboxed to prevent security risks.

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

## Browser support

Coral Spectrum is designed to support the following browsers:
* Chrome (latest)
* Safari (latest)
* Firefox (latest)
* Edge (latest)
* IE 11
* iOS 7+
* Android 4.4+

## Theme (light, dark, lightest, darkest)

The default Coral Spectrum styles cascade from `coral--light`, `coral--lightest`, `coral--dark` and `coral--darkest` theme, so that class must be specified at a higher level.

```html
<body class="coral--light">
    <!-- light theme -->
    <div class="container"></div>
    <div class="coral--dark">
        <!-- dark theme -->
    </div>
</body>
```

## Large scale support

For mobile, Spectrum has a larger scale that enables larger tap targets on all controls. To enable it, the class `coral--large` must be specified at a higher level.

```html
<body class="coral--light coral--large">
   <!-- light theme -->
   <!-- large scale -->
</body>
```

## Using Coral Spectrum

### Easiest way via a CDN

The easiest way to consume Coral Spectrum is to use a CDN e.g. copy these lines into your html file. 

```html
<head>
  <!-- 4.x.x means latest major 4 version release, adjust version if you need a specific one -->
  <link rel="stylesheet" href="https://unpkg.com/@adobe/coral-spectrum@4.x.x/dist/css/coral.min.css">
  <script src="https://unpkg.com/@adobe/coral-spectrum@4.x.x/dist/js/coral.min.js" data-coral-icons-external="js"></script>
</head>
<body class="coral--light">
  <button is="coral-button" icon="add">My Button</button>
</body> 
``` 

### Copying the distribution files

You can download a packaged/published version of `@adobe/coral-spectrum` from npm:

```
npm pack @adobe/coral-spectrum
```

After you've unzipped the downloaded package, look for the `dist` folder and :
* Copy the files from `dist/css`, `dist/js` and `dist/resources` in your project.
* Reference the files in your page e.g

```html
<link rel="stylesheet" href="css/coral.min.css">
<script src="js/coral.min.js"></script>
```

### Including entire library with a bundler like parcel

`npm install @adobe/coral-spectrum`

then in your main js, use:

```
require("@adobe/coral-spectrum/dist/js/coral.js");
require("@adobe/coral-spectrum/dist/css/coral.css");
```

### Including only the components you need

If your project only requires a few components, you can use a module bundler like [Webpack](https://webpack.js.org/) to only import the components needed. 
Below is an example of a Webpack config:

```js
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
 
```js
// Import Component
import {Button} from '@adobe/coral-spectrum/coral-component-button';

const button = new Button();
```

If icons are not displayed, ensure the path to the styles and icons are set e.g. :

```html
<link rel="stylesheet" href="dist/style.min.css">
<script data-coral-icons="dist/icons/" src="dist/bundle.min.js"></script>
```

**Note:** Calendar, Clock and Datepicker components will leverage [moment.js](http://momentjs.com/) if available. 

## Contributing

Check out the [contributing guidelines](https://github.com/adobe/coral-spectrum/blob/master/.github/CONTRIBUTING.md).

### Building and Testing

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
