/*
 * ADOBE CONFIDENTIAL
 *
 * Copyright 2019 Adobe
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Adobe and its
 * suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 */

function handleError(string) {
  string = `Coral.Icon#load: ${string}`;
  const error = new Error(string);
  
  console.error(error.toString());
}

function injectSVG(svgURL, callback) {
  // 200 for web servers, 0 for CEP panels
  if (this.status !== 200 && this.status !== 0) {
    handleError(`Failed to fetch icons, server returned ${this.status}`);
    return;
  }
  
  // Parse the SVG
  const parser = new DOMParser();
  try {
    const doc = parser.parseFromString(this.responseText, 'image/svg+xml');
    const svg = doc.firstChild;
  
    // Make sure a real SVG was returned
    if (svg && svg.tagName === 'svg') {
      // Store url information
      svg.setAttribute('data-url', svgURL);
      
      // Off screen because we can't hide it due to radial gradients
      svg.classList.add('_coral-Icon-collection');
      svg.setAttribute('focusable', 'false');
      svg.setAttribute('aria-hidden', 'true');
      svg.style.position = 'absolute';
      svg.style.left = '-999px';
    
      // Insert it into the body
      if (document.body) {
        document.body.appendChild(svg);
  
        // Pass the SVG to the callback
        if (typeof callback === 'function') {
          callback(null, svg);
        }
      }
      else {
        document.addEventListener('DOMContentLoaded', () => {
          document.body.appendChild(svg);
  
          // Pass the SVG to the callback
          if (typeof callback === 'function') {
            callback(null, svg);
          }
        });
      }
    }
    else {
      handleError('Parsed SVG document contained something other than an SVG');
    }
  }
  catch (err) {
    handleError(`'Error parsing SVG: ${err}'`);
  }
}

function loadIcons(svgURL, callback) {
  // Request the SVG sprite
  const req = new XMLHttpRequest();
  req.open('GET', svgURL, true);
  req.addEventListener('load', injectSVG.bind(req, svgURL, callback));
  req.addEventListener('error', () => {
    handleError('Request failed');
  });
  req.send();
}

export default loadIcons;
