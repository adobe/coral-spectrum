# Manual

## Getting started

**The following information is intended to get you up and running quickly with Coral Spectrum**

The easiest way to start experimenting with Coral Spectrum is to download the ZIP archive of the 
[latest release](https://git.corp.adobe.com/Coral/coral-spectrum/tags) which contains all components. 
After you've unzipped the downloaded zip archive, follow the steps below :
* Put `coral.min.css` in the `css/` directory of your project.
* Put `coral.min.js` in the `js/` directory of your project.
* Also put the content of the `/resources` folder in the `/resources` directory of your project. 
This is required for icons and other assets to work.
* In the `<head>` section of your HTML, add the following:
```
<link rel="stylesheet" href="css/coral.min.css">
<script src="js/coral.min.js"></script>
```
* That's it. Now you're ready to use Coral Spectrum.
* **Note:** Calendar, Clock and Datepicker components will leverage [moment.js](http://momentjs.com/) if loaded on the page

## Consume with npm

We use Artifactory as an Adobe internal repository manager hosted at https://artifactory.corp.adobe.com. 

To retrieve coralui npm packages from artifactory, you have two options :
* Add the following 2 lines to '~/.npmrc':
```
@coralui:registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-coralui-release
@spectrum:registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-spectrum-release
```
* Or run npm install with additional parameters
```
npm install --scope=@coralui --registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-coralui-release
npm install --scope=@spectrum --registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-spectrum-release
```

Then you can install coralui npm packages :

```
npm install @coralui/coral-spectrum
```

If your project uses a module bundler and a ES6/7 to ES5 transpiler, 
you can bundle only needed components :

```
import {Button, Textfield} from '@coralui/coral-spectrum';  
```

## Custom build

Don't want all of Coral Spectrum, or want to add components that aren't in the default build? No problem ! 
We'll show you how to customize a build : 
1. Fork the [repository](https://git.corp.adobe.com/Coral/coralui/tree/release/coral-spectrum) on GitHub
2. Open `index.js` and remove components you would like excluded from the build. Repeat for `src/tests/index.js`.
3. Run `npm install`. Optionally you can also add additional components to `package.json`.
4. Run `gulp`. This will generate the build and run the tests.
   
## Development
   
First run `npm i` then you can use below Gulp tasks to work on Coral Spectrum components :
* `gulp build` to generate the JS/CSS files.
* `gulp minify` to generate a minified version of the JS/CSS files.
* `gulp tests` to run the tests.
* `gulp docs` to build the documentation.
* `gulp watch` to run the examples under `localhost:9001/examples/` and watch changes in the src folder.
* `gulp` to generate the JS/CSS files and minified files, run the tests and generate the docs.

