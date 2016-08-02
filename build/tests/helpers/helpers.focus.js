var helpers = helpers || {};

helpers.focus = function focus(element) {
  'use strict';
  element.focus();
  var event = document.createEvent('Event');
  event.initEvent('focus', false, true);
  element.dispatchEvent(event);
};

helpers.expectActive = function expectActive(element) {
  'use strict';

  var activeElement = document.activeElement;
  var isActive = (activeElement === element);
  if (!isActive && activeElement && activeElement !== document.body) {
    console.log('Active element:', activeElement.outerHTML);
  }
  var activeElementTag = activeElement && activeElement.tagName;

  // Avoid page-long alert message/circular structure
  expect(isActive, 'Expected element is not active. Active element: ' + activeElementTag).to.be.true;

};
