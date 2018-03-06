# Coral Spectrum

**Coral Spectrum is a library of Web Components following Spectrum design patterns.**

This repository packages the components that make up Coral Spectrum components built by leveraging 
the [Custom Elements v1](https://w3c.github.io/webcomponents/spec/custom/) specification, which is part of the 
emerging [Web Components](https://www.webcomponents.org/introduction) standard.  

Components are following the [Spectrum design patterns](http://spectrum.corp.adobe.com/) for a unique experience. 

## Getting started

### Consumers

The easiest way to get started with Coral Spectrum is to download the ZIP archive of the 
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

**For NPM consumers**

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
npm install @coralui/coralui
```

If your project uses ES6 imports/exports, you can import only required components :

```
import {Button, Textfield} from '@coralui/coralui';  
```

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

**Gulp tasks**
First run `npm i` then you can use below Gulp tasks to work on Coral Spectrum components :
* `gulp build` to generate the JS/CSS files.
* `gulp minify` to generate a minified version of the JS/CSS files.
* `gulp tests` to run the tests.
* `gulp docs` to build the documentation.
* `gulp watch` to run the examples under `localhost:9001/examples/` and update JS/CSS files on the fly.
* `gulp` to generate the JS/CSS files and minified files, run the tests and generate the docs.


