# Coral UI Package Contents
This readme explains the Coral UI zip package contents explained.

**What is CoralUI?**
CoralUI is an implementation of the [Cloud UI][cloudui_url] visual style that provides everything your product needs to build out a web based UI. Check out our interactive [Style Guide][guide_url] to see Coral UI in action.

For help in using Coral UI on your project, see the [Using Coral UI FAQ][help_url] wiki page.

---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

# cui-latest.zip
The cui-latest.zip contains the minimum needed to add Coral UI to a web project.

Contents:  
```
css/  
  cui.min.css : a minified Coral UI component CSS.  

js/  
  CUI.min.js : uglified Coral UI component JavaScript.  

res/  
  components/**/* : resource files consumed by components.  
  icons/**/* : icon font files.  

```

---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ---- ----

# cui-latest-full.zip
The cui-latest-full.zip contains everything above, plus:

```
css/
  cui.css : un-minified Coral UI css
  cui-wrapped*.css : full and minified Cora UI css, wrapped to avoid selector collisions 

js/
  CUI.js : full copy of the CUI JavaScript, not uglified.
  CUI.Templates*.js : <<DEPRECATED>> Handlebars templates.
  libs/* : CUI JavaScript dependencies
  source/* : individual CUI component source files

less/* : the LESS source files for creating CUI css.

tests/* : the Mocha test runner and unit tests

```
Note that the full archive is not linked from the Coral UI Style Guide.  It is recommended that, should you need the full CSS, JavaScript, source files, or tests, you are better off cloning the git repo and building Coral UI from source. 

If building yourself isn't an option, you can get the full zip at this URL:
https://git.corp.adobe.com/pages/Coral/CoralUI/release/cui-latest-full.zip

See the [Coral UI Wiki][wiki_url] or email the [Coral UI DL](coralui@adobe.com) for more information.

[cloudui_url]: http://blogs.corp.adobe.com/xdcloudui
[guide_url]: https://git.corp.adobe.com/pages/Coral/CoralUI/
[wiki_url]: https://git.corp.adobe.com/Coral/CoralUI/wiki/Home
[help_url]: https://git.corp.adobe.com/Coral/CoralUI/wiki/Using-CoralUI-FAQ

