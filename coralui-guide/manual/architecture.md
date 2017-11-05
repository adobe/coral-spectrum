# Architecture

## Web Components

CoralUI hides implementation detail from consumers by leveraging the [Custom Elements v1](https://w3c.github.io/webcomponents/spec/custom/) 
specification, which is part of the emerging [Web Components](https://www.webcomponents.org/introduction) standard.

**Therefore any Coral CSS classes and attributes not explicitly mentioned in the public documentation are private and subject to change. 
Their direct use is not recommended and at high risk of breaking after subsequent updates of CoralUI library.**

Custom elements allow CoralUI to define new types of DOM elements to be used in an HTML document. As a result, CoralUI 
can extend native elements like a button or text input to provide additional functionality or it can provide completely 
new elements like a progress indicator. Consumers can then use these elements using their custom tags (e.g., `<coral-progress>`) 
and directly interact with their custom properties.

A strong advantage CoralUI derives from Custom Elements is the ability to hide many implementation details from the consumer. 
While a progress indicator may be composed of a variety of spans, divs, or images, these are underlying details that shouldn't
concern consumers. Rather than consumers copying and maintaining large swaths of code containing all these elements with their 
various attributes, they are typically able to use a simple Custom Element tag and the underlying elements are seamlessly 
produced by CoralUI on their behalf. By keeping implementation details internal to components, the exposed public API is 
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

CoralUI has a few dependencies and polyfills. Some are actually written and maintained by the CoralUI team, and are included in 
CoralUI without being considered an external dependency.

These dependencies are:
* [Custom Elements v1 polyfill](https://github.com/webcomponents/custom-elements/) with built-in components support
* [DOMly](https://github.com/lazd/domly) to render HTML templates
* [Vent](https://git.corp.adobe.com//lawdavis/vent) for DOM event delegation
* [PopperJS](https://popper.js.org/) to manager poppers


## Upgrade to CoralUI (4.x)

### Custom Elements v1

3.x relies on Custom Elements v0 which is an outdated spec which won't be implemented natively in major browsers.
V0 was a [Google-only proposed specification](https://www.w3.org/TR/2016/WD-custom-elements-20160226/) while 
Custom Elements v1 is a WHATWG Web Standard adopted by all major browser vendors.

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
 
With 4.x and Custom Elements v1, this is not possible anymore since the tag is empty when created. You'll have
to use the JavaScript API provided by the component instead.

```
var alert = new Coral.Alert();
var header = alert.header; // Use the JS API to access the content zone
header.textContent = 'Info';
```

Also `window.CustomElements` namespace provided by the CoralUI (3.x) Custom Elements v0 polyfill doesn't exist in CoralUI (4.x).

### Coral.register

CoralUI (4.x) ships by default a compatibility package to support the CoralUI (3.x) way to register elements `Coral.register`.
Unfortunately, extending Coral 4.x components is not supported. So if you have :
```
Coral.register({
    name: 'Element',
    tagName: 'coral-element',
    extend: Coral.Alert
});
```

It will not extend `Coral.Alert`. Instead use ES6 classes `extend` feature to extend Coral components.


