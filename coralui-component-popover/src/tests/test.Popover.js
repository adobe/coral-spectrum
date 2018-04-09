import {helpers} from '../../../coralui-util/src/tests/helpers';
import {Popover} from '../../../coralui-component-popover';

describe('Popover', function() {
  var el;
  var targetElement;
  var targetChild;

  // Setup tests
  beforeEach(function() {
    // Create a new popover
    el = helpers.build(new Popover());

    // Create a target elsewhere
    targetElement = helpers.overlay.createFloatingTarget();
    targetElement.setAttribute('id', 'popover-targetElement');

    targetChild = document.createElement('span');
    targetChild.textContent = 'I am only a child';
    targetElement.appendChild(targetChild);
  });

  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Popover).to.have.property('Content');
      expect(Popover).to.have.property('Separator');
    });

    it('should define the closable in an enum', function() {
      expect(Popover.closable).to.exist;
      expect(Popover.closable.ON).to.equal('on');
      expect(Popover.closable.OFF).to.equal('off');
      expect(Object.keys(Popover.closable).length).to.equal(2);
    });

    it('should define the interation in an enum', function() {
      expect(Popover.interaction).to.exist;
      expect(Popover.interaction.ON).to.equal('on');
      expect(Popover.interaction.OFF).to.equal('off');
      expect(Object.keys(Popover.interaction).length).to.equal(2);
    });

    it('should define the variants in an enum', function() {
      expect(Popover.variant).to.exist;
      expect(Popover.variant.DEFAULT).to.equal('default');
      expect(Popover.variant.ERROR).to.equal('error');
      expect(Popover.variant.WARNING).to.equal('warning');
      expect(Popover.variant.SUCCESS).to.equal('success');
      expect(Popover.variant.HELP).to.equal('help');
      expect(Popover.variant.INFO).to.equal('info');
      expect(Popover.variant.FLYOUT).to.equal('flyout');
      expect(Object.keys(Popover.variant).length).to.equal(7);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible via cloneNode using markup', function() {
      helpers.cloneComponent(helpers.build(window.__html__['Popover.headerAndContent.html']));
    });
    
    it('should be possible via cloneNode using js', function() {
      helpers.cloneComponent(new Popover());
    });
  });

  describe('API', function() {
    
    describe('#closable', function() {
      it('should have correct default value', function() {
        expect(el.closable).to.equal(Popover.closable.OFF);
      });
    });
    
    describe('#variant', function() {
      it('should have correct default value', function() {
        expect(el.variant).to.equal(Popover.variant.DEFAULT);
      });
    });
    
    describe('#header', function() {
      it('should hide header when content set to empty', function(done) {
        el.header.innerHTML = 'Test';
        el.show();
  
        // Wait for MO
        helpers.next(function() {
          expect(el._elements.headerWrapper.hidden).to.equal(false);
    
          el.header.innerHTML = '';
  
          // Wait for MO
          helpers.next(function() {
            expect(el._elements.headerWrapper.hidden).to.equal(true);
            done();
          });
        });
      });
    });
  
    describe('#footer', function() {
      it('should hide footer when content set to empty', function(done) {
        el.footer.innerHTML = 'Test';
        el.show();
      
        // Wait for MO
        helpers.next(function() {
          expect(el.footer.hidden).to.equal(false);
        
          el.footer.innerHTML = '';
        
          // Wait for MO
          helpers.next(function() {
            expect(el.footer.hidden).to.equal(true);
            done();
          });
        });
      });
    });
  });

  describe('Markup', function() {
    
    describe('#header', function() {
      it('should position the rendered header above content', function() {
        el = helpers.build(window.__html__['Popover.contentOnly.html']);
        expect(el.querySelector('coral-popover-header')).to.not.equal(null);
        
        var header = el._elements.headerWrapper;
        var content = el.content;
        var headerIndex = Array.prototype.indexOf.call(el.children, header);
        var contentIndex = Array.prototype.indexOf.call(el.children, content);
        
        expect(headerIndex).to.be.lt(contentIndex);
      });
    });
  
    describe('#footer', function() {
      it('should position the rendered footer below content', function() {
        el = helpers.build(window.__html__['Popover.contentOnly.html']);
        expect(el.querySelector('coral-popover-footer')).to.not.equal(null);
  
        var content = el.content;
        var footer = el.footer;
        var contentIndex = Array.prototype.indexOf.call(el.children, content);
        var footerIndex = Array.prototype.indexOf.call(el.children, footer);
      
        expect(contentIndex).to.be.lt(footerIndex);
      });
    });
    
    describe('#content', function() {
      it('should support creating a popover from markup without providing coral-popover-content', function() {
        el = helpers.build(window.__html__['Popover.noContent.html']);
        var content = el.querySelector('coral-popover-content');
        
        expect(content).to.not.equal(null);
        expect(el.querySelector('coral-popover-header')).to.not.equal(null);
        expect(el.content.innerHTML).to.not.equal('');
      });
    });
  });

  describe('Events', function() {
    it('should not trigger a "close" event when the element is injected into the dom', function() {
      var openSpy = sinon.spy();
      var closeSpy = sinon.spy();

      // checks if the events bubble
      helpers.target.addEventListener('coral-overlay:open', openSpy);
      helpers.target.addEventListener('coral-overlay:close', closeSpy);

      el = helpers.build(window.__html__['Popover.base.html']);
      // makes sure no events are triggered on creation
      expect(openSpy.called).to.be.false;
      expect(closeSpy.called).to.be.false;

      // cleans the events
      helpers.target.removeEventListener('coral-overlay:open', openSpy);
      helpers.target.removeEventListener('coral-overlay:close', closeSpy);
    });
  });

  describe('User Interaction', function() {
    it('should close when a clicking outside of the popover', function() {
      el.show();
      
      document.body.click();
      expect(el.open).to.equal(false);
    });

    it('should close when target is clicked again', function() {
      el.target = targetElement;
      el.show();
      
      targetElement.click();
      expect(el.open).to.equal(false);
    });

    it('should close when a child element of target is clicked', function() {
      el.target = targetElement;
      el.show();
      
      targetChild.click();
      expect(el.open).to.equal(false);
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

    it('should open when enabled target button is clicked', function() {
      const div = helpers.build(window.__html__['Popover.button.html']);
      var button = div.querySelector('button');
      var popover = div.querySelector('coral-popover');

      expect(popover.open).to.equal(false, 'popover closed initially');

      button.click();

      expect(popover.open).to.equal(true, 'popover should be open');
    });

    it('should not open when disabled target button is clicked', function() {
      const div = helpers.build(window.__html__['Popover.button.html']);

      var button = div.querySelector('button');
      button.disabled = true;

      var popover = div.querySelector('coral-popover');

      expect(popover.open).to.equal(false, 'popover closed initially');

      button.click();

      expect(popover.open).to.equal(false, 'popover should still be closed');
    });

    it('should not open when child element of disabled target button is clicked', function() {
      const div = helpers.build(window.__html__['Popover.button.html']);
      var button = div.querySelector('button');
      button.disabled = true;

      var icon = button.querySelector('coral-icon');
      var popover = div.querySelector('coral-popover');

      expect(popover.open).to.equal(false, 'popover closed initially');

      icon.click();

      expect(popover.open).to.equal(false, 'popover should still be closed');
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

    it('should not open when target changed and previous target is clicked', function() {
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
  
      expect(el.open).to.equal(true, 'popover open after clicking old target');
  
      el.hide();
  
      expect(el.open).to.equal(false, 'popover closed after calling hide()');
  
      // Set new target
      var newTarget = helpers.overlay.createStaticTarget();
      el.target = newTarget;
  
      expect(el._getTarget()).to.equal(newTarget, 'target should be set correctly');
  
      // Try to show via click on the old target
      target.click();
  
      expect(el.open).to.equal(false, 'popover stays closed after clicking old target after traget changed');
  
      // Show by clicking on the new target
      newTarget.click();
  
      expect(el.open).to.equal(true, 'popover open after clicking new target');
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
    it('should set .is-selected on target when opened/closed', function() {
      var target = helpers.overlay.createStaticTarget();

      el.set({
        content: 'A popover',
        target: target
      });

      el.open = true;
      
      expect(target.classList.contains('is-selected')).to.be.true;

      el.open = false;
      
      expect(target.classList.contains('is-selected')).to.be.false;
    });

    it('should not blow away .is-selected on target if it already has it', function() {
      var target = helpers.overlay.createStaticTarget();
  
      target.classList.add('is-selected');
  
      el.set({
        content: 'A popover',
        target: target
      });
  
      el.open = true;
  
      expect(target.classList.contains('is-selected')).to.be.true;
  
      el.open = false;
  
      expect(target.classList.contains('is-selected')).to.be.true;
    });

    it('should not close for clicks on elements that are subsequently removed', function() {
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
  
      clickTarget.click();
  
      expect(el.open).to.equal(true);
    });
  
    it('should focus the focusOnShow element when opened', function(done) {
      el = helpers.build(window.__html__['Popover.focusOnShow.html']);
      
      el.on('coral-overlay:open', function() {
        expect(document.activeElement).to.equal(el.querySelector(el.focusOnShow));
        done();
      });
      
      el.show();
    });
  });
});
