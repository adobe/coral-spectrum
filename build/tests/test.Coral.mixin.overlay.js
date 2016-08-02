/* jshint -W106 */
describe('Coral.mixin.overlay', function() {
  'use strict';

  // Create dummy overlay components
  var Overlay;
  var OverlayNonModal;
  var tansitionEnd;
  before(function() {
    tansitionEnd = Coral.commons.transitionEnd;

    // mock transitionEnd for the tests (simulate transition ended after 100 ms)
    Coral.commons.transitionEnd = function(el, cb) {
      window.setTimeout(function() {
        cb();
      }, 100);
    };

    OverlayNonModal = Coral.register({
      name: 'NonModalOverlay',
      tagName: 'coral-overlay-nonmodal',
      className: 'coral-Overlay-nonmodal',

      mixins: [
        Coral.mixin.overlay
      ],

      properties: {
        'trapFocus': {
          default: 'on'
        },
        'returnFocus': {
          default: 'on'
        },
        'focusOnShow': {
          default: 'on'
        },
        // Hackish content property for testing
        'content': {
          set: function(value) {
            this._elements.content.innerHTML = value;
          },
          get: function() {
            return this._elements.content.innerHTML;
          }
        }
      },

      _render: function() {
        this._elements.content = document.createElement('div');
        this.appendChild(this._elements.content);
      }
    });

    Overlay = Coral.register({
      name: 'Overlay',
      tagName: 'coral-test-overlay',
      className: 'coral-Overlay',
      extend: OverlayNonModal,

      properties: {
        'open': {
          sync: function() {
            if (this.open) {
              // Show the backdrop when we're shown
              // This makes the overlay "modal"
              this._showBackdrop();
            }
          }
        }
      }
    });
  });

  // Close and remove the instance
  function cleanUpInstance(instance) {
    if (!instance) {
      return;
    }

    if (instance.parentNode) {
      instance.parentNode.removeChild(instance);
    }
  }

  // Hold the instances
  var overlay;
  var overlay1;
  var overlay2;
  var overlay3;

  // Clean up
  afterEach(function() {
    cleanUpInstance(overlay);
    cleanUpInstance(overlay1);
    cleanUpInstance(overlay2);
    cleanUpInstance(overlay3);
  });

  after(function() {
    // reset to original transitionEnd impl.
    Coral.commons.transitionEnd = tansitionEnd;
  });

  /**
    Test if the provided backdrop element is hidden or hiding
  */
  function backdropOpen(element) {
    return element._isOpen;
  }

  it('should focus on previously focused element when hidden', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    var button = document.createElement('button');
    helpers.target.appendChild(button);

    // Focus on the button
    button.focus();

    // Spy on the focus method
    // We can't actually check if the button is focused because the browser window needs to be focused for that to happen
    var focusSpy = sinon.spy(button, 'focus');

    // Show the overlay
    overlay.show();

    // Wait a tick, then hide it
    helpers.next(function() {
      overlay.hide();

      // Wait a tick, then expect to have focus
      helpers.next(function() {
        // See if our spy was called
        expect(focusSpy.callCount).to.equal(1);

        // Clean up
        overlay.hide();

        helpers.next(function() {
          // Wait for clean up to be complete
          done();
        });
      });
    });
  });

  it('should focus on the element passed to returnFocusTo() when hidden', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    var button = document.createElement('button');
    helpers.target.appendChild(button);

    // Spy on the focus method
    // We can't actually check if the button is focused because the browser window needs to be focused for that to happen
    var focusSpy = sinon.spy(button, 'focus');

    // Show the overlay
    overlay.show();

    // Tell the overlay to return focus to the button when hidden
    overlay.returnFocusTo(button);

    // Wait a tick, then hide it
    helpers.next(function() {
      overlay.hide();

      // Wait a tick, then expect to have focus
      helpers.next(function() {
        // See if our spy was called
        expect(focusSpy.callCount).to.equal(1);

        // Clean up
        overlay.hide();

        helpers.next(function() {
          // Wait for clean up to be complete
          done();
        });
      });
    });
  });

  it('should focus on the container when shown', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.show();

    helpers.next(function() {
      expect(document.activeElement).to.equal(overlay);

      // Clean up
      overlay.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });


  it('should focus on the first child when shown', function(done) {
    overlay = new Overlay();
    overlay.focusOnShow = ':first-child';
    overlay.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixins.overlay.someButtons.html']);
    helpers.target.appendChild(overlay);
    overlay.show();
    helpers.next(function() {
      expect(document.activeElement).to.not.equal(overlay);
      expect(document.activeElement.id).to.equal('button1');
      // Clean up
      overlay.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  it('should focus on the last-of-type item when shown', function(done) {
    overlay = new Overlay();
    overlay.focusOnShow = 'button:last-of-type';
    overlay.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixins.overlay.someButtons.html']);
    helpers.target.appendChild(overlay);
    overlay.show();
    helpers.next(function() {
      expect(document.activeElement).to.not.equal(overlay);
      expect(document.activeElement.id).to.equal('button2');
      // Clean up
      overlay.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  it('should focus on the item given by id via css selector when shown', function(done) {
    overlay = new Overlay();
    overlay.focusOnShow = '#button3';
    overlay.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixin.overlay.threeButtons.html']);
    helpers.target.appendChild(overlay);
    overlay.show();
    helpers.next(function() {
      expect(document.activeElement).to.not.equal(overlay);
      expect(document.activeElement.id).to.equal('button3');
      // Clean up
      overlay.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  // Neither Firefox nor Chrome is happy about emitting focus events when the window isn't focused
  /*skip*/
  it.skip('should keep focus on the container when focused', function() {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixins.overlay.someButtons.html']);

    overlay.focus();
    expect(document.activeElement).to.equal(overlay);
  });

  /*skip*/
  it.skip('should focus on the last focusable element when top tab capture focused', function() {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixins.overlay.someButtons.html']);

    var button2 = overlay.querySelector('#button2');

    overlay.show();

    overlay.querySelectorAll('[coral-tabcapture]')[0].focus();
    expect(document.activeElement).to.equal(button2);
  });

  /*skip*/
  it.skip('should focus on the first focusable element when intermediate tab capture focused', function() {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixins.overlay.someButtons.html']);

    var button1 = overlay.querySelector('#button1');

    overlay.show();

    overlay.querySelectorAll('[coral-tabcapture]')[1].focus();
    expect(document.activeElement).to.equal(button1);
  });

  /*skip*/
  it.skip('should focus on the last focusable element when last tab capture focused', function() {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.insertAdjacentHTML('afterbegin', window.__html__['Coral.mixins.overlay.someButtons.html']);

    var button2 = overlay.querySelector('#button2');

    overlay.show();

    overlay.querySelectorAll('[coral-tabcapture]')[2].focus();
    expect(document.activeElement).to.equal(button2);
  });

  it('should not change hidden when show()/hide() called', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    expect(overlay.hidden).to.equal(false);
    overlay.show();
    expect(overlay.hidden).to.equal(false);
    overlay.hide();
    expect(overlay.hidden).to.equal(false);

    // Clean up
    overlay.hide();

    helpers.next(function() {
      // Wait for clean up to be complete
      done();
    });
  });

  it('should position tabcapture elements correctly on show', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.appendChild(document.createElement('div'));

    overlay.show();
    helpers.next(function() {
      expect(overlay.lastElementChild).to.equal(overlay._elements.bottomTabCapture);
      expect(overlay.lastElementChild.previousElementSibling).to.equal(overlay._elements.intermediateTabCapture);

      // Clean up
      overlay.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  it('should position tabcapture elements correctly on show if their order is changed', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.insertBefore(document.createElement('div'), overlay._elements.bottomTabCapture);

    overlay.show();
    helpers.next(function() {
      expect(overlay.lastElementChild).to.equal(overlay._elements.bottomTabCapture);
      expect(overlay.lastElementChild.previousElementSibling).to.equal(overlay._elements.intermediateTabCapture);

      // Clean up
      overlay.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  it('should appear above other overlays with a correctly positioned backdrop', function(done) {
    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
    helpers.target.appendChild(overlay1);

    overlay2 = new Overlay();
    overlay2.content = 'Overlay 2';
    helpers.target.appendChild(overlay2);

    overlay1.show();
    overlay2.show();

    helpers.next(function() {
      var backdrop = document.querySelector('.coral-Backdrop');
      expect(backdrop).to.not.be.null;

      // Make sure the top overlay is above the bottom overlay
      expect(helpers.zIndex(overlay2)).to.be.greaterThan(helpers.zIndex(overlay1));

      // Make sure the backdrop is positioned under the top overlay
      expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay2), 'backdrop zIndex as compared to top overlay when both visible');

      // Make sure the backdrop is positioned above the bottom overlay
      expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both visible');

      // Clean up
      overlay1.hide();
      overlay2.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  it('should hide backdrop when overlay is removed from DOM', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.show();

    helpers.next(function() {
      var backdrop = document.querySelector('.coral-Backdrop');
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
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.show();

    helpers.next(function() {
      var backdrop = document.querySelector('.coral-Backdrop');
      expect(backdrop).to.not.be.null;

      // Make sure the backdrop is visible
      expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when overlay shown');

      // hide the overlay
      overlay.hide();

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
    overlay1 = new Overlay();
    helpers.target.appendChild(overlay1);

    overlay2 = new Overlay();
    helpers.target.appendChild(overlay2);

    overlay1.show();
    overlay2.show();

    helpers.next(function() {
      var backdrop = document.querySelector('.coral-Backdrop');
      expect(backdrop).to.not.be.null;

      // Make sure the backdrop is visible
      expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when both overlays visible');

      // Make sure the backdrop positioned under the top overlay
      expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay2), 'backdrop zIndex as compared to top overlay when both visible');

      // Make sure the backdrop positioned above the bottom overlay
      expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both visible');

      // Hide top overlay
      overlay2.hide();

      helpers.next(function() {
        // Make sure the backdrop is visible
        expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when top overlay hidden');

        // Make sure it's positioned under the bottom overlay
        expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when top overlay closed');

        // Hide the bottom overlay
        overlay1.hide();

        helpers.next(function() {
          // Make sure the backdrop is hidden
          expect(backdropOpen(backdrop)).to.equal(false, 'backdrop visibility when both overlays hidden');

          // Make sure it's positioned under the bottom overlay
          expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay when both overlays closed');

          done();
        });
      });
    });
  });

  it('should correctly position the backdrop when a middle overlay is closed', function(done) {
    overlay1 = new Overlay();
    helpers.target.appendChild(overlay1);
    overlay1.show();

    overlay2 = new Overlay();
    helpers.target.appendChild(overlay2);
    overlay2.show();

    overlay3 = new Overlay();
    helpers.target.appendChild(overlay3);
    overlay3.show();

    helpers.next(function() {
      var backdrop = document.querySelector('.coral-Backdrop');
      expect(backdrop).to.not.be.null;

      // Make sure the backdrop is visible
      expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility initially');

      // Make sure it's positioned under the top overlay
      expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay3), 'backdrop zIndex as compared to top overlay');

      // Make sure it's positioned above the middle overlay
      expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay2), 'backdrop zIndex as compared to middle overlay');

      // Make sure it's positioned above the bottom overlay
      expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay');

      // Hide middle overlay
      overlay2.hide();

      helpers.next(function() {
        // Make sure the backdrop is visible
        expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when middle overlay hidden');

        // Make sure it's positioned under the top overlay
        expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay3), 'backdrop zIndex as compared to top overlay');

        // Make sure it's positioned above the bottom overlay
        expect(helpers.zIndex(backdrop)).to.be.greaterThan(helpers.zIndex(overlay1), 'backdrop zIndex as compared to bottom overlay');

        // Hide the bottom overlay
        overlay1.hide();

        helpers.next(function() {
          // Make sure the backdrop is visible
          expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility when bottom overlay hidden');

          // Make sure it's positioned under the top overlay
          expect(helpers.zIndex(backdrop)).to.be.lessThan(helpers.zIndex(overlay3), 'backdrop zIndex as compared to top overlay');

          // Hide the top overlay
          overlay3.hide();

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
    overlay1 = new Overlay();
    overlay1.show();
    helpers.target.appendChild(overlay1);

    // make two non modal overlays
    overlay2 = new OverlayNonModal();
    overlay2.show();
    helpers.target.appendChild(overlay2);

    overlay3 = new OverlayNonModal();
    overlay3.show();
    helpers.target.appendChild(overlay3);

    helpers.next(function() {
      var backdrop = document.querySelector('.coral-Backdrop');
      expect(backdrop).to.not.be.null;

      // Make sure the backdrop is visible
      expect(backdropOpen(backdrop)).to.equal(true, 'backdrop visibility initially');

      expect(helpers.zIndex(backdrop)).to.equal(helpers.zIndex(overlay1) - 1, 'backdrop should be behind the modal dialog 1');

      overlay3.hide();

      helpers.next(function() {
        expect(helpers.zIndex(backdrop)).to.equal(helpers.zIndex(overlay1) - 1, 'backdrop shouldstill be behind the modal dialog 1');
        done();
      });

    });
  });

  it('should hide backdrop when removed from the DOM while visible, show it again when reattached', function(done) {
    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    overlay.show();

    helpers.next(function() {
      var backdrop = document.querySelector('.coral-Backdrop');
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
    overlay1 = new Overlay();
    helpers.target.appendChild(overlay1);
    overlay1.show();

    // Create a overlay, make it visible, but don't add it to the DOM
    overlay2 = new Overlay();
    overlay2.show();

    helpers.next(function() {
      // Add the visible overlay
      helpers.target.appendChild(overlay2);

      helpers.next(function() {
        // It should now be on top
        expect(helpers.zIndex(overlay2)).to.be.greaterThan(helpers.zIndex(overlay1));

        overlay2.hide();

        helpers.next(function() {
          var backdrop = document.querySelector('.coral-Backdrop');
          expect(backdrop).to.not.be.null;

          expect(helpers.zIndex(overlay1)).to.be.greaterThan(helpers.zIndex(backdrop));

          // Clean up
          overlay1.hide();
          overlay2.hide();

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
    var FADETIME = Coral.mixin.overlay.FADETIME;
    Coral.mixin.overlay.FADETIME = 0;

    overlay = new Overlay();
    helpers.target.appendChild(overlay);

    helpers.next(function() {
      overlay1.show();
      helpers.next(function() {
        overlay.hide();

        // Test if hidden after 10ms
        setTimeout(function() {
          expect(overlay.open).to.be.false;
          expect(overlay.style.display).to.equal('none');

          // Restore fade time
          Coral.mixin.overlay.FADETIME = FADETIME;
          helpers.next(function() {
            // Wait for clean up to be complete
            done();
          });
        }, 101);
      });
    });
  });

  it('should know if it is top most', function(done) {
    overlay1 = new Overlay();
    helpers.target.appendChild(overlay1);
    overlay1.show();

    overlay2 = new Overlay();
    helpers.target.appendChild(overlay2);
    overlay2.show();

    helpers.next(function() {
      expect(overlay1._isTopOverlay()).to.be.false;
      expect(overlay2._isTopOverlay()).to.be.true;

      // Clean up
      overlay1.hide();
      overlay2.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  it('should call backdropClickedCallback on all overlays when backdrop clicked', function(done) {
    overlay1 = new Overlay();
    helpers.target.appendChild(overlay1);
    overlay1.backdropClickedCallback = sinon.spy();
    overlay1.show();

    overlay2 = new Overlay();
    helpers.target.appendChild(overlay2);
    overlay2.backdropClickedCallback = sinon.spy();
    overlay2.show();

    helpers.next(function() {
      $('.coral-Backdrop').click();

      expect(overlay1.backdropClickedCallback.callCount).to.equal(1);
      expect(overlay2.backdropClickedCallback.callCount).to.equal(1);

      // Clean up
      overlay1.hide();
      overlay2.hide();

      helpers.next(function() {
        // Wait for clean up to be complete
        done();
      });
    });
  });

  it('should trigger "coral-overlay:open" event only after the transition is finished', function(done) {
    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
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

  it('should trigger "coral-overlay:close" event only after the transition is finished', function(done) {
    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
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

  it('should be possible to toggle the overlay while it is still in the transition', function(done) {
    var openSpy = sinon.spy();
    var closeSpy = sinon.spy();

    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
    overlay1._overlayAnimationTime = 100; // This test will use a Coral.commons.transitionEnd mock!
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

  it('should make sure that only one "coral-overlay:close" event is thrown at a time', function(done) {
    var beforeOpenSpy = sinon.spy();
    var beforeCloseSpy = sinon.spy();
    var openSpy = sinon.spy();
    var closeSpy = sinon.spy();

    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
    overlay1._overlayAnimationTime = 100; // This test will use a Coral.commons.transitionEnd mock!
    helpers.target.appendChild(overlay1);

    overlay1.on('coral-overlay:beforeopen', beforeOpenSpy);
    overlay1.on('coral-overlay:beforeclose', beforeCloseSpy);
    overlay1.on('coral-overlay:open', openSpy);
    overlay1.on('coral-overlay:close', closeSpy);

    overlay1.open = true;
    overlay1.open = false;
    overlay1.open = true;
    overlay1.open = false;

    window.setTimeout(function() {
      expect(beforeOpenSpy.callCount).to.equal(2, '"coral-overlay:beforeopen" should have been called twice!');
      expect(beforeCloseSpy.callCount).to.equal(2, '"coral-overlay:beforeclose" should have been called twice');
      expect(openSpy.callCount).to.equal(0, '"coral-overlay:open" should never be called as it is canceled by close before animation is done');
      expect(closeSpy.callCount).to.equal(1, '"coral-overlay:close" should only be called "once"!');
      done();
    }, 200);

  });

  it('should make sure that only one "coral-overlay:open" event is thrown at a time', function(done) {
    var beforeOpenSpy = sinon.spy();
    var beforeCloseSpy = sinon.spy();

    var openSpy = sinon.spy();
    var closeSpy = sinon.spy();

    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
    overlay1._overlayAnimationTime = 100; // This test will use a Coral.commons.transitionEnd mock!
    helpers.target.appendChild(overlay1);


    overlay1.on('coral-overlay:beforeopen', beforeOpenSpy);
    overlay1.on('coral-overlay:beforeclose', beforeCloseSpy);
    overlay1.on('coral-overlay:open', openSpy);
    overlay1.on('coral-overlay:close', closeSpy);

    overlay1.open = true;
    overlay1.open = false;
    overlay1.open = true;
    overlay1.open = false;
    overlay1.open = true;

    window.setTimeout(function() {
      expect(beforeOpenSpy.callCount).to.equal(3, '"coral-overlay:beforeopen" should have been called three times!');
      expect(beforeCloseSpy.callCount).to.equal(2, '"coral-overlay:beforeclose" should have been called twice');
      expect(openSpy.callCount).to.equal(1, '"coral-overlay:open" should only be called "once"!');
      expect(closeSpy.callCount).to.equal(0, '"coral-overlay:close" should never be called as it is canceled by open before animation is done');
      done();
    }, 200);
  });

  it('should be possible to open/close overlay silently', function(done) {
    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
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

  it('should be set to display:none after closing the overlay silently', function(done) {
    overlay1 = new Overlay();
    overlay1.content = 'Overlay 1';
    //overlay1._overlayAnimationTime = 100;
    helpers.target.appendChild(overlay1);

    overlay1.open = true;
    expect(overlay1.open).to.equal(true, 'overlay should be open now');

    helpers.next(function() {
      overlay1.set('open', false, true); // close silently
      expect(overlay1.open).to.equal(false, 'overlay should be closed now');

      // "coral-overlay:close" should only be called after animation is over
      window.setTimeout(function() {
        expect(overlay1.style.display).to.equal('none', 'overlay should be set to "display:none" now');

        done();
      }, 101);
    });
  });

});
