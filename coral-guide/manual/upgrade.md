# Upgrade  

## From CoralUI3 to Coral Spectrum

### Custom Elements v1

CoralUI 3.x relies on Custom Elements v0 which is an outdated spec which won't be implemented natively in major browsers while 
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

From the Adobe Design perspective, there's a long standing directive which prohibits AD to design any New Product 
using anything less than the latest Spectrum theme. The concern in the Design Org is so high that there is an actual 
live form where AD is asked to enter products in order to be evaluated for Spectrum Theme Compliance. 
Needless to say, the Spectrum Theme is the only theme currently being supported and updated, with designers from all EC 
contributing to its features.
 
Coral Spectrum leverages the [Spectrum CSS](http://spectrum-css.corp.adobe.com/) framework to style 
components including the Spectrum SVG icons. 
To request new icons, please follow the instructions listed on http://icons.corp.adobe.com. Ideally, the icon team 
should be creating or reviewing every icon for every Adobe experience.

### Performance

CoralUI3 components are upgraded asynchronously due to limitation of Custom Elements v0. Custom Elements v1 are upgraded synchronously 
if the definition is loaded before any usage of the component. This is currently the case in AEM. 

Essentially this means that AEM users will be able to view the components rendered faster when the page loads with Coral Spectrum than with CoralUI3. 
Code-wise, it means that `Coral.commons.ready()` becomes obsolete in most cases.

Also, new technologies were introduced to take advantage of browsers new capabilities to reduce performance issues for 
certain components (e.g resizeListenerObserver for Coral.ActionBar which is used in all AEM consoles). 

The performance boost is visible by the test execution time:  

*CoralUI 3 UTs results*

```
HeadlessChrome 70.0.3538 (Mac OS X 10.13.6): 3516 tests executed (2 mins 28.947 secs / 1 min 43.192 secs)
Firefox 63.0.0 (Mac OS X 10.13.0): 3516 tests executed (2 mins 14.507 secs / 1 min 35.82 secs)
```

*Coral Spectrum UTs results (contains more tests due to full clone node support but still performs faster)*

```
HeadlessChrome 70.0.3538 (Mac OS X 10.13.6): 4481 tests executed (49.697 secs / 30.759 secs)
Firefox 63.0.0 (Mac OS X 10.13.0): Executed 4481 tests executed (1 min 1.791 secs / 36.38 secs)
```

### Overlay mechanism

CoralUI3's positioning system for overlays was based on jQueryUI which is known to have limited functionality compared 
to today's existing solutions. Replacing it by a modern solution (PopperJS) has proven that it can solve overlay/positioning 
issues reported in AEM. 

## Upgrade changes

### Custom Elements v1 

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

### Spectrum  
 
Due to the new Spectrum design, some components were updated to accommodate design pattern changes:
 
#### Selection pattern for Table, ColumnView and Masonry
 
The concept of selectable thumbnails for Table and ColumnView was replaced with checkboxes. Masonry still supports the old
way of selection since Card selection via checkbox was not implemented yet. 
 
#### SVG Icons

Coral Spectrum ships SVG icons that need to be loaded first before being displayed. 
There are several ways to load the icons: 
* Reuse the same file structure as in the `build` folder with `css/coral.css`, `js/coral.js` and `resources/*.svg`.   
* Add `data-coral-icons="PATH_TO_RESOURCES_FOLDER"` to the `<script>` loading Coral Spectrum. See [options](../class/coral-spectrum/coral-utils/src/scripts/Commons.js~Commons.html#instance-member-options) for details.
* Use [Coral.Icon#load](../class/coral-spectrum/coral-component-icon/src/scripts/Icon.js~Icon.html#static-method-load) to load the icon set on demand.

#### Unsupported styles 

Some components e.g Wait lost their variants due to the Spectrum update. For compatibility reasons, the APIs were left
untouched but will fallback to default supported options.   
   
Below the full list of unsupported options: 

Component | Property | Value
--- | --- | ---
Accordion | `variant` | `QUIET`, `LARGE`
Alert | `size` | `LARGE`
AnchorButton | `size` | `LARGE`
Autocomplete | `icon` |
Button | `size` | `LARGE`
Popover | `icon` |
Progress | `size` | `LARGE`
Progress | `labelPosition` | `BOTTOM`
Search | `icon` |
Slider | `vertical` | 
Slider | `tooltips` |
Table | `variant` | `LIST`
Tag | `size` | `SMALL`
Tag | `color` | `LIGHT_BLUE`, `PERIWINKLE`, `CYAN`, `PLUM`, `FUCHSIA`, `MAGENTA`, `TANGERINE`, `YELLOW`, `CHARTREUSE`, `KELLY_GREEN`, `SEA_FOAM`
Tooltip | `variant` | `WARNING`
Tooltip | `variant` | `INSPECT`
Wait | `variant` | `DOTS`

#### Internal private markup and classes

Due to the Spectrum CSS update, the internals of components changed e.g classes 
or internal markup is different.

For instance the example below will produce a different result in Coral Spectrum compared to CoralUI3:  
```
<button is="coral-button" icon="add">Button</button>
```  

*produces in CoralUI3*

``` 
<button is="coral-button" icon="add" class="coral3-Button coral3-Button--secondary" size="M" variant="secondary">
    <coral-icon class="coral3-Icon coral3-Icon--sizeS coral3-Icon--add" icon="add" size="S" alt=""></coral-icon>
    <coral-button-label>Button</coral-button-label>
</button>
```

*produces in Coral Spectrum*

```
<button is="coral-button" icon="add" variant="default" class="_coral-Button _coral-Button--primary" size="M">
  <coral-icon size="S" class="_coral-Icon--sizeS _coral-Icon" icon="add" alt="">
    <svg focusable="false" aria-hidden="true" class="_coral-Icon--svg _coral-Icon">
      <use xlink:href="#spectrum-icon-18-Add"></use>
    </svg>
  </coral-icon>
  <coral-button-label>Button</coral-button-label>
</button>
```

### Dependencies

Coral Spectrum has a few dependencies and polyfills. Some are actually written and maintained by the Coral Spectrum team, and are included 
without being considered an external dependency.

These dependencies are:
* [Spectrum CSS](http://spectrum-css.corp.adobe.com/) for the Spectrum theme and icons
* [Custom Elements v1 polyfill](https://github.com/webcomponents/custom-elements/) with built-in components support
* [Promise polyfill](https://www.npmjs.com/package/promise-polyfill) for IE11 support
* [CustomEvent polyfill](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent#Polyfill) for IE11 support
* [ResizeObserver polyfill](https://github.com/que-etc/resize-observer-polyfill) to detect element size changes
* Element `closest(), matches(), remove() and classList` polyfills for IE11 support
* [DOMly](https://github.com/lazd/domly) to render HTML templates
* [Vent](https://github.com/adobe/vent) for DOM event delegation
* [PopperJS](https://popper.js.org/) to manage poppers
* [Typekit](https://typekit.com/) to load Adobe Clean fonts

**Note:** Calendar, Clock and Datepicker components will leverage [moment.js](http://momentjs.com/) if loaded on the page. 

### API changes

* `window.CustomElements` is removed, `use window.customElements` instead.
* `Coral.mixins.*` are not public anymore.
* `coral-component:attached` is removed.
* `coral-component:detached` is removed.
* `alignMy` and `alignAt` are deprecated, use `placement` instead.

## Compatibility with CoralUI3

### Coral.register

Coral Spectrum ships by default a compatibility package to support the 3.x way to register elements `Coral.register`.
Unfortunately, components registered with `Coral.register` can't extend Coral components e.g :
```
Coral.register({
    name: 'Element',
    namespace: 'X',
    tagName: 'x-element',
    extend: Coral.Alert
});
```
will not extend `Coral.Alert`. In general, it's not recommended to extend Coral components.

You can still extend other components defined via `Coral.register`:
 ```
Coral.register({
    name: 'Alert',
    namespace: X,
    tagName: 'x-alert'
});
 Coral.register({
    name: 'Element',
    namespace: X,
    tagName: 'x-element',
    extend: X.Alert
});
```
Ideally, you should not use `Coral.register` to define Custom Elements. The recommended approach is to use the native ES6 
behavior : 
 ```
class Alert extends HTMLElement {}
// Set Alert on the X namespace 
X.Alert = Alert;
// Define the custom element
customElements.define('x-alert', X.Alert);

class Element extends Alert {}
X.Element = Element;
customElements.define('x-element', X.Element);
 ```
 
### Coral.commons.ready
Again, the recommended approach is to use the native behavior :
 
```
window.customElements.whenDefined('x-element', callback);
 ``` 
 **Caution**: not every Coral components is a Custom Element, some components are simple lightweight tags. They are used 
for content zones and are referenced as <code>Function</code> in the documentation. 

### Off-line Custom Elements v0 creation
 
Another caveat is the creation of Custom Elements v0 via `innerHTML`. This is natively not supported. The compatibility
package provides a helper script to support this use case :
 
```
document.registerElement("x-element", {
  prototype: Prototype
});
    
d = document.createElement('div');
d.innerHTML = '<x-element></x-element>'; 
 // The component is not initialized above. The workaround is to use the helper script instead as below : 
document.registerElement.innerHTML(d, '<x-element></x-element>'); 
``` 
