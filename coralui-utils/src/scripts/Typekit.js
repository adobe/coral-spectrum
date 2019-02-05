import commons from './Commons';
import events from './Events';

const typeKitId = commons && commons.options.typekit || 'ruf7eed';

const config = {
  kitId: typeKitId,
  scriptTimeout: 3000,
  loading: () => {
    events.dispatch('coral-commons:_webfontloading');
  },
  active: () => {
    events.dispatch('coral-commons:_webfontactive');
  },
  inactive: () => {
    events.dispatch('coral-commons:_webfontinactive');
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
