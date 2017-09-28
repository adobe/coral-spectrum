var helpers = helpers || {};

helpers.overlay = {};

helpers.overlay.createFloatingTarget = function() {
  'use strict';
  var target = document.createElement('div');
  target.textContent = 'Floating overlay target';
  target.style.position = 'fixed';
  target.style.left = '50%';
  target.style.top = '50%';

  // Add to helpers.target so it it cleared after each test
  helpers.target.appendChild(target);

  return target;
};

helpers.overlay.createStaticTarget = function() {
  'use strict';
  var target = document.createElement('div');
  target.textContent = 'Static overlay target';

  // Add to helpers.target so it it cleared after each test
  helpers.target.appendChild(target);

  return target;
};
