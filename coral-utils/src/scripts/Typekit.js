import commons from './Commons';
import events from './Events';

const typeKitId = commons && commons.options.typekit || 'ruf7eed';

const config = {
  kitId: typeKitId,
  scriptTimeout: 3000,
  active: () => {
    events.dispatch('coral-commons:_webfontactive');
  }
};

if (!window.Typekit) { // we load the typescript only once
  const h = document.getElementsByTagName('html')[0];
  h.classList.add('wf-loading');
  
  const t = setTimeout(() => {
    h.classList.remove('wf-loading');
    h.classList.add('wf-inactive');
  }, config.scriptTimeout);
  
  const tk = document.createElement('script');
  let d = false;
  
  // Always load over https
  tk.src = `https://use.typekit.net/${config.kitId}.js`;
  tk.type = 'text/javascript';
  tk.async = 'true';
  tk.onload = tk.onreadystatechange = function() {
    const a = this.readyState;
    if (d || a && a !== 'complete' && a !== 'loaded') {
      return;
    }
    
    d = true;
    clearTimeout(t);
    
    try {
      window.Typekit.load(config);
    }
    catch (b) {}
  };
  
  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(tk, s);
}
else {
  // If Typekit is loaded externally, listen with a MO for active fonts
  const root = document.documentElement;
  if (root.className.indexOf('wf-inactive') !== -1 || root.className.indexOf('wf-loading') !== -1) {
    const webFontLoadObserver = new MutationObserver(() => {
      if (root.className.indexOf('wf-active') !== -1) {
        webFontLoadObserver.disconnect();
        events.dispatch('coral-commons:_webfontactive');
      }
    });
  
    // Watch for class changes
    webFontLoadObserver.observe(root, {
      attributes: true,
      attributeFilter: ['class']
    });
  }
}
