# Styles

## Theme (light, dark, lightest, darkest)

The default Coral Spectrum styles cascade from `coral--light`, `coral--lightest`, `coral--dark` and `coral--darkest` theme, so that class must be specified at a higher level.

```
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

```
<body class="coral--light coral--large">
   <!-- light theme -->
   <!-- large scale -->
</body>
```

## CSS utility classes

Coral Spectrum provides some CSS utility classes that can be applied to any DOM element. 

### u-coral-clearFix

Applies the clearfix hack.

### u-coral-noBorder

Removes all the borders of an element.

### u-coral-noScroll

Stops an element from scrolling.

### u-coral-screenReaderOnly

Hides elements from visual browsers.

### u-coral-closedHand

A closed hand cursor that indicates an item is current grabbed.

### u-coral-openHand

An open hand cursor to indicate that an item can be grabbed.

### u-coral-pullLeft

Floats the content to the left.

### u-coral-pullRight

Floats the content to the right.

### u-coral-padding

Adds the default padding on all sides.

### u-coral-padding-horizontal

Adds the default padding to left and right.

### u-coral-padding-vertical

Adds the default padding to top and bottom.

### u-coral-margin

Adds the default the margin on all sides.

### u-coral-noPadding

Removes the padding on all sides.

### u-coral-noPadding-horizontal

Removes the padding on the left and right side.

### u-coral-noPadding-vertical

Removes the padding on the top and bottom side.

### u-coral-noMargin

Removes the margin on all sides.

### u-coral-ellipsis

Prevent text from wrapping, use an ellipsis to truncate.

### u-coral-visibleXS | u-coral-hiddenXS 

Extra small device.

### u-coral-visibleS | u-coral-hiddenS

Small device.

### u-coral-visibleM | u-coral-hiddenM

Medium device.

### u-coral-visibleL | u-coral-hiddenL

Large device.

### u-coral-visibleXL | u-coral-hiddenXL

Extra large device.

### u-coral-visibleXXL | u-coral-hiddenXXL

Above extra large device.

## Fonts via Typekit

Coral Spectrum uses Typekit to securely deliver the Adobe Clean corporate font.

### Domains

It comes pre-configured with a kit that is limited to certain domains including :

* localhost
* 127.0.0.1
* 0.0.0.0
* *.adobe.com

If you are using Coral Spectrum on a server on a domain other than these, you will need to request and configure your own Typekit kit. 
Reach out to the Typekit team on https://fonts.adobe.com/.

### Using a Custom Kit with Coral Spectrum

Include your Typekit ID as a Coral Spectrum option e.g. :

```
<script src="js/coral.min.js" data-coral-typekit="TYPEKIT_ID"></script>
```

### Font loading

Typekit typically relies on a `.wf-loading` selector to hide content and prevent the Flash Of Unstyled Text (FOUT) that 
is associated with web fonts.

```
.wf-loading {
  visibility: hidden;
}
```

That selector would work in conjunction with the function in the typekit.js JavaScript file to remove the selector from 
the DOM when Typekit has loaded. However, experience has shown that hiding content and blocking until Typekit loads can 
make the page or app unresponsive on initial load.

Coral Spectrum remains agnostic. Consumers must implement their own solution to avoid Flash Of Unstyled Text during font loading.

