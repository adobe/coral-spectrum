/**
 MIT License
 Copyright (c) 2018 Juan Valencia
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

// focus - focusOptions - preventScroll polyfill
let supportsPreventScrollOption = false;
try {
  const focusElem = document.createElement('div');
  
  focusElem.addEventListener('focus', (event) => {
    event.preventDefault();
    event.stopPropagation();
  }, true);
  
  focusElem.focus(
    Object.defineProperty({}, 'preventScroll', {
      get: () => {
        supportsPreventScrollOption = true;
      }
    })
  );
}
catch (e) {}

if (HTMLElement.prototype.nativeFocus === undefined && !supportsPreventScrollOption) {
  
  HTMLElement.prototype.nativeFocus = HTMLElement.prototype.focus;
  
  const getScrollParent = (node) => {
    const isElement = node instanceof HTMLElement;
    const overflowY = isElement && window.getComputedStyle(node).overflowY;
    const isScrollable = overflowY !== 'visible' && overflowY !== 'hidden';
    
    if (!node) {
      return null;
    }
    else if (isScrollable && node.scrollHeight >= node.clientHeight) {
      return node;
    }
    
    return getScrollParent(node.parentNode) || document.body;
  };
  
  const patchedFocus = function(args) {
    const scrollElement = getScrollParent(this);
    const actualPosition = scrollElement.scrollTop;
    this.nativeFocus();
    if (args && args.preventScroll) {
      // Hijacking the event loop order, since the focus() will trigger
      // internally an scroll that goes to the event loop
      setTimeout(function() {
        scrollElement.scrollTop = actualPosition;
      }, 0);
    }
  };
  
  HTMLElement.prototype.focus = patchedFocus;
}
