describe('Coral.Dialog', function() {
  'use strict';

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

  var dialog;
  beforeEach(function() {
    dialog = new Coral.Dialog();
    helpers.target.appendChild(dialog);
  });

  afterEach(function() {
    if (dialog.open) {
      // Close the dialog
      dialog.open = false;
    }

    if (dialog.parentNode) {
      // Remove it from the DOM
      dialog.parentNode.removeChild(dialog);
    }

    dialog = null;
  });

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

    it('should be supported via markup', function(done) {
      helpers.build(window.__html__['Coral.Dialog.fromElements.html'], function(instance) {
        dialog = instance; // Update ref so afterEach kills the dialog
        testInstance(dialog);
        done();
      });
    });

    it('should be supported via markup when open', function(done) {
      helpers.build(window.__html__['Coral.Dialog.fromElements-open.html'], function(instance) {
        dialog = instance; // Update ref so afterEach kills the dialog
        testInstance(dialog);
        // Clean up explicitly
        dialog.hide();
        helpers.next(done.bind(null, null));
      });
    });

    it('should be supported via createElement', function() {
      dialog = document.createElement('coral-dialog');
      dialog.set(basicProperties);
      testInstance(dialog);
    });

    it('should be supported with constructor', function() {
      dialog = new Coral.Dialog();
      dialog.set(basicProperties);
      testInstance(dialog);
    });

    it('should have the correct default attributes', function(done) {
      // We need to check on the next animation frame to give time for visible to sync
      helpers.next(function() {
        expect(dialog.interaction).to.equal(Coral.Dialog.interaction.ON);
        expect(dialog.closable).to.equal(Coral.Dialog.closable.OFF);
        expect(dialog.backdrop).to.equal(Coral.Dialog.backdrop.MODAL);
        expect(helpers.visible(dialog)).to.equal(false);
        done();
      });
    });

    it('should be possible via cloneNode using markup', function(done) {
      helpers.build(window.__html__['Coral.Dialog.fromElements.html'], function(el) {
        dialog = el;
        helpers.testComponentClone(dialog, done);
      });
    });

    it('should be possible via cloneNode using js', function(done) {
      dialog.set(basicProperties);
      helpers.next(function() {
        helpers.testComponentClone(dialog, done);
      });
    });
  });

  describe('Markup', function() {
    it('should support inner-wrapper elements', function(done) {
      helpers.build(window.__html__['Coral.Dialog.wrappers.html'], function(instance) {
        dialog = instance; // Update ref so afterEach kills the dialog

        var wrapper1 = dialog.querySelector('#wrapper1');
        var wrapper2 = dialog.querySelector('#wrapper2');
        var header = dialog.querySelector('coral-dialog-header');
        var content = dialog.querySelector('coral-dialog-content');
        var footer = dialog.querySelector('coral-dialog-footer');

        expect(dialog.contains(wrapper1)).to.equal(true, 'Dialog should contain wrapper1');
        expect(dialog.contains(wrapper2)).to.equal(true, 'Dialog should contain wrapper2');
        expect(dialog.contains(wrapper2)).to.equal(true, 'Dialog should contain wrapper2');

        expect(wrapper1.contains(wrapper2)).to.equal(true, 'wrapper1 should contain wrapper2');

        expect(wrapper2.contains(header)).to.equal(true, 'wrapper2 should contain header');
        expect(wrapper2.contains(content)).to.equal(true, 'wrapper2 should contain content');
        expect(wrapper2.contains(footer)).to.equal(true, 'wrapper2 should contain footer');

        // Clean up explicitly
        dialog.hide();
        helpers.next(done.bind(null, null));
      });
    });
  });

  describe('positioning', function() {
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

      helpers.next(function() {
        dialog.show();

        helpers.next(function() {
          var content = dialog._elements.content;
          var dialogHeight = $(content).height();
          var docHeight = $(document.body).height();

          // If the dialog height is greater than the doc height
          // Then we know the dialog is scrollable
          expect(dialogHeight).to.be.gt(docHeight);

          // We should also be positioned in such a way that the outer div scrolls
          expect($(content).css('position')).to.equal('static');

          // Clean up explicitly
          dialog.hide();
          helpers.next(done.bind(null, null));
        });
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

        // Clean up explicitly
        dialog.hide();
        helpers.next(done.bind(null, null));
      });
    });
  });

  describe('variant', function() {
    it('should support error variant', function(done) {
      dialog.variant = Coral.Dialog.variant.ERROR;

      helpers.next(function() {
        expect(dialog.$).to.have.class('coral-Dialog--error');
        expect(dialog._elements.icon.icon).to.equal('alert');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
        done();
      });
    });

    it('should support warning variant', function(done) {
      dialog.variant = Coral.Dialog.variant.WARNING;

      helpers.next(function() {
        expect(dialog.$).to.have.class('coral-Dialog--warning');
        expect(dialog._elements.icon.icon).to.equal('alert');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
        done();
      });
    });

    it('should support success variant', function(done) {
      dialog.variant = Coral.Dialog.variant.SUCCESS;

      helpers.next(function() {
        expect(dialog.$).to.have.class('coral-Dialog--success');
        expect(dialog._elements.icon.icon).to.equal('checkCircle');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
        done();
      });
    });

    it('should support help variant', function(done) {
      dialog.variant = Coral.Dialog.variant.HELP;

      helpers.next(function() {
        expect(dialog.$).to.have.class('coral-Dialog--help');
        expect(dialog._elements.icon.icon).to.equal('helpCircle');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
        done();
      });
    });

    it('should support info variant', function(done) {
      dialog.variant = Coral.Dialog.variant.INFO;

      helpers.next(function() {
        expect(dialog.$).to.have.class('coral-Dialog--info');
        expect(dialog._elements.icon.icon).to.equal('infoCircle');
        expect(dialog.getAttribute('role')).to.equal('alertdialog');
        done();
      });
    });

    it('should support switching variants', function(done) {
      dialog.variant = Coral.Dialog.variant.INFO;

      helpers.next(function() {
        expect(dialog.$).to.have.class('coral-Dialog--info');
        expect(dialog._elements.icon.icon).to.equal('infoCircle');

        dialog.variant = Coral.Dialog.variant.HELP;

        helpers.next(function() {
          expect(dialog.$).to.not.have.class('coral-Dialog--info');
          expect(dialog.$).to.have.class('coral-Dialog--help');
          expect(dialog._elements.icon.icon).to.equal('helpCircle');

          dialog.variant = Coral.Dialog.variant.DEFAULT;

          helpers.next(function() {
            expect(dialog.$).to.not.have.class('coral-Dialog--help');
            expect(dialog.$).to.not.have.class('coral-Dialog--default');
            expect(dialog._elements.icon.icon).to.equal('');
            done();
          });
        });
      });
    });
  });

  describe('behavior', function() {
    it('should close when escape pressed', function(done) {
      dialog.show();
      // wait in FF one frame
      helpers.next(function() {
        expect(dialog.open).to.be.true;
        helpers.keypress('escape');
        helpers.next(function() {
          expect(dialog.open).to.be.false;
          done();
        });
      });
    });

    it('should remove backdrop when dialog is detached', function(done) {

      var myDialog = new Coral.Dialog();
      helpers.target.appendChild(myDialog);
      myDialog.show();

      // wait in FF one frame
      helpers.next(function() {

        expect(myDialog.open).to.be.true;
        myDialog.remove();

        helpers.next(function() {
          expect(myDialog.parentNode).to.equal(null, 'dialog should be detached');
          var backdrop = document.querySelector('.coral-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
          done();

        });
      });
    });

    it('should remove backdrop when dialog is detached (even if dialog was closed)', function(done) {
      var myDialog = new Coral.Dialog();
      helpers.target.appendChild(myDialog);
      myDialog.show();

      // wait in FF one frame
      helpers.next(function() {

        expect(myDialog.open).to.be.true;
        myDialog.open = false; //This used to break the test ...
        myDialog.remove();

        helpers.next(function() {
          expect(myDialog.parentNode).to.equal(null, 'dialog should be detached');
          var backdrop = document.querySelector('.coral-Backdrop');
          expect(backdrop).to.not.be.null;

          // Make sure the backdrop is visible
          expect(backdrop._isOpen).to.equal(false, 'backdrop visibility when top overlay hidden');
          done();

        });
      });
    });

    it('should not close when escape pressed but listening to escape is disabled', function(done) {
      dialog.show();
      // wait in FF one frame
      helpers.next(function() {
        expect(dialog.open).to.be.true;
        dialog.interaction = Coral.Dialog.interaction.OFF;
        helpers.keypress('escape');
        helpers.next(function() {
          expect(dialog.open).to.be.true;
          done();
        });
      });
    });

    it('should close when close button clicked', function() {
      dialog.show();

      // Find and click the close button
      var close = dialog.querySelector('[coral-close]');
      close.click();

      expect(dialog.open).to.be.false;
    });

    // @todo maybe this test should be part of a mixin
    it('should hide when any element with [coral-close] clicked', function() {
      dialog.show();

      expect(dialog.open).to.equal(true, 'open before close clicked');

      dialog.content.innerHTML = '<button coral-close id="closeButton">Close me!</button>';

      dialog.querySelector('#closeButton').click();

      expect(dialog.open).to.equal(false, 'open after close clicked');
    });

    // @todo maybe this test should be part of a mixin
    it('should only hide if selector matches value of [coral-close], should not let events bubble', function() {
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
