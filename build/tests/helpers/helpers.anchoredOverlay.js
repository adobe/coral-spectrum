var helpers = helpers || {};

helpers.createFloatingTarget = function() {
  'use strict';
  var target = document.createElement('div');
  target.textContent = 'Floating anchoredOverlay target';
  target.style.position = 'fixed';
  target.style.left = '50%';
  target.style.top = '50%';

  // Add to helpers.target so it it cleared after each test
  helpers.target.appendChild(target);

  return target;
};

helpers.createStaticTarget = function() {
  'use strict';
  var target = document.createElement('div');
  target.textContent = 'Static anchoredOverlay target';

  // Add to helpers.target so it it cleared after each test
  helpers.target.appendChild(target);

  return target;
};

helpers.expectAnchoredOverlayToPointAt = function(anchoredOverlay, target) {
  'use strict';
  if (anchoredOverlay.pointFrom === 'right') {
    var anchoredOverlayLeft = anchoredOverlay.offsetLeft;
    var targetRight = target.offsetLeft + anchoredOverlay.offsetWidth;
    expect(anchoredOverlayLeft).to.be.at.least(targetRight, 'AnchoredOverlay left position when pointing at target from right');
  }
  else if (anchoredOverlay.pointFrom === 'left') {
    var anchoredOverlayRight = anchoredOverlay.offsetLeft + anchoredOverlay.offsetWidth;
    var targetLeft = target.offsetLeft;
    expect(anchoredOverlayRight).to.be.at.most(targetLeft, 'AnchoredOverlay left position when pointing at target from left');
  }
  else if (anchoredOverlay.pointFrom === 'bottom') {
    var anchoredOverlayTop = anchoredOverlay.offsetTop;
    var targetBottom = target.offsetTop + target.offsetHeight;

    expect(anchoredOverlayTop).to.be.at.least(targetBottom, 'AnchoredOverlay top position when pointing at target from the bottom');
  }
  else if (anchoredOverlay.pointFrom === 'top') {
    var anchoredOverlayBottom = anchoredOverlay.offsetTop + anchoredOverlay.offsetHeight;
    var targetTop = target.offsetTop;

    expect(anchoredOverlayBottom).to.be.at.most(targetTop, 'AnchoredOverlay top position when pointing at target from the top');
  }
};
