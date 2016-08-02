describe('Coral.Popover', function() {
  'use strict';

  var el;
  var targetElement;
  var targetChild;

  // Setup tests
  beforeEach(function(done) {
    // Create a new popover
    el = new Coral.Popover();
    helpers.target.appendChild(el);

    // Create a target elsewhere
    targetElement = helpers.overlay.createFloatingTarget();
    targetElement.setAttribute('id', 'popover-targetElement');

    targetChild = document.createElement('span');
    targetChild.textContent = 'I am only a child';
    targetElement.appendChild(targetChild);

    // Wait a frame so global listeners are added by attachedCallback
    helpers.next(function() {
      done();
    });
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Popover');
    });

    it('should define the closable in an enum', function() {
      expect(Coral.Popover.closable).to.exist;
      expect(Coral.Popover.closable.ON).to.equal('on');
      expect(Coral.Popover.closable.OFF).to.equal('off');
      expect(Object.keys(Coral.Popover.closable).length).to.equal(2);
    });

    it('should define the interation in an enum', function() {
      expect(Coral.Popover.interaction).to.exist;
      expect(Coral.Popover.interaction.ON).to.equal('on');
      expect(Coral.Popover.interaction.OFF).to.equal('off');
      expect(Object.keys(Coral.Popover.interaction).length).to.equal(2);
    });

    it('should define the variants in an enum', function() {
      expect(Coral.Popover.variant).to.exist;
      expect(Coral.Popover.variant.DEFAULT).to.equal('default');
      expect(Coral.Popover.variant.ERROR).to.equal('error');
      expect(Coral.Popover.variant.WARNING).to.equal('warning');
      expect(Coral.Popover.variant.SUCCESS).to.equal('success');
      expect(Coral.Popover.variant.HELP).to.equal('help');
      expect(Coral.Popover.variant.INFO).to.equal('info');
      expect(Object.keys(Coral.Popover.variant).length).to.equal(6);
    });
  });

  describe('API', function() {
    it('should have correct default property values', function() {
      expect(el.closable).to.equal(Coral.Popover.closable.OFF);
      expect(el.within).to.equal(window);
    });


    it('should hide header when content set to empty', function(done) {
      el.header.innerHTML = 'Test';
      el.show();

      helpers.next(function() {
        expect(el._elements.headerWrapper.hidden).to.equal(false);

        el.header.innerHTML = '';
        helpers.next(function() {
          expect(el._elements.headerWrapper.hidden).to.equal(true);
          done();
        });
      });
    });

    it('should hide header when content set to empty when not in DOM', function(done) {
      el.header.innerHTML = 'Test';
      el.show();

      helpers.next(function() {
        expect(el._elements.headerWrapper.hidden).to.equal(false);

        helpers.target.removeChild(el);
        el.header.innerHTML = '';

        /*
          Note: this must be async, otherwise IE 9 will not get a mutation at all

          // This does not work in IE 9
          window.el = el
          el.parentNode.removeChild(el)
          el.header.innerHTML = '';
          document.body.appendChild(el)
        */
        helpers.next(function() {
          helpers.target.appendChild(el);

          helpers.next(function() {
            expect(el._elements.headerWrapper.hidden).to.equal(true);
            done();
          });
        });
      });
    });
  });

  describe('Markup', function() {
    it('should position the rendered header above content', function(done) {
      helpers.build(window.__html__['Coral.Popover.contentOnly.html'], function(el) {
        expect(el.querySelector('coral-popover-header')).to.not.equal(null);
        expect($(el._elements.headerWrapper).index()).to.be.lt($(el._elements.contentWrapper).index());
        done();
      });
    });

    it('should support creating a popover from markup without providing coral-popover-content', function(done) {
      helpers.build(window.__html__['Coral.Popover.noContent.html'], function(el) {
        var content = el.querySelector('coral-popover-content');
        expect(content).to.not.equal(null);
        expect(el.querySelector('coral-popover-header')).to.not.equal(null);
        expect(el.content.innerHTML).to.not.equal('');
        done();
      });
    });
  });

  describe('Events', function() {
    it('should not trigger a "close" event when the element is injected into the dom', function(done) {
      var openSpy = sinon.spy();
      var closeSpy = sinon.spy();

      // checks if the events bubble
      helpers.target.addEventListener('coral-overlay:open', openSpy);
      helpers.target.addEventListener('coral-overlay:close', closeSpy);

      helpers.build(window.__html__['Coral.Popover.base.html'], function(el) {
        // makes sure no events are triggered on creation
        expect(openSpy.called).to.be.false;
        expect(closeSpy.called).to.be.false;

        // cleans the events
        helpers.target.removeEventListener('coral-overlay:open', openSpy);
        helpers.target.removeEventListener('coral-overlay:close', closeSpy);

        done();
      });
    });
  });

  describe('User Interaction', function() {
    it('should close when a clicking outside of the popover', function(done) {
      el.show();

      helpers.next(function() {
        document.body.click();
        expect(el.open).to.equal(false);
        done();
      });
    });

    it('should close when target is clicked again', function(done) {
      el.target = targetElement;

      el.show();

      helpers.next(function() {
        targetElement.click();
        expect(el.open).to.equal(false);
        done();
      });
    });

    it('should close when a child element of target is clicked', function(done) {
      el.target = targetElement;

      el.show();

      helpers.next(function() {
        targetChild.click();
        expect(el.open).to.equal(false);
        done();
      });
    });

    it('should open when target is clicked', function() {
      var target = helpers.overlay.createStaticTarget();

      el.set({
        content: 'A popover',
        target: target,
        placement: 'left'
      });

      expect(el.open).to.equal(false, 'popover closed initially');

      // Show via click
      target.click();

      expect(el.open).to.equal(true, 'popover open after clicking target');
    });

    it('should open when enabled target button is clicked', function(done) {
      helpers.build(window.__html__['Coral.Popover.button.html'], function(div) {
        var button = div.querySelector('button');

        var popover = div.querySelector('coral-popover');

        expect(popover.open).to.equal(false, 'popover closed initially');

        button.click();

        expect(popover.open).to.equal(true, 'popover should be open');
        done();
      });
    });

    it('should not open when disabled target button is clicked', function(done) {
      helpers.build(window.__html__['Coral.Popover.button.html'], function(div) {

        var button = div.querySelector('button');
        button.disabled = true;

        var popover = div.querySelector('coral-popover');

        expect(popover.open).to.equal(false, 'popover closed initially');

        button.click();

        expect(popover.open).to.equal(false, 'popover should still be closed');
        done();
      });
    });

    it('should not open when child element of disabled target button is clicked', function(done) {
      helpers.build(window.__html__['Coral.Popover.button.html'], function(div) {
        var button = div.querySelector('button');
        button.disabled = true;

        var icon = button.querySelector('coral-icon');
        var popover = div.querySelector('coral-popover');

        expect(popover.open).to.equal(false, 'popover closed initially');

        icon.click();

        expect(popover.open).to.equal(false, 'popover should still be closed');

        done();
      });
    });

    it('should close when target is clicked and already open', function() {
      var target = helpers.overlay.createStaticTarget();

      el.set({
        content: 'A popover',
        target: target,
        placement: 'left'
      });

      expect(el.open).to.equal(false, 'popover closed initially');

      // Show via click
      target.click();

      expect(el.open).to.equal(true, 'popover open after clicking target');

      // hide via click
      target.click();

      expect(el.open).to.equal(false, 'popover closed after clicking target');
    });

    it('should not open when target changed and previous target is clicked', function(done) {
      var target = helpers.overlay.createStaticTarget();

      el.set({
        content: 'A popover',
        placement: 'left'
      });

      // Point at the old target
      el.target = target;

      expect(el.open).to.equal(false, 'popover closed initially');

      expect(el._getTarget()).to.equal(target, 'target should be set correctly');

      // Show via click
      target.click();

      helpers.next(function() {
        expect(el.open).to.equal(true, 'popover open after clicking old target');

        el.hide();
        helpers.next(function() {
          expect(el.open).to.equal(false, 'popover closed after calling hide()');

          // Set new target
          var newTarget = helpers.overlay.createStaticTarget();
          el.target = newTarget;

          expect(el._getTarget()).to.equal(newTarget, 'target should be set correctly');

          // Try to show via click on the old target
          target.click();

          helpers.next(function() {
            expect(el.open).to.equal(false, 'popover stays closed after clicking old target after traget changed');

            // Show by clicking on the new target
            newTarget.click();

            helpers.next(function() {
              expect(el.open).to.equal(true, 'popover open after clicking new target');
              done();
            });
          });
        });
      });
    });

    it('should not open on target click when interaction="off"', function() {
      var target = helpers.overlay.createStaticTarget();

      el.set({
        content: 'A popover',
        target: target,
        interaction: 'off',
        placement: 'left'
      });

      expect(el.open).to.equal(false, 'popover closed initially');

      // Show via click
      target.click();

      expect(el.open).to.equal(false, 'popover still closed after clicking target');
    });
  });

  describe('Implementation details', function() {
    it('should set .is-selected on target when opened/closed', function(done) {
      var target = helpers.overlay.createStaticTarget();
      var $target = $(target);

      el.set({
        content: 'A popover',
        target: target
      });

      el.open = true;

      helpers.next(function() {
        expect($target).to.have.class('is-selected');

        el.open = false;

        helpers.next(function() {
          expect($target).to.not.have.class('is-selected');
          done();
        });
      });
    });

    it('should not blow away .is-selected on target if it already has it', function(done) {
      var target = helpers.overlay.createStaticTarget();

      var $target = $(target);
      $target.addClass('is-selected');

      el.set({
        content: 'A popover',
        target: target
      });

      el.open = true;

      helpers.next(function() {
        expect($target).to.have.class('is-selected');

        el.open = false;

        helpers.next(function() {
          expect($target).to.have.class('is-selected');
          done();
        });
      });
    });

    it('should not close for clicks on elements that are subsequently removed', function(done) {
      var target = helpers.overlay.createStaticTarget();
      var clickTarget = document.createElement('div');

      clickTarget.addEventListener('click', function() {
        if (clickTarget.parentNode) {
          clickTarget.parentNode.removeChild(clickTarget);
        }
      });

      el.set({
        content: 'A popover',
        target: target
      });

      el.appendChild(clickTarget);
      el.open = true;

      helpers.next(function() {
        clickTarget.click();

        helpers.next(function() {
          expect(el.open).to.equal(true);
          done();
        });
      });
    });
  });
});
