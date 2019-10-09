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

(function() {
  document.head.insertAdjacentHTML('beforeend', '<meta charset="utf-8"><link rel="icon" type="image/png" href="./manual/asset/favicon.png">');
  
  document.addEventListener('DOMContentLoaded', function() {
    var header = document.querySelector('.layout-container > header');
    var nav = document.querySelector('.navigation');
    
    // Insert title
    var title = document.createElement('span');
    title.textContent = document.title.split('|').pop().trim();
    header.children[0].appendChild(title);
    
    // Move header title
    nav.insertBefore(header.firstElementChild, nav.firstChild);
    
    var playground = document.createElement('a');
    playground.href = '../playground';
    playground.setAttribute('target', '_blank');
    playground.textContent = 'Playground';
    header.insertBefore(playground, header.firstElementChild);
    
    var examples = document.createElement('a');
    examples.href = '../examples';
    examples.setAttribute('target', '_blank');
    examples.textContent = 'Examples';
    header.insertBefore(examples, header.firstElementChild);
    
    // Indicate active navigation
    if (document.title.indexOf('Reference') !== -1) {
      header.children[2].classList.add('is-active');
    }
    else if (document.title.indexOf('Source') !== -1) {
      header.children[3].classList.add('is-active');
    }
    else if (document.title.indexOf('Manual') === -1) {
      header.children[2].classList.add('is-active');
      
      // Scroll into nav link
      var links = nav.querySelectorAll('a');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        
        if (link.href === location.href) {
          link.scrollIntoView();
          nav.scrollTop = nav.scrollTop - header.clientHeight;
          break;
        }
      }
    }
    
    // Hide content if empty for
    var content = document.querySelector('.content');
    if (content.textContent.trim() === '') {
      content.hidden = true;
    }
    
    // Remove README link
    var manualRootCard = content.querySelector('.manual-card-wrap');
    if (manualRootCard) {
      manualRootCard.remove()
    }
    
    // Remove README card
    var manualRootLink = nav.querySelector('.manual-toc-root [data-ice="manual"]:first-child');
    if (manualRootLink) {
      manualRootLink.remove();
    }
    
    var search = document.querySelector('.search-box');
    var result = document.querySelector('.search-result');
    var input = document.querySelector('.search-input');
    
    input.insertAdjacentHTML('beforebegin', '<svg class="search-icon" viewBox="0 0 16 16" width="100%" height="100%"><path d="M9.508.495h-.01A5.993 5.993 0 0 0 3.505 6.48v.007A5.993 5.993 0 0 0 4.77 10.17L.225 14.714a.75.75 0 1 0 1.05 1.072l.011-.011L5.83 11.23A5.998 5.998 0 1 0 9.508.495zm-.003 10.5a4.5 4.5 0 1 1 4.5-4.5 4.5 4.5 0 0 1-4.5 4.5z"></path></svg>');
    
    // Enhance search, open by default
    input.placeholder = 'Search components, events, properties, methods etc.';
    search.classList.add('active');
    
    // Remove directory information
    var navigationLinks = nav.querySelectorAll('.nav-dir-path');
    for (var i = 0; i < navigationLinks.length; i++) {
      var link = navigationLinks[i];
      link.textContent = link.textContent.split('/').shift();
    }
    
    // Remove directory information
    var directoryLinks = document.querySelectorAll('.identifier-dir-tree .identifier-dir-tree-content div');
    for (var i = 0; i < directoryLinks.length; i++) {
      directoryLinks[i].style.paddingLeft = '0';
      
      var link = directoryLinks[i].querySelector('a');
      var component = link.href.split('#').pop();
      link.textContent = component.substr(0, component.indexOf('-src'));
    }
    
    // Remove directory information
    var identifiers = document.querySelectorAll('.identifiers-wrap h2');
    for (var i = 0; i < identifiers.length; i++) {
      var identifier = identifiers[i];
      identifier.textContent = identifier.textContent.split('/').shift();
    }
    
    // Remove unnecessary summary information
    var descriptionEnhancements = document.querySelectorAll('.summary [data-ice="description"] ul');
    for (var i = 0; i < descriptionEnhancements.length; i++) {
      var enhancement = descriptionEnhancements[i];
      enhancement.remove();
    }
    
    // Modify Typedef types in favor of Event and Enum types
    var names = document.querySelectorAll('[data-ice="name"]');
    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      
      if (name.textContent.indexOf('Enum') !== -1) {
        var type = name.previousElementSibling;
        if (type && type.textContent.length === 1) {
          type.textContent = 'E';
          type.classList.add('kind-enum');
        }
      }
      
      if (name.textContent.indexOf('coral-') === 0 && name.textContent.indexOf(':') !== -1) {
        var type = name.previousElementSibling;
        if (type && type.textContent.length === 1) {
          type.textContent = 'E';
          type.classList.add('kind-event');
        }
      }
    }
    
    // Insert examples iframe
    var example = document.querySelector('a[href*="../examples/"]');
    if (example) {
      var id = new Date();
      example.insertAdjacentHTML('beforebegin',
        '<iframe id="'+ id +'" style="height:600px;border:0;width:100%;" src="'+ example.href +'"></iframe>');
      
      var iframe = document.getElementById(id);
      iframe.onload = function() {
        if (iframe.src.indexOf('shell') === -1) {
          var content = iframe.contentDocument;
          iframe.style.height = content.body.scrollHeight + 36 + 'px';
          content.documentElement.style.overflowY = 'hidden';
          
          content.documentElement.onclick = function() {
            iframe.style.height = content.body.scrollHeight + 36 + 'px';
          };
        }
      };
      example.remove();
    }
    
    document.body.classList.add('is-ready');
    
    // // Remove direction information from search results
    input.addEventListener('keyup', function() {
      var items = result.getElementsByTagName('a');
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!item.children.length) {
          item.textContent = item.textContent.split('/').pop().split('~').pop();
        }
      }
    });
    
    // Override manual.js
    function updateNavigation() {
      var matched = location.pathname.match(/\/(manual\/.*\.html)$/);
      if (!matched) {
        return;
      }
      
      var currentName = matched[1] + location.hash;
      var link = document.querySelector('.navigation .manual-toc li > a[href="' + currentName + '"]');
      if (link) {
        const selected = document.querySelector('.navigation .manual-toc li.is-selected');
        if (selected) {
          selected.classList.remove('is-selected');
        }
        link.parentNode.classList.add('is-selected');
      }
    }
    
    window.onhashchange = function() {
      updateNavigation();
    };
  
    updateNavigation();
  });
}());
