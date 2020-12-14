/**
 * Copyright 2019 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import commons from './Commons';
import events from './Events';

let typeKitId = commons && commons.options.typekit;
if (!typeKitId) {
  // On pageload, determine to current pages language setting.
  // If it is english language or unset use the 1st Adobe font web project id (smaller size),
  // otherwise use the 2nd kit with all the language settings (larger size)
  typeKitId = document.querySelector('[lang]:not([lang^="en"])') === null ? 'mge7bvf' : 'rok6rmo';
}

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

  const t = window.setTimeout(() => {
    h.classList.remove('wf-loading');
    h.classList.add('wf-inactive');
  }, config.scriptTimeout);

  const tk = document.createElement('script');
  let d = false;

  // Always load over https
  tk.src = `https://use.typekit.net/${config.kitId}.js`;
  tk.type = 'text/javascript';
  tk.async = 'true';
  tk.onload = tk.onreadystatechange = function () {
    const a = this.readyState;
    if (d || a && a !== 'complete' && a !== 'loaded') {
      return;
    }

    d = true;
    clearTimeout(t);

    try {
      window.Typekit.load(config);
    } catch (b) {
    }
  };

  const s = document.getElementsByTagName('script')[0];
  s.parentNode.insertBefore(tk, s);
} else {
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
