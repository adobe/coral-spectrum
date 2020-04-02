# Manual

## Using Coral Spectrum

### Easiest way via a CDN

The easiest way to consume Coral Spectrum is to use a CDN e.g. copy these lines into your html file. 

```
<head>
  <!-- Adjust version accordingly -->
  <link rel="stylesheet" href="https://unpkg.com/@adobe/coral-spectrum@4.5.0/dist/css/coral.min.css">
  <script src="https://unpkg.com/@adobe/coral-spectrum@4.5.0/dist/js/coral.min.js" data-coral-icons-external="js"></script>
</head>
<body class="coral--light">
  <button is="coral-button" icon="add">My Button</button>
</body> 
``` 

### Copying the distribution files

You can also download the distribution package of the 
latest release by running `npm i @adobe/coral-spectrum`. It includes all components and styles.
 
After you've unzipped the package, look for the `dist` folder and :
* Copy the files from `dist/css`, `dist/js` and `dist/resources` in your project.
* Reference the files in your page with :
```
<link rel="stylesheet" href="css/coral.min.css">
<script src="js/coral.min.js"></script>
```

### Using a bundler like Webpack
  
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

**Note:** Calendar, Clock and Datepicker components will leverage [moment.js](http://momentjs.com/) if available.

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
* `gulp axe` to run the accessibility checks.

Each component can be built independently e.g. `cd coral-component-button && gulp`.

## Releasing

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
