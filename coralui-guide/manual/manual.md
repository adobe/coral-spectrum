# Manual

## Getting started

**The following information is intended to get you up and running quickly with Coral Spectrum**

The easiest way to include Coral Spectrum is to download the package of the 
latest release on [artifactory](https://artifactory.corp.adobe.com/) which contains all components (search for `coral-spectrum`).
Artifactory is the internal Adobe repository manager.
 
After you've unzipped the downloaded package and found the `build` folder, follow the steps below :
* Put `coral.min.css` in the `css/` directory of your project.
* Put `coral.min.js` in the `js/` directory of your project.
* Also put the content of the `/resources` folder in the `/resources` directory of your project. 
This is required for icons and other assets to work.
* In the `<head>` section of your HTML, add the following:
```
<link rel="stylesheet" href="css/coral.min.css">
<script src="js/coral.min.js" data-coral-icons="PATH_TO_RESOURCES_FOLDER"></script>
```
* That's it. Now you're ready to use Coral Spectrum.
* **Note:** Calendar, Clock and Datepicker components will leverage [moment.js](http://momentjs.com/) if loaded on the page

## Consume with npm
 
To retrieve `@coralui` npm packages from artifactory, you have two options :
* Add the following 2 lines to `~/.npmrc`:
```
@coralui:registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-coralui-release
@spectrum:registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-spectrum-release
```
* Or run npm install with additional parameters
```
npm install --scope=@coralui --registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-coralui-release
npm install --scope=@spectrum --registry=https://artifactory.corp.adobe.com/artifactory/api/npm/npm-spectrum-release
```

Then you can install `@coralui` npm packages :

```
npm install @coralui/coral-spectrum
```

If your project uses a module bundler and a ES6/7 to ES5 transpiler, 
you can bundle only needed components :

```
import {Button, Textfield} from '@coralui/coral-spectrum';  
```

You'll find a Webpack config example at https://git.corp.adobe.com/ringel/coralui-webpack.

## Development
   
First verify the `.npmrc` configuration then run `npm i`.
 
Once the installation is complete, you can use below [gulp](https://gulpjs.com/) tasks to work on Coral Spectrum components :
* `gulp` to generate the build and run the dev server on localhost:9001 by default.
* `gulp build` to generate the build.
* `gulp watch` to run the dev server on localhost:9001 by default. 
* `gulp test` to generate the build and run the tests.
* `gulp karma` to run the tests only.
* `gulp karma-watch` to debug the tests on localhost:9876 by default.
* `gulp docs` to build the documentation. 

Each component can be built independently.
