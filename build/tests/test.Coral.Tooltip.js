describe('Coral.Tooltip', function() {
  'use strict';

  var helpers = window.helpers;

  it('should be defined in Coral namespace', function() {
    expect(Coral).to.have.property('Tooltip');
  });

  it('should have correct default property values', function() {
    var tooltip = new Coral.Tooltip();
    helpers.target.appendChild(tooltip);

    expect(tooltip.variant).to.equal('info');
    expect(tooltip.delay).to.equal(500);
  });

  it('should set content', function(done) {
    var tooltip = new Coral.Tooltip();
    helpers.target.appendChild(tooltip);

    tooltip.content.innerHTML = 'Test';
    tooltip.show();

    Coral.commons.nextFrame(function() {
      expect(tooltip.textContent).to.equal('Test');
      done();
    });
  });

  it('should open when target element is focused', function() {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      content: {
        textContent: 'A tooltip'
      },
      target: target,
      placement: 'top',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.equal(false, 'tooltip closed initially');

    $(target).trigger('focusin');
    expect(tooltip.open).to.equal(true, 'tooltip open after focusing on target');
  });

  it('should remove and add target listeners when target changed', function() {
    var target = helpers.createStaticTarget();

    var tooltip = new Coral.Tooltip().set({
      content: {
        textContent: 'A tooltip'
      },
      placement: 'left',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    // Point at the old target
    tooltip.target = target;

    expect(tooltip.open).to.equal(false, 'tooltip closed initially');

    // Show via focus
    $(target).trigger('focusin');

    expect(tooltip.open).to.equal(true, 'tooltip open after focusing on target');

    tooltip.hide();

    expect(tooltip.open).to.equal(false, 'tooltip closed after hide() called');

    // Set new target
    var newTarget = helpers.createStaticTarget();
    tooltip.target = newTarget;

    // Try to show via focus on the old target
    $(target).trigger('focusin');

    expect(tooltip.open).to.equal(false, 'tooltip stays closed after clicking old target after target changed');

    // Show by focusing on the new target
    $(newTarget).trigger('focusin');

    expect(tooltip.open).to.equal(true, 'tooltip open after clicking new target');
  });

  it('should not display the tooltip until the specified delay', function() {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      target: target,
      placement: 'top',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.be.false;

    // trigger twice to check that timeout is cleared.
    $(target).trigger('focusin');
    $(target).trigger('focusin');
    expect(tooltip.open).to.be.true;
  });

  it('should be hidden when focusout triggered on the target element', function(done) {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      target: target,
      placement: 'top',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.be.false;

    tooltip.show();

    expect(tooltip.open).to.be.true;

    $(target).trigger('focusout');
    Coral.commons.nextFrame(function() {
      expect(tooltip.open).to.be.false;
      done();
    });
  });

  it('should clear any remaining timeouts when focusout triggered on the target element', function(done) {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      target: target,
      placement: 'top',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.be.false;

    tooltip.show();

    expect(tooltip.open).to.be.true;
    $(target).trigger('focusin');
    $(target).trigger('focusout');
    Coral.commons.nextFrame(function() {
      expect(tooltip.open).to.be.false;
      done();
    });
  });

  it('should be hidden when mouseout triggered on the target element', function(done) {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      delay: 0,
      target: target
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.be.false;

    tooltip.show();

    expect(tooltip.open).to.be.true;

    $(target).trigger('mouseout');
    Coral.commons.nextFrame(function() {
      expect(tooltip.open).to.be.false;
      done();
    });
  });

  it('should clear all remaining timeouts when mouseout triggered on the target element', function(done) {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      target: target,
      placement: 'top',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.be.false;

    tooltip.show();

    expect(tooltip.open).to.be.true;

    $(target).trigger('focusin');
    $(target).trigger('mouseout');
    Coral.commons.nextFrame(function() {
      expect(tooltip.open).to.be.false;
      done();
    });
  });

  it('should not open on target focus or mouseenter when interaction="off"', function() {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      content: {
        textContent: 'A tooltip'
      },
      target: target,
      placement: 'top',
      interaction: 'off',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.equal(false, 'tooltip closed initially');

    $(target).trigger('focusin');
    expect(tooltip.open).to.equal(false, 'tooltip still closed after focusing on target');

    $(target).trigger('mouseenter');
    expect(tooltip.open).to.equal(false, 'tooltip still closed after mouseenter on target');
  });

  it('should not open on target focus or mouseenter when interaction="off"', function() {
    var target = helpers.createFloatingTarget();

    var tooltip = new Coral.Tooltip().set({
      content: {
        textContent: 'A tooltip'
      },
      target: target,
      placement: 'top',
      interaction: 'on',
      delay: 0
    });
    helpers.target.appendChild(tooltip);

    expect(tooltip.open).to.equal(false, 'tooltip closed initially');

    $(target).trigger('focusin');
    expect(tooltip.open).to.equal(true, 'tooltip open after focusing on target');

    $(target).trigger('mouseenter');
    expect(tooltip.open).to.equal(true, 'tooltip open after mouseenter on target');

    tooltip.open = false;
    tooltip.interaction = 'off';

    $(target).trigger('focusin');
    expect(tooltip.open).to.equal(false, 'tooltip still closed after focusing on target');

    $(target).trigger('mouseenter');
    expect(tooltip.open).to.equal(false, 'tooltip still closed after mouseenter on target');
  });

  it('should support multiple tooltips on the same target', function() {
    var target = helpers.createFloatingTarget();

    var tooltipTop = new Coral.Tooltip().set({
      content: {
        textContent: 'A tooltip'
      },
      target: target,
      placement: 'top',
      delay: 0
    });
    helpers.target.appendChild(tooltipTop);

    var tooltipBottom = new Coral.Tooltip().set({
      content: {
        textContent: 'Another tooltip'
      },
      target: target,
      placement: 'bottom',
      delay: 0
    });
    helpers.target.appendChild(tooltipBottom);

    expect(tooltipTop.open).to.equal(false, 'tooltipTop closed initially');
    expect(tooltipBottom.open).to.equal(false, 'tooltipBottom closed initially');

    $(target).trigger('focusin');
    expect(tooltipTop.open).to.equal(true, 'tooltipTop open after focusing on target');
    expect(tooltipBottom.open).to.equal(true, 'tooltipBottom open after focusing on target');
  });

  it('should not set the tabindex attribute on a target element which already has a tabindex attribute', function() {
    var target = helpers.createFloatingTarget();
    target.setAttribute('tabindex', 1);

    var tooltip = new Coral.Tooltip().set({
      target: target,
      variant: 'success'
    });
    helpers.target.appendChild(tooltip);

    expect(target.getAttribute('tabindex')).to.equal('1');
  });
});
