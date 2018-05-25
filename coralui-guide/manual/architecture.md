# Architecture

## Web Components

Coral Spectrum hides implementation detail from consumers by leveraging the [Custom Elements v1](https://html.spec.whatwg.org/multipage/custom-elements.html) 
specification, which is part of the emerging [Web Components](https://www.webcomponents.org/introduction) standard.

**Therefore any Coral CSS classes and attributes not explicitly mentioned in the public documentation are private and subject to change. 
Their direct use is not recommended and at high risk of breaking after subsequent updates of Coral Spectrum library.**

Custom elements allow Coral Spectrum to define new types of DOM elements to be used in an HTML document. As a result, Coral Spectrum 
can extend native elements like a button or text input to provide additional functionality or it can provide completely 
new elements like a progress indicator. Consumers can then use these elements using their custom tags (e.g., `<coral-progress>`) 
and directly interact with their custom properties.

A strong advantage Coral Spectrum derives from Custom Elements is the ability to hide many implementation details from the consumer. 
While a progress indicator may be composed of a variety of spans, divs, or images, these are underlying details that shouldn't
concern consumers. Rather than consumers copying and maintaining large swaths of code containing all these elements with their 
various attributes, they are typically able to use a simple Custom Element tag and the underlying elements are seamlessly 
produced by Coral Spectrum on their behalf. By keeping implementation details internal to components, the exposed public API is 
minimized and more explicit resulting in a lower risk of introducing breaking changes. 

For now, we have not implemented Shadow DOM or other aspects of the Web Components specification due to lack of browser 
native support but also polyfill performance issues. 

Custom Elements can be used before their definition is registered. Progressive enhancement is a feature of Custom Elements.
To know when an element or a set of elements becomes defined, you can use `Coral.commons.ready(el, callback)`;

## Content Zones

Without shadow DOM, we need some way to mix user-provided content with presentational elements. Our answer to this is content zones. 
Essentially, we have simple, brainless HTML tags that serve as wrappers for content. 
Users provide these tags when creating elements from markup, and after we render the template, we simply move these content zones into place.

This `Coral.Alert` markup shows content zones for header and content areas of the component:

```
<coral-alert>
  <coral-alert-header>INFO</coral-alert-header>
  <coral-alert-content>This is is an alert.</coral-alert-content>
</coral-alert>
```

Additionally, in the same way you can access the body of the HTML document with document.body, we create references for 
each content zone on the JavaScript object that corresponds to the component. You can access the header content zone with 
`alert.header` and change its content e.g append elements or do whatever else you need to do.

## Dependencies

Coral Spectrum has a few dependencies and polyfills. Some are actually written and maintained by the Coral Spectrum team, and are included 
without being considered an external dependency.

These dependencies are:
* [Custom Elements v1 polyfill](https://github.com/webcomponents/custom-elements/) with built-in components support
* [DOMly](https://github.com/lazd/domly) to render HTML templates
* [Vent](https://github.com/adobe/vent) for DOM event delegation
* [PopperJS](https://popper.js.org/) to manager poppers


## Upgrade to Coral Spectrum

### Custom Elements v1

CoralUI 3.x relies on Custom Elements v0 which is an outdated spec which won't be implemented natively in major browsers.
V0 was a [Google-only proposed specification](https://www.w3.org/TR/2016/WD-custom-elements-20160226/) while 
Coral Spectrum relies on Custom Elements v1 which is a WHATWG Web Standard adopted by all major browser vendors.

A major change in v1 is that component initialization is now done in an ES6 class constructor. The list of 
[Requirements for custom element constructors](http://w3c.github.io/webcomponents/spec/custom/#custom-element-conformance) 
prohibits a new component from setting attributes or adding child nodes in its constructor. 
 
**Let's have a look at a concrete example**
 
With 3.x you could do following: 
```
var alert = new Coral.Alert();
var header = alert.querySelector('coral-alert-header');
header.textContent = 'Info';
```
 
With Coral Spectrum and Custom Elements v1, this is not possible anymore since the tag is empty when created. You'll have
to use the JavaScript API provided by the component instead.

```
var alert = new Coral.Alert();
var header = alert.header; // Use the JS API to access the content zone
header.textContent = 'Info';
```

Also `window.CustomElements` namespace provided by the 3.x Custom Elements v0 polyfill doesn't exist in Coral Spectrum.

### Coral.register

Coral Spectrum ships by default a compatibility package to support the 3.x way to register elements `Coral.register`.
Unfortunately, components registered with `Coral.register` can't be extended e.g :
```
Coral.register({
    name: 'Element',
    tagName: 'coral-element',
    extend: Coral.Alert
});
```
will not extend `Coral.Alert`. Instead use ES6 classes `extend` feature to extend Coral Spectrum components.

### API changes 
 
Due to the new Spectrum design, the API of few components were adapted accordingly: 
 
#### SVG Icons

Coral Spectrum ships SVG icons that need to be loaded first before being displayed. 
There are several ways to load the icons: 
* Reuse the same file structure as in the `build` folder with `css/coral.css`, `js/coral.js` and `resources/*.svg`.   
* Add `data-coral-icons="PATH_TO_RESOURCES_FOLDER"` to the `<script>` loading Coral Spectrum. See [options](../class/coral-spectrum/coralui-util/src/scripts/Commons.js~Commons.html#instance-member-options) for details.
* Use [Coral.Icon#load](../class/coral-spectrum/coralui-component-icon/src/scripts/Icon.js~Icon.html#static-method-load) to load the icon set on demand.
 
#### CTA Buttons

Spectrum has deliberately changed [ButtonVariantEnum.PRIMARY](../typedef/index.html#static-typedef-ButtonVariantEnum). 
The blue button (Call To Action) should really only show up maybe once per page therefore we encourage teams to review the usage of 
Primary Button and switch to CTA Button only when it makes sense.

#### Dialog Popovers

Spectrum Popovers are coming in 2 different variations: 
 * Dialog Popover with header, content and footer section
 * Flyout Popover used as dropdown in other components
 
Therefore [PopoverVariantEnum.FLYOUT](../typedef/index.html#static-typedef-PopoverVariantEnum) was added in addition 
to the default Popover variant used to render a Dialog Popover.     

 
 
 
 
