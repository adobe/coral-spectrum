import {helpers} from '../../../coral-utils/src/tests/helpers';
import {Dialog} from '../../../coral-component-dialog';
import {tracking, mixin} from '../../../coral-utils';
import {DragAction} from '../../../coral-dragaction';

describe('Dialog', function() {
  // We don't need this in our test cases
  Dialog.prototype._moveToDocumentBody = function() {};
  
  /**
   To mock the dragging part
   */
  var dummyMouseEvent = function(type, x, y) {
    return new MouseEvent(type, {
      clientX: x,
      clientY: y,
      bubbles: true,
      cancelable: true
    });
  };
  
  describe('Namespace', function() {
    it('should expose enumerations', function() {
      expect(Dialog).to.have.property('variant');
      expect(Dialog).to.have.property('backdrop');
      expect(Dialog).to.have.property('closable');
    });
  });
  
  describe('Instantiation', function() {
    helpers.cloneComponent(
      'should be possible via cloneNode using markup',
      helpers.build(window.__html__['Dialog.fromElements.html'])
    );
  
    helpers.cloneComponent(
      'should be possible via cloneNode using markup (wrapper)',
      helpers.build(window.__html__['Dialog.wrapper.single.html'])
    );
  
    helpers.cloneComponent(
      'should be possible via cloneNode using js',
      new Dialog().set({
        header: {
          innerHTML: 'Header'
        },
        content: {
          innerHTML: 'Content'
        },
        footer: {
          innerHTML: 'Footer'
        }
      })
    );
  });
  
  describe('API', function() {
    let el;
  
    beforeEach(function() {
      el = helpers.build(new Dialog());
    });
  
    afterEach(function() {
      el = null;
    });
  
    it('should have the correct default attributes', function() {
      expect(el.interaction).to.equal(Dialog.interaction.ON);
      expect(el.closable).to.equal(Dialog.closable.OFF);
      expect(el.backdrop).to.equal(Dialog.backdrop.MODAL);
      expect(el.movable).to.equal(false);
    });
  
    describe('#variant', function() {
      it('should support error variant', function() {
        el.variant = Dialog.variant.ERROR;
      
        expect(el.classList.contains('_coral-Dialog--error')).to.be.true;
        expect(el.getAttribute('role')).to.equal('alertdialog');
      });
    
      it('should support warning variant', function() {
        el.variant = Dialog.variant.WARNING;
      
        expect(el.classList.contains('_coral-Dialog--warning')).to.be.true;
        expect(el.getAttribute('role')).to.equal('alertdialog');
      });
    
      it('should support success variant', function() {
        el.variant = Dialog.variant.SUCCESS;
      
        expect(el.classList.contains('_coral-Dialog--success')).to.be.true;
        expect(el.getAttribute('role')).to.equal('alertdialog');
      });
    
      it('should support help variant', function() {
        el.variant = Dialog.variant.HELP;
      
        expect(el.classList.contains('_coral-Dialog--help')).to.be.true;
        expect(el.getAttribute('role')).to.equal('alertdialog');
      });
    
      it('should support info variant', function() {
        el.variant = Dialog.variant.INFO;
      
        expect(el.classList.contains('_coral-Dialog--info')).to.be.true;
        expect(el.getAttribute('role')).to.equal('alertdialog');
      });
    
      it('should support switching variants', function() {
        el.variant = Dialog.variant.INFO;
      
        expect(el.classList.contains('_coral-Dialog--info')).to.be.true;
      
        el.variant = Dialog.variant.HELP;
      
        expect(el.classList.contains('_coral-Dialog--info')).to.be.false;
        expect(el.classList.contains('_coral-Dialog--help')).to.be.true;
      
        el.variant = Dialog.variant.DEFAULT;
      
        expect(el.classList.contains('_coral-Dialog--help')).to.be.false;
        expect(el.classList.contains('_coral-Dialog--default')).to.be.false;
      });
    });
  
    describe('#focusOnShow', function() {
      it('should default to ON', function() {
        expect(el.focusOnShow).to.equal(mixin._overlay.focusOnShow.ON);
      });
    });
  
    describe('#movable', function() {
      it('should create a drag action instance', function() {
        el.movable = true;
      
        var dragAction = el.dragAction;
        expect(dragAction instanceof DragAction).to.be.true;
        expect(dragAction.handle).to.equal(el._elements.headerWrapper);
      });
    
      it('should be movable by dragging the dialog header', function(done) {
        // The dialog needs to be opened before it can be moved.
        el = helpers.build(window.__html__['Dialog.fromElements-open.html']);
        
        var handle = el._elements.headerWrapper;
      
        // Make sure the dialog is positioned
        helpers.next(function() {
          expect(el.style.width).to.equal('');
          
          el.movable = true;
        
          var offset = {
            left: el.offsetLeft,
            top: el.offsetTop
          };
        
          el.dispatchEvent(dummyMouseEvent('mousedown'));
          el.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
        
          // The dialog can only be moved by the handle
          expect(el.offsetLeft).to.equal(offset.left);
          expect(el.offsetTop).to.equal(offset.top);
        
          handle.dispatchEvent(dummyMouseEvent('mousedown'));
          handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
        
          expect(el.offsetLeft).to.equal(offset.left + 10);
          expect(el.offsetTop).to.equal(offset.top + 20);
          
          done();
        });
      });
    
      it('should not be possible to have fullscreen and movable set to true', function() {
        el.fullscreen = true;
        el.movable = true;
      
        expect(el.fullscreen).to.be.false;
        expect(el.movable).to.be.true;
      });
    
      it('should not be possible to have movable and fullscreen set to true', function() {
        el.movable = true;
        el.fullscreen = true;
      
        expect(el.movable).to.be.false;
        expect(el.fullscreen).to.be.true;
      });
    
      it('should be possible to center a moved dialog', function(done) {
        el.movable = true;
        
        var handle = el._elements.headerWrapper;
      
        handle.dispatchEvent(dummyMouseEvent('mousedown'));
        handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
      
        el.center();
      
        helpers.next(function() {
          expect(el.style.top).to.equal('');
          expect(el.style.left).to.equal('');
        
          done();
        });
      });
    
      it('should destroy the drag action instance', function() {
        el.movable = true;
        el.movable = false;
      
        expect(el.dragAction).to.be.undefined;
      });
    
      it('should center the dialog if not movable anymore', function() {
        el.movable = true;
        
        var handle = el._elements.headerWrapper;
      
        handle.dispatchEvent(dummyMouseEvent('mousedown'));
        handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
      
        el.movable = false;
      
        expect(el.style.top).to.equal('');
        expect(el.style.left).to.equal('');
      });
    });
    
    describe('#backdrop', function() {
      it('should hide the underlay if backdrop is set to none', function() {
        el.backdrop = 'none';
        el.open = true;
    
        expect(el.open).to.be.true;
        expect(document.elementFromPoint(0, 0)).to.not.equal(document.querySelector('_coral-Underlay'));
      });
    });
  
    describe('#trackingElement', function() {
      it('should default to header title', function() {
        el.header.textContent = 'Header title';
        expect(el.trackingElement).to.equal('Header title');
      });
  
      it('should strip down any extra spaces, per html convention', function() {
        el.header.textContent = ' This header  has    some extra spaces.';
        expect(el.trackingElement).to.equal('This header has some extra spaces.');
      });
      
      it('should be empty string if no header provided', function() {
        el.header = null;
        expect(el.trackingElement).to.equal('');
      });
    
      it('should be settable to a string', function() {
        el.trackingElement = 'Custom';
        expect(el.trackingElement).to.equal('Custom');
      });
    });
  });
  
  describe('Markup', function() {
    it('should focus the focusOnShow element when opened', function(done) {
      const el = helpers.build(window.__html__['Dialog.focusOnShow.html']);
      
      el.on('coral-overlay:open', function() {
        expect(document.activeElement).to.equal(el.querySelector(el.focusOnShow));
        done();
      });
  
      el.show();
    });
  
    it('should not focus the close button', function(done) {
      const el = helpers.build(window.__html__['Dialog.closable.html']);
      expect(el.closable).to.equal(Dialog.closable.ON);
      
      el.on('coral-overlay:open', function() {
        expect(document.activeElement).to.equal(el, 'The Dialog should be focused');
        done();
      });
      
      el.show();
    });
  });
  
  describe('User Interaction', function() {
    afterEach(function() {
      const el = helpers.target.querySelector('coral-dialog');
      el.hide();
    });
    
    describe('#ESC', function() {
      it('should close when escape pressed and interaction=ON', function() {
        const el = helpers.build(window.__html__['Dialog.open.html']);
        expect(el.open).to.be.true;
        
        helpers.keypress('escape');
        expect(el.open).to.be.false;
      });
  
      it('should not close when ESC pressed and interaction=OFF', function() {
        const el = helpers.build(window.__html__['Dialog.open.html']);
        expect(el.open).to.be.true;
        
        el.interaction = Dialog.interaction.OFF;
        
        helpers.keypress('escape');
        expect(el.open).to.be.true;
      });
  
      it('should only close the topmost dialog', function(done) {
        var dialog1 = new Dialog();
        var dialog2 = new Dialog();
    
        helpers.target.appendChild(dialog1);
        helpers.target.appendChild(dialog2);
    
        var openEventCount = 0;
    
        // we have to listen at the body level since the dialog would move in order to position itself correctly
        document.body.addEventListener('coral-overlay:open', function() {
          openEventCount++;
      
          if (openEventCount === 2) {
            expect(dialog2._isTopOverlay()).to.equal(true, 'Dialog 2 should be the top most');
        
            helpers.keypress('escape');
        
            expect(dialog1.open).to.equal(true, 'Dialog 1 remains open');
            expect(dialog2.open).to.equal(false, 'Dialog 2 closes when escape is pressed');
        
            done();
          }
        });
    
        dialog1.open = true;
        dialog2.open = true;
      });
    });
  
    // @todo maybe this test should be part of a mixin
    describe('[coral-close]', function() {
      it('should close when close button clicked', function() {
        const el = helpers.build(window.__html__['Dialog.full.html']);
        // this targets the close in the header
        el.querySelector('[coral-close]').click();
    
        expect(el.open).to.equal(false, 'Should be closed after the button with coral-close is clicked');
      });
      
      it('should hide when any element with [coral-close] clicked', function() {
        const el = helpers.build(window.__html__['Dialog.full.html']);
        expect(el.open).to.equal(true, 'open before close clicked');
    
        // this targets the close in the footer
        el.footer.querySelector('[coral-close]').click();
  
        expect(el.open).to.equal(false, 'Should be closed after the button with coral-close is clicked');
      });
      
      it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
        const dialog = helpers.build(new Dialog());
    
        var spy = sinon.spy();
        helpers.target.addEventListener('click', spy);
    
        dialog.id = 'myDialog';
    
        dialog.show();
    
        expect(dialog.open).to.equal(true, 'open before close clicked');
    
        dialog.content.innerHTML = '<button coral-close="#myDialog" id="closeMyDialog">Close me!</button><button coral-close="#otherDialog" id="closeOtherDialog">Close someone else!</button>';
    
        dialog.querySelector('#closeOtherDialog').click();
    
        expect(dialog.open).to.equal(true, 'open after other close clicked');
        expect(spy.callCount).to.equal(1);
    
        spy.reset();
        dialog.querySelector('#closeMyDialog').click();
    
        expect(dialog.open).to.equal(false, 'open after close clicked');
        expect(spy.callCount).to.equal(0);
      });
    });
  });
  
  describe('Implementation details', function() {
    let el;
    
    beforeEach(function() {
      el = helpers.build(new Dialog());
    });
  
    afterEach(function() {
      el.hide();
      el = null;
    });
    
    describe('Positioning', function() {
      it('should cause the dialog to scroll when contents are large', function(done) {
        el.set({
          header: {
            innerHTML: 'I am the eggman'
          },
          content: {
            innerHTML: (new Array(500)).join('I am the walrus<br>')
          },
          footer: {
            innerHTML: 'Coo coo ca choo'
          }
        });
    
        el.show();
    
        helpers.next(function() {
          var content = el._elements.content;
          var dialogHeight = content.getBoundingClientRect().height;
          var docHeight = document.body.getBoundingClientRect().height;
      
          // If the dialog height is greater than the doc height
          // Then we know the dialog is scrollable
          expect(dialogHeight).to.be.gt(docHeight);
      
          // We should also be positioned in such a way that the outer div scrolls
          expect(window.getComputedStyle(content).position).to.equal('static');
      
          done();
        });
      });
  
      it('should allow vertical scroll if the dialog is bigger than the window', function(done) {
        el.style.height = (window.innerHeight * 2) + 'px';
        el.open = true;
        helpers.next(function() {
          expect(el.style.top).to.equal('');
          expect(el.style.marginTop).to.equal('');
          done();
        });
      });
  
      it('should take the whole screen in fullscreen', function(done) {
        el.fullscreen = true;
        el.open = true;
        helpers.next(function() {
          expect(el.style.left).to.equal('');
          expect(el.style.marginLeft).to.equal('');
          done();
        });
      });
    });
    
    describe('Backdrop', function() {
      it('should remove backdrop when dialog is detached', function() {
        el.show();
    
        expect(el.open).to.be.true;
        el.remove();
    
        expect(el.parentNode).to.equal(null, 'dialog should be detached');
        var backdrop = document.querySelector('._coral-Underlay');
        expect(backdrop).to.not.be.null;
    
        // Make sure the backdrop is visible
        expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
      });
  
      it('should remove backdrop when dialog is detached (even if dialog was closed)', function() {
        el.show();
    
        expect(el.open).to.be.true;
        el.open = false;
        el.remove();
    
        expect(el.parentNode).to.equal(null, 'dialog should be detached');
        var backdrop = document.querySelector('._coral-Underlay');
        expect(backdrop).to.not.be.null;
    
        // Make sure the backdrop is visible
        expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
      });
  
      it('should support inner-wrapper elements', function() {
        el = helpers.build(window.__html__['Dialog.wrapper.multiple.html']);
        var wrapper1 = el.querySelector('#wrapper1');
        var wrapper2 = el.querySelector('#wrapper2');
    
        expect(el.contains(wrapper1)).to.equal(true, 'Dialog should contain wrapper1');
        expect(el.contains(wrapper2)).to.equal(true, 'Dialog should contain wrapper2');
    
        expect(wrapper1.contains(wrapper2)).to.equal(true, 'wrapper1 should contain wrapper2');
    
        expect(wrapper2.contains(el.header)).to.equal(true, 'wrapper2 should contain header');
        expect(wrapper2.contains(el.content)).to.equal(true, 'wrapper2 should contain content');
        expect(wrapper2.contains(el.footer)).to.equal(true, 'wrapper2 should contain footer');
      });
  
      it('should support inner-wrapper elements', function() {
        el = helpers.build(window.__html__['Dialog.wrapper.single.html']);
        var wrapper1 = el.querySelector('#wrapper1');
    
        expect(el.contains(wrapper1)).to.equal(true, 'Dialog should contain wrapper1');
    
        expect(wrapper1.contains(el.header)).to.equal(true, 'wrapper1 should contain header');
        expect(wrapper1.contains(el.content)).to.equal(true, 'wrapper1 should contain content');
        expect(wrapper1.contains(el.footer)).to.equal(true, 'wrapper1 should contain footer');
        
        el.open = true;
        expect(el.classList.contains('_coral-Dialog--wrapped')).to.be.true;
      });
  
      it('should wrap internal elements', function() {
        el = helpers.build(window.__html__['Dialog.fromElements.html']);
    
        expect(el.contains(el.header)).to.equal(true, 'wrapper should contain header');
        expect(el.contains(el.content)).to.equal(true, 'wrapper should contain content');
        expect(el.contains(el.footer)).to.equal(true, 'wrapper should contain footer');
      });
  
      it('should create wrapper when no content zones are provided', function() {
        el = helpers.build(window.__html__['Dialog.contentOnly.html']);
    
        // we check that all content zones were properly created
        expect(el.header).to.exist;
        expect(el.contains(el.header)).to.be.true;
        expect(el.content).to.exist;
        expect(el.contains(el.content)).to.be.true;
        expect(el.footer).to.exist;
        expect(el.contains(el.footer)).to.be.true;
    
        expect(el.contains(el.header)).to.equal(true, 'wrapper should contain header');
        expect(el.contains(el.content)).to.equal(true, 'wrapper should contain content');
        expect(el.contains(el.footer)).to.equal(true, 'wrapper should contain footer');
    
        // the content should be moved into the coral-dialog-content
        expect(el.content.textContent).to.equal('This content will be moved to coral-dialog-content.');
      });
  
      it('should keep all extra elements when content zones are provided', function() {
        el = helpers.build(window.__html__['Dialog.wrapper.multiple.html']);
        var form = el.querySelector('#wrapper2');
        var input = el.querySelector('#input');
    
        expect(form.firstElementChild).to.equal(input);
      });
    });
  });
  
  describe('Tracking', function() {
    var trackerFnSpy;
    
    beforeEach(function () {
      trackerFnSpy = sinon.spy();
      tracking.addListener(trackerFnSpy);
    });
    
    afterEach(function () {
      tracking.removeListener(trackerFnSpy);
    });
    
    it('should not call the tracker callback fn when the dialog is initialized and not opened', function() {
      helpers.build(window.__html__['Dialog.tracking.html']);
      expect(trackerFnSpy.callCount).to.equal(0, 'Tracker was called.');
    });
    
    it('should call the tracker callback fn with expected parameters when the dialog is opened', function(done) {
      const el = helpers.build(window.__html__['Dialog.tracking.html']);
      el.show();
      el.on('coral-overlay:open', function() {
        expect(trackerFnSpy.callCount).to.equal(1, 'Tracker should have been called only once.');
        
        var spyCall = trackerFnSpy.getCall(0);
        expect(spyCall.args.length).to.equal(4);
        
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetElement', 'element name');
        expect(trackData).to.have.property('targetType', 'coral-dialog');
        expect(trackData).to.have.property('eventType', 'display');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'coral-dialog');
        expect(spyCall.args[1]).to.be.an.instanceof(CustomEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Dialog);
        done();
      });
    });
    
    it('should call the tracker callback fn with expected parameters when the dialog is closed clicking on the "Close" button', function(done) {
      const el = helpers.build(window.__html__['Dialog.tracking.html']);
      el.show();
      el.on('coral-overlay:open', function() {
        el.querySelector('[coral-close]').click();
        var spyCall = trackerFnSpy.getCall(1);
        expect(spyCall.args.length).to.equal(4);
        
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetElement', 'element name');
        expect(trackData).to.have.property('targetType', 'coral-dialog');
        expect(trackData).to.have.property('eventType', 'close');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'coral-dialog');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Dialog);
        done();
      });
    });
    
    it('should call the tracker callback fn with expected parameters when the dialog is closed clicking on the "x" closable button', function(done) {
      const el = helpers.build(window.__html__['Dialog.tracking.html']);
      el.show();
      el.on('coral-overlay:open', function() {
        el.querySelector('[coral-close]').click();
        var spyCall = trackerFnSpy.getCall(1);
        expect(spyCall.args.length).to.equal(4);
        
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetElement', 'element name');
        expect(trackData).to.have.property('targetType', 'coral-dialog');
        expect(trackData).to.have.property('eventType', 'close');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'coral-dialog');
        expect(spyCall.args[1]).to.be.an.instanceof(MouseEvent);
        expect(spyCall.args[2]).to.be.an.instanceof(Dialog);
        done();
      });
    });
    
    it('should call the tracker callback fn with expected parameters when the dialog is closed by clicking on the backdrop', function(done) {
      const el = helpers.build(window.__html__['Dialog.tracking.html']);
      el.show();
      el.on('coral-overlay:open', function() {
        // helpers.keypress('escape');
        el.click();
        var spyCall = trackerFnSpy.getCall(1);
        expect(spyCall.args.length).to.equal(4);
        
        var trackData = spyCall.args[0];
        expect(trackData).to.have.property('targetElement', 'element name');
        expect(trackData).to.have.property('targetType', 'coral-dialog');
        expect(trackData).to.have.property('eventType', 'close');
        expect(trackData).to.have.property('rootElement', 'element name');
        expect(trackData).to.have.property('rootFeature', 'feature name');
        expect(trackData).to.have.property('rootType', 'coral-dialog');
        expect(spyCall.args[1]).to.be.an.instanceof(Event); // KeyboardEvent
        expect(spyCall.args[2]).to.be.an.instanceof(Dialog);
        done();
      });
    });
  });
});
