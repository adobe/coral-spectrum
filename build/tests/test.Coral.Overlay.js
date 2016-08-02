describe('Coral.Overlay', function() {
  'use strict';

  it('should be defined in the Coral namespace', function() {
    expect(Coral).to.have.property('Overlay');
  });

  var overlay, targetOther, targetNext, targetPrev;

  // Setup tests
  beforeEach(function() {
    // Create a target after the the overlay
    targetPrev = helpers.overlay.createStaticTarget();

    // Create a new overlay
    overlay = new Coral.Overlay();
    helpers.target.appendChild(overlay);

    // Create a target before the overlay
    targetNext = helpers.overlay.createStaticTarget();

    // Create a target elsewhere
    targetOther = helpers.overlay.createFloatingTarget();
    targetOther.setAttribute('id', 'overlay-targetOther');
  });

  afterEach(function() {
    if (overlay.open) {
      // Close the overlay
      overlay.open = false;
    }

    if (overlay.parentNode) {
      // Remove it from the DOM
      overlay.parentNode.removeChild(overlay);
    }

    overlay = null;
  });

  describe('placement', function() {
    it('should set alignAt and alignMy correctly for top', function() {
      overlay.placement = 'top';
      expect(overlay.alignMy).to.equal('center bottom');
      expect(overlay.alignAt).to.equal('center top');
    });

    it('should set alignAt and alignMy correctly for bottom', function() {
      overlay.placement = 'bottom';
      expect(overlay.alignMy).to.equal('center top');
      expect(overlay.alignAt).to.equal('center bottom');
    });

    it('should set alignAt and alignMy correctly for left', function() {
      overlay.placement = 'left';
      expect(overlay.alignMy).to.equal('right center');
      expect(overlay.alignAt).to.equal('left center');
    });

    it('should set alignAt and alignMy correctly for right', function() {
      overlay.placement = 'right';
      expect(overlay.alignMy).to.equal('left center');
      expect(overlay.alignAt).to.equal('right center');
    });
  });

  describe('target', function() {
    it('should support DOM elements', function() {
      overlay.target = targetOther;

      expect(overlay._getTarget()).to.equal(targetOther);
    });

    it('should support _prev', function() {
      overlay.target = '_prev';

      expect(overlay._getTarget()).to.equal(targetPrev);
    });

    it('should support _next', function() {
      overlay.target = '_next';

      expect(overlay._getTarget()).to.equal(targetNext);
    });

    it('should support CSS selectors', function() {
      overlay.target = '#overlay-targetOther';

      expect(overlay._getTarget()).to.equal(targetOther);
    });

    it('should store null when null provided', function() {
      overlay.target = null;

      expect(overlay._getTarget()).to.equal(null);
    });
  });

  // @todo: skipped due to some fails in firefox (CUI-4086)
  it.skip('should open and close the overlay when show()/hide() called', function(done) {
    var target = helpers.overlay.createFloatingTarget();

    overlay.set({
      innerHTML: 'Overlay content',
      target: target
    });
    expect(overlay.open).to.be.false;

    overlay.show();

    helpers.next(function() {
      expect(overlay.open).to.be.true;

      overlay.hide();

      helpers.next(function() {
        expect(overlay.open).to.be.false;
        done();
      });
    });
  });

  // @todo: skipped due to some fails in firefox (CUI-4086)
  it.skip('should set the appropriate value for aria-hidden attribute when the overlay is shown/hidden', function(done) {
    overlay.set({
      innerHTML: 'Overlay content',
      target: targetOther
    });

    // Coral.overlay should apply aria-hidden right away
    expect(overlay.getAttribute('aria-hidden')).to.equal('true');

    overlay.show();
    helpers.next(function() {
      expect(overlay.getAttribute('aria-hidden')).to.equal('false');

      overlay.hide();
      helpers.next(function() {
        expect(overlay.getAttribute('aria-hidden')).to.equal('true');
        done();
      });
    });
  });

  // @todo maybe this test should be part of a mixin
  it('should hide when any element with [coral-close] clicked', function() {
    overlay.show();

    expect(overlay.open).to.equal(true, 'open before close clicked');

    overlay.innerHTML = '<button coral-close id="closeButton">Close me!</button>';

    overlay.querySelector('#closeButton').click();

    expect(overlay.open).to.equal(false, 'open after close clicked');
  });

  // @todo maybe this test should be part of a mixin
  it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
    overlay.show();

    var spy = sinon.spy();
    helpers.target.addEventListener('click', spy);

    overlay.id = 'myOverlay';
    expect(overlay.open).to.equal(true, 'open before close clicked');

    overlay.innerHTML = '<button coral-close="#myOverlay" id="closeMyOverlay">Close me!</button><button coral-close="#otherOverlay" id="closeOtherOverlay">Close someone else!</button>';

    // Click the button that should do nothing
    overlay.querySelector('#closeOtherOverlay').click();
    expect(overlay.open).to.equal(true, 'open after close clicked');
    expect(spy.callCount).to.equal(1, 'click event bubble count');

    spy.reset();

    // Click the button that should close the overlay
    overlay.querySelector('#closeMyOverlay').click();
    expect(overlay.open).to.equal(false, 'open after close clicked');
    expect(spy.callCount).to.equal(0, 'click event bubble count');
  });
});
