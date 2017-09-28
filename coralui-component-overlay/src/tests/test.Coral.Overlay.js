describe('Coral.Overlay', function() {
  'use strict';
  
  function findPopperModifier(name) {
    return overlay._popper.modifiers.filter(modifier => modifier.name === name)[0];
  }
  
  var overlay, targetOther, targetNext, targetPrev;

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
    it('should be defined', function() {
      expect(Coral).to.have.property('Overlay');
      expect(Coral.Overlay).to.have.property('align');
      expect(Coral.Overlay).to.have.property('collision');
      expect(Coral.Overlay).to.have.property('target');
      expect(Coral.Overlay).to.have.property('placement');
      expect(Coral.Overlay).to.have.property('interaction');
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
  
  describe('Implementation Details', function() {
    
    describe('#[coral-close]', function() {
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
  });
});
