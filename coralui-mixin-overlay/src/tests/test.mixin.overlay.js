import {helpers} from '/coralui-util/src/tests/helpers';
import {ComponentMixin} from '/coralui-mixin-component';
import {OverlayMixin} from '/coralui-mixin-overlay';
import {commons, mixin} from '/coralui-util';

/**
 Get the zIndex of an element
 
 @param {HTMLElement} element  The element to get the Zindex of
 
 @returns {Number} The element's zIndex
 */
const zIndex = (element) => {
  const elZIndex = element.style.zIndex;
  if (elZIndex === '') {
    return -1;
  }
  else {
    return parseFloat(elZIndex);
  }
};

describe('mixin._overlay', function() {
  var transitionEnd;
  
  // Non Modal overlay
  class OverlayDummy1 extends OverlayMixin(ComponentMixin(HTMLElement)) {
    constructor() {
      super();
      
      this._trapFocus = 'on';
      this._returnFocus = 'on';
      this._focusOnShow = 'on';
      
      this._elements.content = this.querySelector('coral-overlay-dummy-content') || document.createElement('coral-overlay-dummy-content');
    }
    
    get content() {
      return this._getContentZone(this._elements.content);
    }
    set content(value) {
      this._setContentZone('content', value, {
        handle: 'content',
        tagName: 'coral-overlay-dummy-content',
        insert : function(content) {
          this.appendChild(content);
        }
      });
    }
    
    connectedCallback() {
      super.connectedCallback();
      
      this.content = this._elements.content;
    }
  }
  
  class OverlayDummy2 extends OverlayDummy1 {
    constructor() {
      super();
    }
    
    get open() {
      return super.open;
    }
    set open(value) {
      super.open = value;
      
      if (this.open) {
        // Show the backdrop when we're shown
        // This makes the overlay "modal"
        this._showBackdrop();
      }
    }
  }
  
  window.customElements.define('coral-overlay-dummy1', OverlayDummy1);
  window.customElements.define('coral-overlay-dummy2', OverlayDummy2);
  
  before(function() {
    transitionEnd = commons.transitionEnd;

    // mock transitionEnd for the tests (simulate transition ended after 100 ms)
    commons.transitionEnd = function(el, cb) {
      window.setTimeout(function() {
        cb();
      }, 100);
    }
  });
  
  after(function() {
    // reset to original transitionEnd impl.
    commons.transitionEnd = transitionEnd;
  });

  // Close and remove the instance
  function cleanUpInstance(instance) {
    if (!instance) {
      return;
    }

    instance.remove();
  }
  
  /**
   Test if the provided backdrop element is hidden or hiding
   */
  function backdropOpen(element) {
    return element.style.display !== 'none' && element._isOpen;
  }

  // Hold the instances
  var overlay;
  var overlay1;
  var overlay2;
  var overlay3;
  
  beforeEach(function() {
    overlay = helpers.build(new OverlayDummy2());
  });
  
  // Clean up
  afterEach(function() {
    cleanUpInstance(overlay);
    cleanUpInstance(overlay1);
    cleanUpInstance(overlay2);
    cleanUpInstance(overlay3);
  });
  
  describe('Namespace', function() {
    it('should define the trapFocus in an enum', function() {
      expect(mixin._overlay.trapFocus).to.exist;
      expect(mixin._overlay.trapFocus.ON).to.equal('on');
      expect(mixin._overlay.trapFocus.OFF).to.equal('off');
      expect(Object.keys(mixin._overlay.trapFocus).length).to.equal(2);
    });
  
    it('should define the returnFocus in an enum', function() {
      expect(mixin._overlay.returnFocus).to.exist;
      expect(mixin._overlay.returnFocus.ON).to.equal('on');
      expect(mixin._overlay.returnFocus.OFF).to.equal('off');
      expect(Object.keys(mixin._overlay.returnFocus).length).to.equal(2);
    });
  
    it('should define the focusOnShow in an enum', function() {
      expect(mixin._overlay.focusOnShow).to.exist;
      expect(mixin._overlay.focusOnShow.ON).to.equal('on');
      expect(mixin._overlay.focusOnShow.OFF).to.equal('off');
      expect(Object.keys(mixin._overlay.focusOnShow).length).to.equal(2);
    });
  });
  
  describe('API', function() {
    describe('#_isTopMost()', function() {
      it('should know if it is top most', function(done) {
        overlay1 = new OverlayDummy2();
        helpers.target.appendChild(overlay1);
        overlay1.open = true;
    
        overlay2 = new OverlayDummy2();
        helpers.target.appendChild(overlay2);
        overlay2.open = true;
    
        helpers.next(function() {
          expect(overlay1._isTopOverlay()).to.be.false;
          expect(overlay2._isTopOverlay()).to.be.true;
      
          // Clean up
          overlay1.open = false;
          overlay2.open = false;
          
          done();
        });
      });
    });
  
    describe('#open/show()/hide()', function() {
      it('should default to false', function() {
        expect(overlay.open).to.equal(false, 'Overlays initialize closed by default');
      });
  
      it('should be set to display:none after closing the overlay silently', function(done) {
        overlay.content.textContent = 'Overlay 1';
    
        overlay.on('coral-overlay:open', function() {
          // close silently
          overlay.set('open', false, true);
          expect(overlay.open).to.equal(false, 'overlay should be closed now');
      
          // we use transitionEnd instead of coral-overlay:close since the silent setter was used
          commons.transitionEnd(overlay, function() {
            expect(overlay.style.display).to.equal('none', 'overlay should be set to "display:none" now');
        
            done();
          });
        });
    
        overlay.open = true;
        expect(overlay.open).to.equal(true, 'overlay should be open now');
      });
  
      it('should not change hidden when show()/hide() called', function() {
        expect(overlay.hidden).to.equal(false);
        overlay.show();
        expect(overlay.hidden).to.equal(false);
        overlay.hide();
        expect(overlay.hidden).to.equal(false);
      });
    });
    
    describe('#focusOnShow', function() {
      it('should default to ON', function() {
        expect(overlay.focusOnShow).to.equal(mixin._overlay.focusOnShow.ON);
      });
  
      it('should focus the overlay when no content is focusable', function(done) {
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement).to.equal(overlay, 'Focus should fallback to the overlay itself');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should focus the first tababble descendent when available', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement.id).to.equal('button1', 'The first focusable element should get the focus');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should accept an HTMLElement to focus', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.threeButtons.html']);
    
        var button2 = overlay.content.querySelector('#button2');
    
        overlay.focusOnShow = button2;
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement.id).to.equal(button2.id, 'The provided button should be focused');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should fallback to the document body when the provided element is not focusable', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.threeButtons.html']);
    
        var div = overlay.content.querySelector('div');
    
        overlay.focusOnShow = div;
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement).to.equal(document.body, 'Focus should fallback to body');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should focus the first item that matches a selector', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.threeButtons.html']);
    
        overlay.focusOnShow = '.demo-content button';
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement.id).to.equal('button1', 'Should focus the first item that matches the selctor');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should default to the first tababble descendent when the selector is invalid', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.threeButtons.html']);
    
        overlay.focusOnShow = '#input';
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement.id).to.equal('button1', 'Should fallback to the first tabbable element');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should not focus the contents if the selector matches a non focusable item', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.threeButtons.html']);
        overlay.focusOnShow = 'div';
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement).to.equal(document.body, 'Should focus the body since the div is not focusable');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should default to the overlay when the selector is invalid (and no tabbable element is available)', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.nonTabbableContent.html']);
    
        overlay.focusOnShow = '#input';
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement).to.equal(overlay, 'Should fallback to the overlay element');
        
          done();
        });
    
        overlay.show();
      });
  
      it('should accept :first-child as a selector', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
        overlay.focusOnShow = ':first-child';
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement).to.equal(overlay.content.firstChild, 'Should focus the first child');
        
          done();
        });
    
        overlay.show();
      });
      
      it('should focus on the last-of-type item when shown', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
        overlay.focusOnShow = 'button:last-of-type';
  
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement.id).to.equal('button2', 'Should focus the last button');
      
          done();
        });
  
        overlay.show();
      });
  
      it('should not move focus when OFF', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
        overlay.focusOnShow = mixin._overlay.focusOnShow.OFF;
    
        overlay.on('coral-overlay:open', function() {
          expect(document.activeElement).to.equal(document.body, 'Focus should remain on the body');
        
          done();
        });
    
        overlay.show();
      });
    });
    
    describe('#returnFocus', function() {
      it('should focus on previously focused element when hidden', function(done) {
        var button = document.createElement('button');
        helpers.target.appendChild(button);
    
        // Focus on the button; this becomes the focused item that should receive focus after the overlay is closed
        button.focus();
    
        // Spy on the focus method
        // We can't actually check if the button is focused because the browser window needs to be focused for that to happen
        var focusSpy = sinon.spy(button, 'focus');
    
        // we close it immediately after it opens
        overlay.on('coral-overlay:open', function() {
          // we wait for the component to deal with the focus before hiding it; returnFocusTo assumes that the component
          // was focused or its internals, otherwise it would decide not to focus the target
          expect(overlay).to.equal(document.activeElement, 'Overlay should be in focus');
          overlay.hide();
        });
    
        overlay.on('coral-overlay:close', function() {
          // See if our spy was called
          expect(focusSpy.callCount).to.equal(1, 'Focus should have been called once');
        
          done();
        });
    
        overlay.show();
      });
    });
    
    describe('#returnFocusTo()', function() {
      it('should return focus to the passed element', function(done) {
        var button1 = document.createElement('button');
        var button2 = document.createElement('button');
        helpers.target.appendChild(button1);
        helpers.target.appendChild(button2);
    
        // we move the focus to the 2nd button in order to test that returnFocusTo returns the focus to the provided
        // elements, instead of giving it back to the element that had focus before opening the overlay
        button2.focus();
    
        // Spy on the focus method; We can't actually check if the button is focused because the browser window needs to
        // be focused for that to happen
        var button1focusSpy = sinon.spy(button1, 'focus');
        var button2focusSpy = sinon.spy(button2, 'focus');
    
        // Tell the overlay to return focus to the button when hidden
        overlay.returnFocusTo(button1);
    
        // we close it immediately after it opens
        overlay.on('coral-overlay:open', function() {
          expect(overlay).to.equal(document.activeElement, 'Overlay should be in focus');
          overlay.hide();
        });
    
        overlay.on('coral-overlay:close', function() {
          expect(button1focusSpy.callCount).to.equal(1, 'focus() should have been called');
          expect(button2focusSpy.callCount).to.equal(0, 'focus() should not have been called');
          expect(document.activeElement).to.equal(button1, 'Focus returned to the button');
      
          done();
        });
    
        overlay.show();
      });
  
      it('should focus on the element passed to returnFocusTo() when hidden, even when element is not interactive', function(done) {
        var div = document.createElement('div');
        helpers.target.appendChild(div);
    
        // Spy on the focus method
        // We can't actually check if the div is focused because the browser window needs to be focused for that to happen
        var focusSpy = sinon.spy(div, 'focus');
    
        // Tell the overlay to return focus to the div when hidden
        overlay.returnFocusTo(div);
    
        overlay.on('coral-overlay:open', function() {
          expect(div.getAttribute('tabindex')).to.equal('-1', 'returnFocusTo element is focusable');
          expect(overlay).to.equal(document.activeElement, 'Overlay should be in focus');
          overlay.hide();
        });
    
        overlay.on('coral-overlay:close', function() {
          // See if our spy was called
          expect(focusSpy.callCount).to.equal(1, 'focus() should have been called once');
      
          // Dispatch a blur event from returnFocusTo element
          helpers.event('blur', div);
      
          helpers.next(function() {
            expect(div.getAttribute('tabindex')).to.equal(null, 'tabindex removed from non-interactive returnFocusTo on blur');
        
            done();
          });
        });
    
        overlay.show();
      });
    });
  });
  
  describe('Markup', function() {});
  
  describe('Events', function() {
    describe('#coral-overlay:open', function() {
      it('should trigger "coral-overlay:open" event only after the transition is finished', function(done) {
        overlay1 = new OverlayDummy2();
        overlay1.content.textContent = 'Overlay 1';
        //overlay1._overlayAnimationTime = 100;
        helpers.target.appendChild(overlay1);
    
        var openHasBeenCalled = false;
        overlay1.on('coral-overlay:open', function() {
          openHasBeenCalled = true;
        });
    
        overlay1.open = true;
        expect(openHasBeenCalled).to.equal(false, '"coral-overlay:open" should only be fired after the transition is finished');
    
        // "coral-overlay:open" should only be called after animation is over
        window.setTimeout(function() {
          expect(openHasBeenCalled).to.equal(true, '"coral-overlay:open" should now have been called');
          done();
        }, 101);
      });
  
      it('should make sure that only one "coral-overlay:open" event is thrown at a time', function(done) {
        var beforeOpenSpy = sinon.spy();
        var beforeCloseSpy = sinon.spy();
    
        var openSpy = sinon.spy();
        var closeSpy = sinon.spy();
    
        overlay1 = new OverlayDummy2();
        overlay1.content.textContent = 'Overlay 1';
        overlay1._overlayAnimationTime = 100; // This test will use a commons.transitionEnd mock!
        helpers.target.appendChild(overlay1);
    
        overlay1.on('coral-overlay:beforeopen', beforeOpenSpy);
        overlay1.on('coral-overlay:beforeclose', beforeCloseSpy);
        overlay1.on('coral-overlay:open', openSpy);
        overlay1.on('coral-overlay:close', closeSpy);
    
        overlay1.open = true;
        overlay1.open = false;
        overlay1.open = true;
    
        window.setTimeout(function() {
          expect(beforeOpenSpy.callCount).to.equal(2, '"coral-overlay:beforeopen" should have been called three times!');
          expect(beforeCloseSpy.callCount).to.equal(1, '"coral-overlay:beforeclose" should have been called twice');
          expect(openSpy.callCount).to.equal(1, '"coral-overlay:open" should only be called "once"!');
          expect(closeSpy.callCount).to.equal(0, '"coral-overlay:close" should never be called as it is canceled by open before animation is done');
          done();
        }, 200);
      });
    });
    
    describe('#coral-overlay:close', function() {
      it('should trigger "coral-overlay:close" event only after the transition is finished', function(done) {
        overlay1 = new OverlayDummy2();
        overlay1.content.textContent = 'Overlay 1';
        //overlay1._overlayAnimationTime = 100;
        helpers.target.appendChild(overlay1);
    
        overlay1.open = true;
    
        var closeHasBeenCalled = false;
        overlay1.on('coral-overlay:close', function() {
          closeHasBeenCalled = true;
        });
    
        helpers.next(function() {
          overlay1.open = false;
          expect(closeHasBeenCalled).to.equal(false, '"coral-overlay:close" should only be called after transition is over');
      
          // "coral-overlay:close" should only be called after animation is over
          window.setTimeout(function() {
            expect(closeHasBeenCalled).to.equal(true, '"coral-overlay:close" should now have been called');
            done();
          }, 101);
        });
      });
  
      it('should make sure that only one "coral-overlay:close" event is thrown at a time', function(done) {
        var beforeOpenSpy = sinon.spy();
        var beforeCloseSpy = sinon.spy();
        var openSpy = sinon.spy();
        var closeSpy = sinon.spy();
    
        overlay1 = new OverlayDummy2();
        overlay1.content.textContent = 'Overlay 1';
        overlay1._overlayAnimationTime = 100; // This test will use a commons.transitionEnd mock!
        helpers.target.appendChild(overlay1);
    
        overlay1.on('coral-overlay:beforeopen', beforeOpenSpy);
        overlay1.on('coral-overlay:beforeclose', beforeCloseSpy);
        overlay1.on('coral-overlay:open', openSpy);
        overlay1.on('coral-overlay:close', closeSpy);
    
        overlay1.open = true;
        overlay1.open = false;
    
        window.setTimeout(function() {
          expect(beforeOpenSpy.callCount).to.equal(1, '"coral-overlay:beforeopen" should have been called twice!');
          expect(beforeCloseSpy.callCount).to.equal(1, '"coral-overlay:beforeclose" should have been called twice');
          expect(openSpy.callCount).to.equal(0, '"coral-overlay:open" should never be called as it is canceled by close before animation is done');
          expect(closeSpy.callCount).to.equal(1, '"coral-overlay:close" should only be called "once"!');
          done();
        }, 200);
      });
    });
  
    it('should be possible to toggle the overlay while it is still in the transition', function(done) {
      var openSpy = sinon.spy();
      var closeSpy = sinon.spy();
    
      overlay1 = new OverlayDummy2();
      overlay1.content.textContent = 'Overlay 1';
      overlay1._overlayAnimationTime = 100; // This test will use a commons.transitionEnd mock!
      helpers.target.appendChild(overlay1);
    
      helpers.next(function() {
        overlay1.on('coral-overlay:open', openSpy);
        overlay1.on('coral-overlay:close', closeSpy);
      
        overlay1.open = true;
      
        //make sure sync of "open" attribute has been called by waiting 2 frames
        helpers.next(function() {
          helpers.next(function() {
            overlay1.open = false;
            expect(openSpy.called).to.equal(false, '"coral-overlay:open" should never be called as it is canceled by close before animation is done');
            expect(closeSpy.called).to.equal(false, '"coral-overlay:close" should only be called once animation is over');
          
            // "coral-overlay:close" should only be called after animation is over
            window.setTimeout(function() {
              expect(openSpy.called).to.equal(false, '"coral-overlay:open" should still not be called as it was canceled by close before animation was done');
              expect(closeSpy.called).to.equal(true, '"coral-overlay:close" now should have been called');
              done();
            }, 200);
          });
        });
      });
    });
  
    it('should be possible to open/close overlay silently', function(done) {
      overlay1 = new OverlayDummy2();
      overlay1.content.textContent = 'Overlay 1';
      //overlay1._overlayAnimationTime = 100;
      helpers.target.appendChild(overlay1);
    
      overlay1.open = true;
      expect(overlay1.open).to.equal(true, 'overlay should be open now');
    
      var beforeCloseSpy = sinon.spy();
      overlay1.on('coral-overlay:beforeclose', beforeCloseSpy);
    
      var closeSpy = sinon.spy();
      overlay1.on('coral-overlay:close', closeSpy);
    
      helpers.next(function() {
        overlay1.set('open', false, true); // close silently
        expect(overlay1.open).to.equal(false, 'overlay should be closed now');
      
        // "coral-overlay:close" should only be called after animation is over
        window.setTimeout(function() {
          expect(closeSpy.callCount).to.equal(0, 'no "coral-overlay:close" event should have been fired');
          expect(beforeCloseSpy.callCount).to.equal(0, 'no "coral-overlay:beforeclose" event should have been fired');
        
          done();
        }, 101);
      });
    });
  });
  
  describe('User Interaction', function() {
    it('should call backdropClickedCallback on all overlays when backdrop clicked', function(done) {
      overlay1 = new OverlayDummy2();
      helpers.target.appendChild(overlay1);
      overlay1.backdropClickedCallback = sinon.spy();
      overlay1.open = true;
    
      overlay2 = new OverlayDummy2();
      helpers.target.appendChild(overlay2);
      overlay2.backdropClickedCallback = sinon.spy();
      overlay2.open = true;
    
      helpers.next(function() {
        document.querySelector('._coral-Underlay').click();
      
        expect(overlay1.backdropClickedCallback.callCount).to.equal(1);
        expect(overlay2.backdropClickedCallback.callCount).to.equal(1);
      
        // Clean up
        overlay1.open = false;
        overlay2.open = false;
      
        helpers.next(function() {
          // Wait for clean up to be complete
          done();
        });
      });
    });
  });
  
  describe('Implementation Details', function() {
    describe('focus()', function() {
      it('should keep focus on the container when focused', function(done) {
        overlay.content.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
      
        overlay.on('coral-overlay:open', function() {
          overlay.focus();
          expect(document.activeElement).to.equal(overlay);
        
          done();
        });
      
        overlay.show();
      });
    });
    
    describe('tabcapture', function() {
      it('should focus on the last focusable element when top tab capture focused', function() {
        overlay.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
    
        var button2 = overlay.querySelector('#button2');
    
        overlay.open = true;
  
        overlay.querySelector('[coral-tabcapture]').focus();
  
        helpers.event('focus', overlay.querySelector('[coral-tabcapture]'));
        expect(document.activeElement).to.equal(button2);
      });
  
      it('should focus on the first focusable element when intermediate tab capture focused', function() {
        overlay.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
    
        var button1 = overlay.querySelector('#button1');
    
        overlay.open = true;
    
        overlay.querySelectorAll('[coral-tabcapture]')[1].focus();
        // for FF
        helpers.event('focus', overlay.querySelectorAll('[coral-tabcapture]')[1]);
        expect(document.activeElement).to.equal(button1);
      });
  
      it('should focus on the last focusable element when last tab capture focused', function() {
        overlay = new OverlayDummy2();
        helpers.target.appendChild(overlay);
  
        overlay.insertAdjacentHTML('afterbegin', window.__html__['mixin._overlay.someButtons.html']);
    
        var button2 = overlay.querySelector('#button2');
    
        overlay.open = true;
    
        overlay.querySelectorAll('[coral-tabcapture]')[2].focus();
        // for FF
        helpers.event('focus', overlay.querySelectorAll('[coral-tabcapture]')[2]);
        expect(document.activeElement).to.equal(button2);
      });
  
      it('should position tabcapture elements correctly on show', function(done) {
        overlay = new OverlayDummy2();
        helpers.target.appendChild(overlay);
    
        overlay.appendChild(document.createElement('div'));
    
        overlay.open = true;
        helpers.next(function() {
          expect(overlay.lastElementChild).to.equal(overlay._elements.bottomTabCapture);
          expect(overlay.lastElementChild.previousElementSibling).to.equal(overlay._elements.intermediateTabCapture);
      
          // Clean up
          overlay.open = false;
      
          helpers.next(function() {
            // Wait for clean up to be complete
            done();
          });
        });
      });
  
      it('should position tabcapture elements correctly on show if their order is changed', function(done) {
        overlay = new OverlayDummy2();
        helpers.target.appendChild(overlay);
    
        overlay.insertBefore(document.createElement('div'), overlay._elements.bottomTabCapture);
    
        overlay.open = true;
        helpers.next(function() {
          expect(overlay.lastElementChild).to.equal(overlay._elements.bottomTabCapture);
          expect(overlay.lastElementChild.previousElementSibling).to.equal(overlay._elements.intermediateTabCapture);
      
          // Clean up
          overlay.open = false;
      
          helpers.next(function() {
            // Wait for clean up to be complete
            done();
          });
        });
      });
    });
  
    describe('Backdrop', function() {
      it('should appear above other overlays with a correctly positioned backdrop', function(done) {
        overlay1 = new OverlayDummy2();
        overlay1.content.textContent = 'Overlay 1';
        helpers.target.appendChild(overlay1);
      
        overlay2 = new OverlayDummy2();
        overlay2.content.textContent = 'Overlay 2';
        helpers.target.appendChild(overlay2);
      
        overlay1.open = true;
        overlay2.open = true;
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the top overlay is above the bottom overlay
          expect(zIndex(overlay2)).to.be.greaterThan(zIndex(overlay1));
        
          // Make sure the backdrop is positioned under the top overlay
          expect(zIndex(backdrop)).to.be.lessThan(zIndex(overlay2), 'backdrop zIndex as compared to top overlay when both visible');
        
          // Make sure the backdrop is positioned above the bottom overlay
          expect(zIndex(backdrop)).to.be.greaterThan(zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both visible');
        
          // Clean up
          overlay1.open = false;
          overlay2.open = false;
        
          helpers.next(function() {
            // Wait for clean up to be complete
            done();
          });
        });
      });
    
      it('should hide backdrop when overlay is removed from DOM', function(done) {
        overlay = new OverlayDummy2();
        helpers.target.appendChild(overlay);
      
        overlay.open = true;
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay shown');
        
          // Remove from the DOM
          helpers.target.removeChild(overlay);
        
          helpers.next(function() {
            // Make sure the backdrop is hidden
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when overlay removed from DOM');
          
            done();
          });
        });
      });
    
      it('should hide backdrop when hiding overlay (even if overlay is directly detached afterwards)', function(done) {
        overlay = new OverlayDummy2();
        helpers.target.appendChild(overlay);
      
        overlay.open = true;
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay shown');
        
          // hide the overlay
          overlay.open = false;
        
          // Remove from the DOM
          helpers.target.removeChild(overlay);
        
          helpers.next(function() {
            // Make sure the backdrop is hidden
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when overlay removed from DOM');
          
            done();
          });
        });
      });
    
      it('should not hide backdrop when multiple modal overlays are open and one is closed', function(done) {
        overlay1 = new OverlayDummy2();
        helpers.target.appendChild(overlay1);
      
        overlay2 = new OverlayDummy2();
        helpers.target.appendChild(overlay2);
      
        overlay1.open = true;
        overlay2.open = true;
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when both overlays visible');
        
          // Make sure the backdrop positioned under the top overlay
          expect(zIndex(backdrop)).to.be.lessThan(zIndex(overlay2), 'backdrop zIndex as compared to top overlay when both visible');
        
          // Make sure the backdrop positioned above the bottom overlay
          expect(zIndex(backdrop)).to.be.greaterThan(zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both visible');
        
          // Hide top overlay
          overlay2.open = false;
        
          helpers.next(function() {
            // Make sure the backdrop is visible
            expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when top overlay hidden');
          
            // Make sure it's positioned under the bottom overlay
            expect(zIndex(backdrop)).to.be.lessThan(zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when top overlay closed');
          
            // Hide the bottom overlay
            overlay1.open = false;
          
            helpers.next(function() {
              // Make sure the backdrop is hidden
              expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when both overlays hidden');
            
              // Make sure it's positioned under the bottom overlay
              expect(zIndex(backdrop)).to.be.lessThan(zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both overlays closed');
            
              done();
            });
          });
        });
      });
    
      it('should not hide backdrop when a non-modal overlay is closed before a modal overlay is opened', function(done) {
        overlay1 = new OverlayDummy1();
        helpers.target.appendChild(overlay1);
      
        overlay2 = new OverlayDummy2();
        helpers.target.appendChild(overlay2);
      
        overlay2.open = true;
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the backdrop is open
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility after modal overlay shown');
        
          // Hide modal overlay
          overlay2.open = false;
        
          helpers.next(function() {
            // Make sure the backdrop is not open
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility before modal overlay shown again');
          
            // Show non-modal overlay
            overlay1.open = true;
          
            helpers.next(function() {
              // Make sure the backdrop is not open
              expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility before modal overlay shown again');
            
              // Show modal overlay
              overlay2.open = true;
            
              // Hide non-modal overlay
              overlay1.open = false;
            
              setTimeout(function() {
                // Make sure the backdrop is visible
                expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when non-modal overlay hidden');
              
                done();
              }, mixin._overlay.FADETIME + 50);
            });
          });
        });
      });
    
      it('should correctly position the backdrop when a middle overlay is closed', function(done) {
        overlay1 = new OverlayDummy2();
        helpers.target.appendChild(overlay1);
        overlay1.open = true;
      
        overlay2 = new OverlayDummy2();
        helpers.target.appendChild(overlay2);
        overlay2.open = true;
      
        overlay3 = new OverlayDummy2();
        helpers.target.appendChild(overlay3);
        overlay3.open = true;
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility initially');
        
          // Make sure it's positioned under the top overlay
          expect(zIndex(backdrop)).to.be.lessThan(zIndex(overlay3), 'backdrop zIndex as compared to top overlay');
        
          // Make sure it's positioned above the middle overlay
          expect(zIndex(backdrop)).to.be.greaterThan(zIndex(overlay2), 'backdrop zIndex as compared to middle overlay');
        
          // Make sure it's positioned above the bottom overlay
          expect(zIndex(backdrop)).to.be.greaterThan(zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay');
        
          // Hide middle overlay
          overlay2.open = false;
        
          helpers.next(function() {
            // Make sure the backdrop is visible
            expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when middle overlay hidden');
          
            // Make sure it's positioned under the top overlay
            expect(zIndex(backdrop)).to.be.lessThan(zIndex(overlay3), 'backdrop zIndex as compared to top overlay');
          
            // Make sure it's positioned above the bottom overlay
            expect(zIndex(backdrop)).to.be.greaterThan(zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay');
          
            // Hide the bottom overlay
            overlay1.open = false;
          
            helpers.next(function() {
              // Make sure the backdrop is visible
              expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when bottom overlay hidden');
            
              // Make sure it's positioned under the top overlay
              expect(zIndex(backdrop)).to.be.lessThan(zIndex(overlay3), 'backdrop zIndex as compared to top overlay');
            
              // Hide the top overlay
              overlay3.open = false;
            
              helpers.next(function() {
                // Make sure the backdrop is hidden
                expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when all overlays hidden');
              
                done();
              });
            });
          });
        });
      });
    
      it('should position the backdrop under the topmost overlay that does have a backdrop', function(done) {
        overlay1 = new OverlayDummy2();
        overlay1.open = true;
        helpers.target.appendChild(overlay1);
      
        // make two non modal overlays
        overlay2 = new OverlayDummy1();
        overlay2.open = true;
        helpers.target.appendChild(overlay2);
      
        overlay3 = new OverlayDummy1();
        overlay3.open = true;
        helpers.target.appendChild(overlay3);
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility initially');
        
          expect(zIndex(backdrop)).to.equal(zIndex(overlay1) - 1, 'backdrop should be behind the modal dialog 1');
        
          overlay3.open = false;
        
          helpers.next(function() {
            expect(zIndex(backdrop)).to.equal(zIndex(overlay1) - 1, 'backdrop shouldstill be behind the modal dialog 1');
            done();
          });
        
        });
      });
    
      it('should hide backdrop when removed from the DOM while visible, show it again when reattached', function(done) {
        overlay = new OverlayDummy2();
        helpers.target.appendChild(overlay);
      
        overlay.open = true;
      
        helpers.next(function() {
          var backdrop = document.querySelector('._coral-Underlay');
          expect(backdrop).to.not.be.null;
        
          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay shown');
        
          // Remove from the DOM
          helpers.target.removeChild(overlay);
        
          helpers.next(function() {
            // Make sure the backdrop is hidden
            expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when overlay removed from DOM');
          
            // Add back to the DOM
            helpers.target.appendChild(overlay);
          
            helpers.next(function() {
              // Make sure the backdrop is visible
              expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay appended to DOM');
            
              done();
            });
          });
        });
      });
    
      it('should be considered top most when attached as visible', function(done) {
        // Add a overlay to the DOM, then make it visible
        overlay1 = new OverlayDummy2();
        helpers.target.appendChild(overlay1);
        overlay1.open = true;
      
        // Create a overlay, make it visible, but don't add it to the DOM
        overlay2 = new OverlayDummy2();
        overlay2.open = true;
      
        helpers.next(function() {
          // Add the visible overlay
          helpers.target.appendChild(overlay2);
        
          helpers.next(function() {
            // It should now be on top
            expect(zIndex(overlay2)).to.be.greaterThan(zIndex(overlay1));
          
            overlay2.open = false;
          
            helpers.next(function() {
              var backdrop = document.querySelector('._coral-Underlay');
              expect(backdrop).to.not.be.null;
            
              expect(zIndex(overlay1)).to.be.greaterThan(zIndex(backdrop));
            
              // Clean up
              overlay1.open = false;
              overlay2.open = false;
            
              helpers.next(function() {
                // Wait for clean up to be complete
                done();
              });
            });
          });
        });
      });
    
      it('should hide when done closing', function(done) {
        // Temporarily change the fade time to 1ms
        var FADETIME = mixin._overlay.FADETIME;
        mixin._overlay.FADETIME = 0;
      
        overlay = new OverlayDummy2();
        helpers.target.appendChild(overlay);
      
        helpers.next(function() {
          overlay1.open = true;
          helpers.next(function() {
            overlay.open = false;
          
            // Test if hidden after 10ms
            setTimeout(function() {
              expect(overlay.open).to.be.false;
              expect(overlay.style.display).to.equal('none');
            
              // Restore fade time
              mixin._overlay.FADETIME = FADETIME;
              helpers.next(function() {
                // Wait for clean up to be complete
                done();
              });
            }, 101);
          });
        });
      });
    });
  });
});
