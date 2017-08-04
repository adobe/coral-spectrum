describe('Coral.Dialog', function() {
  'use strict';
  
  // We don't need this in our test cases
  Coral.Dialog.prototype._moveToDocumentBody = function() {};
  
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
  
  /**
   Basic instance properties for testing
   */
  var basicProperties = {
    header: {
      innerHTML: 'Header'
    },
    content: {
      innerHTML: 'Content'
    },
    footer: {
      innerHTML: 'Footer'
    }
  };
  
  /**
   Tests an instance for basic properties
   */
  function testInstance(dialog) {
    expect(dialog.header.innerHTML).to.equal('Header');
    expect(dialog.content.innerHTML).to.equal('Content');
    expect(dialog.footer.innerHTML).to.equal('Footer');
  }
  
  describe('Namespace', function() {
    it('should be defined', function() {
      expect(Coral).to.have.property('Dialog');
    });
    
    it('should expose enumerations', function() {
      expect(Coral.Dialog).to.have.property('variant');
      expect(Coral.Dialog).to.have.property('backdrop');
      expect(Coral.Dialog).to.have.property('closable');
    });
  });
  
  describe('Instantiation', function() {
    
    it('should be supported via markup', function() {
      testInstance(helpers.build(window.__html__['Coral.Dialog.fromElements.html']));
    });
    
    it('should be supported via markup when open', function() {
      testInstance(helpers.build(window.__html__['Coral.Dialog.fromElements-open.html']));
    });
    
    it('should be supported via createElement', function() {
      const dialog = document.createElement('coral-dialog');
      dialog.set(basicProperties);
      testInstance(dialog);
    });
    
    it('should be supported with constructor', function() {
      const dialog = new Coral.Dialog();
      dialog.set(basicProperties);
      testInstance(dialog);
    });
    
    it('should have the correct default attributes', function() {
      const dialog = new Coral.Dialog();
      expect(dialog.interaction).to.equal(Coral.Dialog.interaction.ON);
      expect(dialog.closable).to.equal(Coral.Dialog.closable.OFF);
      expect(dialog.backdrop).to.equal(Coral.Dialog.backdrop.MODAL);
      expect(dialog.movable).to.equal(false);
      helpers.build(dialog);
      expect(dialog.style.display).to.equal('none');
    });
    
    it('should be possible via cloneNode using markup', function() {
      helpers.cloneComponent(helpers.build(window.__html__['Coral.Dialog.fromElements.html']));
    });
    
    it('should be possible via cloneNode using markup (wrapper)', function() {
      helpers.cloneComponent(helpers.build(window.__html__['Coral.Dialog.wrapper.single.html']));
    });
    
    it('should be possible via cloneNode using js', function() {
      const dialog = new Coral.Dialog();
      dialog.set(basicProperties);
      helpers.cloneComponent(dialog);
    });
  });
  
  describe('API', function() {
    
    describe('#fullscreen', function() {
      it('should take the whole screen in fullscreen', function(done) {
        const dialog = helpers.build(new Coral.Dialog());
        dialog.fullscreen = true;
        dialog.open = true;
        helpers.next(function() {
          expect(dialog._elements.wrapper.style.left).to.equal('');
          expect(dialog._elements.wrapper.style.marginLeft).to.equal('');
          done();
        });
      });
    });
    
    describe('#open', function() {
      let dialog;
      
      beforeEach(function() {
        dialog = helpers.build(new Coral.Dialog());
      });
      
      afterEach(function() {
        dialog = null;
      });
      
      it('should cause the dialog to scroll when contents are large', function(done) {
        dialog.set({
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
        
        dialog.show();
        
        helpers.next(function() {
          var content = dialog._elements.content;
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
        dialog._elements.wrapper.style.height = (window.innerHeight * 2) + 'px';
        dialog.open = true;
        helpers.next(function() {
          expect(dialog._elements.wrapper.style.top).to.equal('');
          expect(dialog._elements.wrapper.style.marginTop).to.equal('');
          done();
        });
      });
      
      it('should be centered when contents are small', function(done) {
        dialog.set({
          header: 'I am the eggman',
          content: 'I am the walrus',
          footer: 'Coo coo ca choo'
        });
        
        dialog.show();
        
        helpers.next(function() {
          var wrapper = dialog._elements.wrapper;
          
          var style = wrapper.style;
          
          // We should definitely be positioned absolute in this case
          expect(style.position).to.equal('absolute');
          
          // In the center
          expect(style.top).to.equal('50%');
          expect(style.left).to.equal('50%');
          
          // With a nice calculation for margin offset
          expect(parseFloat(style.marginTop)).to.be.lessThan(0);
          expect(parseFloat(style.marginLeft)).to.be.lessThan(0);
          
          done();
        });
      });
    });
    
    describe('#variant', function() {
      let dialog;
      
      beforeEach(function() {
        dialog = new Coral.Dialog();
      });
      
      afterEach(function() {
        dialog = null;
      });
      
      it('should support error variant', function() {
        dialog.variant = Coral.Dialog.variant.ERROR;
        
        expect(dialog.classList.contains('coral3-Dialog--error')).to.be.true;
        expect(dialog._elements.icon.icon).to.equal('alert');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
      });
      
      it('should support warning variant', function() {
        dialog.variant = Coral.Dialog.variant.WARNING;
        
        expect(dialog.classList.contains('coral3-Dialog--warning')).to.be.true;
        expect(dialog._elements.icon.icon).to.equal('alert');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
      });
      
      it('should support success variant', function() {
        dialog.variant = Coral.Dialog.variant.SUCCESS;
        
        expect(dialog.classList.contains('coral3-Dialog--success')).to.be.true;
        expect(dialog._elements.icon.icon).to.equal('checkCircle');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
      });
      
      it('should support help variant', function() {
        dialog.variant = Coral.Dialog.variant.HELP;
        
        expect(dialog.classList.contains('coral3-Dialog--help')).to.be.true;
        expect(dialog._elements.icon.icon).to.equal('helpCircle');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
      });
      
      it('should support info variant', function() {
        dialog.variant = Coral.Dialog.variant.INFO;
        
        expect(dialog.classList.contains('coral3-Dialog--info')).to.be.true;
        expect(dialog._elements.icon.icon).to.equal('infoCircle');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
      });
      
      it('should support switching variants', function() {
        dialog.variant = Coral.Dialog.variant.INFO;
        
        expect(dialog.classList.contains('coral3-Dialog--info')).to.be.true;
        expect(dialog._elements.icon.icon).to.equal('infoCircle');
        
        dialog.variant = Coral.Dialog.variant.HELP;
        
        expect(dialog.classList.contains('coral3-Dialog--info')).to.be.false;
        expect(dialog.classList.contains('coral3-Dialog--help')).to.be.true;
        expect(dialog._elements.icon.icon).to.equal('helpCircle');
        
        dialog.variant = Coral.Dialog.variant.DEFAULT;
        
        expect(dialog.classList.contains('coral3-Dialog--help')).to.be.false;
        expect(dialog.classList.contains('coral3-Dialog--default')).to.be.false;
        expect(dialog._elements.icon.icon).to.equal('');
      });
    });
    
    describe('#movable', function() {
      let dialog;
      
      beforeEach(function() {
        dialog = new Coral.Dialog();
      });
      
      afterEach(function() {
        dialog = null;
      });
      
      it('should create a drag action instance', function() {
        dialog.movable = true;
        
        var dragAction = dialog._elements.wrapper.dragAction;
        expect(dragAction instanceof Coral.DragAction).to.be.true;
        expect(dragAction.handle).to.equal(dialog._elements.headerWrapper);
      });
      
      it('should be movable by dragging the dialog header', function(done) {
        // The dialog needs to be opened before it can be moved.
        const dialog = helpers.build(window.__html__['Coral.Dialog.fromElements-open.html']);
        
        var dragElement = dialog._elements.wrapper;
        var handle = dialog._elements.headerWrapper;
        
        // Make sure the dialog is positioned
        helpers.next(function() {
          dialog.movable = true;
          
          var offset = {
            left: dragElement.offsetLeft,
            top: dragElement.offsetTop
          };
          
          var width = dragElement.getBoundingClientRect().width;
          
          expect(dialog._elements.wrapper.style.width).to.equal(width + 'px');
          
          dialog.dispatchEvent(dummyMouseEvent('mousedown'));
          dialog.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
          
          // The dialog can only be moved by the handle
          expect(dragElement.offsetLeft).to.equal(offset.left);
          expect(dragElement.offsetTop).to.equal(offset.top);
          
          handle.dispatchEvent(dummyMouseEvent('mousedown'));
          handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
          
          expect(dragElement.offsetLeft).to.equal(offset.left + 10);
          expect(dragElement.offsetTop).to.equal(offset.top + 20);
          
          done();
        });
      });
      
      it('should not be possible to have fullscreen and movable set to true', function() {
        dialog.fullscreen = true;
        dialog.movable = true;
        
        expect(dialog.fullscreen).to.be.false;
        expect(dialog.movable).to.be.true;
      });
      
      it('should not be possible to have movable and fullscreen set to true', function() {
        dialog.movable = true;
        dialog.fullscreen = true;
        
        expect(dialog.movable).to.be.false;
        expect(dialog.fullscreen).to.be.true;
      });
      
      it('should be possible to center a moved dialog', function(done) {
        helpers.build(dialog);
        dialog.movable = true;
        
        var dragElement = dialog._elements.wrapper;
        var handle = dialog._elements.headerWrapper;
        
        handle.dispatchEvent(dummyMouseEvent('mousedown'));
        handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
        
        dialog.center();
        
        helpers.next(function() {
          expect(dragElement.style.top).to.equal('50%');
          expect(dragElement.style.left).to.equal('50%');
          
          done();
        });
      });
      
      it('should destroy the drag action instance', function() {
        dialog.movable = true;
        dialog.movable = false;
        
        expect(dialog._elements.wrapper.dragAction).to.be.undefined;
      });
      
      it('should center the dialog if not movable anymore', function() {
        helpers.build(dialog);
        dialog.movable = true;
        
        var dragElement = dialog._elements.wrapper;
        var handle = dialog._elements.headerWrapper;
        
        handle.dispatchEvent(dummyMouseEvent('mousedown'));
        handle.dispatchEvent(dummyMouseEvent('mousemove', 10, 20));
        
        dialog.movable = false;
        
        expect(dragElement.style.top).to.equal('50%');
        expect(dragElement.style.left).to.equal('50%');
      });
    });
  });
  
  describe('User Interaction', function() {
    it('should close when escape pressed', function() {
      const dialog = helpers.build(new Coral.Dialog());
      dialog.show();
      
      expect(dialog.open).to.be.true;
      helpers.keypress('escape');
      
      expect(dialog.open).to.be.false;
    });
    
    it('should remove backdrop when dialog is detached', function() {
      var dialog = helpers.build(new Coral.Dialog());
      dialog.show();
      
      expect(dialog.open).to.be.true;
      dialog.remove();
      
      expect(dialog.parentNode).to.equal(null, 'dialog should be detached');
      var backdrop = document.querySelector('.coral3-Backdrop');
      expect(backdrop).to.not.be.null;
      
      // Make sure the backdrop is visible
      expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
    });
    
    it('should remove backdrop when dialog is detached (even if dialog was closed)', function() {
      var dialog = helpers.build(new Coral.Dialog());
      helpers.target.appendChild(dialog);
      dialog.show();
      
      expect(dialog.open).to.be.true;
      dialog.open = false;
      dialog.remove();
      
      expect(dialog.parentNode).to.equal(null, 'dialog should be detached');
      var backdrop = document.querySelector('.coral3-Backdrop');
      expect(backdrop).to.not.be.null;
      
      // Make sure the backdrop is visible
      expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
    });
    
    it('should not close when escape pressed but listening to escape is disabled', function() {
      const dialog = helpers.build(new Coral.Dialog());
      dialog.show();
      
      expect(dialog.open).to.be.true;
      dialog.interaction = Coral.Dialog.interaction.OFF;
      helpers.keypress('escape');
      
      expect(dialog.open).to.be.true;
    });
    
    it('should close when close button clicked', function() {
      const dialog = helpers.build(new Coral.Dialog());
      dialog.show();
      
      // Find and click the close button
      var close = dialog.querySelector('[coral-close]');
      close.click();
      
      expect(dialog.open).to.be.false;
    });
    
    // @todo maybe this test should be part of a mixin
    it('should hide when any element with [coral-close] clicked', function() {
      const dialog = helpers.build(new Coral.Dialog());
      dialog.show();
      
      expect(dialog.open).to.equal(true, 'open before close clicked');
      
      dialog.content.innerHTML = '<button coral-close id="closeButton">Close me!</button>';
      
      dialog.querySelector('#closeButton').click();
      
      expect(dialog.open).to.equal(false, 'open after close clicked');
    });
    
    // @todo maybe this test should be part of a mixin
    it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
      const dialog = helpers.build(new Coral.Dialog());
      
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
    
    it('should not take the whole screen if backdrop is set to none', function() {
      const dialog = helpers.build(new Coral.Dialog());
      dialog.backdrop = 'none';
      dialog.open = true;
      
      expect(dialog.open).to.be.true;
      expect(dialog.classList.contains('coral3-Dialog--backdropNone')).to.be.true;
      expect(document.elementFromPoint(0, 0)).to.not.equal(dialog);
    });
  });
  
  describe('Implementation details', function() {
    it('should support inner-wrapper elements', function() {
      const el = helpers.build(window.__html__['Coral.Dialog.wrapper.multiple.html']);
      var wrapper1 = el.querySelector('#wrapper1');
      var wrapper2 = el.querySelector('#wrapper2');
      
      expect(el._elements.wrapper).to.exist;
      expect(el._elements.wrapper.className.trim()).to.equal('coral3-Dialog-wrapper');
      
      expect(el._elements.wrapper.contains(wrapper1)).to.equal(true, 'Dialog should contain wrapper1');
      expect(el._elements.wrapper.contains(wrapper2)).to.equal(true, 'Dialog should contain wrapper2');
      
      expect(wrapper1.contains(wrapper2)).to.equal(true, 'wrapper1 should contain wrapper2');
      
      expect(wrapper2.contains(el.header)).to.equal(true, 'wrapper2 should contain header');
      expect(wrapper2.contains(el.content)).to.equal(true, 'wrapper2 should contain content');
      expect(wrapper2.contains(el.footer)).to.equal(true, 'wrapper2 should contain footer');
    });
    
    it('should support inner-wrapper elements', function() {
      const el = helpers.build(window.__html__['Coral.Dialog.wrapper.single.html']);
      var wrapper1 = el.querySelector('#wrapper1');
      
      expect(el._elements.wrapper).to.exist;
      expect(el._elements.wrapper.className.trim()).to.equal('coral3-Dialog-wrapper');
      
      expect(el._elements.wrapper.contains(wrapper1)).to.equal(true, 'Dialog should contain wrapper1');
      
      expect(wrapper1.contains(el.header)).to.equal(true, 'wrapper1 should contain header');
      expect(wrapper1.contains(el.content)).to.equal(true, 'wrapper1 should contain content');
      expect(wrapper1.contains(el.footer)).to.equal(true, 'wrapper1 should contain footer');
    });
    
    it('should wrap internal elements', function() {
      const el = helpers.build(window.__html__['Coral.Dialog.fromElements.html']);
      var wrapper = el._elements.wrapper;
      
      expect(el._elements.wrapper).to.exist;
      expect(el._elements.wrapper.className.trim()).to.equal('coral3-Dialog-wrapper');
      
      expect(wrapper.contains(el.header)).to.equal(true, 'wrapper should contain header');
      expect(wrapper.contains(el.content)).to.equal(true, 'wrapper should contain content');
      expect(wrapper.contains(el.footer)).to.equal(true, 'wrapper should contain footer');
    });
    
    it('should create wrapper when no content zones are provided', function() {
      const el = helpers.build(window.__html__['Coral.Dialog.contentOnly.html']);
      var wrapper = el._elements.wrapper;
      
      expect(el._elements.wrapper).to.exist;
      expect(el._elements.wrapper.className.trim()).to.equal('coral3-Dialog-wrapper');
      
      // we check that all content zones were properly created
      expect(el.header).to.exist;
      expect(el.contains(el.header)).to.be.true;
      expect(el.content).to.exist;
      expect(el.contains(el.content)).to.be.true;
      expect(el.footer).to.exist;
      expect(el.contains(el.footer)).to.be.true;
      
      expect(wrapper.contains(el.header)).to.equal(true, 'wrapper should contain header');
      expect(wrapper.contains(el.content)).to.equal(true, 'wrapper should contain content');
      expect(wrapper.contains(el.footer)).to.equal(true, 'wrapper should contain footer');
      
      // the content should be moved into the coral-dialog-content
      expect(el.content.textContent).to.equal('This content will be moved to coral-dialog-content.');
    });
    
    it('should keep all extra elements when content zones are provided', function() {
      const el = helpers.build(window.__html__['Coral.Dialog.wrapper.multiple.html']);
      var form = el.querySelector('#wrapper2');
      var input = el.querySelector('#input');
      
      expect(form.firstElementChild).to.equal(input);
    });
  });
});
