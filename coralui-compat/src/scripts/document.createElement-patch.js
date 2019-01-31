// Patch to be able to use document.createElement(tagName, customElement) from custom elements v0
const documentCreateElement = document.createElement;
document.createElement = function createElement() {
  if (typeof arguments[1] === 'string') {
    arguments[1] = {is: arguments[1]};
  }
  return documentCreateElement.apply(this, arguments);
};
