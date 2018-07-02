# Coral Spectrum

## A JavaScript library of Web Components following Spectrum design patterns.

Our vision is to create consistent Adobe experiences by providing a complete, easy to use library of HTML components 
compatible with [major frameworks](https://custom-elements-everywhere.com/).

### Custom Elements v1

Coral Spectrum derives from [Custom Elements v1](https://html.spec.whatwg.org/multipage/custom-elements.html) with 
[native support](https://caniuse.com/#feat=custom-elementsv1) thanks to broad collaboration between browser vendors. 
The use of custom elements gives us the ability to hide many implementation details from the consumer, allowing much 
more freedom to change the underlying markup that supports those elements. 
This makes the exposed API smaller and more explicit, resulting in a lower risk of updates to Coral Spectrum needing to 
introduce breaking changes.

### Spectrum

The current default theme is is an implementation of the [Spectrum](http://spectrum.corp.adobe.com/) design 
specifications, Adobe’s design system. Spectrum provides elements and tools to help product teams work more 
efficiently, and to make Adobe’s applications more cohesive.
 
Coral Spectrum leverages the [Spectrum CSS](http://spectrum-css.corp.adobe.com/) framework to style 
components including the Spectrum SVG icons. 
To request new icons, please follow the instructions listed on http://icons.corp.adobe.com. Ideally, the icon team 
should be creating or reviewing every icon for every Adobe experience.

### Showcase

All components can be seen in action <a href="../examples" target="_blank">here</a>. These are only examples and 
don't cover all scenarios. The API documentation can be found in the <a href="./identifiers.html" target="_blank">references</a>.    
A playground is available <a href="../playground" target="_blank">here</a> to experiment and preview code with the latest Coral Spectrum version.
Code can be shared by copy pasting the URL. The playground is sandboxed to prevent security risks. 

## Getting started

### Consumers

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

**For NPM consumers**

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

### Contributors

Coral Spectrum follows open development principles:
* The code is discoverable and openly available to anyone.
* Discussions about Coral Spectrum happen on an open and archived channel.
* All important technical decisions are exposed on that channel.
* All commits are backed by issues in an openly accessible tracker, which offers a self-service overview of the project's status and history.
* People who are not members of the core team are encouraged to provide contributions.
* Meritocracy is taken into account when considering the priority of contributions and suggestions. 
The more you contribute, and the more valuable your contributions are, the more influence you will have within the project.

**Slack channel: #coral_spectrum**

All Coral Spectrum work is tracked in our [JIRA project](https://jira.corp.adobe.com/browse/CORAL).

Before starting, make sure the work you are doing is tracked in JIRA. Create an issue if one doesn't already exist. 
An issue description should be complete and include steps to reproduce if the issue is a defect.

It is required that you work on a feature branch, even in your own fork. The feature branch naming convention is 
`issue/CORAL-x`. CORAL-x corresponds to the JIRA ticket.

You will be ready to submit your code when your work meets the Definition of Done. 
Once ready, your work must be peer reviewed by a pull request.

**Development**
   
First verify the `.npmrc` configuration then run `npm i`.
 
Once the installation is complete, you can use below [gulp](https://gulpjs.com/) tasks to work on Coral Spectrum components :
* `gulp` to generate the build and run the dev server on localhost:9001 by default.
* `gulp build` to generate the build.
* `gulp watch` to run the dev server on localhost:9001 by default. 
* `gulp test` to generate the build and run the tests.
* `gulp karma` to run the tests only.
* `gulp karma-watch` to debug the tests on localhost:9876 by default.
* `gulp docs` to build the documentation. 

Each component can be built independently. Use `--host myhost` option to specify dev server hostname.  



