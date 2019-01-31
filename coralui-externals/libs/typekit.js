import {commons, events} from '../../coralui-utils';

var typeKitId = commons && commons.options.typekit || 'ruf7eed';

var config = {
  kitId: typeKitId,
  scriptTimeout: 3000,
  loading: function() {
    events.dispatch('coral-commons:_webfontloading');
  },
  active: function() {
    events.dispatch('coral-commons:_webfontactive');
  },
  inactive: function() {
    events.dispatch('coral-commons:_webfontinactive');
  }
};

if (!window.Typekit) { // we load the typescript only once
  var h = document.getElementsByTagName("html")[0];
  h.className += " wf-loading";
  var t = setTimeout(function() {
    h.className = h.className.replace(/(\s|^)wf-loading(\s|$)/g, " ");
    h.className += " wf-inactive";
  }, config.scriptTimeout);
  var tk = document.createElement("script"),
    d = false;
  
  // Always load over https
  tk.src = 'https://use.typekit.net/' + config.kitId + '.js'
  tk.type = "text/javascript";
  tk.async = "true";
  tk.onload = tk.onreadystatechange = function() {
    var a = this.readyState;
    if (d || a && a !== "complete" && a !== "loaded") {
      return;
    }
    d = true;
    clearTimeout(t);
    try {
      Typekit.load(config);
    } catch (b) {}
  };
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(tk, s);
}
