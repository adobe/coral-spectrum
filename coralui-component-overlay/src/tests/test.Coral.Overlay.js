describe('Coral.Overlay', function() {
  let overlay;
  let targetOther;
  let targetNext;
  let targetPrev;
  
  const findPopperModifier = (name) => {
    return overlay._popper.modifiers.filter(modifier => modifier.name === name)[0];
  };
  
  // Setup tests
  beforeEach(function() {
    // Create a target after the the overlay
    targetPrev = helpers.overlay.createStaticTarget();
    
    // Create a new overlay
    overlay = helpers.build(new Coral.Overlay());
    overlay.target = targetPrev;
    
    // Create a target before the overlay
    targetNext = helpers.overlay.createStaticTarget();
    
    // Create a target elsewhere
    targetOther = helpers.overlay.createFloatingTarget();
    targetOther.setAttribute('id', 'overlay-targetOther');
  });
  
  afterEach(function() {
    overlay = targetOther = targetNext = targetPrev = null;
  });
  
  describe('Namespace', function() {
    it('should be defined in the Coral namespace', function() {
      expect(Coral).to.have.property('Overlay');
    });
  
    it('should define the align in an enum', function() {
      expect(Coral.Overlay.align).to.exist;
      expect(Coral.Overlay.align.LEFT_TOP).to.equal('left top');
      expect(Coral.Overlay.align.LEFT_CENTER).to.equal('left center');
      expect(Coral.Overlay.align.LEFT_BOTTOM).to.equal('left bottom');
      expect(Coral.Overlay.align.CENTER_TOP).to.equal('center top');
      expect(Coral.Overlay.align.CENTER_CENTER).to.equal('center center');
      expect(Coral.Overlay.align.CENTER_BOTTOM).to.equal('center bottom');
      expect(Coral.Overlay.align.RIGHT_TOP).to.equal('right top');
      expect(Coral.Overlay.align.RIGHT_CENTER).to.equal('right center');
      expect(Coral.Overlay.align.RIGHT_BOTTOM).to.equal('right bottom');
      expect(Object.keys(Coral.Overlay.align).length).to.equal(9);
    });
  
    it('should define the collision in an enum', function() {
      expect(Coral.Overlay.collision).to.exist;
      expect(Coral.Overlay.collision.FLIP).to.equal('flip');
      expect(Coral.Overlay.collision.FIT).to.equal('fit');
      expect(Coral.Overlay.collision.FLIP_FIT).to.equal('flipfit');
      expect(Coral.Overlay.collision.NONE).to.equal('none');
      expect(Object.keys(Coral.Overlay.collision).length).to.equal(4);
    });
  
    it('should define the target in an enum', function() {
      expect(Coral.Overlay.target).to.exist;
      expect(Coral.Overlay.target.PREVIOUS).to.equal('_prev');
      expect(Coral.Overlay.target.NEXT).to.equal('_next');
      expect(Object.keys(Coral.Overlay.target).length).to.equal(2);
    });
  
    it('should define the placement in an enum', function() {
      expect(Coral.Overlay.placement).to.exist;
      expect(Coral.Overlay.placement.LEFT).to.equal('left');
      expect(Coral.Overlay.placement.RIGHT).to.equal('right');
      expect(Coral.Overlay.placement.BOTTOM).to.equal('bottom');
      expect(Coral.Overlay.placement.TOP).to.equal('top');
      expect(Object.keys(Coral.Overlay.placement).length).to.equal(4);
    });
  
    it('should define the interaction in an enum', function() {
      expect(Coral.Overlay.interaction).to.exist;
      expect(Coral.Overlay.interaction.ON).to.equal('on');
      expect(Coral.Overlay.interaction.OFF).to.equal('off');
      expect(Object.keys(Coral.Overlay.interaction).length).to.equal(2);
    });
  });
  
  describe('Instantiation', function() {
    it('should be possible to clone the element using markup', function() {
      helpers.cloneComponent('<coral-overlay></coral-overlay>');
    });
    
    it('should be possible to clone using js', function() {
      helpers.cloneComponent(new Coral.Overlay());
    });
  });
  
  describe('API', function() {
    describe('#focusOnShow', function() {
      it('should default to ON', function() {
        expect(overlay.focusOnShow).to.equal(Coral.mixin.overlay.focusOnShow.ON);
      });
    });
    
    describe('#alignMy', function() {
      it('should be deprecated', function() {
        let warnCalled = 0;
        const warn = console.warn;
        // Override console.warn to detect if it was called
        console.warn = function() {
          warnCalled++;
        };
    
        overlay.alignMy = Coral.Overlay.align.LEFT_TOP;
        expect(overlay.alignMy).to.equal(Coral.Overlay.align.LEFT_TOP);
  
        expect(warnCalled).to.equal(2);
  
        // Restore console.warn
        console.warn = warn;
      });
    });
    
    describe('#alignAt', function() {
      it('should be deprecated', function() {
        let warnCalled = 0;
        const warn = console.warn;
        // Override console.warn to detect if it was called
        console.warn = function() {
          warnCalled++;
        };
  
        overlay.alignAt = Coral.Overlay.align.LEFT_TOP;
        expect(overlay.alignAt).to.equal(Coral.Overlay.align.LEFT_TOP);
  
        expect(warnCalled).to.equal(2);
  
        // Restore console.warn
        console.warn = warn;
      });
    });
    
    describe('#placement', function() {
      it('should default to Coral.Overlay.placement.RIGHT', function() {
        expect(overlay._popper.options.placement).to.equal(Coral.Overlay.placement.RIGHT);
        expect(overlay.placement).to.equal(Coral.Overlay.placement.RIGHT);
      });
      
      it('should be settable and reflected in popper', function() {
        overlay.placement = 'top';
        expect(overlay._popper.options.placement).to.equal(Coral.Overlay.placement.TOP);
        expect(overlay.placement).to.equal(Coral.Overlay.placement.TOP);
      });
    });
    
    describe('#target', function() {
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
      
      it('should be reflected in popper', function() {
        overlay.target = targetOther;
        expect(overlay._popper.reference).to.equal(targetOther);
      });
    });
    
    describe('#collision', function() {
      it('should default to Coral.Overlay.collision.FLIP', function() {
        expect(overlay.collision).to.equal(Coral.Overlay.collision.FLIP);
        expect(findPopperModifier('preventOverflow').enabled).to.equal(true);
        expect(findPopperModifier('flip').enabled).to.equal(true);
      });
  
      it('should be settable and reflected in popper', function() {
        overlay.collision = 'fit';
        expect(overlay.collision).to.equal(Coral.Overlay.collision.FIT);
        expect(findPopperModifier('preventOverflow').enabled).to.equal(true);
        expect(findPopperModifier('flip').enabled).to.equal(false);
  
        overlay.collision = 'none';
        expect(overlay.collision).to.equal(Coral.Overlay.collision.NONE);
        expect(findPopperModifier('preventOverflow').enabled).to.equal(false);
        expect(findPopperModifier('flip').enabled).to.equal(false);
      });
    });
    
    describe('#within', function() {
      it('should default to "scrollParent"', function() {
        expect(overlay.within).to.equal('scrollParent');
        expect(findPopperModifier('preventOverflow').boundariesElement).to.equal('scrollParent');
      });
  
      it('should be settable and reflected in popper', function() {
        overlay.within = document.body;
        expect(overlay.within).to.equal(document.body);
        expect(findPopperModifier('preventOverflow').boundariesElement).to.equal(document.body);
      });
    });
  
    describe('#inner', function() {
      it('should default to false', function() {
        expect(overlay.inner).to.equal(false);
        expect(findPopperModifier('inner').enabled).to.be.false;
      });
    
      it('should be settable and reflected in popper', function() {
        overlay.inner = true;
        expect(overlay.inner).to.be.true;
        expect(findPopperModifier('inner').enabled).to.be.true;
      });
    });
    
    describe('#offset', function() {
      it('should default to 0', function() {
        expect(overlay.offset).to.equal(0);
        expect(findPopperModifier('offset').offset).to.equal('0px, 0px');
      });
  
      it('should correspond to length offset', function() {
        overlay.offset = 10;
        expect(overlay.offset).to.equal(10);
        expect(overlay.lengthOffset).to.equal('10px');
        expect(findPopperModifier('offset').offset).to.equal('0px, 10px');
      });
      
      it('should set length and breadth offset', function() {
        overlay.lengthOffset = '5px';
        overlay.breadthOffset = '15px';
        overlay.offset = 10;
        expect(overlay.offset).to.equal(10);
        expect(findPopperModifier('offset').offset).to.equal('0px, 10px');
      });
    });
  
    describe('#lengthOffset', function() {
      it('should default to 0px', function() {
        expect(overlay.lengthOffset).to.equal('0px');
        expect(findPopperModifier('offset').offset).to.equal('0px, 0px');
      });
  
      it('should be settable and reflected in popper', function() {
        overlay.lengthOffset = '5px';
        expect(findPopperModifier('offset').offset).to.equal('0px, 5px');
        overlay.breadthOffset = '15px';
        expect(findPopperModifier('offset').offset).to.equal('15px, 5px');
      });
    });
  
    describe('#breadthOffset', function() {
      it('should default to 0px', function() {
        expect(overlay.breadthOffset).to.equal('0px');
        expect(findPopperModifier('offset').offset).to.equal('0px, 0px');
      });
  
      it('should be settable and reflected in popper', function() {
        overlay.breadthOffset = '5px';
        expect(findPopperModifier('offset').offset).to.equal('5px, 0px');
        overlay.lengthOffset = '15px';
        expect(findPopperModifier('offset').offset).to.equal('5px, 15px');
      });
    });
    
    describe('#interaction', function() {
      it('should default to Coral.Overlay.interaction.ON', function() {
        expect(overlay.interaction).to.equal(Coral.Overlay.interaction.ON);
      });
  
      it('should be settable', function() {
        overlay.interaction = 'off';
        expect(overlay.interaction).to.equal(Coral.Overlay.interaction.OFF);
      });
    });
  });
  
  describe('Markup', function() {
    afterEach(function() {
      // we hide any existing overlay if available
      var overlay = helpers.target.querySelector('coral-overlay');
      if (overlay) {
        overlay.open = false;
      }
    });
    
    describe('#focusOnShow', function() {
      it('should try to focus the overlay', function(done) {
        const el = helpers.build(window.__html__['Coral.Overlay.base.html']);
        
        var spy = sinon.spy(el, 'focus');
        
        el.on('coral-overlay:open', function() {
          expect(spy.callCount).to.equal(1);
          expect(document.activeElement).to.equal(document.body, 'Focus remains in the body, as the component is not focusable');
          
          done();
        });
        
        el.show();
      });
      
      it('should focus the overlay when no element is focusable (trapfocus=on)', function(done) {
        const el = helpers.build(window.__html__['Coral.Overlay.trapFocus.on.html']);
        
        el.on('coral-overlay:open', function() {
          expect(document.activeElement).to.equal(el, 'Overlay itself should be focused');
          
          done();
        });
        
        el.show();
      });
      
      it('should focus the focussable descendent', function() {
        const el = helpers.build(window.__html__['Coral.Overlay.coral-close.html']);
        el.show();
        
        expect(el.open).to.equal(true, 'open before close clicked');
        el.querySelector('#closeButton').click();
        expect(el.open).to.equal(false, 'open after close clicked');
      });
    });
    
    // @todo maybe this test should be part of a mixin
    describe('#[coral-close]', function() {
      it('should hide when any element with [coral-close] clicked', function() {
        const el = helpers.build(window.__html__['Coral.Overlay.coral-close.html']);
        el.show();
        
        expect(el.open).to.equal(true, 'open before close clicked');
        el.querySelector('#closeButton').click();
        expect(el.open).to.equal(false, 'open after close clicked');
      });
      
      it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
        const el = helpers.build(window.__html__['Coral.Overlay.coral-close.id.html']);
        el.show();
        
        var spy = sinon.spy();
        helpers.target.addEventListener('click', spy);
        
        expect(el.open).to.equal(true, 'open before close clicked');
        
        // Click the button that should do nothing
        el.querySelector('#closeOtherOverlay').click();
        expect(el.open).to.equal(true, 'open after close clicked');
        expect(spy.callCount).to.equal(1, 'click event bubble count');
        
        spy.reset();
        
        // Click the button that should close the overlay
        el.querySelector('#closeMyOverlay').click();
        expect(el.open).to.equal(false, 'open after close clicked');
        expect(spy.callCount).to.equal(0, 'click event bubble count');
      });
    });
  });
  
  describe('Events', function() {
    describe('#coral-overlay:positioned', function() {
      it('should trigger when the overlay is opened', function(done) {
        overlay.open = true;
        overlay.on('coral-overlay:positioned', () => {
          done();
        });
      });
    });
  });
});
